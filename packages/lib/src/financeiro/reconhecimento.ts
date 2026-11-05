import type { Centavos, LivroFinanceiro, ReceitaFin } from "./tipos";
import { isContratada, valorReceita } from "./receitas";
import { mesDe } from "./dinheiro";
import { inPeriod, type Periodo } from "./periodos";

const n = (v: unknown): number => Number(v) || 0;

export const CRIT_PROVISORIO = "Execução declarada (provisório)";
/** Critério gravado quando a receita tem etapas (`salvarEtapasFin`). */
export const CRIT_POR_ETAPA = "Por etapa/módulo concluído";


export interface ParcelaReconhecida {
  mes: string;
  valor: Centavos;
  rotulo: string;
  criterio: string;
  provisorio: boolean;
}

/**
 * Reconhecimento econômico (PROVISÓRIO — pendente de validação contábil).
 * Contratada não equivale a reconhecida. Forma = a do protótipo: lista de
 * parcelas por mês. `hoje` (AAAA-MM-DD) decide se o evento já foi executado.
 */
export function reconhecimentoReceita(r: ReceitaFin, livro: LivroFinanceiro, hoje: string): ParcelaReconhecida[] {
  const total = isContratada(r) ? valorReceita(r) : 0;
  if (!total) return [];
  const ev = r.eventoId ? livro.eventos.find((e) => e.id === r.eventoId) : undefined;
  const etapas = (r.etapas || []).filter((e) => n(e.valor) > 0 || n(e.percentual) > 0);
  if (etapas.length) {
    return etapas
      .filter((e) => e.concluida)
      .map((e) => ({
        mes: mesDe(e.dataConclusao || (ev ? ev.dataFim : r.competencia) || ""),
        valor: e.base === "percentual" ? Math.round((total * n(e.percentual)) / 100) : n(e.valor),
        rotulo: e.nome,
        criterio: "Etapa/módulo concluído",
        provisorio: false,
      }))
      .filter((x) => x.mes && x.valor);
  }
  const crit = r.criterioReconhecimento || CRIT_PROVISORIO;
  if (!ev) {
    const mes = mesDe(r.competencia || "");
    return mes ? [{ mes, valor: total, rotulo: "Competência declarada", criterio: crit, provisorio: crit === CRIT_PROVISORIO }] : [];
  }
  const fim = ev.dataFim || ev.dataInicio;
  if (!fim) return [];
  if (crit === "Integral no encerramento") {
    return ev.status === "Encerrado" ? [{ mes: mesDe(fim), valor: total, rotulo: "Encerramento", criterio: crit, provisorio: false }] : [];
  }
  const executado = ev.status === "Realizado" || ev.status === "Encerrado" || fim <= hoje;
  return executado ? [{ mes: mesDe(fim), valor: total, rotulo: "Execução declarada", criterio: CRIT_PROVISORIO, provisorio: true }] : [];
}

/** Soma reconhecida; com `periodo`, só as parcelas cujo mês cai nele. */
export function receitaReconhecida(r: ReceitaFin, livro: LivroFinanceiro, hoje: string, periodo?: Periodo): Centavos {
  return reconhecimentoReceita(r, livro, hoje)
    .filter((x) => !periodo || inPeriod(`${x.mes}-01`, periodo))
    .reduce((a, x) => a + n(x.valor), 0);
}

/** Competência do custo (fato incorrido): `AAAA-MM`. */
export const custoCompetencia = (c: { competencia?: string; dataPrevista?: string }): string =>
  mesDe(c.competencia || c.dataPrevista || "");
