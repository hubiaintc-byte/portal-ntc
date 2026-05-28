# CMS — Corpo Docente (Sessão 1 do CMS)

**Data:** 2026-05-28
**Sprint:** F · Janela B
**Branch sugerida:** `feat/cms-corpo-docente`
**Escopo:** primeira sessão de CMS do portal. Migra a página `/o-grupo/corpo-docente` (textos institucionais + cards de especialistas) para o Payload, com fallback estático.

## 1. Contexto

A página `/o-grupo/corpo-docente` foi portada do protótipo HTML e hoje vive
em três arquivos:

- `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx` — Server Component que renderiza tudo a partir de imports.
- `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts` — 1.997 linhas com `HERO`, `METRICAS`, `MANIFESTO`, `CARDS_FEATURED`, `CARDS_EXPERTS`, `CARDS_AXIS_SAUDE`, `CREDIBILIDADE`, `CREDENCIAMENTO`, `FAQ`, `CTA_FINAL`, `STICKY_CTA`.
- Componentes client: `FilterBarDocentes`, `HeroQuicklinks`, `FaqAcordeao`, `StickyCtaMobile`, `CorpoDocenteContext`, `FadeInObserver`.

A coleção `Especialistas` já existe (`apps/cms/src/collections/Especialistas.ts`)
com nome, foto, titulação, instituição, currículo e relacionamento com Áreas,
mas não cobre os campos editoriais do card do Corpo Docente (tag, axisBadge,
credencial-overlay-do-card, CTA específico) nem o dataset de filtro (vertical,
tipo, frente, formacao, atuacao, programas).

O Global `OGrupo` já tem um padrão de `especialistasDestaque` apontando para a
coleção `Especialistas`.

## 2. Decisões tomadas no brainstorming

| # | Decisão | Justificativa |
|---|---|---|
| 1 | Escopo: cards + também unificar Especialistas como fonte única do portal (Home, Eventos, futuras páginas) | resposta do usuário · escopo declarado |
| 2 | Arquitetura em 2 camadas: `Especialistas` (quem é) + Global `corpo-docente` (curadoria/aparição) | mesmo especialista pode aparecer em outras páginas sem o embrulho editorial específico do Corpo Docente |
| 3 | Cards no Global como lista única com `formato: featured\|expert\|axis` | menos abas no admin; condição `admin.condition` esconde campos irrelevantes por formato |
| 4 | page.tsx vira async com fallback estático | memory `feedback_db_push_paralelo` + `project_porta_html`; resiliência contra DB offline |
| 5 | Fotos: seed faz upload dos arquivos de `apps/web/public/img/fotos/_optimized/` para Supabase Storage | mantém fonte canônica de imagens; após seed, edição pelo admin |

## 3. Arquitetura

```
┌──────────────────────────────────────┐
│  Coleção: especialistas (existente)  │ ← "quem é a pessoa"
│  - nome, slug, foto (upload→media)   │
│  - titulação, instituição, cargo     │
│  - currículo curto/completo          │
│  - linhasAtuacao (rel → areas)       │
│  + vertical, tipo, frente (selects)  │
│  + formacao, atuacao (selects)       │
│  + programasRelacionados (rel)       │
│   (6 campos novos, todos opcionais)  │
└─────────────┬────────────────────────┘
              │ relationship hasMany=false
              ▼
┌──────────────────────────────────────┐
│  Global: corpo-docente (novo)        │ ← "como aparece na página"
│  - hero, métricas, manifesto, etc.   │
│  - cards: lista única ordenável      │
│    └─ formato: featured|expert|axis  │
│    └─ especialista (rel, opcional)   │
│    └─ embrulho editorial por card    │
└──────────────────────────────────────┘
              │ fetchCorpoDocente()
              ▼
┌──────────────────────────────────────┐
│  page.tsx (Server Component async)   │
│  try CMS → catch → fallback estático │
└──────────────────────────────────────┘
```

## 4. Mudanças na coleção `Especialistas`

Adicionar (todos opcionais por compatibilidade com registros pré-existentes):

| Campo | Tipo | Valores |
|---|---|---|
| `vertical` | `select` | `educacao`, `gestao-publica`, `saude` |
| `tipo` | `select` | `autoridade`, `palestrante`, `doutrinador`, `consultor`, `pesquisador` |
| `frente` | `select` opcional | `contratacoes` (marca o núcleo Contratações dentro de Gestão Pública) |
| `formacao` | `select` | `doutorado`, `mestrado`, `especializacao`, `graduacao-experiencia` |
| `atuacao` | `select hasMany` | `universidade`, `gestao-publica`, `controle`, `judiciario`, `multilateral`, `terceiro-setor`, `consultoria` |
| `programasRelacionados` | `relationship → programas, hasMany` | substitui a string `"LIDERA,SIGA"` por FK real |

Constantes dos enums vão em `apps/cms/src/shared/types.ts` (mesmo arquivo de `TITULACAO_DOCENTE`).

### Por que esses campos vão em Especialistas (e não no Global)?

São atributos **da pessoa**, reutilizáveis em qualquer listagem (Home,
Eventos, Programas, busca futura). Embrulho editorial (`tag`, `axisBadge`,
`credencialCard`, `metaAtuacao`, `metaEixos`, `ctaHref`, `ctaRotulo`) muda
por aparição — fica no Global.

## 5. Global `corpo-docente`

Novo arquivo: `apps/cms/src/globals/CorpoDocente.ts`.

Registrado em `apps/cms/src/payload.config.ts` na lista `globals` ao lado de
`Home`, `OGrupo`, `Rodape`.

Tabs (mesmo padrão de `OGrupo` e `Eventos`):

### Tab 1 — Hero & Quicklinks

| Campo | Tipo |
|---|---|
| `eyebrow` | text |
| `titulo` | richText (lexical restritivo + `<span class="accent">` + `<br>`) |
| `subtitulo` | richText (lexical restritivo + `<em>`) |
| `quicklinks` | array · fields: `tipo: select(anchor\|tab)`, `rotulo: text`, `href: text` (cond: tipo=anchor), `vertShortcut: select(TabId)` (cond: tipo=tab) |

### Tab 2 — Métricas

| Campo | Tipo |
|---|---|
| `metricas` | array (min 4, max 4) · fields: `classe: select(is-edu\|is-gov\|is-cpr\|is-sau)`, `sublabel`, `num`, `label`, `detalhe: textarea` |

### Tab 3 — Manifesto

| Campo | Tipo |
|---|---|
| `marker` | text |
| `titulo` | richText (restrito a `<em>`) |
| `lede` | textarea |
| `archCards` | array (4 itens fixos) · fields: `area: select(educacao\|gestao-publica\|contratacoes\|saude)`, `eyebrow`, `titulo`, `descricao: textarea`, `selo` |
| `camadas` | array (5 itens fixos) · fields: `num`, `titulo`, `descricao: textarea` |
| `callout` | group · `titulo`, `descricao: textarea` |
| `nota` | richText (restrito a `<strong>`) |

### Tab 4 — Cards (lista única)

```ts
cards: array, fields: [
  formato: select(featured|expert|axis),   // controla render

  // se formato ∈ {featured, expert}: relação esperada
  especialista: relationship → especialistas (admin.condition: formato !== "axis"),

  // embrulho editorial (todos opcionais — overrides por aparição)
  tag: text,                       // ex: "Autoridade convidada"
  axisBadge: text,                 // ex: "Gestão Pública · Direito constitucional"
  credencialCard: textarea,        // parágrafo do card (≠ currículo curto)
  metaAtuacao: text,               // ex: "Supremo Tribunal Federal"
  metaEixos: text,                 // ex: "LIDERA · SIGA"
  ctaHref: text,
  ctaRotulo: text,                 // default no adapter: "Consultar disponibilidade"

  // só para expert
  programasTexto: text,            // ex: "Vinculação · "
  programasStrong: text,           // ex: "LIDERA"
  sufixoPrograma: text,            // opcional

  // só para axis (sem especialista)
  area: text,                      // ex: "atencao-primaria"
  axisTag: text,
  tituloAxis: text,
  credencialAxis: textarea,
  programasTextoAxis: text,
  programasStrongAxis: text,
  styleAccent: text,
  styleAccentDark: text,
  iconeSvgInner: textarea          // innerHTML completo do <svg>
]
```

`admin.condition` esconde os campos irrelevantes de cada formato.

### Tab 5 — Credibilidade

| Campo | Tipo |
|---|---|
| `eyebrow` | text |
| `titulo` | richText |
| `lede` | textarea |
| `items` | array · `num`, `label`, `detalhe` |
| `rodape` | richText (restrito a `<strong>`) |

### Tab 6 — Credenciamento

| Campo | Tipo |
|---|---|
| `eyebrow`, `titulo` (richText), `descricao` (textarea) | — |
| `lista` | array · `texto: text` |
| `ctas` | array · `rotulo`, `href`, `variante: select(gold\|ghost-light\|...)` |
| `aside` | group · `eyebrow`, `titulo`, `intro: textarea`, `checklist: array of {texto}`, `nota: textarea` |

### Tab 7 — FAQ

| Campo | Tipo |
|---|---|
| `items` | array · `pergunta: text`, `resposta: richText` |

### Tab 8 — CTA Final

| Campo | Tipo |
|---|---|
| `eyebrow`, `titulo` (richText), `descricao` (textarea) | — |
| `ctaPrincipal`, `ctaSecundario` | group · `rotulo`, `href`, `variante` |
| `separadorAreas` | text |
| `ctasArea` | array · `rotulo`, `href` |

### Tab 9 — Sticky CTA Mobile

| Campo | Tipo |
|---|---|
| `rotulo` | text |
| `href` | text |

## 6. Loader e adapter (server)

Novo arquivo: `apps/web/lib/cms/corpo-docente.ts`.

```ts
import { getPayload } from "payload";
import config from "@payload-config";

export interface ConteudoCorpoDocente {
  HERO, METRICAS, MANIFESTO, CARDS_FEATURED, CARDS_EXPERTS,
  CARDS_AXIS_SAUDE, CREDIBILIDADE, CREDENCIAMENTO, FAQ,
  CTA_FINAL, STICKY_CTA,
  // mesma shape do conteudoFallback do arquivo estático
}

export async function fetchCorpoDocente(): Promise<ConteudoCorpoDocente> {
  const payload = await getPayload({ config });
  const global = await payload.findGlobal({
    slug: "corpo-docente",
    depth: 2, // puxa especialista + programas relacionados
  });
  return adaptarGlobal(global);
}
```

### Adapter

Função pura (`adaptarGlobal`) que transforma o shape do Payload no shape que
os componentes existentes (`FilterBarDocentes`, `HeroQuicklinks`, etc.) já
consomem. Responsabilidades:

- Achatar `card.especialista` (objeto populado) em `nome`, `imagemSrc` (URL do Supabase Storage), `imagemAlt`, dataset (`vertical`, `area`, `tipo`, `frente`, `formacao`, `atuacao`)
- Derivar `programas` (string CSV) a partir de `especialista.programasRelacionados` ou `metaEixos`
- Aplicar defaults (`ctaRotulo = "Consultar disponibilidade"` quando vazio)
- Filtrar cards com `especialista` deletado (formato featured/expert sem especialista populado): omitir + Sentry warn
- Cards de formato `axis` passam direto (sem dependência de Especialista)

## 7. page.tsx — fallback estático

```tsx
export const revalidate = 3600;

export default async function CorpoDocentePage() {
  const dados = await fetchCorpoDocente().catch((err) => {
    Sentry.captureException(err);
    return null;
  }) ?? conteudoFallback;

  return (
    <CorpoDocenteProvider>
      <main id="main">
        {/* mesmas seções que já existem, agora lendo `dados.HERO`, etc. */}
      </main>
    </CorpoDocenteProvider>
  );
}
```

`conteudoFallback` é um objeto agrupando os 11 exports atuais do
`conteudoCorpoDocente.ts` (HERO, METRICAS, etc.) no mesmo shape que o
adapter retorna. **Tarefa explícita do plano de implementação:** refatorar
`conteudoCorpoDocente.ts` para também exportar `conteudoFallback: ConteudoCorpoDocente`
agregando os 11 valores existentes (sem alterá-los) — os exports nomeados
atuais ficam mantidos para não quebrar nenhum import que ainda os use.
O arquivo permanece versionado e atualizado manualmente se a equipe
editorial mudar algo no CMS antes de o front rodar.

## 8. Seed

Novo arquivo: `apps/cms/src/seed/seedCorpoDocente.ts`.

Adicionado em `apps/cms/package.json`:

```json
"scripts": {
  "payload:seed:corpo-docente": "tsx src/seed/seedCorpoDocente.ts"
}
```

**Etapas (idempotentes):**

1. **Upload de fotos:** para cada arquivo em `apps/web/public/img/fotos/_optimized/*.webp`:
   - `find Media where filename = X` — se existe, reusa o ID
   - senão, lê o arquivo via `fs.readFile` e cria via `payload.create({ collection: "media", file: { data, mimetype: "image/webp", name } })`

2. **Especialistas:** para cada card em `CARDS_FEATURED` + `CARDS_EXPERTS`:
   - Deriva slug do `cmsLink` (já existe, ex: `perfil-luiz-fux`)
   - `find Especialistas where slug = X` — se existe, atualiza; senão, cria
   - Mapeia: `nome`, `foto` (ID do Media), `titulacao` (heurística do `tipo` → `TITULACAO_DOCENTE`), `instituicao` (parseado do `metaAtuacao` via regex `<strong>(.*?)</strong>`), `cargoAtual` (vazio inicialmente), `curriculoCurto` (rich text a partir do `credencial`), `vertical`, `tipo`, `frente`, `formacao`, `atuacao` (split por `,`), `programasRelacionados` (lookup em Programas pelo slug derivado das siglas em `programas: "LIDERA,SIGA"`)

3. **Global `corpo-docente`:**
   - Monta o payload completo (hero, métricas, manifesto, credibilidade, credenciamento, FAQ, CTA final, sticky) extraindo literalmente dos exports do `conteudoCorpoDocente.ts`
   - Monta `cards` apontando para Especialistas criados + embrulho editorial (tag, axisBadge, ctaHref…)
   - Cards de Axis Saúde entram com `formato: "axis"` e sem `especialista`
   - `payload.updateGlobal({ slug: "corpo-docente", data })`

**Pré-requisito de segurança (memory `feedback_db_push_paralelo`):** o seed só roda manualmente pelo usuário; o adapter do Payload já está com `push: false` no `postgresAdapter` — o Global novo entra via migration explícita (`payload migrate:create` + `payload migrate`).

## 9. Tipos compartilhados

`pnpm payload:generate` regenera `packages/types/src/payload-types.ts` (alinhado com CLAUDE.md §13). O arquivo é versionado.

O loader importa `CorpoDocente` (tipo gerado) e o adapter retorna o
`ConteudoCorpoDocente` que `conteudoCorpoDocente.ts` também exporta — assim
ambos os caminhos (CMS e fallback) compartilham o mesmo contrato.

## 10. Testes

### Unit (Vitest)
- `lib/cms/corpo-docente.test.ts` — adapter:
  - Card featured com Especialista populado retorna `CardFeatured` correto
  - Card featured com `especialista: null` (deletado) é omitido + warn
  - Card axis sem especialista passa direto
  - `programasRelacionados` vazio cai no fallback do `metaEixos`
  - Foto ausente em card featured/expert: card é omitido + Sentry warn (sem inventar imagem — memory `feedback_porta_html_fidelidade`)
- `seed/seedCorpoDocente.test.ts` — idempotência:
  - Rodar 2x consecutivas não duplica Especialistas nem Media
  - Modificar `credencial` no seed e re-rodar atualiza o registro existente

### Verificação visual (CLAUDE.md §6, memory `feedback_validacao_visual`)
- `pnpm dev` ativo
- Abrir `/o-grupo/corpo-docente` em desktop 1440 + mobile 375
- Confirmar com o usuário (humano) que:
  - 10 cards featured + ~30 experts + 5 axis renderizam idênticos ao protótipo HTML
  - Filtros do `FilterBarDocentes` continuam funcionando (tabs, selects, busca)
  - Sticky CTA mobile aparece
  - Fade-in `InteracoesScroll` continua disparando
  - Card específico do print (Min. Luiz Fux) renderiza com tag, foto, axisBadge, credencial, metaAtuacao, metaEixos e CTA corretos

### Servidor fica no ar até aprovação humana.

## 11. Migrations

Sequência:

1. `pnpm payload migrate:create corpo-docente-global` — gera SQL para o Global novo + colunas novas em Especialistas
2. Review do SQL gerado (não confiar no auto-gen sem ler)
3. `pnpm payload migrate` no dev (Supabase staging — projeto `irekejunwknguzdfszyi`)
4. `pnpm payload:seed:corpo-docente`
5. Smoke test visual (§10)
6. PR + review

Para produção (Janela C): mesma sequência no projeto Supabase de produção a ser criado.

## 12. Rollback

- Branch isolada `feat/cms-corpo-docente` (memory `using-git-worktrees`)
- Para reverter:
  - `git revert <merge>`
  - Reverter a migration: usar o down gerado pelo Payload (se suportado pela versão instalada) ou aplicar SQL inverso manual a partir do arquivo de migration revisado em §11.2
  - Coleção Especialistas mantém os 6 campos novos sem dados — todos opcionais, não quebram registros existentes
- Cards estáticos no `conteudoCorpoDocente.ts` permanecem versionados; o front cai automaticamente nele se o Global for removido

## 13. Fora de escopo (próximas sessões)

- Migrar `palestrantes` dos arquivos `conteudoXXX.ts` dos Programas para usar a coleção Especialistas (escopo declarado pelo usuário como "também", mas é outra sessão)
- Migrar `palestrante` dos eventos pré-existentes (`conteudoEventos.ts` por evento) para usar a coleção
- 2FA do admin (Janela C, decisão pendente §17.8 do CLAUDE.md)
- Página de perfil público do Especialista (`/corpo-docente/[slug]`) — campo `cmsLink` já antecipa esse roteamento, mas o template é projeto separado

## 14. Critérios de pronto

- [ ] Coleção `Especialistas` atualizada com 6 campos novos
- [ ] Global `CorpoDocente` criado e registrado no `payload.config.ts`
- [ ] Migration gerada, revisada e aplicada em staging
- [ ] Seed roda com sucesso (idempotente, 2x consecutivas sem duplicar)
- [ ] `pnpm payload:generate` regenera tipos sem erro
- [ ] Loader + adapter implementados com testes Vitest
- [ ] `page.tsx` consome do CMS com fallback estático funcional
- [ ] `pnpm typecheck` + `pnpm lint` limpos
- [ ] Verificação visual humana aprovada (`pnpm dev`, desktop + mobile)
- [ ] Card do Min. Luiz Fux renderiza identicamente ao print de referência
- [ ] PR aberta com screenshots desktop + mobile

---

*Spec gerada no fluxo brainstorming → writing-plans. Próxima etapa: plano de implementação.*
