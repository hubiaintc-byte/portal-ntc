import type { Centavos, CustoFin, EventoFin, LivroFinanceiro, ReceitaFin } from "./tipos";
import { faturamentoFin, isContratada, receitaFin, retTrib, type MetricasReceita } from "./receitas";
import { custoFin, pagamentoFin, type MetricasCusto } from "./custos";
import { receitaReconhecida } from "./reconhecimento";
import { inPeriod, type Periodo } from "./periodos";

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: T[], f: (x: T) => number): number => xs.reduce((a, x) => a + n(f(x)), 0);
const norm = (s: unknown): string => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const fmtData = (iso: string): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/** Demonstrativo em três colunas (contratado/reconhecido/recebido × orçado/realizado/pago). */
export interface Demonstrativo {
  receita: [Centavos, Centavos, Centavos] | Centavos[];
  custo: Centavos[];
  resultado: Centavos[];
}

export function demonstrativo(receitas: [Centavos, Centavos, Centavos], custos: [Centavos, Centavos, Centavos]): Demonstrativo {
  const receita = receitas.map(n);
  const custo = custos.map(n);
  return { receita, custo, resultado: receita.map((v, i) => v - custo[i]!) };
}

export interface MetricasEvento {
  contratada: Centavos;
  prevista: Centavos;
  faturada: Centavos;
  recebida: Centavos;
  aFaturar: Centavos;
  aReceber: Centavos;
  orcado: Centavos;
  realizado: Centavos;
  pago: Centavos;
  aPagar: Centavos;
  direto: Centavos;
  indireto: Centavos;
  resultado: Centavos;
  resultadoPrevisto: Centavos;
  resultadoRealizado: Centavos;
  reconhecida: Centavos;
  demo: Demonstrativo;
  movimentacao: Centavos;
  caixa: Centavos;
  desvio: Centavos;
  desvioTotal: Centavos;
  execucaoOrcamento: number | null;
  pagantes: number;
  cortesias: number;
  participantes: number;
  baseUnit: number;
  baseUnitLabel: string;
  custoPorParticipante: number | null;
  receitaPorPagante: number | null;
  receitaPorParticipante: number | null;
  nReceitas: number;
  nCustos: number;
  rf: { r: ReceitaFin; f: MetricasReceita }[];
  cf: { c: CustoFin; f: MetricasCusto }[];
}

export function eventMetrics(ev: EventoFin, livro: LivroFinanceiro, hoje: string): MetricasEvento {
  const recs = livro.receitas.filter((r) => r.eventoId === ev.id);
  const custos = livro.custos.filter((c) => c.eventoId === ev.id);
  const rf = recs.map((r) => ({ r, f: receitaFin(r, livro) }));
  const cf = custos.map((c) => ({ c, f: custoFin(c, livro) }));
  const contratada = soma(rf, (x) => x.f.contratado);
  const prevista = soma(rf.filter((x) => x.r.statusEconomico === "Prevista"), (x) => x.f.valor);
  const faturada = soma(rf, (x) => x.f.faturado);
  const recebida = soma(rf, (x) => x.f.recebido);
  const orcado = soma(cf, (x) => x.f.previsto);
  const realizado = soma(cf, (x) => x.f.realizado);
  const pago = soma(cf, (x) => x.f.pago);
  const direto = soma(cf.filter((x) => x.c.natureza === "Direto"), (x) => x.f.realizado);
  const indireto = soma(cf.filter((x) => x.c.natureza === "Indireto"), (x) => x.f.realizado);
  const recContr = rf.filter((x) => isContratada(x.r));
  const pagantes = soma(recContr, (x) => x.r.pagantes);
  const cortesias = soma(recContr, (x) => x.r.cortesias);
  const participantes = pagantes + cortesias;
  const orcadoRealizados = soma(cf.filter((x) => x.f.realizado > 0), (x) => x.f.previsto);
  const reconhecida = soma(recs, (r) => receitaReconhecida(r, livro, hoje));
  const baseUnit = participantes > 0 ? participantes : n(ev.efetivos);
  return {
    contratada,
    prevista,
    faturada,
    recebida,
    aFaturar: contratada - faturada,
    aReceber: faturada - recebida,
    orcado,
    realizado,
    pago,
    aPagar: realizado - pago,
    direto,
    indireto,
    resultado: faturada - realizado,
    resultadoPrevisto: contratada - orcado,
    resultadoRealizado: reconhecida - realizado,
    reconhecida,
    demo: demonstrativo([contratada, reconhecida, recebida], [orcado, realizado, pago]),
    movimentacao: recebida - pago,
    caixa: recebida - pago,
    desvio: realizado - orcadoRealizados,
    desvioTotal: realizado - orcado,
    execucaoOrcamento: orcado > 0 ? realizado / orcado : null,
    pagantes,
    cortesias,
    participantes,
    baseUnit,
    baseUnitLabel: participantes > 0 ? "pagantes + cortesias" : "participantes efetivos (cadastro)",
    custoPorParticipante: baseUnit > 0 && realizado > 0 ? realizado / baseUnit : null,
    receitaPorPagante: pagantes > 0 ? contratada / pagantes : null,
    receitaPorParticipante: participantes > 0 ? contratada / participantes : null,
    nReceitas: recs.length,
    nCustos: custos.length,
    rf,
    cf,
  };
}

export type Severidade = "Vencido" | "Pendente" | "Atenção" | "A validar";

export interface AlertaFin {
  severidade: Severidade;
  titulo: string;
  detalhe: string;
  /** Aba do detalhe do evento onde o assunto mora. */
  aba: "faturamento" | "pagamentos" | "custos" | "receitas";
  valor: Centavos | null;
  eventoId: string;
  eventoNome: string;
}

export const SEV_ORDER: Record<Severidade, number> = { Vencido: 0, Pendente: 1, Atenção: 2, "A validar": 3 };

export function eventAlerts(ev: EventoFin, livro: LivroFinanceiro, hoje: string, metricas?: MetricasEvento): AlertaFin[] {
  // Evento do CRM ainda sem cadastro financeiro: não alerta (ruling R15).
  if (ev.cadastroPendente) return [];
  const m = metricas ?? eventMetrics(ev, livro, hoje);
  const out: AlertaFin[] = [];
  const add = (severidade: Severidade, titulo: string, detalhe: string, aba: AlertaFin["aba"], valor: Centavos | null) =>
    out.push({ severidade, titulo, detalhe, aba, valor, eventoId: ev.id, eventoNome: ev.nome });
  const ativo = ["Em execução", "Realizado", "Encerrado"].includes(ev.status);
  for (const f of livro.faturamentos.filter((x) => x.eventoId === ev.id)) {
    const x = faturamentoFin(f, hoje);
    if (x.vencido) add("Vencido", "Recebimento vencido", `${f.nf || f.parcela} · venc. ${fmtData(f.vencimento)}`, "faturamento", x.saldo);
    else if (x.status === "Recebida parcialmente") add("Atenção", "Faturamento parcialmente recebido", `${f.nf || f.parcela} · saldo em aberto`, "faturamento", x.saldo);
    if (retTrib(f) > 0) add("A validar", "Retenção tributária — tratamento não confirmado", `${f.nf || f.parcela} · não é inadimplência · [VALIDAR COM CONTABILIDADE]`, "faturamento", retTrib(f));
    if (x.aLiberar > 0) add("Pendente", "Retenção contratual a liberar", `${f.nf || f.parcela} · garantia contratual — não é inadimplência`, "faturamento", x.aLiberar);
    if (x.diferenca !== 0) add("Atenção", "Diferença de conciliação no recebimento", `${f.nf || f.parcela} · recebido difere do líquido esperado`, "faturamento", x.diferenca);
  }
  for (const { r, f } of m.rf) {
    if (ativo && isContratada(r) && f.aFaturar > 0) add("Pendente", "Receita contratada ainda não faturada", r.cliente, "faturamento", f.aFaturar);
  }
  let vencPag = 0;
  let nVenc = 0;
  for (const p of livro.pagamentos.filter((x) => x.eventoId === ev.id)) {
    const x = pagamentoFin(p, hoje);
    if (x.vencido) {
      vencPag += x.saldo;
      nVenc++;
    }
  }
  if (nVenc) add("Vencido", "Pagamento vencido", `${nVenc} título(s) com vencimento ultrapassado sem baixa`, "pagamentos", vencPag);
  const pend = m.cf.filter((x) => x.f.aPagar > 0);
  if (pend.length) add("Pendente", "Pagamentos pendentes", `${pend.length} custo(s) realizado(s) com saldo a pagar`, "pagamentos", soma(pend, (x) => x.f.aPagar));
  const acima = m.cf.filter((x) => x.f.acima);
  if (acima.length) {
    add(
      "Atenção",
      "Custo realizado acima do previsto",
      `${acima.length} lançamento(s) · ${acima.map((x) => x.c.categoria).slice(0, 2).join(", ")}${acima.length > 2 ? "…" : ""}`,
      "custos",
      soma(acima, (x) => x.f.realizado - x.f.previsto),
    );
  }
  const semForn = m.cf.filter((x) => !x.c.fornecedor || !x.c.categoria);
  if (semForn.length) add("Atenção", "Custo sem fornecedor/categoria", `${semForn.length} lançamento(s) incompleto(s)`, "custos", null);
  if (m.nCustos === 0 && ev.status !== "Encerrado") add("Pendente", "Evento sem orçamento de custos", "Nenhum custo previsto registrado", "custos", null);
  if (m.nReceitas === 0 && ev.status !== "Planejado") add("Pendente", "Evento sem receita registrada", "Nenhuma receita vinculada", "receitas", null);
  return out.sort((a, b) => SEV_ORDER[a.severidade] - SEV_ORDER[b.severidade]);
}

/** `"all"` = sem filtro. */
export interface FiltroCarteira {
  periodo: Periodo;
  vertical: string;
  modalidade: string;
  status: string;
  tipo: string;
  q?: string;
}

export function matchEvent(ev: EventoFin, f: FiltroCarteira): boolean {
  if (f.vertical && f.vertical !== "all" && ev.vertical !== f.vertical) return false;
  if (f.modalidade && f.modalidade !== "all" && ev.modalidade !== f.modalidade) return false;
  if (f.status && f.status !== "all" && ev.status !== f.status) return false;
  if (f.tipo && f.tipo !== "all" && ev.tipo !== f.tipo) return false;
  if (f.periodo && !inPeriod(ev.dataInicio, f.periodo)) return false;
  if (f.q) {
    const q = norm(f.q);
    const hay = norm([ev.id, ev.nome, ev.programa, ev.modulo, ev.cliente, ev.cidade, ev.uf, ev.vertical, ev.tipo].join(" "));
    if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
  }
  return true;
}

export const CHAVES_TOTAIS = [
  "contratada", "prevista", "faturada", "recebida", "aFaturar", "aReceber", "orcado", "realizado", "pago", "aPagar",
  "resultado", "resultadoPrevisto", "resultadoRealizado", "reconhecida", "caixa", "movimentacao", "desvio",
  "desvioTotal", "pagantes", "cortesias", "participantes",
] as const;
export type TotaisCarteira = Record<(typeof CHAVES_TOTAIS)[number], Centavos>;

export interface LinhaCarteira {
  ev: EventoFin;
  m: MetricasEvento;
}

export interface Carteira {
  tot: TotaisCarteira;
  rows: LinhaCarteira[];
  alerts: AlertaFin[];
  evIds: string[];
}

/**
 * Carteira de eventos. Evento do CRM ainda sem cadastro financeiro
 * (`cadastroPendente`) fica fora das linhas, dos totais e dos alertas
 * (ruling R15) — aparece só na lista de Eventos, com o selo.
 */
export function portfolio(filtro: FiltroCarteira, livro: LivroFinanceiro, hoje: string): Carteira {
  const evs = livro.eventos.filter((e) => !e.cadastroPendente && matchEvent(e, filtro));
  const rows = evs.map((ev) => ({ ev, m: eventMetrics(ev, livro, hoje) }));
  const tot = Object.fromEntries(CHAVES_TOTAIS.map((k) => [k, soma(rows, (x) => x.m[k])])) as TotaisCarteira;
  const alerts = rows
    .flatMap((x) => eventAlerts(x.ev, livro, hoje, x.m))
    .sort((a, b) => SEV_ORDER[a.severidade] - SEV_ORDER[b.severidade]);
  return { tot, rows, alerts, evIds: evs.map((e) => e.id) };
}
