import {
  aging,
  escopo,
  faturamentoFin,
  gerarCsv,
  inPeriod,
  isContratada,
  mesDe,
  receitaFin,
  serieExigivelPorMes,
  valorReceita,
  type Centavos,
  type ColunaCsv,
  type ContaFin,
  type DadosContaFin,
  type DadosReceitaFin,
  type EventoFin,
  type FaixasAging,
  type FaturamentoFin,
  type LivroFinanceiro,
  type MetricasParcela,
  type MetricasReceita,
  type Periodo,
  type ReceitaFin,
  type SaldoContaResumo,
  type SerieGrafico,
} from "@ntc/lib";

import { competenciaDoForm } from "../eventos/dadosLancamentos";
import { dataCurta, moeda } from "../ui/formato";

/**
 * Derivação pura da tela Receber (`Views.receber` do protótipo FIN-05, mapa
 * §1.4): recorte por escopo/centro/período/situação/busca, totais dos KPIs,
 * aging, série do gráfico, CSV, a receita corporativa
 * (`openReceitaCorpDrawer`) e a lista simples de contas (spec §3.4).
 */

const n = (v: unknown): number => Number(v) || 0;
const norm = (s: unknown): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// ---------------------------------------------------------------- filtros

export type SituacaoReceber = "all" | "aberto" | "vencido" | "parcial" | "quitado" | "retencao";

/** `UI.fin` do protótipo (sem `vertical`, que Receber não mostra). */
export interface FiltrosReceber {
  periodo: Periodo;
  escopo: "all" | "eventos" | "corporativo";
  centro: string;
  situacao: SituacaoReceber;
  q: string;
}

export const FILTROS_RECEBER_INICIAIS: FiltrosReceber = {
  periodo: "all",
  escopo: "all",
  centro: "all",
  situacao: "all",
  q: "",
};

/** `FIN_KEYS` do protótipo, na ordem da barra. */
export const CHAVES_FILTRO_RECEBER = ["periodo", "escopo", "centro", "situacao"] as const;

/** `anyFilter(S, FIN_KEYS)`: algum select fora de "all" ou busca preenchida. */
export const algumFiltroReceber = (f: FiltrosReceber): boolean =>
  CHAVES_FILTRO_RECEBER.some((k) => f[k] && f[k] !== "all") || !!f.q;

/** Filtros levados por `irPara("receber", { filtros })`: só as chaves conhecidas. */
export function aplicarFiltrosReceber(
  s: FiltrosReceber,
  filtros: Record<string, string> | undefined,
): FiltrosReceber {
  if (!filtros) return s;
  const novo: FiltrosReceber = { ...s };
  if (filtros.periodo) novo.periodo = filtros.periodo as Periodo;
  if (filtros.escopo) novo.escopo = filtros.escopo as FiltrosReceber["escopo"];
  if (filtros.centro) novo.centro = filtros.centro;
  if (filtros.situacao) novo.situacao = filtros.situacao as SituacaoReceber;
  if (filtros.q !== undefined) novo.q = filtros.q;
  return novo;
}

export const OPCOES_ESCOPO: readonly (readonly [string, string])[] = [
  ["eventos", "Somente eventos e projetos"],
  ["corporativo", "Somente corporativo"],
];

export const OPCOES_SITUACAO_RECEBER: readonly (readonly [string, string])[] = [
  ["aberto", "Em aberto"],
  ["vencido", "Vencidas"],
  ["parcial", "Parciais"],
  ["quitado", "Liquidadas"],
  ["retencao", "Com retenção"],
];

// ---------------------------------------------------------------- linhas

export interface LinhaReceber {
  f: FaturamentoFin;
  x: MetricasParcela;
  r: ReceitaFin;
}

function casaSituacao(l: LinhaReceber, s: SituacaoReceber): boolean {
  const { f, x } = l;
  switch (s) {
    case "all":
      return true;
    case "aberto":
      return x.exigivel > 0;
    case "vencido":
      return x.vencido;
    case "parcial":
      return x.recebido > 0 && x.exigivel > 0;
    case "quitado":
      return !!f.quitado || (x.liquido > 0 && x.recebido >= x.liquido);
    case "retencao":
      return x.retTrib + x.retContr > 0;
  }
}

/**
 * Parcelas do recorte, por vencimento (sem vencimento primeiro, como o
 * `sort` do protótipo). O período vale para os eventos (pela data de
 * início, via `escopo`) e para a parcela (vencimento, ou data de
 * faturamento). A busca é só sobre a parcela: o protótipo também a passava
 * ao `escopo`, o que tirava do recorte toda parcela de evento ao buscar uma
 * NF (desvio deliberado).
 */
export function linhasReceber(
  livro: LivroFinanceiro,
  filtros: FiltrosReceber,
  hoje: string,
): LinhaReceber[] {
  const sc = escopo(
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
  const recPorId = new Map(sc.receitas.map((r) => [r.id, r]));
  let linhas: LinhaReceber[] = [];
  for (const f of sc.faturamentos) {
    const r = recPorId.get(f.receitaId);
    if (r) linhas.push({ f, x: faturamentoFin(f, hoje), r });
  }
  if (filtros.periodo !== "all")
    linhas = linhas.filter((l) => inPeriod(l.f.vencimento || l.f.dataFaturamento, filtros.periodo));
  if (filtros.situacao !== "all") linhas = linhas.filter((l) => casaSituacao(l, filtros.situacao));
  if (filtros.q) {
    const q = norm(filtros.q);
    linhas = linhas.filter(({ f, r }) =>
      norm([f.id, f.nf, f.parcela, r.cliente, r.eventoId].join(" ")).includes(q),
    );
  }
  return linhas.sort((a, b) => ((a.f.vencimento || "") < (b.f.vencimento || "") ? -1 : 1));
}

export interface TotaisReceber {
  bruto: Centavos;
  retTrib: Centavos;
  retContr: Centavos;
  liquido: Centavos;
  recebido: Centavos;
  exigivel: Centavos;
  aLiberar: Centavos;
  diferenca: Centavos;
}

export function totaisReceber(linhas: readonly LinhaReceber[]): TotaisReceber {
  const T = (k: keyof TotaisReceber) => linhas.reduce((a, l) => a + n(l.x[k]), 0);
  return {
    bruto: T("bruto"),
    retTrib: T("retTrib"),
    retContr: T("retContr"),
    liquido: T("liquido"),
    recebido: T("recebido"),
    exigivel: T("exigivel"),
    aLiberar: T("aLiberar"),
    diferenca: T("diferenca"),
  };
}

/** Composição por vencimento, sobre o valor a receber (exigível). */
export const agingReceber = (linhas: readonly LinhaReceber[], hoje: string): FaixasAging =>
  aging(
    linhas.map((l) => ({ vencimento: l.f.vencimento, valor: l.x.exigivel })),
    hoje,
  );

/** As cinco células do `agingStrip` (sem a faixa "sem data", que o protótipo não mostra). */
export function celulasAging(
  f: FaixasAging,
): { rotulo: string; valor: Centavos; neg: boolean; largura: string }[] {
  const total = Math.max(1, f.vencido + f.d30 + f.d60 + f.d90 + f.mais);
  const largura = (v: number) => `${Math.min(100, (v / total) * 100).toFixed(1)}%`;
  return (
    [
      ["Vencido", f.vencido, true],
      ["Até 30 dias", f.d30, false],
      ["31–60 dias", f.d60, false],
      ["61–90 dias", f.d90, false],
      ["Acima de 90", f.mais, false],
    ] as const
  ).map(([rotulo, valor, neg]) => ({ rotulo, valor, neg, largura: largura(valor) }));
}

/** "Valor a receber por mês de vencimento" (exigível > 0 com vencimento). */
export const serieReceber = (linhas: readonly LinhaReceber[]): SerieGrafico =>
  serieExigivelPorMes(linhas.map((l) => ({ vencimento: l.f.vencimento, valor: l.x.exigivel })));

/** Rótulo do documento da parcela: NF, ou a parcela. */
export const documentoParcela = (f: Pick<FaturamentoFin, "nf" | "parcela">): string =>
  f.nf || f.parcela;

// ---------------------------------------------------------------- CSV

/** Colunas do `csvDownload('contas_a_receber', …)` do protótipo. */
export const COLUNAS_CSV_RECEBER: ColunaCsv<LinhaReceber>[] = [
  { titulo: "ID", valor: (l) => l.f.id },
  { titulo: "Documento", valor: (l) => documentoParcela(l.f) },
  { titulo: "Cliente", valor: (l) => l.r.cliente },
  { titulo: "Origem", valor: (l) => l.r.eventoId || "CORPORATIVO" },
  { titulo: "Centro de custo", valor: (l) => l.r.centroCusto },
  { titulo: "Faturamento", valor: (l) => dataCurta(l.f.dataFaturamento) },
  { titulo: "Vencimento", valor: (l) => dataCurta(l.f.vencimento) },
  { titulo: "Valor bruto", valor: (l) => l.x.bruto, dinheiro: true },
  { titulo: "Retenção tributária", valor: (l) => l.x.retTrib, dinheiro: true },
  { titulo: "Retenção contratual", valor: (l) => l.x.retContr, dinheiro: true },
  { titulo: "Líquido esperado", valor: (l) => l.x.liquido, dinheiro: true },
  { titulo: "Recebido", valor: (l) => l.x.recebido, dinheiro: true },
  { titulo: "Valor a receber", valor: (l) => l.x.exigivel, dinheiro: true },
  { titulo: "Retenção contratual a liberar", valor: (l) => l.x.aLiberar, dinheiro: true },
  { titulo: "Diferença de conciliação", valor: (l) => l.x.diferenca, dinheiro: true },
  { titulo: "Status", valor: (l) => l.x.status },
];

export const csvReceber = (linhas: LinhaReceber[]): string => gerarCsv(COLUNAS_CSV_RECEBER, linhas);

/** Nome do arquivo do protótipo, sem o "_FICTICIO" (o selo de dados fictícios não existe aqui). */
export const NOME_CSV_RECEBER = "NTC_FIN05_contas_a_receber.csv";

// ---------------------------------------------------------------- origem

/** Receitas corporativas contratadas (as faturáveis sem evento). */
export const receitasCorporativasContratadas = (
  livro: Pick<LivroFinanceiro, "receitas">,
): ReceitaFin[] => livro.receitas.filter((r) => !r.eventoId && isContratada(r));

/**
 * Contexto da gaveta de faturamento de uma parcela (`abrirFatrec`): o evento
 * da receita, ou o corporativo ("Receita corporativa · cliente") com as
 * receitas corporativas contratadas no select.
 */
export function contextoDaParcela(
  livro: LivroFinanceiro,
  r: ReceitaFin,
): { contexto: { id: string; nome: string }; receitas?: ReceitaFin[] } {
  if (r.eventoId) {
    const ev = livro.eventos.find((e) => e.id === r.eventoId);
    return { contexto: { id: r.eventoId, nome: ev?.nome ?? r.eventoId } };
  }
  return {
    contexto: { id: "", nome: `Receita corporativa · ${r.cliente}` },
    receitas: receitasCorporativasContratadas(livro),
  };
}

/** Eventos do seletor "Registrar faturamento → Evento ou projeto", por ID. */
export const eventosParaFaturar = (eventos: readonly EventoFin[]): EventoFin[] =>
  [...eventos].sort((a, b) => a.id.localeCompare(b.id, "pt-BR", { numeric: true }));

// ------------------------------------------------- receita corporativa

/** Estado do formulário de receita corporativa; competência como mês e ano (`AAAA-MM`). */
export interface FormReceitaCorp {
  cliente: string;
  origem: string;
  centroCusto: string;
  valorUnit: Centavos | null;
  competencia: string;
  statusEconomico: string;
  referencia: string;
  segmento: string;
  tipoReceita: string;
  criterioReconhecimento: string;
  observacao: string;
}

/** Valores iniciais do `openReceitaCorpDrawer`. */
export function formReceitaCorp(r: ReceitaFin | null, hoje: string): FormReceitaCorp {
  if (r)
    return {
      cliente: r.cliente,
      origem: r.origem,
      centroCusto: r.centroCusto,
      valorUnit: n(r.valorUnit),
      competencia: competenciaDoForm(r.competencia),
      statusEconomico: r.statusEconomico,
      referencia: r.referencia,
      segmento: r.segmento,
      tipoReceita: r.tipoReceita,
      criterioReconhecimento: r.criterioReconhecimento,
      observacao: r.observacao,
    };
  return {
    cliente: "",
    origem: "Consultoria institucional",
    centroCusto: "ADM",
    valorUnit: 0,
    competencia: hoje.slice(0, 7),
    statusEconomico: "Contratada",
    referencia: "",
    segmento: "Privado/Outro",
    tipoReceita: "Valor global",
    criterioReconhecimento: "Integral no encerramento",
    observacao: "",
  };
}

/**
 * O `save` do drawer: sem evento, `tipoLancamento` Corporativa, quantidade 1.
 * A competência grava o mês (`AAAA-MM`); o que o formulário não mostra vem
 * da receita gravada (ou zera, na nova).
 */
export function dadosDaReceitaCorp(f: FormReceitaCorp, r: ReceitaFin | null): DadosReceitaFin {
  return {
    eventoId: "",
    tipoLancamento: "Corporativa",
    centroCusto: f.centroCusto,
    cliente: f.cliente,
    segmento: f.segmento,
    origem: f.origem,
    tipoReceita: f.tipoReceita,
    etapa: r?.etapa ?? "",
    qtde: 1,
    valorUnit: n(f.valorUnit),
    desconto: r?.desconto ?? 0,
    pagantes: r?.pagantes ?? 0,
    cortesias: r?.cortesias ?? 0,
    statusEconomico: f.statusEconomico,
    criterioReconhecimento: f.criterioReconhecimento,
    etapas: r?.etapas ?? [],
    competencia: f.competencia ? mesDe(f.competencia) : "",
    referencia: f.referencia,
    observacao: f.observacao,
  };
}

export interface LinhaReceitaCorp {
  r: ReceitaFin;
  m: MetricasReceita;
}

/**
 * Tabela "Receitas corporativas" (Ruling R12): todas as receitas sem evento,
 * inclusive previstas e ainda não faturadas, para editar ou excluir. Segue o
 * Recorte onde ele se aplica: some com o escopo "Somente eventos", período
 * pela competência, centro de custo e busca (id, cliente, origem,
 * referência). A Situação do Recorte é da parcela e não se aplica.
 * Competência mais recente primeiro, depois id.
 */
export function linhasReceitasCorporativas(
  livro: LivroFinanceiro,
  filtros: FiltrosReceber,
): LinhaReceitaCorp[] {
  if (filtros.escopo === "eventos") return [];
  const q = norm(filtros.q);
  return livro.receitas
    .filter((r) => !r.eventoId)
    .filter((r) => filtros.centro === "all" || r.centroCusto === filtros.centro)
    .filter((r) => filtros.periodo === "all" || inPeriod(r.competencia, filtros.periodo))
    .filter((r) => !q || norm([r.id, r.cliente, r.origem, r.referencia].join(" ")).includes(q))
    .map((r) => ({ r, m: receitaFin(r, livro) }))
    .sort(
      (a, b) =>
        (b.r.competencia || "").localeCompare(a.r.competencia || "") ||
        a.r.id.localeCompare(b.r.id, "pt-BR", { numeric: true }),
    );
}

export interface TotaisReceitasCorp {
  valor: Centavos;
  faturado: Centavos;
  aFaturar: Centavos;
}

export const totaisReceitasCorporativas = (
  linhas: readonly LinhaReceitaCorp[],
): TotaisReceitasCorp => ({
  valor: linhas.reduce((a, l) => a + n(l.m.valor), 0),
  faturado: linhas.reduce((a, l) => a + n(l.m.faturado), 0),
  aFaturar: linhas.reduce((a, l) => a + n(l.m.aFaturar), 0),
});

/** Competência `AAAA-MM` → `mm/aaaa` (ou "—"). */
export const competenciaCurta = (c: string): string =>
  /^\d{4}-\d{2}/.test(c) ? `${c.slice(5, 7)}/${c.slice(0, 4)}` : "—";

/** Clientes já usados em receitas corporativas (datalist), em ordem. */
export const clientesCorporativos = (livro: Pick<LivroFinanceiro, "receitas">): string[] =>
  [
    ...new Set(
      livro.receitas
        .filter((x) => !x.eventoId)
        .map((x) => x.cliente)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

export const CAMPOS_DINHEIRO_RECEITA_CORP = ["valorUnit"] as const;
export const CAMPOS_DETALHES_RECEITA_CORP: readonly string[] = [
  "segmento",
  "tipoReceita",
  "criterioReconhecimento",
  "observacao",
];

/** `okDesc` do protótipo: "id · cliente · R$ …". */
export const descricaoReceitaCorpSalva = (id: string, d: DadosReceitaFin): string =>
  `${id} · ${d.cliente} · ${moeda(valorReceita(d as ReceitaFin))}`;

// ---------------------------------------------------------------- contas

export interface LinhaConta {
  conta: ContaFin;
  movimentos: number;
  entradas: Centavos;
  saidas: Centavos;
  saldo: Centavos;
}

export interface ListaContas {
  linhas: LinhaConta[];
  saldoInicial: Centavos;
  saldoAtual: Centavos;
}

/**
 * Tabela "Contas financeiras" (a da Administração do protótipo), com o rodapé
 * consolidado. Os saldos vêm do servidor (`saldosContas`, calculados sobre o
 * livro inteiro antes do recorte — Ruling R11), não do livro desta tela.
 * Conta ainda sem resumo (recém-criada, antes da revalidação) fica com o
 * saldo inicial.
 */
export function listaContas(
  contas: readonly ContaFin[],
  saldos: readonly SaldoContaResumo[],
): ListaContas {
  const porId = new Map(saldos.map((s) => [s.contaId, s]));
  const linhas = contas.map((conta) => {
    const s = porId.get(conta.id);
    return s
      ? { conta, movimentos: s.movimentos, entradas: s.entradas, saidas: s.saidas, saldo: s.saldo }
      : { conta, movimentos: 0, entradas: 0, saidas: 0, saldo: n(conta.saldoInicial) };
  });
  return {
    linhas,
    saldoInicial: contas.reduce((a, c) => a + n(c.saldoInicial), 0),
    saldoAtual: linhas.reduce((a, l) => a + n(l.saldo), 0),
  };
}

/** Os dados da conta como estão, com a situação trocada (inativar/reativar). */
export const contaComSituacao = (c: ContaFin, ativa: boolean): DadosContaFin => ({
  nome: c.nome,
  tipo: c.tipo,
  banco: c.banco,
  agencia: c.agencia,
  numero: c.numero,
  saldoInicial: n(c.saldoInicial),
  dataSaldoInicial: c.dataSaldoInicial,
  ativa,
  observacao: c.observacao,
});
