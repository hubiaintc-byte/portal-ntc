# Página Conteúdos NTC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente o protótipo `28_Pagina_Conteudos_v1.html` (~2.775 linhas) para a rota `/conteudos` em um novo route group `(conteudos)`, preservando 100% do visual, das 12 seções editoriais (hero, 5 métricas, subnav sticky, manifesto, tese 3 pilares, 3 destaques, biblioteca filtrável de 9 cards, 5 tipos, 3 verticais, newsletter mock, 8 FAQs, CTA final 3 pontes) e da interatividade (biblioteca filtros + URL sync, subnav sticky com active anchor, FAQ acordeão, newsletter validação inline, sticky CTA mobile).

**Architecture:** Estratégia "porta do HTML" consolidada: CSS literal extraído para `apps/web/app/conteudos-prototipo.css` (importado no root layout), `page.tsx` server component renderiza JSX literal das 12 seções, `conteudoConteudos.ts` armazena tipos + todas as constantes textuais, 5 client components mínimos (`SubnavSticky`, `BibliotecaConteudos`, `NewsletterForm`, `FaqAcordeao`, `StickyCtaConteudos`). Layout do novo route group `(conteudos)` reaproveita `HeaderHome`/`FooterHome`/`InteracoesScroll` do `(home)`. Newsletter form é mock client-side (sem POST real); analytics permanece no-op stub.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind para classes do protótipo, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/conteudos-prototipo.css` — CSS literal (~1.246 linhas) das linhas 138-1382 do HTML, com `url('./img/...')` → `url('/img/...')`.
- `apps/web/app/(conteudos)/layout.tsx` — layout do novo route group (HeaderHome + FooterHome + InteracoesScroll).
- `apps/web/app/(conteudos)/conteudos/page.tsx` — server component, `revalidate = 3600`, JSX literal das 12 seções + sticky CTA mobile.
- `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts` — tipos + todas as constantes textuais.
- `apps/web/app/(conteudos)/conteudos/SubnavSticky.tsx` — client: sticky toggle + active anchor highlight.
- `apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx` — client: tabs vertical + filtros tipo + busca debounced + URL sync + counter + empty state.
- `apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx` — client: validação inline + mensagens ok/err.
- `apps/web/app/(conteudos)/conteudos/FaqAcordeao.tsx` — client: 8 itens fechados, Set<string>.
- `apps/web/app/(conteudos)/conteudos/StickyCtaConteudos.tsx` — client: scroll listener + dismiss local.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./conteudos-prototipo.css"` ao lado dos outros CSSs de protótipo.

**Não tocar:**
- `apps/web/app/(home)/HeaderHome.tsx`, `apps/web/app/(home)/FooterHome.tsx`, `apps/web/app/(home)/InteracoesScroll.tsx`.

---

## Task 1: Extrair CSS literal do protótipo para `conteudos-prototipo.css`

**Files:**
- Create: `apps/web/app/conteudos-prototipo.css`

- [ ] **Step 1: Extrair linhas 138-1382 do HTML (conteúdo entre `<style>` e `</style>` exclusive)**

```bash
sed -n '138,1382p' /Users/joao/Documents/portal-ntc/28_Pagina_Conteudos_v1.html > /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css
```

Expected: arquivo de ~1.245 linhas criado.

- [ ] **Step 2: Verificar tamanho**

```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css
```

Expected: `1245 .../conteudos-prototipo.css` (ou próximo).

- [ ] **Step 3: Contar `url('./` antes de converter**

```bash
grep -c "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css
```

Anote o número — usado para validar Step 5.

- [ ] **Step 4: Converter `url('./img/...')` para `url('/img/...')`**

```bash
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css
```

- [ ] **Step 5: Verificar zero `url('./` restante**

```bash
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css
```

Expected: nenhuma saída (exit code 1).

- [ ] **Step 6: Listar imagens referenciadas e verificar que existem em `public/`**

```bash
grep -oE "url\('[^']+'\)" /Users/joao/Documents/portal-ntc/apps/web/app/conteudos-prototipo.css | sort -u
```

Para cada URL `url('/img/...')` retornada, verificar com:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public<caminho-relativo>
```

Se algum arquivo não existir, reportar BLOCKED.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/conteudos-prototipo.css
git commit -m "$(cat <<'EOF'
feat(conteudos): extrai CSS literal do protótipo 28 para conteudos-prototipo.css

Bloco <style> de 28_Pagina_Conteudos_v1.html (linhas 138-1382) copiado
sem adaptação, com url('./img/...') convertido para url('/img/...').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `conteudos-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Confirmar posição do `solucoes-prototipo.css`**

```bash
grep -n "prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: lista 9 imports terminando em `import "./solucoes-prototipo.css";`.

- [ ] **Step 2: Adicionar `import "./conteudos-prototipo.css"` depois do `solucoes-prototipo.css`**

Use Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx`:

old_string:
```
import "./solucoes-prototipo.css";
```

new_string:
```
import "./solucoes-prototipo.css";
// CSS da página /conteudos (portada literal de 28_Pagina_Conteudos_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.cont-metrics, .cont-subnav,
// .cont-manifesto, .cont-thesis, .cont-featured, .cont-biblioteca,
// .cont-card, .cont-tipos, .cont-verticais, .cont-newsletter, .cont-faq,
// .cont-cta-final, .sticky-cta-mobile).
import "./conteudos-prototipo.css";
```

Se `import "./solucoes-prototipo.css";` aparece mais de uma vez (improvável), reporte BLOCKED.

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa sem erro novo.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(conteudos): importa conteudos-prototipo.css no root layout

Carrega CSS da página /conteudos no root para herdar a mesma estratégia
dos outros CSSs de protótipo (escopo seguro por classes específicas).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar layout do novo route group `(conteudos)`

**Files:**
- Create: `apps/web/app/(conteudos)/layout.tsx`

- [ ] **Step 1: Criar diretórios**

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos"
```

- [ ] **Step 2: Confirmar que HeaderHome, FooterHome e InteracoesScroll existem**

```bash
ls "/Users/joao/Documents/portal-ntc/apps/web/app/(home)/" | grep -E "HeaderHome|FooterHome|InteracoesScroll"
```

Expected: os 3 arquivos `.tsx` listados.

- [ ] **Step 3: Criar layout.tsx**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/layout.tsx`:

```tsx
import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas do guarda-chuva Conteúdos:
 *   /conteudos        (porta de 28_Pagina_Conteudos_v1.html)
 *
 * Esta família abriga a biblioteca editorial do Grupo NTC — artigos,
 * estudos, notas técnicas, webinars e materiais didáticos. Futuro
 * `/conteudos/[slug]` ficará neste mesmo route group.
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx, (vertical)/layout.tsx, (capacitacao)/layout.tsx
 * e (solucoes)/layout.tsx.
 *
 * CSS específico vem do root layout (conteudos-prototipo.css).
 */
export default function ConteudosLayout({ children }: { children: ReactNode }) {
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

- [ ] **Step 4: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -10
```

Expected: passa.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(conteudos)/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): cria layout do novo route group (conteudos)

Espelha o padrão dos demais route groups (institucional, programas,
o-grupo, vertical, capacitacao, solucoes): HeaderHome + FooterHome +
InteracoesScroll do (home).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Criar `conteudoConteudos.ts` parte 1 (tipos + hero + métricas + subnav + manifesto + tese)

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`

- [ ] **Step 1: Criar o arquivo**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /CONTEUDOS
//  Porta de 28_Pagina_Conteudos_v1.html (linhas 1551-2295 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

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

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export const HERO_CONTEUDOS = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Conteúdos institucionais", current: true },
  ] as CrumbItem[],
  eyebrow: "Biblioteca editorial · 2026",
  tituloHtml:
    'A inteligência <span class="accent">institucional</span><br>do Grupo NTC, em circulação.',
  sub:
    "Artigos, estudos, notas técnicas, webinars e materiais didáticos produzidos pela curadoria científica das três verticais NTC — para servidores, dirigentes, juristas, pesquisadores e equipes técnicas da administração pública brasileira.",
  quicklinks: [
    { texto: "Destaques", href: "#destaques", cmsLink: "quicklink-destaques", track: "hero_quicklink" },
    { texto: "Biblioteca", href: "#biblioteca", cmsLink: "quicklink-biblioteca", track: "hero_quicklink" },
    { texto: "Tipos", href: "#tipos", cmsLink: "quicklink-tipos", track: "hero_quicklink" },
    { texto: "Verticais", href: "#verticais", cmsLink: "quicklink-verticais", track: "hero_quicklink" },
    { texto: "Newsletter", href: "#newsletter", cmsLink: "quicklink-newsletter", track: "hero_quicklink" },
  ] as LinkInterno[],
};

// ----------------- MÉTRICAS EDITORIAIS (5) -----------------

export interface MetricaConteudo {
  num: string;
  numClasseExtra?: "cm-num--word";
  lbl: string;
  detail: string;
}

export const METRICAS_CONTEUDO: MetricaConteudo[] = [
  {
    num: "Editorial",
    numClasseExtra: "cm-num--word",
    lbl: "Produção editorial",
    detail: "Acervo institucional acumulado pelo Instituto NTC do Brasil",
  },
  {
    num: "Em expansão",
    numClasseExtra: "cm-num--word",
    lbl: "Acervo em expansão",
    detail:
      "Artigos, estudos, notas técnicas, webinars e materiais editoriais",
  },
  {
    num: "Replays",
    numClasseExtra: "cm-num--word",
    lbl: "Webinars e replays",
    detail: "Conteúdos audiovisuais disponíveis conforme política editorial",
  },
  {
    num: "3",
    lbl: "Verticais editoriais",
    detail: "Educação · Gestão Pública · Saúde · temas transversais",
  },
  {
    num: "Progressivo",
    numClasseExtra: "cm-num--word",
    lbl: "Acesso progressivo",
    detail:
      "Parte do acervo aberta ao público, com materiais exclusivos via EventOn",
  },
];

// ----------------- SUBNAV -----------------

export interface SubnavLink {
  texto: string;
  href: string;
  cmsLink: string;
}

export const SUBNAV_LABEL = "Nesta página";

export const SUBNAV_LINKS: SubnavLink[] = [
  { texto: "Destaques", href: "#destaques", cmsLink: "subnav-destaques" },
  { texto: "Biblioteca", href: "#biblioteca", cmsLink: "subnav-biblioteca" },
  { texto: "Tipos editoriais", href: "#tipos", cmsLink: "subnav-tipos" },
  { texto: "Verticais", href: "#verticais", cmsLink: "subnav-verticais" },
  { texto: "Newsletter", href: "#newsletter", cmsLink: "subnav-newsletter" },
  { texto: "FAQ", href: "#faq", cmsLink: "subnav-faq" },
];

// ----------------- MANIFESTO EDITORIAL -----------------

export const MANIFESTO_CONTEUDOS = {
  eyebrow: "Por que publicamos",
  tituloHtml: "Não é blog. É <em>publicação institucional</em>.",
  lede:
    "A NTC publica conteúdos não como ação promocional isolada, mas como extensão de sua curadoria científica: leituras técnicas confiáveis, produzidas com rigor editorial e orientadas aos desafios concretos da administração pública brasileira.",
  paragrafo:
    "Cada conteúdo é atribuído a uma frente editorial do Instituto — Curadoria, Direção Científica ou Equipes Técnicas das verticais — e passa por revisão técnica antes da publicação. Webinars geram materiais derivados. Estudos viram notas técnicas. Notas técnicas viram artigos. É um ecossistema editorial vivo, atravessado pelos mesmos critérios que orientam os programas formativos.",
  marker: "Biblioteca editorial NTC · 2026",
};

// ----------------- TESE EDITORIAL (3 pilares) -----------------

export interface PilarTese {
  num: string;
  titulo: string;
  descricao: string;
  rule: string;
}

export const TESE_HEAD = {
  eyebrow: "Como produzimos",
  tituloHtml: "Inteligência institucional <em>em circulação</em>.",
  descricao:
    "O conteúdo NTC nasce do mesmo lugar dos programas: pesquisa aplicada, posição técnica fundamentada e formação continuada. É a inteligência técnica da NTC traduzida em texto, áudio e vídeo.",
};

export const TESE_PILARES: PilarTese[] = [
  {
    num: "I",
    titulo: "Pesquisa aplicada",
    descricao:
      "Estudos com leitura empírica da administração pública brasileira — políticas, redes, sistemas e indicadores — não exercícios acadêmicos desconectados do real.",
    rule: "Estudos · notas técnicas · diagnósticos",
  },
  {
    num: "II",
    titulo: "Posição técnica",
    descricao:
      "Artigos e notas autorais que tomam posição sobre temas em discussão — Lei 14.133/2021, financiamento da APS, alfabetização baseada em evidências, IA e setor público — com fundamentação jurídica e técnica clara.",
    rule: "Artigos · notas autorais · pareceres editoriais",
  },
  {
    num: "III",
    titulo: "Formação continuada",
    descricao:
      "Webinars abertos, materiais didáticos e guias práticos — derivados dos programas estratégicos — para servidores e equipes que precisam aplicar a teoria ao cotidiano da gestão pública.",
    rule: "Webinars · guias · kits didáticos",
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
git add "apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts"
git commit -m "$(cat <<'EOF'
feat(conteudos): cria conteudoConteudos.ts (parte 1) com hero+métricas+subnav+manifesto+tese

Tipos VerticalConteudo, TipoConteudo, LinkInterno, CrumbItem, MetricaConteudo,
SubnavLink, PilarTese. Constantes HERO_CONTEUDOS (crumb + eyebrow + tituloHtml
com <span class="accent"> + sub + 5 quicklinks), METRICAS_CONTEUDO (5),
SUBNAV_LABEL + SUBNAV_LINKS (6), MANIFESTO_CONTEUDOS, TESE_HEAD + TESE_PILARES (3).

Próximos commits adicionam destaques, biblioteca, tipos, verticais, newsletter,
FAQ, CTA final, sticky.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `conteudoConteudos.ts` parte 2 — DESTAQUES + BIBLIOTECA (9 cards)

**Files:**
- Modify: `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`

- [ ] **Step 1: Adicionar DESTAQUES + BIBLIOTECA ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`.

old_string (último item de TESE_PILARES fechando):
```
  {
    num: "III",
    titulo: "Formação continuada",
    descricao:
      "Webinars abertos, materiais didáticos e guias práticos — derivados dos programas estratégicos — para servidores e equipes que precisam aplicar a teoria ao cotidiano da gestão pública.",
    rule: "Webinars · guias · kits didáticos",
  },
];
```

new_string:
```
  {
    num: "III",
    titulo: "Formação continuada",
    descricao:
      "Webinars abertos, materiais didáticos e guias práticos — derivados dos programas estratégicos — para servidores e equipes que precisam aplicar a teoria ao cotidiano da gestão pública.",
    rule: "Webinars · guias · kits didáticos",
  },
];

// ----------------- 3 DESTAQUES EDITORIAIS -----------------

export interface CardDestaque {
  vert: VerticalConteudo;
  imagemUrl: string;
  tipoTag: string;
  prep: string;
  eyebrow: string;
  titulo: string;
  descricao: string;
  meta: [string, string, string];
  soonTag: { texto: string; cmsLink: string };
}

export const DESTAQUES_HEAD = {
  eyebrow: "Destaques editoriais",
  tituloHtml: "Próximas publicações editoriais <em>em preparação</em>.",
  intro:
    "Uma prévia da linha editorial que está sendo finalizada pela curadoria NTC para os próximos meses — um estudo, um artigo e um webinar, escolhidos pela aderência ao momento institucional brasileiro. Avisaremos pelo Boletim NTC quando cada publicação estiver disponível.",
};

export const DESTAQUES: CardDestaque[] = [
  {
    vert: "gov",
    imagemUrl: "/img/fotos/_optimized/conteudo-01.1920.webp",
    tipoTag: "Estudo",
    prep: "Em preparação editorial",
    eyebrow: "NTC Gestão Pública · Contratações",
    titulo:
      "Cinco anos de Lei 14.133: o que mudou, o que não mudou e o que segue em disputa nas redes.",
    descricao:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações no cotidiano dos órgãos públicos, com diagnóstico do que efetivamente se transformou na prática administrativa, dos riscos que persistem e das frentes em disputa interpretativa entre TCU, AGU e tribunais.",
    meta: ["Previsto · 2026", "Estudo · formato longo", "Curadoria NTC Gestão Pública"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-estudo-14133" },
  },
  {
    vert: "edu",
    imagemUrl: "/img/fotos/_optimized/conteudo-02.1920.webp",
    tipoTag: "Artigo",
    prep: "Em preparação editorial",
    eyebrow: "NTC Educação · Alfabetização",
    titulo:
      "Recomposição da aprendizagem nos anos iniciais: o que os dados da rede pública estão dizendo.",
    descricao:
      "Artigo editorial sobre o estado atual da alfabetização na idade certa no Brasil pós-pandemia, com leitura crítica dos resultados das principais avaliações e proposições técnicas para gestores municipais e estaduais que estão organizando seus planos de recomposição.",
    meta: ["Previsto · 2026", "Artigo editorial", "Direção Científica NTC"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-artigo-alfabetizacao" },
  },
  {
    vert: "sau",
    imagemUrl: "/img/fotos/_optimized/conteudo-03.1920.webp",
    tipoTag: "Webinar",
    prep: "Em preparação editorial",
    eyebrow: "NTC Saúde · Atenção Primária",
    titulo:
      "Previne Brasil 2026: o financiamento da APS e o que muda para os municípios.",
    descricao:
      "Webinar executivo sobre a arquitetura atual do financiamento da Atenção Primária à Saúde no Brasil, os efeitos das mudanças recentes do programa Previne Brasil sobre a operação das equipes de Saúde da Família e os caminhos de planejamento para a gestão municipal.",
    meta: ["Previsto · 2026", "Webinar executivo", "Equipe Técnica NTC Saúde"],
    soonTag: { texto: "Em breve · curadoria em andamento", cmsLink: "destaque-webinar-previne" },
  },
];

// ----------------- BIBLIOTECA (9 cards filtráveis) -----------------

export interface OpcaoTab {
  value: "all" | VerticalConteudo;
  label: string;
}

export interface OpcaoTipo {
  value: "all" | TipoConteudo;
  label: string;
}

export interface CardBiblioteca {
  vert: VerticalConteudo;
  tipo: TipoConteudo;
  search: string;
  verticalLabel: string;
  tipoLabel: string;
  prep: string;
  titulo: string;
  descricao: string;
  meta: [string, string];
  authorPrefix: string;
  authorBold: string;
  linkSoon: { texto: string; cmsLink: string };
}

export const BIBLIOTECA_HEAD = {
  eyebrow: "Biblioteca editorial",
  tituloHtml: "O acervo editorial <em>filtrável</em> do Grupo NTC.",
  intro:
    "Use a busca e os filtros para encontrar conteúdos por palavra-chave, vertical formativa ou tipo editorial. A biblioteca apresenta a linha editorial em construção pela curadoria — cada conteúdo será disponibilizado a partir do momento em que estiver finalizado.",
  note:
    "Acervo em construção · conteúdos sendo finalizados pela curadoria editorial",
};

export const TABS_VERTICAL: OpcaoTab[] = [
  { value: "all", label: "Todos" },
  { value: "edu", label: "Educação" },
  { value: "gov", label: "Gestão Pública" },
  { value: "sau", label: "Saúde" },
  { value: "trans", label: "Transversais" },
];

export const FILTROS_TIPO: OpcaoTipo[] = [
  { value: "all", label: "Todos os tipos" },
  { value: "estudo", label: "Estudos" },
  { value: "artigo", label: "Artigos" },
  { value: "nota", label: "Notas técnicas" },
  { value: "webinar", label: "Webinars" },
  { value: "material", label: "Materiais" },
];

export const BIBLIOTECA_SEARCH_PLACEHOLDER =
  "Buscar por título, tema ou palavra-chave...";

export const CARDS_BIBLIOTECA: CardBiblioteca[] = [
  {
    vert: "gov",
    tipo: "estudo",
    search: "14133 contratacoes lei licitacoes governo",
    verticalLabel: "NTC Gestão Pública",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo: "Cinco anos de Lei 14.133: o que mudou nas redes.",
    descricao:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações nos órgãos públicos brasileiros, com diagnóstico, riscos e frentes em disputa.",
    meta: ["Previsto · 2026", "Formato longo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Gestão Pública",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-14133" },
  },
  {
    vert: "edu",
    tipo: "artigo",
    search: "alfabetizacao educacao recomposicao pear",
    verticalLabel: "NTC Educação",
    tipoLabel: "Artigo",
    prep: "Em preparação editorial",
    titulo: "Recomposição da aprendizagem: o que os dados estão dizendo.",
    descricao:
      "Leitura crítica dos resultados de avaliações nacionais e proposições técnicas para redes que estão organizando seus planos de recomposição.",
    meta: ["Previsto · 2026", "Artigo editorial"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-artigo-alfabetizacao" },
  },
  {
    vert: "sau",
    tipo: "webinar",
    search: "previne brasil aps atencao primaria financiamento sus",
    verticalLabel: "NTC Saúde",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo: "Previne Brasil 2026: financiamento da APS e o que muda.",
    descricao:
      "Webinar executivo sobre a arquitetura atual do financiamento da APS e os caminhos de planejamento municipal.",
    meta: ["Previsto · 2026", "Webinar executivo"],
    authorPrefix: "Equipe",
    authorBold: "NTC Saúde",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-previne" },
  },
  {
    vert: "trans",
    tipo: "nota",
    search: "ia inteligencia artificial dados governanca digital",
    verticalLabel: "Transversal",
    tipoLabel: "Nota técnica",
    prep: "Em preparação editorial",
    titulo: "IA generativa no setor público: limites e oportunidades.",
    descricao:
      "Nota técnica sobre o estado atual da incorporação de inteligência artificial generativa pelos órgãos da administração pública brasileira, com leitura crítica de riscos.",
    meta: ["Previsto · 2026", "Nota técnica"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-nota-ia" },
  },
  {
    vert: "edu",
    tipo: "estudo",
    search: "educacao integral pei tempo integral",
    verticalLabel: "NTC Educação",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo:
      "Educação integral em escala: leitura institucional da Lei 14.640/2023.",
    descricao:
      "Estudo sobre a implementação da política de educação em tempo integral nas redes públicas brasileiras após a sanção da Lei 14.640/2023.",
    meta: ["Previsto · 2026", "Estudo longo"],
    authorPrefix: "Equipe",
    authorBold: "NTC Educação",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-pei" },
  },
  {
    vert: "gov",
    tipo: "webinar",
    search: "lidera direcao estrategica governo gestao publica",
    verticalLabel: "NTC Gestão Pública",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo: "A direção estratégica na administração pública contemporânea.",
    descricao:
      "Webinar executivo sobre direção institucional, articulação federativa e leitura de cenário para dirigentes da administração pública brasileira.",
    meta: ["Previsto · 2026", "Webinar executivo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Gestão Pública",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-lidera" },
  },
  {
    vert: "sau",
    tipo: "estudo",
    search: "prosus alta gestao sus diretor estadual municipal",
    verticalLabel: "NTC Saúde",
    tipoLabel: "Estudo",
    prep: "Em preparação editorial",
    titulo: "Direção institucional em saúde pública: o estado da arte.",
    descricao:
      "Estudo sobre o desenho da direção institucional do SUS no Brasil — competências, governança, articulação federativa e gargalos de capacidade técnica.",
    meta: ["Previsto · 2026", "Estudo longo"],
    authorPrefix: "Curadoria",
    authorBold: "NTC Saúde",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-estudo-prosus" },
  },
  {
    vert: "trans",
    tipo: "webinar",
    search: "dados governanca lgpd transversal politicas publicas",
    verticalLabel: "Transversal",
    tipoLabel: "Webinar",
    prep: "Em preparação editorial",
    titulo:
      "Governança de dados no setor público: LGPD e a operação cotidiana.",
    descricao:
      "Webinar transversal sobre a aplicação da LGPD na rotina das três áreas — Educação, Gestão Pública e Saúde — com foco em dilemas concretos da operação.",
    meta: ["Previsto · 2026", "Webinar transversal"],
    authorPrefix: "Direção",
    authorBold: "Científica NTC",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-webinar-lgpd" },
  },
  {
    vert: "edu",
    tipo: "material",
    search: "primeira infancia pinei educacao infantil creche bncc",
    verticalLabel: "NTC Educação",
    tipoLabel: "Material didático",
    prep: "Em preparação editorial",
    titulo:
      "Primeira infância e educação infantil: kit de planejamento de rede.",
    descricao:
      "Material didático para gestores municipais — fluxos, indicadores, modelos e referências para o planejamento da política de creches e pré-escolas.",
    meta: ["Previsto · 2026", "Kit institucional"],
    authorPrefix: "Equipe",
    authorBold: "NTC Educação",
    linkSoon: { texto: "Em breve", cmsLink: "conteudo-material-pinei" },
  },
];

export const BIBLIOTECA_EMPTY =
  "Nenhum conteúdo encontrado com os filtros atuais. Limpe a busca ou troque a aba para ampliar a seleção.";

export const BIBLIOTECA_FOOTER = {
  nota:
    "Cadastre-se no Boletim NTC para ser avisado quando cada conteúdo for publicado",
  cta: {
    texto: "Receber por e-mail quando publicarmos",
    href: "#newsletter",
    cmsLink: "cta-newsletter",
    track: "cont_cta_newsletter",
    arrow: true,
    classe: "btn btn--primary",
  } as LinkInterno,
};
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona DESTAQUES (3) + BIBLIOTECA (9 cards) em conteudoConteudos.ts

DESTAQUES com 3 cards (vert gov/edu/sau, imagens conteudo-01/02/03,
tipos Estudo/Artigo/Webinar, meta 3 itens, soonTag).

BIBLIOTECA com 9 cards de tipos diversos (estudo/artigo/webinar/nota/
material) × verticais (edu/gov/sau/trans). Inclui TABS_VERTICAL (5),
FILTROS_TIPO (6), search placeholder, empty text, footer com CTA newsletter.

Cada card preserva data-vert, data-type, data-search, verticalLabel,
tipoLabel, prep, titulo, descricao, meta [2], authorPrefix+authorBold,
linkSoon.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `conteudoConteudos.ts` parte 3 — TIPOS + VERTICAIS + NEWSLETTER + FAQ + CTA + STICKY

**Files:**
- Modify: `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`

- [ ] **Step 1: Adicionar as 6 últimas constantes ao final**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`.

old_string (final do BIBLIOTECA_FOOTER fechando):
```
export const BIBLIOTECA_FOOTER = {
  nota:
    "Cadastre-se no Boletim NTC para ser avisado quando cada conteúdo for publicado",
  cta: {
    texto: "Receber por e-mail quando publicarmos",
    href: "#newsletter",
    cmsLink: "cta-newsletter",
    track: "cont_cta_newsletter",
    arrow: true,
    classe: "btn btn--primary",
  } as LinkInterno,
};
```

new_string:
```
export const BIBLIOTECA_FOOTER = {
  nota:
    "Cadastre-se no Boletim NTC para ser avisado quando cada conteúdo for publicado",
  cta: {
    texto: "Receber por e-mail quando publicarmos",
    href: "#newsletter",
    cmsLink: "cta-newsletter",
    track: "cont_cta_newsletter",
    arrow: true,
    classe: "btn btn--primary",
  } as LinkInterno,
};

// ----------------- 5 TIPOS EDITORIAIS -----------------

export interface TipoEditorial {
  num: string;
  titulo: string;
  descricao: string;
  tag: string;
}

export const TIPOS_HEAD = {
  eyebrow: "Tipos editoriais institucionais",
  tituloHtml: "Cinco formatos para <em>cada momento</em> da operação pública.",
  intro:
    "A biblioteca NTC se organiza em cinco formatos editoriais complementares. Cada um responde a um tipo distinto de pergunta institucional — do diagnóstico estruturado ao apoio operacional cotidiano.",
};

export const TIPOS_EDITORIAIS: TipoEditorial[] = [
  {
    num: "01",
    titulo: "Artigos",
    descricao:
      "Posições técnicas autorais sobre temas em discussão. Texto editorial fundamentado, leitura média de 12 a 25 minutos, autoria institucional.",
    tag: "Posição · análise · leitura",
  },
  {
    num: "02",
    titulo: "Estudos",
    descricao:
      "Pesquisas longas com leitura empírica da administração pública — diagnósticos de campo, séries históricas, leitura de indicadores. PDF de 30 a 80 páginas.",
    tag: "Diagnóstico · pesquisa · profundidade",
  },
  {
    num: "03",
    titulo: "Notas técnicas",
    descricao:
      "Pareceres editoriais curtos sobre temas pontuais — uma decisão de tribunal, uma alteração legal, um novo programa federal. Foco em utilidade decisória.",
    tag: "Parecer · decisório · objetividade",
  },
  {
    num: "04",
    titulo: "Webinars",
    descricao:
      "Encontros formativos abertos, com transmissão pelo EventOn, materiais editoriais sincronizados e replay disponível para os inscritos pelos prazos previstos.",
    tag: "Ao vivo · replay · formação",
  },
  {
    num: "05",
    titulo: "Materiais didáticos",
    descricao:
      "Kits operacionais — checklists, fluxos, modelos e roteiros — para apoiar a aplicação cotidiana de políticas, normas e procedimentos pela equipe técnica.",
    tag: "Operacional · prático · download",
  },
];

// ----------------- CURADORIA POR VERTICAL (3) -----------------

export interface VertCard {
  vert: "edu" | "gov" | "sau";
  bandMark: string;
  bandNum: string;
  titulo: string;
  descricao: string;
  listaHtml: string[];
  link: LinkInterno;
}

export const VERTICAIS_HEAD = {
  eyebrow: "Curadoria editorial por vertical",
  tituloHtml: "Três trilhas editoriais, <em>uma só doutrina</em>.",
  intro:
    "Cada vertical formativa do Grupo NTC opera também como linha editorial — com equipe técnica dedicada à produção de conteúdo, calendário próprio de publicação e diálogo direto com os programas estratégicos.",
};

export const VERT_CARDS: VertCard[] = [
  {
    vert: "edu",
    bandMark: "NTC Educação",
    bandNum: "01",
    titulo: "Educação pública em circulação",
    descricao:
      "Acervo dedicado à formação institucional de redes de ensino — alfabetização, gestão escolar, inclusão, educação integral, educação digital e primeira infância.",
    listaHtml: [
      "<strong>3</strong> conteúdos em preparação editorial",
      "<strong>9</strong> programas estratégicos relacionados",
      "<strong>Equipe Técnica NTC Educação</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "cont_vert_click",
    },
  },
  {
    vert: "gov",
    bandMark: "NTC Gestão Pública",
    bandNum: "02",
    titulo: "Direção e governança em pauta",
    descricao:
      "Acervo dedicado à alta gestão da administração pública brasileira — Lei 14.133/2021, direção estratégica, governança institucional e sistemas administrativos.",
    listaHtml: [
      "<strong>2</strong> conteúdos em preparação editorial",
      "<strong>3</strong> programas estratégicos relacionados",
      "<strong>Curadoria NTC Gestão Pública</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "cont_vert_click",
    },
  },
  {
    vert: "sau",
    bandMark: "NTC Saúde",
    bandNum: "03",
    titulo: "Inteligência institucional para o SUS",
    descricao:
      "Acervo dedicado ao Sistema Único de Saúde — atenção primária resolutiva, redes territoriais, gestão integrada e direção institucional da saúde pública.",
    listaHtml: [
      "<strong>2</strong> conteúdos em preparação editorial",
      "<strong>3</strong> programas estratégicos relacionados",
      "<strong>Equipe Técnica NTC Saúde</strong>",
    ],
    link: {
      texto: "Conhecer a vertical",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "cont_vert_click",
    },
  },
];

// ----------------- NEWSLETTER -----------------

export const NEWSLETTER_TEXT = {
  eyebrow: "Boletim NTC",
  tituloHtml:
    "Receba a inteligência <em>editorial</em> da NTC<br>direto na sua caixa.",
  paragrafosHtml: [
    "O <strong>Boletim NTC</strong> é a curadoria mensal da Direção Científica do Instituto — uma seleção comentada dos conteúdos mais relevantes do período, organizada por vertical formativa. Sem rastreio de comportamento, sem ofertas comerciais, sem ruído.",
    "Você escolhe se quer receber tudo ou apenas a vertical que interessa ao seu cenário institucional — e pode descadastrar a qualquer momento pelo link no rodapé de cada edição.",
  ],
  pills: [
    "Curadoria mensal",
    "Sem rastreio",
    "Por vertical",
    "Descadastro livre",
  ],
};

export const NEWSLETTER_FORM = {
  labels: {
    nome: "Nome completo",
    email: "E-mail institucional",
    vertical: "Vertical de interesse",
    orgao: "Órgão ou instituição",
  },
  placeholders: {
    nome: "Como prefere ser chamado(a)",
    email: "nome@orgao.gov.br",
    orgao: "Município, estado, autarquia...",
  },
  verticais: [
    { value: "todas", label: "Todas as verticais" },
    { value: "educacao", label: "NTC Educação" },
    { value: "gestao", label: "NTC Gestão Pública" },
    { value: "saude", label: "NTC Saúde" },
    { value: "transversal", label: "Apenas transversais" },
  ],
  consentHtml:
    'Concordo em receber o Boletim NTC e autorizo o tratamento dos meus dados para essa finalidade, nos termos da <a href="/lgpd" data-cms-link="legal-lgpd">Política de Privacidade · LGPD</a> do Instituto NTC do Brasil. Posso descadastrar a qualquer momento.',
  botaoTexto: "Assinar o Boletim NTC",
  msgOk:
    "Inscrição realizada. Confirme no e-mail que enviaremos a seguir.",
  msgErr: "Verifique os campos obrigatórios.",
};

// ----------------- FAQ (8 itens) -----------------

export interface ItemFaq {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export const FAQ_HEAD = {
  eyebrow: "Perguntas frequentes",
  tituloHtml: "O que <em>perguntam</em> sobre os Conteúdos NTC.",
  intro:
    "Reunimos oito perguntas frequentes sobre o acervo editorial — política de acesso, licenciamento, certificação, replays, contribuições externas e privacidade.",
};

export const FAQ_CONTEUDOS: ItemFaq[] = [
  {
    id: "cont-faq-1",
    pergunta: "Os conteúdos são abertos ao público?",
    respostaHtml:
      '<p>Sim. Parte do acervo editorial do Grupo NTC — artigos, notas técnicas, estudos e materiais didáticos — será disponibilizada ao público sem login obrigatório, conforme a política editorial de publicação.</p><p>Webinars com replay e alguns materiais didáticos exclusivos podem exigir cadastro no <a href="/o-grupo#eventon" data-cms-link="eventon-home">EventOn</a> — sem cobrança e apenas para identificação do servidor, em coerência com a Área do Participante.</p>',
  },
  {
    id: "cont-faq-2",
    pergunta: "Posso citar os conteúdos NTC em meus trabalhos?",
    respostaHtml:
      '<p>Sim, e ficamos honrados quando isso acontece. Os conteúdos podem ser citados com atribuição à frente editorial responsável (Curadoria, Direção Científica ou Equipe Técnica da vertical correspondente), título completo, ano de publicação e URL.</p><p>A reprodução integral, adaptação, incorporação em materiais comerciais ou uso institucional em larga escala depende de autorização prévia do Instituto NTC do Brasil. Para esses casos, entre em contato pelo <a href="/contato" data-cms-link="atendimento-licenciamento">canal de atendimento institucional</a>.</p>',
  },
  {
    id: "cont-faq-3",
    pergunta: "Webinars geram certificado?",
    respostaHtml:
      '<p>Webinars abertos publicados na biblioteca, em formato editorial, não geram certificado de horas — são publicação institucional de acesso livre.</p><p>Já os <strong>eventos abertos da Agenda</strong> (turmas regulares com data, ementa e inscrição) geram certificado oficial NTC pela plataforma EventOn. Veja a <a href="/agenda" data-cms-link="agenda-completa">Agenda Geral</a> para os eventos certificáveis.</p>',
  },
  {
    id: "cont-faq-4",
    pergunta: "Os replays ficam disponíveis para sempre?",
    respostaHtml:
      "<p>Os replays de webinars abertos publicados na biblioteca ficam disponíveis pelo período declarado em cada card — geralmente entre 6 e 24 meses após a transmissão original.</p><p>Conteúdos retirados de circulação por desatualização técnica ou jurídica permanecem catalogados internamente, mas deixam de estar acessíveis publicamente para evitar a circulação de informação obsoleta na administração pública.</p>",
  },
  {
    id: "cont-faq-5",
    pergunta: "Quem escreve os conteúdos? Por que autoria institucional?",
    respostaHtml:
      "<p>Os conteúdos são produzidos por três frentes editoriais do Instituto NTC do Brasil: a <strong>Curadoria</strong> (linha editorial geral e Gestão Pública), a <strong>Direção Científica</strong> (transversal e temas estratégicos) e as <strong>Equipes Técnicas</strong> das três verticais (Educação, Gestão Pública e Saúde).</p><p>A autoria institucional é uma escolha editorial: cada conteúdo passa por revisão técnica coletiva antes de ser publicado e expressa a posição da frente editorial, não a opinião individual de quem o redigiu. Quando há contribuição autoral de um especialista externo, a co-autoria é declarada no início do texto.</p>",
  },
  {
    id: "cont-faq-6",
    pergunta: "É possível propor um tema para a biblioteca?",
    respostaHtml:
      '<p>Sim. Servidores, dirigentes, pesquisadores e equipes técnicas das três áreas podem propor temas pelo <a href="/contato" data-cms-link="atendimento-editorial">canal de atendimento institucional</a>, indicando o tipo desejado (artigo, estudo, nota técnica ou webinar) e o problema institucional concreto que motiva a sugestão.</p><p>A curadoria editorial avalia a proposta e responde se entra ou não no planejamento editorial — sempre com explicação técnica, mesmo nos casos negativos.</p>',
  },
  {
    id: "cont-faq-7",
    pergunta: "Os conteúdos têm versão em outros idiomas?",
    respostaHtml:
      "<p>A biblioteca NTC publica em português brasileiro. Alguns estudos transversais relevantes ao debate latino-americano podem ser publicados também em espanhol — sempre indicado no card do conteúdo.</p><p>Não traduzimos por demanda automática para outras línguas. Em contratações institucionais dedicadas, pode haver versão localizada conforme o público da formação.</p>",
  },
  {
    id: "cont-faq-8",
    pergunta: "A NTC respeita a LGPD nos cadastros da biblioteca?",
    respostaHtml:
      '<p>Sim. O Instituto NTC do Brasil é controlador dos dados pessoais coletados pelo Boletim NTC e pelos cadastros do EventOn, sob a Lei 13.709/2018 (LGPD). Os dados são tratados exclusivamente para a finalidade da comunicação editorial e do acesso aos conteúdos, e não são compartilhados com terceiros para fins comerciais.</p><p>Você pode solicitar acesso, retificação ou exclusão dos seus dados a qualquer momento pelo encarregado de dados (DPO) indicado na <a href="/lgpd" data-cms-link="legal-lgpd">Política de Privacidade · LGPD</a>.</p>',
  },
];

// ----------------- CTA FINAL (3 pontes) -----------------

export interface PonteCta {
  ponte: "agenda" | "solucoes" | "docentes";
  eyebrow: string;
  titulo: string;
  descricao: string;
  link: LinkInterno;
}

export const CTA_FINAL_HEAD = {
  eyebrow: "Próximo passo",
  tituloHtml: "Depois da leitura, vem o <em>encontro</em>.",
  intro:
    "Os Conteúdos são a entrada editorial do Grupo NTC — a partir deles, você pode aprofundar pela Agenda formativa, contratar uma formação institucional dedicada ou conhecer quem efetivamente assina a curadoria.",
};

export const CTA_FINAL_PONTES: PonteCta[] = [
  {
    ponte: "agenda",
    eyebrow: "Agenda formativa",
    titulo: "Ir para os eventos abertos",
    descricao:
      "Inscrição em turmas regulares — online, híbridas e presenciais — com certificado oficial NTC e replay no EventOn.",
    link: {
      texto: "Ver Agenda Geral",
      href: "/agenda",
      cmsLink: "agenda-completa",
      track: "cont_cta_agenda",
    },
  },
  {
    ponte: "solucoes",
    eyebrow: "Contratação institucional",
    titulo: "Conhecer Soluções dedicadas",
    descricao:
      "In company, turmas fechadas, sob medida e trilhas — para órgãos que precisam de formação institucional dedicada.",
    link: {
      texto: "Ir para Soluções",
      href: "/solucoes",
      cmsLink: "pagina-solucoes",
      track: "cont_cta_solucoes",
    },
  },
  {
    ponte: "docentes",
    eyebrow: "Curadoria científica",
    titulo: "Conhecer o corpo docente",
    descricao:
      "Especialistas, autoridades públicas, juristas, gestores, pesquisadores e docentes de referência nacional articulados pela curadoria NTC.",
    link: {
      texto: "Conhecer o corpo docente",
      href: "/o-grupo/corpo-docente",
      cmsLink: "pagina-corpo-docente",
      track: "cont_cta_docentes",
    },
  },
];

// ----------------- STICKY CTA MOBILE -----------------

export const STICKY_CTA_CONTEUDOS = {
  cta: {
    texto: "Assinar Boletim NTC",
    href: "#newsletter",
    cmsLink: "cta-newsletter-sticky",
    track: "cont_sticky_cta",
    arrow: true,
    classe: "btn btn--gold",
  } as LinkInterno,
};
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona TIPOS+VERTICAIS+NEWSLETTER+FAQ+CTA+STICKY

Completa conteudoConteudos.ts com:
- TIPOS_EDITORIAIS (5 cards: Artigos/Estudos/Notas técnicas/Webinars/Materiais).
- VERT_CARDS (3 cards: Educação/Gestão Pública/Saúde) com listaHtml e link
  para /solucoes-estrategicas/<slug>.
- NEWSLETTER_TEXT (eyebrow + título + 2 parágrafos + 4 pills) e
  NEWSLETTER_FORM (labels, placeholders, 5 verticais, consentHtml com
  link /lgpd, botão, msgOk, msgErr).
- FAQ_CONTEUDOS (8 perguntas com respostaHtml contendo <strong> e <a>;
  links atualizados para /o-grupo#eventon, /contato, /agenda, /lgpd).
- CTA_FINAL_PONTES (3 cards: Agenda /agenda, Soluções /solucoes,
  Corpo docente /o-grupo/corpo-docente).
- STICKY_CTA_CONTEUDOS (CTA Assinar Boletim NTC → #newsletter).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Criar `StickyCtaConteudos.tsx` client

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/StickyCtaConteudos.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/StickyCtaConteudos.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA_CONTEUDOS } from "./conteudoConteudos";

/**
 * Sticky CTA mobile da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2478-2497 de 28_Pagina_Conteudos_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

export function StickyCtaConteudos() {
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
    track("cont_sticky_cta_dismissed", { page: "conteudos" });
  };

  const { cta } = STICKY_CTA_CONTEUDOS;

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
        className={cta.classe ?? "btn btn--gold"}
        href={cta.href}
        data-cms-link={cta.cmsLink}
        data-track={cta.track}
      >
        {cta.texto}
        {cta.arrow && <span className="btn-arrow"> →</span>}
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

Expected: passa. Warnings em `_action`/`_payload` aceitáveis.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(conteudos)/conteudos/StickyCtaConteudos.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona StickyCtaConteudos client component

Espelha o IIFE de sticky CTA do protótipo: aparece após scroll > 800px,
dismiss local (sem sessionStorage). Usa rAF para debounce e track() no-op
para futura integração GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Criar `FaqAcordeao.tsx` client

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/FaqAcordeao.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/FaqAcordeao.tsx`:

```tsx
"use client";

import { useState } from "react";

import type { ItemFaq } from "./conteudoConteudos";

/**
 * FAQ acordeão da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2462-2476 de 28_Pagina_Conteudos_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<article class="cont-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqAcordeaoProps {
  itens: ItemFaq[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("cont_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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
            className={`cont-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="cont-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="cont-faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="cont-faq-body" id={item.id}>
              <div
                className="cont-faq-body-inner"
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
git add "apps/web/app/(conteudos)/conteudos/FaqAcordeao.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona FaqAcordeao client component

Espelha o IIFE de FAQ accordion do protótipo: estado interno
Set<string> com ids abertos (vazio inicial — todos fechados),
aria-expanded reativo, ícone `+` rotacionado via CSS .is-open,
respostaHtml renderizada com dangerouslySetInnerHTML dentro do
.cont-faq-body-inner. Track no-op para futura GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `NewsletterForm.tsx` client

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";

import { NEWSLETTER_FORM } from "./conteudoConteudos";

/**
 * Newsletter form da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2652-2681 de 28_Pagina_Conteudos_v1.html):
 *
 * - 4 campos (nome, email, vertical select, orgão opcional) + checkbox consent.
 * - Validação inline: nome obrigatório, email regex, consent obrigatório.
 * - Submit é MOCK — não chama API real. Apenas exibe mensagem ok/err.
 * - Mensagem `is-visible` controlada por estado.
 *
 * TODO: futuro CMS — POSTar para endpoint de newsletter (Resend, p.ex.).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

type Status = "idle" | "ok" | "err";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const nome = String(data.get("nome") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const vertical = String(data.get("vertical") ?? "");
    const orgao = String(data.get("orgao") ?? "").trim();
    const consent = data.get("consent") === "on";

    const validEmail = EMAIL_REGEX.test(email);

    if (!nome || !validEmail || !consent) {
      setStatus("err");
      track("cont_newsletter_error", { hasName: !!nome, validEmail, consent });
      return;
    }

    setStatus("ok");
    track("cont_newsletter_subscribe", { vertical, hasOrg: !!orgao });
    form.reset();
  };

  return (
    <form
      ref={formRef}
      className="cont-newsletter-form"
      id="contNewsletterForm"
      noValidate
      onSubmit={onSubmit}
    >
      <div>
        <label htmlFor="newsletter-nome">{NEWSLETTER_FORM.labels.nome}</label>
        <input
          id="newsletter-nome"
          name="nome"
          type="text"
          placeholder={NEWSLETTER_FORM.placeholders.nome}
          autoComplete="name"
          required
        />
      </div>
      <div>
        <label htmlFor="newsletter-email">{NEWSLETTER_FORM.labels.email}</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder={NEWSLETTER_FORM.placeholders.email}
          autoComplete="email"
          required
        />
      </div>
      <div className="cont-newsletter-form-row">
        <div>
          <label htmlFor="newsletter-vertical">{NEWSLETTER_FORM.labels.vertical}</label>
          <select id="newsletter-vertical" name="vertical" defaultValue="todas">
            {NEWSLETTER_FORM.verticais.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="newsletter-org">{NEWSLETTER_FORM.labels.orgao}</label>
          <input
            id="newsletter-org"
            name="orgao"
            type="text"
            placeholder={NEWSLETTER_FORM.placeholders.orgao}
          />
        </div>
      </div>
      <label className="cont-newsletter-consent">
        <input type="checkbox" name="consent" required />
        <span dangerouslySetInnerHTML={{ __html: NEWSLETTER_FORM.consentHtml }} />
      </label>
      <button type="submit" className="btn btn--gold">
        {NEWSLETTER_FORM.botaoTexto} <span className="btn-arrow">→</span>
      </button>
      <div
        className={`cont-newsletter-msg success${status === "ok" ? " is-visible" : ""}`}
        id="contNewsletterMsgOk"
      >
        {NEWSLETTER_FORM.msgOk}
      </div>
      <div
        className={`cont-newsletter-msg error${status === "err" ? " is-visible" : ""}`}
        id="contNewsletterMsgErr"
      >
        {NEWSLETTER_FORM.msgErr}
      </div>
    </form>
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
git add "apps/web/app/(conteudos)/conteudos/NewsletterForm.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona NewsletterForm client (mock validação inline)

Espelha o IIFE de newsletter do protótipo: 4 campos (nome+email+vertical
select+orgao opcional) + checkbox consent. Validação inline: nome não vazio,
email via regex, consent obrigatório. Submit é MOCK — apenas exibe mensagem
ok/err. TODO marcado para futura integração CMS/Resend.

Consent text via dangerouslySetInnerHTML para preservar <a href="/lgpd">.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Criar `SubnavSticky.tsx` client

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/SubnavSticky.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/SubnavSticky.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import type { SubnavLink } from "./conteudoConteudos";

/**
 * Subnav sticky + active anchor highlight da página /conteudos.
 * Espelha o IIFE do protótipo (linhas 2619-2650 de
 * 28_Pagina_Conteudos_v1.html):
 *
 * - Quando o scroll passa do `offsetTop` original da nav, recebe
 *   classe `is-sticky` (CSS fixa via position: sticky).
 * - Active anchor: compara `getBoundingClientRect().top - (headerH +
 *   subnavH + 24)` de cada seção referenciada; a última cujo top é
 *   ≤ 0 é a seção ativa.
 * - Listeners scroll (passive) + resize.
 *
 * SSR: renderiza sem `is-sticky` / `is-active`. Toggles aplicados
 * apenas após o mount.
 */

interface SubnavStickyProps {
  label: string;
  links: SubnavLink[];
}

export function SubnavSticky({ label, links }: SubnavStickyProps) {
  const [sticky, setSticky] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const subnav = document.getElementById("contSubnav");
    if (!subnav) return;
    const sections = links
      .map((link) => document.querySelector(link.href) as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const subnavTop = subnav.offsetTop;

    const onScroll = () => {
      const y = window.scrollY;
      setSticky(y >= subnavTop - 1);
      const headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) || 88;
      const subnavH = subnav.offsetHeight;
      const margin = headerH + subnavH + 24;
      let nextActive: string | null = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top - margin <= 0) nextActive = s.id;
      }
      setActiveId(nextActive);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [links]);

  return (
    <nav
      className={`cont-subnav${sticky ? " is-sticky" : ""}`}
      id="contSubnav"
      aria-label="Navegação interna de Conteúdos"
    >
      <div className="container">
        <div className="cont-subnav-inner">
          <span className="cont-subnav-label">{label}</span>
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                data-cms-link={link.cmsLink}
                className={ativo ? "is-active" : undefined}
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
git add "apps/web/app/(conteudos)/conteudos/SubnavSticky.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona SubnavSticky client (sticky + active anchor)

Espelha o IIFE de subnav do protótipo: mede offsetTop no mount, listener
scroll (passive) toggles classe is-sticky quando scroll passa do topo,
computa active anchor via getBoundingClientRect com margem do header.

SSR-safe: renderiza sem is-sticky / is-active; toggles só após mount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Criar `BibliotecaConteudos.tsx` client (núcleo da listagem)

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type CardBiblioteca,
  type OpcaoTab,
  type OpcaoTipo,
  type TipoConteudo,
  type VerticalConteudo,
  BIBLIOTECA_EMPTY,
  BIBLIOTECA_FOOTER,
  BIBLIOTECA_SEARCH_PLACEHOLDER,
  FILTROS_TIPO,
  TABS_VERTICAL,
} from "./conteudoConteudos";

/**
 * Biblioteca filtrável de /conteudos. Espelha o IIFE do protótipo
 * (linhas 2518-2617 de 28_Pagina_Conteudos_v1.html):
 *
 * - Tabs vertical (5) + filtros tipo (6) + busca debounced 180ms.
 * - URL sync via history.replaceState: ?vertical=&tipo=&q=
 *   (defaults all/all/empty são omitidos).
 * - Busca normalizada (lowercase + NFD strip diacritics) contra
 *   data-search + título + descrição.
 * - Counter dinâmico ("N conteúdos em preparação").
 * - Empty state quando shown === 0.
 * - Hidratação inicial: lê querystring e aplica.
 *
 * Estratégia render: todos os cards permanecem no DOM, recebem
 * className "is-hidden" quando filtrados (paridade com CSS do
 * protótipo, que define `.cont-card.is-hidden { display: none }`).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

interface BibliotecaConteudosProps {
  cards: CardBiblioteca[];
  head: {
    eyebrow: string;
    tituloHtml: string;
    intro: string;
    note: string;
  };
}

interface EstadoBiblioteca {
  vert: "all" | VerticalConteudo;
  tipo: "all" | TipoConteudo;
  busca: string;
}

const ESTADO_INICIAL: EstadoBiblioteca = {
  vert: "all",
  tipo: "all",
  busca: "",
};

function readURL(): Partial<EstadoBiblioteca> {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<EstadoBiblioteca> = {};
  const v = p.get("vertical");
  if (v && TABS_VERTICAL.some((t) => t.value === v && t.value !== "all")) {
    out.vert = v as VerticalConteudo;
  }
  const tp = p.get("tipo");
  if (tp && FILTROS_TIPO.some((f) => f.value === tp && f.value !== "all")) {
    out.tipo = tp as TipoConteudo;
  }
  const q = p.get("q");
  if (q) out.busca = q;
  return out;
}

function writeURL(state: EstadoBiblioteca): void {
  if (typeof window === "undefined") return;
  const p = new URLSearchParams();
  if (state.vert !== "all") p.set("vertical", state.vert);
  if (state.tipo !== "all") p.set("tipo", state.tipo);
  if (state.busca.trim().length >= 2) p.set("q", state.busca.trim());
  const qs = p.toString();
  const url =
    window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
  window.history.replaceState(null, "", url);
}

export function BibliotecaConteudos({ cards, head }: BibliotecaConteudosProps) {
  const [state, setState] = useState<EstadoBiblioteca>(ESTADO_INICIAL);
  const [buscaLocal, setBuscaLocal] = useState("");
  const [hidratado, setHidratado] = useState(false);
  const buscaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fromUrl = readURL();
    if (Object.keys(fromUrl).length > 0) {
      setState((s) => ({ ...s, ...fromUrl }));
      if (fromUrl.busca) setBuscaLocal(fromUrl.busca);
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState((s) =>
        s.busca === buscaLocal ? s : { ...s, busca: buscaLocal },
      );
      if (buscaLocal !== state.busca) {
        track("cont_search", { q: buscaLocal.slice(0, 60) });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [buscaLocal, state.busca]);

  useEffect(() => {
    if (!hidratado) return;
    writeURL(state);
  }, [state, hidratado]);

  const visiveis = useMemo(() => {
    const q = norm(state.busca.trim());
    return cards.map((card) => {
      const vOk = state.vert === "all" || card.vert === state.vert;
      const tOk = state.tipo === "all" || card.tipo === state.tipo;
      const haystack = norm(`${card.search} ${card.titulo} ${card.descricao}`);
      const qOk = q.length < 2 || haystack.includes(q);
      return { card, visible: vOk && tOk && qOk };
    });
  }, [cards, state]);

  const shown = visiveis.filter((v) => v.visible).length;

  return (
    <section
      className="cont-biblioteca"
      id="biblioteca"
      aria-label="Biblioteca filtravel do Grupo NTC"
    >
      <div className="container">
        <div className="section-head fade-in">
          <p className="eyebrow">{head.eyebrow}</p>
          <h2 dangerouslySetInnerHTML={{ __html: head.tituloHtml }} />
          <p className="intro">{head.intro}</p>
          <span className="cont-biblioteca-note">{head.note}</span>
        </div>

        <div className="cont-tabs fade-in" role="tablist" aria-label="Filtrar por vertical">
          {TABS_VERTICAL.map((tab: OpcaoTab) => {
            const ativa = state.vert === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                className={`cont-tab${ativa ? " is-active" : ""}`}
                data-vert={tab.value}
                role="tab"
                aria-selected={ativa}
                onClick={() => {
                  setState((s) => ({ ...s, vert: tab.value }));
                  track("cont_tab_change", { vert: tab.value });
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="cont-filterbar fade-in">
          <div className="cont-search">
            <input
              ref={buscaInputRef}
              id="contSearch"
              type="search"
              placeholder={BIBLIOTECA_SEARCH_PLACEHOLDER}
              aria-label="Buscar conteúdos"
              value={buscaLocal}
              onChange={(e) => setBuscaLocal(e.target.value)}
            />
          </div>
          <div
            className="cont-typefilter"
            role="group"
            aria-label="Filtrar por tipo"
          >
            {FILTROS_TIPO.map((f: OpcaoTipo) => {
              const ativa = state.tipo === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  className={ativa ? "is-active" : undefined}
                  data-type={f.value}
                  onClick={() => {
                    setState((s) => ({ ...s, tipo: f.value }));
                    track("cont_typefilter_change", { type: f.value });
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <div className="cont-filterbar-stats" id="contStats">
            <strong id="contCount">{shown}</strong> conteúdos em preparação
          </div>
        </div>

        <div className="cont-grid" id="contGrid">
          {visiveis.map(({ card, visible }, i) => (
            <article
              key={i}
              className={`cont-card${visible ? "" : " is-hidden"}`}
              data-vert={card.vert}
              data-type={card.tipo}
              data-search={card.search}
            >
              <div className="cont-card-band" aria-hidden="true" />
              <div className="cont-card-body">
                <div className="cont-card-tags">
                  <span className="cont-card-tag">{card.verticalLabel}</span>
                  <span className="cont-card-tag type">{card.tipoLabel}</span>
                </div>
                <span className="cont-card-prep">{card.prep}</span>
                <h3>{card.titulo}</h3>
                <p>{card.descricao}</p>
                <div className="cont-card-meta">
                  <span>{card.meta[0]}</span>
                  <span>{card.meta[1]}</span>
                </div>
              </div>
              <div className="cont-card-foot">
                <div className="author">
                  {card.authorPrefix}<strong>{card.authorBold}</strong>
                </div>
                <span
                  className="cont-card-link is-soon"
                  data-cms-link={card.linkSoon.cmsLink}
                >
                  {card.linkSoon.texto}
                </span>
              </div>
            </article>
          ))}
        </div>

        <p
          className={`cont-empty${shown === 0 ? " is-visible" : ""}`}
          id="contEmpty"
        >
          {BIBLIOTECA_EMPTY}
        </p>

        <div className="cont-biblioteca-foot fade-in">
          <p
            style={{
              fontFamily: "var(--font-cond)",
              fontSize: "12px",
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              color: "var(--grafite)",
              margin: "0 0 var(--space-3)",
            }}
          >
            {BIBLIOTECA_FOOTER.nota}
          </p>
          <a
            className={BIBLIOTECA_FOOTER.cta.classe}
            href={BIBLIOTECA_FOOTER.cta.href}
            data-cms-link={BIBLIOTECA_FOOTER.cta.cmsLink}
            data-track={BIBLIOTECA_FOOTER.cta.track}
          >
            {BIBLIOTECA_FOOTER.cta.texto}
            {BIBLIOTECA_FOOTER.cta.arrow && <span className="btn-arrow"> →</span>}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): adiciona BibliotecaConteudos client (filtros + URL sync)

Espelha o IIFE da biblioteca filtrável do protótipo:
- Estado { vert: "all"|VerticalConteudo, tipo: "all"|TipoConteudo, busca }.
- Tabs vertical (5) + filtros tipo (6) + busca debounced 180ms.
- Busca normalizada (lowercase + NFD strip diacritics).
- URL sync via history.replaceState (defaults omitidos).
- Hidratação inicial lê ?vertical=&tipo=&q= e valida contra opções.
- Estratégia "todos no DOM com is-hidden" para paridade com CSS portado.
- Counter dinâmico, empty state, footer com CTA newsletter.

Próximo commit monta page.tsx.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Criar `page.tsx` server (12 seções)

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/page.tsx`

- [ ] **Step 1: Criar o page.tsx**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(conteudos)/conteudos/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Fragment } from "react";

import {
  BIBLIOTECA_HEAD,
  CARDS_BIBLIOTECA,
  CTA_FINAL_HEAD,
  CTA_FINAL_PONTES,
  DESTAQUES,
  DESTAQUES_HEAD,
  FAQ_CONTEUDOS,
  FAQ_HEAD,
  HERO_CONTEUDOS,
  MANIFESTO_CONTEUDOS,
  METRICAS_CONTEUDO,
  NEWSLETTER_TEXT,
  SUBNAV_LABEL,
  SUBNAV_LINKS,
  TESE_HEAD,
  TESE_PILARES,
  TIPOS_EDITORIAIS,
  TIPOS_HEAD,
  VERTICAIS_HEAD,
  VERT_CARDS,
} from "./conteudoConteudos";
import { BibliotecaConteudos } from "./BibliotecaConteudos";
import { FaqAcordeao } from "./FaqAcordeao";
import { NewsletterForm } from "./NewsletterForm";
import { StickyCtaConteudos } from "./StickyCtaConteudos";
import { SubnavSticky } from "./SubnavSticky";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Conteúdos institucionais · Biblioteca editorial · Grupo NTC",
  description:
    "Artigos, estudos, notas técnicas, webinars e materiais didáticos produzidos pela curadoria científica das três verticais NTC — para servidores, dirigentes, juristas, pesquisadores e equipes técnicas da administração pública brasileira.",
};

/**
 * Página /conteudos — porta literal de 28_Pagina_Conteudos_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Hero institucional slim.
 *   2. Faixa de métricas editoriais (5).
 *   3. <SubnavSticky /> com 6 âncoras + sticky + active anchor.
 *   4. Manifesto editorial.
 *   5. Tese editorial (3 pilares).
 *   6. 3 destaques editoriais.
 *   7. <BibliotecaConteudos /> com 9 cards filtráveis + URL sync.
 *   8. 5 tipos editoriais.
 *   9. Curadoria por vertical (3).
 *   10. <NewsletterForm /> com validação inline mock.
 *   11. <FaqAcordeao /> com 8 perguntas.
 *   12. CTA final 3 pontes.
 *
 * Fora do <main>: <StickyCtaConteudos /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (conteudos).
 */
export default function ConteudosPage() {
  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Conteúdos">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Trilha de navegação">
              {HERO_CONTEUDOS.crumb.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < HERO_CONTEUDOS.crumb.length - 1 && <span className="sep" />}
                </Fragment>
              ))}
            </nav>
            <p className="eyebrow light">{HERO_CONTEUDOS.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: HERO_CONTEUDOS.tituloHtml }} />
            <p className="hero-page-sub">{HERO_CONTEUDOS.sub}</p>
            <div className="hero-quicklinks" aria-label="Atalhos rápidos">
              {HERO_CONTEUDOS.quicklinks.map((q) => (
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

        {/* 2. FAIXA DE MÉTRICAS EDITORIAIS */}
        <section
          className="cont-metrics"
          aria-label="Métricas editoriais do Grupo NTC"
        >
          <div className="container">
            <div className="cont-metrics-grid fade-in">
              {METRICAS_CONTEUDO.map((m) => (
                <div key={m.lbl} className="cont-metric">
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
        <SubnavSticky label={SUBNAV_LABEL} links={SUBNAV_LINKS} />

        {/* 4. MANIFESTO EDITORIAL */}
        <section
          className="cont-manifesto"
          aria-label="Manifesto editorial dos Conteúdos NTC"
        >
          <div className="container">
            <div className="cont-manifesto-inner fade-in">
              <p className="eyebrow gold">{MANIFESTO_CONTEUDOS.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: MANIFESTO_CONTEUDOS.tituloHtml }} />
              <p className="lede">{MANIFESTO_CONTEUDOS.lede}</p>
              <p>{MANIFESTO_CONTEUDOS.paragrafo}</p>
              <div className="cont-manifesto-marker">
                {MANIFESTO_CONTEUDOS.marker}
              </div>
            </div>
          </div>
        </section>

        {/* 5. TESE EDITORIAL (3 pilares) */}
        <section
          className="cont-thesis"
          aria-label="Pilares editoriais do Grupo NTC"
        >
          <div className="container cont-thesis-inner">
            <div className="cont-thesis-head fade-in">
              <p className="eyebrow gold">{TESE_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: TESE_HEAD.tituloHtml }} />
              <p>{TESE_HEAD.descricao}</p>
            </div>
            <div className="cont-thesis-grid fade-in">
              {TESE_PILARES.map((p) => (
                <article key={p.num} className="cont-thesis-pilar">
                  <span className="cont-thesis-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="cont-thesis-rule">{p.rule}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. 3 DESTAQUES EDITORIAIS */}
        <section
          className="cont-featured"
          id="destaques"
          aria-label="Destaques editoriais"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{DESTAQUES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: DESTAQUES_HEAD.tituloHtml }} />
              <p className="intro">{DESTAQUES_HEAD.intro}</p>
            </div>
            <div className="cont-featured-list fade-in">
              {DESTAQUES.map((d, i) => (
                <article
                  key={i}
                  className="cont-featured-card"
                  data-vert={d.vert}
                >
                  <div
                    className="cont-featured-figura"
                    style={{ backgroundImage: `url('${d.imagemUrl}')` }}
                  >
                    <span className="cont-featured-figura-tag">{d.tipoTag}</span>
                  </div>
                  <div className="cont-featured-body">
                    <span className="cont-featured-prep">{d.prep}</span>
                    <p className="cont-featured-eyebrow">{d.eyebrow}</p>
                    <h3>{d.titulo}</h3>
                    <p>{d.descricao}</p>
                    <div className="cont-featured-meta">
                      <span>{d.meta[0]}</span>
                      <span>{d.meta[1]}</span>
                      <span>{d.meta[2]}</span>
                    </div>
                    <span
                      className="cont-featured-soon"
                      data-cms-link={d.soonTag.cmsLink}
                    >
                      {d.soonTag.texto}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. BIBLIOTECA FILTRÁVEL */}
        <BibliotecaConteudos cards={CARDS_BIBLIOTECA} head={BIBLIOTECA_HEAD} />

        {/* 8. 5 TIPOS EDITORIAIS */}
        <section
          className="cont-tipos"
          id="tipos"
          aria-label="Tipos editoriais do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{TIPOS_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: TIPOS_HEAD.tituloHtml }} />
              <p className="intro">{TIPOS_HEAD.intro}</p>
            </div>
            <div className="cont-tipos-grid fade-in">
              {TIPOS_EDITORIAIS.map((t) => (
                <article key={t.num} className="cont-tipo">
                  <span className="cont-tipo-num">{t.num}</span>
                  <h3>{t.titulo}</h3>
                  <p>{t.descricao}</p>
                  <span className="cont-tipo-tag">{t.tag}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. CURADORIA POR VERTICAL (3) */}
        <section
          className="cont-verticais"
          id="verticais"
          aria-label="Curadoria editorial por vertical"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{VERTICAIS_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: VERTICAIS_HEAD.tituloHtml }} />
              <p className="intro">{VERTICAIS_HEAD.intro}</p>
            </div>
            <div className="cont-verticais-grid fade-in">
              {VERT_CARDS.map((v) => (
                <article key={v.vert} className="cont-vert-card" data-vert={v.vert}>
                  <div className="cont-vert-band" aria-hidden="true">
                    <span className="cont-vert-band-mark">{v.bandMark}</span>
                    <span className="cont-vert-band-num">{v.bandNum}</span>
                  </div>
                  <div className="cont-vert-body">
                    <h3>{v.titulo}</h3>
                    <p>{v.descricao}</p>
                    <ul className="cont-vert-list">
                      {v.listaHtml.map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                      ))}
                    </ul>
                    <a
                      className="link-arrow"
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

        {/* 10. NEWSLETTER */}
        <section
          className="cont-newsletter"
          id="newsletter"
          aria-label="Newsletter institucional Boletim NTC"
        >
          <div className="container">
            <div className="cont-newsletter-inner fade-in">
              <div className="cont-newsletter-text">
                <p className="eyebrow gold">{NEWSLETTER_TEXT.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: NEWSLETTER_TEXT.tituloHtml }} />
                {NEWSLETTER_TEXT.paragrafosHtml.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <div className="cont-newsletter-pillars">
                  {NEWSLETTER_TEXT.pills.map((pill) => (
                    <span key={pill} className="cont-newsletter-pill">{pill}</span>
                  ))}
                </div>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </section>

        {/* 11. FAQ */}
        <section
          className="cont-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre os Conteúdos NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{FAQ_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: FAQ_HEAD.tituloHtml }} />
              <p className="intro">{FAQ_HEAD.intro}</p>
            </div>
            <div className="cont-faq-list fade-in">
              <FaqAcordeao itens={FAQ_CONTEUDOS} />
            </div>
          </div>
        </section>

        {/* 12. CTA FINAL 3 PONTES */}
        <section
          className="cont-cta-final"
          id="cta-final"
          aria-label="CTA institucional final"
        >
          <div className="container cont-cta-final-inner fade-in">
            <p className="eyebrow gold">{CTA_FINAL_HEAD.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL_HEAD.tituloHtml }} />
            <p>{CTA_FINAL_HEAD.intro}</p>

            <div className="cont-cta-final-grid">
              {CTA_FINAL_PONTES.map((p) => (
                <div
                  key={p.ponte}
                  className="cont-cta-final-card"
                  data-ponte={p.ponte}
                >
                  <p className="eyebrow">{p.eyebrow}</p>
                  <h4>{p.titulo}</h4>
                  <p>{p.descricao}</p>
                  <a
                    className="link-arrow light"
                    href={p.link.href}
                    data-cms-link={p.link.cmsLink}
                    data-track={p.link.track}
                  >
                    {p.link.texto}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyCtaConteudos />
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
git add "apps/web/app/(conteudos)/conteudos/page.tsx"
git commit -m "$(cat <<'EOF'
feat(conteudos): cria page.tsx server com as 12 seções do protótipo

Renderiza, em ordem do <main id="main">:
1. Hero institucional slim com crumb, eyebrow light, h1 com <span class="accent">,
   sub, 5 quicklinks.
2. Faixa de 5 métricas editoriais.
3. <SubnavSticky /> com 6 âncoras + sticky + active anchor.
4. Manifesto editorial.
5. Tese editorial (3 pilares I/II/III).
6. 3 destaques editoriais com figura background-image.
7. <BibliotecaConteudos cards={CARDS_BIBLIOTECA} head={BIBLIOTECA_HEAD} />.
8. 5 tipos editoriais.
9. Curadoria por vertical (3 cards com listaHtml).
10. Newsletter (texto + <NewsletterForm />).
11. <FaqAcordeao itens={FAQ_CONTEUDOS} />.
12. CTA final 3 pontes (Agenda/Soluções/Corpo Docente).

Fora do <main>: <StickyCtaConteudos />. revalidate = 3600.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Validar build de produção

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -50
```

Expected: build passa em todos os pacotes. Rota `/conteudos` aparece prerenderizada como estática.

- [ ] **Step 2: Verificar /conteudos no output**

```bash
pnpm build 2>&1 | grep "/conteudos" | head -5
```

Expected: ao menos uma linha com `/conteudos` e marker `○` (Static).

- [ ] **Step 3: Se build falhar, ler erro completo e corrigir**

Se erro de tipo, lint ou build: corrigir no arquivo apontado e re-rodar `pnpm build`. Após passar, prosseguir para Task 14.

- [ ] **Step 4: Commit (apenas se houve correção)**

Se necessário:

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(conteudos): ajustes pós-build de produção

[descrever o ajuste real]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se o build passou sem correção, pular este step.

---

## Task 14: Dev server + checkpoint visual humano

**Files:**
- (nenhuma modificação — validação visual)

- [ ] **Step 1: Subir dev server na porta 3000 em background**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3000
```

Use `run_in_background: true`. **NÃO** use `pnpm dev` (turbo não propaga logs).

- [ ] **Step 2: Aguardar logs indicarem que está pronto**

Esperar por linha `Ready in Xms`. Usar Bash com `until grep -q "Ready in"`.

- [ ] **Step 3: Curl da rota /conteudos**

```bash
curl -sI http://localhost:3000/conteudos | head -5
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 4: Curl pelo conteúdo para confirmar marcadores chave**

```bash
curl -s http://localhost:3000/conteudos | grep -oE "<title>[^<]+</title>|class=\"cont-card\"|class=\"cont-featured-card\"|class=\"cont-tipo\"|class=\"cont-vert-card\"|class=\"cont-faq-item|class=\"cont-cta-final-card\"|class=\"sticky-cta-mobile\"|id=\"contNewsletterForm\"" | sort | uniq -c | sort -rn | head -20
```

Expected:
- 1 title contendo "Conteúdos institucionais"
- 9 `cont-card` (biblioteca)
- 3 `cont-featured-card` (destaques)
- 5 `cont-tipo`
- 3 `cont-vert-card`
- 8 `cont-faq-item`
- 3 `cont-cta-final-card`
- 1 `sticky-cta-mobile`
- 1 `contNewsletterForm`

- [ ] **Step 5: Pedir ao usuário para validar visualmente**

Mensagem:

> O servidor de dev está rodando em http://localhost:3000/conteudos. Por favor:
>
> 1. Abra http://localhost:3000/conteudos no navegador.
> 2. Abra o arquivo `28_Pagina_Conteudos_v1.html` no navegador também.
> 3. Compare lado a lado: hero (crumb, eyebrow light, h1 com accent, 5 quicklinks); 5 métricas (4 com `cm-num--word`); subnav com 6 âncoras; manifesto + tese 3 pilares; 3 destaques editoriais com figura; **biblioteca filtrável com 9 cards**; 5 tipos editoriais; 3 verticais; newsletter; FAQ 8 itens; CTA final 3 pontes; sticky mobile.
> 4. Teste interatividade:
>    - **Subnav sticky**: ao rolar, recebe `is-sticky`; conforme rola, link da seção ativa recebe `is-active`.
>    - **Biblioteca**: clique tab "Educação" reduz para 3 cards; filtro "Webinars" reduz mais; busca "lei 14133" mostra só EV01; counter atualiza; URL muda para `?vertical=edu&tipo=webinar&q=lei`; reload preserva.
>    - **FAQ**: click expande/colapsa, ícone `+` rotaciona.
>    - **Newsletter**: submit vazio → mensagem err; submit completo + consent → ok + form reset.
>    - **Sticky mobile**: aparece após scroll > 800px, `×` esconde.
> 5. Reporte discrepâncias.
>
> Quando aprovar, encerro o dev server e finalizo.

- [ ] **Step 6: Após aprovação humana, encerrar o dev server**

Killar o processo background do `pnpm next dev`. Se houve discrepâncias, corrigir e re-validar antes deste step.

- [ ] **Step 7: Se houve correções pós-validação, commitar**

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(conteudos): ajustes pós-checkpoint visual

[descrever o ajuste real]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Mover protótipo para `feito/`**

```bash
cd /Users/joao/Documents/portal-ntc && git mv 28_Pagina_Conteudos_v1.html feito/28_Pagina_Conteudos_v1.html
git commit -m "$(cat <<'EOF'
chore(conteudos): move 28_Pagina_Conteudos_v1.html para feito/

Página /conteudos portada e aprovada visualmente pelo usuário.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: Resumo da sessão**

Resumir em até 10 linhas:
- O que foi implementado: rota `/conteudos` em route group `(conteudos)`, 12 seções (5 métricas, subnav sticky com active anchor, manifesto, tese 3 pilares, 3 destaques, biblioteca filtrável de 9 cards com URL sync, 5 tipos, 3 verticais, newsletter mock, 8 FAQs, CTA final 3 pontes), sticky mobile.
- O que ficou pendente / fora de escopo: páginas individuais `/conteudos/[slug]`, integração de analytics real, POST real do newsletter (CMS/Resend), atualização de mega-menu HeaderHome para incluir item "Conteúdos".
- Próximos passos sugeridos: portar `27_Pagina_Capacitacao_v1.html` ou `27_Pagina_EventOn_v1.html`, ou implementar mega-menu "Conteúdos".

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura): Tasks 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.
  - §4 (estrutura page.tsx): Task 12.
  - §5 (conteudoConteudos.ts): Tasks 4, 5, 6.
  - §6.1 (SubnavSticky): Task 10.
  - §6.2 (BibliotecaConteudos): Task 11.
  - §6.3 (NewsletterForm): Task 9.
  - §6.4 (FaqAcordeao): Task 8.
  - §6.5 (StickyCtaConteudos): Task 7.
  - §7 (CSS): Tasks 1, 2.
  - §8 (validação): Tasks 13, 14.
  - §9 (riscos): mitigados nas tasks (cards modelados fielmente; "all in DOM with is-hidden"; useEffect mount-only para subnav; hrefs migrados; SSR sem `is-sticky`; form `noValidate` + `preventDefault`).
  - §10 (fora de escopo): respeitado em todas as tasks.
- ✅ **Sem placeholders:** todos os steps têm comandos ou código completos. Os 8 FAQs e 9 cards de biblioteca estão literalmente nos Tasks 5/6.
- ✅ **Type consistency:** `LinkInterno`, `CrumbItem`, `CardDestaque`, `CardBiblioteca`, `OpcaoTab`, `OpcaoTipo`, `TipoEditorial`, `VertCard`, `ItemFaq`, `PonteCta`, `SubnavLink`, `PilarTese`, `MetricaConteudo`, `VerticalConteudo`, `TipoConteudo` definidos uma vez (Tasks 4/5/6) e consumidos consistentemente em Tasks 7-12. `BibliotecaConteudos` recebe `cards: CardBiblioteca[]` + `head: {...}`. `FaqAcordeao` recebe `itens: ItemFaq[]`. `SubnavSticky` recebe `label, links: SubnavLink[]`. `NewsletterForm` lê `NEWSLETTER_FORM` direto. `StickyCtaConteudos` lê `STICKY_CTA_CONTEUDOS` direto.
