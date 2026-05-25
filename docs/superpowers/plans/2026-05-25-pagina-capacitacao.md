# Página Capacitação NTC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente o protótipo `27_Pagina_Capacitacao_v1.html` (~2.779 linhas) para a rota `/capacitacao` dentro do route group `(capacitacao)` já existente, preservando 100% do visual, das 16 seções editoriais (hero, 5 métricas, subnav sticky, manifesto, 3 pilares, 3 verticais com programas linkados, 4 modalidades, vs-soluções, 3 formatos, 5 eixos, curadoria, EventOn, 6 próximos eventos com filtro, 2 caminhos, 8 FAQs, CTA final 3 cards-ponte) e da interatividade (subnav sticky com active anchor, filtro de próximos eventos por vertical, FAQ accordion, sticky CTA mobile).

**Architecture:** Estratégia "porta do HTML" consolidada (10ª aplicação): CSS literal extraído para `apps/web/app/capacitacao-prototipo.css` (importado no root layout), `page.tsx` server component renderiza JSX literal das 16 seções, `conteudoCapacitacao.ts` armazena tipos + todas as constantes textuais, 4 client components (`SubnavStickyCapacitacao`, `ProximosEventosFiltro`, `FaqCapacitacao`, `StickyCtaCapacitacao`). Layout do route group `(capacitacao)` **já existe** (atende `/capacitacao/agenda`) — apenas adicionar a pasta `/capacitacao/` ao lado de `/agenda/`. Análise de track permanece como no-op stub.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind para classes do protótipo, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/capacitacao-prototipo.css` — CSS literal (~1.293 linhas) das linhas 156-1448 do HTML, com `url('./img/...')` → `url('/img/...')`.
- `apps/web/app/(capacitacao)/capacitacao/page.tsx` — server component, `revalidate = 3600`, JSX literal das 16 seções + sticky CTA mobile.
- `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts` — tipos + todas as constantes textuais.
- `apps/web/app/(capacitacao)/capacitacao/SubnavStickyCapacitacao.tsx` — client: sticky toggle + active anchor (rAF throttle, aria-current).
- `apps/web/app/(capacitacao)/capacitacao/ProximosEventosFiltro.tsx` — client: 4 filtros tab + 6 cards `data-vert` (all in DOM com is-hidden).
- `apps/web/app/(capacitacao)/capacitacao/FaqCapacitacao.tsx` — client: 8 itens fechados, Set<string>, dangerouslySetInnerHTML.
- `apps/web/app/(capacitacao)/capacitacao/StickyCtaCapacitacao.tsx` — client: scroll listener (rAF) + dismiss local.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./capacitacao-prototipo.css"` depois do `conteudos-prototipo.css`.

**Não tocar:**
- `apps/web/app/(capacitacao)/layout.tsx` (já existe e está correto).
- `apps/web/app/(capacitacao)/agenda/` (irmã, intocada).
- `apps/web/app/(home)/HeaderHome.tsx`, `FooterHome.tsx`, `InteracoesScroll.tsx`.

---

## Task 1: Extrair CSS literal do protótipo para `capacitacao-prototipo.css`

**Files:**
- Create: `apps/web/app/capacitacao-prototipo.css`

- [ ] **Step 1: Extrair linhas 156-1448 do HTML (conteúdo entre `<style>` e `</style>` exclusive)**

```bash
sed -n '156,1448p' /Users/joao/Documents/portal-ntc/27_Pagina_Capacitacao_v1.html > /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css
```

Expected: arquivo de ~1.293 linhas criado.

- [ ] **Step 2: Verificar tamanho**

```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css
```

Expected: `1293 .../capacitacao-prototipo.css` (ou próximo, +/- 2).

- [ ] **Step 3: Contar `url('./` antes de converter**

```bash
grep -c "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css || true
```

Anote o número — usado para validar Step 5. Se `0`, pule Step 4 e siga direto para Step 5.

- [ ] **Step 4: Converter `url('./img/...')` para `url('/img/...')`**

```bash
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css
```

- [ ] **Step 5: Verificar zero `url('./` restante**

```bash
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css || echo "OK: nenhuma ocorrência"
```

Expected: nenhuma saída além de "OK: nenhuma ocorrência".

- [ ] **Step 6: Listar imagens referenciadas e verificar que existem em `public/`**

```bash
grep -oE "url\('[^']+'\)" /Users/joao/Documents/portal-ntc/apps/web/app/capacitacao-prototipo.css | sort -u
```

Para cada URL `url('/img/...')` retornada, verificar com:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public<caminho-relativo>
```

Se algum arquivo não existir, reportar BLOCKED — não inventar caminho.

- [ ] **Step 7: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/capacitacao-prototipo.css && git commit -m "$(cat <<'EOF'
feat(capacitacao): extrai CSS literal do protótipo 27 para capacitacao-prototipo.css

Bloco <style> de 27_Pagina_Capacitacao_v1.html (linhas 156-1448) copiado
sem adaptação, com url('./img/...') convertido para url('/img/...').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `capacitacao-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Confirmar posição do `conteudos-prototipo.css`**

```bash
grep -n "prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: lista 10 imports terminando em `import "./conteudos-prototipo.css";` (linha 80 ou próxima).

- [ ] **Step 2: Adicionar `import "./capacitacao-prototipo.css"` depois do `conteudos-prototipo.css`**

Use Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx`:

old_string:
```
import "./conteudos-prototipo.css";
```

new_string:
```
import "./conteudos-prototipo.css";
// CSS da página /capacitacao (portada literal de 27_Pagina_Capacitacao_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.cap-metrics, .cap-subnav,
// .cap-manifesto, .cap-pilares, .cap-verticais, .cap-modalidades,
// .cap-vs-solucoes, .cap-formatos, .cap-eixos, .cap-curadoria,
// .cap-eventon, .cap-proximos, .cap-evento-card, .cap-caminhos,
// .cap-faq, .cap-cta-final, .sticky-cta-mobile).
import "./capacitacao-prototipo.css";
```

Se `import "./conteudos-prototipo.css";` aparece mais de uma vez (improvável), reporte BLOCKED.

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa sem erro novo.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add apps/web/app/layout.tsx && git commit -m "$(cat <<'EOF'
feat(capacitacao): importa capacitacao-prototipo.css no root layout

Carrega CSS da página /capacitacao no root para herdar a mesma estratégia
dos outros CSSs de protótipo (escopo seguro por classes específicas).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar `conteudoCapacitacao.ts` parte 1 (tipos + hero + métricas + subnav + manifesto + pilares)

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Criar a pasta**

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao"
```

- [ ] **Step 2: Criar o arquivo com tipos + parte 1 dos exports**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /CAPACITACAO
//  Porta de 27_Pagina_Capacitacao_v1.html (linhas 1619-2403 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs / Discriminantes -----------------

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

// ----------------- Interfaces das seções -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export interface MetricaCap {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}

export interface SubnavLink {
  texto: string;
  href: string;
  cmsLink: string;
}

export interface PilarCap {
  num: string;
  titulo: string;
  descricao: string;
  rule: string;
}

// ----------------- HERO -----------------

export const heroCrumbs: CrumbItem[] = [
  { texto: "Grupo NTC", href: "/" },
  { texto: "Capacitação institucional", current: true },
];

export const heroEyebrow = "Ecossistema formativo · 2026";

export const heroH1 = `Capacitação institucional <span class="accent">de alto nível</span><br>para a administração pública brasileira.`;

export const heroSub =
  "O Grupo NTC estrutura programas, eventos e jornadas formativas para órgãos públicos, redes de ensino, sistemas de saúde e equipes de gestão — combinando curadoria científica, excelência docente, tecnologia própria e segurança institucional em cada entrega.";

export const heroQuicklinks: LinkInterno[] = [
  { texto: "Verticais", href: "#verticais", track: "hero_quicklink", cmsLink: "quicklink-verticais" },
  { texto: "Modalidades", href: "#modalidades", track: "hero_quicklink", cmsLink: "quicklink-modalidades" },
  { texto: "Formatos", href: "#formatos", track: "hero_quicklink", cmsLink: "quicklink-formatos" },
  { texto: "Curadoria", href: "#curadoria", track: "hero_quicklink", cmsLink: "quicklink-curadoria" },
  { texto: "Agenda", href: "#proximos", track: "hero_quicklink", cmsLink: "quicklink-agenda" },
];

// ----------------- MÉTRICAS (5) -----------------

export const metricasCapacitacao: MetricaCap[] = [
  {
    num: "20+",
    lbl: "Anos de história",
    detail: "Capacitação contínua de quadros da administração pública",
  },
  {
    num: "15",
    lbl: "Programas estratégicos",
    detail: "9 Educação · 3 Gestão Pública · 3 Saúde",
  },
  {
    num: "500+",
    lbl: "Eventos realizados",
    detail: "300+ presenciais · 200+ online · híbridos",
  },
  {
    num: "400 mil+",
    lbl: "Agentes formados",
    detail: "Servidores, dirigentes e equipes técnicas atendidos",
  },
  {
    num: "Alta",
    numClasseExtra: "cm-num--word",
    lbl: "Satisfação",
    detail: "Avaliações consistentes em eventos presenciais, online e híbridos",
  },
];

// ----------------- SUBNAV -----------------

export const subnavLabel = "Nesta página";

export const subnavLinks: SubnavLink[] = [
  { texto: "Verticais", href: "#verticais", cmsLink: "subnav-verticais" },
  { texto: "Modalidades", href: "#modalidades", cmsLink: "subnav-modalidades" },
  { texto: "Formatos", href: "#formatos", cmsLink: "subnav-formatos" },
  { texto: "Curadoria", href: "#curadoria", cmsLink: "subnav-curadoria" },
  { texto: "EventOn", href: "#eventon", cmsLink: "subnav-eventon" },
  { texto: "Agenda", href: "#proximos", cmsLink: "subnav-agenda" },
];

// ----------------- MANIFESTO -----------------

export const manifestoEyebrow = "Como pensamos a capacitação institucional";
export const manifestoH2 = `Não é treinamento. É <em>formação de Estado</em>.`;
export const manifestoLede =
  "Para a NTC, capacitar servidores não é apenas transmitir conteúdo. É fortalecer a capacidade do Estado de planejar, decidir, contratar, executar, avaliar e entregar políticas públicas com consistência técnica.";
export const manifestoP =
  "Por isso a NTC não opera treinamentos avulsos. Estruturamos <strong>programas estratégicos</strong> — linhas formativas longas, conectadas à doutrina, ao direito vigente e aos desafios concretos das redes, dos órgãos e dos territórios — entregues em modalidades, formatos e eixos articulados pela mesma curadoria científica.";
export const manifestoMarker = "Ecossistema formativo NTC · 2026";

// ----------------- PILARES (3) -----------------

export const pilaresEyebrow = "Como entregamos";
export const pilaresH2 = `Conteúdo, curadoria <em>e entrega institucional</em>.`;
export const pilaresIntro =
  "A formação NTC combina programas estratégicos, especialistas reconhecidos e operação orientada à realidade dos órgãos públicos brasileiros.";

export const pilaresCapacitacao: PilarCap[] = [
  {
    num: "I",
    titulo: "Programas estratégicos",
    descricao:
      "Linhas formativas longas, articuladas à doutrina, ao direito vigente e aos desafios reais das redes, dos órgãos e dos territórios.",
    rule: "15 programas · 3 verticais",
  },
  {
    num: "II",
    titulo: "Curadoria científica",
    descricao:
      "Rede curada de especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional.",
    rule: "Critério editorial · não catálogo",
  },
  {
    num: "III",
    titulo: "Entrega institucional",
    descricao:
      "Operação executiva orientada ao servidor público — turmas dedicadas, EventOn, materiais editoriais, certificação e relatórios ao contratante.",
    rule: "Plataforma própria · segurança institucional",
  },
];
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): cria conteudoCapacitacao.ts (parte 1) com hero+métricas+subnav+manifesto+pilares

Tipos VerticalCapacitacao, TipoVsBlock, CaminhoTipo, LinkInterno, CrumbItem,
MetricaCap, SubnavLink, PilarCap. Constantes heroCrumbs (2), heroEyebrow,
heroH1 (com <span class="accent">), heroSub, heroQuicklinks (5),
metricasCapacitacao (5, uma com cm-num--word), subnavLabel + subnavLinks (6),
manifestoEyebrow/H2/Lede/P/Marker, pilaresEyebrow/H2/Intro + pilaresCapacitacao (3).

Próximos commits adicionam verticais, modalidades, vs, formatos, eixos,
curadoria, eventon, eventos, caminhos, faq, cta, sticky.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `conteudoCapacitacao.ts` parte 2 — verticais + modalidades + vs + formatos

**Files:**
- Modify: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Adicionar interfaces e constantes ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`.

old_string (último item de pilaresCapacitacao fechando):
```
  {
    num: "III",
    titulo: "Entrega institucional",
    descricao:
      "Operação executiva orientada ao servidor público — turmas dedicadas, EventOn, materiais editoriais, certificação e relatórios ao contratante.",
    rule: "Plataforma própria · segurança institucional",
  },
];
```

new_string:
```
  {
    num: "III",
    titulo: "Entrega institucional",
    descricao:
      "Operação executiva orientada ao servidor público — turmas dedicadas, EventOn, materiais editoriais, certificação e relatórios ao contratante.",
    rule: "Plataforma própria · segurança institucional",
  },
];

// ----------------- VERTICAIS (3) -----------------

export interface VerticalItemPrograma {
  textoHtml: string;
  href: string;
  cmsLink: string;
}

export interface CardVerticalCap {
  vert: VerticalCapacitacao;
  bandMark: string;
  bandNum: string;
  titulo: string;
  descricao: string;
  contagem: string;
  programas: VerticalItemPrograma[];
  link: LinkInterno;
}

export const verticaisEyebrow = "As três verticais formativas";
export const verticaisH2 = `Cada vertical, um <em>recorte editorial próprio</em> da administração pública.`;
export const verticaisIntro =
  "A oferta formativa do Grupo NTC se organiza em três verticais especializadas. Cada uma reúne programas estratégicos articulados por uma curadoria científica dedicada — e cada uma fala diretamente com o seu público de carreira pública.";

export const cardsVerticaisCapacitacao: CardVerticalCap[] = [
  {
    vert: "edu",
    bandMark: "NTC Educação",
    bandNum: "01",
    titulo: "Educação pública de alta performance",
    descricao:
      "Formação institucional de redes municipais e estaduais de ensino. Da alfabetização à educação integral, da gestão escolar à inclusão e à educação digital.",
    contagem: "9 programas estratégicos",
    programas: [
      { textoHtml: "<strong>PEAR</strong><span>Alfabetização</span>", href: "/programas/pear", cmsLink: "programa-PEAR" },
      { textoHtml: "<strong>EDUTEC</strong><span>Educação digital</span>", href: "/programas/edutec", cmsLink: "programa-EDUTEC" },
      { textoHtml: "<strong>PROGE</strong><span>Gestão escolar</span>", href: "/programas/proge", cmsLink: "programa-PROGE" },
      { textoHtml: "<strong>PROGIR</strong><span>Inclusão e equidade</span>", href: "/programas/progir", cmsLink: "programa-PROGIR" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
  {
    vert: "gov",
    bandMark: "NTC Gestão Pública",
    bandNum: "02",
    titulo: "Direção, governança e contratações",
    descricao:
      "Capacitação para a alta gestão da administração pública brasileira. Liderança, governança institucional, contratações e sistemas administrativos.",
    contagem: "3 programas estratégicos",
    programas: [
      { textoHtml: "<strong>LIDERA</strong><span>Direção estratégica</span>", href: "/programas/lidera", cmsLink: "programa-LIDERA" },
      { textoHtml: "<strong>AGIP</strong><span>Contratações Lei 14.133/2021</span>", href: "/programas/agip", cmsLink: "programa-AGIP" },
      { textoHtml: "<strong>SIGA</strong><span>Governança administrativa</span>", href: "/programas/siga", cmsLink: "programa-SIGA" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
  {
    vert: "sau",
    bandMark: "NTC Saúde",
    bandNum: "03",
    titulo: "Inteligência institucional para o SUS",
    descricao:
      "Formação dedicada à direção do Sistema Único de Saúde — atenção primária, redes de cuidado, gestão integrada e governança institucional do SUS.",
    contagem: "3 programas estratégicos",
    programas: [
      { textoHtml: "<strong>SIGS</strong><span>Gestão integrada SUS</span>", href: "/programas/sigs", cmsLink: "programa-SIGS" },
      { textoHtml: "<strong>PROAPS+</strong><span>Atenção Primária</span>", href: "/programas/proaps", cmsLink: "programa-PROAPS" },
      { textoHtml: "<strong>PROSUS+</strong><span>Direção institucional SUS</span>", href: "/programas/prosus", cmsLink: "programa-PROSUS" },
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "cap_vertical_click",
      classe: "link-arrow",
    },
  },
];

// ----------------- MODALIDADES (4) -----------------

export interface ModalidadeCap {
  num: string;
  titulo: string;
  descricao: string;
  lista: string[];
  contratacaoHtml: string;
  link: LinkInterno;
}

export const modalidadesEyebrow = "Modalidades estruturantes";
export const modalidadesH2 = `Quatro formas de <em>acessar a formação</em> NTC.`;
export const modalidadesIntro =
  "Cada programa estratégico pode ser entregue em quatro modalidades complementares. Você escolhe a que melhor se ajusta ao seu cenário institucional — e nós articulamos a curadoria, a docência, o formato e a logística.";

export const modalidadesCapacitacao: ModalidadeCap[] = [
  {
    num: "01",
    titulo: "Eventos abertos",
    descricao:
      "Turmas regulares organizadas pela NTC, com data, ementa e docentes definidos. Servidores e dirigentes se inscrevem individualmente ou em grupos institucionais. A modalidade ideal quando o órgão precisa formar quadros sem assumir a operação logística.",
    lista: [
      "Eventos online · presenciais · híbridos",
      "Inscrição individual ou em grupo institucional",
      "Certificado oficial NTC e EventOn",
      "Replay disponível para inscritos",
    ],
    contratacaoHtml: "<strong>Inscrição:</strong> direta no site · individual ou em grupo · com nota fiscal e empenho",
    link: {
      texto: "Ver agenda completa",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_modalidade_agenda",
      classe: "link-arrow",
    },
  },
  {
    num: "02",
    titulo: "Soluções in company",
    descricao:
      "Programa entregue exclusivamente à instituição contratante, com conteúdo, formato, calendário e docência customizados. A turma é formada apenas pelos servidores do órgão — o que permite tratar dados internos, casos e dilemas reais sem expô-los ao público externo.",
    lista: [
      "Programa-mãe customizado para o órgão",
      "Turma exclusiva · sem participantes externos",
      "Pode tratar casos internos com confidencialidade",
      "Cronograma negociado com a área demandante",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade ou dispensa, conforme a hipótese aplicável",
    link: {
      texto: "Conhecer in company",
      href: "/solucoes#in-company",
      cmsLink: "modelo-incompany",
      track: "cap_modalidade_incompany",
      classe: "link-arrow",
    },
  },
  {
    num: "03",
    titulo: "Turmas fechadas",
    descricao:
      "Edição operacional do programa-mãe, com a ementa NTC preservada, entregue a uma turma exclusiva da equipe contratante. Versão mais leve que a in company customizada — ideal quando o órgão quer formar muitos servidores no mesmo programa de catálogo.",
    lista: [
      "Ementa NTC preservada · sem customização profunda",
      "Turma dedicada · 20 a 300 servidores",
      "Pode ser online, presencial ou híbrida",
      "Logística simplificada · entrega mais rápida",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade do programa NTC",
    link: {
      texto: "Conhecer turmas fechadas",
      href: "/solucoes#turmas-fechadas",
      cmsLink: "modelo-fechada",
      track: "cap_modalidade_fechada",
      classe: "link-arrow",
    },
  },
  {
    num: "04",
    titulo: "Sob medida e trilhas curadas",
    descricao:
      "Customização profunda de ementas, módulos e formato — ou sequências formativas combinando módulos de diferentes programas NTC, articuladas pela curadoria científica em jornada coerente. A solução quando o desafio institucional não cabe em um programa standard.",
    lista: [
      "Customização profunda de conteúdo e cargas horárias",
      "Trilhas multinível · até 4 programas combinados",
      "Apoio da curadoria científica desde o briefing",
      "Ideal para carreiras públicas e formações plurianuais",
    ],
    contratacaoHtml: "<strong>Contratação:</strong> direta por inexigibilidade ou dispensa, conforme o caso",
    link: {
      texto: "Conhecer sob medida e trilhas",
      href: "/solucoes#sob-medida",
      cmsLink: "modelo-sobmedida",
      track: "cap_modalidade_sobmedida",
      classe: "link-arrow",
    },
  },
];

// ----------------- VS BLOCKS (Capacitação × Soluções) -----------------

export interface VsBlock {
  tipo: TipoVsBlock;
  eyebrow: string;
  titulo: string;
  paragrafoHtml: string;
  link: LinkInterno;
}

export const vsBlocks: VsBlock[] = [
  {
    tipo: "cap",
    eyebrow: "Capacitação",
    titulo: "O ecossistema formativo",
    paragrafoHtml:
      "<strong>Capacitação</strong> é o ecossistema formativo da NTC: agenda, programas, formatos, curadoria e experiência pedagógica — toda a oferta aberta ao mercado público, organizada nesta página-mãe.",
    link: {
      texto: "Ver Agenda Geral",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_vs_agenda",
      classe: "link-arrow",
    },
  },
  {
    tipo: "sol",
    eyebrow: "Soluções",
    titulo: "O caminho institucional dedicado",
    paragrafoHtml:
      "<strong>Soluções</strong> é o caminho institucional para demandas exclusivas: in company, turmas fechadas, trilhas e programas sob medida — com curadoria e contratação dedicadas ao órgão demandante.",
    link: {
      texto: "Conhecer Soluções Institucionais",
      href: "/solucoes",
      cmsLink: "pagina-solucoes",
      track: "cap_vs_solucoes",
      classe: "link-arrow",
    },
  },
];

// ----------------- FORMATOS (3) -----------------

export interface FormatoCap {
  num: string;
  titulo: string;
  descricao: string;
  tag: string;
}

export const formatosEyebrow = "Formatos de entrega";
export const formatosH2 = `Online, <em>híbrido</em>, presencial — onde fizer sentido para o seu cenário.`;
export const formatosIntro =
  "A NTC opera os três formatos de entrega com a mesma exigência editorial e a mesma curadoria. Diferentes momentos institucionais pedem diferentes formatos — e fazemos a recomendação técnica como parte da proposta.";

export const formatosCapacitacao: FormatoCap[] = [
  {
    num: "01",
    titulo: "Online",
    descricao:
      "Transmissão executiva ao vivo pela plataforma EventOn, com chat moderado, materiais sincronizados, gravação e certificado. Ideal para alcance nacional, agendas concentradas e formações com grandes contingentes em rede.",
    tag: "Replay · certificado · materiais",
  },
  {
    num: "02",
    titulo: "Híbrido",
    descricao:
      "Combina núcleo presencial executivo com participação remota via EventOn. Recomendado quando há núcleo dirigente em uma capital e equipe distribuída nos territórios. Mantém a experiência presencial sem excluir a rede ampliada.",
    tag: "Núcleo presencial · rede remota",
  },
  {
    num: "03",
    titulo: "Presencial",
    descricao:
      "Encontros executivos em capitais estratégicas, com docência de especialistas de referência, materiais editoriais e momentos de articulação institucional entre participantes. Ideal para públicos de direção e tomada de decisão estratégica.",
    tag: "Capitais · networking · alta gestão",
  },
];
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona VERTICAIS+MODALIDADES+VS+FORMATOS

cardsVerticaisCapacitacao (3 cards edu/gov/sau, cada um com 3-4 programas
linkados para /programas/<slug> e link para /solucoes-estrategicas/<slug>).
modalidadesCapacitacao (4 cards 01-04: eventos abertos / in company /
turmas fechadas / sob medida). vsBlocks (2: cap × sol). formatosCapacitacao
(3 cards 01-03: online / híbrido / presencial).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `conteudoCapacitacao.ts` parte 3 — eixos + curadoria + eventon

**Files:**
- Modify: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Adicionar ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`.

old_string (último item de formatosCapacitacao fechando):
```
  {
    num: "03",
    titulo: "Presencial",
    descricao:
      "Encontros executivos em capitais estratégicas, com docência de especialistas de referência, materiais editoriais e momentos de articulação institucional entre participantes. Ideal para públicos de direção e tomada de decisão estratégica.",
    tag: "Capitais · networking · alta gestão",
  },
];
```

new_string:
```
  {
    num: "03",
    titulo: "Presencial",
    descricao:
      "Encontros executivos em capitais estratégicas, com docência de especialistas de referência, materiais editoriais e momentos de articulação institucional entre participantes. Ideal para públicos de direção e tomada de decisão estratégica.",
    tag: "Capitais · networking · alta gestão",
  },
];

// ----------------- EIXOS (5) -----------------

export interface EixoCap {
  num: string;
  titulo: string;
  descricao: string;
}

export const eixosEyebrow = "Eixos formativos transversais";
export const eixosH2 = `Cinco eixos que <em>atravessam</em> todos os programas.`;
export const eixosP1 =
  "Independentemente da vertical, todos os programas NTC mobilizam ao menos um destes cinco eixos. Eles dão consistência editorial à oferta e permitem que diferentes públicos da administração pública se reconheçam no que estão fazendo.";
export const eixosImpact =
  "Cada programa fala mais de um eixo — e cada servidor encontra, em pelo menos um deles, a sua leitura.";

export const eixosCapacitacao: EixoCap[] = [
  {
    num: "01",
    titulo: "Executivo e estratégico",
    descricao:
      "Direção institucional, tomada de decisão, governança da política pública, articulação federativa e leitura de cenário. Para a alta gestão.",
  },
  {
    num: "02",
    titulo: "Técnico-jurídico",
    descricao:
      "Lei 14.133/2021, controle, integridade, contratações públicas, direito administrativo aplicado. Para áreas-meio, jurídicas e de controle.",
  },
  {
    num: "03",
    titulo: "Pedagógico-formativo",
    descricao:
      "Alfabetização, currículo, avaliação, formação de professores, inclusão e gestão pedagógica. Para áreas-fim da educação pública.",
  },
  {
    num: "04",
    titulo: "Operacional e de gestão",
    descricao:
      "Processos, rotinas, indicadores, planejamento, monitoramento, prestação de contas. Para o quadro técnico que executa a política.",
  },
  {
    num: "05",
    titulo: "Dados, IA e governança digital",
    descricao:
      "Transformação digital, governança de dados, inteligência artificial aplicada ao setor público, cibersegurança e privacidade. Eixo emergente.",
  },
];

// ----------------- CURADORIA -----------------

export const curadoriaEyebrow = "Curadoria científica";
export const curadoriaH2 = `A diferença entre treinar e <em>formar</em> está em quem ensina.`;
export const curadoriaP1 =
  "A capacitação institucional do Grupo NTC é sustentada por uma rede curada de especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional — convocados pelo encaixe técnico ao programa, à modalidade e ao público da turma.";
export const curadoriaP2 =
  "A curadoria científica não é um catálogo: é um critério editorial. Por isso publicamos a página do Corpo Docente — para que cada órgão contratante saiba, antes de contratar, quem efetivamente entregará a formação.";
export const curadoriaPills: string[] = [
  "Educação",
  "Gestão Pública",
  "Contratações Públicas",
  "Saúde",
];
export const curadoriaCtas: LinkInterno[] = [
  {
    texto: "Conhecer o corpo docente",
    href: "/o-grupo/corpo-docente",
    cmsLink: "pagina-corpo-docente",
    track: "cap_corpo_docente_click",
    classe: "btn btn--primary",
    arrow: true,
  },
  {
    texto: "Falar com a curadoria",
    href: "/contato#tab-atendimento",
    cmsLink: "atendimento-curadoria",
    track: "cap_corpo_docente_atendimento",
    classe: "btn btn--secondary",
  },
];

// ----------------- EVENTON -----------------

export interface EventonFeature {
  strong: string;
  span: string;
}

export const eventonEyebrow = "Plataforma proprietária";
export const eventonH2 = `EventOn — a plataforma <em>editorial</em> de transmissão do Grupo NTC.`;
export const eventonP1 =
  "O EventOn é a plataforma proprietária do Grupo NTC — pensada não como mera sala de webinar, mas como <strong>ambiente de experiência formativa</strong>: transmissão executiva, replay institucional, materiais editoriais, certificação dos participantes e relatórios consolidados ao órgão contratante.";
export const eventonP2 =
  "O servidor inscrito acessa um único hub — a <strong>Área do Participante</strong> — em que encontra os eventos ao vivo, os replays, os materiais oficiais e os certificados. O órgão contratante recebe os indicadores de presença, conclusão e avaliação por turma.";
export const eventonCtas: LinkInterno[] = [
  {
    texto: "Conhecer o EventOn",
    href: "/#eventon",
    cmsLink: "eventon-home",
    track: "cap_eventon_click",
    classe: "btn btn--gold",
    arrow: true,
  },
  {
    texto: "Área do Participante",
    href: "/#eventon",
    cmsLink: "area-participante",
    track: "cap_area_participante",
    classe: "btn btn--ghost-light",
  },
];

export const eventonFeatures: EventonFeature[] = [
  {
    strong: "Transmissão executiva",
    span: "Estúdio NTC com regie, chat moderado, materiais sincronizados e qualidade broadcast.",
  },
  {
    strong: "Replay institucional",
    span: "Gravação editada e disponibilizada aos inscritos pela duração contratada.",
  },
  {
    strong: "Certificado oficial",
    span: "Emissão automática com identidade NTC, registro digital e validação institucional.",
  },
  {
    strong: "Relatório ao contratante",
    span: "Presença, conclusão, avaliação e indicadores consolidados ao órgão demandante.",
  },
];
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona EIXOS+CURADORIA+EVENTON

eixosCapacitacao (5 itens 01-05). curadoriaPills (4), curadoriaCtas (2:
Corpo Docente + Falar com curadoria). eventonFeatures (4 blocos strong+span),
eventonCtas (2: Conhecer EventOn + Área do Participante).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `conteudoCapacitacao.ts` parte 4 — próximos eventos (6 cards)

**Files:**
- Modify: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Adicionar ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`.

old_string (último item de eventonFeatures fechando):
```
  {
    strong: "Relatório ao contratante",
    span: "Presença, conclusão, avaliação e indicadores consolidados ao órgão demandante.",
  },
];
```

new_string:
```
  {
    strong: "Relatório ao contratante",
    span: "Presença, conclusão, avaliação e indicadores consolidados ao órgão demandante.",
  },
];

// ----------------- PRÓXIMOS EVENTOS (6) -----------------

export interface EventoCap {
  vert: VerticalCapacitacao;
  eyebrow: string;
  prefixoHtml: string;
  titulo: string;
  data: string;
  formato: string;
  local: string;
  descricao: string;
  preco: string;
  cta: LinkInterno;
}

export interface FiltroProximos {
  value: "all" | VerticalCapacitacao;
  label: string;
}

export const proximosEyebrow = "Próximos eventos abertos";
export const proximosH2 = `Inscrições <em>em aberto</em> no calendário NTC.`;
export const proximosIntro =
  "Uma seleção dos próximos eventos abertos — turmas regulares organizadas pela NTC nas três verticais, em diferentes formatos. A agenda completa, com filtros por área, formato e período, está na página da Agenda.";
export const proximosSelo = "Eventos alimentados pela Agenda Geral NTC";

export const filtrosProximos: FiltroProximos[] = [
  { value: "all", label: "Todos" },
  { value: "edu", label: "Educação" },
  { value: "gov", label: "Gestão Pública" },
  { value: "sau", label: "Saúde" },
];

export const eventosCapacitacao: EventoCap[] = [
  {
    vert: "sau",
    eyebrow: "NTC Saúde · PROSUS+ · Brasília",
    prefixoHtml: `<span class="ev-prefix">Seminário executivo</span>`,
    titulo: "Direção institucional em saúde pública — alta gestão do SUS",
    data: "04–05 jun 2026",
    formato: "Presencial",
    local: "Brasília · DF",
    descricao:
      "Dois dias de imersão executiva sobre a alta gestão do Sistema Único de Saúde, articulando direito sanitário, financiamento e governança institucional.",
    preco: "R$ 4.890 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-PROSUS-bsb",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "edu",
    eyebrow: "NTC Educação · EDUTEC · Online",
    prefixoHtml: `<span class="ev-prefix">Módulo formativo</span>`,
    titulo: "IA generativa em sala de aula — fundamentos e aplicações",
    data: "11–13 jun 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Três encontros online sobre o uso pedagógico e ético da IA generativa por professores e coordenadores das redes públicas de ensino.",
    preco: "R$ 1.190 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-EDUTEC-m01",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "gov",
    eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
    prefixoHtml: `<span class="ev-prefix">Jornada executiva</span>`,
    titulo: "Lei 14.133/2021 — governança e integridade nas contratações",
    data: "18–20 jun 2026",
    formato: "Híbrido",
    local: "São Paulo · SP",
    descricao:
      "Jornada híbrida de três dias com núcleo presencial executivo em São Paulo e participação remota via EventOn pelas equipes técnicas das redes.",
    preco: "R$ 5.290 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "#", // TODO: rota /agenda/<slug> ainda não criada
      cmsLink: "evento-AGIP-sp",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "sau",
    eyebrow: "NTC Saúde · PROAPS+ · Online",
    prefixoHtml: `<span class="ev-prefix">Formação executiva</span>`,
    titulo: "Previne Brasil, redes territoriais e atenção primária resolutiva",
    data: "02–04 jul 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Três encontros sobre o desenho da APS contemporânea no SUS — financiamento Previne Brasil, redes territoriais e arquitetura institucional.",
    preco: "R$ 1.490 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-PROAPS",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "edu",
    eyebrow: "NTC Educação · PEAR · Brasília",
    prefixoHtml: `<span class="ev-prefix">Seminário nacional</span>`,
    titulo: "Alfabetização na idade certa — recomposição da aprendizagem",
    data: "16–17 jul 2026",
    formato: "Presencial",
    local: "Brasília · DF",
    descricao:
      "Encontro nacional dedicado à alfabetização baseada em evidências e à recomposição da aprendizagem nos anos iniciais do ensino fundamental.",
    preco: "R$ 3.890 · servidor",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-PEAR",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
  {
    vert: "gov",
    eyebrow: "NTC Gestão Pública · LIDERA · Online",
    prefixoHtml: `<span class="ev-prefix">Programa executivo</span>`,
    titulo: "Direção estratégica e governança da política pública",
    data: "30 jul – 01 ago 2026",
    formato: "Online",
    local: "EventOn · ao vivo",
    descricao:
      "Programa executivo de três encontros para dirigentes públicos sobre governança institucional, leitura estratégica de cenário e articulação federativa.",
    preco: "R$ 1.690 · individual",
    cta: {
      texto: "Ver e inscrever →",
      href: "/capacitacao/agenda#agenda-eventos",
      cmsLink: "evento-LIDERA",
      track: "cap_evento_click",
      classe: "cap-evento-link",
    },
  },
];

export const proximosFooterLink: LinkInterno = {
  texto: "Ver agenda completa",
  href: "/capacitacao/agenda",
  cmsLink: "agenda-completa",
  track: "cap_agenda_completa",
  classe: "btn btn--primary",
  arrow: true,
};
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona 6 PRÓXIMOS EVENTOS + 4 FILTROS

eventosCapacitacao com 6 cards (vert sau/edu/gov/sau/edu/gov, preservando
ordem do protótipo, com data, formato, local, preço, CTA). Cards 1-3 com
href="#" + TODO porque rotas /agenda/<slug> ainda não existem. Cards 4-6
apontam para /capacitacao/agenda#agenda-eventos. Filtros 4 (all/edu/gov/sau).
Footer link para /capacitacao/agenda.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `conteudoCapacitacao.ts` parte 5 — caminhos + FAQ

**Files:**
- Modify: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Adicionar ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`.

old_string (proximosFooterLink fechando):
```
export const proximosFooterLink: LinkInterno = {
  texto: "Ver agenda completa",
  href: "/capacitacao/agenda",
  cmsLink: "agenda-completa",
  track: "cap_agenda_completa",
  classe: "btn btn--primary",
  arrow: true,
};
```

new_string:
```
export const proximosFooterLink: LinkInterno = {
  texto: "Ver agenda completa",
  href: "/capacitacao/agenda",
  cmsLink: "agenda-completa",
  track: "cap_agenda_completa",
  classe: "btn btn--primary",
  arrow: true,
};

// ----------------- CAMINHOS (2) -----------------

export interface PassoCaminho {
  title: string;
  sub: string;
}

export interface CaminhoCap {
  tipo: CaminhoTipo;
  eyebrow: string;
  titulo: string;
  descricao: string;
  passos: PassoCaminho[];
  cta: LinkInterno;
}

export const caminhosEyebrow = "Como participar";
export const caminhosH2 = `Dois caminhos paralelos, <em>uma só curadoria</em>.`;
export const caminhosIntro =
  "A capacitação NTC pode ser acessada de duas maneiras complementares: pelo caminho do participante individual ou do grupo institucional inscrito em evento aberto, e pelo caminho da contratação institucional dedicada. Em ambos, a curadoria editorial é a mesma.";

export const caminhosCapacitacao: CaminhoCap[] = [
  {
    tipo: "participante",
    eyebrow: "Caminho A · Servidor ou grupo",
    titulo: "Quero me inscrever em um evento aberto",
    descricao:
      "O caminho do servidor individual ou da equipe institucional que se inscreve em uma turma regular da agenda NTC. Use este caminho quando a sua necessidade já está bem atendida por um programa do nosso calendário aberto.",
    passos: [
      {
        title: "Encontre o evento",
        sub: "Navegue pela Agenda Geral · filtre por área, formato e período",
      },
      {
        title: "Escolha a modalidade de inscrição",
        sub: "Individual com cartão · ou em grupo institucional com nota fiscal e empenho",
      },
      {
        title: "Inscreva-se",
        sub: "Pelo formulário oficial · com autofill quando vier de uma página de evento",
      },
      {
        title: "Acesse o EventOn",
        sub: "Acompanhe a turma, baixe materiais, assista ao replay, receba certificado",
      },
    ],
    cta: {
      texto: "Ver agenda completa",
      href: "/capacitacao/agenda",
      cmsLink: "agenda-completa",
      track: "cap_caminho_a",
      classe: "btn btn--primary",
      arrow: true,
    },
  },
  {
    tipo: "instituicao",
    eyebrow: "Caminho B · Órgão público",
    titulo: "Quero contratar uma formação institucional",
    descricao:
      "O caminho do órgão público que precisa formar quadros institucionais com uma turma exclusiva, customização de conteúdo ou trilha plurianual. A contratação institucional dedicada ocorre por via direta — especialmente por inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável — ou por instrumentos de parceria e cooperação, quando cabíveis.",
    passos: [
      {
        title: "Solicite o briefing",
        sub: "Conte ao atendimento institucional o cenário, o público e o objetivo formativo",
      },
      {
        title: "Receba o diagnóstico técnico",
        sub: "Em até 10 dias úteis, devolvemos a leitura técnica e a recomendação editorial",
      },
      {
        title: "Aprove a proposta",
        sub: "Programa-mãe ou customizado · turma fechada ou sob medida · escopo, prazo, valor",
      },
      {
        title: "Execução com EventOn e relatórios",
        sub: "Entrega dedicada · curadoria científica · relatórios consolidados ao órgão",
      },
    ],
    cta: {
      texto: "Solicitar proposta",
      href: "/contato#tab-proposta",
      cmsLink: "proposta-institucional",
      track: "cap_caminho_b",
      classe: "btn btn--gold",
      arrow: true,
    },
  },
];

// ----------------- FAQ (8) -----------------

export interface ItemFaqCap {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export const faqEyebrow = "Perguntas frequentes";
export const faqH2 = `O que <em>perguntam</em> antes de contratar.`;
export const faqIntro =
  "Reunimos as oito perguntas mais comuns que recebemos sobre a capacitação institucional NTC. Se a sua dúvida não estiver aqui, o atendimento institucional responde diretamente.";

export const faqCapacitacao: ItemFaqCap[] = [
  {
    id: "cap-faq-1",
    pergunta: "Qual a diferença entre modalidade e formato?",
    respostaHtml: `<p><strong>Modalidade</strong> é a forma comercial-institucional de contratar a formação: eventos abertos, in company, turmas fechadas, sob medida ou trilhas. É a resposta à pergunta "quem é a turma?".</p>
<p><strong>Formato</strong> é como a entrega acontece operacionalmente: online, presencial ou híbrido. É a resposta à pergunta "onde a turma se encontra?".</p>
<p>Os dois eixos se combinam. Uma mesma modalidade pode ser entregue em qualquer dos três formatos — e cada órgão escolhe a combinação que melhor responde ao seu cenário.</p>`,
  },
  {
    id: "cap-faq-2",
    pergunta: "Os certificados têm validação oficial?",
    respostaHtml: `<p>Sim. Todos os certificados são emitidos pelo Instituto NTC do Brasil — instituição responsável pela curadoria, pela docência e pela operação das formações — com identidade visual NTC, registro digital único, código de validação e descrição editorial do conteúdo, das horas e da turma.</p>
<p>O certificado é emitido automaticamente pelo EventOn ao final da formação, mediante cumprimento dos critérios mínimos de presença e/ou conclusão definidos para cada evento.</p>`,
  },
  {
    id: "cap-faq-3",
    pergunta: "Como funciona o replay no EventOn?",
    respostaHtml: `<p>Todos os eventos online e híbridos são gravados, editados e disponibilizados aos inscritos pela Área do Participante. O acesso ao replay é nominal — vinculado ao CPF do servidor inscrito — e dura pela janela contratada (em geral, entre 30 e 90 dias após o último encontro).</p>
<p>Para turmas fechadas e in company, o replay pode ser estendido conforme acordo institucional. Eventos presenciais sem transmissão híbrida não geram replay público — mas podem gerar registros editoriais entregues como material da turma.</p>`,
  },
  {
    id: "cap-faq-4",
    pergunta: "Como a NTC é contratada por órgãos públicos?",
    respostaHtml: `<p>A contratação da NTC por órgãos públicos ocorre <strong>exclusivamente por via direta</strong> — inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável — ou por convênios, parcerias e instrumentos de cooperação, quando juridicamente cabíveis.</p>
<p>A NTC <strong>não participa</strong> de licitações, pregões, concorrências, ARP, registro de preços ou processos similares. Esta é uma diretriz institucional do Instituto, em razão da natureza especializada das formações que desenvolve. A página de <a href="/solucoes#contratacao-institucional" data-cms-link="modelo-institucional">Soluções</a> detalha as hipóteses jurídicas e o apoio técnico que oferecemos ao órgão na formalização.</p>`,
  },
  {
    id: "cap-faq-5",
    pergunta: "Posso combinar módulos de programas diferentes?",
    respostaHtml: `<p>Sim. Essa é exatamente a função da modalidade de <strong>trilhas e jornadas curadas</strong>. A curadoria científica da NTC combina módulos de diferentes programas — articulando, por exemplo, módulos de AGIP (contratações), LIDERA (direção) e SIGA (governança administrativa) em uma trilha de formação plurianual para uma carreira pública.</p>
<p>As trilhas são sempre articuladas com apoio da curadoria desde o briefing, para preservar a coerência editorial e técnica da jornada formativa.</p>`,
  },
  {
    id: "cap-faq-6",
    pergunta: "A NTC respeita a LGPD nas inscrições?",
    respostaHtml: `<p>Sim. O Instituto NTC do Brasil é controlador dos dados pessoais coletados em inscrições, formulários e na operação do EventOn, sob a Lei 13.709/2018 (LGPD). Os dados são tratados exclusivamente para a finalidade da formação contratada — operação, comunicação, certificação, relatório institucional — e não são compartilhados com terceiros para fins comerciais.</p>
<p>O encarregado de dados (DPO) e os direitos titulares estão disponíveis na página de <a href="/lgpd" data-cms-link="legal-lgpd">Contato · LGPD</a>.</p>`,
  },
  {
    id: "cap-faq-7",
    pergunta: "Posso inscrever uma equipe institucional inteira?",
    respostaHtml: `<p>Sim. Há um fluxo dedicado a inscrições em grupo institucional — pelo formulário "Equipe ou grupo institucional" da página de Contato. Suportamos inscrições de qualquer tamanho, com faixas de atendimento de até 50 participantes (preenchimento direto) e a partir de 50 (envio do modelo XLSX oficial com a relação de servidores).</p>
<p>Em grupos maiores, o atendimento institucional pode também avaliar se a hipótese mais aderente é a contratação direta de uma turma fechada — o que muitas vezes oferece melhor custo institucional e mais customização.</p>`,
  },
  {
    id: "cap-faq-8",
    pergunta: "Quanto tempo leva para a NTC apresentar uma proposta?",
    respostaHtml: `<p>Para inscrição em evento aberto: o atendimento responde em até <strong>2 dias úteis</strong>.</p>
<p>Para proposta institucional dedicada (in company, turma fechada, sob medida, trilha): após o briefing recebido, devolvemos a leitura técnica e a recomendação editorial em <strong>até 10 dias úteis</strong>. A proposta formal — com escopo, prazo, equipe docente, formato e valor — segue em até 15 dias úteis, conforme a complexidade do desenho.</p>
<p>Para demandas emergenciais (formação executiva em curto prazo), há rito acelerado que pode ser combinado com o atendimento institucional.</p>`,
  },
];
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona CAMINHOS+FAQ

caminhosCapacitacao (2 blocos: participante + instituicao, com 4 passos
cada e CTA primary/gold). faqCapacitacao (8 itens cap-faq-1 a cap-faq-8
com respostaHtml multi-parágrafo; FAQ 4 link inline para /solucoes;
FAQ 6 link inline para /lgpd).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: `conteudoCapacitacao.ts` parte 6 — CTA final + sticky

**Files:**
- Modify: `apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`

- [ ] **Step 1: Adicionar ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts`.

old_string (último item do faqCapacitacao fechando):
```
  {
    id: "cap-faq-8",
    pergunta: "Quanto tempo leva para a NTC apresentar uma proposta?",
    respostaHtml: `<p>Para inscrição em evento aberto: o atendimento responde em até <strong>2 dias úteis</strong>.</p>
<p>Para proposta institucional dedicada (in company, turma fechada, sob medida, trilha): após o briefing recebido, devolvemos a leitura técnica e a recomendação editorial em <strong>até 10 dias úteis</strong>. A proposta formal — com escopo, prazo, equipe docente, formato e valor — segue em até 15 dias úteis, conforme a complexidade do desenho.</p>
<p>Para demandas emergenciais (formação executiva em curto prazo), há rito acelerado que pode ser combinado com o atendimento institucional.</p>`,
  },
];
```

new_string:
```
  {
    id: "cap-faq-8",
    pergunta: "Quanto tempo leva para a NTC apresentar uma proposta?",
    respostaHtml: `<p>Para inscrição em evento aberto: o atendimento responde em até <strong>2 dias úteis</strong>.</p>
<p>Para proposta institucional dedicada (in company, turma fechada, sob medida, trilha): após o briefing recebido, devolvemos a leitura técnica e a recomendação editorial em <strong>até 10 dias úteis</strong>. A proposta formal — com escopo, prazo, equipe docente, formato e valor — segue em até 15 dias úteis, conforme a complexidade do desenho.</p>
<p>Para demandas emergenciais (formação executiva em curto prazo), há rito acelerado que pode ser combinado com o atendimento institucional.</p>`,
  },
];

// ----------------- CTA FINAL -----------------

export interface CardCtaVertical {
  vert: VerticalCapacitacao;
  eyebrow: string;
  titulo: string;
  descricao: string;
  link: LinkInterno;
}

export const ctaFinalEyebrow = "Próximo passo";
export const ctaFinalH2 = `Onde começa o <em>seu plano</em> de capacitação NTC?`;
export const ctaFinalP =
  "Você pode começar pela agenda aberta, pelo corpo docente, pela conversa com a curadoria ou direto pela proposta institucional. Estamos prontos para o caminho que fizer mais sentido para o seu cenário.";

export const ctaFinalBtns: LinkInterno[] = [
  {
    texto: "Solicitar proposta institucional",
    href: "/contato#tab-proposta",
    cmsLink: "proposta-institucional",
    track: "cap_cta_proposta",
    classe: "btn btn--gold",
    arrow: true,
  },
  {
    texto: "Ver agenda completa",
    href: "/capacitacao/agenda",
    cmsLink: "agenda-completa",
    track: "cap_cta_agenda",
    classe: "btn btn--ghost-light",
  },
  {
    texto: "Conhecer o corpo docente",
    href: "/o-grupo/corpo-docente",
    cmsLink: "pagina-corpo-docente",
    track: "cap_cta_docentes",
    classe: "btn btn--ghost-light",
  },
];

export const ctaFinalVerticais: CardCtaVertical[] = [
  {
    vert: "edu",
    eyebrow: "NTC Educação",
    titulo: "Formação para redes públicas de ensino",
    descricao:
      "9 programas estratégicos — alfabetização, gestão escolar, inclusão, educação integral, IA pedagógica, primeira infância e mais.",
    link: {
      texto: "Conhecer NTC Educação",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "cap_cta_edu",
      classe: "link-arrow light",
    },
  },
  {
    vert: "gov",
    eyebrow: "NTC Gestão Pública",
    titulo: "Direção, governança e contratações",
    descricao:
      "3 programas estratégicos — Lei 14.133/2021, direção estratégica, governança administrativa e a frente de Contratações Públicas.",
    link: {
      texto: "Conhecer NTC Gestão Pública",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "cap_cta_gov",
      classe: "link-arrow light",
    },
  },
  {
    vert: "sau",
    eyebrow: "NTC Saúde",
    titulo: "Inteligência institucional para o SUS",
    descricao:
      "3 programas estratégicos — alta gestão do SUS, atenção primária, redes territoriais e gestão integrada da saúde pública.",
    link: {
      texto: "Conhecer NTC Saúde",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "cap_cta_sau",
      classe: "link-arrow light",
    },
  },
];

// ----------------- STICKY CTA MOBILE -----------------

export const stickyCtaCapacitacao: LinkInterno = {
  texto: "Solicitar proposta",
  href: "/contato#tab-proposta",
  cmsLink: "proposta-institucional",
  track: "cap_sticky_cta",
  classe: "btn btn--gold",
  arrow: true,
};
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/conteudoCapacitacao.ts" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona CTA FINAL + STICKY

ctaFinalBtns (3: Solicitar proposta gold + Ver agenda ghost + Corpo
docente ghost). ctaFinalVerticais (3 cards-ponte edu/gov/sau apontando
para /solucoes-estrategicas/<slug>). stickyCtaCapacitacao (CTA Solicitar
proposta → /contato#tab-proposta).

Completa conteudoCapacitacao.ts. Próximos commits criam os 4 client
components e o page.tsx server.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `StickyCtaCapacitacao.tsx` client

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/StickyCtaCapacitacao.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/StickyCtaCapacitacao.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { stickyCtaCapacitacao } from "./conteudoCapacitacao";

/**
 * Sticky CTA mobile da página /capacitacao. Espelha o IIFE do protótipo
 * (linhas 2587-2605 de 27_Pagina_Capacitacao_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local, sem sessionStorage).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

export function StickyCtaCapacitacao() {
  const [visivel, setVisivel] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisivel(window.scrollY > 800);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [dismissed]);

  if (dismissed) return null;

  const onDismiss = () => {
    setDismissed(true);
    setVisivel(false);
    track("cap_sticky_cta_dismissed", { page: "capacitacao" });
  };

  return (
    <aside
      className={`sticky-cta-mobile${visivel ? " is-visible" : ""}`}
      id="stickyCta"
      aria-label="Ação rápida"
    >
      <button
        className="sticky-cta-mobile-dismiss"
        id="stickyCtaDismiss"
        type="button"
        aria-label="Fechar"
        onClick={onDismiss}
      >
        ×
      </button>
      <a
        className={stickyCtaCapacitacao.classe ?? "btn btn--gold"}
        href={stickyCtaCapacitacao.href}
        data-cms-link={stickyCtaCapacitacao.cmsLink}
        data-track={stickyCtaCapacitacao.track}
      >
        {stickyCtaCapacitacao.texto}
        {stickyCtaCapacitacao.arrow && <span className="btn-arrow"> →</span>}
      </a>
    </aside>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa. Warnings em `_action`/`_payload` aceitáveis (prefixados com `_`).

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/StickyCtaCapacitacao.tsx" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona StickyCtaCapacitacao client component

Espelha o IIFE de sticky CTA do protótipo: aparece após scroll > 800px,
dismiss local (sem sessionStorage). Usa rAF para debounce e track() no-op
para futura integração GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Criar `FaqCapacitacao.tsx` client

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/FaqCapacitacao.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/FaqCapacitacao.tsx`:

```tsx
"use client";

import { useState } from "react";

import type { ItemFaqCap } from "./conteudoCapacitacao";

/**
 * FAQ acordeão da página /capacitacao. Espelha o IIFE do protótipo
 * (linhas 2571-2584 de 27_Pagina_Capacitacao_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<article class="cap-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqCapacitacaoProps {
  itens: ItemFaqCap[];
}

export function FaqCapacitacao({ itens }: FaqCapacitacaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("cap_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
      return next;
    });
  };

  return (
    <>
      {itens.map((item) => {
        const aberto = abertos.has(item.id);
        return (
          <article
            key={item.id}
            className={`cap-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="cap-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="cap-faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="cap-faq-body" id={item.id}>
              <div
                className="cap-faq-body-inner"
                dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
              />
            </div>
          </article>
        );
      })}
    </>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/FaqCapacitacao.tsx" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona FaqCapacitacao client component

Espelha o IIFE de FAQ accordion do protótipo: estado interno Set<string>
com ids abertos (vazio inicial — todos fechados), aria-expanded reativo,
respostaHtml renderizada com dangerouslySetInnerHTML dentro do
.cap-faq-body-inner. Track no-op para futura GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Criar `SubnavStickyCapacitacao.tsx` client

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/SubnavStickyCapacitacao.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/SubnavStickyCapacitacao.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import type { SubnavLink } from "./conteudoCapacitacao";

/**
 * Subnav sticky + active anchor highlight da página /capacitacao.
 * Espelha o IIFE do protótipo (linhas 2655-2686 de
 * 27_Pagina_Capacitacao_v1.html):
 *
 * - Quando o scroll passa do `offsetTop` original da nav, recebe
 *   classe `is-sticky` (CSS faz position: sticky).
 * - Active anchor: compara `getBoundingClientRect().top - (headerH +
 *   subnavH + 24)` de cada seção referenciada; a última cujo top é
 *   ≤ 0 é a seção ativa.
 * - rAF gate no scroll; resize re-mede subnavTop + headerH.
 *
 * SSR: renderiza sem `is-sticky` / `is-active`. Toggles aplicados
 * apenas após o mount.
 */

interface SubnavStickyCapacitacaoProps {
  label: string;
  links: SubnavLink[];
}

export function SubnavStickyCapacitacao({ label, links }: SubnavStickyCapacitacaoProps) {
  const [sticky, setSticky] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const subnav = document.getElementById("capSubnav");
    if (!subnav) return;
    const sections = links
      .map((link) => document.querySelector(link.href) as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let subnavTop = subnav.offsetTop;
    let headerH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 88;
    let raf = 0;

    const compute = () => {
      const y = window.scrollY;
      setSticky(y >= subnavTop - 1);
      const subnavH = subnav.offsetHeight;
      const margin = headerH + subnavH + 24;
      let nextActive: string | null = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top - margin <= 0) nextActive = s.id;
      }
      setActiveId(nextActive);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };

    const onResize = () => {
      subnavTop = subnav.offsetTop;
      headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) || 88;
      compute();
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [links]);

  return (
    <nav
      className={`cap-subnav${sticky ? " is-sticky" : ""}`}
      id="capSubnav"
      aria-label="Navegação interna da Capacitação"
    >
      <div className="container">
        <div className="cap-subnav-inner">
          <span className="cap-subnav-label">{label}</span>
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                data-cms-link={link.cmsLink}
                className={ativo ? "is-active" : undefined}
                aria-current={ativo ? "location" : undefined}
              >
                {link.texto}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/SubnavStickyCapacitacao.tsx" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona SubnavStickyCapacitacao client component

Espelha o IIFE de subnav do protótipo, com melhorias já consolidadas em
/conteudos: rAF gate no scroll, resize re-mede subnavTop+headerH,
aria-current="location" no link ativo (WCAG 2.1 AA).

SSR-safe: renderiza sem is-sticky/is-active; toggles só após mount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Criar `ProximosEventosFiltro.tsx` client

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/ProximosEventosFiltro.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/ProximosEventosFiltro.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";

import type {
  EventoCap,
  FiltroProximos,
  LinkInterno,
  VerticalCapacitacao,
} from "./conteudoCapacitacao";

/**
 * Microfiltros de próximos eventos da página /capacitacao. Espelha o IIFE
 * do protótipo (linhas 2628-2650 de 27_Pagina_Capacitacao_v1.html):
 *
 * - 4 filtros tab (all / edu / gov / sau) com aria-selected.
 * - 6 cards `.cap-evento-card` com `data-vert`.
 * - Estratégia "todos no DOM com is-hidden" (paridade com CSS portado).
 * - Counter via track('cap_proximos_filter', { filter, shown }) — no-op stub.
 *
 * Não tem URL sync nem busca (protótipo não tem).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface ProximosEventosFiltroProps {
  eventos: EventoCap[];
  filtros: FiltroProximos[];
  head: {
    eyebrow: string;
    tituloHtml: string;
    intro: string;
    selo: string;
  };
  footerCta: LinkInterno;
}

type FiltroValor = "all" | VerticalCapacitacao;

export function ProximosEventosFiltro({
  eventos,
  filtros,
  head,
  footerCta,
}: ProximosEventosFiltroProps) {
  const [filtro, setFiltro] = useState<FiltroValor>("all");

  const visiveis = useMemo(() => {
    return eventos.map((evento) => {
      const visible = filtro === "all" || evento.vert === filtro;
      return { evento, visible };
    });
  }, [eventos, filtro]);

  const onFiltroClick = (valor: FiltroValor) => {
    setFiltro(valor);
    const shown = eventos.filter((e) => valor === "all" || e.vert === valor).length;
    track("cap_proximos_filter", { filter: valor, shown });
  };

  return (
    <section
      className="cap-proximos"
      id="proximos"
      aria-label="Próximos eventos abertos"
    >
      <div className="container">
        <div className="section-head fade-in">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: head.tituloHtml }} />
          <p className="intro">{head.intro}</p>
          <span className="cap-proximos-selo">{head.selo}</span>
        </div>

        <div className="cap-proximos-filterbar fade-in" role="tablist" aria-label="Filtrar por vertical">
          {filtros.map((f) => {
            const ativa = filtro === f.value;
            return (
              <button
                key={f.value}
                type="button"
                className={`cap-proximos-filter${ativa ? " is-active" : ""}`}
                data-filter={f.value}
                role="tab"
                aria-selected={ativa}
                onClick={() => onFiltroClick(f.value)}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="cap-proximos-grid">
          {visiveis.map(({ evento, visible }, i) => (
            <article
              key={i}
              className={`cap-evento-card${visible ? "" : " is-hidden"}`}
              data-vert={evento.vert}
            >
              <p className="cap-evento-vert">{evento.eyebrow}</p>
              <h3>
                <span dangerouslySetInnerHTML={{ __html: evento.prefixoHtml }} />
                {evento.titulo}
              </h3>
              <div className="cap-evento-meta">
                <span>{evento.data}</span>
                <span>{evento.formato}</span>
                <span>{evento.local}</span>
              </div>
              <p>{evento.descricao}</p>
              <div className="cap-evento-preco">{evento.preco}</div>
              <a
                className={evento.cta.classe}
                href={evento.cta.href}
                data-cms-link={evento.cta.cmsLink}
                data-track={evento.cta.track}
              >
                {evento.cta.texto}
              </a>
            </article>
          ))}
        </div>

        <div className="cap-proximos-foot fade-in">
          <a
            className={footerCta.classe}
            href={footerCta.href}
            data-cms-link={footerCta.cmsLink}
            data-track={footerCta.track}
          >
            {footerCta.texto}
            {footerCta.arrow && <span className="btn-arrow"> →</span>}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/ProximosEventosFiltro.tsx" && git commit -m "$(cat <<'EOF'
feat(capacitacao): adiciona ProximosEventosFiltro client component

Espelha o IIFE de microfiltros do protótipo: 4 filtros tab (all/edu/gov/sau)
com role=tab + aria-selected; 6 cards `.cap-evento-card` com data-vert;
estratégia "todos no DOM com is-hidden" para paridade com CSS portado.
Sem URL sync (protótipo não tem). Track no-op para futura GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Criar `page.tsx` server (16 seções)

**Files:**
- Create: `apps/web/app/(capacitacao)/capacitacao/page.tsx`

- [ ] **Step 1: Criar o page.tsx**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(capacitacao)/capacitacao/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Fragment } from "react";

import {
  cardsVerticaisCapacitacao,
  caminhosCapacitacao,
  caminhosEyebrow,
  caminhosH2,
  caminhosIntro,
  ctaFinalBtns,
  ctaFinalEyebrow,
  ctaFinalH2,
  ctaFinalP,
  ctaFinalVerticais,
  curadoriaCtas,
  curadoriaEyebrow,
  curadoriaH2,
  curadoriaP1,
  curadoriaP2,
  curadoriaPills,
  eixosCapacitacao,
  eixosEyebrow,
  eixosH2,
  eixosImpact,
  eixosP1,
  eventonCtas,
  eventonEyebrow,
  eventonFeatures,
  eventonH2,
  eventonP1,
  eventonP2,
  eventosCapacitacao,
  faqCapacitacao,
  faqEyebrow,
  faqH2,
  faqIntro,
  filtrosProximos,
  formatosCapacitacao,
  formatosEyebrow,
  formatosH2,
  formatosIntro,
  heroCrumbs,
  heroEyebrow,
  heroH1,
  heroQuicklinks,
  heroSub,
  manifestoEyebrow,
  manifestoH2,
  manifestoLede,
  manifestoMarker,
  manifestoP,
  metricasCapacitacao,
  modalidadesCapacitacao,
  modalidadesEyebrow,
  modalidadesH2,
  modalidadesIntro,
  pilaresCapacitacao,
  pilaresEyebrow,
  pilaresH2,
  pilaresIntro,
  proximosEyebrow,
  proximosFooterLink,
  proximosH2,
  proximosIntro,
  proximosSelo,
  subnavLabel,
  subnavLinks,
  verticaisEyebrow,
  verticaisH2,
  verticaisIntro,
  vsBlocks,
} from "./conteudoCapacitacao";
import { FaqCapacitacao } from "./FaqCapacitacao";
import { ProximosEventosFiltro } from "./ProximosEventosFiltro";
import { StickyCtaCapacitacao } from "./StickyCtaCapacitacao";
import { SubnavStickyCapacitacao } from "./SubnavStickyCapacitacao";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Capacitação institucional · Grupo NTC",
  description:
    "Capacitação institucional do Grupo NTC — programas, eventos e jornadas formativas para órgãos públicos, redes de ensino, sistemas de saúde e equipes de gestão. Curadoria científica, excelência docente, tecnologia própria EventOn e segurança institucional.",
};

/**
 * Página /capacitacao — porta literal de 27_Pagina_Capacitacao_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo, linhas 1619-2403):
 *   1.  Hero institucional slim.
 *   2.  Faixa de métricas (5).
 *   3.  <SubnavStickyCapacitacao /> com 6 âncoras.
 *   4.  Manifesto editorial.
 *   5.  3 pilares.
 *   6.  3 verticais formativas (com 3-4 programas linkados cada).
 *   7.  4 modalidades.
 *   8.  Capacitação vs Soluções (2 blocos).
 *   9.  3 formatos.
 *   10. 5 eixos transversais (com aside lateral).
 *   11. Curadoria científica.
 *   12. EventOn (com 4 features).
 *   13. <ProximosEventosFiltro /> com 6 cards filtráveis.
 *   14. 2 caminhos (participante + instituição).
 *   15. <FaqCapacitacao /> com 8 perguntas.
 *   16. CTA final (3 botões + 3 cards-ponte).
 *
 * Fora do <main>: <StickyCtaCapacitacao /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm de (capacitacao)/layout.tsx já existente.
 */
export default function CapacitacaoPage() {
  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Capacitação">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Trilha de navegação">
              {heroCrumbs.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < heroCrumbs.length - 1 && <span className="sep" aria-hidden="true" />}
                </Fragment>
              ))}
            </nav>
            <p className="eyebrow light">{heroEyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: heroH1 }} />
            <p className="hero-page-sub">{heroSub}</p>
            <div className="hero-quicklinks" aria-label="Atalhos rápidos">
              {heroQuicklinks.map((q) => (
                <a
                  key={q.href}
                  href={q.href}
                  data-track={q.track}
                  data-cms-link={q.cmsLink}
                >
                  {q.texto}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 2. FAIXA DE MÉTRICAS */}
        <section
          className="cap-metrics"
          aria-label="Métricas institucionais da capacitação NTC"
        >
          <div className="container">
            <div className="cap-metrics-grid fade-in">
              {metricasCapacitacao.map((m) => (
                <div key={m.lbl} className="cap-metric">
                  <span
                    className={`cm-num${m.numClasseExtra ? ` ${m.numClasseExtra}` : ""}`}
                  >
                    {m.num}
                  </span>
                  <span className="cm-lbl">{m.lbl}</span>
                  <span className="cm-detail">{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SUBNAV STICKY */}
        <SubnavStickyCapacitacao label={subnavLabel} links={subnavLinks} />

        {/* 4. MANIFESTO EDITORIAL */}
        <section
          className="cap-manifesto"
          aria-label="Manifesto editorial da Capacitação NTC"
        >
          <div className="container">
            <div className="cap-manifesto-inner fade-in">
              <p className="eyebrow gold">{manifestoEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: manifestoH2 }} />
              <p className="lede">{manifestoLede}</p>
              <p dangerouslySetInnerHTML={{ __html: manifestoP }} />
              <div className="cap-manifesto-marker">{manifestoMarker}</div>
            </div>
          </div>
        </section>

        {/* 5. PILARES (3) */}
        <section
          className="cap-pilares"
          aria-label="Pilares editoriais da formação NTC"
        >
          <div className="container cap-pilares-inner">
            <div className="cap-pilares-head fade-in">
              <p className="eyebrow gold">{pilaresEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: pilaresH2 }} />
              <p>{pilaresIntro}</p>
            </div>
            <div className="cap-pilares-grid fade-in">
              {pilaresCapacitacao.map((p) => (
                <article key={p.num} className="cap-pilar">
                  <span className="cap-pilar-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="cap-pilar-rule">{p.rule}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 3 VERTICAIS FORMATIVAS */}
        <section
          className="cap-verticais"
          id="verticais"
          aria-label="Verticais formativas do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{verticaisEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: verticaisH2 }} />
              <p className="intro">{verticaisIntro}</p>
            </div>
            <div className="cap-verticais-grid fade-in">
              {cardsVerticaisCapacitacao.map((v) => (
                <article key={v.vert} className="cap-vert-card" data-vert={v.vert}>
                  <div className="cap-vert-band" aria-hidden="true">
                    <span className="cap-vert-band-mark">{v.bandMark}</span>
                    <span className="cap-vert-band-num">{v.bandNum}</span>
                  </div>
                  <div className="cap-vert-body">
                    <h3>{v.titulo}</h3>
                    <p>{v.descricao}</p>
                    <span className="cap-vert-contagem">{v.contagem}</span>
                    <ul className="cap-vert-list">
                      {v.programas.map((p) => (
                        <li key={p.href}>
                          <a
                            href={p.href}
                            data-cms-link={p.cmsLink}
                            dangerouslySetInnerHTML={{ __html: p.textoHtml }}
                          />
                        </li>
                      ))}
                    </ul>
                    <a
                      className={v.link.classe}
                      href={v.link.href}
                      data-cms-link={v.link.cmsLink}
                      data-track={v.link.track}
                    >
                      {v.link.texto}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 4 MODALIDADES */}
        <section
          className="cap-modalidades"
          id="modalidades"
          aria-label="Modalidades de capacitação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{modalidadesEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: modalidadesH2 }} />
              <p className="intro">{modalidadesIntro}</p>
            </div>
            <div className="cap-modalidades-grid fade-in">
              {modalidadesCapacitacao.map((m) => (
                <article key={m.num} className="cap-modalidade">
                  <span className="cap-mod-num">{m.num}</span>
                  <h3>{m.titulo}</h3>
                  <p>{m.descricao}</p>
                  <ul className="cap-mod-list">
                    {m.lista.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <aside
                    className="cap-mod-aside"
                    dangerouslySetInnerHTML={{ __html: m.contratacaoHtml }}
                  />
                  <a
                    className={m.link.classe}
                    href={m.link.href}
                    data-cms-link={m.link.cmsLink}
                    data-track={m.link.track}
                  >
                    {m.link.texto}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CAPACITAÇÃO VS SOLUÇÕES */}
        <section
          className="cap-vs-solucoes"
          aria-label="Diferença entre Capacitação e Soluções"
        >
          <div className="container">
            <div className="cap-vs-grid fade-in">
              {vsBlocks.map((b) => (
                <div key={b.tipo} className="cap-vs-cell" data-tipo={b.tipo}>
                  <p className="eyebrow">{b.eyebrow}</p>
                  <h3>{b.titulo}</h3>
                  <p dangerouslySetInnerHTML={{ __html: b.paragrafoHtml }} />
                  <a
                    className={b.link.classe}
                    href={b.link.href}
                    data-cms-link={b.link.cmsLink}
                    data-track={b.link.track}
                  >
                    {b.link.texto}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. 3 FORMATOS */}
        <section
          className="cap-formatos"
          id="formatos"
          aria-label="Formatos de entrega das formações NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow light">{formatosEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: formatosH2 }} />
              <p className="intro">{formatosIntro}</p>
            </div>
            <div className="cap-formatos-grid fade-in">
              {formatosCapacitacao.map((f) => (
                <article key={f.num} className="cap-formato">
                  <div className="cap-formato-numeral">
                    <span className="cap-formato-num">{f.num}</span>
                    <span className="cap-formato-num-rule" />
                    <span className="cap-formato-num-tag">Formato</span>
                  </div>
                  <h3>{f.titulo}</h3>
                  <p>{f.descricao}</p>
                  <span className="cap-formato-tag">{f.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 10. 5 EIXOS TRANSVERSAIS */}
        <section
          className="cap-eixos"
          id="eixos"
          aria-label="Eixos formativos transversais NTC"
        >
          <div className="container">
            <aside className="cap-eixos-aside">
              <p className="eyebrow">{eixosEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: eixosH2 }} />
              <p>{eixosP1}</p>
              <p className="impact">{eixosImpact}</p>
            </aside>
            <ol className="cap-eixos-list">
              {eixosCapacitacao.map((e) => (
                <li key={e.num} className="cap-eixo">
                  <span className="cap-eixo-num">{e.num}</span>
                  <h3>{e.titulo}</h3>
                  <p>{e.descricao}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 11. CURADORIA CIENTÍFICA */}
        <section
          className="cap-curadoria"
          id="curadoria"
          aria-label="Curadoria científica do Grupo NTC"
        >
          <div className="container cap-curadoria-inner">
            <div className="cap-curadoria-text fade-in">
              <p className="eyebrow">{curadoriaEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: curadoriaH2 }} />
              <p>{curadoriaP1}</p>
              <p>{curadoriaP2}</p>
              <div className="cap-curadoria-pills">
                {curadoriaPills.map((pill) => (
                  <span key={pill} className="cap-curadoria-pill">{pill}</span>
                ))}
              </div>
              <div className="cap-curadoria-cta">
                {curadoriaCtas.map((cta) => (
                  <a
                    key={cta.href}
                    className={cta.classe}
                    href={cta.href}
                    data-cms-link={cta.cmsLink}
                    data-track={cta.track}
                  >
                    {cta.texto}
                    {cta.arrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
              </div>
            </div>
            <div className="cap-curadoria-figura" aria-hidden="true" />
          </div>
        </section>

        {/* 12. EVENTON */}
        <section
          className="cap-eventon"
          id="eventon"
          aria-label="Plataforma EventOn do Grupo NTC"
        >
          <div className="container cap-eventon-inner">
            <div className="cap-eventon-text fade-in">
              <p className="eyebrow light">{eventonEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: eventonH2 }} />
              <p dangerouslySetInnerHTML={{ __html: eventonP1 }} />
              <p dangerouslySetInnerHTML={{ __html: eventonP2 }} />
              <div className="cap-eventon-cta">
                {eventonCtas.map((cta) => (
                  <a
                    key={`${cta.href}-${cta.cmsLink}`}
                    className={cta.classe}
                    href={cta.href}
                    data-cms-link={cta.cmsLink}
                    data-track={cta.track}
                  >
                    {cta.texto}
                    {cta.arrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
              </div>
            </div>
            <div className="cap-eventon-features fade-in">
              {eventonFeatures.map((f) => (
                <div key={f.strong} className="cap-eventon-feature">
                  <strong>{f.strong}</strong>
                  <span>{f.span}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 13. PRÓXIMOS EVENTOS FILTRÁVEIS */}
        <ProximosEventosFiltro
          eventos={eventosCapacitacao}
          filtros={filtrosProximos}
          head={{
            eyebrow: proximosEyebrow,
            tituloHtml: proximosH2,
            intro: proximosIntro,
            selo: proximosSelo,
          }}
          footerCta={proximosFooterLink}
        />

        {/* 14. 2 CAMINHOS */}
        <section
          className="cap-caminhos"
          id="caminhos"
          aria-label="Como participar — caminhos para servidor e instituição"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{caminhosEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: caminhosH2 }} />
              <p className="intro">{caminhosIntro}</p>
            </div>
            <div className="cap-caminhos-grid fade-in">
              {caminhosCapacitacao.map((c) => (
                <article key={c.tipo} className="cap-caminho" data-tipo={c.tipo}>
                  <p className="eyebrow">{c.eyebrow}</p>
                  <h3>{c.titulo}</h3>
                  <p>{c.descricao}</p>
                  <ol className="cap-caminho-passos">
                    {c.passos.map((p, i) => (
                      <li key={i} className="cap-caminho-passo">
                        <span className="cap-caminho-passo-num">{String(i + 1).padStart(2, "0")}</span>
                        <strong>{p.title}</strong>
                        <span>{p.sub}</span>
                      </li>
                    ))}
                  </ol>
                  <a
                    className={c.cta.classe}
                    href={c.cta.href}
                    data-cms-link={c.cta.cmsLink}
                    data-track={c.cta.track}
                  >
                    {c.cta.texto}
                    {c.cta.arrow && <span className="btn-arrow"> →</span>}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 15. FAQ */}
        <section
          className="cap-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre a capacitação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{faqEyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: faqH2 }} />
              <p className="intro">{faqIntro}</p>
            </div>
            <div className="cap-faq-list fade-in">
              <FaqCapacitacao itens={faqCapacitacao} />
            </div>
          </div>
        </section>

        {/* 16. CTA FINAL */}
        <section
          className="cap-cta-final"
          id="cta-final"
          aria-label="CTA institucional final"
        >
          <div className="container cap-cta-final-inner fade-in">
            <p className="eyebrow gold">{ctaFinalEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: ctaFinalH2 }} />
            <p>{ctaFinalP}</p>

            <div className="cap-cta-final-btns">
              {ctaFinalBtns.map((btn) => (
                <a
                  key={`${btn.href}-${btn.cmsLink}`}
                  className={btn.classe}
                  href={btn.href}
                  data-cms-link={btn.cmsLink}
                  data-track={btn.track}
                >
                  {btn.texto}
                  {btn.arrow && <span className="btn-arrow"> →</span>}
                </a>
              ))}
            </div>

            <div className="cap-cta-final-verticais">
              {ctaFinalVerticais.map((card) => (
                <div key={card.vert} className="cap-cta-final-vert" data-vert={card.vert}>
                  <p className="eyebrow">{card.eyebrow}</p>
                  <h4>{card.titulo}</h4>
                  <p>{card.descricao}</p>
                  <a
                    className={card.link.classe}
                    href={card.link.href}
                    data-cms-link={card.link.cmsLink}
                    data-track={card.link.track}
                  >
                    {card.link.texto}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyCtaCapacitacao />
    </>
  );
}
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa.

- [ ] **Step 3: Verificar lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: nada novo crítico.

- [ ] **Step 4: Commit**

```bash
cd /Users/joao/Documents/portal-ntc && git add "apps/web/app/(capacitacao)/capacitacao/page.tsx" && git commit -m "$(cat <<'EOF'
feat(capacitacao): cria page.tsx server com as 16 seções do protótipo

Renderiza, em ordem do <main id="main">:
1.  Hero com crumb, eyebrow light, h1 com <span class="accent">, sub, 5 quicklinks.
2.  5 métricas (1 com cm-num--word).
3.  <SubnavStickyCapacitacao /> com 6 âncoras.
4.  Manifesto editorial.
5.  3 pilares I/II/III.
6.  3 verticais formativas com programas linkados a /programas/<slug>.
7.  4 modalidades com lista, aside e link.
8.  Capacitação vs Soluções (2 blocos).
9.  3 formatos (Online/Híbrido/Presencial).
10. 5 eixos transversais com aside lateral.
11. Curadoria com 4 pills + 2 CTAs.
12. EventOn com 2 CTAs + 4 features.
13. <ProximosEventosFiltro /> com 6 cards filtráveis.
14. 2 caminhos (participante + instituição) com 4 passos cada.
15. <FaqCapacitacao /> com 8 perguntas.
16. CTA final (3 botões + 3 cards-ponte por vertical).

Fora do <main>: <StickyCtaCapacitacao />. revalidate = 3600.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Validar build de produção

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -50
```

Expected: build passa em todos os pacotes. Rota `/capacitacao` aparece prerenderizada como estática.

- [ ] **Step 2: Verificar `/capacitacao` no output**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | grep "/capacitacao " | head -5
```

Expected: ao menos uma linha com `/capacitacao` e marker `○` (Static), com `Revalidate` 1h.

- [ ] **Step 3: Se build falhar, ler erro completo e corrigir**

Se erro de tipo/lint/build: corrigir no arquivo apontado e re-rodar `pnpm build`. Após passar, prosseguir para Task 15.

- [ ] **Step 4: Commit (apenas se houve correção)**

Se necessário:

```bash
cd /Users/joao/Documents/portal-ntc && git add -p && git commit -m "$(cat <<'EOF'
fix(capacitacao): ajustes pós-build de produção

[descrever o ajuste real]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se o build passou sem correção, pular este step.

---

## Task 15: Dev server + checkpoint visual humano

**Files:**
- (nenhuma modificação — validação visual)

- [ ] **Step 1: Verificar se a porta 3001 está livre**

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN 2>/dev/null | head
```

Se houver processo na 3001, escolha outra porta (3002+) ou reporte ao usuário antes de matar.

- [ ] **Step 2: Subir dev server na porta 3001 em background**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3001
```

Use `run_in_background: true`. **NÃO** use `pnpm dev` (turbo não propaga logs dos sub-processos).

- [ ] **Step 3: Aguardar logs indicarem que está pronto**

Esperar por linha `Ready in Xms`. Usar Bash com `until grep -q "Ready in" <log-file>; do sleep 1; done`.

- [ ] **Step 4: Curl da rota `/capacitacao`**

```bash
curl -sI http://localhost:3001/capacitacao | head -3
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 5: Curl pelo conteúdo para confirmar marcadores chave**

```bash
curl -s http://localhost:3001/capacitacao | grep -oE '<title>[^<]+</title>|class="cap-metric"|class="cap-pilar"|class="cap-vert-card"|class="cap-modalidade"|class="cap-vs-cell"|class="cap-formato"|class="cap-eixo"|class="cap-eventon-feature"|class="cap-evento-card|class="cap-caminho"|class="cap-faq-item|class="cap-cta-final-vert"|class="sticky-cta-mobile"' | sort | uniq -c | sort -rn | head -20
```

Expected (contagens):
- 1 title contendo "Capacitação institucional"
- 5 `cap-metric`
- 3 `cap-pilar`
- 3 `cap-vert-card`
- 4 `cap-modalidade`
- 2 `cap-vs-cell`
- 3 `cap-formato`
- 5 `cap-eixo`
- 4 `cap-eventon-feature`
- 6 `cap-evento-card`
- 2 `cap-caminho`
- 8 `cap-faq-item`
- 3 `cap-cta-final-vert`
- 1 `sticky-cta-mobile`

- [ ] **Step 6: Pedir ao usuário para validar visualmente**

Mensagem:

> O servidor de dev está rodando em http://localhost:3001/capacitacao. Por favor:
>
> 1. Abra http://localhost:3001/capacitacao no navegador.
> 2. Abra também `27_Pagina_Capacitacao_v1.html` no navegador.
> 3. Compare lado a lado: hero (crumb, eyebrow light, h1 com accent, 5 quicklinks); 5 métricas (1 com `cm-num--word`); subnav com 6 âncoras; manifesto + 3 pilares; 3 verticais com programas linkados; 4 modalidades; vs Capacitação/Soluções; 3 formatos; 5 eixos com aside; curadoria; EventOn; **6 próximos eventos com filtro**; 2 caminhos; 8 FAQs; CTA final 3 botões + 3 cards-ponte; sticky mobile.
> 4. Teste interatividade:
>    - **Subnav sticky**: ao rolar, recebe `is-sticky`; link da seção visível recebe `is-active` + `aria-current="location"`.
>    - **Próximos eventos**: click "Educação" reduz para 2 cards (EDUTEC + PEAR); "Saúde" reduz para 2 (PROSUS + PROAPS); "Gestão Pública" reduz para 2 (AGIP + LIDERA); "Todos" volta a 6.
>    - **FAQ**: click expande/colapsa, ícone `+` rotaciona.
>    - **Sticky mobile**: aparece após scroll > 800px, `×` esconde.
> 5. Reporte discrepâncias.
>
> Quando aprovar, encerro o dev server e finalizo.

- [ ] **Step 7: Após aprovação humana, encerrar o dev server**

Killar o processo background do `pnpm next dev`. Se houve discrepâncias, corrigir e re-validar antes deste step.

- [ ] **Step 8: Se houve correções pós-validação, commitar**

```bash
cd /Users/joao/Documents/portal-ntc && git add -p && git commit -m "$(cat <<'EOF'
fix(capacitacao): ajustes pós-checkpoint visual

[descrever o ajuste real]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: Mover protótipo para `feito/`**

```bash
cd /Users/joao/Documents/portal-ntc && git mv 27_Pagina_Capacitacao_v1.html feito/27_Pagina_Capacitacao_v1.html && git commit -m "$(cat <<'EOF'
chore(capacitacao): move 27_Pagina_Capacitacao_v1.html para feito/

Página /capacitacao portada e aprovada visualmente pelo usuário.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 10: Resumo da sessão**

Resumir em até 10 linhas:
- O que foi implementado: rota `/capacitacao` no route group `(capacitacao)` (irmã de `/capacitacao/agenda`), 16 seções (5 métricas, subnav sticky com active anchor, manifesto, 3 pilares, 3 verticais com programas linkados, 4 modalidades, vs-soluções, 3 formatos, 5 eixos com aside, curadoria, EventOn, 6 próximos eventos filtráveis, 2 caminhos, 8 FAQs, CTA final 3 botões + 3 cards-ponte), sticky mobile.
- O que ficou pendente / fora de escopo: páginas individuais `/agenda/[slug]` (3 cards de evento com TODO), integração real de analytics, atualização do mega-menu HeaderHome para apontar "Capacitação" para `/capacitacao`.
- Próximos passos sugeridos: portar `27_Pagina_EventOn_v1.html` ou outro protótipo restante; implementar mega-menu "Capacitação".

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura): Tasks 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13.
  - §4 (estrutura page.tsx): Task 13.
  - §5 (conteudoCapacitacao.ts): Tasks 3, 4, 5, 6, 7, 8.
  - §6.1 (SubnavStickyCapacitacao): Task 11.
  - §6.2 (ProximosEventosFiltro): Task 12.
  - §6.3 (FaqCapacitacao): Task 10.
  - §6.4 (StickyCtaCapacitacao): Task 9.
  - §7 (CSS): Tasks 1, 2.
  - §8 (validação): Tasks 14, 15.
  - §9 (riscos): mitigados nas tasks (eventos com data-vert, subnav rAF, FAQ dangerouslySetInnerHTML, hrefs mapeados, layout existente intocado).
  - §10 (fora de escopo): respeitado em todas as tasks.
- ✅ **Sem placeholders:** todos os steps têm comandos ou código completos. Os 8 FAQs, 6 cards de eventos, 4 modalidades, 5 eixos, 3 verticais com 3-4 programas cada estão literalmente nos Tasks 4/5/6/7.
- ✅ **Type consistency:** `LinkInterno`, `CrumbItem`, `MetricaCap`, `SubnavLink`, `PilarCap`, `VerticalItemPrograma`, `CardVerticalCap`, `ModalidadeCap`, `VsBlock`, `FormatoCap`, `EixoCap`, `EventonFeature`, `EventoCap`, `FiltroProximos`, `PassoCaminho`, `CaminhoCap`, `ItemFaqCap`, `CardCtaVertical`, `VerticalCapacitacao`, `TipoVsBlock`, `CaminhoTipo` definidos uma vez (Tasks 3-8) e consumidos consistentemente em Tasks 9-13. `ProximosEventosFiltro` recebe `eventos: EventoCap[]` + `filtros: FiltroProximos[]` + `head: {...}` + `footerCta: LinkInterno`. `FaqCapacitacao` recebe `itens: ItemFaqCap[]`. `SubnavStickyCapacitacao` recebe `label, links: SubnavLink[]`. `StickyCtaCapacitacao` lê `stickyCtaCapacitacao` direto.
