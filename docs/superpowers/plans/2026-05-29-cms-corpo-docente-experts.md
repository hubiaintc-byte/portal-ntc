# CMS Corpo Docente — Sessão 2 (Experts) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar os 45 cards `CARDS_EXPERTS` de `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts` (linhas 508-1579) para o Payload CMS, estendendo `seedCorpoDocente.ts` com upsert idempotente de Especialistas Experts e cards correspondentes no Global `corpo-docente`.

**Architecture:** Sem mudanças em schema, types, loader ou page.tsx — coleção `Especialistas`, Global `corpo-docente` e adapter `apps/web/lib/cms/corpoDocente.ts` já preparados pela sessão 1. Adiciona `ExpertSeed[]` data + função `upsertEspecialistasExperts` no seed existente, estende `upsertGlobal` com 45 cards Expert apontando para os novos Especialistas.

**Tech Stack:** Payload CMS 3.18.0 (Postgres adapter Supabase), TypeScript strict, `pnpm payload run` para seed.

**Spec:** `docs/superpowers/specs/2026-05-29-cms-corpo-docente-experts-design.md`

**Fonte de dados:** `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts` linhas 508-1579 (CARDS_EXPERTS).

**Fora de escopo:**
- Mudanças em schema, types, loader ou page.tsx (já tudo OK na sessão 1)
- Migrar palestrantes de Programas/Eventos (sessão 3)
- Substituir fotos placeholder por reais (responsabilidade editorial)

---

## File Structure

**Modificar (todos no mesmo arquivo):**
- `apps/cms/src/seed/seedCorpoDocente.ts`
  - Adicionar interface `ExpertSeed`
  - Adicionar constante `EXPERTS_DATA` (45 entradas)
  - Adicionar constante `TITULACAO_POR_FORMACAO` (mapping)
  - Adicionar função `extrairInstituicao`
  - Adicionar função `upsertEspecialistasExperts`
  - Estender `upsertGlobal` com `cardsExperts`
  - Atualizar `main()` para chamar `upsertEspecialistasExperts` e mesclar IDs

**Princípio de divisão:** o seed continua arquivo único (consistente com `seedHomeV3.ts`, padrão do projeto). As 45 entradas de dados ficam em uma única constante ordenada por vertical/seção para facilitar diffing.

---

## Task 1: Adicionar interface ExpertSeed + helpers

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Ler arquivo atual para localizar pontos de inserção**

Run: `grep -n "EspecialistaFeaturedSeed\|ESPECIALISTAS_FEATURED\|^async function upsertEspecialistasFeatured\|^async function upsertGlobal\|^async function main" apps/cms/src/seed/seedCorpoDocente.ts`

Esperado: ver linhas onde as estruturas existentes vivem para inserir as novas LOGO DEPOIS de `ESPECIALISTAS_FEATURED`.

- [ ] **Step 2: Adicionar interface ExpertSeed + mapping de titulação + helper extrairInstituicao**

Localizar a linha que termina o array `ESPECIALISTAS_FEATURED` (`];` após o 4º Featured). Inserir IMEDIATAMENTE DEPOIS:

```typescript

/**
 * Especialistas Experts — extraídos literalmente de
 * apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
 * (linhas 508-1579, CARDS_EXPERTS).
 *
 * Distribuição: 16 Educação + 14 Gestão Pública + 15 Núcleo
 * Contratações (frente="contratacoes"). 0 Saúde — Saúde tem só
 * os 5 Axis populados na sessão 1.
 *
 * Reusa as 4 fotos placeholder (expert-01..04.1920.webp) já
 * carregadas na etapa 1. Equipe editorial substitui por fotos
 * reais via admin depois.
 *
 * `instituicao` é derivada da primeira frase do `credencialTexto`
 * via `extrairInstituicao()`. `titulacao` é derivada de `formacao`
 * via `TITULACAO_POR_FORMACAO`.
 */
interface ExpertSeed {
  slug: string;
  nome: string;
  fotoArquivo: string;
  vertical: "educacao" | "gestao-publica";
  tipo: "autoridade" | "palestrante" | "doutrinador" | "consultor" | "pesquisador";
  frente?: "contratacoes";
  formacao: "doutorado" | "mestrado" | "especializacao" | "graduacao-experiencia";
  atuacao: ("universidade" | "gestao-publica" | "controle" | "judiciario" | "multilateral" | "terceiro-setor" | "consultoria")[];
  programasSlugs: string[];
  credencialTexto: string;
  axisBadge: string;
  tipoTag: string;
  programasTexto: string;
  programasStrong: string;
  sufixoPrograma?: string;
  ctaHref: string;
}

const TITULACAO_POR_FORMACAO: Record<
  ExpertSeed["formacao"],
  "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao"
> = {
  doutorado: "doutorado",
  mestrado: "mestrado",
  especializacao: "especializacao",
  "graduacao-experiencia": "graduacao",
};

/**
 * Extrai a primeira frase do `credencial` para usar como `instituicao`.
 * Ex: "Ex-presidente do INEP. Políticas públicas..." → "Ex-presidente do INEP".
 * Fallback: primeiros 80 caracteres se não encontrar ponto final.
 */
function extrairInstituicao(credencial: string): string {
  const match = credencial.match(/^([^.]+)\./);
  return match ? match[1].trim() : credencial.slice(0, 80).trim();
}

const EXPERTS_DATA: ExpertSeed[] = [
  // Preenchido na Task 2
];
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS, zero erros. O array vazio `EXPERTS_DATA: ExpertSeed[] = []` é válido.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): interface ExpertSeed + helpers extrairInstituicao/TITULACAO_POR_FORMACAO"
```

---

## Task 2: Preencher EXPERTS_DATA com 45 entradas — bloco Educação (16)

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Ler bloco Educação do source**

Run: `awk '/^export const CARDS_EXPERTS/,/NTC GESTÃO PÚBLICA/' apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts > /tmp/experts-edu.txt && head -60 /tmp/experts-edu.txt`

Esperado: ver os primeiros cards Educação para conferir formato.

- [ ] **Step 2: Substituir o array vazio com as 16 entradas Educação**

Use Edit. Substituir:
```typescript
const EXPERTS_DATA: ExpertSeed[] = [
  // Preenchido na Task 2
];
```

Com (extraído literalmente das linhas ~510-866 de `conteudoCorpoDocente.ts`, **aplicando conversão de href** `./12_Pagina_Contato_v1.html` → `/contato`):

```typescript
const EXPERTS_DATA: ExpertSeed[] = [
  // ============================================================
  // NTC EDUCAÇÃO · 16 cards
  // ============================================================
  {
    slug: "perfil-maria-helena-guimaraes-castro",
    nome: "Maria Helena Guimarães Castro",
    fotoArquivo: "expert-02.1920.webp",
    vertical: "educacao",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["gestao-publica", "universidade"],
    programasSlugs: ["edutec", "proge"],
    credencialTexto:
      "Ex-presidente do INEP. Políticas públicas em educação, avaliação em larga escala e gestão de redes educacionais brasileiras.",
    axisBadge: "Avaliação e políticas",
    tipoTag: "Autoridade",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "EDUTEC · PROGE",
    ctaHref: "/contato?categoria=curadoria-edu#tab-proposta",
  },
  // ⚠️ IMPLEMENTAR: copiar os 15 cards Educação restantes do array
  // CARDS_EXPERTS original (linhas ~536-866), aplicando o mesmo mapping:
  //   cmsLink → slug
  //   imagemSrc "./img/fotos/_optimized/expert-XX.1920.webp" → fotoArquivo "expert-XX.1920.webp"
  //   atuacao "a,b" (string CSV) → atuacao ["a","b"] (array)
  //   programas "X,Y" (string CSV) → programasSlugs ["x","y"] (lowercase, sem o "+")
  //   credencial → credencialTexto
  //   ctaHref "./12_Pagina_Contato_v1.html?..." → ctaHref "/contato?..."
  //   campos não mapeados (frente="", imagemAlt, nomeExibido, ctaRotulo) descartados
  //   frente: "contratacoes" só se original tem frente !== ""
  //   sufixoPrograma só incluído se presente no original
];
```

⚠️ **NOTA AO IMPLEMENTADOR:** O comentário `⚠️ IMPLEMENTAR` é uma instrução explícita para você completar mecanicamente os 15 cards restantes do bloco Educação. Use a Bash tool para extrair cada bloco:

```bash
# Lista todos os 16 nomes para verificar progresso:
awk '/^export const CARDS_EXPERTS/,/NTC GESTÃO PÚBLICA/' apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts | grep -oE 'cmsLink: "[^"]+"' | head -16
```

Para cada cmsLink listado, extraia o bloco completo entre `{` e `},` do source e construa a entrada `ExpertSeed` aplicando os mappings acima. **Não pule cards. Não invente.** Se algum campo for ambíguo, mantenha o valor do source literal.

- [ ] **Step 3: Verificar contagem**

Run: `grep -c "^    slug:" apps/cms/src/seed/seedCorpoDocente.ts`

Esperado: pelo menos 20 (4 Featured + 16 Educação). Se < 20, faltou completar cards.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS. Se erro de tipo, conferir que cada entrada tem todos os campos requeridos.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): EXPERTS_DATA com 16 cards NTC Educação"
```

---

## Task 3: Adicionar bloco Gestão Pública (14 cards)

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Ler bloco Gestão Pública do source**

Run: `awk '/NTC GESTÃO PÚBLICA/,/NÚCLEO CONTRATAÇÕES/' apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts > /tmp/experts-gov.txt && grep -c "^  {" /tmp/experts-gov.txt`

Esperado: 14 (mais 1 do header divisor, mas o awk para no NÚCLEO).

Listar nomes: `grep -oE 'cmsLink: "[^"]+"' /tmp/experts-gov.txt`

- [ ] **Step 2: Inserir 14 entradas Gestão Pública**

Use Edit. Localizar o comentário `// ⚠️ IMPLEMENTAR: copiar os 15 cards Educação restantes...` ou (se você completou Task 2) localizar o último card de Educação. Inserir DEPOIS, ANTES do `];` que fecha o array:

```typescript
  // ============================================================
  // NTC GESTÃO PÚBLICA · 14 cards (sem Contratações)
  // ============================================================
  // ⚠️ IMPLEMENTAR: copiar os 14 cards Gestão Pública do array
  // CARDS_EXPERTS original (entre os comentários "NTC GESTÃO PÚBLICA"
  // e "NÚCLEO CONTRATAÇÕES"), aplicando os mesmos mappings da Task 2.
  // vertical: "gestao-publica" para todos. frente NÃO incluso (apenas
  // o bloco Contratações tem frente: "contratacoes").
```

Depois extrair cada um dos 14 cards via Bash + Read e completar mecanicamente.

Para cada card extraído, o template é:

```typescript
  {
    slug: "perfil-XXX",
    nome: "Nome Completo",
    fotoArquivo: "expert-0X.1920.webp",
    vertical: "gestao-publica",
    tipo: "autoridade",      // ou doutrinador, palestrante, consultor, pesquisador
    formacao: "doutorado",   // ou mestrado, especializacao, graduacao-experiencia
    atuacao: ["..."],        // array dos values do original CSV
    programasSlugs: ["..."], // siglas em lowercase
    credencialTexto: "...",
    axisBadge: "...",
    tipoTag: "Autoridade",
    programasTexto: "Eixos relacionados · ",
    programasStrong: "...",
    ctaHref: "/contato?categoria=curadoria-gov#tab-proposta",
  },
```

- [ ] **Step 3: Verificar contagem**

Run: `grep -c "^    slug:" apps/cms/src/seed/seedCorpoDocente.ts`
Esperado: pelo menos 34 (4 + 16 + 14).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): EXPERTS_DATA com 14 cards NTC Gestão Pública"
```

---

## Task 4: Adicionar bloco Núcleo Contratações (15 cards)

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Ler bloco Contratações do source**

Run: `awk '/NÚCLEO CONTRATAÇÕES/,/^];$/' apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts > /tmp/experts-cp.txt && grep -c "^  {" /tmp/experts-cp.txt`

Esperado: 15.

- [ ] **Step 2: Inserir 15 entradas Contratações**

Mesmo padrão das Tasks 2-3. Localizar o final do bloco Gestão Pública e inserir DEPOIS, ANTES do `];`:

```typescript
  // ============================================================
  // NÚCLEO CONTRATAÇÕES PÚBLICAS · 15 cards
  // (vertical=gestao-publica + frente=contratacoes)
  // ============================================================
  // ⚠️ IMPLEMENTAR: copiar os 15 cards Contratações do array
  // CARDS_EXPERTS original (entre o comentário "NÚCLEO CONTRATAÇÕES"
  // e o `];` final), aplicando mappings + adicionando `frente: "contratacoes"`.
  // ctaHref padrão: "/contato?categoria=curadoria-cp#tab-proposta".
```

Template por card (cada um tem `frente: "contratacoes"`):

```typescript
  {
    slug: "perfil-XXX",
    nome: "Nome Completo",
    fotoArquivo: "expert-0X.1920.webp",
    vertical: "gestao-publica",
    tipo: "doutrinador",      // muito comum em Contratações
    frente: "contratacoes",
    formacao: "doutorado",
    atuacao: ["..."],
    programasSlugs: ["agip"],  // praticamente sempre AGIP
    credencialTexto: "...",
    axisBadge: "...",
    tipoTag: "...",
    programasTexto: "...",
    programasStrong: "...",
    ctaHref: "/contato?categoria=curadoria-cp#tab-proposta",
  },
```

- [ ] **Step 3: Verificar contagem final**

Run: `grep -c "^    slug:" apps/cms/src/seed/seedCorpoDocente.ts`
Esperado: pelo menos 49 (4 Featured + 16 Edu + 14 Gov + 15 CP).

Também: `awk '/^const EXPERTS_DATA/,/^];$/' apps/cms/src/seed/seedCorpoDocente.ts | grep -c "^  {"`
Esperado: exatamente 45 (só os Experts, não os Featured).

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS.

- [ ] **Step 5: Verificar conversão de hrefs (não deve sobrar nenhum legacy)**

Run: `awk '/^const EXPERTS_DATA/,/^];$/' apps/cms/src/seed/seedCorpoDocente.ts | grep -c "12_Pagina_Contato_v1.html"`
Esperado: `0`. Se > 0, fazer find/replace para `/contato`.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): EXPERTS_DATA com 15 cards Núcleo Contratações (total 45 Experts)"
```

---

## Task 5: Adicionar função upsertEspecialistasExperts

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Localizar ponto de inserção**

Run: `grep -n "^async function upsertEspecialistasFeatured\|^async function upsertGlobal\|^async function main" apps/cms/src/seed/seedCorpoDocente.ts`

Esperado: ver as 3 funções existentes. Inserir nova função IMEDIATAMENTE DEPOIS do FIM de `upsertEspecialistasFeatured` (e antes de `upsertGlobal`).

- [ ] **Step 2: Adicionar a função**

Use Edit. Localizar o último `}` que fecha `upsertEspecialistasFeatured` (a linha imediatamente antes de `async function upsertGlobal`). Inserir DEPOIS:

```typescript

async function upsertEspecialistasExperts(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fotos: FotoIdMap,
): Promise<EspecialistaIdMap> {
  payload.logger.info(
    `[seed:corpo-docente] Upsert de ${EXPERTS_DATA.length} Especialistas Experts.`,
  );
  const map: EspecialistaIdMap = {};

  for (const esp of EXPERTS_DATA) {
    const fotoId = fotos[esp.fotoArquivo];
    if (!fotoId) throw new Error(`foto '${esp.fotoArquivo}' não foi carregada (etapa 1).`);

    const programasIds = await resolverProgramasIds(payload, esp.programasSlugs);

    const dadosBase = {
      nome: esp.nome,
      slug: esp.slug,
      foto: fotoId,
      titulacao: TITULACAO_POR_FORMACAO[esp.formacao],
      instituicao: extrairInstituicao(esp.credencialTexto),
      curriculoCurto: richTextFromTexto(esp.credencialTexto) as never,
      vertical: esp.vertical,
      tipo: esp.tipo,
      ...(esp.frente ? { frente: esp.frente } : {}),
      formacao: esp.formacao,
      atuacao: esp.atuacao,
      ...(programasIds.length ? { programasRelacionados: programasIds } : {}),
    };

    const existente = await payload.find({
      collection: "especialistas",
      where: { slug: { equals: esp.slug } },
      limit: 1,
    });

    if (existente.docs[0]) {
      const atualizado = await payload.update({
        collection: "especialistas",
        id: existente.docs[0].id,
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = atualizado.id as Id;
      payload.logger.info(
        `[seed:corpo-docente] atualiza Expert '${esp.slug}' (id=${atualizado.id})`,
      );
    } else {
      const criado = await payload.create({
        collection: "especialistas",
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = criado.id as Id;
      payload.logger.info(
        `[seed:corpo-docente] cria Expert '${esp.slug}' (id=${criado.id})`,
      );
    }
  }

  return map;
}
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS. Reusa `EspecialistaIdMap`, `Id`, `FotoIdMap`, `resolverProgramasIds`, `richTextFromTexto` — todos já existentes.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): upsertEspecialistasExperts (idempotente, 45 Experts)"
```

---

## Task 6: Estender upsertGlobal com cards Experts

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Localizar ponto de inserção dentro de upsertGlobal**

Run: `grep -n "const cardsFeatured\|const cardsAxis\|const cards = \[" apps/cms/src/seed/seedCorpoDocente.ts`

Esperado: ver 3 linhas — `cardsFeatured` (declaração), `cardsAxis` (declaração), `cards = [...cardsFeatured, ...cardsAxis]` (concatenação).

- [ ] **Step 2: Adicionar cardsExperts após cardsAxis**

Use Edit. Localizar a declaração de `cardsAxis` (que termina com `];` antes do `const cards = [...cardsFeatured, ...cardsAxis];`). Inserir DEPOIS do fechamento de `cardsAxis` e ANTES de `const cards`:

```typescript

  // Experts cards — mapeados 1:1 de EXPERTS_DATA. metaAtuacao/metaEixos
  // ficam ausentes; admin.condition do CMS esconde para formato=expert.
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
  })).filter((c) => c.especialista !== undefined);
```

- [ ] **Step 3: Atualizar a concatenação `cards`**

Use Edit. Localizar:
```typescript
  const cards = [...cardsFeatured, ...cardsAxis];
```

Substituir com:
```typescript
  const cards = [...cardsFeatured, ...cardsExperts, ...cardsAxis];
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): upsertGlobal inclui 45 cards Experts"
```

---

## Task 7: Atualizar main() para chamar upsertEspecialistasExperts

**Files:**
- Modify: `apps/cms/src/seed/seedCorpoDocente.ts`

- [ ] **Step 1: Localizar main()**

Run: `grep -n "^async function main\|upsertEspecialistasFeatured\|upsertGlobal" apps/cms/src/seed/seedCorpoDocente.ts`

Localizar o corpo da `main()` que tem aproximadamente:

```typescript
  const fotos = await uploadFotos(payload);
  const especialistas = await upsertEspecialistasFeatured(payload, fotos);
  payload.logger.info(`[seed:corpo-docente] Especialistas Featured OK (${Object.keys(especialistas).length}).`);

  await upsertGlobal(payload, especialistas);
```

- [ ] **Step 2: Atualizar main**

Use Edit. Substituir o bloco acima por:

```typescript
  const fotos = await uploadFotos(payload);

  const featured = await upsertEspecialistasFeatured(payload, fotos);
  payload.logger.info(
    `[seed:corpo-docente] Especialistas Featured OK (${Object.keys(featured).length}).`,
  );

  const experts = await upsertEspecialistasExperts(payload, fotos);
  payload.logger.info(
    `[seed:corpo-docente] Especialistas Experts OK (${Object.keys(experts).length}).`,
  );

  const especialistas = { ...featured, ...experts };

  await upsertGlobal(payload, especialistas);
```

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @ntc/cms typecheck`
Esperado: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/seed/seedCorpoDocente.ts
git commit -m "feat(seed): main() chama upsertEspecialistasExperts e mescla IDs no Global"
```

---

## Task 8: Rodar seed e verificar idempotência

**Files:** (sem alterações — só execução)

- [ ] **Step 1: Verificar que .env existe no worktree atual**

Run: `ls apps/cms/.env`
Esperado: arquivo existe. Se não existir: `cp /Users/joao/Documents/portal-ntc/apps/cms/.env apps/cms/.env`

- [ ] **Step 2: Primeira execução do seed**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente 2>&1 | tail -80`

Esperado:
- 8 fotos `mantém`
- 4 Featured `atualiza`
- 45 Experts `cria` (primeira vez)
- `Global corpo-docente atualizado.`
- Exit 0

Se algum slug de programa não for resolvido (warn `programa 'XXX' não encontrado`), parar e investigar — pode ser slug em letra errada (`PROSUS+` vs `prosus`, `PROAPS+` vs `proaps`).

- [ ] **Step 3: Segunda execução (idempotência)**

Run: `pnpm --filter @ntc/cms payload:seed:corpo-docente 2>&1 | tail -80`

Esperado:
- 8 fotos `mantém`
- 4 Featured `atualiza`
- 45 Experts `atualiza` (não `cria`)
- `Global corpo-docente atualizado.`
- Exit 0

Se algum vier `cria` na segunda execução, slug duplicado ou query find quebrada — investigar.

- [ ] **Step 4: Commit (não há mudanças no código — pular)**

Não há commit. Apenas validação operacional.

---

## Task 9: Verificação visual #1 (build + curl)

**Files:** (sem alterações — só verificação)

- [ ] **Step 1: Build de produção**

Run: `pnpm --filter @ntc/web build 2>&1 | tail -25`

Esperado: PASS. Rota `/o-grupo/corpo-docente` aparece como `○ (Static)` ou `ƒ (Dynamic)` com revalidate.

- [ ] **Step 2: Iniciar dev server em background**

Run em background: `pnpm --filter @ntc/web dev`

Aguardar log `Ready in` antes de prosseguir. Use Bash com `until grep -q "Ready in" <output-file>; do sleep 1; done`.

- [ ] **Step 3: Curl a página**

Run: `curl -s http://localhost:3000/o-grupo/corpo-docente > /tmp/cd_experts.html && curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/o-grupo/corpo-docente`

Esperado: HTTP 200.

- [ ] **Step 4: Validar conteúdo via grep**

Run:
```bash
echo "Maria Helena Castro: $(grep -c 'Maria Helena' /tmp/cd_experts.html)"
echo "Cesar Callegari: $(grep -c 'Callegari' /tmp/cd_experts.html)"
echo "Fotos via Supabase: $(grep -oE 'supabase.co/storage/v1/object/public/[^\"]+expert-0[1-4]' /tmp/cd_experts.html | sort -u | wc -l)"
echo "Fotos expert fallback (/img/fotos/_optimized/expert): $(grep -c 'img/fotos/_optimized/expert' /tmp/cd_experts.html)"
echo "tipoTag distintos (esperado >= 5: Autoridade, Doutrinador, Consultor, Palestrante, Pesquisador):"
grep -oE 'tipoTag[^>]*>[^<]+' /tmp/cd_experts.html | sort -u | head -10
```

Esperado:
- ≥1 menção a Maria Helena, Callegari (Experts conhecidos do bloco Educação)
- 4 fotos expert únicas do Supabase
- 0 fotos expert via /img/fotos (não pode mais haver fallback de Expert)
- ≥5 valores distintos de tipoTag

- [ ] **Step 5: Verificar logs do dev**

Run: `tail -20 <output-do-dev>` ou `grep -E "corpo-docente|fetch CMS" <output-do-dev>`

Esperado: SEM linhas `fetch CMS falhou, usando fallback`. Apenas requests `GET /o-grupo/corpo-docente 200`.

Se houver `fetch CMS falhou`, copiar o `apps/web/.env` do repo principal: `cp /Users/joao/Documents/portal-ntc/apps/web/.env apps/web/.env`, depois reiniciar dev.

- [ ] **Step 6: Deixar dev rodando para Task 10**

Não parar o dev. Task 10 precisa dele para validação humana.

---

## Task 10: Verificação visual humana

**Files:** (sem alterações)

- [ ] **Step 1: Apresentar para validação humana**

Imprimir mensagem para o usuário:

```
🔍 Sanity check visual #1 (CMS com Experts)

Servidor dev: http://localhost:3000/o-grupo/corpo-docente

Confirmar:
- 4 Featured + 45 Experts + 5 Axis Saúde renderizam (= 54 cards)
- Cards Experts têm foto (placeholder expert-01..04), tipoTag, axisBadge, credencial, programas
- Filtros (tabs Educação/Gestão Pública/Contratações Públicas) filtram corretamente
- Filtros de programa, formação, atuação funcionam
- Mobile DevTools 375px: sticky CTA aparece, layout responsivo OK
- Nenhum card duplicado ou faltando

Card específico para conferir (Maria Helena Guimarães Castro):
- vertical "educacao" → aparece na tab "Educação"
- programas EDUTEC, PROGE → filtro de programa
- tipo "autoridade" → tipoTag visível

Confirma?
```

Aguardar resposta humana antes de prosseguir. (Memory `feedback_validacao_visual`.)

- [ ] **Step 2: Parar dev (após aprovação)**

Após aprovação humana, parar o background do dev server.

- [ ] **Step 3: Sem commit** (nenhuma mudança nesta task)

---

## Task 11: Cleanup final + lint/typecheck/build

**Files:** (sem alterações — só validação)

- [ ] **Step 1: Lint do CMS**

Run: `pnpm --filter @ntc/cms lint 2>&1 | tail -15`

Esperado: PASS. Se algum erro novo aparecer (não relacionado ao pré-existente `next-env.d.ts` da sessão 1), corrigir.

Lembrete: o erro `triple-slash-reference` em `next-env.d.ts` é **pré-existente**, não introduzido por esta sessão. Não corrigir aqui.

- [ ] **Step 2: Typecheck do monorepo**

Run: `pnpm typecheck 2>&1 | tail -10`

Esperado: PASS, 5/5 tasks successful.

- [ ] **Step 3: Build de produção**

Run: `pnpm build 2>&1 | tail -10`

Esperado: PASS. (Já testado na Task 9, mas confirmar pós-cleanup.)

- [ ] **Step 4: Resumo final**

Imprimir:

```
Sessão 2 do CMS — CONCLUÍDA

Entregue:
- 45 Especialistas Experts no CMS (16 Edu + 14 Gov + 15 CP)
- Seed estendido em apps/cms/src/seed/seedCorpoDocente.ts
- Página /o-grupo/corpo-docente agora consome 100% do CMS (54 cards: 4 Featured + 45 Experts + 5 Axis)

Próxima sessão (sessão 3):
- Migrar palestrantes de Programas/Eventos para a coleção Especialistas
```

- [ ] **Step 5: Sem commit** (nenhuma mudança nesta task)

---

## Self-Review

**1. Cobertura do spec:**
- §3 Mapa dos 45 → Tasks 2/3/4 (16/14/15 cards por bloco)
- §4 Arquitetura sem mudanças em schema/types/loader/page → respeitado, plano só toca `seedCorpoDocente.ts`
- §5.1 Novo `ExpertSeed` + `EXPERTS_DATA` → Tasks 1 (interface) + 2/3/4 (dados)
- §5.2 `TITULACAO_POR_FORMACAO` → Task 1
- §5.3 `extrairInstituicao` → Task 1
- §5.4 `upsertEspecialistasExperts` → Task 5
- §5.5 `upsertGlobal` estendido + main → Tasks 6 + 7
- §6 Conversão de hrefs → instrução explícita nas Tasks 2/3/4 + verificação na Task 4 Step 5
- §7 Verificação → Tasks 8 (idempotência) + 9 (curl) + 10 (humana) + 11 (lint/typecheck/build)
- §8 Rollback → não há task — implícito no padrão Git (branch isolada → revert se algo der errado)
- §9 Fora de escopo → respeitado (sem mudanças em palestrantes de Programas/Eventos)
- §10 Critérios de pronto → cobertos nas Tasks 9/10/11

**2. Placeholders críticos:** As instruções `⚠️ IMPLEMENTAR` nas Tasks 2/3/4 são intencionais — apontam o engenheiro para a fonte exata (linhas específicas do arquivo) e dão o template + mapping completo de cada campo. Não são "TBD" — são instruções de extração mecânica de fonte conhecida. Aceitável.

**3. Consistência de tipos:** `ExpertSeed` (Task 1) usado em `EXPERTS_DATA` (Tasks 2/3/4), `upsertEspecialistasExperts` (Task 5) e `cardsExperts` (Task 6). `TITULACAO_POR_FORMACAO` (Task 1) usado em `upsertEspecialistasExperts` (Task 5). `extrairInstituicao` (Task 1) usado em `upsertEspecialistasExperts` (Task 5). Tudo consistente.

---

*Plano gerado pelo fluxo brainstorming → writing-plans. Próxima etapa: executar via subagent-driven-development ou executing-plans.*
