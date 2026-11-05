/**
 * Tipos do conteúdo das páginas de programa (/programas/[slug]).
 * Movidos de apps/web para que o CMS e o site compartilhem a mesma forma.
 */

export type Vertical = "educacao" | "gestao-publica" | "saude";

export interface CtaPrograma {
  rotulo: string;
  href: string;
  variante?: "gold" | "ghost-light";
}

export interface StatHero {
  num: string;
  lbl: string;
}

export interface MetaItem {
  rotulo: string;
  valor: string;
  valorSub?: string;
}

export interface EixoTematico {
  titulo: string;
  descricao: string;
}

export interface Modulo {
  numero: string;
  titulo: string;
  descricao: string;
  cargaHoraria?: string;
  statusRotulo?: string;
  statusTipo?: "aberto" | "breve";
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface RelacionadoPrograma {
  slug: string;
  sigla: string;
  nomeCurto: string;
  descritor: string;
}

export interface NavAnchor {
  href: string;
  rotulo: string;
}

export interface BlocoEditorial {
  eyebrow: string;
  titulo: string;
  tituloHtml?: string;
  corpoHtml: string;
}

export interface DetalhamentoItem {
  numero: string;
  titulo: string;
  cargaHoraria: string;
  descricao: string;
  topicos: string[];
  ctaInscricao?: boolean;
}

export interface Detalhamento {
  eyebrow: string;
  titulo: string;
  tituloHtml?: string;
  intro: string;
  itens: DetalhamentoItem[];
}

export interface DiferencialItem {
  titulo: string;
  descricao: string;
}

export interface Diferenciais {
  eyebrow: string;
  titulo: string;
  tituloHtml?: string;
  itens: DiferencialItem[];
}

export interface CoordenacaoDocente {
  tag: string;
  imgSrc: string;
  imgAlt: string;
  axisBadge: string;
  nome: string;
  credencial: string;
  eixo: string;
  modulos: string;
}

export interface EspecialistaDocente {
  imgSrc: string;
  imgAlt: string;
  axisBadge: string;
  nome: string;
  credencial: string;
  modulos: string;
}

export interface DocentesRich {
  eyebrow: string;
  titulo: string;
  tituloHtml?: string;
  pill: string;
  introHtml: string;
  coordenacaoMarker: string;
  coordenacao: CoordenacaoDocente[];
  especialistasMarker: string;
  especialistas: EspecialistaDocente[];
  counters: { num: string; lbl: string }[];
  nota: string;
  ctaPrimario: string;
  ctaSecundario: string;
}

export interface EventoMini {
  bgImg: string;
  dataLabel: { dias: string; mesAno: string };
  eyebrow: string;
  titulo: string;
  metaHtml: string;
  ctaRotulo: string;
}

export interface EventoFeature {
  badge: string;
  bgImg: string;
  dataLabel: { dias: string; mesAno: string };
  modalidade: string;
  eyebrow: string;
  titulo: string;
  binding: string;
  metas: string[];
  ctaPrimario: string;
  ctaSecundario: string;
}

export interface ModulosAbertosRich {
  eyebrow: string;
  titulo: string;
  tituloHtml?: string;
  corpoHtml: string;
  feature?: EventoFeature;
  miniStack?: EventoMini[];
  microcopy: string;
  bottomCtas: { rotulo: string; href: string; primario: boolean }[];
}

export interface CtaFinal {
  eyebrow: string;
  tituloHtml: string;
  corpo: string;
}

export interface ConteudoPrograma {
  sigla: string;
  siglaCss: string;
  siglaExibida: string;
  slug: string;
  nomeCompleto: string;
  vertical: Vertical;
  verticalRotulo: string;
  breadcrumb: { current: string };
  hero: {
    bgSrc: string;
    eyebrow: string;
    stats: StatHero[];
    tituloHtml: string;
    sub: string;
    ctas: CtaPrograma[];
  };
  metaBar: MetaItem[];
  navAnchors: NavAnchor[];
  visaoGeral: BlocoEditorial;
  problema: BlocoEditorial & { destaqueHtml?: string };
  objetivoGeral?: BlocoEditorial;
  publico: BlocoEditorial & { chips?: string[] };
  eixos: { eyebrow: string; titulo: string; tituloHtml?: string; itens: EixoTematico[] };
  modulos: { eyebrow: string; titulo: string; tituloHtml?: string; intro?: string; itens: Modulo[] };
  detalhamento?: Detalhamento;
  resultados: BlocoEditorial;
  diferenciais?: Diferenciais;
  docentes: DocentesRich;
  modalidades: BlocoEditorial;
  modulosAbertos: ModulosAbertosRich;
  faq: { eyebrow: string; titulo: string; tituloHtml?: string; itens: FaqItem[] };
  ctaFinal?: CtaFinal;
  sidebar?: {
    titulo: string;
    rows: { rotulo: string; valor: string }[];
    entregasTitulo: string;
    entregas: string[];
  };
}

/* ------------------------------------------------------------------------ *
 * Campos do CMS que alimentam a página (Task 4 do plano de 05/11/2026).
 * `PaginaPrograma` espelha o group `pagina` de `programas` (aba "Página do
 * site"), com as imagens já resolvidas para URL e as listas de um texto só
 * achatadas para `string[]`.
 * ------------------------------------------------------------------------ */

export interface DocentePagina {
  imgSrc: string;
  imgAlt: string;
  eixoBadge: string;
  nome: string;
  credencial: string;
  modulos: string;
}

export interface CoordenacaoPagina extends DocentePagina {
  tag: string;
  eixo: string;
}

export interface CartaoModalidadePagina {
  destaque: boolean;
  tag: string;
  titulo: string;
  descricao: string;
  ctaRotulo: string;
  ctaHref: string;
}

export interface PaginaPrograma {
  /** "vertente" ou a sigla CSS de um dos 15 estilos (`data-programa`). */
  identidadeVisual: string;
  heroTitulo: string;
  heroSubtitulo: string;
  heroImagem: string;
  barraDados: { rotulo: string; valor: string; valorSub: string }[];
  visaoGeralTitulo: string;
  problemaTitulo: string;
  problemaDestaque: string;
  publicoChips: string[];
  docentes: {
    titulo: string;
    intro: string;
    coordenacaoMarcador: string;
    especialistasMarcador: string;
    contadores: { num: string; lbl: string }[];
    nota: string;
    coordenacao: CoordenacaoPagina[];
    especialistas: DocentePagina[];
  };
  modalidadesIntro: string;
  modalidadesCards: CartaoModalidadePagina[];
  modulosAbertosMicrocopy: string;
  chamadaFinalTitulo: string;
  chamadaFinalTexto: string;
  resumoLateral: { rotulo: string; valor: string }[];
  entregas: string[];
  cartao: { nome: string; tagline: string; meta: string; imagem: string; ordem: number | null };
}

export interface ModuloPrograma {
  numero: number;
  titulo: string;
  /** Lexical (só a descrição da página; os tópicos ficam em `topicos`). */
  descricao: unknown;
  topicos: string[];
  cargaHoraria: string;
}

export interface CamposPaginaPrograma {
  sigla: string;
  slug: string;
  nomeCompleto: string;
  vertical: Vertical;
  /** Ex.: "64 horas". */
  cargaHorariaTotal: string;
  /** Lexical, só a parte da página. */
  visaoGeral: unknown;
  problema: unknown;
  objetivo: unknown | null;
  publicoAlvo: unknown;
  eixos: { titulo: string; descricao: string }[];
  resultados: string[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: unknown }[];
  /** Ordenados por `numero`. */
  modulos: ModuloPrograma[];
  pagina: PaginaPrograma;
}

export interface ExtrasEventos {
  modulosAbertos: Pick<ModulosAbertosRich, "feature" | "miniStack">;
  status: Map<number, { rotulo: string; tipo: "aberto" | "breve" }>;
}
