import type { Centavos, FaturamentoFin, LivroFinanceiro, ReceitaFin } from "./tipos";

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: T[], f: (x: T) => number): number => xs.reduce((a, x) => a + n(f(x)), 0);

export interface MetricasParcela {
  bruto: Centavos;
  retTrib: Centavos;
  retContr: Centavos;
  liquido: Centavos;
  recebido: Centavos;
  exigivel: Centavos;
  aLiberar: Centavos;
  diferenca: Centavos;
  saldo: Centavos;
  status: "Liquidada" | "Recebida" | "Recebida parcialmente" | "Faturada";
  vencido: boolean;
}

export interface MetricasReceita {
  valor: Centavos;
  contratado: Centavos;
  faturado: Centavos;
  recebido: Centavos;
  aFaturar: Centavos;
  aReceber: Centavos;
  retTributaria: Centavos;
  retContratual: Centavos;
  exigivel: Centavos;
  aLiberar: Centavos;
  liquidoEsperado: Centavos;
  status: "Prevista" | "Contratada" | "Faturada parcialmente" | "Faturada" | "Recebida" | "Recebida parcialmente";
  parcelas: FaturamentoFin[];
}

/** Qtde × valor unitário. */
export const valorBruto = (r: ReceitaFin): Centavos => n(r.qtde) * n(r.valorUnit);
/** MAX(0, Qtde×Unit − Desconto). */
export const valorReceita = (r: ReceitaFin): Centavos => Math.max(0, valorBruto(r) - n(r.desconto));
export const isContratada = (r: ReceitaFin): boolean => r.statusEconomico !== "Prevista";

export const retTrib = (f: FaturamentoFin): Centavos => n(f.retencaoTributaria);
export const retContr = (f: FaturamentoFin): Centavos => n(f.retencaoContratual);

const exigivelDe = (f: FaturamentoFin): Centavos => Math.max(0, n(f.valorFaturado) - retTrib(f) - retContr(f) - n(f.valorRecebido));
const aLiberarDe = (f: FaturamentoFin): Centavos => Math.max(0, retContr(f) - n(f.retencaoContratualLiberada));

/** Faturamento e recebimento da parcela — fonte única. `hoje` = `AAAA-MM-DD`. */
export function faturamentoFin(f: FaturamentoFin, hoje: string): MetricasParcela {
  const bruto = n(f.valorFaturado);
  const rt = retTrib(f);
  const rc = retContr(f);
  const recebido = n(f.valorRecebido);
  const liquido = bruto - rt - rc;
  const exigivel = exigivelDe(f);
  const aLiberar = aLiberarDe(f);
  const diferenca = f.quitado ? recebido - liquido : 0;
  const saldo = bruto - recebido;
  let status: MetricasParcela["status"];
  if (f.quitado) status = "Liquidada";
  else if (liquido > 0 && recebido >= liquido) status = "Recebida";
  else if (recebido > 0) status = "Recebida parcialmente";
  else status = "Faturada";
  const vencido = exigivel > 0 && !!f.vencimento && f.vencimento < hoje && recebido === 0;
  return { bruto, retTrib: rt, retContr: rc, liquido, recebido, exigivel, aLiberar, diferenca, saldo, status, vencido };
}

export function receitaFin(r: ReceitaFin, livro: LivroFinanceiro): MetricasReceita {
  const frs = livro.faturamentos.filter((f) => f.receitaId === r.id);
  const valor = valorReceita(r);
  const faturado = soma(frs, (f) => f.valorFaturado);
  const recebido = soma(frs, (f) => f.valorRecebido);
  const retTributaria = soma(frs, retTrib);
  const retContratual = soma(frs, retContr);
  const exigivel = soma(frs, (f) => exigivelDe(f));
  const aLiberar = soma(frs, (f) => aLiberarDe(f));
  let status: MetricasReceita["status"];
  if (!isContratada(r)) status = "Prevista";
  else if (faturado === 0) status = "Contratada";
  else if (recebido === 0) status = faturado < valor ? "Faturada parcialmente" : "Faturada";
  else if (recebido >= faturado && faturado >= valor) status = "Recebida";
  else status = "Recebida parcialmente";
  return {
    valor,
    contratado: isContratada(r) ? valor : 0,
    faturado,
    recebido,
    aFaturar: isContratada(r) ? Math.max(0, valor - faturado) : 0,
    aReceber: faturado - recebido,
    retTributaria,
    retContratual,
    exigivel,
    aLiberar,
    liquidoEsperado: faturado - retTributaria - retContratual,
    status,
    parcelas: frs,
  };
}
