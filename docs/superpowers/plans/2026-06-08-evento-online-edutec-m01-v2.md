# Evento Online EDUTEC M01 (v2 · porta do protótipo dedicado) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar fielmente o protótipo `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` (classes `evt-*`) para o `EventoOnlineLayout` em `/agenda/edutec-m01-2026`, com design/ordem do protótipo e textos do folder PDF.

**Architecture:** CSS literal extraído do protótipo (só os 57 seletores faltantes) + `EventoOnline` reescrito com seções `evt-*` opcionais + `EventoOnlineLayout` espelhando o `<main>` + wiring no `page.tsx`. Reaproveita os 4 client components existentes (`EventoSubnav`, `AgendaDropdown`, `FaqEvento`, `CountdownSidebar`).

**Tech Stack:** Next.js 15 App Router (RSC), TypeScript strict, CSS literal (evento-prototipo.css), design system Soberana.

---

## Contexto crítico (ler antes de começar)

- **Branch:** `feat/evento-online-edutec-m01` (já em uso). NÃO trocar de branch. Existe `feat/cms-soberana` (outra sessão) no mesmo repo — **nunca** `git add .`/`-A`; sempre stage explícito por path.
- **Fonte visual/estrutural:** `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html`. `<main>` = linhas 2496–3225. CSS de evento = 1469–2308.
- **Fonte de textos:** folder PDF (`Folder · Módulo 01 EDUTEC ... 2026 - Nova Data.pdf` na raiz). Extrair: `pdftotext -layout "<arquivo>" -`.
- **Dados do evento = protótipo:** 27/Mai/2026 (quarta), "Sob consulta", deadline 20/Mai. NÃO usar 15/Jun nem R$ 1.470 (do folder — superados pelo protótipo).
- **Fidelidade** (memory `feedback_porta_html_fidelidade`): preservar `<em>`/`<strong>` literais via `dangerouslySetInnerHTML`. Sem rephrasing.
- **Fotos palestrantes:** `foto: ""` + `// TODO: foto sobe depois`.
- **Sem dados bancários** (proibido no protótipo).
- **Validação visual = humana** contra o protótipo (memory `feedback_validacao_visual`).

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `apps/web/app/evento-prototipo.css` | CSS de evento. Adiciona 57 seletores `evt-*` faltantes + acento EDUTEC-M01 + aliases de countdown. | Modify |
| `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` | Tipos `evt-*` de evento online + evento estático `edutec-m01-2026`. | Modify |
| `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx` | Layout espelhando o `<main>` do protótipo. | Create |
| `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` | `case "online"` → `<EventoOnlineLayout>`. | Modify |

**Ordem:** CSS → tipos → evento estático → layout → wiring → validação. Cada task commita.

---

### Task 1: CSS — extrair os 57 seletores faltantes do protótipo

**Files:**
- Modify: `apps/web/app/evento-prototipo.css`

O bloco de evento do protótipo (linhas 1469–2308) tem 82 seletores-base; 25 já existem no `evento-prototipo.css` (idênticos, da família AGIP/PROSUS). Só os 57 faltantes (+ acento EDUTEC) devem ser anexados, para não duplicar regras e quebrar o cascade.

- [ ] **Step 1: Extrair as keep-ranges do protótipo para um arquivo temporário**

Rode este script Python (determinístico; copia só as faixas que contêm os seletores faltantes + o bloco de acento EDUTEC):

```bash
cd /Users/joao/Documents/portal-ntc
python3 - <<'PY'
src = "feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html"
lines = open(src, encoding="utf-8").read().split("\n")
# Faixas 1-indexed inclusive a MANTER (gaps entre as classes já presentes), dentro de 1469..2308.
# Cada faixa começa no comentário/regra da seção faltante e termina antes da próxima classe já-presente.
keep = [
    (1492,1578),  # HERO DO EVENTO
    (1580,1610),  # FAIXA DE METADADOS PRIMÁRIOS
    (1710,1779),  # LAYOUT 2 COLUNAS + .evt-section + .module-binding-note + .why-grid
    (1790,1810),  # Destaques do evento (.highlights-list)
    (1834,1840),  # .speaker-role-tag (resto de .speaker-detail-* já existe)
    (1856,2069),  # Programação timeline + EventOn + Investimento
    (2109,2193),  # SIDEBAR (.evt-sidebar/.sb-*)
    (2237,2307),  # acento EDUTEC-M01 + .sb-countdown/.sb-cd-* + .evt-hero-standalone-tag
]
out = []
out.append("/* ===================================================================")
out.append("   EVENTO ONLINE EDUTEC M01 — porta literal de")
out.append("   feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html (linhas 1469-2308)")
out.append("   Apenas os seletores que ainda nao existem neste arquivo. As classes")
out.append("   compartilhadas (.evt-nav, .faq-*, .audience-chips, .speakers-detailed,")
out.append("   .rules-list, .related-events-*, .event-page base, .breadcrumb) ja existem.")
out.append("   =================================================================== */")
out.append("")
for a,b in keep:
    out.extend(lines[a-1:b])
    out.append("")
open("/tmp/edutec_css_block.css","w",encoding="utf-8").write("\n".join(out))
# Conferencia: conta seletores-base capturados
base = [l.strip().split("{")[0].strip() for l in out if l.strip().startswith(".") and "{" in l]
print("linhas extraidas:", len(out))
print("seletores (todas as regras):", len(base))
PY
echo "--- preview do início e fim ---"
head -20 /tmp/edutec_css_block.css
echo "..."
tail -8 /tmp/edutec_css_block.css
```

Expected: imprime ~150 seletores (regras incluindo descendentes) e o arquivo `/tmp/edutec_css_block.css` existe. Confirme no preview que começa com `.evt-hero {` e termina com `.evt-hero-standalone-tag strong {...}`.

- [ ] **Step 2: Anexar o bloco ao final do `evento-prototipo.css`, com o gotcha de URL e aliases de countdown**

```bash
cd /Users/joao/Documents/portal-ntc
# 2a) Aplica o gotcha url('./img/...') -> url('/img/...') no bloco extraído (memory feedback_css_url_absoluto)
sed -i '' "s#url('\./img/#url('/img/#g" /tmp/edutec_css_block.css
# 2b) Anexa o bloco ao CSS de evento
printf '\n' >> apps/web/app/evento-prototipo.css
cat /tmp/edutec_css_block.css >> apps/web/app/evento-prototipo.css
```

- [ ] **Step 3: Adicionar o token de acento e os aliases de countdown para o CountdownSidebar existente**

O `CountdownSidebar.tsx` renderiza `.sidebar-countdown`/`.sidebar-cd-*`, mas o protótipo estiliza `.sb-countdown`/`.sb-cd-*`. Adicione aliases (mesmas regras) para o componente existente renderizar igual, e garanta o token `--acento-edutec`. Use o Edit tool para anexar ao FINAL de `apps/web/app/evento-prototipo.css`:

```css

/* --- Token de acento EDUTEC (se ainda não definido no :root) --- */
:root { --acento-edutec: #1F5060; }

/* --- Aliases de countdown: CountdownSidebar usa .sidebar-* ; protótipo define .sb-* .
       Espelha as regras .sb-countdown/.sb-cd-* para as classes .sidebar-* do componente. --- */
.sidebar-countdown {
  background: var(--pergaminho); border-top: 1px solid var(--prata-30);
  padding: var(--space-3); text-align: center;
}
.sidebar-cd-label {
  font-family: var(--font-cond); font-weight: 600; font-size: 10.5px;
  letter-spacing: 1.6px; text-transform: uppercase; color: var(--prata);
  margin-bottom: 6px;
}
.sidebar-cd-date {
  font-family: var(--font-serif); font-style: italic; font-weight: 500;
  font-size: 16px; color: var(--tinta); margin-bottom: 10px;
}
.sidebar-cd-counter {
  display: flex; justify-content: center; gap: 10px;
  font-family: var(--font-cond); font-size: 11px; letter-spacing: 1.3px;
  text-transform: uppercase; color: var(--grafite);
}
.sidebar-cd-counter .item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.sidebar-cd-counter .num {
  font-family: var(--font-serif); font-weight: 700; font-size: 22px;
  color: var(--event-accent, var(--oxford)); line-height: 1; letter-spacing: -0.5px;
}
.sidebar-cd-counter .lbl {
  font-family: var(--font-cond); font-size: 9.5px; letter-spacing: 1.4px;
  text-transform: uppercase; color: var(--prata);
}
.sidebar-cd-text {
  font-family: var(--font-sans); font-size: 13px; color: var(--grafite); line-height: 1.45;
}
.sidebar-cd-text strong { color: var(--event-accent, var(--oxford)); font-weight: 600; }
```

- [ ] **Step 4: Verificar que não há duplicação de seletores-base já presentes**

```bash
cd /Users/joao/Documents/portal-ntc
for p in evt-nav breadcrumb audience-chips speakers-detailed rules-list faq-item related-events-section; do
  n=$(grep -cF ".$p {" apps/web/app/evento-prototipo.css)
  echo "$p : $n (esperado 1)"
done
echo "--- novos presentes (esperado >=1) ---"
for p in evt-hero evt-meta-bar evt-layout evt-section why-grid highlights-list schedule-node eventon-section investment-block sb-card sb-countdown; do
  n=$(grep -cF ".$p {" apps/web/app/evento-prototipo.css)
  echo "$p : $n"
done
echo "--- acento EDUTEC presente? ---"
grep -c 'data-evento="EDUTEC-M01"' apps/web/app/evento-prototipo.css
```

Expected: cada classe já-presente = `1` (sem duplicar); cada classe nova ≥ `1`; acento EDUTEC = `1`.

- [ ] **Step 5: Typecheck (CSS não afeta TS, mas confirma que nada quebrou)**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/evento-prototipo.css
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona CSS do evento online EDUTEC M01 (porta do prototipo)

Extrai os 57 seletores evt-* faltantes do prototipo dedicado (hero, meta-bar,
layout, why-grid, highlights, timeline, eventon, investment, sidebar, countdown)
+ acento cromatico EDUTEC-M01 e aliases de countdown. Sem duplicar classes
compartilhadas ja existentes.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Tipos `evt-*` de evento online em `conteudoEventos.ts`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

Reescreve `EventoOnline` para a estrutura do protótipo. Mantém `extends EventoBase` (adapter CMS depende) e adiciona seções `evt-*` como campos **opcionais**.

- [ ] **Step 1: Adicionar os tipos das seções `evt-*` após a interface `SecaoDiferenciais`**

Use o Edit tool. Localize `// ----------------- Evento Base + variantes discriminadas -----------------` e insira ANTES dela:

```ts
// ----------------- Seções do evento ONLINE (porta evt-* do protótipo EDUTEC M01) -----------------

export interface HeroOnlineTag {
  texto: string;
  classe: "evt-hero-status" | "evt-hero-format" | "evt-hero-vert";
}
export interface HeroOnline {
  tags: HeroOnlineTag[];
  h1Html: string;            // pode conter <em>
  sub: string;
  programBinding: { texto: string; href: string; cmsLink?: string; nomePrograma: string };
  ctas: LinkInterno[];
}

export interface MetaOnline { label: string; value: string; valueSub: string }

export interface WhyCard { num: string; titulo: string; descricao: string }

export interface VisaoGeralOnline {
  eyebrow: string;
  h2Html: string;            // pode conter <em>
  lede: string;
  paragrafosHtml: string[];  // podem conter <strong>
  moduleBindingHtml: string; // contém <strong>
  razoesTituloHtml: string;  // "Seis razões para <em>participar</em>..."
  razoes: WhyCard[];         // 6
}

export interface HighlightItem { num: string; html: string }  // html contém <strong>

export interface PublicoOnline {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: string[];
  objetivoTitulo: string;
  objetivoTexto: string;
  destaquesTitulo: string;
  destaques: HighlightItem[];  // 5
}

export interface ScheduleNode {
  time: string;
  ttag: string;              // "Palestra · 01"
  num: string;               // "I".."IV"
  titulo: string;
  speakerLineHtml: string;   // "com <em>Roberta Aquino</em> · ..."
  bullets: string[];
}
export interface ProgramacaoOnline {
  eyebrow: string;
  h2: string;
  intro: string;
  headDayHtml: string;       // "27 de <em>Maio</em> · Quarta-feira"
  headMeta: string;          // "08h00 às 18h00 · 8 horas · EventON NTC" (sep via render)
  nodes: ScheduleNode[];     // 4
}

export interface GrupoQuestoes {
  sessao: string;
  titulo: string;
  palestrante: string;
  questoes: Array<{ numero: string; pergunta: string }>;
}
export interface QuestoesOnline {
  eyebrow: string;
  h2: string;
  intro: string;
  grupos: GrupoQuestoes[];   // 4 sessões, 29 questões
  naPratica: { titulo: string; itens: string[] };
}

export interface PalestranteOnline {
  foto: string;
  roleTag: string;
  nome: string;
  credentials: string;
  bio: string;
}
export interface PalestrantesOnline {
  eyebrow: string;
  h2Html: string;            // "Três especialistas de <em>referência nacional</em>"
  intro: string;
  palestrantes: PalestranteOnline[];  // 3
  nota: string;
}

export interface EventonFeat {
  iconeSvgInner: string;     // innerHTML do <svg> (paths/rects) — render via dangerouslySetInnerHTML
  titulo: string;
  descricao: string;
}
export interface EventonOnline {
  eyebrow: string;
  h2Html: string;            // "Como funciona no <em>EventON NTC</em>"
  intro: string;
  markNameHtml: string;      // "Event<em>ON</em>"
  markTag: string;           // "Plataforma Institucional · NTC"
  stats: Array<{ n: string; l: string }>;  // 5.000 / 30 FPS / 100%
  feats: EventonFeat[];      // 6
}

export interface InvestMode { tag: string; titulo: string; descricao: string; featured?: boolean }
export interface InvestimentoOnline {
  eyebrow: string;
  h2: string;
  intro: string;
  priceLabel: string;        // "Inscrição individual"
  priceValueHtml: string;    // "<span class=\"cur\">R$</span><span class=\"amt\">Sob</span>"
  priceSub: string;          // "Consulta · Equipes / órgãos"
  includesTitulo: string;
  includes: string[];        // 6
  modes: InvestMode[];       // 3
}

export interface RegrasOnline { eyebrow: string; h2: string; rules: string[] }  // 8

export interface CtaFinalOnline {
  eyebrowGold: string;
  h2Html: string;            // contém <em>
  paragrafo: string;
  ctas: LinkInterno[];
}

export interface SidebarOnline {
  coverImg: string;
  status: string;
  coverEventonHtml: string;  // "Acesso via <em>EventON</em>"
  tituloTag: string;         // "Módulo 01 · Trilha EDUTEC"
  rows: Array<{ label: string; value: string; price?: boolean }>;
  includes: { titulo: string; items: string[] };
  countdown: { label: string; dateText: string; deadline: string; tipo: "numerico" | "textual" };
  acoes: LinkInterno[];
  share: { label: string; links: LinkInterno[] };
}

export interface RelatedOnline {
  eyebrowGold: string;
  h2: string;
  introHtml: string;
  cards: RelatedEventCard[];
  footerCtas: LinkInterno[];
}
```

- [ ] **Step 1b: Adicionar a variante `single` ao `RelatedEventDate`**

O protótipo usa cards de data única (`.es-date single`: `<span class="day">24</span><span class="mon-yr">Jun · 2026</span>`). A CSS dessa variante já existe (`evento-prototipo.css` tem `.es-date .day` / `.es-date .mon-yr`), mas o tipo `RelatedEventDate` só tem `range`/`multi`. Localize:

```ts
export type RelatedEventDate =
  | { tipo: "range"; daysStart: string; dash: string; daysEnd: string; monYr: string }
  | { tipo: "multi"; count: string; number: string; period: string };
```

e adicione a 3ª variante:

```ts
export type RelatedEventDate =
  | { tipo: "range"; daysStart: string; dash: string; daysEnd: string; monYr: string }
  | { tipo: "multi"; count: string; number: string; period: string }
  | { tipo: "single"; day: string; monYr: string };
```

> Aditivo — não quebra `prosus-brasilia` (que só usa `range`/`multi`).

- [ ] **Step 2: Reescrever a interface `EventoOnline`**

Localize `export interface EventoOnline extends EventoBase {` (atualmente só `formato: "online";`) e substitua por:

```ts
export interface EventoOnline extends EventoBase {
  formato: "online";
  heroOnline?: HeroOnline;
  metasOnline?: MetaOnline[];
  visaoGeralOnline?: VisaoGeralOnline;
  publicoOnline?: PublicoOnline;
  programacaoOnline?: ProgramacaoOnline;
  questoesOnline?: QuestoesOnline;
  palestrantesOnline?: PalestrantesOnline;
  eventonOnline?: EventonOnline;
  investimentoOnline?: InvestimentoOnline;
  regrasOnline?: RegrasOnline;
  ctaFinalOnline?: CtaFinalOnline;
  sidebarOnline?: SidebarOnline;
  relatedOnline?: RelatedOnline;
}
```

> Os campos são opcionais para o adapter CMS (`lib/cms/eventos.ts:336` retorna `{...base, formato:"online"}` sem eles) continuar compilando. `RelatedEventCard` já existe no arquivo (reaproveitado).

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (tipos novos não usados ainda; adapter CMS continua válido).

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona tipos evt-* de evento online (estrutura do prototipo EDUTEC)

HeroOnline, VisaoGeralOnline (+why-cards), PublicoOnline (+highlights),
ProgramacaoOnline (timeline), QuestoesOnline, EventonOnline (feats SVG),
InvestimentoOnline, RegrasOnline, SidebarOnline e afins. EventoOnline ganha
esses campos opcionais sem quebrar o adapter CMS.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Cadastrar o evento estático `edutec-m01-2026`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

Adiciona a constante `eventoEdutecM01: EventoOnline`. Os campos base de `EventoBase` recebem valores mínimos (a maioria vazia — o layout online lê só os `*Online`). As seções `*Online` recebem o conteúdo: **estrutura do protótipo, textos do PDF** onde o protótipo usa texto resumido o protótipo manda no design mas pode usar o texto mais completo do PDF.

> **Fonte de cada bloco:** o `<main>` do protótipo está em `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html` linhas 2496–3225 — use-o para a ESTRUTURA e os textos curtos (hero, meta, why-cards, highlights, timeline bullets, eventon feats, invest modes, regras, FAQ, sidebar, related). O folder PDF fornece os textos longos onde fizer sentido (bios completas dos palestrantes, e as 29 questões formativas). Onde protótipo e PDF divergem em DADOS factuais (data, preço), vale o PROTÓTIPO.

- [ ] **Step 1: Ler as fontes**

```bash
cd /Users/joao/Documents/portal-ntc
# Estrutura + textos curtos:
sed -n '2496,3225p' "feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html" > /tmp/edutec_main.html
# SVGs dos 6 eventon-feat (innerHTML de cada <svg>) estão entre linhas 2900-2960:
sed -n '2900,2960p' "feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html"
# Textos longos (bios, 29 questões) do PDF:
pdftotext -layout "Folder · Módulo 01 EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação · Instituto NTC do Brasil · 2026 - Nova Data.pdf" - > /tmp/edutec_pdf.txt
```

- [ ] **Step 2: Adicionar a constante antes do `// ----------------- Record exportado -----------------`**

Use o Edit tool. O objeto completo (copie EXATO; textos do protótipo `/tmp/edutec_main.html` e do PDF `/tmp/edutec_pdf.txt`; preserve `<em>`/`<strong>`):

```ts
// ----------------- Evento: EDUTEC Módulo 01 2026 (online) -----------------
// Porta do protótipo feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html (estrutura
// e dados) + textos longos do folder PDF (bios, 29 questões). Fotos: usuário sobe depois.

const eventoEdutecM01: EventoOnline = {
  slug: "edutec-m01-2026",
  titulo: "Cultura Digital, Educação Midiática e Transformação da Educação",
  subtitulo:
    "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
  formato: "online",
  dataEvento: "27 de maio de 2026",
  area: "edu",

  // Campos de EventoBase não usados pelo layout online (vazios):
  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário EDUTEC · Cultura Digital", current: true },
  ],
  hero: { tags: [], h1: "", sub: "", programBinding: { texto: "", href: "", nomePrograma: "" }, ctas: [] },
  metas: [],
  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "O que você aprenderá", href: "#questoes" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "EventOn", href: "#eventon" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "Regras", href: "#regras" },
    { texto: "FAQ", href: "#faq" },
  ],
  visaoGeral: { eyebrow: "", h2: "", lede: "", paragrafos: [] },
  publico: { eyebrow: "", h2: "", intro: "", chips: [] },
  objetivos: { eyebrow: "", h2: "", objetivos: [] },
  conteudoProgramatico: { eyebrow: "", h2: "", intro: "", itens: [] },
  programacao: { eyebrow: "", h2: "", intro: "", dias: [] },
  palestrantes: { eyebrow: "", h2: "", intro: "", palestrantes: [], nota: "" },
  diferenciais: { eyebrow: "", h2: "", diferenciais: [] },
  replayCert: { eyebrow: "", h2: "", cards: [] },
  investimento: { eyebrow: "", h2: "", rules: [] },
  faq: {
    eyebrow: "Perguntas frequentes",
    h2: "FAQ",
    faqs: [
      { id: "edutec-m01-faq-1", pergunta: "Como funciona o acesso ao EventON NTC?", respostaHtml: "Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo." },
      { id: "edutec-m01-faq-2", pergunta: "Por quanto tempo terei acesso ao replay?", respostaHtml: "O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual." },
      { id: "edutec-m01-faq-3", pergunta: "Como recebo o certificado?", respostaHtml: "O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR." },
      { id: "edutec-m01-faq-4", pergunta: "Posso inscrever minha equipe ou rede?", respostaHtml: "Sim. Equipes de 3 a 10 participantes recebem desconto institucional. Acima disso, oferecemos contratação institucional dedicada com nota fiscal direta para o órgão. Solicite proposta para grupo no botão lateral." },
      { id: "edutec-m01-faq-5", pergunta: "A inscrição inclui materiais?", respostaHtml: "Sim. Cadernos digitais editoriais NTC com conteúdo programático, leituras complementares e templates aplicáveis são enviados por e-mail e disponibilizados na plataforma." },
      { id: "edutec-m01-faq-6", pergunta: "Como contratar uma turma fechada para minha instituição?", respostaHtml: "A NTC desenvolve turmas fechadas in company para secretarias, autarquias e órgãos públicos, com conteúdo entregue na sede da instituição ou em formato online dedicado. Solicite proposta institucional pelo botão lateral." },
      { id: "edutec-m01-faq-7", pergunta: "É possível compor a trilha completa EDUTEC?", respostaHtml: "Sim. Este Módulo 01 é a abertura da trilha EDUTEC — Programa Estratégico de Educação Digital. A trilha completa pode ser contratada para sua rede com condições institucionais. Consulte a equipe comercial." },
    ],
  },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "", status: "", tituloCard: "", rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "2026-05-20T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação",
    descricao: "Seminário On-Line ao Vivo do programa EDUTEC · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260527T080000",
    endISO: "20260527T180000",
    filename: "EDUTEC-M01-2026-mai.ics",
  },

  // ---- Seções evt-* (consumidas pelo EventoOnlineLayout) ----
  heroOnline: {
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1Html: "Cultura Digital, Educação Midiática e <em>Transformação</em> da Educação",
    sub: "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma: "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-mai", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-EDUTEC-M01", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M01", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "27 · Maio", valueSub: "2026 · Quarta-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "Sob consulta", valueSub: "Equipes e órgãos" },
  ],

  visaoGeralOnline: {
    eyebrow: "Visão geral",
    h2Html: "Uma agenda institucional para uma <em>educação digital crítica</em>, conectada e contemporânea.",
    lede: "Este seminário aborda a cultura digital e a educação midiática como dimensões estruturantes da formação contemporânea, reconhecendo que a escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos e novas linguagens de participação.",
    paragrafosHtml: [
      "<strong>Formar estudantes para apenas utilizar tecnologia é insuficiente</strong>: é necessário desenvolver leitura crítica, autoria, responsabilidade, discernimento e capacidade de participação qualificada no ecossistema informacional.",
      "A proposta apoia redes públicas e instituições educacionais na consolidação de práticas pedagógicas mais inovadoras, intencionais e conectadas aos desafios do presente. Ao articular fundamentos conceituais, curadoria pedagógica, educação midiática e estratégias de transformação digital, oferece repertório para que gestores, coordenadores e professores compreendam a tecnologia como linguagem, ambiente cultural e instrumento pedagógico a serviço da aprendizagem.",
    ],
    moduleBindingHtml: "Este seminário corresponde ao <strong>Módulo 01 da trilha EDUTEC</strong> — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Pode ser contratado de forma independente ou integrar a trilha completa.",
    razoesTituloHtml: "Seis razões para <em>participar</em> deste seminário",
    razoes: [
      { num: "01", titulo: "Sua rede precisa de uma agenda institucional para a cultura digital", descricao: "Frente à presença massiva de telas, plataformas e algoritmos, a escola pública precisa de uma resposta institucional coerente — este módulo organiza essa agenda." },
      { num: "02", titulo: "Tema conduzido por especialistas de referência nacional", descricao: "Roberta Aquino (Unicamp · ISTE), Mariana Ochs (EducaMídia · USP) e Karla Priscilla (Google Innovator) — três das principais referências brasileiras em cultura digital aplicada à educação." },
      { num: "03", titulo: "Combina fundamentação e oficinas aplicadas", descricao: "Não é teoria abstrata: o módulo entrega oficinas com critérios de curadoria, instrumentos de avaliação de recursos digitais e diretrizes de transformação institucional." },
      { num: "04", titulo: "Trilha EDUTEC com flexibilidade contratual", descricao: "Pode ser contratado como módulo independente ou compor a trilha completa EDUTEC — adequando-se ao planejamento e ao orçamento da rede ou instituição." },
      { num: "05", titulo: "Experiência acontece na plataforma EventON NTC", descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido — sem necessidade de download." },
      { num: "06", titulo: "Certificação institucional do Instituto NTC do Brasil", descricao: "Certificação válida como atualização profissional, mediante 75% de presença — emitida pela referência institucional em capacitação para o setor público brasileiro." },
    ],
  },

  publicoOnline: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para profissionais que atuam na construção da agenda digital das redes públicas:",
    chips: [
      "Secretários e dirigentes de educação",
      "Equipes técnicas e gestores escolares",
      "Coordenadores pedagógicos",
      "Professores e formadores de educadores",
      "Profissionais de educação digital, currículo e mídias",
      "Gestores de inovação pedagógica",
    ],
    objetivoTitulo: "Objetivo",
    objetivoTexto: "Compreender os fundamentos do letramento digital e da educação midiática, fortalecer práticas pedagógicas críticas e apoiar redes na formação de estudantes mais autônomos, críticos e responsáveis no uso de mídias e tecnologias — integrando competências digitais ao currículo e às práticas pedagógicas da rede.",
    destaquesTitulo: "Destaques formativos",
    destaques: [
      { num: "01", html: "<strong>Fundamentos da cultura digital</strong> e seus impactos sobre educação, comunicação e aprendizagem." },
      { num: "02", html: "<strong>Educação midiática</strong> e competências do século 21 para o ensino básico." },
      { num: "03", html: "<strong>Curadoria pedagógica</strong> de recursos digitais com critérios de qualidade e intencionalidade." },
      { num: "04", html: "<strong>Letramento crítico, autoria e cidadania digital</strong> integrados ao currículo." },
      { num: "05", html: "<strong>Transformação digital institucional</strong> da visão estratégica à execução prática." },
    ],
  },

  programacaoOnline: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Quatro sessões aplicadas, oito horas de imersão ao vivo combinando palestra, oficinas e síntese pedagógica final.",
    headDayHtml: "27 de <em>Maio</em> · Quarta-feira",
    headMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
    nodes: [
      { time: "08h00 – 10h00", ttag: "Palestra · 01", num: "I", titulo: "Cultura digital e os novos paradigmas da educação contemporânea", speakerLineHtml: "com <em>Roberta Aquino</em> · Doutora em Ciências (Unicamp) · Educadora ISTE", bullets: ["Fundamentos da cultura digital e seus impactos sobre educação, comunicação e aprendizagem.", "Transformações nas formas de produzir, acessar e compartilhar informações.", "O papel da escola diante da conectividade, da multiplicidade de fontes e da sociedade em rede."] },
      { time: "10h00 – 12h00", ttag: "Oficina · 01", num: "II", titulo: "Aprendizagem no século 21: a importância da educação midiática", speakerLineHtml: "com <em>Mariana Ochs</em> · Coordenadora EducaMídia · Instituto Palavra Aberta", bullets: ["Competências essenciais para uso crítico, ético e intencional de mídias e tecnologias.", "Análise de conteúdos, plataformas e discursos no ambiente digital.", "Caminhos para integrar essas competências ao currículo da rede."] },
      { time: "14h00 – 16h00", ttag: "Oficina · 02", num: "III", titulo: "Curadoria pedagógica de recursos digitais: critérios, qualidade e intencionalidade", speakerLineHtml: "com <em>Karla Priscilla</em> · Mestranda em Tecnologias Emergentes · Google Innovator", bullets: ["Desenvolvimento da competência de busca e seleção crítica de recursos educacionais.", "Avaliação de recursos educacionais e aderência ao contexto pedagógico.", "Uso de recursos digitais para ampliar a participação e a expressão dos estudantes."] },
      { time: "16h00 – 18h00", ttag: "Oficina · 03", num: "IV", titulo: "Transformação digital na educação: da visão à implementação", speakerLineHtml: "com <em>Roberta Aquino</em> · Especialista em transformação digital institucional", bullets: ["Prioridades institucionais para implementação do tema em escolas e sistemas de ensino.", "Articulação entre currículo, formação e cultura institucional.", "Possibilidades de projetos integradores, trilhas e ações formativas."] },
    ],
  },

  questoesOnline: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas quatro sessões",
    intro: "Vinte e nove perguntas-guia organizadas por sessão, do fundamento conceitual à implementação institucional.",
    grupos: [
      { sessao: "Sessão · 01", titulo: "Cultura digital e os novos paradigmas da educação contemporânea", palestrante: "com Roberta Aquino · 08h00 – 10h00", questoes: [
        { numero: "01", pergunta: "O que é cultura digital e como ela transforma a relação entre escola, conhecimento e sociedade?" },
        { numero: "02", pergunta: "Como os algoritmos, plataformas e redes sociais redefinem o que significa aprender hoje?" },
        { numero: "03", pergunta: "Quais são as principais mudanças cognitivas e comportamentais provocadas pela presença massiva de telas no cotidiano?" },
        { numero: "04", pergunta: "De que forma a sociedade em rede altera os papéis tradicionais de professor, estudante e família na produção de conhecimento?" },
        { numero: "05", pergunta: "Como a multiplicidade de fontes informacionais impacta a função pedagógica da escola pública?" },
        { numero: "06", pergunta: "Que respostas institucionais a escola pública precisa desenvolver diante deste cenário?" },
        { numero: "07", pergunta: "Como articular cultura digital com os fundamentos pedagógicos consolidados do currículo brasileiro?" },
        { numero: "08", pergunta: "Quais práticas pedagógicas são compatíveis com a era da conectividade e quais precisam ser reformuladas?" },
      ] },
      { sessao: "Sessão · 02", titulo: "Aprendizagem no século 21: a importância da educação midiática", palestrante: "com Mariana Ochs · 10h00 – 12h00", questoes: [
        { numero: "09", pergunta: "O que é educação midiática e por que ela é estrutural à formação contemporânea?" },
        { numero: "10", pergunta: "Quais competências midiáticas devem ser desenvolvidas em cada etapa da educação básica?" },
        { numero: "11", pergunta: "Como analisar criticamente conteúdos, plataformas e discursos no ambiente digital?" },
        { numero: "12", pergunta: "Que critérios orientam a leitura crítica de notícias, imagens e narrativas em mídia?" },
        { numero: "13", pergunta: "Como integrar educação midiática às áreas curriculares sem sobrecarregar o currículo da rede?" },
        { numero: "14", pergunta: "De que forma a educação midiática combate desinformação, discursos de ódio e polarização?" },
        { numero: "15", pergunta: "Quais práticas de produção midiática podem ser desenvolvidas em sala de aula com baixa infraestrutura?" },
        { numero: "16", pergunta: "Como envolver famílias, escolas e a rede na agenda institucional de educação midiática?" },
      ] },
      { sessao: "Sessão · 03", titulo: "Curadoria pedagógica de recursos digitais", palestrante: "com Karla Priscilla · 14h00 – 16h00", questoes: [
        { numero: "17", pergunta: "O que é curadoria pedagógica e por que ela é central no planejamento docente?" },
        { numero: "18", pergunta: "Quais critérios devem orientar a busca, seleção e avaliação de recursos digitais?" },
        { numero: "19", pergunta: "Como avaliar a qualidade pedagógica e a aderência ao contexto de uma plataforma ou conteúdo?" },
        { numero: "20", pergunta: "Que ferramentas e referenciais apoiam a curadoria docente cotidiana?" },
        { numero: "21", pergunta: "Como diferenciar recursos pedagógicos qualificados de conteúdos rasos ou puramente comerciais?" },
        { numero: "22", pergunta: "De que forma a curadoria pode ampliar a participação e a expressão dos estudantes?" },
        { numero: "23", pergunta: "Como organizar institucionalmente bancos de recursos digitais para a rede?" },
      ] },
      { sessao: "Sessão · 04", titulo: "Transformação digital na educação: da visão à implementação", palestrante: "com Roberta Aquino · 16h00 – 18h00", questoes: [
        { numero: "24", pergunta: "O que diferencia transformação digital de mera digitalização de processos escolares?" },
        { numero: "25", pergunta: "Quais são as prioridades institucionais para implementar a agenda digital na rede?" },
        { numero: "26", pergunta: "Como articular currículo, formação docente e cultura institucional nessa transição?" },
        { numero: "27", pergunta: "Que arquitetura de governança digital é adequada à escola pública brasileira?" },
        { numero: "28", pergunta: "Como construir uma trilha pedagógica integradora ao longo da educação básica?" },
        { numero: "29", pergunta: "Como sustentar a transformação digital diante de mudanças de gestão e ciclo político?" },
      ] },
    ],
    naPratica: {
      titulo: "Na prática · o que você levará do módulo para a sua rede",
      itens: [
        "Repertório conceitual ampliado sobre educação digital e midiática.",
        "Diretrizes para integrar cultura digital ao currículo.",
        "Caminhos para articular currículo, formação e governança.",
        "Critérios institucionais para curadoria pedagógica de recursos.",
        "Instrumentos para avaliar maturidade digital da rede.",
        "Subsídios para projetos integradores e trilhas formativas.",
      ],
    },
  },

  palestrantesOnline: {
    eyebrow: "Quem ensina",
    h2Html: "Três especialistas de <em>referência nacional</em>",
    intro: "Cultura digital, educação midiática e inovação pedagógica conduzidas por nomes consolidados no Brasil e na América Latina.",
    palestrantes: [
      { foto: "", roleTag: "Palestrante", nome: "Roberta Aquino", credentials: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator", bio: "Professora de pós-graduação, palestrante internacional e consultora educacional. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp, Educadora Certificada ISTE, Google Innovator, Trainer e Coach. Mentora GEG para a América Latina. Canva Education Partner, Embaixadora de Genially, Wakelet, Wayground, Padlet e BookCreator." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Karla Priscilla", credentials: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia", bio: "Mestranda em Tecnologias Emergentes na Educação, pedagoga, consultora e palestrante. Google Champions, Innovator e Trainer. Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais e formadora de educadores em todo o Brasil. Embaixadora do Canva for Education, ClassDojo e plataforma Teachy." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Mariana Ochs", credentials: "Coordenadora EducaMídia · Instituto Palavra Aberta · USP", bio: "Designer, jornalista e especialista em cultura digital na educação. Coordenadora do EducaMídia, programa de educação midiática do Instituto Palavra Aberta. Pós-graduação em Letramento Digital pela Universidade de Rhode Island; pós-graduanda na USP, pesquisando letramento algorítmico. Coautora do Guia da Educação Midiática e do e-book Educação Midiática e Inteligência Artificial." }, // TODO: foto sobe depois
    ],
    nota: "Fotografias oficiais dos palestrantes serão sincronizadas a partir do folder do evento via CMS.",
  },

  eventonOnline: {
    eyebrow: "Plataforma de acesso",
    h2Html: "Como funciona no <em>EventON NTC</em>",
    intro: "O seminário acontece na plataforma institucional do Instituto NTC do Brasil — ambiente virtual seguro com transmissão ao vivo, suporte dedicado e replay protegido.",
    markNameHtml: "Event<em>ON</em>",
    markTag: "Plataforma Institucional · NTC",
    stats: [
      { n: "5.000", l: "Participantes simultâneos" },
      { n: "30 FPS", l: "Vídeo em alta definição" },
      { n: "100%", l: "Acesso institucional" },
    ],
    feats: [
      { iconeSvgInner: `<path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z"/>`, titulo: "Plataforma segura e escalável", descricao: "Alcance de até 5.000 participantes simultâneos, com estabilidade operacional e segurança institucional para eventos formais." },
      { iconeSvgInner: `<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 22h8"/>`, titulo: "Alta definição", descricao: "Transmissão em 30 FPS, com vídeo e áudio de alta qualidade independente do dispositivo — desktop, laptop, tablet ou telefone." },
      { iconeSvgInner: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`, titulo: "Fácil e acessível", descricao: "Nenhum download é necessário. Acesso individual por login e senha, com interface simplificada e navegação institucional intuitiva." },
      { iconeSvgInner: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>`, titulo: "Interação ao vivo", descricao: "Faça perguntas, participe de pesquisas em tempo real e até apresente conteúdos em momentos previamente combinados com a coordenação." },
      { iconeSvgInner: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`, titulo: "Replay institucional · 7 dias", descricao: "Acesso ao replay integral do evento por 7 dias após a realização — para revisão, aprofundamento e referência institucional posterior." },
      { iconeSvgInner: `<circle cx="12" cy="9" r="6"/><path d="M9 14.5V21l3-2 3 2v-6.5"/>`, titulo: "Certificação institucional", descricao: "Certificado válido como atualização profissional, mediante 75% de presença — emitido pelo Instituto NTC do Brasil." },
    ],
  },

  investimentoOnline: {
    eyebrow: "Investimento",
    h2: "Investimento e condições",
    intro: "Modalidades de contratação flexíveis para inscrição individual, equipes e instituições públicas.",
    priceLabel: "Inscrição individual",
    priceValueHtml: `<span class="cur">R$</span><span class="amt">Sob</span>`,
    priceSub: "Consulta · Equipes / órgãos",
    includesTitulo: "O que está incluído",
    includes: [
      "8 horas de imersão ao vivo no EventON NTC",
      "Material editorial NTC (cadernos digitais)",
      "Replay protegido por 7 dias após o evento",
      "Certificado institucional validável",
      "Suporte técnico dedicado",
      "Acesso à Área do Participante",
    ],
    modes: [
      { tag: "Individual", titulo: "Inscrição individual", descricao: "Profissional inscreve-se diretamente. Pagamento via PIX, boleto ou cartão de crédito (até 6× sem juros)." },
      { tag: "Equipe", titulo: "Inscrição de equipe", descricao: "Grupos de 3 a 10 participantes da mesma instituição com desconto institucional. Pagamento centralizado." },
      { tag: "Institucional", titulo: "Contratação institucional", descricao: "Para órgãos públicos, redes e secretarias. Emissão de nota fiscal direta, empenho institucional e turma fechada disponível.", featured: true },
    ],
  },

  regrasOnline: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "Inscrições abertas até a data do evento ou enquanto houver vagas disponíveis.",
      "Acesso individual por login e senha enviado em até 24h após confirmação da inscrição.",
      "Cancelamento sem ônus até 7 dias antes do evento. Após esse prazo, valor pode ser convertido em crédito para outra edição.",
      "Para órgãos públicos: emissão de nota fiscal direta no CNPJ, com aceite de empenho e demais modalidades de contratação previstas em lei.",
      "Inscrição válida apenas para o e-mail informado no cadastro. Não é permitido compartilhamento de acesso.",
      "Certificado emitido após o evento mediante presença mínima de 75% das atividades, validado por código QR.",
      "Replay disponível por 7 dias após o evento na Área do Participante.",
      "Material de apoio enviado por e-mail e disponibilizado na plataforma EventON NTC.",
    ],
  },

  ctaFinalOnline: {
    eyebrowGold: "Próximo passo",
    h2Html: "Garanta sua participação no <em>Módulo 01 EDUTEC</em>.",
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      { texto: "Inscrever-se agora", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-mai", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M01", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 01 · Trilha EDUTEC",
    rows: [
      { label: "Quando", value: "27 · Mai · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "Sob consulta", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Material editorial NTC", "Certificado institucional", "Suporte técnico dedicado", "Área do Participante"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 20 de Maio de 2026", deadline: "2026-05-20T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-mai", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe", cmsLink: "inscricao-equipe-EDUTEC-M01", classe: "btn btn--secondary" },
    ],
    share: { label: "Compartilhar:", links: [
      { texto: "WhatsApp", href: "#", cmsLink: "share-whatsapp" },
      { texto: "E-mail", href: "#", cmsLink: "share-email" },
      { texto: "LinkedIn", href: "#", cmsLink: "share-linkedin" },
    ] },
  },

  relatedOnline: {
    eyebrowGold: "Trilha EDUTEC · Próximos módulos",
    h2: "Continue a jornada de educação digital",
    introHtml: "Outros módulos da trilha <strong>EDUTEC</strong> e eventos da <strong>NTC Educação</strong> com inscrições antecipadas.",
    cards: [
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "range", daysStart: "22", dash: "–", daysEnd: "23", monYr: "Mai · 2026" }, program: "Seminário · NTC Educação", titulo: "Alfabetização de Alta Performance: estratégias para recomposição", programBinding: "PEAR", metaHtml: "Online · 16h · 2 dias <strong>R$ 1.490</strong>", cta: { texto: "Inscrever-se", href: "#contato", cmsLink: "inscricao-PEAR-2026-mai", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "24", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 02 EDUTEC: IA, Currículo e Aprendizagem", programBinding: "EDUTEC", metaHtml: "Online · 8h · 1 dia <strong>Sob consulta</strong>", cta: { texto: "Saiba mais", href: "#contato", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "25", monYr: "Jun · 2026" }, program: "Curso Executivo · NTC Educação", titulo: "Coordenação pedagógica orientada a resultados", programBinding: "PROGE", metaHtml: "Online · 20h · 3 dias <strong>R$ 1.690</strong>", cta: { texto: "Inscrever-se", href: "#contato", cmsLink: "inscricao-PROGE-2026-jun", classe: "es-cta" } },
    ],
    footerCtas: [
      { texto: "Ver agenda completa", href: "/capacitacao", cmsLink: "agenda-completa", classe: "btn btn--primary", arrow: true },
      { texto: "Solicitar proposta institucional", href: "/solucoes#contratacao-institucional", cmsLink: "proposta-institucional", classe: "btn btn--secondary" },
    ],
  },
};
```

> **Nota sobre `RelatedEventCard`:** a 1ª card usa `range` (22–23 Mai); a 2ª e 3ª usam `single` (variante adicionada na Task 2, Step 1b). A CSS de `.es-date single` (`.es-date .day`/`.es-date .mon-yr`) já existe.

- [ ] **Step 3: Registrar em `EVENTOS_AGENDA`**

Adicione ao Record exportado, ao lado de `"prosus-brasilia"`:

```ts
  "edutec-m01-2026": eventoEdutecM01,
```

- [ ] **Step 4: Verificar fidelidade das 29 questões e bios contra o PDF**

```bash
cd /Users/joao/Documents/portal-ntc
grep -c "numero:" "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts"  # deve incluir as 29 + outras
```
Confirme manualmente que a numeração das questões é 01→29 contínua e que as bios batem com `/tmp/edutec_pdf.txt` (sem rephrasing).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. Se acusar incompatibilidade em `relatedOnline.cards` (tipo `RelatedEventCard`), ajuste a forma das datas conforme a nota acima — sem alterar texto.

- [ ] **Step 6: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): cadastra evento online EDUTEC M01 (estatico, estrutura do prototipo)

27/Mai/2026, sob consulta, timeline I-IV, 6 razoes, EventOn com 6 feats,
3 modalidades, 8 regras, 7 FAQs do prototipo + 29 questoes formativas do PDF.
Fotos vazias (sobem depois). Sem dados bancarios.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Criar `EventoOnlineLayout.tsx`

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx`

Espelha o `<main>` do protótipo (linhas 2496–3225). Server Component. Lê só os campos `*Online` do `EventoOnline`. Reaproveita `EventoSubnav`, `AgendaDropdown` (via subnav), `FaqEvento`, `CountdownSidebar`.

- [ ] **Step 1: Ler o protótipo e os componentes de referência**

```bash
cd /Users/joao/Documents/portal-ntc
sed -n '2496,3225p' "feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html" > /tmp/edutec_main.html
```
Abra `/tmp/edutec_main.html` e `EventoPresencialLayout.tsx` (padrão de espelho), `EventoSubnav.tsx` (props), `FaqEvento.tsx` (props), `CountdownSidebar.tsx` (props).

- [ ] **Step 2: Escrever o componente**

Crie `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx`. Estrutura (cada seção guardada por `if (!evento.xxxOnline) ... ` ou `&&`):

```tsx
import { Fragment } from "react";

import type { EventoOnline } from "./conteudoEventos";
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";

/**
 * Layout de evento ONLINE — porta de feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html.
 * Espelha o <main class="event-page"> do protótipo (classes evt-*/sb-*). Lê os
 * campos *Online do EventoOnline. Header/Footer/InteracoesScroll vêm de
 * (capacitacao)/layout.tsx.
 */
interface EventoOnlineLayoutProps {
  evento: EventoOnline;
}

export function EventoOnlineLayout({ evento }: EventoOnlineLayoutProps) {
  const hero = evento.heroOnline;
  const folderCta = hero?.ctas[1];
  const inscricaoCmsLink = hero?.ctas[0]?.cmsLink ?? "inscricao";

  return (
    <main id="main" className="event-page" data-evento="EDUTEC-M01">
      {/* BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {evento.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                {c.href ? (
                  <li><a href={c.href} data-cms-link={c.cmsLink}>{c.texto}</a></li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
                {i < evento.crumb.length - 1 && <li className="sep" aria-hidden="true">/</li>}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* HERO */}
      {hero && (
        <section className="evt-hero" aria-label={`${evento.titulo} ${evento.dataEvento}`}>
          <div
            className="evt-hero-bg"
            style={{ backgroundImage: "url('/img/fotos/_optimized/area-educacao.1920.webp')" }}
            aria-hidden="true"
          />
          <div className="container evt-hero-content fade-in">
            <div className="evt-hero-tags">
              {hero.tags.map((t, i) => <span key={i} className={t.classe}>{t.texto}</span>)}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: hero.h1Html }} />
            <p className="evt-hero-sub">{hero.sub}</p>
            <div className="evt-hero-program-binding">
              <span>{hero.programBinding.texto}</span>
              <strong>
                <a href={hero.programBinding.href} data-cms-link={hero.programBinding.cmsLink}>
                  {hero.programBinding.nomePrograma}
                </a>
              </strong>
            </div>
            <div className="evt-hero-ctas">
              {hero.ctas.map((cta, i) => (
                <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                  {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* META-BAR */}
      {evento.metasOnline && evento.metasOnline.length > 0 && (
        <section className="evt-meta-bar" aria-label="Informações principais do evento">
          <div className="container">
            <div className="evt-meta-bar-grid fade-in">
              {evento.metasOnline.map((m, i) => (
                <div key={i} className="evt-meta-item">
                  <span className="label">{m.label}</span>
                  <span className="value">{m.value}</span>
                  <span className="value-sub">{m.valueSub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SUBNAV */}
      <EventoSubnav
        links={evento.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={evento.agendaIcs}
      />

      {/* LAYOUT 2 COLUNAS */}
      <section className="evt-layout">
        <div className="container">
          <div className="evt-layout-grid">
            <div className="evt-main">

              {/* VISÃO GERAL + 6 RAZÕES */}
              {evento.visaoGeralOnline && (
                <article className="evt-section fade-in" id="visao-geral">
                  <p className="eyebrow">{evento.visaoGeralOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.h2Html }} />
                  <p className="lede-block">{evento.visaoGeralOnline.lede}</p>
                  {evento.visaoGeralOnline.paragrafosHtml.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                  <div className="module-binding-note" dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.moduleBindingHtml }} />
                  <h2
                    style={{ marginTop: "var(--space-5)" }}
                    dangerouslySetInnerHTML={{ __html: evento.visaoGeralOnline.razoesTituloHtml }}
                  />
                  <div className="why-grid">
                    {evento.visaoGeralOnline.razoes.map((r, i) => (
                      <div key={i} className="why-card">
                        <span className="why-num">{r.num}</span>
                        <div className="why-body">
                          <h4>{r.titulo}</h4>
                          <p>{r.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* PÚBLICO + OBJETIVO + DESTAQUES */}
              {evento.publicoOnline && (
                <article className="evt-section fade-in" id="publico">
                  <p className="eyebrow">{evento.publicoOnline.eyebrow}</p>
                  <h2>{evento.publicoOnline.h2}</h2>
                  <p>{evento.publicoOnline.intro}</p>
                  <div className="audience-chips">
                    {evento.publicoOnline.chips.map((c, i) => <span key={i}>{c}</span>)}
                  </div>
                  <h2 style={{ marginTop: "var(--space-5)" }}>{evento.publicoOnline.objetivoTitulo}</h2>
                  <p>{evento.publicoOnline.objetivoTexto}</p>
                  <h2 style={{ marginTop: "var(--space-5)" }}>{evento.publicoOnline.destaquesTitulo}</h2>
                  <div className="highlights-list">
                    {evento.publicoOnline.destaques.map((d, i) => (
                      <div key={i} className="highlight-item">
                        <span className="h-num">{d.num}</span>
                        <span className="h-text" dangerouslySetInnerHTML={{ __html: d.html }} />
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* PROGRAMAÇÃO (timeline) */}
              {evento.programacaoOnline && (
                <article className="evt-section fade-in" id="programacao">
                  <p className="eyebrow">{evento.programacaoOnline.eyebrow}</p>
                  <h2>{evento.programacaoOnline.h2}</h2>
                  <p>{evento.programacaoOnline.intro}</p>
                  <div className="schedule-timeline">
                    <div className="schedule-timeline-head">
                      <span className="tt-day" dangerouslySetInnerHTML={{ __html: evento.programacaoOnline.headDayHtml }} />
                      <span className="tt-meta">{evento.programacaoOnline.headMeta}</span>
                    </div>
                    {evento.programacaoOnline.nodes.map((n, i) => (
                      <div key={i} className="schedule-node">
                        <div className="sn-time">
                          {n.time}
                          <span className="ttag">{n.ttag}</span>
                        </div>
                        <div className="sn-marker"><div className="sn-num">{n.num}</div></div>
                        <div className="sn-content">
                          <h4>{n.titulo}</h4>
                          <p className="speaker-line" dangerouslySetInnerHTML={{ __html: n.speakerLineHtml }} />
                          <ul>{n.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* QUESTÕES FORMATIVAS (extra, do PDF) */}
              {evento.questoesOnline && (
                <article className="evt-section fade-in" id="questoes">
                  <p className="eyebrow">{evento.questoesOnline.eyebrow}</p>
                  <h2>{evento.questoesOnline.h2}</h2>
                  <p>{evento.questoesOnline.intro}</p>
                  {evento.questoesOnline.grupos.map((g, i) => (
                    <div key={i} style={{ marginTop: "var(--space-4)" }}>
                      <h4 style={{ fontFamily: "var(--font-serif)", color: "var(--oxford)", margin: "0 0 8px" }}>
                        {g.sessao} · {g.titulo} <span style={{ fontFamily: "var(--font-cond)", fontSize: "12px", color: "var(--grafite)" }}>{g.palestrante}</span>
                      </h4>
                      <div className="highlights-list">
                        {g.questoes.map((q, j) => (
                          <div key={j} className="highlight-item">
                            <span className="h-num">{q.numero}</span>
                            <span className="h-text" style={{ fontWeight: 400 }}>{q.pergunta}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="module-binding-note" style={{ marginTop: "var(--space-4)" }}>
                    <strong>{evento.questoesOnline.naPratica.titulo}:</strong> {evento.questoesOnline.naPratica.itens.join(" · ")}
                  </div>
                </article>
              )}

              {/* PALESTRANTES */}
              {evento.palestrantesOnline && (
                <article className="evt-section fade-in" id="palestrantes">
                  <p className="eyebrow">{evento.palestrantesOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.palestrantesOnline.h2Html }} />
                  <p>{evento.palestrantesOnline.intro}</p>
                  <div className="speakers-detailed">
                    {evento.palestrantesOnline.palestrantes.map((p, i) => (
                      <article key={i} className="speaker-detail-card">
                        <div className="speaker-detail-portrait">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.foto} alt={`${p.nome} · ${p.roleTag}`} loading="lazy" />
                          <span className="speaker-role-tag">{p.roleTag}</span>
                        </div>
                        <div className="speaker-detail-info">
                          <h3>{p.nome}</h3>
                          <p className="credentials">{p.credentials}</p>
                          <p className="bio">{p.bio}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p className="placeholder-note" style={{ textAlign: "left" }}>{evento.palestrantesOnline.nota}</p>
                </article>
              )}

              {/* EVENTON */}
              {evento.eventonOnline && (
                <article className="evt-section fade-in" id="eventon">
                  <p className="eyebrow">{evento.eventonOnline.eyebrow}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: evento.eventonOnline.h2Html }} />
                  <p>{evento.eventonOnline.intro}</p>
                  <div className="eventon-section">
                    <div className="eventon-head">
                      <div className="eventon-mark">
                        <span className="name" dangerouslySetInnerHTML={{ __html: evento.eventonOnline.markNameHtml }} />
                        <span className="tag">{evento.eventonOnline.markTag}</span>
                      </div>
                      <div className="eventon-stats">
                        {evento.eventonOnline.stats.map((s, i) => (
                          <div key={i} className="eventon-stat">
                            <div className="n">{s.n}</div>
                            <div className="l">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="eventon-features">
                      {evento.eventonOnline.feats.map((f, i) => (
                        <div key={i} className="eventon-feat">
                          <div className="feat-icon">
                            <svg
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                              dangerouslySetInnerHTML={{ __html: f.iconeSvgInner }}
                            />
                          </div>
                          <div className="feat-body">
                            <h4>{f.titulo}</h4>
                            <p>{f.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              )}

              {/* INVESTIMENTO */}
              {evento.investimentoOnline && (
                <article className="evt-section fade-in" id="investimento">
                  <p className="eyebrow">{evento.investimentoOnline.eyebrow}</p>
                  <h2>{evento.investimentoOnline.h2}</h2>
                  <p>{evento.investimentoOnline.intro}</p>
                  <div className="investment-block">
                    <div className="invest-price">
                      <span className="label">{evento.investimentoOnline.priceLabel}</span>
                      <span className="value" dangerouslySetInnerHTML={{ __html: evento.investimentoOnline.priceValueHtml }} />
                      <span className="sub">{evento.investimentoOnline.priceSub}</span>
                    </div>
                    <div className="invest-includes">
                      <h4>{evento.investimentoOnline.includesTitulo}</h4>
                      <ul>{evento.investimentoOnline.includes.map((it, i) => <li key={i}>{it}</li>)}</ul>
                    </div>
                  </div>
                  <div className="invest-modes">
                    {evento.investimentoOnline.modes.map((m, i) => (
                      <div key={i} className={`invest-mode${m.featured ? " featured" : ""}`}>
                        <div className="tag">{m.tag}</div>
                        <h4>{m.titulo}</h4>
                        <p>{m.descricao}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* REGRAS */}
              {evento.regrasOnline && (
                <article className="evt-section fade-in" id="regras">
                  <p className="eyebrow">{evento.regrasOnline.eyebrow}</p>
                  <h2>{evento.regrasOnline.h2}</h2>
                  <ul className="rules-list">
                    {evento.regrasOnline.rules.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </article>
              )}

              {/* FAQ */}
              {evento.faq.faqs.length > 0 && (
                <article className="evt-section fade-in" id="faq">
                  <p className="eyebrow">{evento.faq.eyebrow}</p>
                  <h2>{evento.faq.h2}</h2>
                  <div className="faq-list">
                    <FaqEvento itens={evento.faq.faqs} />
                  </div>
                </article>
              )}

              {/* CTA FINAL */}
              {evento.ctaFinalOnline && (
                <article className="evt-section fade-in" style={{ textAlign: "center", paddingTop: "var(--space-6)" }}>
                  <p className="eyebrow gold">{evento.ctaFinalOnline.eyebrowGold}</p>
                  <h2
                    style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}
                    dangerouslySetInnerHTML={{ __html: evento.ctaFinalOnline.h2Html }}
                  />
                  <p style={{ maxWidth: "640px", margin: "0 auto var(--space-4)" }}>{evento.ctaFinalOnline.paragrafo}</p>
                  <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                    {evento.ctaFinalOnline.ctas.map((cta, i) => (
                      <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                        {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                      </a>
                    ))}
                  </div>
                </article>
              )}
            </div>

            {/* SIDEBAR */}
            {evento.sidebarOnline && (
              <aside className="evt-sidebar" aria-label="Card de inscrição">
                <div className="sb-card">
                  <div className="sb-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={evento.sidebarOnline.coverImg} alt={evento.titulo} loading="lazy" />
                    <span className="sb-status">{evento.sidebarOnline.status}</span>
                    <span className="sb-cover-eventon" dangerouslySetInnerHTML={{ __html: evento.sidebarOnline.coverEventonHtml }} />
                  </div>
                  <div className="sb-body">
                    <p className="sb-title-tag">{evento.sidebarOnline.tituloTag}</p>
                    <div className="sb-rows">
                      {evento.sidebarOnline.rows.map((row, i) => (
                        <div key={i} className={`sb-row${row.price ? " price" : ""}`}>
                          <span>{row.label}</span><strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="sb-includes">
                    <h4>{evento.sidebarOnline.includes.titulo}</h4>
                    <ul>{evento.sidebarOnline.includes.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  </div>
                  <CountdownSidebar
                    label={evento.sidebarOnline.countdown.label}
                    dateText={evento.sidebarOnline.countdown.dateText}
                    deadline={evento.sidebarOnline.countdown.deadline}
                    tipo={evento.sidebarOnline.countdown.tipo}
                  />
                  <div className="sb-actions">
                    {evento.sidebarOnline.acoes.map((a, i) => (
                      <a key={i} className={a.classe} href={a.href} data-cms-link={a.cmsLink}>
                        {a.texto}{a.arrow && <span className="btn-arrow"> →</span>}
                      </a>
                    ))}
                  </div>
                  <div className="sb-share">
                    <span style={{ color: "var(--prata)", marginRight: "4px" }}>{evento.sidebarOnline.share.label}</span>
                    {evento.sidebarOnline.share.links.map((l, i) => (
                      <a key={i} href={l.href} data-cms-link={l.cmsLink}>{l.texto}</a>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* RELATED EVENTS */}
      {evento.relatedOnline && evento.relatedOnline.cards.length > 0 && (
        <section className="related-events-section" aria-label="Outros eventos da trilha EDUTEC e da NTC Educação">
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{evento.relatedOnline.eyebrowGold}</p>
              <h2>{evento.relatedOnline.h2}</h2>
              <p className="section-intro" dangerouslySetInnerHTML={{ __html: evento.relatedOnline.introHtml }} />
            </div>
            <div className="related-events-grid fade-in">
              {evento.relatedOnline.cards.map((card, i) => (
                <article key={i} className="event-secondary-card" data-area={card.area}>
                  <div className="es-cover">
                    <div className="es-cover-img" aria-hidden="true" style={{ backgroundImage: `url('${card.coverImg}')` }} />
                    <div className="es-cover-overlay" />
                    {card.date.tipo === "range" ? (
                      <div className="es-date range">
                        <span className="days">{card.date.daysStart}<span className="dash">{card.date.dash}</span>{card.date.daysEnd}</span>
                        <span className="mon-yr">{card.date.monYr}</span>
                      </div>
                    ) : card.date.tipo === "single" ? (
                      <div className="es-date single">
                        <span className="day">{card.date.day}</span>
                        <span className="mon-yr">{card.date.monYr}</span>
                      </div>
                    ) : (
                      <div className="es-date multi">
                        <span className="count"><span className="number">{card.date.number}</span> {card.date.count}</span>
                        <span className="period">{card.date.period}</span>
                      </div>
                    )}
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">{card.program}</p>
                      <h4 className="es-title">{card.titulo}</h4>
                      <p className="es-program-binding" dangerouslySetInnerHTML={{ __html: `Integra o programa <strong>${card.programBinding}</strong>` }} />
                    </div>
                    <div className="es-meta-row">
                      <span className="es-meta" dangerouslySetInnerHTML={{ __html: card.metaHtml }} />
                    </div>
                    <a className={card.cta.classe} href={card.cta.href} data-cms-link={card.cta.cmsLink}>{card.cta.texto}</a>
                  </div>
                </article>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)", marginTop: "var(--space-5)", flexWrap: "wrap" }}>
              {evento.relatedOnline.footerCtas.map((cta, i) => (
                <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                  {cta.texto}{cta.arrow && <span className="btn-arrow"> →</span>}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm typecheck` — Expected PASS.
Run: `pnpm lint` — Expected: sem novos warnings no arquivo (os 2 `<img>` têm `eslint-disable-next-line`). Se lint reclamar de `Fragment` ou imports não usados, ajustar minimamente.

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona EventoOnlineLayout espelhando o prototipo evt-*

Hero imagem-mae, meta-bar, timeline I-IV, EventOn com SVGs, investimento sob
consulta + 3 modalidades, regras, sidebar sb-* com countdown, related events.
Secao extra de questoes formativas. Reaproveita EventoSubnav/FaqEvento/Countdown.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Wiring no `page.tsx`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`

- [ ] **Step 1: Importar o layout**

Após `import { EventoPresencialLayout } from "./EventoPresencialLayout";`, adicionar:

```ts
import { EventoOnlineLayout } from "./EventoOnlineLayout";
```

- [ ] **Step 2: Substituir o case online**

Trocar:

```ts
    case "online":
      // TODO: implementar EventoOnlineLayout em sessões futuras
      notFound();
```

por:

```ts
    case "online":
      return <EventoOnlineLayout evento={evento} />;
```

- [ ] **Step 3: Atualizar o comentário do docblock (se ainda mencionar notFound para online)**

Se a linha `* Slugs online caem em notFound() até que EventoOnlineLayout seja portado.` existir, trocar por:

```ts
 * Online usa EventoOnlineLayout (estrutura evt-* do protótipo EDUTEC).
```

- [ ] **Step 4: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. `switch` exaustivo (presencial/hibrido → Presencial; online → Online com narrowing para `EventoOnline`).

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/page.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): roteia evento online para EventoOnlineLayout

Remove o notFound() do case "online"; /agenda/edutec-m01-2026 passa a renderizar.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Validação

**Files:** nenhum.

- [ ] **Step 1: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: ambos PASS (lint: sem novos warnings nos arquivos da porta).

- [ ] **Step 2: Build**

Run: `pnpm build`
Expected: PASS; `/agenda/edutec-m01-2026` listado como SSG (●). (memory `feedback_build_pega_a_rota_interna`: o build pega `<a>` interno que o typecheck não pega — o layout usa `<a>` com `data-cms-link` literais do protótipo, padrão já aceito.)

- [ ] **Step 3: Dev server**

Run (background): `pnpm --filter @ntc/web exec next dev --port 3000`
(NÃO `pnpm dev` — turbo não propaga logs.)

- [ ] **Step 4: Smoke HTTP**

```bash
cd /Users/joao/Documents/portal-ntc
for i in $(seq 1 40); do c=$(curl -sS -o /dev/null -w "%{http_code}" http://localhost:3000/agenda/edutec-m01-2026 2>/dev/null); [ "$c" = "200" ] && { echo "ready ${i}s"; break; }; sleep 1; done
curl -sS -o /dev/null -w "edutec: %{http_code}\n" http://localhost:3000/agenda/edutec-m01-2026
curl -sS -o /dev/null -w "prosus: %{http_code}\n" http://localhost:3000/agenda/prosus-brasilia
```
Expected: ambos `200`.

- [ ] **Step 5: Verificação de conteúdo renderizado**

```bash
cd /Users/joao/Documents/portal-ntc
html=$(curl -sS http://localhost:3000/agenda/edutec-m01-2026)
for m in "evt-hero" "27 · Maio" "Sob consulta" "schedule-node" "eventon-features" "EventON" "Roberta Aquino" "invest-mode" "data-evento=\"EDUTEC-M01\"" "Seis razões" "id=\"questoes\"" "id=\"eventon\"" "id=\"regras\""; do
  printf "%-28s %s\n" "$m" "$(printf '%s' "$html" | grep -c "$m")"
done
echo "--- NÃO deve aparecer (dados bancários / 15 jun / R\$ 1.470) ---"
for n in "Banco do Brasil" "Bradesco" "10.614.200" "15 de junho" "1.470"; do
  printf "%-20s %s\n" "$n" "$(printf '%s' "$html" | grep -c "$n")"
done
```
Expected: marcadores ≥1; bloco proibido = 0.

- [ ] **Step 6: Checkpoint visual humano**

Pedir ao usuário para abrir `http://localhost:3000/agenda/edutec-m01-2026` lado a lado com `feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html`. Checklist:
- Hero imagem-mãe + acento petróleo, título com "Transformação" em itálico dourado.
- Meta-bar 5 itens (Plataforma incluída), acento petróleo nas bordas.
- Subnav 9 âncoras, scroll-spy; ações Inscrever/Folder/Agenda dropdown.
- Visão geral com `.lede-block`, `.module-binding-note`, **6 razões `.why-grid`**.
- Público: chips + Objetivo + Destaques (5).
- Programação: timeline com nós I–IV, linha vertical petróleo.
- Questões: 29 perguntas (seção extra), bloco "Na prática".
- Palestrantes: 3 cards (fotos vazias), role-tag.
- EventOn: card escuro, marca Event**ON**, 3 stats, 6 features com SVG.
- Investimento: bloco escuro "Sob", 3 modalidades (3ª featured).
- Regras (8), FAQ (7, abre/fecha).
- Sidebar: cover EventON, countdown 20/Mai, sb-rows, share.
- Related: 3 cards.
- Sem dados bancários, sem 15/Jun, sem R$ 1.470.

- [ ] **Step 7: Encerrar dev server e resumir**

Após aprovação, encerrar o dev server, resumir a sessão (≤10 linhas) e listar pendências (fotos dos palestrantes).

---

## Self-Review

**1. Spec coverage:**
- CSS 57 faltantes + acento + aliases countdown → Task 1. ✓
- Tipos evt-* + EventoOnline → Task 2. ✓
- Evento estático (estrutura protótipo + textos PDF + 29 questões) → Task 3. ✓
- EventoOnlineLayout espelhando <main> → Task 4. ✓
- page.tsx wiring → Task 5. ✓
- Validação + checkpoint visual contra protótipo → Task 6. ✓
- 27/Mai + Sob consulta (não 15/Jun/R$1.470) → Task 3 dados + Task 6 verificação negativa. ✓
- Sem dados bancários → Task 3 (não incluídos) + Task 6 verificação. ✓
- Fotos vazias → Task 3. ✓
- data-evento="EDUTEC-M01" (acento) → Task 1 CSS + Task 4 main. ✓
- Seção extra de questões → Task 3 dados + Task 4 render. ✓

**2. Placeholder scan:** sem TBD/etc. Os `// TODO: foto sobe depois` são intencionais. Textos literais presentes.

**3. Type consistency:**
- `heroOnline/metasOnline/visaoGeralOnline/publicoOnline/programacaoOnline/questoesOnline/palestrantesOnline/eventonOnline/investimentoOnline/regrasOnline/ctaFinalOnline/sidebarOnline/relatedOnline` — nomes idênticos entre Task 2 (def), Task 3 (preenche), Task 4 (lê). ✓
- `WhyCard{num,titulo,descricao}`, `HighlightItem{num,html}`, `ScheduleNode{time,ttag,num,titulo,speakerLineHtml,bullets}`, `EventonFeat{iconeSvgInner,titulo,descricao}`, `InvestMode{tag,titulo,descricao,featured?}` — consistentes Task 2↔3↔4. ✓
- `EventoOnline extends EventoBase` — adapter CMS (eventos.ts:336) continua válido (campos *Online opcionais). ✓
- `RelatedEventCard` reaproveitado; risco na variante `single`→`multi` sinalizado em Task 3 (nota) + Task 5 fallback. ✓
- `CountdownSidebar` usa `.sidebar-*`; aliases CSS em Task 1 garantem render. ✓

Plano consistente e pronto.
