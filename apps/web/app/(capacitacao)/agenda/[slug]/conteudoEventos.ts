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
  | { tipo: "multi"; count: string; number: string; period: string };

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
  precoDestaque?: { valor: string; legenda: string };
  inclui?: { titulo: string; items: string[] };
  modalidades?: ModalidadeContratacao[];
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
  plataforma?: SecaoPlataforma;
  questoes?: SecaoQuestoes;
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

// ----------------- Record exportado -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": eventoProsusBrasilia,
};
