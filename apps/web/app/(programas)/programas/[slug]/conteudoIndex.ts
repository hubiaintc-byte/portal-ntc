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
  corpoHtml: string;
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
  problema: BlocoEditorial;
  publico: BlocoEditorial;
  eixos: { eyebrow: string; titulo: string; itens: EixoTematico[] };
  modulos: { eyebrow: string; titulo: string; itens: Modulo[] };
  resultados: BlocoEditorial;
  docentes: { eyebrow: string; titulo: string; descricaoHtml?: string };
  modalidades: BlocoEditorial;
  modulosAbertos: BlocoEditorial;
  faq: { eyebrow: string; titulo: string; itens: FaqItem[] };
}

import { LIDERA } from "./conteudoLIDERA";

export const PROGRAMAS: Record<string, ConteudoPrograma> = {
  [LIDERA.slug]: LIDERA,
};

export const SLUGS_VALIDOS: string[] = Object.keys(PROGRAMAS);

export function calcularRelacionados(slugAtual: string): RelacionadoPrograma[] {
  const atual = PROGRAMAS[slugAtual];
  if (!atual) return [];
  return Object.values(PROGRAMAS)
    .filter((p) => p.vertical === atual.vertical && p.slug !== slugAtual)
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      sigla: p.siglaExibida,
      nomeCurto: p.nomeCompleto,
      descritor: p.breadcrumb.current,
    }));
}
