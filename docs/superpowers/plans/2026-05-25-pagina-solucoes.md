# Página Soluções Institucionais NTC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente o protótipo `26_Pagina_Solucoes_v1.html` (~2.387 linhas) para a rota `/solucoes` em um novo route group `(solucoes)`, preservando 100% do visual, das 12 seções editoriais (hero, métricas, manifesto, 3 pilares, 4 cards de modalidades, 4 blocos de detalhamento, parallax, jurídico Lei 14.133/2021, vitrine por área, processo 5 passos, FAQ acordeão, CTA final) e da interatividade essencial (FAQ + sticky CTA mobile).

**Architecture:** Estratégia "porta do HTML" consolidada: CSS literal extraído para `apps/web/app/solucoes-prototipo.css` (importado no root layout), `page.tsx` server component renderiza JSX literal, `conteudoSolucoes.ts` armazena tipos + todas as constantes textuais, 2 client components mínimos (`FaqAcordeao` para os 8 itens + `StickyCtaSolucoes` para a barra fixa mobile). Layout do novo route group `(solucoes)` reaproveita `HeaderHome`/`FooterHome`/`InteracoesScroll` do `(home)`. Submit real, analytics e CMS ficam fora — stub no-op preservado com TODOs. Pós-porta: atualizar 4 hrefs `#contratacao` no mega-menu de "Soluções" do `HeaderHome.tsx`.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict (`noUncheckedIndexedAccess: true`, `noUnusedLocals: true`), CSS literal sem Tailwind para classes do protótipo, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/solucoes-prototipo.css` — CSS literal (~1.007 linhas) das linhas 120-1125 do HTML, com `url('./img/...')` → `url('/img/...')`.
- `apps/web/app/(solucoes)/layout.tsx` — layout do novo route group (HeaderHome + FooterHome + InteracoesScroll).
- `apps/web/app/(solucoes)/solucoes/page.tsx` — server component, `revalidate = 3600`, JSX literal das 12 seções + sticky CTA mobile.
- `apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts` — tipos + todas as constantes textuais.
- `apps/web/app/(solucoes)/solucoes/FaqAcordeao.tsx` — client: useState<Set<string>> para itens abertos + dangerouslySetInnerHTML na resposta.
- `apps/web/app/(solucoes)/solucoes/StickyCtaSolucoes.tsx` — client: scroll listener (rAF) + dismiss local (sem sessionStorage).

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./solucoes-prototipo.css"` ao lado dos outros CSSs de protótipo.
- `apps/web/app/(home)/HeaderHome.tsx` — substituir 4 hrefs `#contratacao` no mega-menu "Soluções" por âncoras da nova rota.

**Não tocar (referência):**
- `apps/web/app/(home)/HeaderHome.tsx` (exceto pelos 4 hrefs do mega-menu — Task 8).
- `apps/web/app/(home)/FooterHome.tsx`, `apps/web/app/(home)/InteracoesScroll.tsx`.

---

## Task 1: Extrair CSS literal do protótipo para `solucoes-prototipo.css`

**Files:**
- Create: `apps/web/app/solucoes-prototipo.css`

- [ ] **Step 1: Extrair as linhas 120-1125 do HTML (conteúdo entre `<style>` e `</style>` exclusive)**

Comando:

```bash
sed -n '120,1125p' /Users/joao/Documents/portal-ntc/26_Pagina_Solucoes_v1.html > /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css
```

Expected: arquivo de ~1.006 linhas criado.

- [ ] **Step 2: Verificar tamanho do arquivo**

Comando:

```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css
```

Expected: `1006 /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css` (ou número próximo).

- [ ] **Step 3: Contar quantas referências `url('./img/...')` existem antes de converter**

```bash
grep -c "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css
```

Anote o número retornado (vai usar pra confirmar no Step 5 que todas foram convertidas).

- [ ] **Step 4: Converter `url('./img/...')` para `url('/img/...')`**

```bash
sed -i '' "s|url('\./img/|url('/img/|g" /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css
```

- [ ] **Step 5: Verificar que não restam `url('./` no arquivo**

```bash
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css
```

Expected: nenhuma saída (exit code 1).

- [ ] **Step 6: Listar as imagens novas referenciadas (deveriam todas existir em public/)**

```bash
grep -oE "url\('[^']+'\)" /Users/joao/Documents/portal-ntc/apps/web/app/solucoes-prototipo.css | sort -u
```

Para cada URL listado, verificar com:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public<caminho-relativo>
```

Expected: cada arquivo encontrado. Se algum não existir, reportar BLOCKED.

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/solucoes-prototipo.css
git commit -m "$(cat <<'EOF'
feat(solucoes): extrai CSS literal do protótipo 26 para solucoes-prototipo.css

Bloco <style> de 26_Pagina_Solucoes_v1.html (linhas 120-1125) copiado
sem adaptação, com url('./img/...') convertido para url('/img/...').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `solucoes-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Localizar o último import de CSS de protótipo no root layout**

```bash
grep -n "prototipo.css" /Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx
```

Expected: lista de imports `home-prototipo.css`, `o-grupo-prototipo.css`, `verticais-prototipo.css`, `programas-prototipo.css`, `corpo-docente-prototipo.css`, `institucional-prototipo.css`, `contato-prototipo.css`, `agenda-prototipo.css`. O último é o `agenda-prototipo.css`.

- [ ] **Step 2: Adicionar `import "./solucoes-prototipo.css"` depois do último CSS de protótipo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/layout.tsx`. Substitua a linha do último import (`import "./agenda-prototipo.css";`) por ela mesma seguida do bloco abaixo:

old_string:
```
import "./agenda-prototipo.css";
```

new_string:
```
import "./agenda-prototipo.css";
// CSS da página /solucoes (portada literal de 26_Pagina_Solucoes_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.hero-page, .sol-metrics,
// .sol-manifesto, .sol-pilares, .sol-modalidades, .sol-card, .sol-detail,
// .sol-parallax, .sol-juridico, .sol-vitrine, .sol-processo, .sol-faq,
// .sol-cta-final, .sticky-cta-mobile).
import "./solucoes-prototipo.css";
```

**Atenção:** se `import "./agenda-prototipo.css";` aparecer mais de uma vez (improvável), tornar o old_string mais específico incluindo contexto. Confirme com grep antes da edição.

- [ ] **Step 3: Verificar typecheck do monorepo**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -20
```

Expected: passa sem erro novo.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(solucoes): importa solucoes-prototipo.css no root layout

Carrega CSS da página /solucoes no root para herdar a mesma estratégia
dos outros CSSs de protótipo (escopo seguro por classes específicas).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar layout do novo route group `(solucoes)`

**Files:**
- Create: `apps/web/app/(solucoes)/layout.tsx`

- [ ] **Step 1: Criar diretório do route group**

```bash
mkdir -p "/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes"
```

- [ ] **Step 2: Confirmar que HeaderHome, FooterHome e InteracoesScroll existem**

```bash
ls "/Users/joao/Documents/portal-ntc/apps/web/app/(home)/" | grep -E "HeaderHome|FooterHome|InteracoesScroll"
```

Expected: os 3 arquivos `.tsx` listados.

- [ ] **Step 3: Criar `(solucoes)/layout.tsx`**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/layout.tsx`:

```tsx
import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas do guarda-chuva Soluções:
 *   /solucoes        (porta de 26_Pagina_Solucoes_v1.html)
 *
 * Coexiste com /solucoes-estrategicas/[area] (route group `(vertical)`),
 * que cobre as 3 verticais editoriais. Esta família abriga as páginas
 * comerciais de contratação institucional (modalidades + contratação direta).
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx, (vertical)/layout.tsx e (capacitacao)/layout.tsx.
 *
 * CSS específico vem do root layout (solucoes-prototipo.css).
 */
export default function SolucoesLayout({ children }: { children: ReactNode }) {
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
git add "apps/web/app/(solucoes)/layout.tsx"
git commit -m "$(cat <<'EOF'
feat(solucoes): cria layout do novo route group (solucoes)

Espelha o padrão dos demais route groups (institucional, programas,
o-grupo, vertical, capacitacao): HeaderHome + FooterHome + InteracoesScroll
do (home).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Criar `conteudoSolucoes.ts` — tipos + constantes (hero, métricas, manifesto, pilares)

**Files:**
- Create: `apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`

- [ ] **Step 1: Criar o arquivo com tipos, hero, métricas, manifesto e pilares**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`:

```ts
// =============================================================
//  CONTEÚDO LITERAL DA PÁGINA /SOLUCOES
//  Porta de 26_Pagina_Solucoes_v1.html (linhas 1298-2060 do <main>)
//  Nada de rephrasing — fidelidade 100% ao protótipo aprovado.
// =============================================================

// ----------------- Slugs -----------------

export type ModalidadeSlug = "in-company" | "turmas-fechadas" | "sob-medida" | "trilhas";

export type VerticalSlug = "educacao" | "gestao-publica" | "contratacoes" | "saude";

// ----------------- Link interno -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  title?: string;
  classe?: string;       // ex.: "btn btn--gold", "btn btn--secondary btn--mini"
  arrow?: boolean;       // renderiza <span class="btn-arrow">→</span>
}

// ----------------- HERO -----------------

export interface CrumbItem {
  texto: string;
  href?: string;
  current?: boolean;
}

export const HERO_SOLUCOES = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Soluções institucionais", current: true },
  ] as CrumbItem[],
  eyebrow: "Modelos de contratação · Edição 2026",
  tituloHtml:
    'Soluções institucionais <span class="accent">do Grupo NTC</span>.<br>Formação dedicada a órgãos, redes e instituições públicas brasileiras.',
  subHtml:
    'Programas in company, turmas fechadas, soluções sob medida e trilhas formativas curadas — entregues pelo <strong style="color: var(--pergaminho);">Instituto NTC do Brasil</strong> com segurança jurídica, aderência à Lei 14.133/2021 e atendimento institucional dedicado.',
  quicklinks: [
    { texto: "In company", href: "#in-company", track: "hero_quicklink_incompany" },
    { texto: "Turmas fechadas", href: "#turmas-fechadas", track: "hero_quicklink_turmas" },
    { texto: "Sob medida", href: "#sob-medida", track: "hero_quicklink_sobmedida" },
    { texto: "Trilhas e jornadas", href: "#trilhas", track: "hero_quicklink_trilhas" },
    { texto: "Contratação institucional", href: "#contratacao-institucional", track: "hero_quicklink_contratacao" },
    { texto: "Como funciona", href: "#processo", track: "hero_quicklink_processo" },
  ] as LinkInterno[],
};

// ----------------- MÉTRICAS -----------------

export interface Metrica {
  num: string;
  lbl: string;
  detail: string;
}

export const METRICAS: Metrica[] = [
  {
    num: "20+",
    lbl: "Anos de atuação nacional",
    detail:
      "Trajetória ininterrupta de formação institucional de quadros públicos brasileiros — Instituto NTC do Brasil.",
  },
  {
    num: "500+",
    lbl: "Eventos e programas realizados",
    detail:
      "300+ encontros presenciais e 200+ online — seminários, jornadas, oficinas, cursos executivos, congressos e formações in company.",
  },
  {
    num: "400 mil+",
    lbl: "Agentes públicos capacitados",
    detail:
      "Servidores federais, estaduais e municipais formados nas três áreas estratégicas do Grupo NTC.",
  },
  {
    num: "4",
    lbl: "Modalidades canon + contratação institucional",
    detail:
      "In company · turmas fechadas · sob medida · trilhas curadas · contratação institucional dedicada com Lei 14.133/2021.",
  },
];

// ----------------- MANIFESTO -----------------

export const MANIFESTO = {
  marker: "Abordagem consultiva",
  tituloHtml: "Cada contratação é uma <em>arquitetura formativa institucional</em>.",
  ledeHtml:
    "O Grupo NTC não vende cursos prontos a órgãos públicos. Cada contratação é tratada como uma arquitetura formativa específica, calibrada para o perfil da instituição, os objetivos da gestão e o estágio de maturidade da rede contratante.",
  paragrafosHtml: [
    "Trabalhamos em <strong>quatro modalidades canon</strong> — in company, turmas fechadas, soluções sob medida e trilhas curadas — combinadas com <strong>atendimento institucional dedicado</strong> que apoia a formalização da contratação direta, por inexigibilidade ou dispensa de licitação, bem como de convênios, parcerias ou instrumentos de cooperação quando aplicáveis.",
    "A equipe comercial NTC atua como parceiro institucional do órgão contratante — desde o briefing inicial até a entrega do programa, com curadoria docente dimensionada por demanda, suporte logístico, ambiente da Plataforma EventOn e cuidado integral em cada etapa.",
  ],
};

// ----------------- PILARES (3) -----------------

export interface Pilar {
  num: string;
  titulo: string;
  descricao: string;
  marker: string;
}

export const PILARES_HEAD = {
  eyebrow: "Abordagem institucional NTC",
  tituloHtml: "Três pilares <em>de leitura institucional</em>.",
  descricao:
    "Cada solução nasce de uma leitura institucional precisa: demanda, público, maturidade da gestão, objetivos estratégicos e forma jurídica adequada ao caso.",
};

export const PILARES: Pilar[] = [
  {
    num: "01",
    titulo: "Diagnóstico institucional",
    descricao:
      "Leitura precisa da demanda da instituição — público-alvo, maturidade da gestão, contexto político-administrativo, prazo institucional e objetivo estratégico da contratação.",
    marker: "Briefing · diagnóstico aplicado",
  },
  {
    num: "02",
    titulo: "Curadoria técnica",
    descricao:
      "Composição da arquitetura formativa pela curadoria científica do Grupo NTC — programa-mãe, módulos, equipe docente e materiais selecionados especificamente para a contratação.",
    marker: "Curadoria científica institucional",
  },
  {
    num: "03",
    titulo: "Execução dedicada",
    descricao:
      "Entrega operacional com Plataforma EventOn, suporte logístico, acompanhamento institucional próximo e relatório executivo de encerramento da contratação.",
    marker: "Plataforma EventOn · suporte dedicado",
  },
];
```

- [ ] **Step 2: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa. **O arquivo é só dados; nenhum lugar consome ainda — typecheck deve aceitar.**

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts"
git commit -m "$(cat <<'EOF'
feat(solucoes): cria conteudoSolucoes.ts (parte 1) com hero+métricas+manifesto+pilares

Tipos ModalidadeSlug, VerticalSlug, LinkInterno, CrumbItem, Metrica, Pilar.
Constantes HERO_SOLUCOES (crumb, eyebrow, tituloHtml, subHtml, 6 quicklinks),
METRICAS (4), MANIFESTO (marker + tituloHtml + ledeHtml + 2 parágrafos),
PILARES_HEAD + PILARES (3).

Próximos commits adicionam modalidades, detalhamentos, jurídico, vitrine,
processo, FAQ, CTA final e sticky.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Adicionar MODALIDADES (4 cards) + DETALHES_MODALIDADES (4 blocos) a `conteudoSolucoes.ts`

**Files:**
- Modify: `apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`

- [ ] **Step 1: Adicionar as constantes ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`.

old_string (último bloco do arquivo, que é o `PILARES` array fechando):
```
  {
    num: "03",
    titulo: "Execução dedicada",
    descricao:
      "Entrega operacional com Plataforma EventOn, suporte logístico, acompanhamento institucional próximo e relatório executivo de encerramento da contratação.",
    marker: "Plataforma EventOn · suporte dedicado",
  },
];
```

new_string:
```
  {
    num: "03",
    titulo: "Execução dedicada",
    descricao:
      "Entrega operacional com Plataforma EventOn, suporte logístico, acompanhamento institucional próximo e relatório executivo de encerramento da contratação.",
    marker: "Plataforma EventOn · suporte dedicado",
  },
];

// ----------------- MODALIDADES (4 cards canônicos) -----------------

export interface CardModalidade {
  slug: ModalidadeSlug;
  numLabel: string;          // "Modalidade A/B/C/D"
  eyebrow: string;
  titulo: string;
  descricao: string;
  bullets: string[];
  indicadoHtml: string;      // contém <strong>
  ctaSaibaMais: LinkInterno; // âncora interna
  ctaProposta: LinkInterno;  // /contato
}

export const MODALIDADES_HEAD = {
  eyebrow: "Modalidades canon",
  tituloHtml: "Quatro modelos de contratação <em>institucional</em>",
  intro:
    "Cada modalidade resolve um conjunto específico de demandas institucionais. A composição comercial pode combinar mais de uma modalidade conforme o objeto da contratação.",
};

export const MODALIDADES: CardModalidade[] = [
  {
    slug: "in-company",
    numLabel: "Modalidade A",
    eyebrow: "Programa exclusivo institucional",
    titulo: "Soluções in company",
    descricao:
      "Programa entregue exclusivamente à instituição contratante, com conteúdo, formato e calendário customizados para a realidade da rede ou do órgão.",
    bullets: [
      "Conteúdo customizado a partir do programa-mãe (PEAR, AGIP, LIDERA, EDUTEC etc.)",
      "Formato presencial, online ou híbrido — definido pela instituição",
      "Calendário operacional acordado com a equipe contratante",
      "Curadoria docente dimensionada para o perfil dos participantes",
      "Material institucional personalizado + certificação NTC",
    ],
    indicadoHtml:
      "Indicado para · <strong>Órgãos federais, secretarias estaduais e municipais, autarquias, fundações, tribunais, agências reguladoras, empresas estatais e demais instituições públicas</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#in-company",
      cmsLink: "detalhe-incompany",
      track: "sol_card_incompany_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      // TODO: protótipo aponta para /contato?categoria=in-company#tab-proposta — ativar quando /contato suportar querystring/tab-âncora
      href: "/contato",
      cmsLink: "proposta-incompany",
      track: "sol_card_incompany_proposta",
    },
  },
  {
    slug: "turmas-fechadas",
    numLabel: "Modalidade B",
    eyebrow: "Edição operacional dedicada",
    titulo: "Turmas fechadas",
    descricao:
      "Edição operacional dedicada à equipe contratante, com conteúdo padrão de um programa NTC entregue para um grupo institucional específico.",
    bullets: [
      "Conteúdo padrão do programa-mãe (ementa NTC preservada)",
      "Turma dedicada — apenas servidores e quadros da instituição",
      "Formato presencial, online ou híbrido",
      "Datas e cargas horárias adequadas à agenda operacional",
      "Certificação NTC institucional para todos os participantes",
    ],
    indicadoHtml:
      "Indicado para · <strong>Equipes de 20 a 300 servidores que precisam de formação padronizada do programa NTC sem mistura com turmas abertas</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#turmas-fechadas",
      cmsLink: "detalhe-turmas",
      track: "sol_card_turmas_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-turmas",
      track: "sol_card_turmas_proposta",
    },
  },
  {
    slug: "sob-medida",
    numLabel: "Modalidade C",
    eyebrow: "Customização profunda",
    titulo: "Soluções sob medida",
    descricao:
      "Customização profunda de ementas, módulos, cargas horárias e formato — quando a demanda institucional não cabe nos programas standards.",
    bullets: [
      "Diagnóstico institucional inicial para identificar lacunas reais",
      "Ementa nova ou híbrida entre programas existentes",
      "Cargas horárias dimensionadas por objetivo",
      "Materiais autorais produzidos para a contratação",
      "Curadoria docente específica para o tema institucional",
    ],
    indicadoHtml:
      "Indicado para · <strong>Demandas formativas únicas, projetos institucionais especiais, contratações de alta complexidade ou estágio avançado de maturidade da gestão</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#sob-medida",
      cmsLink: "detalhe-sobmedida",
      track: "sol_card_sobmedida_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-sobmedida",
      track: "sol_card_sobmedida_proposta",
    },
  },
  {
    slug: "trilhas",
    numLabel: "Modalidade D",
    eyebrow: "Sequências formativas curadas",
    titulo: "Trilhas e jornadas",
    descricao:
      "Sequências formativas curadas combinando módulos de diferentes programas NTC — adequadas a uma necessidade institucional específica que requer formação multinível.",
    bullets: [
      "Combinação curada de módulos entre programas (cross-program)",
      "Jornadas executivas de 32 a 120 horas",
      "Trilhas multinível (gestão estratégica + operacional + técnico)",
      "Certificação por trilha completa + atestado por módulo",
      "Curadoria científica que articula os módulos selecionados",
    ],
    indicadoHtml:
      "Indicado para · <strong>Capacitação de quadros executivos, formação de carreira plurianual, jornadas de alta gestão e programas com múltiplos perfis de público na mesma instituição</strong>",
    ctaSaibaMais: {
      texto: "Saiba mais",
      href: "#trilhas",
      cmsLink: "detalhe-trilhas",
      track: "sol_card_trilhas_detalhe",
      arrow: true,
    },
    ctaProposta: {
      texto: "Solicitar proposta",
      href: "/contato",
      cmsLink: "proposta-trilhas",
      track: "sol_card_trilhas_proposta",
    },
  },
];

// ----------------- DETALHES POR MODALIDADE (4 blocos) -----------------

export interface PassoOperacional {
  titulo: string;
  descricao: string;
}

export interface BlocoDetalhe {
  slug: ModalidadeSlug;
  cream?: boolean;
  asideEyebrow: string;
  asideTituloHtml: string;
  asideDescricao: string;
  asideJuridicoLinha: string;
  asideCtaPrimario: LinkInterno;
  asideCtaSecundario: LinkInterno;
  passos: PassoOperacional[];
  cenariosTitulo: string;
  cenarios: string[];
  diferenciaisTitulo: string;
  diferenciais: string[];
}

export const DETALHES_MODALIDADES: BlocoDetalhe[] = [
  {
    slug: "in-company",
    asideEyebrow: "Modalidade A · In company",
    asideTituloHtml: "Soluções <em>in company</em>.",
    asideDescricao:
      "Programa exclusivo institucional, com conteúdo, formato e calendário customizados para a realidade da instituição contratante. A NTC entrega o programa-mãe (PEAR, AGIP, LIDERA, EDUTEC, SIGS etc.) ajustado à rede que está formando seus quadros.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · inexigibilidade (art. 74, III) ou dispensa",
    asideCtaPrimario: {
      texto: "Solicitar proposta in company",
      href: "/contato",
      cmsLink: "proposta-incompany",
      track: "sol_detail_incompany_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Briefing inicial",
      href: "/contato",
      cmsLink: "briefing-incompany",
      track: "sol_detail_incompany_briefing",
    },
    passos: [
      {
        titulo: "Briefing institucional",
        descricao:
          "Conversa inicial com a equipe da instituição para entender objetivos, público, prazo e contexto da contratação.",
      },
      {
        titulo: "Proposta customizada",
        descricao:
          "A NTC apresenta proposta institucional com programa-mãe, módulos selecionados, curadoria docente sugerida, carga horária e investimento.",
      },
      {
        titulo: "Validação e contratação",
        descricao:
          "Ajustes finais, validação da especificação técnica e da justificativa institucional, formalização da contratação direta por inexigibilidade ou dispensa de licitação, conforme a hipótese aplicável da Lei 14.133/2021.",
      },
      {
        titulo: "Entrega do programa",
        descricao:
          "Execução do programa nas datas combinadas, com plataforma EventOn, suporte logístico, certificação institucional e relatório executivo de encerramento.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Secretaria municipal ou estadual precisa formar 80-300 servidores em um programa específico (alfabetização, contratações, governança, APS).",
      "Órgão de controle precisa capacitar auditores na nova Lei de Licitações em formato dedicado.",
      "Autarquia ou fundação precisa profissionalizar seus quadros em gestão estratégica do Estado.",
      "Tribunal precisa capacitar magistrados e servidores em direito administrativo aplicado.",
      "Rede pública precisa formar diretores escolares em gestão escolar de alta performance.",
    ],
    diferenciaisTitulo: "O que torna a entrega NTC distinta",
    diferenciais: [
      "Programa-mãe é canon (não inventamos curso na hora) — 15 programas estratégicos validados.",
      "Curadoria docente nacional com nomes do portfólio institucional mobilizada por demanda.",
      "Plataforma EventOn — acesso, replay, certificado, área do participante.",
      "Equipe comercial dedicada apoia formalização (termo de referência, empenho, NF no CNPJ do órgão).",
      "Relatório executivo de encerramento com indicadores de aprendizagem.",
    ],
  },
  {
    slug: "turmas-fechadas",
    cream: true,
    asideEyebrow: "Modalidade B · Turmas fechadas",
    asideTituloHtml: "<em>Turmas fechadas</em> dedicadas.",
    asideDescricao:
      "Edição operacional do programa-mãe entregue exclusivamente à equipe contratante. A ementa NTC é preservada — a customização está na composição da turma (apenas servidores da instituição), nas datas e na carga horária ajustadas ao calendário do órgão.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · inexigibilidade (art. 74, III)",
    asideCtaPrimario: {
      texto: "Solicitar proposta de turma fechada",
      href: "/contato",
      cmsLink: "proposta-turmas",
      track: "sol_detail_turmas_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Ver agenda padrão",
      href: "/agenda",
      cmsLink: "agenda-turma-fechada",
      track: "sol_detail_turmas_agenda",
    },
    passos: [
      {
        titulo: "Seleção do programa",
        descricao:
          "A instituição escolhe um dos 15 programas estratégicos canon — PEAR, AGIP, LIDERA, EDUTEC, PROGE, SIGS etc.",
      },
      {
        titulo: "Definição operacional",
        descricao:
          "Datas, carga horária, formato (presencial · online · híbrido) e quantidade de participantes — apenas servidores do órgão.",
      },
      {
        titulo: "Contratação direta",
        descricao:
          "Inexigibilidade pela natureza singular da atuação NTC e notória especialização. Formalização apoiada pela equipe comercial.",
      },
      {
        titulo: "Execução dedicada",
        descricao:
          "Programa entregue para a turma fechada com curadoria docente NTC, EventOn, material padrão e certificação institucional.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Instituição quer o programa NTC tal como ele é, mas sem misturar sua equipe com participantes externos.",
      "Há demanda de mais de 20 servidores no mesmo programa — turma fechada fica mais eficiente que inscrições individuais.",
      "O calendário do órgão exige datas específicas que diferem das turmas abertas da agenda nacional.",
      "Há requisitos de confidencialidade institucional (cases internos, dados sensíveis) que pedem turma dedicada.",
    ],
    diferenciaisTitulo: "Por que turma fechada NTC funciona",
    diferenciais: [
      "Ementa do programa-mãe preservada — você recebe exatamente o programa canon NTC.",
      "Sem necessidade de redesenho — implementação mais ágil que in company customizado.",
      "Certificação institucional NTC com o nome do órgão na lista de participantes.",
      "Investimento por turma costuma ser mais eficiente que inscrições individuais a partir de 25 servidores.",
    ],
  },
  {
    slug: "sob-medida",
    asideEyebrow: "Modalidade C · Sob medida",
    asideTituloHtml: "Soluções <em>sob medida</em>.",
    asideDescricao:
      "Customização profunda de ementas, módulos e formato — quando a demanda institucional é única e não cabe nos programas standards. A NTC desenha do zero a arquitetura formativa específica, com curadoria docente e materiais autorais para a contratação.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · contratação direta por inexigibilidade ou dispensa, conforme o caso",
    asideCtaPrimario: {
      texto: "Solicitar proposta sob medida",
      href: "/contato",
      cmsLink: "proposta-sobmedida",
      track: "sol_detail_sobmedida_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Conversa com curadoria",
      href: "/contato",
      cmsLink: "conversa-curadoria-sobmedida",
      track: "sol_detail_sobmedida_conversa",
    },
    passos: [
      {
        titulo: "Diagnóstico institucional",
        descricao:
          "Mapeamento aprofundado com a equipe contratante — objetivos da gestão, perfil dos quadros, contexto institucional, indicadores esperados.",
      },
      {
        titulo: "Desenho da arquitetura",
        descricao:
          "NTC propõe ementa nova, combina módulos existentes ou cria abordagem híbrida — com cargas horárias, formato, curadoria docente e cronograma específicos.",
      },
      {
        titulo: "Validação e produção",
        descricao:
          "Validação técnica da proposta, produção de materiais autorais, definição da equipe docente, formalização da contratação.",
      },
      {
        titulo: "Execução acompanhada",
        descricao:
          "Entrega do programa com acompanhamento institucional, ajustes em tempo real conforme retorno dos participantes, relatório executivo de impacto.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Tribunal precisa formar magistrados em direito constitucional aplicado à jurisdição superior (recorte inédito).",
      "Secretaria estadual precisa de uma jornada articulando educação digital + LGPD educacional + IA em sala de aula.",
      "Ministério precisa capacitar coordenação técnica em gestão de programas federais com regulamentação específica.",
      "Autarquia regulatória precisa formar quadros em regulação setorial + concessões + PPPs simultaneamente.",
      "Estatal precisa de programa interno único combinando compliance + governança + Lei 14.133/2021 + cultura organizacional.",
    ],
    diferenciaisTitulo: "O nível de customização que entregamos",
    diferenciais: [
      "Curadoria científica desenha a arquitetura — não é simples ajuste de programa existente.",
      "Materiais autorais produzidos para a contratação — apostilas, slides, cases específicos.",
      "Equipe docente selecionada nominalmente para a demanda — curadoria caso a caso.",
      "Acompanhamento institucional próximo durante toda a execução.",
      "Possibilidade de evolução em rodadas plurianuais com a mesma instituição.",
    ],
  },
  {
    slug: "trilhas",
    cream: true,
    asideEyebrow: "Modalidade D · Trilhas e jornadas",
    asideTituloHtml: "Trilhas e <em>jornadas</em> curadas.",
    asideDescricao:
      "Sequências formativas combinando módulos de diferentes programas NTC — quando a demanda institucional exige cobertura multinível ou cross-program. A curadoria científica articula os módulos selecionados em uma jornada coerente, com certificação por trilha completa.",
    asideJuridicoLinha:
      "Forma jurídica usual · Lei 14.133/2021 · contratação direta por inexigibilidade ou dispensa, conforme o caso",
    asideCtaPrimario: {
      texto: "Solicitar proposta de trilha",
      href: "/contato",
      cmsLink: "proposta-trilhas",
      track: "sol_detail_trilhas_proposta",
      arrow: true,
    },
    asideCtaSecundario: {
      texto: "Ver corpo docente",
      href: "/o-grupo/corpo-docente",
      cmsLink: "corpo-docente-trilhas",
      track: "sol_detail_trilhas_curadoria",
    },
    passos: [
      {
        titulo: "Mapa de competências",
        descricao:
          "Análise das competências que a jornada precisa desenvolver — em alta gestão, gestão intermediária e camada técnica.",
      },
      {
        titulo: "Curadoria de módulos",
        descricao:
          "Seleção dos módulos canon entre os 15 programas estratégicos NTC, com curadoria científica articuladora.",
      },
      {
        titulo: "Cronograma plurianual",
        descricao:
          "Sequenciamento dos módulos em jornada de 32 a 120 horas, com pausa entre módulos para aplicação institucional.",
      },
      {
        titulo: "Execução e certificação",
        descricao:
          "Entrega progressiva da trilha com certificação por trilha completa + atestado por módulo + reconhecimento institucional NTC.",
      },
    ],
    cenariosTitulo: "Cenários típicos",
    cenarios: [
      "Carreira pública precisa de jornada plurianual estruturada — formação executiva continuada.",
      "Programa de capacitação multinível: alta gestão (LIDERA) + camada técnica (AGIP) + operacional (módulos selecionados).",
      "Rede pública precisa de trilha combinando alfabetização (PEAR) + gestão escolar (PROGE) + avaliação (módulos PROGE).",
      "Sistema de Saúde precisa articular SIGS + PROAPS+ + PROSUS+ em jornada coerente por perfil de público.",
      "Escola de governo precisa montar programa de mestrado profissional ou pós-graduação institucional com módulos NTC.",
    ],
    diferenciaisTitulo: "O que torna a trilha NTC distinta",
    diferenciais: [
      "Curadoria científica articuladora — não é simples soma de cursos, é jornada coerente.",
      "Cross-program · combina módulos de diferentes programas (raro no mercado de formação institucional).",
      "Certificação dupla · por trilha completa + por módulo individual.",
      "Pausa institucional entre módulos para que os participantes apliquem o aprendizado.",
      "Possibilidade de evolução plurianual com a mesma instituição.",
    ],
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
git add "apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts"
git commit -m "$(cat <<'EOF'
feat(solucoes): adiciona MODALIDADES (4) + DETALHES_MODALIDADES (4) em conteudoSolucoes.ts

MODALIDADES com 4 cards canon: in-company, turmas-fechadas, sob-medida, trilhas.
Cada card preserva numLabel ("Modalidade A/B/C/D"), eyebrow, título, descrição,
5 bullets, indicadoHtml com <strong>, 2 CTAs (Saiba mais âncora + Solicitar
proposta /contato).

DETALHES_MODALIDADES com 4 blocos correspondentes: aside (eyebrow, tituloHtml,
descricao, linha jurídica, 2 CTAs) + 4 passos + 4-5 cenários + 4-5 diferenciais.
Blocos B e D marcados como cream=true (sol-detail--cream).

Hrefs internos atualizados para /contato (simples), /agenda, /o-grupo/corpo-docente.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Adicionar PARALLAX + JURIDICO + VITRINE + PROCESSO + FAQ + CTA_FINAL + STICKY a `conteudoSolucoes.ts`

**Files:**
- Modify: `apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`

- [ ] **Step 1: Adicionar as constantes finais ao final do arquivo**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`.

old_string (último item do array DETALHES_MODALIDADES fechando):
```
    diferenciaisTitulo: "O que torna a trilha NTC distinta",
    diferenciais: [
      "Curadoria científica articuladora — não é simples soma de cursos, é jornada coerente.",
      "Cross-program · combina módulos de diferentes programas (raro no mercado de formação institucional).",
      "Certificação dupla · por trilha completa + por módulo individual.",
      "Pausa institucional entre módulos para que os participantes apliquem o aprendizado.",
      "Possibilidade de evolução plurianual com a mesma instituição.",
    ],
  },
];
```

new_string:
```
    diferenciaisTitulo: "O que torna a trilha NTC distinta",
    diferenciais: [
      "Curadoria científica articuladora — não é simples soma de cursos, é jornada coerente.",
      "Cross-program · combina módulos de diferentes programas (raro no mercado de formação institucional).",
      "Certificação dupla · por trilha completa + por módulo individual.",
      "Pausa institucional entre módulos para que os participantes apliquem o aprendizado.",
      "Possibilidade de evolução plurianual com a mesma instituição.",
    ],
  },
];

// ----------------- PARALLAX -----------------

export const PARALLAX = {
  eyebrow: "Da demanda à entrega",
  tituloHtml:
    "Da demanda institucional à entrega formativa, a NTC estrutura cada solução com <strong>curadoria, segurança jurídica e execução dedicada</strong>.",
};

// ----------------- JURÍDICO (4 cards) -----------------

export interface CardJuridico {
  num: string;
  titulo: string;
  artigo: string;
  descricao: string;
}

export const JURIDICO = {
  eyebrow: "Contratação institucional",
  tituloHtml:
    "Contratação institucional <em>por via direta</em>,<br>com segurança jurídica e aderência à Lei 14.133/2021.",
  introHtml:
    'A NTC apoia órgãos e instituições públicas na instrução da contratação direta — especialmente por <strong style="color: var(--pergaminho);">inexigibilidade de licitação</strong>, quando presentes os requisitos legais, ou por <strong style="color: var(--pergaminho);">dispensa de licitação</strong>, conforme o valor e a hipótese aplicável. Quando juridicamente cabível, também podem ser estruturados convênios, parcerias e instrumentos de cooperação.',
  cards: [
    {
      num: "01",
      titulo: "Inexigibilidade de licitação",
      artigo: "Lei 14.133/2021 · art. 74, III",
      descricao:
        "Hipótese preferencial para programas, cursos, formações especializadas, curadoria docente e soluções educacionais de alta especialização, quando caracterizada a inviabilidade de competição e atendidos os requisitos legais.",
    },
    {
      num: "02",
      titulo: "Dispensa de licitação",
      artigo: "Lei 14.133/2021 · art. 75",
      descricao:
        "Aplicável conforme limites legais de valor ou hipóteses específicas previstas na legislação — especialmente em capacitações, módulos avulsos ou demandas institucionais de menor porte.",
    },
    {
      num: "03",
      titulo: "Convênios, parcerias e cooperação",
      artigo: "Instrumentos institucionais cabíveis",
      descricao:
        "Quando juridicamente adequado, a NTC pode apoiar iniciativas por meio de convênios, parcerias, acordos de cooperação, cooperação técnica ou instrumentos congêneres entre entes públicos, federativos e institucionais.",
    },
    {
      num: "04",
      titulo: "Apoio técnico à formalização",
      artigo: "Documentação institucional",
      descricao:
        "A equipe NTC apoia a instrução documental com proposta institucional, especificação técnica, justificativa, documentação de regularidade, certidões, dados para empenho, nota fiscal e demais documentos necessários à formalização.",
    },
  ] as CardJuridico[],
  disclaimer:
    "O apoio técnico à formalização tem caráter institucional de organização documental — não substitui a assessoria jurídica do órgão contratante, que detém a competência exclusiva para a análise e a decisão sobre a hipótese de contratação aplicável a cada caso.",
  ctas: [
    {
      texto: "Solicitar proposta institucional",
      href: "/contato",
      cmsLink: "proposta-institucional",
      track: "sol_juridico_proposta",
      arrow: true,
      classe: "btn btn--gold",
    },
    {
      texto: "Falar com atendimento dedicado",
      href: "/contato",
      cmsLink: "atendimento-juridico",
      track: "sol_juridico_atendimento",
      classe: "btn btn--ghost-light",
    },
  ] as LinkInterno[],
};

// ----------------- VITRINE POR ÁREA (4 cards) -----------------

export interface CardVitrine {
  slug: VerticalSlug;
  eyebrow: string;
  titulo: string;
  descricao: string;
  metaHtml: string;
  link: LinkInterno;
}

export const VITRINE_HEAD = {
  eyebrow: "Aplicações por área estratégica",
  tituloHtml: "Soluções entregues nas <em>3 áreas + Núcleo Contratações</em>",
  intro:
    "Cada área estratégica tem programas-mãe canon que podem ser entregues em qualquer das quatro modalidades. Clique para conhecer a vertical e seus programas.",
};

export const VITRINE: CardVitrine[] = [
  {
    slug: "educacao",
    eyebrow: "NTC Educação",
    titulo: "Educação",
    descricao:
      "9 programas estratégicos cobrindo alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, ensino médio e políticas educacionais.",
    metaHtml:
      "Programas-mãe disponíveis · <strong>PEAR · EDUTEC · PROGE · PEI · PROGIR · EGIDE · PINEI · VIVAESCOLA · FUTURA</strong>",
    link: {
      texto: "Conhecer NTC Educação",
      href: "/solucoes-estrategicas/educacao",
      cmsLink: "vertical-edu",
      track: "sol_vitrine_edu",
    },
  },
  {
    slug: "gestao-publica",
    eyebrow: "NTC Gestão Pública",
    titulo: "Gestão Pública",
    descricao:
      "3 programas estratégicos articulando liderança institucional, governança, modernização administrativa e direção estratégica do Estado brasileiro.",
    metaHtml: "Programas-mãe disponíveis · <strong>LIDERA · SIGA · AGIP</strong>",
    link: {
      texto: "Conhecer NTC Gestão Pública",
      href: "/solucoes-estrategicas/gestao-publica",
      cmsLink: "vertical-gov",
      track: "sol_vitrine_gov",
    },
  },
  {
    slug: "contratacoes",
    eyebrow: "Núcleo Contratações · Frente NTC GP",
    titulo: "Contratações Públicas",
    descricao:
      "Núcleo técnico especializado da NTC Gestão Pública — Lei 14.133/2021, licitações, contratos, controle externo, concessões, PPPs, obras e gestão contratual.",
    metaHtml: "Programa-mãe · <strong>AGIP</strong> · Núcleo Contratações",
    link: {
      texto: "Conhecer AGIP · Núcleo Contratações",
      href: "/programas/agip",
      cmsLink: "programa-AGIP",
      track: "sol_vitrine_cp",
    },
  },
  {
    slug: "saude",
    eyebrow: "NTC Saúde",
    titulo: "Saúde",
    descricao:
      "3 programas estratégicos em governança do SUS, atenção primária, redes de cuidado, saúde digital, IA, financiamento e direção institucional em saúde pública.",
    metaHtml: "Programas-mãe disponíveis · <strong>SIGS · PROAPS+ · PROSUS+</strong>",
    link: {
      texto: "Conhecer NTC Saúde",
      href: "/solucoes-estrategicas/saude",
      cmsLink: "vertical-sau",
      track: "sol_vitrine_sau",
    },
  },
];

// ----------------- PROCESSO (5 passos) -----------------

export interface PassoProcesso {
  titulo: string;
  descricao: string;
  prazo: string;
}

export const PROCESSO_HEAD = {
  eyebrow: "Como funciona",
  tituloHtml: "Processo de proposta institucional · <em>5 passos</em>",
  intro:
    "Do briefing inicial à entrega do programa — equipe comercial dedicada acompanha cada etapa.",
};

export const PROCESSO_PASSOS: PassoProcesso[] = [
  {
    titulo: "Briefing",
    descricao:
      "Conversa inicial com a equipe da instituição — objetivos da gestão, perfil dos quadros, contexto e prazo da contratação.",
    prazo: "Prazo · 1-3 dias úteis",
  },
  {
    titulo: "Diagnóstico",
    descricao:
      "A NTC analisa o briefing, mapeia o programa-mãe ou desenho sob medida adequado, propõe curadoria docente e formato.",
    prazo: "Prazo · 3-5 dias úteis",
  },
  {
    titulo: "Proposta",
    descricao:
      "Apresentação da proposta institucional com programa, módulos, curadoria, cronograma, investimento e hipótese jurídica sugerida.",
    prazo: "Prazo · até 10 dias úteis a partir do briefing",
  },
  {
    titulo: "Validação",
    descricao:
      "Refinamentos finais e apoio à instrução da contratação direta — com especificação técnica, justificativa institucional e documentação necessária à formalização.",
    prazo: "Prazo · conforme calendário do órgão",
  },
  {
    titulo: "Entrega",
    descricao:
      "Execução do programa com plataforma EventOn, curadoria docente, materiais, suporte logístico e relatório executivo de encerramento.",
    prazo: "Prazo · conforme cronograma contratado",
  },
];

export const PROCESSO_CTA: LinkInterno = {
  texto: "Iniciar briefing institucional",
  href: "/contato",
  cmsLink: "proposta-institucional",
  track: "sol_processo_cta",
  arrow: true,
  classe: "btn btn--gold",
};

// ----------------- FAQ (8 perguntas) -----------------

export interface ItemFaq {
  id: string;
  pergunta: string;
  respostaHtml: string;
  arrancaAberto?: boolean;
}

export const FAQ_HEAD = {
  eyebrow: "Dúvidas comerciais",
  tituloHtml: "Perguntas <em>frequentes</em>",
};

export const FAQ_SOLUCOES: ItemFaq[] = [
  {
    id: "faq-1",
    pergunta: "Qual é o prazo médio entre o briefing inicial e a proposta institucional?",
    arrancaAberto: true,
    respostaHtml:
      "<p>Para <strong>turmas fechadas</strong> e <strong>in company</strong> com programa-mãe canon, a proposta institucional é apresentada em até <strong>5 dias úteis</strong> a partir do briefing. Para <strong>soluções sob medida</strong> e <strong>trilhas curadas</strong>, o prazo é de até <strong>10 dias úteis</strong> em razão do diagnóstico aprofundado e da curadoria docente específica.</p><p>Em situações de urgência institucional, a NTC pode acelerar o processo — basta sinalizar no briefing inicial.</p>",
  },
  {
    id: "faq-2",
    pergunta: "A NTC apoia a formalização da contratação por inexigibilidade ou dispensa?",
    respostaHtml:
      "<p>Sim. A equipe comercial NTC apoia desde a <strong>elaboração do termo de referência</strong>, a <strong>justificativa de inexigibilidade</strong> (Lei 14.133/2021 · art. 74, III) e a <strong>especificação técnica</strong>, até a emissão de certidões, declarações de notória especialização e nota fiscal direta no CNPJ do órgão.</p><p>A NTC tem mais de 20 anos de atuação em contratações públicas, com trajetória consolidada em órgãos federais, governos estaduais, municípios, tribunais e autarquias.</p>",
  },
  {
    id: "faq-3",
    pergunta: "Posso personalizar o programa para a realidade da minha instituição?",
    respostaHtml:
      "<p>Sim, com diferentes níveis de customização conforme a modalidade contratada:</p><p><strong>Turmas fechadas</strong>: ementa do programa-mãe preservada · personalização limitada a datas, formato e carga horária.</p><p><strong>In company</strong>: ementa do programa-mãe + personalização de casos, exemplos e cargas horárias para a realidade da instituição.</p><p><strong>Sob medida</strong>: desenho completo de ementa nova ou híbrida · personalização profunda.</p><p><strong>Trilhas</strong>: curadoria de módulos entre programas · personalização da arquitetura formativa.</p>",
  },
  {
    id: "faq-4",
    pergunta: "Há nota fiscal direta no CNPJ do órgão e empenho?",
    respostaHtml:
      "<p>Sim. O Instituto NTC do Brasil emite nota fiscal direta no CNPJ do órgão contratante, com empenho conforme rito previsto na Lei 14.133/2021, em quaisquer das hipóteses cabíveis (inexigibilidade, dispensa, convênio, parceria ou instrumento de cooperação).</p><p>O CNPJ do Instituto NTC do Brasil, certidões de regularidade fiscal e declarações de notória especialização são apresentados na fase de contratação.</p>",
  },
  {
    id: "faq-5",
    pergunta: "É possível combinar mais de uma modalidade na mesma contratação?",
    respostaHtml:
      "<p>Sim, com frequência. Algumas combinações canon que entregamos:</p><p><strong>Trilha + in company</strong>: jornada plurianual customizada com módulos de diferentes programas, entregue dedicadamente para a instituição.</p><p><strong>Sob medida + turmas fechadas</strong>: arquitetura nova entregue para grupos institucionais dedicados em rodadas sequenciais.</p><p><strong>In company + materiais autorais sob medida</strong>: programa canon entregue à instituição com material adicional autoral específico.</p>",
  },
  {
    id: "faq-6",
    pergunta: "Como funciona a curadoria docente nas modalidades institucionais?",
    respostaHtml:
      '<p>A NTC mantém uma curadoria nacional validada com mais de 120 referências em Educação, Gestão Pública, Contratações e Saúde (ver <a href="/o-grupo/corpo-docente" data-cms-link="corpo-docente-faq" style="color: var(--oxford); border-bottom: 1px solid var(--dourado);">página Corpo Docente</a>). A composição docente para cada contratação é definida caso a caso pela curadoria científica, considerando:</p><p>Eixo formativo · perfil dos participantes · objetivo institucional · disponibilidade da equipe na agenda · formato (presencial · online · híbrido).</p><p>A instituição contratante pode validar a composição docente sugerida e indicar nomes complementares para análise.</p>',
  },
  {
    id: "faq-7",
    pergunta: "O que acontece se a instituição precisar cancelar ou remarcar a entrega?",
    respostaHtml:
      "<p>O contrato de prestação de serviços contempla cláusulas específicas para remarcação e cancelamento, com prazos e condições adequados à dinâmica institucional. Em situações de força maior ou alteração de calendário institucional, a NTC trabalha com flexibilidade para reagendar a entrega preservando o investimento do órgão.</p><p>Detalhes específicos são acordados na proposta institucional, conforme a modalidade contratada.</p>",
  },
  {
    id: "faq-8",
    pergunta: "Como o Grupo NTC trata os dados dos participantes (LGPD)?",
    respostaHtml:
      "<p>Os dados dos participantes são tratados conforme a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018), com finalidade declarada (inscrição, certificação, suporte à plataforma EventOn), retenção pelo período necessário ao vínculo contratual e nunca compartilhados com terceiros sem consentimento explícito.</p><p>O Encarregado de Dados (DPO) do Grupo NTC é <strong>dpo@institutontc.com.br</strong>. Para inscrições em grupo institucional acima de 50 participantes, há consentimento LGPD específico sobre o compartilhamento de dados pela instituição demandante.</p>",
  },
];

// ----------------- CTA FINAL -----------------

export const CTA_FINAL = {
  eyebrow: "Próximo passo institucional",
  tituloHtml: "Solicite uma proposta <em>para a sua instituição</em>.",
  descricao:
    "A equipe comercial NTC apoia desde o briefing inicial até a entrega do programa, com modalidade calibrada para a sua demanda institucional e segurança jurídica em todas as hipóteses da Lei 14.133/2021.",
  ctasPrincipais: [
    {
      texto: "Solicitar proposta institucional",
      href: "/contato",
      cmsLink: "proposta-institucional",
      track: "sol_cta_final_proposta",
      arrow: true,
      classe: "btn btn--gold",
    },
    {
      texto: "Falar com atendimento dedicado",
      href: "/contato",
      cmsLink: "atendimento-comercial",
      track: "sol_cta_final_atendimento",
      classe: "btn btn--ghost-light",
    },
  ] as LinkInterno[],
  divisor: "— Solicitação direta por área estratégica —",
  ctasArea: [
    {
      texto: "Proposta NTC Educação",
      href: "/contato",
      cmsLink: "proposta-edu",
      track: "sol_cta_area_edu",
      classe: "btn btn--ghost-light btn--mini",
    },
    {
      texto: "Proposta NTC Gestão Pública",
      href: "/contato",
      cmsLink: "proposta-gov",
      track: "sol_cta_area_gov",
      classe: "btn btn--ghost-light btn--mini",
    },
    {
      texto: "Proposta Núcleo Contratações",
      href: "/contato",
      cmsLink: "proposta-cp",
      track: "sol_cta_area_cp",
      classe: "btn btn--ghost-light btn--mini",
    },
    {
      texto: "Proposta NTC Saúde",
      href: "/contato",
      cmsLink: "proposta-saude",
      track: "sol_cta_area_saude",
      classe: "btn btn--ghost-light btn--mini",
    },
  ] as LinkInterno[],
};

// ----------------- STICKY CTA MOBILE -----------------

export const STICKY_CTA_SOLUCOES = {
  cta: {
    texto: "Solicitar proposta institucional",
    href: "/contato",
    cmsLink: "sticky-cta-proposta",
    track: "sticky_cta_proposta",
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
git add "apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts"
git commit -m "$(cat <<'EOF'
feat(solucoes): adiciona PARALLAX+JURIDICO+VITRINE+PROCESSO+FAQ+CTA+STICKY

Completa conteudoSolucoes.ts com:
- PARALLAX (1 frase com <strong>).
- JURIDICO: head (eyebrow + tituloHtml + introHtml com <strong>), 4 cards
  (Inexigibilidade, Dispensa, Convênios, Apoio formalização), disclaimer, 2 CTAs.
- VITRINE: head + 4 cards (Educação, Gestão Pública, Contratações, Saúde)
  com hrefs já apontados para /solucoes-estrategicas/<slug> e /programas/agip.
- PROCESSO: head + 5 passos + CTA central.
- FAQ_SOLUCOES: 8 perguntas (faq-1 arrancaAberto), respostas com inline
  <strong>, <a> e <p>. Link da pergunta 6 atualizado para /o-grupo/corpo-docente.
- CTA_FINAL: 2 CTAs principais + divisor + 4 CTAs por área (mini).
- STICKY_CTA_SOLUCOES.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Criar `StickyCtaSolucoes.tsx` (client, scroll + dismiss local)

**Files:**
- Create: `apps/web/app/(solucoes)/solucoes/StickyCtaSolucoes.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/StickyCtaSolucoes.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA_SOLUCOES } from "./conteudoSolucoes";

/**
 * Sticky CTA mobile da página /solucoes. Espelha o IIFE do protótipo
 * (linhas 2243-2258 de 26_Pagina_Solucoes_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local, sem
 *   sessionStorage — diferente do /agenda).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

export function StickyCtaSolucoes() {
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
    track("sticky_cta_dismissed", { page: "solucoes" });
  };

  const { cta } = STICKY_CTA_SOLUCOES;

  return (
    <div
      className={`sticky-cta-mobile${visivel ? " is-visible" : ""}`}
      id="stickyCta"
      role="complementary"
      aria-label="Chamada institucional móvel"
    >
      <button
        className="sticky-cta-mobile-dismiss"
        id="stickyCtaDismiss"
        type="button"
        aria-label="Fechar chamada"
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
    </div>
  );
}
```

- [ ] **Step 2: Verificar typecheck e lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -30
```

Expected: nada novo crítico (warnings em `_action`/`_payload` no `track()` são esperados/aceitáveis).

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(solucoes)/solucoes/StickyCtaSolucoes.tsx"
git commit -m "$(cat <<'EOF'
feat(solucoes): adiciona StickyCtaSolucoes client component

Espelha o IIFE de sticky CTA do protótipo: aparece após scroll > 800px,
dismiss local (sem sessionStorage, diferente do /agenda). Usa rAF para
debounce do listener e track() no-op para futura integração GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Criar `FaqAcordeao.tsx` (client, 8 itens)

**Files:**
- Create: `apps/web/app/(solucoes)/solucoes/FaqAcordeao.tsx`

- [ ] **Step 1: Criar o componente**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/FaqAcordeao.tsx`:

```tsx
"use client";

import { useState } from "react";

import type { ItemFaq } from "./conteudoSolucoes";

/**
 * FAQ acordeão da página /solucoes. Espelha o IIFE do protótipo (linhas
 * 2228-2241 de 26_Pagina_Solucoes_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="sol-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens com `arrancaAberto: true` começam expandidos (faq-1).
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

interface FaqAcordeaoProps {
  itens: ItemFaq[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(
    () => new Set(itens.filter((i) => i.arrancaAberto).map((i) => i.id)),
  );

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("sol_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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
            className={`sol-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="sol-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="sol-faq-icon" aria-hidden="true">+</span>
            </button>
            <div
              className="sol-faq-body"
              id={item.id}
              dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
            />
          </div>
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

Expected: passa.

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint 2>&1 | tail -25
```

Expected: nada novo crítico.

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(solucoes)/solucoes/FaqAcordeao.tsx"
git commit -m "$(cat <<'EOF'
feat(solucoes): adiciona FaqAcordeao client component

Espelha o IIFE de FAQ accordion do protótipo: estado interno
Set<string> com ids abertos, item com arrancaAberto:true começa
expandido (faq-1), aria-expanded reativo, ícone `+` rotacionado
via CSS .is-open, respostaHtml renderizada com dangerouslySetInnerHTML
(contém <strong>, <a>, <p>). track() no-op para futura GA4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Criar `page.tsx` (server) com as 12 seções

**Files:**
- Create: `apps/web/app/(solucoes)/solucoes/page.tsx`

- [ ] **Step 1: Criar o `page.tsx`**

Write em `/Users/joao/Documents/portal-ntc/apps/web/app/(solucoes)/solucoes/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Fragment } from "react";

import {
  CTA_FINAL,
  DETALHES_MODALIDADES,
  FAQ_HEAD,
  FAQ_SOLUCOES,
  HERO_SOLUCOES,
  JURIDICO,
  MANIFESTO,
  METRICAS,
  MODALIDADES,
  MODALIDADES_HEAD,
  PARALLAX,
  PILARES,
  PILARES_HEAD,
  PROCESSO_CTA,
  PROCESSO_HEAD,
  PROCESSO_PASSOS,
  VITRINE,
  VITRINE_HEAD,
  type BlocoDetalhe,
} from "./conteudoSolucoes";
import { FaqAcordeao } from "./FaqAcordeao";
import { StickyCtaSolucoes } from "./StickyCtaSolucoes";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Soluções institucionais · Modelos de contratação · Grupo NTC",
  description:
    "Programas in company, turmas fechadas, soluções sob medida e trilhas formativas curadas — entregues pelo Instituto NTC do Brasil com segurança jurídica e aderência à Lei 14.133/2021.",
};

/**
 * Página /solucoes — porta literal de 26_Pagina_Solucoes_v1.html.
 *
 * Estrutura (espelho do <main id="main"> do protótipo):
 *   1. Hero institucional slim.
 *   2. Faixa de métricas (4).
 *   3. Manifesto consultivo.
 *   4. 3 pilares.
 *   5. 4 cards de modalidades.
 *   6-9. 4 blocos de detalhamento (in-company, turmas-fechadas, sob-medida, trilhas).
 *   10. Parallax editorial.
 *   11. Bloco jurídico (Lei 14.133/2021).
 *   12. Vitrine por área (4 verticais).
 *   13. Processo 5 passos.
 *   14. FAQ acordeão (8 itens).
 *   15. CTA final.
 *
 * Fora do <main>: <StickyCtaSolucoes /> (`.sticky-cta-mobile`).
 *
 * Header/Footer/InteracoesScroll vêm do layout do route group (solucoes).
 */
export default function SolucoesPage() {
  return (
    <>
      <main id="main">
        {/* 1. HERO INSTITUCIONAL SLIM */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Soluções">
          <div className="hero-page-bg" aria-hidden="true" />
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              {HERO_SOLUCOES.crumb.map((c, i) => (
                <Fragment key={`crumb-${i}`}>
                  {c.href ? <a href={c.href}>{c.texto}</a> : null}
                  {c.current ? <span className="current">{c.texto}</span> : null}
                  {i < HERO_SOLUCOES.crumb.length - 1 && (
                    <span className="sep" aria-hidden="true" />
                  )}
                </Fragment>
              ))}
            </nav>

            <p className="eyebrow gold">{HERO_SOLUCOES.eyebrow}</p>
            <h1 dangerouslySetInnerHTML={{ __html: HERO_SOLUCOES.tituloHtml }} />
            <p
              className="hero-page-sub"
              dangerouslySetInnerHTML={{ __html: HERO_SOLUCOES.subHtml }}
            />

            <div className="hero-quicklinks" aria-label="Atalhos para modelos de contratação">
              {HERO_SOLUCOES.quicklinks.map((q) => (
                <a key={q.href} href={q.href} data-track={q.track}>
                  {q.texto}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 2. FAIXA DE MÉTRICAS */}
        <section className="sol-metrics" aria-label="Métricas institucionais de contratação">
          <div className="container">
            <div className="sol-metrics-grid fade-in">
              {METRICAS.map((m) => (
                <div key={m.lbl} className="sol-metric">
                  <span className="sm-num">{m.num}</span>
                  <span className="sm-lbl">{m.lbl}</span>
                  <span className="sm-detail">{m.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MANIFESTO */}
        <section className="sol-manifesto" aria-label="Abordagem consultiva do Grupo NTC">
          <div className="container">
            <div className="sol-manifesto-inner fade-in">
              <span className="sol-manifesto-marker">{MANIFESTO.marker}</span>
              <h2 dangerouslySetInnerHTML={{ __html: MANIFESTO.tituloHtml }} />
              <p
                className="lede"
                dangerouslySetInnerHTML={{ __html: MANIFESTO.ledeHtml }}
              />
              {MANIFESTO.paragrafosHtml.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </div>
        </section>

        {/* 4. 3 PILARES */}
        <section className="sol-pilares" aria-label="Três pilares da abordagem NTC">
          <div className="container sol-pilares-inner">
            <div className="sol-pilares-head fade-in">
              <p className="eyebrow">{PILARES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: PILARES_HEAD.tituloHtml }} />
              <p>{PILARES_HEAD.descricao}</p>
            </div>
            <div className="sol-pilares-grid fade-in">
              {PILARES.map((p) => (
                <article key={p.num} className="sol-pilar">
                  <span className="sol-pilar-num">{p.num}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.descricao}</p>
                  <span className="sol-pilar-marker">{p.marker}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 4 CARDS DE MODALIDADES */}
        <section
          className="sol-modalidades"
          id="modalidades"
          aria-label="Quatro modalidades canon de contratação NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{MODALIDADES_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: MODALIDADES_HEAD.tituloHtml }} />
              <p className="intro">{MODALIDADES_HEAD.intro}</p>
            </div>
            <div className="sol-modalidades-grid fade-in">
              {MODALIDADES.map((m) => (
                <article key={m.slug} className="sol-card" data-modalidade={m.slug}>
                  <span className="sol-card-num">{m.numLabel}</span>
                  <p className="sol-card-eyebrow">{m.eyebrow}</p>
                  <h3>{m.titulo}</h3>
                  <p className="sol-card-desc">{m.descricao}</p>
                  <ul>
                    {m.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <div
                    className="sol-card-indicado"
                    dangerouslySetInnerHTML={{ __html: m.indicadoHtml }}
                  />
                  <div className="sol-card-actions">
                    <a
                      className="btn btn--gold btn--mini"
                      href={m.ctaSaibaMais.href}
                      data-cms-link={m.ctaSaibaMais.cmsLink}
                      data-track={m.ctaSaibaMais.track}
                    >
                      {m.ctaSaibaMais.texto}
                      {m.ctaSaibaMais.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                    <a
                      className="btn btn--secondary btn--mini"
                      href={m.ctaProposta.href}
                      data-cms-link={m.ctaProposta.cmsLink}
                      data-track={m.ctaProposta.track}
                    >
                      {m.ctaProposta.texto}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6-9. DETALHAMENTO POR MODALIDADE (4 blocos) */}
        {DETALHES_MODALIDADES.map((d) => (
          <BlocoDetalheView key={d.slug} bloco={d} />
        ))}

        {/* 10. PARALLAX EDITORIAL */}
        <aside className="sol-parallax" role="presentation" aria-hidden="true">
          <div className="sol-parallax-inner">
            <span className="sol-parallax-eyebrow">{PARALLAX.eyebrow}</span>
            <h2 dangerouslySetInnerHTML={{ __html: PARALLAX.tituloHtml }} />
          </div>
        </aside>

        {/* 11. BLOCO JURÍDICO */}
        <section
          className="sol-juridico"
          id="contratacao-institucional"
          aria-label="Contratação institucional e Lei 14.133/2021"
        >
          <div className="container">
            <div className="sol-juridico-inner">
              <div className="sol-juridico-head fade-in">
                <p className="eyebrow gold">{JURIDICO.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: JURIDICO.tituloHtml }} />
                <p
                  className="intro"
                  dangerouslySetInnerHTML={{ __html: JURIDICO.introHtml }}
                />
              </div>

              <div className="sol-juridico-grid fade-in">
                {JURIDICO.cards.map((c) => (
                  <article key={c.num} className="sol-juridico-card">
                    <span className="sol-juridico-card-num">{c.num}</span>
                    <h4>{c.titulo}</h4>
                    <p className="sol-juridico-card-art">{c.artigo}</p>
                    <p>{c.descricao}</p>
                  </article>
                ))}
              </div>

              <div className="sol-juridico-cta">
                <p
                  style={{
                    fontStyle: "italic",
                    fontFamily: "var(--font-serif)",
                    color: "var(--pergaminho-80)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    maxWidth: "800px",
                    margin: "0 auto var(--space-3)",
                  }}
                >
                  {JURIDICO.disclaimer}
                </p>
                <div
                  style={{
                    display: "inline-flex",
                    gap: "var(--space-2)",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {JURIDICO.ctas.map((cta) => (
                    <a
                      key={cta.cmsLink ?? cta.texto}
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
            </div>
          </div>
        </section>

        {/* 12. VITRINE POR ÁREA */}
        <section
          className="sol-vitrine"
          id="por-area"
          aria-label="Aplicações por área estratégica"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow">{VITRINE_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: VITRINE_HEAD.tituloHtml }} />
              <p className="intro">{VITRINE_HEAD.intro}</p>
            </div>
            <div className="sol-vitrine-grid fade-in">
              {VITRINE.map((v) => (
                <article key={v.slug} className="sol-vert-card" data-vertical={v.slug}>
                  <span className="sol-vert-card-eyebrow">{v.eyebrow}</span>
                  <h3>{v.titulo}</h3>
                  <p>{v.descricao}</p>
                  <p
                    className="sol-vert-card-meta"
                    dangerouslySetInnerHTML={{ __html: v.metaHtml }}
                  />
                  <a
                    className="sol-vert-card-link"
                    href={v.link.href}
                    data-cms-link={v.link.cmsLink}
                    data-track={v.link.track}
                  >
                    {v.link.texto} <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 13. PROCESSO 5 PASSOS */}
        <section
          className="sol-processo"
          id="processo"
          aria-label="Processo de proposta institucional"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{PROCESSO_HEAD.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: PROCESSO_HEAD.tituloHtml }} />
              <p className="intro">{PROCESSO_HEAD.intro}</p>
            </div>

            <div className="sol-processo-grid fade-in">
              {PROCESSO_PASSOS.map((p) => (
                <article key={p.titulo} className="sol-passo">
                  <h4>{p.titulo}</h4>
                  <p>{p.descricao}</p>
                  <span className="sol-passo-prazo">{p.prazo}</span>
                </article>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
              <a
                className={PROCESSO_CTA.classe}
                href={PROCESSO_CTA.href}
                data-cms-link={PROCESSO_CTA.cmsLink}
                data-track={PROCESSO_CTA.track}
              >
                {PROCESSO_CTA.texto}
                {PROCESSO_CTA.arrow && <span className="btn-arrow"> →</span>}
              </a>
            </div>
          </div>
        </section>

        {/* 14. FAQ */}
        <section
          className="sol-faq"
          id="faq"
          aria-label="Perguntas frequentes sobre contratação institucional"
        >
          <div className="container">
            <div className="sol-faq-inner">
              <div className="sol-faq-head fade-in">
                <p className="eyebrow">{FAQ_HEAD.eyebrow}</p>
                <h2 dangerouslySetInnerHTML={{ __html: FAQ_HEAD.tituloHtml }} />
              </div>
              <FaqAcordeao itens={FAQ_SOLUCOES} />
            </div>
          </div>
        </section>

        {/* 15. CTA FINAL */}
        <section
          className="sol-cta-final"
          aria-label="Chamadas institucionais por modalidade e área"
        >
          <div className="container">
            <div className="sol-cta-final-inner fade-in">
              <p className="eyebrow light">{CTA_FINAL.eyebrow}</p>
              <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL.tituloHtml }} />
              <p>{CTA_FINAL.descricao}</p>

              <div className="sol-cta-final-actions">
                {CTA_FINAL.ctasPrincipais.map((cta) => (
                  <a
                    key={cta.cmsLink ?? cta.texto}
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

              <p className="sol-cta-final-divider">{CTA_FINAL.divisor}</p>

              <div className="sol-cta-final-areas">
                {CTA_FINAL.ctasArea.map((cta) => (
                  <a
                    key={cta.cmsLink ?? cta.texto}
                    className={cta.classe}
                    href={cta.href}
                    data-cms-link={cta.cmsLink}
                    data-track={cta.track}
                  >
                    {cta.texto}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <StickyCtaSolucoes />
    </>
  );
}

// ----------------- Helper interno · um bloco de detalhamento -----------------

function BlocoDetalheView({ bloco }: { bloco: BlocoDetalhe }) {
  return (
    <section
      className={`sol-detail${bloco.cream ? " sol-detail--cream" : ""}`}
      id={bloco.slug}
      aria-label={`Detalhamento · ${bloco.asideEyebrow}`}
    >
      <div className="container">
        <div className="sol-detail-inner">
          <div className="sol-detail-aside fade-in">
            <p className="sol-detail-aside-eyebrow">{bloco.asideEyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: bloco.asideTituloHtml }} />
            <p>{bloco.asideDescricao}</p>
            <p
              style={{
                fontFamily: "var(--font-cond)",
                fontSize: "11.5px",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                color: "var(--oxford)",
                fontWeight: 600,
              }}
            >
              {bloco.asideJuridicoLinha}
            </p>
            <div className="sol-detail-actions">
              <a
                className="btn btn--gold"
                href={bloco.asideCtaPrimario.href}
                data-cms-link={bloco.asideCtaPrimario.cmsLink}
                data-track={bloco.asideCtaPrimario.track}
              >
                {bloco.asideCtaPrimario.texto}
                {bloco.asideCtaPrimario.arrow && <span className="btn-arrow"> →</span>}
              </a>
              <a
                className="btn btn--secondary"
                href={bloco.asideCtaSecundario.href}
                data-cms-link={bloco.asideCtaSecundario.cmsLink}
                data-track={bloco.asideCtaSecundario.track}
              >
                {bloco.asideCtaSecundario.texto}
              </a>
            </div>
          </div>

          <div className="sol-detail-body fade-in">
            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Como funciona</p>
              <h3>4 passos operacionais</h3>
              <div className="sol-steps">
                {bloco.passos.map((p) => (
                  <div key={p.titulo} className="sol-step">
                    <span className="sol-step-num" />
                    <div>
                      <h4>{p.titulo}</h4>
                      <p>{p.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Quando indicar</p>
              <h3>{bloco.cenariosTitulo}</h3>
              <ul className="sol-bullets">
                {bloco.cenarios.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </article>

            <article className="sol-detail-block">
              <p className="sol-detail-block-eyebrow">Diferenciais NTC</p>
              <h3>{bloco.diferenciaisTitulo}</h3>
              <ul className="sol-bullets">
                {bloco.diferenciais.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
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

Expected: zero novos errors em PipelineAgenda/SolucoesPage (warnings em `track()` aceitáveis).

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(solucoes)/solucoes/page.tsx"
git commit -m "$(cat <<'EOF'
feat(solucoes): cria page.tsx server com as 12 seções do protótipo

Renderiza, em ordem do <main id="main">:
1. Hero institucional slim com crumb, eyebrow gold, h1 dangerouslySetInnerHTML
   (com <span class="accent">), sub com <strong style>, 6 quicklinks.
2. Faixa de 4 métricas.
3. Manifesto consultivo (marker + tituloHtml + lede + 2 parágrafos).
4. 3 pilares com sol-pilar-num.
5. 4 cards de modalidades (in-company, turmas-fechadas, sob-medida, trilhas).
6-9. 4 blocos de detalhamento via helper <BlocoDetalheView>.
10. Parallax editorial.
11. Bloco jurídico (4 cards + disclaimer + 2 CTAs).
12. Vitrine por área (4 cards).
13. Processo 5 passos + CTA central.
14. <FaqAcordeao itens={FAQ_SOLUCOES} />.
15. CTA final (2 CTAs principais + divisor + 4 CTAs por área).

Fora do <main>: <StickyCtaSolucoes />. revalidate = 3600. Metadata
descritiva.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Atualizar mega-menu de "Soluções" no `HeaderHome.tsx`

**Files:**
- Modify: `apps/web/app/(home)/HeaderHome.tsx`

- [ ] **Step 1: Localizar os 4 hrefs `#contratacao` no mega-menu de Soluções**

```bash
grep -n "#contratacao" /Users/joao/Documents/portal-ntc/apps/web/app/\(home\)/HeaderHome.tsx
```

Expected: 4 ocorrências (linhas próximas à 312-340), uma para cada modalidade.

- [ ] **Step 2: Substituir o bloco de 4 modalidades**

Edit em `/Users/joao/Documents/portal-ntc/apps/web/app/(home)/HeaderHome.tsx`. Substituir o bloco das 4 modalidades no mega-menu.

old_string:
```
                  <li>
                    <a href="#contratacao">
                      <strong>Soluções in company</strong>
                      <span>Programa entregue exclusivamente à instituição</span>
                    </a>
                  </li>
                  <li>
                    <a href="#contratacao">
                      <strong>Turmas fechadas</strong>
                      <span>Edição operacional dedicada à equipe contratante</span>
                    </a>
                  </li>
                  <li>
                    <a href="#contratacao">
                      <strong>Soluções sob medida</strong>
                      <span>Customização profunda de ementas, módulos e formato</span>
                    </a>
                  </li>
                  <li>
                    <a href="#contratacao">
                      <strong>Trilhas e jornadas</strong>
                      <span>Sequências formativas curadas para necessidades específicas</span>
                    </a>
                  </li>
```

new_string:
```
                  <li>
                    <Link href="/solucoes#in-company">
                      <strong>Soluções in company</strong>
                      <span>Programa entregue exclusivamente à instituição</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#turmas-fechadas">
                      <strong>Turmas fechadas</strong>
                      <span>Edição operacional dedicada à equipe contratante</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#sob-medida">
                      <strong>Soluções sob medida</strong>
                      <span>Customização profunda de ementas, módulos e formato</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/solucoes#trilhas">
                      <strong>Trilhas e jornadas</strong>
                      <span>Sequências formativas curadas para necessidades específicas</span>
                    </Link>
                  </li>
```

- [ ] **Step 3: Confirmar que o item "Contratação institucional" (5º item do mesmo grupo, que aponta para a página inteira) precisa de ajuste**

```bash
grep -n -A1 "Contratação institucional" /Users/joao/Documents/portal-ntc/apps/web/app/\(home\)/HeaderHome.tsx | head -10
```

Se o item exibir `href="#contratacao"` ou outro placeholder, ajustar para `/solucoes#contratacao-institucional` no mesmo padrão (`<Link href="/solucoes#contratacao-institucional">`).

- [ ] **Step 4: Aplicar fix se necessário**

Caso o grep do Step 3 mostre um 5º `<a href="#contratacao">`, fazer Edit equivalente trocando por `<Link href="/solucoes#contratacao-institucional">`.

- [ ] **Step 5: Verificar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck 2>&1 | tail -15
```

Expected: passa.

- [ ] **Step 6: Verificar que não restam `href="#contratacao"` (sem `/solucoes`)**

```bash
grep -n 'href="#contratacao"' /Users/joao/Documents/portal-ntc/apps/web/app/\(home\)/HeaderHome.tsx
```

Expected: nenhuma saída.

- [ ] **Step 7: Commit**

```bash
git add "apps/web/app/(home)/HeaderHome.tsx"
git commit -m "$(cat <<'EOF'
fix(header): mega-menu Soluções aponta para âncoras da nova /solucoes

Os 4 hrefs placeholder #contratacao (in-company, turmas-fechadas,
sob-medida, trilhas) viram <Link href="/solucoes#<ancora>">. Item
"Contratação institucional" aponta para /solucoes#contratacao-institucional.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Validar build de produção

**Files:**
- (nenhuma modificação — validação)

- [ ] **Step 1: Build de produção do monorepo**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm build 2>&1 | tail -50
```

Expected: build passa em todos os pacotes. A rota `/solucoes` deve aparecer prerenderizada como estática.

- [ ] **Step 2: Verificar que a rota /solucoes foi gerada**

```bash
pnpm build 2>&1 | grep "/solucoes" | head -5
```

Expected: ao menos uma linha contendo `/solucoes` com marker `○` (Static). Confirma que a página foi pré-renderizada.

- [ ] **Step 3: Se build falhar, ler erro completo e corrigir**

Se houver erro de tipo, lint ou build, **NÃO** commitar nada — corrigir no arquivo apontado pelo erro e re-rodar `pnpm build`. Após passar, prosseguir para o Task 12.

- [ ] **Step 4: Commit (apenas se houve correção)**

Se foi necessário corrigir algo:

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(solucoes): ajustes pós-build de produção

[descrever o ajuste real feito]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se o build passou sem correção, pular este step (sem commit).

---

## Task 12: Validação via dev server e checkpoint humano

**Files:**
- (nenhuma modificação — validação visual humana)

- [ ] **Step 1: Subir dev server na porta 3000 em background**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3000
```

Use `run_in_background: true` da ferramenta Bash. **NÃO** use `pnpm dev` (turbo não propaga logs).

- [ ] **Step 2: Aguardar logs do dev server indicarem que está pronto**

Esperar por linha `Ready in Xms`. Pode usar Bash com `until grep -q "Ready in"`.

- [ ] **Step 3: Curl da rota /solucoes**

```bash
curl -sI http://localhost:3000/solucoes | head -5
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 4: Curl pelo conteúdo para confirmar marcadores chave**

```bash
curl -s http://localhost:3000/solucoes | grep -oE "<title>[^<]+</title>|class=\"sol-card\"|class=\"sol-detail|class=\"sol-faq-item|class=\"sticky-cta-mobile" | head -20
```

Expected: title correto, 4 cards `sol-card`, 4 sections `sol-detail`, 8 items `sol-faq-item`, 1 `sticky-cta-mobile`.

- [ ] **Step 5: Pedir ao usuário para validar visualmente**

Mensagem:

> O servidor de dev está rodando em http://localhost:3000/solucoes. Por favor:
>
> 1. Abra http://localhost:3000/solucoes no navegador.
> 2. Abra o arquivo `26_Pagina_Solucoes_v1.html` no navegador também (duplo-clique).
> 3. Compare lado a lado: hero (crumb, eyebrow gold, h1 com accent, sub com pergaminho, 6 quicklinks), métricas (4), manifesto, 3 pilares, 4 cards de modalidades, 4 blocos de detalhamento (incluindo `--cream` em B e D), parallax, jurídico com 4 cards + disclaimer + 2 CTAs, vitrine 4 cards, processo 5 passos, FAQ 8 itens (faq-1 aberto), CTA final.
> 4. Teste interatividade: cliques em quicklinks fazem smooth scroll respeitando offset do header; FAQ expande/colapsa com ícone `+` rotacionando; sticky mobile aparece após rolar > 800px e fecha no `×`; mega-menu de "Soluções" no header agora leva às âncoras desta página.
> 5. Reporte discrepâncias visuais ou funcionais.
>
> Quando aprovar, encerro o dev server e finalizo a sessão.

- [ ] **Step 6: Após aprovação humana, encerrar o dev server**

Killar o processo background do `pnpm next dev`. Se houve discrepâncias, corrigir e re-validar antes deste step.

- [ ] **Step 7: Se houve correções pós-validação humana, commitar**

```bash
git add -p
git commit -m "$(cat <<'EOF'
fix(solucoes): ajustes pós-checkpoint visual

[descrever o ajuste real feito após review humano]

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Se nada foi alterado, pular este step.

- [ ] **Step 8: Mover protótipo para `feito/`**

```bash
cd /Users/joao/Documents/portal-ntc && git mv 26_Pagina_Solucoes_v1.html feito/26_Pagina_Solucoes_v1.html && git status --short
```

```bash
git commit -m "$(cat <<'EOF'
chore(solucoes): move 26_Pagina_Solucoes_v1.html para feito/

Página /solucoes portada e aprovada visualmente pelo usuário.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 9: Resumo da sessão (a ser apresentado ao usuário)**

Resumir em até 10 linhas:
- O que foi implementado: rota `/solucoes` em route group `(solucoes)`, com 15 sections (incluindo 4 blocos de detalhamento), FAQ acordeão de 8 itens, sticky CTA mobile, mega-menu do header atualizado.
- O que ficou pendente / fora de escopo: integração de analytics real, captcha, querystring de categoria em `/contato`, âncoras de tab em `/contato`, CMS.
- Próximos passos sugeridos: portar páginas irmãs (`27_Pagina_Capacitacao_v1.html`, `27_Pagina_EventOn_v1.html`, `28_Pagina_Conteudos_v1.html`) ou implementar âncoras pendentes em `/contato` e `/o-grupo`.

---

## Verificação final do plano

- ✅ **Spec coverage:**
  - §3 (arquitetura): Tasks 1, 2, 3, 4, 7, 8, 9, 10.
  - §4 (estrutura page.tsx): Task 9.
  - §5 (conteudoSolucoes.ts): Tasks 4, 5, 6.
  - §6.1 (FaqAcordeao): Task 8.
  - §6.2 (StickyCtaSolucoes): Task 7.
  - §7 (CSS): Tasks 1, 2.
  - §8 (validação): Tasks 11, 12.
  - §9 (riscos): mitigados nas tasks (fidelidade texto-a-texto; helper local `<BlocoDetalheView>`; preservação de inline tags via dangerouslySetInnerHTML; `style` inline preservado em React via objeto; mega-menu atualizado em commit separado).
  - §10 (fora de escopo): respeitado em todas as tasks.
  - Memory `feedback_porta_html_fidelidade.md` aplicada: cada seção lida do HTML linha a linha (Read 1298-2054).
- ✅ **Sem placeholders:** todos os steps têm comandos ou código completos. Conteúdo dos 18 textos longos (4 modalidades + 4 detalhamentos + 8 FAQs + jurídico + processo + CTA final) está literal nos Tasks 4, 5 e 6.
- ✅ **Type consistency:** `LinkInterno`, `CardModalidade`, `BlocoDetalhe`, `PassoOperacional`, `CardJuridico`, `CardVitrine`, `PassoProcesso`, `ItemFaq`, `Pilar`, `Metrica`, `ModalidadeSlug`, `VerticalSlug`, `CrumbItem` definidos no Task 4/5/6 e consumidos consistentemente nos Tasks 7-9. Helper `<BlocoDetalheView>` recebe `bloco: BlocoDetalhe` (import type no top do page.tsx). `FaqAcordeao` recebe `itens: ItemFaq[]`. `StickyCtaSolucoes` lê `STICKY_CTA_SOLUCOES` direto.
