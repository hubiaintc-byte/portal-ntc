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

// ----------------- Lookup nested -----------------
// MODULOS_PROGRAMAS é um Record nested: programa-slug → módulo-slug → Modulo.
// Dados vêm em Tasks 4-6.

export const MODULOS_PROGRAMAS: Record<string, Record<string, Modulo>> = {};

export function lookupModulo(
  slugPrograma: string,
  slugModulo: string,
): Modulo | undefined {
  return MODULOS_PROGRAMAS[slugPrograma]?.[slugModulo];
}
