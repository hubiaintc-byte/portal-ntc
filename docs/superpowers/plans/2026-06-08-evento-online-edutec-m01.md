# Evento Online EDUTEC Módulo 01 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o `EventoOnlineLayout` (variante `online` de `/agenda/[slug]`, hoje em `notFound`) e cadastrar o seminário EDUTEC Módulo 01 como evento estático em `/agenda/edutec-m01-2026`, fiel ao folder PDF.

**Architecture:** Reaproveita toda a infra de evento já portada (`conteudoEventos.ts`, `evento-prototipo.css`, `EventoSubnav`, `CountdownSidebar`, `FaqEvento`, `AgendaDropdown`). O `EventoOnlineLayout` espelha o `EventoPresencialLayout` **sem** a seção Local e **com** 2 seções novas (Plataforma EventON, Questões Formativas). Campos novos em `EventoOnline` são **opcionais** para não quebrar o adapter CMS (`lib/cms/eventos.ts:336`).

**Tech Stack:** Next.js 15 App Router (RSC), TypeScript strict, CSS literal (evento-prototipo.css), tokens do design system Soberana.

---

## Contexto de fidelidade (ler antes de começar)

- **Fonte canônica:** o folder PDF na raiz `Folder · Módulo 01 EDUTEC · ... · 2026 - Nova Data.pdf`. Para reextrair texto: `pdftotext -layout "<arquivo>" -`.
- **Fidelidade 100%** (memory `feedback_porta_html_fidelidade`): textos literais do folder, sem rephrasing. Tags inline (`<strong>`) preservadas em strings com `dangerouslySetInnerHTML` onde o layout já faz isso.
- **Dados bancários NÃO entram** na página (decisão do spec). Só preço R$ 1.470 + 3 modalidades.
- **Fotos dos palestrantes:** `foto: ""` + comentário `// TODO: foto sobe depois`. O usuário sobe depois.
- **Validação visual humana** (memory `feedback_validacao_visual`): servidor no ar, comparação lado a lado com o PDF. Sem screenshot automatizado.
- **Build antes de PR** (memory `feedback_build_pega_a_rota_interna`): `pnpm build` pega `<a>` para rota interna que typecheck não pega. Aqui o layout já usa `<a>` literais com `data-cms-link` (padrão do protótipo de evento) — manter o padrão existente, não trocar por `<Link>`.

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` | Tipos + dados estáticos. Adiciona `SecaoPlataforma`, `SecaoQuestoes` e tipos auxiliares; estende `EventoOnline` (opcionais) e `SecaoInvestimento` (modalidades opcional); adiciona evento `edutec-m01-2026`. | Modify |
| `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx` | Layout do evento online. Espelho do Presencial − Local + 2 seções novas. | Create |
| `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx` | Roteia `formato`. Troca `notFound()` do `case "online"` por `<EventoOnlineLayout>`. | Modify |
| `apps/web/app/evento-prototipo.css` | CSS literal de evento. Adiciona classes das 2 seções novas. | Modify |

**Ordem das tasks:** tipos → CSS → evento estático → layout → wiring → validação. Cada task termina com commit.

---

### Task 1: Tipos das 2 seções novas + extensão de `EventoOnline` e `SecaoInvestimento`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

- [ ] **Step 1: Adicionar os tipos auxiliares e de seção**

No bloco `// ----------------- Sub-seções editoriais -----------------`, **após** a interface `SecaoDiferenciais` (linha ~185), inserir:

```ts
// --- Seções exclusivas de evento online (folder EDUTEC M01) ---

export interface PlataformaStat {
  numero: string;
  label: string;
}

export interface PlataformaCard {
  titulo: string;
  descricao: string;
}

export interface SecaoPlataforma {
  eyebrow: string;
  h2: string;
  lede: string;
  stats: PlataformaStat[];
  cards: PlataformaCard[];
}

export interface QuestaoFormativa {
  numero: string;
  pergunta: string;
}

export interface GrupoQuestoes {
  sessao: string;
  titulo: string;
  palestrante: string;
  questoes: QuestaoFormativa[];
}

export interface SecaoQuestoes {
  eyebrow: string;
  h2: string;
  intro: string;
  grupos: GrupoQuestoes[];
  naPratica: { titulo: string; itens: string[] };
}

export interface ModalidadeContratacao {
  rotulo: string;
  titulo: string;
  descricao: string;
}
```

- [ ] **Step 2: Estender `SecaoInvestimento` com `modalidades` opcional**

Localizar a interface `SecaoInvestimento` (tem `eyebrow`, `h2`, `h2Id?`, `rules`). Adicionar o campo opcional:

```ts
export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  h2Id?: string;
  rules: string[];
  precoDestaque?: { valor: string; legenda: string };
  inclui?: { titulo: string; items: string[] };
  modalidades?: ModalidadeContratacao[];
}
```

- [ ] **Step 3: Estender `EventoOnline` com seções opcionais**

Localizar `export interface EventoOnline extends EventoBase { formato: "online"; }` e substituir por:

```ts
export interface EventoOnline extends EventoBase {
  formato: "online";
  plataforma?: SecaoPlataforma;
  questoes?: SecaoQuestoes;
}
```

> **Por que opcional:** o adapter CMS em `apps/web/lib/cms/eventos.ts:336` retorna `{ ...base, formato: "online" }` sem esses campos. Opcional mantém o adapter compilando; o layout renderiza condicionalmente.

- [ ] **Step 4: Rodar typecheck para garantir que nada quebrou**

Run: `pnpm typecheck`
Expected: PASS (tipos novos não são usados ainda; adapter CMS continua válido).

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona tipos de evento online (plataforma e questoes formativas)

SecaoPlataforma, SecaoQuestoes, ModalidadeContratacao e extensao opcional de
EventoOnline e SecaoInvestimento. Campos opcionais para nao quebrar o adapter CMS.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: CSS das 2 seções novas em `evento-prototipo.css`

**Files:**
- Modify: `apps/web/app/evento-prototipo.css`

Seguir o padrão `.event-section` (eyebrow + h2 + grid), tokens `--oxford`/`--dourado`/`--pergaminho`/`--space-*`, `border-radius: 0` em cards (CLAUDE.md §3).

- [ ] **Step 1: Anexar o bloco CSS ao final do arquivo**

Adicionar ao fim de `apps/web/app/evento-prototipo.css`:

```css
/* ===================================================================
   EVENTO ONLINE — Plataforma EventON + Questões formativas
   (folder EDUTEC Módulo 01; sem protótipo HTML — estilo .event-section)
   =================================================================== */

/* --- Plataforma EventON --- */
.eventon-platform-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin: var(--space-4) 0 var(--space-5);
  padding: var(--space-4) 0;
  border-top: 1px solid rgba(17, 54, 94, 0.12);
  border-bottom: 1px solid rgba(17, 54, 94, 0.12);
}
.eventon-stat { text-align: center; }
.eventon-stat-num {
  display: block;
  font-family: var(--font-serif);
  font-size: 40px;
  font-weight: 600;
  color: var(--oxford);
  line-height: 1;
}
.eventon-stat-label {
  display: block;
  margin-top: 8px;
  font-family: var(--font-cond);
  font-size: 11px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--prata);
}
.eventon-platform-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.eventon-platform-card {
  border: 1px solid rgba(17, 54, 94, 0.12);
  border-radius: 0;
  padding: var(--space-4);
  background: var(--pergaminho-40, #faf7f1);
}
.eventon-platform-card h4 {
  font-family: var(--font-serif);
  font-size: 19px;
  color: var(--oxford);
  margin: 0 0 8px;
}
.eventon-platform-card p {
  font-size: 14.5px;
  color: var(--grafite);
  line-height: 1.55;
  margin: 0;
}

/* --- Questões formativas --- */
.event-questoes-grupo { margin-top: var(--space-5); }
.event-questoes-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--oxford);
  margin-bottom: var(--space-3);
}
.event-questoes-sessao {
  font-family: var(--font-cond);
  font-size: 12px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--dourado);
  font-weight: 600;
}
.event-questoes-titulo {
  font-family: var(--font-serif);
  font-size: 20px;
  color: var(--oxford);
  margin: 0;
  flex: 1 1 260px;
}
.event-questoes-palestrante {
  font-size: 13px;
  color: var(--prata);
}
.event-questoes-item {
  display: flex;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(17, 54, 94, 0.08);
}
.event-questoes-num {
  font-family: var(--font-cond);
  font-size: 13px;
  font-weight: 600;
  color: var(--dourado);
  min-width: 28px;
}
.event-questoes-pergunta {
  font-size: 15.5px;
  color: var(--grafite);
  line-height: 1.5;
}
.event-questoes-pratica {
  margin-top: var(--space-5);
  padding: var(--space-4);
  border: 1px solid var(--dourado);
  border-radius: 0;
  background: var(--pergaminho-40, #faf7f1);
}
.event-questoes-pratica h4 {
  font-family: var(--font-cond);
  font-size: 12px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--dourado);
  margin: 0 0 12px;
}
.event-questoes-pratica ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px var(--space-4);
}
.event-questoes-pratica li {
  font-size: 14.5px;
  color: var(--grafite);
  line-height: 1.5;
  padding-left: 18px;
  position: relative;
}
.event-questoes-pratica li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--dourado);
}

/* --- Investimento online: preço + modalidades --- */
.event-invest-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: var(--space-3) 0 var(--space-2);
}
.event-invest-price strong {
  font-family: var(--font-serif);
  font-size: 44px;
  font-weight: 600;
  color: var(--oxford);
  line-height: 1;
}
.event-invest-price span {
  font-family: var(--font-cond);
  font-size: 12px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--prata);
}
.event-invest-modalidades {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-4);
}
.event-invest-modalidade {
  border: 1px solid rgba(17, 54, 94, 0.12);
  border-radius: 0;
  padding: var(--space-4);
}
.event-invest-modalidade .rotulo {
  font-family: var(--font-cond);
  font-size: 11px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--dourado);
}
.event-invest-modalidade h4 {
  font-family: var(--font-serif);
  font-size: 19px;
  color: var(--oxford);
  margin: 8px 0;
}
.event-invest-modalidade p {
  font-size: 14px;
  color: var(--grafite);
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 820px) {
  .eventon-platform-grid,
  .event-invest-modalidades,
  .event-questoes-pratica ul { grid-template-columns: 1fr; }
}
```

> **Nota sobre tokens:** `--pergaminho-40` pode não existir. O fallback `#faf7f1` no `var(--pergaminho-40, #faf7f1)` cobre isso sem quebrar. Se `--grafite`/`--prata` não existirem, conferir no topo do arquivo e usar os tokens reais (`grep -n "\-\-grafite\|\-\-prata\|\-\-pergaminho" apps/web/app/evento-prototipo.css`). Não inventar cores novas (CLAUDE.md §5.2).

- [ ] **Step 2: Verificar tokens usados existem (ou têm fallback)**

Run: `grep -nE "^\s*--(grafite|prata|pergaminho|oxford|dourado|font-serif|font-cond)" apps/web/app/evento-prototipo.css | head`
Expected: confirmar que `--oxford`, `--dourado`, `--font-serif`, `--font-cond` existem. `--grafite`/`--prata`/`--pergaminho-40`: se ausentes, ajustar para tokens reais encontrados ou manter fallback literal.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/evento-prototipo.css
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona CSS das secoes de evento online (plataforma e questoes)

Classes .eventon-platform-*, .event-questoes-* e .event-invest-* no padrao
.event-section, com tokens do design system Soberana e border-radius 0.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Cadastrar o evento estático `edutec-m01-2026` (parte 1 — base + seções editoriais)

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts`

> Esta task adiciona a constante `eventoEdutecM01: EventoOnline`. Por ser grande, é dividida em 2 tasks (3 e 4). A Task 3 escreve o objeto **completo** (não há andaime parcial — TypeScript exige o objeto inteiro de uma vez). Os textos abaixo são **literais do folder PDF** — não reescrever.

- [ ] **Step 1: Adicionar a constante do evento antes do `Record exportado`**

Inserir **antes** da linha `// ----------------- Record exportado -----------------` (~linha 753), o objeto completo:

```ts
// ----------------- Evento: EDUTEC Módulo 01 2026 (online) -----------------
// Porta literal do folder "Módulo 01 EDUTEC · Cultura Digital, Educação
// Midiática e Transformação da Educação · Instituto NTC do Brasil · 2026".
// Fotos dos palestrantes: o usuário sobe depois (foto: "").

const eventoEdutecM01: EventoOnline = {
  slug: "edutec-m01-2026",

  titulo: "Cultura Digital, Educação Midiática e Transformação da Educação",

  subtitulo:
    "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",

  formato: "online",

  dataEvento: "15 de junho de 2026",

  area: "edu",

  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    {
      texto: "Eventos online",
      href: "/capacitacao/agenda",
      cmsLink: "eventos-online",
    },
    { texto: "EDUTEC · Módulo 01", current: true },
  ],

  hero: {
    tags: [
      { texto: "Inscrições abertas", classe: "event-hero-status" },
      { texto: "Seminário on-line ao vivo", classe: "event-hero-format" },
      { texto: "NTC Educação", classe: "event-hero-vert" },
    ],
    h1: "Cultura Digital, Educação Midiática e Transformação da Educação",
    sub: "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    programBinding: {
      texto: "Integra a trilha",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma:
        "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      {
        texto: "Inscrever-se",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026",
        cmsLink: "inscricao-EDUTEC-M01-2026",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Solicitar proposta institucional",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe",
        cmsLink: "proposta-grupo-EDUTEC",
        classe: "btn btn--ghost-light",
      },
    ],
  },

  metas: [
    { label: "Quando", value: "15 · Junho", valueSub: "2026 · dia único" },
    { label: "Modalidade", value: "Online ao vivo", valueSub: "Plataforma EventON NTC" },
    { label: "Carga horária", value: "08 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Inscrição individual", value: "R$ 1.470", valueSub: "Evento on-line ao vivo" },
    { label: "Equipes / órgãos", value: "Sob proposta", valueSub: "Grupos institucionais" },
  ],

  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "O que você aprenderá", href: "#questoes" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "Plataforma", href: "#plataforma" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "FAQ", href: "#faq" },
  ],

  visaoGeral: {
    eyebrow: "Sobre este módulo",
    h2: "Uma agenda institucional para uma educação digital crítica, conectada e contemporânea.",
    lede: "A escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos e novas linguagens de participação — formar para apenas utilizar tecnologia é insuficiente.",
    paragrafos: [
      "Este módulo aborda a cultura digital e a educação midiática como dimensões estruturantes da formação contemporânea, reconhecendo que a escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos, redes de informação e novas linguagens de participação. Formar estudantes para apenas utilizar tecnologia é insuficiente: é necessário desenvolver leitura crítica, autoria, responsabilidade, discernimento e capacidade de participação qualificada no ecossistema informacional.",
      "A proposta do evento apoia redes públicas e instituições educacionais na consolidação de práticas pedagógicas mais inovadoras, intencionais e conectadas aos desafios do presente. Ao articular fundamentos conceituais, curadoria pedagógica, educação midiática e estratégias de transformação digital, o módulo oferece repertório para que gestores, coordenadores e professores compreendam a tecnologia como linguagem, ambiente cultural e instrumento pedagógico a serviço da aprendizagem.",
      "Inserido na trilha EDUTEC, este módulo funciona como base formativa para uma agenda institucional de educação digital. Sua contribuição está em organizar conceitos, critérios e diretrizes iniciais para que a rede avance com coerência entre currículo, formação docente, cultura escolar e uso qualificado de recursos digitais — fortalecendo uma atuação mais crítica, ética e contemporânea no ambiente educacional.",
    ],
  },

  publico: {
    eyebrow: "Para quem é este módulo",
    h2: "Público-alvo",
    intro: "Dimensionado para quem decide, coordena e implementa a agenda de educação digital nas redes públicas:",
    chips: [
      { texto: "Secretários e dirigentes de educação" },
      { texto: "Equipes técnicas e gestores escolares" },
      { texto: "Coordenadores pedagógicos" },
      { texto: "Professores e formadores de educadores" },
      { texto: "Profissionais de educação digital, currículo e mídias" },
      { texto: "Gestores de inovação pedagógica" },
    ],
  },

  objetivos: {
    eyebrow: "Por que este módulo existe",
    h2: "Objetivo",
    objetivos: [
      { texto: "Compreender os fundamentos do letramento digital e da educação midiática, fortalecer práticas pedagógicas críticas e apoiar redes na formação de estudantes mais autônomos, críticos e responsáveis no uso de mídias e tecnologias — integrando competências digitais ao currículo e às práticas pedagógicas da rede." },
    ],
  },

  conteudoProgramatico: {
    eyebrow: "Destaques · diferenciais",
    h2: "O que torna o Módulo 01 EDUTEC uma referência institucional",
    intro: "Conteúdo, autoridade e experiência institucional em uma única jornada formativa de 8 horas.",
    itens: [
      { num: "01", texto: "Fundamentos da cultura digital e seus impactos sobre educação, comunicação e aprendizagem." },
      { num: "02", texto: "Educação midiática e competências do século 21 para o ensino básico." },
      { num: "03", texto: "Curadoria pedagógica de recursos digitais com critérios de qualidade e intencionalidade." },
      { num: "04", texto: "Letramento crítico, autoria e cidadania digital integrados ao currículo." },
      { num: "05", texto: "Transformação digital institucional da visão estratégica à execução prática." },
      { num: "06", texto: "Articulação entre currículo, formação docente e cultura escolar contemporânea." },
      { num: "07", texto: "Aplicabilidade em diferentes etapas e componentes curriculares da educação básica." },
    ],
  },

  programacao: {
    eyebrow: "Programação detalhada",
    h2: "Quatro sessões aplicadas, oito horas de imersão ao vivo",
    intro: "Dia único · manhã e tarde · 08h00–18h00 · 8 horas · EventON NTC.",
    dias: [
      {
        dateBig: "15",
        dateSub: "Junho · 2026",
        dayTag: "Dia único · Manhã e Tarde",
        rows: [
          {
            time: "08h00 – 10h00",
            titulo: "Palestra 01 · Cultura digital e os novos paradigmas da educação contemporânea",
            descricao: "com Roberta Aquino · Doutora em Ciências (Unicamp) · Educadora ISTE — Fundamentos da cultura digital e seus impactos sobre educação, comunicação e aprendizagem; transformações nas formas de produzir, acessar e compartilhar informações; o papel da escola diante da conectividade, da multiplicidade de fontes e da sociedade em rede.",
          },
          {
            time: "10h00 – 12h00",
            titulo: "Oficina 01 · Aprendizagem no século 21: a importância da educação midiática",
            descricao: "com Mariana Ochs · Coordenadora EducaMídia · Instituto Palavra Aberta — Competências essenciais para uso crítico, ético e intencional de mídias e tecnologias; análise de conteúdos, plataformas e discursos no ambiente digital; caminhos para integrar essas competências ao currículo da rede.",
          },
          {
            time: "14h00 – 16h00",
            titulo: "Oficina 02 · Curadoria pedagógica de recursos digitais: critérios, qualidade e intencionalidade",
            descricao: "com Karla Priscilla · Mestranda em Tecnologias Emergentes · Google Innovator — Desenvolvimento da competência de busca e seleção crítica de recursos educacionais; avaliação de recursos educacionais e aderência ao contexto pedagógico; uso de recursos digitais para ampliar a participação e a expressão dos estudantes.",
          },
          {
            time: "16h00 – 18h00",
            titulo: "Oficina 03 · Transformação digital na educação: da visão à implementação",
            descricao: "com Roberta Aquino · Especialista em transformação digital institucional — Prioridades institucionais para implementação do tema em escolas e sistemas de ensino; articulação entre currículo, formação e cultura institucional; possibilidades de projetos integradores, trilhas e ações formativas.",
          },
        ],
      },
    ],
  },

  palestrantes: {
    eyebrow: "Conheça nossos palestrantes",
    h2: "Três especialistas de referência nacional",
    intro: "Três especialistas de referência nacional em cultura digital, educação midiática e inovação pedagógica.",
    palestrantes: [
      {
        foto: "", // TODO: foto sobe depois
        role: "Palestrante",
        nome: "Roberta Aquino",
        credenciais: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator. Professora de pós-graduação, palestrante internacional e consultora educacional, capacita professores e instituições a prosperarem na era digital. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp (tecnologias educacionais aplicadas à genética médica), com duas especializações em TI e MBA em Marketing pela ESPM. Educadora Certificada ISTE, Google Innovator, Trainer e Coach, Líder do GEG CDMX e Mentora GEG para a América Latina. Canva Education Partner, Canva Trainer, Canvassador e Edu Canva Creator. Embaixadora de Genially, Wakelet, Wayground, MagicSchool, Padlet e BookCreator. Brasileira radicada no México desde 2018.",
      },
      {
        foto: "", // TODO: foto sobe depois
        role: "Palestrante",
        nome: "Karla Priscilla",
        credenciais: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia. Pedagoga, consultora e palestrante. Especialista em Educação Digital e Metodologias Ativas. Google Champions, Innovator e Google Trainer, Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais em uma rede de educação e como formadora de educadores em todo o Brasil. Realiza a coordenação pedagógica de projetos e mentorias, com a missão de impactar positivamente a vida pessoal e profissional de cada participante, no presencial e no virtual. Embaixadora do Canva for Education, ClassDojo e da plataforma Teachy.",
      },
      {
        foto: "", // TODO: foto sobe depois
        role: "Palestrante",
        nome: "Mariana Ochs",
        credenciais: "Coordenadora EducaMídia · Instituto Palavra Aberta · USP. Designer, jornalista e especialista em cultura digital na educação. Coordenadora do EducaMídia, programa de educação midiática do Instituto Palavra Aberta, atuando nas estratégias de formação docente e na criação de cursos e materiais pedagógicos. Pós-graduação em Letramento Digital pela Universidade de Rhode Island; pós-graduanda em Ciências da Comunicação na USP, onde pesquisa o letramento algorítmico na educação básica. Integra o programa de líderes Google Innovator e assessorou o time de produto do Google Search como parte do Grupo Global de Especialistas em Letramento Informacional. Coautora do Guia da Educação Midiática e do e-book Educação Midiática e Inteligência Artificial.",
      },
    ],
    nota: "Fotos dos palestrantes serão publicadas em breve.",
  },

  diferenciais: {
    eyebrow: "Por que você não pode perder este módulo",
    h2: "Seis razões para participar do Módulo 01 · EDUTEC",
    diferenciais: [
      { num: "01", titulo: "Porque sua rede precisa de uma agenda institucional para a cultura digital", descricao: "Frente à presença massiva de telas, plataformas e algoritmos, a escola pública precisa de uma resposta institucional coerente — este módulo organiza essa agenda." },
      { num: "02", titulo: "Porque o tema será conduzido por especialistas de referência nacional", descricao: "Roberta Aquino (Unicamp · ISTE), Mariana Ochs (EducaMídia · USP) e Karla Priscilla (Google Innovator) — três das principais referências brasileiras em cultura digital aplicada à educação." },
      { num: "03", titulo: "Porque a abordagem combina fundamentação e oficinas aplicadas", descricao: "Não é teoria abstrata: o módulo entrega oficinas com critérios de curadoria, instrumentos de avaliação de recursos digitais e diretrizes de transformação institucional." },
      { num: "04", titulo: "Porque participação na trilha EDUTEC com flexibilidade contratual", descricao: "Pode ser contratado como módulo independente ou compor a trilha completa EDUTEC — adequando-se ao planejamento e ao orçamento da rede ou instituição." },
      { num: "05", titulo: "Porque a experiência acontece na plataforma EventON NTC", descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido — sem necessidade de download." },
      { num: "06", titulo: "Porque você recebe certificação institucional do Instituto NTC do Brasil", descricao: "Certificação válida como atualização profissional, mediante 75% de presença — emitida pela referência institucional em capacitação para o setor público brasileiro." },
    ],
  },

  replayCert: {
    eyebrow: "Replay · certificação",
    h2: "Acesso, replay e certificação NTC",
    cards: [
      { icone: "▶", titulo: "Replay por até 7 dias", descricao: "Após a realização do evento, os inscritos acessam o replay pelo período informado, observadas as regras de acesso individual — vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio." },
      { icone: "✓", titulo: "Certificação NTC", descricao: "Certificado de participação emitido pelo Instituto NTC do Brasil, válido como atualização profissional, mediante presença mínima de 75% da carga horária e registro no ambiente virtual EventON NTC. Emitido após o encerramento do prazo de replay." },
    ],
  },

  investimento: {
    eyebrow: "Investimento · condições de contratação",
    h2: "Investimento e condições de contratação",
    rules: [
      "A inscrição contratada garante a disponibilização do acesso ao evento on-line ao vivo, ao ambiente EventON NTC, ao material digital, ao suporte técnico e ao replay pelo período informado.",
      "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais, preferencialmente até 2 dias úteis antes do evento.",
      "Para efetivação das inscrições, deverão ser informados os dados dos participantes: nome completo, e-mail funcional ou institucional, telefone/WhatsApp e órgão de vinculação.",
      "O cancelamento e/ou a substituição de inscrição deverá ser solicitado por escrito, pelo e-mail eventosonline@institutontc.com.br ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento.",
      "A ausência, o não acesso, o acesso parcial ou o não uso do replay dentro do prazo não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC.",
      "Órgãos públicos poderão formalizar a contratação mediante Nota de Empenho, Ordem de Serviço, Autorização de Fornecimento ou instrumento contratual equivalente, com posterior pagamento.",
    ],
    precoDestaque: { valor: "R$ 1.470,00", legenda: "Valor por inscrição individual · evento on-line ao vivo de 8 horas" },
    inclui: {
      titulo: "A inscrição inclui",
      items: [
        "Apostila digital específica do módulo-evento",
        "Certificado digital emitido pelo Instituto NTC do Brasil",
        "Acesso individual ao ambiente EventON NTC",
        "Replay integral pelo período informado",
        "Suporte técnico para acesso ao ambiente virtual",
      ],
    },
    modalidades: [
      { rotulo: "Modalidade · 01", titulo: "Inscrição Individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { rotulo: "Modalidade · 02", titulo: "Grupos Institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada, conforme quantidade de inscritos, perfil institucional da demanda e forma de contratação." },
      { rotulo: "Modalidade · 03 · Estratégica", titulo: "Grandes Grupos e Turmas Fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios, instituições ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada — contemplando condições por escala, política de cortesias institucionais, suporte operacional, período de replay e eventual estruturação de turma exclusiva." },
    ],
  },

  faq: {
    eyebrow: "Dúvidas frequentes",
    h2: "Agenda, ambiente virtual e participação",
    faqs: [
      { id: "edutec-m01-faq-1", pergunta: "Como e onde acontece o evento?", respostaHtml: "O evento será realizado em ambiente virtual <strong>EventON NTC</strong>, com transmissão on-line ao vivo, acesso individualizado por login e senha e suporte técnico aos participantes regularmente inscritos. Não é necessário nenhum download." },
      { id: "edutec-m01-faq-2", pergunta: "Como recebo meu acesso?", respostaHtml: "Após a confirmação da Nota de Empenho, instrumento contratual, autorização de fornecimento, ordem de serviço ou pagamento, os acessos serão enviados aos e-mails informados pela Contratante." },
      { id: "edutec-m01-faq-3", pergunta: "Como funciona a inscrição em grupo?", respostaHtml: "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais. A relação deverá ser enviada preferencialmente até 2 dias úteis antes do evento." },
      { id: "edutec-m01-faq-4", pergunta: "Por quanto tempo tenho acesso ao replay?", respostaHtml: "Os inscritos poderão acessar o replay <strong>por até 7 dias</strong> após a realização do evento, observadas as regras de acesso individual e vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio." },
      { id: "edutec-m01-faq-5", pergunta: "Como é emitida a certificação?", respostaHtml: "A certificação será emitida somente após o encerramento do prazo de replay, exclusivamente aos participantes que cumprirem os critérios mínimos de presença (75% da carga horária) e registro no ambiente." },
      { id: "edutec-m01-faq-6", pergunta: "Posso cancelar ou substituir uma inscrição?", respostaHtml: "Sim. O cancelamento e/ou a substituição deverá ser solicitado por escrito, pelo e-mail <strong>eventosonline@institutontc.com.br</strong> ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento. A substituição deverá indicar os dados completos do novo participante." },
    ],
  },

  ctaFinal: {
    eyebrowGold: "Próximo passo",
    h2: "Garanta a participação da sua rede no Módulo 01 da trilha EDUTEC.",
    paragrafo: "Solicite proposta institucional personalizada para grupos e grandes turmas, ou faça sua inscrição individual no seminário on-line ao vivo de 15 de junho de 2026.",
    ctas: [
      {
        texto: "Inscrever-se agora",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026",
        cmsLink: "inscricao-EDUTEC-M01-2026",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Solicitar proposta institucional",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe",
        cmsLink: "proposta-grupo-EDUTEC",
        classe: "btn btn--secondary",
      },
    ],
  },

  sidebar: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    tituloCard: "Inscrição · EDUTEC Módulo 01",
    rows: [
      { label: "Quando", value: "15 · Junho · 2026" },
      { label: "Modalidade", value: "Online ao vivo · EventON" },
      { label: "Carga horária", value: "8 horas · Manhã + Tarde" },
      { label: "Individual", value: "R$ 1.470", price: true },
      { label: "Equipes / órgãos", value: "Sob proposta" },
    ],
    includes: {
      titulo: "A inscrição inclui",
      items: [
        "Apostila digital do módulo",
        "Certificado digital do Instituto NTC",
        "Acesso individual ao EventON NTC",
        "Replay integral por até 7 dias",
        "Suporte técnico de acesso",
      ],
    },
    countdown: {
      label: "Data do evento",
      dateText: "15 de Junho de 2026",
      deadline: "2026-06-15T08:00:00-03:00",
      tipo: "numerico",
    },
    acoes: [
      {
        texto: "Inscrever-se",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026",
        cmsLink: "inscricao-EDUTEC-M01-2026",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Solicitar proposta institucional",
        href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe",
        cmsLink: "inscricao-equipe-EDUTEC",
        classe: "btn btn--secondary",
      },
    ],
    share: {
      label: "Compartilhar:",
      links: [
        { texto: "WhatsApp", href: "#", cmsLink: "share-whatsapp" },
        { texto: "E-mail", href: "#", cmsLink: "share-email" },
        { texto: "LinkedIn", href: "#", cmsLink: "share-linkedin" },
      ],
    },
  },

  relatedEvents: {
    eyebrowGold: "Também na trilha EDUTEC",
    h2: "Outros eventos da NTC Educação",
    intro: "Módulos e eventos abertos vinculados ao programa <strong>EDUTEC</strong> nas próximas semanas.",
    cards: [],
    footerCtas: [
      {
        texto: "Ver agenda completa",
        href: "/capacitacao",
        cmsLink: "agenda-completa",
        classe: "btn btn--primary",
        arrow: true,
      },
      {
        texto: "Conhecer a trilha EDUTEC",
        href: "/programas/edutec",
        cmsLink: "programa-EDUTEC",
        classe: "btn btn--secondary",
      },
    ],
  },

  agendaIcs: {
    titulo: "EDUTEC Módulo 01 · Cultura Digital, Educação Midiática e Transformação da Educação",
    descricao: "Seminário on-line ao vivo da trilha EDUTEC · Instituto NTC do Brasil. Plataforma EventON NTC.",
    location: "Online · Plataforma EventON NTC",
    startISO: "20260615T110000Z",
    endISO: "20260615T210000Z",
    filename: "edutec-m01-2026.ics",
  },

  plataforma: {
    eyebrow: "Plataforma oficial · EventON NTC",
    h2: "A experiência institucional de aprendizado on-line do Instituto NTC",
    lede: "Entenda por que o EventON NTC reúne tecnologia, suporte e curadoria editorial para entregar a melhor experiência institucional de aprendizado on-line.",
    stats: [
      { numero: "5.000", label: "Participantes simultâneos" },
      { numero: "30 FPS", label: "Vídeo em alta definição" },
      { numero: "100%", label: "Acesso institucional" },
    ],
    cards: [
      { titulo: "Plataforma segura e escalável", descricao: "Alcance de até 5.000 participantes simultâneos, com estabilidade operacional comprovada e segurança institucional para eventos formais." },
      { titulo: "Alta definição", descricao: "Transmissão em 30 FPS, com vídeo e áudio de alta qualidade independente do dispositivo — desktop, laptop, tablet ou telefone." },
      { titulo: "Fácil e acessível", descricao: "Nenhum download é necessário. Acesso individual por login e senha, com interface simplificada e navegação institucional intuitiva." },
      { titulo: "Interação ao vivo com participantes", descricao: "Faça perguntas, participe de pesquisas em tempo real e até apresente conteúdos em momentos previamente combinados com a coordenação do evento." },
      { titulo: "Replay institucional", descricao: "Acesso ao replay integral do evento por período definido em contratação — para revisão, aprofundamento e referência institucional posterior." },
      { titulo: "Excelência docente e programática", descricao: "Curadoria editorial NTC com instrutores de referência nacional para entregar formação institucionalmente sólida, atualizada e tecnicamente qualificada." },
    ],
  },

  questoes: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas quatro sessões",
    intro: "Vinte e nove perguntas-guia organizadas por sessão, do fundamento conceitual à implementação institucional.",
    grupos: [
      {
        sessao: "Sessão · 01",
        titulo: "Cultura digital e os novos paradigmas da educação contemporânea",
        palestrante: "com Roberta Aquino · 08h00 – 10h00",
        questoes: [
          { numero: "01", pergunta: "O que é cultura digital e como ela transforma a relação entre escola, conhecimento e sociedade?" },
          { numero: "02", pergunta: "Como os algoritmos, plataformas e redes sociais redefinem o que significa aprender hoje?" },
          { numero: "03", pergunta: "Quais são as principais mudanças cognitivas e comportamentais provocadas pela presença massiva de telas no cotidiano?" },
          { numero: "04", pergunta: "De que forma a sociedade em rede altera os papéis tradicionais de professor, estudante e família na produção de conhecimento?" },
          { numero: "05", pergunta: "Como a multiplicidade de fontes informacionais impacta a função pedagógica da escola pública?" },
          { numero: "06", pergunta: "Que respostas institucionais a escola pública precisa desenvolver diante deste cenário?" },
          { numero: "07", pergunta: "Como articular cultura digital com os fundamentos pedagógicos consolidados do currículo brasileiro?" },
          { numero: "08", pergunta: "Quais práticas pedagógicas são compatíveis com a era da conectividade e quais precisam ser reformuladas?" },
        ],
      },
      {
        sessao: "Sessão · 02",
        titulo: "Aprendizagem no século 21: a importância da educação midiática",
        palestrante: "com Mariana Ochs · 10h00 – 12h00",
        questoes: [
          { numero: "09", pergunta: "O que é educação midiática e por que ela é estrutural à formação contemporânea?" },
          { numero: "10", pergunta: "Quais competências midiáticas devem ser desenvolvidas em cada etapa da educação básica?" },
          { numero: "11", pergunta: "Como analisar criticamente conteúdos, plataformas e discursos no ambiente digital?" },
          { numero: "12", pergunta: "Que critérios orientam a leitura crítica de notícias, imagens e narrativas em mídia?" },
          { numero: "13", pergunta: "Como integrar educação midiática às áreas curriculares sem sobrecarregar o currículo da rede?" },
          { numero: "14", pergunta: "De que forma a educação midiática combate desinformação, discursos de ódio e polarização?" },
          { numero: "15", pergunta: "Quais práticas de produção midiática podem ser desenvolvidas em sala de aula com baixa infraestrutura?" },
          { numero: "16", pergunta: "Como envolver famílias, escolas e a rede na agenda institucional de educação midiática?" },
        ],
      },
      {
        sessao: "Sessão · 03",
        titulo: "Curadoria pedagógica de recursos digitais",
        palestrante: "com Karla Priscilla · 14h00 – 16h00",
        questoes: [
          { numero: "17", pergunta: "O que é curadoria pedagógica e por que ela é central no planejamento docente?" },
          { numero: "18", pergunta: "Quais critérios devem orientar a busca, seleção e avaliação de recursos digitais?" },
          { numero: "19", pergunta: "Como avaliar a qualidade pedagógica e a aderência ao contexto de uma plataforma ou conteúdo?" },
          { numero: "20", pergunta: "Que ferramentas e referenciais apoiam a curadoria docente cotidiana?" },
          { numero: "21", pergunta: "Como diferenciar recursos pedagógicos qualificados de conteúdos rasos ou puramente comerciais?" },
          { numero: "22", pergunta: "De que forma a curadoria pode ampliar a participação e a expressão dos estudantes?" },
          { numero: "23", pergunta: "Como organizar institucionalmente bancos de recursos digitais para a rede?" },
        ],
      },
      {
        sessao: "Sessão · 04",
        titulo: "Transformação digital na educação: da visão à implementação",
        palestrante: "com Roberta Aquino · 16h00 – 18h00",
        questoes: [
          { numero: "24", pergunta: "O que diferencia transformação digital de mera digitalização de processos escolares?" },
          { numero: "25", pergunta: "Quais são as prioridades institucionais para implementar a agenda digital na rede?" },
          { numero: "26", pergunta: "Como articular currículo, formação docente e cultura institucional nessa transição?" },
          { numero: "27", pergunta: "Que arquitetura de governança digital é adequada à escola pública brasileira?" },
          { numero: "28", pergunta: "Como construir uma trilha pedagógica integradora ao longo da educação básica?" },
          { numero: "29", pergunta: "Como sustentar a transformação digital diante de mudanças de gestão e ciclo político?" },
        ],
      },
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
};
```

- [ ] **Step 2: Registrar o evento no `EVENTOS_AGENDA`**

Localizar o `Record` exportado (`export const EVENTOS_AGENDA`). Adicionar a entrada do novo evento ao objeto, ao lado de `"prosus-brasilia"`:

```ts
  "edutec-m01-2026": eventoEdutecM01,
```

- [ ] **Step 3: Rodar typecheck**

Run: `pnpm typecheck`
Expected: PASS. O objeto satisfaz `EventoOnline` (campos opcionais `plataforma`/`questoes` preenchidos; `modalidades`/`inclui`/`precoDestaque` em `investimento`).

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts"
git commit -m "$(cat <<'EOF'
feat(agenda): cadastra evento online EDUTEC Modulo 01 (estatico)

Porta literal do folder PDF: 4 sessoes, 29 questoes formativas, plataforma
EventON, 6 razoes, investimento R$ 1.470 + 3 modalidades. Fotos dos palestrantes
ficam vazias (sobem depois). Sem dados bancarios.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Criar o `EventoOnlineLayout.tsx`

**Files:**
- Create: `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx`

> Espelho do `EventoPresencialLayout.tsx` (ler esse arquivo inteiro como referência). **Diferenças:** (a) prop é `EventoOnline`; (b) **sem** a seção Local (5.8); (c) **com** Questões (após Programação) e Plataforma (após Diferenciais); (d) Investimento ganha preço + inclui + modalidades.

- [ ] **Step 1: Escrever o componente completo**

Criar `apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx`:

```tsx
import { Fragment } from "react";

import type { EventoOnline } from "./conteudoEventos";
import { CountdownSidebar } from "./CountdownSidebar";
import { EventoSubnav } from "./EventoSubnav";
import { FaqEvento } from "./FaqEvento";

/**
 * Layout de evento online — porta do folder EDUTEC Módulo 01 (PDF).
 *
 * Espelho de EventoPresencialLayout, SEM a seção Local, COM duas seções
 * exclusivas do online: Questões Formativas (#questoes) e Plataforma EventON
 * (#plataforma). Header/Footer/InteracoesScroll vêm de (capacitacao)/layout.tsx.
 */
interface EventoOnlineLayoutProps {
  evento: EventoOnline;
}

export function EventoOnlineLayout({ evento }: EventoOnlineLayoutProps) {
  const inscricaoCmsLink = evento.hero.ctas[0]?.cmsLink ?? "inscricao";
  const folderCta = evento.hero.ctas[1];

  return (
    <main id="main" className="event-page" data-evento={evento.slug}>
      {/* 1. BREADCRUMB */}
      <nav className="breadcrumb" aria-label="Trilha de navegação">
        <div className="container">
          <ol className="breadcrumb-list">
            {evento.crumb.map((c, i) => (
              <Fragment key={`crumb-${i}`}>
                {c.href ? (
                  <li>
                    <a href={c.href} data-cms-link={c.cmsLink}>
                      {c.texto}
                    </a>
                  </li>
                ) : (
                  <li className="current">{c.texto}</li>
                )}
                {i < evento.crumb.length - 1 && (
                  <li className="sep" aria-hidden="true">/</li>
                )}
              </Fragment>
            ))}
          </ol>
        </div>
      </nav>

      {/* 2. HERO */}
      <section
        className="event-hero"
        aria-label={`${evento.titulo} ${evento.dataEvento}`}
      >
        <div className="event-hero-bg" aria-hidden="true" />
        <div className="container event-hero-content fade-in">
          <div className="event-hero-tags">
            {evento.hero.tags.map((tag, i) => (
              <span key={i} className={tag.classe}>{tag.texto}</span>
            ))}
          </div>
          <h1>{evento.hero.h1}</h1>
          <p className="event-hero-sub">{evento.hero.sub}</p>
          <div className="event-hero-program-binding">
            <span>{evento.hero.programBinding.texto}</span>
            <strong>
              <a
                href={evento.hero.programBinding.href}
                data-cms-link={evento.hero.programBinding.cmsLink}
              >
                {evento.hero.programBinding.nomePrograma}
              </a>
            </strong>
          </div>
          <div
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "24px" }}
          >
            {evento.hero.ctas.map((cta, i) => (
              <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                {cta.texto}
                {cta.arrow && <span className="btn-arrow"> →</span>}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. META-BAR */}
      <section className="event-meta-bar" aria-label="Informações principais do evento">
        <div className="container">
          <div className="event-meta-bar-grid fade-in">
            {evento.metas.map((meta, i) => (
              <div key={i} className="event-meta-item">
                <span className="label">{meta.label}</span>
                <span className="value">{meta.value}</span>
                <span className="value-sub">{meta.valueSub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SUBNAV (client) */}
      <EventoSubnav
        links={evento.navLinks}
        folderHref={folderCta?.href ?? "#"}
        folderCmsLink={folderCta?.cmsLink ?? "folder"}
        inscricaoCmsLink={inscricaoCmsLink}
        agendaIcs={evento.agendaIcs}
      />

      {/* 5. EVENT-LAYOUT (2-col grid) */}
      <section className="event-layout">
        <div className="container">
          <div className="event-layout-grid">
            <div className="event-main-content">
              {/* 5.1 VISÃO GERAL */}
              {(evento.visaoGeral.lede.trim() !== "" ||
                evento.visaoGeral.paragrafos.length > 0) && (
                <article className="event-section fade-in" id="visao-geral">
                  <p className="eyebrow">{evento.visaoGeral.eyebrow}</p>
                  <h2>{evento.visaoGeral.h2}</h2>
                  <p className="lede-block">{evento.visaoGeral.lede}</p>
                  {evento.visaoGeral.paragrafos.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                </article>
              )}

              {/* 5.2 PÚBLICO */}
              {(evento.publico.intro.trim() !== "" ||
                evento.publico.chips.length > 0) && (
                <article className="event-section fade-in" id="publico">
                  <p className="eyebrow">{evento.publico.eyebrow}</p>
                  <h2>{evento.publico.h2}</h2>
                  <p>{evento.publico.intro}</p>
                  <div className="audience-chips">
                    {evento.publico.chips.map((chip, i) => (
                      <span key={i}>{chip.texto}</span>
                    ))}
                  </div>
                </article>
              )}

              {/* 5.3 OBJETIVOS (sem id) */}
              {evento.objetivos.objetivos.length > 0 && (
                <article className="event-section fade-in">
                  <p className="eyebrow">{evento.objetivos.eyebrow}</p>
                  <h2>{evento.objetivos.h2}</h2>
                  <ol className="objective-list">
                    {evento.objetivos.objetivos.map((o, i) => (
                      <li key={i}>{o.texto}</li>
                    ))}
                  </ol>
                </article>
              )}

              {/* 5.4 CONTEÚDO PROGRAMÁTICO (sem id) */}
              {(evento.conteudoProgramatico.intro.trim() !== "" ||
                evento.conteudoProgramatico.itens.length > 0) && (
                <article className="event-section fade-in">
                  <p className="eyebrow">{evento.conteudoProgramatico.eyebrow}</p>
                  <h2>{evento.conteudoProgramatico.h2}</h2>
                  <p>{evento.conteudoProgramatico.intro}</p>
                  <div className="program-content">
                    {evento.conteudoProgramatico.itens.map((item, i) => (
                      <div key={i} className="program-content-item">
                        <span className="num">{item.num}</span>
                        <span className="text">{item.texto}</span>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 5.5 PROGRAMAÇÃO */}
              {evento.programacao.dias.length > 0 && (
                <article className="event-section fade-in" id="programacao">
                  <p className="eyebrow">{evento.programacao.eyebrow}</p>
                  <h2>{evento.programacao.h2}</h2>
                  <p>{evento.programacao.intro}</p>
                  {evento.programacao.dias.map((dia, i) => (
                    <div key={i} className="schedule-day">
                      <div className="schedule-day-head">
                        <span className="date-big">{dia.dateBig}</span>
                        <span className="date-sub">{dia.dateSub}</span>
                        <span className="day-tag">{dia.dayTag}</span>
                      </div>
                      <div className="schedule-rows">
                        {dia.rows.map((row, j) => (
                          <div key={j} className="schedule-row">
                            <span className="time">{row.time}</span>
                            <div className="activity">
                              <strong>{row.titulo}</strong>
                              <span>{row.descricao}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </article>
              )}

              {/* 5.6 QUESTÕES FORMATIVAS (online) */}
              {evento.questoes && evento.questoes.grupos.length > 0 && (
                <article className="event-section fade-in" id="questoes">
                  <p className="eyebrow">{evento.questoes.eyebrow}</p>
                  <h2>{evento.questoes.h2}</h2>
                  <p>{evento.questoes.intro}</p>
                  {evento.questoes.grupos.map((grupo, i) => (
                    <div key={i} className="event-questoes-grupo">
                      <div className="event-questoes-head">
                        <span className="event-questoes-sessao">{grupo.sessao}</span>
                        <h3 className="event-questoes-titulo">{grupo.titulo}</h3>
                        <span className="event-questoes-palestrante">{grupo.palestrante}</span>
                      </div>
                      {grupo.questoes.map((q, j) => (
                        <div key={j} className="event-questoes-item">
                          <span className="event-questoes-num">{q.numero}</span>
                          <span className="event-questoes-pergunta">{q.pergunta}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="event-questoes-pratica">
                    <h4>{evento.questoes.naPratica.titulo}</h4>
                    <ul>
                      {evento.questoes.naPratica.itens.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              )}

              {/* 5.7 PALESTRANTES */}
              {evento.palestrantes.palestrantes.length > 0 && (
                <article className="event-section fade-in" id="palestrantes">
                  <p className="eyebrow">{evento.palestrantes.eyebrow}</p>
                  <h2>{evento.palestrantes.h2}</h2>
                  <p>{evento.palestrantes.intro}</p>
                  <div className="speakers-detailed">
                    {evento.palestrantes.palestrantes.map((p, i) => (
                      <article key={i} className="speaker-detail-card">
                        <div className="speaker-detail-portrait">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.foto} alt={p.nome} loading="lazy" />
                        </div>
                        <div className="speaker-detail-info">
                          <span className="role">{p.role}</span>
                          <h3>{p.nome}</h3>
                          <p className="cred">{p.credenciais}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                  <p
                    className="placeholder-note"
                    style={{ marginTop: "var(--space-3)", textAlign: "left" }}
                  >
                    {evento.palestrantes.nota}
                  </p>
                </article>
              )}

              {/* 5.8 DIFERENCIAIS (sem id) */}
              {evento.diferenciais.diferenciais.length > 0 && (
                <article className="event-section fade-in">
                  <p className="eyebrow">{evento.diferenciais.eyebrow}</p>
                  <h2>{evento.diferenciais.h2}</h2>
                  <div className="event-differentials">
                    {evento.diferenciais.diferenciais.map((d, i) => (
                      <div key={i} className="event-diff-card">
                        <span className="diff-num">{d.num}</span>
                        <div className="diff-body">
                          <h4>{d.titulo}</h4>
                          <p>{d.descricao}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 5.9 PLATAFORMA EVENTON (online) */}
              {evento.plataforma && evento.plataforma.cards.length > 0 && (
                <article className="event-section fade-in" id="plataforma">
                  <p className="eyebrow">{evento.plataforma.eyebrow}</p>
                  <h2>{evento.plataforma.h2}</h2>
                  <p>{evento.plataforma.lede}</p>
                  <div className="eventon-platform-stats">
                    {evento.plataforma.stats.map((stat, i) => (
                      <div key={i} className="eventon-stat">
                        <span className="eventon-stat-num">{stat.numero}</span>
                        <span className="eventon-stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="eventon-platform-grid">
                    {evento.plataforma.cards.map((card, i) => (
                      <div key={i} className="eventon-platform-card">
                        <h4>{card.titulo}</h4>
                        <p>{card.descricao}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 5.10 REPLAY E CERTIFICAÇÃO (sem id) */}
              {evento.replayCert.cards.length > 0 && (
                <article className="event-section fade-in">
                  <p className="eyebrow">{evento.replayCert.eyebrow}</p>
                  <h2>{evento.replayCert.h2}</h2>
                  <div className="replay-cert-grid">
                    {evento.replayCert.cards.map((card, i) => (
                      <div key={i} className="replay-cert-card">
                        <span className="icon-line" aria-hidden="true">{card.icone}</span>
                        <h4>{card.titulo}</h4>
                        <p>{card.descricao}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}

              {/* 5.11 INVESTIMENTO (preço + inclui + modalidades + regras) */}
              {(evento.investimento.rules.length > 0 ||
                evento.investimento.precoDestaque ||
                (evento.investimento.modalidades?.length ?? 0) > 0) && (
                <article className="event-section fade-in" id="investimento">
                  <p className="eyebrow">{evento.investimento.eyebrow}</p>
                  <h2 id={evento.investimento.h2Id}>{evento.investimento.h2}</h2>

                  {evento.investimento.precoDestaque && (
                    <div className="event-invest-price">
                      <strong>{evento.investimento.precoDestaque.valor}</strong>
                      <span>{evento.investimento.precoDestaque.legenda}</span>
                    </div>
                  )}

                  {evento.investimento.inclui && (
                    <>
                      <h4 style={{ marginTop: "var(--space-3)" }}>
                        {evento.investimento.inclui.titulo}
                      </h4>
                      <ul className="rules-list">
                        {evento.investimento.inclui.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {evento.investimento.modalidades &&
                    evento.investimento.modalidades.length > 0 && (
                      <div className="event-invest-modalidades">
                        {evento.investimento.modalidades.map((mod, i) => (
                          <div key={i} className="event-invest-modalidade">
                            <span className="rotulo">{mod.rotulo}</span>
                            <h4>{mod.titulo}</h4>
                            <p>{mod.descricao}</p>
                          </div>
                        ))}
                      </div>
                    )}

                  {evento.investimento.rules.length > 0 && (
                    <ul className="rules-list" style={{ marginTop: "var(--space-4)" }}>
                      {evento.investimento.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  )}
                </article>
              )}

              {/* 5.12 FAQ */}
              {evento.faq.faqs.length > 0 && (
                <article className="event-section fade-in" id="faq">
                  <p className="eyebrow">{evento.faq.eyebrow}</p>
                  <h2>{evento.faq.h2}</h2>
                  <div className="faq-list">
                    <FaqEvento itens={evento.faq.faqs} />
                  </div>
                </article>
              )}

              {/* 5.13 CTA FINAL (sem id) */}
              {(evento.ctaFinal.h2.trim() !== "" ||
                evento.ctaFinal.paragrafo.trim() !== "" ||
                evento.ctaFinal.ctas.length > 0) && (
                <article
                  className="event-section fade-in"
                  style={{ textAlign: "center", paddingTop: "var(--space-6)" }}
                >
                  <p className="eyebrow gold">{evento.ctaFinal.eyebrowGold}</p>
                  <h2 style={{ maxWidth: "720px", margin: "0 auto var(--space-3)" }}>
                    {evento.ctaFinal.h2}
                  </h2>
                  <p style={{ maxWidth: "640px", margin: "0 auto var(--space-4)" }}>
                    {evento.ctaFinal.paragrafo}
                  </p>
                  <div
                    style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}
                  >
                    {evento.ctaFinal.ctas.map((cta, i) => (
                      <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                        {cta.texto}
                        {cta.arrow && <span className="btn-arrow"> →</span>}
                      </a>
                    ))}
                  </div>
                </article>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="event-sidebar" aria-label="Card de inscrição">
              <div className="sidebar-card">
                <div className="sidebar-card-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={evento.sidebar.coverImg} alt={evento.titulo} loading="lazy" />
                  <span className="sidebar-card-status">{evento.sidebar.status}</span>
                </div>
                <div className="sidebar-card-body">
                  <h3>{evento.sidebar.tituloCard}</h3>
                  <div className="sidebar-rows">
                    {evento.sidebar.rows.map((row, i) => (
                      <div key={i} className={`sidebar-row${row.price ? " price" : ""}`}>
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sidebar-includes">
                  <h4>{evento.sidebar.includes.titulo}</h4>
                  <ul>
                    {evento.sidebar.includes.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <CountdownSidebar
                  label={evento.sidebar.countdown.label}
                  dateText={evento.sidebar.countdown.dateText}
                  deadline={evento.sidebar.countdown.deadline}
                  tipo={evento.sidebar.countdown.tipo}
                />
                <div className="sidebar-actions">
                  {evento.sidebar.acoes.map((acao, i) => (
                    <a key={i} className={acao.classe} href={acao.href} data-cms-link={acao.cmsLink}>
                      {acao.texto}
                      {acao.arrow && <span className="btn-arrow"> →</span>}
                    </a>
                  ))}
                </div>
                <div className="sidebar-share">
                  <span style={{ color: "var(--prata)", marginRight: "4px" }}>
                    {evento.sidebar.share.label}
                  </span>
                  {evento.sidebar.share.links.map((link, i) => (
                    <a key={i} href={link.href} data-cms-link={link.cmsLink}>
                      {link.texto}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 6. RELATED EVENTS */}
      {evento.relatedEvents.cards.length > 0 && (
        <section
          className="related-events-section"
          aria-label={`Outros eventos da vertical ${
            evento.area === "edu" ? "NTC Educação"
              : evento.area === "gov" ? "NTC Gestão Pública"
                : "NTC Saúde"
          }`}
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">{evento.relatedEvents.eyebrowGold}</p>
              <h2>{evento.relatedEvents.h2}</h2>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: evento.relatedEvents.intro }}
              />
            </div>
            <div className="related-events-grid fade-in">
              {evento.relatedEvents.cards.map((card, i) => (
                <article key={i} className="event-secondary-card" data-area={card.area}>
                  <div className="es-cover">
                    <div
                      className="es-cover-img"
                      aria-hidden="true"
                      style={{ backgroundImage: `url('${card.coverImg}')` }}
                    />
                    <div className="es-cover-overlay" />
                    {card.date.tipo === "range" ? (
                      <div className="es-date range">
                        <span className="days">
                          {card.date.daysStart}
                          <span className="dash">{card.date.dash}</span>
                          {card.date.daysEnd}
                        </span>
                        <span className="mon-yr">{card.date.monYr}</span>
                      </div>
                    ) : (
                      <div className="es-date multi">
                        <span className="count">
                          <span className="number">{card.date.number}</span> {card.date.count}
                        </span>
                        <span className="period">{card.date.period}</span>
                      </div>
                    )}
                  </div>
                  <div className="es-body">
                    <div>
                      <p className="es-program">{card.program}</p>
                      <h4 className="es-title">{card.titulo}</h4>
                      <p
                        className="es-program-binding"
                        dangerouslySetInnerHTML={{
                          __html: `Integra o programa <strong>${card.programBinding}</strong>`,
                        }}
                      />
                    </div>
                    <div className="es-meta-row">
                      <span
                        className="es-meta"
                        dangerouslySetInnerHTML={{ __html: card.metaHtml }}
                      />
                    </div>
                    <a className={card.cta.classe} href={card.cta.href} data-cms-link={card.cta.cmsLink}>
                      {card.cta.texto}
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "var(--space-2)",
                marginTop: "var(--space-5)",
                flexWrap: "wrap",
              }}
            >
              {evento.relatedEvents.footerCtas.map((cta, i) => (
                <a key={i} className={cta.classe} href={cta.href} data-cms-link={cta.cmsLink}>
                  {cta.texto}
                  {cta.arrow && <span className="btn-arrow"> →</span>}
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

- [ ] **Step 2: Rodar typecheck**

Run: `pnpm typecheck`
Expected: PASS. (Componente ainda não importado pelo page.tsx — `noUnusedLocals` não dispara em exports.)

- [ ] **Step 3: Rodar lint**

Run: `pnpm lint`
Expected: PASS sem novos warnings (os `eslint-disable-next-line @next/next/no-img-element` cobrem os `<img>`, igual ao Presencial).

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(capacitacao)/agenda/[slug]/EventoOnlineLayout.tsx"
git commit -m "$(cat <<'EOF'
feat(agenda): adiciona EventoOnlineLayout (espelho do presencial sem local)

Inclui as duas secoes exclusivas do online (questoes formativas, plataforma
EventON) e o bloco de investimento com preco, inclui e modalidades.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Ligar o `EventoOnlineLayout` no `page.tsx`

**Files:**
- Modify: `apps/web/app/(capacitacao)/agenda/[slug]/page.tsx`

- [ ] **Step 1: Importar o layout**

Após a linha `import { EventoPresencialLayout } from "./EventoPresencialLayout";` (linha 7), adicionar:

```ts
import { EventoOnlineLayout } from "./EventoOnlineLayout";
```

- [ ] **Step 2: Substituir o `notFound()` do case online**

Localizar (linhas 66-68):

```ts
    case "online":
      // TODO: implementar EventoOnlineLayout em sessões futuras
      notFound();
```

Substituir por:

```ts
    case "online":
      return <EventoOnlineLayout evento={evento} />;
```

- [ ] **Step 3: Atualizar o comentário do docblock**

Localizar (linha 49) o comentário `* Slugs online caem em notFound() até que EventoOnlineLayout seja portado.` e substituir por:

```ts
 * Online usa EventoOnlineLayout (sem `local`, com Plataforma e Questões).
```

- [ ] **Step 4: Rodar typecheck**

Run: `pnpm typecheck`
Expected: PASS. O `switch` em `evento.formato` agora é exaustivo (`presencial`/`hibrido` → Presencial; `online` → Online). O `evento` no case online é estreitado para `EventoOnline`.

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

### Task 6: Validação (build + dev server + checkpoint visual)

**Files:** nenhum (verificação).

- [ ] **Step 1: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: ambos PASS.

- [ ] **Step 2: Build de produção**

Run: `pnpm build`
Expected: PASS. `generateStaticParams` já inclui as chaves de `EVENTOS_AGENDA`, então `/agenda/edutec-m01-2026` é gerado estaticamente. (Memory `feedback_build_pega_a_rota_interna`: o build pega `<a>` para rota interna que o typecheck não pega — se acusar, é num href interno; converter para `<Link>` ou ajustar. O layout usa `<a>` com `data-cms-link` literais do protótipo de evento, padrão já aceito no Presencial — não deve acusar.)

- [ ] **Step 3: Subir dev server (background)**

Run (background): `pnpm next dev --port 3000`
(NÃO `pnpm dev` — turbo não propaga logs dos sub-processos.)

- [ ] **Step 4: Smoke HTTP**

Run: `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/agenda/edutec-m01-2026`
Expected: `200`.

Run (negativo, garante que online não quebrou roteamento): `curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3000/agenda/prosus-brasilia`
Expected: `200` (presencial continua funcionando).

- [ ] **Step 5: Checkpoint visual humano**

Pedir ao usuário para abrir `http://localhost:3000/agenda/edutec-m01-2026` e comparar **lado a lado com o folder PDF**. Checklist:
- Hero com tags (Inscrições abertas / Online ao vivo / NTC Educação) e binding para EDUTEC.
- Meta-bar: Quando 15 Jun, Online ao vivo · EventON, 8h, R$ 1.470, Sob proposta.
- Subnav sticky destaca seção ao rolar; tem "O que você aprenderá" e "Plataforma".
- Visão geral, Público (6 chips), Objetivo, Destaques (7), Programação (4 sessões).
- Questões: 4 grupos, numeração 01→29 contínua, bloco "Na prática" (6 itens).
- Palestrantes: 3 cards (fotos vazias OK), bios completas.
- Diferenciais: 6 razões.
- Plataforma EventON: stats 5.000 / 30 FPS / 100% + 6 cards.
- Replay/Certificação: 2 cards.
- Investimento: R$ 1.470,00 + "a inscrição inclui" (5) + 3 modalidades + regras. **Sem dados bancários.**
- FAQ: accordion abre/fecha (6 perguntas).
- CTA final + sidebar (countdown para 15/06, "Adicionar à agenda" baixa .ics).
- **Seção Local NÃO aparece.**
- `.fade-in` aparece ao rolar (InteracoesScroll ativo).

- [ ] **Step 6: Após aprovação humana — encerrar dev server e relatar**

Encerrar o processo do dev server. Resumir a sessão (até 10 linhas, CLAUDE.md §8.7) e listar pendências (fotos dos palestrantes a subir; cards de related events vazios por ora).

---

## Self-Review (executado na escrita do plano)

**1. Spec coverage:**
- EventoOnlineLayout criado → Task 4. ✓
- page.tsx case online → Task 5. ✓
- 2 tipos novos + EventoOnline estendido → Task 1. ✓
- Evento edutec-m01-2026 cadastrado → Task 3. ✓
- CSS estendido → Task 2. ✓
- Plataforma EventON (stats + 6 cards) → Task 3 (dados) + 4 (render) + 2 (CSS). ✓
- 29 questões + naPratica → Task 3 (dados) + 4 (render) + 2 (CSS). ✓
- Preço + 3 modalidades, sem banco → Task 3 (investimento) + 4 (render). ✓
- Fotos vazias + TODO → Task 3. ✓
- Validação visual humana contra PDF → Task 6. ✓

**2. Placeholder scan:** sem "TBD"/"implementar depois". Todo código está literal. As únicas strings `// TODO` são intencionais (fotos sobem depois) e fazem parte da entrega.

**3. Type consistency:**
- `SecaoPlataforma { eyebrow, h2, lede, stats[], cards[] }` — usada igual em Task 1, 3, 4. ✓
- `SecaoQuestoes { eyebrow, h2, intro, grupos[], naPratica }` — igual em 1, 3, 4. ✓
- `GrupoQuestoes { sessao, titulo, palestrante, questoes[] }` — igual. ✓
- `QuestaoFormativa { numero, pergunta }` — igual. ✓
- `ModalidadeContratacao { rotulo, titulo, descricao }` — igual. ✓
- `SecaoInvestimento` com `precoDestaque`/`inclui`/`modalidades` opcionais — definido em Task 1, preenchido em 3, lido em 4. ✓
- `EventoOnline.plataforma?`/`.questoes?` opcionais — adapter CMS (`eventos.ts:336`) não preenche, layout guarda com `evento.plataforma &&`. ✓

Plano consistente. Pronto para execução.
