/**
 * Lógica pura de propostas comerciais — espelha finalizarWizard/novaVersao do
 * protótipo NTC_Comercial_Premium.html. Sem I/O: usada no cliente (resumo ao
 * vivo do wizard) e no servidor (grava derivados). Fonte única da fórmula.
 */

export interface EntradaValores {
  valorUnitario: number;
  qtdPagantes: number;
  cortesias: number;
  percDesconto: number;
}

export interface ValoresProposta {
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
  acessosTotais: number;
}

export function calcularValoresProposta(e: EntradaValores): ValoresProposta {
  const valorBruto = e.valorUnitario * e.qtdPagantes;
  const desconto = (valorBruto * e.percDesconto) / 100;
  return {
    valorBruto,
    desconto,
    valorLiquido: valorBruto - desconto,
    acessosTotais: e.qtdPagantes + e.cortesias,
  };
}

/** "Câmara nº 3" → "CMARA3" — só [A-Z0-9], upper (esc de sigla do legado). */
export function siglaCanonica(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
}

export function gerarCodigoBase(a: {
  ano: number;
  siglaPrograma: string;
  uf: string;
  siglaCliente: string;
}): string {
  return `NTC-PROP-${a.ano}-${siglaCanonica(a.siglaPrograma)}-${a.uf.toUpperCase()}-${siglaCanonica(a.siglaCliente)}`;
}

/** Extrai o número de versão do sufixo -vNN de um código. 0 se não casar. */
function versaoDoCodigo(codigo: string): number {
  const m = codigo.match(/-v(\d+)$/);
  return m ? Number(m[1]) : 0;
}

export function proximaVersao(codigosExistentes: string[]): number {
  if (codigosExistentes.length === 0) return 1;
  return Math.max(...codigosExistentes.map(versaoDoCodigo)) + 1;
}

export function codigoDaVersao(codigoBase: string, versao: number): string {
  return `${codigoBase}-v${String(versao).padStart(2, "0")}`;
}

/**
 * Módulos que a proposta pode oferecer, dado o programa escolhido.
 *
 * Sem programa a lista é **vazia**, não completa: antes de 30/09/2026 a tela
 * caía para "todos os módulos" enquanto ninguém tivesse escolhido programa —
 * invisível enquanto a coleção `modulos` estava vazia, e gritante depois que
 * a importação dos 15 programas trouxe 112. Módulo sem programa nunca aparece.
 */
export function modulosDoPrograma<T extends { programaId: string | null }>(
  modulos: T[],
  programaId: string,
): T[] {
  if (programaId === "") return [];
  return modulos.filter((m) => m.programaId === programaId);
}
