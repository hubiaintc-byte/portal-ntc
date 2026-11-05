import type { Centavos, ContaFin, CustoFin, FaturamentoFin, LivroFinanceiro, PagamentoFin, ReceitaFin, EventoFin } from "./tipos";
import { faturamentoFin, isContratada, retContr, retTrib, valorReceita } from "./receitas";
import { custoPrevisto, pagamentoFin } from "./custos";
import { custoCompetencia, reconhecimentoReceita } from "./reconhecimento";
import { demonstrativo, matchEvent, SEV_ORDER, type Demonstrativo, type FiltroCarteira, type Severidade } from "./eventos";
import { inPeriod } from "./periodos";

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: T[], f: (x: T) => number): number => xs.reduce((a, x) => a + n(f(x)), 0);

/** Filtro da Visão Executiva/Receber/Pagar: carteira + escopo + centro de custo. `"all"` = sem filtro. */
export type FiltroFin = FiltroCarteira & {
  escopo: "all" | "eventos" | "corporativo";
  centro: string;
};

export interface RecorteFin {
  evs: EventoFin[];
  evIds: Set<string>;
  receitas: ReceitaFin[];
  custos: CustoFin[];
  faturamentos: FaturamentoFin[];
  pagamentos: PagamentoFin[];
}

/** Recorte (escopo + centro de custo + filtros de evento). Receita/custo sem evento = corporativo. */
export function escopo(filtro: FiltroFin, livro: LivroFinanceiro): RecorteFin {
  const evs = livro.eventos.filter((e) => matchEvent(e, filtro));
  const evIds = new Set(evs.map((e) => e.id));
  const es = filtro.escopo || "all";
  const cc = filtro.centro || "all";
  const vis = (row: { eventoId: string; centroCusto: string }) =>
    (row.eventoId ? es !== "corporativo" && evIds.has(row.eventoId) : es !== "eventos") && (cc === "all" || row.centroCusto === cc);
  const receitas = livro.receitas.filter(vis);
  const custos = livro.custos.filter(vis);
  const recIds = new Set(receitas.map((r) => r.id));
  const cusIds = new Set(custos.map((c) => c.id));
  return {
    evs,
    evIds,
    receitas,
    custos,
    faturamentos: livro.faturamentos.filter((x) => recIds.has(x.receitaId)),
    pagamentos: livro.pagamentos.filter((x) => cusIds.has(x.custoId)),
  };
}

/** Linha do extrato de caixa (só recebimentos e títulos pagos; sem movimentos avulsos na Fase 1). */
export interface LinhaExtrato {
  id: string;
  data: string;
  tipo: "Recebimento" | "Pagamento";
  contaId: string;
  /** Entrada positiva, saída negativa. */
  valor: Centavos;
  descricao: string;
  origem: "fatrec" | "pagamento";
  eventoId: string;
  ref: string;
}

/** Extrato unificado; `recorte` limita a receitas/custos de um escopo. Ordenado por data (estável). */
export function extrato(livro: LivroFinanceiro, recorte?: { receitaIds?: Set<string>; custoIds?: Set<string> }): LinhaExtrato[] {
  const contaPadrao = livro.contas[0]?.id ?? "";
  const out: LinhaExtrato[] = [];
  for (const f of livro.faturamentos) {
    if (recorte?.receitaIds && !recorte.receitaIds.has(f.receitaId)) continue;
    if (!(n(f.valorRecebido) > 0 && f.dataRecebimento)) continue;
    out.push({
      id: f.id, data: f.dataRecebimento, tipo: "Recebimento", contaId: f.contaId || contaPadrao,
      valor: n(f.valorRecebido), descricao: `${f.nf || f.parcela || "Recebimento"}`, origem: "fatrec",
      eventoId: f.eventoId || "", ref: f.id,
    });
  }
  for (const p of livro.pagamentos) {
    if (recorte?.custoIds && !recorte.custoIds.has(p.custoId)) continue;
    if (!(n(p.valorPago) > 0 && p.dataPagamento)) continue;
    out.push({
      id: p.id, data: p.dataPagamento, tipo: "Pagamento", contaId: p.contaId || contaPadrao,
      valor: -n(p.valorPago), descricao: p.documento || "Pagamento", origem: "pagamento",
      eventoId: p.eventoId || "", ref: p.id,
    });
  }
  return out.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
}

/** Saldo inicial de todas as contas + extrato (opcionalmente filtrado). */
export function saldoGeral(livro: LivroFinanceiro, filtro?: (m: LinhaExtrato) => boolean): Centavos {
  const ini = soma(livro.contas, (c) => c.saldoInicial);
  const ext = extrato(livro).filter((m) => (filtro ? filtro(m) : true));
  return ini + soma(ext, (m) => m.valor);
}

export interface SaldoConta {
  conta: ContaFin;
  movimentos: LinhaExtrato[];
  entradas: Centavos;
  saidas: Centavos;
  saldo: Centavos;
}

export function saldosPorConta(livro: LivroFinanceiro, ate?: string): SaldoConta[] {
  const ext = extrato(livro);
  return livro.contas.map((conta) => {
    const movimentos = ext.filter((m) => m.contaId === conta.id && (!ate || m.data <= ate));
    return {
      conta,
      movimentos,
      entradas: soma(movimentos.filter((m) => m.valor > 0), (m) => m.valor),
      saidas: 0 - soma(movimentos.filter((m) => m.valor < 0), (m) => m.valor),
      saldo: n(conta.saldoInicial) + soma(movimentos, (m) => m.valor),
    };
  });
}

export interface Consolidado {
  contratada: Centavos;
  prevista: Centavos;
  faturada: Centavos;
  recebida: Centavos;
  retTributaria: Centavos;
  retContratual: Centavos;
  exigivel: Centavos;
  aLiberar: Centavos;
  aFaturar: Centavos;
  aReceber: Centavos;
  orcado: Centavos;
  realizado: Centavos;
  pago: Centavos;
  obrigacoes: Centavos;
  aPagar: Centavos;
  /** 1) Projetado: contratada − orçado (sem recorte de período). */
  projetado: Centavos;
  reconhecida: Centavos;
  incorrido: Centavos;
  /** 2) Econômico por competência: reconhecida − incorrida no período. */
  economico: Centavos;
  entradas: Centavos;
  saidas: Centavos;
  /** 3) Movimentação líquida de caixa: entradas − saídas no período. */
  movimentacaoLiquida: Centavos;
  demo: Demonstrativo;
  saldoInicial: Centavos;
  saldoFinal: Centavos;
  saldoAtual: Centavos;
  nContas: number;
  recMes: Record<string, Centavos>;
  cusMes: Record<string, Centavos>;
  extrato: LinhaExtrato[];
  caixa: Centavos;
  desvioOrcamento: Centavos;
  execucaoOrcamento: number | null;
}

/** As três perspectivas de resultado (projetado, econômico, caixa) sobre o recorte do filtro. */
export function consolidado(filtro: FiltroFin, livro: LivroFinanceiro, hoje: string): Consolidado {
  const sc = escopo(filtro, livro);
  const per = filtro.periodo || "all";
  const noPer = (iso: string) => inPeriod(iso, per);
  const noPerMes = (mes: string) => (mes ? inPeriod(`${mes}-01`, per) : false);

  const contratada = soma(sc.receitas.filter(isContratada), valorReceita);
  const prevista = soma(sc.receitas.filter((r) => !isContratada(r)), valorReceita);
  const faturada = soma(sc.faturamentos, (x) => x.valorFaturado);
  const recebida = soma(sc.faturamentos, (x) => x.valorRecebido);
  const retTributaria = soma(sc.faturamentos, retTrib);
  const retContratual = soma(sc.faturamentos, retContr);
  const exigivel = soma(sc.faturamentos, (x) => faturamentoFin(x, hoje).exigivel);
  const aLiberar = soma(sc.faturamentos, (x) => faturamentoFin(x, hoje).aLiberar);
  const orcado = soma(sc.custos, custoPrevisto);
  const realizado = soma(sc.custos, (c) => c.valorRealizado);
  const pago = soma(sc.pagamentos, (p) => p.valorPago);
  const obrigacoes = soma(sc.pagamentos, (p) => p.valor);

  const projetado = contratada - orcado;

  const recMes: Record<string, Centavos> = {};
  const cusMes: Record<string, Centavos> = {};
  for (const r of sc.receitas) for (const x of reconhecimentoReceita(r, livro, hoje)) recMes[x.mes] = (recMes[x.mes] || 0) + x.valor;
  for (const c of sc.custos) {
    const m = custoCompetencia(c);
    const v = n(c.valorRealizado);
    if (m && v) cusMes[m] = (cusMes[m] || 0) + v;
  }
  const reconhecida = Object.keys(recMes).filter(noPerMes).reduce((a, m) => a + recMes[m]!, 0);
  const incorrido = Object.keys(cusMes).filter(noPerMes).reduce((a, m) => a + cusMes[m]!, 0);
  const economico = reconhecida - incorrido;

  const ext = extrato(livro, { receitaIds: new Set(sc.receitas.map((r) => r.id)), custoIds: new Set(sc.custos.map((c) => c.id)) });
  const noPeriodo = ext.filter((m) => noPer(m.data));
  const entradas = soma(noPeriodo.filter((m) => m.valor > 0), (m) => m.valor);
  const saidas = 0 - soma(noPeriodo.filter((m) => m.valor < 0), (m) => m.valor);
  const movimentacaoLiquida = entradas - saidas;
  const saldoInicial = saldoGeral(livro, (m) => !noPer(m.data));

  return {
    contratada, prevista, faturada, recebida, retTributaria, retContratual, exigivel, aLiberar,
    aFaturar: Math.max(0, contratada - faturada),
    aReceber: faturada - recebida,
    orcado, realizado, pago, obrigacoes,
    aPagar: realizado - pago,
    projetado, reconhecida, incorrido, economico,
    entradas, saidas, movimentacaoLiquida,
    demo: demonstrativo([contratada, reconhecida, entradas], [orcado, incorrido, saidas]),
    saldoInicial,
    saldoFinal: saldoInicial + movimentacaoLiquida,
    saldoAtual: saldoGeral(livro),
    nContas: livro.contas.length,
    recMes, cusMes, extrato: ext,
    caixa: recebida - pago,
    desvioOrcamento: realizado - orcado,
    execucaoOrcamento: orcado > 0 ? realizado / orcado : null,
  };
}

/** Alerta corporativo (fora do escopo de evento). `destino` = tela do módulo onde o assunto mora. */
export interface AlertaCorporativo {
  severidade: Severidade;
  titulo: string;
  detalhe: string;
  valor: Centavos | null;
  destino: "receber" | "pagar" | "resultado";
  corporativo: true;
}

/** Fase 1: sem movimentos não classificados e sem competências em fechamento. */
export function corpAlerts(livro: LivroFinanceiro, hoje: string): AlertaCorporativo[] {
  const out: AlertaCorporativo[] = [];
  const add = (severidade: Severidade, titulo: string, detalhe: string, valor: Centavos | null, destino: AlertaCorporativo["destino"]) =>
    out.push({ severidade, titulo, detalhe, valor, destino, corporativo: true });
  for (const f of livro.faturamentos.filter((x) => !x.eventoId)) {
    const x = faturamentoFin(f, hoje);
    if (x.vencido) add("Vencido", "Recebimento corporativo vencido", `${f.nf || f.parcela}`, x.exigivel, "receber");
    if (x.aLiberar > 0) add("Pendente", "Retenção contratual a liberar", `${f.nf || f.parcela} · garantia — não é inadimplência`, x.aLiberar, "receber");
    if (x.diferenca !== 0) add("Atenção", "Diferença de conciliação", `${f.nf || f.parcela}`, x.diferenca, "receber");
  }
  const pagCorp = livro.pagamentos.filter((p) => !p.eventoId).map((p) => ({ p, x: pagamentoFin(p, hoje) }));
  const venc = pagCorp.filter(({ x }) => x.vencido);
  if (venc.length) add("Vencido", "Obrigação corporativa vencida", `${venc.length} título(s) sem baixa`, soma(venc, ({ x }) => x.saldo), "pagar");
  const aberto = pagCorp.filter(({ x }) => x.saldo > 0 && !x.vencido);
  if (aberto.length) add("Pendente", "Obrigações corporativas em aberto", `${aberto.length} título(s) a vencer`, soma(aberto, ({ x }) => x.saldo), "pagar");
  const compart = livro.custos.filter((c) => c.compartilhada);
  if (compart.length) {
    add(
      "A validar",
      "Despesas de estrutura compartilhada sem critério de rateio",
      `${compart.length} lançamento(s) · rateio não aplicado por ausência de critério institucional aprovado`,
      soma(compart, (c) => c.valorRealizado),
      "resultado",
    );
  }
  return out.sort((a, b) => SEV_ORDER[a.severidade] - SEV_ORDER[b.severidade]);
}
