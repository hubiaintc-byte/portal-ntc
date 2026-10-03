export interface LinhaQuadro {
  codigo: string;
  titulo: string;
  cargaHoraria: string;
  pagantes: number;
  cortesias: number;
  valorUnitarioLiquido: number;
  subtotal: number;
}

export interface EntradaQuadro {
  modulos: { numero: number; titulo: string; cargaHoraria: string | null }[];
  qtdPagantes: number;
  cortesias: number;
  valorLiquido: number;
}

/** `total` é múltiplo inteiro de `partes`. Zero partes nunca é exato. */
export function divisaoExata(total: number, partes: number): boolean {
  if (!Number.isInteger(total) || !Number.isInteger(partes) || partes <= 0) return false;
  return total % partes === 0;
}

/**
 * Distribui pagantes e cortesias igualmente pelos módulos. Devolve [] sem
 * módulos ou se a divisão não é exata (o documento omite a tabela e mantém
 * só o resumo financeiro). Valores não são arredondados: os centavos fazem
 * parte da reconciliação.
 */
export function linhasDoQuadro(e: EntradaQuadro): LinhaQuadro[] {
  const n = e.modulos.length;
  if (n === 0) return [];
  if (!divisaoExata(e.qtdPagantes, n) || !divisaoExata(e.cortesias, n)) return [];

  const pagantes = e.qtdPagantes / n;
  const cortesias = e.cortesias / n;
  const unitario = e.qtdPagantes > 0 ? e.valorLiquido / e.qtdPagantes : 0;

  return e.modulos.map((m) => ({
    codigo: `M${String(m.numero).padStart(2, "0")}`,
    titulo: m.titulo,
    cargaHoraria: m.cargaHoraria ?? "—",
    pagantes,
    cortesias,
    valorUnitarioLiquido: unitario,
    subtotal: unitario * pagantes,
  }));
}
