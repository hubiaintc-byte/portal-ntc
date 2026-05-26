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

  // visaoGeral, publico, programacao, palestrantes, eventon, investimento,
  // regras, faq, ctaFinal, sidebar, relatedModulos vêm em Tasks 5 e 6.
  visaoGeral: {
    eyebrow: "",
    h2: "",
    lede: "",
    paragrafos: [],
    moduleBindingNote: "",
    segundoH2: "",
    whyCards: [],
  },
  publico: {
    eyebrow: "",
    h2: "",
    intro: "",
    chips: [],
    objetivoH2: "",
    objetivoTexto: "",
    destaquesH2: "",
    highlights: [],
  },
  programacao: {
    eyebrow: "",
    h2: "",
    intro: "",
    timeline: { ttDay: "", ttMeta: "", nodes: [] },
  },
  palestrantes: { eyebrow: "", h2: "", palestrantes: [], nota: "" },
  eventon: {
    eyebrow: "",
    h2: "",
    intro: "",
    markName: "",
    markTag: "",
    stats: [],
    features: [],
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
