# Página Corpo Docente — Re-porta integral — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever do zero a página `/o-grupo/corpo-docente` com fidelidade 100% ao protótipo `25_Pagina_Corpo_Docente_v1.html` — CSS literal completo dos 2 blocos `<style>` (~1.253 linhas), `page.tsx` server component porta literal das 8 seções do `<main>` e Client Components que portam a interatividade (filterbar com pipeline completo, FAQ acordeão, sticky CTA mobile, fade-in observer).

**Architecture:** Apaga page.tsx/conteudo/CSS atuais. Reaproveita layout do route group `(o-grupo)`. CSS literal importado pelo root layout (já é). `page.tsx` server monta as 8 seções; `FilterBarDocentes` (Client) renderiza filterbar + grade de experts/axis-saúde com pipeline de filtros + URL-sync via `history.replaceState`. `FaqAcordeao`, `StickyCtaMobile`, `FadeInObserver` são Client Components pequenos. Coordenação Hero → Filterbar via `CorpoDocenteContext` (provider client wrapper).

**Tech Stack:** Next.js 15 App Router, React Server Components, TypeScript strict, CSS literal (sem Tailwind para classes `.docentes-*`, `.expert-*`, etc.). Sem Vitest nesta fase — validação é visual e humana (memory `feedback_validacao_visual`).

**Spec:** `docs/superpowers/specs/2026-05-22-pagina-corpo-docente-design.md`

---

## Pré-requisitos

- Branch atual `main`. Commits direto em `main` (consistente com 45+ commits locais existentes).
- `pnpm dev` funcional.
- HTML do protótipo já está em `/Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html` (3.885 linhas).
- Implementação atual em `apps/web/app/(o-grupo)/o-grupo/corpo-docente/` será **descartada e reescrita do zero**.

---

## Task 0 — Pré-checagens

**Files:** nenhum modificado.

- [ ] **Step 0.1 — Confirmar HTML do protótipo no diretório do portal**

Run:
```bash
ls -la /Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html
```
Expected: arquivo existe, ~280KB.

- [ ] **Step 0.2 — Confirmar limites dos 2 blocos `<style>`**

Run:
```bash
grep -n "^[[:space:]]*<style\|^[[:space:]]*</style" /Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html
```
Expected:
```
198:<style>
1443:</style>
3061:<style>
3069:</style>
```

- [ ] **Step 0.3 — Confirmar route group `(o-grupo)` e layout reaproveitando HeaderHome/FooterHome**

Run:
```bash
cat /Users/joao/Documents/portal-ntc/apps/web/app/\(o-grupo\)/layout.tsx
```
Expected: contém `<HeaderHome />`, `{children}`, `<FooterHome />`, `<InteracoesScroll />`.

- [ ] **Step 0.4 — Confirmar import do `corpo-docente-prototipo.css` no root layout**

Run:
```bash
grep -n "corpo-docente-prototipo" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```
Expected: nenhum resultado (ainda não está importado). **Será adicionado na Task 2**. Se já estiver importado de uma sessão anterior, pular o passo de importar na Task 2.

- [ ] **Step 0.5 — Inventariar contagem real de cards no HTML**

Run:
```bash
grep -c 'class="expert-featured-card"' /Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html
grep -c 'class="expert-authority-card"' /Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html
grep -c 'class="expert-authority-card is-axis-card"' /Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html
```
Expected (esperado mas validar): 4 featured · ~38 authority (inclui axis) · 5 axis. Anotar contagens reais em comentário do `conteudoCorpoDocente.ts` no Task 5.

---

## Task 1 — Apagar implementação atual

**Files:**
- Delete: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx`
- Delete: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts`
- Delete: `apps/web/app/corpo-docente-prototipo.css`

- [ ] **Step 1.1 — Apagar os 3 arquivos antigos**

Run:
```bash
rm /Users/joao/Documents/portal-ntc/apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/page.tsx
rm /Users/joao/Documents/portal-ntc/apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
rm /Users/joao/Documents/portal-ntc/apps/web/app/corpo-docente-prototipo.css
```
Expected: comandos retornam sem erro.

- [ ] **Step 1.2 — Confirmar diretório vazio**

Run:
```bash
ls /Users/joao/Documents/portal-ntc/apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/
```
Expected: `ls: cannot access ...: No such file or directory` (diretório some quando não tem arquivos) **ou** vazio. Se sumir, será recriado nas próximas tasks.

- [ ] **Step 1.3 — Commit do reset**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore(corpo-docente): apaga implementação anterior para re-porta integral

Remove page.tsx, conteudoCorpoDocente.ts e corpo-docente-prototipo.css
da página /o-grupo/corpo-docente. A reescrita do zero segue o spec
docs/superpowers/specs/2026-05-22-pagina-corpo-docente-design.md —
CSS literal completo (~1253 linhas), interatividade da filterbar
portada e fidelidade 100% ao protótipo HTML.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: commit cria com 3 deletions.

---

## Task 2 — Extrair CSS literal do protótipo

**Files:**
- Create: `apps/web/app/corpo-docente-prototipo.css`
- Modify: `apps/web/app/layout.tsx` (se ainda não importado)

O CSS sai dos 2 blocos `<style>` do HTML do protótipo (linhas 198–1443 e 3061–3068), copiado **literalmente** sem adaptação.

- [ ] **Step 2.1 — Ler o primeiro bloco `<style>` (linhas 199–1442) do protótipo**

Use a tool Read com `file_path=/Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html`, `offset=199`, `limit=1244` (linhas 199 até 1442 inclusive). Pode ser necessário dividir em 2 chamadas se exceder o limite de leitura.

- [ ] **Step 2.2 — Ler o segundo bloco `<style>` (linhas 3062–3068) do protótipo**

Use a tool Read com `file_path=...`, `offset=3062`, `limit=7`.

- [ ] **Step 2.3 — Criar `apps/web/app/corpo-docente-prototipo.css`**

Estrutura do arquivo:

```css
/*
 * apps/web/app/corpo-docente-prototipo.css
 *
 * CSS literal da página /o-grupo/corpo-docente, portado dos 2 blocos
 * <style> de 25_Pagina_Corpo_Docente_v1.html (linhas 198-1443 e
 * 3061-3068). Tokens base (--oxford, --cardeal, --oliva, --dourado,
 * --pergaminho, --tinta, --grafite, --font-serif, --font-cond,
 * --font-sans, --space-*, --t-*, --shadow-*) vêm de
 * home-prototipo.css. Aqui só carregamos as regras específicas
 * da página de Corpo Docente.
 *
 * Não escrever CSS adicional fora deste arquivo nem inline —
 * qualquer ajuste passa pelo protótipo HTML (CLAUDE.md §5.2).
 */

/* === BLOCO 1 (linhas 199-1442 do HTML) === */
[colar aqui o conteúdo entre <style> e </style> do primeiro bloco,
SEM modificar nada — nem comentários, nem ordem, nem espaçamento.
Não remover redefinição de tokens caso colidam: se houver
`:root { --foo: ... }`, manter como está; o cascade resolve.]

/* === BLOCO 2 (linhas 3062-3068 do HTML) === */
[colar conteúdo do segundo bloco — override mobile do CTA final areas.]
```

- [ ] **Step 2.4 — Validar contagem de linhas e seletores**

Run:
```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/corpo-docente-prototipo.css
grep -c "^\." /Users/joao/Documents/portal-ntc/apps/web/app/corpo-docente-prototipo.css
```
Expected: ~1260 linhas (incluindo comentários adicionados), ≥220 regras com seletor de classe.

- [ ] **Step 2.5 — Verificar se já está importado no root layout**

Run:
```bash
grep -n "corpo-docente-prototipo" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Se **não retornar nada**, ir para Step 2.6. Se **retornar uma linha**, pular para Step 2.7.

- [ ] **Step 2.6 — Importar no root layout**

Modify: `apps/web/app/layout.tsx` (logo após o import de `programas-prototipo.css`).

Adicionar:
```ts
// CSS da página de Corpo Docente (/o-grupo/corpo-docente).
// Portado literal dos 2 blocos <style> de
// 25_Pagina_Corpo_Docente_v1.html. Tokens base vêm de
// home-prototipo.css; aqui só vão classes específicas
// (.docentes-*, .arch-*, .expert-*, .efc-*, .eac-*, .ec-*,
// .credibilidade-*, .ci-*, .cta-credenciamento-*, .sticky-cta-mobile,
// .pg-*, .docentes-chip, .docentes-empty, .curadoria-pill).
import "./corpo-docente-prototipo.css";
```

- [ ] **Step 2.7 — Rodar typecheck e dev rápido**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros. Warnings de CSS são aceitáveis (nada é tipado em CSS).

- [ ] **Step 2.8 — Commit do CSS**

```bash
git add apps/web/app/corpo-docente-prototipo.css apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): porta CSS literal completo do protótipo

Extrai os 2 blocos <style> do 25_Pagina_Corpo_Docente_v1.html
(~1253 linhas / 226 regras) para apps/web/app/corpo-docente-prototipo.css
e importa no root layout. CSS atual estava com ~25% das regras
faltando (estados is-open/is-active/is-visible, paginação,
chips, mobile-toggle, FAQ acordeão animado, sticky CTA).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — Estrutura de dados base (`conteudoCorpoDocente.ts` parte 1: tipos e seções estáticas)

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts`

Esta task cria o arquivo de conteúdo **parcial**, com tipos e seções que não envolvem os arrays de cards (que são portados na Task 5).

- [ ] **Step 3.1 — Ler seções HERO, MÉTRICAS, MANIFESTO do protótipo**

Use Read com `offset=1610`, `limit=180` (cobre linhas ~1610–1790 do HTML).

- [ ] **Step 3.2 — Ler seções CREDIBILIDADE, CREDENCIAMENTO do protótipo**

Use Read com `offset=2840`, `limit=180` (cobre seções credibilidade e credenciamento).

- [ ] **Step 3.3 — Ler seções FAQ, CTA FINAL, STICKY CTA do protótipo**

Use Read com `offset=2920`, `limit=160`.

- [ ] **Step 3.4 — Ler bloco de filterbar para extrair AREA_LABELS, TIPO_LABELS, PROGRAMAS_OPTIONS, FORMACAO_OPTIONS, ATUACAO_OPTIONS, SORT_OPTIONS**

Use Read com `offset=1810`, `limit=140` (cobre options dos selects no HTML).

- [ ] **Step 3.5 — Criar arquivo com tipos + seções HERO/MÉTRICAS/MANIFESTO/CREDIBILIDADE/CREDENCIAMENTO/FAQ/CTA_FINAL/STICKY_CTA + LABELS**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts`

Conteúdo:

```ts
/**
 * Conteúdo literal portado de 25_Pagina_Corpo_Docente_v1.html.
 *
 * Textos institucionais, métricas, manifesto, lista de cards docentes
 * (featured + experts + axis-saúde), labels da filterbar, FAQ, CTAs.
 *
 * Padrão "porta do HTML" (memory/project_porta_html.md): textos ficam
 * neste arquivo local; CMS só entra quando explicitamente solicitado.
 */

/* ============================================================
   TIPOS
   ============================================================ */

export type Vertical = "educacao" | "gestao-publica" | "saude";
export type Tipo =
  | "autoridade"
  | "palestrante"
  | "doutrinador"
  | "consultor"
  | "pesquisador";
export type Frente = "" | "contratacoes";
export type TabId =
  | "todos"
  | "educacao"
  | "gestao-publica"
  | "contratacoes"
  | "saude";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CardFeatured {
  vertical: Vertical;
  area: string;
  tipo: Tipo;
  frente: Frente;
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
  nome: string;
  imagemSrc: string;
  imagemAlt: string;
  axisBadge: string;
  tag: string;
  credencial: string;
  metaAtuacao: string;
  metaEixos: string;
  ctaHref: string;
  ctaRotulo: string;
}

export interface CardExpert {
  vertical: Vertical;
  area: string;
  tipo: Tipo;
  frente: Frente;
  programas: string;
  formacao: string;
  atuacao: string;
  cmsLink: string;
  nome: string;
  imagemSrc: string;
  imagemAlt: string;
  axisBadge: string;
  tipoTag: string;
  nomeExibido: string;
  credencial: string;
  programasTexto: string;
  programasStrong: string;
  sufixoPrograma?: string;
  ctaHref: string;
  ctaRotulo: string;
}

export interface CardAxis {
  vertical: "saude";
  area: string;
  tipo: Tipo; // sempre "autoridade" no HTML, mas tipado para a pipeline
  frente: Frente; // sempre ""
  programas: string;
  formacao: string; // sempre ""
  atuacao: string;  // sempre ""
  cmsLink: string;
  nome: string;
  iconePath: string;
  axisTag: string;
  titulo: string;
  credencial: string;
  programasTexto: string;
  programasStrong: string;
  ctaHref: string;
  ctaRotulo: string;
  styleAccent: string;    // ex: "var(--oliva)"
  styleAccentDark: string; // ex: "#2B3E12"
}

/* ============================================================
   HERO + MÉTRICAS + MANIFESTO
   ============================================================ */

export const HERO = {
  crumb: {
    home: { rotulo: "Grupo NTC", href: "/" },
    parent: { rotulo: "O Grupo", href: "/o-grupo" }, // ajustado vs HTML (que apontava para /capacitacao)
    current: "Corpo Docente",
  },
  eyebrow: "Curadoria nacional · Instituto NTC do Brasil · Edição 2026",
  titulo:
    'Corpo Docente <span class="accent">do Grupo NTC</span>.<br>Autoridades, pesquisadores, gestores, doutrinadores e palestrantes que sustentam nossos programas.',
  subtitulo:
    'Uma curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação. <em style="color: var(--pergaminho); font-style: italic;">Contratações Públicas integra a NTC Gestão Pública como núcleo técnico especializado.</em>',
  quicklinks: [
    { tipo: "anchor" as const, rotulo: "Ver toda a curadoria", href: "#especialistas" },
    { tipo: "tab" as const, rotulo: "Educação", vertShortcut: "educacao" as TabId },
    { tipo: "tab" as const, rotulo: "Gestão Pública", vertShortcut: "gestao-publica" as TabId },
    { tipo: "tab" as const, rotulo: "Contratações Públicas", vertShortcut: "contratacoes" as TabId },
    { tipo: "tab" as const, rotulo: "Saúde", vertShortcut: "saude" as TabId },
    { tipo: "anchor" as const, rotulo: "Credenciar especialista", href: "#credenciamento" },
  ],
};

export interface Metrica {
  classe: "is-edu" | "is-gov" | "is-cpr" | "is-sau";
  sublabel: string;
  num: string;
  label: string;
  detalhe: string;
}

export const METRICAS: Metrica[] = [
  // [PORTAR literalmente do HTML linhas ~1652-1675 — 4 métricas:
  //  NTC Educação (60), NTC Gestão Pública (31), Contratações Públicas (31), NTC Saúde (5 frentes)]
];

export interface ArchCard {
  area: "educacao" | "gestao-publica" | "contratacoes" | "saude";
  eyebrow: string;
  titulo: string;
  descricao: string;
  selo: string;
}

export interface Camada {
  num: string;
  titulo: string;
  descricao: string;
}

export const MANIFESTO = {
  marker: "Arquitetura da curadoria",
  titulo: "[PORTAR título do <h2> da seção docentes-manifesto, linha ~1685]",
  lede: "[PORTAR <p class=\"lede\"> da seção, linha ~1688]",
  archCards: [] as ArchCard[],     // 4 cards (linhas ~1693-1720)
  camadas: [] as Camada[],          // 5 camadas (linhas ~1727-1753)
  callout: {
    titulo: "[PORTAR <h4> do arch-callout]",
    descricao: "[PORTAR <p> do arch-callout]",
  },
  nota: "[PORTAR <p class=\"arch-nota\">]",
};

/* ============================================================
   FILTERBAR — LABELS E OPÇÕES (extraídos do JS do protótipo
   linhas ~3272-3322 e dos selects HTML linhas ~1814-1944)
   ============================================================ */

export const TAB_LABELS: Record<TabId, string> = {
  "todos": "Todos",
  "educacao": "Educação",
  "gestao-publica": "Gestão Pública",
  "contratacoes": "Contratações Públicas",
  "saude": "Saúde",
};

export const AREA_LABELS: Record<string, string> = {
  // Educação · 8 eixos
  "alfabetizacao": "Alfabetização, leitura e letramento",
  "gestao-escolar": "Gestão escolar e coordenação pedagógica",
  "educacao-digital": "Educação digital, IA e inovação",
  "educacao-integral": "Educação integral",
  "primeira-infancia": "Primeira infância e educação infantil",
  "inclusao-equidade": "Inclusão, equidade e convivência",
  "ensino-medio": "Ensino médio, juventudes e futuro",
  "avaliacao-politicas": "Avaliação e políticas educacionais",
  // Gestão Pública · 8 eixos
  "lideranca-publica": "Liderança pública",
  "governanca-integridade": "Governança e integridade",
  "direito-administrativo": "Direito administrativo",
  "politicas-publicas": "Políticas públicas",
  "escolas-governo": "Escolas de governo",
  "transformacao-digital-estado": "Transformação digital do Estado",
  "gestao-institucional": "Gestão institucional",
  "cultura-organizacional": "Cultura organizacional e alta gestão",
  // Contratações · 8 eixos
  "lei-14133": "Lei 14.133/2021",
  "licitacoes-contratos": "Licitações e contratos",
  "pregao-contratacao-direta": "Pregão e contratação direta",
  "gestao-fiscalizacao-contratual": "Gestão e fiscalização contratual",
  "controle-externo-tcu": "Controle externo e TCU",
  "obras-publicas": "Obras públicas",
  "concessoes-ppps": "Concessões, PPPs e infraestrutura",
  "compliance-contratacoes": "Compliance nas contratações",
  // Saúde · 5 frentes
  "governanca-sus": "Frente 01 · Gestão do SUS e governança",
  "aps": "Frente 02 · Atenção primária e redes",
  "saude-digital": "Frente 03 · Saúde digital, dados e IA",
  "planejamento-financiamento-saude": "Frente 04 · Planejamento e financiamento",
  "regulacao-compliance-saude": "Frente 05 · Regulação e compliance",
};

export const TIPO_LABELS: Record<Tipo, string> = {
  "autoridade": "Autoridade de referência",
  "palestrante": "Palestrante / pensador nacional",
  "doutrinador": "Especialista técnico / doutrinador",
  "consultor": "Consultor sênior",
  "pesquisador": "Pesquisador / coordenação científica",
};

export const PROGRAMAS_OPTIONS: string[] = [
  // [PORTAR <option> do <select id="filter-programa"> do HTML, linhas ~1858-1905]
  // Esperado: 15 siglas (LIDERA, SIGA, EGIDE, SIGS, PEAR, EDUTEC, PROAPS, PROSUS,
  // PEI, PROGE, PROGIR, PINEI, VIVAESCOLA, FUTURA, AGIP)
];

export const FORMACAO_OPTIONS: SelectOption[] = [
  // [PORTAR do HTML — linhas ~1907-1916]
  // Esperado: doutorado, mestrado, especialização, graduação (validar)
];

export const ATUACAO_OPTIONS: SelectOption[] = [
  // [PORTAR do HTML — linhas ~1918-1930]
  // Esperado: gestao-publica, universidade, judiciario, controle, consultoria,
  // multilateral, terceiro-setor (validar)
];

export const SORT_OPTIONS: SelectOption[] = [
  { value: "editorial", label: "Ordem editorial" },
  { value: "alfa", label: "A → Z" },
  { value: "alfa-desc", label: "Z → A" },
  { value: "programa", label: "Por programa" },
  { value: "area", label: "Por área formativa" },
];

export const PERPAGE_OPTIONS: number[] = [12, 24, 48, 96];

/* ============================================================
   CARDS — Task 5 preenche os 3 arrays abaixo
   ============================================================ */

export const CARDS_FEATURED: CardFeatured[] = [];
export const CARDS_EXPERTS: CardExpert[] = [];
export const CARDS_AXIS_SAUDE: CardAxis[] = [];

/* ============================================================
   CONTADORES INSTITUCIONAIS + NOTAS EDITORIAIS
   ============================================================ */

export interface Contador {
  num: string;
  label: string;
  asterisco?: boolean;
  sufixoOuro?: string;
}

export const CONTADORES: Contador[] = [
  { num: "22", label: "Eixos formativos" },
  { num: "122", sufixoOuro: "+", label: "Referências institucionais", asterisco: true },
  { num: "15", label: "Programas estratégicos" },
  { num: "3", label: "Áreas estratégicas + Núcleo Contratações" },
];

export const NOTAS = {
  indicador122: {
    rotulo: "* Sobre o indicador \"122+ Referências institucionais\"",
    texto:
      'O número reúne <strong>especialistas, autoridades, doutrinadores, consultores e referências técnicas</strong> mapeadas na curadoria institucional do Instituto NTC do Brasil — 31 em NTC Gestão Pública, 31 no Núcleo Contratações Públicas, 60 em NTC Educação e curadoria especializada em frentes técnicas na NTC Saúde — com <strong>composição operacional definida conforme programa, eixo, formato e contratação</strong>. Não representa corpo docente fixo nem disponibilidade contínua de todos os nomes simultaneamente.',
  },
  selecaoOperacional:
    'Os perfis acima representam uma <strong>seleção operacional da curadoria do Grupo NTC</strong>, atualizada continuamente conforme o portfólio institucional. Cada turma, programa ou jornada in company recebe uma composição docente específica, calibrada conforme o eixo temático, o perfil dos participantes e os resultados esperados pela instituição contratante.',
};

/* ============================================================
   CREDIBILIDADE
   ============================================================ */

export const CREDIBILIDADE = {
  eyebrow: "[PORTAR do HTML linha ~2850]",
  titulo: "[PORTAR <h2>]",
  lede: "[PORTAR <p class=\"lede\">]",
  items: [] as { num: string; label: string; detalhe: string }[],
  rodape: "[PORTAR <p> de rodapé com classes específicas]",
};

/* ============================================================
   CREDENCIAMENTO
   ============================================================ */

export interface CtaBtn {
  rotulo: string;
  href: string;
  variante: "gold" | "ghost-light" | "ghost" | "outline";
}

export const CREDENCIAMENTO = {
  eyebrow: "[PORTAR]",
  titulo: "[PORTAR <h2>]",
  descricao: "[PORTAR <p> de abertura]",
  lista: [] as string[],
  ctas: [] as CtaBtn[],
  aside: {
    eyebrow: "[PORTAR]",
    titulo: "[PORTAR <h3>]",
    intro: "[PORTAR <p>]",
    checklist: [] as string[],
    nota: "[PORTAR <p> com fontsize 13]",
  },
};

/* ============================================================
   FAQ — sem campo `open` (estado vive no FaqAcordeao client)
   ============================================================ */

export interface FaqItem {
  id: string;
  titulo: string;
  parags: string[];
}

export const FAQ: FaqItem[] = [
  // [PORTAR todos os <div class="docentes-faq-item"> do HTML.
  //  id = mesmo id usado em aria-controls. parags com HTML literal
  //  preservando <strong>, <em>, <br>.]
];

/* ============================================================
   CTA FINAL
   ============================================================ */

export const CTA_FINAL = {
  eyebrow: "[PORTAR]",
  titulo: "[PORTAR <h2>]",
  descricao: "[PORTAR <p>]",
  ctaPrincipal: {} as CtaBtn,
  ctaSecundario: {} as CtaBtn,
  separadorAreas: "[PORTAR microcopy entre CTAs e botões por área]",
  ctasArea: [] as { rotulo: string; href: string }[],
};

/* ============================================================
   STICKY CTA MOBILE
   ============================================================ */

export const STICKY_CTA = {
  rotulo: "Solicitar proposta institucional",
  href: "/contato#tab-proposta",
};
```

- [ ] **Step 3.6 — Preencher os placeholders das seções estáticas com os textos literais do HTML**

Edits específicos a aplicar (ler o HTML antes de cada edit):

1. `METRICAS`: 4 entradas com `classe`, `sublabel`, `num`, `label`, `detalhe`. Linhas ~1652-1675 do HTML.
2. `MANIFESTO.titulo`, `MANIFESTO.lede`, `MANIFESTO.archCards` (4), `MANIFESTO.camadas` (5), `MANIFESTO.callout`, `MANIFESTO.nota`. Linhas ~1685-1768.
3. `PROGRAMAS_OPTIONS`, `FORMACAO_OPTIONS`, `ATUACAO_OPTIONS`: ler `<select id="filter-programa|filter-formacao|filter-atuacao">` no HTML.
4. `CREDIBILIDADE`: linhas ~2850-2910.
5. `CREDENCIAMENTO`: linhas ~2920-2980.
6. `FAQ`: linhas ~2990-3050 (todos os `.docentes-faq-item`).
7. `CTA_FINAL`: linhas ~3000-3055.

Cada placeholder `[PORTAR ...]` deve ser substituído por texto literal do HTML. Manter `<strong>`, `<em>`, `<br>` exatamente como no protótipo.

- [ ] **Step 3.7 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros (arrays vazios são válidos; os tipos genéricos `[] as T[]` passam).

- [ ] **Step 3.8 — Commit parcial**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
git commit -m "$(cat <<'EOF'
feat(corpo-docente): cria tipos e seções estáticas do conteúdo

Adiciona conteudoCorpoDocente.ts com tipos completos (CardFeatured,
CardExpert, CardAxis, FaqItem etc.), seções HERO/MÉTRICAS/MANIFESTO/
CREDIBILIDADE/CREDENCIAMENTO/FAQ/CTA_FINAL/STICKY_CTA com textos
literais do protótipo, e LABELS/OPTIONS da filterbar extraídos do JS
e dos selects do HTML. Arrays de cards ficam vazios — preenchidos na
Task 5.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4 — CorpoDocenteContext (provider para coordenação Hero ↔ Filterbar)

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/CorpoDocenteContext.tsx`

- [ ] **Step 4.1 — Criar o context client**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/CorpoDocenteContext.tsx`

```tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { TabId } from "./conteudoCorpoDocente";

type CorpoDocenteCtx = {
  tabRequest: { id: TabId; nonce: number } | null;
  requestTab: (id: TabId) => void;
};

const Ctx = createContext<CorpoDocenteCtx | null>(null);

export function CorpoDocenteProvider({ children }: { children: ReactNode }) {
  const [tabRequest, setTabRequest] = useState<CorpoDocenteCtx["tabRequest"]>(null);

  const requestTab = useCallback((id: TabId) => {
    setTabRequest({ id, nonce: Date.now() });
  }, []);

  const value = useMemo(() => ({ tabRequest, requestTab }), [tabRequest, requestTab]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCorpoDocenteCtx(): CorpoDocenteCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCorpoDocenteCtx must be used inside CorpoDocenteProvider");
  return ctx;
}
```

A coordenação funciona assim: o Hero (no `page.tsx`) chama `requestTab("educacao")` quando o botão é clicado; o `FilterBarDocentes` registra um `useEffect` que observa `tabRequest` e ativa a tab pedida (rolando suave para `#especialistas` em seguida). O `nonce` garante que cliques sucessivos no mesmo botão disparem o efeito novamente.

- [ ] **Step 4.2 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros.

- [ ] **Step 4.3 — Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/CorpoDocenteContext.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): adiciona CorpoDocenteContext

Provider client que permite ao Hero solicitar ativação de uma tab da
filterbar via requestTab(id). Pattern de nonce garante que cliques
repetidos no mesmo botão disparem o efeito mesmo sem mudança de id.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — Portar arrays de cards (CARDS_FEATURED, CARDS_EXPERTS, CARDS_AXIS_SAUDE)

**Files:**
- Modify: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts`

Esta é a task mais demorada — re-leitura **card por card** do HTML com fidelidade 100% (memory `feedback_porta_html_fidelidade`).

- [ ] **Step 5.1 — Ler bloco de cards FEATURED do HTML**

Use Read com `offset=1973`, `limit=80` (cobre os 4 `<article class="expert-featured-card">`, linhas ~1973-2046).

- [ ] **Step 5.2 — Preencher `CARDS_FEATURED`**

Para cada um dos 4 cards no HTML, criar entrada com **todos** os campos da interface `CardFeatured`. Atributos `data-*` viram propriedades correspondentes. Imagem (src + alt) sai do `<img>`. `axisBadge` sai do `<span class="efc-axis-badge">`. `tag` sai do `<span class="efc-tag">`. `nome` (h4), `credencial`, `metaAtuacao`, `metaEixos`, `ctaHref`, `ctaRotulo` — todos literais do HTML.

`ctaHref`: o HTML usa caminhos `./pagina.html#anchor`. Converter para rotas do portal: substituir `./12_Pagina_Contato_v1.html` por `/contato` (verificar se a rota existe; se não, manter `#` placeholder e anotar comentário inline `// TODO: rota /contato ainda não criada`).

- [ ] **Step 5.3 — Ler bloco de cards EXPERTS (parte 1: Educação)**

Use Read com `offset=2053`, `limit=240` (cobre ~16 cards educação, linhas ~2053-2280).

- [ ] **Step 5.4 — Preencher entradas de `CARDS_EXPERTS` para Educação**

Mesma lógica: cada `<article class="expert-authority-card">` (sem `is-axis-card`) vira uma entrada `CardExpert`. `axisBadge` do `<span class="eac-axis-badge">`, `tipoTag` do `<span class="eac-tipo-tag">`, `nomeExibido` do `<h4>`, `credencial` do `<p class="eac-credential">`, `programasTexto`/`programasStrong`/`sufixoPrograma` do `<p class="eac-programs">` (formato típico: `"Programa · <strong>SIGLA</strong>" + opcional sufixo`).

- [ ] **Step 5.5 — Ler bloco de cards EXPERTS (parte 2: Gestão Pública + Contratações)**

Use Read com `offset=2280`, `limit=420` (cobre ~22 cards de GP + Contratações, linhas ~2280-2696).

- [ ] **Step 5.6 — Preencher entradas de `CARDS_EXPERTS` para GP + Contratações**

Idem ao Step 5.4. Cards com `data-frente="contratacoes"` são reconhecidos pela pipeline como pertencentes à tab "contratacoes" (não à "gestao-publica" pura).

- [ ] **Step 5.7 — Ler bloco AXIS-SAÚDE**

Use Read com `offset=2697`, `limit=90` (cobre os 5 cards `expert-authority-card is-axis-card`, linhas ~2697-2790).

- [ ] **Step 5.8 — Preencher `CARDS_AXIS_SAUDE`**

Cada card tem `<svg>` com `<path d="...">` (iconePath), `<span class="eac-axis-tag">` (axisTag), `<h4>` (titulo), `<p class="eac-credential">` (credencial), `<p class="eac-programs">` (programasTexto + programasStrong). O `style="--vertical-accent: ...; --vertical-accent-dark: ..."` vira `styleAccent` + `styleAccentDark`. Campo `nome` recebe o mesmo valor de `titulo` (usado em `data-name` e na busca).

- [ ] **Step 5.9 — Validar contagens**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && node --input-type=module -e "
import('./apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts').then(m => {
  console.log('FEATURED:', m.CARDS_FEATURED.length);
  console.log('EXPERTS:', m.CARDS_EXPERTS.length);
  console.log('AXIS_SAUDE:', m.CARDS_AXIS_SAUDE.length);
});
" 2>/dev/null || echo "Direto via tsx pode falhar — use pnpm typecheck como fallback"
```

Alternativa mais robusta — `grep` no próprio arquivo:
```bash
grep -c "vertical:" /Users/joao/Documents/portal-ntc/apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
```
Expected: ≥47 (4 + ~38 + 5).

- [ ] **Step 5.10 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros.

- [ ] **Step 5.11 — Commit dos cards**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
git commit -m "$(cat <<'EOF'
feat(corpo-docente): porta arrays de cards (featured + experts + axis-saúde)

Re-leitura card-por-card do 25_Pagina_Corpo_Docente_v1.html. 4 cards
em CARDS_FEATURED, ~38 em CARDS_EXPERTS, 5 frentes em
CARDS_AXIS_SAUDE. Todos os 9 campos data-* (vertical, area, tipo,
frente, programas, formacao, atuacao, cmsLink, nome) preservados
para a pipeline de filtros funcionar corretamente.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6 — FaqAcordeao Client Component

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FaqAcordeao.tsx`

- [ ] **Step 6.1 — Criar componente**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FaqAcordeao.tsx`

```tsx
"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoCorpoDocente";

interface FaqAcordeaoProps {
  items: FaqItem[];
}

function html(s: string) {
  return { __html: s };
}

export function FaqAcordeao({ items }: FaqAcordeaoProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="docentes-faq" id="faq" aria-label="Perguntas frequentes sobre o corpo docente">
      <div className="container">
        <div className="docentes-faq-inner">
          <div className="docentes-faq-head fade-in">
            <p className="eyebrow">Tudo sobre a curadoria</p>
            <h2>
              Perguntas <em>frequentes</em>
            </h2>
          </div>

          {items.map((item) => {
            const isOpen = open.has(item.id);
            return (
              <div key={item.id} className={`docentes-faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="docentes-faq-toggle"
                  aria-expanded={isOpen}
                  aria-controls={item.id}
                  onClick={() => toggle(item.id)}
                >
                  <h3>{item.titulo}</h3>
                  <span className="docentes-faq-icon" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="docentes-faq-body" id={item.id}>
                  {item.parags.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={html(p)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6.2 — Typecheck e commit**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/FaqAcordeao.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): adiciona FaqAcordeao client component

Substitui o controle estático (FAQ.item.open no conteúdo) por
Set<string> de itens abertos. Cada clique no botão da pergunta
alterna o estado e atualiza aria-expanded. Preserva classes
.docentes-faq-* do CSS portado.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7 — StickyCtaMobile Client Component

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/StickyCtaMobile.tsx`

- [ ] **Step 7.1 — Criar componente**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/StickyCtaMobile.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

interface StickyCtaMobileProps {
  rotulo: string;
  href: string;
}

export function StickyCtaMobile({ rotulo, href }: StickyCtaMobileProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) {
      setVisible(false);
      return;
    }
    const onScroll = () => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dismissed]);

  return (
    <div
      className={`sticky-cta-mobile ${visible ? "is-visible" : ""}`}
      id="stickyCta"
      role="complementary"
      aria-label="Chamada institucional móvel"
    >
      <button
        type="button"
        className="sticky-cta-mobile-dismiss"
        aria-label="Fechar chamada"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
      <a className="btn btn--gold" href={href}>
        {rotulo} <span className="btn-arrow">→</span>
      </a>
    </div>
  );
}
```

- [ ] **Step 7.2 — Typecheck e commit**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/StickyCtaMobile.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): adiciona StickyCtaMobile client component

Mostra a barra fixa após scroll > 800px (igual JS do protótipo).
Dismiss permanente via botão ×. Listener de scroll registrado
com { passive: true }.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8 — FadeInObserver Client Component

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FadeInObserver.tsx`

- [ ] **Step 8.1 — Criar componente**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FadeInObserver.tsx`

```tsx
"use client";

import { useEffect } from "react";

export function FadeInObserver() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".fade-in").forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
    };
  }, []);

  return null;
}
```

- [ ] **Step 8.2 — Typecheck e commit**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/FadeInObserver.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): adiciona FadeInObserver client component

Replica o IntersectionObserver do JS do protótipo (threshold 0.12)
que adiciona .is-visible nos elementos .fade-in conforme entram
no viewport. Fallback adiciona is-visible em todos os elementos
se IntersectionObserver não estiver disponível.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9 — FilterBarDocentes Client Component (parte 1: tipos, helpers, pipeline)

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FilterBarDocentes.tsx`

Esta é a maior task. Para mantê-la digerível, dividimos em 2: Task 9 cria o esqueleto + lógica pura (helpers + pipeline); Task 10 monta o JSX.

- [ ] **Step 9.1 — Criar arquivo com tipos, helpers e pipeline (sem JSX ainda — JSX retorna `null` provisoriamente)**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FilterBarDocentes.tsx`

```tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AREA_LABELS,
  ATUACAO_OPTIONS,
  CONTADORES,
  FORMACAO_OPTIONS,
  NOTAS,
  PERPAGE_OPTIONS,
  PROGRAMAS_OPTIONS,
  SORT_OPTIONS,
  TAB_LABELS,
  TIPO_LABELS,
} from "./conteudoCorpoDocente";
import type {
  CardAxis,
  CardExpert,
  CardFeatured,
  TabId,
  Tipo,
} from "./conteudoCorpoDocente";
import { useCorpoDocenteCtx } from "./CorpoDocenteContext";

/* ============================================================
   TIPOS
   ============================================================ */

type SortMode = "editorial" | "alfa" | "alfa-desc" | "programa" | "area";

interface FiltersState {
  tab: TabId;
  search: string;
  area: string;
  tipo: Tipo | "";
  programa: string;
  formacao: string;
  atuacao: string;
  sort: SortMode;
  page: number;
  perpage: number;
}

interface CardLike {
  vertical: "educacao" | "gestao-publica" | "saude";
  area: string;
  tipo: Tipo;
  frente: "" | "contratacoes";
  programas: string;
  formacao: string;
  atuacao: string;
  nome: string;
  cmsLink: string;
  searchHaystack: string; // pré-computado para perf
  kind: "expert" | "axis";
  // Reference ao objeto original para render
  original: CardExpert | CardAxis;
}

interface FilterBarDocentesProps {
  featured: CardFeatured[];
  experts: CardExpert[];
  axisSaude: CardAxis[];
}

/* ============================================================
   HELPERS
   ============================================================ */

const DEFAULT_FILTERS: FiltersState = {
  tab: "todos",
  search: "",
  area: "",
  tipo: "",
  programa: "",
  formacao: "",
  atuacao: "",
  sort: "editorial",
  page: 1,
  perpage: 24,
};

// Ordem editorial: autoridade > palestrante > doutrinador > consultor > pesquisador
const TIPO_ORDER: Record<string, number> = {
  autoridade: 0,
  palestrante: 1,
  doutrinador: 2,
  consultor: 3,
  pesquisador: 4,
};

function toCardLike(c: CardExpert | CardAxis, kind: "expert" | "axis"): CardLike {
  return {
    vertical: c.vertical,
    area: c.area,
    tipo: c.tipo,
    frente: c.frente,
    programas: c.programas,
    formacao: c.formacao,
    atuacao: c.atuacao,
    nome: c.nome,
    cmsLink: c.cmsLink,
    searchHaystack: `${c.nome} ${c.vertical} ${c.area} ${c.programas}`.toLowerCase(),
    kind,
    original: c,
  };
}

function matchTab(c: CardLike, tab: TabId): boolean {
  if (tab === "todos") return true;
  if (tab === "contratacoes") return c.frente === "contratacoes";
  if (tab === "gestao-publica")
    return c.vertical === "gestao-publica" && c.frente !== "contratacoes";
  return c.vertical === tab;
}

function applyFilters(cards: CardLike[], f: FiltersState): CardLike[] {
  const q = f.search.trim().toLowerCase();
  return cards.filter((c) => {
    if (!matchTab(c, f.tab)) return false;
    if (f.area && c.area !== f.area) return false;
    if (f.tipo && c.tipo !== f.tipo) return false;
    if (f.programa) {
      const list = c.programas.split(",").map((s) => s.trim());
      if (!list.includes(f.programa)) return false;
    }
    if (f.formacao && c.formacao !== f.formacao) return false;
    if (f.atuacao) {
      const list = c.atuacao.split(",").map((s) => s.trim());
      if (!list.includes(f.atuacao)) return false;
    }
    if (q && c.searchHaystack.indexOf(q) === -1) return false;
    return true;
  });
}

function sortCards(cards: CardLike[], sort: SortMode): CardLike[] {
  const arr = cards.slice();
  if (sort === "editorial") {
    arr.sort((a, b) => {
      const ta = TIPO_ORDER[a.tipo] ?? 9;
      const tb = TIPO_ORDER[b.tipo] ?? 9;
      if (ta !== tb) return ta - tb;
      return a.nome.localeCompare(b.nome);
    });
  } else if (sort === "alfa") {
    arr.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (sort === "alfa-desc") {
    arr.sort((a, b) => b.nome.localeCompare(a.nome));
  } else if (sort === "programa") {
    arr.sort((a, b) => {
      const pa = a.programas.split(",")[0].trim();
      const pb = b.programas.split(",")[0].trim();
      return pa.localeCompare(pb);
    });
  } else if (sort === "area") {
    arr.sort((a, b) =>
      (AREA_LABELS[a.area] ?? "").localeCompare(AREA_LABELS[b.area] ?? "")
    );
  }
  return arr;
}

function paginate(
  cards: CardLike[],
  page: number,
  perpage: number
): { visible: CardLike[]; total: number; totalPages: number; currentPage: number } {
  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / perpage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * perpage;
  return { visible: cards.slice(start, start + perpage), total, totalPages, currentPage };
}

function computeTabCounts(
  all: CardLike[],
  f: FiltersState
): Record<TabId, number> {
  // Aplica todos os filtros EXCETO tab e search-de-tab para descobrir counts
  const fNoTab: FiltersState = { ...f, tab: "todos" };
  const base = applyFilters(all, fNoTab);
  const counts: Record<TabId, number> = {
    todos: base.length,
    educacao: 0,
    "gestao-publica": 0,
    contratacoes: 0,
    saude: 0,
  };
  base.forEach((c) => {
    if (c.frente === "contratacoes") counts.contratacoes++;
    else if (c.vertical === "gestao-publica") counts["gestao-publica"]++;
    else if (c.vertical === "educacao") counts.educacao++;
    else if (c.vertical === "saude") counts.saude++;
  });
  return counts;
}

function compactRange(cur: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (cur > 3) out.push("…");
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) out.push(p);
  if (cur < total - 2) out.push("…");
  out.push(total);
  return out;
}

interface Chip {
  key: keyof FiltersState | "search";
  label: string;
  vertClass?: string; // chip-vert-edu | chip-vert-gov | chip-vert-cpr | chip-vert-sau
}

function buildChips(f: FiltersState): Chip[] {
  const chips: Chip[] = [];
  if (f.tab !== "todos") {
    const label =
      f.tab === "contratacoes"
        ? "Contratações Públicas · Frente NTC GP"
        : TAB_LABELS[f.tab];
    const vertClass =
      f.tab === "educacao"
        ? "chip-vert-edu"
        : f.tab === "gestao-publica"
        ? "chip-vert-gov"
        : f.tab === "contratacoes"
        ? "chip-vert-cpr"
        : "chip-vert-sau";
    chips.push({ key: "tab", label, vertClass });
  }
  if (f.area) chips.push({ key: "area", label: `Área: ${AREA_LABELS[f.area] ?? f.area}` });
  if (f.tipo) chips.push({ key: "tipo", label: `Vínculo: ${TIPO_LABELS[f.tipo] ?? f.tipo}` });
  if (f.programa) chips.push({ key: "programa", label: `Programa: ${f.programa}` });
  if (f.formacao) chips.push({ key: "formacao", label: `Formação: ${f.formacao}` });
  if (f.atuacao) chips.push({ key: "atuacao", label: `Atuação: ${f.atuacao}` });
  if (f.search) chips.push({ key: "search", label: `Busca: "${f.search}"` });
  return chips;
}

function readFiltersFromURL(): FiltersState {
  if (typeof window === "undefined") return { ...DEFAULT_FILTERS };
  const p = new URLSearchParams(window.location.search);
  const get = (k: string, def = "") => p.get(k) ?? def;
  return {
    tab: (get("tab", "todos") as TabId) || "todos",
    search: get("q"),
    area: get("area"),
    tipo: (get("tipo") as Tipo | "") || "",
    programa: get("programa"),
    formacao: get("formacao"),
    atuacao: get("atuacao"),
    sort: (get("sort", "editorial") as SortMode) || "editorial",
    page: parseInt(get("page", "1"), 10) || 1,
    perpage: parseInt(get("perpage", "24"), 10) || 24,
  };
}

function writeFiltersToURL(f: FiltersState): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (f.tab !== "todos") p.set("tab", f.tab);
  if (f.search) p.set("q", f.search);
  if (f.area) p.set("area", f.area);
  if (f.tipo) p.set("tipo", f.tipo);
  if (f.programa) p.set("programa", f.programa);
  if (f.formacao) p.set("formacao", f.formacao);
  if (f.atuacao) p.set("atuacao", f.atuacao);
  if (f.sort !== "editorial") p.set("sort", f.sort);
  if (f.perpage !== 24) p.set("perpage", String(f.perpage));
  if (f.page !== 1) p.set("page", String(f.page));
  const qs = p.toString();
  const newUrl = window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
  window.history.replaceState(null, "", newUrl);
}

/* ============================================================
   COMPONENT (JSX vem na Task 10)
   ============================================================ */

export function FilterBarDocentes(_props: FilterBarDocentesProps) {
  // Placeholder — JSX implementado na Task 10
  return null;
}
```

- [ ] **Step 9.2 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros. Warnings de "unused" para imports não usados no `return null` são esperados — podem ser ignorados temporariamente; serão consumidos na Task 10.

- [ ] **Step 9.3 — Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/FilterBarDocentes.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): adiciona FilterBarDocentes (helpers + pipeline)

Cria tipos FiltersState/CardLike, funções applyFilters/sortCards/
paginate/computeTabCounts/compactRange/buildChips e URL-sync
(readFiltersFromURL/writeFiltersToURL). Pipeline espelha o JS do
protótipo (linhas 3242-3725). Componente retorna null
provisoriamente; JSX vem na próxima task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10 — FilterBarDocentes Client Component (parte 2: JSX completo)

**Files:**
- Modify: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/FilterBarDocentes.tsx`

- [ ] **Step 10.1 — Substituir o `return null` por implementação completa**

Modify: substituir a função `export function FilterBarDocentes(_props: FilterBarDocentesProps) { return null; }` por:

```tsx
export function FilterBarDocentes({
  featured,
  experts,
  axisSaude,
}: FilterBarDocentesProps) {
  // 1. Estado
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [hydrated, setHydrated] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const ctx = useCorpoDocenteCtx();

  // 2. Combinar experts + axis em um único pool para a pipeline
  const allCards: CardLike[] = useMemo(
    () => [
      ...experts.map((c) => toCardLike(c, "expert")),
      ...axisSaude.map((c) => toCardLike(c, "axis")),
    ],
    [experts, axisSaude]
  );

  // 3. Derivações
  const filtered = useMemo(() => applyFilters(allCards, filters), [allCards, filters]);
  const sorted = useMemo(() => sortCards(filtered, filters.sort), [filtered, filters.sort]);
  const { visible, total, totalPages, currentPage } = useMemo(
    () => paginate(sorted, filters.page, filters.perpage),
    [sorted, filters.page, filters.perpage]
  );
  const tabCounts = useMemo(() => computeTabCounts(allCards, filters), [allCards, filters]);
  const chips = useMemo(() => buildChips(filters), [filters]);

  // 4. Hidratação inicial via URL + popstate
  useEffect(() => {
    const initial = readFiltersFromURL();
    setFilters(initial);
    setSearchInput(initial.search);
    if (
      initial.programa ||
      initial.formacao ||
      initial.atuacao ||
      initial.sort !== "editorial"
    ) {
      setAdvancedOpen(true);
    }
    setHydrated(true);

    const onPop = () => {
      const next = readFiltersFromURL();
      setFilters(next);
      setSearchInput(next.search);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // 5. URL-sync (depois da hidratação para não sobrescrever a URL com defaults)
  useEffect(() => {
    if (!hydrated) return;
    writeFiltersToURL(filters);
  }, [filters, hydrated]);

  // 6. Hero quicklinks: observar tabRequest do context
  useEffect(() => {
    if (!ctx.tabRequest) return;
    setFilters((prev) => ({ ...prev, tab: ctx.tabRequest!.id, page: 1 }));
    const el = document.getElementById("especialistas");
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 148;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [ctx.tabRequest]);

  // 7. Debounce da busca
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchInput.trim()
          ? prev
          : { ...prev, search: searchInput.trim(), page: 1 }
      );
    }, 200);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 8. Handlers
  const setTab = useCallback((tab: TabId) => {
    setFilters((prev) => ({ ...prev, tab, page: 1 }));
  }, []);

  const setField = useCallback(
    <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const removeChip = useCallback((chip: Chip) => {
    if (chip.key === "tab") setFilters((p) => ({ ...p, tab: "todos", page: 1 }));
    else if (chip.key === "search") {
      setSearchInput("");
      setFilters((p) => ({ ...p, search: "", page: 1 }));
    } else {
      setFilters((p) => ({ ...p, [chip.key]: "", page: 1 }));
    }
  }, []);

  const clearAll = useCallback(() => {
    setSearchInput("");
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    requestAnimationFrame(() => {
      const el = document.getElementById("especialistas");
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 148;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  }, []);

  // 9. Teclado para tabs
  const onTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentTab: TabId) => {
    const order: TabId[] = ["todos", "educacao", "gestao-publica", "contratacoes", "saude"];
    const idx = order.indexOf(currentTab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setTab(order[(idx + 1) % order.length]);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setTab(order[(idx - 1 + order.length) % order.length]);
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab(order[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      setTab(order[order.length - 1]);
    }
  };

  const activeFilterCount = chips.length;
  const totalCardsPool = featured.length + experts.length + axisSaude.length;

  // 10. Render
  return (
    <>
      {/* ===== FILTERBAR ===== */}
      <div
        className={`docentes-filterbar ${mobileOpen ? "is-open" : ""}`}
        id="docentes-filterbar"
        aria-label="Filtros do corpo docente"
      >
        <button
          type="button"
          className="docentes-mobile-filter-toggle"
          id="btn-mobile-filter-toggle"
          aria-expanded={mobileOpen}
          aria-controls="docentes-filters-inner"
          onClick={() => setMobileOpen((v) => !v)}
        >
          Filtros{" "}
          {activeFilterCount > 0 ? (
            <span id="mft-active-count">{activeFilterCount}</span>
          ) : null}
        </button>

        <div className="container docentes-filterbar-inner" id="docentes-filters-inner">
          <nav className="docentes-tabs-inner" role="tablist" aria-label="Área estratégica">
            {(["todos", "educacao", "gestao-publica", "contratacoes", "saude"] as TabId[]).map(
              (tab) => {
                const isActive = filters.tab === tab;
                const count = tabCounts[tab];
                const disabled = count === 0 && !isActive;
                return (
                  <button
                    key={tab}
                    type="button"
                    className={`docentes-tab ${isActive ? "is-active" : ""}`}
                    data-tab={tab}
                    role="tab"
                    aria-selected={isActive}
                    disabled={disabled}
                    onClick={() => setTab(tab)}
                    onKeyDown={(e) => onTabKeyDown(e, tab)}
                  >
                    <span className="tab-row">
                      {TAB_LABELS[tab]} <span className="tab-count">{count}</span>
                    </span>
                    {tab === "contratacoes" ? (
                      <span className="tab-microcopy">
                        Frente especializada da NTC Gestão Pública
                      </span>
                    ) : null}
                  </button>
                );
              }
            )}
          </nav>

          <div className="docentes-filters-row is-primary">
            <label className="docentes-search" aria-label="Buscar especialista">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M16 16l5 5" />
              </svg>
              <input
                id="filter-search"
                type="search"
                placeholder="Buscar por eixo, programa, credencial ou área de atuação"
                autoComplete="off"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput ? (
                <button
                  type="button"
                  id="btn-clear-search"
                  aria-label="Limpar busca"
                  onClick={() => setSearchInput("")}
                >
                  ×
                </button>
              ) : null}
            </label>

            <label className="docentes-filter">
              Área formativa
              <select
                id="filter-area"
                aria-label="Filtrar por área formativa"
                value={filters.area}
                onChange={(e) => setField("area", e.target.value)}
              >
                <option value="">Todas as áreas</option>
                {Object.entries(AREA_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Vínculo
              <select
                id="filter-tipo"
                aria-label="Filtrar por vínculo"
                value={filters.tipo}
                onChange={(e) => setField("tipo", e.target.value as Tipo | "")}
              >
                <option value="">Todos os vínculos</option>
                {(Object.entries(TIPO_LABELS) as [Tipo, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="docentes-advanced-toggle"
              id="btn-toggle-advanced"
              aria-expanded={advancedOpen}
              aria-controls="filters-advanced"
              onClick={() => setAdvancedOpen((v) => !v)}
            >
              {advancedOpen ? "Filtros avançados ▴" : "Filtros avançados ▾"}
            </button>

            <button
              type="button"
              id="btn-clear-filters"
              className={`docentes-filter-clear ${activeFilterCount === 0 ? "is-hidden" : ""}`}
              onClick={clearAll}
            >
              Limpar filtros ×
            </button>
          </div>

          <div
            className={`docentes-filters-row is-advanced ${advancedOpen ? "is-open" : ""}`}
            id="filters-advanced"
            aria-label="Filtros avançados"
          >
            <label className="docentes-filter">
              Programa
              <select
                id="filter-programa"
                aria-label="Filtrar por programa"
                value={filters.programa}
                onChange={(e) => setField("programa", e.target.value)}
              >
                <option value="">Todos os programas</option>
                {PROGRAMAS_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Formação
              <select
                id="filter-formacao"
                aria-label="Filtrar por formação"
                value={filters.formacao}
                onChange={(e) => setField("formacao", e.target.value)}
              >
                <option value="">Todas as formações</option>
                {FORMACAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Atuação
              <select
                id="filter-atuacao"
                aria-label="Filtrar por atuação"
                value={filters.atuacao}
                onChange={(e) => setField("atuacao", e.target.value)}
              >
                <option value="">Todas as atuações</option>
                {ATUACAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Ordenar
              <select
                id="filter-sort"
                aria-label="Ordenar resultados"
                value={filters.sort}
                onChange={(e) => setField("sort", e.target.value as SortMode)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="docentes-filter">
              Por página
              <select
                id="filter-perpage"
                aria-label="Itens por página"
                value={filters.perpage}
                onChange={(e) => setField("perpage", parseInt(e.target.value, 10) || 24)}
              >
                {PERPAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="docentes-chips" id="docentes-chips" aria-live="polite" aria-label="Filtros ativos">
            {chips.map((c, i) => (
              <span key={`${c.key}-${i}`} className={`docentes-chip ${c.vertClass ?? ""}`}>
                {c.label}
                <button
                  type="button"
                  aria-label={`Remover filtro ${c.label}`}
                  onClick={() => removeChip(c)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SEÇÃO ESPECIALISTAS ===== */}
      <section className="section" id="especialistas" aria-label="Curadoria docente do Grupo NTC">
        <div className="container">
          <div
            className="section-head fade-in"
            style={{ textAlign: "left", maxWidth: "none", marginBottom: "var(--space-4)" }}
          >
            <span className="curadoria-pill">
              Curadoria científica · Em estruturação contínua
            </span>
            <p className="eyebrow">Corpo docente do Grupo NTC</p>
            <h2
              style={{ textAlign: "left" }}
              dangerouslySetInnerHTML={{
                __html:
                  "Especialistas que conectam <em>política pública, gestão institucional e prática de rede</em>",
              }}
            />
          </div>

          <div className="docentes-results-head">
            <p className="docentes-results-counter" aria-live="polite">
              Exibindo <strong id="docentes-counter-shown">{visible.length}</strong> de{" "}
              <strong id="docentes-counter-total">{total}</strong> especialistas
            </p>
          </div>

          {/* Destaques institucionais (fora da pipeline) */}
          <p className="experts-marker">Destaques institucionais da curadoria</p>
          <div className="experts-featured fade-in">
            {featured.map((f) => (
              <article
                key={f.cmsLink}
                className="expert-featured-card"
                data-vertical={f.vertical}
                data-area={f.area}
                data-tipo={f.tipo}
                data-frente={f.frente}
                data-programas={f.programas}
                data-formacao={f.formacao}
                data-atuacao={f.atuacao}
                data-cms-link={f.cmsLink}
                data-name={f.nome}
              >
                <div className="efc-portrait">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.imagemSrc} alt={f.imagemAlt} loading="lazy" />
                  <span className="efc-axis-badge">{f.axisBadge}</span>
                </div>
                <div className="efc-info">
                  <span className="efc-tag">{f.tag}</span>
                  <h4>{f.nome}</h4>
                  <p className="efc-credential">{f.credencial}</p>
                  <div className="efc-meta">
                    <span dangerouslySetInnerHTML={{ __html: f.metaAtuacao }} />
                    <span dangerouslySetInnerHTML={{ __html: f.metaEixos }} />
                  </div>
                  <a className="efc-link" href={f.ctaHref}>
                    {f.ctaRotulo} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Grade principal — experts + axis-saúde filtrados */}
          <p className="experts-marker">Especialistas convidados · Por eixo formativo</p>
          <div className="experts-authority-grid" id="docentes-grid">
            {visible.map((card) =>
              card.kind === "expert" ? (
                <ExpertAuthorityCard key={card.cmsLink} c={card.original as CardExpert} />
              ) : (
                <AxisCard key={card.cmsLink} c={card.original as CardAxis} />
              )
            )}
          </div>

          {/* Empty state */}
          <div
            className={`docentes-empty ${total === 0 ? "is-visible" : ""}`}
            id="docentes-empty"
          >
            <p>Nenhum especialista encontrado para os filtros selecionados.</p>
            <button type="button" id="empty-clear" onClick={clearAll}>
              Limpar filtros
            </button>
          </div>

          {/* Paginação */}
          {totalPages > 1 ? (
            <div className="docentes-pagination" id="docentes-pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                ←
              </button>
              {compactRange(currentPage, totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="pg-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={p === currentPage ? "is-current" : ""}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                →
              </button>
            </div>
          ) : null}

          {/* Contadores institucionais */}
          <div
            className="experts-counters fade-in"
            aria-label="Indicadores institucionais da curadoria"
          >
            {CONTADORES.map((c) => (
              <div key={c.label} className="experts-counter">
                <span className="ec-num">
                  {c.num}
                  {c.sufixoOuro ? (
                    <span
                      style={{
                        fontSize: 18,
                        color: "var(--dourado)",
                        marginLeft: 2,
                      }}
                    >
                      {c.sufixoOuro}
                    </span>
                  ) : null}
                </span>
                <span className="ec-lbl">
                  {c.label}
                  {c.asterisco ? (
                    <sup
                      style={{
                        fontSize: 11,
                        color: "var(--dourado)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      *
                    </sup>
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          {/* Nota 122+ */}
          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: 11.5,
              letterSpacing: "1.3px",
              textTransform: "uppercase",
              color: "var(--dourado)",
              margin: "var(--space-2) 0 0",
            }}
          >
            <strong style={{ color: "var(--dourado)" }}>*</strong>{" "}
            {NOTAS.indicador122.rotulo.replace(/^\*\s*/, "")}
          </p>
          <p
            style={{
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 15,
              color: "var(--grafite)",
              margin: "6px 0 0",
              maxWidth: 920,
              lineHeight: 1.55,
            }}
            dangerouslySetInnerHTML={{ __html: NOTAS.indicador122.texto }}
          />

          {/* Nota seleção operacional */}
          <p
            style={{
              textAlign: "left",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: 16,
              color: "var(--grafite)",
              margin: "var(--space-4) 0 0",
              maxWidth: 920,
            }}
            dangerouslySetInnerHTML={{ __html: NOTAS.selecaoOperacional }}
          />

          {/* Suprimir variável não usada */}
          {void totalCardsPool}
        </div>
      </section>
    </>
  );
}

/* ============================================================
   SUBCOMPONENTES DE CARD
   ============================================================ */

function ExpertAuthorityCard({ c }: { c: CardExpert }) {
  return (
    <article
      className="expert-authority-card"
      data-vertical={c.vertical}
      data-area={c.area}
      data-tipo={c.tipo}
      data-frente={c.frente}
      data-programas={c.programas}
      data-formacao={c.formacao}
      data-atuacao={c.atuacao}
      data-cms-link={c.cmsLink}
      data-name={c.nome}
    >
      <div className="eac-portrait">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.imagemSrc} alt={c.imagemAlt} loading="lazy" />
        <span className="eac-axis-badge">{c.axisBadge}</span>
        <span className="eac-tipo-tag">{c.tipoTag}</span>
      </div>
      <div className="eac-info">
        <h4>{c.nomeExibido}</h4>
        <p className="eac-credential">{c.credencial}</p>
        <p className="eac-programs">
          {c.programasTexto} · <strong>{c.programasStrong}</strong>
          {c.sufixoPrograma ?? ""}
        </p>
        <a className="eac-link" href={c.ctaHref}>
          {c.ctaRotulo} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

function AxisCard({ c }: { c: CardAxis }) {
  return (
    <article
      className="expert-authority-card is-axis-card"
      data-vertical={c.vertical}
      data-area={c.area}
      data-tipo={c.tipo}
      data-frente={c.frente}
      data-programas={c.programas}
      data-cms-link={c.cmsLink}
      data-name={c.nome}
      style={
        {
          "--vertical-accent": c.styleAccent,
          "--vertical-accent-dark": c.styleAccentDark,
        } as React.CSSProperties
      }
    >
      <div className="eac-portrait" style={{ aspectRatio: "4/5" }}>
        <div className="eac-icon-wrap">
          <svg
            className="eac-icon"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={c.iconePath} />
          </svg>
        </div>
        <span className="eac-axis-tag">{c.axisTag}</span>
      </div>
      <div className="eac-info">
        <h4>{c.titulo}</h4>
        <p className="eac-credential">{c.credencial}</p>
        <p className="eac-programs">
          {c.programasTexto} · <strong>{c.programasStrong}</strong>
        </p>
        <a className="eac-link" href={c.ctaHref}>
          {c.ctaRotulo} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
```

Notas de implementação:

- A linha `{void totalCardsPool}` evita warning de variável não usada. Se o lint reclamar mesmo assim, remover a declaração de `totalCardsPool` (foi planejada caso surja necessidade do "Exibindo X de Y do total").
- `import type React` para `React.CSSProperties` e `React.KeyboardEvent` — adicionar `import type * as React from "react";` no topo se TypeScript reclamar; geralmente `react` já está importado implicitamente em arquivos `.tsx`.

- [ ] **Step 10.2 — Adicionar `import type` se necessário**

Modify: topo de `FilterBarDocentes.tsx`, garantir que tenha:

```ts
import type { CSSProperties, KeyboardEvent } from "react";
```

Substituir `React.CSSProperties` por `CSSProperties` e `React.KeyboardEvent<HTMLButtonElement>` por `KeyboardEvent<HTMLButtonElement>` no código.

- [ ] **Step 10.3 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros.

- [ ] **Step 10.4 — Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/FilterBarDocentes.tsx
git commit -m "$(cat <<'EOF'
feat(corpo-docente): completa JSX do FilterBarDocentes

Adiciona filterbar (tabs com keyboard nav + counts dinâmicos, busca
debounced, selects, advanced toggle, chips removíveis, clear-all,
mobile toggle) e seção #especialistas (4 cards featured fixos +
grade filtrada com experts e axis-saúde, empty state, paginação
compacta, contadores institucionais, notas editoriais). URL-sync
via history.replaceState. Hidratação inicial via URL search params.
Integração com CorpoDocenteContext para hero quicklinks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11 — page.tsx do servidor (junta tudo)

**Files:**
- Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx`

- [ ] **Step 11.1 — Criar `page.tsx`**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/page.tsx`

```tsx
import type { Metadata } from "next";

import { CorpoDocenteProvider } from "./CorpoDocenteContext";
import { FadeInObserver } from "./FadeInObserver";
import { FaqAcordeao } from "./FaqAcordeao";
import { FilterBarDocentes } from "./FilterBarDocentes";
import { StickyCtaMobile } from "./StickyCtaMobile";
import {
  CARDS_AXIS_SAUDE,
  CARDS_EXPERTS,
  CARDS_FEATURED,
  CREDENCIAMENTO,
  CREDIBILIDADE,
  CTA_FINAL,
  FAQ,
  HERO,
  MANIFESTO,
  METRICAS,
  STICKY_CTA,
} from "./conteudoCorpoDocente";
import { HeroQuicklinks } from "./HeroQuicklinks";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corpo Docente · Grupo NTC",
  description:
    "Curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação.",
};

function html(s: string) {
  return { __html: s };
}

export default function CorpoDocentePage() {
  return (
    <CorpoDocenteProvider>
      <main id="main">
        {/* ===== 1. HERO ===== */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Corpo Docente">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              <a href={HERO.crumb.home.href}>{HERO.crumb.home.rotulo}</a>
              <span className="sep" aria-hidden="true" />
              <a href={HERO.crumb.parent.href}>{HERO.crumb.parent.rotulo}</a>
              <span className="sep" aria-hidden="true" />
              <span className="current">{HERO.crumb.current}</span>
            </nav>

            <p className="eyebrow gold">{HERO.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={html(HERO.titulo)} />
            <p
              className="hero-page-sub"
              dangerouslySetInnerHTML={html(HERO.subtitulo)}
            />

            <HeroQuicklinks items={HERO.quicklinks} />
          </div>
        </section>

        {/* ===== 2. MÉTRICAS ===== */}
        <section className="docentes-metrics" aria-label="Composição da curadoria docente do Grupo NTC">
          <div className="container">
            <div className="docentes-metrics-grid fade-in">
              {METRICAS.map((m) => (
                <div key={m.sublabel} className={`docentes-metric ${m.classe}`}>
                  <span className="dm-sublabel">{m.sublabel}</span>
                  <span className="dm-num">{m.num}</span>
                  <span className="dm-lbl">{m.label}</span>
                  <span className="dm-detail">{m.detalhe}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== 3. MANIFESTO ===== */}
        <section
          className="docentes-manifesto"
          aria-label="Arquitetura da curadoria docente do Grupo NTC"
        >
          <div className="container">
            <div
              className="docentes-manifesto-inner fade-in"
              style={{ textAlign: "left", maxWidth: 1080 }}
            >
              <span className="docentes-manifesto-marker">{MANIFESTO.marker}</span>
              <h2
                style={{ textAlign: "left" }}
                dangerouslySetInnerHTML={html(MANIFESTO.titulo)}
              />
              <p className="lede" style={{ marginLeft: 0, textAlign: "left" }}>
                {MANIFESTO.lede}
              </p>

              <div className="arch-grid" aria-label="Áreas estratégicas e núcleo Contratações Públicas">
                {MANIFESTO.archCards.map((c) => (
                  <article key={c.area} className="arch-card" data-area={c.area}>
                    <span className="arch-card-eyebrow">{c.eyebrow}</span>
                    <h3>{c.titulo}</h3>
                    <p>{c.descricao}</p>
                    <span className="arch-card-selo">{c.selo}</span>
                  </article>
                ))}
              </div>

              <div className="arch-camadas" aria-label="Cinco camadas de autoridade da curadoria">
                <span className="arch-camadas-head">5 camadas de autoridade</span>
                <div className="arch-camadas-grid">
                  {MANIFESTO.camadas.map((c) => (
                    <div key={c.num} className="arch-camada">
                      <span className="arch-camada-num">{c.num}</span>
                      <span className="arch-camada-title">{c.titulo}</span>
                      <span className="arch-camada-desc">{c.descricao}</span>
                    </div>
                  ))}
                </div>
              </div>

              <aside
                className="arch-callout"
                role="note"
                aria-label="Por que Contratações Públicas aparece separada"
              >
                <div className="arch-callout-mark" aria-hidden="true">
                  i
                </div>
                <div className="arch-callout-body">
                  <h4>{MANIFESTO.callout.titulo}</h4>
                  <p>{MANIFESTO.callout.descricao}</p>
                </div>
              </aside>

              <p className="arch-nota" dangerouslySetInnerHTML={html(MANIFESTO.nota)} />
            </div>
          </div>
        </section>

        {/* ===== 4. FILTERBAR + GRADE DE ESPECIALISTAS ===== */}
        <FilterBarDocentes
          featured={CARDS_FEATURED}
          experts={CARDS_EXPERTS}
          axisSaude={CARDS_AXIS_SAUDE}
        />

        {/* ===== 5. CREDIBILIDADE ===== */}
        <section
          className="docentes-credibilidade"
          aria-label="Credibilidade institucional do Instituto NTC do Brasil"
        >
          <div className="container">
            <div className="docentes-credibilidade-inner fade-in">
              <p className="eyebrow light">{CREDIBILIDADE.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={html(CREDIBILIDADE.titulo)} />
              <p className="lede">{CREDIBILIDADE.lede}</p>

              <div className="credibilidade-grid">
                {CREDIBILIDADE.items.map((it) => (
                  <div key={it.label} className="credibilidade-item">
                    <span className="ci-num">{it.num}</span>
                    <span className="ci-lbl">{it.label}</span>
                    <span className="ci-detail">{it.detalhe}</span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  marginTop: "var(--space-4)",
                  fontFamily: "var(--font-cond)",
                  fontSize: 12.5,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                  color: "var(--pergaminho-80)",
                  textAlign: "center",
                }}
                dangerouslySetInnerHTML={html(CREDIBILIDADE.rodape)}
              />
            </div>
          </div>
        </section>

        {/* ===== 6. CREDENCIAMENTO ===== */}
        <section
          className="cta-credenciamento"
          id="credenciamento"
          aria-label="Credenciamento de especialistas para o Grupo NTC"
        >
          <div className="container">
            <div className="cta-credenciamento-inner fade-in">
              <div className="cta-credenciamento-body">
                <p className="eyebrow gold">{CREDENCIAMENTO.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={html(CREDENCIAMENTO.titulo)} />
                <p>{CREDENCIAMENTO.descricao}</p>
                <ul>
                  {CREDENCIAMENTO.lista.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <div className="cta-credenciamento-actions">
                  {CREDENCIAMENTO.ctas.map((c) => (
                    <a
                      key={c.rotulo}
                      className={`btn btn--${c.variante}`}
                      href={c.href}
                    >
                      {c.rotulo}
                      {c.variante === "gold" ? <span className="btn-arrow">→</span> : null}
                    </a>
                  ))}
                </div>
              </div>

              <aside className="cta-credenciamento-aside">
                <p className="cta-credenciamento-aside-eyebrow">
                  {CREDENCIAMENTO.aside.eyebrow}
                </p>
                <h3>{CREDENCIAMENTO.aside.titulo}</h3>
                <p>{CREDENCIAMENTO.aside.intro}</p>
                <ul className="checklist">
                  {CREDENCIAMENTO.aside.checklist.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--grafite)",
                    marginTop: "var(--space-2)",
                  }}
                >
                  {CREDENCIAMENTO.aside.nota}
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* ===== 7. FAQ ===== */}
        <FaqAcordeao items={FAQ} />

        {/* ===== 8. CTA FINAL ===== */}
        <section
          className="docentes-cta-final"
          aria-label="Chamadas institucionais por área e composição docente"
        >
          <div className="container">
            <div className="docentes-cta-final-inner fade-in">
              <p className="eyebrow light">{CTA_FINAL.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={html(CTA_FINAL.titulo)} />
              <p>{CTA_FINAL.descricao}</p>

              <div
                className="docentes-cta-final-actions"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <a
                  className={`btn btn--${CTA_FINAL.ctaPrincipal.variante}`}
                  href={CTA_FINAL.ctaPrincipal.href}
                >
                  {CTA_FINAL.ctaPrincipal.rotulo}{" "}
                  <span className="btn-arrow">→</span>
                </a>
                <a
                  className={`btn btn--${CTA_FINAL.ctaSecundario.variante}`}
                  href={CTA_FINAL.ctaSecundario.href}
                >
                  {CTA_FINAL.ctaSecundario.rotulo}
                </a>
              </div>

              <p
                style={{
                  fontFamily: "var(--font-cond)",
                  fontSize: 11.5,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  color: "var(--dourado-soft)",
                  margin: "var(--space-3) 0 var(--space-2)",
                }}
              >
                {CTA_FINAL.separadorAreas}
              </p>

              <div
                className="docentes-cta-final-areas"
                style={{ marginTop: "var(--space-2)" }}
              >
                {CTA_FINAL.ctasArea.map((c) => (
                  <a
                    key={c.rotulo}
                    className="btn btn--ghost-light btn--mini"
                    href={c.href}
                  >
                    {c.rotulo}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== AUXILIARES (fora do <main>) ===== */}
      <StickyCtaMobile rotulo={STICKY_CTA.rotulo} href={STICKY_CTA.href} />
      <FadeInObserver />
    </CorpoDocenteProvider>
  );
}
```

- [ ] **Step 11.2 — Criar `HeroQuicklinks.tsx` (client component pequeno)**

Create: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/HeroQuicklinks.tsx`

```tsx
"use client";

import type { HERO as HERO_TYPE } from "./conteudoCorpoDocente";
import { useCorpoDocenteCtx } from "./CorpoDocenteContext";

type QuicklinkItem = (typeof HERO_TYPE)["quicklinks"][number];

interface HeroQuicklinksProps {
  items: QuicklinkItem[];
}

export function HeroQuicklinks({ items }: HeroQuicklinksProps) {
  const ctx = useCorpoDocenteCtx();

  return (
    <div className="hero-quicklinks" aria-label="Navegação rápida por área">
      {items.map((q) =>
        q.tipo === "anchor" ? (
          <a key={q.rotulo} href={q.href}>
            {q.rotulo}
          </a>
        ) : (
          <button
            key={q.rotulo}
            type="button"
            onClick={() => ctx.requestTab(q.vertShortcut)}
          >
            {q.rotulo}
          </button>
        )
      )}
    </div>
  );
}
```

Nota: `typeof HERO_TYPE` é apenas para extrair o tipo do array; em runtime o `HERO` não é importado neste arquivo. Se o TypeScript reclamar, criar tipo nomeado em `conteudoCorpoDocente.ts`:

```ts
export type Quicklink =
  | { tipo: "anchor"; rotulo: string; href: string }
  | { tipo: "tab"; rotulo: string; vertShortcut: TabId };
```

E mudar `HERO.quicklinks` para `quicklinks: Quicklink[]`.

- [ ] **Step 11.3 — Tipar `Quicklink` em `conteudoCorpoDocente.ts` (caso necessário)**

Modify: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts` — adicionar o tipo `Quicklink` exportado e usar em `HERO.quicklinks: Quicklink[]`.

Atualizar `HeroQuicklinks.tsx` para importar `Quicklink` em vez de derivar via `typeof`.

- [ ] **Step 11.4 — Typecheck**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```
Expected: 0 erros.

- [ ] **Step 11.5 — Lint**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint
```
Expected: 0 erros. Warnings de `@next/next/no-img-element` já têm `eslint-disable` inline; não devem aparecer.

- [ ] **Step 11.6 — Build**

Run:
```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -40
```
Expected: build conclui sem erros; rota `/o-grupo/corpo-docente` aparece nas estáticas.

- [ ] **Step 11.7 — Commit**

```bash
git add apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/page.tsx apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/HeroQuicklinks.tsx apps/web/app/\(o-grupo\)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
git commit -m "$(cat <<'EOF'
feat(corpo-docente): server page.tsx + HeroQuicklinks (re-porta integral)

page.tsx renderiza as 8 seções server-side (hero, métricas,
manifesto, credibilidade, credenciamento, CTA final) e instancia
os 4 Client Components: FilterBarDocentes (filterbar + grade
filtrada), FaqAcordeao, StickyCtaMobile, FadeInObserver. Tudo
envolto em CorpoDocenteProvider para a comunicação Hero → Filterbar.
HeroQuicklinks expõe botões de tab que chamam ctx.requestTab(id).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12 — Validação local + checkpoint visual humano

**Files:** nenhum modificado.

- [ ] **Step 12.1 — Subir dev server**

Run (em background ou em outro terminal):
```bash
cd /Users/joao/Documents/portal-ntc && pnpm dev
```
Expected: server escutando em `http://localhost:3000`.

- [ ] **Step 12.2 — Smoke check via curl**

Run:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/o-grupo/corpo-docente
```
Expected: `200`.

- [ ] **Step 12.3 — Smoke functional checklist (executado/guiado ao usuário)**

Abrir `http://localhost:3000/o-grupo/corpo-docente` no navegador e:

1. Hero visível com crumb "Grupo NTC › O Grupo › Corpo Docente".
2. 4 métricas (60 / 31 / 31 / 5 frentes) com cores corretas (azul / vermelho / dourado / oliva).
3. Manifesto com 4 cards + 5 camadas + callout azul claro.
4. Filterbar sticky aparece logo acima de #especialistas. Tabs com contadores reais.
5. Clicar tab "Educação" → cards mudam, contador atualiza, URL ganha `?tab=educacao`.
6. Digitar "Karnal" na busca → após 200ms, filtra para 1 card, chip de busca aparece.
7. Abrir "Filtros avançados" → linha extra desce; selecionar programa "LIDERA" → cards filtram.
8. Remover chip "Programa: LIDERA" via × → filtro zera.
9. Clicar "Limpar filtros ×" → tudo volta ao default.
10. Recarregar com `http://localhost:3000/o-grupo/corpo-docente?tab=saude` → tab Saúde já ativa.
11. Abrir/fechar 1 item do FAQ → animação de altura, ícone gira/muda.
12. Em viewport mobile (375px no DevTools), scroll > 800px → barra fixa "Solicitar proposta institucional" aparece. Clicar × → some.
13. Hero quicklink "Gestão Pública" → rola para #especialistas com tab GP ativada.
14. Paginação: se houver mais de 24 cards filtrados, clicar "→" → próxima página, rola suave.

- [ ] **Step 12.4 — Comparação visual lado a lado**

Conforme `memory/feedback_validacao_visual.md`: deixar o servidor no ar, abrir lado a lado:
- Esquerda: `http://localhost:3000/o-grupo/corpo-docente`
- Direita: `file:///Users/joao/Documents/portal-ntc/25_Pagina_Corpo_Docente_v1.html`

Pedir validação visual humana ao usuário. Reportar quaisquer discrepâncias e ajustar conteúdo/CSS antes de declarar concluído.

- [ ] **Step 12.5 — Se houver discrepâncias, corrigir + commit + reabrir checkpoint**

Loop até validação aprovada.

---

## Task 13 — Encerramento

**Files:** nenhum modificado (apenas housekeeping).

- [ ] **Step 13.1 — Resumo da sessão (≤10 linhas) ao usuário**

Informar:
- Arquivos criados (CSS, conteudo, 5 client components, page.tsx).
- Confirmação de que `pnpm typecheck`, `pnpm lint`, `pnpm build` passam.
- Smoke functional checklist passou (com items específicos validados).
- Pendências (se houver): rotas `/contato` que não existem ainda; eventual TODO sobre `ctaHref` de cards apontando para `#`.

- [ ] **Step 13.2 — Considerar atualização de memória**

Se algo novo emergiu (padrão, gotcha, decisão de arquitetura), considerar atualizar `memory/`. Exemplos potenciais:
- "Para porta de páginas com pipeline de filtros, FilterBarXxx renderiza a grade inteira; cards featured ficam fora do filtro."
- "URL-sync de listagens client-side usa `window.history.replaceState` para não disparar re-render do server component."

Se nada novo, pular.

---

## Self-Review (executado durante a escrita do plano)

**Spec coverage:**
- Seção 1 (Contexto): coberto pela Task 0 e descrito em todos os commits.
- Seção 2 (Diagnóstico): Task 1 (apaga) + Task 2 (CSS) + Task 9-10 (filterbar) + Task 6 (FAQ) + Task 7 (sticky) + Task 8 (fade-in) endereçam cada gap.
- Seção 3 (Documentos de referência): Task 0 valida HTML; demais tasks referenciam linhas.
- Seção 4 (Arquitetura de arquivos): Task 1 reset + Tasks 2-11 criam os arquivos listados.
- Seção 5 (Estrutura do page.tsx): Task 11.
- Seção 6 (Estrutura de `conteudoCorpoDocente.ts`): Tasks 3 e 5.
- Seção 7 (Client Components): Tasks 4, 6, 7, 8, 9, 10.
- Seção 8 (CSS): Task 2.
- Seção 9 (Validação): Task 12.

**Placeholder scan:**
- "PORTAR ..." aparece em Tasks 3 e 5 como instrução explícita para o engineer ler o HTML e copiar literalmente — é parte do método "porta do HTML" do projeto, não placeholder de plano.

**Type consistency:**
- `FiltersState` definido na Task 9 é usado em Task 10. ✓
- `CardLike.tipo: Tipo` consistente com `CardExpert.tipo: Tipo`. ✓
- `requestTab(id: TabId)` em Task 4 alinhado com chamada em Task 11 (`HeroQuicklinks`). ✓
- `Quicklink` discriminated union: Task 11.3 ajusta `conteudoCorpoDocente.ts` para exportar o tipo, então `HeroQuicklinks` importa. ✓
