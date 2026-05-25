# Página Capacitação — Design (porta do HTML)

**Data:** 2026-05-25
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `27_Pagina_Capacitacao_v1.html` (2.779 linhas) para a rota `/capacitacao` no route group `(capacitacao)`. A página é a **mãe do ecossistema formativo do Grupo NTC** — explica modalidades, formatos, eixos, curadoria, EventOn, próximos eventos abertos e caminhos de participação para servidor individual e órgão público.

Estrutura editorial densa: 16 seções incluindo 5 métricas, subnav sticky com 6 âncoras, 3 pilares, 3 verticais formativas (cada uma com 3–4 programas linkados), 4 modalidades, comparativo Capacitação vs Soluções, 3 formatos, 5 eixos transversais, curadoria científica, plataforma EventOn (4 features), 6 próximos eventos filtrados por vertical, 2 caminhos de participação (servidor vs instituição), 8 FAQs, CTA final 3 cards-ponte por vertical.

Interatividade portada: subnav sticky com active anchor, microfiltros de próximos eventos (4 filtros × 6 cards `data-vert`), FAQ accordion (8 itens), sticky CTA mobile. Padrão idêntico ao consolidado em `/conteudos` e `/solucoes`.

Esta é a **10ª porta de protótipo** do projeto. Route group `(capacitacao)` já existe (atende `/capacitacao/agenda`); apenas reaproveita o `layout.tsx` existente — não criar outro.

## 2. Documentos de referência

- `27_Pagina_Capacitacao_v1.html` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `InteracoesScroll` já está no layout do route group `(capacitacao)`.
- Spec irmã: `docs/superpowers/specs/2026-05-25-pagina-conteudos-design.md` — referência para subnav sticky + FAQ + sticky CTA.
- Spec irmã: `docs/superpowers/specs/2026-05-25-pagina-solucoes-design.md` — referência para estrutura editorial pura.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (capacitacao)/                         ← route group já existente
│   ├── layout.tsx                         ← já existe; reaproveitado
│   ├── agenda/                            ← já existe; intocado
│   └── capacitacao/                       ← NOVO
│       ├── page.tsx                       ← server, JSX literal das 16 seções
│       ├── conteudoCapacitacao.ts         ← tipos + textos (hero, métricas, pilares, 3 verticais, 4 modalidades, vs-solucoes, 3 formatos, 5 eixos, curadoria, eventon, 6 eventos, 2 caminhos, 8 FAQs, CTA final 3 cards, sticky)
│       ├── SubnavStickyCapacitacao.tsx    ← client: sticky toggle + active anchor (rAF throttle)
│       ├── ProximosEventosFiltro.tsx      ← client: 4 filtros tab + 6 cards `data-vert` (all in DOM com is-hidden) + counter via track()
│       ├── FaqCapacitacao.tsx             ← client: 8 itens, Set<string>, dangerouslySetInnerHTML
│       └── StickyCtaCapacitacao.tsx       ← client: scroll listener (rAF) + dismiss local
└── capacitacao-prototipo.css              ← CSS literal do <style> (linhas 156-1448, ~1.293 linhas)
```

`apps/web/app/layout.tsx` (root) passa a importar `capacitacao-prototipo.css` na mesma posição dos outros CSSs de protótipo (após `conteudos-prototipo.css`).

**Decisões fixadas:**

- Rota: `/capacitacao`.
- Layout do route group `(capacitacao)` **já existente** — reaproveitar sem modificar.
- `revalidate = 3600` no `page.tsx`.
- Track no-op compartilhado: copiar inline em cada client component (YAGNI; padrão estabelecido).
- Próximos eventos é mock client-side — sem POST real. Cards são 6 itens estáticos da `conteudoCapacitacao.ts`.
- Mega-menu e drawer: já globais no `HeaderHome.tsx` — não duplicar.

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">`, linhas 1619-2403):

1. **Hero institucional slim** (`.hero-page`) — crumb (Grupo NTC > Capacitação institucional), eyebrow light "Ecossistema formativo · 2026", h1 com `<span class="accent">de alto nível</span><br>`, sub, 5 quicklinks (Verticais / Modalidades / Formatos / Curadoria / Agenda).
2. **Faixa de métricas** (`.cap-metrics`) — 5 cards (20+ Anos / 15 Programas / 500+ Eventos / 400 mil+ Agentes / Alta Satisfação `cm-num--word`).
3. **`<SubnavStickyCapacitacao />`** (`.cap-subnav` id=`capSubnav`) — label "Nesta página" + 6 âncoras (Verticais / Modalidades / Formatos / Curadoria / EventOn / Agenda → `#proximos`).
4. **Manifesto editorial** (`.cap-manifesto`) — eyebrow gold + h2 com `<em>formação de Estado</em>` + lede + parágrafo com `<strong>` + marker.
5. **Pilares editoriais** (`.cap-pilares`) — head + 3 pilares (I Programas estratégicos / II Curadoria científica / III Entrega institucional).
6. **3 verticais formativas** (`.cap-verticais` id=`verticais`) — head + 3 cards (`data-vert` edu/gov/sau). Cada um: banda mark+num, h3, descrição, contagem, lista com 3-4 programas (cada item com `<strong>` + `<span>` e link), link "Conhecer a vertical".
7. **4 modalidades** (`.cap-modalidades` id=`modalidades`) — head + 4 cards numerados (01–04: Eventos abertos / In company / Turmas fechadas / Sob medida e trilhas). Cada um: descrição, lista 4 itens, aside `<strong>Contratação:</strong>` + texto, link.
8. **Capacitação vs Soluções** (`.cap-vs-solucoes`) — sem head; grid 2 colunas (`.cap-vs-cell` `data-tipo="cap"` e `"sol"`). Cada uma: eyebrow + h3 + parágrafo com `<strong>` + link.
9. **3 formatos** (`.cap-formatos` id=`formatos`) — head com eyebrow light + 3 cards (01 Online / 02 Híbrido / 03 Presencial). Cada um: estrutura `.cap-formato-numeral` (num + num-rule + num-tag "Formato"), h3, descrição, tag. Sem links.
10. **5 eixos formativos transversais** (`.cap-eixos` id=`eixos`) — layout especial com `<aside class="cap-eixos-aside">` lateral (eyebrow + h2 com `<em>` + 2 parágrafos, o 2º com classe `impact`) + `<ol class="cap-eixos-list">` com 5 itens numerados (01–05).
11. **Curadoria científica** (`.cap-curadoria` id=`curadoria`) — `.cap-curadoria-text` (eyebrow + h2 com `<em>` + 2 parágrafos) + `.cap-curadoria-pills` (4 pills: Educação/Gestão Pública/Contratações Públicas/Saúde) + `.cap-curadoria-cta` (2 botões) + `.cap-curadoria-figura` (div decorativo aria-hidden).
12. **EventOn** (`.cap-eventon` id=`eventon`) — `.cap-eventon-text` (eyebrow light + h2 com `<em>` + 2 parágrafos com `<strong>`) + `.cap-eventon-cta` (2 botões) + `.cap-eventon-features` (4 features `<strong>` + `<span>`).
13. **`<ProximosEventosFiltro />`** (`.cap-proximos` id=`proximos`) — head + selo + 4 filtros (`all`/`edu`/`gov`/`sau`) + grid 6 cards `.cap-evento-card`. Cada card: eyebrow, h3 com `.ev-prefix` span, meta (data + formato + local), descrição, preço, CTA. Footer com botão "Ver agenda completa".
14. **2 caminhos** (`.cap-caminhos` id=`caminhos`) — head + 2 blocos `.cap-caminho` (`data-tipo` participante/instituicao). Cada um: eyebrow, h3, descrição, lista de 4 passos numerados (cada passo: title + sub), CTA.
15. **`<FaqCapacitacao />`** (`.cap-faq` id=`faq`) — head + 8 perguntas (todas fechadas inicialmente). Respostas multi-parágrafo com `<strong>` e `<a>` inline (FAQ 4 e 6 têm links para `/solucoes` e `/lgpd`).
16. **CTA final** (`.cap-cta-final` id=`cta-final`) — eyebrow gold + h2 com `<em>` + parágrafo + `.cap-cta-final-btns` (3 botões: Solicitar proposta gold / Ver agenda ghost-light / Conhecer corpo docente ghost-light) + `.cap-cta-final-verticais` (3 cards-ponte edu/gov/sau cada um com eyebrow + h4 + descrição + link-arrow).

Fora do `<main>`: **`<StickyCtaCapacitacao />`** (`.sticky-cta-mobile` id=`stickyCta`).

## 5. Estrutura do `conteudoCapacitacao.ts`

Tipos e exports (sketch):

```ts
// ----------------- Slugs -----------------

export type VerticalCapacitacao = "edu" | "gov" | "sau";
export type TipoVsBlock = "cap" | "sol";
export type CaminhoTipo = "participante" | "instituicao";

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

export const HERO_CAPACITACAO = {
  crumb: CrumbItem[];                       // 2 itens
  eyebrow: string;                          // "Ecossistema formativo · 2026"
  tituloHtml: string;                       // com <span class="accent"> e <br>
  sub: string;
  quicklinks: LinkInterno[];                // 5
};

// ----------------- MÉTRICAS (5) -----------------

export interface MetricaCap {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}
export const METRICAS_CAP: MetricaCap[];     // 5

// ----------------- SUBNAV -----------------

export interface SubnavLink { texto: string; href: string; cmsLink: string; }
export const SUBNAV_LABEL: string;            // "Nesta página"
export const SUBNAV_LINKS: SubnavLink[];      // 6

// ----------------- MANIFESTO -----------------

export const MANIFESTO_CAP = {
  eyebrow: string;
  tituloHtml: string;
  lede: string;
  paragrafoHtml: string;                      // contém <strong>
  marker: string;
};

// ----------------- PILARES (3) -----------------

export interface PilarCap {
  num: string;                                // "I" / "II" / "III"
  titulo: string;
  descricao: string;
  rule: string;
}
export const PILARES_HEAD = { eyebrow, tituloHtml, descricao };
export const PILARES_CAP: PilarCap[];         // 3

// ----------------- 3 VERTICAIS -----------------

export interface VerticalItemPrograma {
  textoHtml: string;                          // "<strong>PEAR</strong><span>Alfabetização</span>"
  href: string;                               // mapeado para /programas/<slug>
  cmsLink: string;
}

export interface CardVerticalCap {
  vert: VerticalCapacitacao;
  bandMark: string;
  bandNum: string;
  titulo: string;
  descricao: string;
  contagem: string;                           // "9 programas estratégicos"
  programas: VerticalItemPrograma[];          // 3-4 itens
  link: LinkInterno;
}
export const VERTICAIS_HEAD = { eyebrow, tituloHtml, intro };
export const CARDS_VERTICAIS_CAP: CardVerticalCap[];  // 3

// ----------------- 4 MODALIDADES -----------------

export interface ModalidadeCap {
  num: string;                                // "01"-"04"
  titulo: string;
  descricao: string;
  lista: string[];                            // 4 itens
  contratacaoHtml: string;                    // <strong>Contratação:</strong> ...
  link: LinkInterno;
}
export const MODALIDADES_HEAD = { eyebrow, tituloHtml, intro };
export const MODALIDADES: ModalidadeCap[];    // 4

// ----------------- CAPACITAÇÃO VS SOLUÇÕES -----------------

export interface VsBlock {
  tipo: TipoVsBlock;
  eyebrow: string;
  titulo: string;
  paragrafoHtml: string;                      // contém <strong>
  link: LinkInterno;
}
export const VS_BLOCOS: VsBlock[];            // 2

// ----------------- 3 FORMATOS -----------------

export interface FormatoCap {
  num: string;                                // "01"-"03"
  titulo: string;
  descricao: string;
  tag: string;
}
export const FORMATOS_HEAD = { eyebrow, tituloHtml, intro };
export const FORMATOS: FormatoCap[];          // 3

// ----------------- 5 EIXOS -----------------

export interface EixoCap {
  num: string;
  titulo: string;
  descricao: string;
}
export const EIXOS_ASIDE = {
  eyebrow: string;
  tituloHtml: string;                         // com <em>
  paragrafo1: string;
  paragrafo2: string;                         // classe .impact
};
export const EIXOS: EixoCap[];                // 5

// ----------------- CURADORIA -----------------

export const CURADORIA_TEXT = {
  eyebrow: string;
  tituloHtml: string;
  paragrafo1: string;
  paragrafo2: string;
};
export const CURADORIA_PILLS: string[];       // 4
export const CURADORIA_CTAS: LinkInterno[];   // 2

// ----------------- EVENTON -----------------

export const EVENTON_TEXT = {
  eyebrow: string;                            // light
  tituloHtml: string;                         // com <em>
  paragrafo1Html: string;                     // com <strong>
  paragrafo2Html: string;                     // com <strong>
};
export const EVENTON_CTAS: LinkInterno[];     // 2
export interface EventonFeature { strong: string; span: string; }
export const EVENTON_FEATURES: EventonFeature[];  // 4

// ----------------- 6 PRÓXIMOS EVENTOS -----------------

export interface EventoCap {
  vert: VerticalCapacitacao;
  eyebrow: string;                            // "NTC Saúde · PROSUS+ · Brasília"
  prefixoHtml: string;                        // "Seminário executivo" (vai em <span class="ev-prefix">)
  titulo: string;
  data: string;                               // "04–05 jun 2026"
  formato: string;                            // "Presencial"
  local: string;                              // "Brasília · DF"
  descricao: string;
  preco: string;                              // "R$ 4.890 · servidor"
  cta: LinkInterno;
}
export const PROXIMOS_HEAD = { eyebrow, tituloHtml, intro, selo };
export interface FiltroProximos { value: "all" | VerticalCapacitacao; label: string; }
export const PROXIMOS_FILTROS: FiltroProximos[];  // 4
export const PROXIMOS_EVENTOS: EventoCap[];        // 6
export const PROXIMOS_FOOTER_CTA: LinkInterno;     // "Ver agenda completa"

// ----------------- 2 CAMINHOS -----------------

export interface PassoCaminho { title: string; sub: string; }
export interface CaminhoCap {
  tipo: CaminhoTipo;
  eyebrow: string;
  titulo: string;
  descricao: string;
  passos: PassoCaminho[];                     // 4
  cta: LinkInterno;
}
export const CAMINHOS_HEAD = { eyebrow, tituloHtml, intro };
export const CAMINHOS: CaminhoCap[];          // 2

// ----------------- FAQ (8) -----------------

export interface ItemFaqCap {
  id: string;                                 // "cap-faq-1" ... "cap-faq-8"
  pergunta: string;
  respostaHtml: string;                       // multi-parágrafo com <strong> e <a>
}
export const FAQ_HEAD = { eyebrow, tituloHtml, intro };
export const FAQ_CAP: ItemFaqCap[];           // 8

// ----------------- CTA FINAL -----------------

export const CTA_FINAL_HEAD = {
  eyebrow: string;                            // gold
  tituloHtml: string;                         // com <em>
  paragrafo: string;
};
export const CTA_FINAL_BTNS: LinkInterno[];   // 3

export interface CardCtaVertical {
  vert: VerticalCapacitacao;
  eyebrow: string;
  titulo: string;
  descricao: string;
  link: LinkInterno;
}
export const CTA_FINAL_VERTICAIS: CardCtaVertical[];  // 3

// ----------------- STICKY -----------------

export const STICKY_CTA_CAP = {
  cta: LinkInterno;                            // "Solicitar proposta →" classe "btn btn--gold"
};
```

**Fidelidade:** todas as 16 seções lidas do HTML linha a linha (1619-2403). Tags inline `<em>`, `<strong>`, `<br>`, `<span>`, `<a>` preservadas. `data-cms-link`, `data-track`, `data-vert`, `data-tipo`, `data-filter` literais.

**Mapeamento de hrefs** (todas as 32 ocorrências serão re-mapeadas para rotas reais ou marcadas com `// TODO`):

| Href original | Destino |
|---|---|
| `./02_Prototipo_Home_GrupoNTC_v2_6.html` (crumb) | `/` |
| `./15_Pagina_Programa_PEAR_v1.html` | `/programas/pear` |
| `./16_Pagina_Programa_EDUTEC_v1.html` | `/programas/edutec` |
| `./20_Pagina_Programa_PROGE_v1.html` | `/programas/proge` |
| `./21_Pagina_Programa_PROGIR_v1.html` | `/programas/progir` |
| `./07_Pagina_Vertical_NTC_Educacao_v1.html` | `/solucoes-estrategicas/educacao` |
| `./10_Pagina_Programa_LIDERA_v1.html` | `/programas/lidera` |
| `./06_Pagina_Programa_AGIP_v1.html` | `/programas/agip` |
| `./11_Pagina_Programa_SIGA_v1.html` | `/programas/siga` |
| `./07_Pagina_Vertical_NTC_GestaoPublica_v1.html` | `/solucoes-estrategicas/gestao-publica` |
| `./14_Pagina_Programa_SIGS_v1.html` | `/programas/sigs` |
| `./17_Pagina_Programa_PROAPS_v1.html` | `/programas/proaps` |
| `./18_Pagina_Programa_PROSUS_v1.html` | `/programas/prosus` |
| `./07_Pagina_Vertical_NTC_Saude_v1.html` | `/solucoes-estrategicas/saude` |
| `./09_Pagina_Agenda_v2.html` | `/capacitacao/agenda` (já existe) |
| `./26_Pagina_Solucoes_v1.html#in-company` | `/solucoes#in-company` |
| `./26_Pagina_Solucoes_v1.html#turmas-fechadas` | `/solucoes#turmas-fechadas` |
| `./26_Pagina_Solucoes_v1.html#sob-medida` | `/solucoes#sob-medida` |
| `./26_Pagina_Solucoes_v1.html` | `/solucoes` |
| `./26_Pagina_Solucoes_v1.html#contratacao-institucional` | `/solucoes#contratacao-institucional` |
| `./25_Pagina_Corpo_Docente_v1.html` | `/o-grupo/corpo-docente` |
| `./12_Pagina_Contato_v1.html#tab-atendimento` | `/contato#tab-atendimento` (ou `/contato` com TODO se a aba não existir) |
| `./12_Pagina_Contato_v1.html#tab-proposta` | `/contato#tab-proposta` (idem) |
| `./02_Prototipo_Home_GrupoNTC_v2_6.html#eventon` | `/#eventon` (Home ainda tem âncora) — ou TODO para rota EventOn dedicada |
| `./03_Pagina_Evento_PROSUS_Brasilia_v3.html` | TODO — rota `/agenda/<slug>` não existe; manter literal com comentário |
| `./04_Pagina_Evento_EDUTEC_M01_Online_v2.html` | TODO idem |
| `./05_Pagina_Evento_AGIP_SP_Hibrido_v1.html` | TODO idem |
| `./09_Pagina_Agenda_v2.html#agenda-eventos` | `/capacitacao/agenda#agenda-eventos` |
| `./33_Pagina_LGPD_v1.html` | `/lgpd` |

## 6. Client components

### 6.1. `SubnavStickyCapacitacao.tsx`

Recebe `label: string`, `links: SubnavLink[]`.

Padrão idêntico ao `SubnavSticky` de `/conteudos` já portado (com a melhoria de rAF + `aria-current="location"` + re-medida de `subnavTop` em resize):

- Mount: query `nav#capSubnav`, mapeia `links → sections` via `document.querySelector(link.href)`.
- Captura `subnavTop` e `headerH` (via CSS var `--header-h`, fallback 88).
- `compute()`: define `is-sticky` quando `y >= subnavTop - 1`; loop sections para encontrar a última cujo `top - (headerH + subnavH + 24) <= 0` → `activeId`.
- `onScroll` gate via rAF; `onResize` re-mede + chama `compute()`.
- Cleanup remove ambos listeners + cancela rAF pendente.
- Renderiza `<nav class="cap-subnav{is-sticky?}" id="capSubnav">` com label + links; cada link ganha `is-active` + `aria-current="location"` quando ativo.

### 6.2. `ProximosEventosFiltro.tsx`

Recebe `eventos: EventoCap[]`, `filtros: FiltroProximos[]`, `head`, `selo`, `footerCta`.

- Estado: `filtro: "all" | VerticalCapacitacao` (inicial `"all"`).
- Sem busca, sem URL sync (protótipo não tem) — só tab filter.
- `useMemo` mapeia `eventos → { evento, visible }` (visible = `filtro === "all" || evento.vert === filtro`).
- Estratégia "todos no DOM com `is-hidden`": cada card recebe `is-hidden` quando não visível, igual ao `BibliotecaConteudos`.
- Counter via `track('cap_proximos_filter', { filter, shown })` em cada click (no-op stub).
- Renderiza head com eyebrow + h2 + intro + selo, depois `<div class="cap-proximos-filterbar">` com 4 botões tab (`is-active` + `aria-selected`), depois `<div class="cap-proximos-grid">` com 6 cards, depois footer com CTA.
- Sem empty state (protótipo não tem; 6 cards estáticos sempre têm representante em cada vertical).

### 6.3. `FaqCapacitacao.tsx`

Recebe `itens: ItemFaqCap[]`.

Idêntico ao `FaqAcordeao` de `/conteudos` mas adaptado às classes `.cap-faq-item`, `.cap-faq-toggle`, `.cap-faq-icon`, `.cap-faq-body`, `.cap-faq-body-inner`. Set<string> com ids abertos (vazio inicial). Resposta via `dangerouslySetInnerHTML`. Track `cap_faq_toggle`.

### 6.4. `StickyCtaCapacitacao.tsx`

Idêntico ao `StickyCtaConteudos` mas lendo `STICKY_CTA_CAP`. CTA `Solicitar proposta →` → `/contato#tab-proposta`. Track `cap_sticky_cta_dismissed`.

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas 156-1448, ~1.293 linhas), copiado sem adaptação. Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, `--pergaminho`, fontes, espaços, shadows, `--header-h`) vêm de `home-prototipo.css` — **não duplicar**. Como sempre, o copy preserva os tokens redeclarados no protótipo; o CSS escopa via classes específicas (`.cap-*`).

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`).

**Classes principais (organizadas por seção):**
- Hero: `.hero-page`, `.hero-page-bg`, `.hero-page-content`, `.crumb`, `.eyebrow.light`, `.accent`, `.hero-page-sub`, `.hero-quicklinks`
- Métricas: `.cap-metrics`, `.cap-metrics-grid`, `.cap-metric`, `.cm-num` (+ `.cm-num--word`), `.cm-lbl`, `.cm-detail`
- Subnav: `.cap-subnav` (+ `.is-sticky`), `.cap-subnav-inner`, `.cap-subnav-label`, subnav `<a>` (+ `.is-active`)
- Manifesto: `.cap-manifesto`, `.cap-manifesto-inner`, `.cap-manifesto-marker`, `.lede`
- Pilares: `.cap-pilares`, `.cap-pilares-inner`, `.cap-pilares-head`, `.cap-pilares-grid`, `.cap-pilar`, `.cap-pilar-num`, `.cap-pilar-rule`
- Verticais: `.cap-verticais`, `.cap-verticais-grid`, `.cap-vert-card`, `.cap-vert-band`, `.cap-vert-band-mark`, `.cap-vert-band-num`, `.cap-vert-body`, `.cap-vert-contagem`, `.cap-vert-list`
- Modalidades: `.cap-modalidades`, `.cap-modalidades-grid`, `.cap-modalidade`, `.cap-mod-num`, `.cap-mod-list`, `.cap-mod-aside`
- VS: `.cap-vs-solucoes`, `.cap-vs-grid`, `.cap-vs-cell` (+ `data-tipo`)
- Formatos: `.cap-formatos`, `.cap-formatos-grid`, `.cap-formato`, `.cap-formato-numeral`, `.cap-formato-num`, `.cap-formato-num-rule`, `.cap-formato-num-tag`, `.cap-formato-tag`
- Eixos: `.cap-eixos`, `.cap-eixos-aside`, `.cap-eixos-list` (`<ol>`), `.cap-eixo`, `.cap-eixo-num`, `.impact`
- Curadoria: `.cap-curadoria`, `.cap-curadoria-inner`, `.cap-curadoria-text`, `.cap-curadoria-pills`, `.cap-curadoria-pill`, `.cap-curadoria-cta`, `.cap-curadoria-figura`
- EventOn: `.cap-eventon`, `.cap-eventon-inner`, `.cap-eventon-text`, `.cap-eventon-cta`, `.cap-eventon-features`, `.cap-eventon-feature`
- Próximos: `.cap-proximos`, `.cap-proximos-selo`, `.cap-proximos-filterbar`, `.cap-proximos-filter` (+ `.is-active`), `.cap-proximos-grid`, `.cap-evento-card`, `.cap-evento-vert`, `.ev-prefix`, `.cap-evento-meta`, `.cap-evento-preco`, `.cap-proximos-foot`, `.is-hidden`
- Caminhos: `.cap-caminhos`, `.cap-caminhos-grid`, `.cap-caminho`, `.cap-caminho-passos`, `.cap-caminho-passo`, `.cap-caminho-passo-num`
- FAQ: `.cap-faq`, `.cap-faq-list`, `.cap-faq-item`, `.cap-faq-toggle`, `.cap-faq-icon`, `.cap-faq-body`, `.cap-faq-body-inner`
- CTA final: `.cap-cta-final`, `.cap-cta-final-inner`, `.cap-cta-final-btns`, `.cap-cta-final-verticais`, `.cap-cta-final-vert`, `.link-arrow.light`
- Sticky: `.sticky-cta-mobile` (+ `.is-visible`), `.sticky-cta-mobile-dismiss`

## 8. Validação

Padrão consolidado:

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm build` passa e rota `/capacitacao` aparece como `○ Static` com ISR 1h.
4. `pnpm next dev --port 3001` levantado (porta 3000 do usuário pode estar ocupada).
5. `curl -sI http://localhost:3001/capacitacao` retorna 200.
6. Marcadores HTML batem (esperado): 5 `cap-metric`, 3 `cap-pilar`, 3 `cap-vert-card`, 4 `cap-modalidade`, 2 `cap-vs-cell`, 3 `cap-formato`, 5 `cap-eixo`, 4 `cap-eventon-feature`, 6 `cap-evento-card`, 2 `cap-caminho`, 8 `cap-faq-item`, 3 `cap-cta-final-vert`, 1 `sticky-cta-mobile`.
7. **Validação visual humana** lado a lado com `27_Pagina_Capacitacao_v1.html`.
8. Smoke functional checklist:
   - [ ] Header/footer globais funcionando (mega-menu, drawer, fade-in).
   - [ ] Hero com crumb, eyebrow light, h1 com accent, 5 quicklinks.
   - [ ] 5 métricas (1 com `cm-num--word`).
   - [ ] **Subnav sticky:** ao rolar, recebe `is-sticky`; link da seção visível recebe `is-active` + `aria-current="location"`.
   - [ ] Manifesto + 3 pilares.
   - [ ] 3 verticais com programas linkados; links apontam para `/programas/<slug>` ou `/solucoes-estrategicas/<slug>`.
   - [ ] 4 modalidades com lista, aside e link.
   - [ ] VS Capacitação/Soluções (2 colunas).
   - [ ] 3 formatos (Online/Híbrido/Presencial).
   - [ ] 5 eixos com aside lateral.
   - [ ] Curadoria com pills + 2 CTAs (Corpo Docente / Falar com curadoria).
   - [ ] EventOn com 2 CTAs + 4 features.
   - [ ] **Próximos eventos:** 6 cards visíveis por padrão; click "Educação" reduz para 2 (cards 2 e 5); "Saúde" reduz para 2 (cards 1 e 4); "Gestão Pública" reduz para 2 (cards 3 e 6); "Todos" volta a 6.
   - [ ] 2 caminhos (servidor + instituição) com 4 passos cada.
   - [ ] FAQ 8 itens (todos fechados); click expande/colapsa.
   - [ ] CTA final 3 botões + 3 cards-ponte por vertical.
   - [ ] Sticky mobile aparece após scroll > 800px; `×` esconde.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| 6 cards de eventos com `data-vert` precisam filtrar consistentemente. | Modelar `EventoCap` com todos os campos. Filtro client com estratégia "all in DOM com is-hidden". |
| Subnav sticky precisa medir offsetTop. | Padrão já consolidado em `SubnavSticky` de Conteúdos: medir no mount, re-medir em resize, rAF gate no scroll. |
| FAQ 4 e 6 têm `<a>` inline dentro de `<p>`. | `dangerouslySetInnerHTML` no body inner (fonte controlada, sem user input). |
| Cards de eventos linkam para protótipos sem rota real (`./03_Pagina_Evento_PROSUS_Brasilia_v3.html`, etc.). | Manter href literal `#` com comentário `// TODO: criar rota /agenda/<slug>`. NÃO inventar rotas (CLAUDE.md §5.3). |
| Hrefs com aba `#tab-atendimento` e `#tab-proposta` para `/contato`. | Manter literal (a página `/contato` já existe e pode acolher essas âncoras quando implementadas; se não, são apenas IDs de scroll inofensivos). |
| Aside lateral em `.cap-eixos` quebra o pattern dos outros sections. | Não tentar abstrair: copiar literal a estrutura `.cap-eixos > .container > div.cap-eixos-grid > .cap-eixos-aside + .cap-eixos-list`. |
| Mismatch SSR/CSR no SubnavSticky (depende de scroll). | Renderizar SSR sem `is-sticky`; toggle só após mount (states iniciais `false`/`null`). |
| Layout `(capacitacao)/layout.tsx` já existe servindo `/capacitacao/agenda`. | **Não modificar** — apenas adicionar a pasta `/capacitacao/`. Aproveitamento por design dos route groups Next. |
| Mega-menu já tem item "Capacitação" no HeaderHome global? | Verificar pós-implementação. Se for sub-âncora `#capacitacao`, atualizar para `/capacitacao` (estilo do que fizemos com `/conteudos`). |

## 10. Fora de escopo

- Páginas individuais de evento (`/agenda/[slug]`). Cards 1-3 dos próximos eventos apontam para protótipos não-portados — TODOs preservados.
- Integração real de analytics (GA4/Mixpanel). `track()` permanece no-op.
- POST real de formulários — esta página não tem formulário; toda interação leva a `/contato`.
- Coleção `Programa`/`Evento` no Payload — fora de escopo.
- Internacionalização.
- Testes automatizados.
- Atualização do mega-menu `HeaderHome.tsx` para apontar item "Capacitação" para `/capacitacao` — sessão de polimento pós-checkpoint visual, igual ao que foi feito com `/conteudos`.

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos:
   - estrutura (CSS + import root + verificar layout do route group)
   - conteúdo (`conteudoCapacitacao.ts` em 2-3 commits: parte 1 tipos+hero+métricas+subnav+manifesto+pilares; parte 2 verticais+modalidades+vs+formatos+eixos; parte 3 curadoria+eventon+eventos+caminhos+faq+cta+sticky)
   - 4 client components (Subnav, Próximos, Faq, Sticky)
   - server JSX (`page.tsx`)
   - validação (build + dev + checkpoint humano)
3. Typecheck + lint + build + dev server.
4. Checkpoint visual humano lado a lado com `27_Pagina_Capacitacao_v1.html`.
5. Move do protótipo para `feito/` após aprovação.
6. Polimento pós-aprovação (opcional): atualizar mega-menu HeaderHome para apontar "Capacitação" → `/capacitacao`.
