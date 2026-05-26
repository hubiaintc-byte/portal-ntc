# Página Módulo EDUTEC M01 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente `04_Pagina_Evento_EDUTEC_M01_Online_v2.html` (~3.627 linhas) para a rota dinâmica `/programas/[slug]/modulos/[modulo]`, com 1 entrada populada (`edutec/m01`). Estabelece o template visual para módulos de programa online ao vivo, paralelo (sem compartilhamento de CSS ou componentes) ao template `/agenda/[slug]` recém-portado. 16 blocos editoriais + sidebar com countdown + related events + 4 client components.

**Architecture:** Estratégia "porta do HTML" consolidada (12ª aplicação). CSS literal extraído para `apps/web/app/modulo-prototipo.css` (importado no root layout depois de `evento-prototipo.css`). Rota `/programas/[slug]/modulos/[modulo]` com `generateStaticParams` retornando entradas nested (slug programa + slug módulo) e tipo `Modulo` único por enquanto. `conteudoModulos.ts` contém tipos + `MODULOS_PROGRAMAS` nested record + helper `lookupModulo`. `ModuloOnlineLayout.tsx` renderiza JSX literal das 16 seções. 4 client components: `ModuloSubnav` (scroll-spy IntersectionObserver), `ModuloAgendaDropdown` (gera URLs Google/Outlook/ICS), `ModuloCountdownSidebar` (setInterval 60s SSR-safe, com AMBOS counter/text divs no DOM — fix do PROSUS), `ModuloFaq` (accordion). Header/Footer/InteracoesScroll vêm do `(programas)/layout.tsx` já existente.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/modulo-prototipo.css` — CSS literal (~2.175 linhas após strip).
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/page.tsx` — server, generateStaticParams nested, notFound() se inexistente.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts` — tipos + MODULOS_PROGRAMAS nested + lookupModulo helper.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx` — server: renderiza as 16 seções.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloSubnav.tsx` — client: scroll-spy IntersectionObserver.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloAgendaDropdown.tsx` — client: dropdown + geração Google/Outlook/ICS.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloCountdownSidebar.tsx` — client: setInterval 60s SSR-safe.
- `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloFaq.tsx` — client: accordion Set<string>.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./modulo-prototipo.css"` depois de `evento-prototipo.css` (linha 96).

**Não tocar:**
- `apps/web/app/(programas)/layout.tsx` (já correto)
- `apps/web/app/(programas)/programas/[slug]/page.tsx` (página de programa, intocada)
- `apps/web/app/(home)/HeaderHome.tsx`, `FooterHome.tsx`, `InteracoesScroll.tsx`
- Componentes de `/agenda/[slug]` (separados completamente)
- Outros prototype CSSs

---

## Task 1: Extrair CSS literal para `modulo-prototipo.css` (com strip de `<style>` tags)

**Files:**
- Create: `apps/web/app/modulo-prototipo.css`

- [ ] **Step 1: Extrair linhas 134-2309 do HTML (entre `<style>` e `</style>` inclusive)**

```bash
sed -n '134,2309p' /Users/joao/Documents/portal-ntc/04_Pagina_Evento_EDUTEC_M01_Online_v2.html > /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
```

- [ ] **Step 2: Verificar primeira e última linha**

```bash
head -1 /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
tail -1 /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
```

Expected: linha 1 = `<style>`, linha final = `</style>`.

- [ ] **Step 3: Strip das tags `<style>` / `</style>`**

```bash
sed -i '' '1d;$d' /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
```

- [ ] **Step 4: Confirmar strip**

```bash
head -1 /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
tail -1 /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
```

Expected: head ≠ `<style>`, tail ≠ `</style>`, ~2.174 linhas.

- [ ] **Step 5: Contar e converter `url('./img/...')` para `url('/img/...')`**

```bash
grep -c "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css || true
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css || echo "OK: nenhuma ocorrência"
```

Expected: 0 ocorrências após conversão.

- [ ] **Step 6: Listar imagens referenciadas e verificar existência**

```bash
grep -oE "url\('[^']+'\)" /Users/joao/Documents/portal-ntc/apps/web/app/modulo-prototipo.css | sort -u
```

Para cada URL `url('/img/...')` retornada, verificar com `ls /Users/joao/Documents/portal-ntc/apps/web/public<caminho>`. Se algum arquivo não existir, reportar BLOCKED.

- [ ] **Step 7: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/modulo-prototipo.css && git commit -m "$(cat <<'EOF'
feat(modulo): extrai CSS literal do protótipo 04 para modulo-prototipo.css

Bloco <style> de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html copiado
sem adaptação, com url('./img/...') convertido para url('/img/...'),
e tags <style></style> stripadas (padrão dos outros prototype CSSs).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `modulo-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Confirmar posição**

```bash
grep -n "evento-prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: 1 ocorrência em `import "./evento-prototipo.css";`.

- [ ] **Step 2: Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx`**

old_string:
```
import "./evento-prototipo.css";
```

new_string:
```
import "./evento-prototipo.css";
// CSS da página /programas/[slug]/modulos/[modulo] (template de módulo de programa —
// portada literal de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas (prefixos .evt-*, .sb-*, .sn-*, .es-*,
// .eventon-*, .why-*, .highlight-*, .invest-*, .faq-*, .speaker-*).
import "./modulo-prototipo.css";
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/layout.tsx && git commit -m "$(cat <<'EOF'
feat(modulo): importa modulo-prototipo.css no root layout

Carrega CSS do template de módulo de programa depois do evento-prototipo.css,
mantendo a ordem de cascading dos outros prototype CSSs.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar `conteudoModulos.ts` parte 1 — tipos genéricos compartilháveis

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`

- [ ] **Step 1: Criar a pasta**

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]"
```

- [ ] **Step 2: Criar o arquivo com tipos genéricos (sem dados ainda)**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DE MÓDULOS DE PROGRAMA
//  /PROGRAMAS/[SLUG]/MODULOS/[MODULO]
//
//  Tipos para Modulo (formato "online-ao-vivo" inicial; futuros
//  formatos viram união discriminada quando surgirem).
//
//  Este arquivo é a fonte estática até a coleção Modulo entrar
//  no Payload. Fidelidade 100% ao protótipo HTML correspondente.
// =============================================================

// ----------------- Discriminators -----------------

export type FormatoModulo = "online-ao-vivo";
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

export interface MetaItem {
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

export interface WhyCard {
  num: string;
  titulo: string;
  descricao: string;
}

export interface HighlightItem {
  num: string;
  textoHtml: string;
}

export interface ScheduleNode {
  time: string;
  ttag: string;
  num: string;
  titulo: string;
  speakerLine: string;
  topicos: string[];
}

export interface ScheduleTimeline {
  ttDay: string;
  ttMeta: string;
  nodes: ScheduleNode[];
}

export interface Palestrante {
  foto: string;
  roleTag: string;
  nome: string;
  credentials: string;
  bio: string;
}

export interface EventonStat { n: string; l: string; }

export interface EventonFeat {
  iconSvg: string;
  titulo: string;
  descricao: string;
}

export interface InvestMode {
  tag: string;
  titulo: string;
  descricao: string;
  featured?: boolean;
}

export interface ItemFaqModulo {
  id: string;
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
  program: string;
  titulo: string;
  programBinding: string;
  metaHtml: string;
  cta: LinkInterno;
}

export interface SidebarModulo {
  coverImg: string;
  status: string;
  coverEventon: string;
  titleTag: string;
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

export interface HeroModulo {
  bgImg: string;
  tags: Array<{
    texto: string;
    classe: "evt-hero-status" | "evt-hero-format" | "evt-hero-vert";
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
  moduleBindingNote: string;
  segundoH2: string;
  whyCards: WhyCard[];
}

export interface SecaoPublico {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: AudienceChip[];
  objetivoH2: string;
  objetivoTexto: string;
  destaquesH2: string;
  highlights: HighlightItem[];
}

export interface SecaoProgramacao {
  eyebrow: string;
  h2: string;
  intro: string;
  timeline: ScheduleTimeline;
}

export interface SecaoPalestrantes {
  eyebrow: string;
  h2: string;
  palestrantes: Palestrante[];
  nota: string;
}

export interface SecaoEventon {
  eyebrow: string;
  h2: string;
  intro: string;
  markName: string;
  markTag: string;
  stats: EventonStat[];
  features: EventonFeat[];
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  block: {
    priceLabel: string;
    priceCur: string;
    priceAmt: string;
    priceSub: string;
    includesTitulo: string;
    includesItems: string[];
  };
  modes: InvestMode[];
}

export interface SecaoRegras {
  eyebrow: string;
  h2: string;
  rules: string[];
}

export interface SecaoFaq {
  eyebrow: string;
  h2: string;
  faqs: ItemFaqModulo[];
}

export interface SecaoCtaFinal {
  eyebrowGold: string;
  h2: string;
  paragrafo: string;
  ctas: LinkInterno[];
}

export interface SecaoRelatedModulos {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedModuloCard[];
  footerCtas: LinkInterno[];
}

// ----------------- Módulo (base) -----------------

export interface Modulo {
  slugPrograma: string;
  slugModulo: string;
  formato: FormatoModulo;
  metaTitle: string;
  metaDescription: string;
  area: AreaVerticalModulo;
  crumb: CrumbItemModulo[];
  hero: HeroModulo;
  metas: MetaItem[];
  navLinks: NavLink[];
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
// MODULOS_PROGRAMAS é um Record nested: programa-slug → módulo-slug → Modulo.
// Dados vêm em Tasks 4-6.

export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {};

export function lookupModulo(
  slugPrograma: string,
  slugModulo: string,
): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts" && git commit -m "$(cat <<'EOF'
feat(modulo): cria conteudoModulos.ts (parte 1) com tipos genéricos compartilháveis

Tipos para Modulo (formato "online-ao-vivo" inicial). Sub-seções tipadas:
VisaoGeral (lede + paragrafos + moduleBindingNote + segundoH2 + whyCards),
Publico (chips + objetivo + highlights), Programacao (timeline com nodes),
Palestrantes, Eventon (stats + features com iconSvg), Investimento (block +
modes), Regras, Faq, CtaFinal, Sidebar (com countdown), RelatedModulos
(date discriminator range/single).

MODULOS_PROGRAMAS exportado vazio (nested record programa→modulo); helper
lookupModulo exportado. Dados vêm nos commits seguintes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `conteudoModulos.ts` parte 2 — `moduloEdutecM01` (slug + hero + metas + navLinks + crumb + agendaIcs) com placeholders nas sub-seções

**Files:**
- Modify: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`

- [ ] **Step 1: Edit (substitui o MODULOS_PROGRAMAS vazio pela versão com moduloEdutecM01 parcial)**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`.

old_string:
```
// ----------------- Lookup nested -----------------
// MODULOS_PROGRAMAS é um Record nested: programa-slug → módulo-slug → Modulo.
// Dados vêm em Tasks 4-6.

export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {};

export function lookupModulo(
  slugPrograma: string,
  slugModulo: string,
): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
```

new_string:
```
// ----------------- Módulo: EDUTEC M01 (online ao vivo) -----------------
// Porta literal de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html

const moduloEdutecM01: Modulo = {
  slugPrograma: "edutec",
  slugModulo: "m01",
  formato: "online-ao-vivo",
  metaTitle:
    "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação · 27 Mai 2026 · Grupo NTC",
  metaDescription:
    "Seminário On-Line ao Vivo · Cultura Digital, Educação Midiática e Transformação da Educação · 27 de Maio de 2026 · 8 horas · Plataforma EventON NTC. Integra o programa estratégico EDUTEC do NTC Educação.",
  area: "edu",

  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário EDUTEC · Cultura Digital", current: true },
  ],

  hero: {
    bgImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1: `Cultura Digital, Educação Midiática e <em>Transformação</em> da Educação`,
    sub: "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma:
        "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-EDUTEC-M01-2026-mai",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Baixar folder",
        href: "#",
        cmsLink: "folder-EDUTEC-M01",
        classe: "btn btn--ghost-light",
      },
      {
        texto: "Inscrever equipe ou grupo",
        href: "/contato?evento=Seminário+EDUTEC+M01+–+Cultura+Digital&evento_url=/programas/edutec/modulos/m01#tab-equipe",
        cmsLink: "proposta-grupo-EDUTEC-M01",
        classe: "btn btn--ghost-light",
      },
    ],
  },

  metas: [
    { label: "Quando", value: "27 · Maio", valueSub: "2026 · Quarta-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "Sob consulta", valueSub: "Equipes e órgãos" },
  ],

  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "EventOn", href: "#eventon" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "Regras", href: "#regras" },
    { texto: "FAQ", href: "#faq" },
  ],

  // visaoGeral, publico, programacao, palestrantes, eventon, investimento,
  // regras, faq, ctaFinal, sidebar, relatedModulos vêm em Tasks 5 e 6.
  visaoGeral: {
    eyebrow: "",
    h2: "",
    lede: "",
    paragrafos: [],
    moduleBindingNote: "",
    segundoH2: "",
    whyCards: [],
  },
  publico: {
    eyebrow: "",
    h2: "",
    intro: "",
    chips: [],
    objetivoH2: "",
    objetivoTexto: "",
    destaquesH2: "",
    highlights: [],
  },
  programacao: {
    eyebrow: "",
    h2: "",
    intro: "",
    timeline: { ttDay: "", ttMeta: "", nodes: [] },
  },
  palestrantes: { eyebrow: "", h2: "", palestrantes: [], nota: "" },
  eventon: {
    eyebrow: "",
    h2: "",
    intro: "",
    markName: "",
    markTag: "",
    stats: [],
    features: [],
  },
  investimento: {
    eyebrow: "",
    h2: "",
    block: {
      priceLabel: "",
      priceCur: "",
      priceAmt: "",
      priceSub: "",
      includesTitulo: "",
      includesItems: [],
    },
    modes: [],
  },
  regras: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    coverEventon: "",
    titleTag: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedModulos: {
    eyebrowGold: "",
    h2: "",
    intro: "",
    cards: [],
    footerCtas: [],
  },

  agendaIcs: {
    titulo:
      "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação",
    descricao:
      "Seminário On-Line ao Vivo · Cultura Digital, Educação Midiática e Transformação da Educação · 27 de Maio de 2026 · 8 horas · Plataforma EventON NTC. Integra o programa estratégico EDUTEC do NTC Educação.",
    location: "EventON NTC — Plataforma Online",
    startISO: "20260527T110000Z",
    endISO: "20260527T210000Z",
    filename: "EDUTEC-M01-2026-mai.ics",
  },
};

// ----------------- Lookup nested -----------------
// MODULOS_PROGRAMAS é um Record nested: programa-slug → módulo-slug → Modulo.

export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {
  edutec: {
    m01: moduloEdutecM01,
  },
};

export function lookupModulo(
  slugPrograma: string,
  slugModulo: string,
): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
```

Nota: campos `visaoGeral`/`publico`/etc. vão com placeholders vazios temporários (TS aceita porque a estrutura satisfaz o tipo). Cada um é preenchido nas Tasks 5 e 6.

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona moduloEdutecM01 (slug+hero+metas+navLinks+crumb+agendaIcs)

Estrutura inicial do Modulo EDUTEC M01: metaTitle/Description, area="edu",
crumb com 4 níveis (Grupo NTC > Capacitação > Eventos online > current),
hero com 3 tags + h1 com <em> + program binding ligando a /programas/edutec
+ 3 CTAs, 5 metas, 8 navLinks, agendaIcs com startISO/endISO em UTC.

Sub-seções editoriais vazias temporariamente — preenchidas em Tasks 5 e 6.

MODULOS_PROGRAMAS["edutec"]["m01"] registrado para o generateStaticParams.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `conteudoModulos.ts` parte 3 — sub-seções visaoGeral + publico + programacao + palestrantes + eventon

**Files:**
- Modify: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`

- [ ] **Step 1: Substituir os 5 placeholders por literais**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`.

old_string:
```
  // visaoGeral, publico, programacao, palestrantes, eventon, investimento,
  // regras, faq, ctaFinal, sidebar, relatedModulos vêm em Tasks 5 e 6.
  visaoGeral: {
    eyebrow: "",
    h2: "",
    lede: "",
    paragrafos: [],
    moduleBindingNote: "",
    segundoH2: "",
    whyCards: [],
  },
  publico: {
    eyebrow: "",
    h2: "",
    intro: "",
    chips: [],
    objetivoH2: "",
    objetivoTexto: "",
    destaquesH2: "",
    highlights: [],
  },
  programacao: {
    eyebrow: "",
    h2: "",
    intro: "",
    timeline: { ttDay: "", ttMeta: "", nodes: [] },
  },
  palestrantes: { eyebrow: "", h2: "", palestrantes: [], nota: "" },
  eventon: {
    eyebrow: "",
    h2: "",
    intro: "",
    markName: "",
    markTag: "",
    stats: [],
    features: [],
  },
```

new_string:
```
  visaoGeral: {
    eyebrow: "Visão geral",
    h2: `Uma agenda institucional para uma <em>educação digital crítica</em>, conectada e contemporânea.`,
    lede: "Este seminário aborda a cultura digital e a educação midiática como dimensões estruturantes da formação contemporânea, reconhecendo que a escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos e novas linguagens de participação.",
    paragrafos: [
      "<strong>Formar estudantes para apenas utilizar tecnologia é insuficiente</strong>: é necessário desenvolver leitura crítica, autoria, responsabilidade, discernimento e capacidade de participação qualificada no ecossistema informacional.",
      "A proposta apoia redes públicas e instituições educacionais na consolidação de práticas pedagógicas mais inovadoras, intencionais e conectadas aos desafios do presente. Ao articular fundamentos conceituais, curadoria pedagógica, educação midiática e estratégias de transformação digital, oferece repertório para que gestores, coordenadores e professores compreendam a tecnologia como linguagem, ambiente cultural e instrumento pedagógico a serviço da aprendizagem.",
    ],
    moduleBindingNote: `Este seminário corresponde ao <strong>Módulo 01 da trilha EDUTEC</strong> — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Pode ser contratado de forma independente ou integrar a trilha completa.`,
    segundoH2: `Seis razões para <em>participar</em> deste seminário`,
    whyCards: [
      {
        num: "01",
        titulo: "Sua rede precisa de uma agenda institucional para a cultura digital",
        descricao: "Frente à presença massiva de telas, plataformas e algoritmos, a escola pública precisa de uma resposta institucional coerente — este módulo organiza essa agenda.",
      },
      {
        num: "02",
        titulo: "Tema conduzido por especialistas de referência nacional",
        descricao: "Roberta Aquino (Unicamp · ISTE), Mariana Ochs (EducaMídia · USP) e Karla Priscilla (Google Innovator) — três das principais referências brasileiras em cultura digital aplicada à educação.",
      },
      {
        num: "03",
        titulo: "Combina fundamentação e oficinas aplicadas",
        descricao: "Não é teoria abstrata: o módulo entrega oficinas com critérios de curadoria, instrumentos de avaliação de recursos digitais e diretrizes de transformação institucional.",
      },
      {
        num: "04",
        titulo: "Trilha EDUTEC com flexibilidade contratual",
        descricao: "Pode ser contratado como módulo independente ou compor a trilha completa EDUTEC — adequando-se ao planejamento e ao orçamento da rede ou instituição.",
      },
      {
        num: "05",
        titulo: "Experiência acontece na plataforma EventON NTC",
        descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido — sem necessidade de download.",
      },
      {
        num: "06",
        titulo: "Certificação institucional do Instituto NTC do Brasil",
        descricao: "Certificação válida como atualização profissional, mediante 75% de presença — emitida pela referência institucional em capacitação para o setor público brasileiro.",
      },
    ],
  },

  publico: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para profissionais que atuam na construção da agenda digital das redes públicas:",
    chips: [
      { texto: "Secretários e dirigentes de educação" },
      { texto: "Equipes técnicas e gestores escolares" },
      { texto: "Coordenadores pedagógicos" },
      { texto: "Professores e formadores de educadores" },
      { texto: "Profissionais de educação digital, currículo e mídias" },
      { texto: "Gestores de inovação pedagógica" },
    ],
    objetivoH2: "Objetivo",
    objetivoTexto: "Compreender os fundamentos do letramento digital e da educação midiática, fortalecer práticas pedagógicas críticas e apoiar redes na formação de estudantes mais autônomos, críticos e responsáveis no uso de mídias e tecnologias — integrando competências digitais ao currículo e às práticas pedagógicas da rede.",
    destaquesH2: "Destaques formativos",
    highlights: [
      { num: "01", textoHtml: "<strong>Fundamentos da cultura digital</strong> e seus impactos sobre educação, comunicação e aprendizagem." },
      { num: "02", textoHtml: "<strong>Educação midiática</strong> e competências do século 21 para o ensino básico." },
      { num: "03", textoHtml: "<strong>Curadoria pedagógica</strong> de recursos digitais com critérios de qualidade e intencionalidade." },
      { num: "04", textoHtml: "<strong>Letramento crítico, autoria e cidadania digital</strong> integrados ao currículo." },
      { num: "05", textoHtml: "<strong>Transformação digital institucional</strong> da visão estratégica à execução prática." },
    ],
  },

  programacao: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Quatro sessões aplicadas, oito horas de imersão ao vivo combinando palestra, oficinas e síntese pedagógica final.",
    timeline: {
      ttDay: `27 de <em>Maio</em> · Quarta-feira`,
      ttMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
      nodes: [
        {
          time: "08h00 – 10h00",
          ttag: "Palestra · 01",
          num: "I",
          titulo: "Cultura digital e os novos paradigmas da educação contemporânea",
          speakerLine: `com <em>Roberta Aquino</em> · Doutora em Ciências (Unicamp) · Educadora ISTE`,
          topicos: [
            "Fundamentos da cultura digital e seus impactos sobre educação, comunicação e aprendizagem.",
            "Transformações nas formas de produzir, acessar e compartilhar informações.",
            "O papel da escola diante da conectividade, da multiplicidade de fontes e da sociedade em rede.",
          ],
        },
        {
          time: "10h00 – 12h00",
          ttag: "Oficina · 01",
          num: "II",
          titulo: "Aprendizagem no século 21: a importância da educação midiática",
          speakerLine: `com <em>Mariana Ochs</em> · Coordenadora EducaMídia · Instituto Palavra Aberta`,
          topicos: [
            "Competências essenciais para uso crítico, ético e intencional de mídias e tecnologias.",
            "Análise de conteúdos, plataformas e discursos no ambiente digital.",
            "Caminhos para integrar essas competências ao currículo da rede.",
          ],
        },
        {
          time: "14h00 – 16h00",
          ttag: "Oficina · 02",
          num: "III",
          titulo: "Curadoria pedagógica de recursos digitais: critérios, qualidade e intencionalidade",
          speakerLine: `com <em>Karla Priscilla</em> · Mestranda em Tecnologias Emergentes · Google Innovator`,
          topicos: [
            "Desenvolvimento da competência de busca e seleção crítica de recursos educacionais.",
            "Avaliação de recursos educacionais e aderência ao contexto pedagógico.",
            "Uso de recursos digitais para ampliar a participação e a expressão dos estudantes.",
          ],
        },
        {
          time: "16h00 – 18h00",
          ttag: "Oficina · 03",
          num: "IV",
          titulo: "Transformação digital na educação: da visão à implementação",
          speakerLine: `com <em>Roberta Aquino</em> · Especialista em transformação digital institucional`,
          topicos: [
            "Prioridades institucionais para implementação do tema em escolas e sistemas de ensino.",
            "Articulação entre currículo, formação e cultura institucional.",
            "Possibilidades de projetos integradores, trilhas e ações formativas.",
          ],
        },
      ],
    },
  },

  palestrantes: {
    eyebrow: "Quem ensina",
    h2: `Três especialistas de <em>referência nacional</em>`,
    palestrantes: [
      {
        foto: "/img/fotos/_optimized/expert-03.1920.webp",
        roleTag: "Palestrante",
        nome: "Roberta Aquino",
        credentials: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator",
        bio: "Professora de pós-graduação, palestrante internacional e consultora educacional. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp, Educadora Certificada ISTE, Google Innovator, Trainer e Coach. Mentora GEG para a América Latina. Canva Education Partner, Embaixadora de Genially, Wakelet, Wayground, Padlet e BookCreator.",
      },
      {
        foto: "/img/fotos/_optimized/expert-02.1920.webp",
        roleTag: "Palestrante",
        nome: "Karla Priscilla",
        credentials: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia",
        bio: "Mestranda em Tecnologias Emergentes na Educação, pedagoga, consultora e palestrante. Google Champions, Innovator e Trainer. Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais e formadora de educadores em todo o Brasil. Embaixadora do Canva for Education, ClassDojo e plataforma Teachy.",
      },
      {
        foto: "/img/fotos/_optimized/expert-04.1920.webp",
        roleTag: "Palestrante",
        nome: "Mariana Ochs",
        credentials: "Coordenadora EducaMídia · Instituto Palavra Aberta · USP",
        bio: "Designer, jornalista e especialista em cultura digital na educação. Coordenadora do EducaMídia, programa de educação midiática do Instituto Palavra Aberta. Pós-graduação em Letramento Digital pela Universidade de Rhode Island; pós-graduanda na USP, pesquisando letramento algorítmico. Coautora do Guia da Educação Midiática e do e-book Educação Midiática e Inteligência Artificial.",
      },
    ],
    nota: "Fotografias oficiais dos palestrantes serão sincronizadas a partir do folder do evento via CMS.",
  },

  eventon: {
    eyebrow: "Plataforma de acesso",
    h2: `Como funciona no <em>EventON NTC</em>`,
    intro: "O seminário acontece na plataforma institucional do Instituto NTC do Brasil — ambiente virtual seguro com transmissão ao vivo, suporte dedicado e replay protegido.",
    markName: `Event<em>ON</em>`,
    markTag: "Plataforma Institucional · NTC",
    stats: [
      { n: "5.000", l: "Participantes simultâneos" },
      { n: "30 FPS", l: "Vídeo em alta definição" },
      { n: "100%", l: "Acesso institucional" },
    ],
    features: [
      {
        iconSvg: `<path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z"/>`,
        titulo: "Plataforma segura e escalável",
        descricao: "Alcance de até 5.000 participantes simultâneos, com estabilidade operacional e segurança institucional para eventos formais.",
      },
      {
        iconSvg: `<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 22h8"/>`,
        titulo: "Alta definição",
        descricao: "Transmissão em 30 FPS, com vídeo e áudio de alta qualidade independente do dispositivo — desktop, laptop, tablet ou telefone.",
      },
      {
        iconSvg: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
        titulo: "Fácil e acessível",
        descricao: "Nenhum download é necessário. Acesso individual por login e senha, com interface simplificada e navegação institucional intuitiva.",
      },
      {
        iconSvg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>`,
        titulo: "Interação ao vivo",
        descricao: "Faça perguntas, participe de pesquisas em tempo real e até apresente conteúdos em momentos previamente combinados com a coordenação.",
      },
      {
        iconSvg: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
        titulo: "Replay institucional · 7 dias",
        descricao: "Acesso ao replay integral do evento por 7 dias após a realização — para revisão, aprofundamento e referência institucional posterior.",
      },
      {
        iconSvg: `<circle cx="12" cy="9" r="6"/><path d="M9 14.5V21l3-2 3 2v-6.5"/>`,
        titulo: "Certificação institucional",
        descricao: "Certificado válido como atualização profissional, mediante 75% de presença — emitido pelo Instituto NTC do Brasil.",
      },
    ],
  },
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona sub-seções editoriais EDUTEC M01 (visão+público+programação+palestrantes+eventon)

visaoGeral (lede + 2 paragrafos com <strong> + moduleBindingNote + segundoH2
com <em> + 6 whyCards). publico (6 chips + objetivoH2/Texto + destaquesH2 +
5 highlights com <strong>). programacao (timeline com 4 nodes I-IV, cada
um com .ttag + speakerLine com <em> + 3 tópicos). palestrantes (3 com foto
/expert-0X + bio completa). eventon (3 stats + 6 features com SVG iconSvg
contendo innerHTML — primitivas path/rect/circle preservadas).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `conteudoModulos.ts` parte 4 — investimento + regras + faq + ctaFinal + sidebar + relatedModulos

**Files:**
- Modify: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`

- [ ] **Step 1: Substituir os 6 placeholders restantes**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts`.

old_string:
```
  investimento: {
    eyebrow: "",
    h2: "",
    block: {
      priceLabel: "",
      priceCur: "",
      priceAmt: "",
      priceSub: "",
      includesTitulo: "",
      includesItems: [],
    },
    modes: [],
  },
  regras: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    coverEventon: "",
    titleTag: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedModulos: {
    eyebrowGold: "",
    h2: "",
    intro: "",
    cards: [],
    footerCtas: [],
  },
```

new_string:
```
  investimento: {
    eyebrow: "Investimento",
    h2: "Investimento e condições",
    block: {
      priceLabel: "Inscrição individual",
      priceCur: "R$",
      priceAmt: "Sob",
      priceSub: "Consulta · Equipes / órgãos",
      includesTitulo: "O que está incluído",
      includesItems: [
        "8 horas de imersão ao vivo no EventON NTC",
        "Material editorial NTC (cadernos digitais)",
        "Replay protegido por 7 dias após o evento",
        "Certificado institucional validável",
        "Suporte técnico dedicado",
        "Acesso à Área do Participante",
      ],
    },
    modes: [
      {
        tag: "Individual",
        titulo: "Inscrição individual",
        descricao: "Profissional inscreve-se diretamente. Pagamento via PIX, boleto ou cartão de crédito (até 6× sem juros).",
      },
      {
        tag: "Equipe",
        titulo: "Inscrição de equipe",
        descricao: "Grupos de 3 a 10 participantes da mesma instituição com desconto institucional. Pagamento centralizado.",
      },
      {
        tag: "Institucional",
        titulo: "Contratação institucional",
        descricao: "Para órgãos públicos, redes e secretarias. Emissão de nota fiscal direta, empenho institucional e turma fechada disponível.",
        featured: true,
      },
    ],
  },

  regras: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "Inscrições abertas até a data do evento ou enquanto houver vagas disponíveis.",
      "Acesso individual por login e senha enviado em até 24h após confirmação da inscrição.",
      "Cancelamento sem ônus até 7 dias antes do evento. Após esse prazo, valor pode ser convertido em crédito para outra edição.",
      "Para órgãos públicos: emissão de nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      "Inscrição válida apenas para o e-mail informado no cadastro. Não é permitido compartilhamento de acesso.",
      "Certificado emitido após o evento mediante presença mínima de 75% das atividades, validado por código QR.",
      "Replay disponível por 7 dias após o evento na Área do Participante.",
      "Material de apoio enviado por e-mail e disponibilizado na plataforma EventON NTC.",
    ],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    h2: "FAQ",
    faqs: [
      {
        id: "modulo-faq-1",
        pergunta: "Como funciona o acesso ao EventON NTC?",
        respostaHtml: "<p>Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo.</p>",
      },
      {
        id: "modulo-faq-2",
        pergunta: "Por quanto tempo terei acesso ao replay?",
        respostaHtml: "<p>O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual.</p>",
      },
      {
        id: "modulo-faq-3",
        pergunta: "Como recebo o certificado?",
        respostaHtml: "<p>O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR.</p>",
      },
      {
        id: "modulo-faq-4",
        pergunta: "Posso inscrever minha equipe ou rede?",
        respostaHtml: "<p>Sim. Equipes de 3 a 10 participantes recebem desconto institucional. Acima disso, oferecemos contratação institucional dedicada com nota fiscal direta para o órgão. Solicite proposta para grupo no botão lateral.</p>",
      },
      {
        id: "modulo-faq-5",
        pergunta: "A inscrição inclui materiais?",
        respostaHtml: "<p>Sim. Cadernos digitais editoriais NTC com conteúdo programático, leituras complementares e templates aplicáveis são enviados por e-mail e disponibilizados na plataforma.</p>",
      },
      {
        id: "modulo-faq-6",
        pergunta: "Como contratar uma turma fechada para minha instituição?",
        respostaHtml: "<p>A NTC desenvolve turmas fechadas in company para secretarias, autarquias e órgãos públicos, com conteúdo entregue na sede da instituição ou em formato online dedicado. Solicite proposta institucional pelo botão lateral.</p>",
      },
      {
        id: "modulo-faq-7",
        pergunta: "É possível compor a trilha completa EDUTEC?",
        respostaHtml: "<p>Sim. Este Módulo 01 é a abertura da trilha EDUTEC — Programa Estratégico de Educação Digital. A trilha completa pode ser contratada para sua rede com condições institucionais. Consulte a equipe comercial.</p>",
      },
    ],
  },

  ctaFinal: {
    eyebrowGold: "Próximo passo",
    h2: `Garanta sua participação no <em>Módulo 01 EDUTEC</em>.`,
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      {
        texto: "Inscrever-se agora",
        href: "#contato",
        cmsLink: "inscricao-EDUTEC-M01-2026-mai",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=Seminário+EDUTEC+M01+–+Cultura+Digital&evento_url=/programas/edutec/modulos/m01#tab-equipe",
        cmsLink: "proposta-grupo-EDUTEC-M01",
        classe: "btn btn--secondary",
      },
    ],
  },

  sidebar: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventon: `Acesso via <em>EventON</em>`,
    titleTag: "Módulo 01 · Trilha EDUTEC",
    rows: [
      { label: "Quando", value: "27 · Mai · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "Sob consulta", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: [
        "8 horas de imersão ao vivo",
        "Replay por 7 dias após o evento",
        "Material editorial NTC",
        "Certificado institucional",
        "Suporte técnico dedicado",
        "Área do Participante",
      ],
    },
    countdown: {
      label: "Prazo de inscrição",
      dateText: "Até 20 de Maio de 2026",
      deadline: "2026-05-20T23:59:59-03:00",
      tipo: "numerico",
    },
    acoes: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-EDUTEC-M01-2026-mai",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=Seminário+EDUTEC+M01+–+Cultura+Digital&evento_url=/programas/edutec/modulos/m01#tab-equipe",
        cmsLink: "inscricao-equipe-EDUTEC-M01",
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

  relatedModulos: {
    eyebrowGold: "Trilha EDUTEC · Próximos módulos",
    h2: "Continue a jornada de educação digital",
    intro: `Outros módulos da trilha <strong>EDUTEC</strong> e eventos da <strong>NTC Educação</strong> com inscrições antecipadas.`,
    cards: [
      {
        area: "edu",
        coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
        date: { tipo: "range", daysStart: "22", dash: "–", daysEnd: "23", monYr: "Mai · 2026" },
        program: "Seminário · NTC Educação",
        titulo: "Alfabetização de Alta Performance: estratégias para recomposição",
        programBinding: "PEAR",
        metaHtml: `Online · 16h · 2 dias <strong>R$ 1.490</strong>`,
        cta: { texto: "Inscrever-se", href: "#contato", cmsLink: "inscricao-PEAR-2026-mai" },
      },
      {
        area: "edu",
        coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
        date: { tipo: "single", day: "24", monYr: "Jun · 2026" },
        program: "Seminário · NTC Educação",
        titulo: "Módulo 02 EDUTEC: IA, Currículo e Aprendizagem",
        programBinding: "EDUTEC",
        metaHtml: `Online · 8h · 1 dia <strong>Sob consulta</strong>`,
        cta: { texto: "Saiba mais", href: "#contato", cmsLink: "inscricao-EDUTEC-M02-2026-jun" },
      },
      {
        area: "edu",
        coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
        date: { tipo: "single", day: "25", monYr: "Jun · 2026" },
        program: "Curso Executivo · NTC Educação",
        titulo: "Coordenação pedagógica orientada a resultados",
        programBinding: "PROGE",
        metaHtml: `Online · 20h · 3 dias <strong>R$ 1.690</strong>`,
        cta: { texto: "Inscrever-se", href: "#contato", cmsLink: "inscricao-PROGE-2026-jun" },
      },
    ],
    footerCtas: [
      { texto: "Ver agenda completa", href: "/capacitacao", cmsLink: "agenda-completa", classe: "btn btn--primary", arrow: true },
      { texto: "Solicitar proposta institucional", href: "/solucoes#contratacao-institucional", cmsLink: "proposta-institucional", classe: "btn btn--secondary" },
    ],
  },
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/conteudoModulos.ts" && git commit -m "$(cat <<'EOF'
feat(modulo): completa EDUTEC M01 — investimento+regras+faq+cta+sidebar+related

investimento (block com priceLabel/Cur/Amt/Sub + includes 6 li, 3 modes,
3º featured). regras (8 rules). faq (7 itens modulo-faq-1 a -7). ctaFinal
(eyebrow gold + h2 com <em> + 2 CTAs). sidebar completo (cover + status +
coverEventon com <em>EventON</em> + titleTag "Módulo 01 · Trilha EDUTEC" +
5 rows com 1 price + 6 includes + countdown numerico deadline 2026-05-20 +
2 acoes + 3 share links). relatedModulos (3 cards edu — 1 range PEAR +
2 single EDUTEC M02 e PROGE — com metaHtml usando <strong> no preço + 2
footer CTAs).

EDUTEC M01 100% literal pronto para consumo pelo Layout.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Criar `ModuloFaq.tsx` client

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloFaq.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloFaq.tsx`:

```tsx
"use client";

import { useState } from "react";

import type { ItemFaqModulo } from "./conteudoModulos";

/**
 * FAQ accordion da página /programas/[slug]/modulos/[modulo]. Espelha o
 * IIFE 5 do protótipo (linhas ~3460-3475 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <p>, <strong>).
 *
 * Mesmo padrão de FaqEvento adaptado às classes .faq-item / .faq-question
 * / .faq-answer / .faq-answer-inner (idênticas neste template).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface ModuloFaqProps {
  itens: ItemFaqModulo[];
}

export function ModuloFaq({ itens }: ModuloFaqProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("modulo_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloFaq.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona ModuloFaq client component

Padrão FaqEvento adaptado para este template: classes .faq-item /
.faq-question / .faq-answer / .faq-answer-inner (idênticas). Set<string>
ids abertos, aria-expanded reativo, respostaHtml via dangerouslySetInnerHTML.
Track no-op para futura GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Criar `ModuloCountdownSidebar.tsx` client

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloCountdownSidebar.tsx`

- [ ] **Step 1: Criar o componente (com fix do PROSUS: ambos counter+text divs no DOM)**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloCountdownSidebar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Countdown da sidebar do módulo. Espelha o IIFE 8 do protótipo
 * (linhas ~3550-3620 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Lê deadline ISO + tipo "numerico" | "textual".
 * - setInterval(60_000) atualiza dias/horas/minutos.
 * - SSR-safe: render inicial com "—" para evitar hydration mismatch.
 * - Renderiza AMBOS counter + text divs sempre no DOM (display:none no
 *   inativo) — fidelidade ao protótipo (lição do PROSUS Brasília).
 * - Se deadline já passou, mostra "Inscrições encerradas" no text div.
 *
 * IDs do HTML: `sbCountdown`, `sbCdCounter`, `sbCdText` (prefixo .sb-).
 */

interface ModuloCountdownSidebarProps {
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

export function ModuloCountdownSidebar({
  label,
  dateText,
  deadline,
  tipo,
}: ModuloCountdownSidebarProps) {
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
      className="sb-countdown"
      id="sbCountdown"
      data-deadline={deadline}
      data-tipo={tipo}
    >
      <div className="sb-cd-label">{label}</div>
      <div className="sb-cd-date">{dateText}</div>

      <div
        className="sb-cd-counter"
        id="sbCdCounter"
        style={tipo === "numerico" && !expirado ? undefined : { display: "none" }}
      >
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
      <div
        className="sb-cd-text"
        id="sbCdText"
        style={tipo === "textual" || expirado ? undefined : { display: "none" }}
      >
        {expirado ? (
          <strong>Inscrições encerradas</strong>
        ) : (
          <>Faltam <strong>{tempo ? d : "—"}</strong> dias</>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloCountdownSidebar.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona ModuloCountdownSidebar client component

Espelha o IIFE 8 de countdown do protótipo: lê deadline ISO + tipo
numerico|textual, setInterval(60_000) atualiza d/h/m. SSR-safe:
estado inicial null, render "—" antes do mount; useEffect calcula
valor real e re-renderiza. Cleanup limpa interval.

Renderiza AMBOS .sb-cd-counter e .sb-cd-text com display:none no
inativo (fidelidade ao protótipo — lição aplicada do PROSUS Brasília).
Modo "expirado" mostra "Inscrições encerradas" no text div.

IDs do HTML: sbCountdown, sbCdCounter, sbCdText (prefixo .sb-, distinto
do .sidebar-cd-* do PROSUS).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `ModuloAgendaDropdown.tsx` client

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloAgendaDropdown.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloAgendaDropdown.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

import type { Modulo } from "./conteudoModulos";

/**
 * Dropdown "Adicionar à agenda" do subnav. Espelha o IIFE 7 do protótipo
 * (linhas ~3475-3548 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Toggle abre/fecha dropdown.
 * - Click fora ou Escape fecha.
 * - 4 links: Google Calendar, Outlook · Office 365, Apple Calendar (.ics), .ics genérico.
 * - URLs geradas dinamicamente com base em agendaIcs.
 *
 * Mesmo padrão de AgendaDropdown do PROSUS, com nomes/textos adaptados.
 */

interface ModuloAgendaDropdownProps {
  dados: Modulo["agendaIcs"];
}

function gerarUrlGoogle(d: Modulo["agendaIcs"]): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: d.titulo,
    dates: `${d.startISO}/${d.endISO}`,
    details: d.descricao,
    location: d.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarUrlOutlook(d: Modulo["agendaIcs"]): string {
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

function gerarIcs(d: Modulo["agendaIcs"]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo NTC//Modulos//PT",
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

export function ModuloAgendaDropdown({ dados }: ModuloAgendaDropdownProps) {
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

  return (
    <div className="evt-nav-action-wrap" id="agendaWrap" ref={wrapRef}>
      <button
        type="button"
        className="evt-nav-action act-agenda"
        id="agendaToggle"
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
            rel="noopener"
            data-cms-link="cal-google"
          >
            Google Calendar
          </a>
          <a
            href={urlOutlook}
            target="_blank"
            rel="noopener"
            data-cms-link="cal-outlook"
          >
            Outlook · Office 365
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-apple"
          >
            Apple Calendar
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

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloAgendaDropdown.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona ModuloAgendaDropdown client component

Dropdown "Adicionar à agenda" com geração dinâmica de URL Google
Calendar (URLSearchParams), URL Outlook Live (com ISO completo) e
data URI ICS (string VCALENDAR encodada). Click fora + Escape fecham.
4 links: Google, Outlook · Office 365, Apple, .ics genérico. rel="noopener".

IDs do HTML: agendaWrap, agendaToggle (sem sufixo PROSUS).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Criar `ModuloSubnav.tsx` client

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloSubnav.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloSubnav.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { ModuloAgendaDropdown } from "./ModuloAgendaDropdown";
import type { Modulo, NavLink } from "./conteudoModulos";

/**
 * Subnav interno do módulo com scroll-spy. Espelha o IIFE 6 do protótipo
 * (linhas ~3415-3458 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - IntersectionObserver com rootMargin: '-30% 0px -55% 0px', threshold: 0.
 * - Adiciona is-active + aria-current="location" ao link cuja seção está visível.
 * - Sticky vem do CSS (.evt-nav: position: sticky).
 *
 * Ações: 1 botão Inscrever-se (scrolla para #contato), 1 botão Baixar folder,
 * 1 ModuloAgendaDropdown.
 */

interface ModuloSubnavProps {
  links: NavLink[];
  folderHref: string;
  folderCmsLink: string;
  inscricaoCmsLink: string;
  agendaIcs: Modulo["agendaIcs"];
}

export function ModuloSubnav({
  links,
  folderHref,
  folderCmsLink,
  inscricaoCmsLink,
  agendaIcs,
}: ModuloSubnavProps) {
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

  const onClickFolder = () => {
    if (folderHref && folderHref !== "#") {
      window.open(folderHref, "_blank", "noopener");
    }
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
            className="evt-nav-action act-inscrever primary"
            data-cms-link={inscricaoCmsLink}
            onClick={onClickInscrever}
          >
            Inscrever-se
          </button>
          <button
            type="button"
            className="evt-nav-action act-folder"
            data-cms-link={folderCmsLink}
            onClick={onClickFolder}
          >
            Baixar folder
          </button>
          <ModuloAgendaDropdown dados={agendaIcs} />
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloSubnav.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): adiciona ModuloSubnav client component

Scroll-spy via IntersectionObserver (rootMargin -30%/-55%) marcando
.is-active + aria-current="location" no link da seção visível. Sticky
vem do CSS portado. 3 ações: botão Inscrever-se (scrolla para #contato),
botão Baixar folder (window.open se href válido), ModuloAgendaDropdown
integrado.

Classes específicas: .act-inscrever.primary e .act-folder (do HTML).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Criar `ModuloOnlineLayout.tsx` parte 1 — breadcrumb + hero + meta + subnav + 3 sub-seções iniciais (visão geral com why-grid, público com chips+objetivo+highlights, programação)

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx`

- [ ] **Step 1: Criar o arquivo com header + 4 seções top-level + 3 primeiras sub-seções**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx`:

```tsx
import { Fragment } from "react";

import type { Modulo } from "./conteudoModulos";
import { ModuloSubnav } from "./ModuloSubnav";

/**
 * Layout de módulo de programa em formato online ao vivo — porta literal de
 * 04_Pagina_Evento_EDUTEC_M01_Online_v2.html.
 *
 * Espelho do <main id="main" class="event-page" data-evento> do protótipo,
 * linhas 2496-3225. 16 blocos editoriais + sidebar + related modulos.
 *
 * Header/Footer/InteracoesScroll vêm de (programas)/layout.tsx já existente.
 */
interface ModuloOnlineLayoutProps {
  modulo: Modulo;
}

export function ModuloOnlineLayout({ modulo }: ModuloOnlineLayoutProps) {
  const inscricaoCmsLink = modulo.hero.ctas[0]?.cmsLink ?? "inscricao";
  const folderCta = modulo.hero.ctas[1];

  return (
    <main
      id="main"
      className="event-page"
      data-evento={`${modulo.slugPrograma.toUpperCase()}-${modulo.slugModulo.toUpperCase()}`}
    >
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {modulo.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                {c.href ? (
                  <li>
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  </li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
                {i < modulo.crumb.length - 1 && (
                  <li className="sep" aria-hidden="true">/</li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section
        className="evt-hero"
        aria-label={`Seminário ${modulo.slugPrograma.toUpperCase()} Módulo ${modulo.slugModulo.slice(1).padStart(2, "0")}`}
      >
        <div
          className="evt-hero-bg"
          aria-hidden="true"
          style={{ backgroundImage: `url('${modulo.hero.bgImg}')` }}
        />
        <div className="container evt-hero-content fade-in">
          <div className="evt-hero-tags">
            {modulo.hero.tags.map((tag, i) => (
              <span key={i} className={tag.classe}>{tag.texto}</span>
            ))}
          </div>
          <h1 dangerouslySetInnerHTML={{ __html: modulo.hero.h1 }} />
          <p className="evt-hero-sub">{modulo.hero.sub}</p>
          <div className="evt-hero-program-binding">
            <span>{modulo.hero.programBinding.texto}</span>
            <strong>
              <a
                href={modulo.hero.programBinding.href}
                data-cms-link={modulo.hero.programBinding.cmsLink}
              >
                {modulo.hero.programBinding.nomePrograma}
              </a>
            </strong>
          </div>
          <div className="evt-hero-ctas">
            {modulo.hero.ctas.map((cta, i) => (
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
      <section
        className="evt-meta-bar"
        aria-label="Informações principais do evento"
      >
        <div className="container">
          <div className="evt-meta-bar-grid fade-in">
            {modulo.metas.map((meta, i) => (
              <div key={i} className="evt-meta-item">
                <span className="label">{meta.label}</span>
                <span className="value">{meta.value}</span>
                <span className="value-sub">{meta.valueSub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUBNAV (client) */}
      <ModuloSubnav
        links={modulo.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={modulo.agendaIcs}
      />

      {/* 5. EVT-LAYOUT (2-col grid) */}
      <section className="evt-layout">
        <div className="container">
          <div className="evt-layout-grid">
            <div className="evt-main">
              {/* 5.1 VISÃO GERAL (com why-grid embutido) */}
              <article className="evt-section fade-in" id="visao-geral">
                <p className="eyebrow">{modulo.visaoGeral.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.h2 }} />
                <p className="lede-block">{modulo.visaoGeral.lede}</p>
                {modulo.visaoGeral.paragrafos.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <p
                  className="module-binding-note"
                  dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.moduleBindingNote }}
                />
                <h2
                  style={{ marginTop: "var(--space-6)" }}
                  dangerouslySetInnerHTML={{ __html: modulo.visaoGeral.segundoH2 }}
                />
                <div className="why-grid">
                  {modulo.visaoGeral.whyCards.map((card, i) => (
                    <div key={i} className="why-card">
                      <span className="why-num">{card.num}</span>
                      <div className="why-body">
                        <h4>{card.titulo}</h4>
                        <p>{card.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.2 PÚBLICO (chips + objetivo + highlights) */}
              <article className="evt-section fade-in" id="publico">
                <p className="eyebrow">{modulo.publico.eyebrow}</p>
                <h2>{modulo.publico.h2}</h2>
                <p>{modulo.publico.intro}</p>
                <div className="audience-chips">
                  {modulo.publico.chips.map((chip, i) => (
                    <span key={i}>{chip.texto}</span>
                  ))}
                </div>
                <h2 style={{ marginTop: "var(--space-6)" }}>
                  {modulo.publico.objetivoH2}
                </h2>
                <p>{modulo.publico.objetivoTexto}</p>
                <h2 style={{ marginTop: "var(--space-6)" }}>
                  {modulo.publico.destaquesH2}
                </h2>
                <div className="highlights-list">
                  {modulo.publico.highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <span className="h-num">{h.num}</span>
                      <span
                        className="h-text"
                        dangerouslySetInnerHTML={{ __html: h.textoHtml }}
                      />
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.3 PROGRAMAÇÃO (timeline com 4 nodes) */}
              <article className="evt-section fade-in" id="programacao">
                <p className="eyebrow">{modulo.programacao.eyebrow}</p>
                <h2>{modulo.programacao.h2}</h2>
                <p>{modulo.programacao.intro}</p>
                <div className="schedule-timeline">
                  <div className="schedule-timeline-head">
                    <span
                      className="tt-day"
                      dangerouslySetInnerHTML={{ __html: modulo.programacao.timeline.ttDay }}
                    />
                    <span className="tt-meta">{modulo.programacao.timeline.ttMeta}</span>
                  </div>
                  {modulo.programacao.timeline.nodes.map((node, i) => (
                    <div key={i} className="schedule-node">
                      <div className="sn-time">
                        {node.time}
                        <span className="ttag">{node.ttag}</span>
                      </div>
                      <div className="sn-marker">
                        <span className="sn-num">{node.num}</span>
                      </div>
                      <div className="sn-content">
                        <h4>{node.titulo}</h4>
                        <p
                          className="speaker-line"
                          dangerouslySetInnerHTML={{ __html: node.speakerLine }}
                        />
                        <ul>
                          {node.topicos.map((t, j) => (
                            <li key={j}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* PARTES SEGUINTES — Task 12 */}
            </div>

            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED MODULOS — Task 13 */}
    </main>
  );
}
```

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): cria ModuloOnlineLayout (parte 1) — breadcrumb+hero+meta+subnav+visão+público+programação

Estrutura inicial do layout: <main id="main" class="event-page" data-evento=
"EDUTEC-M01"> com breadcrumb 4 níveis, evt-hero com bg-image inline + 3 tags
+ h1 com <em> via dangerouslySetInnerHTML + program binding + 3 CTAs em
.evt-hero-ctas, evt-meta-bar 5 itens, <ModuloSubnav />, e abertura do
evt-layout-grid com 3 sub-seções:
- Visão geral com why-grid embutido (6 cards) + module-binding-note +
  segundo h2 inline com margin-top
- Público com chips + objetivo (h2 inline) + destaques (h2 inline) com
  highlights-list (5 itens com .h-num + .h-text)
- Programação com schedule-timeline (head + 4 nodes I-IV, cada um com
  .sn-time + .ttag + .sn-marker.sn-num + .sn-content)

Próximos commits adicionam: palestrantes, eventon, investimento, regras,
faq, cta final, sidebar e related modulos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `ModuloOnlineLayout.tsx` parte 2 — palestrantes + eventon + investimento + regras + faq + cta final

**Files:**
- Modify: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx`

- [ ] **Step 1: Adicionar import de ModuloFaq**

Edit. old_string:
```
import { ModuloSubnav } from "./ModuloSubnav";
```

new_string:
```
import { ModuloFaq } from "./ModuloFaq";
import { ModuloSubnav } from "./ModuloSubnav";
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
              {/* 5.4 PALESTRANTES */}
              <article className="evt-section fade-in" id="palestrantes">
                <p className="eyebrow">{modulo.palestrantes.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.palestrantes.h2 }} />
                <div className="speakers-detailed">
                  {modulo.palestrantes.palestrantes.map((p, i) => (
                    <article key={i} className="speaker-detail-card">
                      <div className="speaker-detail-portrait">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.foto} alt={p.nome} loading="lazy" />
                        <span className="speaker-role-tag">{p.roleTag}</span>
                      </div>
                      <div className="speaker-detail-info">
                        <h3>{p.nome}</h3>
                        <p className="credentials">{p.credentials}</p>
                        <p className="bio">{p.bio}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <p className="placeholder-note">{modulo.palestrantes.nota}</p>
              </article>

              {/* 5.5 EVENTON (plataforma) */}
              <article className="evt-section fade-in" id="eventon">
                <p className="eyebrow">{modulo.eventon.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: modulo.eventon.h2 }} />
                <p>{modulo.eventon.intro}</p>
                <div className="eventon-section">
                  <div className="eventon-head">
                    <div className="eventon-mark">
                      <span
                        className="name"
                        dangerouslySetInnerHTML={{ __html: modulo.eventon.markName }}
                      />
                      <span className="tag">{modulo.eventon.markTag}</span>
                    </div>
                    <div className="eventon-stats">
                      {modulo.eventon.stats.map((stat, i) => (
                        <div key={i} className="eventon-stat">
                          <span className="n">{stat.n}</span>
                          <span className="l">{stat.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="eventon-features">
                    {modulo.eventon.features.map((feat, i) => (
                      <div key={i} className="eventon-feat">
                        <span className="feat-icon" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dangerouslySetInnerHTML={{ __html: feat.iconSvg }}
                          />
                        </span>
                        <div className="feat-body">
                          <h4>{feat.titulo}</h4>
                          <p>{feat.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* 5.6 INVESTIMENTO */}
              <article className="evt-section fade-in" id="investimento">
                <p className="eyebrow">{modulo.investimento.eyebrow}</p>
                <h2>{modulo.investimento.h2}</h2>
                <div className="investment-block">
                  <div className="invest-price">
                    <span className="label">{modulo.investimento.block.priceLabel}</span>
                    <span className="value">
                      <span className="cur">{modulo.investimento.block.priceCur}</span>
                      <span className="amt">{modulo.investimento.block.priceAmt}</span>
                    </span>
                    <span className="sub">{modulo.investimento.block.priceSub}</span>
                  </div>
                  <div className="invest-includes">
                    <h4>{modulo.investimento.block.includesTitulo}</h4>
                    <ul>
                      {modulo.investimento.block.includesItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="invest-modes">
                  {modulo.investimento.modes.map((mode, i) => (
                    <div
                      key={i}
                      className={`invest-mode${mode.featured ? " featured" : ""}`}
                    >
                      <span className="tag">{mode.tag}</span>
                      <h4>{mode.titulo}</h4>
                      <p>{mode.descricao}</p>
                    </div>
                  ))}
                </div>
              </article>

              {/* 5.7 REGRAS */}
              <article className="evt-section fade-in" id="regras">
                <p className="eyebrow">{modulo.regras.eyebrow}</p>
                <h2>{modulo.regras.h2}</h2>
                <div className="rules-list">
                  <ul>
                    {modulo.regras.rules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* 5.8 FAQ */}
              <article className="evt-section fade-in" id="faq">
                <p className="eyebrow">{modulo.faq.eyebrow}</p>
                <h2>{modulo.faq.h2}</h2>
                <div className="faq-list">
                  <ModuloFaq itens={modulo.faq.faqs} />
                </div>
              </article>

              {/* 5.9 CTA FINAL (sem id) */}
              <article
                className="evt-section fade-in"
                style={{ textAlign: "center", paddingTop: "var(--space-6)" }}
              >
                <p className="eyebrow gold">{modulo.ctaFinal.eyebrowGold}</p>
                <h2
                  style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}
                  dangerouslySetInnerHTML={{ __html: modulo.ctaFinal.h2 }}
                />
                <p
                  style={{
                    maxWidth: "640px",
                    margin: "0 auto var(--space-4)",
                  }}
                >
                  {modulo.ctaFinal.paragrafo}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {modulo.ctaFinal.ctas.map((cta, i) => (
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

- [ ] **Step 3: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): ModuloOnlineLayout (parte 2) — palestrantes+eventon+investimento+regras+faq+cta

Adiciona 6 sub-seções editoriais finais do main:
- palestrantes (3 speaker-detail-card com foto + role-tag + h3 + credentials + bio + placeholder-note).
- eventon (eventon-section com mark + 3 stats + 6 features renderizando
  <svg> com viewBox=24 + stroke=currentColor + iconSvg innerHTML).
- investimento (investment-block com price + includes 6 li, invest-modes
  3 com 3º featured).
- regras (rules-list ul com 8 li).
- faq (<ModuloFaq itens={faqs} />).
- CTA final centralizado (eyebrow gold + h2 com <em> + paragrafo + 2 CTAs).

Próximo commit fecha sidebar e related modulos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: `ModuloOnlineLayout.tsx` parte 3 — sidebar + related modulos

**Files:**
- Modify: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx`

- [ ] **Step 1: Adicionar import de ModuloCountdownSidebar**

Edit. old_string:
```
import { ModuloFaq } from "./ModuloFaq";
import { ModuloSubnav } from "./ModuloSubnav";
```

new_string:
```
import { ModuloCountdownSidebar } from "./ModuloCountdownSidebar";
import { ModuloFaq } from "./ModuloFaq";
import { ModuloSubnav } from "./ModuloSubnav";
```

- [ ] **Step 2: Substituir marcadores `{/* SIDEBAR — Task 13 */}` e `{/* RELATED MODULOS — Task 13 */}`**

Edit. old_string:
```
            {/* SIDEBAR — Task 13 */}
          </div>
        </div>
      </section>

      {/* RELATED MODULOS — Task 13 */}
    </main>
```

new_string:
```
            {/* SIDEBAR */}
            <aside className="evt-sidebar" aria-label="Card de inscrição">
              <div className="sb-card">
                <div className="sb-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={modulo.sidebar.coverImg} alt={modulo.metaTitle} loading="lazy" />
                  <span className="sb-status">{modulo.sidebar.status}</span>
                  <span
                    className="sb-cover-eventon"
                    dangerouslySetInnerHTML={{ __html: modulo.sidebar.coverEventon }}
                  />
                </div>
                <div className="sb-body">
                  <p className="sb-title-tag">{modulo.sidebar.titleTag}</p>
                  <div className="sb-rows">
                    {modulo.sidebar.rows.map((row, i) => (
                      <div
                        key={i}
                        className={`sb-row${row.price ? " price" : ""}`}
                      >
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sb-includes">
                  <h4>{modulo.sidebar.includes.titulo}</h4>
                  <ul>
                    {modulo.sidebar.includes.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <ModuloCountdownSidebar
                  label={modulo.sidebar.countdown.label}
                  dateText={modulo.sidebar.countdown.dateText}
                  deadline={modulo.sidebar.countdown.deadline}
                  tipo={modulo.sidebar.countdown.tipo}
                />
                <div className="sb-actions">
                  {modulo.sidebar.acoes.map((acao, i) => (
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
                <div className="sb-share">
                  <span style={{ color: "var(--prata)", marginRight: "4px" }}>
                    {modulo.sidebar.share.label}
                  </span>
                  {modulo.sidebar.share.links.map((link, i) => (
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

      {/* 6. RELATED MODULOS */}
      <section
        className="related-events-section"
        aria-label="Outros eventos da trilha EDUTEC e da NTC Educação"
      >
        <div className="container">
          <div className="section-head fade-in">
            <p className="eyebrow gold">{modulo.relatedModulos.eyebrowGold}</p>
            <h2>{modulo.relatedModulos.h2}</h2>
            <p
              className="section-intro"
              dangerouslySetInnerHTML={{ __html: modulo.relatedModulos.intro }}
            />
          </div>
          <div className="related-events-grid fade-in">
            {modulo.relatedModulos.cards.map((card, i) => (
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
                      <span className="days">
                        {card.date.daysStart}
                        <span className="dash">{card.date.dash}</span>
                        {card.date.daysEnd}
                      </span>
                      <span className="mon-yr">{card.date.monYr}</span>
                    </div>
                  ) : (
                    <div className="es-date single">
                      <span className="day">{card.date.day}</span>
                      <span className="mon-yr">{card.date.monYr}</span>
                    </div>
                  )}
                </div>
                <div className="es-body">
                  <div>
                    <p className="es-program">{card.program}</p>
                    <h4 className="es-title">{card.titulo}</h4>
                    <p
                      className="es-program-binding"
                      dangerouslySetInnerHTML={{
                        __html: `Integra o programa <strong>${card.programBinding}</strong>`,
                      }}
                    />
                  </div>
                  <div className="es-meta-row">
                    <span
                      className="es-meta"
                      dangerouslySetInnerHTML={{ __html: card.metaHtml }}
                    />
                  </div>
                  <a
                    className="es-cta"
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
              justifyContent: "center",
              gap: "var(--space-2)",
              marginTop: "var(--space-5)",
              flexWrap: "wrap",
            }}
          >
            {modulo.relatedModulos.footerCtas.map((cta, i) => (
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

- [ ] **Step 3: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/ModuloOnlineLayout.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): ModuloOnlineLayout (parte 3) — sidebar + related modulos

Sidebar completa: <aside class="evt-sidebar"> com <div class="sb-card">
contendo .sb-cover (img + .sb-status + .sb-cover-eventon com <em> via
dangerouslySetInnerHTML) + .sb-body (.sb-title-tag + .sb-rows com 5 .sb-row
usando <span>+<strong>) + .sb-includes (h4 + ul 6 li) +
<ModuloCountdownSidebar /> + .sb-actions (2 CTAs) + .sb-share (span com
inline style + 3 links).

Related modulos: section-head com eyebrow gold + h2 + intro com <strong>;
related-events-grid com 3 .event-secondary-card[data-area="edu"]; cada card
com .es-cover (bg-image + overlay + .es-date variant range|single) +
.es-body (.es-program + h4.es-title + .es-program-binding com prefixo
"Integra o programa " + <strong> literal + .es-meta-row + .es-cta);
footer com 2 CTAs centralizados (gap var(--space-2)).

ModuloOnlineLayout completo. Próximo commit fecha page.tsx server.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Criar `page.tsx` server (generateStaticParams nested + notFound)

**Files:**
- Create: `apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/page.tsx`

- [ ] **Step 1: Criar o page.tsx**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
  return {
    title: m.metaTitle,
    description: m.metaDescription,
  };
}

/**
 * Página /programas/[slug]/modulos/[modulo] — template dinâmico para
 * módulos individuais de programas.
 *
 * Faz lookup do módulo por slug+modulo em MODULOS_PROGRAMAS e renderiza
 * o Layout apropriado baseado em formato (atualmente só "online-ao-vivo").
 *
 * Futuros formatos (presencial/híbrido) entrarão com switch quando surgirem.
 */
export default async function ModuloPage({ params }: PageProps) {
  const { slug, modulo } = await params;
  const m = lookupModulo(slug, modulo);
  if (!m) notFound();

  // Atualmente só formato online-ao-vivo. Switch quando surgir 2º formato.
  return <ModuloOnlineLayout modulo={m} />;
}
```

- [ ] **Step 2: typecheck + lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(programas)/programas/[slug]/modulos/[modulo]/page.tsx" && git commit -m "$(cat <<'EOF'
feat(modulo): cria page.tsx server (template dinâmico /programas/[slug]/modulos/[modulo])

generateStaticParams retorna todos os pares (slug+modulo) de
MODULOS_PROGRAMAS (1 por enquanto: edutec/m01). generateMetadata gera
title/description por módulo. Lookup via helper lookupModulo retorna
undefined → notFound(). Renderiza ModuloOnlineLayout direto (sem switch
por enquanto — único formato).

revalidate = 3600.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Build + dev + auditoria manual + checkpoint visual + move HTML para feito/

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -60
```

Expected: build passa; rota `/programas/[slug]/modulos/[modulo]` aparece como `●` SSG com `/programas/edutec/modulos/m01` prerenderizado, ISR 1h.

- [ ] **Step 2: Verificar rota no output**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep -E "/programas/.*modulos|/modulos/\[modulo\]" | head -5
```

Expected: ao menos uma linha com `/programas/[slug]/modulos/[modulo]` e marker `●`, com `/programas/edutec/modulos/m01` listada como path gerado.

- [ ] **Step 3: Se build falhar, corrigir e commit**

Se erro de tipo/lint/build: ler erro completo, corrigir no arquivo apontado e re-rodar `pnpm build`. Após passar, commitar correções com mensagem `fix(modulo): ajustes pós-build de produção`.

- [ ] **Step 4: Verificar porta 3001 disponível**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN 2>/dev/null | head
```

Se ocupada, escolher 3002+ e ajustar próximos steps.

- [ ] **Step 5: Subir dev server na porta 3001 em background**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3001
```

Use `run_in_background: true`. **NÃO** use `pnpm dev`.

- [ ] **Step 6: Aguardar dev pronto**

```bash
until grep -qE "Ready in|EADDRINUSE|Error" <log-file>; do sleep 1; done
```

- [ ] **Step 7: Curl da rota**

```bash
curl -sI http://localhost:3001/programas/edutec/modulos/m01 | head -3
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 8: Curl markers e contar elementos chave**

```bash
curl -s http://localhost:3001/programas/edutec/modulos/m01 | grep -oE '<title>[^<]+</title>|class="evt-hero-tags"|class="evt-meta-item"|class="evt-nav-link|class="audience-chips"|class="why-card"|class="highlight-item"|class="schedule-node"|class="speaker-detail-card"|class="eventon-stat"|class="eventon-feat"|class="invest-mode|class="rules-list"|class="faq-item|class="sb-row|class="sb-countdown"|class="event-secondary-card"' | sort | uniq -c | sort -rn | head -25
```

Expected (contagens):
- 1 title contendo "Seminário EDUTEC · Cultura Digital"
- 8 `evt-nav-link`
- 7 `faq-item`
- 6 `why-card`
- 6 `eventon-feat`
- 5 `highlight-item`
- 5 `evt-meta-item`
- 5 `sb-row` (1 com `.price`)
- 4 `schedule-node`
- 3 `speaker-detail-card`
- 3 `eventon-stat`
- 3 `invest-mode` (1 com `.featured`)
- 3 `event-secondary-card`
- 1 `evt-hero-tags`
- 1 `audience-chips`
- 1 `rules-list`
- 1 `sb-countdown`

- [ ] **Step 9: Auditoria estrutural manual pelo controller (NÃO delegar a subagent)**

Antes de pedir validação visual humana, lê pessoalmente o `<main>` literal do HTML (`sed -n '2499,3223p' 04_Pagina_Evento_EDUTEC_M01_Online_v2.html`) e o `ModuloOnlineLayout.tsx`, comparando classes, wrappers e atributos seção por seção.

**Lições aplicadas das portas anteriores (PROSUS/Capacitação):**
- Subagents Explore dão "OK" otimisticamente. Auditoria final fica com o controller.
- Foco em: prefixos `.evt-*` / `.sb-*` corretos, sub-elementos exclusivos (`sb-title-tag`, `sb-cover-eventon`, `module-binding-note`), `.es-date.range` com `<span class="dash">` DENTRO de `.days`, `.es-date.single`, `.ttag` dentro de `.sn-time`, `.es-program-binding` com `<strong>` literal.

Se achar divergência, corrigir antes do checkpoint visual.

- [ ] **Step 10: Pedir validação visual humana**

Mensagem:

> O servidor de dev está rodando em http://localhost:3001/programas/edutec/modulos/m01. Por favor:
>
> 1. Abra http://localhost:3001/programas/edutec/modulos/m01 no navegador.
> 2. Abra também `04_Pagina_Evento_EDUTEC_M01_Online_v2.html` no navegador.
> 3. Compare lado a lado: breadcrumb 4 níveis, hero com bg-image + 3 tags + h1 com `<em>` + program binding + 3 CTAs, meta-bar 5 itens, subnav sticky com 8 âncoras (incluindo `#eventon`), e as 9 sub-seções do conteúdo principal (visão geral com 6 why-cards, público com chips+objetivo+5 highlights, programação com 4 schedule-nodes, palestrantes 3 cards, EventON com mark+3 stats+6 features, investimento com block+3 modes, regras 8 li, FAQ 7 itens, CTA final), sidebar completa com countdown (com `sb-title-tag` e `sb-cover-eventon`), related modulos 3 cards (1 range + 2 single).
> 4. Teste interatividade:
>    - **Subnav sticky + scroll-spy**: ao rolar, link da seção visível recebe `is-active`.
>    - **Dropdown "Adicionar à agenda"**: abre/fecha, gera links Google/Outlook funcionais, baixa ICS (`EDUTEC-M01-2026-mai.ics`).
>    - **Countdown**: aparece com d/h/m calculados (deadline 20-mai); se quiser, espere ~1 min para ver atualizar.
>    - **FAQ accordion**: click expande/colapsa.
>    - **Hrefs**: program binding leva a `/programas/edutec`? Crumb leva a `/`, `/capacitacao`, `/capacitacao/agenda`?
> 5. Reporte discrepâncias ou aprove.

- [ ] **Step 11: Após aprovação, encerrar dev server**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN 2>/dev/null | awk 'NR==2 {print $2}' | xargs -r kill
```

Se houve correções pós-validação, commitar com `fix(modulo): ajustes pós-checkpoint visual`.

- [ ] **Step 12: Mover protótipo para `feito/`**

Atenção: protótipos novos podem estar untracked (não commitados). Verificar com `git status --short`. Se untracked, usar `mv` + `git add feito/...`. Se tracked, usar `git mv`.

```bash
cd /Users/joao/Documents/portal-ntc && git status --short | grep "04_Pagina_Evento_EDUTEC_M01_Online_v2.html"
```

Se sair com `??` (untracked):

```bash
cd /Users/joao/Documents/portal-ntc && mv 04_Pagina_Evento_EDUTEC_M01_Online_v2.html feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html && git add feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html && git commit -m "$(cat <<'EOF'
chore(modulo): move 04_Pagina_Evento_EDUTEC_M01_Online_v2.html para feito/

Template /programas/[slug]/modulos/[modulo] portado e aprovado
visualmente pela usuária. Estabelece padrão para futuros módulos online
de programas estratégicos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se sair com `M` ou em branco (tracked), usar `git mv 04_Pagina_Evento_EDUTEC_M01_Online_v2.html feito/...` no lugar do `mv + git add`.

- [ ] **Step 13: Resumo da sessão (até 10 linhas)**

- Rota dinâmica `/programas/[slug]/modulos/[modulo]` com `generateStaticParams` nested (1 entrada: `edutec/m01`).
- Tipo único `Modulo` (formato `online-ao-vivo`) em `conteudoModulos.ts` (~900 linhas com dados literal); `MODULOS_PROGRAMAS` nested record + helper `lookupModulo`.
- 4 client components: `ModuloSubnav` (scroll-spy), `ModuloAgendaDropdown` (gera ICS/Google/Outlook), `ModuloCountdownSidebar` (setInterval 60s SSR-safe, ambos counter+text divs no DOM — fix do PROSUS aplicado), `ModuloFaq` (accordion).
- `ModuloOnlineLayout`: breadcrumb + 4 seções top-level + 9 sub-seções (com why-grid embutido em visão geral, schedule-timeline com 4 nodes, eventon-section com 6 features SVG) + sidebar (sb-card com sb-title-tag + sb-cover-eventon exclusivos) + related modulos.
- Build: `/programas/[slug]/modulos/[modulo]` `●` SSG com `/programas/edutec/modulos/m01`, ISR 1h.
- Protótipo movido para `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html`.
- Pendências fora de escopo: variantes de módulo presencial/híbrido (sessões futuras), atualizar `/programas/edutec` para listar módulos com link para `/programas/edutec/modulos/m01`, coleção `Modulo` no Payload, POST real de inscrição.

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura): Tasks 1, 2, 3, 14 (page.tsx) + Layout em 11-13.
  - §4 (page.tsx): Task 14.
  - §5 (ModuloOnlineLayout): Tasks 11-13.
  - §6 (conteudoModulos.ts): Tasks 3-6.
  - §7.1 (ModuloSubnav): Task 10.
  - §7.2 (ModuloAgendaDropdown): Task 9.
  - §7.3 (ModuloCountdownSidebar): Task 8 (com fix do PROSUS aplicado — ambos counter+text divs).
  - §7.4 (ModuloFaq): Task 7.
  - §8 (CSS): Tasks 1, 2.
  - §9 (validação): Task 15 (steps 1-13).
  - §10 (riscos): mitigados (countdown SSR-safe, ICS encoding, switch por formato (não necessário ainda), iconSvg via dangerouslySetInnerHTML, h2 inline com style margin-top, .es-date discriminator range|single).
  - §11 (fora de escopo): respeitado.

- ✅ **Sem placeholders:** todos os literais TS de cada sub-seção estão inline em Tasks 4-6. Os 4 components têm código completo. Commits têm mensagens pré-definidas. As 6 features do EventON têm iconSvg literal.

- ✅ **Type consistency:** tipos definidos em Task 3 (`Modulo`, `HeroModulo`, `MetaItem`, `NavLink`, `AudienceChip`, `WhyCard`, `HighlightItem`, `ScheduleNode`, `ScheduleTimeline`, `Palestrante`, `EventonStat`, `EventonFeat`, `InvestMode`, `ItemFaqModulo`, `RelatedModuloDate`, `RelatedModuloCard`, `SidebarModulo`, `SecaoVisaoGeral/Publico/...`) consumidos consistentemente em Tasks 4-6 e Layout. `ModuloOnlineLayout` recebe `modulo: Modulo`. `ModuloSubnav` recebe `links: NavLink[]` + `agendaIcs: Modulo["agendaIcs"]`. `ModuloAgendaDropdown` recebe `dados: Modulo["agendaIcs"]`. `ModuloCountdownSidebar` recebe `label/dateText/deadline/tipo`. `ModuloFaq` recebe `itens: ItemFaqModulo[]`.

- ✅ **Lições aplicadas:** Step 9 da Task 15 é "auditoria estrutural manual pelo controller — NÃO delegar a subagent". Fix do PROSUS aplicado: `ModuloCountdownSidebar` renderiza ambos counter+text divs no DOM (Task 8). Botão "Baixar folder" como `<button>` (não `<a>`) em `ModuloSubnav` (Task 10). `.es-date.range` com dash dentro de `.days` (Task 13). `.es-program-binding` com `<strong>` literal via dangerouslySetInnerHTML (Task 13). Sidebar rows com `<span>` + `<strong>` (não `<span class="label">` + `<span class="value">`) (Task 13). Sidebar share label com style inline `color: var(--prata); margin-right: 4px` (Task 13).
