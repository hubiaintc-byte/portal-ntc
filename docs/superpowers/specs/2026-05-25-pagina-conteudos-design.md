# Página Conteúdos NTC — Design (porta do HTML)

**Data:** 2026-05-25
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `28_Pagina_Conteudos_v1.html` (~2.775 linhas) para a rota `/conteudos` em um **novo route group** `(conteudos)`. A página é a biblioteca editorial do Grupo NTC — artigos, estudos, notas técnicas, webinars e materiais didáticos produzidos pela curadoria científica das três verticais.

Estrutura editorial densa: 12 seções incluindo 3 destaques editoriais, **9 cards de biblioteca filtrável** (vertical × tipo × busca textual com URL sync), 5 tipos editoriais canônicos, 3 trilhas por vertical, formulário de newsletter "Boletim NTC" com validação inline, 8 FAQs e CTA final de 3 pontes (Agenda / Soluções / Corpo Docente).

Interatividade rica: além do padrão (mega-menu, drawer, fade-in, smooth scroll, FAQ, sticky CTA mobile), a página tem **biblioteca filtrável client-side** (tab por vertical + filtros tipo + busca debounced + URL sync), **subnav sticky** com active anchor highlight, e **newsletter mock** com validação inline (sem POST real — TODO CMS).

Segue a estratégia "porta do HTML" consolidada (CSS literal + `page.tsx` server + `conteudoConteudos.ts` local + 5 client components para interatividade). É a 9ª porta de protótipo do projeto.

## 2. Documentos de referência

- `28_Pagina_Conteudos_v1.html` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota dentro da família Conteúdos.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100%; preservar tags inline.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em `conteudoConteudos.ts`, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- `memory/project_listagem_client_filtros.md` — padrão para listagens com pipeline (já aplicado em Corpo Docente e Agenda).
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `InteracoesScroll` no layout para `.fade-in`.
- Spec irmã: `docs/superpowers/specs/2026-05-24-pagina-agenda-design.md` — referência para pipeline client com URL sync.
- Spec irmã: `docs/superpowers/specs/2026-05-25-pagina-solucoes-design.md` — referência para FAQ acordeão + sticky CTA + estrutura editorial pura.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (conteudos)/                          ← NOVO route group
│   ├── layout.tsx                        ← HeaderHome + FooterHome + InteracoesScroll
│   └── conteudos/
│       ├── page.tsx                      ← server, JSX literal das 12 seções
│       ├── conteudoConteudos.ts          ← tipos + textos (hero, métricas, manifesto, tese 3 pilares, 3 destaques, 9 biblio cards, 5 tipos, 3 verticais, newsletter, 8 FAQs, CTA 3 pontes, sticky)
│       ├── SubnavSticky.tsx              ← client: sticky toggle + active anchor highlight
│       ├── BibliotecaConteudos.tsx       ← client: tabs vertical (5) + tipo (6) + busca debounced (180ms) + URL sync + counter + empty state
│       ├── NewsletterForm.tsx            ← client: validação inline (nome+email+consent) + mensagens ok/err + track
│       ├── FaqAcordeao.tsx               ← client: 8 itens fechados, Set<string>
│       └── StickyCtaConteudos.tsx        ← client: scroll listener (rAF) + dismiss local + CTA → #newsletter
└── conteudos-prototipo.css               ← CSS literal do <style> do HTML (~1.246 linhas)
```

`apps/web/app/layout.tsx` (root) passa a importar `conteudos-prototipo.css` na mesma posição dos outros CSSs de protótipo (após `solucoes-prototipo.css`).

**Decisões fixadas:**

- Rota: `/conteudos` (raiz, sem prefixo).
- Layout do novo route group `(conteudos)` reaproveita `HeaderHome` + `FooterHome` + `InteracoesScroll` do `(home)`.
- `revalidate = 3600` no `page.tsx`.
- Track no-op compartilhado: copiar inline em cada client component (YAGNI).
- Newsletter form: mock client-side (sem POST real). Stub `track()` mantém call sites prontos para futura integração CMS/Resend.

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">`, linhas 1551-2295):

1. **Hero institucional slim** (`.hero-page`) — crumb (Grupo NTC > Conteúdos institucionais), eyebrow light "Biblioteca editorial · 2026", h1 com `<span class="accent">institucional</span><br>`, sub, 5 quicklinks (Destaques / Biblioteca / Tipos / Verticais / Newsletter).
2. **Faixa de métricas editoriais** (`.cont-metrics`) — 5 métricas (Editorial / Em expansão / Replays / 3 verticais / Progressivo). Cada métrica: `cm-num` (alguns com `cm-num--word`), `cm-lbl`, `cm-detail`.
3. **`<SubnavSticky />`** (`<nav class="cont-subnav" id="contSubnav">`) — label "Nesta página" + 6 âncoras (Destaques / Biblioteca / Tipos editoriais / Verticais / Newsletter / FAQ).
4. **Manifesto editorial** (`.cont-manifesto`) — eyebrow gold + h2 com `<em>publicação institucional</em>` + lede + parágrafo + marker.
5. **Faixa tese editorial** (`.cont-thesis`) — head (eyebrow + h2 + parágrafo) + grid 3 pilares (I Pesquisa aplicada / II Posição técnica / III Formação continuada).
6. **3 destaques editoriais** (`.cont-featured` id=`destaques`) — head + grid 3 cards. Cada card: `data-vert`, figura com `background-image` inline + tag, body (eyebrow + h3 + descrição + meta 3 itens + tag "Em breve · curadoria em andamento").
7. **`<BibliotecaConteudos cards={CARDS_BIBLIOTECA} />`** (`.cont-biblioteca` id=`biblioteca`) — head com note "Acervo em construção", tabs vertical, filterbar (busca + tipos + counter dinâmico), grid 9 cards, empty state, footer com CTA "Receber por e-mail".
8. **5 tipos editoriais** (`.cont-tipos` id=`tipos`) — head + grid 5 cards (Artigos / Estudos / Notas técnicas / Webinars / Materiais didáticos). Cada um: `cont-tipo-num` (01-05), h3, descrição, `cont-tipo-tag`.
9. **Curadoria por vertical** (`.cont-verticais` id=`verticais`) — head + grid 3 cards (Educação / Gestão Pública / Saúde). Cada um: `data-vert`, banda (mark + num), body (h3 + descrição + lista 3 itens com `<strong>` + link-arrow para vertical).
10. **`<NewsletterForm />`** (`.cont-newsletter` id=`newsletter`) — bloco texto (eyebrow gold + h2 + 2 parágrafos + 4 pills) + form com 4 campos (nome, email, vertical select 5 opções, orgão opcional) + checkbox consent (com link LGPD) + botão + 2 divs ok/err.
11. **`<FaqAcordeao itens={FAQ_CONTEUDOS} />`** (`.cont-faq` id=`faq`) — head + 8 perguntas (todas fechadas inicialmente). Respostas com `<a>` inline e `<strong>`.
12. **CTA final 3 pontes** (`.cont-cta-final` id=`cta-final`) — eyebrow gold + h2 + parágrafo + grid 3 cards (Agenda formativa / Contratação institucional / Curadoria científica), cada um com link-arrow para rota correspondente.

Fora do `<main>`: `<StickyCtaConteudos />` (`.sticky-cta-mobile` id=`stickyCta`).

## 5. Estrutura do `conteudoConteudos.ts`

Tipos e exports (sketch):

```ts
// ----------------- Slugs -----------------

export type VerticalConteudo = "edu" | "gov" | "sau" | "trans";
export type TipoConteudo = "artigo" | "estudo" | "nota" | "webinar" | "material";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  classe?: string;
  arrow?: boolean;
}

// ----------------- HERO -----------------

export interface CrumbItem { texto: string; href?: string; current?: boolean; }

export const HERO_CONTEUDOS = {
  crumb: CrumbItem[];
  eyebrow: string; // "Biblioteca editorial · 2026"
  tituloHtml: string; // "A inteligência <span class=\"accent\">institucional</span><br>do Grupo NTC, em circulação."
  sub: string;
  quicklinks: LinkInterno[]; // 5
};

// ----------------- MÉTRICAS (5) -----------------

export interface MetricaConteudo {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}
export const METRICAS_CONTEUDO: MetricaConteudo[]; // 5

// ----------------- SUBNAV -----------------

export const SUBNAV_LINKS: LinkInterno[]; // 6 — Destaques / Biblioteca / Tipos editoriais / Verticais / Newsletter / FAQ

// ----------------- MANIFESTO -----------------

export const MANIFESTO_CONTEUDOS = {
  eyebrow: string;
  tituloHtml: string;
  lede: string;
  paragrafo: string;
  marker: string;
};

// ----------------- TESE EDITORIAL (3 pilares) -----------------

export interface PilarTese {
  num: string; // I, II, III
  titulo: string;
  descricao: string;
  rule: string;
}
export const TESE_HEAD = { eyebrow, tituloHtml, descricao };
export const TESE_PILARES: PilarTese[]; // 3

// ----------------- 3 DESTAQUES -----------------

export interface CardDestaque {
  vert: VerticalConteudo;
  imagemUrl: string;
  tipoTag: string; // "Estudo" / "Artigo" / "Webinar"
  prep: string; // "Em preparação editorial"
  eyebrow: string; // "NTC Gestão Pública · Contratações"
  titulo: string;
  descricao: string;
  meta: [string, string, string];
  soonTag: { texto: string; cmsLink: string };
}
export const DESTAQUES_HEAD = { eyebrow, tituloHtml, intro };
export const DESTAQUES: CardDestaque[]; // 3

// ----------------- BIBLIOTECA (9 cards) -----------------

export interface CardBiblioteca {
  vert: VerticalConteudo;
  tipo: TipoConteudo;
  search: string; // espaço-separadas
  verticalLabel: string; // "NTC Gestão Pública"
  tipoLabel: string; // "Estudo"
  prep: string;
  titulo: string;
  descricao: string;
  meta: [string, string]; // ["Previsto · 2026", "Formato longo"]
  authorPrefix: string; // "Curadoria"
  authorBold: string; // "NTC Gestão Pública"
  linkSoon: { texto: string; cmsLink: string }; // "Em breve"
}
export const BIBLIOTECA_HEAD = { eyebrow, tituloHtml, intro, note };
export const TABS_VERTICAL: { value: "all" | VerticalConteudo; label: string }[]; // 5
export const FILTROS_TIPO: { value: "all" | TipoConteudo; label: string }[]; // 6
export const CARDS_BIBLIOTECA: CardBiblioteca[]; // 9
export const BIBLIOTECA_EMPTY: string; // "Nenhum conteúdo encontrado..."
export const BIBLIOTECA_FOOTER = { nota: string; cta: LinkInterno };

// ----------------- 5 TIPOS EDITORIAIS -----------------

export interface TipoEditorial {
  num: string; // 01-05
  titulo: string;
  descricao: string;
  tag: string;
}
export const TIPOS_HEAD = { eyebrow, tituloHtml, intro };
export const TIPOS_EDITORIAIS: TipoEditorial[]; // 5

// ----------------- CURADORIA POR VERTICAL (3) -----------------

export interface VertCard {
  vert: "edu" | "gov" | "sau";
  bandMark: string; // "NTC Educação"
  bandNum: string; // "01"
  titulo: string;
  descricao: string;
  lista: string[]; // 3 itens com <strong> inline → render via dangerouslySetInnerHTML em <li>
  link: LinkInterno;
}
export const VERTICAIS_HEAD = { eyebrow, tituloHtml, intro };
export const VERT_CARDS: VertCard[]; // 3

// ----------------- NEWSLETTER -----------------

export const NEWSLETTER_TEXT = {
  eyebrow: string;
  tituloHtml: string; // "Receba a inteligência <em>editorial</em> da NTC<br>direto na sua caixa."
  paragrafosHtml: string[]; // 2, com <strong>
  pills: string[]; // 4
};
export const NEWSLETTER_FORM = {
  labels: { nome: "Nome completo", email: "E-mail institucional", vertical: "Vertical de interesse", orgao: "Órgão ou instituição" };
  placeholders: { nome, email, orgao };
  verticais: { value: string; label: string }[]; // 5
  consentHtml: string; // texto + <a href="/lgpd">Política de Privacidade · LGPD</a>
  botaoTexto: string; // "Assinar o Boletim NTC"
  msgOk: string; // "Inscrição realizada. Confirme no e-mail que enviaremos a seguir."
  msgErr: string; // "Verifique os campos obrigatórios."
};

// ----------------- FAQ (8) -----------------

export interface ItemFaq {
  id: string;
  pergunta: string;
  respostaHtml: string; // com <strong> e <a>
}
export const FAQ_HEAD = { eyebrow, tituloHtml, intro };
export const FAQ_CONTEUDOS: ItemFaq[]; // 8

// ----------------- CTA FINAL (3 pontes) -----------------

export interface PonteCta {
  ponte: "agenda" | "solucoes" | "docentes";
  eyebrow: string;
  titulo: string;
  descricao: string;
  link: LinkInterno;
}
export const CTA_FINAL_HEAD = { eyebrow, tituloHtml, intro };
export const CTA_FINAL_PONTES: PonteCta[]; // 3

// ----------------- STICKY -----------------

export const STICKY_CTA_CONTEUDOS = {
  cta: { texto: "Assinar Boletim NTC", href: "#newsletter", cmsLink: "cta-newsletter-sticky", track: "cont_sticky_cta", arrow: true };
};
```

**Fidelidade:** todas as 12 seções lidas do HTML linha a linha (linhas 1551-2295). Inline tags `<em>`, `<strong>`, `<br>`, `<a>` preservadas. `data-cms-link`, `data-track`, `data-vert`, `data-type`, `data-search` literais. Imagens `background-image:url('./img/...')` no inline style dos destaques convertidas para `/img/`.

## 6. Client components

### 6.1. `SubnavSticky.tsx`

Recebe `links: LinkInterno[]` e `label: string`. Estado: `{ sticky, activeId }`.

- `useEffect` mount: query `<nav id="contSubnav">`, mede `offsetTop`, query seções via `document.querySelector(link.href)`.
- Listener `scroll` (passive): toggle `sticky = scrollY >= subnavTop`; computa `activeId` comparando `getBoundingClientRect().top - (headerH + subnavH + 24)` com 0.
- Listener `resize` re-chama `onScroll`.
- Cleanup remove ambos.
- Renderiza `<nav class="cont-subnav{is-sticky?}" id="contSubnav">` com label + 6 `<a>` recebidos via props; cada `<a>` ganha `is-active` se `link.href === '#' + activeId`.

### 6.2. `BibliotecaConteudos.tsx`

Recebe `cards: CardBiblioteca[]` + `tabsVertical` + `filtrosTipo` + textos.

- Estado: `{ vert: "all" | VerticalConteudo, tipo: "all" | TipoConteudo, busca: string, buscaLocal: string }`.
- Debounce 180ms: `setBusca(buscaLocal)` após delay, mesmo padrão da agenda.
- Função pura `norm(s)` (lowercase + NFD strip diacritics) para busca.
- `useMemo` filtra todos cards por (vert match || "all") && (tipo match || "all") && (norm busca < 2 chars || norm haystack includes norm q).
- URL sync: `useEffect([state])` escreve `?vertical=&tipo=&q=` (defaults `all/all/empty` omitidos).
- Hidratação: `useEffect([])` lê querystring, valida contra opções permitidas, aplica ao estado + buscaLocal.
- Renderiza tabs (5 botões com `is-active` + `aria-selected`), filterbar (search input + 6 tipo buttons + `<strong>{count}</strong> conteúdos em preparação`), grid 9 cards (cada um com markup literal — não filtramos via classe `is-hidden`; usamos `cards.filter` no useMemo e renderizamos só visíveis, OU mantemos todos no DOM com `is-hidden` para preservar paridade visual com o protótipo).

**Decisão preliminar:** seguir abordagem do protótipo — manter todos no DOM com classe `is-hidden` aplicada via `style.display` ou className condicional. Vantagem: zero re-mount, animações `.fade-in` rodam só na 1ª render. Implementar com `className={shown.includes(card) ? '' : 'is-hidden'}` em cada `<article>`.

### 6.3. `NewsletterForm.tsx`

Estado: `{ status: "idle" | "ok" | "err" }`.

Submit handler:
- `e.preventDefault()`.
- Lê `formData`: nome.trim(), email.trim(), vertical, orgao.trim(), consent.
- Valida: nome != "", email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, consent === true.
- Inválido: `setStatus("err")` + `track("cont_newsletter_error", { hasName, validEmail, consent })`.
- Válido: `setStatus("ok")` + `track("cont_newsletter_subscribe", { vertical, hasOrg })` + `form.reset()`.

Renderiza `<form noValidate>` com 4 campos + checkbox + botão + 2 divs de mensagem (`is-visible` quando `status === "ok" | "err"` respectivamente). Consent text via `dangerouslySetInnerHTML` (contém `<a>` para `/lgpd`).

### 6.4. `FaqAcordeao.tsx`

Idêntico ao de `/solucoes` mas adaptado às classes `.cont-faq-item`, `.cont-faq-toggle`, `.cont-faq-body`, `.cont-faq-body-inner`, `.cont-faq-icon`. Set<string> com ids abertos (vazio inicial). Resposta via `dangerouslySetInnerHTML`. Track `cont_faq_toggle` em cada toggle.

### 6.5. `StickyCtaConteudos.tsx`

Idêntico ao de `/solucoes`. CTA → `#newsletter`. Track `cont_sticky_cta_dismissed`.

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas 138-1382, ~1.246 linhas), copiado sem adaptação. Tokens base vêm de `home-prototipo.css` — não duplicar.

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`).

**Classes principais:**
- `.hero-page`, `.hero-page-bg`, `.hero-page-content`, `.crumb`, `.eyebrow.light/.gold`, `.accent`, `.hero-page-sub`, `.hero-quicklinks`
- `.cont-metrics`, `.cont-metrics-grid`, `.cont-metric`, `.cm-num` (+ `.cm-num--word`), `.cm-lbl`, `.cm-detail`
- `.cont-subnav` (+ `.is-sticky`), `.cont-subnav-inner`, `.cont-subnav-label`, subnav `<a>` (+ `.is-active`)
- `.cont-manifesto`, `.cont-manifesto-inner`, `.cont-manifesto-marker`, `.lede`
- `.cont-thesis`, `.cont-thesis-inner`, `.cont-thesis-head`, `.cont-thesis-grid`, `.cont-thesis-pilar`, `.cont-thesis-num`, `.cont-thesis-rule`
- `.cont-featured`, `.cont-featured-list`, `.cont-featured-card`, `.cont-featured-figura`, `.cont-featured-figura-tag`, `.cont-featured-body`, `.cont-featured-prep`, `.cont-featured-eyebrow`, `.cont-featured-meta`, `.cont-featured-soon`
- `.cont-biblioteca`, `.cont-biblioteca-note`, `.cont-tabs`, `.cont-tab` (+ `.is-active`), `.cont-filterbar`, `.cont-search`, `.cont-typefilter`, `.cont-filterbar-stats`, `.cont-grid`, `.cont-card`, `.cont-card-band`, `.cont-card-body`, `.cont-card-tags`, `.cont-card-tag` (+ `.type`), `.cont-card-prep`, `.cont-card-meta`, `.cont-card-foot`, `.author`, `.cont-card-link` (+ `.is-soon`), `.cont-empty` (+ `.is-visible`), `.is-hidden`, `.cont-biblioteca-foot`
- `.cont-tipos`, `.cont-tipos-grid`, `.cont-tipo`, `.cont-tipo-num`, `.cont-tipo-tag`
- `.cont-verticais`, `.cont-verticais-grid`, `.cont-vert-card`, `.cont-vert-band`, `.cont-vert-band-mark`, `.cont-vert-band-num`, `.cont-vert-body`, `.cont-vert-list`
- `.cont-newsletter`, `.cont-newsletter-inner`, `.cont-newsletter-text`, `.cont-newsletter-pillars`, `.cont-newsletter-pill`, `.cont-newsletter-form`, `.cont-newsletter-form-row`, `.cont-newsletter-consent`, `.cont-newsletter-msg` (+ `.success`/`.error`/`.is-visible`)
- `.cont-faq`, `.cont-faq-list`, `.cont-faq-item`, `.cont-faq-toggle`, `.cont-faq-icon`, `.cont-faq-body`, `.cont-faq-body-inner`
- `.cont-cta-final`, `.cont-cta-final-inner`, `.cont-cta-final-grid`, `.cont-cta-final-card`, `.link-arrow.light`
- `.sticky-cta-mobile` (+ `.is-visible`), `.sticky-cta-mobile-dismiss`

## 8. Validação

Padrão consolidado:

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm build` passa e rota `/conteudos` é gerada como estática.
4. `pnpm next dev --port 3000` levantado.
5. `curl -sI http://localhost:3000/conteudos` retorna 200.
6. **Validação visual humana** lado a lado com `28_Pagina_Conteudos_v1.html`.
7. Smoke functional checklist:
   - [ ] Header/footer (mega-menu, drawer, fade-in, smooth scroll já globais).
   - [ ] Hero com crumb, eyebrow light, h1 com accent, 5 quicklinks.
   - [ ] 5 métricas (Editorial / Em expansão / Replays / 3 verticais / Progressivo).
   - [ ] **Subnav sticky:** ao rolar, recebe classe `is-sticky` quando passa do topo original; ao continuar rolando, link da seção ativa recebe `is-active`.
   - [ ] Manifesto + tese editorial (3 pilares I/II/III).
   - [ ] 3 destaques editoriais com figura background, eyebrow vertical, h3, meta, tag "Em breve".
   - [ ] **Biblioteca filtrável:** 9 cards visíveis por padrão; tab "Educação" reduz para 3 (cards `data-vert="edu"`); filtro tipo "Webinars" reduz mais; busca "lei 14133" mostra só card EV01 (estudo de Lei 14.133); counter atualiza; URL muda para `?vertical=edu&tipo=webinar&q=lei`; reload preserva estado.
   - [ ] Empty state aparece quando 0 resultados; CTA "Receber por e-mail" leva para `#newsletter`.
   - [ ] 5 tipos editoriais (Artigos / Estudos / Notas / Webinars / Materiais).
   - [ ] Curadoria por vertical (3 cards: Educação 01 / Gestão Pública 02 / Saúde 03).
   - [ ] **Newsletter form:** submit vazio → mensagem err; submit com nome+email válido+consent → mensagem ok + form resetado. Link LGPD funcional.
   - [ ] FAQ 8 itens (todos fechados inicialmente); click expande/colapsa.
   - [ ] CTA final 3 pontes (Agenda / Soluções / Corpo Docente) com links funcionais.
   - [ ] Sticky mobile CTA aparece após scroll > 800px; `×` esconde; CTA leva para `#newsletter`.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| 9 cards de biblioteca densos em conteúdo (`data-search`, `data-vert`, `data-type`, autor, etc.). | Modelar `CardBiblioteca` com todos os campos. Ler cada card do HTML literalmente (linhas 1779-1966). |
| Newsletter form com 4 campos + select + checkbox + 2 mensagens. | Stateless além de `status`. Validação inline pura, sem libs externas. Form HTML5 com `required` desabilitado (`noValidate`) — validação totalmente em JS. |
| Biblioteca usa estratégia "all in DOM with .is-hidden" no protótipo. | Manter mesma estratégia para preservar paridade com CSS (`.cont-card.is-hidden { display: none }` — verificar no CSS portado). Não filtrar via React `cards.filter` se isso quebrar a paridade visual. **Confirmar no CSS após extração** se `.is-hidden` realmente esconde. Se sim, aplicar via `className`; se não, usar `cards.filter` no useMemo. |
| Subnav sticky precisa medir `offsetTop` na 1ª render. | `useEffect` mount-only para medir; `onScroll` lê valor cached. Re-mede em `resize`. |
| Hrefs internos do protótipo (`./12_Pagina_Contato_v1.html#tab-atendimento`, `./09_Pagina_Agenda_v2.html`, `./26_Pagina_Solucoes_v1.html`, `./25_Pagina_Corpo_Docente_v1.html`, `./33_Pagina_LGPD_v1.html`, `./07_Pagina_Vertical_NTC_*.html`). | Atualizar para `/contato`, `/agenda`, `/solucoes`, `/o-grupo/corpo-docente`, `/lgpd`, `/solucoes-estrategicas/<slug>`. Para `#tab-atendimento` e `#eventon` (que não existem nas rotas atuais): apontar para `/contato` / `/o-grupo#eventon` literal com TODO comentado. |
| Mismatch SSR/CSR no Subnav (sticky toggle depende de scroll). | Renderizar SSR sem `is-sticky`; toggle só após mount. Aceitar 1ª pintura sem sticky. |
| Form submit aciona navegação se `e.preventDefault()` falhar. | `noValidate` + `e.preventDefault()` na handler. Type-safe via `React.FormEvent<HTMLFormElement>`. |

## 10. Fora de escopo

- Páginas individuais de conteúdo (`/conteudos/[slug]`). Cards mostram "Em breve" — TODOs preservados.
- Integração real de analytics (GA4/Mixpanel). `track()` permanece no-op.
- POST real do newsletter para API ou CMS. Form é mock client-side.
- Integração com Resend para confirmação de email.
- Coleção `Conteudo` no Payload — Janela de CMS futura.
- Internacionalização.
- Tests automatizados.
- Mega-menu/drawer não tem item "Conteúdos" ainda. **Atualização lateral pós-porta:** verificar se mega-menu do HeaderHome.tsx precisa ganhar item "Conteúdos" → `/conteudos`. Por ora, assumir que isso fica para sessão posterior.

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos:
   - estrutura (CSS + import root + layout route group)
   - conteúdo (`conteudoConteudos.ts` em 2-3 commits: tipos+head sections, biblioteca, FAQs+CTA+sticky)
   - 5 client components (Subnav, Biblioteca, Newsletter, Faq, Sticky)
   - server JSX (`page.tsx`)
   - validação (build + dev + checkpoint humano)
3. Typecheck + lint + build + dev server.
4. Checkpoint visual humano lado a lado com `28_Pagina_Conteudos_v1.html`.
5. Move do protótipo para `feito/` após aprovação.
6. Commit final + atualização de memória se surgirem aprendizados novos.
