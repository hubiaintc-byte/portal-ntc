/**
 * Montagem do documento da proposta: descarta secoes vazias, intercala as
 * secoes extras cadastradas pelo usuario e numera pela posicao final.
 * Modulo puro (sem I/O). A numeracao comeca em 3 porque, no modelo aprovado,
 * a capa e o Resumo Executivo nao sao numerados.
 */

export type PosicaoExtra = "antes-quadro-comercial" | "apos-condicoes-comerciais" | "fim";

export interface SecaoDocumento {
  chave: string;
  titulo: string;
  corpoHtml: string;
}

export interface SecaoExtra {
  titulo: string;
  corpoHtml: string;
  posicao: PosicaoExtra;
}

export interface SecaoNumerada extends SecaoDocumento {
  numero: number;
}

export interface ResultadoMontagem {
  secoes: SecaoNumerada[];
  omitidas: string[];
}

const PRIMEIRO_NUMERO = 3;

function temCorpo(corpoHtml: string): boolean {
  return corpoHtml.trim().length > 0;
}

/**
 * Indice de insercao da extra na lista de secoes presentes. Ancora ausente
 * cai para antes do fechamento (posicao "fim") e, sem fechamento, para o fim
 * da lista: texto escrito a mao nunca e descartado em silencio.
 */
function indiceDeInsercao(secoes: SecaoDocumento[], posicao: PosicaoExtra): number {
  const achar = (chave: string): number => secoes.findIndex((s) => s.chave === chave);
  let indice = -1;
  if (posicao === "antes-quadro-comercial") {
    indice = achar("quadro-comercial");
  } else if (posicao === "apos-condicoes-comerciais") {
    const i = achar("condicoes-comerciais");
    indice = i === -1 ? -1 : i + 1;
  }
  if (indice === -1) indice = achar("fechamento");
  return indice === -1 ? secoes.length : indice;
}

export function montarSecoes(base: SecaoDocumento[], extras: SecaoExtra[]): ResultadoMontagem {
  const omitidas: string[] = [];
  const presentes: SecaoDocumento[] = [];
  for (const s of base) {
    if (temCorpo(s.corpoHtml)) presentes.push(s);
    else omitidas.push(s.chave);
  }

  // Ancoras sao resolvidas sobre a lista base ja filtrada; cada extra e
  // inserida depois das anteriores da mesma posicao (ordem de cadastro).
  const lista: SecaoDocumento[] = [...presentes];
  const plano = extras
    .filter((e) => temCorpo(e.corpoHtml))
    .map((e) => ({ extra: e, indice: indiceDeInsercao(presentes, e.posicao) }));

  // Agrupa por indice base, preservando a ordem de cadastro dentro do grupo.
  const porIndice = new Map<number, SecaoDocumento[]>();
  for (const { extra, indice } of plano) {
    const grupo = porIndice.get(indice) ?? [];
    grupo.push({ chave: "", titulo: extra.titulo, corpoHtml: extra.corpoHtml });
    porIndice.set(indice, grupo);
  }
  const final: SecaoDocumento[] = [];
  for (let i = 0; i <= lista.length; i++) {
    final.push(...(porIndice.get(i) ?? []));
    const s = lista[i];
    if (s) final.push(s);
  }

  return {
    secoes: final.map((s, i) => ({ ...s, numero: PRIMEIRO_NUMERO + i })),
    omitidas,
  };
}
