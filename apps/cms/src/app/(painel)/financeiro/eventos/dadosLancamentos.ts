import {
  CATEGORIAS_CUSTO,
  custoFin,
  custoPrevisto,
  faturamentoFin,
  isContratada,
  LISTAS_FIN,
  mesDe,
  modalidadeKeys,
  pagamentoFin,
  receitaFin,
  retContr,
  retTrib,
  type Centavos,
  type ContaFin,
  type CustoFin,
  type DadosContaFin,
  type DadosCustoFin,
  type DadosFaturamentoFin,
  type DadosPagamentoFin,
  type EventoFin,
  type FaturamentoFin,
  type LivroFinanceiro,
  type MetricasCusto,
  type MetricasEvento,
  type MetricasParcela,
  type MetricasReceita,
  type MetricasTitulo,
  type PagamentoFin,
  type ReceitaFin,
} from "@ntc/lib";

import { moeda } from "../ui/formato";
import { buscaCasa } from "./dadosArea";

/**
 * Derivações das abas Custos, Faturamento e recebimentos e Pagamentos da área
 * do evento e das gavetas de custo, faturamento/recebimento, título/baixa e
 * conta (`wsCustos`, `wsFaturamento`, `wsPagamentos`, `openCustoDrawer`,
 * `openFatrecDrawer`, `openPagamentoDrawer`, `openContaDrawer` do protótipo
 * FIN-05). Puras: o JSX só apresenta o que sai daqui.
 */

const n = (v: unknown): number => Number(v) || 0;
const soma = <T>(xs: readonly T[], f: (x: T) => number): number =>
  xs.reduce((a, x) => a + n(f(x)), 0);

/** Sinal do desvio no texto (`+R$ 10,00`; zero = "—"). */
export const comSinal = (v: Centavos): string => `${v > 0 ? "+" : ""}${moeda(v)}`;
/** Classe do desvio: acima do previsto é ruim (`neg`), abaixo é bom (`pos`). */
export const classeDesvio = (v: Centavos): string => (v > 0 ? "neg" : v < 0 ? "pos" : "");

/** Data do formulário (`AAAA-MM-DD`) a partir de uma competência `AAAA-MM` gravada. */
export const dataDaCompetencia = (c: string): string => (/^\d{4}-\d{2}$/.test(c) ? `${c}-01` : c);

// ================================================================ custos

export type LinhaCusto = { c: CustoFin; f: MetricasCusto };

export interface FiltrosCustos {
  busca: string;
  /** "all" = todas. */
  fase: string;
  status: string;
}

export interface TabelaCustos {
  linhas: LinhaCusto[];
  grupos: { fase: string; itens: LinhaCusto[]; previsto: Centavos; realizado: Centavos }[];
  totais: { previsto: Centavos; realizado: Centavos; desvio: Centavos; pago: Centavos };
}

/** Tabela agrupada por fase (`rows`/`byFase` de `wsCustos`); o total soma as linhas filtradas. */
export function tabelaCustos(m: Pick<MetricasEvento, "cf">, filtros: FiltrosCustos): TabelaCustos {
  const linhas = m.cf.filter(
    ({ c, f }) =>
      (filtros.fase === "all" || c.fase === filtros.fase) &&
      (filtros.status === "all" || f.status === filtros.status) &&
      buscaCasa(
        filtros.busca,
        c.descricao,
        c.categoria,
        c.subcategoria,
        c.fornecedor,
        c.id,
        c.documento,
      ),
  );
  const grupos = LISTAS_FIN.fases
    .map((fase) => {
      const itens = linhas.filter((x) => x.c.fase === fase);
      return {
        fase,
        itens,
        previsto: soma(itens, (x) => x.f.previsto),
        realizado: soma(itens, (x) => x.f.realizado),
      };
    })
    .filter((g) => g.itens.length > 0);
  return {
    linhas,
    grupos,
    totais: {
      previsto: soma(linhas, (x) => x.f.previsto),
      realizado: soma(linhas, (x) => x.f.realizado),
      desvio: soma(linhas, (x) => x.f.desvio),
      pago: soma(linhas, (x) => x.f.pago),
    },
  };
}

/** Faixa "Categorias priorizadas para esta modalidade": as exclusivas da modalidade, marcando as já lançadas. */
export function categoriasPriorizadas(
  ev: Pick<EventoFin, "modalidade">,
  m: Pick<MetricasEvento, "cf">,
): { categorias: { nome: string; lancada: boolean }[]; semLancamento: number } {
  const chaves = modalidadeKeys(ev.modalidade);
  const categorias = CATEGORIAS_CUSTO.filter(
    (c) => c.mod.length === 1 && chaves.includes(c.mod[0]!),
  ).map((c) => ({ nome: c.nome, lancada: m.cf.some((x) => x.c.categoria === c.nome) }));
  return { categorias, semLancamento: categorias.filter((c) => !c.lancada).length };
}

/** Itens com realizado acima do previsto. */
export const itensAcima = (m: Pick<MetricasEvento, "cf">): number =>
  m.cf.filter((x) => x.f.acima).length;

/** Fração paga do realizado (minibar da coluna Pago); `null` sem realizado. */
export const fracaoPaga = (f: Pick<MetricasCusto, "pago" | "realizado">): number | null =>
  f.realizado ? Math.min(1, f.pago / f.realizado) : null;

/** Sub-linha da descrição do custo: categoria · subcategoria (se diferente) · natureza · comportamento. */
export function subDescricaoCusto(c: CustoFin): string {
  const sub = c.subcategoria && c.subcategoria !== c.descricao ? ` · ${c.subcategoria}` : "";
  return `${c.categoria}${sub} · ${c.natureza} · ${c.comportamento}`;
}

export interface GrupoOpcoes {
  grupo: string;
  opcoes: string[];
}

/** `categoryOptions(mod)`: priorizadas, comuns e (se houver) outras. */
export function opcoesCategoria(modalidade: string): GrupoOpcoes[] {
  const chaves = modalidadeKeys(modalidade);
  const esp = CATEGORIAS_CUSTO.filter((c) => c.mod.length === 1 && chaves.includes(c.mod[0]!));
  const com = CATEGORIAS_CUSTO.filter((c) => c.mod.length === 2);
  const out = CATEGORIAS_CUSTO.filter((c) => !esp.includes(c) && !com.includes(c));
  const g: GrupoOpcoes[] = [
    { grupo: `Priorizadas · ${modalidade}`, opcoes: esp.map((c) => c.nome) },
    { grupo: "Comuns a todas as modalidades", opcoes: com.map((c) => c.nome) },
  ];
  if (out.length) g.push({ grupo: "Outras categorias", opcoes: out.map((c) => c.nome) });
  return g;
}

export const subcategoriasDe = (categoria: string): readonly string[] =>
  CATEGORIAS_CUSTO.find((k) => k.nome === categoria)?.subs ?? [];

/** Fornecedores já usados (datalist), em ordem alfabética. */
export const fornecedoresSugeridos = (livro: Pick<LivroFinanceiro, "custos">): string[] =>
  [...new Set(livro.custos.map((x) => x.fornecedor).filter(Boolean))].sort();

/** Estado do formulário de custo: `qtde` como texto (campo number), dinheiro em centavos, datas `AAAA-MM-DD`. */
export interface FormCusto {
  fase: string;
  categoria: string;
  subcategoria: string;
  descricao: string;
  fornecedor: string;
  documento: string;
  natureza: string;
  comportamento: string;
  driver: string;
  unidade: string;
  qtde: string;
  valorUnitPrev: Centavos | null;
  valorRealizado: Centavos | null;
  /** Data no formulário; gravada como `AAAA-MM`. */
  competencia: string;
  dataPrevista: string;
  criterioApropriacao: string;
  observacao: string;
  centroCusto: string;
}

/** Valores iniciais (`v` de `openCustoDrawer`) + centro de custo OPE (spec §3.7). */
export function formCusto(
  ev: Pick<EventoFin, "dataInicio" | "dataFim">,
  c: CustoFin | null,
): FormCusto {
  if (c)
    return {
      fase: c.fase,
      categoria: c.categoria,
      subcategoria: c.subcategoria,
      descricao: c.descricao,
      fornecedor: c.fornecedor,
      documento: c.documento,
      natureza: c.natureza,
      comportamento: c.comportamento,
      driver: c.driver,
      unidade: c.unidade,
      qtde: String(n(c.qtde)),
      valorUnitPrev: n(c.valorUnitPrev),
      valorRealizado: n(c.valorRealizado),
      competencia: dataDaCompetencia(c.competencia),
      dataPrevista: c.dataPrevista,
      criterioApropriacao: c.criterioApropriacao,
      observacao: c.observacao,
      centroCusto: c.centroCusto || "OPE",
    };
  return {
    fase: "",
    categoria: "",
    subcategoria: "",
    descricao: "",
    fornecedor: "",
    documento: "",
    natureza: "Direto",
    comportamento: "A validar",
    driver: "",
    unidade: "un",
    qtde: "1",
    valorUnitPrev: 0,
    valorRealizado: 0,
    competencia: ev.dataFim,
    dataPrevista: ev.dataInicio,
    criterioApropriacao: "",
    observacao: "",
    centroCusto: "OPE",
  };
}

/** O `save` do drawer. O que o formulário não mostra (compartilhada, origem, periodicidade) vem do custo gravado. */
export function dadosDoCusto(
  f: FormCusto,
  ev: Pick<EventoFin, "id">,
  c: CustoFin | null,
): DadosCustoFin {
  return {
    eventoId: ev.id,
    tipoLancamento: "Evento",
    centroCusto: f.centroCusto,
    compartilhada: c?.compartilhada ?? false,
    origemLancamento: c?.origemLancamento ?? "",
    fase: f.fase,
    categoria: f.categoria,
    subcategoria: f.subcategoria,
    descricao: f.descricao,
    fornecedor: f.fornecedor,
    documento: f.documento,
    natureza: f.natureza,
    comportamento: f.comportamento,
    driver: f.driver,
    unidade: f.unidade,
    qtde: n(f.qtde),
    valorUnitPrev: n(f.valorUnitPrev),
    valorRealizado: n(f.valorRealizado),
    competencia: f.competencia ? mesDe(f.competencia) : "",
    dataPrevista: f.dataPrevista,
    periodicidade: c?.periodicidade ?? "",
    criterioApropriacao: f.criterioApropriacao,
    observacao: f.observacao,
  };
}

/** Campos calculados: total previsto, desvio (`null` = não realizado) e status automático. */
export function calculosCusto(
  f: FormCusto,
  ev: Pick<EventoFin, "id">,
  c: CustoFin | null,
  livro: LivroFinanceiro,
): { previsto: Centavos; desvio: Centavos | null; status: MetricasCusto["status"] } {
  const d = dadosDoCusto(f, ev, c);
  const previsto = custoPrevisto(d as CustoFin);
  const r = n(d.valorRealizado);
  const status = c ? custoFin({ ...d, id: c.id }, livro).status : r > 0 ? "Realizado" : "Previsto";
  return { previsto, desvio: r ? r - previsto : null, status };
}

/** "Critério de apropriação" só aparece em estrutura compartilhada ou custo indireto. */
export const mostraCriterioApropriacao = (f: Pick<FormCusto, "fase" | "natureza">): boolean =>
  f.fase === "Estrutura compartilhada" || f.natureza === "Indireto";

export const CAMPOS_DINHEIRO_CUSTO = ["valorUnitPrev", "valorRealizado"] as const;
/** Campos em "Mais detalhes": erro num deles abre o bloco. */
export const CAMPOS_DETALHES_CUSTO: readonly string[] = [
  "natureza",
  "comportamento",
  "driver",
  "criterioApropriacao",
  "documento",
  "dataPrevista",
  "competencia",
  "centroCusto",
  "observacao",
];

export const descricaoCustoSalvo = (id: string, d: DadosCustoFin): string =>
  `${id} · ${d.descricao} · previsto ${moeda(custoPrevisto(d as CustoFin))}`;

// ======================================================= faturamento

/** Receitas faturáveis do evento: as contratadas. */
export const receitasFaturaveis = (
  livro: Pick<LivroFinanceiro, "receitas">,
  eventoId: string,
): ReceitaFin[] => livro.receitas.filter((r) => r.eventoId === eventoId && isContratada(r));

export interface ResumoFaturamento {
  retTrib: Centavos;
  retContr: Centavos;
  retTotal: Centavos;
  aLiberar: Centavos;
  exigivel: Centavos;
  vencidos: number;
}

/** Retenções, exigível e parcelas vencidas do evento (cabeçalho de `wsFaturamento`). */
export function resumoFaturamento(
  livro: LivroFinanceiro,
  eventoId: string,
  hoje: string,
): ResumoFaturamento {
  const fat = livro.faturamentos.filter((f) => f.eventoId === eventoId);
  const met = fat.map((f) => faturamentoFin(f, hoje));
  const rt = soma(fat, retTrib);
  const rc = soma(fat, retContr);
  return {
    retTrib: rt,
    retContr: rc,
    retTotal: rt + rc,
    aLiberar: soma(met, (x) => x.aLiberar),
    exigivel: soma(met, (x) => x.exigivel),
    vencidos: met.filter((x) => x.vencido).length,
  };
}

export interface GrupoFaturamento {
  r: ReceitaFin;
  f: MetricasReceita;
  parcelas: { p: FaturamentoFin; x: MetricasParcela }[];
}

/** Receitas contratadas com suas parcelas, filtradas pela busca e por "Somente com saldo". */
export function gruposFaturamento(
  m: Pick<MetricasEvento, "rf">,
  hoje: string,
  busca: string,
  soSaldo: boolean,
): GrupoFaturamento[] {
  const out: GrupoFaturamento[] = [];
  for (const { r, f } of m.rf.filter((x) => isContratada(x.r))) {
    let parc = f.parcelas;
    if (
      !buscaCasa(
        busca,
        r.cliente,
        r.id,
        r.segmento,
        ...parc.map((p) => `${p.nf} ${p.parcela} ${p.id}`),
      )
    )
      continue;
    if (soSaldo) {
      parc = parc.filter((p) => faturamentoFin(p, hoje).saldo > 0);
      if (!parc.length && f.aFaturar <= 0) continue;
    }
    out.push({ r, f, parcelas: parc.map((p) => ({ p, x: faturamentoFin(p, hoje) })) });
  }
  return out;
}

/** Situação da parcela na tabela: vencida tem precedência. */
export const situacaoParcela = (x: Pick<MetricasParcela, "vencido" | "status">): string =>
  x.vencido ? "Vencida" : x.status;

/** Estado do formulário de faturamento/recebimento. */
export interface FormFaturamento {
  receitaId: string;
  parcela: string;
  nf: string;
  dataFaturamento: string;
  vencimento: string;
  valorFaturado: Centavos | null;
  retencaoTributaria: Centavos | null;
  retencaoContratual: Centavos | null;
  retencaoContratualLiberada: Centavos | null;
  dataRecebimento: string;
  valorRecebido: Centavos | null;
  contaId: string;
  quitado: boolean;
  observacao: string;
}

/** Primeira conta ativa (default do protótipo, que pegava a primeira conta). */
export const contaPadrao = (contas: readonly ContaFin[]): string =>
  contas.find((c) => c.ativa)?.id ?? "";

/** Valor sugerido e nome da parcela ao escolher a receita (faturamento novo). */
export function aoEscolherReceita(
  f: FormFaturamento,
  receitaId: string,
  receitas: readonly ReceitaFin[],
  livro: LivroFinanceiro,
): FormFaturamento {
  const r = receitas.find((x) => x.id === receitaId);
  if (!r) return { ...f, receitaId };
  const m = receitaFin(r, livro);
  return {
    ...f,
    receitaId,
    valorFaturado: m.aFaturar,
    parcela: f.parcela || `Parcela ${m.parcelas.length + 1}`,
  };
}

/** Valores iniciais (`v` de `openFatrecDrawer`). */
export function formFaturamento(p: {
  faturamento: FaturamentoFin | null;
  receitaId?: string;
  receitas: readonly ReceitaFin[];
  livro: LivroFinanceiro;
  modo: "editar" | "receber";
  hoje: string;
}): FormFaturamento {
  const { faturamento: fat, receitas, livro, modo, hoje } = p;
  let f: FormFaturamento;
  if (fat)
    f = {
      receitaId: fat.receitaId,
      parcela: fat.parcela,
      nf: fat.nf,
      dataFaturamento: fat.dataFaturamento,
      vencimento: fat.vencimento,
      valorFaturado: n(fat.valorFaturado),
      retencaoTributaria: n(fat.retencaoTributaria),
      retencaoContratual: n(fat.retencaoContratual),
      retencaoContratualLiberada: n(fat.retencaoContratualLiberada),
      dataRecebimento: fat.dataRecebimento,
      valorRecebido: n(fat.valorRecebido),
      contaId: fat.contaId,
      quitado: fat.quitado,
      observacao: fat.observacao,
    };
  else {
    const receitaId = p.receitaId || (receitas.length === 1 ? receitas[0]!.id : "");
    f = {
      receitaId: "",
      parcela: "",
      nf: "",
      dataFaturamento: hoje,
      valorFaturado: 0,
      vencimento: "",
      retencaoTributaria: 0,
      retencaoContratual: 0,
      retencaoContratualLiberada: 0,
      dataRecebimento: "",
      valorRecebido: 0,
      contaId: contaPadrao(livro.contas),
      quitado: false,
      observacao: "",
    };
    f = receitaId ? aoEscolherReceita(f, receitaId, receitas, livro) : f;
  }
  if (modo === "receber" && !n(f.valorRecebido)) f = { ...f, dataRecebimento: hoje };
  return f;
}

export function dadosDoFaturamento(f: FormFaturamento): DadosFaturamentoFin {
  return {
    receitaId: f.receitaId,
    parcela: f.parcela,
    nf: f.nf,
    dataFaturamento: f.dataFaturamento,
    valorFaturado: n(f.valorFaturado),
    vencimento: f.vencimento,
    retencaoTributaria: n(f.retencaoTributaria),
    retencaoContratual: n(f.retencaoContratual),
    retencaoContratualLiberada: n(f.retencaoContratualLiberada),
    dataRecebimento: f.dataRecebimento,
    valorRecebido: n(f.valorRecebido),
    contaId: f.contaId,
    quitado: f.quitado,
    observacao: f.observacao,
  };
}

/** `liqEsp`: faturado − retenção tributária − retenção contratual. */
export const liquidoEsperado = (
  f: Pick<FormFaturamento, "valorFaturado" | "retencaoTributaria" | "retencaoContratual">,
): Centavos => n(f.valorFaturado) - n(f.retencaoTributaria) - n(f.retencaoContratual);

/** Campos calculados do recebimento; `diferenca` = `null` com a parcela em aberto. */
export function calculosFaturamento(f: FormFaturamento): {
  liquido: Centavos;
  aReceber: Centavos;
  emAberto: Centavos;
  diferenca: Centavos | null;
} {
  const liquido = liquidoEsperado(f);
  const rec = n(f.valorRecebido);
  return {
    liquido,
    aReceber: Math.max(0, liquido - rec),
    emAberto: n(f.valorFaturado) - rec,
    diferenca: f.quitado ? rec - liquido : null,
  };
}

/** `saldoInfo`: contratado, já faturado (sem esta parcela) e saldo a faturar da receita escolhida. */
export function saldoAFaturar(
  receitas: readonly ReceitaFin[],
  livro: LivroFinanceiro,
  receitaId: string,
  faturamentoId: string | null,
): { contratado: Centavos; jaFaturado: Centavos; saldo: Centavos } | null {
  const r = receitas.find((k) => k.id === receitaId);
  if (!r) return null;
  const m = receitaFin(r, livro);
  const jaFaturado = soma(
    m.parcelas.filter((k) => k.id !== faturamentoId),
    (k) => k.valorFaturado,
  );
  return { contratado: m.valor, jaFaturado, saldo: m.valor - jaFaturado };
}

/** Botões "Recebido integral (faturado)" / "Recebido líquido de retenções". */
export function preencherRecebido(
  f: FormFaturamento,
  como: "bruto" | "liq",
  hoje: string,
): FormFaturamento {
  return {
    ...f,
    valorRecebido: como === "liq" ? liquidoEsperado(f) : n(f.valorFaturado),
    dataRecebimento: f.dataRecebimento || hoje,
  };
}

export const CAMPOS_DINHEIRO_FATURAMENTO = [
  "valorFaturado",
  "retencaoTributaria",
  "retencaoContratual",
  "retencaoContratualLiberada",
  "valorRecebido",
] as const;
/** Campos do bloco "Recebimento" (fechado no modo editar). */
export const CAMPOS_RECEBIMENTO: readonly string[] = [
  "dataRecebimento",
  "valorRecebido",
  "contaId",
  "quitado",
];

export const descricaoFaturamentoSalvo = (d: DadosFaturamentoFin): string =>
  `${d.nf || d.parcela} · faturado ${moeda(d.valorFaturado)} · recebido ${moeda(d.valorRecebido, false)}`;

// ======================================================== pagamentos

export interface GrupoPagamento {
  c: CustoFin;
  f: MetricasCusto;
  titulos: { p: PagamentoFin; x: MetricasTitulo }[];
}

/** Custos realizados ou com título, filtrados pela busca e por "Somente com saldo". */
export function gruposPagamentos(
  m: Pick<MetricasEvento, "cf">,
  hoje: string,
  busca: string,
  soSaldo: boolean,
): GrupoPagamento[] {
  return m.cf
    .filter(({ f }) => f.realizado > 0 || f.pagamentos.length > 0)
    .filter(({ c, f }) =>
      buscaCasa(
        busca,
        c.descricao,
        c.fornecedor,
        c.categoria,
        c.id,
        ...f.pagamentos.map((p) => p.documento),
      ),
    )
    .filter(
      ({ f }) =>
        !soSaldo || f.aPagar > 0 || f.pagamentos.some((p) => pagamentoFin(p, hoje).saldo > 0),
    )
    .map(({ c, f }) => ({
      c,
      f,
      titulos: f.pagamentos.map((p) => ({ p, x: pagamentoFin(p, hoje) })),
    }));
}

export interface ResumoPagamentos {
  nRealizados: number;
  vencidoSaldo: Centavos;
  nVencidos: number;
  /** Custos realizados sem título programado para todo o valor. */
  semTitulo: number;
  totalTitulos: Centavos;
}

export function resumoPagamentos(
  livro: Pick<LivroFinanceiro, "pagamentos">,
  eventoId: string,
  m: Pick<MetricasEvento, "cf">,
  hoje: string,
): ResumoPagamentos {
  const pays = livro.pagamentos.filter((p) => p.eventoId === eventoId);
  const venc = pays.map((p) => pagamentoFin(p, hoje)).filter((x) => x.vencido);
  return {
    nRealizados: m.cf.filter((x) => x.f.realizado > 0).length,
    vencidoSaldo: soma(venc, (x) => x.saldo),
    nVencidos: venc.length,
    semTitulo: m.cf.filter(({ f }) => f.realizado > 0 && f.programado < f.realizado).length,
    totalTitulos: soma(pays, (p) => p.valor),
  };
}

/** Situação do título na tabela: vencido tem precedência. */
export const situacaoTitulo = (x: Pick<MetricasTitulo, "vencido" | "status">): string =>
  x.vencido ? "Vencido" : x.status;

export const custosDoEvento = (
  livro: Pick<LivroFinanceiro, "custos">,
  eventoId: string,
): CustoFin[] => livro.custos.filter((c) => c.eventoId === eventoId);

/** Select "Custo vinculado": por fase no evento, por categoria corporativa sem evento; grupos vazios saem. */
export function opcoesCustos(custos: readonly CustoFin[], corporativo: boolean): GrupoOpcoes[] {
  const grupos = corporativo ? LISTAS_FIN.categoriasCorporativas : LISTAS_FIN.fases;
  return grupos
    .map((g) => ({
      grupo: g,
      opcoes: custos.filter((c) => (corporativo ? c.categoria : c.fase) === g).map((c) => c.id),
    }))
    .filter((g) => g.opcoes.length > 0);
}

/** Base do título: o realizado, ou o previsto enquanto não realizado. */
function baseDoCusto(c: CustoFin, livro: LivroFinanceiro): Centavos {
  const f = custoFin(c, livro);
  return f.realizado > 0 ? f.realizado : f.previsto;
}

export interface FormPagamento {
  custoId: string;
  documento: string;
  vencimento: string;
  valor: Centavos | null;
  dataPagamento: string;
  valorPago: Centavos | null;
  contaId: string;
  observacao: string;
}

/** `suggest`: o saldo do custo ainda não programado. */
export function aoEscolherCusto(
  f: FormPagamento,
  custoId: string,
  custos: readonly CustoFin[],
  livro: LivroFinanceiro,
): FormPagamento {
  const c = custos.find((k) => k.id === custoId);
  if (!c) return { ...f, custoId };
  return {
    ...f,
    custoId,
    valor: Math.max(0, baseDoCusto(c, livro) - custoFin(c, livro).programado),
  };
}

/** Valores iniciais (`v` de `openPagamentoDrawer`). */
export function formPagamento(p: {
  pagamento: PagamentoFin | null;
  custoId?: string;
  custos: readonly CustoFin[];
  livro: LivroFinanceiro;
  modo: "editar" | "baixar";
  hoje: string;
}): FormPagamento {
  const { pagamento: pg, custos, livro, modo, hoje } = p;
  let f: FormPagamento = pg
    ? {
        custoId: pg.custoId,
        documento: pg.documento,
        vencimento: pg.vencimento,
        valor: n(pg.valor),
        dataPagamento: pg.dataPagamento,
        valorPago: n(pg.valorPago),
        contaId: pg.contaId,
        observacao: pg.observacao,
      }
    : {
        custoId: p.custoId || "",
        documento: "",
        vencimento: "",
        valor: 0,
        dataPagamento: "",
        valorPago: 0,
        contaId: contaPadrao(livro.contas),
        observacao: "",
      };
  if (!pg && f.custoId) f = aoEscolherCusto(f, f.custoId, custos, livro);
  if (modo === "baixar" && !n(f.valorPago)) f = { ...f, dataPagamento: hoje };
  return f;
}

export function dadosDoPagamento(f: FormPagamento): DadosPagamentoFin {
  return {
    custoId: f.custoId,
    documento: f.documento,
    vencimento: f.vencimento,
    valor: n(f.valor),
    dataPagamento: f.dataPagamento,
    valorPago: n(f.valorPago),
    contaId: f.contaId,
    observacao: f.observacao,
  };
}

/** "Pagar valor integral do título". */
export const pagarIntegral = (f: FormPagamento, hoje: string): FormPagamento => ({
  ...f,
  valorPago: n(f.valor),
  dataPagamento: f.dataPagamento || hoje,
});

/** `custoInfo`: fornecedor, previsto, realizado e pago do custo escolhido. */
export function infoCusto(
  custos: readonly CustoFin[],
  livro: LivroFinanceiro,
  custoId: string,
): { fornecedor: string; previsto: Centavos; realizado: Centavos; pago: Centavos } | null {
  const c = custos.find((k) => k.id === custoId);
  if (!c) return null;
  const f = custoFin(c, livro);
  return {
    fornecedor: c.fornecedor || "Fornecedor não informado",
    previsto: f.previsto,
    realizado: f.realizado,
    pago: f.pago,
  };
}

export const CAMPOS_DINHEIRO_PAGAMENTO = ["valor", "valorPago"] as const;
/** Campos do bloco "Baixa do pagamento" (fechado no modo editar). */
export const CAMPOS_BAIXA: readonly string[] = ["dataPagamento", "valorPago", "contaId"];

export const descricaoPagamentoSalvo = (id: string, d: DadosPagamentoFin): string =>
  `${id} · título ${moeda(d.valor)} · pago ${moeda(d.valorPago, false)}`;

// ============================================================ contas

/** `contaOpts`: só contas ativas — mais a já escolhida, se foi inativada depois. */
export const contasSelecionaveis = (contas: readonly ContaFin[], atual: string): ContaFin[] =>
  contas.filter((c) => c.ativa || c.id === atual);

export const rotuloConta = (c: Pick<ContaFin, "nome" | "banco">): string =>
  `${c.nome}${c.banco ? ` · ${c.banco}` : ""}`;

/** `contaNome`: nome da conta, ou "—". */
export const nomeConta = (contas: readonly ContaFin[], id: string): string =>
  contas.find((x) => x.id === id)?.nome ?? "—";

/**
 * Contas do livro mais as criadas agora numa gaveta ("Nova conta"), antes de
 * o livro revalidado chegar: substitui pelo id, acrescenta as novas.
 */
export function contasComExtras(
  contas: readonly ContaFin[],
  extras: readonly ContaFin[],
): ContaFin[] {
  const ids = new Set(contas.map((c) => c.id));
  return [
    ...contas.map((c) => extras.find((e) => e.id === c.id) ?? c),
    ...extras.filter((e) => !ids.has(e.id)),
  ];
}

export interface FormConta {
  nome: string;
  tipo: string;
  banco: string;
  agencia: string;
  numero: string;
  saldoInicial: Centavos | null;
  dataSaldoInicial: string;
  ativa: boolean;
  observacao: string;
}

/** Valores iniciais (`openContaDrawer`); o saldo inicial nasce no 1º de janeiro do ano corrente. */
export function formConta(c: ContaFin | null, hoje: string): FormConta {
  if (c)
    return {
      nome: c.nome,
      tipo: c.tipo,
      banco: c.banco,
      agencia: c.agencia,
      numero: c.numero,
      saldoInicial: n(c.saldoInicial),
      dataSaldoInicial: c.dataSaldoInicial,
      ativa: c.ativa,
      observacao: c.observacao,
    };
  return {
    nome: "",
    tipo: "Conta corrente",
    banco: "",
    agencia: "",
    numero: "",
    saldoInicial: 0,
    dataSaldoInicial: `${hoje.slice(0, 4)}-01-01`,
    ativa: true,
    observacao: "",
  };
}

export const dadosDaConta = (f: FormConta): DadosContaFin => ({
  nome: f.nome,
  tipo: f.tipo,
  banco: f.banco,
  agencia: f.agencia,
  numero: f.numero,
  saldoInicial: n(f.saldoInicial),
  dataSaldoInicial: f.dataSaldoInicial,
  ativa: f.ativa,
  observacao: f.observacao,
});
