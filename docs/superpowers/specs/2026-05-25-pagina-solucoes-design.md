# Página Soluções Institucionais NTC — Design (porta do HTML)

**Data:** 2026-05-25
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `26_Pagina_Solucoes_v1.html` (~2.387 linhas) para a rota `/solucoes` em um **novo route group** `(solucoes)`. A página é a vitrine comercial das 4 modalidades canon de contratação institucional do Grupo NTC — **in company, turmas fechadas, sob medida, trilhas e jornadas** — apoiadas por contratação direta na Lei 14.133/2021.

A página fecha o trio comercial que tem o mega-menu "Soluções" como entrada no header: verticais (`/solucoes-estrategicas/[area]`, já portadas) + contratação institucional (esta porta). Os 4 hrefs `#contratacao` no `HeaderHome.tsx` (`solucoes` mega-menu) hoje são placeholders e passam a apontar para `/solucoes#in-company`, `/solucoes#turmas-fechadas`, `/solucoes#sob-medida`, `/solucoes#trilhas` após esta sessão.

Página puramente editorial — sem listagens, sem pipeline de filtros. Interatividade restrita a: FAQ acordeão (8 perguntas) e sticky CTA mobile que aparece após scroll > 800px e pode ser dismissado. Mega-menu, drawer mobile, fade-in observer e smooth scroll para âncoras já vêm de `HeaderHome` + `InteracoesScroll` do route group `(home)`.

Segue a estratégia "porta do HTML" consolidada (CSS literal extraído + `page.tsx` server + `conteudoSolucoes.ts` local + 2 client components mínimos para interatividade). É a 8ª porta de protótipo do projeto (após Home v3, O Grupo, 3 verticais, 15 programas, Corpo Docente, 4 institucionais, Contato, Agenda).

## 2. Documentos de referência

- `26_Pagina_Solucoes_v1.html` — fonte canônica visual e funcional. Localizada na raiz do repositório.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma a rota dentro da família Soluções.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual (esta porta usa classes literais do HTML, não componentes do inventário).
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100%; preservar tags inline (`<em>`, `<strong>`, `<br>`, `<a>`).
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em `conteudoSolucoes.ts`, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano lado a lado com o HTML.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')` em background-images do CSS portado.
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `InteracoesScroll` no layout para `.fade-in`.
- Spec irmã: `docs/superpowers/specs/2026-05-23-pagina-contato-design.md` — referência direta para o pattern do FAQ acordeão.
- Spec irmã: `docs/superpowers/specs/2026-05-24-pagina-agenda-design.md` — referência direta para o pattern do sticky CTA mobile (versão simplificada aqui).

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (solucoes)/                           ← NOVO route group
│   ├── layout.tsx                        ← HeaderHome + FooterHome + InteracoesScroll
│   └── solucoes/
│       ├── page.tsx                      ← server component, JSX literal das 12 seções
│       ├── conteudoSolucoes.ts           ← tipos + textos (hero, métricas, manifesto, pilares, modalidades, detalhamentos, jurídico, vitrine, processo, FAQ, CTA final, sticky)
│       ├── FaqAcordeao.tsx               ← client: useState<Set<string>> + dangerouslySetInnerHTML respostas
│       └── StickyCtaSolucoes.tsx         ← client: scroll listener (rAF) + dismiss local
└── solucoes-prototipo.css                ← CSS literal do <style> do HTML (~1.007 linhas)
```

`apps/web/app/layout.tsx` (root) passa a importar `solucoes-prototipo.css` na mesma posição dos outros CSSs de protótipo (após `agenda-prototipo.css`).

**Decisões fixadas:**

- Rota: `/solucoes` (raiz, sem prefixo — o route group é organizacional, não vira segmento de URL). Coexiste com `/solucoes-estrategicas/[area]` (verticais) sem conflito.
- Layout do novo route group `(solucoes)` reaproveita `HeaderHome` + `FooterHome` + `InteracoesScroll` do `(home)` — header/footer/markup do protótipo são idênticos aos da Home v3.
- `revalidate = 3600` no `page.tsx`.
- Sem listagens, sem URL sync, sem pipeline de filtros — página puramente editorial.
- **Track no-op compartilhado:** copiar a função `track(action, payload)` inline em cada client component (mesma estratégia da agenda). YAGNI: não criar helper compartilhado agora.
- **Atualização lateral pós-porta:** ajustar os 4 hrefs `#contratacao` do mega-menu de "Soluções" em `apps/web/app/(home)/HeaderHome.tsx` para apontarem às 4 âncoras da nova rota (`/solucoes#in-company`, `/solucoes#turmas-fechadas`, `/solucoes#sob-medida`, `/solucoes#trilhas`).

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">` do HTML, linhas 1298-2054):

1. **Hero institucional slim** (`<section class="hero-page">`) — crumb dark (Grupo NTC > Soluções institucionais), eyebrow gold "Modelos de contratação · Edição 2026", h1 com `<span class="accent">` e `<br>` (renderizado via `dangerouslySetInnerHTML`), sub com `<strong style="color:var(--pergaminho)">Instituto NTC do Brasil</strong>` inline, `hero-quicklinks` com 6 âncoras + `data-track`.
2. **Faixa de métricas** (`.sol-metrics`) — grid de 4 cards: 20+ anos / 500+ eventos / 400 mil+ agentes / 4 modalidades. Cada card: `sm-num`, `sm-lbl`, `sm-detail`.
3. **Manifesto consultivo** (`.sol-manifesto`) — marker "Abordagem consultiva", h2 com `<em>arquitetura formativa institucional</em>`, lede + 2 parágrafos com `<strong>` inline (dangerouslySetInnerHTML por causa do inline).
4. **3 pilares** (`.sol-pilares`) — head (eyebrow + h2 com `<em>` + parágrafo) + grid 3 cards: `sol-pilar-num` (01/02/03), h3, descrição, marker.
5. **4 cards de modalidades** (`.sol-modalidades` id=`modalidades`) — head (eyebrow gold + h2 + intro) + grid 4 cards. Cada card: `data-modalidade`, `sol-card-num` ("Modalidade A/B/C/D"), eyebrow, h3, descrição, `<ul>` 5 bullets, `sol-card-indicado` com `<strong>` inline, 2 CTAs (gold "Saiba mais" para âncora + secondary "Solicitar proposta" para `/contato`).
6. **4 blocos de detalhamento** (`.sol-detail`) — um por modalidade: `#in-company` (default), `#turmas-fechadas` (`sol-detail--cream`), `#sob-medida` (default), `#trilhas` (`sol-detail--cream`). Pattern: `sol-detail-aside` (eyebrow + h2 com `<em>` + descrição + linha jurídica + 2 CTAs) + `sol-detail-body` com 3 `sol-detail-block`: "4 passos operacionais" (4 `sol-step` com `sol-step-num` vazio + h4 + p), "Cenários típicos" (`<ul class="sol-bullets">` de 4-5 itens), "Diferenciais NTC" (`<ul class="sol-bullets">`).
7. **Parallax editorial** (`<aside class="sol-parallax">`) — 1 frase grande com `<strong>` inline; `role="presentation" aria-hidden="true"`.
8. **Bloco jurídico** (`.sol-juridico` id=`contratacao-institucional`) — head (eyebrow gold + h2 com `<em>` + intro com `<strong>` inline) + grid 4 cards (Inexigibilidade / Dispensa / Convênios / Apoio formalização — cada um com `sol-juridico-card-num`, h4, `sol-juridico-card-art` referenciando artigo da lei, p) + disclaimer em itálico + 2 CTAs (gold proposta + ghost-light atendimento).
9. **Vitrine por área** (`.sol-vitrine` id=`por-area`) — head + grid 4 cards: Educação (9 programas-mãe) / Gestão Pública (3 programas) / Contratações Públicas (Núcleo AGIP) / Saúde (3 programas). Cada `sol-vert-card` tem `data-vertical`, eyebrow, h3, descrição, `sol-vert-card-meta` com programas-mãe em `<strong>`, link.
10. **Processo 5 passos** (`.sol-processo` id=`processo`) — head + grid 5 `sol-passo`: Briefing / Diagnóstico / Proposta / Validação / Entrega. Cada um com h4, p, `sol-passo-prazo`. CTA central abaixo do grid.
11. **`<FaqAcordeao itens={FAQ_SOLUCOES} />`** (`.sol-faq` id=`faq`) — 8 perguntas frequentes, primeira arranca aberta (`is-open` + `aria-expanded="true"`).
12. **CTA final** (`.sol-cta-final`) — eyebrow light + h2 com `<em>sua instituição</em>` + parágrafo + 2 CTAs principais (gold + ghost-light) + divisor `sol-cta-final-divider` "— Solicitação direta por área estratégica —" + 4 CTAs ghost-light mini (Edu / GP / CP / Saúde).

Fora do `<main>`: `<StickyCtaSolucoes />` (`.sticky-cta-mobile` id=`stickyCta`).

## 5. Estrutura do `conteudoSolucoes.ts`

Tipos e exports (sketch):

```ts
// ----------------- Slugs e tipos auxiliares -----------------

export type ModalidadeSlug = "in-company" | "turmas-fechadas" | "sob-medida" | "trilhas";

export type VerticalSlug = "educacao" | "gestao-publica" | "contratacoes" | "saude";

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  track?: string;
  title?: string;
  classe?: string;          // override de classe do botão se necessário
  arrow?: boolean;          // renderiza <span class="btn-arrow">→</span>
}

// ----------------- HERO -----------------

export const HERO_SOLUCOES = {
  crumb: [
    { texto: "Grupo NTC", href: "/" },
    { texto: "Soluções institucionais", current: true },
  ],
  eyebrow: "Modelos de contratação · Edição 2026",
  tituloHtml:
    "Soluções institucionais <span class=\"accent\">do Grupo NTC</span>.<br>Formação dedicada a órgãos, redes e instituições públicas brasileiras.",
  subHtml:
    "Programas in company, turmas fechadas, soluções sob medida e trilhas formativas curadas — entregues pelo <strong style=\"color: var(--pergaminho);\">Instituto NTC do Brasil</strong> com segurança jurídica, aderência à Lei 14.133/2021 e atendimento institucional dedicado.",
  quicklinks: [
    { texto: "In company", href: "#in-company", track: "hero_quicklink_incompany" },
    { texto: "Turmas fechadas", href: "#turmas-fechadas", track: "hero_quicklink_turmas" },
    { texto: "Sob medida", href: "#sob-medida", track: "hero_quicklink_sobmedida" },
    { texto: "Trilhas e jornadas", href: "#trilhas", track: "hero_quicklink_trilhas" },
    { texto: "Contratação institucional", href: "#contratacao-institucional", track: "hero_quicklink_contratacao" },
    { texto: "Como funciona", href: "#processo", track: "hero_quicklink_processo" },
  ],
};

// ----------------- MÉTRICAS -----------------

export interface Metrica {
  num: string;
  lbl: string;
  detail: string;
}

export const METRICAS: Metrica[] = [
  { num: "20+", lbl: "Anos de atuação nacional", detail: "..." },
  { num: "500+", lbl: "Eventos e programas realizados", detail: "..." },
  { num: "400 mil+", lbl: "Agentes públicos capacitados", detail: "..." },
  { num: "4", lbl: "Modalidades canon + contratação institucional", detail: "..." },
];

// ----------------- MANIFESTO -----------------

export const MANIFESTO = {
  marker: "Abordagem consultiva",
  tituloHtml: "Cada contratação é uma <em>arquitetura formativa institucional</em>.",
  ledeHtml: "O Grupo NTC não vende cursos prontos a órgãos públicos. Cada contratação é tratada como uma arquitetura formativa específica, calibrada para o perfil da instituição, os objetivos da gestão e o estágio de maturidade da rede contratante.",
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

export const PILARES: Pilar[] = [ /* 3 itens */ ];

// ----------------- MODALIDADES (4 cards canônicos) -----------------

export interface CardModalidade {
  slug: ModalidadeSlug;
  numLabel: string;          // "Modalidade A/B/C/D"
  eyebrow: string;
  titulo: string;
  descricao: string;
  bullets: string[];         // 5 bullets
  indicadoHtml: string;      // contém <strong>
  ctaSaibaMais: LinkInterno; // âncora interna #in-company etc.
  ctaProposta: LinkInterno;  // /contato
}

export const MODALIDADES: CardModalidade[] = [ /* 4 itens */ ];

// ----------------- DETALHAMENTOS POR MODALIDADE (4 blocos) -----------------

export interface PassoOperacional {
  titulo: string;
  descricao: string;
}

export interface BlocoDetalhe {
  slug: ModalidadeSlug;
  cream?: boolean;
  asideEyebrow: string;            // "Modalidade A · In company"
  asideTituloHtml: string;         // com <em>
  asideDescricao: string;
  asideJuridicoLinha: string;
  asideCtaPrimario: LinkInterno;   // gold
  asideCtaSecundario: LinkInterno; // secondary
  passos: PassoOperacional[];      // 4 passos
  cenariosTitulo: string;          // "Cenários típicos"
  cenarios: string[];              // bullets
  diferenciaisTitulo: string;      // "O que torna a entrega NTC distinta" / "Por que turma fechada NTC funciona" / etc.
  diferenciais: string[];          // bullets
}

export const DETALHES_MODALIDADES: BlocoDetalhe[] = [ /* 4 itens, ordem in-company, turmas-fechadas, sob-medida, trilhas */ ];

// ----------------- PARALLAX -----------------

export const PARALLAX = {
  eyebrow: "Da demanda à entrega",
  tituloHtml: "Da demanda institucional à entrega formativa, a NTC estrutura cada solução com <strong>curadoria, segurança jurídica e execução dedicada</strong>.",
};

// ----------------- JURÍDICO (4 cards) -----------------

export interface CardJuridico {
  num: string;            // "01"
  titulo: string;
  artigo: string;         // "Lei 14.133/2021 · art. 74, III"
  descricao: string;
}

export const JURIDICO = {
  eyebrow: "Contratação institucional",
  tituloHtml: "Contratação institucional <em>por via direta</em>,<br>com segurança jurídica e aderência à Lei 14.133/2021.",
  introHtml: "A NTC apoia órgãos e instituições públicas na instrução da contratação direta — especialmente por <strong style=\"color: var(--pergaminho);\">inexigibilidade de licitação</strong>, quando presentes os requisitos legais, ou por <strong style=\"color: var(--pergaminho);\">dispensa de licitação</strong>, conforme o valor e a hipótese aplicável. Quando juridicamente cabível, também podem ser estruturados convênios, parcerias e instrumentos de cooperação.",
  cards: [ /* 4 CardJuridico */ ] as CardJuridico[],
  disclaimer: "O apoio técnico à formalização tem caráter institucional de organização documental — não substitui a assessoria jurídica do órgão contratante, que detém a competência exclusiva para a análise e a decisão sobre a hipótese de contratação aplicável a cada caso.",
  ctas: [ /* 2 LinkInterno */ ] as LinkInterno[],
};

// ----------------- VITRINE POR ÁREA (4 cards) -----------------

export interface CardVitrine {
  slug: VerticalSlug;
  eyebrow: string;
  titulo: string;
  descricao: string;
  metaHtml: string;        // "Programas-mãe disponíveis · <strong>PEAR · EDUTEC · ...</strong>"
  link: LinkInterno;
}

export const VITRINE: CardVitrine[] = [ /* 4 itens */ ];

// ----------------- PROCESSO (5 passos) -----------------

export interface PassoProcesso {
  titulo: string;
  descricao: string;
  prazo: string;
}

export const PROCESSO = {
  eyebrow: "Como funciona",
  tituloHtml: "Processo de proposta institucional · <em>5 passos</em>",
  intro: "Do briefing inicial à entrega do programa — equipe comercial dedicada acompanha cada etapa.",
  passos: [ /* 5 PassoProcesso */ ] as PassoProcesso[],
  cta: { texto: "Iniciar briefing institucional", href: "/contato", cmsLink: "proposta-institucional", track: "sol_processo_cta" } as LinkInterno,
};

// ----------------- FAQ (8 perguntas) -----------------

export interface ItemFaq {
  id: string;              // "faq-1"
  pergunta: string;
  respostaHtml: string;    // pode conter <strong>, <a>
  arrancaAberto?: boolean;
}

export const FAQ_SOLUCOES: ItemFaq[] = [ /* 8 itens, primeira com arrancaAberto: true */ ];

// ----------------- CTA FINAL -----------------

export const CTA_FINAL = {
  eyebrow: "Próximo passo institucional",
  tituloHtml: "Solicite uma proposta <em>para a sua instituição</em>.",
  descricao: "A equipe comercial NTC apoia desde o briefing inicial até a entrega do programa, com modalidade calibrada para a sua demanda institucional e segurança jurídica em todas as hipóteses da Lei 14.133/2021.",
  ctasPrincipais: [ /* 2 LinkInterno */ ] as LinkInterno[],
  divisor: "— Solicitação direta por área estratégica —",
  ctasArea: [ /* 4 LinkInterno mini */ ] as LinkInterno[],
};

// ----------------- STICKY CTA MOBILE -----------------

export const STICKY_CTA_SOLUCOES = {
  cta: {
    texto: "Solicitar proposta institucional",
    href: "/contato",
    cmsLink: "sticky-cta-proposta",
    track: "sticky_cta_proposta",
  } as LinkInterno,
};
```

**Fidelidade:** todo o `<main>` é lido seção por seção do HTML (linhas 1298-2054) preservando: textos completos (sem rephrasing), tags inline (`<em>`, `<strong>`, `<br>`, `<a>` com `style=` e classes), atributos `data-cms-link` e `data-track` literais, identificadores de âncora (`id` em sections), classes auxiliares como `sol-detail--cream` na 2ª e 4ª seção de detalhamento.

## 6. Client components

### 6.1. `FaqAcordeao.tsx`

Padrão consolidado já usado em `/contato` (`FaqAccordion.tsx`) e `/o-grupo/corpo-docente` (`FaqAcordeao.tsx`). Recebe `itens: ItemFaq[]`. Renderiza `<div class="sol-faq-item{is-open?}">` por item; clique no `<button class="sol-faq-toggle">` adiciona/remove `id` no `Set<string>` interno, atualiza `aria-expanded` e classe `is-open`. Resposta renderizada com `dangerouslySetInnerHTML` (contém `<strong>`, `<a>`). Dispara `track("sol_faq_toggle", { open, q: pergunta.slice(0, 60) })` em cada toggle.

Init: itens com `arrancaAberto: true` entram no Set inicial — primeiro item (`faq-1`) começa aberto.

### 6.2. `StickyCtaSolucoes.tsx`

Versão simplificada do `StickyMobileCTA.tsx` da agenda (sem sessionStorage). Recebe `cta: LinkInterno`. Estado: `visivel`, `dismissed`.

- `useEffect` mount-only: listener `scroll` passive com debounce via `requestAnimationFrame`. Se `dismissed`, ignora. Caso contrário, set `visivel = scrollY > 800`.
- Cleanup remove listener e cancela rAF pendente.
- Botão `×` (id=`stickyCtaDismiss`): set `dismissed = true`, `visivel = false`, dispara `track("sticky_cta_dismissed", { page: "solucoes" })`.
- Renderiza `<div class="sticky-cta-mobile{is-visible?}" id="stickyCta" role="complementary" aria-label="Chamada institucional móvel">` com botão close e `<a class="btn btn--gold">` para `/contato`.

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas 120-1125, ~1.007 linhas), copiado sem adaptação. Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, `--pergaminho`, `--font-serif`, `--font-cond`, `--font-sans`, `--space-*`, `--t-*`, `--shadow-*`) vêm de `home-prototipo.css` — não duplicar.

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`). Buscar e substituir.

**Classes principais incluídas:**

- `.hero-page`, `.hero-page-bg`, `.hero-page-content`, `.crumb`, `.eyebrow.gold`, `.accent`, `.hero-page-sub`, `.hero-quicklinks`
- `.sol-metrics`, `.sol-metrics-grid`, `.sol-metric`, `.sm-num`, `.sm-lbl`, `.sm-detail`
- `.sol-manifesto`, `.sol-manifesto-inner`, `.sol-manifesto-marker`, `.lede`
- `.sol-pilares`, `.sol-pilares-inner`, `.sol-pilares-head`, `.sol-pilares-grid`, `.sol-pilar`, `.sol-pilar-num`, `.sol-pilar-marker`
- `.sol-modalidades`, `.sol-modalidades-grid`, `.section-head`, `.sol-card`, `.sol-card-num`, `.sol-card-eyebrow`, `.sol-card-desc`, `.sol-card-indicado`, `.sol-card-actions`
- `.sol-detail` (+ `.sol-detail--cream`), `.sol-detail-inner`, `.sol-detail-aside`, `.sol-detail-aside-eyebrow`, `.sol-detail-actions`, `.sol-detail-body`, `.sol-detail-block`, `.sol-detail-block-eyebrow`
- `.sol-steps`, `.sol-step`, `.sol-step-num`, `.sol-bullets`
- `.sol-parallax`, `.sol-parallax-inner`, `.sol-parallax-eyebrow`
- `.sol-juridico`, `.sol-juridico-inner`, `.sol-juridico-head`, `.sol-juridico-grid`, `.sol-juridico-card`, `.sol-juridico-card-num`, `.sol-juridico-card-art`, `.sol-juridico-cta`
- `.sol-vitrine`, `.sol-vitrine-grid`, `.sol-vert-card`, `.sol-vert-card-eyebrow`, `.sol-vert-card-meta`, `.sol-vert-card-link`
- `.sol-processo`, `.sol-processo-grid`, `.sol-passo`, `.sol-passo-prazo`
- `.sol-faq`, `.sol-faq-inner`, `.sol-faq-head`, `.sol-faq-item` (+ `.is-open`), `.sol-faq-toggle`, `.sol-faq-icon`, `.sol-faq-body`
- `.sol-cta-final`, `.sol-cta-final-inner`, `.sol-cta-final-actions`, `.sol-cta-final-divider`, `.sol-cta-final-areas`, `.eyebrow.light`
- `.sticky-cta-mobile` (+ `.is-visible`), `.sticky-cta-mobile-dismiss`
- Auxiliares já globais: `.fade-in`, `.is-visible` (em `home-prototipo.css`)

## 8. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm build` passa e rota `/solucoes` é gerada como estática.
4. `pnpm next dev --port 3000` levantado (NÃO `pnpm dev` — turbo não propaga logs dos sub-processos).
5. `curl -sI http://localhost:3000/solucoes` retorna 200.
6. **Validação visual feita pelo usuário** comparando lado a lado com `26_Pagina_Solucoes_v1.html` aberto no navegador. Nenhum screenshot automatizado.
7. Smoke functional checklist:
   - [ ] Header e footer aparecem idênticos à Home v3 (com mega-menu de "Soluções" agora apontando para as âncoras desta página).
   - [ ] Hero exibe título com `<span class="accent">`, sub com `<strong>` em pergaminho, 6 quicklinks com smooth scroll funcionando.
   - [ ] Faixa de métricas exibe 4 cards corretamente.
   - [ ] Manifesto + 3 pilares renderizam.
   - [ ] 4 cards de modalidades exibem corretamente; cada card aponta para a âncora correspondente.
   - [ ] 4 blocos de detalhamento (`#in-company`, `#turmas-fechadas`, `#sob-medida`, `#trilhas`) renderizam com aside + 3 blocos no body.
   - [ ] Sections 2 e 4 (`turmas-fechadas`, `trilhas`) têm fundo cream (`sol-detail--cream`).
   - [ ] Parallax editorial aparece entre os detalhamentos e o bloco jurídico.
   - [ ] Bloco jurídico (`#contratacao-institucional`) exibe 4 cards + disclaimer + 2 CTAs.
   - [ ] Vitrine por área (`#por-area`) exibe 4 cards apontando para verticais corretas e AGIP.
   - [ ] Processo 5 passos (`#processo`) exibe corretamente com prazos.
   - [ ] FAQ (`#faq`) tem 8 perguntas; primeira aberta; click expande/colapsa; ícone `+` rotaciona; respostas com `<strong>` e `<a>` renderizam.
   - [ ] CTA final exibe 2 CTAs principais + divisor + 4 CTAs por área.
   - [ ] Sticky mobile CTA aparece após scroll > 800px em viewport mobile; botão `×` esconde.
   - [ ] `.fade-in` revela seções ao entrar no viewport.
   - [ ] Smooth scroll para âncoras `#in-company` etc. respeita offset do header.

## 9. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `data-track` e `data-cms-link` espalhados em ~30 CTAs; risco de esquecer alguns. | Modelar `LinkInterno` com campos opcionais `cmsLink` e `track`. Lê cada CTA do HTML para preservar literal. Lista de smoke checklist cobre presença dos blocos. |
| Hrefs para `/contato?categoria=X#tab-proposta` — `/contato` ainda não suporta querystring de categoria nem âncora de tab. | Usar `/contato` literal por enquanto. Manter `cmsLink` e `data-track` para rastrear intenção. Não inventar querystring que não funciona. |
| Disclaimer e blocos com `style=` inline no protótipo (cores `var(--pergaminho)`, `var(--oxford)`, `font-cond` etc.). | Preservar `style` inline literal como string no `LinkInterno.style` se necessário, ou aplicar via `dangerouslySetInnerHTML` quando faz parte de um parágrafo. Avaliar caso a caso. Os 4 trechos com `style` inline são: hero sub (`<strong style="color: var(--pergaminho)">`), linha jurídica aside (`style="font-family: var(--font-cond)..."`), intro jurídico (`<strong style="color: var(--pergaminho)">`), disclaimer (`style="font-style: italic..."`). Preservar literais. |
| 4 blocos de detalhamento são quase idênticos em estrutura (DRY tentação). | NÃO refatorar. Cada bloco no array `DETALHES_MODALIDADES` é uma entrada independente. Render via `.map()` no JSX. Helper `<BlocoDetalheView>` interno ao `page.tsx` é OK se ajudar legibilidade. |
| 8 FAQs com tags inline (`<strong>`, `<a>` com `style=`). | Resposta via `dangerouslySetInnerHTML`. Preservar `<a href>` literal mesmo se aponta para `./25_Pagina_Corpo_Docente_v1.html` — converter para `/o-grupo/corpo-docente`. |
| Sticky CTA pode dar mismatch SSR/CSR. | Componente client com estado interno; primeira pintura SSR renderiza `<div class="sticky-cta-mobile">` sem `is-visible`. Listener `scroll` só ativa após mount. Sem `aria-hidden` dinâmico no SSR. |
| Atualizar mega-menu do `HeaderHome.tsx` pode quebrar testes ou screenshots de outras páginas. | Mudança restrita a 4 hrefs (`#contratacao` → `/solucoes#X`). Commit separado, claro, com diff curto. Smoke das outras páginas no checkpoint final. |
| FAQ pode reaproveitar `FaqAcordeao.tsx` do `/contato`? | Não copiar arquivo — cada porta mantém seu componente local (memory `project_porta_html.md`). Componentes podem ser semelhantes mas vivem na pasta da rota correspondente. Sem export compartilhado neste momento. |

## 10. Fora de escopo

- Querystring `?categoria=X` em `/contato` (placeholder mantido como `/contato` simples).
- Âncora `#tab-proposta` e `#tab-atendimento` em `/contato` (mantido como `/contato`).
- Integração real de analytics (GA4/Mixpanel). `track()` permanece no-op em ambos client components.
- CMS / Payload — todos os textos ficam em `conteudoSolucoes.ts`. Coleção `Solucao` no Payload fica para a Janela de CMS futura.
- Internacionalização. Página é pt-BR only.
- Tests automatizados (Vitest/Playwright) — validação visual humana é o checkpoint canônico nesta fase.
- Outras páginas do route group `(solucoes)`. Esta sessão entrega apenas `/solucoes`.
- Reaproveitar `FaqAcordeao` entre páginas (cada porta mantém seu componente local).

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos:
   - estrutura (CSS + import root + layout route group)
   - conteúdo (`conteudoSolucoes.ts` com tipos + todas as constantes)
   - server JSX (`page.tsx`)
   - client components (`FaqAcordeao`, `StickyCtaSolucoes`)
   - atualização do mega-menu em `HeaderHome.tsx`
   - validação (build + dev server + checkpoint humano)
3. Typecheck + lint + build + dev server na porta 3000.
4. Checkpoint visual humano lado a lado com `26_Pagina_Solucoes_v1.html`.
5. Move do protótipo para `feito/` após aprovação.
6. Commit final + atualização de memória se surgirem aprendizados novos.
