# Páginas de Programa — Design

**Data:** 2026-05-22
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

O Portal Grupo NTC já tem 3 páginas de vertical portadas (`/solucoes-estrategicas/[area]`) e um header com mega-menu "Programas" listando 15 programas agrupados por vertical (NTC Educação · 9 · NTC Gestão Pública · 3 · NTC Saúde · 3). Os 15 links do mega-menu hoje apontam para o placeholder `#programas`.

Esta sessão entrega as **15 páginas individuais de programa** seguindo a estratégia "porta do HTML" já consolidada no projeto (CSS literal, route group próprio, fallback estático sem CMS).

A página de listagem `/programas` **não** faz parte do escopo — não existirá nesta versão.

## 2. Documentos de referência

- `docs/13_Mapa_Pagina_a_Pagina_v1.md` §4.2 — rota canônica `/programas/[slug]`, revalidate 3600s, ordem das seções.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — inventário de componentes (referência conceitual; nesta porta usamos classes literais do HTML).
- 15 protótipos HTML em `/Users/joao/Documents/portal-ntc/`:
  - `10_Pagina_Programa_LIDERA_v1.html` — **fonte canônica do CSS** (todos os 15 compartilham o mesmo CSS; variação cromática por `data-programa`).
  - `11_Pagina_Programa_SIGA_v1.html`
  - `13_Pagina_Programa_EGIDE_v1.html`
  - `14_Pagina_Programa_SIGS_v1.html`
  - `15_Pagina_Programa_PEAR_v1.html`
  - `16_Pagina_Programa_EDUTEC_v1.html`
  - `17_Pagina_Programa_PROAPS_v1.html`
  - `18_Pagina_Programa_PROSUS_v1.html`
  - `19_Pagina_Programa_PEI_v1.html`
  - `20_Pagina_Programa_PROGE_v1.html`
  - `21_Pagina_Programa_PROGIR_v1.html`
  - `22_Pagina_Programa_PINEI_v1.html`
  - `23_Pagina_Programa_VIVAESCOLA_v1.html`
  - `24_Pagina_Programa_FUTURA_v1.html`
  - **AGIP** — arquivo no repositório do portal não localizado nesta sessão (existe em `/Users/joao/Downloads/06_Pagina_Programa_AGIP_v1.html`). Antes do plano de implementação, confirmar caminho canônico ou pedir cópia para o diretório do portal.

## 3. Arquitetura de rotas

Novo route group `apps/web/app/(programas)/` espelhando o padrão `(o-grupo)` e `(vertical)`:

```
apps/web/app/
├── (programas)/
│   ├── layout.tsx           ← reaproveita HeaderHome + FooterHome + InteracoesScroll
│   └── programas/
│       └── [slug]/
│           ├── page.tsx                ← server component, porta literal das ~13 seções
│           ├── NavBarAncoras.tsx       ← Client: sticky + IntersectionObserver
│           ├── FaqAcordeao.tsx         ← Client: useState<number|null>
│           ├── conteudoEDUTEC.ts       ← 1 por programa (15 arquivos)
│           ├── conteudoPEAR.ts
│           ├── conteudoPEI.ts
│           ├── conteudoPROGIR.ts
│           ├── conteudoPROGE.ts
│           ├── conteudoEGIDE.ts
│           ├── conteudoVIVAESCOLA.ts
│           ├── conteudoPINEI.ts
│           ├── conteudoFUTURA.ts
│           ├── conteudoAGIP.ts
│           ├── conteudoLIDERA.ts
│           ├── conteudoSIGA.ts
│           ├── conteudoSIGS.ts
│           ├── conteudoPROAPS.ts
│           ├── conteudoPROSUS.ts
│           └── conteudoIndex.ts        ← Record<slug, ConteudoPrograma> + tipo
├── programas-prototipo.css   ← CSS literal extraído do LIDERA (~2.700 linhas)
└── layout.tsx                ← acrescentar import "./programas-prototipo.css"
```

**Decisões fixadas:**

- `generateStaticParams` retorna os 15 slugs em minúsculo sem `+`: `edutec`, `pear`, `pei`, `progir`, `proge`, `egide`, `vivaescola`, `pinei`, `futura`, `agip`, `lidera`, `siga`, `sigs`, `proaps`, `prosus`.
- `revalidate = 3600` (alinhado com Mapa §4.2).
- Slug não pertencente à lista → `notFound()`.
- `<main className="program-page" data-programa="SIGLA">` ativa o cromatismo via CSS (seletores `[data-programa="LIDERA"]` etc. já existem no CSS do protótipo).
- `data-programa` preserva o `+` original (`PROAPS+`, `PROSUS+`) para casar com os seletores CSS. **Apenas o slug da URL** vira `proaps`/`prosus` sem `+`.

## 4. Estrutura de cada página

Ordem das seções (porta literal do protótipo):

1. **Breadcrumb** — `Grupo NTC › Soluções Estratégicas › {Vertical} › {sigla}`. Vertical linka para `/solucoes-estrategicas/{vertical}`.
2. **Hero** (`.prog-hero`) — bg da vertical, eyebrow "Programa Estratégico", sigla gigante, 3 stats (módulos/horas/eixos), nome curto da vertical, título h1, sub, 2 CTAs.
3. **Meta-bar** (`.prog-meta-bar`) — 5 cards de metadados (modalidade, duração, perfil, formato, certificação).
4. **Nav sticky** (`.prog-nav`) — 10 âncoras + 2 CTAs ("Solicitar proposta", "Solicitar folder"). Client Component `NavBarAncoras`.
5. **Visão geral** (`#visao-geral`).
6. **Problema** (`#problema`).
7. **Público** (`#publico`).
8. **Eixos** (`#eixos`) — grid de cards.
9. **Módulos** (`#modulos`) — lista de cards numerados.
10. **Resultados** (`#resultados`) — números + diferenciais.
11. **Corpo docente** (`#docentes`) — grade de especialistas (placeholder editorial quando o HTML também é placeholder).
12. **Modalidades** (`#modalidades`).
13. **Módulos abertos** (`#modulos-abertos`).
14. **FAQ** (`#faq`) — Client Component `FaqAcordeao`.
15. **Programas relacionados** (`.related-events-section`) — outros programas da mesma vertical, calculado em build-time.

## 5. Tipo `ConteudoPrograma`

Em `conteudoIndex.ts`:

```ts
export type Vertical = "educacao" | "gestao-publica" | "saude";

export interface CtaPrograma {
  rotulo: string;
  href: string;
  variante?: "gold" | "ghost-light";
}

export interface StatHero { num: string; lbl: string }
export interface MetaItem { rotulo: string; valor: string }
export interface EixoTematico { titulo: string; descricao: string }
export interface Modulo { numero: string; titulo: string; descricao: string; cargaHoraria?: string }
export interface FaqItem { pergunta: string; resposta: string }
export interface RelacionadoPrograma { slug: string; sigla: string; nomeCurto: string; descritor: string }

export interface ConteudoPrograma {
  sigla: string;                 // "LIDERA" — sem o "+", uso interno
  siglaCss: string;              // "LIDERA" / "PROAPS+" — vai pro data-programa
  siglaExibida: string;          // "LIDERA" / "PROAPS+" — render no hero
  slug: string;                  // "lidera" / "proaps"
  nomeCompleto: string;
  vertical: Vertical;
  verticalRotulo: string;        // "NTC Gestão Pública"
  breadcrumb: { current: string };
  hero: {
    bgSrc: string;
    eyebrow: string;
    stats: StatHero[];           // 3 itens
    tituloHtml: string;
    sub: string;
    ctas: CtaPrograma[];         // 2 itens
  };
  metaBar: MetaItem[];           // 5 itens
  navAnchors: { href: string; rotulo: string }[];
  visaoGeral: { eyebrow: string; titulo: string; corpoHtml: string };
  problema: { eyebrow: string; titulo: string; corpoHtml: string };
  publico: { eyebrow: string; titulo: string; corpoHtml: string };
  eixos: { eyebrow: string; titulo: string; itens: EixoTematico[] };
  modulos: { eyebrow: string; titulo: string; itens: Modulo[] };
  resultados: { eyebrow: string; titulo: string; corpoHtml: string };
  docentes: { eyebrow: string; titulo: string; descricaoHtml?: string };
  modalidades: { eyebrow: string; titulo: string; corpoHtml: string };
  modulosAbertos: { eyebrow: string; titulo: string; corpoHtml: string };
  faq: { eyebrow: string; titulo: string; itens: FaqItem[] };
  // programasRelacionados é calculado em page.tsx a partir da vertical, não vem do conteudo<SIGLA>.ts
}

export const PROGRAMAS: Record<string, ConteudoPrograma> = { /* 15 entradas */ };
export const SLUGS_VALIDOS: string[] = Object.keys(PROGRAMAS);
```

Princípios:

- `tituloHtml`/`corpoHtml` permitem `<br>`/`<em>`/`<strong>` literais do protótipo (mesma estratégia das verticais).
- Conteúdo extraído **1:1 do HTML** correspondente. Não inventar texto institucional (CLAUDE.md §5.3).
- Onde o HTML usa placeholder (fotos de docentes, dados numéricos não confirmados), preservar como `[texto a definir pela equipe editorial]`.
- Sem CMS, sem Payload. Fonte única é o arquivo `conteudo<SIGLA>.ts`.

## 6. CSS, Header e mega-menu

**CSS** (`apps/web/app/programas-prototipo.css`):

- Extraído integralmente do `<style>` de `10_Pagina_Programa_LIDERA_v1.html` (linhas ~135–2.831 do arquivo). Todos os 15 HTMLs têm o mesmo CSS — a variação cromática vem por `[data-programa="SIGLA"]`.
- Importado **uma única vez** no root `app/layout.tsx`, logo após `verticais-prototipo.css`.
- Sem `<style>` inline na `page.tsx`.

**Mega-menu** (`apps/web/app/(home)/HeaderHome.tsx`):

- Substituir 15 `href="#programas"` (linhas aproximadas 178, 184, 190, 196, 202, 208, 214, 220, 226, 237, 243, 249, 260, 266, 272) por `<Link href="/programas/{slug}">`.
- `Link` do `next/link` já está importado (o mega-menu "Soluções" já usa).
- Fechamento do mega ao navegar já está implementado (commit `cb4467c`).

## 7. Interatividade (Client Components)

**`NavBarAncoras.tsx`:**

- Sticky nav com 10 âncoras + 2 CTAs.
- IntersectionObserver detecta seção visível → adiciona `is-active` no link.
- Receberá `slug: string` como prop. O CTA "Solicitar proposta" navegará para `/contato/proposta?programa={slug}` (rota futura — link funciona quando a rota existir; até lá, 404 controlado).
- O CTA "Solicitar folder" também aponta para `/contato/proposta?programa={slug}&assunto=folder` (mesma rota futura, query distinta).
- Padrão de implementação espelhado de `apps/web/app/(vertical)/solucoes-estrategicas/[area]/NavBarInternaSticky.tsx` e `apps/web/app/(o-grupo)/o-grupo/NavBarAncoras.tsx`.

**`FaqAcordeao.tsx`:**

- `useState<number | null>(null)` para item aberto. 1 item aberto por vez.
- Recebe `itens: FaqItem[]` como prop.
- `<button aria-expanded>` + `<div role="region" aria-labelledby>` para acessibilidade.

**`InteracoesScroll`:**

- Já é global (vem do `(programas)/layout.tsx` via reuso do componente da Home). Cuida do `.fade-in` ao entrar no viewport.
- Não duplicar.

## 8. Conteúdo editorial e imagens

**Conteúdo:**

- Cada `conteudo<SIGLA>.ts` preenchido com texto literal do HTML correspondente.
- Onde o HTML usa `<em>`/`<strong>`/`<br>` ou estruturas inline curtas — preservar via `corpoHtml`.
- Placeholders óbvios → `[texto a definir pela equipe editorial]` (CLAUDE.md §5.3).

**Imagens:**

- Hero usa `area-{vertical}.1920.webp` (compartilhada com a página da vertical).
- Caminho final: `/img/fotos/area-{vertical}.1920.webp` (padrão das verticais portadas).
- **Pré-checagem na Fase 1:** confirmar que `apps/web/public/img/fotos/area-educacao.1920.webp`, `area-gestao-publica.1920.webp` e `area-saude.1920.webp` existem. Se faltar, copiar do diretório `_optimized` dos HTMLs.

**Programas relacionados:**

- Calculado em build-time dentro de `page.tsx`: filtra `PROGRAMAS` pela vertical do programa atual, exclui o próprio slug, limita a 4.
- Não vem do `conteudo<SIGLA>.ts`.

## 9. Metadados, breadcrumb e SEO

**`generateMetadata(params)`:**

- `title`: `${sigla} · ${nomeCompleto}` (o template do root layout adiciona `· Grupo NTC`).
- `description`: primeira frase de `visaoGeral.corpoHtml` (strip de tags).
- `openGraph.images`: `[{ url: hero.bgSrc }]`.

**Breadcrumb:**

- `<Link href="/">Grupo NTC</Link> / <Link href="/solucoes-estrategicas/{vertical}">{verticalRotulo}</Link> / <span class="current">{sigla}</span>`.

**JSON-LD `Course`:**

- DAB pede mas exige dados estruturados que não estão no HTML (provider URL, timeRequired ISO 8601, etc.).
- **Fora do escopo desta sessão.** Comentário `// TODO: JSON-LD Course (Mapa §4.2)` no `page.tsx`.

**Estado de rascunho (`_status`):**

- Não há CMS nesta porta. Todos os 15 são "publicados" por construção. Sem verificação de `_status`.

## 10. Estratégia de portagem (faseamento)

**Fase 1 — Andaime + 1 programa de referência (LIDERA):**

1. Criar `apps/web/app/(programas)/layout.tsx` (reuso de HeaderHome/FooterHome/InteracoesScroll).
2. Criar `programas-prototipo.css` na raiz de `app/`, importar no root `layout.tsx`.
3. Implementar `programas/[slug]/page.tsx` completo com todas as 15 seções.
4. Implementar `NavBarAncoras.tsx` e `FaqAcordeao.tsx`.
5. Criar `conteudoIndex.ts` (tipo + Record vazio) e `conteudoLIDERA.ts` (programa completo).
6. Atualizar `HeaderHome.tsx`: trocar 15 `href="#programas"` por `<Link href="/programas/{slug}">`. Apenas LIDERA tem página real nesta fase — os outros 14 retornam 404 controlado (intencional).
7. Pré-checagem: confirmar `area-gestao-publica.1920.webp` em `public/img/fotos/`.
8. Checkpoint visual: comparar `/programas/lidera` com `10_Pagina_Programa_LIDERA_v1.html` (desktop 1440 + mobile 375). Validação humana (servidor no ar, usuário aprova — `feedback_validacao_visual`).

**Fase 2 — Portagem em massa (14 programas restantes):**

- Sequência: EDUTEC, PEAR, PEI, PROGIR, PROGE, EGIDE, VIVAESCOLA, PINEI, FUTURA (Educação) → AGIP, SIGA (Gestão Pública) → SIGS, PROAPS+, PROSUS+ (Saúde).
- Para cada programa: criar `conteudo<SIGLA>.ts`, registrar em `conteudoIndex.ts`.
- Mini-checkpoint visual a cada 3 programas (não 14 individuais).

**Fase 3 — Polish:**

- Smoke test global: percorrer os 15 slugs.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` — todos verdes.
- Revisão dos 15 `data-programa` (incluindo `+` em PROAPS/PROSUS).

## 11. Verificação

**Por programa (manual):**

- `pnpm dev` → abrir `/programas/{slug}` em desktop (1440) e mobile (375).
- Comparar visualmente com o HTML de referência.
- Conferir: hero, meta-bar, sticky nav, todas as 10 seções, FAQ acordeão, programas relacionados, breadcrumb, mega-menu navegando para a rota correta.
- Reportar discrepâncias ao usuário antes de declarar "pronto" (CLAUDE.md §6 + `feedback_validacao_visual`).

**Por commit significativo:**

- `pnpm lint` — sem warnings novos.
- `pnpm typecheck` — sem erros.
- `pnpm build` — build OK.

**Testes automatizados:** sem unit nem e2e nesta sessão. Conteúdo estático; interatividade é cópia direta do padrão da vertical.

**Acessibilidade (CLAUDE.md §10):** `<main>`/`<nav>`/`<section>` com `aria-label`; FAQ com `aria-expanded`/`role="region"`; skip-link já global.

**Performance (CLAUDE.md §11):** Server Components por padrão; só `NavBarAncoras` e `FaqAcordeao` são Client. Hero usa CSS `background-image` literal — sem `next/image` para preservar fidelidade ao protótipo.

## 12. Fora do escopo

- Página de listagem `/programas` (não existe nesta versão).
- Integração com coleção Payload `Programas` ou qualquer CMS.
- JSON-LD `Course` (TODO marcado).
- Form `/contato/proposta?programa={slug}` (CTAs apontam para rota futura — 404 controlado até a rota existir).
- Testes Vitest/Playwright.
- Refatorações nas páginas já portadas (vertical, o-grupo, home).
- `<HeroPrograma>`, `<ListaModulos>` e demais componentes do Inventário §12 — esta porta usa classes literais do HTML, não componentes do design system.

## 13. Pontos a confirmar antes do plano

1. **Caminho canônico do HTML do AGIP.** Hoje encontrei apenas em `/Users/joao/Downloads/06_Pagina_Programa_AGIP_v1.html`. Pedir cópia para o diretório do portal antes da Fase 2.
