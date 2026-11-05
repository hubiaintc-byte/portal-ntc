import type { Centavos, CustoFin, LivroFinanceiro } from "./tipos";
import { custoFin } from "./custos";
import { LISTAS_FIN } from "./listas";
import { isContratada } from "./receitas";
import type { LinhaCarteira, MetricasEvento } from "./eventos";

const n = (v: unknown): number => Number(v) || 0;

/** Forma única dos gráficos: a UI só escolhe cores e tipo de gráfico. */
export interface SerieGrafico {
  labels: string[];
  series: { nome: string; valores: number[]; tipo?: "barra" | "linha" }[];
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
/** `AAAA-MM[-DD]` → `jul/26`. */
export const rotuloMes = (ym: string): string => `${MESES[Number(ym.slice(5, 7)) - 1]}/${ym.slice(2, 4)}`;

export interface FaixasAging {
  vencido: Centavos;
  d30: Centavos;
  d60: Centavos;
  d90: Centavos;
  mais: Centavos;
  semData: Centavos;
}

const diasEntre = (iso: string, hoje: string): number => {
  const t = (s: string) => Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
  return Math.round((t(iso) - t(hoje)) / 86400000);
};

/** Faixas por vencimento (vencido, ≤30, 31–60, 61–90, >90 dias); sem data vai a parte; valor 0 é ignorado. */
export function aging(itens: { vencimento: string; valor: Centavos }[], hoje: string): FaixasAging {
  const f: FaixasAging = { vencido: 0, d30: 0, d60: 0, d90: 0, mais: 0, semData: 0 };
  for (const x of itens) {
    const v = n(x.valor);
    if (!v) continue;
    if (!x.vencimento) {
      f.semData += v;
      continue;
    }
    const d = diasEntre(x.vencimento, hoje);
    if (d < 0) f.vencido += v;
    else if (d <= 30) f.d30 += v;
    else if (d <= 60) f.d60 += v;
    else if (d <= 90) f.d90 += v;
    else f.mais += v;
  }
  return f;
}

type Ids = ReadonlySet<string> | readonly string[];
const comoSet = (ids: Ids): Set<string> => new Set(ids);

/**
 * Série mensal de caixa (meses intermediários preenchidos com 0): Faturado e
 * Recebido (barras), Pago (linha). Visão Executiva "Evolução mensal do caixa"
 * (combo), cronograma de faturamento do evento e gráfico de Receber/Pagar.
 * Só entram lançamentos dos eventos em `eventoIds` (`""` = corporativo).
 */
export function cashSeries(livro: LivroFinanceiro, eventoIds: Ids): SerieGrafico {
  const ids = comoSet(eventoIds);
  const mapa: Record<string, { fat: number; rec: number; pag: number }> = {};
  const soma = (data: string, k: "fat" | "rec" | "pag", v: number) => {
    if (!data || !v) return;
    const ym = data.slice(0, 7);
    (mapa[ym] ??= { fat: 0, rec: 0, pag: 0 })[k] += v;
  };
  for (const f of livro.faturamentos.filter((x) => ids.has(x.eventoId))) {
    soma(f.dataFaturamento, "fat", n(f.valorFaturado));
    soma(f.dataRecebimento, "rec", n(f.valorRecebido));
  }
  for (const p of livro.pagamentos.filter((x) => ids.has(x.eventoId))) soma(p.dataPagamento, "pag", n(p.valorPago));
  const chaves = Object.keys(mapa).sort();
  const vazia: SerieGrafico = {
    labels: [],
    series: [
      { nome: "Faturado", valores: [], tipo: "barra" },
      { nome: "Recebido", valores: [], tipo: "barra" },
      { nome: "Pago", valores: [], tipo: "linha" },
    ],
  };
  if (!chaves.length) return vazia;
  const meses: string[] = [];
  let [y, m] = chaves[0]!.split("-").map(Number) as [number, number];
  const [ly, lm] = chaves[chaves.length - 1]!.split("-").map(Number) as [number, number];
  while (y < ly || (y === ly && m <= lm)) {
    meses.push(`${y}-${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return {
    labels: meses.map(rotuloMes),
    series: [
      { nome: "Faturado", valores: meses.map((k) => mapa[k]?.fat || 0), tipo: "barra" },
      { nome: "Recebido", valores: meses.map((k) => mapa[k]?.rec || 0), tipo: "barra" },
      { nome: "Pago", valores: meses.map((k) => mapa[k]?.pag || 0), tipo: "linha" },
    ],
  };
}

/** Cronograma de faturamento e recebimento de um evento (aba Faturamento): só as duas barras. */
export function cronogramaFaturamento(livro: LivroFinanceiro, eventoId: string): SerieGrafico {
  const c = cashSeries(livro, [eventoId]);
  return { labels: c.labels, series: c.series.slice(0, 2) };
}

export interface GrupoCusto {
  k: string;
  previsto: Centavos;
  realizado: Centavos;
  pago: Centavos;
  aPagar: Centavos;
  n: number;
  prevRealizados: Centavos;
}

/** Custos dos eventos em `eventoIds` agrupados por um campo (`fase`, `categoria`…); vazio vira "—". */
export function groupCosts(livro: LivroFinanceiro, eventoIds: Ids, chave: keyof CustoFin & string): GrupoCusto[] {
  const ids = comoSet(eventoIds);
  const g: Record<string, GrupoCusto> = {};
  for (const c of livro.custos.filter((x) => ids.has(x.eventoId))) {
    const k = String((c as unknown as Record<string, unknown>)[chave] || "—");
    const f = custoFin(c, livro);
    const o = (g[k] ??= { k, previsto: 0, realizado: 0, pago: 0, aPagar: 0, n: 0, prevRealizados: 0 });
    o.previsto += f.previsto;
    o.realizado += f.realizado;
    o.pago += f.pago;
    o.aPagar += f.aPagar;
    o.n++;
    if (f.realizado > 0) o.prevRealizados += f.previsto;
  }
  return Object.values(g);
}

/** Rosca "Composição dos custos por fase" (Visão Executiva e área do evento): fases com custo realizado, na ordem de `LISTAS_FIN.fases`. */
export function phaseDonut(livro: LivroFinanceiro, eventoIds: Ids): SerieGrafico {
  const grupos = groupCosts(livro, eventoIds, "fase");
  const fases = LISTAS_FIN.fases.map((f) => grupos.find((g) => g.k === f)).filter((g): g is GrupoCusto => !!g && g.realizado > 0);
  return { labels: fases.map((g) => g.k), series: [{ nome: "Custo realizado", valores: fases.map((g) => g.realizado) }] };
}

/** "Receita × Custo × Resultado" por vertical (Visão Executiva); só verticais com evento no recorte. */
export function serieVertical(rows: LinhaCarteira[]): SerieGrafico {
  const por = LISTAS_FIN.verticais
    .filter((v) => rows.some((r) => r.ev.vertical === v))
    .map((v) => {
      const rs = rows.filter((r) => r.ev.vertical === v);
      return {
        v,
        fat: rs.reduce((a, r) => a + n(r.m.faturada), 0),
        cus: rs.reduce((a, r) => a + n(r.m.realizado), 0),
        res: rs.reduce((a, r) => a + n(r.m.resultado), 0),
      };
    });
  return {
    labels: por.map((x) => x.v),
    series: [
      { nome: "Receita faturada", valores: por.map((x) => x.fat) },
      { nome: "Custo realizado", valores: por.map((x) => x.cus) },
      { nome: "Resultado", valores: por.map((x) => x.res) },
    ],
  };
}

/** "Orçado × Realizado por categoria": maiores por previsto; `limite` 8 na Visão Executiva, sem limite na área do evento. */
export function serieOrcadoRealizado(livro: LivroFinanceiro, eventoIds: Ids, limite?: number): SerieGrafico {
  let cats = groupCosts(livro, eventoIds, "categoria").sort((a, b) => b.previsto - a.previsto);
  if (limite !== undefined) cats = cats.slice(0, limite);
  return {
    labels: cats.map((c) => c.k),
    series: [
      { nome: "Orçado", valores: cats.map((c) => c.previsto) },
      { nome: "Realizado", valores: cats.map((c) => c.realizado) },
    ],
  };
}

/** Área do evento, aba Receitas: "Receita contratada por segmento", maior primeiro. */
export function serieSegmento(m: Pick<MetricasEvento, "rf">): SerieGrafico {
  const seg: Record<string, number> = {};
  for (const x of m.rf.filter((y) => isContratada(y.r))) seg[x.r.segmento] = (seg[x.r.segmento] || 0) + x.f.valor;
  const chaves = Object.keys(seg).sort((a, b) => seg[b]! - seg[a]!);
  return { labels: chaves, series: [{ nome: "Contratado", valores: chaves.map((k) => seg[k]!) }] };
}

/** Área do evento, aba Receitas: "Pagantes e cortesias por órgão" (contagens, não dinheiro). */
export function seriePagantesCortesias(m: Pick<MetricasEvento, "rf">): SerieGrafico {
  const rc = m.rf.filter((x) => isContratada(x.r));
  return {
    labels: rc.map((x) => x.r.cliente),
    series: [
      { nome: "Pagantes", valores: rc.map((x) => n(x.r.pagantes)) },
      { nome: "Cortesias", valores: rc.map((x) => n(x.r.cortesias)) },
    ],
  };
}

/** Área do evento, Visão Geral: "Receita × Custo" (contratado/orçado, faturado/realizado, recebido/pago). */
export function serieReceitaXCusto(m: Pick<MetricasEvento, "contratada" | "orcado" | "faturada" | "realizado" | "recebida" | "pago">): SerieGrafico {
  return {
    labels: ["Contratado / Orçado", "Faturado / Realizado", "Recebido / Pago"],
    series: [
      { nome: "Receita", valores: [m.contratada, m.faturada, m.recebida] },
      { nome: "Custo", valores: [m.orcado, m.realizado, m.pago] },
    ],
  };
}

function porMesDeVencimento(itens: { vencimento: string; valor: Centavos }[], nome: string): SerieGrafico {
  const por: Record<string, number> = {};
  for (const x of itens) if (n(x.valor) > 0 && x.vencimento) por[x.vencimento.slice(0, 7)] = (por[x.vencimento.slice(0, 7)] || 0) + n(x.valor);
  const meses = Object.keys(por).sort();
  return { labels: meses.map(rotuloMes), series: [{ nome, valores: meses.map((k) => por[k]!) }] };
}

/** Receber: "Exigível por mês de vencimento" (itens: vencimento + exigível de cada parcela do recorte). */
export function serieExigivelPorMes(itens: { vencimento: string; valor: Centavos }[]): SerieGrafico {
  return porMesDeVencimento(itens, "Exigível");
}

/** Pagar: "A pagar por mês de vencimento" (itens: vencimento + saldo de cada título do recorte). */
export function serieObrigacoesPorMes(itens: { vencimento: string; valor: Centavos }[]): SerieGrafico {
  return porMesDeVencimento(itens, "A pagar");
}
