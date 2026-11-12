import {
  aging,
  custoCompetencia,
  custoFin,
  custoPrevisto,
  escopo,
  gerarCsv,
  inPeriod,
  mesDe,
  pagamentoFin,
  rotuloMes,
  serieObrigacoesPorMes,
  type Centavos,
  type ColunaCsv,
  type CustoFin,
  type DadosCustoFin,
  type FaixasAging,
  type LivroFinanceiro,
  type MetricasCusto,
  type MetricasTitulo,
  type PagamentoFin,
  type RecorteFin,
  type SerieGrafico,
} from "@ntc/lib";

import { competenciaDoForm } from "../eventos/dadosLancamentos";
import {
  algumFiltroReceber,
  aplicarFiltrosReceber,
  FILTROS_RECEBER_INICIAIS,
  type FiltrosReceber,
  type SituacaoReceber,
} from "../receber/dadosReceber";
import { dataCurta, moeda } from "../ui/formato";

/**
 * Derivação pura da tela Pagar (`Views.pagar` do protótipo FIN-05, mapa
 * §1.5): recorte por escopo/centro/período/situação/busca, os KPIs de
 * despesa e obrigação, aging, série do gráfico, CSV, o bloco "Estrutura
 * compartilhada", a despesa corporativa (`openCustoCorpDrawer`) e a lista
 * "Despesas corporativas" (Ruling R12).
 */

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: readonly T[], f: (x: T) => number): number =>
  xs.reduce((a, x) => a + n(f(x)), 0);
const norm = (s: unknown): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// ---------------------------------------------------------------- filtros

/**
 * `UI.pag` do protótipo: as mesmas chaves e opções do `UI.fin` (`PAG_KEYS` =
 * `FIN_KEYS`, `FILTER_DEFS.situacao` é um só). "Com retenção" não casa
 * nenhum título, como no protótipo (`retencao: false`).
 */
export type FiltrosPagar = FiltrosReceber;
export const FILTROS_PAGAR_INICIAIS: FiltrosPagar = FILTROS_RECEBER_INICIAIS;
export const algumFiltroPagar = algumFiltroReceber;
export const aplicarFiltrosPagar = aplicarFiltrosReceber;

/** `escopo(S)` sem a busca (ver `linhasPagar`). */
export function recortePagar(livro: LivroFinanceiro, filtros: FiltrosPagar): RecorteFin {
  return escopo(
    {
      periodo: filtros.periodo,
      vertical: "all",
      modalidade: "all",
      status: "all",
      tipo: "all",
      escopo: filtros.escopo,
      centro: filtros.centro,
    },
    livro,
  );
}

// ---------------------------------------------------------------- linhas

export interface LinhaPagar {
  p: PagamentoFin;
  x: MetricasTitulo;
  c: CustoFin;
}

function casaSituacao(x: MetricasTitulo, s: SituacaoReceber): boolean {
  switch (s) {
    case "all":
      return true;
    case "aberto":
      return x.saldo > 0;
    case "vencido":
      return x.vencido;
    case "parcial":
      return x.status === "Pago parcialmente";
    case "quitado":
      return x.status === "Pago";
    case "retencao":
      return false;
  }
}

/**
 * Títulos do recorte, por vencimento (sem vencimento primeiro, como o `sort`
 * do protótipo). O período vale para os eventos (data de início, via
 * `escopo`) e para o título (vencimento). A busca é só sobre o título: o
 * protótipo também a passava ao `escopo`, o que tirava do recorte todo
 * título de evento ao buscar um documento (desvio deliberado, como em
 * Receber).
 */
export function linhasPagar(
  livro: LivroFinanceiro,
  filtros: FiltrosPagar,
  hoje: string,
  sc: RecorteFin = recortePagar(livro, filtros),
): LinhaPagar[] {
  const custoPorId = new Map(sc.custos.map((c) => [c.id, c]));
  let linhas: LinhaPagar[] = [];
  for (const p of livro.pagamentos) {
    const c = custoPorId.get(p.custoId);
    if (c) linhas.push({ p, x: pagamentoFin(p, hoje), c });
  }
  if (filtros.periodo !== "all")
    linhas = linhas.filter((l) => inPeriod(l.p.vencimento, filtros.periodo));
  if (filtros.situacao !== "all")
    linhas = linhas.filter((l) => casaSituacao(l.x, filtros.situacao));
  if (filtros.q) {
    const q = norm(filtros.q);
    linhas = linhas.filter(({ p, c }) =>
      norm(
        [p.id, p.documento, c.descricao, c.fornecedor, c.categoria, p.eventoId].join(" "),
      ).includes(q),
    );
  }
  return linhas.sort((a, b) => ((a.p.vencimento || "") < (b.p.vencimento || "") ? -1 : 1));
}

export interface TotaisPagar {
  /** Lançamentos do recorte (custos e despesas). */
  lancamentos: number;
  /** Despesa incorrida (Σ realizado). */
  incorrido: Centavos;
  /** Σ previsto, para o "% do orçado". */
  orcado: Centavos;
  /** Obrigações registradas (Σ valor dos títulos). */
  obrigacoes: Centavos;
  pago: Centavos;
  /** Valor a pagar (Σ saldo dos títulos). */
  saldo: Centavos;
  /** Σ max(0, realizado − programado) dos custos do recorte. */
  semTitulo: Centavos;
}

/**
 * KPIs de "Despesa e obrigação". Incorrido, orçado e "sem título" vêm dos
 * custos do recorte (sem a busca); obrigações, pago e saldo, dos títulos.
 * "Programado" conta todos os títulos do custo, como no protótipo.
 */
export function totaisPagar(
  livro: Pick<LivroFinanceiro, "pagamentos">,
  sc: Pick<RecorteFin, "custos">,
  linhas: readonly LinhaPagar[],
): TotaisPagar {
  const programado = new Map<string, number>();
  for (const p of livro.pagamentos)
    programado.set(p.custoId, (programado.get(p.custoId) ?? 0) + n(p.valor));
  return {
    lancamentos: sc.custos.length,
    incorrido: soma(sc.custos, (c) => c.valorRealizado),
    orcado: soma(sc.custos, custoPrevisto),
    obrigacoes: soma(linhas, (l) => l.p.valor),
    pago: soma(linhas, (l) => l.p.valorPago),
    saldo: soma(linhas, (l) => l.x.saldo),
    semTitulo: soma(sc.custos, (c) =>
      Math.max(0, n(c.valorRealizado) - (programado.get(c.id) ?? 0)),
    ),
  };
}

/** Composição por vencimento, sobre o valor a pagar (saldo dos títulos). */
export const agingPagar = (linhas: readonly LinhaPagar[], hoje: string): FaixasAging =>
  aging(
    linhas.map((l) => ({ vencimento: l.p.vencimento, valor: l.x.saldo })),
    hoje,
  );

/** "Obrigações por mês de vencimento" (saldo > 0 com vencimento). */
export const seriePagar = (linhas: readonly LinhaPagar[]): SerieGrafico =>
  serieObrigacoesPorMes(linhas.map((l) => ({ vencimento: l.p.vencimento, valor: l.x.saldo })));

/** `monthLabel(custoCompetencia(c) + '-01')`, ou "—" sem competência nem data prevista. */
export function competenciaDoCusto(c: Pick<CustoFin, "competencia" | "dataPrevista">): string {
  const ym = custoCompetencia(c);
  return /^\d{4}-\d{2}$/.test(ym) ? rotuloMes(ym) : "—";
}

// ---------------------------------------------------------------- CSV

/** Colunas do `csvDownload('contas_a_pagar', …)` do protótipo. */
export const COLUNAS_CSV_PAGAR: ColunaCsv<LinhaPagar>[] = [
  { titulo: "ID", valor: (l) => l.p.id },
  { titulo: "Título", valor: (l) => l.p.documento },
  { titulo: "Despesa", valor: (l) => l.c.descricao },
  { titulo: "Fornecedor", valor: (l) => l.c.fornecedor },
  { titulo: "Origem", valor: (l) => l.p.eventoId || "CORPORATIVO" },
  { titulo: "Centro de custo", valor: (l) => l.c.centroCusto },
  { titulo: "Compartilhada", valor: (l) => (l.c.compartilhada ? "Sim" : "Não") },
  { titulo: "Competência", valor: (l) => custoCompetencia(l.c) },
  { titulo: "Vencimento", valor: (l) => dataCurta(l.p.vencimento) },
  { titulo: "Valor do título", valor: (l) => l.p.valor, dinheiro: true },
  { titulo: "Pago", valor: (l) => l.p.valorPago, dinheiro: true },
  { titulo: "Saldo", valor: (l) => l.x.saldo, dinheiro: true },
  { titulo: "Status", valor: (l) => l.x.status },
];

export const csvPagar = (linhas: LinhaPagar[]): string => gerarCsv(COLUNAS_CSV_PAGAR, linhas);

/** Nome do arquivo do protótipo, sem o "_FICTICIO". */
export const NOME_CSV_PAGAR = "NTC_FIN05_contas_a_pagar.csv";

// ------------------------------------------------- estrutura compartilhada

export interface EstruturaCompartilhada {
  /** As 12 de competência mais recente (o `slice(0, 12)` do protótipo). */
  linhas: CustoFin[];
  /** Todas as compartilhadas do recorte. */
  quantidade: number;
  /** Σ realizado de todas (o rodapé do protótipo). */
  incorrido: Centavos;
}

export function estruturaCompartilhada(sc: Pick<RecorteFin, "custos">): EstruturaCompartilhada {
  const compart = sc.custos.filter((c) => c.compartilhada);
  return {
    linhas: [...compart]
      .sort((a, b) => (a.competencia < b.competencia ? 1 : a.competencia > b.competencia ? -1 : 0))
      .slice(0, 12),
    quantidade: compart.length,
    incorrido: soma(compart, (c) => c.valorRealizado),
  };
}

// ------------------------------------------------- despesas corporativas

/** Custos sem evento (o `custos` do `openPagamentoDrawer` corporativo). */
export const despesasCorporativas = (livro: Pick<LivroFinanceiro, "custos">): CustoFin[] =>
  livro.custos.filter((c) => !c.eventoId);

export interface LinhaDespesaCorp {
  c: CustoFin;
  f: MetricasCusto;
}

/**
 * Tabela "Despesas corporativas" (Ruling R12; o protótipo não tinha esta
 * lista): todas as despesas sem evento, inclusive previstas e sem título,
 * para editar ou excluir. Segue o Recorte onde ele se aplica: some com o
 * escopo "Somente eventos", período pela competência, centro de custo e
 * busca (id, descrição, fornecedor, categoria, documento). A Situação é do
 * título e não se aplica. Competência mais recente primeiro, depois id.
 */
export function linhasDespesasCorporativas(
  livro: LivroFinanceiro,
  filtros: FiltrosPagar,
): LinhaDespesaCorp[] {
  if (filtros.escopo === "eventos") return [];
  const q = norm(filtros.q);
  return despesasCorporativas(livro)
    .filter((c) => filtros.centro === "all" || c.centroCusto === filtros.centro)
    .filter((c) => filtros.periodo === "all" || inPeriod(c.competencia, filtros.periodo))
    .filter(
      (c) =>
        !q ||
        norm([c.id, c.descricao, c.fornecedor, c.categoria, c.documento].join(" ")).includes(q),
    )
    .map((c) => ({ c, f: custoFin(c, livro) }))
    .sort(
      (a, b) =>
        (b.c.competencia || "").localeCompare(a.c.competencia || "") ||
        a.c.id.localeCompare(b.c.id, "pt-BR", { numeric: true }),
    );
}

export interface TotaisDespesasCorp {
  previsto: Centavos;
  realizado: Centavos;
  pago: Centavos;
  aPagar: Centavos;
}

export const totaisDespesasCorporativas = (
  linhas: readonly LinhaDespesaCorp[],
): TotaisDespesasCorp => ({
  previsto: soma(linhas, (l) => l.f.previsto),
  realizado: soma(linhas, (l) => l.f.realizado),
  pago: soma(linhas, (l) => l.f.pago),
  aPagar: soma(linhas, (l) => l.f.aPagar),
});

// --------------------------------------------------- despesa corporativa

/** Estado do formulário da despesa corporativa; competência como mês e ano (`AAAA-MM`). */
export interface FormDespesaCorp {
  descricao: string;
  categoria: string;
  centroCusto: string;
  compartilhada: boolean;
  valorUnitPrev: Centavos | null;
  valorRealizado: Centavos | null;
  competencia: string;
  dataPrevista: string;
  fornecedor: string;
  documento: string;
  periodicidade: string;
  comportamento: string;
  subcategoria: string;
  qtde: string;
  criterioApropriacao: string;
  observacao: string;
}

/** Valores iniciais do `openCustoCorpDrawer`. */
export function formDespesaCorp(c: CustoFin | null, hoje: string): FormDespesaCorp {
  if (c)
    return {
      descricao: c.descricao,
      categoria: c.categoria,
      centroCusto: c.centroCusto,
      compartilhada: !!c.compartilhada,
      valorUnitPrev: n(c.valorUnitPrev),
      valorRealizado: n(c.valorRealizado),
      competencia: competenciaDoForm(c.competencia),
      dataPrevista: c.dataPrevista,
      fornecedor: c.fornecedor,
      documento: c.documento,
      periodicidade: c.periodicidade ?? "",
      comportamento: c.comportamento,
      subcategoria: c.subcategoria,
      qtde: String(n(c.qtde) || 1),
      criterioApropriacao: c.criterioApropriacao,
      observacao: c.observacao,
    };
  return {
    descricao: "",
    categoria: "",
    centroCusto: "ADM",
    compartilhada: false,
    valorUnitPrev: 0,
    valorRealizado: 0,
    competencia: hoje.slice(0, 7),
    dataPrevista: "",
    fornecedor: "",
    documento: "",
    periodicidade: "Mensal",
    comportamento: "Fixo",
    subcategoria: "",
    qtde: "1",
    criterioApropriacao: "",
    observacao: "",
  };
}

/**
 * O `save` do drawer: sem evento, `tipoLancamento` Corporativa, sem fase,
 * quantidade ≥ 1 (`Number(x.qtde) || 1`), subcategoria = categoria se
 * vazia. A competência grava o mês (`AAAA-MM`). O que o formulário não
 * mostra (natureza, fator, unidade, origem) vem da despesa gravada, ou dos
 * defaults do protótipo na nova (Indireto, Dias, mês). A periodicidade é só
 * rótulo: não gera lançamento recorrente.
 */
export function dadosDaDespesaCorp(f: FormDespesaCorp, c: CustoFin | null): DadosCustoFin {
  return {
    eventoId: "",
    tipoLancamento: "Corporativa",
    centroCusto: f.centroCusto,
    compartilhada: f.compartilhada,
    origemLancamento: c?.origemLancamento ?? "",
    fase: "",
    categoria: f.categoria,
    subcategoria: f.subcategoria || f.categoria,
    descricao: f.descricao,
    fornecedor: f.fornecedor,
    documento: f.documento,
    natureza: c?.natureza ?? "Indireto",
    comportamento: f.comportamento,
    driver: c?.driver ?? "Dias",
    unidade: c?.unidade ?? "mês",
    qtde: Number(f.qtde) || 1,
    valorUnitPrev: n(f.valorUnitPrev),
    valorRealizado: n(f.valorRealizado),
    competencia: f.competencia ? mesDe(f.competencia) : "",
    dataPrevista: f.dataPrevista,
    periodicidade: f.periodicidade,
    criterioApropriacao: f.criterioApropriacao,
    observacao: f.observacao,
  };
}

/** O "Desvio" calculado da gaveta: `null` = "— (não realizada)". */
export function desvioDespesaCorp(f: FormDespesaCorp): Centavos | null {
  const r = n(f.valorRealizado);
  if (!r) return null;
  return r - n(f.valorUnitPrev) * (Number(f.qtde) || 1);
}

/** Fornecedores já usados em despesas corporativas (datalist), em ordem. */
export const fornecedoresCorporativos = (livro: Pick<LivroFinanceiro, "custos">): string[] =>
  [
    ...new Set(
      livro.custos
        .filter((x) => !x.eventoId)
        .map((x) => x.fornecedor)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

export const CAMPOS_DINHEIRO_DESPESA_CORP = ["valorUnitPrev", "valorRealizado"] as const;
/** Campos em "Mais detalhes": erro num deles abre o bloco. */
export const CAMPOS_DETALHES_DESPESA_CORP: readonly string[] = [
  "fornecedor",
  "documento",
  "periodicidade",
  "comportamento",
  "subcategoria",
  "qtde",
  "criterioApropriacao",
  "observacao",
];

/** `okDesc` do protótipo: "id · descrição · R$ (realizado, ou previsto)". */
export const descricaoDespesaCorpSalva = (id: string, d: DadosCustoFin): string =>
  `${id} · ${d.descricao} · ${moeda(n(d.valorRealizado) || custoPrevisto(d as CustoFin))}`;
