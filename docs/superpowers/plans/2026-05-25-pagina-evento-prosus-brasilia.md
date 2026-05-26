# Página Evento Presencial (PROSUS Brasília) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente `03_Pagina_Evento_PROSUS_Brasilia_v3.html` (~3.204 linhas) para a rota dinâmica `/agenda/[slug]` em `(capacitacao)/agenda/[slug]/`, com 1 slug populado (`prosus-brasilia`). Estabelece o template visual para eventos presenciais com tipos genéricos compartilháveis (Evento = EventoPresencial | EventoHibrido | EventoOnline) prontos para receber AGIP SP (híbrido) e eventos online em sessões futuras. 16 blocos editoriais + sidebar com countdown + related events + 4 client components.

**Architecture:** Estratégia "porta do HTML" consolidada (11ª aplicação). CSS literal extraído para `apps/web/app/evento-prototipo.css` (importado no root layout depois de `capacitacao-prototipo.css`). Rota `/agenda/[slug]` com `generateStaticParams` retornando `[{ slug: "prosus-brasilia" }]` e switch por `evento.formato` chamando o layout correto. `conteudoEventos.ts` contém tipos genéricos + `EVENTOS_AGENDA` (record). `EventoPresencialLayout.tsx` renderiza JSX literal das 16 seções. 4 client components: `EventoSubnav` (scroll-spy IntersectionObserver), `AgendaDropdown` (gera URLs Google/Outlook/ICS), `CountdownSidebar` (setInterval 60s), `FaqEvento` (accordion). Header/Footer/InteracoesScroll vêm do `(capacitacao)/layout.tsx` já existente.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/evento-prototipo.css` — CSS literal (~2.006 linhas após strip de `<style>`).
- `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` — server component, `generateStaticParams`, switch por formato, notFound() se slug inexistente.
- `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` — tipos compartilháveis + `EVENTOS_AGENDA` com `eventoProsusBrasilia`.
- `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx` — server: renderiza as 16 seções + sidebar + related events.
- `apps/web/app/(capacitacao)/agenda/[slug]/EventoSubnav.tsx` — client: scroll-spy IntersectionObserver.
- `apps/web/app/(capacitacao)/agenda/[slug]/AgendaDropdown.tsx` — client: dropdown + geração URL Google/Outlook/ICS.
- `apps/web/app/(capacitacao)/agenda/[slug]/CountdownSidebar.tsx` — client: setInterval 60s.
- `apps/web/app/(capacitacao)/agenda/[slug]/FaqEvento.tsx` — client: accordion Set<string>.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./evento-prototipo.css"` depois de `capacitacao-prototipo.css` (linha 88).

**Não tocar:**
- `apps/web/app/(capacitacao)/layout.tsx` (já correto)
- `apps/web/app/(capacitacao)/agenda/page.tsx` (página lista, intocada)
- `apps/web/app/(home)/HeaderHome.tsx`, `FooterHome.tsx`, `InteracoesScroll.tsx`
- Outros prototype CSSs

---

## Task 1: Extrair CSS literal para `evento-prototipo.css` (com strip de `<style>` tags)

**Files:**
- Create: `apps/web/app/evento-prototipo.css`

- [ ] **Step 1: Extrair linhas 134-2141 do HTML (entre `<style>` e `</style>` inclusive)**

```bash
sed -n '134,2141p' /Users/joao/Documents/portal-ntc/03_Pagina_Evento_PROSUS_Brasilia_v3.html > /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
```

- [ ] **Step 2: Verificar primeira e última linha**

```bash
head -1 /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
tail -1 /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
```

Expected: linha 1 = `<style>`, linha final = `</style>`.

- [ ] **Step 3: Strip das tags `<style>` / `</style>` (lição da Capacitação)**

```bash
sed -i '' '1d;$d' /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
```

- [ ] **Step 4: Confirmar strip**

```bash
head -1 /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
tail -1 /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
```

Expected: head ≠ `<style>`, tail ≠ `</style>`, ~2.006 linhas.

- [ ] **Step 5: Contar e converter `url('./img/...')` para `url('/img/...')`**

```bash
grep -c "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css || true
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css || echo "OK: nenhuma ocorrência"
```

Expected: 0 ocorrências após conversão.

- [ ] **Step 6: Listar imagens referenciadas e verificar existência**

```bash
grep -oE "url\('[^']+'\)" /Users/joao/Documents/portal-ntc/apps/web/app/evento-prototipo.css | sort -u
```

Para cada URL encontrada, rodar `ls /Users/joao/Documents/portal-ntc/apps/web/public<caminho>` e confirmar. Se faltar imagem, reportar BLOCKED — **não inventar caminho**.

- [ ] **Step 7: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/evento-prototipo.css && git commit -m "$(cat <<'EOF'
feat(evento): extrai CSS literal do protótipo 03 para evento-prototipo.css

Bloco <style> de 03_Pagina_Evento_PROSUS_Brasilia_v3.html copiado
sem adaptação, com url('./img/...') convertido para url('/img/...'),
e tags <style></style> stripadas (padrão dos outros prototype CSSs).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `evento-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Confirmar posição atual**

```bash
grep -n "capacitacao-prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: 1 ocorrência em `import "./capacitacao-prototipo.css";`.

- [ ] **Step 2: Adicionar import depois de `capacitacao-prototipo.css`**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx`:

old_string:
```
import "./capacitacao-prototipo.css";
```

new_string:
```
import "./capacitacao-prototipo.css";
// CSS da página /agenda/[slug] (template de evento — portada literal de
// 03_Pagina_Evento_PROSUS_Brasilia_v3.html e futuros AGIP SP, EDUTEC M01, etc).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas (.event-hero, .event-meta-bar, .evt-nav,
// .event-layout, .event-section, .event-sidebar, .sidebar-card, .schedule-day,
// .speaker-detail-card, .event-diff-card, .venue-grid, .replay-cert-card,
// .rules-list, .faq-item, .related-events-section, .event-secondary-card).
import "./evento-prototipo.css";
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/layout.tsx && git commit -m "$(cat <<'EOF'
feat(evento): importa evento-prototipo.css no root layout

Carrega CSS do template de evento depois do capacitacao-prototipo.css,
mantendo a ordem de cascading dos outros prototype CSSs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar `conteudoEventos.ts` parte 1 — tipos genéricos compartilháveis

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1: Criar a pasta**

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]"
```

- [ ] **Step 2: Criar o arquivo com tipos genéricos (sem dados ainda)**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DE EVENTOS DE /AGENDA/[SLUG]
//  Tipos genéricos compartilháveis para EventoPresencial, EventoHibrido
//  e EventoOnline. Cada evento é uma entrada de EVENTOS_AGENDA.
//
//  Este arquivo é a fonte estática até a coleção Evento entrar no Payload.
//  Fidelidade 100% ao protótipo HTML correspondente (sem rephrasing).
// =============================================================

// ----------------- Discriminators -----------------

export type FormatoEvento = "presencial" | "hibrido" | "online";
export type AreaVertical = "edu" | "gov" | "sau";

// ----------------- Tipos compartilhados básicos -----------------

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
  href: string;
  isActive?: boolean;
}

export interface AudienceChip { texto: string; }
export interface ItemObjetivo { texto: string; }

export interface ProgramContentItem {
  num: string;
  texto: string;
}

export interface ScheduleRow {
  time: string;
  titulo: string;
  descricao: string;
}

export interface ScheduleDay {
  dateBig: string;
  dateSub: string;
  dayTag: string;
  rows: ScheduleRow[];
}

export interface Palestrante {
  foto: string;
  role: string;
  nome: string;
  credenciais: string;
}

export interface Diferencial {
  num: string;
  titulo: string;
  descricao: string;
}

export interface ReplayCertCard {
  icone: string;
  titulo: string;
  descricao: string;
}

export interface ItemFaqEvento {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export type RelatedEventDate =
  | { tipo: "range"; days: string; dash: string; monYr: string }
  | { tipo: "multi"; count: string; number: string; period: string };

export interface RelatedEventCard {
  area: AreaVertical;
  coverImg: string;
  date: RelatedEventDate;
  program: string;
  titulo: string;
  programBinding: string;
  metaHtml: string;
  cta: LinkInterno;
}

export interface SidebarCard {
  coverImg: string;
  status: string;
  tituloCard: string;
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

// ----------------- Hero -----------------

export interface HeroEvento {
  tags: Array<{
    texto: string;
    classe: "event-hero-status" | "event-hero-format" | "event-hero-vert";
  }>;
  h1: string;
  sub: string;
  programBinding: {
    texto: string;
    href: string;
    cmsLink?: string;
    nomePrograma: string;
  };
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
  nota: string;
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
    enderecoLinhas: string[];
    meta: string;
    hospedagemHtml: string;
  };
  mapLabel: string;
  pinLabel: string;
}

export interface SecaoReplayCert {
  eyebrow: string;
  h2: string;
  cards: ReplayCertCard[];
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  h2Id?: string;
  rules: string[];
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
  ctas: LinkInterno[];
}

export interface SecaoRelatedEvents {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedEventCard[];
  footerCtas: LinkInterno[];
}

// ----------------- Evento Base + variantes discriminadas -----------------

export interface EventoBase {
  slug: string;
  titulo: string;
  subtitulo: string;
  formato: FormatoEvento;
  dataEvento: string;
  area: AreaVertical;
  crumb: CrumbItemEvento[];
  hero: HeroEvento;
  metas: EventoMeta[];
  navLinks: NavLink[];
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
  agendaIcs: {
    titulo: string;
    descricao: string;
    location: string;
    startISO: string;
    endISO: string;
    filename: string;
  };
}

export interface EventoPresencial extends EventoBase {
  formato: "presencial";
  local: SecaoLocal;
}

export interface EventoHibrido extends EventoBase {
  formato: "hibrido";
  local: SecaoLocal;
}

export interface EventoOnline extends EventoBase {
  formato: "online";
}

export type Evento = EventoPresencial | EventoHibrido | EventoOnline;

// ----------------- Record exportado (dados vêm em Tasks 4-6) -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {};
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa (sem `noUnusedLocals` complaint porque tudo é `export`).

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts" && git commit -m "$(cat <<'EOF'
feat(evento): cria conteudoEventos.ts (parte 1) com tipos genéricos compartilháveis

Tipos para Evento = EventoPresencial | EventoHibrido | EventoOnline,
todos extendendo EventoBase. Sub-seções editoriais tipadas:
VisaoGeral, Publico, Objetivos, ConteudoProgramatico, Programacao,
Palestrantes, Diferenciais, Local (só presencial/hibrido), ReplayCert,
Investimento, Faq, CtaFinal, Sidebar, RelatedEvents.

EVENTOS_AGENDA exportado vazio — dados vêm nos commits seguintes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `conteudoEventos.ts` parte 2 — `eventoProsusBrasilia` (slug + hero + metas + navLinks + crumb)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1: Adicionar `eventoProsusBrasilia` parcial antes do `EVENTOS_AGENDA`**

Edit. Use Edit duas vezes:

(a) old_string:
```
// ----------------- Record exportado (dados vêm em Tasks 4-6) -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {};
```

new_string:
```
// ----------------- Evento: PROSUS Brasília 2026 (presencial) -----------------
// Porta literal de 03_Pagina_Evento_PROSUS_Brasilia_v3.html

const eventoProsusBrasilia: EventoPresencial = {
  slug: "prosus-brasilia",

  titulo: "Governança, financiamento e performance no SUS — Edição 2026",

  subtitulo:
    "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",

  formato: "presencial",

  dataEvento: "5 a 7 de junho de 2026",

  area: "sau",

  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    {
      texto: "Eventos presenciais",
      href: "/capacitacao/agenda",
      cmsLink: "eventos-presenciais",
    },
    { texto: "Seminário PROSUS+ · Brasília", current: true },
  ],

  hero: {
    tags: [
      { texto: "Últimas vagas", classe: "event-hero-status" },
      { texto: "Seminário", classe: "event-hero-format" },
      { texto: "Presencial · Brasília", classe: "event-hero-format" },
      { texto: "NTC Saúde", classe: "event-hero-vert" },
    ],
    h1: "Governança, financiamento e performance no SUS — Edição 2026",
    sub: "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",
    programBinding: {
      texto: "Integra o programa",
      href: "/#programas",
      cmsLink: "programa-PROSUS",
      nomePrograma:
        "PROSUS+ — Governança, Financiamento e Performance no SUS",
    },
    ctas: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Baixar folder",
        href: "#",
        cmsLink: "folder-PROSUS-2026-jun",
        classe: "btn btn--ghost-light",
      },
      {
        texto: "Inscrever equipe ou grupo",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "proposta-grupo-PROSUS",
        classe: "btn btn--ghost-light",
      },
    ],
  },

  metas: [
    { label: "Quando", value: "5 a 7 · Junho", valueSub: "2026 · 3 dias consecutivos" },
    { label: "Modalidade", value: "Presencial", valueSub: "Brasília · DF" },
    { label: "Carga horária", value: "20 horas", valueSub: "Programação executiva" },
    { label: "Inscrição individual", value: "R$ 2.890", valueSub: "Até 30 de maio" },
    { label: "Equipes / órgãos", value: "Sob consulta", valueSub: "Desconto institucional" },
  ],

  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "Local", href: "#local" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "Regras", href: "#regras" },
    { texto: "FAQ", href: "#faq" },
  ],

  // visaoGeral, publico, objetivos, conteudoProgramatico, programacao,
  // palestrantes, diferenciais, local, replayCert, investimento, faq,
  // ctaFinal, sidebar, relatedEvents, agendaIcs vêm em Tasks 5 e 6.
  visaoGeral: { eyebrow: "", h2: "", lede: "", paragrafos: [] },
  publico: { eyebrow: "", h2: "", intro: "", chips: [] },
  objetivos: { eyebrow: "", h2: "", objetivos: [] },
  conteudoProgramatico: { eyebrow: "", h2: "", intro: "", itens: [] },
  programacao: { eyebrow: "", h2: "", intro: "", dias: [] },
  palestrantes: { eyebrow: "", h2: "", intro: "", palestrantes: [], nota: "" },
  diferenciais: { eyebrow: "", h2: "", diferenciais: [] },
  local: {
    eyebrow: "",
    h2: "",
    venueInfo: { titulo: "", enderecoLinhas: [], meta: "", hospedagemHtml: "" },
    mapLabel: "",
    pinLabel: "",
  },
  replayCert: { eyebrow: "", h2: "", cards: [] },
  investimento: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    tituloCard: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: { titulo: "", descricao: "", location: "", startISO: "", endISO: "", filename: "" },
};

// ----------------- Record exportado -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": eventoProsusBrasilia,
};
```

Nota: usamos placeholders vazios temporários para campos pendentes — permitido nesta task transitória, mas **CADA campo vazio deve ser preenchido em Task 5 ou 6 antes do commit final**. TypeScript permite (objeto literal satisfaz tipo, mesmo com strings vazias). Não deixar este estado em prod.

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa (todos os campos estão tipados, mesmo que vazios).

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona eventoProsusBrasilia (slug+hero+metas+navLinks+crumb)

Estrutura inicial do EventoPresencial com hero (4 tags, h1, sub, program
binding, 3 CTAs), 5 metas, 8 navLinks, 4 crumb items. Demais sub-seções
ficam vazias temporariamente — preenchidas em Tasks 5 e 6.

EVENTOS_AGENDA["prosus-brasilia"] já registrado para o generateStaticParams.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `conteudoEventos.ts` parte 3 — sub-seções editoriais principais (visão+público+objetivos+conteúdo+programação+palestrantes+diferenciais)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1: Substituir os placeholders dos 7 primeiros sub-blocos**

Edit. old_string (placeholder block):
```
  visaoGeral: { eyebrow: "", h2: "", lede: "", paragrafos: [] },
  publico: { eyebrow: "", h2: "", intro: "", chips: [] },
  objetivos: { eyebrow: "", h2: "", objetivos: [] },
  conteudoProgramatico: { eyebrow: "", h2: "", intro: "", itens: [] },
  programacao: { eyebrow: "", h2: "", intro: "", dias: [] },
  palestrantes: { eyebrow: "", h2: "", intro: "", palestrantes: [], nota: "" },
  diferenciais: { eyebrow: "", h2: "", diferenciais: [] },
```

new_string:
```
  visaoGeral: {
    eyebrow: "Resumo executivo",
    h2: "O encontro",
    lede: "Três dias intensivos em Brasília reunindo gestores estaduais e municipais de saúde sobre a nova arquitetura de governança e financiamento do SUS — com diagnóstico estruturado, modelos institucionais consolidados e construção de planos aplicados.",
    paragrafos: [
      `O Seminário PROSUS+ Brasília 2026 é a edição executiva do programa estratégico <strong>PROSUS+ — Governança, Financiamento e Performance no SUS</strong>. Reúne secretários estaduais e municipais, diretores de redes assistenciais, coordenadores de planejamento e lideranças técnicas para discutir, ao longo de três dias, os desafios contemporâneos da gestão do Sistema Único de Saúde.`,
      "A edição 2026 traz como eixos centrais a nova arquitetura de financiamento federal, os modelos de pagamento por performance, a articulação assistencial regional e o uso de tecnologia e dados para tomada de decisão. O formato presencial em Brasília favorece o networking executivo qualificado entre gestores de toda a federação.",
    ],
  },

  publico: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para lideranças com poder de decisão nas redes públicas de saúde:",
    chips: [
      { texto: "Secretários estaduais de saúde" },
      { texto: "Secretários municipais de saúde" },
      { texto: "Gestores de redes assistenciais" },
      { texto: "Diretores de hospitais públicos" },
      { texto: "Coordenadores de planejamento e financiamento" },
      { texto: "Lideranças técnicas do SUS" },
      { texto: "Gestores de UPA e UBS" },
      { texto: "Equipes de governo e assessoria estratégica" },
    ],
  },

  objetivos: {
    eyebrow: "O que entregamos",
    h2: "Objetivos do seminário",
    objetivos: [
      { texto: "Diagnosticar os principais desafios contemporâneos da governança do SUS, com leitura institucional e perspectiva de federação." },
      { texto: "Apresentar a nova arquitetura de financiamento federal e seus impactos diretos para gestões estaduais e municipais." },
      { texto: "Discutir indicadores de performance institucional aplicáveis à gestão da saúde pública e modelos de pagamento por resultado." },
      { texto: "Construir, com cada participante, um plano aplicado de governança e financiamento para sua instituição de origem." },
      { texto: "Promover networking executivo qualificado entre lideranças do SUS de diferentes regiões, esferas e perfis institucionais." },
    ],
  },

  conteudoProgramatico: {
    eyebrow: "Estrutura",
    h2: "Conteúdo programático",
    intro: "O conteúdo é distribuído em sete eixos temáticos complementares, articulados ao longo dos três dias:",
    itens: [
      { num: "01", texto: "Governança contemporânea do SUS — estrutura institucional, atores estratégicos e marcos regulatórios." },
      { num: "02", texto: "Financiamento da saúde pública — novos blocos, transferências federais e modelos de pagamento." },
      { num: "03", texto: "Performance institucional — indicadores, metas e metodologias de monitoramento." },
      { num: "04", texto: "Atenção primária e redes de cuidado — articulação assistencial e governança regional." },
      { num: "05", texto: "Tecnologia e dados em saúde — instrumentos de gestão e tomada de decisão baseada em evidências." },
      { num: "06", texto: "Estudos de caso brasileiros — boas práticas em estados e municípios de diferentes portes." },
      { num: "07", texto: "Construção dos planos institucionais — sessão prática orientada à aplicação dos conteúdos." },
    ],
  },

  programacao: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Três dias com programação executiva, almoços institucionais, mesas-redondas com gestores e construção orientada de planos institucionais.",
    dias: [
      {
        dateBig: "5 de junho",
        dateSub: "Quinta-feira · 2026",
        dayTag: "Dia 1",
        rows: [
          { time: "08:00 — 09:00", titulo: "Credenciamento e abertura institucional", descricao: "Boas-vindas pela Coordenação Científica e enquadramento dos três dias." },
          { time: "09:00 — 12:00", titulo: "Módulo 1 · Governança contemporânea do SUS", descricao: "Estrutura institucional, atores estratégicos e marcos regulatórios atualizados." },
          { time: "12:00 — 14:00", titulo: "Almoço institucional", descricao: "Networking executivo orientado por mesas temáticas." },
          { time: "14:00 — 17:00", titulo: "Módulo 2 · Financiamento da saúde pública", descricao: "Novos blocos, transferências federais e modelos de pagamento." },
          { time: "17:00 — 18:00", titulo: "Mesa-redonda · Secretários estaduais", descricao: "Diálogo entre gestores estaduais sobre desafios e soluções de governança." },
        ],
      },
      {
        dateBig: "6 de junho",
        dateSub: "Sexta-feira · 2026",
        dayTag: "Dia 2",
        rows: [
          { time: "09:00 — 12:00", titulo: "Módulo 3 · Performance institucional e indicadores", descricao: "Indicadores, metas e metodologias de monitoramento aplicáveis à gestão da saúde." },
          { time: "12:00 — 14:00", titulo: "Almoço institucional", descricao: "Networking executivo continuado." },
          { time: "14:00 — 17:00", titulo: "Módulo 4 · Atenção primária e redes de cuidado", descricao: "Articulação assistencial regional e governança das redes públicas." },
          { time: "17:00 — 18:00", titulo: "Estudo de caso · Sistema estadual", descricao: "Apresentação de experiência institucional consolidada e debate aberto." },
        ],
      },
      {
        dateBig: "7 de junho",
        dateSub: "Sábado · 2026",
        dayTag: "Dia 3",
        rows: [
          { time: "09:00 — 12:00", titulo: "Módulo 5 · Tecnologia e dados em saúde", descricao: "Instrumentos de gestão e tomada de decisão baseada em evidências." },
          { time: "12:00 — 13:00", titulo: "Construção dos planos institucionais", descricao: "Sessão prática orientada à aplicação dos conteúdos nas instituições dos participantes." },
          { time: "13:00 — 14:00", titulo: "Encerramento · Almoço de rede", descricao: "Síntese, próximos passos e construção de comunidade entre participantes." },
        ],
      },
    ],
  },

  palestrantes: {
    eyebrow: "Quem ensina",
    h2: "Coordenação científica e especialistas",
    intro: "Coordenação dedicada à edição, com participação de especialistas convidados de diferentes regiões e instituições do SUS.",
    palestrantes: [
      {
        foto: "/img/fotos/_optimized/expert-04.1920.webp",
        role: "Coordenação Científica",
        nome: "NTC Saúde",
        credenciais: "Direção científica do programa PROSUS+ · Especialista em gestão do SUS, governança digital e financiamento da saúde pública.",
      },
      {
        foto: "/img/fotos/_optimized/expert-03.1920.webp",
        role: "Especialista convidado",
        nome: "Financiamento federal",
        credenciais: "Atuação em transferências federais, blocos de financiamento e modelos de pagamento por performance no SUS.",
      },
      {
        foto: "/img/fotos/_optimized/expert-02.1920.webp",
        role: "Especialista convidada",
        nome: "Atenção primária e redes",
        credenciais: "Trajetória em coordenação de redes de cuidado, articulação regional e fortalecimento da APS.",
      },
    ],
    nota: "Nomes, fotos e currículos completos dos especialistas confirmados serão publicados via CMS.",
  },

  diferenciais: {
    eyebrow: "Por que participar",
    h2: "Diferenciais do seminário",
    diferenciais: [
      { num: "01", titulo: "Encontro presencial qualificado", descricao: "Reúne gestores de toda a federação em formato executivo dedicado a tomadores de decisão." },
      { num: "02", titulo: "Conteúdo aplicado à realidade do SUS", descricao: "Cada eixo temático parte de problemas concretos da Administração Pública brasileira em saúde." },
      { num: "03", titulo: "Construção de plano institucional", descricao: "Cada participante constrói um plano aplicado para sua instituição de origem ao longo dos três dias." },
      { num: "04", titulo: "Networking executivo orientado", descricao: "Almoços institucionais com mesas temáticas curadas e tempo dedicado a relacionamentos estratégicos." },
      { num: "05", titulo: "Material editorial completo", descricao: "Cadernos institucionais NTC com conteúdo programático, leituras complementares e templates aplicáveis." },
      { num: "06", titulo: "Replay e certificado", descricao: "Acesso ao replay da edição por 90 dias após o evento, no EventOn, com certificado validável." },
    ],
  },
```

Nota: `palestrantes.palestrantes[].foto` foi convertido para `/img/...` (rota absoluta Next).

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona sub-seções principais do PROSUS Brasília

Preenche visaoGeral (lede + 2 paragrafos com <strong>), publico (8 chips),
objetivos (5 li), conteudoProgramatico (7 itens), programacao (3 dias com
5+4+3 schedule-rows), palestrantes (3 + nota placeholder), diferenciais (6).

Imagens dos palestrantes convertidas para /img/fotos/_optimized/expert-0X.1920.webp.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `conteudoEventos.ts` parte 4 — sub-seções restantes (local+replayCert+investimento+faq+ctaFinal+sidebar+relatedEvents+agendaIcs)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1: Substituir os placeholders restantes**

Edit. old_string:
```
  local: {
    eyebrow: "",
    h2: "",
    venueInfo: { titulo: "", enderecoLinhas: [], meta: "", hospedagemHtml: "" },
    mapLabel: "",
    pinLabel: "",
  },
  replayCert: { eyebrow: "", h2: "", cards: [] },
  investimento: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    tituloCard: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: { titulo: "", descricao: "", location: "", startISO: "", endISO: "", filename: "" },
};
```

new_string:
```
  local: {
    eyebrow: "Onde acontece",
    h2: "Local do seminário",
    venueInfo: {
      titulo: "Hotel sede · Brasília · DF",
      enderecoLinhas: [
        "Setor Hoteleiro Sul · Asa Sul",
        "Brasília · Distrito Federal",
        "Endereço completo confirmado nos e-mails de credenciamento",
      ],
      meta: "Estacionamento institucional · Fácil acesso ao Eixo Monumental · 15 min do Aeroporto JK",
      hospedagemHtml: "A NTC tem desconto institucional negociado com hotéis-rede em Brasília. Após a confirmação da inscrição, os participantes recebem orientações de hospedagem e logística.",
    },
    mapLabel: "Brasília · DF · Asa Sul",
    pinLabel: "Brasília · DF · Asa Sul",
  },

  replayCert: {
    eyebrow: "Acesso pós-evento",
    h2: "Replay e certificação",
    cards: [
      {
        icone: "↻",
        titulo: "Replay da edição",
        descricao: "Disponível por 90 dias após o evento na plataforma EventOn, exclusivo para participantes inscritos. Acesso por login institucional.",
      },
      {
        icone: "⌬",
        titulo: "Certificado validável",
        descricao: "Emissão automática 7 dias após o evento, mediante presença mínima de 75%. Validação pública por código QR na plataforma.",
      },
    ],
  },

  investimento: {
    eyebrow: "Política comercial",
    h2: "Regras de inscrição e investimento",
    h2Id: "regras",
    rules: [
      "Inscrições abertas até 30 de maio de 2026 ou enquanto houver vagas disponíveis.",
      "Política de cancelamento sem ônus até 7 dias antes do início do evento.",
      "Desconto institucional de 10% para grupos de 3 a 5 participantes da mesma instituição.",
      "Para inscrição de equipes acima de 5 participantes, condição comercial dedicada — solicitar proposta para grupo.",
      "Pagamento via PIX, boleto, cartão de crédito (até 6× sem juros) ou empenho institucional para órgãos públicos.",
      "Para órgãos públicos: emissão de nota fiscal com CNPJ direto da instituição, conforme regras de empenho e contratação.",
      "Não inclui hospedagem nem deslocamento aéreo. Material editorial e almoços institucionais inclusos.",
      "Em caso de cancelamento pela NTC por força maior, reembolso integral em até 10 dias úteis.",
    ],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    h2: "FAQ",
    faqs: [
      {
        id: "evento-faq-1",
        pergunta: "O evento aceita inscrições de equipe?",
        respostaHtml: "<p>Sim. Equipes de 3 a 5 participantes da mesma instituição recebem desconto de 10%. Acima de 5 participantes, a NTC oferece condição comercial dedicada — basta solicitar proposta para grupo no botão lateral.</p>",
      },
      {
        id: "evento-faq-2",
        pergunta: "Como funciona a inscrição institucional para órgãos públicos?",
        respostaHtml: "<p>Para órgãos públicos, emitimos nota fiscal direta no CNPJ da instituição contratante. Aceitamos empenho, dispensa de licitação por valor (quando aplicável) e demais modalidades previstas em lei. A equipe comercial NTC apoia o trâmite.</p>",
      },
      {
        id: "evento-faq-3",
        pergunta: "Qual a política de cancelamento?",
        respostaHtml: "<p>Cancelamento sem ônus até 7 dias antes do início do evento. Após esse prazo, o valor pode ser convertido em crédito para outra edição ou outro evento NTC dentro de 12 meses.</p>",
      },
      {
        id: "evento-faq-4",
        pergunta: "Como funciona o replay?",
        respostaHtml: "<p>Os participantes recebem acesso à gravação completa por 90 dias após o evento, no EventOn (plataforma própria do Grupo NTC). Acesso por login institucional individual, com proteção contra compartilhamento.</p>",
      },
      {
        id: "evento-faq-5",
        pergunta: "Como é emitido o certificado?",
        respostaHtml: "<p>O certificado é emitido automaticamente 7 dias após o término do evento, mediante presença mínima de 75% nas atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR.</p>",
      },
      {
        id: "evento-faq-6",
        pergunta: "A inscrição inclui hospedagem?",
        respostaHtml: "<p>Não. A inscrição inclui credenciamento, conteúdo dos três dias, material editorial NTC, almoços institucionais, replay e certificado. Hospedagem e deslocamento são por conta do participante. A NTC indica hotéis-rede com desconto institucional.</p>",
      },
      {
        id: "evento-faq-7",
        pergunta: "Como solicitar uma turma fechada para minha instituição?",
        respostaHtml: "<p>A NTC desenvolve turmas fechadas in company para secretarias, autarquias e órgãos públicos. O conteúdo pode ser entregue na sede da instituição ou em formato online dedicado. Solicite proposta institucional pelo botão lateral.</p>",
      },
    ],
  },

  ctaFinal: {
    eyebrowGold: "Próximo passo",
    h2: "Garanta sua participação no Seminário PROSUS+ Brasília 2026.",
    paragrafo: "Vagas limitadas. Inscrições abertas até 30 de maio de 2026 ou enquanto houver vagas disponíveis.",
    ctas: [
      {
        texto: "Inscrever-se agora",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "proposta-grupo-PROSUS",
        classe: "btn btn--secondary",
      },
    ],
  },

  sidebar: {
    coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
    status: "Últimas vagas",
    tituloCard: "Inscrição · Edição 2026",
    rows: [
      { label: "Quando", value: "5 a 7 · Junho · 2026" },
      { label: "Onde", value: "Brasília · DF" },
      { label: "Modalidade", value: "Presencial · 20 horas" },
      { label: "Individual", value: "R$ 2.890", price: true },
      { label: "Equipes / órgãos", value: "Sob consulta" },
    ],
    includes: {
      titulo: "O que está incluído",
      items: [
        "Conteúdo presencial dos 3 dias",
        "Material editorial NTC",
        "Almoços institucionais",
        "Replay por 90 dias no EventOn",
        "Certificado validável",
        "Networking executivo curado",
      ],
    },
    countdown: {
      label: "Prazo de inscrição",
      dateText: "Até 29 de Maio de 2026",
      deadline: "2026-05-29T23:59:59-03:00",
      tipo: "numerico",
    },
    acoes: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "inscricao-equipe-PROSUS",
        classe: "btn btn--secondary",
      },
    ],
    share: {
      label: "Compartilhar:",
      links: [
        { texto: "WhatsApp", href: "#", cmsLink: "share-whatsapp" },
        { texto: "E-mail", href: "#", cmsLink: "share-email" },
        { texto: "LinkedIn", href: "#", cmsLink: "share-linkedin" },
      ],
    },
  },

  relatedEvents: {
    eyebrowGold: "Também na vertical",
    h2: "Outros eventos da NTC Saúde",
    intro: "Edições e módulos abertos vinculados aos programas <strong>PROSUS+</strong>, <strong>PROAPS+</strong> e <strong>SIGS</strong> nas próximas semanas.",
    cards: [
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "range", days: "02", dash: "–", monYr: "Jul · 2026" },
        program: "Simpósio · NTC Saúde",
        titulo: "Alta performance na atenção primária e redes de cuidado",
        programBinding: "PROAPS+",
        metaHtml: "Online · 16h · 2 dias <strong>R$ 1.490</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-PROAPS-2026-jul",
          classe: "es-cta",
        },
      },
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "multi", count: "encontros", number: "4", period: "Jul · 2026" },
        program: "Curso Executivo · NTC Saúde",
        titulo: "Saúde inteligente, dados e governança digital no SUS",
        programBinding: "SIGS",
        metaHtml: "Híbrido · DF · 24h <strong>R$ 2.290</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-SIGS-2026-jul",
          classe: "es-cta",
        },
      },
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "range", days: "14", dash: "–", monYr: "Ago · 2026" },
        program: "Oficina · NTC Saúde",
        titulo: "Financiamento e indicadores de performance no SUS — fundamentos aplicados",
        programBinding: "PROSUS+",
        metaHtml: "Online · 16h · 2 dias <strong>R$ 1.690</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-PROSUS-2026-ago",
          classe: "es-cta",
        },
      },
    ],
    footerCtas: [
      {
        texto: "Ver agenda completa",
        href: "/capacitacao",
        cmsLink: "agenda-completa",
        classe: "btn btn--primary",
        arrow: true,
      },
      {
        texto: "Solicitar proposta institucional",
        href: "/solucoes#contratacao-institucional",
        cmsLink: "proposta-institucional",
        classe: "btn btn--secondary",
      },
    ],
  },

  agendaIcs: {
    titulo: "Seminário PROSUS+ Brasília 2026",
    descricao: "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",
    location: "Setor Hoteleiro Sul · Asa Sul, Brasília · Distrito Federal",
    startISO: "20260605T120000Z",
    endISO: "20260607T210000Z",
    filename: "prosus-brasilia-2026.ics",
  },
};
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts" && git commit -m "$(cat <<'EOF'
feat(evento): completa PROSUS Brasília — local+replay+regras+faq+cta+sidebar+related+ics

local (Brasília · DF, hospedagem orientativa), replayCert (2 cards com icons
unicode ↻ ⌬), investimento (8 rules, h2 com id "regras"), faq (7 itens
evento-faq-1 a -7), ctaFinal (2 CTAs), sidebar (5 rows, 6 includes, countdown
numerico deadline 2026-05-29, 2 acoes, 3 share links), relatedEvents (3 cards
sau com variants range/multi/range, 2 footer CTAs), agendaIcs (Z-format UTC).

PROSUS Brasília agora 100% literal pronto para consumo pelo Layout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Criar `FaqEvento.tsx` client component

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/FaqEvento.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/FaqEvento.tsx`:

```tsx
"use client";

import { useState } from "react";

import type { ItemFaqEvento } from "./conteudoEventos";

/**
 * FAQ accordion da página /agenda/[slug]. Espelha o IIFE 5 do protótipo
 * (linhas ~2960-2980 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <p>, <strong>).
 *
 * Mesmo padrão de FaqCapacitacao adaptado às classes .faq-item / .faq-question
 * / .faq-answer / .faq-answer-inner.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqEventoProps {
  itens: ItemFaqEvento[];
}

export function FaqEvento({ itens }: FaqEventoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("evento_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
      return next;
    });
  };

  return (
    <>
      {itens.map((item) => {
        const aberto = abertos.has(item.id);
        return (
          <div
            key={item.id}
            className={`faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="faq-question"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              {item.pergunta}
            </button>
            <div className="faq-answer" id={item.id}>
              <div
                className="faq-answer-inner"
                dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
```

Nota: no HTML protótipo o `<button class="faq-question">` contém só texto da pergunta (não `<h3>` como na Capacitação). Mantido fiel.

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa. Warnings `_action`/`_payload` esperados.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/FaqEvento.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona FaqEvento client component

Padrão FaqCapacitacao adaptado: classes .faq-item / .faq-question /
.faq-answer / .faq-answer-inner; pergunta como texto direto do button
(sem h3 wrapper, fiel ao HTML protótipo). Set<string> ids abertos,
aria-expanded reativo, respostaHtml via dangerouslySetInnerHTML.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Criar `CountdownSidebar.tsx` client component

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/CountdownSidebar.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/CountdownSidebar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Countdown da sidebar do evento. Espelha o IIFE 8 do protótipo
 * (linhas ~3100-3170 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Lê deadline ISO + tipo "numerico" | "textual".
 * - setInterval(60_000) atualiza dias/horas/minutos.
 * - SSR-safe: render inicial com "—"/"0" para evitar hydration mismatch.
 * - Cleanup limpa interval no unmount.
 *
 * Se deadline já passou, mostra "Inscrições encerradas".
 */

interface CountdownSidebarProps {
  label: string;
  dateText: string;
  deadline: string;
  tipo: "numerico" | "textual";
}

interface Tempo {
  d: number;
  h: number;
  m: number;
  expirado: boolean;
}

function calcular(deadline: string): Tempo {
  const alvo = new Date(deadline).getTime();
  const agora = Date.now();
  const diff = alvo - agora;
  if (diff <= 0) return { d: 0, h: 0, m: 0, expirado: true };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { d, h, m, expirado: false };
}

export function CountdownSidebar({ label, dateText, deadline, tipo }: CountdownSidebarProps) {
  const [tempo, setTempo] = useState<Tempo | null>(null);

  useEffect(() => {
    setTempo(calcular(deadline));
    const id = window.setInterval(() => {
      setTempo(calcular(deadline));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const d = tempo?.d ?? 0;
  const h = tempo?.h ?? 0;
  const m = tempo?.m ?? 0;
  const expirado = tempo?.expirado ?? false;

  return (
    <div
      className="sidebar-countdown"
      id="sidebarCountdown"
      data-deadline={deadline}
      data-tipo={tipo}
    >
      <div className="sidebar-cd-label">{label}</div>
      <div className="sidebar-cd-date">{dateText}</div>

      {expirado ? (
        <div className="sidebar-cd-text" style={{ display: "block" }}>
          <strong>Inscrições encerradas</strong>
        </div>
      ) : tipo === "numerico" ? (
        <div className="sidebar-cd-counter" id="sidebarCdCounter">
          <div className="item">
            <span className="num" data-cd="d">{tempo ? d : "—"}</span>
            <span className="lbl">dias</span>
          </div>
          <div className="item">
            <span className="num" data-cd="h">{tempo ? h : "—"}</span>
            <span className="lbl">horas</span>
          </div>
          <div className="item">
            <span className="num" data-cd="m">{tempo ? m : "—"}</span>
            <span className="lbl">min</span>
          </div>
        </div>
      ) : (
        <div className="sidebar-cd-text" id="sidebarCdText">
          Faltam <strong>{tempo ? d : "—"}</strong> dias
        </div>
      )}
    </div>
  );
}
```

Nota: ao renderizar SSR, `tempo === null`, então mostra `—` em todos os slots. Após mount, primeira `setTempo` roda no useEffect e o React re-renderiza com valores reais. Hydration mismatch evitado.

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/CountdownSidebar.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona CountdownSidebar client component

Espelha o IIFE de countdown do protótipo: lê deadline ISO + tipo
numerico|textual, setInterval(60_000) atualiza d/h/m. SSR-safe:
render inicial "—" antes do mount; useEffect calcula valor real
e re-renderiza. Cleanup limpa interval. Mostra "Inscrições
encerradas" se deadline passou.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `AgendaDropdown.tsx` client component

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/AgendaDropdown.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/AgendaDropdown.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import type { EventoBase } from "./conteudoEventos";

/**
 * Dropdown "Adicionar à agenda" do subnav. Espelha o IIFE 7 do protótipo
 * (linhas ~3015-3095 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Toggle abre/fecha dropdown.
 * - Click fora ou Escape fecha.
 * - 4 links: Google Calendar, Outlook, Apple (.ics download), generic .ics.
 * - URLs geradas dinamicamente com base em agendaIcs.
 */

interface AgendaDropdownProps {
  dados: EventoBase["agendaIcs"];
}

function gerarUrlGoogle(d: EventoBase["agendaIcs"]): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: d.titulo,
    dates: `${d.startISO}/${d.endISO}`,
    details: d.descricao,
    location: d.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarUrlOutlook(d: EventoBase["agendaIcs"]): string {
  // Converte Z para formato ISO completo
  const start = `${d.startISO.slice(0, 4)}-${d.startISO.slice(4, 6)}-${d.startISO.slice(6, 11)}:${d.startISO.slice(11, 13)}:${d.startISO.slice(13, 15)}Z`;
  const end = `${d.endISO.slice(0, 4)}-${d.endISO.slice(4, 6)}-${d.endISO.slice(6, 11)}:${d.endISO.slice(11, 13)}:${d.endISO.slice(13, 15)}Z`;
  const params = new URLSearchParams({
    subject: d.titulo,
    body: d.descricao,
    startdt: start,
    enddt: end,
    location: d.location,
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function gerarIcs(d: EventoBase["agendaIcs"]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo NTC//Eventos//PT",
    "BEGIN:VEVENT",
    `UID:${d.filename}@gruponctc.org.br`,
    `DTSTAMP:${d.startISO}`,
    `DTSTART:${d.startISO}`,
    `DTEND:${d.endISO}`,
    `SUMMARY:${d.titulo}`,
    `DESCRIPTION:${d.descricao.replace(/\n/g, "\\n")}`,
    `LOCATION:${d.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function AgendaDropdown({ dados }: AgendaDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onClickFora = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("click", onClickFora);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onClickFora);
      document.removeEventListener("keydown", onEscape);
    };
  }, [aberto]);

  const urlGoogle = gerarUrlGoogle(dados);
  const urlOutlook = gerarUrlOutlook(dados);
  const icsUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(gerarIcs(dados))}`;

  const id = `agendaWrap-${dados.filename.replace(/\.ics$/, "")}`;
  const toggleId = `agendaToggle-${dados.filename.replace(/\.ics$/, "")}`;

  return (
    <div className="evt-nav-action-wrap" id={id} ref={wrapRef}>
      <button
        type="button"
        className="evt-nav-action"
        id={toggleId}
        aria-haspopup="true"
        aria-expanded={aberto}
        onClick={(e) => {
          e.stopPropagation();
          setAberto((v) => !v);
        }}
      >
        Adicionar à agenda
      </button>
      {aberto && (
        <div className="evt-agenda-dropdown" role="menu">
          <a
            href={urlGoogle}
            target="_blank"
            rel="noopener noreferrer"
            data-cms-link="cal-google"
          >
            Google Calendar
          </a>
          <a
            href={urlOutlook}
            target="_blank"
            rel="noopener noreferrer"
            data-cms-link="cal-outlook"
          >
            Outlook
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-apple"
          >
            Apple Calendar (.ics)
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-ics"
          >
            Baixar arquivo .ics
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/AgendaDropdown.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona AgendaDropdown client component

Dropdown "Adicionar à agenda" com geração dinâmica de URL Google
Calendar (URLSearchParams), URL Outlook Live (com ISO completo) e
data URI ICS (string VCALENDAR encodada). Click fora + Escape fecham.
4 links: Google, Outlook, Apple (.ics), .ics genérico.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Criar `EventoSubnav.tsx` client component

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/EventoSubnav.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/EventoSubnav.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { AgendaDropdown } from "./AgendaDropdown";
import type { EventoBase, NavLink } from "./conteudoEventos";

/**
 * Subnav interno do evento com scroll-spy. Espelha o IIFE 6 do protótipo
 * (linhas ~2985-3010 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - IntersectionObserver com rootMargin: '-30% 0px -55% 0px', threshold: 0.
 * - Adiciona is-active ao link cuja seção está visível.
 * - Sticky vem do CSS (.evt-nav: position: sticky).
 *
 * Ações: 1 botão Inscrever-se (scrolla para #contato), 1 link Baixar folder,
 * 1 AgendaDropdown.
 */

interface EventoSubnavProps {
  links: NavLink[];
  folderHref: string;
  folderCmsLink: string;
  inscricaoCmsLink: string;
  agendaIcs: EventoBase["agendaIcs"];
}

export function EventoSubnav({
  links,
  folderHref,
  folderCmsLink,
  inscricaoCmsLink,
  agendaIcs,
}: EventoSubnavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    links.find((l) => l.isActive)?.href.slice(1) ?? null,
  );

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, [links]);

  const onClickInscrever = () => {
    const alvo = document.getElementById("contato");
    if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="evt-nav" aria-label="Navegação interna do evento">
      <div className="container evt-nav-inner">
        <div className="evt-nav-anchors" role="tablist">
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`evt-nav-link${ativo ? " is-active" : ""}`}
                aria-current={ativo ? "location" : undefined}
              >
                {link.texto}
              </a>
            );
          })}
        </div>
        <div className="evt-nav-actions">
          <button
            type="button"
            className="evt-nav-action primary"
            data-cms-link={inscricaoCmsLink}
            onClick={onClickInscrever}
          >
            Inscrever-se
          </button>
          <a
            href={folderHref}
            className="evt-nav-action"
            data-cms-link={folderCmsLink}
          >
            Baixar folder
          </a>
          <AgendaDropdown dados={agendaIcs} />
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoSubnav.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): adiciona EventoSubnav client component

Scroll-spy via IntersectionObserver (rootMargin -30%/-55%) marcando
.is-active + aria-current no link da seção visível. Sticky vem do
CSS portado. 3 ações: botão Inscrever-se (scrolla para #contato),
link Baixar folder, AgendaDropdown integrado.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Criar `EventoPresencialLayout.tsx` parte 1 — breadcrumb + hero + meta-bar + subnav + visão geral + público + objetivos

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx`

- [ ] **Step 1: Criar o arquivo com header + 7 primeiras seções**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx`:

```tsx
import { Fragment } from "react";

import type { EventoPresencial } from "./conteudoEventos";
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";

/**
 * Layout de evento presencial — porta literal de 03_Pagina_Evento_PROSUS_Brasilia_v3.html.
 *
 * Espelho do <main id="main" class="event-page" data-evento="..."> do protótipo,
 * linhas 2325-2846. 16 blocos editoriais + sidebar + related events.
 *
 * Header/Footer/InteracoesScroll vêm de (capacitacao)/layout.tsx já existente.
 */
interface EventoPresencialLayoutProps {
  evento: EventoPresencial;
}

export function EventoPresencialLayout({ evento }: EventoPresencialLayoutProps) {
  const inscricaoCmsLink = evento.hero.ctas[0]?.cmsLink ?? "inscricao";
  const folderCta = evento.hero.ctas[1];

  return (
    <main id="main" className="event-page" data-evento={evento.slug}>
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {evento.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                <li>
                  {c.href ? (
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  ) : (
                    <span className="current">{c.texto}</span>
                  )}
                </li>
                {i < evento.crumb.length - 1 && (
                  <li className="sep" aria-hidden="true">/</li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section
        className="event-hero"
        aria-label={`${evento.titulo} ${evento.dataEvento}`}
      >
        <div className="event-hero-bg" aria-hidden="true" />
        <div className="container event-hero-content fade-in">
          <div className="event-hero-tags">
            {evento.hero.tags.map((tag, i) => (
              <span key={i} className={tag.classe}>{tag.texto}</span>
            ))}
          </div>
          <h1>{evento.hero.h1}</h1>
          <p className="event-hero-sub">{evento.hero.sub}</p>
          <div className="event-hero-program-binding">
            <span>{evento.hero.programBinding.texto}</span>
            <strong>
              <a
                href={evento.hero.programBinding.href}
                data-cms-link={evento.hero.programBinding.cmsLink}
              >
                {evento.hero.programBinding.nomePrograma}
              </a>
            </strong>
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "24px",
            }}
          >
            {evento.hero.ctas.map((cta, i) => (
              <a
                key={i}
                className={cta.classe}
                href={cta.href}
                data-cms-link={cta.cmsLink}
              >
                {cta.texto}
                {cta.arrow && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. META-BAR */}
      <section className="event-meta-bar" aria-label="Informações principais do evento">
        <div className="container">
          <div className="event-meta-bar-grid fade-in">
            {evento.metas.map((meta, i) => (
              <div key={i} className="event-meta-item">
                <span className="label">{meta.label}</span>
                <span className="value">{meta.value}</span>
                <span className="value-sub">{meta.valueSub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUBNAV (client) */}
      <EventoSubnav
        links={evento.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={evento.agendaIcs}
      />

      {/* 5. EVENT-LAYOUT (2-col grid) */}
      <section className="event-layout">
        <div className="container">
          <div className="event-layout-grid">
            <div className="event-main-content">
              {/* 5.1 VISÃO GERAL */}
              <article className="event-section fade-in" id="visao-geral">
                <p className="eyebrow">{evento.visaoGeral.eyebrow}</p>
                <h2>{evento.visaoGeral.h2}</h2>
                <p className="lede-block">{evento.visaoGeral.lede}</p>
                {evento.visaoGeral.paragrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </article>

              {/* 5.2 PÚBLICO */}
              <article className="event-section fade-in" id="publico">
                <p className="eyebrow">{evento.publico.eyebrow}</p>
                <h2>{evento.publico.h2}</h2>
                <p>{evento.publico.intro}</p>
                <div className="audience-chips">
                  {evento.publico.chips.map((chip, i) => (
                    <span key={i}>{chip.texto}</span>
                  ))}
                </div>
              </article>

              {/* 5.3 OBJETIVOS (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.objetivos.eyebrow}</p>
                <h2>{evento.objetivos.h2}</h2>
                <ol className="objective-list">
                  {evento.objetivos.objetivos.map((o, i) => (
                    <li key={i}>{o.texto}</li>
                  ))}
                </ol>
              </article>

              {/* PARTES SEGUINTES — Task 12 */}
            </div>

            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED EVENTS — Task 13 */}
    </main>
  );
}
```

Nota: comentários `Task 12` e `Task 13` marcam onde inserir conteúdo nas próximas tasks. **`noUnusedLocals` pode reclamar de `CountdownSidebar` e `FaqEvento` (importados mas não usados nesta task)**. Para evitar isso, vamos remover esses imports daqui e adicioná-los apenas nas tasks que os usam:

Edit. old_string:
```
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";
```

new_string:
```
import { EventoSubnav } from "./EventoSubnav";
```

(`CountdownSidebar` e `FaqEvento` entrarão nas Tasks 12 e 13.)

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): cria EventoPresencialLayout (parte 1) — breadcrumb+hero+meta+subnav+visão+público+objetivos

Estrutura inicial do layout: <main id="main" class="event-page"> com
breadcrumb (ol.breadcrumb-list com .sep entre li), event-hero (tags
coloridas + h1 + sub + program binding + 3 CTAs inline), event-meta-bar
(5 itens label/value/value-sub), <EventoSubnav /> e abertura do
event-layout-grid com 3 primeiras sub-seções (visão geral + público
com chips + objetivos).

Próximos commits adicionam: programação, palestrantes, diferenciais,
local, replay+cert, regras, FAQ, CTA final, sidebar e related events.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `EventoPresencialLayout.tsx` parte 2 — conteúdo programático + programação + palestrantes + diferenciais + local + replay/cert + investimento + FAQ + CTA final

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx`

- [ ] **Step 1: Adicionar import de FaqEvento**

Edit. old_string:
```
import { EventoSubnav } from "./EventoSubnav";
```

new_string:
```
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";
```

- [ ] **Step 2: Substituir marcador `{/* PARTES SEGUINTES — Task 12 */}`**

Edit. old_string:
```
              {/* PARTES SEGUINTES — Task 12 */}
            </div>

            {/* SIDEBAR — Task 13 */}
```

new_string:
```
              {/* 5.4 CONTEÚDO PROGRAMÁTICO (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.conteudoProgramatico.eyebrow}</p>
                <h2>{evento.conteudoProgramatico.h2}</h2>
                <p>{evento.conteudoProgramatico.intro}</p>
                <div className="program-content">
                  {evento.conteudoProgramatico.itens.map((item, i) => (
                    <div key={i} className="program-content-item">
                      <span className="num">{item.num}</span>
                      <span className="text">{item.texto}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.5 PROGRAMAÇÃO */}
              <article className="event-section fade-in" id="programacao">
                <p className="eyebrow">{evento.programacao.eyebrow}</p>
                <h2>{evento.programacao.h2}</h2>
                <p>{evento.programacao.intro}</p>
                {evento.programacao.dias.map((dia, i) => (
                  <div key={i} className="schedule-day">
                    <div className="schedule-day-head">
                      <span className="date-big">{dia.dateBig}</span>
                      <span className="date-sub">{dia.dateSub}</span>
                      <span className="day-tag">{dia.dayTag}</span>
                    </div>
                    <div className="schedule-rows">
                      {dia.rows.map((row, j) => (
                        <div key={j} className="schedule-row">
                          <span className="time">{row.time}</span>
                          <div className="activity">
                            <strong>{row.titulo}</strong>
                            <span>{row.descricao}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </article>

              {/* 5.6 PALESTRANTES */}
              <article className="event-section fade-in" id="palestrantes">
                <p className="eyebrow">{evento.palestrantes.eyebrow}</p>
                <h2>{evento.palestrantes.h2}</h2>
                <p>{evento.palestrantes.intro}</p>
                <div className="speakers-detailed">
                  {evento.palestrantes.palestrantes.map((p, i) => (
                    <article key={i} className="speaker-detail-card">
                      <div className="speaker-detail-portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.foto} alt={p.nome} loading="lazy" />
                      </div>
                      <div className="speaker-detail-info">
                        <span className="role">{p.role}</span>
                        <h3>{p.nome}</h3>
                        <p className="cred">{p.credenciais}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <p
                  className="placeholder-note"
                  style={{
                    fontFamily: "var(--font-cond)",
                    fontSize: "12px",
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                    color: "var(--grafite)",
                    marginTop: "var(--space-3)",
                  }}
                >
                  {evento.palestrantes.nota}
                </p>
              </article>

              {/* 5.7 DIFERENCIAIS (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.diferenciais.eyebrow}</p>
                <h2>{evento.diferenciais.h2}</h2>
                <div className="event-differentials">
                  {evento.diferenciais.diferenciais.map((d, i) => (
                    <div key={i} className="event-diff-card">
                      <span className="diff-num">{d.num}</span>
                      <div className="diff-body">
                        <h4>{d.titulo}</h4>
                        <p>{d.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.8 LOCAL (só presencial) */}
              <article className="event-section fade-in" id="local">
                <p className="eyebrow">{evento.local.eyebrow}</p>
                <h2>{evento.local.h2}</h2>
                <div className="venue-grid">
                  <div className="venue-info">
                    <h4>{evento.local.venueInfo.titulo}</h4>
                    <address>
                      {evento.local.venueInfo.enderecoLinhas.map((linha, i) => (
                        <Fragment key={i}>
                          {linha}
                          {i < evento.local.venueInfo.enderecoLinhas.length - 1 && <br />}
                        </Fragment>
                      ))}
                    </address>
                    <p className="venue-meta">{evento.local.venueInfo.meta}</p>
                    <p
                      style={{
                        marginTop: "var(--space-3)",
                        fontSize: "14px",
                        color: "var(--grafite)",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: evento.local.venueInfo.hospedagemHtml,
                      }}
                    />
                  </div>
                  <div
                    className="venue-map"
                    aria-label={`Mapa institucional · ${evento.local.mapLabel}`}
                  >
                    <div className="pin" />
                    <span className="map-label">{evento.local.pinLabel}</span>
                  </div>
                </div>
              </article>

              {/* 5.9 REPLAY E CERTIFICAÇÃO (sem id) */}
              <article className="event-section fade-in">
                <p className="eyebrow">{evento.replayCert.eyebrow}</p>
                <h2>{evento.replayCert.h2}</h2>
                <div className="replay-cert-grid">
                  {evento.replayCert.cards.map((card, i) => (
                    <div key={i} className="replay-cert-card">
                      <span className="icon-line" aria-hidden="true">{card.icone}</span>
                      <h4>{card.titulo}</h4>
                      <p>{card.descricao}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.10 INVESTIMENTO/REGRAS */}
              <article className="event-section fade-in" id="investimento">
                <p className="eyebrow">{evento.investimento.eyebrow}</p>
                <h2 id={evento.investimento.h2Id}>{evento.investimento.h2}</h2>
                <ul className="rules-list">
                  {evento.investimento.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </article>

              {/* 5.11 FAQ */}
              <article className="event-section fade-in" id="faq">
                <p className="eyebrow">{evento.faq.eyebrow}</p>
                <h2>{evento.faq.h2}</h2>
                <div className="faq-list">
                  <FaqEvento itens={evento.faq.faqs} />
                </div>
              </article>

              {/* 5.12 CTA FINAL (sem id) */}
              <article
                className="event-section fade-in"
                style={{ textAlign: "center", paddingTop: "var(--space-6)" }}
              >
                <p className="eyebrow gold">{evento.ctaFinal.eyebrowGold}</p>
                <h2 style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}>
                  {evento.ctaFinal.h2}
                </h2>
                <p>{evento.ctaFinal.paragrafo}</p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "var(--space-3)",
                  }}
                >
                  {evento.ctaFinal.ctas.map((cta, i) => (
                    <a
                      key={i}
                      className={cta.classe}
                      href={cta.href}
                      data-cms-link={cta.cmsLink}
                    >
                      {cta.texto}
                      {cta.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
              </article>
            </div>

            {/* SIDEBAR — Task 13 */}
```

- [ ] **Step 3: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa. Warning de `<img>` esperado e aceitável (consistente com outros prototype components).

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): EventoPresencialLayout (parte 2) — 9 sub-seções editoriais

Adiciona conteudoProgramatico (7 itens), programacao (3 dias com schedule-rows),
palestrantes (3 cards + nota), diferenciais (6 cards), local (venue-grid com
info + map decorativo — só presencial), replayCert (2 cards icons unicode),
investimento (8 rules, h2 com id=regras), faq (<FaqEvento />) e CTA final
centralizado (eyebrow gold + h2 + paragrafo + 2 CTAs).

Próximo commit fecha sidebar e related events.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: `EventoPresencialLayout.tsx` parte 3 — sidebar + related events

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx`

- [ ] **Step 1: Adicionar import de CountdownSidebar**

Edit. old_string:
```
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";
```

new_string:
```
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";
```

- [ ] **Step 2: Substituir marcadores `{/* SIDEBAR — Task 13 */}` e `{/* RELATED EVENTS — Task 13 */}`**

Edit. old_string:
```
            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED EVENTS — Task 13 */}
    </main>
```

new_string:
```
            {/* SIDEBAR */}
            <aside className="event-sidebar" aria-label="Card de inscrição">
              <div className="sidebar-card">
                <div className="sidebar-card-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={evento.sidebar.coverImg} alt="" loading="lazy" />
                  <span className="sidebar-card-status">{evento.sidebar.status}</span>
                </div>
                <div className="sidebar-card-body">
                  <h3>{evento.sidebar.tituloCard}</h3>
                  <div className="sidebar-rows">
                    {evento.sidebar.rows.map((row, i) => (
                      <div
                        key={i}
                        className={`sidebar-row${row.price ? " price" : ""}`}
                      >
                        <span className="label">{row.label}</span>
                        <span className="value">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sidebar-includes">
                  <h4>{evento.sidebar.includes.titulo}</h4>
                  <ul>
                    {evento.sidebar.includes.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <CountdownSidebar
                  label={evento.sidebar.countdown.label}
                  dateText={evento.sidebar.countdown.dateText}
                  deadline={evento.sidebar.countdown.deadline}
                  tipo={evento.sidebar.countdown.tipo}
                />
                <div className="sidebar-actions">
                  {evento.sidebar.acoes.map((acao, i) => (
                    <a
                      key={i}
                      className={acao.classe}
                      href={acao.href}
                      data-cms-link={acao.cmsLink}
                    >
                      {acao.texto}
                      {acao.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
                <div className="sidebar-share">
                  <span>{evento.sidebar.share.label}</span>
                  {evento.sidebar.share.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      data-cms-link={link.cmsLink}
                    >
                      {link.texto}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 6. RELATED EVENTS */}
      <section
        className="related-events-section"
        aria-label={`Outros eventos da vertical ${evento.relatedEvents.h2}`}
      >
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow gold">{evento.relatedEvents.eyebrowGold}</p>
            <h2>{evento.relatedEvents.h2}</h2>
            <p
              className="section-intro"
              dangerouslySetInnerHTML={{ __html: evento.relatedEvents.intro }}
            />
          </div>
          <div className="related-events-grid fade-in">
            {evento.relatedEvents.cards.map((card, i) => (
              <article
                key={i}
                className="event-secondary-card"
                data-area={card.area}
              >
                <div className="es-cover">
                  <div
                    className="es-cover-img"
                    aria-hidden="true"
                    style={{ backgroundImage: `url('${card.coverImg}')` }}
                  />
                  <div className="es-cover-overlay" />
                  {card.date.tipo === "range" ? (
                    <div className="es-date range">
                      <span className="days">{card.date.days}</span>
                      <span className="dash">{card.date.dash}</span>
                      <span className="mon-yr">{card.date.monYr}</span>
                    </div>
                  ) : (
                    <div className="es-date multi">
                      <span className="count">
                        <span className="number">{card.date.number}</span> {card.date.count}
                      </span>
                      <span className="period">{card.date.period}</span>
                    </div>
                  )}
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">{card.program}</p>
                    <h4 className="es-title">{card.titulo}</h4>
                    <p className="es-program-binding">{card.programBinding}</p>
                  </div>
                  <div className="es-meta-row">
                    <span
                      className="es-meta"
                      dangerouslySetInnerHTML={{ __html: card.metaHtml }}
                    />
                  </div>
                  <a
                    className={card.cta.classe}
                    href={card.cta.href}
                    data-cms-link={card.cta.cmsLink}
                  >
                    {card.cta.texto}
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "var(--space-5)",
            }}
          >
            {evento.relatedEvents.footerCtas.map((cta, i) => (
              <a
                key={i}
                className={cta.classe}
                href={cta.href}
                data-cms-link={cta.cmsLink}
              >
                {cta.texto}
                {cta.arrow && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
```

- [ ] **Step 3: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): EventoPresencialLayout (parte 3) — sidebar + related events

Sidebar completa: cover image + status + tituloCard + 5 rows (1 com .price)
+ includes (6 li) + <CountdownSidebar /> + 2 acoes + 3 share links.

Related events: section-head com eyebrow gold + h2 + intro (com <strong>)
+ grid de 3 cards (variants .es-date.range e .es-date.multi por carta)
+ footer com 2 CTAs centralizados.

EventoPresencialLayout completo. Próximo commit fecha o page.tsx server.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Criar `page.tsx` server component (generateStaticParams + switch por formato)

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`

- [ ] **Step 1: Criar o page.tsx**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EVENTOS_AGENDA } from "./conteudoEventos";
import { EventoPresencialLayout } from "./EventoPresencialLayout";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(EVENTOS_AGENDA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const evento = EVENTOS_AGENDA[slug];
  if (!evento) return {};
  return {
    title: `${evento.titulo} · Grupo NTC`,
    description: evento.subtitulo,
  };
}

/**
 * Página /agenda/[slug] — template dinâmico para eventos individuais.
 *
 * Faz lookup do evento por slug em EVENTOS_AGENDA e renderiza o Layout
 * apropriado baseado em evento.formato ("presencial" | "hibrido" | "online").
 *
 * Apenas EventoPresencialLayout implementado nesta sessão.
 * Slugs híbridos/online caem em notFound() até que seus layouts sejam portados.
 */
export default async function EventoPage({ params }: PageProps) {
  const { slug } = await params;
  const evento = EVENTOS_AGENDA[slug];
  if (!evento) notFound();

  switch (evento.formato) {
    case "presencial":
      return <EventoPresencialLayout evento={evento} />;
    case "hibrido":
    case "online":
      // TODO: implementar EventoHibridoLayout e EventoOnlineLayout em sessões futuras
      notFound();
  }
}
```

Nota Next.js 15: `params` é `Promise` — precisa `await`.

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/agenda/[slug]/page.tsx" && git commit -m "$(cat <<'EOF'
feat(evento): cria page.tsx server (template dinâmico /agenda/[slug])

generateStaticParams retorna todos os slugs de EVENTOS_AGENDA (1 por
enquanto: "prosus-brasilia"). generateMetadata gera title/description
por evento. Switch por evento.formato delega para EventoPresencialLayout;
hibrido/online caem em notFound() até serem implementados.

revalidate = 3600.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Validar build + dev + checkpoint visual + move HTML para feito/

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -60
```

Expected: build passa; rota `/agenda/[slug]` aparece como `● SSG` com `/agenda/prosus-brasilia` prerenderizado. ISR 1h.

- [ ] **Step 2: Verificar rota no output**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "/agenda/(prosus|\[slug\])" | head -5
```

Expected: ao menos uma linha com `/agenda/[slug]` e marker `●` (SSG), com `/agenda/prosus-brasilia` listada como path gerado.

- [ ] **Step 3: Se build falhar, corrigir**

Se erro de tipo/lint/build: ler erro completo, corrigir no arquivo apontado e re-rodar `pnpm build`. Após passar, commitar correções com mensagem `fix(evento): ajustes pós-build de produção`.

- [ ] **Step 4: Verificar porta 3001 disponível**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN 2>/dev/null | head
```

Se ocupada, escolher 3002+ e ajustar próximos steps.

- [ ] **Step 5: Subir dev server na porta 3001 em background**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3001
```

Use `run_in_background: true`. **NÃO** use `pnpm dev` (turbo não propaga logs dos sub-processos).

- [ ] **Step 6: Aguardar dev pronto**

```bash
until grep -qE "Ready in|EADDRINUSE|Error" <log-file>; do sleep 1; done
```

- [ ] **Step 7: Curl da rota**

```bash
curl -sI http://localhost:3001/agenda/prosus-brasilia | head -3
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 8: Curl markers e contar elementos chave**

```bash
curl -s http://localhost:3001/agenda/prosus-brasilia | grep -oE '<title>[^<]+</title>|class="event-hero-tags"|class="event-meta-item"|class="evt-nav-link|class="audience-chips"|class="objective-list"|class="program-content-item"|class="schedule-day"|class="schedule-row"|class="speaker-detail-card"|class="event-diff-card"|class="venue-grid"|class="replay-cert-card"|class="rules-list"|class="faq-item|class="sidebar-row|class="sidebar-countdown"|class="event-secondary-card"' | sort | uniq -c | sort -rn | head -25
```

Expected (contagens):
- 1 title contendo "Governança, financiamento e performance no SUS"
- 12 `schedule-row` (5+4+3)
- 8 `audience-chips` spans (mas só 1 marker — verificar com class)
- 8 `evt-nav-link`
- 8 `rules-list > li` (idem 1 marker)
- 7 `program-content-item`
- 7 `faq-item`
- 6 `event-diff-card`
- 6 `event-secondary-card` (3 + ?) — esperado: 3
- 5 `event-meta-item`
- 5 `sidebar-row`
- 3 `schedule-day`
- 3 `speaker-detail-card`
- 2 `replay-cert-card`
- 1 `venue-grid`
- 1 `sidebar-countdown`
- 1 `event-hero-tags`

- [ ] **Step 9: Auditoria estrutural manual pelo controller (NÃO delegar a subagent)**

Antes de pedir validação visual humana, lê pessoalmente o `<main>` literal do HTML (`sed -n '2325,2846p' 03_Pagina_Evento_PROSUS_Brasilia_v3.html`) e o `EventoPresencialLayout.tsx`, comparando classes, wrappers e atributos seção por seção.

Lição da `/capacitacao` aprendida: subagents Explore dão "OK" otimisticamente em re-auditorias. A auditoria final fica com o controller. Se achar divergência, corrigir antes do checkpoint visual.

- [ ] **Step 10: Pedir validação visual humana**

Mensagem:

> O servidor de dev está rodando em http://localhost:3001/agenda/prosus-brasilia. Por favor:
>
> 1. Abra http://localhost:3001/agenda/prosus-brasilia no navegador.
> 2. Abra também `03_Pagina_Evento_PROSUS_Brasilia_v3.html` no navegador.
> 3. Compare lado a lado: breadcrumb, hero com 4 tags coloridas + h1 + sub + program binding + 3 CTAs, meta-bar 5 itens, subnav sticky com 8 âncoras, e as 12 sub-seções do conteúdo principal (visão geral, público, objetivos, conteúdo programático, programação 3 dias, palestrantes, diferenciais, local com mapa, replay/cert, regras, FAQ, CTA final), sidebar completa com countdown, related events 3 cards.
> 4. Teste interatividade:
>    - **Subnav sticky + scroll-spy**: ao rolar, link da seção visível recebe `is-active`.
>    - **Dropdown "Adicionar à agenda"**: abre/fecha, gera links Google/Outlook funcionais, baixa ICS.
>    - **Countdown**: aparece com d/h/m calculados; se quiser, espere ~1 min para ver atualizar.
>    - **FAQ accordion**: click expande/colapsa.
>    - **Hrefs**: program binding leva a `/programas/prosus`? Crumb leva a `/`, `/capacitacao`, `/capacitacao/agenda`?
> 5. Reporte discrepâncias ou aprove.

- [ ] **Step 11: Após aprovação, encerrar dev server**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $2}' | xargs -r kill
```

Se houve correções pós-validação, commitar com `fix(evento): ajustes pós-checkpoint visual`.

- [ ] **Step 12: Mover protótipo para `feito/`**

```bash
cd /Users/joao/Documents/portal-ntc && git mv 03_Pagina_Evento_PROSUS_Brasilia_v3.html feito/03_Pagina_Evento_PROSUS_Brasilia_v3.html && git commit -m "$(cat <<'EOF'
chore(evento): move 03_Pagina_Evento_PROSUS_Brasilia_v3.html para feito/

Template /agenda/[slug] portado e aprovado visualmente pela usuária.
Estabelece padrão para futuros eventos presenciais.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 13: Resumo da sessão (até 10 linhas)**

- Rota dinâmica `/agenda/[slug]` com `generateStaticParams` (1 slug: `prosus-brasilia`).
- Tipos genéricos `Evento = EventoPresencial | EventoHibrido | EventoOnline` em `conteudoEventos.ts` (965+ linhas).
- 4 client components: `EventoSubnav` (scroll-spy IntersectionObserver), `AgendaDropdown` (gera Google/Outlook/ICS), `CountdownSidebar` (setInterval 60s), `FaqEvento` (accordion).
- `EventoPresencialLayout`: 16 blocos editoriais + sidebar com countdown + related events.
- Build: `/agenda/[slug]` prerenderizada como `●` SSG com `/agenda/prosus-brasilia`, ISR 1h.
- Protótipo movido para `feito/03_Pagina_Evento_PROSUS_Brasilia_v3.html`.
- Pendências fora de escopo: `EventoHibridoLayout` (próxima sessão: AGIP SP), `EventoOnlineLayout` (futuro), update do `/capacitacao` para apontar os 3 cards de evento para `/agenda/prosus-brasilia` etc.

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura): Tasks 1, 2, 3, 14 (page.tsx) + Layout em 11-13.
  - §4 (page.tsx): Task 14.
  - §5 (EventoPresencialLayout): Tasks 11-13.
  - §6 (conteudoEventos.ts): Tasks 3-6.
  - §7.1 (EventoSubnav): Task 10.
  - §7.2 (AgendaDropdown): Task 9.
  - §7.3 (CountdownSidebar): Task 8.
  - §7.4 (FaqEvento): Task 7.
  - §8 (CSS): Tasks 1, 2.
  - §9 (validação): Task 15 (steps 1-13).
  - §10 (riscos): mitigados (countdown SSR-safe, ICS encoding, switch por formato, EventoPresencial não-Evento no Layout).
  - §11 (fora de escopo): respeitado.

- ✅ **Sem placeholders:** todos os literais TS de cada sub-seção estão inline em Tasks 4-6. Os componentes têm código completo. Commits têm mensagens pré-definidas.

- ✅ **Type consistency:** tipos definidos em Task 3 (`Evento`, `EventoPresencial`, `EventoBase`, `LinkInterno`, `CrumbItemEvento`, `EventoMeta`, `NavLink`, `AudienceChip`, `ItemObjetivo`, `ProgramContentItem`, `ScheduleRow`, `ScheduleDay`, `Palestrante`, `Diferencial`, `ReplayCertCard`, `ItemFaqEvento`, `RelatedEventCard`, `SidebarCard`, `HeroEvento`, `SecaoVisaoGeral/Publico/...`) consumidos consistentemente em Tasks 4-6 e Layout. `EventoPresencialLayout` recebe `evento: EventoPresencial` (não `Evento`) — TS força chamada após `switch (evento.formato)` discriminator. Client components recebem props tipadas que batem com os campos de `EventoBase`.

- ✅ **Lição da Capacitação aplicada:** Step 9 da Task 15 é "auditoria estrutural manual pelo controller — NÃO delegar a subagent". Spec já marca isso (§9.7 e §12.4). Mapeamento literal das 107 classes feito por Explore antes do design (memory `feedback_plano_lê_html_antes.md`).
