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
  bgUrl?: string;            // capa do hero; sobrescrita pelo override do CMS
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

// Metadados de listagem (cards da Home e da Agenda). Opcional: eventos sem
// `card` não entram nas listagens. O adapter (lib/eventos/adaptarParaCard.ts)
// deriva o resto (slug, titulo, area) do próprio evento.
export interface CardEvento {
  programaSlug: "EDUTEC" | "PROGE";
  formatoCard: "seminario" | "oficina" | "curso";
  cidade: string; // "" para online
  valorReais: number;
  deadlineIso: string; // "2026-06-15"
  keywords: string;
  flags: string[];
  imagemUrl: string;
  modalidadeLabel: string; // "Online ao vivo + replay"
  formatoLabel: string; // "Seminário"
  coordenacaoNomes: string;
  metaEssenciais: [string, string]; // ["8h · 1 dia", "Plataforma EventOn"]
  precoIndividualLabel: string; // "R$ 1.470"
  precoEquipesLabel: string; // "Sob consulta"
  destaqueHome: boolean;
  diaDataBloco: string; // "15"
  mesAnoDataBloco: string; // "Jun · 2026"
}

export interface EventoBase {
  slug: string;
  titulo: string;
  subtitulo: string;
  formato: FormatoEvento;
  dataEvento: string;
  area: AreaVertical;
  card?: CardEvento;
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
  card: {
    programaSlug: "EDUTEC",
    formatoCard: "seminario",
    cidade: "",
    valorReais: 1470,
    deadlineIso: "2026-06-15",
    keywords: "cultura digital educacao midiatica transformacao fluencia letramento",
    flags: ["destaque_editorial"],
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Roberta Aquino, Karla Priscilla e Mariana Ochs",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470",
    precoEquipesLabel: "Sob consulta",
    destaqueHome: true,
    diaDataBloco: "15",
    mesAnoDataBloco: "Jun · 2026",
  },

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

const eventoEdutecM02: EventoOnline = {
  slug: "edutec-m02-2026",
  titulo: "Fluência Digital Docente e Práticas Pedagógicas Inovadoras",
  subtitulo:
    "Formação prática e contemporânea para qualificar o uso pedagógico das tecnologias e ampliar o repertório metodológico dos educadores.",
  formato: "online",
  dataEvento: "16 de junho de 2026",
  area: "edu",
  card: {
    programaSlug: "EDUTEC",
    formatoCard: "seminario",
    cidade: "",
    valorReais: 1470,
    deadlineIso: "2026-06-16",
    keywords: "fluencia digital docente praticas pedagogicas inovadoras tecnologia",
    flags: ["destaque_editorial"],
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Roberta Aquino, Rebecca Rios e Bruno Reis",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470",
    precoEquipesLabel: "Sob consulta",
    destaqueHome: true,
    diaDataBloco: "16",
    mesAnoDataBloco: "Jun · 2026",
  },

  // Campos de EventoBase não usados pelo layout online (vazios):
  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário EDUTEC · Fluência Digital Docente", current: true },
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
      { id: "edutec-m02-faq-1", pergunta: "Como funciona o acesso ao EventON NTC?", respostaHtml: "Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo." },
      { id: "edutec-m02-faq-2", pergunta: "Por quanto tempo terei acesso ao replay?", respostaHtml: "O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual." },
      { id: "edutec-m02-faq-3", pergunta: "Como recebo o certificado?", respostaHtml: "O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR." },
      { id: "edutec-m02-faq-4", pergunta: "Posso inscrever minha equipe ou rede?", respostaHtml: "Sim. Equipes e órgãos públicos poderão solicitar condição comercial diferenciada conforme quantidade de inscritos, perfil institucional e forma de contratação. Solicite proposta pelo botão lateral." },
      { id: "edutec-m02-faq-5", pergunta: "A inscrição inclui materiais?", respostaHtml: "Sim. A inscrição inclui apostila digital específica do módulo-evento, certificado digital e acesso ao replay. Materiais enviados por e-mail e disponibilizados na plataforma EventON NTC." },
      { id: "edutec-m02-faq-6", pergunta: "Como contratar uma turma fechada para minha instituição?", respostaHtml: "A NTC desenvolve turmas fechadas para secretarias, autarquias e órgãos públicos. O Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas por escala, suporte operacional e replay. Solicite proposta institucional pelo botão lateral." },
      { id: "edutec-m02-faq-7", pergunta: "É possível compor a trilha completa EDUTEC?", respostaHtml: "Sim. Este Módulo 02 pode ser contratado de forma independente ou integrar a trilha EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Consulte a equipe comercial." },
    ],
  },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "", status: "", tituloCard: "", rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "2026-06-16T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário EDUTEC · Fluência Digital Docente e Práticas Pedagógicas Inovadoras",
    descricao: "Seminário On-Line ao Vivo do programa EDUTEC · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260616T080000",
    endISO: "20260616T180000",
    filename: "EDUTEC-M02-2026-jun.ics",
  },

  // ---- Seções evt-* (consumidas pelo EventoOnlineLayout) ----
  heroOnline: {
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1Html: "Fluência Digital Docente e <em>Práticas Pedagógicas</em> Inovadoras",
    sub: "Formação prática e contemporânea para qualificar o uso pedagógico das tecnologias e ampliar o repertório metodológico dos educadores.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma: "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-EDUTEC-M02", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M02", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "16 · Junho", valueSub: "2026 · Terça-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "R$ 1.470", valueSub: "por inscrito · individual" },
  ],

  visaoGeralOnline: {
    eyebrow: "Visão geral",
    h2Html: "Uma agenda institucional para uma <em>educação digital</em> crítica, conectada e contemporânea.",
    lede: "A fluência digital docente tornou-se uma competência central para o ensino contemporâneo e para a capacidade das redes públicas de transformar tecnologia em aprendizagem efetiva.",
    paragrafosHtml: [
      "Mais do que dominar ferramentas, o professor precisa compreender quando, como e por que utilizar recursos digitais, articulando objetivos de aprendizagem, metodologias, avaliação, autoria, acessibilidade e engajamento dos estudantes.",
      "Este evento foi estruturado para fortalecer a segurança técnica e pedagógica dos educadores, ampliando repertórios para planejar, produzir, adaptar, selecionar e aplicar recursos digitais com intencionalidade. A formação combina referenciais de competência, autoavaliação, curadoria, produção de materiais, gamificação e estratégias de verificação da aprendizagem, sempre conectando inovação à rotina real da sala de aula.",
      "No contexto da trilha EDUTEC, o módulo contribui para que secretarias, escolas e equipes formadoras avancem da simples adoção de plataformas para uma prática docente mais consistente, criativa e orientada a resultados.",
    ],
    moduleBindingHtml: "Este seminário corresponde ao <strong>Módulo 02 da trilha EDUTEC</strong> — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Pode ser contratado de forma independente ou integrar a trilha completa.",
    razoesTituloHtml: "Seis razões para <em>participar</em> deste seminário",
    razoes: [
      { num: "01", titulo: "Porque a fluência digital virou competência central da docência contemporânea", descricao: "Não basta dominar ferramentas — é preciso compreender quando, como e por que usar recursos digitais com intencionalidade pedagógica." },
      { num: "02", titulo: "Porque palestrantes de referência conduzem o módulo", descricao: "Roberta Aquino (Unicamp · ISTE), Rebecca Rios (Diretora Pedagógica do Quizizz) e Bruno Reis (Google Trainer · EducaMídia) — três especialistas em formação docente." },
      { num: "03", titulo: "Porque a abordagem combina conceito e oficinas práticas", descricao: "Autoavaliação CIEB, produção no Canva, banco de recursos como YouTube Edu, simulações PhET, e gamificação com Wayground — aplicáveis à rotina escolar." },
      { num: "04", titulo: "Porque integra tecnologia, currículo e engajamento dos estudantes", descricao: "Estratégias replicáveis de imediato em diferentes etapas, componentes curriculares e contextos de rede." },
      { num: "05", titulo: "Porque a experiência acontece na plataforma EventON NTC", descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido." },
      { num: "06", titulo: "Porque você recebe certificação institucional do Instituto NTC do Brasil", descricao: "Certificação válida como atualização profissional, mediante 75% de presença — emitida pela referência institucional em capacitação." },
    ],
  },

  publicoOnline: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para professores, gestores e equipes pedagógicas que atuam nas redes públicas de ensino:",
    chips: [
      "Professores da Educação Infantil, Ensino Fundamental e Médio",
      "Coordenadores pedagógicos",
      "Formadores de educadores",
      "Equipes pedagógicas",
      "Gestores escolares",
      "Profissionais de tecnologia educacional",
    ],
    objetivoTitulo: "Objetivo",
    objetivoTexto: "Desenvolver a fluência digital de docentes e equipes pedagógicas, promovendo o uso pedagogicamente qualificado de ferramentas digitais, integrando tecnologia, planejamento pedagógico e metodologias ativas, e fortalecendo práticas inovadoras, participativas e centradas na aprendizagem.",
    destaquesTitulo: "Destaques formativos",
    destaques: [
      { num: "01", html: "<strong>Autoavaliação e referenciais de competência digital</strong> (descritores CIEB)." },
      { num: "02", html: "<strong>Intencionalidade pedagógica</strong> na integração tecnológica ao currículo." },
      { num: "03", html: "<strong>Produção e curadoria de conteúdos e recursos digitais</strong> autorais." },
      { num: "04", html: "<strong>Adaptação e diversificação de formatos</strong> com Canva." },
      { num: "05", html: "<strong>Gamificação e verificação de aprendizagem</strong> com Wayground." },
    ],
  },

  programacaoOnline: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Quatro sessões aplicadas, oito horas de imersão ao vivo.",
    headDayHtml: "16 de <em>Junho</em> · Terça-feira",
    headMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
    nodes: [
      { time: "08h00 – 09h00", ttag: "Palestra · 01", num: "I", titulo: "Descritores e autoavaliação de competências digitais", speakerLineHtml: "com <em>Roberta Aquino</em> · Doutora em Ciências · Unicamp · Google Innovator", bullets: ["Descritores de competências digitais para professores do CIEB.", "Ferramenta de autoavaliação nas dimensões pedagógica, curricular e organizacional.", "Níveis de proficiência (Exposição, Uso, Inovação) e áreas de competência."] },
      { time: "09h00 – 10h00", ttag: "Palestra · 02", num: "II", titulo: "Intencionalidade pedagógica e integração tecnológica", speakerLineHtml: "com <em>Rebecca Rios</em> · Diretora Pedagógica · Quizizz · Google Trainer", bullets: ["Tecnologia como apoio ao planejamento e à organização docente.", "Alinhamento entre recursos digitais, objetivos de aprendizagem e currículo.", "Seleção de ferramentas conforme a finalidade pedagógica."] },
      { time: "10h00 – 12h00", ttag: "Oficina · 01", num: "III", titulo: "Produção de materiais e recursos pedagógicos digitais", speakerLineHtml: "com <em>Bruno Reis</em> · Google Innovator · EducaMídia", bullets: ["Bancos de recursos como YouTube Edu e Arts and Culture.", "Simulações para matemática e ciências com PhET.", "Mediação docente em práticas mais dinâmicas e interativas."] },
      { time: "14h00 – 16h00", ttag: "Oficina · 02", num: "IV", titulo: "Conteúdos digitais: adaptação e criação de recursos", speakerLineHtml: "com <em>Roberta Aquino</em> · Canva Education Partner · Canva Trainer", bullets: ["Exploração das possibilidades do Canva para autoria pedagógica.", "Busca e adaptação de conteúdos prontos com qualidade pedagógica.", "Diversificação de formatos em sala de aula."] },
      { time: "16h00 – 18h00", ttag: "Oficina · 03", num: "V", titulo: "Gamificação e verificação de aprendizagem com Wayground", speakerLineHtml: "com <em>Bruno Reis</em> · Multiplicador EducaMídia", bullets: ["Potencial da gamificação em sala de aula.", "Busca, curadoria e criação de recursos no Wayground.", "Formas de interação e atribuição."] },
    ],
  },

  questoesOnline: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas sessões",
    intro: "Vinte e seis perguntas-guia organizadas por sessão, do fundamento conceitual às oficinas aplicadas.",
    grupos: [
      { sessao: "Sessão · 01", titulo: "Descritores e autoavaliação de competências digitais", palestrante: "com Roberta Aquino · 08h00 – 09h00", questoes: [
        { numero: "01", pergunta: "Quais são os descritores de competências digitais para professores propostos pelo CIEB?" },
        { numero: "02", pergunta: "Como aplicar a ferramenta de autoavaliação nas dimensões pedagógica, curricular e organizacional?" },
        { numero: "03", pergunta: "Quais são os três níveis de proficiência (Exposição · Uso · Inovação) e como identificar o nível atual?" },
        { numero: "04", pergunta: "Como mapear áreas de competência: pedagógica, cidadania digital e desenvolvimento profissional?" },
      ] },
      { sessao: "Sessão · 02", titulo: "Intencionalidade e integração tecnológica", palestrante: "com Rebecca Rios · 09h00 – 10h00", questoes: [
        { numero: "05", pergunta: "Como utilizar a tecnologia como apoio ao planejamento docente?" },
        { numero: "06", pergunta: "Que critérios alinham recursos digitais, objetivos de aprendizagem e currículo?" },
        { numero: "07", pergunta: "Como desenhar experiências de ensino mais significativas e participativas?" },
        { numero: "08", pergunta: "Como selecionar ferramentas conforme a finalidade pedagógica?" },
        { numero: "09", pergunta: "Como integrar planejamento, metodologia e avaliação no uso de tecnologia?" },
      ] },
      { sessao: "Sessão · 03", titulo: "Produção de materiais e recursos digitais", palestrante: "com Bruno Reis · 10h00 – 12h00", questoes: [
        { numero: "10", pergunta: "Como explorar bancos como YouTube Edu e Arts and Culture?" },
        { numero: "11", pergunta: "Como utilizar simulações do PhET para matemática e ciências?" },
        { numero: "12", pergunta: "Quais exemplos práticos de atividades com apoio tecnológico funcionam em sala?" },
        { numero: "13", pergunta: "Como qualificar a mediação docente em práticas dinâmicas?" },
      ] },
      { sessao: "Sessão · 04", titulo: "Curadoria pedagógica de recursos digitais", palestrante: "com Roberta Aquino · 14h00 – 16h00", questoes: [
        { numero: "17", pergunta: "O que é curadoria pedagógica e por que ela é central no planejamento docente?" },
        { numero: "18", pergunta: "Quais critérios devem orientar a busca, seleção e avaliação de recursos digitais?" },
        { numero: "19", pergunta: "Como avaliar a qualidade pedagógica e a aderência ao contexto de uma plataforma ou conteúdo?" },
        { numero: "20", pergunta: "Que ferramentas e referenciais apoiam a curadoria docente cotidiana?" },
        { numero: "21", pergunta: "Como diferenciar recursos pedagógicos qualificados de conteúdos rasos ou puramente comerciais?" },
        { numero: "22", pergunta: "De que forma a curadoria pode ampliar a participação e a expressão dos estudantes?" },
        { numero: "23", pergunta: "Como organizar institucionalmente bancos de recursos digitais para a rede?" },
      ] },
      { sessao: "Sessão · 05", titulo: "Transformação digital na educação: da visão à implementação", palestrante: "com Roberta Aquino · 16h00 – 18h00", questoes: [
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
    intro: "Cultura digital, educação midiática e inovação pedagógica em fluência digital docente.",
    palestrantes: [
      { foto: "", roleTag: "Palestrante", nome: "Roberta Aquino", credentials: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator", bio: "Professora de pós-graduação, palestrante internacional e consultora educacional, capacita professores e instituições a prosperarem na era digital. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp, com duas especializações em TI e MBA em Marketing pela ESPM. Educadora Certificada ISTE, Google Innovator, Trainer e Coach, Líder do GEG CDMX e Mentora GEG para a América Latina. Canva Education Partner, Trainer, Canvassador e Edu Canva Creator. Embaixadora de Genially, Wakelet, Wayground, MagicSchool, Padlet e BookCreator. Brasileira radicada no México desde 2018." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Rebecca Rios", credentials: "Diretora Pedagógica · Quizizz · Google Trainer · CliftonStrengths", bio: "Diretora Pedagógica do Quizizz, plataforma global de aprendizagem ativa utilizada por milhões de educadores e estudantes ao redor do mundo. Com mais de 15 anos de experiência em educação bilíngue, inovação educacional e tecnologia, atua na interseção entre pedagogia e design de experiências de aprendizagem envolventes e eficazes. Liderou iniciativas de formação docente, desenvolvimento de currículos digitais e implementação de metodologias ativas em diferentes contextos. É Google Trainer desde 2019 e líder certificada em CliftonStrengths pela Gallup." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Bruno Reis", credentials: "Google Innovator · Trainer · Coach · Multiplicador EducaMídia", bio: "Licenciado em História, especialista em Aprendizagem Cooperativa e Tecnologia Educacional na Educação Básica, em Gestão Escolar e em Aprendizagem Ativa e Tecnologias Educacionais. É Google Innovator, Google Trainer, Google Coach, Multiplicador EducaMídia e Educador Maker, com atuação em formação docente e desenvolvimento de práticas pedagógicas inovadoras para a educação básica." }, // TODO: foto sobe depois
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
    priceValueHtml: `<span class="cur">R$</span><span class="amt">1.470</span>`,
    priceSub: "por inscrição individual · evento on-line ao vivo de 8 horas",
    includesTitulo: "O que está incluído",
    includes: [
      "Apostila digital específica do módulo-evento",
      "Certificado digital emitido pelo Instituto NTC do Brasil",
      "Acesso individual ao ambiente EventON NTC",
      "Replay integral pelo período informado no folder",
      "Suporte técnico para acesso ao ambiente virtual",
    ],
    modes: [
      { tag: "Individual", titulo: "Inscrição individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { tag: "Grupo", titulo: "Grupos institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada." },
      { tag: "Institucional", titulo: "Grandes grupos e turmas fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas.", featured: true },
    ],
  },

  regrasOnline: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "O cancelamento e/ou a substituição de inscrição deverá ser solicitado por escrito, pelo e-mail eventosonline@institutontc.com.br ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento.",
      "A substituição deverá indicar os dados completos do novo participante — nome completo, e-mail funcional ou institucional, telefone/WhatsApp e órgão de vinculação — para liberação do acesso individual.",
      "A inscrição contratada garante a disponibilização do acesso ao evento on-line ao vivo, ao ambiente EventON NTC, ao material digital, ao suporte técnico e ao replay pelo período informado neste folder.",
      "A ausência, o não acesso, o acesso parcial, o não uso do replay dentro do prazo ou o não cumprimento dos critérios mínimos de presença não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC.",
      "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais.",
      "A relação deverá ser enviada preferencialmente até 2 dias úteis antes do evento, a fim de viabilizar o cadastro, o envio dos acessos e o suporte operacional.",
      "Os inscritos poderão acessar o replay pelo período informado neste folder, observadas as regras de acesso individual e vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio.",
      "A certificação será emitida somente após o encerramento do prazo de replay, exclusivamente aos participantes que cumprirem os critérios mínimos de presença e registro no ambiente.",
    ],
  },

  ctaFinalOnline: {
    eyebrowGold: "Próximo passo",
    h2Html: "Garanta sua participação no <em>Módulo 02 EDUTEC</em>.",
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      { texto: "Inscrever-se agora", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M02", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 02 · Trilha EDUTEC",
    rows: [
      { label: "Quando", value: "16 · Jun · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "R$ 1.470", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Apostila digital do módulo", "Certificado institucional", "Suporte técnico dedicado", "Acesso ao ambiente EventON NTC"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 16 de Junho de 2026", deadline: "2026-06-16T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+02&evento_url=/agenda/edutec-m02-2026#tab-equipe", cmsLink: "inscricao-equipe-EDUTEC-M02", classe: "btn btn--secondary" },
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

const eventoEdutecM04: EventoOnline = {
  slug: "edutec-m04-2026",
  titulo: "Currículo e Computação: Integrando a BNCC à Prática Pedagógica",
  subtitulo:
    "Fundamentos, diretrizes curriculares e estratégias de implementação para integrar computação e pensamento computacional à formação dos estudantes.",
  formato: "online",
  dataEvento: "17 de junho de 2026",
  area: "edu",
  card: {
    programaSlug: "EDUTEC",
    formatoCard: "seminario",
    cidade: "",
    valorReais: 1470,
    deadlineIso: "2026-06-17",
    keywords: "curriculo computacao bncc pensamento computacional pratica pedagogica",
    flags: ["destaque_editorial"],
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Débora Garofalo, Roberta Aquino e Karla Priscilla",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470",
    precoEquipesLabel: "Sob consulta",
    destaqueHome: true,
    diaDataBloco: "17",
    mesAnoDataBloco: "Jun · 2026",
  },

  // Campos de EventoBase não usados pelo layout online (vazios):
  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário EDUTEC · Currículo e Computação", current: true },
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
      { id: "edutec-m04-faq-1", pergunta: "Como funciona o acesso ao EventON NTC?", respostaHtml: "Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo." },
      { id: "edutec-m04-faq-2", pergunta: "Por quanto tempo terei acesso ao replay?", respostaHtml: "O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual." },
      { id: "edutec-m04-faq-3", pergunta: "Como recebo o certificado?", respostaHtml: "O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR." },
      { id: "edutec-m04-faq-4", pergunta: "Posso inscrever minha equipe ou rede?", respostaHtml: "Sim. Equipes e órgãos públicos poderão solicitar condição comercial diferenciada conforme quantidade de inscritos, perfil institucional e forma de contratação. Solicite proposta pelo botão lateral." },
      { id: "edutec-m04-faq-5", pergunta: "A inscrição inclui materiais?", respostaHtml: "Sim. A inscrição inclui apostila digital específica do módulo-evento, certificado digital e acesso ao replay. Materiais enviados por e-mail e disponibilizados na plataforma EventON NTC." },
      { id: "edutec-m04-faq-6", pergunta: "Como contratar uma turma fechada para minha instituição?", respostaHtml: "A NTC desenvolve turmas fechadas para secretarias, autarquias e órgãos públicos. O Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas por escala, suporte operacional e replay. Solicite proposta institucional pelo botão lateral." },
      { id: "edutec-m04-faq-7", pergunta: "É possível compor a trilha completa EDUTEC?", respostaHtml: "Sim. Este Módulo 04 pode ser contratado de forma independente ou integrar a trilha EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Consulte a equipe comercial." },
    ],
  },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "", status: "", tituloCard: "", rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "2026-06-17T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário EDUTEC · Currículo e Computação: Integrando a BNCC à Prática Pedagógica",
    descricao: "Seminário On-Line ao Vivo do programa EDUTEC · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260617T080000",
    endISO: "20260617T180000",
    filename: "EDUTEC-M04-2026-jun.ics",
  },

  // ---- Seções evt-* (consumidas pelo EventoOnlineLayout) ----
  heroOnline: {
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1Html: "Currículo e Computação: Integrando a <em>BNCC</em> à Prática Pedagógica",
    sub: "Fundamentos, diretrizes curriculares e estratégias de implementação para integrar computação e pensamento computacional à formação dos estudantes.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma: "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026", cmsLink: "inscricao-EDUTEC-M04-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-EDUTEC-M04", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M04", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "17 · Junho", valueSub: "2026 · Quarta-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "R$ 1.470", valueSub: "por inscrito · individual" },
  ],

  visaoGeralOnline: {
    eyebrow: "Visão geral",
    h2Html: "Uma agenda institucional para uma educação digital <em>crítica</em>, conectada e contemporânea.",
    lede: "A escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos e novas linguagens de participação — formar para apenas utilizar tecnologia é insuficiente.",
    paragrafosHtml: [
      "Este módulo explora a computação na educação básica como uma dimensão curricular estratégica, articulada à BNCC, à Política Nacional de Educação Digital e às novas competências exigidas para a formação dos estudantes. O avanço da cultura digital torna indispensável que redes e escolas compreendam a computação não apenas como uso de computadores, mas como campo de conhecimento que envolve pensamento computacional, resolução de problemas, lógica, algoritmos, cultura digital e compreensão crítica do mundo tecnológico.",
      "A proposta apoia equipes técnicas, gestores escolares, coordenadores e professores na transposição desse tema para o currículo e para a prática pedagógica. Por meio de fundamentos, análise normativa, exemplos aplicáveis, metodologias desplugadas e oficinas práticas, o módulo oferece caminhos para que a rede organize implementação gradual, coerente e viável.",
      "Inserido no EDUTEC, este módulo contribui para transformar a agenda de computação em planejamento curricular, formação docente e prática de sala de aula, conectando diretrizes nacionais, intencionalidade pedagógica e estratégias de implementação.",
    ],
    moduleBindingHtml: "Este seminário corresponde ao <strong>Módulo 04 da trilha EDUTEC</strong> — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Pode ser contratado de forma independente ou integrar a trilha completa.",
    razoesTituloHtml: "Seis razões para <em>participar</em> deste seminário",
    razoes: [
      { num: "01", titulo: "Porque a computação ganhou centralidade na agenda curricular brasileira", descricao: "BNCC Computação e a Lei 14.533/2023 exigem que redes traduzam o tema em planejamento e prática — este módulo entrega o repertório institucional para essa transição." },
      { num: "02", titulo: "Porque palestrantes de referência conduzem o módulo", descricao: "Roberta Aquino (Unicamp · ISTE), Karla Priscilla (EducaMídia · Google Innovator) e Débora Garofalo (uma das maiores referências brasileiras em computação na educação básica)." },
      { num: "03", titulo: "Porque combina marco regulatório com prática desplugada", descricao: "Análise normativa + Laboratório de Pensamento Computacional + estratégias de integração curricular — aplicáveis a diferentes níveis de infraestrutura." },
      { num: "04", titulo: "Porque integra a perspectiva técnica e pedagógica", descricao: "Conecta equipes curriculares, gestores e professores em uma única agenda institucional de implementação gradual." },
      { num: "05", titulo: "Porque a experiência acontece na plataforma EventON NTC", descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido." },
      { num: "06", titulo: "Porque você recebe certificação institucional do Instituto NTC do Brasil", descricao: "Certificação válida como atualização profissional, mediante 75% de presença — referência em capacitação para o setor público." },
    ],
  },

  publicoOnline: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para gestores, equipes técnicas curriculares e educadores que atuam nas redes públicas de ensino:",
    chips: [
      "Secretários e dirigentes de educação",
      "Equipes técnicas curriculares",
      "Gestores escolares",
      "Coordenadores pedagógicos",
      "Professores",
      "Formadores de educadores",
      "Profissionais de inovação curricular",
    ],
    objetivoTitulo: "Objetivo",
    objetivoTexto: "Compreender fundamentos da computação na educação básica e do pensamento computacional; explorar relações entre computação, currículo, BNCC e competências contemporâneas; apoiar redes e escolas na definição de caminhos de implementação; e fortalecer práticas que integrem computação com sentido pedagógico e viabilidade.",
    destaquesTitulo: "Destaques formativos",
    destaques: [
      { num: "01", html: "<strong>Marco regulatório e BNCC Computação</strong> aplicados à educação básica." },
      { num: "02", html: "<strong>Pensamento computacional e computação desplugada</strong> com sucata." },
      { num: "03", html: "<strong>Laboratório de práticas</strong> com decomposição, padrões e algoritmos." },
      { num: "04", html: "<strong>Integração curricular</strong> transversal e interdisciplinar." },
      { num: "05", html: "<strong>Cultura digital e ferramentas</strong> para apoiar a aula." },
      { num: "06", html: "<strong>Lei nº 14.533/2023 e implementação curricular</strong> nas redes públicas." },
      { num: "07", html: "<strong>Diagnóstico de maturidade</strong> e priorização institucional." },
    ],
  },

  programacaoOnline: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Quatro sessões aplicadas, oito horas de imersão ao vivo.",
    headDayHtml: "17 de <em>Junho</em> · Quarta-feira",
    headMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
    nodes: [
      { time: "08h00 – 09h00", ttag: "Palestra · 01", num: "I", titulo: "Computação desplugada", speakerLineHtml: "com <em>Débora Garofalo</em> · Referência em computação na educação básica", bullets: ["Decifrando a computação na educação básica.", "Relações entre lógica, resolução de problemas e aprendizagem.", "A computação como linguagem, área de conhecimento e prática formativa.", "Estratégias para implementação da computação desplugada e com sucata."] },
      { time: "09h00 – 10h00", ttag: "Palestra · 02", num: "II", titulo: "Computação na educação básica e a Lei 14.533/2023", speakerLineHtml: "com <em>Roberta Aquino</em> · Doutora em Ciências · Unicamp · ISTE", bullets: ["Conexões entre computação, competências gerais e currículo.", "Possibilidades de inserção em componentes e projetos integradores.", "Caminhos curriculares e organizacionais para redes públicas.", "Planejamento gradual e sustentável de implementação."] },
      { time: "10h00 – 12h00", ttag: "Oficina · 01", num: "III", titulo: "Laboratório de pensamento computacional", speakerLineHtml: "com <em>Débora Garofalo</em> · Cultura Maker · BNCC Computação", bullets: ["Decomposição e compreensão do pensamento computacional.", "Propostas didáticas para diferentes etapas da educação básica.", "Atividades com e sem uso intensivo de dispositivos.", "Integração entre computação, resolução de problemas e criatividade."] },
      { time: "14h00 – 16h00", ttag: "Oficina · 02", num: "IV", titulo: "Cultura digital e ferramentas para apoiar sua incorporação em aula", speakerLineHtml: "com <em>Karla Priscilla</em> · EducaMídia · Google Innovator", bullets: ["Aprofundamento do conhecimento sobre cultura digital.", "Estratégias para abordar a temática em sala de aula.", "Abordagem transdisciplinar da cultura digital.", "Ferramentas para apoiar a implantação."] },
      { time: "16h00 – 18h00", ttag: "Oficina · 03", num: "V", titulo: "Integrando a computação no currículo escolar", speakerLineHtml: "com <em>Roberta Aquino</em> · Especialista em transformação curricular digital", bullets: ["Diagnóstico de maturidade e priorização de ações.", "Formação de professores e apoio às escolas.", "Articulação entre currículo, tecnologia e gestão.", "Monitoramento de avanços e sustentabilidade institucional."] },
    ],
  },

  questoesOnline: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas sessões",
    intro: "Treze perguntas-guia organizadas por sessão, do fundamento conceitual ao laboratório prático.",
    grupos: [
      { sessao: "Sessão · 01", titulo: "Computação desplugada", palestrante: "com Débora Garofalo · 08h00 – 09h00", questoes: [
        { numero: "01", pergunta: "O que é computação na educação básica além do uso de computadores?" },
        { numero: "02", pergunta: "Quais são as relações entre lógica, resolução de problemas e aprendizagem?" },
        { numero: "03", pergunta: "Como tratar a computação como linguagem, área de conhecimento e prática formativa?" },
        { numero: "04", pergunta: "Que estratégias viabilizam a implementação desplugada e com sucata?" },
      ] },
      { sessao: "Sessão · 02", titulo: "BNCC e Lei 14.533/2023 na rede", palestrante: "com Roberta Aquino · 09h00 – 10h00", questoes: [
        { numero: "05", pergunta: "Como conectar computação, competências gerais e currículo?" },
        { numero: "06", pergunta: "Quais possibilidades de inserção em componentes e projetos integradores?" },
        { numero: "07", pergunta: "Quais caminhos curriculares e organizacionais funcionam em redes públicas?" },
        { numero: "08", pergunta: "Como planejar implementação gradual e sustentável?" },
        { numero: "09", pergunta: "Qual o papel da gestão e das equipes técnicas no processo?" },
      ] },
      { sessao: "Sessão · 03", titulo: "Laboratório de pensamento computacional", palestrante: "com Débora Garofalo · 10h00 – 12h00", questoes: [
        { numero: "10", pergunta: "Como decompor o pensamento computacional em práticas didáticas?" },
        { numero: "11", pergunta: "Quais propostas funcionam para diferentes etapas da educação básica?" },
        { numero: "12", pergunta: "Como integrar atividades com e sem uso intensivo de dispositivos?" },
        { numero: "13", pergunta: "Como articular computação, resolução de problemas e criatividade?" },
      ] },
      // Questões 14, 15 e 16 ausentes no PDF original (gap de numeração entre as páginas 08 e 09)
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
    intro: "Cultura digital, computação na educação básica e inovação pedagógica.",
    palestrantes: [
      { foto: "", roleTag: "Palestrante", nome: "Débora Garofalo", credentials: "Referência em Computação na Educação Básica · Cultura Maker · BNCC", bio: "Uma das maiores referências brasileiras em computação na educação básica e cultura maker. Atuou na construção e implementação de políticas públicas de computação curricular, com forte foco em pensamento computacional, robótica educacional, sustentabilidade e inclusão digital. Reconhecida nacional e internacionalmente por projetos premiados que articulam tecnologia, currículo e protagonismo estudantil em redes públicas de ensino." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Roberta Aquino", credentials: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator", bio: "Professora de pós-graduação, palestrante internacional e consultora educacional, capacita professores e instituições a prosperarem na era digital. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp, com duas especializações em TI e MBA em Marketing pela ESPM. Educadora Certificada ISTE, Google Innovator, Trainer e Coach, Líder do GEG CDMX e Mentora GEG para a América Latina. Canva Education Partner, Trainer, Canvassador e Edu Canva Creator. Embaixadora de Genially, Wakelet, Wayground, MagicSchool, Padlet e BookCreator. Brasileira radicada no México desde 2018." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Karla Priscilla", credentials: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia", bio: "Mestranda em Tecnologias Emergentes na Educação, pedagoga, consultora e palestrante. Especialista em Educação Digital e Metodologias Ativas. Google Champions, Innovator e Google Trainer, Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais em uma rede de educação e como formadora de educadores em todo o Brasil. Realiza a coordenação pedagógica de projetos e mentorias, com a missão de impactar positivamente a vida pessoal e profissional de cada participante. Embaixadora do Canva for Education, ClassDojo e da plataforma Teachy." }, // TODO: foto sobe depois
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
    priceValueHtml: `<span class="cur">R$</span><span class="amt">1.470</span>`,
    priceSub: "por inscrição individual · evento on-line ao vivo de 8 horas",
    includesTitulo: "O que está incluído",
    includes: [
      "Apostila digital específica do módulo-evento",
      "Certificado digital emitido pelo Instituto NTC do Brasil",
      "Acesso individual ao ambiente EventON NTC",
      "Replay integral pelo período informado no folder",
      "Suporte técnico para acesso ao ambiente virtual",
    ],
    modes: [
      { tag: "Individual", titulo: "Inscrição individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { tag: "Grupo", titulo: "Grupos institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada." },
      { tag: "Institucional", titulo: "Grandes grupos e turmas fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas.", featured: true },
    ],
  },

  regrasOnline: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "O cancelamento e/ou a substituição de inscrição deverá ser solicitado por escrito, pelo e-mail eventosonline@institutontc.com.br ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento.",
      "A substituição deverá indicar os dados completos do novo participante — nome completo, e-mail funcional ou institucional, telefone/WhatsApp e órgão de vinculação — para liberação do acesso individual.",
      "A inscrição contratada garante a disponibilização do acesso ao evento on-line ao vivo, ao ambiente EventON NTC, ao material digital, ao suporte técnico e ao replay pelo período informado neste folder.",
      "A ausência, o não acesso, o acesso parcial, o não uso do replay dentro do prazo ou o não cumprimento dos critérios mínimos de presença não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC.",
      "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais.",
      "A relação deverá ser enviada preferencialmente até 2 dias úteis antes do evento, a fim de viabilizar o cadastro, o envio dos acessos e o suporte operacional.",
      "Os inscritos poderão acessar o replay pelo período informado neste folder, observadas as regras de acesso individual e vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio.",
      "A certificação será emitida somente após o encerramento do prazo de replay, exclusivamente aos participantes que cumprirem os critérios mínimos de presença e registro no ambiente.",
    ],
  },

  ctaFinalOnline: {
    eyebrowGold: "Próximo passo",
    h2Html: "Garanta sua participação no <em>Módulo 04 EDUTEC</em>.",
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      { texto: "Inscrever-se agora", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026", cmsLink: "inscricao-EDUTEC-M04-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026#tab-equipe", cmsLink: "proposta-grupo-EDUTEC-M04", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 04 · Trilha EDUTEC",
    rows: [
      { label: "Quando", value: "17 · Jun · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "R$ 1.470", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Apostila digital do módulo", "Certificado institucional", "Suporte técnico dedicado", "Acesso ao ambiente EventON NTC"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 17 de Junho de 2026", deadline: "2026-06-17T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026", cmsLink: "inscricao-EDUTEC-M04-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=EDUTEC+M%C3%B3dulo+04&evento_url=/agenda/edutec-m04-2026#tab-equipe", cmsLink: "inscricao-equipe-EDUTEC-M04", classe: "btn btn--secondary" },
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

const eventoProgeM01: EventoOnline = {
  slug: "proge-m01-2026",
  titulo: "Gestão Escolar em Transformação: Resultados, Recursos e Governança Democrática",
  subtitulo:
    "Liderança escolar, governança institucional e foco em resultados para fortalecer a escola pública contemporânea.",
  formato: "online",
  dataEvento: "22 de junho de 2026",
  area: "edu",
  card: {
    programaSlug: "PROGE",
    formatoCard: "seminario",
    cidade: "",
    valorReais: 1470,
    deadlineIso: "2026-06-22",
    keywords: "gestao escolar resultados recursos governanca democratica direcao",
    flags: ["destaque_editorial"],
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Pedro Lino, Marialba Glória, Maria Sílvia Bacila e Marli Regina Fernandes",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470",
    precoEquipesLabel: "Sob consulta",
    destaqueHome: false,
    diaDataBloco: "22",
    mesAnoDataBloco: "Jun · 2026",
  },

  // Campos de EventoBase não usados pelo layout online (vazios):
  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário PROGE · Gestão Escolar em Transformação", current: true },
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
      { id: "proge-m01-faq-1", pergunta: "Como funciona o acesso ao EventON NTC?", respostaHtml: "Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo." },
      { id: "proge-m01-faq-2", pergunta: "Por quanto tempo terei acesso ao replay?", respostaHtml: "O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual." },
      { id: "proge-m01-faq-3", pergunta: "Como recebo o certificado?", respostaHtml: "O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR." },
      { id: "proge-m01-faq-4", pergunta: "Posso inscrever minha equipe ou rede?", respostaHtml: "Sim. Equipes e órgãos públicos poderão solicitar condição comercial diferenciada conforme quantidade de inscritos, perfil institucional e forma de contratação. Solicite proposta pelo botão lateral." },
      { id: "proge-m01-faq-5", pergunta: "A inscrição inclui materiais?", respostaHtml: "Sim. A inscrição inclui apostila digital específica do módulo-evento, certificado digital e acesso ao replay. Materiais enviados por e-mail e disponibilizados na plataforma EventON NTC." },
      { id: "proge-m01-faq-6", pergunta: "Como contratar uma turma fechada para minha instituição?", respostaHtml: "A NTC desenvolve turmas fechadas para secretarias, autarquias e órgãos públicos. O Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas por escala, suporte operacional e replay. Solicite proposta institucional pelo botão lateral." },
      { id: "proge-m01-faq-7", pergunta: "É possível compor a trilha completa PROGE?", respostaHtml: "Sim. Este Módulo 01 pode ser contratado de forma independente ou integrar a trilha PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance. Consulte a equipe comercial." },
    ],
  },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "", status: "", tituloCard: "", rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "2026-06-22T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário PROGE · Gestão Escolar em Transformação: Resultados, Recursos e Governança Democrática",
    descricao: "Seminário On-Line ao Vivo do programa PROGE · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260622T080000",
    endISO: "20260622T180000",
    filename: "PROGE-M01-2026-jun.ics",
  },

  // ---- Seções evt-* (consumidas pelo EventoOnlineLayout) ----
  heroOnline: {
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1Html: "Gestão Escolar em Transformação: Resultados, Recursos e <em>Governança</em> Democrática",
    sub: "Liderança escolar, governança institucional e foco em resultados para fortalecer a escola pública contemporânea.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/proge",
      cmsLink: "programa-PROGE",
      nomePrograma: "PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance",
    },
    ctas: [
      { texto: "Inscrever-se", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026", cmsLink: "inscricao-PROGE-M01-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-PROGE-M01", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026#tab-equipe", cmsLink: "proposta-grupo-PROGE-M01", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "22 · Junho", valueSub: "2026 · Segunda-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "R$ 1.470", valueSub: "por inscrito · individual" },
  ],

  visaoGeralOnline: {
    eyebrow: "Visão geral",
    h2Html: "Uma agenda institucional para a melhoria da <em>escola pública</em>.",
    lede: "A gestão escolar deixou de ser compreendida apenas como função administrativa ou burocrática. No cenário atual das redes públicas, diretores, vice-diretores e equipes gestoras assumem papel decisivo na organização pedagógica da escola, na mobilização da equipe, no acompanhamento dos resultados, no uso qualificado dos recursos e na construção de uma cultura institucional orientada à aprendizagem.",
    paragrafosHtml: [
      "Este evento reposiciona a gestão escolar como eixo estratégico da melhoria educacional, articulando liderança, planejamento, governança democrática, uso de indicadores, gestão de recursos, organização institucional e responsabilização coletiva. A proposta oferece uma leitura executiva e prática sobre os desafios da direção escolar diante das novas exigências de desempenho, equidade e coerência institucional.",
      "Integrado ao PROGE, o módulo fortalece a escola como unidade estratégica de execução da política educacional, apoiando gestores e equipes técnicas na construção de práticas mais integradas, consistentes e orientadas por resultados concretos de aprendizagem.",
    ],
    moduleBindingHtml: "Este seminário corresponde ao <strong>Módulo 01 da trilha PROGE</strong> — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance. Pode ser contratado de forma independente ou integrar a trilha completa.",
    razoesTituloHtml: "Seis razões para <em>participar</em> deste seminário",
    razoes: [
      { num: "01", titulo: "Compreender o novo papel da gestão escolar diante das exigências contemporâneas das redes públicas", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "02", titulo: "Fortalecer a liderança diretiva com foco em aprendizagem, organização institucional e resultados", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "03", titulo: "Qualificar o uso do PPP, dos planos de ação e dos indicadores como instrumentos reais de gestão", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "04", titulo: "Ampliar a capacidade da escola de articular recursos, prioridades pedagógicas e governança democrática", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "05", titulo: "Transformar a gestão escolar em núcleo de mobilização, execução e melhoria contínua", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "06", titulo: "Abordagem executiva voltada à realidade da escola pública", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
    ],
  },

  publicoOnline: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para gestores e equipes que atuam nas redes públicas de ensino:",
    chips: [
      "Secretários estaduais e municipais de educação",
      "Dirigentes e equipes técnicas das secretarias de educação",
      "Diretores escolares, vice-diretores e lideranças de unidade",
      "Coordenadores pedagógicos, supervisores, orientadores e articuladores pedagógicos",
      "Profissionais responsáveis por PPP, plano de ação, indicadores, recursos e resultados educacionais",
    ],
    objetivoTitulo: "Objetivo",
    objetivoTexto: "Fortalecer a atuação da gestão escolar como liderança estratégica da unidade de ensino, ampliando sua capacidade de organizar prioridades, mobilizar equipes, utilizar indicadores, articular recursos e conduzir processos institucionais voltados à melhoria da aprendizagem e à sustentabilidade da escola pública.",
    destaquesTitulo: "Destaques formativos",
    destaques: [
      { num: "01", html: "<strong>Gestão escolar como eixo estratégico</strong> da melhoria da aprendizagem — transformações recentes na gestão escolar." },
      { num: "02", html: "<strong>Liderança diretiva</strong> — papel da direção escolar, clima institucional e rotina escolar." },
      { num: "03", html: "<strong>Governança democrática</strong> — participação da comunidade escolar, conselhos e responsabilização compartilhada." },
      { num: "04", html: "<strong>Indicadores SAEB, IDEB</strong> e indicadores da escola — PPP como instrumento vivo." },
      { num: "05", html: "<strong>Recursos e prioridades pedagógicas</strong> — plano de ação, metas e acompanhamento." },
    ],
  },

  programacaoOnline: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Cinco etapas executivas, oito horas de imersão ao vivo.",
    headDayHtml: "22 de <em>Junho</em> · Segunda-feira",
    headMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
    nodes: [
      { time: "08h00 – 09h00", ttag: "Abertura · Institucional", num: "I", titulo: "Gestão Escolar em Transformação — eixo estratégico do PROGE", speakerLineHtml: "com <em>Pedro Lino</em> · Mestre em Educação · Formador em Gestão Escolar", bullets: ["Transformações recentes na gestão escolar e novos papéis da direção.", "Novas exigências das redes públicas contemporâneas.", "A escola como unidade de execução da política educacional."] },
      { time: "09h00 – 11h00", ttag: "Bloco · 01", num: "II", titulo: "Gestão escolar como eixo estratégico da melhoria da aprendizagem", speakerLineHtml: "com <em>Pedro Lino</em> · Mestre em Educação · Formador em Gestão Escolar", bullets: ["Transformações recentes na gestão escolar.", "Novas exigências das redes públicas.", "Escola como unidade de execução da política educacional."] },
      { time: "11h00 – 12h00", ttag: "Bloco · 02", num: "III", titulo: "Liderança diretiva e organização da escola", speakerLineHtml: "com <em>Marialba Glória</em> · Especialista em Gestão Educacional · Unicamp · Ex-Undime SP", bullets: ["Papel da direção escolar.", "Clima institucional.", "Rotina escolar e pactuação de responsabilidades."] },
      { time: "14h00 – 16h00", ttag: "Bloco · 03", num: "IV", titulo: "Governança democrática e participação", speakerLineHtml: "com <em>Maria Sílvia Bacila</em> · Doutora em Educação · PUCPR · Ex-Sec. Mun. Educação Curitiba", bullets: ["Participação da comunidade escolar.", "Conselhos, colegiados e instâncias de escuta.", "Responsabilização compartilhada."] },
      { time: "16h00 – 18h00", ttag: "Bloco · 04", num: "V", titulo: "Indicadores, PPP e planejamento da execução", speakerLineHtml: "com <em>Marli Regina Fernandes</em> · Pedagoga · Especialista em Filosofia e Tecnologias · Ex-Undime PR", bullets: ["SAEB, IDEB e indicadores da escola.", "PPP como instrumento vivo.", "Plano de ação, metas e acompanhamento."] },
    ],
  },

  questoesOnline: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas sessões",
    intro: "Vinte e sete perguntas-guia organizadas por sessão, da abertura institucional aos blocos aplicados.",
    grupos: [
      { sessao: "Sessão · 01", titulo: "Gestão escolar como eixo estratégico da melhoria da aprendizagem", palestrante: "com Pedro Lino · 09h00 – 11h00", questoes: [
        { numero: "01", pergunta: "O que significa Gestão escolar como eixo estratégico da melhoria da aprendizagem aplicado à realidade da escola pública contemporânea?" },
        { numero: "02", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "03", pergunta: "De que forma transformações recentes na gestão escolar sustenta resultados consistentes na escola pública?" },
        { numero: "04", pergunta: "De que forma novas exigências das redes públicas sustenta resultados consistentes na escola pública?" },
        { numero: "05", pergunta: "De que forma escola como unidade de execução da política educacional sustenta resultados consistentes na escola pública?" },
        { numero: "06", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "07", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      { sessao: "Sessão · 02", titulo: "Liderança diretiva e organização da escola", palestrante: "com Marialba Glória · 11h00 – 12h00", questoes: [
        { numero: "08", pergunta: "O que significa Liderança diretiva aplicado à realidade da escola pública contemporânea?" },
        { numero: "09", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "10", pergunta: "De que forma papel da direção escolar sustenta resultados consistentes na escola pública?" },
        { numero: "11", pergunta: "De que forma clima institucional sustenta resultados consistentes na escola pública?" },
        { numero: "12", pergunta: "Como articular Rotina escolar com as demais dimensões da rotina escolar?" },
        { numero: "13", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "14", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      { sessao: "Sessão · 03", titulo: "Governança democrática e participação", palestrante: "com Maria Sílvia Bacila · 14h00 – 16h00", questoes: [
        { numero: "17", pergunta: "O que significa Governança democrática aplicado à realidade da escola pública contemporânea?" },
        { numero: "18", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "19", pergunta: "De que forma participação da comunidade escolar sustenta resultados consistentes na escola pública?" },
        { numero: "20", pergunta: "Como articular Conselhos com as demais dimensões da rotina escolar?" },
        { numero: "21", pergunta: "De que forma responsabilização compartilhada sustenta resultados consistentes na escola pública?" },
        { numero: "22", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "23", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      { sessao: "Sessão · 04", titulo: "Indicadores, PPP e planejamento da execução", palestrante: "com Marli Regina Fernandes · 16h00 – 18h00", questoes: [
        { numero: "24", pergunta: "O que significa Indicadores aplicado à realidade da escola pública contemporânea?" },
        { numero: "25", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "26", pergunta: "Como articular SAEB com as demais dimensões da rotina escolar?" },
        { numero: "27", pergunta: "De que forma PPP como instrumento vivo sustenta resultados consistentes na escola pública?" },
        { numero: "28", pergunta: "Como articular Plano de ação com as demais dimensões da rotina escolar?" },
        { numero: "29", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
      ] },
    ],
    naPratica: {
      titulo: "Na prática · o que você levará do módulo para a sua rede",
      itens: [
        "Repertório executivo ampliado sobre gestão escolar em transformação.",
        "Diretrizes para leitura crítica de indicadores e aplicação à rotina escolar.",
        "Caminhos para articular prioridades pedagógicas e resultados de aprendizagem.",
        "Critérios institucionais para construção e revisão de instrumentos de gestão.",
        "Modelo de plano de ação articulado a metas e acompanhamento contínuo.",
        "Subsídios para mobilizar equipe, comunidade escolar e rede.",
      ],
    },
  },

  palestrantesOnline: {
    eyebrow: "Quem ensina",
    h2Html: "Quatro especialistas de <em>referência nacional</em>",
    intro: "Gestão escolar, governança educacional e direção pública.",
    palestrantes: [
      { foto: "", roleTag: "Palestrante", nome: "Pedro Lino", credentials: "Mestre em Educação · Formador em Gestão Escolar", bio: "Professor, mestre e formador com atuação em gestão escolar, organização do trabalho pedagógico, liderança educacional e formação continuada de profissionais da educação básica." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Marialba Glória", credentials: "Especialista em Gestão Educacional · Unicamp · Ex-Undime SP", bio: "Normalista, pedagoga, habilitada em Letras e especialista em Gestão Educacional pela Unicamp. Foi secretária municipal de Educação de Pereira Barreto, vice-prefeita do município, presidente da Undime São Paulo e gerente de projetos na Secretaria de Educação Básica do MEC." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Maria Sílvia Bacila", credentials: "Doutora em Educação · PUCPR · Ex-Sec. Mun. Educação Curitiba", bio: "Doutora em Educação pela PUCPR, com sólida trajetória em gestão educacional e currículo. Foi secretária municipal de Educação de Curitiba e exerceu função executiva pedagógica na Secretaria Municipal de Educação de São Paulo." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Marli Regina Fernandes", credentials: "Pedagoga · Especialista em Filosofia e Tecnologias · Ex-Undime PR", bio: "Pedagoga, especialista em Filosofia e em Tecnologias em Educação. Foi presidente da Undime Paraná, vice-presidente da Undime Região Sul e conselheira do Conselho Estadual de Educação do Paraná." }, // TODO: foto sobe depois
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
    priceValueHtml: `<span class="cur">R$</span><span class="amt">1.470</span>`,
    priceSub: "por inscrição individual · evento on-line ao vivo de 8 horas",
    includesTitulo: "O que está incluído",
    includes: [
      "Apostila digital específica do módulo-evento",
      "Certificado digital emitido pelo Instituto NTC do Brasil",
      "Acesso individual ao ambiente EventON NTC",
      "Replay integral pelo período informado no folder",
      "Suporte técnico para acesso ao ambiente virtual",
    ],
    modes: [
      { tag: "Individual", titulo: "Inscrição individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { tag: "Grupo", titulo: "Grupos institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada, conforme quantidade de inscritos, perfil institucional da demanda, forma de contratação e disponibilidade operacional." },
      { tag: "Institucional", titulo: "Grandes grupos e turmas fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios, instituições ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada — contemplando condições diferenciadas por escala, política de cortesias institucionais, suporte operacional, período de replay e eventual estruturação de turma exclusiva.", featured: true },
    ],
  },

  regrasOnline: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "O cancelamento e/ou a substituição de inscrição deverá ser solicitado por escrito, pelo e-mail eventosonline@institutontc.com.br ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento.",
      "A substituição deverá indicar os dados completos do novo participante — nome completo, e-mail funcional ou institucional, telefone/WhatsApp e órgão de vinculação — para liberação do acesso individual.",
      "A inscrição contratada garante a disponibilização do acesso ao evento on-line ao vivo, ao ambiente EventON NTC, ao material digital, ao suporte técnico e ao replay pelo período informado neste folder.",
      "A ausência, o não acesso, o acesso parcial, o não uso do replay dentro do prazo ou o não cumprimento dos critérios mínimos de presença não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC — que poderá aceitar, a seu critério, a conversão do valor pago em crédito para inscrição em futuros eventos.",
      "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais.",
      "A relação deverá ser enviada preferencialmente até 2 dias úteis antes do evento, a fim de viabilizar o cadastro, o envio dos acessos e o suporte operacional.",
      "Os inscritos poderão acessar o replay pelo período informado neste folder, observadas as regras de acesso individual e vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio.",
      "A certificação será emitida somente após o encerramento do prazo de replay, exclusivamente aos participantes que cumprirem os critérios mínimos de presença e registro no ambiente.",
    ],
  },

  ctaFinalOnline: {
    eyebrowGold: "Próximo passo",
    h2Html: "Garanta sua participação no <em>Módulo 01 PROGE</em>.",
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      { texto: "Inscrever-se agora", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026", cmsLink: "inscricao-PROGE-M01-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026#tab-equipe", cmsLink: "proposta-grupo-PROGE-M01", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 01 · Trilha PROGE",
    rows: [
      { label: "Quando", value: "22 · Jun · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "R$ 1.470", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Apostila digital do módulo", "Certificado institucional", "Suporte técnico dedicado", "Acesso ao ambiente EventON NTC"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 22 de Junho de 2026", deadline: "2026-06-22T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026", cmsLink: "inscricao-PROGE-M01-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=PROGE+M%C3%B3dulo+01&evento_url=/agenda/proge-m01-2026#tab-equipe", cmsLink: "inscricao-equipe-PROGE-M01", classe: "btn btn--secondary" },
    ],
    share: { label: "Compartilhar:", links: [
      { texto: "WhatsApp", href: "#", cmsLink: "share-whatsapp" },
      { texto: "E-mail", href: "#", cmsLink: "share-email" },
      { texto: "LinkedIn", href: "#", cmsLink: "share-linkedin" },
    ] },
  },

  relatedOnline: {
    eyebrowGold: "Trilha PROGE · Próximos módulos",
    h2: "Continue a jornada de gestão escolar",
    introHtml: "Outros módulos da trilha <strong>PROGE</strong> e eventos da <strong>NTC Educação</strong> com inscrições antecipadas.",
    cards: [
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "23", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 03 PROGE: Coordenação Pedagógica e Resultados", programBinding: "PROGE", metaHtml: "Online · 8h · 1 dia <strong>Sob consulta</strong>", cta: { texto: "Saiba mais", href: "#contato", cmsLink: "inscricao-PROGE-M03-2026-jun", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "16", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 02 EDUTEC: Fluência Digital Docente e Práticas Pedagógicas Inovadoras", programBinding: "EDUTEC", metaHtml: "Online · 8h · 1 dia <strong>R$ 1.470</strong>", cta: { texto: "Inscrever-se", href: "/agenda/edutec-m02-2026", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "17", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 04 EDUTEC: Currículo e Computação na BNCC", programBinding: "EDUTEC", metaHtml: "Online · 8h · 1 dia <strong>Sob consulta</strong>", cta: { texto: "Saiba mais", href: "/agenda/edutec-m04-2026", cmsLink: "inscricao-EDUTEC-M04-2026-jun", classe: "es-cta" } },
    ],
    footerCtas: [
      { texto: "Ver agenda completa", href: "/capacitacao", cmsLink: "agenda-completa", classe: "btn btn--primary", arrow: true },
      { texto: "Solicitar proposta institucional", href: "/solucoes#contratacao-institucional", cmsLink: "proposta-institucional", classe: "btn btn--secondary" },
    ],
  },
};

// ----------------- Evento: PROGE Módulo 03 2026 (online) -----------------
// Fonte: folder PDF "Módulo 03 PROGE · Coordenação Pedagógica Estratégica" (2026).
// Textos literais do PDF. Fotos: usuário sobe depois.

const eventoProgeM03: EventoOnline = {
  slug: "proge-m03-2026",
  titulo: "Coordenação Pedagógica Estratégica: Mentoria, Recomposição e Gestão da Aprendizagem",
  subtitulo:
    "Coordenação pedagógica forte para apoiar professores, recompor aprendizagens e qualificar a gestão pedagógica da escola.",
  formato: "online",
  dataEvento: "23 de junho de 2026",
  area: "edu",
  card: {
    programaSlug: "PROGE",
    formatoCard: "seminario",
    cidade: "",
    valorReais: 1470,
    deadlineIso: "2026-06-23",
    keywords: "coordenacao pedagogica mentoria recomposicao gestao aprendizagem",
    flags: ["destaque_editorial"],
    imagemUrl: "/img/fotos/_optimized/area-educacao-premium.1920.webp",
    modalidadeLabel: "Online ao vivo + replay",
    formatoLabel: "Seminário",
    coordenacaoNomes: "NTC Educação · Andréa Patapoff, Maria Sílvia Bacila, Vasco Moretto e Maria Inês Fini",
    metaEssenciais: ["8h · 1 dia", "Plataforma EventOn"],
    precoIndividualLabel: "R$ 1.470",
    precoEquipesLabel: "Sob consulta",
    destaqueHome: false,
    diaDataBloco: "23",
    mesAnoDataBloco: "Jun · 2026",
  },

  // Campos de EventoBase não usados pelo layout online (vazios):
  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário PROGE · Coordenação Pedagógica Estratégica", current: true },
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
      { id: "proge-m03-faq-1", pergunta: "Como funciona o acesso ao EventON NTC?", respostaHtml: "Após a confirmação da inscrição, você recebe por e-mail um link de acesso individual com login e senha. O acesso é feito direto pelo navegador, sem necessidade de download de aplicativo." },
      { id: "proge-m03-faq-2", pergunta: "Por quanto tempo terei acesso ao replay?", respostaHtml: "O replay fica disponível por 7 dias após a realização do evento, na Área do Participante. Acesso protegido por login institucional individual." },
      { id: "proge-m03-faq-3", pergunta: "Como recebo o certificado?", respostaHtml: "O certificado é emitido automaticamente até 7 dias após o término do evento, mediante presença mínima de 75% das atividades. Pode ser baixado pela Área do Participante e validado publicamente via código QR." },
      { id: "proge-m03-faq-4", pergunta: "Posso inscrever minha equipe ou rede?", respostaHtml: "Sim. Equipes e órgãos públicos poderão solicitar condição comercial diferenciada conforme quantidade de inscritos, perfil institucional e forma de contratação. Solicite proposta pelo botão lateral." },
      { id: "proge-m03-faq-5", pergunta: "A inscrição inclui materiais?", respostaHtml: "Sim. A inscrição inclui apostila digital específica do módulo-evento, certificado digital e acesso ao replay. Materiais enviados por e-mail e disponibilizados na plataforma EventON NTC." },
      { id: "proge-m03-faq-6", pergunta: "Como contratar uma turma fechada para minha instituição?", respostaHtml: "A NTC desenvolve turmas fechadas para secretarias, autarquias e órgãos públicos. O Instituto NTC poderá apresentar proposta personalizada com condições diferenciadas por escala, suporte operacional e replay. Solicite proposta institucional pelo botão lateral." },
      { id: "proge-m03-faq-7", pergunta: "É possível compor a trilha completa PROGE?", respostaHtml: "Sim. Este Módulo 03 pode ser contratado de forma independente ou integrar a trilha PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance. Consulte a equipe comercial." },
    ],
  },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "", status: "", tituloCard: "", rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "2026-06-23T23:59:59-03:00", tipo: "numerico" },
    acoes: [], share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: {
    titulo: "Seminário PROGE · Coordenação Pedagógica Estratégica: Mentoria, Recomposição e Gestão da Aprendizagem",
    descricao: "Seminário On-Line ao Vivo do programa PROGE · Grupo NTC. Acesso pela plataforma EventON NTC.",
    location: "Plataforma EventON NTC · Online",
    startISO: "20260623T080000",
    endISO: "20260623T180000",
    filename: "PROGE-M03-2026-jun.ics",
  },

  // ---- Seções evt-* (consumidas pelo EventoOnlineLayout) ----
  heroOnline: {
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1Html: "Coordenação Pedagógica <em>Estratégica</em>: Mentoria, Recomposição e Gestão da Aprendizagem",
    sub: "Coordenação pedagógica forte para apoiar professores, recompor aprendizagens e qualificar a gestão pedagógica da escola.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/proge",
      cmsLink: "programa-PROGE",
      nomePrograma: "PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance",
    },
    ctas: [
      { texto: "Inscrever-se", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026", cmsLink: "inscricao-PROGE-M03-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Baixar folder", href: "#", cmsLink: "folder-PROGE-M03", classe: "btn btn--ghost-light" },
      { texto: "Inscrever equipe ou grupo", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026#tab-equipe", cmsLink: "proposta-grupo-PROGE-M03", classe: "btn btn--ghost-light" },
    ],
  },

  metasOnline: [
    { label: "Quando", value: "23 · Junho", valueSub: "2026 · Terça-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "R$ 1.470", valueSub: "por inscrito · individual" },
  ],

  visaoGeralOnline: {
    eyebrow: "Seminário · NTC Educação",
    h2Html: "Uma agenda institucional para a melhoria da <em>escola pública</em>.",
    lede: "A coordenação pedagógica é uma das funções mais decisivas para transformar prioridades curriculares, evidências de aprendizagem e necessidades docentes em práticas reais de sala de aula.",
    paragrafosHtml: [
      "Em muitas redes, porém, essa função ainda é tensionada por demandas administrativas, excesso de urgências e baixa sistematização do acompanhamento pedagógico.",
      "O evento fortalece a coordenação pedagógica como liderança intermediária, responsável por apoiar o professor, organizar a formação em serviço, acompanhar planejamento e práticas de ensino, utilizar evidências de aprendizagem e estruturar ações de recomposição. A formação combina mentoria docente, análise de dados, planejamento pedagógico e cultura colaborativa.",
      "No PROGE, este módulo sustenta a conexão entre gestão escolar, currículo, avaliação e aprendizagem, qualificando o trabalho pedagógico cotidiano e ampliando a capacidade das escolas de promover intervenções consistentes.",
    ],
    moduleBindingHtml: "Este seminário corresponde ao <strong>Módulo 03 da trilha PROGE</strong> — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Direção de Alta Performance. Pode ser contratado de forma independente ou integrar a trilha completa.",
    razoesTituloHtml: "Seis razões para <em>participar</em> deste módulo",
    razoes: [
      { num: "01", titulo: "Fortalecer a coordenação pedagógica como liderança pedagógica da escola", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "02", titulo: "Aprimorar práticas de mentoria, acompanhamento docente e devolutiva formativa", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "03", titulo: "Organizar formação em serviço conectada a necessidades reais de aprendizagem", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "04", titulo: "Estruturar estratégias de recomposição e apoio pedagógico diferenciado", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "05", titulo: "Integração entre mentoria docente, evidências, recomposição e formação em serviço", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
      { num: "06", titulo: "Aplicabilidade direta para coordenadores pedagógicos e equipes escolares", descricao: "Tópico essencial da agenda institucional do módulo, com aplicação direta à realidade da rede." },
    ],
  },

  publicoOnline: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para profissionais que atuam na coordenação pedagógica e na gestão das redes públicas de ensino:",
    chips: [
      "Secretários estaduais e municipais de educação",
      "Dirigentes e equipes técnicas das secretarias de educação",
      "Diretores escolares, vice-diretores e lideranças de unidade",
      "Coordenadores pedagógicos, supervisores, orientadores e articuladores pedagógicos",
      "Formadores de professores e equipes responsáveis por recomposição da aprendizagem",
    ],
    objetivoTitulo: "Objetivo",
    objetivoTexto: "Qualificar a coordenação pedagógica para atuar como núcleo de acompanhamento docente, formação em serviço, monitoramento da aprendizagem e recomposição das aprendizagens essenciais.",
    destaquesTitulo: "Destaques formativos",
    destaques: [
      { num: "01", html: "<strong>O novo papel da coordenação pedagógica</strong> — coordenação como liderança intermediária." },
      { num: "02", html: "<strong>Mentoria docente</strong> — observação de práticas, devolutiva formativa e planejamento em contexto." },
      { num: "03", html: "<strong>Evidências e recomposição</strong> — matrizes de referência, diagnóstico de defasagens e trilhas de aprendizagem." },
      { num: "04", html: "<strong>Cultura colaborativa</strong> — comunidades de aprendizagem e formação em serviço." },
      { num: "05", html: "<strong>Aplicabilidade direta</strong> à direção escolar, coordenação pedagógica e gestão de redes." },
    ],
  },

  programacaoOnline: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Cinco etapas executivas, oito horas de imersão ao vivo.",
    headDayHtml: "23 de <em>Junho</em> · Terça-feira",
    headMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
    nodes: [
      { time: "08h00 – 09h00", ttag: "Abertura · Institucional", num: "I", titulo: "Coordenação Pedagógica Estratégica — eixo estratégico do PROGE", speakerLineHtml: "com <em>Andréa Patapoff</em> · Doutora em Educação · Coordenação Pedagógica", bullets: ["Transformações recentes na gestão escolar e novos papéis da direção.", "Novas exigências das redes públicas contemporâneas.", "A escola como unidade de execução da política educacional."] },
      { time: "09h00 – 11h00", ttag: "Bloco · 01", num: "II", titulo: "O novo papel da coordenação pedagógica", speakerLineHtml: "com <em>Andréa Patapoff</em> · Doutora em Educação · Coordenação Pedagógica", bullets: ["Coordenação como liderança intermediária.", "Gestão pedagógica e foco na aprendizagem."] },
      { time: "11h00 – 12h00", ttag: "Bloco · 02", num: "III", titulo: "Mentoria docente e acompanhamento qualificado", speakerLineHtml: "com <em>Maria Sílvia Bacila</em> · Doutora em Educação · PUCPR · Ex-Sec. Mun. Educação Curitiba", bullets: ["Observação de práticas.", "Devolutiva formativa.", "Planejamento em contexto."] },
      { time: "14h00 – 16h00", ttag: "Bloco · 03", num: "IV", titulo: "Evidências e recomposição das aprendizagens", speakerLineHtml: "com <em>Vasco Moretto</em> · Doutor em Educação · Avaliação da Aprendizagem", bullets: ["Matrizes de referência.", "Diagnóstico de defasagens.", "Trilhas de aprendizagem."] },
      { time: "16h00 – 18h00", ttag: "Bloco · 04", num: "V", titulo: "Cultura colaborativa e desenvolvimento profissional", speakerLineHtml: "com <em>Maria Inês Fini</em> · Doutora em Psicologia da Educação · Ex-Pres. Inep", bullets: ["Comunidades de aprendizagem.", "Formação em serviço.", "Rotinas pedagógicas."] },
    ],
  },

  questoesOnline: {
    eyebrow: "O que você aprenderá",
    h2: "As questões essenciais que serão respondidas nas quatro sessões",
    intro: "Vinte e nove perguntas-guia organizadas por sessão, do fundamento conceitual à implementação institucional.",
    grupos: [
      { sessao: "Sessão · 01", titulo: "O novo papel da coordenação pedagógica", palestrante: "com Andréa Patapoff · 09h00 – 11h00", questoes: [
        { numero: "01", pergunta: "O que significa O novo papel da coordenação pedagógica aplicado à realidade da escola pública contemporânea?" },
        { numero: "02", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "03", pergunta: "De que forma coordenação como liderança intermediária sustenta resultados consistentes na escola pública?" },
        { numero: "04", pergunta: "Como articular Gestão pedagógica com as demais dimensões da rotina escolar?" },
        { numero: "05", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "06", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      { sessao: "Sessão · 02", titulo: "Mentoria docente e acompanhamento qualificado", palestrante: "com Maria Sílvia Bacila · 11h00 – 12h00", questoes: [
        { numero: "07", pergunta: "O que significa Mentoria docente aplicado à realidade da escola pública contemporânea?" },
        { numero: "08", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "09", pergunta: "De que forma observação de práticas sustenta resultados consistentes na escola pública?" },
        { numero: "10", pergunta: "De que forma devolutiva formativa sustenta resultados consistentes na escola pública?" },
        { numero: "11", pergunta: "De que forma planejamento em contexto sustenta resultados consistentes na escola pública?" },
        { numero: "12", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "13", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      // Questões 14, 15 e 16 ausentes no PDF original (gap de numeração entre as páginas 08 e 09 do folder)
      { sessao: "Sessão · 03", titulo: "Evidências e recomposição das aprendizagens", palestrante: "com Vasco Moretto · 14h00 – 16h00", questoes: [
        { numero: "17", pergunta: "O que significa Evidências aplicado à realidade da escola pública contemporânea?" },
        { numero: "18", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "19", pergunta: "De que forma matrizes de referência sustenta resultados consistentes na escola pública?" },
        { numero: "20", pergunta: "De que forma diagnóstico de defasagens sustenta resultados consistentes na escola pública?" },
        { numero: "21", pergunta: "De que forma trilhas de aprendizagem sustenta resultados consistentes na escola pública?" },
        { numero: "22", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
        { numero: "23", pergunta: "Como sustentar essa agenda diante de mudanças de gestão e ciclo político?" },
      ] },
      { sessao: "Sessão · 04", titulo: "Cultura colaborativa e desenvolvimento profissional", palestrante: "com Maria Inês Fini · 16h00 – 18h00", questoes: [
        { numero: "24", pergunta: "O que significa Cultura colaborativa aplicado à realidade da escola pública contemporânea?" },
        { numero: "25", pergunta: "Como esse tema se traduz em prática institucional da direção e da coordenação escolar?" },
        { numero: "26", pergunta: "De que forma comunidades de aprendizagem sustenta resultados consistentes na escola pública?" },
        { numero: "27", pergunta: "De que forma formação em serviço sustenta resultados consistentes na escola pública?" },
        { numero: "28", pergunta: "De que forma rotinas pedagógicas sustenta resultados consistentes na escola pública?" },
        { numero: "29", pergunta: "Quais práticas de gestão fortalecem a coerência institucional nessa frente?" },
      ] },
    ],
    naPratica: {
      titulo: "Na prática · o que você levará do módulo para a sua rede",
      itens: [
        "Repertório executivo ampliado sobre coordenação pedagógica estratégica.",
        "Diretrizes para leitura crítica de indicadores e aplicação à rotina escolar.",
        "Caminhos para articular prioridades pedagógicas e resultados de aprendizagem.",
        "Critérios institucionais para construção e revisão de instrumentos de gestão.",
        "Modelo de plano de ação articulado a metas e acompanhamento contínuo.",
        "Subsídios para mobilizar equipe, comunidade escolar e rede.",
      ],
    },
  },

  palestrantesOnline: {
    eyebrow: "Quem ensina",
    h2Html: "Quatro especialistas de <em>referência nacional</em>",
    intro: "Gestão escolar, governança educacional e direção pública.",
    palestrantes: [
      { foto: "", roleTag: "Palestrante", nome: "Andréa Patapoff", credentials: "Doutora em Educação · Coordenação Pedagógica", bio: "Pedagoga, mestre e doutora em Psicologia Educacional pela Unicamp. Atua em formação de professores, currículo, primeira infância, desenvolvimento infantil e assessoramento técnico a redes públicas." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Maria Sílvia Bacila", credentials: "Doutora em Educação · PUCPR · Ex-Sec. Mun. Educação Curitiba", bio: "Doutora em Educação pela PUCPR, com sólida trajetória em gestão educacional e currículo. Foi secretária municipal de Educação de Curitiba e exerceu função executiva pedagógica em São Paulo." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Vasco Moretto", credentials: "Doutor em Educação · Avaliação da Aprendizagem", bio: "Mestre em Didática das Ciências pela Universidade Laval, licenciado em Física pela UnB e especialista em avaliação institucional. Consultor educacional com experiência em avaliação, currículo, didática e aprendizagem." }, // TODO: foto sobe depois
      { foto: "", roleTag: "Palestrante", nome: "Maria Inês Fini", credentials: "Doutora em Psicologia da Educação · Ex-Pres. Inep", bio: "Pedagoga, doutora em Educação, professora e pesquisadora com destacada atuação em currículo, avaliação e políticas educacionais. Ex-presidente do Inep e referência nacional em avaliação educacional." }, // TODO: foto sobe depois
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
    priceValueHtml: `<span class="cur">R$</span><span class="amt">1.470</span>`,
    priceSub: "por inscrição individual · evento on-line ao vivo de 8 horas",
    includesTitulo: "O que está incluído",
    includes: [
      "Apostila digital específica do módulo-evento",
      "Certificado digital emitido pelo Instituto NTC do Brasil",
      "Acesso individual ao ambiente EventON NTC",
      "Replay integral pelo período informado no folder",
      "Suporte técnico para acesso ao ambiente virtual",
    ],
    modes: [
      { tag: "Individual", titulo: "Inscrição individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { tag: "Grupo", titulo: "Grupos institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada, conforme quantidade de inscritos, perfil institucional da demanda, forma de contratação e disponibilidade operacional." },
      { tag: "Institucional", titulo: "Grandes grupos e turmas fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios, instituições ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada — contemplando condições diferenciadas por escala, política de cortesias institucionais, suporte operacional, período de replay e eventual estruturação de turma exclusiva.", featured: true },
    ],
  },

  regrasOnline: {
    eyebrow: "Política comercial",
    h2: "Regras de participação",
    rules: [
      "O cancelamento e/ou a substituição de inscrição deverá ser solicitado por escrito, pelo e-mail eventosonline@institutontc.com.br ou WhatsApp (63) 98444-4040, até 2 dias úteis antes da realização do evento.",
      "A substituição deverá indicar os dados completos do novo participante — nome completo, e-mail funcional ou institucional, telefone/WhatsApp e órgão de vinculação — para liberação do acesso individual.",
      "A inscrição contratada garante a disponibilização do acesso ao evento on-line ao vivo, ao ambiente EventON NTC, ao material digital, ao suporte técnico e ao replay pelo período informado neste folder.",
      "A ausência, o não acesso, o acesso parcial, o não uso do replay dentro do prazo ou o não cumprimento dos critérios mínimos de presença não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC — que poderá aceitar, a seu critério, a conversão do valor pago em crédito para inscrição em futuros eventos.",
      "Para inscrições institucionais em grupo, a Contratante poderá encaminhar relação consolidada de participantes, preferencialmente em planilha, para cadastramento conjunto e liberação dos acessos individuais.",
      "A relação deverá ser enviada preferencialmente até 2 dias úteis antes do evento, a fim de viabilizar o cadastro, o envio dos acessos e o suporte operacional.",
      "Os inscritos poderão acessar o replay pelo período informado neste folder, observadas as regras de acesso individual e vedado o compartilhamento de login, senha, som, imagem, gravação ou reprodução por qualquer meio.",
      "A certificação será emitida somente após o encerramento do prazo de replay, exclusivamente aos participantes que cumprirem os critérios mínimos de presença e registro no ambiente.",
    ],
  },

  ctaFinalOnline: {
    eyebrowGold: "Próximo passo",
    h2Html: "Garanta sua participação no <em>Módulo 03 PROGE</em>.",
    paragrafo: "Inscrições abertas. Vagas individuais e condição institucional para equipes e órgãos.",
    ctas: [
      { texto: "Inscrever-se agora", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026", cmsLink: "inscricao-PROGE-M03-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026#tab-equipe", cmsLink: "proposta-grupo-PROGE-M03", classe: "btn btn--secondary" },
    ],
  },

  sidebarOnline: {
    coverImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    status: "Inscrições abertas",
    coverEventonHtml: "Acesso via <em>EventON</em>",
    tituloTag: "Módulo 03 · Trilha PROGE",
    rows: [
      { label: "Quando", value: "23 · Jun · 2026" },
      { label: "Modalidade", value: "Online ao vivo + replay" },
      { label: "Carga horária", value: "8 horas" },
      { label: "Plataforma", value: "EventON NTC" },
      { label: "Investimento", value: "R$ 1.470", price: true },
    ],
    includes: {
      titulo: "O que está incluído",
      items: ["8 horas de imersão ao vivo", "Replay por 7 dias após o evento", "Apostila digital do módulo", "Certificado institucional", "Suporte técnico dedicado", "Acesso ao ambiente EventON NTC"],
    },
    countdown: { label: "Prazo de inscrição", dateText: "Até 23 de Junho de 2026", deadline: "2026-06-23T23:59:59-03:00", tipo: "numerico" },
    acoes: [
      { texto: "Inscrever-se", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026", cmsLink: "inscricao-PROGE-M03-2026-jun", classe: "btn btn--gold", arrow: true },
      { texto: "Inscrever equipe ou grupo institucional", href: "/contato?evento=PROGE+M%C3%B3dulo+03&evento_url=/agenda/proge-m03-2026#tab-equipe", cmsLink: "inscricao-equipe-PROGE-M03", classe: "btn btn--secondary" },
    ],
    share: { label: "Compartilhar:", links: [
      { texto: "WhatsApp", href: "#", cmsLink: "share-whatsapp" },
      { texto: "E-mail", href: "#", cmsLink: "share-email" },
      { texto: "LinkedIn", href: "#", cmsLink: "share-linkedin" },
    ] },
  },

  relatedOnline: {
    eyebrowGold: "Trilha PROGE · Próximos módulos",
    h2: "Continue a jornada de gestão escolar",
    introHtml: "Outros módulos da trilha <strong>PROGE</strong> e eventos da <strong>NTC Educação</strong> com inscrições antecipadas.",
    cards: [
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "22", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 01 PROGE: Gestão Escolar em Transformação: Resultados, Recursos e Governança Democrática", programBinding: "PROGE", metaHtml: "Online · 8h · 1 dia <strong>R$ 1.470</strong>", cta: { texto: "Inscrever-se", href: "/agenda/proge-m01-2026", cmsLink: "inscricao-PROGE-M01-2026-jun", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "16", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 02 EDUTEC: Fluência Digital Docente e Práticas Pedagógicas Inovadoras", programBinding: "EDUTEC", metaHtml: "Online · 8h · 1 dia <strong>R$ 1.470</strong>", cta: { texto: "Inscrever-se", href: "/agenda/edutec-m02-2026", cmsLink: "inscricao-EDUTEC-M02-2026-jun", classe: "es-cta" } },
      { area: "edu", coverImg: "/img/fotos/_optimized/area-educacao.1920.webp", date: { tipo: "single", day: "17", monYr: "Jun · 2026" }, program: "Seminário · NTC Educação", titulo: "Módulo 04 EDUTEC: Currículo e Computação: Integrando a BNCC à Prática Pedagógica", programBinding: "EDUTEC", metaHtml: "Online · 8h · 1 dia <strong>R$ 1.470</strong>", cta: { texto: "Inscrever-se", href: "/agenda/edutec-m04-2026", cmsLink: "inscricao-EDUTEC-M04-2026-jun", classe: "es-cta" } },
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
  "edutec-m02-2026": eventoEdutecM02,
  "edutec-m04-2026": eventoEdutecM04,
  "proge-m01-2026": eventoProgeM01,
  "proge-m03-2026": eventoProgeM03,
};

// Ordem curada dos eventos que aparecem nas listagens (Home + Agenda).
// Exclui PROSUS (mantido só como rota /agenda/prosus-brasilia, fora das listas).
export const EVENTOS_LISTAGEM = [
  "edutec-m01-2026",
  "edutec-m02-2026",
  "edutec-m04-2026",
  "proge-m01-2026",
  "proge-m03-2026",
] as const;
