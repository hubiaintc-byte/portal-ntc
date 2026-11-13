/**
 * Textos do catálogo que a proposta copia, montados a partir das partes.
 *
 * Na importação de 30/09 três campos entraram com duas partes da página
 * juntas num só documento Lexical: `problema` (corpo + parágrafo de
 * destaque), `publicoAlvo` (parágrafo + lista de chips) e `ementa`
 * (descrição + lista de tópicos). Com a página lendo do CMS, as partes
 * ficam separadas (`pagina.problemaDestaque`, `pagina.publicoChips`,
 * `modulos.topicos`); estas funções recompõem o documento que a proposta
 * sempre recebeu, para o texto da proposta não mudar.
 *
 * Sem a parte nova (destaque vazio, sem chips, sem tópicos — programa ainda
 * não carregado, ou texto antigo já com tudo junto), devolvem o documento
 * original intacto. Funções puras.
 */

import { marcacaoParaHtml } from "@ntc/lib";

import { htmlParaLexical, listaParaLexical } from "../htmlParaLexical";

interface DocumentoComFilhos {
  root: { children: unknown[] };
}

function ehDocumento(v: unknown): v is DocumentoComFilhos {
  if (typeof v !== "object" || v === null) return false;
  const root = (v as { root?: unknown }).root;
  return typeof root === "object" && root !== null && Array.isArray((root as { children?: unknown }).children);
}

/** Cópia do documento com os blocos extras no fim. */
function acrescentar(doc: DocumentoComFilhos, blocos: unknown[]): unknown {
  const copia = structuredClone(doc);
  copia.root.children.push(...blocos);
  return copia;
}

/** Problema = corpo + parágrafo de destaque (marcação leve). */
export function comporProblema(problema: unknown, destaque: string | null | undefined): unknown {
  if (!ehDocumento(problema) || !destaque || destaque.trim() === "") return problema;
  const extra = htmlParaLexical(`<p>${marcacaoParaHtml(destaque)}</p>`).doc;
  return acrescentar(problema, extra.root.children);
}

/** Público-alvo = parágrafo + lista de chips. */
export function comporPublicoAlvo(publico: unknown, chips: readonly string[] | null | undefined): unknown {
  if (!ehDocumento(publico) || !chips || chips.length === 0) return publico;
  return acrescentar(publico, ultimoBloco(chips));
}

/** Ementa = descrição + lista de tópicos. */
export function comporEmenta(descricao: unknown, topicos: readonly string[] | null | undefined): unknown {
  if (!ehDocumento(descricao) || !topicos || topicos.length === 0) return descricao;
  return acrescentar(descricao, ultimoBloco(topicos));
}

/** O bloco de lista que `listaParaLexical` acrescenta ao fim do documento. */
function ultimoBloco(itens: readonly string[]): unknown[] {
  const { doc } = listaParaLexical("", [...itens]);
  return doc.root.children.slice(-1);
}

/** `[{ texto }]` do Payload → textos não vazios. */
export function textosDeLista(lista: { texto?: string | null }[] | null | undefined): string[] {
  return (lista ?? []).map((i) => i.texto ?? "").filter((t) => t !== "");
}
