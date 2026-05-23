# Página Corpo Docente — Design (re-porta integral)

**Data:** 2026-05-22
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

A página `/o-grupo/corpo-docente` já existe no monorepo, portada de `25_Pagina_Corpo_Docente_v1.html` (3.885 linhas). A porta atual está visualmente quebrada: alguns blocos batem com o protótipo, outros estão desalinhados. O usuário pediu reescrita do zero seguindo a mesma estratégia consolidada nas demais portas (programas, verticais, o-grupo, blocos): CSS literal extraído + `page.tsx` server component + `conteudoXxx.ts` local + Client Components mínimos para interatividade.

Esta sessão entrega a página inteira reescrita com **fidelidade 100%** ao HTML aprovado (memory `feedback_porta_html_fidelidade.md`) e portagem **completa da interatividade** que o protótipo possui (filterbar dinâmica, FAQ acordeão, sticky CTA mobile, fade-in observer).

## 2. Diagnóstico do estado atual

| Item | Atual | Protótipo | Gap |
|---|---|---|---|
| `apps/web/app/corpo-docente-prototipo.css` | 907 linhas, 92 seletores únicos | 2 blocos `<style>` totalizando ~1.253 linhas / ~226 regras | **~25% das regras CSS faltando** — provavelmente estados `is-open`, `is-active`, `is-visible`, paginação `.pg-*`, chips, mobile-toggle, `.docentes-empty`, `.sticky-cta-mobile`, animações do FAQ |
| Filterbar | UI estática, selects `disabled`, contadores fixos no JSX | Pipeline com 7 filtros + busca debounced + ordenação + paginação + chips removíveis + URL-sync + tab counts dinâmicos + auto-disable de tabs zeradas + keyboard nav (Arrow/Home/End) | Pipeline JS inteiro ausente |
| FAQ | `item.open` no conteúdo (fixo) | Acordeão controlado por click + `aria-expanded` reativo | Sem interação |
| Sticky CTA mobile | Não existe no JSX | Aparece após scroll > 800px, dismissable | Ausente |
| Hero quicklinks | Apenas `<a href="#especialistas">` | `data-vert-shortcut` que ativa a tab correspondente da filterbar | Ausente |
| Fade-in | Classes `fade-in` no JSX, sem JS para virar `is-visible` | IntersectionObserver com `threshold: 0.12` | Ausente |
| Slug da rota | `/o-grupo/corpo-docente` | HTML usa `/capacitacao/corpo-docente` no breadcrumb e no footer | Decisão: manter `/o-grupo/corpo-docente` (não é a queixa); ajustar crumb interno |

## 3. Documentos de referência

- `25_Pagina_Corpo_Docente_v1.html` — fonte canônica visual e funcional. Localizada na raiz do repositório.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota dentro de `(o-grupo)`.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual (esta porta usa classes literais do HTML, não componentes do inventário).
- `memory/project_porta_html.md` — estratégia "porta do HTML": CSS literal + route group próprio + textos em arquivo local + CMS só quando explicitamente pedido.
- `memory/feedback_porta_html_fidelidade.md` — ler o `<main>` inteiro, mapear todas as classes/seções/fontes antes de modelar o tipo.
- `memory/feedback_cms_apenas_quando_pedido.md` — não expandir Global; tudo em `conteudoCorpoDocente.ts`.
- `memory/feedback_validacao_visual.md` — checkpoint visual final é feito pelo usuário, não por screenshot automatizado. Servidor fica no ar.
- Spec irmã: `docs/superpowers/specs/2026-05-22-paginas-programa-design.md` — padrão de organização que esta sessão reutiliza.

## 4. Arquitetura de arquivos

Estrutura final (recomeço do zero — apaga `page.tsx`, `conteudoCorpoDocente.ts` e `corpo-docente-prototipo.css` atuais antes de criar os novos):

```
apps/web/app/
├── (o-grupo)/o-grupo/corpo-docente/
│   ├── page.tsx                    ← server component, JSX literal das 9 seções
│   ├── conteudoCorpoDocente.ts     ← textos, métricas, cards, labels, opções de select
│   ├── FilterBarDocentes.tsx       ← Client: pipeline completo (filtros + busca + sort + paginação + chips + URL-sync + tab counts)
│   ├── FaqAcordeao.tsx             ← Client: useState<Set<string>>
│   ├── StickyCtaMobile.tsx         ← Client: scroll listener + dismiss
│   └── FadeInObserver.tsx          ← Client: IntersectionObserver global da página
└── corpo-docente-prototipo.css     ← reescrito do zero (~1.253 linhas, 100% das regras dos 2 blocos <style>)
```

`apps/web/app/layout.tsx` já importa `corpo-docente-prototipo.css` — o arquivo é apenas substituído, sem mexer no layout root.

**Decisões fixadas:**

- Rota: `/o-grupo/corpo-docente`. O crumb interno do HTML (`Capacitação`) é ajustado para `O Grupo` para refletir a rota real.
- Layout do route group `(o-grupo)` (HeaderHome + FooterHome + InteracoesScroll) é reaproveitado.
- `revalidate = 3600` no `page.tsx`.

## 5. Estrutura do `page.tsx`

Server component que renderiza, em ordem (espelho do `<main id="main">` do protótipo):

Dentro do `<main id="main">` (8 blocos, mesma sequência do HTML):

1. `<section class="hero-page">` — hero institucional slim, com `crumb` ajustado, eyebrow, título com `<span class="accent">`, subtítulo com `<em>` cromático, `hero-quicklinks` (botões e âncoras).
2. `<section class="docentes-metrics">` — faixa de 4 métricas (edu/gov/cpr/sau).
3. `<section class="docentes-manifesto">` — marker, título, lede, `arch-grid` (4 cards), `arch-camadas` (5 numeradas), `arch-callout` (Contratações Públicas), `arch-nota`.
4. `<FilterBarDocentes ... />` — render do bloco `<div class="docentes-filterbar">` (sticky, mobile toggle, tabs, busca, selects, advanced, chips, clear) **e** da `<section class="section" id="especialistas">` inteira (head editorial, results-head, `experts-marker` + `experts-featured`, `experts-marker` + `experts-authority-grid`, `experts-counters`, nota "122+", nota "seleção operacional", empty state, paginação).
5. `<section class="docentes-credibilidade">` — eyebrow, título, lede, `credibilidade-grid` (4 itens), rodapé.
6. `<section class="cta-credenciamento" id="credenciamento">` — body com lista + CTAs, aside com checklist.
7. `<FaqAcordeao items={FAQ} />` — render do bloco `<section class="docentes-faq" id="faq">`.
8. `<section class="docentes-cta-final">` — eyebrow, título, descrição, CTA principal + secundário, separador, 4 CTAs por área.

Fora do `<main>` (auxiliares):

- `<StickyCtaMobile {...STICKY_CTA} />` — barra fixa que aparece após scroll.
- `<FadeInObserver />` — monta o IntersectionObserver global, não renderiza nada.

Detalhes:

- Hero quicklinks: o item "Ver toda a curadoria" permanece âncora (`#especialistas`); itens "Educação", "Gestão Pública", "Contratações Públicas", "Saúde" viram **botões** controlados pelo `CorpoDocenteContext`; "Credenciar especialista" permanece âncora (`#credenciamento`).
- `dangerouslySetInnerHTML` continua sendo usado para os textos que contêm `<em>`, `<strong>`, `<br>` literais do protótipo. Padrão já estabelecido nas outras portas.

## 6. Estrutura do `conteudoCorpoDocente.ts`

Reescrito do zero. Exports e tipos:

```ts
// Tipos
export type Vertical = "educacao" | "gestao-publica" | "saude";
export type Tipo =
  | "autoridade" | "palestrante" | "doutrinador" | "consultor" | "pesquisador";
export type Frente = "" | "contratacoes";

// 1. HERO
export const HERO: {
  crumb: { home: Link; current: string };
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  quicklinks: Array<
    | { tipo: "anchor"; rotulo: string; href: string }
    | { tipo: "tab"; rotulo: string; vertShortcut: TabId }
  >;
};

// 2. MÉTRICAS
export const METRICAS: Metrica[]; // 4 items: edu/gov/cpr/sau

// 3. MANIFESTO
export const MANIFESTO: {
  marker: string;
  titulo: string;
  lede: string;
  archCards: ArchCard[];   // 4 cards
  camadas: Camada[];        // 5 numeradas
  callout: { titulo: string; descricao: string };
  nota: string;
};

// 4. FILTERBAR — labels e opções
export type TabId = "todos" | "educacao" | "gestao-publica" | "contratacoes" | "saude";
export const TAB_LABELS: Record<TabId, string>;
export const AREA_LABELS: Record<string, string>; // 29 eixos
export const TIPO_LABELS: Record<Tipo, string>;
export const PROGRAMAS_OPTIONS: string[];          // 15 siglas
export const FORMACAO_OPTIONS: SelectOption[];
export const ATUACAO_OPTIONS: SelectOption[];
export const SORT_OPTIONS: SelectOption[];         // editorial/alfa/alfa-desc/programa/area
export const PERPAGE_OPTIONS: number[];            // 12, 24, 48, 96

// 5. CARDS (extraídos integralmente do HTML)
export const CARDS_FEATURED: CardFeatured[];   // 4 destaques (validar contagem na execução)
export const CARDS_EXPERTS: CardExpert[];      // ~39 cards (validar contagem)
export const CARDS_AXIS_SAUDE: CardAxis[];     // 5 frentes

// 6. CONTADORES institucionais
export const CONTADORES: Contador[]; // 4 counters: 22 eixos / 122+ / 15 / 3

// 7. NOTAS editoriais
export const NOTAS: {
  indicador122: { rotulo: string; texto: string };
  selecaoOperacional: string;
};

// 8. CREDIBILIDADE
export const CREDIBILIDADE: {
  eyebrow: string; titulo: string; lede: string;
  items: { num: string; label: string; detalhe: string }[];
  rodape: string;
};

// 9. CREDENCIAMENTO
export const CREDENCIAMENTO: {
  eyebrow: string; titulo: string; descricao: string;
  lista: string[];
  ctas: { rotulo: string; href: string; variante: "gold" | "ghost-light" }[];
  aside: {
    eyebrow: string; titulo: string; intro: string;
    checklist: string[]; nota: string;
  };
};

// 10. FAQ (sem `open` — estado vai para o client)
export const FAQ: { id: string; titulo: string; parags: string[] }[];

// 11. CTA FINAL
export const CTA_FINAL: {
  eyebrow: string; titulo: string; descricao: string;
  ctaPrincipal: CtaBtn; ctaSecundario: CtaBtn;
  separadorAreas: string;
  ctasArea: { rotulo: string; href: string }[]; // 4 áreas
};

// 12. STICKY CTA MOBILE
export const STICKY_CTA: { rotulo: string; href: string };
```

**Mudanças vs. conteúdo atual:**

- `FAQ` perde `open` (estado migra para `FaqAcordeao`).
- `HERO.quicklinks` ganha campo `tipo: "anchor" | "tab"` para distinguir links de âncora dos botões que ativam tab da filterbar.
- Adiciono `TAB_LABELS`, `AREA_LABELS`, `TIPO_LABELS`, `PROGRAMAS_OPTIONS`, `FORMACAO_OPTIONS`, `ATUACAO_OPTIONS`, `SORT_OPTIONS`, `PERPAGE_OPTIONS`, `CONTADORES`, `NOTAS`, `STICKY_CTA`, que hoje estão hard-coded no JSX ou nem existem.
- **Reauditoria dos cards um a um** contra o HTML: validar contagens reais (declaradas no manifesto como "60 + 31 + 31 + 5 frentes" mas só 4 featured + ~39 experts + 5 axis-saúde estão renderizados na grade) e todos os 9 campos `data-*` (`vertical`, `area`, `tipo`, `frente`, `programas`, `formacao`, `atuacao`, `cmsLink`, `nome`).

## 7. Client Components

### 7.1 `FilterBarDocentes.tsx` (~350 linhas)

Componente client que renderiza a filterbar inteira **e** a grade de cards (experts + axis-saúde). Os 4 cards featured ficam **fora** da filterbar (não filtram) — confirmar na implementação lendo o HTML.

```ts
type FiltersState = {
  tab: TabId;
  search: string;
  area: string;
  tipo: string | "";
  programa: string;
  formacao: string;
  atuacao: string;
  sort: "editorial" | "alfa" | "alfa-desc" | "programa" | "area";
  page: number;
  perpage: number;
};

type Props = {
  featured: CardFeatured[];
  experts: CardExpert[];
  axisSaude: CardAxis[];
};

// Estado e derivações
const [filters, setFilters] = useState<FiltersState>(() => readInitialFromURL());
const filteredExperts = useMemo(() => applyFilters(experts, filters), [experts, filters]);
const sortedExperts = useMemo(() => sortCards(filteredExperts, filters.sort), [filteredExperts, filters.sort]);
const paginated = useMemo(() => paginate(sortedExperts, filters.page, filters.perpage), [sortedExperts, filters.page, filters.perpage]);
const tabCounts = useMemo(() => computeTabCounts(experts, filters), [experts, filters]);
const activeChips = useMemo(() => buildChips(filters), [filters]);
```

**Funções-chave (espelham as do JS do protótipo):**

- `matchTab`: especial — `tab === "contratacoes"` filtra por `data-frente === "contratacoes"`; `tab === "gestao-publica"` exclui Contratações; `todos` casa tudo.
- `matchArea`, `matchTipo`, `matchProg` (split por vírgula), `matchForm`, `matchAtuacao` (split por vírgula), `matchSearch` (case-insensitive sobre `name+vertical+area+programas`).
- `sortCards`: 5 modos. Editorial usa `TIPO_ORDER` (curadoria/convidado/consultor/pesquisador). Demais usam `localeCompare`.
- `paginate`: ceil; corrige `page` fora de range.
- `compactRange`: gera `[1, '…', n-1, n, n+1, '…', total]` para botões de paginação.
- `buildChips`: gera lista de chips com `aria-label="Remover filtro X"` e dispatch para `setFilters` que zera o campo.
- `computeTabCounts`: roda os matchers com `tab="todos"` para obter contagens reais por tab; auto-desabilita tabs zeradas (exceto a ativa).
- `clearAll`: reseta todos os campos para estado inicial.
- `activateTab`: atualiza `filters.tab`, foca a tab; em arrow/home/end navega entre tabs.

**Side effects:**

- `useEffect` de URL-sync: chama `window.history.replaceState(null, "", newUrl)` quando `filters` muda. Deliberadamente **não** uso `router.replace` para evitar re-render do server component pai (a URL é estado puramente client desta página).
- `useEffect` de mount: lê `window.location.search` e hidrata `filters`. Registra listener de `popstate`.
- `useEffect` de scroll na paginação: ao mudar de página, rola suave para `#especialistas` com offset de 148px (igual ao protótipo).

**Subcomponentes internos:**

- `<Tabs />` — 5 botões `role="tab"`, keyboard nav (Arrow/Home/End/Enter/Space).
- `<MobileFilterToggle />` — botão que adiciona `.is-open` no wrapper da filterbar; mostra contador de filtros ativos.
- `<SearchInput />` — input controlado com debounce 200ms; botão `×` de limpar.
- `<FilterSelect />` — wrapper de `<select>` para area/tipo/programa/formacao/atuacao/sort/perpage.
- `<AdvancedToggle />` — botão que adiciona `.is-open` na linha avançada.
- `<Chips />` — lista de chips removíveis com `chip-vert-edu|gov|cpr|sau`.
- `<EmptyState />` — mostra quando `total === 0`, com botão "limpar filtros".
- `<Pagination />` — botões com `compactRange`.
- `<ExpertsGrid />` — renderiza `paginated.visible` (experts + axis-saúde quando aplicável).

**Coordenação com o Hero (botões `vertShortcut`):**

Os botões do hero precisam ativar tabs da filterbar. Solução escolhida: criar um `CorpoDocenteContext` (provider montado no `page.tsx`) que expõe `setTab(tabId: TabId): void`. O `FilterBarDocentes` registra o setter no mount; o hero consome o context. Evita event bus global e mantém tipagem.

```ts
// CorpoDocenteContext.tsx (Client)
export const CorpoDocenteContext = createContext<{
  setTab: (id: TabId) => void;
} | null>(null);
```

No `page.tsx`: o `Provider` é montado em volta de Hero + FilterBar (precisa ser client; o page.tsx server faz `<CorpoDocenteProvider>` que internamente é "use client" mas só renderiza `children` e fornece o context).

### 7.2 `FaqAcordeao.tsx` (~50 linhas)

```ts
"use client";
type Props = { items: { id: string; titulo: string; parags: string[] }[] };
const [open, setOpen] = useState<Set<string>>(new Set());
const toggle = (id: string) => setOpen(prev => {
  const next = new Set(prev);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
});
```

Renderiza a estrutura `<section class="docentes-faq">` com `<button class="docentes-faq-toggle" aria-expanded={open.has(item.id)}>` e `<div class="docentes-faq-body">` com `dangerouslySetInnerHTML` em cada parágrafo (para preservar `<em>`, `<strong>` do conteúdo original).

### 7.3 `StickyCtaMobile.tsx` (~40 linhas)

```ts
"use client";
type Props = { rotulo: string; href: string };
const [visible, setVisible] = useState(false);
const [dismissed, setDismissed] = useState(false);
useEffect(() => {
  if (dismissed) return;
  const onScroll = () => setVisible(window.scrollY > 800);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener("scroll", onScroll);
}, [dismissed]);
```

Render: `<div class="sticky-cta-mobile" data-visible={visible}>` com botão dismiss e CTA gold.

### 7.4 `FadeInObserver.tsx` (~30 linhas)

```ts
"use client";
useEffect(() => {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".fade-in").forEach(el => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".fade-in").forEach(el => io.observe(el));
  return () => io.disconnect();
}, []);
return null;
```

## 8. CSS — `corpo-docente-prototipo.css`

Reescrito do zero. Cópia literal dos 2 blocos `<style>` do HTML (linhas 198–1443 e 3061–3068), sem adaptação.

Inclui obrigatoriamente:

- Hero (`.hero-page`, `.hero-page-bg`, `.hero-page-content`, `.hero-quicklinks`).
- Métricas (`.docentes-metrics`, `.docentes-metric`, modificadores `.is-edu/.is-gov/.is-cpr/.is-sau`).
- Manifesto (`.docentes-manifesto`, `.docentes-manifesto-marker`, `.arch-grid`, `.arch-card[data-area]`, `.arch-camadas`, `.arch-camada`, `.arch-callout`, `.arch-nota`).
- Filterbar (`.docentes-filterbar`, `.docentes-filterbar-inner`, `.docentes-tabs-inner`, `.docentes-tab`, `.docentes-tab.is-active`, `.docentes-tab[disabled]`, `.tab-row`, `.tab-count`, `.tab-microcopy`, `.docentes-filters-row.is-primary`, `.docentes-filters-row.is-advanced`, `.docentes-filters-row.is-open`, `.docentes-search`, `.docentes-filter`, `.docentes-advanced-toggle`, `.docentes-filter-clear`, `.docentes-filter-clear.is-hidden`, `.docentes-mobile-filter-toggle`, `.docentes-filterbar.is-open`).
- Chips (`.docentes-chips`, `.docentes-chip`, `.chip-vert-edu/gov/cpr/sau`).
- Empty state (`.docentes-empty`, `.docentes-empty.is-visible`).
- Cards (`.experts-marker`, `.experts-featured`, `.expert-featured-card`, `.efc-portrait`, `.efc-axis-badge`, `.efc-info`, `.efc-tag`, `.efc-credential`, `.efc-meta`, `.efc-link`, `.experts-authority-grid`, `.expert-authority-card`, `.eac-portrait`, `.eac-axis-badge`, `.eac-tipo-tag`, `.eac-info`, `.eac-credential`, `.eac-programs`, `.eac-link`, `.expert-authority-card.is-axis-card`, `.eac-icon-wrap`, `.eac-icon`, `.eac-axis-tag`).
- Counters (`.experts-counters`, `.experts-counter`, `.ec-num`, `.ec-lbl`).
- Paginação (`.docentes-pagination`, `.pg-ellipsis`, `.docentes-pagination button.is-current`).
- Results head (`.docentes-results-head`, `.docentes-results-counter`, `.docentes-perpage`).
- Credibilidade (`.docentes-credibilidade`, `.docentes-credibilidade-inner`, `.credibilidade-grid`, `.credibilidade-item`, `.ci-num`, `.ci-lbl`, `.ci-detail`).
- Credenciamento (`.cta-credenciamento`, `.cta-credenciamento-inner`, `.cta-credenciamento-body`, `.cta-credenciamento-aside`, `.cta-credenciamento-actions`, `.checklist`).
- FAQ (`.docentes-faq`, `.docentes-faq-inner`, `.docentes-faq-head`, `.docentes-faq-item`, `.docentes-faq-item.is-open`, `.docentes-faq-toggle`, `.docentes-faq-icon`, `.docentes-faq-body`).
- CTA Final (`.docentes-cta-final`, `.docentes-cta-final-inner`, `.docentes-cta-final-actions`, `.docentes-cta-final-areas`).
- Sticky CTA mobile (`.sticky-cta-mobile`, `.sticky-cta-mobile.is-visible`, `.sticky-cta-mobile-dismiss`).
- Curadoria pill (`.curadoria-pill`).
- Fade-in (`.fade-in`, `.fade-in.is-visible`).
- Override mobile do CTA Final (`@media (max-width: 899px)` e `@media (max-width: 599px)`).

Tokens (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, `--pergaminho`, `--tinta`, `--grafite`, `--font-serif`, `--font-cond`, `--font-sans`, `--space-*`, `--t-*`, `--shadow-*`) já existem em `home-prototipo.css` — não duplico.

## 9. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa sem erros.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm dev` levantado e mantido no ar.
4. Página servida em `http://localhost:3000/o-grupo/corpo-docente`.
5. **Validação visual feita pelo usuário** comparando lado a lado com `25_Pagina_Corpo_Docente_v1.html` aberto no navegador. Nenhum screenshot automatizado.
6. Smoke functional checklist (executado pelo usuário ou guiado a ele):
   - Clicar 1 tab → cards mudam, contador atualiza, URL ganha `?tab=…`.
   - Digitar 1 termo na busca → debounce 200ms, cards filtram, chip de busca aparece.
   - Abrir filtro avançado → linha extra desce com `.is-open`.
   - Selecionar 1 programa → chip aparece, contador muda.
   - Remover chip via `×` → filtro zera.
   - Clicar "Limpar filtros" → tudo volta ao estado inicial.
   - Recarregar com `?tab=saude&q=APS` na URL → estado hidrata da URL.
   - Abrir/fechar 1 item do FAQ → `is-open` alterna.
   - Em viewport mobile (375px): scroll > 800px → sticky CTA aparece; clicar `×` → some.
   - Paginação: clicar "→" → rola para `#especialistas`, mostra próximos cards.
   - Hero quicklink "Gestão Pública" → ativa tab correspondente da filterbar.

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Re-leitura dos cards introduz divergência com o HTML | Cada card é validado campo-a-campo contra o protótipo. Diff line-by-line antes de commitar. |
| Mudança de SSR → CSR para a grade afeta SEO dos perfis de docentes | Os perfis ainda não têm página individual (todos apontam para `/corpo-docente/[slug]` que não existe). SEO da listagem está mantido (hero + manifesto + FAQ + CTAs são SSR). Quando perfis individuais existirem (sessão futura), eles terão SEO próprio. |
| `window.history.replaceState` pode conflitar com a navegação App Router | Risco baixo: a página é destino final, não middleware. `popstate` é tratado explicitamente. Caso surja conflito, fallback é `router.replace(..., { scroll: false })`. |
| 226 regras de CSS é volume grande para auditoria | Cópia literal: regras são copiadas dos blocos `<style>` inteiros, não reescritas. Comparação `wc -l` antes/depois confirma paridade. |
| Cards featured devem ou não responder a filtros? | Decisão: **featured ficam fora da filterbar** (igual ao HTML — eles estão antes do grid e não têm contador). Confirmar na execução. |

## 11. Fora de escopo

- Página individual de docente (`/corpo-docente/[slug]`) — futura.
- Migração dos dados de cards para Payload CMS — futura (memory `feedback_cms_apenas_quando_pedido.md`).
- Slug `/capacitacao/corpo-docente` — Mapa Página-a-Página coloca em `(o-grupo)`; manter.
- Tracking analytics (`track(...)` do protótipo) — não há sistema de analytics ainda; calls viram no-ops.

## 12. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `writing-plans`).
2. Implementação em commits pequenos (estrutura → CSS → conteúdo → server JSX → FilterBar → FAQ → StickyCta → FadeInObserver).
3. Typecheck + lint + dev server.
4. Checkpoint visual humano.
5. Commit final + atualização de memória se surgirem aprendizados novos.
