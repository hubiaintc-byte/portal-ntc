# Página EventOn — Design (porta do HTML)

**Data:** 2026-10-23
**Autor:** sessão Claude Code com supervisão humana
**Status:** design aprovado pelo PO em 23/10/2026, aguardando review do spec antes do plano de implementação

---

## 1. Contexto

Porta literal de `27_Pagina_EventOn_v1.html` (1.733 linhas) para a rota `/eventon` num route group próprio `(eventon)`. Segue a estratégia "porta do HTML" já consolidada no projeto (CSS literal extraído + `page.tsx` server + `conteudoEventOn.ts` local + Client Components mínimos para interatividade).

Hoje o EventOn existe no site só como **seção** (`#eventon`) da Home, de O Grupo, de Capacitação e das páginas de evento/módulo online. O header e o rodapé apontam "EventOn", "Área do Participante" e "Suporte ao participante" para `/#eventon`. Com a página dedicada, esses links passam a apontar para ela (decisão do PO, 23/10). As seções `#eventon` das outras páginas **não mudam**.

**Route group próprio** (decisão do PO, 23/10): o CSS do protótipo redefine classes genéricas (`.hero-page`, `.crumb`, `.btn`, `.sticky-cta-mobile`, `.section-head`) que também existem no CSS de `(capacitacao)` e `(institucional)`. Um grupo próprio isola a cascata (memory `project_vazamento_cascata_css_prototipos.md`: colisão só acontece dentro do mesmo grupo).

## 2. Documentos de referência

- `27_Pagina_EventOn_v1.html` — fonte canônica visual e funcional.
- `apps/web/app/(capacitacao)/capacitacao/` — precedente mais próximo (subnav sticky, FAQ, sticky CTA mobile, mesmo template de protótipo "27").
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — mapa de rotas.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- `memory/feedback_interacoes_scroll_obrigatorio.md` — `<InteracoesScroll />` no layout, senão `.fade-in` fica invisível.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (eventon)/
│   ├── layout.tsx                     ← HeaderHome + FooterHome + InteracoesScroll + import do CSS
│   └── eventon/
│       ├── page.tsx                   ← server component, JSX literal das seções
│       ├── conteudoEventOn.ts         ← textos, tipos, dados estáticos
│       ├── SubnavEventOn.tsx          ← client: scroll-spy da barra interna
│       ├── FaqEventOn.tsx             ← client: acordeão
│       └── StickyCtaEventOn.tsx       ← client: CTA fixo mobile
└── eventon-prototipo.css              ← CSS literal do bloco <style> do HTML
```

Mais a troca de links em `apps/web/app/(home)/HeaderHome.tsx` e `apps/web/app/(home)/FooterHome.tsx` (§3.2).

### 3.1. Decisões fixadas

- Rota: `/eventon`.
- `(eventon)/layout.tsx` copia o molde de `(solucoes)/layout.tsx`: `HeaderHome`, `FooterHome contatos={await carregarContatos()}`, `InteracoesScroll`, e importa `../eventon-prototipo.css`.
- `revalidate = 3600` no `page.tsx`.
- `metadata`: `title: "Plataforma EventOn · Grupo NTC"` e a `description` do `<meta name="description">` do protótipo, literal. Mesmo padrão de `/capacitacao` e `/solucoes`, que só levam title e description.
- **Sem JSON-LD, OpenGraph nem canonical**: nenhuma página portada os tem, o protótipo aponta para `www.grupontc.com.br` (domínio que não é o do site) e `og-eventon.jpg` não existe em `public/img/og`. Fica fora de escopo (§10).
- `track(...)`, `data-track` e `data-cms-link`: `data-*` mantidos literais nos elementos (como em `/capacitacao`); `track` vira no-op local nos client components, igual ao precedente.
- Scroll suave para âncoras: **sem JS**. O `html { scroll-behavior: smooth; scroll-padding-top: … }` já vem do CSS (global e do próprio protótipo, que soma 56px da subnav em ≥768px). O IIFE 6 do protótipo não é portado.

### 3.2. Links: protótipo → rotas reais

| `href` no protótipo | Rota no Next |
|---|---|
| `./02_Prototipo_Home_GrupoNTC_v2_6.html` | `/` |
| `./09_Pagina_Agenda_v2.html` (breadcrumb "Capacitação") | `/capacitacao` |
| `./09_Pagina_Agenda_v2.html` (login card "Ver agenda →" e CTA final "Ver Agenda Geral NTC") | `/agenda` |
| `./26_Pagina_Solucoes_v1.html` | `/solucoes` |
| `./07_Pagina_Vertical_NTC_Educacao_v1.html` | `/solucoes-estrategicas/educacao` |
| `./07_Pagina_Vertical_NTC_GestaoPublica_v1.html` | `/solucoes-estrategicas/gestao-publica` |
| `./07_Pagina_Vertical_NTC_Saude_v1.html` | `/solucoes-estrategicas/saude` |
| `./06_Pagina_Programa_AGIP_v1.html` | `/programas/agip` |
| `./12_Pagina_Contato_v1.html?categoria=area-participante#tab-atendimento` | `/contato?categoria=area-participante#tab-atendimento` |
| `./12_Pagina_Contato_v1.html?categoria=recuperar-acesso#tab-atendimento` | `/contato?categoria=recuperar-acesso#tab-atendimento` |
| `#…` (âncoras internas) | literais |

O `/contato` atual abre a aba Atendimento pelo hash (`TAB_HASH_MAP` em `RoteadorFormularios.tsx`), mas **ignora `?categoria`**: nada vem pré-selecionado. O parâmetro fica no link (inofensivo) e o `/contato` não é tocado nesta porta.

Rotas internas usam `<Link>` (memory `feedback_build_pega_a_rota_interna.md`); âncoras `#…` ficam `<a>`.

**Header e rodapé** (`HeaderHome.tsx`, `FooterHome.tsx`):

| Item | Antes | Depois |
|---|---|---|
| "EventOn" (mega menu, drawer, rodapé) | `/#eventon` | `/eventon` |
| "Área do Participante" (mega menu, drawer, rodapé, botão `btn--participant` do topo e do drawer) | `/#eventon` | `/eventon#area-participante` |
| "Suporte ao participante" (rodapé) | `/#eventon` | `/eventon#suporte` |

Mudança só no `href` — texto e marcação intactos.

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">`, linhas 817–1419):

1. **Hero** `section.hero-page` — `div.hero-page-bg`, breadcrumb `nav.crumb` (Grupo NTC → Capacitação → Plataforma EventOn), eyebrow, `h1` com `<span class="accent">.</span><br>` (via `dangerouslySetInnerHTML`), subtítulo com `<strong style="color: var(--pergaminho);">` (HTML literal), 2 CTAs, 5 quicklinks.
2. **Métricas** `section.eo-metrics` — 4 `div.eo-metric` (`em-num`, `em-lbl`, `em-detail`).
3. **Subnav** → `<SubnavEventOn links={…} />` (5 links com separadores `·`).
4. **Manifesto** `section.eo-manifesto` — marker, `h2` com `<em>`, `p.lede` + 2 parágrafos.
5. **Recursos** `section#recursos.eo-recursos` — `section-head` + 6 `article.eo-recurso` (num, ícone SVG, `h3`, `p`, meta). SVG guardado como `iconeSvgInner` (innerHTML do `<svg>`, viewBox `0 0 48 48` e atributos de traço fixos no JSX).
6. **Tour** `section#tour.eo-tour` — head + 3 `article.eo-tela`. Os 3 mockups (`eo-mock-live`, `eo-mock-area`, `eo-mock-cert`) são marcação decorativa sem texto editorial além de "Chat moderado" e "Certificado · Instituto NTC do Brasil": ficam como JSX literal no `page.tsx`, um por tela, e os textos (tag, `h4`, `p`, foot) vêm do conteúdo.
7. **Como funciona** `section#como-funciona.eo-processo` — head + 4 `article.eo-passo` (`h4`, `p`, prazo).
8. **Parallax** `aside.eo-parallax` (`role="presentation"`, `aria-hidden="true"`) — eyebrow + `h2` com `<strong>`.
9. **Vitrine** `section#aplicacoes.eo-vitrine` — head + 4 `article.eo-vert-card` com `data-vertical`, eyebrow, `h3`, `p`, meta com `<strong>`, link (`<Link>`).
10. **Suporte** `section#suporte.eo-suporte` — corpo (eyebrow, `h2` com `<em>`, `p`) + 4 `div.eo-canal` (`h4`, `p` com `<strong style>` literal, SLA).
11. **Área do Participante** `section#area-participante.eo-area` — corpo (2 parágrafos + 2 botões), aside com lista de 7 itens, e o **card de login visual** `article.eo-login-card` (campos são `span` mockados, não `input` — sem formulário, fiel ao protótipo; os `<label for>` do protótipo apontam para ids inexistentes e são mantidos como estão).
12. **FAQ** `section#faq.eo-faq` — head + `<FaqEventOn itens={…} />` (8 perguntas).
13. **CTA final** `section.eo-cta-final` — eyebrow, `h2` com `<em>`, `p`, 3 botões.

Fora do `<main>`:

14. `<StickyCtaEventOn />` — `div#stickyCta.sticky-cta-mobile` com dismiss e botão "Acessar Área do Participante →" para `#area-participante`.

## 5. Estrutura do `conteudoEventOn.ts`

Tipos nomeados (interface) e exports `const`, um por seção. Strings com HTML inline terminam em `Html` e são renderizadas com `dangerouslySetInnerHTML`.

- `interface LinkEventOn { texto: string; href: string; cmsLink?: string; track?: string; classe?: string; seta?: boolean }`
- `heroEventOn`: `crumb: LinkEventOn[]` + `atual`, `eyebrow`, `tituloHtml`, `subHtml`, `ctas: LinkEventOn[]`, `quicklinks: LinkEventOn[]`.
- `metricasEventOn: { num; rotulo; detalhe }[]` (4).
- `subnavEventOn: LinkEventOn[]` (5).
- `manifestoEventOn`: `marcador`, `tituloHtml`, `lede`, `paragrafos: string[]`.
- `recursosEventOn`: head (`eyebrow`, `tituloHtml`, `intro`) + `itens: { num; iconeSvgInner; titulo; texto; meta }[]` (6).
- `tourEventOn`: head + `telas: { tag; titulo; texto; rodape }[]` (3).
- `processoEventOn`: head + `passos: { titulo; texto; prazo }[]` (4).
- `parallaxEventOn`: `eyebrow`, `tituloHtml`.
- `vitrineEventOn`: head + `cards: { vertical; eyebrow; titulo; texto; metaHtml; link: LinkEventOn }[]` (4).
- `suporteEventOn`: `eyebrow`, `tituloHtml`, `texto`, `canais: { titulo; textoHtml; sla }[]` (4).
- `areaEventOn`: `eyebrow`, `tituloHtml`, `paragrafos`, `acoes: LinkEventOn[]`, `aside: { eyebrow; titulo; itens: string[] }`, `login: { eyebrow; titulo; sub; cpfLabel; cpfPlaceholder; senhaLabel; acao: LinkEventOn; esqueci: LinkEventOn; primeiraTexto; agenda: LinkEventOn; rodapeHtml }`.
- `faqEventOn`: `eyebrow`, `tituloHtml`, `itens: { id; pergunta; respostaHtml; abertoInicial }[]` (8; só `faq-1` abre inicialmente).
- `ctaFinalEventOn`: `eyebrow`, `tituloHtml`, `texto`, `acoes: LinkEventOn[]` (3).
- `stickyCtaEventOn: LinkEventOn`.

Todo texto copiado **literal** do HTML, inclusive valores como "Centenas", "Milhares", "Alta" e os prazos (24h, 30 min, 7–30 dias, 5 dias úteis, 4h úteis, 15 min). A página não confere esses números (§9).

## 6. Client components

### `SubnavEventOn.tsx`
Espelha o IIFE 7 (scroll-spy). Props: `links: LinkEventOn[]`. Renderiza `nav.eo-subnav > div.eo-subnav-inner` com os links e `span.eo-subnav-sep` `·` entre eles (aria-hidden). Em `useEffect`: `IntersectionObserver` com `rootMargin: -(headerH + 80)px 0px -55% 0px` sobre as seções alvo; a que entra vira ativa (`is-active` + `aria-current="location"`). `headerH` lido de `--header-h` (fallback 88). Sem IntersectionObserver, nenhum ativo. O sticky é só CSS (`position: sticky`), sem classe por JS — diferente de `/capacitacao`.

### `FaqEventOn.tsx`
Espelha o IIFE 3. Props: `itens`. Estado `Set` de ids abertos, inicializado com os `abertoInicial` (só `faq-1`). Renderiza `div.eo-faq-item` (`is-open` quando aberto) > `button.eo-faq-toggle` (`type="button"`, `aria-expanded`, `aria-controls`) com `h3` + `span.eo-faq-icon` `+`, e `div.eo-faq-body#faq-N` com a resposta via `dangerouslySetInnerHTML` (a resposta contém os `<p>`).

### `StickyCtaEventOn.tsx`
Espelha o IIFE 4, no molde de `StickyCtaCapacitacao`: visível com `scrollY > 800` (rAF), botão `×` dispensa para o resto da sessão (estado local). Marcação do protótipo: `div#stickyCta.sticky-cta-mobile` com `role="complementary"` e `aria-label="Chamada institucional móvel"`; botão com `aria-label="Fechar chamada"`.

### Não portados como componente
- Mega menu e drawer (IIFEs 1–2): já estão no `HeaderHome`.
- Fade-in observer (IIFE 5): já está no `InteracoesScroll`.
- Scroll suave (IIFE 6): CSS (§3.1).
- `track('page_view')`: no-op.

## 7. CSS

Bloco `<style>` **inteiro** do HTML (linhas 130–648), copiado sem adaptação para `apps/web/app/eventon-prototipo.css` — tokens `:root`, reset, header, footer e as seções. É o precedente das outras portas (`capacitacao-prototipo.css`, `solucoes-prototipo.css` e `institucional-prototipo.css` começam pelo mesmo bloco de tokens), e o route group próprio limita o efeito à página.

**Gotcha:** a única `url()` é `url('./img/fotos/_optimized/eventon-estudio.1920.webp')` em `.eo-parallax` → `url('/img/fotos/_optimized/eventon-estudio.1920.webp')`. O arquivo existe em `apps/web/public/img/fotos/_optimized/`.

Não portados: o `<link>` do Google Fonts (as fontes vêm de `next/font`, CLAUDE.md §3) e `./assets/cookie_consent.css`/`.js` (o consentimento de cookies já é global no site).

Classes principais: `.hero-page*`, `.crumb`, `.hero-cta-row`, `.hero-quicklinks`, `.eo-metrics*`, `.eo-metric`, `.em-*`, `.eo-subnav*`, `.eo-manifesto*`, `.eo-recursos*`, `.eo-recurso*`, `.eo-tour*`, `.eo-tela*`, `.eo-mock-*`, `.eo-processo*`, `.eo-passo*`, `.eo-parallax*`, `.eo-vitrine*`, `.eo-vert-card*`, `.eo-suporte*`, `.eo-canal*`, `.eo-area*`, `.eo-login-*`, `.eo-faq*`, `.eo-cta-final*`, `.sticky-cta-mobile*`.

## 8. Validação

1. `pnpm --filter web typecheck` e `pnpm lint` passam, sem warnings novos.
2. `pnpm --filter web build` passa (com o dev parado — memory `feedback_build_corrompe_dev_next.md`).
3. `pnpm next dev --port 3000` em `apps/web` (não `pnpm dev`).
4. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/eventon` → `200`.
5. **Validação visual pelo PO**, lado a lado com `27_Pagina_EventOn_v1.html` aberto no navegador, desktop 1440 e mobile 375. Sem screenshot automatizado.
6. Smoke funcional:
   - Hero aparece (não fica invisível): fade-in funcionando.
   - Subnav gruda abaixo do header e destaca a seção corrente ao rolar.
   - Quicklinks e subnav levam à seção certa, sem o título ficar escondido atrás do header + subnav.
   - FAQ: a 1ª pergunta abre aberta; clicar alterna; teclado (Tab + Enter) funciona.
   - Mobile 375: CTA fixo aparece depois de ~800px de rolagem; `×` o esconde.
   - Parallax mostra a foto do estúdio.
   - Links da vitrine, breadcrumb e CTA final abrem as rotas da tabela §3.2; "Acessar Área do Participante" e "Recuperar acesso" abrem `/contato` na aba Atendimento.
   - Header (mega menu e drawer) e rodapé: "EventOn" abre `/eventon`; "Área do Participante" desce até a seção; "Suporte ao participante" desce até Suporte.
   - Home: a seção `#eventon` continua no lugar.

## 9. Riscos e mitigações

- **Números e prazos sem conferência** — "Centenas", "Milhares", "Alta satisfação" e os prazos de credencial, replay, certificado e suporte vêm do protótipo aprovado e são portados como estão (CLAUDE.md §5.3: nada é inventado). Se algum não valer na operação real, a correção é editorial, no `conteudoEventOn.ts`.
- **Card de login é só visual** — imita um formulário (CPF/senha), mas não tem `input` nem envia nada; os botões levam ao `/contato`. É o que o protótipo declara ("Apresentação visual do acesso institucional"). Sem risco de LGPD, porque não coleta dado.
- **`?categoria` ignorado pelo `/contato`** — o visitante cai na aba Atendimento sem categoria pré-selecionada. Aceito; tratar no `/contato` é outra tarefa.
- **Trabalho paralelo no `HeaderHome.tsx`** — há mudança não commitada no `main` (links de modalidade da agenda) feita por outra sessão. A porta roda no worktree `../portal-ntc-eventon` (branch `feat/pagina-eventon`) e mexe só nos `href` do EventOn; o merge pode pedir resolução manual nas linhas vizinhas do drawer.
- **Colisão de CSS** — mitigada pelo route group próprio.

## 10. Fora de escopo

- JSON-LD, OpenGraph, Twitter card e canonical da página (nenhuma porta tem; domínio e imagem do protótipo não existem).
- Área do Participante real (login, histórico, certificados), página pública de validação de certificado e integração com a plataforma EventOn de fato.
- Pré-seleção de categoria no `/contato` via `?categoria`.
- Mexer nas seções `#eventon` da Home, O Grupo, Capacitação e páginas de evento/módulo.
- Textos no CMS.
- Analytics (`track`).

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (CSS + layout → conteúdo → server JSX → client components → links do header/rodapé → validação).
3. Typecheck + lint + build + dev server.
4. Checkpoint visual humano.
5. Merge na `main` com a ordem do PO.
