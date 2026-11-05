import {
  eventAlerts,
  LISTAS_FIN,
  matchEvent,
  validarEvento,
  type AlertaFin,
  type CampoDoCrm,
  type DadosEventoFin,
  type EventoFin,
  type LivroFinanceiro,
  type Periodo,
  type ResultadoValidacao,
  type StatusOperacional,
} from "@ntc/lib";

/**
 * Regras puras da lista de Eventos e do wizard de cadastro (`Views.events`,
 * `eventSchemas`, `STEP_FIELDS` e `openEventWizard` do protótipo FIN-05, mapa
 * §1.2). Sem React, para os testes (suíte em `node`).
 */

// ------------------------------------------------------------------ lista

export type OrdemEventos = "data-desc" | "data-asc" | "nome-asc" | "id-desc" | "status-asc";

/** `UI.events` do protótipo. */
export interface EstadoListaEventos {
  periodo: Periodo;
  vertical: string;
  modalidade: string;
  status: string;
  tipo: string;
  q: string;
  view: "cards" | "lista";
  sort: string;
}

export const ESTADO_LISTA_INICIAL: EstadoListaEventos = {
  periodo: "all",
  vertical: "all",
  modalidade: "all",
  status: "all",
  tipo: "all",
  q: "",
  view: "cards",
  sort: "data-desc",
};

/** `keys` da tela: a vertical fica nas abas, fora dos selects e do "Limpar". */
export const CHAVES_FILTRO_EVENTOS = ["status", "modalidade", "periodo", "tipo"] as const;
export type ChaveFiltroEventos = (typeof CHAVES_FILTRO_EVENTOS)[number];

export const ORDENACOES: readonly (readonly [OrdemEventos, string])[] = [
  ["data-desc", "Data (recentes)"],
  ["data-asc", "Data (antigas)"],
  ["nome-asc", "Nome (A–Z)"],
  ["id-desc", "ID (novos)"],
  ["status-asc", "Status"],
];

/** `anyFilter(S, keys)` do protótipo (inclui a busca). */
export function algumFiltroEventos(s: EstadoListaEventos): boolean {
  return CHAVES_FILTRO_EVENTOS.some((k) => s[k] && s[k] !== "all") || !!s.q;
}

/** `data-clear-filters`: zera os quatro selects e a busca; a aba de vertical fica. */
export function limparFiltrosEventos(s: EstadoListaEventos): EstadoListaEventos {
  return { ...s, status: "all", modalidade: "all", periodo: "all", tipo: "all", q: "" };
}

/**
 * Filtros vindos de outra tela (`irPara("eventos", { filtros })`): o
 * protótipo faz `Object.assign(UI.events, { ...UI.dash, status, q: '' })`
 * — copia período, vertical, modalidade, status e tipo, limpa a busca e
 * mantém visualização e ordenação.
 */
export function aplicarFiltrosRecebidos(
  s: EstadoListaEventos,
  filtros: Record<string, string>,
): EstadoListaEventos {
  const novo: EstadoListaEventos = { ...s, q: "" };
  if (filtros.periodo) novo.periodo = filtros.periodo as Periodo;
  for (const k of ["vertical", "modalidade", "status", "tipo"] as const) {
    if (filtros[k]) novo[k] = filtros[k];
  }
  return novo;
}

/** Clique no cabeçalho da coluna: mesma coluna desce → sobe; outra coluna começa descendo. */
export function alternarOrdem(sort: string, chave: string): string {
  const [sk, sd] = sort.split("-");
  return `${chave}-${sk === chave && sd === "desc" ? "asc" : "desc"}`;
}

const STATUS = LISTAS_FIN.statusOperacional as readonly string[];
const COMPARA: Record<string, (a: EventoFin, b: EventoFin) => number> = {
  data: (a, b) => a.dataInicio.localeCompare(b.dataInicio),
  nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
  // Ids do portal são números em texto (e "crm-<n>"): ordem numérica, não lexical.
  id: (a, b) => a.id.localeCompare(b.id, "pt-BR", { numeric: true }),
  status: (a, b) => STATUS.indexOf(a.status) - STATUS.indexOf(b.status),
};

export interface ListaEventos {
  /** Eventos que passam nos filtros, com qualquer vertical (base das contagens das abas). */
  base: EventoFin[];
  /** `base` na aba de vertical, ordenada. */
  lista: EventoFin[];
  /** Contagem da aba "Todos" (`all`) e de cada vertical. */
  porVertical: Record<string, number>;
  /** Alertas Vencido/Pendente de cada evento da lista (o ponto de alerta). */
  alertas: Record<string, AlertaFin[]>;
}

export function listarEventos(
  livro: LivroFinanceiro,
  s: EstadoListaEventos,
  hoje: string,
): ListaEventos {
  const base = livro.eventos.filter((e) => matchEvent(e, { ...s, vertical: "all" }));
  const [sk, sd] = s.sort.split("-");
  const cmp = COMPARA[sk ?? ""] ?? COMPARA.data!;
  const lista = base
    .filter((e) => s.vertical === "all" || e.vertical === s.vertical)
    .sort((a, b) => (sd === "desc" ? -1 : 1) * cmp(a, b));
  const porVertical: Record<string, number> = { all: base.length };
  for (const v of LISTAS_FIN.verticais)
    porVertical[v] = base.filter((e) => e.vertical === v).length;
  const alertas: Record<string, AlertaFin[]> = {};
  for (const e of lista) {
    alertas[e.id] = eventAlerts(e, livro, hoje).filter(
      (a) => a.severidade === "Vencido" || a.severidade === "Pendente",
    );
  }
  return { base, lista, porVertical, alertas };
}

/** `Service.dependents(id)`: lançamentos vinculados ao evento. */
export function dependentesDoEvento(livro: LivroFinanceiro, id: string) {
  const de = <T extends { eventoId: string }>(xs: T[]) =>
    xs.filter((x) => x.eventoId === id).length;
  const d = {
    receitas: de(livro.receitas),
    faturamentos: de(livro.faturamentos),
    custos: de(livro.custos),
    pagamentos: de(livro.pagamentos),
  };
  return { ...d, total: d.receitas + d.faturamentos + d.custos + d.pagamentos };
}

/**
 * Mesmo texto de `MSG_EVENTO_FIN_COM_LANCAMENTOS` (`lib/financeiro/exclusao.ts`,
 * módulo de servidor): evento do CRM com receitas ou custos não perde o
 * cadastro financeiro. O teste confere que os dois não divergem.
 */
export const MSG_EVENTO_CRM_COM_LANCAMENTOS =
  "Este evento tem lançamentos; exclua-os antes de remover o cadastro financeiro.";

/** Evento do CRM com receitas ou custos: o servidor recusa a exclusão (spec §4.2). */
export function exclusaoBloqueada(ev: EventoFin, livro: LivroFinanceiro): boolean {
  if (ev.origem !== "crm") return false;
  const d = dependentesDoEvento(livro, ev.id);
  return d.receitas > 0 || d.custos > 0;
}

// ----------------------------------------------------------------- wizard

/** `steps` do `openEventWizard`. */
export const PASSOS_WIZARD: readonly (readonly [string, string])[] = [
  ["Identificação", "Nome, vertical, tipo"],
  ["Execução", "Modalidade, local, datas"],
  ["Operação", "Cliente, participantes"],
  ["Referências", "CRM, contrato, revisão"],
];

export const SUBTITULOS_WIZARD: readonly string[] = [
  "Como o evento será identificado no sistema.",
  "Onde, quando e como o evento será executado.",
  "Quem participa. Os campos se adaptam ao tipo de operação.",
  "Vínculos de integração e revisão final.",
];

/** `STEP_FIELDS` do protótipo, sem `refCrm` (o vínculo é o próprio relacionamento — spec §3.2). */
export const CAMPOS_DO_PASSO: readonly (readonly string[])[] = [
  ["nome", "vertical", "tipo", "programa", "modulo"],
  [
    "modalidade",
    "cidade",
    "uf",
    "local",
    "dataInicio",
    "dataFim",
    "cargaHoraria",
    "status",
    "responsavel",
  ],
  ["cliente", "qtdPrevista", "capacidade", "efetivos", "pagantesPrev", "cortesiasPrev"],
  ["refContratual", "observacoes"],
];

/** `stepOfField`: −1 se o campo não é de etapa nenhuma. */
export function passoDoCampo(campo: string): number {
  return CAMPOS_DO_PASSO.findIndex((a) => a.includes(campo));
}

const NUMERICOS = [
  "cargaHoraria",
  "qtdPrevista",
  "capacidade",
  "efetivos",
  "pagantesPrev",
  "cortesiasPrev",
] as const;
type CampoNumerico = (typeof NUMERICOS)[number];

/** Valores do formulário: tudo texto, como os `input` (número vazio = ""). */
export type FormEvento = Record<keyof DadosEventoFin, string>;

const numTexto = (n: number): string => (n ? String(n) : "");

/** Valores iniciais: evento existente (inclusive pendente do CRM) ou o `v` de evento novo do protótipo. */
export function formDoEvento(ev: EventoFin | null): FormEvento {
  if (!ev) {
    return {
      nome: "",
      vertical: "",
      tipo: "",
      modalidade: "",
      programa: "",
      modulo: "",
      cliente: "",
      cidade: "",
      uf: "",
      local: "",
      dataInicio: "",
      dataFim: "",
      cargaHoraria: "",
      responsavel: "",
      status: "Planejado",
      qtdPrevista: "",
      capacidade: "",
      efetivos: "",
      pagantesPrev: "",
      cortesiasPrev: "",
      refContratual: "",
      observacoes: "",
    };
  }
  return {
    nome: ev.nome,
    vertical: ev.vertical,
    tipo: ev.tipo,
    modalidade: ev.modalidade,
    programa: ev.programa,
    modulo: ev.modulo,
    cliente: ev.cliente,
    cidade: ev.cidade,
    uf: ev.uf,
    local: ev.local,
    dataInicio: ev.dataInicio,
    dataFim: ev.dataFim,
    cargaHoraria: numTexto(ev.cargaHoraria),
    responsavel: ev.responsavel,
    status: ev.status,
    qtdPrevista: numTexto(ev.qtdPrevista),
    capacidade: numTexto(ev.capacidade),
    efetivos: numTexto(ev.efetivos),
    pagantesPrev: numTexto(ev.pagantesPrev),
    cortesiasPrev: numTexto(ev.cortesiasPrev),
    refContratual: ev.refContratual,
    observacoes: ev.observacoes,
  };
}

export const ehAberto = (f: Pick<FormEvento, "tipo">) => f.tipo === "Evento aberto";
export const ehB2g = (f: Pick<FormEvento, "tipo">) => f.tipo === "In Company / Projeto B2G";
/** Pagantes e cortesias previstos: só em evento aberto ou avulso. */
export const temPagantes = (f: Pick<FormEvento, "tipo">) =>
  ehAberto(f) || f.tipo === "Evento avulso";

/** Os `show` do `eventSchemas`, por campo. */
export function campoVisivel(campo: string, f: FormEvento): boolean {
  switch (campo) {
    case "programa":
    case "modulo":
      return f.tipo !== "Evento aberto" && f.tipo !== "Evento avulso";
    case "local":
      return !!f.modalidade && f.modalidade !== "Online ao vivo";
    case "cliente":
      return !ehAberto(f);
    case "efetivos":
      return ["Em execução", "Realizado", "Encerrado"].includes(f.status);
    case "pagantesPrev":
    case "cortesiasPrev":
      return temPagantes(f);
    default:
      return true;
  }
}

/**
 * O `v` do wizard virando `DadosEventoFin`, com as zeragens do protótipo ao
 * salvar: números `Number(v) || 0`; aberto zera cliente; online zera local;
 * quem não é aberto/avulso zera pagantes e cortesias previstos.
 */
export function dadosDoForm(f: FormEvento): DadosEventoFin {
  const nums = Object.fromEntries(NUMERICOS.map((k) => [k, Number(f[k]) || 0])) as Record<
    CampoNumerico,
    number
  >;
  const d: DadosEventoFin = { ...f, ...nums, status: f.status as StatusOperacional };
  if (ehAberto(f)) d.cliente = "";
  if (f.modalidade === "Online ao vivo") d.local = "";
  if (!temPagantes(f)) {
    d.pagantesPrev = 0;
    d.cortesiasPrev = 0;
  }
  return d;
}

/** `tryValidate()` do wizard. */
export function validarForm(f: FormEvento): ResultadoValidacao {
  return validarEvento(dadosDoForm(f));
}

/** Campos que, para evento do CRM, aparecem só leitura (o CRM os tem preenchidos). */
export function camposSoLeitura(ev: EventoFin | null): ReadonlySet<CampoDoCrm> {
  return new Set(ev && ev.origem === "crm" ? ev.camposDoCrm : []);
}

/** "Total previsto" (`totPrev`) da etapa 3. */
export function totalPrevisto(f: FormEvento): number {
  return (Number(f.pagantesPrev) || 0) + (Number(f.cortesiasPrev) || 0);
}
