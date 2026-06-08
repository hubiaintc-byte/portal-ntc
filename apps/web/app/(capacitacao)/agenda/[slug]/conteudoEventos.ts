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
        credenciais: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia. Mestranda em Tecnologias Emergentes na Educação, pedagoga, consultora e palestrante. Especialista em Educação Digital e Metodologias Ativas. Google Champions, Innovator e Google Trainer, Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais em uma rede de educação e como formadora de educadores em todo o Brasil. Realiza a coordenação pedagógica de projetos e mentorias, com a missão de impactar positivamente a vida pessoal e profissional de cada participante, no presencial e no virtual. Embaixadora do Canva for Education, ClassDojo e da plataforma Teachy.",
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
      "A ausência, o não acesso, o acesso parcial, o não uso do replay dentro do prazo ou o não cumprimento dos critérios mínimos de presença não implicam reembolso, cancelamento automático ou isenção de pagamento, desde que os meios de acesso tenham sido regularmente disponibilizados pelo Instituto NTC — que poderá aceitar, a seu critério, a conversão do valor pago em crédito para inscrição em futuros eventos.",
      "Órgãos públicos poderão formalizar a contratação mediante Nota de Empenho, Ordem de Serviço, Autorização de Fornecimento ou instrumento contratual equivalente, com posterior pagamento.",
    ],
    precoDestaque: { valor: "R$ 1.470,00", legenda: "Valor por inscrição individual · evento on-line ao vivo de 8 horas" },
    inclui: {
      titulo: "A inscrição inclui",
      items: [
        "Apostila digital específica do módulo-evento",
        "Certificado digital emitido pelo Instituto NTC do Brasil",
        "Acesso individual ao ambiente EventON NTC",
        "Replay integral pelo período informado no folder",
        "Suporte técnico para acesso ao ambiente virtual",
      ],
    },
    modalidades: [
      { rotulo: "Modalidade · 01", titulo: "Inscrição Individual", descricao: "Indicada para participantes avulsos, profissionais independentes, empresas, entidades privadas ou inscrições pontuais realizadas por órgãos e instituições." },
      { rotulo: "Modalidade · 02", titulo: "Grupos Institucionais", descricao: "Órgãos públicos, secretarias, redes de ensino, entidades e instituições interessadas na inscrição de múltiplos participantes poderão solicitar condição comercial diferenciada, conforme quantidade de inscritos, perfil institucional da demanda, forma de contratação e disponibilidade operacional." },
      { rotulo: "Modalidade · 03 · Estratégica", titulo: "Grandes Grupos e Turmas Fechadas", descricao: "Para demandas ampliadas, redes públicas, secretarias, consórcios, instituições ou grupos estratégicos, o Instituto NTC poderá apresentar proposta personalizada — contemplando condições diferenciadas por escala, política de cortesias institucionais, suporte operacional, período de replay e eventual estruturação de turma exclusiva." },
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

// ----------------- Record exportado -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": eventoProsusBrasilia,
  "edutec-m01-2026": eventoEdutecM01,
};
