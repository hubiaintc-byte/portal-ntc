import type { Centavos, CustoFin, LivroFinanceiro, PagamentoFin } from "./tipos";

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: T[], f: (x: T) => number): number => xs.reduce((a, x) => a + n(f(x)), 0);

export interface MetricasCusto {
  previsto: Centavos;
  realizado: Centavos;
  pago: Centavos;
  programado: Centavos;
  aPagar: Centavos;
  desvio: Centavos;
  acima: boolean;
  status: "Previsto" | "Realizado" | "Pago parcialmente" | "Pago";
  pagamentos: PagamentoFin[];
}

export interface MetricasTitulo {
  saldo: Centavos;
  status: "Pago" | "Pago parcialmente" | "Programado";
  vencido: boolean;
}

/** Valor total previsto = Qtde × valor unitário previsto. */
export const custoPrevisto = (c: CustoFin): Centavos => n(c.qtde) * n(c.valorUnitPrev);

export function custoFin(c: CustoFin, livro: LivroFinanceiro): MetricasCusto {
  const pays = livro.pagamentos.filter((p) => p.custoId === c.id);
  const previsto = custoPrevisto(c);
  const realizado = n(c.valorRealizado);
  const pago = soma(pays, (p) => p.valorPago);
  const programado = soma(pays, (p) => p.valor);
  let status: MetricasCusto["status"];
  if (realizado === 0) status = "Previsto";
  else if (pago === 0) status = "Realizado";
  else if (pago < realizado) status = "Pago parcialmente";
  else status = "Pago";
  return {
    previsto,
    realizado,
    pago,
    programado,
    aPagar: realizado - pago,
    desvio: realizado > 0 ? realizado - previsto : 0,
    acima: realizado > previsto,
    status,
    pagamentos: pays,
  };
}

/** `hoje` = `AAAA-MM-DD`. */
export function pagamentoFin(p: PagamentoFin, hoje: string): MetricasTitulo {
  const saldo = n(p.valor) - n(p.valorPago);
  let status: MetricasTitulo["status"];
  if (n(p.valorPago) >= n(p.valor)) status = "Pago";
  else if (n(p.valorPago) > 0) status = "Pago parcialmente";
  else status = "Programado";
  const vencido = saldo > 0 && !!p.vencimento && p.vencimento < hoje;
  return { saldo, status, vencido };
}
