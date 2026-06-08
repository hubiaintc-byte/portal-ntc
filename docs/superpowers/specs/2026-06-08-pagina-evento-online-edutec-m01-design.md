# Página Evento Online (EDUTEC Módulo 01) — Design (porta do protótipo dedicado)

**Data:** 2026-06-08 (revisão 2 — re-porta a partir do protótipo correto)
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano

---

## 1. Contexto

> **Revisão 2.** A revisão 1 deste spec portou a página a partir do folder PDF + protótipo AGIP híbrido (classes `event-*`). Estava errado: existe um **protótipo dedicado** `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` (classes `evt-*`), que é a fonte de verdade visual (CLAUDE.md §18) e tem estrutura/dados diferentes. A porta da revisão 1 foi revertida (branch `feat/evento-online-edutec-m01`, código de volta ao estado da `main`). Ver memory `feedback_prototipo_dedicado_em_feito`.

Esta porta implementa o `EventoOnlineLayout` (variante `online` de `/agenda/[slug]`, hoje em `notFound`) e cadastra o evento **EDUTEC Módulo 01** em `/agenda/edutec-m01-2026`, **fiel ao protótipo dedicado**.

**Regras do usuário para esta porta:**
- **Design e ordem de seções = protótipo** `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` (classes `evt-*`).
- **Textos = folder PDF** (`Folder · Módulo 01 EDUTEC ... 2026 - Nova Data.pdf`), literais.
- **Dados do evento = protótipo:** 27 de Maio de 2026, "Sob consulta" (sem preço numérico), deadline de inscrição 20/Mai. (O protótipo é mais recente que o folder nesse ponto.)
- **Conteúdo do PDF que não cabe no protótipo vira seção extra** no mesmo estilo. Caso concreto: as **29 questões formativas** do PDF → nova seção `#questoes` (estilo `.evt-section`), inserida entre Programação e Palestrantes.
- **Fotos dos palestrantes:** `foto: ""` + TODO (usuário sobe depois).
- **Sem dados bancários** (o próprio protótipo proíbe explicitamente no comentário de "REGRAS DE PAGAMENTO").

## 2. Documentos de referência

- `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` — **fonte canônica** visual/estrutural. `<main>` linhas 2496–3225. CSS de evento linhas 1469–2308.
- Folder PDF EDUTEC M01 (raiz) — **fonte canônica de textos** das seções.
- `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx` — padrão de espelho (mas usa classes `event-*` do AGIP; o EDUTEC usa `evt-*`/`sb-*`/`schedule-node` etc.).
- `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` — tipos + `EVENTOS_AGENDA`.
- `apps/web/app/evento-prototipo.css` — CSS de evento a estender (já tem 25 seletores `evt-*` compartilhados; faltam 57).
- Client components já existentes (reaproveitados): `EventoSubnav`, `FaqEvento`, `AgendaDropdown`, `CountdownSidebar`.
- memory: `feedback_prototipo_dedicado_em_feito`, `feedback_porta_html_fidelidade`, `feedback_css_url_absoluto`, `feedback_cms_apenas_quando_pedido`, `feedback_validacao_visual`, `feedback_build_pega_a_rota_interna`.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (capacitacao)/agenda/[slug]/
│   ├── page.tsx                       ← EDITAR: case "online" → <EventoOnlineLayout>
│   ├── EventoOnlineLayout.tsx         ← CRIAR: espelho do <main> evt-* do protótipo
│   ├── conteudoEventos.ts             ← EDITAR: reescrever EventoOnline (estrutura evt-*) + evento edutec-m01-2026
│   ├── EventoSubnav.tsx               ← reaproveitado (já renderiza .evt-nav)
│   ├── AgendaDropdown.tsx             ← reaproveitado (Google/Outlook/Apple/ICS)
│   ├── CountdownSidebar.tsx           ← reaproveitado (.sidebar-countdown) — alinhar CSS para sidebar do protótipo
│   └── FaqEvento.tsx                  ← reaproveitado (.faq-item/.faq-question)
└── evento-prototipo.css               ← EDITAR: + 57 seletores faltantes do bloco 1469-2308 + acento EDUTEC-M01
```

CSS já importado no root `layout.tsx`. Header/Footer/InteracoesScroll vêm de `(capacitacao)/layout.tsx`.

**Decisões fixadas:**
- Rota `/agenda/edutec-m01-2026`; `revalidate = 3600`.
- Cadastro **estático** em `conteudoEventos.ts` (não CMS).
- `data-evento="EDUTEC-M01"` no `<main>` (ativa o acento cromático `#1F5060`).
- Hrefs internos: o protótipo aponta para `./12_Pagina_Contato_v1.html?...` e `./02_Prototipo_Home...#...`. Mapear para rotas reais já existentes: `/contato?evento=...`, `/programas/edutec`, `/capacitacao`. (Padrão já usado no PROSUS.)

## 4. Estrutura do `EventoOnlineLayout.tsx` (server) — ordem do `<main>` do protótipo

1. **Breadcrumb** (`.breadcrumb`) — Grupo NTC / Capacitação / Eventos online / "Seminário EDUTEC · Cultura Digital".
2. **Hero** (`.evt-hero` + `.evt-hero-bg` imagem-mãe) — tags (status `Inscrições abertas` / format `Seminário Online ao Vivo` / vert `NTC Educação`), `h1` com `<em>Transformação</em>`, `.evt-hero-sub`, `.evt-hero-program-binding` (EDUTEC → `/programas/edutec`), `.evt-hero-ctas` (Inscrever / Baixar folder / Inscrever equipe).
3. **Meta-bar** (`.evt-meta-bar`) — 5 itens: Quando (27·Maio / 2026·Quarta-feira), Modalidade (Ao vivo / +replay 7 dias), Carga horária (8 horas / Manhã+Tarde), Plataforma (EventON NTC / Acesso individual), Investimento (Sob consulta / Equipes e órgãos).
4. **Subnav** (`EventoSubnav` → `.evt-nav`) — âncoras: Visão geral, Público, Programação, **O que você aprenderá** (extra, `#questoes`), Palestrantes, EventOn (`#eventon`), Investimento, Regras, FAQ. Ações: Inscrever / Baixar folder / `AgendaDropdown`.
5. **Visão geral** (`.evt-section #visao-geral`) — eyebrow, `h2` com `<em>`, `.lede-block`, 2 parágrafos, `.module-binding-note`, **+ "Seis razões" `.why-grid`/`.why-card`** (6 cards) — tudo dentro desta seção.
6. **Público** (`.evt-section #publico`) — chips `.audience-chips` (6) + `h2 Objetivo` + parágrafo + `h2 Destaques formativos` + `.highlights-list` (5 itens `.highlight-item`).
7. **Programação** (`.evt-section #programacao`) — `.schedule-timeline` com `.schedule-timeline-head` + 4 `.schedule-node` (sn-time/ttag, sn-marker/sn-num I–IV, sn-content h4/speaker-line/ul).
8. **Questões formativas (EXTRA, `#questoes`)** — `.evt-section`, estilo `.highlights-list` (reaproveitado); 29 questões agrupadas por sessão + bloco "Na prática". Textos do PDF. (Não existe no protótipo — seção a mais permitida pela regra do usuário; estilizar com classes já existentes do protótipo, sem inventar design novo.)
9. **Palestrantes** (`.evt-section #palestrantes`) — `.speakers-detailed`, 3 `.speaker-detail-card` (portrait `<img>` vazio + `.speaker-role-tag`; info h3/credentials/bio). `.placeholder-note` ao fim.
10. **EventOn** (`.evt-section #eventon`) — `.eventon-section` (head com `.eventon-mark` Event<em>ON</em> + `.eventon-stats` 5.000/30 FPS/100%) + `.eventon-features` (6 `.eventon-feat` com `.feat-icon` SVG inline + body h4/p).
11. **Investimento** (`.evt-section #investimento`) — `.investment-block` (`.invest-price` "Sob consulta" + `.invest-includes` 6 itens) + `.invest-modes` (3 `.invest-mode`, 3º `.featured`).
12. **Regras** (`.evt-section #regras`) — `.rules-list` (8 regras).
13. **FAQ** (`.evt-section #faq`) — `FaqEvento` (.faq-list/.faq-item), 7 perguntas do protótipo.
14. **CTA final** (`.evt-section` centralizado) — eyebrow gold + h2 com `<em>` + parágrafo + 2 CTAs.
15. **Sidebar** (`.evt-sidebar/.sb-card`) — cover `.sb-cover` (`.sb-status` + `.sb-cover-eventon`), `.sb-body` (`.sb-title-tag` + `.sb-rows`), `.sb-includes` (6), `CountdownSidebar` (deadline 20/Mai), `.sb-actions` (2 CTAs), `.sb-share`.
16. **Related events** (`.related-events-section`) — 3 `.event-secondary-card` (datas range/single) + footer CTAs.

## 5. `conteudoEventos.ts` — reescrita de `EventoOnline`

A `EventoOnline` atual (revertida) volta a ser só `{ formato: "online" }`. Esta porta **reescreve** o tipo para a estrutura do protótipo. A estrutura `evt-*` difere da `event-*` (presencial), então `EventoOnline` **estende `EventoBase`** (para o adapter CMS continuar válido — `lib/cms/eventos.ts:336` retorna `{...base, formato:"online"}`) e **adiciona seções `evt-*` próprias como campos opcionais**. O layout online lê apenas as seções `evt-*`; ignora os campos `event-*` herdados de `EventoBase`.

Tipos novos (campos literais do protótipo):
- `HeroOnline { tags: {texto,classe}[], h1Html, sub, programBinding, ctas[] }` (h1 com `<em>` via html).
- `MetaOnline { label, value, valueSub }` (5).
- `WhyCard { num, titulo, descricao }` (6).
- `VisaoGeralOnline { eyebrow, h2Html, lede, paragrafosHtml[], moduleBindingHtml, razoesTitulo: h2Html, razoes: WhyCard[] }`.
- `HighlightItem { num, html }` (5, com `<strong>`).
- `PublicoOnline { eyebrow, h2, intro, chips[], objetivoTitulo, objetivoTexto, destaquesTitulo, destaques: HighlightItem[] }`.
- `ScheduleNode { time, ttag, num, titulo, speakerLineHtml, bullets[] }`.
- `ProgramacaoOnline { eyebrow, h2, intro, headDayHtml, headMeta, nodes: ScheduleNode[] }`.
- `QuestoesOnline { eyebrow, h2, intro, grupos: GrupoQuestoes[], naPratica:{titulo,itens[]} }` (do PDF).
- `GrupoQuestoes { sessao, titulo, palestrante, questoes:{numero,pergunta}[] }`.
- `PalestranteOnline { foto, roleTag, nome, credentials, bio }` (3).
- `EventonFeat { iconeSvgInner, titulo, descricao }` (6).
- `EventonOnline { eyebrow, h2Html, intro, markNameHtml, markTag, stats:{n,l}[], feats: EventonFeat[] }`.
- `InvestMode { tag, titulo, descricao, featured? }` (3).
- `InvestimentoOnline { eyebrow, h2, intro, priceLabel, priceValueHtml, priceSub, includesTitulo, includes[], modes: InvestMode[] }`.
- `RegrasOnline { eyebrow, h2, rules[] }` (8).
- `CtaFinalOnline { eyebrowGold, h2Html, paragrafo, ctas[] }`.
- `SidebarOnline { coverImg, status, coverEventonHtml, tituloTag, rows:{label,value,price?}[], includes:{titulo,items[]}, countdown, acoes[], share }`.
- `RelatedOnline` (reaproveita estrutura do presencial / `.event-secondary-card`).

`EventoOnline extends EventoBase { formato:"online"; heroOnline?, metasOnline?, visaoGeralOnline?, publicoOnline?, programacaoOnline?, questoesOnline?, palestrantesOnline?, eventonOnline?, investimentoOnline?, regrasOnline?, ctaFinalOnline?, sidebarOnline?, relatedOnline? }`. Todos opcionais (adapter CMS não os preenche).

> O `eventoEdutecM01` preenche os campos base mínimos de `EventoBase` (slug, titulo, subtitulo, formato, dataEvento, area, e os demais com defaults vazios) **e** todas as seções `evt-*`. O layout online só consome as `evt-*`.

## 6. Client components — zero novos

- `EventoSubnav` → `.evt-nav` + scroll-spy. Já existe e bate. `navLinks` com as 9 âncoras (incl. `#questoes`, `#eventon`).
- `AgendaDropdown` → Google/Outlook/Apple/ICS. Já existe. `agendaIcs` start `20260527T080000` / end `20260527T180000`.
- `FaqEvento` → `.faq-item`. Já existe.
- `CountdownSidebar` → renderiza `.sidebar-countdown`/`.sidebar-cd-*`; o protótipo usa `.sb-countdown`/`.sb-cd-*`. **Resolução:** no CSS, adicionar regras `.sidebar-countdown`/`.sidebar-cd-*` equivalentes às `.sb-countdown`/`.sb-cd-*` do protótipo (alias), para o componente existente renderizar igual dentro do `.sb-card`. Não alterar o componente.

## 7. CSS

Estender `apps/web/app/evento-prototipo.css` com os **57 seletores faltantes** do bloco de evento do protótipo (linhas 1469–2308), **pulando os 25 já presentes** (`.breadcrumb`, `.evt-nav*`, `.evt-agenda-dropdown*`, `.audience-chips`, `.speakers-detailed`/`.speaker-detail-*`, `.rules-list`, `.faq-*`, `.related-events-section`, `.related-events-grid`, `.event-page` base, `.placeholder-note`).

Faltantes (57): `.evt-hero*` (hero, tags, sub, program-binding, ctas, standalone-tag), `.evt-meta-bar*`/`.evt-meta-item*`, `.evt-layout*`/`.evt-main`, `.evt-section*`, `.module-binding-note`, `.why-grid`/`.why-card*`, `.highlights-list`/`.highlight-item*`, `.speaker-role-tag`, `.schedule-timeline*`/`.schedule-node*`/`.sn-*`, `.eventon-section`/`.eventon-head`/`.eventon-mark*`/`.eventon-stats`/`.eventon-stat*`/`.eventon-features`/`.eventon-feat*`/`.feat-icon`, `.investment-block`/`.invest-price*`/`.invest-includes*`/`.invest-modes`/`.invest-mode*`, `.evt-sidebar`/`.sb-card`/`.sb-cover*`/`.sb-status`/`.sb-cover-eventon*`/`.sb-body`/`.sb-title-tag`/`.sb-rows`/`.sb-row*`/`.sb-includes*`/`.sb-actions*`/`.sb-share*`/`.sb-countdown`/`.sb-cd-*`.

Adicionar também:
- `:root { --acento-edutec: #1F5060; }` (se ausente).
- `.event-page[data-evento="EDUTEC-M01"] { --event-accent:#1F5060; --event-accent-soft:rgba(31,80,96,0.55); --event-accent-dark:#12343E; }`.
- Aliases de countdown: `.sidebar-countdown`/`.sidebar-cd-label`/`.sidebar-cd-date`/`.sidebar-cd-counter`/`.sidebar-cd-text` copiando as regras de `.sb-countdown`/`.sb-cd-*` (para o `CountdownSidebar` existente).

**Gotcha:** trocar `url('./img/...')` por `url('/img/...')` se aparecer no bloco (memory `feedback_css_url_absoluto`). As 25 classes shared são **idênticas** entre os protótipos (mesma família) — NÃO re-adicionar, evita conflito de cascade.

## 8. Validação

1. `pnpm typecheck` passa.
2. `pnpm lint` sem novos warnings (`<img>` com `eslint-disable-next-line @next/next/no-img-element`).
3. `pnpm build` passa; `/agenda/edutec-m01-2026` gerado como SSG.
4. `pnpm next dev --port 3000`; `curl /agenda/edutec-m01-2026` → 200; `/agenda/prosus-brasilia` → 200 (sem regressão).
5. **Checkpoint visual humano** comparando com `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` lado a lado.
6. Smoke: subnav scroll-spy (9 âncoras), FAQ abre/fecha, AgendaDropdown gera ICS/Google/Outlook, countdown 20/Mai, timeline I–IV, EventOn com 6 SVGs, acento petróleo `#1F5060` no hero/timeline/meta-bar.

## 9. Riscos e mitigações

- **Colisão de CSS** (25 classes shared): mitigado pulando-as; idênticas, mas duplicar quebraria cascade. Plano lista exatamente o que copiar.
- **CountdownSidebar classes** (`sidebar-*` vs `sb-*`): resolver via aliases CSS (§6/§7), sem mexer no componente.
- **SVGs do EventOn** (6 ícones inline): guardar `iconeSvgInner` (innerHTML do `<svg>`) e renderizar com `dangerouslySetInnerHTML` no `<svg>` (gotcha SVG da skill).
- **`EventoOnline` estende `EventoBase` + seções `evt-*` opcionais:** o adapter CMS preenche só base; layout online lê só `evt-*`. Confirmar no plano que `page.tsx` narrowing para `EventoOnline` funciona e o build não quebra.
- **29 questões sem lugar no protótipo:** seção extra com classes existentes; validação humana confirma que não destoa.
- **Branch paralela `feat/cms-soberana`:** trabalho de outra sessão; não tocar. Stage explícito por path.

## 10. Fora de escopo

- Cadastro no CMS Payload; online via `adaptarEvento` (continua TODO).
- Dados bancários (proibidos no protótipo).
- Fotos dos palestrantes (sobem depois).
- Outros módulos EDUTEC / eventos AGIP.

## 11. Próximos passos

1. Plano detalhado (`superpowers:writing-plans`).
2. Execução por subagentes (tipos → CSS → evento → layout → wiring → validação).
3. Checkpoint visual humano contra o protótipo.
4. Atualizar memória se surgir aprendizado.
