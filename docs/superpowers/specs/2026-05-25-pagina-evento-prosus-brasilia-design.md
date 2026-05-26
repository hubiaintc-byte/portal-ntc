# Página Evento Presencial (PROSUS Brasília) — Design (porta do HTML)

**Data:** 2026-05-25
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `03_Pagina_Evento_PROSUS_Brasilia_v3.html` (3.204 linhas) para a rota dinâmica `/agenda/[slug]` dentro do route group `(capacitacao)` já existente. Esta é a **primeira porta de página de evento** do projeto e estabelece o template visual para eventos presenciais. Quando AGIP SP (híbrido) e um evento online forem portados em sessões futuras, eles renderizam variantes do mesmo template dinâmico.

A página tem estrutura editorial densa: hero institucional com tags coloridas + 3 CTAs, meta-bar com 5 atributos, subnav sticky com scroll-spy de 8 âncoras + dropdown de agenda calendar (Google/Outlook/ICS), 12 sub-seções editoriais no conteúdo principal (visão geral, público, objetivos, conteúdo programático, programação de 3 dias com 12 schedule-rows, 3 palestrantes, 6 diferenciais, local com mapa decorativo, replay/certificação, regras de inscrição, FAQ 7 itens, CTA final), sidebar fixa com card de inscrição (cover image + 5 metas + 6 includes + countdown JS + 2 CTAs + 3 share) e seção de eventos relacionados (3 cards).

Interatividade portada: scroll-spy + sticky subnav, dropdown "Adicionar à agenda" com geração dinâmica de ICS, countdown setInterval 60s, FAQ accordion, fade-in observer (global).

Esta é a **11ª porta de protótipo** do projeto.

## 2. Documentos de referência

- `03_Pagina_Evento_PROSUS_Brasilia_v3.html` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_plano_lê_html_antes.md` — ler classes literais antes de modelar tipos. **Já aplicado nesta sessão** (mapeamento das 107 classes únicas feito por Explore antes do design).
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `InteracoesScroll` já está em `(capacitacao)/layout.tsx`.
- Spec irmã: `docs/superpowers/specs/2026-05-25-pagina-capacitacao-design.md` — referência para subnav sticky e FAQ acordeão (mesmos padrões reaplicados aqui).

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (capacitacao)/                                ← route group já existente
│   ├── layout.tsx                                ← já existe, reaproveitado (Header+Footer+InteracoesScroll)
│   ├── agenda/                                   ← já existe (página lista, intocada)
│   │   ├── page.tsx                              ← intocada
│   │   └── [slug]/                               ← NOVO segmento dinâmico
│   │       ├── page.tsx                          ← server, generateStaticParams + notFound() se slug inexistente
│   │       ├── conteudoEventos.ts                ← tipos genéricos compartilháveis + EVENTOS_AGENDA (1 evento por enquanto)
│   │       ├── EventoPresencialLayout.tsx        ← server: renderiza variant presencial das 16 seções
│   │       ├── EventoSubnav.tsx                  ← client: scroll-spy via IntersectionObserver + sticky
│   │       ├── AgendaDropdown.tsx                ← client: dropdown + geração dinâmica de Google/Outlook/ICS
│   │       ├── CountdownSidebar.tsx              ← client: setInterval 60s, modo numerico|textual
│   │       └── FaqEvento.tsx                     ← client: Set<string> ids abertos (padrão FaqCapacitacao adaptado)
└── evento-prototipo.css                          ← CSS literal do <style> (linhas 135-2140, ~2.006 linhas)
```

`apps/web/app/layout.tsx` (root) passa a importar `evento-prototipo.css` depois de `capacitacao-prototipo.css`.

**Não modificar:**
- `(capacitacao)/layout.tsx` (já está correto)
- `(capacitacao)/agenda/page.tsx` (lista, intocada)
- Outros prototype CSSs

**Decisões fixadas:**

- Rota: `/agenda/[slug]`. `generateStaticParams` retorna `[{ slug: "prosus-brasilia" }]` por enquanto. Adicionar slugs em batch quando AGIP SP e outros chegarem.
- `revalidate = 3600`.
- `notFound()` (do `next/navigation`) se slug não estiver em `EVENTOS_AGENDA`.
- Tipos genéricos pré-definidos para todos os formatos (`EventoBase`, `EventoPresencial`, `EventoHibrido`, `EventoOnline`) mas só `EventoPresencialLayout` implementado nesta sessão. As outras 2 variantes ficam para sessões futuras.
- Layout switching no `page.tsx` via discriminator `evento.formato` — `switch` que renderiza o layout correto. Implementado só para `"presencial"` agora; outros caem em `notFound()` ou em um placeholder explícito ("layout em desenvolvimento") — decidir na implementação.

## 4. Estrutura do `page.tsx` (server)

```tsx
import { notFound } from "next/navigation";
import { EVENTOS_AGENDA } from "./conteudoEventos";
import { EventoPresencialLayout } from "./EventoPresencialLayout";

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(EVENTOS_AGENDA).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const evento = EVENTOS_AGENDA[params.slug];
  if (!evento) return {};
  return { title: `${evento.titulo} · Grupo NTC`, description: evento.subtitulo };
}

export default function EventoPage({ params }) {
  const evento = EVENTOS_AGENDA[params.slug];
  if (!evento) notFound();

  switch (evento.formato) {
    case "presencial":
      return <EventoPresencialLayout evento={evento} />;
    default:
      // futuro: EventoHibridoLayout / EventoOnlineLayout
      notFound();
  }
}
```

## 5. Estrutura do `EventoPresencialLayout.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main" class="event-page">`, linhas 2325-2846):

1. **Breadcrumb** (`<nav class="breadcrumb">`) — `<ol class="breadcrumb-list">` com 7 li (4 link `data-cms-link` + 3 sep + 1 `.current`). Inline no Layout, não componente.
2. **Hero** (`<section class="event-hero">`) — `.event-hero-bg` decorativo + `.event-hero-content.fade-in` com:
   - `.event-hero-tags`: 4 spans (`.event-hero-status`, 2× `.event-hero-format`, `.event-hero-vert`).
   - `<h1>` (texto direto, sem `<em>`).
   - `<p class="event-hero-sub">`.
   - `.event-hero-program-binding`: `<span>` + `<strong><a href="/programas/prosus">`.
   - `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">` com 3 CTAs (gold + 2 ghost-light) — manter style inline porque é layout-of-content específico.
3. **Meta-bar** (`<section class="event-meta-bar">`) — `.event-meta-bar-grid.fade-in` com 5 `.event-meta-item` (label/value/value-sub).
4. **`<EventoSubnav />`** (`<nav class="evt-nav">`) — sticky + scroll-spy.
5. **`event-layout`** (2-col grid): wrapper `<section class="event-layout">`, `<div class="container">`, `<div class="event-layout-grid">` com 2 filhos:
   - **`<div class="event-main-content">`** com 12 sub-seções (cada uma `<article class="event-section fade-in" [id]>`):

     | # | id | eyebrow | h2 | sub-elementos |
     |---|----|--|----|----|
     | 1 | `visao-geral` | "Resumo executivo" | "O encontro" | `p.lede-block` + 2 `<p>` |
     | 2 | `publico` | "Para quem" | "Público-alvo" | `<p>` + `.audience-chips` 8 spans |
     | 3 | (sem id) | "O que entregamos" | "Objetivos do seminário" | `ol.objective-list` 5 li |
     | 4 | (sem id) | "Estrutura" | "Conteúdo programático" | `<p>` + `.program-content` com 7 itens (`.num` + `.text`) |
     | 5 | `programacao` | "Cronograma" | "Programação detalhada" | `<p>` + 3 `.schedule-day` (5+4+3 schedule-rows) |
     | 6 | `palestrantes` | "Quem ensina" | "Coordenação científica e especialistas" | `<p>` + `.speakers-detailed` 3 `.speaker-detail-card` + `.placeholder-note` |
     | 7 | (sem id) | "Por que participar" | "Diferenciais do seminário" | `.event-differentials` 6 `.event-diff-card` |
     | 8 | `local` | "Onde acontece" | "Local do seminário" | `.venue-grid` (info: h4+address+meta+hospedagem · map: pin+label decorativo) — **só presencial** |
     | 9 | (sem id) | "Acesso pós-evento" | "Replay e certificação" | `.replay-cert-grid` 2 cards (icons Unicode ↻ ⌬) |
     | 10 | `investimento` (h2 tem `#regras` também) | "Política comercial" | "Regras de inscrição e investimento" | `ul.rules-list` 8 li |
     | 11 | `faq` | "Perguntas frequentes" | "FAQ" | `<FaqEvento itens={faqs} />` |
     | 12 | (sem id) | "Próximo passo" gold | (h2 inline com max-width) | `<p>` + flex com 2 CTAs (gold + secondary) |

   - **`<aside class="event-sidebar">`**: 1 `.sidebar-card` com:
     1. `.sidebar-card-cover`: `<img>` + `.sidebar-card-status` "Últimas vagas"
     2. `.sidebar-card-body`: `<h3>` + `.sidebar-rows` (5 rows, uma com `.price`)
     3. `.sidebar-includes`: `<h4>` + `<ul>` 6 li
     4. `<CountdownSidebar deadline=… tipo="numerico" />` (substitui `.sidebar-countdown` inteiro)
     5. `.sidebar-actions`: 2 CTAs (gold inscrição + secondary equipe → /contato com query string)
     6. `.sidebar-share`: 3 links share

6. **Related events** (`<section class="related-events-section">`) — `.section-head.fade-in` (eyebrow gold + h2 + intro) + `.related-events-grid.fade-in` com 3 `.event-secondary-card`, cada uma com:
   - `.es-cover` (background-image inline com `area-saude.1920.webp` + overlay + `.es-date` em 2 variantes: `.range` ou `.multi`)
   - `.es-body` (.es-program + h4.es-title + .es-program-binding + .es-meta-row + .es-cta)

   Footer da seção: flex com 2 CTAs (primary agenda + secondary proposta).

## 6. Estrutura do `conteudoEventos.ts`

Tipos compartilháveis (todos os formatos):

```ts
// ----------------- Discriminator -----------------
export type FormatoEvento = "presencial" | "hibrido" | "online";
export type AreaVertical = "edu" | "gov" | "sau";

// ----------------- Tipos compartilhados -----------------
export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  classe?: string;
  arrow?: boolean;
}

export interface CrumbItemEvento {
  texto: string;
  href?: string;
  cmsLink?: string;
  current?: boolean;
}

export interface EventoMeta {
  label: string;
  value: string;
  valueSub: string;
}

export interface NavLink {
  texto: string;
  href: string;            // "#visao-geral"
  isActive?: boolean;
}

export interface AudienceChip { texto: string; }

export interface ItemObjetivo { texto: string; }

export interface ProgramContentItem {
  num: string;
  texto: string;
}

export interface ScheduleRow {
  time: string;            // "09:00–09:30"
  titulo: string;
  descricao: string;
}

export interface ScheduleDay {
  dateBig: string;         // "05"
  dateSub: string;         // "junho · 2026"
  dayTag: string;          // "Dia 1 · Quinta"
  rows: ScheduleRow[];
}

export interface Palestrante {
  foto: string;            // "/img/fotos/_optimized/expert-04.1920.webp"
  role: string;
  nome: string;
  credenciais: string;
}

export interface Diferencial {
  num: string;             // "01"-"06"
  titulo: string;
  descricao: string;
}

export interface ReplayCertCard {
  icone: string;           // "↻" | "⌬"
  titulo: string;
  descricao: string;
}

export interface ItemFaqEvento {
  id: string;              // "evento-faq-1"
  pergunta: string;
  respostaHtml: string;
}

export interface RelatedEventCard {
  area: AreaVertical;
  coverImg: string;
  date:
    | { tipo: "range"; days: string; dash: string; monYr: string }
    | { tipo: "multi"; count: string; number: string; period: string };
  program: string;         // "PROAPS+"
  titulo: string;
  programBinding: string;  // "ligado ao programa..."
  metaHtml: string;        // "Online · 16h · ... <strong>R$ 1.490</strong>"
  cta: LinkInterno;
}

export interface SidebarCard {
  coverImg: string;
  status: string;          // "Últimas vagas"
  tituloCard: string;
  rows: Array<{ label: string; value: string; price?: boolean }>;
  includes: {
    titulo: string;
    items: string[];
  };
  countdown: {
    label: string;
    dateText: string;
    deadline: string;      // ISO
    tipo: "numerico" | "textual";
  };
  acoes: LinkInterno[];    // [primary inscrição, secondary equipe]
  share: {
    label: string;         // "Compartilhar:"
    links: LinkInterno[];
  };
}

// ----------------- Hero/Meta/CTA -----------------
export interface HeroEvento {
  tags: Array<{ texto: string; classe: "event-hero-status" | "event-hero-format" | "event-hero-vert" }>;
  h1: string;
  sub: string;
  programBinding: { texto: string; href: string; cmsLink?: string; nomePrograma: string };
  ctas: LinkInterno[];
}

// ----------------- Sub-seções editoriais -----------------
export interface SecaoVisaoGeral {
  eyebrow: string;
  h2: string;
  lede: string;
  paragrafos: string[];
}

export interface SecaoPublico {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: AudienceChip[];
}

export interface SecaoObjetivos {
  eyebrow: string;
  h2: string;
  objetivos: ItemObjetivo[];
}

export interface SecaoConteudoProgramatico {
  eyebrow: string;
  h2: string;
  intro: string;
  itens: ProgramContentItem[];
}

export interface SecaoProgramacao {
  eyebrow: string;
  h2: string;
  intro: string;
  dias: ScheduleDay[];
}

export interface SecaoPalestrantes {
  eyebrow: string;
  h2: string;
  intro: string;
  palestrantes: Palestrante[];
  nota: string;            // placeholder-note
}

export interface SecaoDiferenciais {
  eyebrow: string;
  h2: string;
  diferenciais: Diferencial[];
}

export interface SecaoLocal {
  eyebrow: string;
  h2: string;
  venueInfo: {
    titulo: string;
    enderecoLinhas: string[];     // 3 linhas
    meta: string;
    hospedagemHtml: string;       // contém <strong> "Hospedagem:"
  };
  mapLabel: string;
  pinLabel: string;
}

export interface SecaoReplayCert {
  eyebrow: string;
  h2: string;
  cards: ReplayCertCard[];        // 2
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  h2Id?: string;                  // "regras" (idiomatismo único do HTML)
  rules: string[];                // 8 li
}

export interface SecaoFaq {
  eyebrow: string;
  h2: string;
  faqs: ItemFaqEvento[];
}

export interface SecaoCtaFinal {
  eyebrowGold: string;
  h2: string;
  paragrafo: string;
  ctas: LinkInterno[];            // 2
}

export interface SecaoRelatedEvents {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedEventCard[];      // 3
  footerCtas: LinkInterno[];      // 2
}

// ----------------- Base + variantes -----------------
export interface EventoBase {
  slug: string;
  titulo: string;                 // usado em metadata
  subtitulo: string;
  formato: FormatoEvento;
  dataEvento: string;             // legível
  area: AreaVertical;
  crumb: CrumbItemEvento[];
  hero: HeroEvento;
  metas: EventoMeta[];            // 5
  navLinks: NavLink[];            // 8 âncoras
  visaoGeral: SecaoVisaoGeral;
  publico: SecaoPublico;
  objetivos: SecaoObjetivos;
  conteudoProgramatico: SecaoConteudoProgramatico;
  programacao: SecaoProgramacao;
  palestrantes: SecaoPalestrantes;
  diferenciais: SecaoDiferenciais;
  replayCert: SecaoReplayCert;
  investimento: SecaoInvestimento;
  faq: SecaoFaq;
  ctaFinal: SecaoCtaFinal;
  sidebar: SidebarCard;
  relatedEvents: SecaoRelatedEvents;
  // dados para AgendaDropdown
  agendaIcs: {
    titulo: string;
    descricao: string;
    location: string;
    startISO: string;
    endISO: string;
    filename: string;             // "PROSUS-Brasilia-2026-jun.ics"
  };
}

export interface EventoPresencial extends EventoBase {
  formato: "presencial";
  local: SecaoLocal;              // só presencial
}

export interface EventoHibrido extends EventoBase {
  formato: "hibrido";
  local: SecaoLocal;              // híbrido tem local + acesso remoto
  // futuro: secaoAcessoRemoto?
}

export interface EventoOnline extends EventoBase {
  formato: "online";
  // local não se aplica
}

export type Evento = EventoPresencial | EventoHibrido | EventoOnline;

// ----------------- Constante exportada -----------------
export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": { /* ... PROSUS Brasília full data ... */ },
};
```

**Fidelidade:** todos os 16 blocos (12 main + sidebar + breadcrumb + meta-bar + hero) lidos do HTML linha a linha (linhas 2325-2846). Tags inline (`<strong>`, `<em>`, `<br>`, `<a>`) preservadas literais nas strings `*Html`. `data-cms-link` preservado em todos os links/CTAs.

**Mapeamento de hrefs** (5 destinos únicos):

| Href HTML | Destino React |
|---|---|
| `./02_Prototipo_Home_GrupoNTC_v2_6.html` | `/` |
| `./02_..._v2_6.html#capacitacao` | `/capacitacao` |
| `./02_..._v2_6.html#contratacao` | `/solucoes#contratacao-institucional` |
| `./02_..._v2_6.html#eventos-abertos` | `/capacitacao/agenda` |
| `./02_..._v2_6.html#programas` | `/#programas` |
| `./12_Pagina_Contato_v1.html?evento=...#tab-equipe` | `/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe` |
| Link "PROSUS" do hero binding | `/programas/prosus` |
| `#contato` (handlers de scroll local) | manter literal — o handler global do `InteracoesScroll` ou similar já faz smooth scroll; se não houver `id="contato"` na rota, ele só vira no-op |

## 7. Client components

### 7.1. `EventoSubnav.tsx`

Recebe `label`, `links: NavLink[]`, `acoesPrincipais: { onClickInscrever, folderHref, ... }`.

- **Scroll-spy**: `IntersectionObserver` com `rootMargin: '-30% 0px -55% 0px'`, `threshold: 0`. Adiciona `.is-active` ao `.evt-nav-link` cuja seção está visível.
- **Sticky**: o `.evt-nav` já é `position: sticky` no CSS. Sem JS extra para sticky.
- 3 ações: 1 botão "Inscrever-se" que scrolla para `#contato` (ou para `#sidebar-card` se preferirmos âncora local), 1 botão "Baixar folder" (href TODO), 1 `<AgendaDropdown />`.

### 7.2. `AgendaDropdown.tsx`

Recebe `dados: EventoBase["agendaIcs"]`.

- Estado: `aberto: boolean`.
- Dropdown abre no click do toggle. Fecha em click fora, Escape, ou click num link interno.
- 4 links: Google Calendar (URL gerada), Outlook (URL gerada), Apple (mesmo ICS), download `.ics` (data URI).
- Geração de URLs:
  - Google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=<titulo>&dates=<start>/<end>&details=<descricao>&location=<location>`
  - Outlook: `https://outlook.office.com/calendar/0/deeplink/compose?subject=<titulo>&body=<descricao>&startdt=<start>&enddt=<end>&location=<location>`
  - ICS: string `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n...\nEND:VEVENT\nEND:VCALENDAR` → `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` + atributo `download`.
- Listeners no `document`: click + keydown(Escape).

### 7.3. `CountdownSidebar.tsx`

Recebe `deadline: string` (ISO), `tipo: "numerico" | "textual"`, `label`, `dateText`.

- Estado: `{ d: number, h: number, m: number, expired: boolean }`.
- `useEffect`: calcula diff `deadline - now`, atualiza estado, `setInterval(tick, 60_000)`. Cleanup limpa interval.
- Renderiza:
  - Sempre: `.sidebar-cd-label` + `.sidebar-cd-date`.
  - Se `tipo === "numerico"`: `.sidebar-cd-counter` com 3 `.item` > `.num` (d/h/m) + `.lbl`.
  - Se `tipo === "textual"`: `.sidebar-cd-text` "Faltam <strong>{d}</strong> dias".
- SSR: renderiza com valores iniciais "–" para evitar mismatch (deadline ISO conhecido server-side, mas tempo "now" muda).
- Edge case: se `expired`, mostrar "Inscrições encerradas" (texto literal — não no HTML protótipo mas é o sensato).

### 7.4. `FaqEvento.tsx`

Padrão idêntico ao `FaqCapacitacao` adaptado para classes `.faq-item`, `.faq-question`, `.faq-answer`, `.faq-answer-inner`.

- Estado: `Set<string>` ids abertos (vazio inicial).
- Recebe `itens: ItemFaqEvento[]`.
- Renderiza: `<div class="faq-item is-open?">` + `<button class="faq-question" aria-expanded>` + `<div class="faq-answer">` + `<div class="faq-answer-inner" dangerouslySetInnerHTML>`.

## 8. CSS

CSS literal das linhas 135-2140 do HTML (~2.006 linhas), copiado para `apps/web/app/evento-prototipo.css`. Tokens base vêm de `home-prototipo.css`.

**Gotchas a aplicar:**
- Após copiar, conferir `head -1` e `tail -1`: se forem `<style>` / `</style>`, strippar com `sed -i '' '1d;$d'` (lição da Capacitação).
- Substituir `url('./img/...')` por `url('/img/...')`.
- Verificar imagens em `apps/web/public/img/fotos/_optimized/`:
  - `area-saude.1920.webp` (sidebar cover + 3 related cards bg)
  - `expert-04.1920.webp`, `expert-03.1920.webp`, `expert-02.1920.webp` (3 palestrantes)

**Classes principais** (107 únicas, agrupadas):
- Breadcrumb: `.breadcrumb`, `.breadcrumb-list`, `.sep`, `.current`
- Hero: `.event-hero`, `.event-hero-bg`, `.event-hero-content`, `.event-hero-tags`, `.event-hero-status`, `.event-hero-format`, `.event-hero-vert`, `.event-hero-sub`, `.event-hero-program-binding`
- Meta-bar: `.event-meta-bar`, `.event-meta-bar-grid`, `.event-meta-item`, `.label`, `.value`, `.value-sub`
- Subnav: `.evt-nav`, `.evt-nav-inner`, `.evt-nav-anchors`, `.evt-nav-link`, `.is-active`, `.evt-nav-actions`, `.evt-nav-action`, `.primary`, `.evt-nav-action-wrap`, `.evt-agenda-dropdown`
- Layout: `.event-layout`, `.event-layout-grid`, `.event-main-content`, `.event-sidebar`, `.event-page`
- Seções editoriais: `.event-section`, `.fade-in`, `.eyebrow`, `.gold`, `.lede-block`
- Público: `.audience-chips`
- Objetivos: `.objective-list`
- Programa: `.program-content`, `.program-content-item`, `.num`, `.text`
- Cronograma: `.schedule-day`, `.schedule-day-head`, `.date-big`, `.date-sub`, `.day-tag`, `.schedule-rows`, `.schedule-row`, `.time`, `.activity`
- Palestrantes: `.speakers-detailed`, `.speaker-detail-card`, `.speaker-detail-portrait`, `.speaker-detail-info`, `.role`, `.cred`, `.placeholder-note`
- Diferenciais: `.event-differentials`, `.event-diff-card`, `.diff-num`, `.diff-body`
- Local: `.venue-grid`, `.venue-info`, `.venue-meta`, `.venue-map`, `.pin`, `.map-label`
- Replay/Cert: `.replay-cert-grid`, `.replay-cert-card`, `.icon-line`
- Regras: `.rules-list`
- FAQ: `.faq-list`, `.faq-item`, `.faq-question`, `.faq-answer`, `.faq-answer-inner`
- Sidebar: `.sidebar-card`, `.sidebar-card-cover`, `.sidebar-card-status`, `.sidebar-card-body`, `.sidebar-rows`, `.sidebar-row`, `.price`, `.sidebar-includes`, `.sidebar-countdown`, `.sidebar-cd-label`, `.sidebar-cd-date`, `.sidebar-cd-counter`, `.item`, `.lbl`, `.sidebar-cd-text`, `.sidebar-actions`, `.sidebar-share`
- Related: `.related-events-section`, `.related-events-grid`, `.event-secondary-card`, `.es-cover`, `.es-cover-img`, `.es-cover-overlay`, `.es-date`, `.range`, `.multi`, `.days`, `.dash`, `.mon-yr`, `.count`, `.number`, `.period`, `.es-body`, `.es-program`, `.es-title`, `.es-program-binding`, `.es-meta-row`, `.es-meta`, `.es-cta`
- Section head + intro: `.section-head`, `.section-intro`
- Botões: `.btn`, `.btn--gold`, `.btn--ghost-light`, `.btn--primary`, `.btn--secondary`, `.btn-arrow`

## 9. Validação

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` sem novos warnings.
3. `pnpm build` passa; rota `/agenda/[slug]` aparece como `● SSG` com `/agenda/prosus-brasilia` prerenderizado.
4. `pnpm next dev --port 3001` levantado (3000 pode estar ocupada).
5. `curl -sI http://localhost:3001/agenda/prosus-brasilia` → 200.
6. Marcadores HTML batem:
   - 7 `breadcrumb-list > li`
   - 4 spans em `.event-hero-tags`
   - 3 CTAs no hero
   - 5 `.event-meta-item`
   - 8 `.evt-nav-link`
   - 12 `<article class="event-section">` no main content
   - 8 `.audience-chips > span`
   - 5 `.objective-list > li`
   - 7 `.program-content-item`
   - 3 `.schedule-day`, total 12 `.schedule-row`
   - 3 `.speaker-detail-card`
   - 6 `.event-diff-card`
   - 1 `.venue-grid` (info + map)
   - 2 `.replay-cert-card`
   - 8 `.rules-list > li`
   - 7 `.faq-item`
   - 5 `.sidebar-row` (1 com `.price`)
   - 6 `.sidebar-includes ul li`
   - 1 `.sidebar-countdown`
   - 3 `.event-secondary-card`
7. **Validação visual humana** lado a lado com `03_Pagina_Evento_PROSUS_Brasilia_v3.html`.
8. Smoke functional:
   - [ ] Hero com 4 tags coloridas (status + 2 formato + vert), h1, sub, program binding, 3 CTAs.
   - [ ] Meta-bar 5 cards.
   - [ ] **Subnav sticky + scroll-spy**: ao rolar, link da seção visível recebe `is-active`.
   - [ ] **Dropdown "Adicionar à agenda"**: abre/fecha, gera links Google/Outlook funcionais, baixa ICS válido.
   - [ ] **Countdown**: atualiza a cada minuto (verificar manualmente esperando ~1min OU mockando o tick).
   - [ ] FAQ accordion expande/colapsa, ícone Unicode `+`.
   - [ ] Sidebar visualmente alinhada (cover + countdown + CTAs).
   - [ ] Related events 3 cards com bg-image + .es-date variants.
   - [ ] Fade-in funciona em todas as seções `event-section`.
   - [ ] Hrefs internos apontam para rotas reais já existentes (`/`, `/capacitacao`, `/capacitacao/agenda`, `/solucoes`, `/contato`, `/programas/prosus`).

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Página muito complexa (16 blocos editoriais densos) — alto risco de divergência estrutural como em `/capacitacao`. | **Aplicar lição `feedback_plano_lê_html_antes.md`**: mapeamento literal das 107 classes já feito por Explore antes do design. Plano vai ter literais TS exatos de cada bloco; auditoria final manual obrigatória pelo controller antes do checkpoint visual. |
| Countdown precisa atualizar sem causar hydration mismatch. | SSR renderiza valores iniciais `"—"`; client useEffect calcula valores reais após mount. Estado inicial = `{ d: 0, h: 0, m: 0, expired: false }` ou null + render condicional. |
| Geração de ICS no client com encoding correto. | Usar `encodeURIComponent`. Datas em formato ISO sem segundos finais (`20260605T120000Z`). Validar com download manual no checkpoint. |
| `event-meta-bar` é sticky no CSS (verificar). | Não tem JS. Se for `position: sticky` no CSS portado, funciona automaticamente. |
| Múltiplos handlers de scroll (subnav scroll-spy + fade-in observer global). | Não conflitam — IntersectionObserver é eficiente. Subnav usa rootMargin diferente. |
| Tipos genéricos `Evento = EventoPresencial \| EventoHibrido \| EventoOnline` exigem discriminator em todos os usos. | `page.tsx` faz switch antes de passar ao Layout específico. `EventoPresencialLayout` aceita `EventoPresencial`, não `Evento` — TS garante. |
| Link inline no header binding aponta para `/programas/prosus` — existe? | `/programas/[slug]` já está implementado com fallback estático que cobre PROSUS. Confirmar com `curl -sI http://localhost:3001/programas/prosus` antes de declarar OK. |
| `<img>` no sidebar e palestrantes vai gerar warnings de lint `no-img-element`. | Aceitável (mesma situação dos prototype components existentes). Pode-se migrar para `next/image` depois — fora de escopo. |

## 11. Fora de escopo

- `EventoHibridoLayout` (sessão futura quando portarmos AGIP SP).
- `EventoOnlineLayout` (sessão futura quando tivermos HTML de exemplo online).
- Coleção `Evento` no Payload.
- POST real de inscrição.
- Geração do PDF folder.
- Cobertura completa de `generateStaticParams` com todos os eventos do CMS — atualmente só 1 slug.
- Atualizar `/capacitacao/page.tsx` para apontar os 3 cards de evento (PROSUS bsb, EDUTEC m01, AGIP sp) para suas rotas individuais — sessão de polimento pós-checkpoint.
- Testes automatizados.

## 12. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos:
   - estrutura (CSS extrai + import root)
   - conteudoEventos.ts em 3-4 commits (tipos + hero/meta/sidebar/related + 12 sub-seções em batches)
   - 4 client components (CountdownSidebar, AgendaDropdown, FaqEvento, EventoSubnav)
   - EventoPresencialLayout (server)
   - page.tsx + generateStaticParams + notFound
   - validação (build + dev + checkpoint humano)
3. Typecheck + lint + build + dev server.
4. **Auditoria estrutural manual pelo controller** (lição `/capacitacao`) antes do checkpoint visual.
5. Checkpoint visual humano lado a lado com `03_Pagina_Evento_PROSUS_Brasilia_v3.html`.
6. Move do protótipo para `feito/` após aprovação.
