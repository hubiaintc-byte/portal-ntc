# CMS Corpo Docente — Sessão 2: Migrar Experts

**Data:** 2026-05-29
**Sprint:** F · Janela B
**Branch sugerida:** `feat/cms-corpo-docente-experts`
**Escopo:** segunda sessão do CMS Corpo Docente. Migra os 45 cards `CARDS_EXPERTS` do fallback estático para o Payload, completando o ciclo `Featured + Experts + Axis` no CMS.

## 1. Contexto

A sessão 1 (merged como `c0da214`) entregou:
- Coleção `Especialistas` com 6 campos novos (`vertical`, `tipo`, `frente`, `formacao`, `atuacao`, `programasRelacionados`)
- Global `corpo-docente` (9 tabs) com lista única de cards (`formato: featured|expert|axis`)
- Loader + adapter em `apps/web/lib/cms/corpoDocente.ts` (já distribui cards por formato)
- Seed idempotente em 3 etapas (8 fotos → 4 Featured → Global completo)
- `page.tsx` async com fallback estático

Hoje, **`CARDS_EXPERTS` continua vindo 100% do fallback estático** (`conteudoCorpoDocente.ts` linhas 508-1579) porque a sessão 1 não populou Experts no CMS. A página renderiza híbrida: Featured + Axis do CMS, Experts do fallback.

Esta sessão fecha o ciclo migrando os 45 Experts.

## 2. Decisões tomadas no brainstorming

| # | Decisão | Justificativa |
|---|---|---|
| 1 | Manter reuso das 4 fotos genéricas (`expert-01..04`) | Fidelidade ao protótipo HTML (memory `feedback_porta_html_fidelidade`); equipe substitui por fotos reais via admin depois |
| 2 | Seed só os campos que o Expert já tem | `metaAtuacao`/`metaEixos` não existem no HTML original; admin.condition do CMS já esconde para `formato=expert` |
| 3 | `instituicao` extraída do `credencial` (primeira frase) | Heurística não-inventiva, textualmente correta; equipe refina no admin |
| 4 | Tudo num único `seedCorpoDocente.ts` (estender, não criar arquivo novo) | Reusa boilerplate existente (`resolverProgramasIds`, `FotoIdMap`, etc.) |

## 3. Mapa dos 45 Experts

**Por vertical:**
- 16 Educação
- 14 Gestão Pública (sem Contratações)
- 15 Núcleo Contratações Públicas (frente `contratacoes` dentro de Gestão Pública)
- 0 Saúde (Saúde tem só os 5 Axis)

**Por tipo:**
- 13 autoridade
- 22 doutrinador
- 4 consultor
- 4 palestrante
- 2 pesquisador

**Fotos:** 4 placeholders (`expert-01..04.1920.webp`, ids 43-46 já uploadados na sessão 1), reuso ~11 cards cada.

## 4. Arquitetura

Nada novo. Estende o `seedCorpoDocente.ts` da sessão 1.

```
apps/cms/src/seed/seedCorpoDocente.ts
├─ Etapa 1: uploadFotos (8 fotos)                  [existente]
├─ Etapa 2a: upsertEspecialistasFeatured (4)       [existente]
├─ Etapa 2b: upsertEspecialistasExperts (45)       [novo]
└─ Etapa 3: upsertGlobal                           [estendida]
    ├─ cards Featured (4)                          [existente]
    ├─ cards Experts (45)                          [novo]
    └─ cards Axis Saúde (5)                        [existente]
```

A coleção `Especialistas`, o Global `corpo-docente` e o adapter no front **já estão preparados**. Nenhuma mudança em schema, types, loader ou page.tsx.

## 5. Mudanças no seed

### 5.1. Novo tipo + array de dados

```typescript
interface ExpertSeed {
  slug: string;              // do cmsLink original (ex: "perfil-maria-helena-castro")
  nome: string;
  fotoArquivo: string;       // "expert-01.1920.webp" .. "expert-04.1920.webp"
  vertical: "educacao" | "gestao-publica";
  tipo: "autoridade" | "palestrante" | "doutrinador" | "consultor" | "pesquisador";
  frente?: "contratacoes";
  formacao: "doutorado" | "mestrado" | "especializacao" | "graduacao-experiencia";
  atuacao: ("universidade" | "gestao-publica" | "controle" | "judiciario" | "multilateral" | "terceiro-setor" | "consultoria")[];
  programasSlugs: string[];  // ["edutec", "proge"]
  titulacao: "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao";
  credencialTexto: string;   // texto completo (vai para curriculoCurto E credencialCard)
  // — embrulho editorial específico do card —
  axisBadge: string;
  tipoTag: string;
  programasTexto: string;
  programasStrong: string;
  sufixoPrograma?: string;
  ctaHref: string;
}

const EXPERTS_DATA: ExpertSeed[] = [
  // 45 entradas extraídas literalmente de
  // apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
  // linhas 508-1579 (CARDS_EXPERTS).
];
```

Note: `instituicao` NÃO é campo do `ExpertSeed`. É derivada em runtime via heurística (§5.3).

### 5.2. Heurística de `titulacao` (mapping `formacao` → `titulacao`)

```typescript
const TITULACAO_POR_FORMACAO: Record<ExpertSeed["formacao"], ExpertSeed["titulacao"]> = {
  "doutorado": "doutorado",
  "mestrado": "mestrado",
  "especializacao": "especializacao",
  "graduacao-experiencia": "graduacao",
};
```

### 5.3. Heurística de `instituicao` (extrai primeira frase do `credencial`)

```typescript
function extrairInstituicao(credencial: string): string {
  // Primeira frase = tudo até o primeiro ponto final
  const match = credencial.match(/^([^.]+)\./);
  return match ? match[1].trim() : credencial.slice(0, 80);
}
```

Exemplos:
- `"Ex-presidente do INEP. Políticas públicas..."` → `"Ex-presidente do INEP"`
- `"Especialista em Lei 14.133/2021 e auditor do TCU. Doutorado..."` → `"Especialista em Lei 14.133/2021 e auditor do TCU"`

### 5.4. Nova função `upsertEspecialistasExperts`

Mesmo padrão do `upsertEspecialistasFeatured`:
- Find por slug → update ou create
- Resolve `programasRelacionados` via lookup em Programas
- Aplica `extrairInstituicao(credencial)`
- Aplica `TITULACAO_POR_FORMACAO[formacao]`
- `curriculoCurto` recebe o `credencialTexto` completo via `richTextFromTexto`
- Retorna `EspecialistaIdMap` (slug → id) para o caller

### 5.5. Estende `upsertGlobal`

```typescript
const cardsExperts = EXPERTS_DATA.map((esp) => ({
  formato: "expert" as const,
  especialista: especialistas[esp.slug],
  tag: esp.tipoTag,
  axisBadge: esp.axisBadge,
  credencialCard: esp.credencialTexto,
  ctaHref: esp.ctaHref,
  ctaRotulo: "Consultar disponibilidade",
  programasTexto: esp.programasTexto,
  programasStrong: esp.programasStrong,
  ...(esp.sufixoPrograma ? { sufixoPrograma: esp.sufixoPrograma } : {}),
  // metaAtuacao/metaEixos ausentes — admin.condition formato=expert os esconde
})).filter((c) => c.especialista !== undefined);

const cards = [...cardsFeatured, ...cardsExperts, ...cardsAxis];
```

`main()` consolidado:
```typescript
const fotos = await uploadFotos(payload);
const featured = await upsertEspecialistasFeatured(payload, fotos);
const experts = await upsertEspecialistasExperts(payload, fotos);
const especialistas = { ...featured, ...experts };
await upsertGlobal(payload, especialistas);
```

## 6. Conversão de hrefs

Os `ctaHref` no array original usam paths legacy do protótipo HTML:
```
./12_Pagina_Contato_v1.html?categoria=curadoria-edu#tab-proposta
```

A sessão 1 já converteu manualmente para:
```
/contato?categoria=curadoria-edu#tab-proposta
```

Aplicar a mesma conversão no `EXPERTS_DATA` ao extrair de `CARDS_EXPERTS`. Padrão:
- `./12_Pagina_Contato_v1.html` → `/contato`
- Manter querystring + hash

## 7. Verificação

### Typecheck e build
- `pnpm --filter @ntc/cms typecheck` PASS
- `pnpm typecheck` (monorepo) PASS

### Seed idempotente (rodar 2x)
- 1ª run: cria 45 novos Especialistas + atualiza 4 Featured + atualiza Global
- 2ª run: atualiza 49 Especialistas + atualiza Global (zero novos)

### Validações no front (com dev rodando)
```bash
curl -s http://localhost:3000/o-grupo/corpo-docente > /tmp/cd.html
# tipoTag distintos:
grep -oE 'class="tipoTag"[^>]*>[^<]+' /tmp/cd.html | sort -u | wc -l   # ≥5
# Fotos via Supabase:
grep -oE 'supabase.co/storage/v1/object/public/[^"]+expert-0[1-4]' /tmp/cd.html | sort -u | wc -l  # 4
# Total de cards renderizados (Featured + Expert + Axis = 4+45+5):
grep -c 'docente-card' /tmp/cd.html   # ≥54
```

### Verificação visual humana (memory `feedback_validacao_visual`)
Servidor dev fica no ar. Usuário valida:
- Cards Experts aparecem com foto, tipoTag, axisBadge, credencial, programas
- Filtros (tabs + selects) funcionam (tabs Educação, Gestão Pública, Contratações filtram corretamente)
- Mobile (DevTools 375px) sticky CTA aparece
- Card específico (ex: Maria Helena Guimarães Castro) renderiza com mesmo visual de antes (só que agora vem do CMS)

## 8. Rollback

- Branch isolada `feat/cms-corpo-docente-experts`
- `git revert <merge>` desfaz mudanças no seed
- Reseed automaticamente sobrescreve dados (idempotente)
- Cenário extremo: deletar Especialistas com slug `perfil-*` ausente do conjunto Featured (4 slugs conhecidos) via admin Payload ou query SQL

## 9. Fora de escopo

- Migrar `palestrantes` de Programas/Eventos para a coleção Especialistas (Sessão 3)
- Substituir fotos placeholder por fotos reais (responsabilidade editorial)
- Adicionar `metaAtuacao`/`metaEixos` aos cards Expert (não estão no protótipo)
- Página de perfil público `/corpo-docente/[slug]` (template separado)

## 10. Critérios de pronto

- [ ] `EXPERTS_DATA` tem exatamente 45 entradas, mesma ordem do `CARDS_EXPERTS` original
- [ ] `upsertEspecialistasExperts` criado, idempotente
- [ ] `upsertGlobal` estendido com `cardsExperts`
- [ ] `pnpm --filter @ntc/cms typecheck` PASS
- [ ] Seed roda 2x consecutivas sem erro, segunda run sem novos creates
- [ ] `pnpm build` PASS
- [ ] Verificação visual humana aprovada (≥54 cards renderizados, todos os tipoTag aparecem)
- [ ] PR aberta (ou merge direto no main) com screenshot desktop + mobile

---

*Spec gerada via brainstorming → writing-plans. Próxima etapa: plano de implementação.*
