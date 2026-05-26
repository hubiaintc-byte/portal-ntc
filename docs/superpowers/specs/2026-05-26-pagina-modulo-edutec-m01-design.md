# Página Módulo de Programa (EDUTEC M01) — Design (porta do HTML)

**Data:** 2026-05-26
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `04_Pagina_Evento_EDUTEC_M01_Online_v2.html` (3.627 linhas) para a rota dinâmica `/programas/[slug]/modulos/[modulo]` em `(programas)/programas/[slug]/modulos/[modulo]`. Esta é a **primeira porta de página de módulo de programa** do projeto e estabelece o template visual para módulos online ao vivo.

Apesar do nome do arquivo HTML usar "Evento", a usuária definiu que este é template de **módulo de programa** (parte de uma trilha formativa), não evento avulso da agenda. A diferença é semântica e arquitetural: módulos pertencem a um programa-mãe; o breadcrumb tem 4 níveis (Home > Programas > [Programa] > [Módulo]), há `program-binding` no hero, há `module-binding-note` no Visão Geral, sidebar tem `sb-title-tag` ("Módulo 01 · Trilha EDUTEC"), seção de related events tem eyebrow "Trilha EDUTEC · Próximos módulos".

**Decisão arquitetural crucial:** apesar da semelhança estrutural superficial com o template de evento (`/agenda/[slug]`), o HTML usa **prefixo de classe completamente diferente** (`.evt-*` vs `.event-*` do PROSUS) e tem elementos exclusivos (`module-binding-note`, `sb-title-tag`, `sb-cover-eventon`, `eventon-section`, `why-grid`, `schedule-node` com `.ttag`). Portanto, este template tem **CSS, componentes server e components client paralelos**, sem reaproveitamento com `/agenda/[slug]`. Tentar compartilhar geraria refactor complexo sem ganho real (CLAUDE.md §5.5 — sem otimização prematura).

Interatividade portada: scroll-spy no subnav (`.evt-nav-link` + IntersectionObserver), dropdown "Adicionar à agenda" com geração ICS/Google/Outlook, countdown setInterval 60s, FAQ accordion. Fade-in global vem do InteracoesScroll do `(programas)/layout.tsx` já existente.

Esta é a **12ª porta de protótipo** do projeto.

## 2. Documentos de referência

- `04_Pagina_Evento_EDUTEC_M01_Online_v2.html` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_plano_lê_html_antes.md` — ler classes literais antes de modelar tipos. **Já aplicado nesta sessão** (mapeamento das ~130 classes únicas feito por Explore antes do design).
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- Spec irmã: `docs/superpowers/specs/2026-05-25-pagina-evento-prosus-brasilia-design.md` — referência para padrão de scroll-spy, agenda dropdown, countdown, FAQ accordion. Componentes serão recriados (não importados) por causa do prefixo de classe diferente.
- Plano irmão executado: `docs/superpowers/plans/2026-05-25-pagina-evento-prosus-brasilia.md` — referência de granularidade de tasks (15 bite-sized).

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (programas)/                                            ← route group já existente
│   ├── layout.tsx                                          ← já existe, reaproveitado
│   └── programas/[slug]/                                   ← já existe (página de programa)
│       ├── page.tsx                                        ← intocada
│       └── modulos/[modulo]/                               ← NOVO segmento dinâmico
│           ├── page.tsx                                    ← server, generateStaticParams + notFound() se módulo inexistente
│           ├── conteudoModulos.ts                          ← tipos + MODULOS_PROGRAMAS (1 entrada: edutec/m01)
│           ├── ModuloOnlineLayout.tsx                      ← server: renderiza 16 blocos
│           ├── ModuloSubnav.tsx                            ← client: scroll-spy IntersectionObserver
│           ├── ModuloAgendaDropdown.tsx                    ← client: dropdown + geração Google/Outlook/ICS
│           ├── ModuloCountdownSidebar.tsx                  ← client: setInterval 60s, SSR-safe
│           └── ModuloFaq.tsx                               ← client: Set<string> ids abertos
└── modulo-prototipo.css                                    ← CSS literal (~2.175 linhas após strip)
```

`apps/web/app/layout.tsx` (root) passa a importar `modulo-prototipo.css` depois de `evento-prototipo.css`.

**Não modificar:**
- `(programas)/layout.tsx` (já está correto, mesmo padrão dos outros)
- `(programas)/programas/[slug]/page.tsx` (página de programa, intocada)
- `(home)/HeaderHome.tsx`, `FooterHome.tsx`, `InteracoesScroll.tsx`
- Componentes de `/agenda/[slug]` (separados completamente)

**Decisões fixadas:**

- Rota: `/programas/[slug]/modulos/[modulo]`.
- `generateStaticParams` retorna `[{ slug: "edutec", modulo: "m01" }]` por enquanto. Quando novos módulos vierem, adicionar aqui.
- `revalidate = 3600`. `notFound()` (do `next/navigation`) se `slug+modulo` não estiver em `MODULOS_PROGRAMAS`.
- Tipo único `Modulo` por enquanto, sem discriminador de formato — todos os módulos por enquanto são "online ao vivo". Quando surgir módulo presencial/híbrido, generalizamos.
- Track no-op compartilhado: copiar inline em cada client component (YAGNI; padrão estabelecido).
- POST real de inscrição: fora de escopo (CTAs apontam para `#contato` ou `/contato?...`).

## 4. Estrutura do `page.tsx` (server)

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { MODULOS_PROGRAMAS, lookupModulo } from "./conteudoModulos";
import { ModuloOnlineLayout } from "./ModuloOnlineLayout";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; modulo: string }>;
}

export function generateStaticParams() {
  return Object.entries(MODULOS_PROGRAMAS).flatMap(([slug, modulos]) =>
    Object.keys(modulos).map((modulo) => ({ slug, modulo })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, modulo } = await params;
  const m = lookupModulo(slug, modulo);
  if (!m) return {};
  return { title: m.metaTitle, description: m.metaDescription };
}

export default async function ModuloPage({ params }: PageProps) {
  const { slug, modulo } = await params;
  const m = lookupModulo(slug, modulo);
  if (!m) notFound();

  // Só ModuloOnlineLayout implementado nesta sessão.
  // Futuros formatos (presencial/híbrido) entram com switch.
  return <ModuloOnlineLayout modulo={m} />;
}
```

`MODULOS_PROGRAMAS` é nested record `Record<programaSlug, Record<moduloSlug, Modulo>>`. `lookupModulo` é helper que retorna `Modulo | undefined`.

## 5. Estrutura do `ModuloOnlineLayout.tsx` (server)

Renderiza em ordem (espelho do `<main id="main" class="event-page" data-evento>`, linhas 2499-3223):

### Estrutura completa

1. **Breadcrumb** (`<nav class="breadcrumb">`) — `<ol class="breadcrumb-list">` com **4 níveis**:
   - Grupo NTC (`/`)
   - Capacitação (`/capacitacao`)
   - Eventos online (`/capacitacao/agenda`) — note: HTML diz "Eventos online", redireciona para Agenda Geral
   - Seminário EDUTEC · Cultura Digital (current)

2. **Hero** (`<section class="evt-hero">`) — `.evt-hero-bg` com `background-image` inline (`area-educacao.1920.webp`) + `.container.evt-hero-content.fade-in`:
   - `.evt-hero-tags`: 3 spans (`.evt-hero-status` "Inscrições abertas", `.evt-hero-format` "Seminário Online ao Vivo", `.evt-hero-vert` "NTC Educação")
   - `<h1>` com `<em>` literal preservado
   - `<p class="evt-hero-sub">`
   - `.evt-hero-program-binding`: `<span>Integra o programa</span><strong><a href="/programas/edutec" data-cms-link="programa-EDUTEC">EDUTEC — Cultura Digital, Educação Midiática e Transformação da Educação</a></strong>`
   - `.evt-hero-ctas` com 3 CTAs (gold + 2 ghost-light): Inscrever-se, Baixar folder, Inscrever equipe

3. **Meta-bar** (`.evt-meta-bar`) — `.evt-meta-bar-grid.fade-in` com 5 `.evt-meta-item` (label/value/value-sub):
   - Quando · 27 · Maio · 2026 · Quarta-feira
   - Modalidade · Ao vivo · + replay por 7 dias
   - Carga horária · 8 horas · Manhã (4h) + Tarde (4h)
   - Plataforma · EventON NTC · Acesso individual
   - Investimento · Sob consulta · Equipes e órgãos

4. **`<ModuloSubnav />`** (client, `.evt-nav` id `evtNav`) — sticky + scroll-spy. 8 âncoras + 3 ações.

5. **`.evt-layout`** (2-col grid `.evt-layout-grid`):
   - **`.evt-main`** (9 sub-seções editoriais):

     5.1 **`#visao-geral`** (`<article class="evt-section fade-in">`)
       - Eyebrow: "Visão geral"
       - H2: "Uma agenda institucional para uma `<em>educação digital crítica</em>`, conectada e contemporânea."
       - `<p class="lede-block">` (longo)
       - 2 `<p>` adicionais
       - `<p class="module-binding-note">` — aviso de que é Módulo 01 da trilha EDUTEC (componente único)
       - **H2 inline** com `style="margin-top:var(--space-6)"`: "Seis razões para `<em>participar</em> deste seminário"
       - `<div class="why-grid">` com 6 `<div class="why-card">` (cada um: `.why-num` "01"-"06" + `.why-body > h4 + p`)

     5.2 **`#publico`**
       - Eyebrow: "Para quem"
       - H2: "Público-alvo"
       - `<p>` intro
       - `<div class="audience-chips">` com 6 `<span>`
       - **H2 inline** `margin-top`: "Objetivo"
       - `<p>` objetivo
       - **H2 inline** `margin-top`: "Destaques formativos"
       - `<div class="highlights-list">` com 5 `<div class="highlight-item">` (cada um: `.h-num` + `.h-text` com `<strong>`)

     5.3 **`#programacao`**
       - Eyebrow: "Cronograma"
       - H2: "Programação detalhada"
       - `<p>` intro
       - `<div class="schedule-timeline">`:
         - `.schedule-timeline-head` com `.tt-day` "27 de Maio" + `.tt-meta` "Quarta-feira · 2026"
         - 4 `.schedule-node`, cada um:
           - `.sn-time` (horário + `.ttag` "Palestra · 01" / "Oficina · 01" etc.)
           - `.sn-marker > .sn-num` (I / II / III / IV em algarismo romano)
           - `.sn-content > h4 + p.speaker-line + ul(3 li)`

     5.4 **`#palestrantes`**
       - Eyebrow: "Quem ensina"
       - H2: "Três especialistas de `<em>referência nacional</em>`"
       - `<div class="speakers-detailed">` com 3 `<article class="speaker-detail-card">`:
         - `.speaker-detail-portrait > img + .speaker-role-tag`
         - `.speaker-detail-info > h3 + p.credentials + p.bio`
       - `<p class="placeholder-note">` (nota sobre fotos via CMS)

     5.5 **`#eventon`** (seção exclusiva — plataforma online)
       - Eyebrow: "Plataforma de acesso"
       - H2: "Como funciona no `<em>EventON NTC</em>`"
       - `<p>` intro
       - `<div class="eventon-section">`:
         - `.eventon-head > .eventon-mark > .name + .tag` + `.eventon-stats` com 3 `.eventon-stat` (`.n + .l`): "5.000 / Participantes simultâneos", "30 FPS / Vídeo em alta definição", "100% / Acesso institucional"
         - `.eventon-features` com 6 `.eventon-feat`, cada um: `.feat-icon > svg` (inline) + `.feat-body > h4 + p`

     5.6 **`#investimento`**
       - Eyebrow: "Investimento"
       - H2: "Investimento e condições"
       - `<div class="investment-block">`:
         - `.invest-price`: `.label` + `.value > .cur + .amt` + `.sub`
         - `.invest-includes > h4 + ul(6 li)`
       - `.invest-modes` com 3 `.invest-mode` (3º com `.featured`): cada um `.tag` + `h4` + `p`

     5.7 **`#regras`**
       - Eyebrow: "Política comercial"
       - H2: "Regras de participação"
       - `.rules-list > ul` com 8 `<li>`

     5.8 **`#faq`**
       - Eyebrow: "Perguntas frequentes"
       - H2: "FAQ"
       - `<ModuloFaq itens={faqs} />` (renderiza `.faq-list > 7 .faq-item`)

     5.9 **CTA Final** (sem id)
       - `<article class="evt-section fade-in">` com style centralizado
       - `<p class="eyebrow gold">` "Próximo passo"
       - H2: "Garanta sua participação no `<em>Módulo 01 EDUTEC</em>`."
       - `<p>` descritivo
       - `<div>` inline flex com 2 CTAs (gold + secondary)

   - **`<aside class="evt-sidebar">`** com `<div class="sb-card">`:
     1. `.sb-cover`: `<img>` + `.sb-status` "Inscrições abertas" + `.sb-cover-eventon` "Acesso via EventON" (exclusivo)
     2. `.sb-body`: `<p class="sb-title-tag">` "Módulo 01 · Trilha EDUTEC" (exclusivo) + `.sb-rows` (5 `.sb-row`, último com `.price`)
     3. `.sb-includes`: `<h4>` + `<ul>` 6 li
     4. `<ModuloCountdownSidebar />` (com ids `sbCountdown`/`sbCdCounter`/`sbCdText`, deadline `2026-05-20T23:59:59-03:00`, tipo `numerico`)
     5. `.sb-actions`: 2 CTAs (gold + secondary)
     6. `.sb-share`: `<span>` "Compartilhar:" + 3 links (WhatsApp, E-mail, LinkedIn)

6. **Related events** (`<section class="related-events-section">`) — section-head (eyebrow gold "Trilha EDUTEC · Próximos módulos" + h2 "Continue a jornada de educação digital" + intro) + grid com 3 `.event-secondary-card[data-area="edu"]`, cada uma:
   - `.es-cover > .es-cover-img (bg-image inline) + .es-cover-overlay + .es-date`
   - `.es-date` em 2 variantes: `.range` (`.days + .dash + .mon-yr`) ou `.single` (`.day + .mon-yr`)
   - `.es-body > .es-program + h4.es-title + .es-program-binding + .es-meta-row + .es-cta`
   - Footer com 2 CTAs (primary "Agenda completa" + secondary "Proposta institucional")

## 6. Estrutura do `conteudoModulos.ts`

Tipos compartilháveis (sketch):

```ts
// ----------------- Discriminator -----------------
export type FormatoModulo = "online-ao-vivo";  // futuro: "presencial" | "hibrido"
export type AreaVerticalModulo = "edu" | "gov" | "sau";

// ----------------- Tipos compartilhados básicos -----------------
export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  classe?: string;
  arrow?: boolean;
}

export interface CrumbItemModulo {
  texto: string;
  href?: string;
  cmsLink?: string;
  current?: boolean;
}

export interface MetaItem { label: string; value: string; valueSub: string; }
export interface NavLink { texto: string; href: string; isActive?: boolean; }
export interface AudienceChip { texto: string; }
export interface WhyCard { num: string; titulo: string; descricao: string; }
export interface HighlightItem { num: string; textoHtml: string; }  // contém <strong>

export interface ScheduleNode {
  time: string;           // "08h–10h"
  ttag: string;           // "Palestra · 01"
  num: string;            // "I" / "II" / "III" / "IV"
  titulo: string;
  speakerLine: string;
  topicos: string[];      // 3 li
}

export interface ScheduleTimeline {
  ttDay: string;          // "27 de Maio"
  ttMeta: string;         // "Quarta-feira · 2026"
  nodes: ScheduleNode[];
}

export interface Palestrante {
  foto: string;
  roleTag: string;        // "Palestrante · 01"
  nome: string;
  credentials: string;
  bio: string;
}

export interface EventonStat { n: string; l: string; }
export interface EventonFeat { iconSvg: string; titulo: string; descricao: string; }  // iconSvg = innerHTML do <svg>

export interface InvestMode {
  tag: string;            // "Individual" / "Equipe" / "Institucional"
  titulo: string;
  descricao: string;
  featured?: boolean;
}

export interface ItemFaqModulo {
  id: string;             // "modulo-faq-1"
  pergunta: string;
  respostaHtml: string;
}

export type RelatedModuloDate =
  | { tipo: "range"; daysStart: string; dash: string; daysEnd: string; monYr: string }
  | { tipo: "single"; day: string; monYr: string };

export interface RelatedModuloCard {
  area: AreaVerticalModulo;
  coverImg: string;
  date: RelatedModuloDate;
  program: string;        // "PEAR · NTC Educação"
  titulo: string;
  programBinding: string; // "PEAR"
  metaHtml: string;       // contém <strong> para preço
  cta: LinkInterno;
}

export interface SidebarModulo {
  coverImg: string;
  status: string;
  coverEventon: string;   // "Acesso via EventON"
  titleTag: string;       // "Módulo 01 · Trilha EDUTEC"
  rows: Array<{ label: string; value: string; price?: boolean }>;
  includes: { titulo: string; items: string[] };
  countdown: {
    label: string;
    dateText: string;
    deadline: string;
    tipo: "numerico" | "textual";
  };
  acoes: LinkInterno[];
  share: { label: string; links: LinkInterno[] };
}

// ----------------- Sub-seções editoriais -----------------
export interface HeroModulo {
  bgImg: string;
  tags: Array<{ texto: string; classe: "evt-hero-status" | "evt-hero-format" | "evt-hero-vert" }>;
  h1: string;             // pode conter <em>
  sub: string;
  programBinding: { texto: string; href: string; cmsLink?: string; nomePrograma: string };
  ctas: LinkInterno[];
}

export interface SecaoVisaoGeral {
  eyebrow: string;
  h2: string;             // com <em>
  lede: string;
  paragrafos: string[];   // 2
  moduleBindingNote: string;
  segundoH2: string;      // "Seis razões..."
  whyCards: WhyCard[];    // 6
}

export interface SecaoPublico {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: AudienceChip[];           // 6
  objetivoH2: string;              // "Objetivo"
  objetivoTexto: string;
  destaquesH2: string;             // "Destaques formativos"
  highlights: HighlightItem[];     // 5
}

export interface SecaoProgramacao {
  eyebrow: string;
  h2: string;
  intro: string;
  timeline: ScheduleTimeline;
}

export interface SecaoPalestrantes {
  eyebrow: string;
  h2: string;             // com <em>
  palestrantes: Palestrante[];     // 3
  nota: string;
}

export interface SecaoEventon {
  eyebrow: string;
  h2: string;             // com <em>
  intro: string;
  markName: string;       // "EventON"
  markTag: string;        // "NTC"
  stats: EventonStat[];   // 3
  features: EventonFeat[]; // 6
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  block: {
    priceLabel: string;
    priceCur: string;     // "Sob"
    priceAmt: string;     // "consulta"
    priceSub: string;
    includesTitulo: string;
    includesItems: string[];  // 6
  };
  modes: InvestMode[];    // 3
}

export interface SecaoRegras {
  eyebrow: string;
  h2: string;
  rules: string[];        // 8
}

export interface SecaoFaq {
  eyebrow: string;
  h2: string;
  faqs: ItemFaqModulo[];  // 7
}

export interface SecaoCtaFinal {
  eyebrowGold: string;
  h2: string;             // com <em>
  paragrafo: string;
  ctas: LinkInterno[];    // 2
}

export interface SecaoRelatedModulos {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedModuloCard[];  // 3
  footerCtas: LinkInterno[];   // 2
}

// ----------------- Modulo (base, sem variants ainda) -----------------
export interface Modulo {
  slugPrograma: string;
  slugModulo: string;
  formato: FormatoModulo;
  metaTitle: string;
  metaDescription: string;
  area: AreaVerticalModulo;
  crumb: CrumbItemModulo[];     // 4 níveis
  hero: HeroModulo;
  metas: MetaItem[];            // 5
  navLinks: NavLink[];          // 8 âncoras
  visaoGeral: SecaoVisaoGeral;
  publico: SecaoPublico;
  programacao: SecaoProgramacao;
  palestrantes: SecaoPalestrantes;
  eventon: SecaoEventon;
  investimento: SecaoInvestimento;
  regras: SecaoRegras;
  faq: SecaoFaq;
  ctaFinal: SecaoCtaFinal;
  sidebar: SidebarModulo;
  relatedModulos: SecaoRelatedModulos;
  agendaIcs: {
    titulo: string;
    descricao: string;
    location: string;
    startISO: string;
    endISO: string;
    filename: string;
  };
}

// ----------------- Lookup nested -----------------
export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {
  edutec: {
    m01: { /* ... módulo M01 EDUTEC full data ... */ },
  },
};

export function lookupModulo(slugPrograma: string, slugModulo: string): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
```

**Fidelidade:** todos os ~16 blocos lidos do HTML linha a linha (linhas 2499-3223). Tags inline `<em>`, `<strong>`, `<br>`, `<a>` preservadas literais. `data-cms-link` literal. `iconSvg` em `EventonFeat` guarda innerHTML completo do `<svg>` (pattern do Corpo Docente para SVG não-`<path>`).

## 7. Client components

### 7.1. `ModuloSubnav.tsx`
Padrão idêntico ao `EventoSubnav.tsx` adaptado:
- Recebe `links: NavLink[]`, `agendaIcs`, `inscricaoCmsLink`, `folderCmsLink`, `folderHref`.
- IntersectionObserver com `rootMargin: '-30% 0px -55% 0px'`, `threshold: 0`. Marca `.is-active` + `aria-current="location"` no link da seção visível.
- Sticky vem do CSS (`.evt-nav: position: sticky`).
- Ações: botão "Inscrever-se" (scrolla `#contato`), botão "Baixar folder" (`<button>`, não `<a>` — lição do PROSUS), `<ModuloAgendaDropdown />`.

### 7.2. `ModuloAgendaDropdown.tsx`
Padrão `AgendaDropdown.tsx` do PROSUS:
- Recebe `dados: Modulo["agendaIcs"]`.
- Dropdown open/close com click fora + Escape.
- 4 links: Google Calendar (URL), Outlook · Office 365 (URL), Apple Calendar (.ics data URI), .ics genérico.
- Geração de URLs via `URLSearchParams` para Google/Outlook; string VCALENDAR para ICS.
- `rel="noopener"` (lição do PROSUS — sem noreferrer).

### 7.3. `ModuloCountdownSidebar.tsx`
Padrão `CountdownSidebar.tsx` do PROSUS, com fix de fidelidade aplicado:
- Recebe `label`, `dateText`, `deadline`, `tipo`.
- `useState<Tempo | null>(null)` para SSR-safe.
- `useEffect` calcula valor inicial + `setInterval(60_000)`.
- Cleanup limpa interval.
- **Renderiza AMBOS** `.sb-cd-counter` e `.sb-cd-text` com `display:none` no inativo (fix do PROSUS lição).
- IDs do HTML protótipo: `sbCountdown`, `sbCdCounter`, `sbCdText`. (Importante: HTML usa prefixo `sb-` / `sbCd*`, não `sidebar-`.)
- Modo "expirado" mostra "Inscrições encerradas" no text div.

### 7.4. `ModuloFaq.tsx`
Padrão `FaqEvento.tsx`:
- Recebe `itens: ItemFaqModulo[]`.
- Set<string> ids abertos.
- Classes `.faq-item` (com `.is-open`), `.faq-question` (button com `aria-expanded` + `aria-controls`), `.faq-answer` (com `id`), `.faq-answer-inner` (com `dangerouslySetInnerHTML`).

## 8. CSS

CSS literal das linhas 134-2309 do HTML (~2.175 linhas após strip), copiado para `apps/web/app/modulo-prototipo.css`. Tokens base vêm de `home-prototipo.css`.

**Gotchas (aplicar todos):**
- Após copiar, conferir `head -1` e `tail -1`: se forem `<style>` / `</style>`, strippar com `sed -i '' '1d;$d'` (lição da Capacitação).
- Substituir `url('./img/...')` por `url('/img/...')`.
- Verificar imagens em `apps/web/public/img/fotos/_optimized/`: `area-educacao.1920.webp` + fotos dos 3 palestrantes (a confirmar nomes durante implementação).

**Classes principais (130+ únicas):** ver mapeamento completo do Explore. Prefixos chave: `.evt-*` (hero, meta-bar, nav, layout, sidebar, section), `.sb-*` (sidebar interna), `.sn-*` (schedule node), `.es-*` (event secondary card / related events), `.eventon-*` (seção EventON), `.why-*` (why-grid), `.highlight-*` (highlights), `.invest-*` (investment block), `.faq-*` (accordion), `.speaker-*` (palestrantes).

## 9. Validação

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` sem novos warnings.
3. `pnpm build` passa; rota `/programas/[slug]/modulos/[modulo]` aparece como `●` SSG com `/programas/edutec/modulos/m01` prerenderizado, ISR 1h.
4. `pnpm next dev --port 3001` levantado.
5. `curl -sI http://localhost:3001/programas/edutec/modulos/m01` → 200.
6. Marcadores HTML batem:
   - 4 `breadcrumb-list > li` (com `current`)
   - 3 spans em `.evt-hero-tags`
   - 3 CTAs no hero
   - 5 `.evt-meta-item`
   - 8 `.evt-nav-link`
   - 9 `<article class="evt-section">` no main content
   - 6 `.audience-chips > span`
   - 6 `.why-card`
   - 5 `.highlight-item`
   - 4 `.schedule-node`
   - 3 `.speaker-detail-card`
   - 3 `.eventon-stat`
   - 6 `.eventon-feat`
   - 3 `.invest-mode` (1 com `.featured`)
   - 8 `.rules-list > li`
   - 7 `.faq-item`
   - 5 `.sb-row` (1 com `.price`)
   - 6 `.sb-includes ul li`
   - 1 `.sb-countdown`
   - 3 `.event-secondary-card` (related)

7. **Auditoria estrutural manual pelo controller** (NÃO delegar a Explore otimista) antes do checkpoint visual. Foco: prefixos `.evt-*` / `.sb-*` corretos, sub-elementos exclusivos (`sb-title-tag`, `sb-cover-eventon`, `module-binding-note`), variantes `.es-date.range`/`.single` corretas, `.ttag` dentro de `.sn-time`.

8. **Validação visual humana** lado a lado com `04_Pagina_Evento_EDUTEC_M01_Online_v2.html`.

9. Smoke functional:
   - [ ] Hero com 3 tags (status laranja + format + vert verde), h1 com `<em>`, sub, program binding ligando para `/programas/edutec`, 3 CTAs.
   - [ ] Meta-bar 5 cards.
   - [ ] **Subnav sticky + scroll-spy** com 8 âncoras: ao rolar, link da seção visível recebe `is-active`.
   - [ ] **Dropdown "Adicionar à agenda"**: abre/fecha, gera links Google/Outlook funcionais, baixa ICS válido (`EDUTEC-M01-2026-mai.ics`).
   - [ ] **Countdown**: aparece com d/h/m calculados, atualiza a cada minuto (esperar manualmente ~1min).
   - [ ] FAQ accordion expande/colapsa.
   - [ ] Sidebar visualmente alinhada (cover com 2 badges + title-tag + rows + countdown + actions + share).
   - [ ] Related events 3 cards (2 com `.es-date.range`, 1 com `.es-date.single`).
   - [ ] Fade-in funciona em todas as seções `evt-section`.
   - [ ] Hrefs internos apontam para rotas reais: `/`, `/capacitacao`, `/capacitacao/agenda`, `/programas/edutec`, `/contato`.

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| ~130 classes únicas, 9 sub-seções editoriais + sidebar + related — alto risco de divergência estrutural como PROSUS. | Aplicar lição `feedback_plano_lê_html_antes.md`: mapeamento literal já feito; plano inclui literais TS exatos; auditoria final manual obrigatória antes do checkpoint visual (§9.7). |
| `eventon-feat` tem SVG inline (não-trivial). Cada feat tem um `<svg>` com `<path>` ou primitivas. | Aplicar pattern do Corpo Docente: guardar `iconSvg: string` com innerHTML completo do `<svg>` e renderizar `<svg dangerouslySetInnerHTML>`. Não tentar abstrair `<path d>`. |
| 3 `<h2>` inline com `style="margin-top:..."` dentro de uma única `<article id="visao-geral">` (e idem em `#publico`). | Modelar como campos `segundoH2`, `objetivoH2`, `destaquesH2` no tipo da seção. JSX renderiza inline `<h2 style={...}>`. Não criar sub-articles. |
| `.evt-hero-program-binding` é condicional (CMS: `programa_vinculado != null`). | Por enquanto sempre renderizado (módulo SEMPRE pertence a programa). Não modelar condicional ainda — YAGNI. |
| Countdown precisa atualizar sem hydration mismatch + tem AMBOS counter/text divs no DOM (fix do PROSUS). | Estado inicial `null`, render `"—"` no SSR. Renderiza ambos divs sempre, com `display:none` no inativo. |
| `es-date` tem 2 variantes (`range` e `single`) — discriminator no tipo. | `RelatedModuloDate` como union discriminated. JSX switch por `card.date.tipo`. |
| Geração de ICS com encoding correto. | Mesmo pattern do PROSUS: `URLSearchParams` para Google/Outlook, string VCALENDAR encoded para ICS. Validar download manual no checkpoint. |
| Hrefs internos `#capacitacao`, `#eventos-abertos`, `#contato` podem não existir nas rotas Next. | Manter literais com `data-cms-link` preservado. `#contato` é local da própria página (handler global do `InteracoesScroll` ou similar). Outros viram rotas reais (`/capacitacao`, `/capacitacao/agenda`). |
| Tipos genéricos `Modulo` única (sem variants) — quando vier módulo presencial, precisará refactor. | Aceitável agora — YAGNI. Quando vier o 2º módulo de formato diferente, vamos generalizar `Modulo` para `ModuloOnline | ModuloPresencial | ModuloHibrido` (mesmo pattern do `/agenda/[slug]`). |
| Link inline no hero binding aponta para `/programas/edutec` — existe? | `/programas/[slug]` já está implementado com fallback estático que cobre EDUTEC. Confirmar com `curl -sI` antes de declarar OK. |
| `<img>` no sidebar e palestrantes vai gerar warnings de lint `no-img-element`. | Aceitável (mesma situação dos prototype components). `eslint-disable-next-line` por uso. |
| HTML do PROSUS estava muito próximo e o subagent gerou 22 divergências no Layout. | Aplicar mesmo rigor da auditoria do PROSUS: Explore faz mapping inicial, controller faz auditoria final lendo `<main>` literal e Layout lado a lado. |

## 11. Fora de escopo

- Variantes de módulo presencial/híbrido (sessão futura quando surgir HTML).
- Coleção `Modulo` no Payload.
- POST real de inscrição.
- Geração de PDF folder.
- Cobertura completa de `generateStaticParams` com todos os módulos — atualmente só 1 (`edutec/m01`).
- Atualizar `/programas/edutec` para listar módulos com link para `/programas/edutec/modulos/m01` — sessão de polimento pós-checkpoint.
- Testes automatizados.
- Refactor para compartilhar componentes/CSS com `/agenda/[slug]` — explicitamente fora de escopo (CLAUDE.md §5.5 — sem otimização prematura).

## 12. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (~15 tasks bite-sized, mesmo pattern do PROSUS):
   - estrutura (CSS extrai + import root)
   - conteudoModulos.ts em 3-4 commits (tipos genéricos + hero/meta/sidebar/related + 9 sub-seções em batches)
   - 4 client components (ModuloCountdownSidebar, ModuloAgendaDropdown, ModuloFaq, ModuloSubnav)
   - ModuloOnlineLayout (server) em 2-3 commits
   - page.tsx + generateStaticParams + notFound
   - validação (build + dev + **auditoria manual obrigatória pelo controller** + checkpoint humano)
3. Typecheck + lint + build + dev server.
4. Checkpoint visual humano lado a lado com `04_Pagina_Evento_EDUTEC_M01_Online_v2.html`.
5. Move do protótipo para `feito/` após aprovação.
