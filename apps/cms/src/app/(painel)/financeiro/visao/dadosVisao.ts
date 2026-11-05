import {
  cashSeries,
  consolidado,
  corpAlerts,
  LISTAS_FIN,
  matchEvent,
  phaseDonut,
  portfolio,
  serieOrcadoRealizado,
  serieVertical,
  type AlertaCorporativo,
  type Carteira,
  type Centavos,
  type Consolidado,
  type EventoFin,
  type FiltroCarteira,
  type FiltroFin,
  type LivroFinanceiro,
  type SerieGrafico,
} from "@ntc/lib";

/**
 * Derivações da Visão Executiva (`Views.dashboard` do protótipo FIN-05), sem
 * React: a tela só desenha o que sai daqui. Tudo em centavos inteiros.
 */

/** Filtros do `UI.dash` do protótipo, na ordem da barra. `"all"` = sem filtro. */
export type FiltrosVisao = Required<Omit<FiltroCarteira, "q">>;
export const CHAVES_FILTRO_VISAO = ["periodo", "vertical", "modalidade", "status", "tipo"] as const;
export const FILTROS_VISAO_INICIAIS: FiltrosVisao = {
  periodo: "all",
  vertical: "all",
  modalidade: "all",
  status: "all",
  tipo: "all",
};

/** `anyFilter(F, keys)` do protótipo. */
export function algumFiltro(f: FiltrosVisao): boolean {
  return CHAVES_FILTRO_VISAO.some((k) => f[k] && f[k] !== "all");
}

/** Razão das barras ÷ dos KPIs: denominador zero ⇒ `null` (o protótipo mostra "—"). */
export function razao(parte: Centavos, todo: Centavos): number | null {
  return todo ? parte / todo : null;
}

const dia = (iso: string): number =>
  Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/**
 * `recentEvents` do protótipo: eventos ordenados pela distância entre a data de
 * início e hoje. Evento sem data de início vai para o fim (no protótipo a
 * distância seria `NaN` e a ordem, indefinida).
 */
export function recentEvents(evs: readonly EventoFin[], hoje: string): EventoFin[] {
  const t = dia(hoje);
  const dist = (e: EventoFin) =>
    e.dataInicio ? Math.abs(dia(e.dataInicio) - t) : Number.POSITIVE_INFINITY;
  return [...evs].sort((a, b) => dist(a) - dist(b));
}

const norm = (s: unknown): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export interface ContagemStatus {
  status: string;
  n: number;
  /** Fração dos eventos do recorte (sem o filtro de status); 0 sem eventos. */
  fracao: number;
}

export interface VisaoExecutiva {
  /** `P = Rules.portfolio(F)`: só eventos, com todos os filtros. */
  carteira: Carteira;
  /** `K`: eventos e corporativo, só pelo período. */
  geral: Consolidado;
  /** `KE`: só eventos, com todos os filtros. */
  eventos: Consolidado;
  /** `KC`: só corporativo, pelo período. */
  corporativo: Consolidado;
  pendenciasCorporativas: AlertaCorporativo[];
  /** Soma dos alertas "Vencido" da aba Faturamento (selo do Saldo a receber). */
  vencidoReceber: Centavos;
  /** Soma dos alertas "Vencido" da aba Pagamentos (selo do Saldo a pagar). */
  vencidoPagar: Centavos;
  /** Receitas dos eventos do recorte e clientes/órgãos distintos entre elas. */
  nReceitas: number;
  nClientes: number;
  /** Faixa "Carteira de eventos": um item por status operacional, na ordem da lista. */
  porStatus: ContagemStatus[];
  /** "Eventos recentes": os 6 mais próximos de hoje. */
  recentes: EventoFin[];
  graficos: {
    vertical: SerieGrafico;
    caixa: SerieGrafico;
    fases: SerieGrafico;
    categorias: SerieGrafico;
  };
  /** Base comum das barras de custo no funil "Do contrato ao caixa": max(orçado, realizado). */
  baseFunilCusto: Centavos;
}

export function montarVisaoExecutiva(
  livro: LivroFinanceiro,
  f: FiltrosVisao,
  hoje: string,
): VisaoExecutiva {
  const carteira = portfolio(f, livro, hoje);
  const evIds = new Set(carteira.evIds);
  const somaVencidos = (aba: string) =>
    carteira.alerts
      .filter((a) => a.severidade === "Vencido" && a.aba === aba)
      .reduce((s, a) => s + (a.valor ?? 0), 0);
  const receitasDoRecorte = livro.receitas.filter((r) => evIds.has(r.eventoId));

  // O consolidado lê só o período (eventos e corporativo), como no protótipo.
  const semFiltro: Omit<FiltroFin, "periodo" | "escopo"> = {
    vertical: "all",
    modalidade: "all",
    status: "all",
    tipo: "all",
    centro: "all",
  };
  const geral = consolidado({ ...semFiltro, periodo: f.periodo, escopo: "all" }, livro, hoje);
  const eventos = consolidado({ ...f, escopo: "eventos", centro: "all" }, livro, hoje);
  const corporativo = consolidado(
    { ...semFiltro, periodo: f.periodo, escopo: "corporativo" },
    livro,
    hoje,
  );

  // Evento do CRM sem cadastro financeiro não conta na carteira (ruling R15).
  const todosOsStatus = livro.eventos.filter(
    (e) => !e.cadastroPendente && matchEvent(e, { ...f, status: "all" }),
  );
  const porStatus = LISTAS_FIN.statusOperacional.map((status) => {
    const n = todosOsStatus.filter((e) => e.status === status).length;
    return { status, n, fracao: todosOsStatus.length ? n / todosOsStatus.length : 0 };
  });

  const { tot } = carteira;
  return {
    carteira,
    geral,
    eventos,
    corporativo,
    pendenciasCorporativas: corpAlerts(livro, hoje),
    vencidoReceber: somaVencidos("faturamento"),
    vencidoPagar: somaVencidos("pagamentos"),
    nReceitas: receitasDoRecorte.length,
    nClientes: new Set(receitasDoRecorte.map((r) => norm(r.cliente))).size,
    porStatus,
    recentes: recentEvents(
      carteira.rows.map((r) => r.ev),
      hoje,
    ).slice(0, 6),
    graficos: {
      vertical: serieVertical(carteira.rows),
      caixa: cashSeries(livro, evIds),
      fases: phaseDonut(livro, evIds),
      categorias: serieOrcadoRealizado(livro, evIds, 8),
    },
    baseFunilCusto: Math.max(tot.orcado, tot.realizado),
  };
}

/** Largura (%) de uma barra do funil: `v / max`; base zero ⇒ 0. */
export function larguraFunil(v: Centavos, max: Centavos): number {
  return max > 0 ? (v / max) * 100 : 0;
}
