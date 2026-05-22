/**
 * Tipo `ConteudoPrograma` e índice agregador dos 15 programas.
 *
 * Cada programa tem seu próprio arquivo `conteudo<SIGLA>.ts` com o
 * objeto literal exportado. Este índice apenas registra todos eles
 * em `PROGRAMAS` para consumo pela rota dinâmica.
 *
 * Política da porta do HTML: conteúdo é cópia 1:1 dos protótipos
 * (CLAUDE.md §5.3). Sem CMS nesta versão.
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

import { AGIP } from "./conteudoAGIP";
import { EDUTEC } from "./conteudoEDUTEC";
import { EGIDE } from "./conteudoEGIDE";
import { FUTURA } from "./conteudoFUTURA";
import { LIDERA } from "./conteudoLIDERA";
import { PEAR } from "./conteudoPEAR";
import { PEI } from "./conteudoPEI";
import { PINEI } from "./conteudoPINEI";
import { PROGE } from "./conteudoPROGE";
import { PROGIR } from "./conteudoPROGIR";
import { SIGA } from "./conteudoSIGA";
import { VIVAESCOLA } from "./conteudoVIVAESCOLA";

export const PROGRAMAS: Record<string, ConteudoPrograma> = {
  [AGIP.slug]: AGIP,
  [EDUTEC.slug]: EDUTEC,
  [EGIDE.slug]: EGIDE,
  [FUTURA.slug]: FUTURA,
  [LIDERA.slug]: LIDERA,
  [PEAR.slug]: PEAR,
  [PEI.slug]: PEI,
  [PINEI.slug]: PINEI,
  [PROGE.slug]: PROGE,
  [PROGIR.slug]: PROGIR,
  [SIGA.slug]: SIGA,
  [VIVAESCOLA.slug]: VIVAESCOLA,
};

export const SLUGS_VALIDOS: string[] = Object.keys(PROGRAMAS);

export function calcularRelacionados(slugAtual: string): RelacionadoPrograma[] {
  const atual = PROGRAMAS[slugAtual];
  if (!atual) return [];
  return Object.values(PROGRAMAS)
    .filter((p) => p.vertical === atual.vertical && p.slug !== slugAtual)
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      sigla: p.siglaExibida,
      nomeCurto: p.nomeCompleto,
      descritor: p.breadcrumb.current,
    }));
}
