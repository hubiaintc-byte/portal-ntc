# Página Agenda Geral NTC — Design (porta do HTML)

**Data:** 2026-05-24
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `09_Pagina_Agenda_v2.html` (~4.495 linhas) para a rota `/agenda` em um **novo route group** `(capacitacao)`. A página é a Agenda Geral NTC — listagem editorial de 17 eventos (seminários, oficinas, cursos executivos, jornadas, simpósios, congressos) das três verticais com pipeline completo de filtros, tabs, busca, ordenação, paginação e URL sync no client.

O mega-menu de **Capacitação** no header do protótipo lista "Agenda Geral NTC" como primeiro item — confirmação visual fornecida pelo usuário em 2026-05-24. Este route group `(capacitacao)` é novo no monorepo e abrigará, em sessões futuras, `/eventos-online`, `/eventos-presenciais`, `/eventos-hibridos`, `/eventon`, etc.

Segue a estratégia "porta do HTML" consolidada (CSS literal extraído + `page.tsx` server + `conteudoAgenda.ts` local + Client Components para interatividade). É a 7ª porta de prototype do projeto (após Home v3, O Grupo, 3 verticais, 15 programas, Corpo Docente, 4 institucionais, Contato).

## 2. Documentos de referência

- `09_Pagina_Agenda_v2.html` — fonte canônica visual e funcional. Localizada na raiz do repositório.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota dentro da família Capacitação.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual (esta porta usa classes literais do HTML, não componentes do inventário).
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100%; preservar `data-*`, inline `<em>`/`<br>`/`<a>`, tudo dos 17 cards.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em `conteudoAgenda.ts`, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano lado a lado com o HTML.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')` em background-images do CSS portado.
- `memory/project_listagem_client_filtros.md` — padrão para listagens com pipeline (já aplicado em Corpo Docente).
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `InteracoesScroll` no layout para `.fade-in`.
- Spec irmã: `docs/superpowers/specs/2026-05-22-pagina-corpo-docente-design.md` — referência direta para o pipeline client.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (capacitacao)/                        ← NOVO route group
│   ├── layout.tsx                        ← HeaderHome + FooterHome + InteracoesScroll
│   └── agenda/
│       ├── page.tsx                      ← server component, JSX literal das 6 seções
│       ├── conteudoAgenda.ts             ← tipos, eventos (17), hero, microbar, CTAs, rodapé contextual
│       ├── PipelineAgenda.tsx            ← client: tabs + filterbar + destaques + grid + counter + paginação + URL sync + selo deadline
│       └── StickyMobileCTA.tsx           ← client: scroll listener + dismiss sessionStorage
└── agenda-prototipo.css                  ← CSS literal do <style> do HTML (~1.960 linhas)
```

`apps/web/app/layout.tsx` (root) importa `agenda-prototipo.css` como já faz com `home-prototipo.css`, `o-grupo-prototipo.css`, `programas-prototipo.css`, `verticais-prototipo.css`, `corpo-docente-prototipo.css`, `institucional-prototipo.css`, `contato-prototipo.css`.

**Decisões fixadas:**

- Rota: `/agenda` (raiz, sem prefixo `/capacitacao` — o route group é organizacional, não vira segmento de URL).
- Layout do novo route group `(capacitacao)` reaproveita `HeaderHome` + `FooterHome` + `InteracoesScroll` do `(home)` — markup do header/footer do protótipo é idêntico ao da Home v3 (já verificado).
- `revalidate = 3600` no `page.tsx`.
- **`SeloDeadline` NÃO é arquivo próprio** — a lógica de recálculo a cada 30s do selo "Inscrições até X / Encerradas" mora dentro de `PipelineAgenda.tsx` como `useEffect` com `setInterval`, evitando passar dados entre componentes via DOM.

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">` do HTML, linhas 2237-3026):

1. **Breadcrumb** (`<nav class="breadcrumb">`) — `Grupo NTC / Capacitação / Agenda Geral`. Crumb 1 aponta para `/`. Crumb 2 é texto puro (Capacitação ainda não tem hub). Crumb 3 é `current`.
2. **Hero comercial** (`<section class="agenda-hero">`) — eyebrow ("Capacitação e Desenvolvimento · Edição 2026"), h1 com `<em>` e `<br>` (renderizado via `dangerouslySetInnerHTML` para preservar inline), sub, dois CTAs (`btn--gold` "Ver eventos abertos" → `#agenda-eventos`; `btn--ghost-light` "Solicitar proposta" → `/contato#tab-proposta`), `agenda-hero-microbar` com 4 contadores estáticos do protótipo (18 eventos / 6 formatos / 3 áreas / 5 capitais). O número de "18" eventos abertos vem como string fixa do `conteudoAgenda.ts`; o `<strong id="microbar-abertos">` recebe o valor real via `PipelineAgenda` após hidratação se quisermos no futuro — por ora segue estático para evitar mismatch de SSR.
3. **`<PipelineAgenda eventos={EVENTOS} />`** — engloba seções 2, 3 e 4 do protótipo:
   - `<nav class="agenda-tabs">` (5 tabs: Abertas / Próximas / Em breve / Replay / Realizados) com `span.tab-count` dinâmico.
   - `<div class="agenda-filterbar">` (mobile toggle, busca, 3 filtros primários, botão "Filtros avançados", botão "Limpar", linha avançada com 4 filtros).
   - `<section class="section" id="agenda-eventos">` com `agenda-destaques` (até 3 cards com flag `destaque_editorial`), `agenda-todos-head`, `agenda-controlrow` (counter + perpage 9/12/18), `agenda-applied` (chips de filtros aplicados), `agenda-grid` (17 cards), `agenda-empty` (estado vazio), `agenda-pagination`.
4. **CTAs intermediários** (`<div class="agenda-intercta fade-in">`) — 2 cards: "Sob medida · Solução exclusiva" e "In company · Turmas fechadas".
5. **Rodapé contextual** (`<section class="agenda-context">`) — 4 colunas: Áreas estratégicas, Plataforma e suporte, Modelos de contratação, Atendimento comercial. Lista de links que aponta para `/solucoes-estrategicas/*`, `/programas`, `/o-grupo`, `/contato` ou mantém placeholders.
6. **`<StickyMobileCTA />`** — barra fixa mobile (`<aside class="agenda-sticky-mobile-cta">`) que aparece após scroll passar do hero.

Fora do `<main>`: nada além do layout (header/footer/InteracoesScroll vêm do route group).

## 5. Estrutura do `conteudoAgenda.ts`

Tipos e exports:

```ts
// Áreas estratégicas (slug usado em data-area)
export type AreaSlug = "edu" | "gov" | "sau";

// Tabs (data-tab nos cards)
export type TabSlug = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

// Status visual do selo do card
export type StatusEvento = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

// Formato comercial (data-formato)
export type FormatoEvento =
  | "seminario" | "oficina" | "curso" | "jornada" | "simposio" | "congresso";

// Modalidade (data-modalidade)
export type ModalidadeEvento = "online" | "presencial" | "hibrido";

// Programa (data-programa) — sigla canônica das 15 marcas + variantes do prot.
export type ProgramaSlug =
  | "EDUTEC" | "PEAR" | "PEI" | "PROGE" | "PROGIR" | "EGIDE"
  | "VIVAESCOLA" | "PINEI" | "FUTURA"
  | "AGIP" | "LIDERA" | "SIGA"
  | "SIGS" | "PROAPS" | "PROSUS";

// Flags editoriais (data-flags)
export type FlagEvento = "destaque_editorial" | "prioridade_comercial" | "ultimas_vagas";

export interface CartaoEvento {
  ordem: number;                    // posição original no protótipo (1-17)
  area: AreaSlug;
  programa: ProgramaSlug;
  formato: FormatoEvento;
  modalidade: ModalidadeEvento;
  cidade: string;                   // slug (brasilia, sp, recife, salvador, fortaleza, "")
  mes: string;                      // YYYY-MM
  cargaHorariaHoras: number;
  valorReais: number;
  dataIso: string;                  // YYYY-MM-DD
  deadlineIso: string;              // YYYY-MM-DD
  tab: TabSlug;
  flags: FlagEvento[];
  keywords: string;                 // string literal para busca textual
  status: StatusEvento;             // mantém paridade com data-status

  // Conteúdo visual (preservado literalmente)
  selo: { texto: string; classe: string }; // ex.: "Inscrições abertas" / status-open
  imagemUrl: string;                // path /img/fotos/_optimized/...
  dataBloco: DataBloco;             // range | multi | single
  modalidadeLabel: string;          // ex.: "Online ao vivo + replay", "Híbrido · SP"
  modalidadeClasseExtra?: "hibrido" | "presencial"; // só quando o protótipo aplica modificador

  formatoLabel: string;             // ex.: "Seminário", "Oficina"
  areaLabel: string;                // ex.: "NTC Educação"
  tituloHtml: string;               // pode conter inline tags
  coordenacaoNomes: string;
  metaEssenciais: [string, string]; // ex.: ["16h · 2 dias", "Plataforma EventOn"]
  precoIndividualLabel: string;     // ex.: "R$ 1.490"
  precoEquipesLabel: string;        // ex.: "Sob consulta"

  ctaInscrever: { texto: string; href: string; cmsLink: string; track: string };
  linkDetalhes: { texto: string; href: string; cmsLink: string; track: string };
  linkInscreverEquipe: { texto: string; href: string; cmsLink: string; track: string };
  programaBinding: { sigla: string; href: string; cmsLink: string };
}

export type DataBloco =
  | { tipo: "range"; diaInicio: string; diaFim: string; mesAno: string }   // "22"–"23", "Mai · 2026"
  | { tipo: "multi"; quantidade: number; rotulo: string; periodo: string } // 3 encontros, Jun · 2026
  | { tipo: "single"; dia: string; mesAno: string };

export const EVENTOS: CartaoEvento[] = [ /* 17 itens, ordem exata do HTML */ ];

// Hero
export const HERO_AGENDA = {
  eyebrow: "Capacitação e Desenvolvimento · Edição 2026",
  tituloHtml: "Agenda <em>Geral NTC</em>.<br>Eventos, formações e jornadas com inscrições abertas.",
  sub: "Encontre seminários, oficinas, cursos executivos, jornadas, simpósios e congressos do Grupo NTC nas áreas de Educação, Gestão Pública e Saúde — em formato online, presencial ou híbrido.",
  ctas: [
    { classe: "btn btn--gold", texto: "Ver eventos com inscrições abertas", arrow: true, href: "#agenda-eventos", cmsLink: "ver-eventos-abertos", track: "hero_cta_ver_eventos" },
    { classe: "btn btn--ghost-light", texto: "Solicitar proposta para equipe ou órgão público", arrow: false, href: "/contato#tab-proposta", cmsLink: "proposta-equipe-orgao", track: "hero_cta_proposta" }, // TODO: tab âncora a confirmar quando /contato suportar
  ],
  microbar: [
    { valor: "18", rotulo: "eventos abertos", id: "microbar-abertos" },
    { valor: "6",  rotulo: "formatos comerciais" },
    { valor: "3",  rotulo: "áreas estratégicas" },
    { valor: "5",  rotulo: "capitais nacionais" },
  ],
};

// Tabs
export const TABS: { slug: TabSlug; rotulo: string; idCount: string }[] = [
  { slug: "abertas",   rotulo: "Inscrições abertas",  idCount: "cnt-abertas" },
  { slug: "proximas",  rotulo: "Próximas turmas",      idCount: "cnt-proximas" },
  { slug: "em-breve",  rotulo: "Em breve",             idCount: "cnt-em-breve" },
  { slug: "replay",    rotulo: "Replay disponível",    idCount: "cnt-replay" },
  { slug: "realizados",rotulo: "Eventos realizados",   idCount: "cnt-realizados" },
];

// Filtros (selects)
export const FILTRO_AREA = [ { value: "", label: "Todas" }, { value: "edu", label: "NTC Educação" }, ... ];
export const FILTRO_MODALIDADE = [ ... ];
export const FILTRO_MES = [ ... ];        // Mai–Out 2026
export const FILTRO_PROGRAMA_GROUPS = [   // optgroups
  { label: "NTC Educação", opcoes: [...] },
  { label: "NTC Gestão Pública", opcoes: [...] },
  { label: "NTC Saúde", opcoes: [...] },
];
export const FILTRO_FORMATO = [ ... ];
export const FILTRO_CIDADE = [ ... ];
export const FILTRO_SORT = [
  { value: "editorial", label: "Editorial (destaque + cronologia)" },
  { value: "cronologica", label: "Cronologia (próximos primeiro)" },
  { value: "encerramento", label: "Encerramento das inscrições" },
  { value: "ch", label: "Carga horária" },
  { value: "valor-asc", label: "Valor (menor → maior)" },
  { value: "valor-desc", label: "Valor (maior → menor)" },
];
export const PERPAGE_OPCOES = [9, 12, 18] as const;
export const DEFAULTS = { tab: "abertas" as TabSlug, sort: "editorial", page: 1, perPage: 9 };

// Empty state
export const EMPTY_AGENDA = {
  titulo: "Nenhum evento encontrado com os filtros aplicados.",
  descricao: "Tente remover algum filtro ou solicite uma capacitação sob medida para a sua instituição — desenhamos a oferta com você.",
  ctas: [...]
};

// CTAs intermediários
export const CTAS_INTERMEDIARIOS = [
  { eyebrow: "Sob medida · Solução exclusiva", tituloHtml: "...", descricao: "...", ctaPrimario: {...} },
  { eyebrow: "In company · Turmas fechadas",    tituloHtml: "...", descricao: "...", ctaPrimario: {...} },
];

// Rodapé contextual (4 colunas)
export const RODAPE_CONTEXTUAL = [
  { titulo: "Áreas estratégicas",   itens: [...] },
  { titulo: "Plataforma e suporte", itens: [...] },
  { titulo: "Modelos de contratação", itens: [...] },
  { titulo: "Atendimento comercial",  itens: [...] },
];

// Sticky mobile CTA
export const STICKY_CTA = {
  texto: "Atendimento institucional NTC",
  strong: "Precisa de ajuda?",
  cta: { texto: "Falar com atendimento", href: "/contato", cmsLink: "atendimento-mobile", track: "sticky_cta_atendimento" },
};
```

**Fidelidade:** todos os 17 cards são lidos um a um do HTML (linhas 2475-2998) preservando `data-area`, `data-programa`, `data-formato`, `data-modalidade`, `data-cidade`, `data-mes`, `data-ch`, `data-valor`, `data-dateiso`, `data-deadline-iso`, `data-tab`, `data-flags`, `data-keywords`, `data-status`, imagem de cobertura, selo, bloco de data (range/multi/single), labels de modalidade, título com inline tags, coordenação, meta essenciais, preços, CTAs e binding de programa. Nada é inferido ou rephrased.

## 6. Client components

### 6.1. `PipelineAgenda.tsx`

Núcleo da interatividade. Recebe `eventos: CartaoEvento[]` e renderiza:

- `<nav class="agenda-tabs">` — 5 tabs. Click muda `state.tab` e reseta `state.page = 1`. Counter de cada tab calculado em `useMemo` sobre todos os eventos (ignora filtros — sempre mostra total da tab, como no protótipo).
- `<div class="agenda-filterbar">` — busca, selects, advanced toggle, clear all, mobile filter toggle.
  - Busca: `<input type="search">` com debounce 200ms; botão `×` aparece quando há texto.
  - Selects controlados (area, programa, formato, modalidade, cidade, mes, sort).
  - "Filtros avançados" toggle: classe `is-open` na linha avançada + `aria-expanded`.
  - "Limpar filtros ×": reseta todos os filtros + busca + page.
  - Mobile filter toggle (botão visível apenas em mobile): abre/fecha `agenda-filters-inner`, atualiza `mft-active-count`.
- `<div class="agenda-destaques">` — renderizado apenas quando tab atual tem cards com flag `destaque_editorial` E não há filtros aplicados (paridade com protótipo). Renderiza até 3.
- `<header class="agenda-todos-head">`, `<div class="agenda-controlrow">` com counter "Mostrando A–B de N eventos" + perpage buttons (9/12/18, classe `is-active`).
- `<div class="agenda-applied">` — chips removíveis dos filtros ativos (texto formato "Área: NTC Educação ×"); cada chip clica para limpar o filtro individual.
- `<div class="agenda-grid">` — N cards (paginação), renderizados com markup literal. Cada `<article class="event-card">` preserva todos os `data-*` para que CSS/seletores do protótipo continuem aplicáveis.
- `<div class="agenda-empty">` — visível quando 0 resultados após filtros.
- `<nav class="agenda-pagination">` — botões prev/next + numbers com compactação (1 ... 4 5 6 ... 9) conforme função `compactRange` do protótipo.

Pipeline (ordem fixa, espelha linhas 3368-3425 do HTML):

1. `filterByTab(eventos)` — `e.tab === state.tab`.
2. `filterByControls` — area/programa/formato/modalidade/cidade/mes (filtro vazio passa todos).
3. `filterBySearch` — busca textual contra título + área + programa + keywords + cidade label.
4. `sortCards` — 6 ordenações: editorial (destaque editorial > prioridade comercial > cronologia), cronológica, encerramento (deadline), ch, valor asc/desc.
5. `paginate` — slice por `(page-1)*perPage` até `page*perPage`.

URL sync (`history.replaceState`, defaults omitidos: tab=abertas, sort=editorial, page=1, perPage=9):

- Parâmetros: `area, programa, formato, modalidade, cidade, mes, tab, sort, page, perPage, q`.
- Hidratação no mount lê querystring uma vez (`useEffect` com `[]`) e aplica ao estado.
- `useEffect([state])` re-escreve a URL.
- Padrão segue `memory/project_listagem_client_filtros.md`.

**Selo de deadline** (lógica embarcada, NÃO componente separado):

- `useEffect` com `setInterval` de 30s recalcula, para cada card visível, dias até deadline (`(deadline - hoje) / 86400`).
- Atualiza o texto e classe do `<span class="event-status-tag">` via render React (não DOM mutation) — `daysToDeadline` entra no estado interno do PipelineAgenda como `now: Date`, e o cálculo é puro a partir disso.
- Estados (espelha linhas 3311-3340 do HTML): `is-closed` (deadline passou), `is-final` (≤2 dias), `is-soon` (≤7 dias), default.
- Hidratação SSR: cálculo no client após mount; durante SSR o selo usa apenas `selo.texto` e `selo.classe` originais. Aceitamos a 1ª pintura sem o seal dinâmico para evitar mismatch.

**Analytics tracking** (`function track(action, payload)`):

- No-op por padrão (hook para futuro GA4/Mixpanel).
- Disparada em: mudança de tab, mudança de filtro, mudança de sort, mudança de page, clique em CTA com `data-track`, clique em paginação, clique no card sem ser em CTA, dismiss do sticky.

### 6.2. `StickyMobileCTA.tsx`

Auxiliar pequeno. Recebe `props` do `STICKY_CTA`. Renderiza `<aside class="agenda-sticky-mobile-cta">`.

- `useEffect` no mount: lê `sessionStorage.getItem('ntc_agenda_sticky_dismissed')`. Se `=== '1'`, não monta nada.
- Mede `bottom` do `.agenda-hero` (querySelector).
- Listener `scroll` (passive, debounced via rAF): toggle classe `.is-visible` + `aria-hidden` quando `scrollY > heroBottom + 80`.
- Botão `×` (smc-close): dismissa, grava no sessionStorage, dispara `track('sticky_cta_dismissed')` (no-op por enquanto).

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas 95-2056, ~1.960 linhas), copiado sem adaptação. Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, `--pergaminho`, `--font-serif`, `--font-cond`, `--font-sans`, `--space-*`, `--t-*`, `--shadow-*`) vêm de `home-prototipo.css` — não duplicar.

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`). Buscar e substituir.

**Classes principais incluídas:**

- `.breadcrumb`, `.breadcrumb-list`, `.sep`, `.current`
- `.agenda-hero`, `.agenda-hero-bg`, `.agenda-hero-eyebrow`, `.agenda-hero-sub`, `.agenda-hero-ctas`, `.agenda-hero-microbar`
- `.agenda-tabs`, `.agenda-tabs-inner`, `.agenda-tab` (+ `.is-active`), `.tab-count`
- `.agenda-filterbar`, `.agenda-filterbar-inner`, `.agenda-mobile-filter-toggle`, `.mft-icon`, `.mft-label`, `.mft-count`
- `.agenda-filters-row` (+ `.is-primary`, `.is-advanced`), `.agenda-search`, `.agenda-filter`, `.clear-search`
- `.agenda-advanced-toggle` (+ `.chevron`), `.agenda-filter-clear`
- `.agenda-destaques`, `.agenda-destaques-head`, `.agenda-destaques-grid`, `.destaques-eyebrow`
- `.agenda-todos-head`, `.todos-eyebrow`, `.agenda-controlrow`, `.agenda-counter`, `.agenda-controls-right`, `.agenda-perpage`, `.agenda-perpage-buttons`
- `.agenda-applied` (chips)
- `.agenda-grid`, `.event-card`, `.event-status-tag` (+ `.status-open`, `.status-last`, `.status-soon`, `.status-replay`, `.status-closed`)
- `.event-cover`, `.event-cover-img`, `.event-cover-overlay`, `.event-cover-meta`
- `.event-date-block` (+ `.range`, `.multi`, `.single`), `.days`, `.dash`, `.mon-yr`, `.count`, `.number`, `.period`
- `.event-modality` (+ `.presencial`, `.hibrido`)
- `.event-body`, `.event-program-link`, `.event-speakers-line`, `.event-meta-essentials`, `.event-program-binding`, `.epb-label`, `.epb-program`
- `.event-pricing`, `.event-price` (+ `.institutional`)
- `.event-actions`, `.event-actions-row`, `.link-arrow`
- `.agenda-empty`, `.empty-icon`, `.empty-actions`
- `.agenda-pagination`
- `.agenda-intercta`, `.agenda-intercta-card` (+ `.alt`), `.ic-eyebrow`, `.ic-actions`
- `.agenda-context`, `.agenda-context-grid`, `.agenda-context-col`
- `.agenda-sticky-mobile-cta`, `.smc-close`, `.smc-text`, `.smc-btn`
- Animações: `.fade-in`, `.is-visible` (já globais em `home-prototipo.css`)

## 8. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm next dev --port 3000` levantado (NÃO `pnpm dev` — turbo não propaga logs dos sub-processos).
4. Página servida em `http://localhost:3000/agenda` retorna 200.
5. **Validação visual feita pelo usuário** comparando lado a lado com `09_Pagina_Agenda_v2.html` aberto no navegador. Nenhum screenshot automatizado.
6. Smoke functional checklist:
   - [ ] Header e footer aparecem idênticos à Home v3.
   - [ ] Mega-menu funciona, breadcrumb renderiza no topo.
   - [ ] Hero exibe título com `<em>` em dourado, microbar com 4 contadores, 2 CTAs.
   - [ ] Tabs alternam (Abertas / Próximas / Em breve / Replay / Realizados); contagem em cada tab reflete cards reais.
   - [ ] Filtros primários (Área / Modalidade / Mês) filtram a grade.
   - [ ] Toggle "Filtros avançados" abre/fecha a linha secundária (Programa / Formato / Cidade / Ordenar).
   - [ ] Busca textual reduz cards (debounce ~200ms).
   - [ ] Chips de filtros aplicados aparecem em `agenda-applied`; clicar `×` no chip limpa o filtro individual.
   - [ ] "Limpar filtros" zera tudo (incluindo busca e tab? NÃO — só filtros e busca, paridade com protótipo).
   - [ ] Destaques editoriais (até 3) aparecem acima da grade quando aplicável (tab=abertas, sem filtros).
   - [ ] Contador "Mostrando A–B de N" reflete paginação.
   - [ ] Botões perpage 9/12/18 alternam, resetando para página 1.
   - [ ] Paginação numerada com compactação (1 ... 4 5 6 ... 9).
   - [ ] Estado vazio aparece quando 0 resultados.
   - [ ] Cada card exibe selo, cobertura com data, modalidade, formato/área, título, coordenação, meta, programa binding, preços, CTAs.
   - [ ] Selo "Inscrições abertas / Últimas vagas / Próxima turma" coerente com `data-status`.
   - [ ] URL muda ao filtrar (`?area=edu`, `?tab=replay`, `?page=2` etc.) e link colado em nova aba hidrata o estado.
   - [ ] CTAs intermediários "sob medida" e "in company" exibidos.
   - [ ] Rodapé contextual com 4 colunas de links.
   - [ ] Sticky mobile CTA aparece em mobile após rolar além do hero; `×` esconde e persiste em sessionStorage para a sessão.
   - [ ] `.fade-in` revela ao entrar no viewport.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| 17 cards × ~12 campos = 200+ pontos de fidelidade. Erros silenciosos. | Ler cada card individualmente do HTML; revisão lado a lado durante typecheck (TypeScript exige todos os campos). |
| Pipeline com 5 estágios + URL sync + selo dinâmico = ~600 linhas de client. | Manter tudo em `PipelineAgenda.tsx` (sem fragmentar prematuramente); funções puras `aplicarPipeline(state, eventos): Resultado` testáveis se necessário. |
| Mismatch SSR/CSR pelo selo dinâmico (deadline calculada a partir de "hoje"). | Renderizar selo estático no SSR (texto do `selo.texto`), recalcular após mount. Aceitar 1ª pintura "sem deadline dinâmico". Não usar `Date.now()` durante render. |
| URL sync com `replaceState` em loop. | `useEffect` que escreve URL roda só quando estado muda (deps explícitas); hidratação inicial seta `isHydrated` flag para evitar re-escrita imediata. |
| Cidades com label vazio (`data-cidade=""` para eventos online sem cidade). | Tratar `""` como "sem cidade", não aparece em chip nem em filtro. |
| Hrefs do protótipo apontam para arquivos HTML antigos. | Atualizar para rotas existentes (`/contato`, `/programas`, `/solucoes-estrategicas/ntc-educacao`); manter literal com `// TODO:` para âncoras ainda não implementadas (`#eventon`, `#juridico`, `#tab-proposta`). |
| Novo route group sem outras páginas — risco de duplicar lógica do layout. | Layout `(capacitacao)/layout.tsx` reaproveita os mesmos imports dos outros route groups: `HeaderHome`, `FooterHome`, `InteracoesScroll`. Spec idêntico ao padrão `(institucional)`. |
| `noUncheckedIndexedAccess: true` em `EVENTOS[0]?.area` etc. | Tipar `metaEssenciais: [string, string]` (tupla), usar `?? ""` em derivações de strings, evitar acesso por índice direto sem guard. |
| Build com `noUnusedLocals: true` se criar arquivo "andaime". | Implementar componentes em commits funcionais (não criar shell vazio); se inevitável, usar bloco `void X;` documentado conforme memory. |

## 10. Fora de escopo

- Página individual de evento (`/agenda/[slug]` ou `/eventos/[slug]`) — apenas placeholder `href="#agenda-eventos"` com `title="Página interna em construção"`, igual ao protótipo.
- Integração real de analytics (GA4/Mixpanel). `track()` permanece no-op.
- Captcha / formulário de inscrição. CTAs apenas linkam para placeholder.
- CMS / Payload — todos os textos e eventos ficam em `conteudoAgenda.ts`. Coleção `Evento` no Payload fica para a Janela de CMS futura.
- Internacionalização. Página é pt-BR only por enquanto.
- Tests automatizados (Vitest/Playwright) — validação visual humana é o checkpoint canônico nesta fase.
- Rotas irmãs do route group `(capacitacao)`: `/eventos-online`, `/eventos-presenciais`, `/eventos-hibridos`, `/eventon`, hub `/capacitacao`. Cada uma exige seu próprio HTML aprovado e sessão de porta dedicada.
- Hub `/capacitacao` (segundo crumb) — texto puro neste momento; não tem rota destino ainda.

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (estrutura → CSS → conteúdo → server JSX → PipelineAgenda → StickyMobileCTA → validação).
3. Typecheck + lint + dev server na porta 3000.
4. Checkpoint visual humano lado a lado com `09_Pagina_Agenda_v2.html`.
5. Commit final + atualização de memória se surgirem aprendizados novos.
