// =============================================================
//  CONTEÚDO LITERAL DE EVENTOS DE /AGENDA/[SLUG]
//  Tipos genéricos compartilháveis para EventoPresencial, EventoHibrido
//  e EventoOnline. Cada evento é uma entrada de EVENTOS_AGENDA.
//
//  Este arquivo é a fonte estática até a coleção Evento entrar no Payload.
//  Fidelidade 100% ao protótipo HTML correspondente (sem rephrasing).
// =============================================================

// ----------------- Discriminators -----------------

export type FormatoEvento = "presencial" | "hibrido" | "online";
export type AreaVertical = "edu" | "gov" | "sau";

// ----------------- Tipos compartilhados básicos -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  classe?: string;
  arrow?: boolean;
}

export interface CrumbItemEvento {
  texto: string;
  href?: string;
  cmsLink?: string;
  current?: boolean;
}

export interface EventoMeta {
  label: string;
  value: string;
  valueSub: string;
}

export interface NavLink {
  texto: string;
  href: string;
  isActive?: boolean;
}

export interface AudienceChip { texto: string; }
export interface ItemObjetivo { texto: string; }

export interface ProgramContentItem {
  num: string;
  texto: string;
}

export interface ScheduleRow {
  time: string;
  titulo: string;
  descricao: string;
}

export interface ScheduleDay {
  dateBig: string;
  dateSub: string;
  dayTag: string;
  rows: ScheduleRow[];
}

export interface Palestrante {
  foto: string;
  role: string;
  nome: string;
  credenciais: string;
}

export interface Diferencial {
  num: string;
  titulo: string;
  descricao: string;
}

export interface ReplayCertCard {
  icone: string;
  titulo: string;
  descricao: string;
}

export interface ItemFaqEvento {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export type RelatedEventDate =
  | { tipo: "range"; daysStart: string; dash: string; daysEnd: string; monYr: string }
  | { tipo: "multi"; count: string; number: string; period: string }
  | { tipo: "single"; day: string; monYr: string };

export interface RelatedEventCard {
  area: AreaVertical;
  coverImg: string;
  date: RelatedEventDate;
  program: string;
  titulo: string;
  programBinding: string;
  metaHtml: string;
  cta: LinkInterno;
}

export interface SidebarCard {
  coverImg: string;
  status: string;
  tituloCard: string;
  rows: Array<{ label: string; value: string; price?: boolean }>;
  includes: { titulo: string; items: string[] };
  countdown: {
    label: string;
    dateText: string;
    deadline: string;
    tipo: "numerico" | "textual";
  };
  acoes: LinkInterno[];
  share: { label: string; links: LinkInterno[] };
}

// ----------------- Hero -----------------

export interface HeroEvento {
  tags: Array<{
    texto: string;
    classe: "event-hero-status" | "event-hero-format" | "event-hero-vert";
  }>;
  h1: string;
  sub: string;
  programBinding: {
    texto: string;
    href: string;
    cmsLink?: string;
    nomePrograma: string;
  };
  ctas: LinkInterno[];
}

// ----------------- Sub-seções editoriais -----------------

export interface SecaoVisaoGeral {
  eyebrow: string;
  h2: string;
  lede: string;
  paragrafos: string[];
}

export interface SecaoPublico {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: AudienceChip[];
}

export interface SecaoObjetivos {
  eyebrow: string;
  h2: string;
  objetivos: ItemObjetivo[];
}

export interface SecaoConteudoProgramatico {
  eyebrow: string;
  h2: string;
  intro: string;
  itens: ProgramContentItem[];
}

export interface SecaoProgramacao {
  eyebrow: string;
  h2: string;
  intro: string;
  dias: ScheduleDay[];
}

export interface SecaoPalestrantes {
  eyebrow: string;
  h2: string;
  intro: string;
  palestrantes: Palestrante[];
  nota: string;
}

export interface SecaoDiferenciais {
  eyebrow: string;
  h2: string;
  diferenciais: Diferencial[];
}

export interface SecaoLocal {
  eyebrow: string;
  h2: string;
  venueInfo: {
    titulo: string;
    enderecoLinhas: string[];
    meta: string;
    hospedagemHtml: string;
  };
  mapLabel: string;
  pinLabel: string;
}

export interface SecaoReplayCert {
  eyebrow: string;
  h2: string;
  cards: ReplayCertCard[];
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  h2Id?: string;
  rules: string[];
}

export interface SecaoFaq {
  eyebrow: string;
  h2: string;
  faqs: ItemFaqEvento[];
}

export interface SecaoCtaFinal {
  eyebrowGold: string;
  h2: string;
  paragrafo: string;
  ctas: LinkInterno[];
}

export interface SecaoRelatedEvents {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedEventCard[];
  footerCtas: LinkInterno[];
}

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
  headDayHtml: string;       // "15 de <em>Junho</em> · Segunda-feira"
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

// ----------------- Evento Base + variantes discriminadas -----------------

export interface EventoBase {
  slug: string;
  titulo: string;
  subtitulo: string;
  formato: FormatoEvento;
  dataEvento: string;
  area: AreaVertical;
  crumb: CrumbItemEvento[];
  hero: HeroEvento;
  metas: EventoMeta[];
  navLinks: NavLink[];
  visaoGeral: SecaoVisaoGeral;
  publico: SecaoPublico;
  objetivos: SecaoObjetivos;
  conteudoProgramatico: SecaoConteudoProgramatico;
  programacao: SecaoProgramacao;
  palestrantes: SecaoPalestrantes;
  diferenciais: SecaoDiferenciais;
  replayCert: SecaoReplayCert;
  investimento: SecaoInvestimento;
  faq: SecaoFaq;
  ctaFinal: SecaoCtaFinal;
  sidebar: SidebarCard;
  relatedEvents: SecaoRelatedEvents;
  agendaIcs: {
    titulo: string;
    descricao: string;
    location: string;
    startISO: string;
    endISO: string;
    filename: string;
  };
}

export interface EventoPresencial extends EventoBase {
  formato: "presencial";
  local: SecaoLocal;
}

export interface EventoHibrido extends EventoBase {
  formato: "hibrido";
  local: SecaoLocal;
}

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

export type Evento = EventoPresencial | EventoHibrido | EventoOnline;

// ----------------- Evento: PROSUS Brasília 2026 (presencial) -----------------
// Porta literal de 03_Pagina_Evento_PROSUS_Brasilia_v3.html

const eventoProsusBrasilia: EventoPresencial = {
  slug: "prosus-brasilia",

  titulo: "Governança, financiamento e performance no SUS — Edição 2026",

  subtitulo:
    "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",

  formato: "presencial",

  dataEvento: "5 a 7 de junho de 2026",

  area: "sau",

  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    {
      texto: "Eventos presenciais",
      href: "/capacitacao/agenda",
      cmsLink: "eventos-presenciais",
    },
    { texto: "Seminário PROSUS+ · Brasília", current: true },
  ],

  hero: {
    tags: [
      { texto: "Últimas vagas", classe: "event-hero-status" },
      { texto: "Seminário", classe: "event-hero-format" },
      { texto: "Presencial · Brasília", classe: "event-hero-format" },
      { texto: "NTC Saúde", classe: "event-hero-vert" },
    ],
    h1: "Governança, financiamento e performance no SUS — Edição 2026",
    sub: "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",
    programBinding: {
      texto: "Integra o programa",
      href: "/#programas",
      cmsLink: "programa-PROSUS",
      nomePrograma:
        "PROSUS+ — Governança, Financiamento e Performance no SUS",
    },
    ctas: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Baixar folder",
        href: "#",
        cmsLink: "folder-PROSUS-2026-jun",
        classe: "btn btn--ghost-light",
      },
      {
        texto: "Inscrever equipe ou grupo",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "proposta-grupo-PROSUS",
        classe: "btn btn--ghost-light",
      },
    ],
  },

  metas: [
    { label: "Quando", value: "5 a 7 · Junho", valueSub: "2026 · 3 dias consecutivos" },
    { label: "Modalidade", value: "Presencial", valueSub: "Brasília · DF" },
    { label: "Carga horária", value: "20 horas", valueSub: "Programação executiva" },
    { label: "Inscrição individual", value: "R$ 2.890", valueSub: "Até 30 de maio" },
    { label: "Equipes / órgãos", value: "Sob consulta", valueSub: "Desconto institucional" },
  ],

  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "Local", href: "#local" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "Regras", href: "#regras" },
    { texto: "FAQ", href: "#faq" },
  ],

  // local, replayCert, investimento, faq,
  // ctaFinal, sidebar, relatedEvents, agendaIcs vêm em Task 6.
  visaoGeral: {
    eyebrow: "Resumo executivo",
    h2: "O encontro",
    lede: "Três dias intensivos em Brasília reunindo gestores estaduais e municipais de saúde sobre a nova arquitetura de governança e financiamento do SUS — com diagnóstico estruturado, modelos institucionais consolidados e construção de planos aplicados.",
    paragrafos: [
      `O Seminário PROSUS+ Brasília 2026 é a edição executiva do programa estratégico <strong>PROSUS+ — Governança, Financiamento e Performance no SUS</strong>. Reúne secretários estaduais e municipais, diretores de redes assistenciais, coordenadores de planejamento e lideranças técnicas para discutir, ao longo de três dias, os desafios contemporâneos da gestão do Sistema Único de Saúde.`,
      "A edição 2026 traz como eixos centrais a nova arquitetura de financiamento federal, os modelos de pagamento por performance, a articulação assistencial regional e o uso de tecnologia e dados para tomada de decisão. O formato presencial em Brasília favorece o networking executivo qualificado entre gestores de toda a federação.",
    ],
  },

  publico: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para lideranças com poder de decisão nas redes públicas de saúde:",
    chips: [
      { texto: "Secretários estaduais de saúde" },
      { texto: "Secretários municipais de saúde" },
      { texto: "Gestores de redes assistenciais" },
      { texto: "Diretores de hospitais públicos" },
      { texto: "Coordenadores de planejamento e financiamento" },
      { texto: "Lideranças técnicas do SUS" },
      { texto: "Gestores de UPA e UBS" },
      { texto: "Equipes de governo e assessoria estratégica" },
    ],
  },

  objetivos: {
    eyebrow: "O que entregamos",
    h2: "Objetivos do seminário",
    objetivos: [
      { texto: "Diagnosticar os principais desafios contemporâneos da governança do SUS, com leitura institucional e perspectiva de federação." },
      { texto: "Apresentar a nova arquitetura de financiamento federal e seus impactos diretos para gestões estaduais e municipais." },
      { texto: "Discutir indicadores de performance institucional aplicáveis à gestão da saúde pública e modelos de pagamento por resultado." },
      { texto: "Construir, com cada participante, um plano aplicado de governança e financiamento para sua instituição de origem." },
      { texto: "Promover networking executivo qualificado entre lideranças do SUS de diferentes regiões, esferas e perfis institucionais." },
    ],
  },

  conteudoProgramatico: {
    eyebrow: "Estrutura",
    h2: "Conteúdo programático",
    intro: "O conteúdo é distribuído em sete eixos temáticos complementares, articulados ao longo dos três dias:",
    itens: [
      { num: "01", texto: "Governança contemporânea do SUS — estrutura institucional, atores estratégicos e marcos regulatórios." },
      { num: "02", texto: "Financiamento da saúde pública — novos blocos, transferências federais e modelos de pagamento." },
      { num: "03", texto: "Performance institucional — indicadores, metas e metodologias de monitoramento." },
      { num: "04", texto: "Atenção primária e redes de cuidado — articulação assistencial e governança regional." },
      { num: "05", texto: "Tecnologia e dados em saúde — instrumentos de gestão e tomada de decisão baseada em evidências." },
      { num: "06", texto: "Estudos de caso brasileiros — boas práticas em estados e municípios de diferentes portes." },
      { num: "07", texto: "Construção dos planos institucionais — sessão prática orientada à aplicação dos conteúdos." },
    ],
  },

  programacao: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Três dias com programação executiva, almoços institucionais, mesas-redondas com gestores e construção orientada de planos institucionais.",
    dias: [
      {
        dateBig: "5 de junho",
        dateSub: "Quinta-feira · 2026",
        dayTag: "Dia 1",
        rows: [
          { time: "08:00 — 09:00", titulo: "Credenciamento e abertura institucional", descricao: "Boas-vindas pela Coordenação Científica e enquadramento dos três dias." },
          { time: "09:00 — 12:00", titulo: "Módulo 1 · Governança contemporânea do SUS", descricao: "Estrutura institucional, atores estratégicos e marcos regulatórios atualizados." },
          { time: "12:00 — 14:00", titulo: "Almoço institucional", descricao: "Networking executivo orientado por mesas temáticas." },
          { time: "14:00 — 17:00", titulo: "Módulo 2 · Financiamento da saúde pública", descricao: "Novos blocos, transferências federais e modelos de pagamento." },
          { time: "17:00 — 18:00", titulo: "Mesa-redonda · Secretários estaduais", descricao: "Diálogo entre gestores estaduais sobre desafios e soluções de governança." },
        ],
      },
      {
        dateBig: "6 de junho",
        dateSub: "Sexta-feira · 2026",
        dayTag: "Dia 2",
        rows: [
          { time: "09:00 — 12:00", titulo: "Módulo 3 · Performance institucional e indicadores", descricao: "Indicadores, metas e metodologias de monitoramento aplicáveis à gestão da saúde." },
          { time: "12:00 — 14:00", titulo: "Almoço institucional", descricao: "Networking executivo continuado." },
          { time: "14:00 — 17:00", titulo: "Módulo 4 · Atenção primária e redes de cuidado", descricao: "Articulação assistencial regional e governança das redes públicas." },
          { time: "17:00 — 18:00", titulo: "Estudo de caso · Sistema estadual", descricao: "Apresentação de experiência institucional consolidada e debate aberto." },
        ],
      },
      {
        dateBig: "7 de junho",
        dateSub: "Sábado · 2026",
        dayTag: "Dia 3",
        rows: [
          { time: "09:00 — 12:00", titulo: "Módulo 5 · Tecnologia e dados em saúde", descricao: "Instrumentos de gestão e tomada de decisão baseada em evidências." },
          { time: "12:00 — 13:00", titulo: "Construção dos planos institucionais", descricao: "Sessão prática orientada à aplicação dos conteúdos nas instituições dos participantes." },
          { time: "13:00 — 14:00", titulo: "Encerramento · Almoço de rede", descricao: "Síntese, próximos passos e construção de comunidade entre participantes." },
        ],
      },
    ],
  },

  palestrantes: {
    eyebrow: "Quem ensina",
    h2: "Coordenação científica e especialistas",
    intro: "Coordenação dedicada à edição, com participação de especialistas convidados de diferentes regiões e instituições do SUS.",
    palestrantes: [
      {
        foto: "/img/fotos/_optimized/expert-04.1920.webp",
        role: "Coordenação Científica",
        nome: "NTC Saúde",
        credenciais: "Direção científica do programa PROSUS+ · Especialista em gestão do SUS, governança digital e financiamento da saúde pública.",
      },
      {
        foto: "/img/fotos/_optimized/expert-03.1920.webp",
        role: "Especialista convidado",
        nome: "Financiamento federal",
        credenciais: "Atuação em transferências federais, blocos de financiamento e modelos de pagamento por performance no SUS.",
      },
      {
        foto: "/img/fotos/_optimized/expert-02.1920.webp",
        role: "Especialista convidada",
        nome: "Atenção primária e redes",
        credenciais: "Trajetória em coordenação de redes de cuidado, articulação regional e fortalecimento da APS.",
      },
    ],
    nota: "Nomes, fotos e currículos completos dos especialistas confirmados serão publicados via CMS.",
  },

  diferenciais: {
    eyebrow: "Por que participar",
    h2: "Diferenciais do seminário",
    diferenciais: [
      { num: "01", titulo: "Encontro presencial qualificado", descricao: "Reúne gestores de toda a federação em formato executivo dedicado a tomadores de decisão." },
      { num: "02", titulo: "Conteúdo aplicado à realidade do SUS", descricao: "Cada eixo temático parte de problemas concretos da Administração Pública brasileira em saúde." },
      { num: "03", titulo: "Construção de plano institucional", descricao: "Cada participante constrói um plano aplicado para sua instituição de origem ao longo dos três dias." },
      { num: "04", titulo: "Networking executivo orientado", descricao: "Almoços institucionais com mesas temáticas curadas e tempo dedicado a relacionamentos estratégicos." },
      { num: "05", titulo: "Material editorial completo", descricao: "Cadernos institucionais NTC com conteúdo programático, leituras complementares e templates aplicáveis." },
      { num: "06", titulo: "Replay e certificado", descricao: "Acesso ao replay da edição por 90 dias após o evento, no EventOn, com certificado validável." },
    ],
  },
  local: {
    eyebrow: "Onde acontece",
    h2: "Local do seminário",
    venueInfo: {
      titulo: "Hotel sede · Brasília · DF",
      enderecoLinhas: [
        "Setor Hoteleiro Sul · Asa Sul",
        "Brasília · Distrito Federal",
        "Endereço completo confirmado nos e-mails de credenciamento",
      ],
      meta: "Estacionamento institucional · Fácil acesso ao Eixo Monumental · 15 min do Aeroporto JK",
      hospedagemHtml: "A NTC tem desconto institucional negociado com hotéis-rede em Brasília. Após a confirmação da inscrição, os participantes recebem orientações de hospedagem e logística.",
    },
    mapLabel: "Brasília · DF · Asa Sul",
    pinLabel: "Brasília · DF · Asa Sul",
  },

  replayCert: {
    eyebrow: "Acesso pós-evento",
    h2: "Replay e certificação",
    cards: [
      {
        icone: "↻",
        titulo: "Replay da edição",
        descricao: "Disponível por 90 dias após o evento na plataforma EventOn, exclusivo para participantes inscritos. Acesso por login institucional.",
      },
      {
        icone: "⌬",
        titulo: "Certificado validável",
        descricao: "Emissão automática 7 dias após o evento, mediante presença mínima de 75%. Validação pública por código QR na plataforma.",
      },
    ],
  },

  investimento: {
    eyebrow: "Política comercial",
    h2: "Regras de inscrição e investimento",
    h2Id: "regras",
    rules: [
      "Inscrições abertas até 30 de maio de 2026 ou enquanto houver vagas disponíveis.",
      "Política de cancelamento sem ônus até 7 dias antes do início do evento.",
      "Desconto institucional de 10% para grupos de 3 a 5 participantes da mesma instituição.",
      "Para inscrição de equipes acima de 5 participantes, condição comercial dedicada — solicitar proposta para grupo.",
      "Pagamento via PIX, boleto, cartão de crédito (até 6× sem juros) ou empenho institucional para órgãos públicos.",
      "Para órgãos públicos: emissão de nota fiscal com CNPJ direto da instituição, conforme regras de empenho e contratação.",
      "Não inclui hospedagem nem deslocamento aéreo. Material editorial e almoços institucionais inclusos.",
      "Em caso de cancelamento pela NTC por força maior, reembolso integral em até 10 dias úteis.",
    ],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    h2: "FAQ",
    faqs: [
      {
        id: "evento-faq-1",
        pergunta: "O evento aceita inscrições de equipe?",
        respostaHtml: "<p>Sim. Equipes de 3 a 5 participantes da mesma instituição recebem desconto de 10%. Acima de 5 participantes, a NTC oferece condição comercial dedicada — basta solicitar proposta para grupo no botão lateral.</p>",
      },
      {
        id: "evento-faq-2",
        pergunta: "Como funciona a inscrição institucional para órgãos públicos?",
        respostaHtml: "<p>Para órgãos públicos, emitimos nota fiscal direta no CNPJ da instituição contratante. Aceitamos empenho, dispensa de licitação por valor (quando aplicável) e demais modalidades previstas em lei. A equipe comercial NTC apoia o trâmite.</p>",
      },
      {
        id: "evento-faq-3",
        pergunta: "Qual a política de cancelamento?",
        respostaHtml: "<p>Cancelamento sem ônus até 7 dias antes do início do evento. Após esse prazo, o valor pode ser convertido em crédito para outra edição ou outro evento NTC dentro de 12 meses.</p>",
      },
      {
        id: "evento-faq-4",
        pergunta: "Como funciona o replay?",
        respostaHtml: "<p>Os participantes recebem acesso à gravação completa por 90 dias após o evento, no EventOn (plataforma própria do Grupo NTC). Acesso por login institucional individual, com proteção contra compartilhamento.</p>",
      },
      {
        id: "evento-faq-5",
        pergunta: "Como é emitido o certificado?",
        respostaHtml: "<p>O certificado é emitido automaticamente 7 dias após o término do evento, mediante presença mínima de 75% nas atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR.</p>",
      },
      {
        id: "evento-faq-6",
        pergunta: "A inscrição inclui hospedagem?",
        respostaHtml: "<p>Não. A inscrição inclui credenciamento, conteúdo dos três dias, material editorial NTC, almoços institucionais, replay e certificado. Hospedagem e deslocamento são por conta do participante. A NTC indica hotéis-rede com desconto institucional.</p>",
      },
      {
        id: "evento-faq-7",
        pergunta: "Como solicitar uma turma fechada para minha instituição?",
        respostaHtml: "<p>A NTC desenvolve turmas fechadas in company para secretarias, autarquias e órgãos públicos. O conteúdo pode ser entregue na sede da instituição ou em formato online dedicado. Solicite proposta institucional pelo botão lateral.</p>",
      },
    ],
  },

  ctaFinal: {
    eyebrowGold: "Próximo passo",
    h2: "Garanta sua participação no Seminário PROSUS+ Brasília 2026.",
    paragrafo: "Vagas limitadas. Inscrições abertas até 30 de maio de 2026 ou enquanto houver vagas disponíveis.",
    ctas: [
      {
        texto: "Inscrever-se agora",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "proposta-grupo-PROSUS",
        classe: "btn btn--secondary",
      },
    ],
  },

  sidebar: {
    coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
    status: "Últimas vagas",
    tituloCard: "Inscrição · Edição 2026",
    rows: [
      { label: "Quando", value: "5 a 7 · Junho · 2026" },
      { label: "Onde", value: "Brasília · DF" },
      { label: "Modalidade", value: "Presencial · 20 horas" },
      { label: "Individual", value: "R$ 2.890", price: true },
      { label: "Equipes / órgãos", value: "Sob consulta" },
    ],
    includes: {
      titulo: "O que está incluído",
      items: [
        "Conteúdo presencial dos 3 dias",
        "Material editorial NTC",
        "Almoços institucionais",
        "Replay por 90 dias no EventOn",
        "Certificado validável",
        "Networking executivo curado",
      ],
    },
    countdown: {
      label: "Prazo de inscrição",
      dateText: "Até 29 de Maio de 2026",
      deadline: "2026-05-29T23:59:59-03:00",
      tipo: "numerico",
    },
    acoes: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-PROSUS-2026-jun",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Inscrever equipe ou grupo institucional",
        href: "/contato?evento=PROSUS%2B+Brasília+–+Seminário&evento_url=/agenda/prosus-brasilia#tab-equipe",
        cmsLink: "inscricao-equipe-PROSUS",
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
    eyebrowGold: "Também na vertical",
    h2: "Outros eventos da NTC Saúde",
    intro: "Edições e módulos abertos vinculados aos programas <strong>PROSUS+</strong>, <strong>PROAPS+</strong> e <strong>SIGS</strong> nas próximas semanas.",
    cards: [
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "range", daysStart: "02", dash: "–", daysEnd: "03", monYr: "Jul · 2026" },
        program: "Simpósio · NTC Saúde",
        titulo: "Alta performance na atenção primária e redes de cuidado",
        programBinding: "PROAPS+",
        metaHtml: "Online · 16h · 2 dias <strong>R$ 1.490</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-PROAPS-2026-jul",
          classe: "es-cta",
        },
      },
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "multi", count: "encontros", number: "4", period: "Jul · 2026" },
        program: "Curso Executivo · NTC Saúde",
        titulo: "Saúde inteligente, dados e governança digital no SUS",
        programBinding: "SIGS",
        metaHtml: "Híbrido · DF · 24h <strong>R$ 2.290</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-SIGS-2026-jul",
          classe: "es-cta",
        },
      },
      {
        area: "sau",
        coverImg: "/img/fotos/_optimized/area-saude.1920.webp",
        date: { tipo: "range", daysStart: "14", dash: "–", daysEnd: "15", monYr: "Ago · 2026" },
        program: "Oficina · NTC Saúde",
        titulo: "Financiamento e indicadores de performance no SUS — fundamentos aplicados",
        programBinding: "PROSUS+",
        metaHtml: "Online · 16h · 2 dias <strong>R$ 1.690</strong>",
        cta: {
          texto: "Inscrever-se",
          href: "#contato",
          cmsLink: "inscricao-PROSUS-2026-ago",
          classe: "es-cta",
        },
      },
    ],
    footerCtas: [
      {
        texto: "Ver agenda completa",
        href: "/capacitacao",
        cmsLink: "agenda-completa",
        classe: "btn btn--primary",
        arrow: true,
      },
      {
        texto: "Solicitar proposta institucional",
        href: "/solucoes#contratacao-institucional",
        cmsLink: "proposta-institucional",
        classe: "btn btn--secondary",
      },
    ],
  },

  agendaIcs: {
    titulo: "Seminário PROSUS+ Brasília 2026",
    descricao: "Encontro executivo dedicado a secretários, gestores e lideranças do SUS sobre a nova arquitetura institucional, financeira e de performance do Sistema Único de Saúde.",
    location: "Setor Hoteleiro Sul · Asa Sul, Brasília · Distrito Federal",
    startISO: "20260605T120000Z",
    endISO: "20260607T210000Z",
    filename: "prosus-brasilia-2026.ics",
  },
};

// ----------------- Evento: EDUTEC Módulo 01 2026 (online) -----------------
// Porta do protótipo feito/04_Pagina_Evento_EDUTEC_M01_Online_v2.html (estrutura
// e dados) + textos longos do folder PDF (bios, 29 questões). Fotos: usuário sobe depois.

const eventoEdutecM01: EventoOnline = {
  slug: "edutec-m01-2026",
  titulo: "Cultura Digital, Educação Midiática e Transformação da Educação",
  subtitulo:
    "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
  formato: "online",
  dataEvento: "15 de junho de 2026",
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
    countdown: { label: "", dateText: "", deadline: "2026-06-15T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação",
    descricao: "Seminário On-Line ao Vivo do programa EDUTEC · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260615T080000",
    endISO: "20260615T180000",
    filename: "EDUTEC-M01-2026-jun.ics",
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
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-EDUTEC-M01", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M01", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "15 · Junho", valueSub: "2026 · Segunda-feira" },
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
    headDayHtml: "15 de <em>Junho</em> · Segunda-feira",
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
      { texto: "Inscrever-se agora", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M01", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 01 · Trilha EDUTEC",
    rows: [
      { label: "Quando", value: "15 · Jun · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "Sob consulta", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Material editorial NTC", "Certificado institucional", "Suporte técnico dedicado", "Área do Participante"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 15 de Junho de 2026", deadline: "2026-06-15T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+01&evento_url=/agenda/edutec-m01-2026", cmsLink: "inscricao-EDUTEC-M01-2026-jun", classe: "btn btn--gold", arrow: true },
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

// ----------------- Record exportado -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": eventoProsusBrasilia,
  "edutec-m01-2026": eventoEdutecM01,
};
