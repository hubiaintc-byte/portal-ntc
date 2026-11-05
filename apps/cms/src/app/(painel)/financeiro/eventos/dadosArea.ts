import {
  isContratada,
  receitaReconhecida,
  valorBruto,
  valorReceita,
  CRIT_PROVISORIO,
  type AlertaFin,
  type Centavos,
  type DadosReceitaFin,
  type EtapaReceita,
  type EventoFin,
  type LivroFinanceiro,
  type MetricasEvento,
  type MetricasReceita,
  type ReceitaFin,
} from "@ntc/lib";
import type { AbaEvento } from "../ShellFinanceiro";
import { inteiro, intervaloDatas, moeda, porcentagem, tipoCurto } from "../ui/formato";

/**
 * Derivações da área do evento (`Views.workspace`, `wsOverview`, `wsReceitas`,
 * `openReceitaDrawer`, `openEtapasDrawer`, `wsResultado` do protótipo FIN-05),
 * puras e testáveis: o JSX só apresenta o que sai daqui.
 */

const n = (v: unknown): number => Number(v) || 0;
/** Critério que `salvarEtapasFin` grava quando há etapas. */
const CRIT_POR_ETAPA = "Por etapa/módulo concluído";
const norm = (s: unknown): string =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// ------------------------------------------------------------------ abas

/** `WS_TABS` do protótipo, na ordem dele, sem Comissões (Fase 2). */
export const ABAS_EVENTO: readonly {
  id: AbaEvento;
  rotulo: string;
  icone: "home" | "inn" | "out" | "receipt" | "wallet" | "scale";
}[] = [
  { id: "visao", rotulo: "Visão geral", icone: "home" },
  { id: "receitas", rotulo: "Receitas", icone: "inn" },
  { id: "custos", rotulo: "Custos", icone: "out" },
  { id: "faturamento", rotulo: "Faturamento e recebimentos", icone: "receipt" },
  { id: "pagamentos", rotulo: "Pagamentos", icone: "wallet" },
  { id: "resultado", rotulo: "Resultado", icone: "scale" },
];

/** Contagens das abas (`counts` do protótipo); Visão geral e Resultado não têm. */
export function contagensAbas(
  ev: EventoFin,
  livro: LivroFinanceiro,
  m: Pick<MetricasEvento, "nReceitas" | "nCustos">,
): Partial<Record<AbaEvento, number>> {
  return {
    receitas: m.nReceitas,
    custos: m.nCustos,
    faturamento: livro.faturamentos.filter((f) => f.eventoId === ev.id).length,
    pagamentos: livro.pagamentos.filter((p) => p.eventoId === ev.id).length,
  };
}

/** O "!" da aba Visão geral: há vencimento sem baixa. */
export const temVencido = (alertas: readonly AlertaFin[]): boolean =>
  alertas.some((a) => a.severidade === "Vencido");

// ---------------------------------------------------------- visão geral

/** `isAberto` do protótipo: evento aberto e avulso têm receita por inscrição. */
export const ehAberto = (ev: Pick<EventoFin, "tipo">): boolean =>
  ev.tipo === "Evento aberto" || ev.tipo === "Evento avulso";

/** `pct(a, b)` do protótipo: percentual sem casas, "—" quando o divisor é zero. */
export const percentualDe = (a: number, b: number): string => (b ? porcentagem(a / b, 0) : "—");

/** Órgãos distintos nas receitas do evento (`new Set(m.rf.map(norm(cliente)))`). */
export const orgaosDistintos = (m: Pick<MetricasEvento, "rf">): number =>
  new Set(m.rf.map((x) => norm(x.r.cliente))).size;

/** "Programa · módulo" (vazio quando nenhum dos dois). */
export const programaModulo = (ev: Pick<EventoFin, "programa" | "modulo">): string =>
  [ev.programa, ev.modulo].filter(Boolean).join(" · ");

/** Linha "Local" dos fatos. Sem cidade nem UF, o "/" solto do protótipo some. */
export function localDoEvento(
  ev: Pick<EventoFin, "modalidade" | "local" | "cidade" | "uf">,
): string {
  const cidade = ev.cidade || ev.uf ? `${ev.cidade}/${ev.uf}` : "";
  const partes =
    ev.modalidade === "Online ao vivo" ? ["Online", cidade] : [ev.local || "—", cidade];
  return partes.filter(Boolean).join(" · ");
}

export type Fato = { rotulo: string; texto: string; tipo?: "vertical" | "status" | "numero" };

/**
 * Os fatos do cadastro (`facts` de `wsOverview`). "Referência CRM" saiu: o
 * `refCrm` do protótipo não existe no portal (spec §3.2 — o vínculo é a
 * própria ligação com o evento comercial).
 */
export function fatosDoEvento(ev: EventoFin, m: Pick<MetricasEvento, "rf">): Fato[] {
  return [
    { rotulo: "Vertical", texto: ev.vertical, tipo: "vertical" },
    { rotulo: "Tipo de operação", texto: tipoCurto(ev.tipo) || "—" },
    { rotulo: "Modalidade", texto: ev.modalidade || "—" },
    { rotulo: "Status", texto: ev.status, tipo: "status" },
    { rotulo: "Período", texto: intervaloDatas(ev.dataInicio, ev.dataFim), tipo: "numero" },
    { rotulo: "Carga horária", texto: `${inteiro(n(ev.cargaHoraria))} h` },
    { rotulo: "Local", texto: localDoEvento(ev) },
    { rotulo: "Responsável", texto: ev.responsavel || "—" },
    { rotulo: "Programa / módulo", texto: programaModulo(ev) || "—" },
    {
      rotulo: "Cliente / órgão",
      texto:
        ev.tipo === "Evento aberto"
          ? `Múltiplos · ${orgaosDistintos(m)} órgão(s)`
          : ev.cliente || "—",
    },
    { rotulo: "Referência contratual", texto: ev.refContratual || "—" },
  ];
}

export type MiniKpi = [rotulo: string, valor: string, sub: string];

/** Mini-KPIs de "Operação" (`op` de `wsOverview`); vazio = o bloco não aparece. */
export function operacaoDoEvento(
  ev: EventoFin,
  m: Pick<MetricasEvento, "pagantes" | "cortesias" | "participantes">,
): MiniKpi[] {
  const op: MiniKpi[] = [];
  const aberto = ehAberto(ev);
  if (n(ev.qtdPrevista))
    op.push([
      "Previstos",
      inteiro(ev.qtdPrevista),
      ev.capacidade ? `capacidade ${inteiro(ev.capacidade)}` : "",
    ]);
  if (["Em execução", "Realizado", "Encerrado"].includes(ev.status) && n(ev.efetivos))
    op.push([
      "Efetivos",
      inteiro(ev.efetivos),
      ev.qtdPrevista ? `${percentualDe(ev.efetivos, ev.qtdPrevista)} do previsto` : "",
    ]);
  if (m.pagantes || aberto)
    op.push([
      "Pagantes",
      inteiro(m.pagantes),
      ev.pagantesPrev ? `previsto ${inteiro(ev.pagantesPrev)}` : "registrados nas receitas",
    ]);
  if (m.cortesias || aberto)
    op.push([
      "Cortesias",
      inteiro(m.cortesias),
      ev.cortesiasPrev ? `previsto ${inteiro(ev.cortesiasPrev)}` : "não é custo nem desconto",
    ]);
  if (m.participantes)
    op.push(["Participantes totais", inteiro(m.participantes), "pagantes + cortesias"]);
  return op;
}

// --------------------------------------------------------------- receitas

/** `qMatch` do protótipo: todos os termos da busca aparecem em algum dos campos. */
export function buscaCasa(busca: string, ...campos: string[]): boolean {
  const q = norm(busca).trim();
  if (!q) return true;
  const alvo = norm(campos.join(" "));
  return q.split(/\s+/).every((t) => alvo.includes(t));
}

export interface LinhaReceita {
  r: ReceitaFin;
  f: MetricasReceita;
  reconhecida: Centavos;
  etapasConcluidas: number;
  etapasTotal: number;
}

/** Linhas da tabela de receitas, já filtradas pela busca (cliente, segmento, tipo, id, etapa). */
export function linhasReceitas(
  m: Pick<MetricasEvento, "rf">,
  livro: LivroFinanceiro,
  hoje: string,
  busca: string,
): LinhaReceita[] {
  return m.rf
    .filter(({ r }) => buscaCasa(busca, r.cliente, r.segmento, r.tipoReceita, r.id, r.etapa))
    .map(({ r, f }) => ({
      r,
      f,
      reconhecida: receitaReconhecida(r, livro, hoje),
      etapasConcluidas: (r.etapas || []).filter((e) => e.concluida).length,
      etapasTotal: (r.etapas || []).length,
    }));
}

export interface ResumoReceitas {
  nContratadas: number;
  orgaos: number;
  /** Desconto das contratadas (rodapé do modo aberto). */
  descontoContratado: Centavos;
  /** Reconhecida somada de todas as receitas do evento (rodapé). */
  reconhecidaTotal: Centavos;
}

export function resumoReceitas(
  m: Pick<MetricasEvento, "rf">,
  livro: LivroFinanceiro,
  hoje: string,
): ResumoReceitas {
  return {
    nContratadas: m.rf.filter((x) => isContratada(x.r)).length,
    orgaos: orgaosDistintos(m),
    descontoContratado: m.rf.reduce((a, x) => a + (isContratada(x.r) ? n(x.r.desconto) : 0), 0),
    reconhecidaTotal: m.rf.reduce((a, x) => a + receitaReconhecida(x.r, livro, hoje), 0),
  };
}

/** Receitas contratadas: o botão "Etapas e reconhecimento" abre direto se só há uma. */
export const receitasContratadas = (m: Pick<MetricasEvento, "rf">): ReceitaFin[] =>
  m.rf.filter((x) => isContratada(x.r)).map((x) => x.r);

/** `clientesEvt` do protótipo: todos os clientes de receita já lançados, em ordem. */
export const clientesSugeridos = (livro: LivroFinanceiro): string[] =>
  [...new Set(livro.receitas.map((x) => x.cliente).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

// --------------------------------------------------------- gaveta receita

/** Estado do formulário de receita: números inteiros como texto (campo `number`), dinheiro em centavos. */
export interface FormReceita {
  cliente: string;
  segmento: string;
  statusEconomico: string;
  qtde: string;
  valorUnit: Centavos | null;
  desconto: Centavos | null;
  pagantes: string;
  cortesias: string;
  origem: string;
  tipoReceita: string;
  etapa: string;
  referencia: string;
  observacao: string;
  centroCusto: string;
}

const texto = (v: number): string => String(n(v));

/**
 * Valores iniciais (`v` de `openReceitaDrawer`). Fora do modo aberto a
 * receita herda o cliente, o módulo e a referência contratual do evento
 * (spec §3.2); centro de custo nasce OPE (spec §3.7).
 */
export function formReceita(ev: EventoFin, r: ReceitaFin | null): FormReceita {
  if (r)
    return {
      cliente: r.cliente,
      segmento: r.segmento,
      statusEconomico: r.statusEconomico,
      qtde: texto(r.qtde),
      valorUnit: n(r.valorUnit),
      desconto: n(r.desconto),
      pagantes: texto(r.pagantes),
      cortesias: texto(r.cortesias),
      origem: r.origem,
      tipoReceita: r.tipoReceita,
      etapa: r.etapa,
      referencia: r.referencia,
      observacao: r.observacao,
      centroCusto: r.centroCusto || "OPE",
    };
  if (ehAberto(ev))
    return {
      cliente: "",
      segmento: "",
      statusEconomico: "Contratada",
      qtde: "",
      valorUnit: 0,
      desconto: 0,
      pagantes: "",
      cortesias: "0",
      origem: "Inscrição (evento aberto)",
      tipoReceita: "Inscrição",
      etapa: "",
      referencia: "",
      observacao: "",
      centroCusto: "OPE",
    };
  return {
    cliente: ev.cliente || "",
    segmento: "",
    statusEconomico: "Contratada",
    qtde: "1",
    valorUnit: 0,
    desconto: 0,
    pagantes: "0",
    cortesias: "0",
    origem: "Contrato B2G",
    tipoReceita: "Valor global",
    etapa: ev.modulo || "",
    referencia: ev.refContratual || "",
    observacao: "",
    centroCusto: "OPE",
  };
}

/**
 * O `save` do drawer: quantidade 1 fora do modo aberto, números vazios
 * viram 0. O que o formulário não mostra (critério, etapas, competência)
 * vem da receita gravada; receita nova nasce sem etapas.
 */
export function dadosDaReceita(
  f: FormReceita,
  ev: EventoFin,
  r: ReceitaFin | null,
): DadosReceitaFin {
  return {
    eventoId: ev.id,
    tipoLancamento: "Evento",
    centroCusto: f.centroCusto,
    cliente: f.cliente,
    segmento: f.segmento,
    origem: f.origem,
    tipoReceita: f.tipoReceita,
    etapa: f.etapa,
    qtde: ehAberto(ev) ? n(f.qtde) : 1,
    valorUnit: n(f.valorUnit),
    desconto: n(f.desconto),
    pagantes: n(f.pagantes),
    cortesias: n(f.cortesias),
    statusEconomico: f.statusEconomico,
    criterioReconhecimento: r?.criterioReconhecimento ?? "",
    etapas: r?.etapas ?? [],
    competencia: r?.competencia ?? "",
    referencia: f.referencia,
    observacao: f.observacao,
  };
}

/** Campos calculados do drawer (valor bruto, contratado, total de participantes). */
export function calculosReceita(
  f: FormReceita,
  ev: EventoFin,
): { bruto: Centavos; contratado: Centavos; participantes: number } {
  const d = dadosDaReceita(f, ev, null) as ReceitaFin;
  return {
    bruto: valorBruto(d),
    contratado: valorReceita(d),
    participantes: n(f.pagantes) + n(f.cortesias),
  };
}

/** Campos que moram em "Mais detalhes": erro num deles abre o bloco. */
export function camposDetalhesReceita(ev: EventoFin): readonly string[] {
  return ehAberto(ev)
    ? ["origem", "tipoReceita", "centroCusto", "observacao"]
    : ["origem", "desconto", "pagantes", "cortesias", "centroCusto", "observacao"];
}

/** Descrição do toast depois de salvar: "id · cliente · R$ …". */
export const descricaoReceitaSalva = (id: string, d: DadosReceitaFin): string =>
  `${id} · ${d.cliente} · ${moeda(valorReceita(d as ReceitaFin))}`;

// ---------------------------------------------------------- gaveta etapas

/** Etapa em edição: chave estável para a lista e o texto do valor como digitado. */
export interface LinhaEtapa extends EtapaReceita {
  chave: number;
  textoValor: string;
}

export const etapasParaEdicao = (r: ReceitaFin, formatar: (c: Centavos) => string): LinhaEtapa[] =>
  (r.etapas || []).map((e, i) => ({ ...e, chave: i, textoValor: formatar(n(e.valor)) }));

export const novaEtapa = (chave: number): LinhaEtapa => ({
  chave,
  nome: "",
  base: "valor",
  valor: 0,
  percentual: 0,
  concluida: false,
  dataConclusao: "",
  textoValor: "",
});

/** Valor de uma etapa sobre o total contratado (percentual arredondado ao centavo). */
export const valorDaEtapa = (
  e: Pick<EtapaReceita, "base" | "valor" | "percentual">,
  total: Centavos,
): Centavos => (e.base === "percentual" ? Math.round((total * n(e.percentual)) / 100) : n(e.valor));

/** "Soma das etapas" e "Reconhecido (etapas concluídas)" do resumo do drawer. */
export function somasEtapas(
  etapas: readonly EtapaReceita[],
  total: Centavos,
): { soma: Centavos; concluido: Centavos; diverge: boolean } {
  const soma = etapas.reduce((a, e) => a + valorDaEtapa(e, total), 0);
  const concluido = etapas
    .filter((e) => e.concluida)
    .reduce((a, e) => a + valorDaEtapa(e, total), 0);
  return { soma, concluido, diverge: soma !== total };
}

/** "Concluir"/"Reabrir": concluir sem data usa hoje. */
export function alternarConclusao<T extends EtapaReceita>(e: T, hoje: string): T {
  const concluida = !e.concluida;
  return { ...e, concluida, dataConclusao: concluida && !e.dataConclusao ? hoje : e.dataConclusao };
}

/** `limpa` do `data-save`: sem nome sai; base de valor zera o percentual e vice-versa; aberta não tem data. */
export function etapasParaSalvar(linhas: readonly EtapaReceita[], hoje: string): EtapaReceita[] {
  return linhas
    .filter((e) => (e.nome || "").trim())
    .map((e) => ({
      nome: e.nome.trim(),
      base: e.base === "percentual" ? "percentual" : "valor",
      valor: e.base === "percentual" ? 0 : n(e.valor),
      percentual: e.base === "percentual" ? n(e.percentual) : 0,
      concluida: !!e.concluida,
      dataConclusao: e.concluida ? e.dataConclusao || hoje : "",
    }));
}

/** Reconhecido da receita com as etapas novas (descrição do toast "Etapas atualizadas"). */
export function reconhecidoComEtapas(
  r: ReceitaFin,
  etapas: EtapaReceita[],
  livro: LivroFinanceiro,
  hoje: string,
): Centavos {
  // Mesmo critério que `salvarEtapasFin` grava (servidor).
  const criterioReconhecimento = etapas.length
    ? CRIT_POR_ETAPA
    : r.criterioReconhecimento || CRIT_PROVISORIO;
  return receitaReconhecida({ ...r, etapas, criterioReconhecimento }, livro, hoje);
}

// -------------------------------------------------------------- resultado

export interface IndicadorParticipante {
  rotulo: string;
  /** `null` = "—" (ou "Não aplicável", conforme `naoAplicavel`). */
  valor: Centavos | null;
  naoAplicavel?: boolean;
  base: string;
  dica?: string;
}

/** "Indicadores por participante", sem "Comissão por participante" (Fase 2). */
export function indicadoresParticipante(m: MetricasEvento): IndicadorParticipante[] {
  const arred = (v: number | null): Centavos | null =>
    v === null || !Number.isFinite(v) ? null : Math.round(v);
  return [
    {
      rotulo: "Custo por participante",
      valor: arred(m.custoPorParticipante),
      base:
        m.custoPorParticipante != null
          ? `Custo realizado ÷ ${m.baseUnitLabel} (${inteiro(m.baseUnit)})`
          : "sem custo realizado ou participantes",
      dica: "Custo realizado ÷ participantes",
    },
    {
      rotulo: "Receita média por pagante",
      valor: arred(m.receitaPorPagante),
      naoAplicavel: true,
      base:
        m.receitaPorPagante != null
          ? `Receita contratada ÷ ${inteiro(m.pagantes)} pagantes`
          : "sem pagantes registrados (receita por valor global)",
    },
    {
      rotulo: "Receita média por participante total",
      valor: arred(m.receitaPorParticipante),
      naoAplicavel: true,
      base:
        m.receitaPorParticipante != null
          ? `Receita contratada ÷ ${inteiro(m.participantes)} (pagantes + cortesias)`
          : "",
    },
  ];
}

/** Bloco "Pagantes e cortesias": frações da barra (0 sem participantes, nunca NaN). */
export function fracoesParticipantes(
  m: Pick<MetricasEvento, "pagantes" | "cortesias" | "participantes">,
): { pagantes: number; cortesias: number } {
  if (!m.participantes) return { pagantes: 0, cortesias: 0 };
  return { pagantes: m.pagantes / m.participantes, cortesias: m.cortesias / m.participantes };
}
