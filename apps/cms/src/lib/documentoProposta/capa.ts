/**
 * Capa do documento da proposta (Sessão 2). Módulo puro — sem I/O.
 *
 * Por ora só o subtítulo: o rótulo editorial que a capa imprime abaixo do
 * título ("Combo de Três Módulos · EDUTEC"), derivado do tipo da proposta,
 * da quantidade de módulos contratados e da sigla do programa.
 */

/** Dois a dez por extenso; acima disso o algarismo lê melhor que a palavra. */
const POR_EXTENSO: Record<number, string> = {
  2: "Dois",
  3: "Três",
  4: "Quatro",
  5: "Cinco",
  6: "Seis",
  7: "Sete",
  8: "Oito",
  9: "Nove",
  10: "Dez",
};

export function subtituloProposta(
  tipo: string,
  numModulos: number,
  programaSigla: string,
): string {
  const prefixo = prefixoDoEscopo(tipo, numModulos);
  const sigla = programaSigla.trim();
  if (!prefixo) return sigla;
  if (!sigla) return prefixo;
  return `${prefixo} · ${sigla}`;
}

/**
 * Trilha completa não depende da contagem: o escopo é o programa inteiro,
 * mesmo que os módulos ainda não tenham sido lançados na proposta. Sem
 * módulos e sem ser trilha, a capa fica só com a sigla — nunca com um
 * "Combo de 0 Módulos".
 */
function prefixoDoEscopo(tipo: string, numModulos: number): string {
  if (tipo === "programa-completo") return "Trilha Completa";
  if (numModulos <= 0) return "";
  if (numModulos === 1) return "Módulo Avulso";
  return `Combo de ${POR_EXTENSO[numModulos] ?? String(numModulos)} Módulos`;
}
