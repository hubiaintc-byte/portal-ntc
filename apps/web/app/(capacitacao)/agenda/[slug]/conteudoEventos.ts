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
  | { tipo: "range"; days: string; dash: string; monYr: string }
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

  // visaoGeral, publico, objetivos, conteudoProgramatico, programacao,
  // palestrantes, diferenciais, local, replayCert, investimento, faq,
  // ctaFinal, sidebar, relatedEvents, agendaIcs vêm em Tasks 5 e 6.
  visaoGeral: { eyebrow: "", h2: "", lede: "", paragrafos: [] },
  publico: { eyebrow: "", h2: "", intro: "", chips: [] },
  objetivos: { eyebrow: "", h2: "", objetivos: [] },
  conteudoProgramatico: { eyebrow: "", h2: "", intro: "", itens: [] },
  programacao: { eyebrow: "", h2: "", intro: "", dias: [] },
  palestrantes: { eyebrow: "", h2: "", intro: "", palestrantes: [], nota: "" },
  diferenciais: { eyebrow: "", h2: "", diferenciais: [] },
  local: {
    eyebrow: "",
    h2: "",
    venueInfo: { titulo: "", enderecoLinhas: [], meta: "", hospedagemHtml: "" },
    mapLabel: "",
    pinLabel: "",
  },
  replayCert: { eyebrow: "", h2: "", cards: [] },
  investimento: { eyebrow: "", h2: "", rules: [] },
  faq: { eyebrow: "", h2: "", faqs: [] },
  ctaFinal: { eyebrowGold: "", h2: "", paragrafo: "", ctas: [] },
  sidebar: {
    coverImg: "",
    status: "",
    tituloCard: "",
    rows: [],
    includes: { titulo: "", items: [] },
    countdown: { label: "", dateText: "", deadline: "", tipo: "numerico" },
    acoes: [],
    share: { label: "", links: [] },
  },
  relatedEvents: { eyebrowGold: "", h2: "", intro: "", cards: [], footerCtas: [] },
  agendaIcs: { titulo: "", descricao: "", location: "", startISO: "", endISO: "", filename: "" },
};

// ----------------- Record exportado -----------------

export const EVENTOS_AGENDA: Record<string, Evento> = {
  "prosus-brasilia": eventoProsusBrasilia,
};
