# Página Evento Online (EDUTEC Módulo 01) — Design (porta do folder)

**Data:** 2026-06-08
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Esta porta é **atípica** em relação às anteriores: não é a porta de um HTML novo "limpo", e sim a criação da variante **`online`** de um layout de evento (`EventoPresencialLayout`) **já portado** do protótipo híbrido `05_Pagina_Evento_AGIP_SP_Hibrido_v1.html`. A infraestrutura de evento (`conteudoEventos.ts`, `evento-prototipo.css`, `EventoSubnav`, `CountdownSidebar`, `FaqEvento`, `AgendaDropdown`) **já existe e é reaproveitada**.

Hoje, a rota `/agenda/[slug]` cai em `notFound()` para `evento.formato === "online"`:

```
apps/web/app/(capacitacao)/agenda/[slug]/page.tsx:66-68
  case "online":
    // TODO: implementar EventoOnlineLayout em sessões futuras
    notFound();
```

Esta porta implementa o `EventoOnlineLayout` e cadastra o primeiro evento online: **Módulo 01 EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação** (seminário on-line 100% ao vivo, 15/06/2026, 8h, plataforma EventON NTC).

**Fonte canônica visual e de conteúdo:** o folder PDF na raiz do repo
`Folder · Módulo 01 EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação · Instituto NTC do Brasil · 2026 - Nova Data.pdf` (13 páginas). **Não existe HTML de evento online** — o PDF é a fonte (CLAUDE.md §18: protótipo aprovado é fonte de verdade; aqui o folder aprovado faz esse papel).

O protótipo HTML híbrido (`05_...AGIP_SP_Hibrido`) é referência **estrutural/visual** para as seções que já existem no layout; as 2 seções novas (Plataforma EventON, Questões formativas) seguem o estilo `.event-section` já estabelecido — não introduzem design system novo.

## 2. Documentos de referência

- Folder PDF EDUTEC Módulo 01 (raiz do repo) — **fonte canônica** de conteúdo e seções.
- `05_Pagina_Evento_AGIP_SP_Hibrido_v1.html` — referência estrutural/visual das seções de evento já portadas.
- `apps/web/app/(capacitacao)/agenda/[slug]/EventoPresencialLayout.tsx` — espelho a seguir (mesma estrutura, menos `local`).
- `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` — tipos + evento estático `prosus-brasilia` como modelo de preenchimento.
- `apps/web/app/evento-prototipo.css` (89KB) — CSS de evento a estender.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma `/agenda/[slug]`.
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória (ler folder inteiro, sem rephrasing).
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_build_pega_a_rota_interna.md` — `<Link>` para rotas internas; `pnpm build` antes de PR.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (capacitacao)/agenda/[slug]/
│   ├── page.tsx                       ← EDITAR: case "online" → <EventoOnlineLayout>
│   ├── EventoOnlineLayout.tsx         ← NOVO: layout online (espelho do Presencial − local + 2 seções)
│   ├── conteudoEventos.ts             ← EDITAR: 2 tipos novos + EventoOnline + evento edutec-m01-2026
│   ├── EventoSubnav.tsx               ← reaproveitado (+ âncoras #questoes, #plataforma)
│   ├── CountdownSidebar.tsx           ← reaproveitado
│   ├── FaqEvento.tsx                  ← reaproveitado
│   └── AgendaDropdown.tsx             ← reaproveitado
└── evento-prototipo.css               ← EDITAR: + .eventon-platform-* e .event-questoes-*
```

CSS já importado pelo root `apps/web/app/layout.tsx:96`. Header/Footer/InteracoesScroll já vêm de `(capacitacao)/layout.tsx`.

**Decisões fixadas:**

- Rota: `/agenda/edutec-m01-2026`.
- Slug: `edutec-m01-2026`.
- Cadastro no **estático** `conteudoEventos.ts` (não CMS).
- `revalidate = 3600` (já no `page.tsx`; `generateStaticParams` já inclui chaves de `EVENTOS_AGENDA`).
- Fotos dos palestrantes: `foto: ""` + comentário `// TODO: foto sobe depois` (usuário sobe depois).
- **Dados comerciais:** publicar preço **R$ 1.470,00** + as **3 modalidades de contratação** (Individual / Grupos Institucionais / Grandes Grupos). **NÃO** publicar dados bancários (Banco do Brasil, Bradesco, PIX/CNPJ) — esses ficam para proposta/contato.
- CTAs: hrefs internos para `/contato?...` (rota já existe). Folder não tem link de inscrição externo.

## 4. Estrutura do `EventoOnlineLayout.tsx` (server)

Espelho do `EventoPresencialLayout`, na ordem do folder. Sem a seção **Local** (online não tem endereço). Com 2 seções novas. Renderiza:

1. **Breadcrumb** — `evento.crumb` (Início / Agenda / EDUTEC Módulo 01).
2. **Hero** — tags (`Inscrições abertas` / `Online ao vivo` / `NTC Educação`), h1, sub, `programBinding` (Programa Estratégico EDUTEC → `/programas/edutec`), ctas (Inscrever / Solicitar proposta).
3. **Meta-bar** — 5 metas: Quando (15 Jun 2026), Modalidade (Online ao vivo · EventON), Carga horária (8h), Inscrição individual (R$ 1.470), Equipes/órgãos (proposta).
4. **Subnav sticky** (`EventoSubnav`) — âncoras incl. `#questoes` e `#plataforma`.
5. **Visão geral** (`#visao-geral`) — "Sobre este módulo" + propósito do evento.
6. **Público** (`#publico`) — intro + chips (Secretários, Equipes técnicas, Coordenadores, Professores, Profissionais de educação digital, Gestores de inovação).
7. **Objetivos** — "Por que este módulo existe".
8. **Conteúdo programático** — Destaques formativos + Diferenciais NTC (folder pág. 05).
9. **Programação** (`#programacao`) — 4 sessões (08h00–18h00) com palestrante e bullets cada.
10. **Questões formativas** (`#questoes`) — **NOVA** — 29 questões agrupadas nas 4 sessões + bloco "Na prática · o que você levará".
11. **Palestrantes** (`#palestrantes`) — Roberta Aquino, Karla Priscilla, Mariana Ochs (bios literais do folder pág. 06).
12. **Diferenciais** — "Por que você não pode perder" (6 razões, folder pág. 04).
13. **Plataforma EventON** (`#plataforma`) — **NOVA** — stats (5.000 / 30 FPS / 100%) + 6 cards de benefícios.
14. **Replay e Certificação** — cards (replay 7 dias; certificação NTC 75% presença).
15. **Investimento** (`#investimento`) — R$ 1.470 + "a inscrição inclui" + 3 modalidades de contratação. **Sem dados bancários.**
16. **FAQ** (`#faq`) — perguntas derivadas de "Agenda · Ambiente · Participação" e "Cancelamento/Substituição" (`FaqEvento`).
17. **CTA final** — eyebrow dourado + h2 + parágrafo + ctas.
18. **Sidebar** (`CountdownSidebar`) — capa, status, rows (Quando/Modalidade/Carga/Preço), inclui, countdown (deadline 15/06/2026), ações, share.
19. **Related events** — cards de eventos relacionados (placeholder/EDUTEC + footerCtas).

Fora do `<main>`: Header/Footer/InteracoesScroll já no `(capacitacao)/layout.tsx`.

## 5. Estrutura do `conteudoEventos.ts` (edições)

**Tipos novos:**

```ts
export interface SecaoPlataforma {
  eyebrow: string;
  h2: string;
  lede: string;
  stats: Array<{ numero: string; label: string }>;      // 5.000 / 30 FPS / 100%
  cards: Array<{ titulo: string; descricao: string }>;   // 6 benefícios
}

export interface QuestaoSessao {
  numero: string;        // "01".."29"
  pergunta: string;
}

export interface GrupoQuestoes {
  sessao: string;        // "SESSÃO · 01"
  titulo: string;
  palestrante: string;   // "com Roberta Aquino · 08h00 – 10h00"
  questoes: QuestaoSessao[];
}

export interface SecaoQuestoes {
  eyebrow: string;
  h2: string;
  intro: string;
  grupos: GrupoQuestoes[];                       // 4 sessões, 29 questões
  naPratica: { titulo: string; itens: string[] }; // "O que você levará..."
}
```

**`EventoOnline` estendido:**

```ts
export interface EventoOnline extends EventoBase {
  formato: "online";
  plataforma: SecaoPlataforma;
  questoes: SecaoQuestoes;
}
```

**Modalidades de contratação:** acrescidas como bloco dentro de `SecaoInvestimento` (estender o tipo com campo opcional `modalidades?: Array<{ rotulo: string; titulo: string; descricao: string }>` para não quebrar `prosus-brasilia`), OU como sub-bloco renderizado só no online. **Decisão de plano:** campo opcional em `SecaoInvestimento` (menos intrusivo; presencial ignora).

**Evento `edutec-m01-2026`:** entrada completa em `EVENTOS_AGENDA` (porta literal do folder, todos os campos preenchidos; fotos vazias com TODO). Bios dos palestrantes, 4 sessões de programação, 29 questões, 6 razões, 6 cards de plataforma — tudo literal do PDF, sem rephrasing.

## 6. Client components

**Zero novos.** Reaproveitados:

- `EventoSubnav` — sticky scroll-spy; adicionar entradas `#questoes` e `#plataforma` ao array de links (via `evento.navLinks`, que é data-driven — nada de hardcode no componente).
- `CountdownSidebar` — countdown + ações + share. Já genérico.
- `FaqEvento` — accordion. Já genérico.
- `AgendaDropdown` — "adicionar à agenda" (.ics). Já genérico; `agendaIcs` preenchido para online.

As 2 seções novas (Plataforma, Questões) são **estáticas (RSC)** — sem interatividade.

## 7. CSS

Estender `apps/web/app/evento-prototipo.css` (não criar arquivo novo). Adicionar classes para as 2 seções novas, seguindo os tokens já definidos (`--oxford`, `--dourado`, `--pergaminho`, `--space-*`, `--t-*`) e o padrão visual `.event-section` (eyebrow + h2 + grid de cards, `border-radius: 0` em cards conforme CLAUDE.md §3).

Classes novas previstas:

- `.eventon-platform`, `.eventon-platform-stats`, `.eventon-stat`, `.eventon-stat-num`, `.eventon-platform-grid`, `.eventon-platform-card`.
- `.event-questoes`, `.event-questoes-grupo`, `.event-questoes-head`, `.event-questoes-item`, `.event-questoes-num`, `.event-questoes-pratica`.

**Gotcha:** se algum `url('./img/...')` for introduzido, usar `url('/img/...')` (memory `feedback_css_url_absoluto.md`). Provavelmente N/A aqui (seções novas são tipográficas).

## 8. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa (atenção: `EventoOnline` agora exige `plataforma` + `questoes`; o switch em `page.tsx` fica exaustivo).
2. `pnpm lint` sem novos warnings.
3. `pnpm build` passa (memory `feedback_build_pega_a_rota_interna`: build pega `<a>` em rota interna que typecheck não pega — usar `<Link>`/`<a>` conforme padrão do layout existente).
4. `pnpm next dev --port 3000` levantado.
5. `curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000/agenda/edutec-m01-2026` → `200`.
6. **Validação visual feita pelo usuário** comparando a página com o **folder PDF** aberto lado a lado (não há HTML deste evento online). Nenhum screenshot automatizado.
7. Smoke functional checklist:
   - Subnav sticky destaca a seção corrente ao rolar (incl. Questões e Plataforma).
   - Accordion FAQ abre/fecha.
   - "Adicionar à agenda" baixa `.ics` com data 15/06/2026.
   - Countdown da sidebar mostra contagem para 15/06/2026.
   - `.fade-in` aparece (InteracoesScroll ativo no layout do route group).
   - CTAs apontam para `/contato?...` (sem 404).
   - Seção **Local** NÃO renderiza (online).

## 9. Riscos e mitigações

- **Sem protótipo HTML do online** → as 2 seções novas são desenho derivado do folder + estilo `.event-section`. Mitigação: validação visual humana contra o PDF; manter classes no padrão existente; nada de design system novo.
- **`EventoOnline` ganhar campos obrigatórios** pode, em tese, afetar o `switch` em `page.tsx` e o adapter CMS (`lib/cms/eventos.ts`). Mitigação: campos só no estático; o adapter CMS não precisa preencher `plataforma`/`questoes` agora (online via CMS continua fora de escopo). Verificar no plano se `adaptarEvento` referencia `EventoOnline` — se sim, garantir defaults vazios.
- **Modalidades em `SecaoInvestimento`**: campo opcional para não quebrar `prosus-brasilia`. Mitigação: opcional + render condicional.
- **29 questões = muito texto literal** → risco de erro de transcrição. Mitigação: copiar do `pdftotext` verificando numeração 01→29 contínua.

## 10. Fora de escopo

- Cadastro do evento no **CMS Payload** (fica no estático; CMS só quando pedido).
- **Dados bancários** na página pública (decisão: não publicar).
- **Fotos dos palestrantes** (usuário sobe depois; `foto: ""` + TODO).
- Suporte a evento online **via CMS** / `adaptarEvento` para online (continua TODO).
- Outros módulos EDUTEC ou eventos AGIP.
- Página de inscrição / fluxo de pagamento.

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (tipos → evento estático → CSS → layout JSX → wiring no page.tsx → validação).
3. Typecheck + lint + build + dev server.
4. Checkpoint visual humano contra o folder PDF.
5. Commit final + atualização de memória se surgirem aprendizados novos.
