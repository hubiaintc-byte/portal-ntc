// =============================================================
//  CONTEÚDO LITERAL DE MÓDULOS DE PROGRAMA
//  /PROGRAMAS/[SLUG]/MODULOS/[MODULO]
//
//  Tipos para Modulo (formato "online-ao-vivo" inicial; futuros
//  formatos viram união discriminada quando surgirem).
//
//  Este arquivo é a fonte estática até a coleção Modulo entrar
//  no Payload. Fidelidade 100% ao protótipo HTML correspondente.
// =============================================================

// ----------------- Discriminators -----------------

export type FormatoModulo = "online-ao-vivo";
export type AreaVerticalModulo = "edu" | "gov" | "sau";

// ----------------- Tipos compartilhados básicos -----------------

export interface LinkInterno {
  texto: string;
  href: string;
  cmsLink?: string;
  classe?: string;
  arrow?: boolean;
}

export interface CrumbItemModulo {
  texto: string;
  href?: string;
  cmsLink?: string;
  current?: boolean;
}

export interface MetaItem {
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

export interface WhyCard {
  num: string;
  titulo: string;
  descricao: string;
}

export interface HighlightItem {
  num: string;
  textoHtml: string;
}

export interface ScheduleNode {
  time: string;
  ttag: string;
  num: string;
  titulo: string;
  speakerLine: string;
  topicos: string[];
}

export interface ScheduleTimeline {
  ttDay: string;
  ttMeta: string;
  nodes: ScheduleNode[];
}

export interface Palestrante {
  foto: string;
  roleTag: string;
  nome: string;
  credentials: string;
  bio: string;
}

export interface EventonStat { n: string; l: string; }

export interface EventonFeat {
  iconSvg: string;
  titulo: string;
  descricao: string;
}

export interface InvestMode {
  tag: string;
  titulo: string;
  descricao: string;
  featured?: boolean;
}

export interface ItemFaqModulo {
  id: string;
  pergunta: string;
  respostaHtml: string;
}

export type RelatedModuloDate =
  | { tipo: "range"; daysStart: string; dash: string; daysEnd: string; monYr: string }
  | { tipo: "single"; day: string; monYr: string };

export interface RelatedModuloCard {
  area: AreaVerticalModulo;
  coverImg: string;
  date: RelatedModuloDate;
  program: string;
  titulo: string;
  programBinding: string;
  metaHtml: string;
  cta: LinkInterno;
}

export interface SidebarModulo {
  coverImg: string;
  status: string;
  coverEventon: string;
  titleTag: string;
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

export interface HeroModulo {
  bgImg: string;
  tags: Array<{
    texto: string;
    classe: "evt-hero-status" | "evt-hero-format" | "evt-hero-vert";
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
  moduleBindingNote: string;
  segundoH2: string;
  whyCards: WhyCard[];
}

export interface SecaoPublico {
  eyebrow: string;
  h2: string;
  intro: string;
  chips: AudienceChip[];
  objetivoH2: string;
  objetivoTexto: string;
  destaquesH2: string;
  highlights: HighlightItem[];
}

export interface SecaoProgramacao {
  eyebrow: string;
  h2: string;
  intro: string;
  timeline: ScheduleTimeline;
}

export interface SecaoPalestrantes {
  eyebrow: string;
  h2: string;
  palestrantes: Palestrante[];
  nota: string;
}

export interface SecaoEventon {
  eyebrow: string;
  h2: string;
  intro: string;
  markName: string;
  markTag: string;
  stats: EventonStat[];
  features: EventonFeat[];
}

export interface SecaoInvestimento {
  eyebrow: string;
  h2: string;
  block: {
    priceLabel: string;
    priceCur: string;
    priceAmt: string;
    priceSub: string;
    includesTitulo: string;
    includesItems: string[];
  };
  modes: InvestMode[];
}

export interface SecaoRegras {
  eyebrow: string;
  h2: string;
  rules: string[];
}

export interface SecaoFaq {
  eyebrow: string;
  h2: string;
  faqs: ItemFaqModulo[];
}

export interface SecaoCtaFinal {
  eyebrowGold: string;
  h2: string;
  paragrafo: string;
  ctas: LinkInterno[];
}

export interface SecaoRelatedModulos {
  eyebrowGold: string;
  h2: string;
  intro: string;
  cards: RelatedModuloCard[];
  footerCtas: LinkInterno[];
}

// ----------------- Módulo (base) -----------------

export interface Modulo {
  slugPrograma: string;
  slugModulo: string;
  formato: FormatoModulo;
  metaTitle: string;
  metaDescription: string;
  area: AreaVerticalModulo;
  crumb: CrumbItemModulo[];
  hero: HeroModulo;
  metas: MetaItem[];
  navLinks: NavLink[];
  visaoGeral: SecaoVisaoGeral;
  publico: SecaoPublico;
  programacao: SecaoProgramacao;
  palestrantes: SecaoPalestrantes;
  eventon: SecaoEventon;
  investimento: SecaoInvestimento;
  regras: SecaoRegras;
  faq: SecaoFaq;
  ctaFinal: SecaoCtaFinal;
  sidebar: SidebarModulo;
  relatedModulos: SecaoRelatedModulos;
  agendaIcs: {
    titulo: string;
    descricao: string;
    location: string;
    startISO: string;
    endISO: string;
    filename: string;
  };
}

// ----------------- Módulo: EDUTEC M01 (online ao vivo) -----------------
// Porta literal de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html

const moduloEdutecM01: Modulo = {
  slugPrograma: "edutec",
  slugModulo: "m01",
  formato: "online-ao-vivo",
  metaTitle:
    "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação · 27 Mai 2026 · Grupo NTC",
  metaDescription:
    "Seminário On-Line ao Vivo · Cultura Digital, Educação Midiática e Transformação da Educação · 27 de Maio de 2026 · 8 horas · Plataforma EventON NTC. Integra o programa estratégico EDUTEC do NTC Educação.",
  area: "edu",

  crumb: [
    { texto: "Grupo NTC", href: "/", cmsLink: "home" },
    { texto: "Capacitação", href: "/capacitacao", cmsLink: "agenda-completa" },
    { texto: "Eventos online", href: "/capacitacao/agenda", cmsLink: "eventos-online" },
    { texto: "Seminário EDUTEC · Cultura Digital", current: true },
  ],

  hero: {
    bgImg: "/img/fotos/_optimized/area-educacao.1920.webp",
    tags: [
      { texto: "Inscrições abertas", classe: "evt-hero-status" },
      { texto: "Seminário Online ao Vivo", classe: "evt-hero-format" },
      { texto: "NTC Educação", classe: "evt-hero-vert" },
    ],
    h1: `Cultura Digital, Educação Midiática e <em>Transformação</em> da Educação`,
    sub: "Fundamentos, repertórios e práticas para consolidar uma pedagogia crítica, conectada e institucionalmente alinhada à cultura digital contemporânea.",
    programBinding: {
      texto: "Integra o programa",
      href: "/programas/edutec",
      cmsLink: "programa-EDUTEC",
      nomePrograma:
        "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    },
    ctas: [
      {
        texto: "Inscrever-se",
        href: "#contato",
        cmsLink: "inscricao-EDUTEC-M01-2026-mai",
        classe: "btn btn--gold",
        arrow: true,
      },
      {
        texto: "Baixar folder",
        href: "#",
        cmsLink: "folder-EDUTEC-M01",
        classe: "btn btn--ghost-light",
      },
      {
        texto: "Inscrever equipe ou grupo",
        href: "/contato?evento=Seminário+EDUTEC+M01+–+Cultura+Digital&evento_url=/programas/edutec/modulos/m01#tab-equipe",
        cmsLink: "proposta-grupo-EDUTEC-M01",
        classe: "btn btn--ghost-light",
      },
    ],
  },

  metas: [
    { label: "Quando", value: "27 · Maio", valueSub: "2026 · Quarta-feira" },
    { label: "Modalidade", value: "Ao vivo", valueSub: "+ replay por 7 dias" },
    { label: "Carga horária", value: "8 horas", valueSub: "Manhã (4h) + Tarde (4h)" },
    { label: "Plataforma", value: "EventON NTC", valueSub: "Acesso individual" },
    { label: "Investimento", value: "Sob consulta", valueSub: "Equipes e órgãos" },
  ],

  navLinks: [
    { texto: "Visão geral", href: "#visao-geral", isActive: true },
    { texto: "Público", href: "#publico" },
    { texto: "Programação", href: "#programacao" },
    { texto: "Palestrantes", href: "#palestrantes" },
    { texto: "EventOn", href: "#eventon" },
    { texto: "Investimento", href: "#investimento" },
    { texto: "Regras", href: "#regras" },
    { texto: "FAQ", href: "#faq" },
  ],

  visaoGeral: {
    eyebrow: "Visão geral",
    h2: `Uma agenda institucional para uma <em>educação digital crítica</em>, conectada e contemporânea.`,
    lede: "Este seminário aborda a cultura digital e a educação midiática como dimensões estruturantes da formação contemporânea, reconhecendo que a escola pública está diante de um ambiente social profundamente marcado por telas, plataformas, algoritmos e novas linguagens de participação.",
    paragrafos: [
      "<strong>Formar estudantes para apenas utilizar tecnologia é insuficiente</strong>: é necessário desenvolver leitura crítica, autoria, responsabilidade, discernimento e capacidade de participação qualificada no ecossistema informacional.",
      "A proposta apoia redes públicas e instituições educacionais na consolidação de práticas pedagógicas mais inovadoras, intencionais e conectadas aos desafios do presente. Ao articular fundamentos conceituais, curadoria pedagógica, educação midiática e estratégias de transformação digital, oferece repertório para que gestores, coordenadores e professores compreendam a tecnologia como linguagem, ambiente cultural e instrumento pedagógico a serviço da aprendizagem.",
    ],
    moduleBindingNote: `Este seminário corresponde ao <strong>Módulo 01 da trilha EDUTEC</strong> — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino. Pode ser contratado de forma independente ou integrar a trilha completa.`,
    segundoH2: `Seis razões para <em>participar</em> deste seminário`,
    whyCards: [
      {
        num: "01",
        titulo: "Sua rede precisa de uma agenda institucional para a cultura digital",
        descricao: "Frente à presença massiva de telas, plataformas e algoritmos, a escola pública precisa de uma resposta institucional coerente — este módulo organiza essa agenda.",
      },
      {
        num: "02",
        titulo: "Tema conduzido por especialistas de referência nacional",
        descricao: "Roberta Aquino (Unicamp · ISTE), Mariana Ochs (EducaMídia · USP) e Karla Priscilla (Google Innovator) — três das principais referências brasileiras em cultura digital aplicada à educação.",
      },
      {
        num: "03",
        titulo: "Combina fundamentação e oficinas aplicadas",
        descricao: "Não é teoria abstrata: o módulo entrega oficinas com critérios de curadoria, instrumentos de avaliação de recursos digitais e diretrizes de transformação institucional.",
      },
      {
        num: "04",
        titulo: "Trilha EDUTEC com flexibilidade contratual",
        descricao: "Pode ser contratado como módulo independente ou compor a trilha completa EDUTEC — adequando-se ao planejamento e ao orçamento da rede ou instituição.",
      },
      {
        num: "05",
        titulo: "Experiência acontece na plataforma EventON NTC",
        descricao: "Ambiente virtual institucional do Instituto NTC, com transmissão ao vivo, alta definição, suporte técnico dedicado e replay garantido — sem necessidade de download.",
      },
      {
        num: "06",
        titulo: "Certificação institucional do Instituto NTC do Brasil",
        descricao: "Certificação válida como atualização profissional, mediante 75% de presença — emitida pela referência institucional em capacitação para o setor público brasileiro.",
      },
    ],
  },

  publico: {
    eyebrow: "Para quem",
    h2: "Público-alvo",
    intro: "O seminário é dimensionado para profissionais que atuam na construção da agenda digital das redes públicas:",
    chips: [
      { texto: "Secretários e dirigentes de educação" },
      { texto: "Equipes técnicas e gestores escolares" },
      { texto: "Coordenadores pedagógicos" },
      { texto: "Professores e formadores de educadores" },
      { texto: "Profissionais de educação digital, currículo e mídias" },
      { texto: "Gestores de inovação pedagógica" },
    ],
    objetivoH2: "Objetivo",
    objetivoTexto: "Compreender os fundamentos do letramento digital e da educação midiática, fortalecer práticas pedagógicas críticas e apoiar redes na formação de estudantes mais autônomos, críticos e responsáveis no uso de mídias e tecnologias — integrando competências digitais ao currículo e às práticas pedagógicas da rede.",
    destaquesH2: "Destaques formativos",
    highlights: [
      { num: "01", textoHtml: "<strong>Fundamentos da cultura digital</strong> e seus impactos sobre educação, comunicação e aprendizagem." },
      { num: "02", textoHtml: "<strong>Educação midiática</strong> e competências do século 21 para o ensino básico." },
      { num: "03", textoHtml: "<strong>Curadoria pedagógica</strong> de recursos digitais com critérios de qualidade e intencionalidade." },
      { num: "04", textoHtml: "<strong>Letramento crítico, autoria e cidadania digital</strong> integrados ao currículo." },
      { num: "05", textoHtml: "<strong>Transformação digital institucional</strong> da visão estratégica à execução prática." },
    ],
  },

  programacao: {
    eyebrow: "Cronograma",
    h2: "Programação detalhada",
    intro: "Quatro sessões aplicadas, oito horas de imersão ao vivo combinando palestra, oficinas e síntese pedagógica final.",
    timeline: {
      ttDay: `27 de <em>Maio</em> · Quarta-feira`,
      ttMeta: "08h00 às 18h00 · 8 horas · EventON NTC",
      nodes: [
        {
          time: "08h00 – 10h00",
          ttag: "Palestra · 01",
          num: "I",
          titulo: "Cultura digital e os novos paradigmas da educação contemporânea",
          speakerLine: `com <em>Roberta Aquino</em> · Doutora em Ciências (Unicamp) · Educadora ISTE`,
          topicos: [
            "Fundamentos da cultura digital e seus impactos sobre educação, comunicação e aprendizagem.",
            "Transformações nas formas de produzir, acessar e compartilhar informações.",
            "O papel da escola diante da conectividade, da multiplicidade de fontes e da sociedade em rede.",
          ],
        },
        {
          time: "10h00 – 12h00",
          ttag: "Oficina · 01",
          num: "II",
          titulo: "Aprendizagem no século 21: a importância da educação midiática",
          speakerLine: `com <em>Mariana Ochs</em> · Coordenadora EducaMídia · Instituto Palavra Aberta`,
          topicos: [
            "Competências essenciais para uso crítico, ético e intencional de mídias e tecnologias.",
            "Análise de conteúdos, plataformas e discursos no ambiente digital.",
            "Caminhos para integrar essas competências ao currículo da rede.",
          ],
        },
        {
          time: "14h00 – 16h00",
          ttag: "Oficina · 02",
          num: "III",
          titulo: "Curadoria pedagógica de recursos digitais: critérios, qualidade e intencionalidade",
          speakerLine: `com <em>Karla Priscilla</em> · Mestranda em Tecnologias Emergentes · Google Innovator`,
          topicos: [
            "Desenvolvimento da competência de busca e seleção crítica de recursos educacionais.",
            "Avaliação de recursos educacionais e aderência ao contexto pedagógico.",
            "Uso de recursos digitais para ampliar a participação e a expressão dos estudantes.",
          ],
        },
        {
          time: "16h00 – 18h00",
          ttag: "Oficina · 03",
          num: "IV",
          titulo: "Transformação digital na educação: da visão à implementação",
          speakerLine: `com <em>Roberta Aquino</em> · Especialista em transformação digital institucional`,
          topicos: [
            "Prioridades institucionais para implementação do tema em escolas e sistemas de ensino.",
            "Articulação entre currículo, formação e cultura institucional.",
            "Possibilidades de projetos integradores, trilhas e ações formativas.",
          ],
        },
      ],
    },
  },

  palestrantes: {
    eyebrow: "Quem ensina",
    h2: `Três especialistas de <em>referência nacional</em>`,
    palestrantes: [
      {
        foto: "/img/fotos/_optimized/expert-03.1920.webp",
        roleTag: "Palestrante",
        nome: "Roberta Aquino",
        credentials: "Doutora em Ciências · Unicamp · Educadora ISTE · Google Innovator",
        bio: "Professora de pós-graduação, palestrante internacional e consultora educacional. Especialista em tecnologias educacionais, metodologias ativas e inovação. Doutora em Ciências pela Unicamp, Educadora Certificada ISTE, Google Innovator, Trainer e Coach. Mentora GEG para a América Latina. Canva Education Partner, Embaixadora de Genially, Wakelet, Wayground, Padlet e BookCreator.",
      },
      {
        foto: "/img/fotos/_optimized/expert-02.1920.webp",
        roleTag: "Palestrante",
        nome: "Karla Priscilla",
        credentials: "Mestranda em Tecnologias Emergentes · Google Innovator · EducaMídia",
        bio: "Mestranda em Tecnologias Emergentes na Educação, pedagoga, consultora e palestrante. Google Champions, Innovator e Trainer. Educadora Maker e Facilitadora do EducaMídia. Atua como gestora de inovação e tecnologias educacionais e formadora de educadores em todo o Brasil. Embaixadora do Canva for Education, ClassDojo e plataforma Teachy.",
      },
      {
        foto: "/img/fotos/_optimized/expert-04.1920.webp",
        roleTag: "Palestrante",
        nome: "Mariana Ochs",
        credentials: "Coordenadora EducaMídia · Instituto Palavra Aberta · USP",
        bio: "Designer, jornalista e especialista em cultura digital na educação. Coordenadora do EducaMídia, programa de educação midiática do Instituto Palavra Aberta. Pós-graduação em Letramento Digital pela Universidade de Rhode Island; pós-graduanda na USP, pesquisando letramento algorítmico. Coautora do Guia da Educação Midiática e do e-book Educação Midiática e Inteligência Artificial.",
      },
    ],
    nota: "Fotografias oficiais dos palestrantes serão sincronizadas a partir do folder do evento via CMS.",
  },

  eventon: {
    eyebrow: "Plataforma de acesso",
    h2: `Como funciona no <em>EventON NTC</em>`,
    intro: "O seminário acontece na plataforma institucional do Instituto NTC do Brasil — ambiente virtual seguro com transmissão ao vivo, suporte dedicado e replay protegido.",
    markName: `Event<em>ON</em>`,
    markTag: "Plataforma Institucional · NTC",
    stats: [
      { n: "5.000", l: "Participantes simultâneos" },
      { n: "30 FPS", l: "Vídeo em alta definição" },
      { n: "100%", l: "Acesso institucional" },
    ],
    features: [
      {
        iconSvg: `<path d="M12 2 4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4Z"/>`,
        titulo: "Plataforma segura e escalável",
        descricao: "Alcance de até 5.000 participantes simultâneos, com estabilidade operacional e segurança institucional para eventos formais.",
      },
      {
        iconSvg: `<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M8 22h8"/>`,
        titulo: "Alta definição",
        descricao: "Transmissão em 30 FPS, com vídeo e áudio de alta qualidade independente do dispositivo — desktop, laptop, tablet ou telefone.",
      },
      {
        iconSvg: `<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`,
        titulo: "Fácil e acessível",
        descricao: "Nenhum download é necessário. Acesso individual por login e senha, com interface simplificada e navegação institucional intuitiva.",
      },
      {
        iconSvg: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>`,
        titulo: "Interação ao vivo",
        descricao: "Faça perguntas, participe de pesquisas em tempo real e até apresente conteúdos em momentos previamente combinados com a coordenação.",
      },
      {
        iconSvg: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
        titulo: "Replay institucional · 7 dias",
        descricao: "Acesso ao replay integral do evento por 7 dias após a realização — para revisão, aprofundamento e referência institucional posterior.",
      },
      {
        iconSvg: `<circle cx="12" cy="9" r="6"/><path d="M9 14.5V21l3-2 3 2v-6.5"/>`,
        titulo: "Certificação institucional",
        descricao: "Certificado válido como atualização profissional, mediante 75% de presença — emitido pelo Instituto NTC do Brasil.",
      },
    ],
  },
  investimento: {
    eyebrow: "",
    h2: "",
    block: {
      priceLabel: "",
      priceCur: "",
      priceAmt: "",
      priceSub: "",
      includesTitulo: "",
      includesItems: [],
    },
    modes: [],
  },
  regras: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    coverEventon: "",
    titleTag: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedModulos: {
    eyebrowGold: "",
    h2: "",
    intro: "",
    cards: [],
    footerCtas: [],
  },

  agendaIcs: {
    titulo:
      "Seminário EDUTEC · Cultura Digital, Educação Midiática e Transformação da Educação",
    descricao:
      "Seminário On-Line ao Vivo · Cultura Digital, Educação Midiática e Transformação da Educação · 27 de Maio de 2026 · 8 horas · Plataforma EventON NTC. Integra o programa estratégico EDUTEC do NTC Educação.",
    location: "EventON NTC — Plataforma Online",
    startISO: "20260527T110000Z",
    endISO: "20260527T210000Z",
    filename: "EDUTEC-M01-2026-mai.ics",
  },
};

// ----------------- Lookup nested -----------------
// MODULOS_PROGRAMAS é um Record nested: programa-slug → módulo-slug → Modulo.

export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {
  edutec: {
    m01: moduloEdutecM01,
  },
};

export function lookupModulo(
  slugPrograma: string,
  slugModulo: string,
): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
