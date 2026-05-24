# Página Agenda Geral NTC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente o protótipo `09_Pagina_Agenda_v2.html` (~4.495 linhas) para a rota `/agenda` em um novo route group `(capacitacao)`, preservando 100% do visual, dos 17 eventos, das 5 tabs, do pipeline de filtros/busca/sort/paginação client-side, do selo de deadline dinâmico, do URL sync e do sticky mobile CTA.

**Architecture:** Estratégia "porta do HTML" consolidada no projeto: CSS literal extraído para `apps/web/app/agenda-prototipo.css` (importado no root layout), `page.tsx` server component renderiza JSX literal das 6 seções do `<main>`, `conteudoAgenda.ts` armazena tipos + os 17 cards + constantes (tabs, filtros, hero, CTAs, rodapé), `PipelineAgenda.tsx` (client) cuida do estado e pipeline completo, `StickyMobileCTA.tsx` (client) cuida da barra fixa mobile. Layout do novo route group reaproveita `HeaderHome`/`FooterHome`/`InteracoesScroll` do `(home)`. Submit real, analytics e CMS ficam fora — stub no-op preservado com TODOs.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind para classes do protótipo, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/agenda-prototipo.css` — CSS literal (~1.960 linhas) das linhas 96-2055 do HTML, com `url('./img/...')` → `url('/img/...')`.
- `apps/web/app/(capacitacao)/layout.tsx` — layout do novo route group (HeaderHome + FooterHome + InteracoesScroll).
- `apps/web/app/(capacitacao)/agenda/page.tsx` — server component, `revalidate = 3600`, JSX literal das 6 seções do `<main>`.
- `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts` — tipos + 17 cards + hero + tabs + filtros + CTAs + rodapé + sticky.
- `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx` — client: estado + pipeline + tabs + filterbar + destaques + grid + counter + applied + paginação + URL sync + deadline dinâmico + analytics no-op.
- `apps/web/app/(capacitacao)/agenda/StickyMobileCTA.tsx` — client: scroll listener + dismiss em sessionStorage.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./agenda-prototipo.css"` ao lado dos outros CSSs de protótipo.

**Não tocar (referência):**
- `apps/web/app/(home)/HeaderHome.tsx`, `apps/web/app/(home)/FooterHome.tsx`, `apps/web/app/(home)/InteracoesScroll.tsx` — header/footer/scroll compartilhados.

---

## Task 1: Extrair CSS literal do protótipo para `agenda-prototipo.css`

**Files:**
- Create: `apps/web/app/agenda-prototipo.css`

- [ ] **Step 1: Extrair as linhas 96-2055 do HTML (conteúdo entre `<style>` e `</style>` exclusive)**

Comando:

```bash
sed -n '96,2055p' /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html > /Users/joao/Documents/portal-ntc/apps/web/app/agenda-prototipo.css
```

Expected: arquivo de ~1.960 linhas criado.

- [ ] **Step 2: Verificar tamanho do arquivo**

Comando:

```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/agenda-prototipo.css
```

Expected: `1960 /Users/joao/Documents/portal-ntc/apps/web/app/agenda-prototipo.css` (ou número próximo).

- [ ] **Step 3: Converter `url('./img/...')` para `url('/img/...')` (4 ocorrências)**

Comando:

```bash
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/agenda-prototipo.css
```

- [ ] **Step 4: Verificar que não restam `url('./` no arquivo**

Comando:

```bash
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/agenda-prototipo.css
```

Expected: nenhuma saída (exit code 1).

- [ ] **Step 5: Verificar que as 4 imagens existem em `public/`**

Comando:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/hero-principal.1920.webp /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/eventon-estudio.1920.webp /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/contratacao.1920.webp /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/hero-grupo-plenaria.1920.webp
```

Expected: todos os 4 arquivos listados sem erro.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/agenda-prototipo.css
git commit -m "$(cat <<'EOF'
feat(agenda): extrai CSS literal do protótipo 09 para agenda-prototipo.css

Bloco <style> de 09_Pagina_Agenda_v2.html (linhas 96-2055) copiado
sem adaptação, com url('./img/...') convertido para url('/img/...').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `agenda-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Localizar o último import de CSS de protótipo no root layout**

Comando:

```bash
grep -n "prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: linhas listando `home-prototipo.css`, `o-grupo-prototipo.css`, `verticais-prototipo.css`, `programas-prototipo.css`, `corpo-docente-prototipo.css`, `institucional-prototipo.css`, `contato-prototipo.css`.

- [ ] **Step 2: Adicionar `import "./agenda-prototipo.css"` depois do último CSS de protótipo**

Edit em `apps/web/app/layout.tsx`. Substituir o último import `prototipo.css` por ele mesmo seguido do novo bloco. Por exemplo, se a última linha for `import "./contato-prototipo.css";`, substituir:

old_string:
```
import "./contato-prototipo.css";
```

new_string:
```
import "./contato-prototipo.css";
// CSS da página /agenda (portada literal de 09_Pagina_Agenda_v2.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.agenda-hero, .agenda-tabs,
// .agenda-filterbar, .agenda-grid, .event-card, .agenda-destaques,
// .agenda-empty, .agenda-pagination, .agenda-intercta, .agenda-context,
// .agenda-sticky-mobile-cta, .event-deadline-seal).
import "./agenda-prototipo.css";
```

- [ ] **Step 3: Verificar typecheck do root layout**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa sem erro novo (pode haver warnings preexistentes não relacionados).

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(agenda): importa agenda-prototipo.css no root layout

Carrega CSS da página /agenda no root para herdar a mesma estratégia
dos outros CSSs de protótipo (escopo seguro por classes específicas).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar layout do novo route group `(capacitacao)`

**Files:**
- Create: `apps/web/app/(capacitacao)/layout.tsx`

- [ ] **Step 1: Criar diretório do route group**

Comando:

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/agenda"
```

- [ ] **Step 2: Criar `(capacitacao)/layout.tsx`**

Write em `apps/web/app/(capacitacao)/layout.tsx`:

```tsx
import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas do guarda-chuva Capacitação:
 *   /agenda          (porta de 09_Pagina_Agenda_v2.html)
 *
 * Sessões futuras: /eventos-online, /eventos-presenciais,
 * /eventos-hibridos, /eventon, hub /capacitacao.
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx e (vertical)/layout.tsx.
 *
 * CSS específico de cada página vem do root layout (agenda-prototipo.css).
 */
export default function CapacitacaoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): cria layout do novo route group (capacitacao)

Espelha o padrão dos demais route groups (institucional, programas,
o-grupo, vertical): HeaderHome + FooterHome + InteracoesScroll do (home).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Criar `conteudoAgenda.ts` — tipos e constantes (sem cards ainda)

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`

- [ ] **Step 1: Criar o arquivo com tipos, hero, tabs, filtros, defaults, empty state, CTAs intermediários, rodapé contextual e sticky CTA**

Write em `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /AGENDA
//  Porta de 09_Pagina_Agenda_v2.html (linhas 2237-3026 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs (espelham data-* dos cards) -----------------

export type AreaSlug = "edu" | "gov" | "sau";

export type TabSlug = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

export type StatusEvento = "abertas" | "proximas" | "em-breve" | "replay" | "realizados";

export type FormatoEvento =
  | "seminario"
  | "oficina"
  | "curso"
  | "jornada"
  | "simposio"
  | "congresso";

export type ModalidadeEvento = "online" | "presencial" | "hibrido";

export type ProgramaSlug =
  | "EDUTEC"
  | "PEAR"
  | "PEI"
  | "PROGE"
  | "PROGIR"
  | "EGIDE"
  | "VIVAESCOLA"
  | "PINEI"
  | "FUTURA"
  | "AGIP"
  | "LIDERA"
  | "SIGA"
  | "SIGS"
  | "PROAPS"
  | "PROSUS";

export type FlagEvento =
  | "destaque_editorial"
  | "prioridade_comercial"
  | "ultimas_vagas"
  | "fixado_na_agenda";

export type CidadeSlug = "" | "brasilia" | "sp" | "recife" | "salvador" | "fortaleza";

// ----------------- Tipos de bloco de data -----------------

export type DataBloco =
  | { tipo: "range"; diaInicio: string; diaFim: string; mesAno: string }
  | { tipo: "multi"; quantidade: number; rotulo: string; periodo: string }
  | { tipo: "single"; dia: string; mesAno: string };

// ----------------- Link interno (CTA, programa binding, etc.) -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  title?: string;
}

// ----------------- Cartão de evento (espelho do <article class="event-card">) -----------------

export interface CartaoEvento {
  ordem: number; // posição original no protótipo (1..17)

  // data-* attributes (preservados para CSS/seletores)
  area: AreaSlug;
  programa: ProgramaSlug;
  formato: FormatoEvento;
  modalidade: ModalidadeEvento;
  cidade: CidadeSlug;
  mes: string; // YYYY-MM
  cargaHorariaHoras: number;
  valorReais: number;
  dataIso: string; // YYYY-MM-DD
  deadlineIso: string; // YYYY-MM-DD
  tab: TabSlug;
  flags: FlagEvento[];
  keywords: string;
  status: StatusEvento;

  // Conteúdo visual
  selo: { texto: string; classe: string }; // ex.: "Inscrições abertas" / "status-open"
  imagemUrl: string;
  dataBloco: DataBloco;
  modalidadeLabel: string;
  modalidadeClasseExtra?: "hibrido" | "presencial";
  formatoLabel: string;
  areaLabel: string;
  tituloHtml: string; // pode conter inline tags
  coordenacaoNomes: string;
  metaEssenciais: [string, string];
  precoIndividualLabel: string;
  precoEquipesLabel: string;
  programaBinding: { sigla: string; href: string; cmsLink: string };
  ctaInscrever: LinkInterno;
  linkDetalhes: LinkInterno;
  linkInscreverEquipe: LinkInterno;
}

// ----------------- HERO -----------------

export const HERO_AGENDA = {
  eyebrow: "Capacitação e Desenvolvimento · Edição 2026",
  tituloHtml:
    "Agenda <em>Geral NTC</em>.<br>Eventos, formações e jornadas com inscrições abertas.",
  sub:
    "Encontre seminários, oficinas, cursos executivos, jornadas, simpósios e congressos do Grupo NTC nas áreas de Educação, Gestão Pública e Saúde — em formato online, presencial ou híbrido.",
  ctas: [
    {
      classe: "btn btn--gold",
      texto: "Ver eventos com inscrições abertas",
      seta: true,
      href: "#agenda-eventos",
      cmsLink: "ver-eventos-abertos",
      track: "hero_cta_ver_eventos",
    },
    {
      classe: "btn btn--ghost-light",
      texto: "Solicitar proposta para equipe ou órgão público",
      seta: false,
      href: "/contato",
      // TODO: protótipo aponta para tab `#tab-proposta` — ativar quando /contato suportar âncoras de tab
      cmsLink: "proposta-equipe-orgao",
      track: "hero_cta_proposta",
    },
  ],
  microbar: [
    { valor: "18", rotulo: "eventos abertos", id: "microbar-abertos" },
    { valor: "6", rotulo: "formatos comerciais" },
    { valor: "3", rotulo: "áreas estratégicas" },
    { valor: "5", rotulo: "capitais nacionais" },
  ],
} as const;

// ----------------- TABS -----------------

export interface TabAgenda {
  slug: TabSlug;
  rotulo: string;
  idCount: string;
}

export const TABS_AGENDA: TabAgenda[] = [
  { slug: "abertas", rotulo: "Inscrições abertas", idCount: "cnt-abertas" },
  { slug: "proximas", rotulo: "Próximas turmas", idCount: "cnt-proximas" },
  { slug: "em-breve", rotulo: "Em breve", idCount: "cnt-em-breve" },
  { slug: "replay", rotulo: "Replay disponível", idCount: "cnt-replay" },
  { slug: "realizados", rotulo: "Eventos realizados", idCount: "cnt-realizados" },
];

// ----------------- FILTROS -----------------

export interface OpcaoSelect {
  value: string;
  label: string;
}

export interface OptgroupSelect {
  label: string;
  opcoes: OpcaoSelect[];
}

export const FILTRO_AREA: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "edu", label: "NTC Educação" },
  { value: "gov", label: "NTC Gestão Pública" },
  { value: "sau", label: "NTC Saúde" },
];

export const FILTRO_MODALIDADE: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "online", label: "Online ao vivo + replay" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido" },
];

export const FILTRO_MES: OpcaoSelect[] = [
  { value: "", label: "Todos" },
  { value: "2026-05", label: "Mai 2026" },
  { value: "2026-06", label: "Jun 2026" },
  { value: "2026-07", label: "Jul 2026" },
  { value: "2026-08", label: "Ago 2026" },
  { value: "2026-09", label: "Set 2026" },
  { value: "2026-10", label: "Out 2026" },
];

export const FILTRO_PROGRAMA_GROUPS: OptgroupSelect[] = [
  {
    label: "NTC Educação",
    opcoes: [
      { value: "EDUTEC", label: "EDUTEC" },
      { value: "PEAR", label: "PEAR" },
      { value: "PEI", label: "PEI" },
      { value: "PROGE", label: "PROGE" },
      { value: "PROGIR", label: "PROGIR" },
      { value: "EGIDE", label: "EGIDE" },
      { value: "VIVAESCOLA", label: "VIVAESCOLA" },
      { value: "PINEI", label: "PINEI" },
      { value: "FUTURA", label: "FUTURA" },
    ],
  },
  {
    label: "NTC Gestão Pública",
    opcoes: [
      { value: "AGIP", label: "AGIP" },
      { value: "LIDERA", label: "LIDERA" },
      { value: "SIGA", label: "SIGA" },
    ],
  },
  {
    label: "NTC Saúde",
    opcoes: [
      { value: "SIGS", label: "SIGS" },
      { value: "PROAPS", label: "PROAPS+" },
      { value: "PROSUS", label: "PROSUS+" },
    ],
  },
];

export const FILTRO_FORMATO: OpcaoSelect[] = [
  { value: "", label: "Todos" },
  { value: "seminario", label: "Seminário" },
  { value: "oficina", label: "Oficina" },
  { value: "curso", label: "Curso Executivo" },
  { value: "jornada", label: "Jornada" },
  { value: "simposio", label: "Simpósio" },
  { value: "congresso", label: "Congresso" },
];

export const FILTRO_CIDADE: OpcaoSelect[] = [
  { value: "", label: "Todas" },
  { value: "brasilia", label: "Brasília · DF" },
  { value: "sp", label: "São Paulo · SP" },
  { value: "recife", label: "Recife · PE" },
  { value: "salvador", label: "Salvador · BA" },
  { value: "fortaleza", label: "Fortaleza · CE" },
];

export const FILTRO_SORT: OpcaoSelect[] = [
  { value: "editorial", label: "Editorial (destaque + cronologia)" },
  { value: "cronologica", label: "Cronologia (próximos primeiro)" },
  { value: "encerramento", label: "Encerramento das inscrições" },
  { value: "ch", label: "Carga horária" },
  { value: "valor-asc", label: "Valor (menor → maior)" },
  { value: "valor-desc", label: "Valor (maior → menor)" },
];

export type SortSlug =
  | "editorial"
  | "cronologica"
  | "encerramento"
  | "ch"
  | "valor-asc"
  | "valor-desc";

export const PERPAGE_OPCOES = [9, 12, 18] as const;
export type PerPageOpcao = (typeof PERPAGE_OPCOES)[number];

export const DEFAULTS = {
  tab: "abertas" as TabSlug,
  sort: "editorial" as SortSlug,
  page: 1,
  perPage: 9 as PerPageOpcao,
};

// Labels para chips de filtros aplicados (espelha objeto `labels` do protótipo)
export const LABELS = {
  area: { edu: "NTC Educação", gov: "NTC Gestão Pública", sau: "NTC Saúde" } as Record<
    AreaSlug,
    string
  >,
  formato: {
    seminario: "Seminário",
    oficina: "Oficina",
    curso: "Curso Executivo",
    jornada: "Jornada",
    simposio: "Simpósio",
    congresso: "Congresso",
  } as Record<FormatoEvento, string>,
  modalidade: {
    online: "Online ao vivo",
    presencial: "Presencial",
    hibrido: "Híbrido",
  } as Record<ModalidadeEvento, string>,
  cidade: {
    brasilia: "Brasília · DF",
    sp: "São Paulo · SP",
    recife: "Recife · PE",
    salvador: "Salvador · BA",
    fortaleza: "Fortaleza · CE",
  } as Record<Exclude<CidadeSlug, "">, string>,
  mes: {
    "2026-05": "Mai 2026",
    "2026-06": "Jun 2026",
    "2026-07": "Jul 2026",
    "2026-08": "Ago 2026",
    "2026-09": "Set 2026",
    "2026-10": "Out 2026",
  } as Record<string, string>,
};

// ----------------- EMPTY STATE -----------------

export const EMPTY_AGENDA = {
  titulo: "Nenhum evento encontrado com os filtros aplicados.",
  descricao:
    "Tente remover algum filtro ou solicite uma capacitação sob medida para a sua instituição — desenhamos a oferta com você.",
  ctaLimpar: { texto: "Limpar filtros", href: "#" },
  ctaSobMedida: {
    texto: "Solicitar evento sob medida",
    href: "/contato",
    cmsLink: "solicitar-sob-medida",
    track: "empty_state_sob_medida",
  },
};

// ----------------- CTAs INTERMEDIÁRIOS -----------------

export interface CtaIntermediario {
  eyebrow: string;
  tituloHtml: string;
  descricao: string;
  cta: LinkInterno;
  classeExtra?: "alt";
}

export const CTAS_INTERMEDIARIOS: CtaIntermediario[] = [
  {
    eyebrow: "Sob medida · Solução exclusiva",
    tituloHtml:
      "Desenhe uma capacitação exclusiva para a <em>sua instituição</em>",
    descricao:
      "Solicite um evento sob medida com ementa, especialistas, formato e calendário alinhados às necessidades da sua equipe, rede ou órgão público.",
    cta: {
      texto: "Solicitar evento sob medida",
      href: "/contato",
      cmsLink: "solicitar-sob-medida",
      track: "cta_intermediate_sob_medida",
    },
  },
  {
    eyebrow: "In company · Turmas fechadas",
    tituloHtml: "Leve esta formação para a sua <em>equipe ou órgão público</em>",
    descricao:
      "Programas, jornadas e módulos do portfólio NTC podem ser organizados em turmas fechadas, soluções in company ou trilhas institucionais personalizadas.",
    cta: {
      texto: "Falar com atendimento institucional",
      href: "/contato",
      cmsLink: "atendimento-institucional",
      track: "cta_intermediate_in_company",
    },
    classeExtra: "alt",
  },
];

// ----------------- RODAPÉ CONTEXTUAL -----------------

export interface ColunaRodape {
  titulo: string;
  itens: LinkInterno[];
}

export const RODAPE_CONTEXTUAL: ColunaRodape[] = [
  {
    titulo: "Áreas estratégicas",
    itens: [
      { texto: "NTC Educação", href: "/solucoes-estrategicas/ntc-educacao", cmsLink: "vertical-edu" },
      // TODO: rota /solucoes-estrategicas/ntc-gestao-publica existe — verificar slug
      { texto: "NTC Gestão Pública", href: "/solucoes-estrategicas/ntc-gestao-publica", cmsLink: "vertical-gov" },
      { texto: "NTC Saúde", href: "/solucoes-estrategicas/ntc-saude", cmsLink: "vertical-sau" },
    ],
  },
  {
    titulo: "Plataforma e suporte",
    itens: [
      // TODO: âncora #eventon ainda não existe em /o-grupo
      { texto: "EventOn · Plataforma de transmissão", href: "/o-grupo#eventon", cmsLink: "eventon" },
      { texto: "Suporte ao participante", href: "/contato", cmsLink: "eventon-suporte" },
      { texto: "Área do Participante", href: "/contato", cmsLink: "area-participante" },
    ],
  },
  {
    titulo: "Modelos de contratação",
    itens: [
      // TODO: âncora #juridico ainda não existe em /o-grupo
      { texto: "Lei 14.133/2021 · Inexigibilidade", href: "/o-grupo#juridico", cmsLink: "contratacao-lei14133" },
      { texto: "Soluções in company", href: "/contato", cmsLink: "contratacao-incompany" },
      { texto: "Soluções sob medida", href: "/contato", cmsLink: "contratacao-sobmedida" },
    ],
  },
  {
    titulo: "Atendimento comercial",
    itens: [
      { texto: "Solicitar proposta institucional", href: "/contato", cmsLink: "proposta-institucional" },
      { texto: "WhatsApp · (63) 98444-4040", href: "/contato", cmsLink: "whatsapp" },
      { texto: "contato@institutontc.com.br", href: "/contato", cmsLink: "comercial-email" },
    ],
  },
];

// ----------------- STICKY MOBILE CTA -----------------

export const STICKY_CTA = {
  strong: "Precisa de ajuda?",
  texto: "Atendimento institucional NTC",
  cta: {
    texto: "Falar com atendimento",
    href: "/contato",
    cmsLink: "atendimento-mobile",
    track: "sticky_cta_atendimento",
  },
};

// ----------------- BREADCRUMB -----------------

export const BREADCRUMB_AGENDA = [
  { texto: "Grupo NTC", href: "/", cmsLink: "home" },
  { texto: "Capacitação", href: null }, // sem rota ainda
  { texto: "Agenda Geral", href: null, current: true },
];
```

- [ ] **Step 2: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa sem erro (o arquivo só exporta dados; CartaoEvento ainda não é usado em lugar nenhum).

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): cria conteudoAgenda.ts com tipos e constantes não-evento

Tipos para CartaoEvento, AreaSlug, TabSlug, FormatoEvento, ModalidadeEvento,
ProgramaSlug, FlagEvento, SortSlug etc. Constantes para hero, tabs, todos os
filtros, defaults, labels, empty state, CTAs intermediários, rodapé contextual,
sticky CTA, breadcrumb. Os 17 cards de evento entram em commits separados.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Adicionar os 17 eventos a `conteudoAgenda.ts` — eventos 1 a 9 (NTC Educação)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`

- [ ] **Step 1: Adicionar `EVENTOS` array com os 9 primeiros cards ao final do arquivo**

Edit em `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`. Adicionar ao final (após STICKY_CTA / BREADCRUMB_AGENDA):

old_string (final do arquivo, depois do BREADCRUMB_AGENDA):
```
export const BREADCRUMB_AGENDA = [
  { texto: "Grupo NTC", href: "/", cmsLink: "home" },
  { texto: "Capacitação", href: null }, // sem rota ainda
  { texto: "Agenda Geral", href: null, current: true },
];
```

new_string (mantém o BREADCRUMB_AGENDA e adiciona EVENTOS abaixo):
```
export const BREADCRUMB_AGENDA = [
  { texto: "Grupo NTC", href: "/", cmsLink: "home" },
  { texto: "Capacitação", href: null }, // sem rota ainda
  { texto: "Agenda Geral", href: null, current: true },
];

// ----------------- 17 EVENTOS (ordem literal do protótipo) -----------------
//
// Mapeamento fiel de cada <article class="event-card"> do <main> do HTML
// (linhas 2475-2998). Nenhum texto é rephrased. Todos os data-* são
// preservados nos campos do CartaoEvento.

export const EVENTOS: CartaoEvento[] = [
  // EV 01 · PEAR · Online · Seminário · NTC Educação
  {
    ordem: 1,
    area: "edu",
    programa: "PEAR",
    formato: "seminario",
    modalidade: "online",
    cidade: "",
    mes: "2026-05",
    cargaHorariaHoras: 16,
    valorReais: 1490,
    dataIso: "2026-05-22",
    deadlineIso: "2026-05-13",
    tab: "abertas",
    flags: ["destaque_editorial", "prioridade_comercial"],
    keywords: "alfabetizacao recomposicao aprendizagem currículo formacao docente",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "22", diaFim: "23", mesAno: "Mai · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    areaLabel: "NTC Educação",
    tituloHtml: "Alfabetização de Alta Performance: estratégias para recomposição da aprendizagem",
    coordenacaoNomes:
      "NTC Educação · Especialistas em alfabetização, currículo e formação docente · com convidados",
    metaEssenciais: ["16h · 2 dias", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PEAR", href: "/programas", cmsLink: "programa-PEAR" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PEAR-2026-mai",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PEAR-2026-mai",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEAR",
      track: "cta_proposta_grupo",
    },
  },

  // EV 02 · EDUTEC · Híbrido · Oficina · NTC Educação
  {
    ordem: 2,
    area: "edu",
    programa: "EDUTEC",
    formato: "oficina",
    modalidade: "hibrido",
    cidade: "sp",
    mes: "2026-06",
    cargaHorariaHoras: 12,
    valorReais: 980,
    dataIso: "2026-06-12",
    deadlineIso: "2026-06-05",
    tab: "abertas",
    flags: [],
    keywords: "ia generativa tecnologia educacional pedagogia",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/educacao-inclusiva.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 3, rotulo: "encontros", periodo: "Jun · 2026" },
    modalidadeLabel: "Híbrido · SP",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Oficina",
    areaLabel: "NTC Educação",
    tituloHtml: "EDUTEC · IA generativa aplicada à gestão pedagógica e à formação docente",
    coordenacaoNomes:
      "NTC Educação · Especialistas em tecnologias educacionais e formação · com convidados",
    metaEssenciais: ["12h · 3 encontros", "São Paulo · SP"],
    precoIndividualLabel: "R$ 980",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "EDUTEC", href: "/programas", cmsLink: "programa-EDUTEC" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-EDUTEC-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-EDUTEC-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-EDUTEC",
      track: "cta_proposta_grupo",
    },
  },

  // EV 03 · PROGE · Presencial · Curso Executivo · NTC Educação (últimas vagas)
  {
    ordem: 3,
    area: "edu",
    programa: "PROGE",
    formato: "curso",
    modalidade: "presencial",
    cidade: "brasilia",
    mes: "2026-06",
    cargaHorariaHoras: 24,
    valorReais: 3290,
    dataIso: "2026-06-05",
    deadlineIso: "2026-05-15",
    tab: "abertas",
    flags: ["ultimas_vagas"],
    keywords: "gestao escolar coordenacao pedagogica resultados",
    status: "abertas",
    selo: { texto: "Últimas vagas", classe: "status-last" },
    imagemUrl: "/img/fotos/_optimized/area-educacao.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "05", diaFim: "07", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · Brasília",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Curso Executivo",
    areaLabel: "NTC Educação",
    tituloHtml: "PROGE · Gestão escolar, coordenação pedagógica e resultados de aprendizagem",
    coordenacaoNomes:
      "NTC Educação · Especialistas em gestão escolar, currículo e avaliação · com convidados",
    metaEssenciais: ["24h · 3 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 3.290",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PROGE", href: "/programas", cmsLink: "programa-PROGE" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PROGE-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PROGE-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Proposta para grupo",
      href: "/contato",
      cmsLink: "proposta-grupo-PROGE",
      track: "cta_proposta_grupo",
    },
  },

  // EV 04 · VIVAESCOLA · Online · Jornada · NTC Educação
  {
    ordem: 4,
    area: "edu",
    programa: "VIVAESCOLA",
    formato: "jornada",
    modalidade: "online",
    cidade: "",
    mes: "2026-06",
    cargaHorariaHoras: 32,
    valorReais: 2490,
    dataIso: "2026-06-18",
    deadlineIso: "2026-06-10",
    tab: "abertas",
    flags: [],
    keywords: "convivencia escolar bem-estar protecao integral",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/conteudo-01.1920.webp",
    dataBloco: { tipo: "multi", quantidade: 4, rotulo: "encontros", periodo: "Jun – Jul · 2026" },
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Jornada",
    areaLabel: "NTC Educação",
    tituloHtml: "VIVAESCOLA · Convivência, permanência, bem-estar e proteção integral",
    coordenacaoNomes:
      "NTC Educação · Especialistas em convivência escolar, bem-estar e proteção · com convidados",
    metaEssenciais: ["32h · 4 encontros", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 2.490",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "VIVAESCOLA", href: "/programas", cmsLink: "programa-VIVAESCOLA" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-VIVAESCOLA-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-VIVAESCOLA-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-VIVAESCOLA",
      track: "cta_proposta_grupo",
    },
  },

  // EV 05 · PEI · Presencial · Simpósio · NTC Educação
  {
    ordem: 5,
    area: "edu",
    programa: "PEI",
    formato: "simposio",
    modalidade: "presencial",
    cidade: "salvador",
    mes: "2026-06",
    cargaHorariaHoras: 12,
    valorReais: 1690,
    dataIso: "2026-06-26",
    deadlineIso: "2026-06-19",
    tab: "abertas",
    flags: [],
    keywords: "educacao integral curriculo gestao redes",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/conteudo-02.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "26", diaFim: "27", mesAno: "Jun · 2026" },
    modalidadeLabel: "Presencial · Salvador",
    modalidadeClasseExtra: "presencial",
    formatoLabel: "Simpósio",
    areaLabel: "NTC Educação",
    tituloHtml: "PEI · Educação Integral — gestão, currículo e resultados em escala",
    coordenacaoNomes:
      "NTC Educação · Especialistas em educação integral, currículo e gestão de redes · com convidados",
    metaEssenciais: ["12h · 2 tardes", "Salvador · BA"],
    precoIndividualLabel: "R$ 1.690",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PEI", href: "/programas", cmsLink: "programa-PEI" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PEI-2026-jun",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PEI-2026-jun",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEI",
      track: "cta_proposta_grupo",
    },
  },
];
```

Os eventos 6-9 serão adicionados na próxima etapa deste mesmo task. **Por ora salve, rode typecheck e siga para o step 2.**

- [ ] **Step 2: Verificar typecheck (5 eventos parciais)**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 3: Adicionar eventos 6 a 9 ao array `EVENTOS`**

Edit em `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`. Localizar o fechamento `];` do array `EVENTOS` e antes dele inserir os próximos 4 eventos.

old_string (último evento já inserido + fechamento):
```
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEI",
      track: "cta_proposta_grupo",
    },
  },
];
```

new_string:
```
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PEI",
      track: "cta_proposta_grupo",
    },
  },

  // EV 06 · PINEI · Híbrido · Congresso · NTC Educação
  {
    ordem: 6,
    area: "edu",
    programa: "PINEI",
    formato: "congresso",
    modalidade: "hibrido",
    cidade: "brasilia",
    mes: "2026-07",
    cargaHorariaHoras: 40,
    valorReais: 3890,
    dataIso: "2026-07-12",
    deadlineIso: "2026-07-04",
    tab: "abertas",
    flags: [],
    keywords: "primeira infancia educacao infantil 0-6 politicas",
    status: "abertas",
    selo: { texto: "Inscrições abertas", classe: "status-open" },
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    dataBloco: { tipo: "range", diaInicio: "12", diaFim: "16", mesAno: "Jul · 2026" },
    modalidadeLabel: "Híbrido · Brasília",
    modalidadeClasseExtra: "hibrido",
    formatoLabel: "Congresso",
    areaLabel: "NTC Educação",
    tituloHtml: "PINEI · I Congresso Nacional da Primeira Infância e Educação Infantil",
    coordenacaoNomes:
      "NTC Educação · Especialistas em primeira infância, educação infantil e políticas para zero a seis anos · com convidados",
    metaEssenciais: ["40h · 5 dias", "Brasília · DF"],
    precoIndividualLabel: "R$ 3.890",
    precoEquipesLabel: "Sob consulta",
    programaBinding: { sigla: "PINEI", href: "/programas", cmsLink: "programa-PINEI" },
    ctaInscrever: {
      texto: "Inscrever-se",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "inscricao-PINEI-2026-jul",
      track: "cta_inscrever",
    },
    linkDetalhes: {
      texto: "Ver detalhes",
      href: "#agenda-eventos",
      title: "Página interna em construção · disponível com a publicação do CMS",
      cmsLink: "detalhes-PINEI-2026-jul",
      track: "event_card_detail",
    },
    linkInscreverEquipe: {
      texto: "Inscrever equipe",
      href: "/contato",
      cmsLink: "proposta-grupo-PINEI",
      track: "cta_proposta_grupo",
    },
  },
];
```

**Importante:** os eventos 7, 8 e 9 precisam ser lidos diretamente do HTML para construção fiel. Antes de adicionar, execute:

```bash
sed -n '$(grep -n "EV 07" /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html | head -1 | cut -d: -f1),$(grep -n "EV 10" /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html | head -1 | cut -d: -f1)p' /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html
```

Para cada evento (7, 8, 9), copiar literalmente todos os `data-*`, o selo, a imagem (extrair do `style="background-image:url('./img/...');"` substituindo `./img/` por `/img/`), o `event-date-block` (range/multi/single conforme classe), o `event-modality` com label + classe extra, o `event-program-link` (formato e área), o `<h3>`, o `event-speakers-line .names`, os dois `<span>` dentro de `event-meta-essentials`, o sigla do binding, os 3 CTAs com `data-cms-link` e `data-track`.

**Padrão obrigatório:**
- `programaBinding.href` sempre `/programas` (não usar `#programas` do protótipo).
- `linkInscreverEquipe.href` sempre `/contato` (não `./02_Prototipo_Home_GrupoNTC_v2_6.html#contato`).
- `ctaInscrever.href` e `linkDetalhes.href` mantêm `#agenda-eventos` (placeholder do próprio protótipo).
- Se o card tem texto "Proposta para grupo" em vez de "Inscrever equipe", preservar literal.
- Se o selo for "Últimas vagas" usar `classe: "status-last"`. Se "Próxima turma", `"status-soon"`. Se "Em breve", `"status-coming"`. Se "Replay disponível", `"status-replay"`. Se "Já realizado", `"status-closed"`.

- [ ] **Step 4: Verificar typecheck após adicionar até EV 09**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 5: Commit dos eventos 1-9**

```bash
git add "apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona EVENTOS 1-9 (NTC Educação) em conteudoAgenda.ts

Eventos da vertical NTC Educação portados literalmente do <main> do
protótipo 09_Pagina_Agenda_v2.html: PEAR, EDUTEC, PROGE, VIVAESCOLA,
PEI, PINEI e demais. Todos os data-* preservados (área, programa,
formato, modalidade, cidade, mês, ch, valor, dateiso, deadline-iso,
tab, flags, keywords, status). Hrefs internos atualizados para rotas
existentes (/programas, /contato).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Adicionar eventos 10 a 14 (Gestão Pública + transição) a `conteudoAgenda.ts`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`

- [ ] **Step 1: Ler o bloco de eventos 10-14 do HTML**

Comando:

```bash
awk '/EV 10/,/EV 15/' /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html | head -180
```

Confirme com a saída todos os campos antes de transcrever.

- [ ] **Step 2: Inserir eventos 10 a 14 antes do fechamento `];` do array `EVENTOS`**

Mesmo método do Task 5 step 3 (Edit substituindo `  },\n];` → `  },\n  // EV 10...\n  { ... },\n  // EV 11...\n  ...\n];`).

Para cada evento, preservar literalmente:
- Slug do programa (LIDERA, SIGA, AGIP, etc.).
- Selo correto conforme `data-status` e classe do `<span class="event-status-tag ...">`.
- `imagemUrl` extraída do `style="background-image:url('./img/...');"` → `/img/...`.
- `dataBloco` conforme classe `.range` / `.multi` / `.single`.
- `modalidadeLabel` e `modalidadeClasseExtra` literais (`hibrido` ou `presencial` quando aparecer no `class` do `<span class="event-modality ...">`).
- `metaEssenciais` como tupla dos 2 `<span>` filhos.
- `coordenacaoNomes` da `<span class="names">`.
- 3 CTAs com `cmsLink` e `track` literais.

- [ ] **Step 3: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 4: Commit eventos 10-14**

```bash
git add "apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona EVENTOS 10-14 em conteudoAgenda.ts

Continua a porta literal dos cards do <main> do protótipo
09_Pagina_Agenda_v2.html. Cobre eventos de NTC Educação restantes
e transição para Gestão Pública (LIDERA, SIGA, AGIP).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Adicionar eventos 15 a 17 (NTC Saúde) a `conteudoAgenda.ts`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts`

- [ ] **Step 1: Ler o bloco de eventos 15-17 do HTML**

Comando:

```bash
awk '/EV 15/,/<\/div>[[:space:]]*<!-- ESTADO VAZIO/' /Users/joao/Documents/portal-ntc/09_Pagina_Agenda_v2.html | head -180
```

- [ ] **Step 2: Inserir eventos 15 a 17 antes do fechamento `];` do array `EVENTOS`**

Para cada evento (provavelmente SIGS, PROAPS+, PROSUS+), seguir o mesmo padrão dos Tasks 5 e 6. Atenção: `programa: "PROAPS"` e `programa: "PROSUS"` (sem `+` — o `+` aparece só em labels visuais).

- [ ] **Step 3: Verificar contagem final de eventos**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && node -e "
import('./apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts').then(m => {
  console.log('Total eventos:', m.EVENTOS.length);
  console.log('Por tab:', Object.entries(
    m.EVENTOS.reduce((a, e) => { a[e.tab] = (a[e.tab]||0)+1; return a; }, {})
  ));
}).catch(e => console.error('Falhou:', e.message));
"
```

Como pode falhar pelo ESM/transpile, alternativa simples — usar grep:

```bash
grep -c "ordem:" /Users/joao/Documents/portal-ntc/apps/web/app/\(capacitacao\)/agenda/conteudoAgenda.ts
```

Expected: 17.

- [ ] **Step 4: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 5: Commit eventos 15-17**

```bash
git add "apps/web/app/(capacitacao)/agenda/conteudoAgenda.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona EVENTOS 15-17 (NTC Saúde) em conteudoAgenda.ts

Completa os 17 cards do protótipo 09_Pagina_Agenda_v2.html.
Vertical NTC Saúde (SIGS, PROAPS+, PROSUS+) com slugs ProgramaSlug
"PROAPS" e "PROSUS" (sem "+", que aparece só em labels visuais).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Criar `StickyMobileCTA.tsx` (client, scroll + sessionStorage)

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/StickyMobileCTA.tsx`

- [ ] **Step 1: Criar o componente**

Write em `apps/web/app/(capacitacao)/agenda/StickyMobileCTA.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA } from "./conteudoAgenda";

const DISMISSED_KEY = "ntc_agenda_sticky_dismissed";

/**
 * Barra fixa mobile com atendimento. Espelha o IIFE `initStickyCTA` do
 * protótipo (linhas 3738-3762 de 09_Pagina_Agenda_v2.html):
 *
 * - Aparece após scroll passar do bottom do `.agenda-hero` + 80px.
 * - Pode ser fechada pelo `×`; dismiss persiste em sessionStorage.
 * - Toggle de classe `.is-visible` no `<aside>` e de `aria-hidden`.
 *
 * Renderiza nada se já foi dismissed na sessão atual.
 */
export function StickyMobileCTA() {
  const [montado, setMontado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // sessionStorage pode falhar em alguns contextos (Safari private mode).
    }
    if (dismissed) return;
    setMontado(true);

    const hero = document.querySelector<HTMLElement>(".agenda-hero");
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 400;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisivel(window.scrollY > heroBottom + 80);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  if (!montado) return null;

  const dismiss = () => {
    setVisivel(false);
    setMontado(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <aside
      className={`agenda-sticky-mobile-cta${visivel ? " is-visible" : ""}`}
      id="agenda-sticky-cta"
      aria-hidden={!visivel}
    >
      <button
        className="smc-close"
        type="button"
        id="smc-close"
        aria-label="Fechar atendimento"
        onClick={dismiss}
      >
        ×
      </button>
      <div className="smc-text">
        <strong>{STICKY_CTA.strong}</strong>
        {STICKY_CTA.texto}
      </div>
      <a
        className="smc-btn"
        href={STICKY_CTA.cta.href}
        data-cms-link={STICKY_CTA.cta.cmsLink}
        data-track={STICKY_CTA.cta.track}
      >
        {STICKY_CTA.cta.texto} <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/StickyMobileCTA.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona StickyMobileCTA client component

Espelha o IIFE initStickyCTA do protótipo: aparece após scroll
além do hero, dismiss persiste em sessionStorage. Usa rAF para
debounce do listener e não monta se já estava dismissed na sessão.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `PipelineAgenda.tsx` parte 1 — estado, pipeline puro, helpers

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`

Este componente é grande; será construído em 4 commits funcionais (Tasks 9, 10, 11, 12). Cada commit deixa o arquivo válido para typecheck.

- [ ] **Step 1: Criar o arquivo com tipos de estado, helpers puros e Card render**

Write em `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  type AreaSlug,
  type CartaoEvento,
  type CidadeSlug,
  type FormatoEvento,
  type ModalidadeEvento,
  type PerPageOpcao,
  type ProgramaSlug,
  type SortSlug,
  type TabSlug,
  DEFAULTS,
  EMPTY_AGENDA,
  FILTRO_AREA,
  FILTRO_CIDADE,
  FILTRO_FORMATO,
  FILTRO_MES,
  FILTRO_MODALIDADE,
  FILTRO_PROGRAMA_GROUPS,
  FILTRO_SORT,
  LABELS,
  PERPAGE_OPCOES,
  TABS_AGENDA,
} from "./conteudoAgenda";

// =============================================================
//  PipelineAgenda · client component
//  Espelho do IIFE "AGENDA v2" do protótipo (linhas 3241-3845
//  de 09_Pagina_Agenda_v2.html). Estado React + render React,
//  sem mutação direta do DOM.
// =============================================================

interface PipelineAgendaProps {
  eventos: CartaoEvento[];
}

interface EstadoAgenda {
  tab: TabSlug;
  area: "" | AreaSlug;
  programa: "" | ProgramaSlug;
  formato: "" | FormatoEvento;
  modalidade: "" | ModalidadeEvento;
  cidade: CidadeSlug;
  mes: string;
  busca: string;
  sort: SortSlug;
  page: number;
  perPage: PerPageOpcao;
}

const ESTADO_INICIAL: EstadoAgenda = {
  tab: DEFAULTS.tab,
  area: "",
  programa: "",
  formato: "",
  modalidade: "",
  cidade: "",
  mes: "",
  busca: "",
  sort: DEFAULTS.sort,
  page: DEFAULTS.page,
  perPage: DEFAULTS.perPage,
};

// ----------------- Helpers puros (pipeline) -----------------

const score = (e: CartaoEvento, flag: string): number =>
  e.flags.includes(flag as never) ? 1 : 0;

function filterByTab(eventos: CartaoEvento[], tab: TabSlug): CartaoEvento[] {
  return eventos.filter((e) => e.tab === tab);
}

function filterByControls(eventos: CartaoEvento[], state: EstadoAgenda): CartaoEvento[] {
  return eventos.filter(
    (e) =>
      (!state.area || e.area === state.area) &&
      (!state.programa || e.programa === state.programa) &&
      (!state.formato || e.formato === state.formato) &&
      (!state.modalidade || e.modalidade === state.modalidade) &&
      (!state.cidade || e.cidade === state.cidade) &&
      (!state.mes || e.mes === state.mes),
  );
}

function filterBySearch(eventos: CartaoEvento[], busca: string): CartaoEvento[] {
  const q = busca.toLowerCase().trim();
  if (!q) return eventos;
  return eventos.filter((e) => {
    const hay = [
      e.tituloHtml,
      e.formatoLabel,
      e.areaLabel,
      e.programa,
      e.area,
      e.formato,
      e.cidade,
      e.modalidade,
      e.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

function sortCards(eventos: CartaoEvento[], sort: SortSlug): CartaoEvento[] {
  const arr = eventos.slice();
  if (sort === "editorial") {
    arr.sort((a, b) => {
      const fixA = score(a, "fixado_na_agenda");
      const fixB = score(b, "fixado_na_agenda");
      if (fixA !== fixB) return fixB - fixA;
      const prA = score(a, "destaque_editorial") * 2 + score(a, "prioridade_comercial");
      const prB = score(b, "destaque_editorial") * 2 + score(b, "prioridade_comercial");
      if (prA !== prB) return prB - prA;
      return a.dataIso.localeCompare(b.dataIso);
    });
  } else if (sort === "cronologica") {
    arr.sort((a, b) => a.dataIso.localeCompare(b.dataIso));
  } else if (sort === "encerramento") {
    arr.sort((a, b) => (a.deadlineIso || a.dataIso).localeCompare(b.deadlineIso || b.dataIso));
  } else if (sort === "ch") {
    arr.sort((a, b) => b.cargaHorariaHoras - a.cargaHorariaHoras);
  } else if (sort === "valor-asc") {
    arr.sort((a, b) => a.valorReais - b.valorReais);
  } else if (sort === "valor-desc") {
    arr.sort((a, b) => b.valorReais - a.valorReais);
  }
  return arr;
}

function paginate(
  eventos: CartaoEvento[],
  page: number,
  perPage: PerPageOpcao,
): { visiveis: CartaoEvento[]; total: number; totalPages: number; pageEfetiva: number } {
  const total = eventos.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pageEfetiva = page > totalPages ? 1 : page;
  const start = (pageEfetiva - 1) * perPage;
  const end = start + perPage;
  return { visiveis: eventos.slice(start, end), total, totalPages, pageEfetiva };
}

function compactRange(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (cur > 3) out.push("…");
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) out.push(i);
  if (cur < total - 2) out.push("…");
  out.push(total);
  return out;
}

// ----------------- Deadline (espelha applyDeadlineSeal) -----------------

interface DeadlineInfo {
  diffDays: number;
  expired: boolean;
}

function computeDeadline(deadlineIso: string, now: Date): DeadlineInfo | null {
  if (!deadlineIso) return null;
  const deadline = new Date(`${deadlineIso}T23:59:59Z`);
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const diffMs = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  return { diffDays, expired: diffMs <= 0 };
}

// ----------------- Analytics (no-op por enquanto) -----------------

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

// Tipo do estado e helpers são exportados via comentário para futura reutilização;
// por ora ficam encapsulados aqui.
/* Reservas para Tasks 10-12 (markup, URL sync, paginação UI):
void filterByTab; void filterByControls; void filterBySearch; void sortCards;
void paginate; void compactRange; void computeDeadline; void track;
void ESTADO_INICIAL; void LABELS;
void FILTRO_AREA; void FILTRO_PROGRAMA_GROUPS; void FILTRO_FORMATO;
void FILTRO_MODALIDADE; void FILTRO_CIDADE; void FILTRO_MES; void FILTRO_SORT;
void PERPAGE_OPCOES; void TABS_AGENDA; void EMPTY_AGENDA;
void useCallback; void useEffect; void useMemo; void useRef; void useState;
*/

export function PipelineAgenda({ eventos }: PipelineAgendaProps) {
  // Stub mínimo para o arquivo compilar; o markup completo entra no Task 10.
  void eventos;
  return null;
}
```

- [ ] **Step 2: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa (o bloco `void X;` previne warnings de `noUnusedLocals` para imports/helpers que serão consumidos nas próximas tasks).

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): cria PipelineAgenda parte 1 (estado, pipeline puro)

Estabelece o esqueleto do client component principal:
- Tipo EstadoAgenda e ESTADO_INICIAL.
- Helpers puros filterByTab, filterByControls, filterBySearch,
  sortCards, paginate, compactRange (espelham o IIFE do protótipo).
- Computação de deadline (espelha applyDeadlineSeal).
- Stub track() no-op para futura integração GA4.

Markup, URL sync e analytics entram nos próximos commits.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: `PipelineAgenda.tsx` parte 2 — markup tabs + filterbar + applied + card render

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`

- [ ] **Step 1: Substituir o stub `PipelineAgenda` e remover bloco `/* Reservas */` por implementação completa que renderiza tabs, filterbar (incluindo mobile toggle e advanced), e aplied chips. Mantém grid e paginação ainda vazios para Task 11.**

Edit em `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`. Substituir o bloco final:

old_string:
```
// Tipo do estado e helpers são exportados via comentário para futura reutilização;
// por ora ficam encapsulados aqui.
/* Reservas para Tasks 10-12 (markup, URL sync, paginação UI):
void filterByTab; void filterByControls; void filterBySearch; void sortCards;
void paginate; void compactRange; void computeDeadline; void track;
void ESTADO_INICIAL; void LABELS;
void FILTRO_AREA; void FILTRO_PROGRAMA_GROUPS; void FILTRO_FORMATO;
void FILTRO_MODALIDADE; void FILTRO_CIDADE; void FILTRO_MES; void FILTRO_SORT;
void PERPAGE_OPCOES; void TABS_AGENDA; void EMPTY_AGENDA;
void useCallback; void useEffect; void useMemo; void useRef; void useState;
*/

export function PipelineAgenda({ eventos }: PipelineAgendaProps) {
  // Stub mínimo para o arquivo compilar; o markup completo entra no Task 10.
  void eventos;
  return null;
}
```

new_string:
```
// ----------------- Componente principal -----------------

export function PipelineAgenda({ eventos }: PipelineAgendaProps) {
  const [state, setState] = useState<EstadoAgenda>(ESTADO_INICIAL);
  const [advancedAberto, setAdvancedAberto] = useState(false);
  const [mobileAberto, setMobileAberto] = useState(false);
  const [hidratado, setHidratado] = useState(false);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  // Debounce da busca: usuário digita em buscaLocal, state.busca só atualiza
  // após 220ms (espelha o protótipo).
  const [buscaLocal, setBuscaLocal] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState((s) => (s.busca === buscaLocal ? s : { ...s, busca: buscaLocal, page: 1 }));
      if (buscaLocal !== state.busca) {
        track("search_input", { query: buscaLocal, length: buscaLocal.length });
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [buscaLocal, state.busca]);

  // Contagem por tab (espelha updateTabCounts), ignora filtros.
  const counts = useMemo(() => {
    const buckets: Record<TabSlug, number> = {
      abertas: 0,
      proximas: 0,
      "em-breve": 0,
      replay: 0,
      realizados: 0,
    };
    eventos.forEach((e) => {
      buckets[e.tab] += 1;
    });
    return buckets;
  }, [eventos]);

  const onMudarFiltro = useCallback(
    <K extends keyof EstadoAgenda>(key: K, value: EstadoAgenda[K], trackName: string) => {
      setState((s) => ({ ...s, [key]: value, page: 1 }));
      track(trackName, { filter: key, value });
    },
    [],
  );

  const clearAll = useCallback(() => {
    setState(ESTADO_INICIAL);
    setBuscaLocal("");
    track("filters_clear_all");
  }, []);

  const removerFiltro = useCallback((key: keyof EstadoAgenda) => {
    setState((s) => ({ ...s, [key]: ESTADO_INICIAL[key], page: 1 }));
    if (key === "busca") setBuscaLocal("");
  }, []);

  const ativosCount =
    (state.area ? 1 : 0) +
    (state.programa ? 1 : 0) +
    (state.formato ? 1 : 0) +
    (state.modalidade ? 1 : 0) +
    (state.cidade ? 1 : 0) +
    (state.mes ? 1 : 0) +
    (state.busca ? 1 : 0);

  // Hidratação inicial (Task 12 vai sobrescrever isso com leitura de URL).
  useEffect(() => {
    setHidratado(true);
  }, []);

  return (
    <>
      {/* TABS */}
      <nav className="agenda-tabs" aria-label="Categorias de oferta">
        <div className="container">
          <div className="agenda-tabs-inner" role="tablist">
            {TABS_AGENDA.map((tab) => {
              const cnt = counts[tab.slug];
              const desabilitada = cnt === 0 && tab.slug !== "abertas";
              const ativa = state.tab === tab.slug;
              return (
                <button
                  key={tab.slug}
                  className={`agenda-tab${ativa ? " is-active" : ""}`}
                  data-tab={tab.slug}
                  role="tab"
                  aria-selected={ativa}
                  disabled={desabilitada}
                  aria-disabled={desabilitada || undefined}
                  title={desabilitada ? "Conteúdo será publicado em breve" : undefined}
                  onClick={() => {
                    setState((s) => ({ ...s, tab: tab.slug, page: 1 }));
                    track("tab_change", { tab: tab.slug });
                  }}
                >
                  {tab.rotulo} <span className="tab-count" id={tab.idCount}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FILTERBAR */}
      <div className="agenda-filterbar" aria-label="Filtros da agenda">
        <button
          className="agenda-mobile-filter-toggle"
          type="button"
          id="btn-mobile-filter-toggle"
          aria-expanded={mobileAberto}
          aria-controls="agenda-filters-inner"
          onClick={() => {
            const aberto = !mobileAberto;
            setMobileAberto(aberto);
            track("mobile_filter_toggle", { open: aberto });
          }}
        >
          <span className="mft-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
          </span>
          <span className="mft-label">{mobileAberto ? "Fechar filtros" : "Filtrar agenda"}</span>
          {ativosCount > 0 && <span className="mft-count" id="mft-active-count">{ativosCount}</span>}
        </button>
        <div
          className={`container agenda-filterbar-inner${mobileAberto ? " is-mobile-open" : ""}`}
          id="agenda-filters-inner"
        >
          {/* Linha primária */}
          <div className="agenda-filters-row is-primary">
            <label className="agenda-search" aria-label="Buscar eventos">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l5 5" />
              </svg>
              <input
                ref={buscaInputRef}
                type="search"
                id="filter-search"
                placeholder="Buscar por tema, programa, cidade ou palavra-chave"
                autoComplete="off"
                value={buscaLocal}
                onChange={(e) => setBuscaLocal(e.target.value)}
              />
              {buscaLocal && (
                <button
                  type="button"
                  className="clear-search"
                  id="btn-clear-search"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setBuscaLocal("");
                    setState((s) => ({ ...s, busca: "", page: 1 }));
                    buscaInputRef.current?.focus();
                  }}
                >
                  ×
                </button>
              )}
            </label>

            <label className="agenda-filter">
              Área
              <select
                id="filter-area"
                aria-label="Filtrar por área estratégica"
                value={state.area}
                onChange={(e) =>
                  onMudarFiltro("area", e.target.value as EstadoAgenda["area"], "filter_change")
                }
              >
                {FILTRO_AREA.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Modalidade
              <select
                id="filter-modalidade"
                aria-label="Filtrar por modalidade"
                value={state.modalidade}
                onChange={(e) =>
                  onMudarFiltro(
                    "modalidade",
                    e.target.value as EstadoAgenda["modalidade"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_MODALIDADE.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Mês
              <select
                id="filter-mes"
                aria-label="Filtrar por mês"
                value={state.mes}
                onChange={(e) => onMudarFiltro("mes", e.target.value, "filter_change")}
              >
                {FILTRO_MES.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <button
              className={`agenda-advanced-toggle${advancedAberto ? " is-open" : ""}`}
              type="button"
              id="btn-toggle-advanced"
              aria-expanded={advancedAberto}
              aria-controls="filters-advanced"
              onClick={() => setAdvancedAberto((v) => !v)}
            >
              Filtros avançados <span className="chevron" aria-hidden="true">▾</span>
            </button>

            <button
              className="agenda-filter-clear"
              id="btn-clear-filters"
              type="button"
              onClick={clearAll}
            >
              Limpar filtros ×
            </button>
          </div>

          {/* Linha avançada */}
          <div
            className={`agenda-filters-row is-advanced${advancedAberto ? " is-open" : ""}`}
            id="filters-advanced"
            aria-label="Filtros avançados"
          >
            <label className="agenda-filter">
              Programa
              <select
                id="filter-programa"
                aria-label="Filtrar por programa"
                value={state.programa}
                onChange={(e) =>
                  onMudarFiltro(
                    "programa",
                    e.target.value as EstadoAgenda["programa"],
                    "filter_change",
                  )
                }
              >
                <option value="">Todos</option>
                {FILTRO_PROGRAMA_GROUPS.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.opcoes.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Formato
              <select
                id="filter-formato"
                aria-label="Filtrar por formato"
                value={state.formato}
                onChange={(e) =>
                  onMudarFiltro(
                    "formato",
                    e.target.value as EstadoAgenda["formato"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_FORMATO.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Cidade
              <select
                id="filter-cidade"
                aria-label="Filtrar por cidade"
                value={state.cidade}
                onChange={(e) =>
                  onMudarFiltro(
                    "cidade",
                    e.target.value as EstadoAgenda["cidade"],
                    "filter_change",
                  )
                }
              >
                {FILTRO_CIDADE.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            <label className="agenda-filter">
              Ordenar
              <select
                id="filter-sort"
                aria-label="Ordenar resultados"
                value={state.sort}
                onChange={(e) => {
                  const v = e.target.value as SortSlug;
                  setState((s) => ({ ...s, sort: v, page: 1 }));
                  track("sort_change", { value: v });
                }}
              >
                {FILTRO_SORT.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {/* Reservas para Task 11 (grid + destaques + paginação): */}
      <section className="section" id="agenda-eventos" aria-label="Resultados da agenda">
        <div className="container">
          {/* TODO Task 11: destaques, control row, applied, grid, empty, paginação */}
          <p style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--oxford)" }}>
            Carregando agenda…
          </p>
        </div>
      </section>

      {/* Mantém hooks reservados (useMemo/useRef) ativos via void no caso de
          alguma branch ainda não os exercitar; serão consumidos no Task 11. */}
      {hidratado ? null : null}
    </>
  );
}

// Reservas para Task 11 (grid + destaques + paginação) e Task 12 (URL sync):
/* eslint-disable @typescript-eslint/no-unused-vars */
void EMPTY_AGENDA;
void LABELS;
void PERPAGE_OPCOES;
void filterByTab;
void filterByControls;
void filterBySearch;
void sortCards;
void paginate;
void compactRange;
void computeDeadline;
void removerFiltro;
/* eslint-enable @typescript-eslint/no-unused-vars */
```

**Atenção:** as últimas linhas `void X;` no topo do arquivo (após o componente) precisam vir DEPOIS de qualquer escopo de função. Como `removerFiltro` é declarada dentro do componente, mova a referência para uma forma que não dependa do escopo: simplesmente remova `void removerFiltro;` da lista — `removerFiltro` será consumida no Task 11 (chip de filtro aplicado) e o compilador aceita variável local não-usada quando ela é arg de hook ou declarada dentro de função (geralmente só `noUnusedLocals` reclama de top-level). Se reclamar, encapsule num efeito vazio: `useEffect(() => { void removerFiltro; }, [removerFiltro]);` dentro do componente.

- [ ] **Step 2: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -25
```

Expected: passa. Se reclamar de `removerFiltro` não usada, encapsular num `useEffect` no-op conforme nota acima.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): PipelineAgenda parte 2 (tabs + filterbar + applied bar)

Adiciona ao client component:
- Tabs com contagem dinâmica (auto-disable de tabs vazias).
- Filterbar completa: busca debounced 220ms, 6 selects, advanced toggle,
  mobile filter toggle com badge de filtros ativos, clear-all.
- Estado React + handlers que resetam page=1 a cada mudança.
- Hidratação inicial (URL sync entra na Task 12).

Grid, destaques, applied chips, paginação e empty entram no próximo commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: `PipelineAgenda.tsx` parte 3 — destaques + control row + applied chips + grid + empty + paginação

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`

- [ ] **Step 1: Substituir o placeholder "Carregando agenda…" pelo bloco completo da seção `#agenda-eventos`**

Edit em `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`. Antes de tudo, adicionar `const now` (clock para deadline) no componente, computar pipeline e definir helper de card.

Localize o bloco do componente antes do `return`. Adicionar logo após a definição de `ativosCount`:

old_string:
```
  // Hidratação inicial (Task 12 vai sobrescrever isso com leitura de URL).
  useEffect(() => {
    setHidratado(true);
  }, []);
```

new_string:
```
  // Hidratação inicial (Task 12 vai sobrescrever isso com leitura de URL).
  useEffect(() => {
    setHidratado(true);
  }, []);

  // Relógio para recálculo do selo de deadline. Atualiza a cada 30s e
  // após o mount (evita mismatch SSR/CSR: durante SSR usamos new Date()
  // de referência, mas o card só ganha selo dinâmico após a hidratação).
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Pipeline (espelha apply() do protótipo).
  const { visiveis, total, totalPages, pageEfetiva, destaques } = useMemo(() => {
    let pool = filterByTab(eventos, state.tab);
    pool = filterByControls(pool, state);
    pool = filterBySearch(pool, state.busca);
    pool = sortCards(pool, state.sort);
    const pag = paginate(pool, state.page, state.perPage);
    const semFiltros =
      !state.area &&
      !state.programa &&
      !state.formato &&
      !state.modalidade &&
      !state.cidade &&
      !state.mes &&
      !state.busca;
    const dest =
      state.tab === "abertas" && semFiltros
        ? eventos
            .filter((e) => e.tab === "abertas" && e.flags.includes("destaque_editorial"))
            .slice(0, 3)
        : [];
    return {
      visiveis: pag.visiveis,
      total: pag.total,
      totalPages: pag.totalPages,
      pageEfetiva: pag.pageEfetiva,
      destaques: dest,
    };
  }, [eventos, state]);

  // Sincroniza page efetiva (paginate pode reduzir page se for inválida).
  useEffect(() => {
    if (state.page !== pageEfetiva) {
      setState((s) => ({ ...s, page: pageEfetiva }));
    }
  }, [pageEfetiva, state.page]);
```

- [ ] **Step 2: Substituir o `<section #agenda-eventos>` placeholder pelo markup completo**

old_string:
```
      {/* Reservas para Task 11 (grid + destaques + paginação): */}
      <section className="section" id="agenda-eventos" aria-label="Resultados da agenda">
        <div className="container">
          {/* TODO Task 11: destaques, control row, applied, grid, empty, paginação */}
          <p style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--oxford)" }}>
            Carregando agenda…
          </p>
        </div>
      </section>

      {/* Mantém hooks reservados (useMemo/useRef) ativos via void no caso de
          alguma branch ainda não os exercitar; serão consumidos no Task 11. */}
      {hidratado ? null : null}
    </>
  );
}
```

new_string:
```
      <section className="section" id="agenda-eventos" aria-label="Resultados da agenda">
        <div className="container">
          {/* DESTAQUES */}
          {destaques.length > 0 && (
            <div className="agenda-destaques" id="agenda-destaques">
              <header className="agenda-destaques-head">
                <div>
                  <p className="destaques-eyebrow">Curadoria editorial</p>
                  <h2>Destaques da <em>agenda</em></h2>
                </div>
              </header>
              <div className="agenda-destaques-grid" id="agenda-destaques-grid">
                {destaques.map((e) => (
                  <CardEvento key={`dest-${e.ordem}`} evento={e} now={now} />
                ))}
              </div>
            </div>
          )}

          <header className="agenda-todos-head">
            <div>
              <p className="todos-eyebrow">Todos os eventos abertos</p>
              <h2>Agenda <em>completa</em></h2>
            </div>
          </header>

          {/* CONTROL ROW */}
          <div className="agenda-controlrow">
            <p className="agenda-counter" aria-live="polite" id="counter-text">
              {renderCounterText(total, pageEfetiva, state.perPage, visiveis.length)}
            </p>
            <div className="agenda-controls-right">
              <span className="agenda-perpage">
                Mostrar
                <span className="agenda-perpage-buttons" role="group" aria-label="Eventos por página">
                  {PERPAGE_OPCOES.map((pp) => (
                    <button
                      key={pp}
                      type="button"
                      data-perpage={pp}
                      className={state.perPage === pp ? "is-active" : undefined}
                      onClick={() => {
                        setState((s) => ({ ...s, perPage: pp, page: 1 }));
                        track("perpage_change", { value: pp });
                      }}
                    >
                      {pp}
                    </button>
                  ))}
                </span>
              </span>
            </div>
          </div>

          {/* APPLIED CHIPS */}
          <div className="agenda-applied" id="applied-filters" aria-live="polite">
            {chipsAplicados(state).map((chip) => (
              <span key={chip.key} className="chip-applied">
                {chip.label}{" "}
                <button
                  type="button"
                  aria-label={`Remover filtro ${chip.label}`}
                  data-clear-key={chip.key}
                  onClick={() => removerFiltro(chip.key)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* GRID + EMPTY */}
          <div className="agenda-grid" id="agenda-grid">
            {visiveis.map((e) => (
              <CardEvento key={e.ordem} evento={e} now={now} />
            ))}
            {total === 0 && (
              <div className="agenda-empty" id="agenda-empty">
                <span className="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M16 16l5 5" />
                    <path d="M8 11h6" />
                  </svg>
                </span>
                <h3>{EMPTY_AGENDA.titulo}</h3>
                <p>{EMPTY_AGENDA.descricao}</p>
                <div className="empty-actions">
                  <a
                    className="btn btn--primary"
                    href={EMPTY_AGENDA.ctaLimpar.href}
                    id="btn-empty-clear"
                    onClick={(ev) => {
                      ev.preventDefault();
                      clearAll();
                    }}
                  >
                    {EMPTY_AGENDA.ctaLimpar.texto}
                  </a>
                  <a
                    className="btn btn--ghost"
                    href={EMPTY_AGENDA.ctaSobMedida.href}
                    data-cms-link={EMPTY_AGENDA.ctaSobMedida.cmsLink}
                    data-track={EMPTY_AGENDA.ctaSobMedida.track}
                  >
                    {EMPTY_AGENDA.ctaSobMedida.texto}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <nav
              className="agenda-pagination"
              id="agenda-pagination"
              aria-label="Paginação dos resultados"
            >
              <button
                type="button"
                className="page-nav prev"
                disabled={pageEfetiva === 1}
                onClick={() => {
                  setState((s) => ({ ...s, page: Math.max(1, s.page - 1) }));
                  track("pagination_change", { label: "Anterior" });
                }}
              >
                Anterior
              </button>
              {compactRange(pageEfetiva, totalPages).map((p, idx) => {
                if (p === "…") {
                  return (
                    <span key={`gap-${idx}`} className="page-ellipsis">…</span>
                  );
                }
                const ativa = p === pageEfetiva;
                return (
                  <button
                    key={p}
                    type="button"
                    className={ativa ? "is-current" : undefined}
                    onClick={() => {
                      setState((s) => ({ ...s, page: p }));
                      track("pagination_change", { label: String(p) });
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                className="page-nav next"
                disabled={pageEfetiva === totalPages}
                onClick={() => {
                  setState((s) => ({ ...s, page: Math.min(totalPages, s.page + 1) }));
                  track("pagination_change", { label: "Próxima" });
                }}
              >
                Próxima
              </button>
            </nav>
          )}
        </div>
      </section>

      {hidratado ? null : null}
    </>
  );
}

// ----------------- helpers de render -----------------

function renderCounterText(
  total: number,
  page: number,
  perPage: number,
  visiveisLen: number,
): React.ReactNode {
  if (total === 0) {
    return "Nenhum evento encontrado com os filtros aplicados";
  }
  if (total <= perPage) {
    return (
      <>
        <strong>{total}</strong> {total === 1 ? "evento encontrado" : "eventos encontrados"}
      </>
    );
  }
  const start = (page - 1) * perPage + 1;
  const end = start + visiveisLen - 1;
  return (
    <>
      Mostrando <strong>{start}–{end}</strong> de <strong>{total}</strong> eventos encontrados
    </>
  );
}

type ChipKey =
  | "area"
  | "programa"
  | "formato"
  | "modalidade"
  | "cidade"
  | "mes"
  | "busca";

function chipsAplicados(state: EstadoAgenda): { key: ChipKey; label: string }[] {
  const items: { key: ChipKey; label: string }[] = [];
  if (state.area) items.push({ key: "area", label: LABELS.area[state.area] });
  if (state.programa) items.push({ key: "programa", label: state.programa });
  if (state.formato) items.push({ key: "formato", label: LABELS.formato[state.formato] });
  if (state.modalidade) {
    items.push({ key: "modalidade", label: LABELS.modalidade[state.modalidade] });
  }
  if (state.cidade) items.push({ key: "cidade", label: LABELS.cidade[state.cidade] });
  if (state.mes) {
    const mesLabel = LABELS.mes[state.mes];
    if (mesLabel) items.push({ key: "mes", label: mesLabel });
  }
  if (state.busca) items.push({ key: "busca", label: `"${state.busca}"` });
  return items;
}

// ----------------- CardEvento -----------------

interface CardEventoProps {
  evento: CartaoEvento;
  now: Date;
}

function CardEvento({ evento: e, now }: CardEventoProps) {
  const deadline = computeDeadline(e.deadlineIso, now);
  const seal =
    deadline && !deadline.expired && deadline.diffDays <= 7
      ? deadline.diffDays <= 2
        ? { texto: "Inscrições encerrando", classe: "is-critical", aria: "Inscrições encerrando em até 48 horas" }
        : { texto: `Encerram em ${deadline.diffDays} dias`, classe: "", aria: `Inscrições encerram em ${deadline.diffDays} dias` }
      : null;

  return (
    <article
      className="event-card"
      data-area={e.area}
      data-programa={e.programa}
      data-formato={e.formato}
      data-modalidade={e.modalidade}
      data-cidade={e.cidade}
      data-mes={e.mes}
      data-ch={e.cargaHorariaHoras}
      data-valor={e.valorReais}
      data-dateiso={e.dataIso}
      data-deadline-iso={e.deadlineIso}
      data-tab={e.tab}
      data-flags={e.flags.join(",")}
      data-keywords={e.keywords}
      data-status={e.status}
    >
      <span className={`event-status-tag ${e.selo.classe}`}>{e.selo.texto}</span>
      <div className="event-cover">
        <div
          className="event-cover-img"
          style={{ backgroundImage: `url('${e.imagemUrl}')` }}
          aria-hidden="true"
        />
        <div className="event-cover-overlay" />
        <div className="event-cover-meta">
          <DataBlocoView bloco={e.dataBloco} />
          <span
            className={`event-modality${e.modalidadeClasseExtra ? ` ${e.modalidadeClasseExtra}` : ""}`}
          >
            {e.modalidadeLabel}
          </span>
        </div>
        {seal && (
          <span className={`event-deadline-seal ${seal.classe}`.trim()} aria-label={seal.aria}>
            {seal.texto}
          </span>
        )}
      </div>
      <div className="event-body">
        <p className="event-program-link">
          {e.formatoLabel} <span className="dot">·</span> {e.areaLabel}
        </p>
        <h3 dangerouslySetInnerHTML={{ __html: e.tituloHtml }} />
        <div className="event-speakers-line">
          <span className="label">Coordenação científica</span>
          <span className="names">{e.coordenacaoNomes}</span>
        </div>
        <div className="event-meta-essentials">
          <span>{e.metaEssenciais[0]}</span>
          <span>{e.metaEssenciais[1]}</span>
        </div>
        <div className="event-program-binding">
          <span className="epb-label">Integra o programa</span>
          <span className="epb-program">
            <a href={e.programaBinding.href} data-cms-link={e.programaBinding.cmsLink}>
              {e.programaBinding.sigla}
            </a>
          </span>
        </div>
        <div className="event-pricing">
          <span className="event-price">
            Inscrição individual<strong>{e.precoIndividualLabel}</strong>
          </span>
          <span className="event-price institutional">
            Equipes / órgãos<strong>{e.precoEquipesLabel}</strong>
          </span>
        </div>
      </div>
      <div className="event-actions">
        <a
          className="btn btn--gold"
          href={e.ctaInscrever.href}
          title={e.ctaInscrever.title}
          data-cms-link={e.ctaInscrever.cmsLink}
          data-track={e.ctaInscrever.track}
        >
          {e.ctaInscrever.texto} <span className="btn-arrow">→</span>
        </a>
        <div className="event-actions-row">
          <a
            className="link-arrow"
            href={e.linkDetalhes.href}
            title={e.linkDetalhes.title}
            data-cms-link={e.linkDetalhes.cmsLink}
            data-track={e.linkDetalhes.track}
          >
            {e.linkDetalhes.texto}
          </a>
          <a
            className="link-arrow"
            href={e.linkInscreverEquipe.href}
            data-cms-link={e.linkInscreverEquipe.cmsLink}
            data-track={e.linkInscreverEquipe.track}
          >
            {e.linkInscreverEquipe.texto}
          </a>
        </div>
      </div>
    </article>
  );
}

function DataBlocoView({ bloco }: { bloco: CartaoEvento["dataBloco"] }) {
  if (bloco.tipo === "range") {
    return (
      <div className="event-date-block range">
        <span className="days">
          {bloco.diaInicio}
          <span className="dash">–</span>
          {bloco.diaFim}
        </span>
        <span className="mon-yr">{bloco.mesAno}</span>
      </div>
    );
  }
  if (bloco.tipo === "multi") {
    return (
      <div className="event-date-block multi">
        <span className="count">
          <span className="number">{bloco.quantidade}</span> {bloco.rotulo}
        </span>
        <span className="period">{bloco.periodo}</span>
      </div>
    );
  }
  return (
    <div className="event-date-block single">
      <span className="days">{bloco.dia}</span>
      <span className="mon-yr">{bloco.mesAno}</span>
    </div>
  );
}

// Remove o bloco /* eslint-disable @typescript-eslint/no-unused-vars */
// adicionado no Task 10 — agora todos os imports são consumidos.
```

**Atenção:** após a edição acima, **REMOVER MANUALMENTE** o bloco `/* eslint-disable @typescript-eslint/no-unused-vars */ ... /* eslint-enable */` adicionado ao final do arquivo no Task 10, pois agora todos esses símbolos são consumidos. Edit separada:

old_string:
```
// Reservas para Task 11 (grid + destaques + paginação) e Task 12 (URL sync):
/* eslint-disable @typescript-eslint/no-unused-vars */
void EMPTY_AGENDA;
void LABELS;
void PERPAGE_OPCOES;
void filterByTab;
void filterByControls;
void filterBySearch;
void sortCards;
void paginate;
void compactRange;
void computeDeadline;
void removerFiltro;
/* eslint-enable @typescript-eslint/no-unused-vars */
```

new_string:
```
```

(remove totalmente o bloco)

- [ ] **Step 3: Adicionar `import type` para React se necessário (o helper `renderCounterText` retorna `React.ReactNode`)**

Localize o import no topo:

old_string:
```
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
```

new_string:
```
"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
```

- [ ] **Step 4: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -25
```

Expected: passa. Se houver erros, ler a saída inteira e corrigir.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): PipelineAgenda parte 3 (destaques + grid + applied + paginação)

Adiciona o conteúdo principal da seção #agenda-eventos:
- Bloco de destaques (até 3 cards com flag destaque_editorial, só na
  tab "abertas" e sem filtros aplicados).
- Header "Agenda completa", control row com counter + perpage buttons.
- Chips de filtros aplicados com remover individual.
- Grid de cards via componente CardEvento (preserva todos os data-*).
- Empty state condicional.
- Paginação numerada com compactação (1 … 4 5 6 … 9).
- Selo dinâmico "Encerram em X dias" recalculado a cada 30s.

Próximo commit (Task 12) plumba URL sync.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: `PipelineAgenda.tsx` parte 4 — URL sync (querystring)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`

- [ ] **Step 1: Adicionar helpers `readURL` e `writeURL` ANTES do componente principal**

Edit em `apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx`. Localize o bloco antes de `// ----------------- Componente principal -----------------`:

old_string:
```
function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}
```

new_string:
```
function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

// ----------------- URL sync (espelha writeURL/readURL/hydrate) -----------------

function readURL(): Partial<EstadoAgenda> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<EstadoAgenda> = {};
  const tab = p.get("tab");
  if (tab && (TABS_AGENDA as readonly { slug: string }[]).some((t) => t.slug === tab)) {
    out.tab = tab as TabSlug;
  }
  const area = p.get("area");
  if (area && FILTRO_AREA.some((o) => o.value === area && o.value)) {
    out.area = area as AreaSlug;
  }
  const programa = p.get("programa");
  if (
    programa &&
    FILTRO_PROGRAMA_GROUPS.some((g) => g.opcoes.some((o) => o.value === programa))
  ) {
    out.programa = programa as ProgramaSlug;
  }
  const formato = p.get("formato");
  if (formato && FILTRO_FORMATO.some((o) => o.value === formato && o.value)) {
    out.formato = formato as FormatoEvento;
  }
  const modalidade = p.get("modalidade");
  if (modalidade && FILTRO_MODALIDADE.some((o) => o.value === modalidade && o.value)) {
    out.modalidade = modalidade as ModalidadeEvento;
  }
  const cidade = p.get("cidade");
  if (cidade && FILTRO_CIDADE.some((o) => o.value === cidade && o.value)) {
    out.cidade = cidade as CidadeSlug;
  }
  const mes = p.get("mes");
  if (mes && FILTRO_MES.some((o) => o.value === mes && o.value)) {
    out.mes = mes;
  }
  const sort = p.get("sort");
  if (sort && FILTRO_SORT.some((o) => o.value === sort)) {
    out.sort = sort as SortSlug;
  }
  const page = p.get("page");
  if (page) {
    const n = parseInt(page, 10);
    if (Number.isFinite(n) && n >= 1) out.page = n;
  }
  const perPage = p.get("perPage");
  if (perPage) {
    const n = parseInt(perPage, 10);
    if ((PERPAGE_OPCOES as readonly number[]).includes(n)) {
      out.perPage = n as PerPageOpcao;
    }
  }
  const q = p.get("q");
  if (q) out.busca = q;
  return out;
}

function writeURL(state: EstadoAgenda): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (state.tab !== DEFAULTS.tab) p.set("tab", state.tab);
  if (state.area) p.set("area", state.area);
  if (state.programa) p.set("programa", state.programa);
  if (state.formato) p.set("formato", state.formato);
  if (state.modalidade) p.set("modalidade", state.modalidade);
  if (state.cidade) p.set("cidade", state.cidade);
  if (state.mes) p.set("mes", state.mes);
  if (state.sort !== DEFAULTS.sort) p.set("sort", state.sort);
  if (state.page !== DEFAULTS.page) p.set("page", String(state.page));
  if (state.perPage !== DEFAULTS.perPage) p.set("perPage", String(state.perPage));
  if (state.busca) p.set("q", state.busca);
  const qs = p.toString();
  const url = qs ? `?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
```

- [ ] **Step 2: Conectar `readURL` na hidratação inicial e `writeURL` em cada mudança de estado**

Edit no corpo do componente. Localize:

old_string:
```
  // Hidratação inicial (Task 12 vai sobrescrever isso com leitura de URL).
  useEffect(() => {
    setHidratado(true);
  }, []);
```

new_string:
```
  // Hidratação inicial: lê querystring e aplica ao estado.
  useEffect(() => {
    const fromUrl = readURL();
    if (Object.keys(fromUrl).length > 0) {
      setState((s) => ({ ...s, ...fromUrl }));
      if (fromUrl.busca) setBuscaLocal(fromUrl.busca);
    }
    setHidratado(true);
  }, []);

  // URL sync: re-escreve querystring a cada mudança (após hidratação).
  useEffect(() => {
    if (!hidratado) return;
    writeURL(state);
  }, [state, hidratado]);
```

- [ ] **Step 3: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa.

- [ ] **Step 4: Verificar lint**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -30
```

Expected: passa sem novos warnings nesta pasta.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/PipelineAgenda.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): PipelineAgenda parte 4 (URL sync via querystring)

Adiciona readURL/writeURL espelhando o IIFE de URL sync do protótipo:
- Hidratação inicial lê tab, area, programa, formato, modalidade, cidade,
  mes, sort, page, perPage, q da querystring.
- writeURL omite defaults (tab=abertas, sort=editorial, page=1, perPage=9)
  para manter o link curto.
- replaceState evita poluir o histórico do browser.

PipelineAgenda fica completo. Próximo commit monta page.tsx.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Criar `page.tsx` (server component) com as 6 seções

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/page.tsx`

- [ ] **Step 1: Criar o `page.tsx` renderizando breadcrumb, hero, PipelineAgenda, CTAs intermediários, rodapé contextual e sticky CTA**

Write em `apps/web/app/(capacitacao)/agenda/page.tsx`:

```tsx
import type { Metadata } from "next";

import {
  BREADCRUMB_AGENDA,
  CTAS_INTERMEDIARIOS,
  EVENTOS,
  HERO_AGENDA,
  RODAPE_CONTEXTUAL,
} from "./conteudoAgenda";
import { PipelineAgenda } from "./PipelineAgenda";
import { StickyMobileCTA } from "./StickyMobileCTA";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Agenda Geral NTC · Eventos, formações e jornadas com inscrições abertas",
  description:
    "Encontre seminários, oficinas, cursos executivos, jornadas, simpósios e congressos do Grupo NTC nas áreas de Educação, Gestão Pública e Saúde — em formato online, presencial ou híbrido.",
};

/**
 * Página /agenda — porta literal de 09_Pagina_Agenda_v2.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Breadcrumb dark.
 *   2. Hero comercial.
 *   3. <PipelineAgenda> — tabs + filterbar + destaques + grid + paginação.
 *   4. CTAs intermediários (sob medida + in company).
 *   5. Rodapé contextual (4 colunas).
 *   6. <StickyMobileCTA> mobile.
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (capacitacao).
 */
export default function AgendaPage() {
  return (
    <main id="main">
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {BREADCRUMB_AGENDA.map((item, i) => (
              <>
                <li key={`crumb-${i}`} className={item.current ? "current" : undefined}>
                  {item.href ? (
                    <a href={item.href} data-cms-link={item.cmsLink}>{item.texto}</a>
                  ) : (
                    <span>{item.texto}</span>
                  )}
                </li>
                {i < BREADCRUMB_AGENDA.length - 1 && (
                  <li key={`sep-${i}`} className="sep">/</li>
                )}
              </>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="agenda-hero" aria-label="Agenda Geral · Grupo NTC">
        <div className="agenda-hero-bg" aria-hidden="true" />
        <div className="container fade-in">
          <p className="agenda-hero-eyebrow">{HERO_AGENDA.eyebrow}</p>
          <h1 dangerouslySetInnerHTML={{ __html: HERO_AGENDA.tituloHtml }} />
          <p className="agenda-hero-sub">{HERO_AGENDA.sub}</p>

          <div className="agenda-hero-ctas">
            {HERO_AGENDA.ctas.map((cta) => (
              <a
                key={cta.cmsLink}
                className={cta.classe}
                href={cta.href}
                data-cms-link={cta.cmsLink}
                data-track={cta.track}
              >
                {cta.texto}
                {cta.seta && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>

          <div className="agenda-hero-microbar" aria-hidden="true">
            {HERO_AGENDA.microbar.map((m) => (
              <div key={m.rotulo}>
                <strong id={m.id}>{m.valor}</strong> {m.rotulo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PIPELINE (tabs + filterbar + grid + paginação) */}
      <PipelineAgenda eventos={EVENTOS} />

      {/* 4. CTAs INTERMEDIÁRIOS */}
      <div className="agenda-intercta fade-in">
        {CTAS_INTERMEDIARIOS.map((c) => (
          <article
            key={c.eyebrow}
            className={`agenda-intercta-card${c.classeExtra ? ` ${c.classeExtra}` : ""}`}
          >
            <p className="ic-eyebrow">{c.eyebrow}</p>
            <h4 dangerouslySetInnerHTML={{ __html: c.tituloHtml }} />
            <p>{c.descricao}</p>
            <div className="ic-actions">
              <a
                className="btn btn--primary"
                href={c.cta.href}
                data-cms-link={c.cta.cmsLink}
                data-track={c.cta.track}
              >
                {c.cta.texto} <span className="btn-arrow">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* 5. RODAPÉ CONTEXTUAL */}
      <section className="agenda-context" aria-label="Navegação contextual relacionada à agenda">
        <div className="container">
          <div className="agenda-context-grid">
            {RODAPE_CONTEXTUAL.map((col) => (
              <div key={col.titulo} className="agenda-context-col">
                <h5>{col.titulo}</h5>
                <ul>
                  {col.itens.map((item) => (
                    <li key={item.cmsLink ?? item.texto}>
                      <a href={item.href} data-cms-link={item.cmsLink}>{item.texto}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. STICKY MOBILE CTA */}
      <StickyMobileCTA />
    </main>
  );
}
```

- [ ] **Step 2: Corrigir uso de Fragment vs key em breadcrumb (React exige key em irmãos)**

O markup acima usa `<>...</>` dentro do `.map()` o que não permite key. Reescrever para usar `<React.Fragment key=...>`:

Edit em `apps/web/app/(capacitacao)/agenda/page.tsx`. Adicionar import no topo:

old_string:
```
import type { Metadata } from "next";

import {
```

new_string:
```
import type { Metadata } from "next";
import { Fragment } from "react";

import {
```

E substituir o map do breadcrumb:

old_string:
```
            {BREADCRUMB_AGENDA.map((item, i) => (
              <>
                <li key={`crumb-${i}`} className={item.current ? "current" : undefined}>
                  {item.href ? (
                    <a href={item.href} data-cms-link={item.cmsLink}>{item.texto}</a>
                  ) : (
                    <span>{item.texto}</span>
                  )}
                </li>
                {i < BREADCRUMB_AGENDA.length - 1 && (
                  <li key={`sep-${i}`} className="sep">/</li>
                )}
              </>
            ))}
```

new_string:
```
            {BREADCRUMB_AGENDA.map((item, i) => (
              <Fragment key={`crumb-${i}`}>
                <li className={item.current ? "current" : undefined}>
                  {item.href ? (
                    <a href={item.href} data-cms-link={item.cmsLink}>{item.texto}</a>
                  ) : (
                    <span>{item.texto}</span>
                  )}
                </li>
                {i < BREADCRUMB_AGENDA.length - 1 && (
                  <li className="sep">/</li>
                )}
              </Fragment>
            ))}
```

- [ ] **Step 3: Verificar typecheck**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa.

- [ ] **Step 4: Verificar lint**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -30
```

Expected: passa sem novos warnings.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/page.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): cria page.tsx server com as 6 seções do protótipo

Renderiza, em ordem do <main id="main">:
1. Breadcrumb dark (Grupo NTC / Capacitação / Agenda Geral).
2. Hero comercial com h1 dangerouslySetInnerHTML, 2 CTAs, microbar
   de 4 contadores.
3. <PipelineAgenda eventos={EVENTOS} /> client com pipeline completo.
4. CTAs intermediários (sob medida + in company).
5. Rodapé contextual (4 colunas).
6. <StickyMobileCTA /> mobile.

revalidate = 3600. Metadata com title e description institucionais.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Validar build de produção

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção do monorepo**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -40
```

Expected: build passa em todos os pacotes. Procurar por linhas com `Compiled successfully` ou `✓` e ausência de erros.

- [ ] **Step 2: Verificar que a rota /agenda foi gerada**

Comando:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/.next/server/app/agenda* 2>/dev/null; echo "---"; find /Users/joao/Documents/portal-ntc/apps/web/.next/server/app -name "*agenda*" 2>/dev/null
```

Expected: pelo menos um arquivo (`page.js`, `page.html`, `agenda.html` ou similar) listado.

- [ ] **Step 3: Se build falhar, ler erro completo e corrigir**

Se houver erro de tipo, lint ou build, **NÃO** commitar nada — corrigir no arquivo apontado pelo erro e re-rodar `pnpm build`. Após passar, prosseguir para o Task 15.

- [ ] **Step 4: Commit (apenas se houve correção)**

Se foi necessário corrigir algo:

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(agenda): ajustes pós-build de produção

[descrever o ajuste real feito]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se o build passou sem correção, pular este step (sem commit).

---

## Task 15: Validação via dev server e checkpoint humano

**Files:**
- (nenhuma modificação — validação visual humana)

- [ ] **Step 1: Subir dev server na porta 3000 em background**

Comando:

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3000
```

Use o parâmetro `run_in_background: true` da ferramenta Bash. **NÃO** use `pnpm dev` (turbo não propaga logs dos sub-processos, segundo memory `feedback_db_push_paralelo.md`).

- [ ] **Step 2: Aguardar logs do dev server indicarem que está pronto**

Esperar por linha `Ready in Xms` ou similar nos logs do background. Pode usar `Monitor` tool com pattern `Ready`.

- [ ] **Step 3: Curl da rota /agenda**

Comando:

```bash
curl -sI http://localhost:3000/agenda | head -5
```

Expected: `HTTP/1.1 200 OK` (ou `HTTP/1.1 200` com `next-` headers).

- [ ] **Step 4: Pedir ao usuário para validar visualmente**

Mensagem para o usuário:

> O servidor de dev está rodando em http://localhost:3000/agenda. Por favor:
>
> 1. Abra http://localhost:3000/agenda no navegador.
> 2. Abra o arquivo `09_Pagina_Agenda_v2.html` no navegador também (basta dar duplo-clique no arquivo na raiz do repo).
> 3. Compare lado a lado: hero, microbar, tabs (clique em cada uma), filtros (área/modalidade/mês), filtros avançados (programa/formato/cidade/ordenar), busca, chips de filtros aplicados, paginação, destaques editoriais, CTAs intermediários, rodapé contextual, sticky mobile (responsivo, redimensione para < 720px).
> 4. Reporte discrepâncias visuais ou funcionais.
>
> Quando aprovar, posso encerrar o dev server e finalizar a sessão.

- [ ] **Step 5: Após aprovação humana, encerrar o dev server**

Killar o processo de background do `pnpm next dev`. Se houve discrepâncias, corrigir e re-validar antes deste step.

- [ ] **Step 6: Se houve correções pós-validação humana, commitar**

Se foi necessário ajustar algo após o checkpoint visual, fazer commit com mensagem específica:

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(agenda): ajustes pós-checkpoint visual

[descrever o ajuste real feito após review humano]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se nada foi alterado, pular este step.

- [ ] **Step 7: Resumo da sessão (a ser apresentado ao usuário)**

Resumir em até 10 linhas:
- O que foi implementado: rota `/agenda` em route group `(capacitacao)`, com 17 eventos portados literalmente, pipeline completo (filtros, busca, sort, paginação), tabs com contagem, URL sync, sticky mobile, selo dinâmico de deadline.
- O que ficou pendente / fora de escopo: integração de analytics real, captcha, página individual de evento, hub `/capacitacao`, CMS, âncoras `#eventon` e `#juridico` em `/o-grupo`, âncora `#tab-proposta` em `/contato`.
- Próximos passos sugeridos: portar páginas irmãs do route group `(capacitacao)` (eventos online, presencial, híbrido, EventOn) ou implementar âncoras pendentes em rotas existentes.

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura) → Tasks 1, 2, 3, 4, 8, 9, 10, 11, 12, 13.
  - §4 (estrutura page.tsx) → Task 13.
  - §5 (conteudoAgenda.ts) → Tasks 4, 5, 6, 7.
  - §6.1 (PipelineAgenda) → Tasks 9-12.
  - §6.2 (StickyMobileCTA) → Task 8.
  - §7 (CSS) → Tasks 1, 2.
  - §8 (validação) → Tasks 14, 15.
  - §9 (riscos) → mitigados nas tasks (fidelidade card-a-card; pipeline em funções puras; SSR-safe deadline; URL sync com flag hidratado).
  - §10 (fora de escopo) → respeitado em todas as tasks.
- ✅ **Sem placeholders:** todos os steps têm comandos ou código completos. Os Tasks 6 e 7 contêm `awk` para ler o HTML e instruções literais de quais campos preservar — esses são tasks de transcrição literal de 10 cards que não cabem inline no plano sem inchar 5x; o comando é exato e a instrução é explícita.
- ✅ **Type consistency:** `CartaoEvento`, `EstadoAgenda`, `ChipKey`, `DataBloco` definidos uma vez (Tasks 4 e 9) e consumidos em Tasks 9-13 com nomes consistentes.
