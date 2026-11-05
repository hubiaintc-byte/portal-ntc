import "server-only";

import { CAMPOS_DO_CRM } from "@ntc/lib";
import type {
  CampoDoCrm,
  ContaFin,
  CustoFin,
  EtapaReceita,
  EventoFin,
  FaturamentoFin,
  LivroFinanceiro,
  PagamentoFin,
  ReceitaFin,
  StatusOperacional,
} from "@ntc/lib";
import type { PayloadRequest } from "payload";

import { temTela, type AcessoPainel } from "@/lib/cms/telas";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura do livro financeiro (spec §3.2): lê as seis coleções `fin-*` e os
 * eventos comerciais do CRM e devolve um `LivroFinanceiro` tipado, com os
 * eventos mesclados. Ids de relacionamento viram `string`; dinheiro já é
 * centavos. Datas dos `fin-*` são texto AAAA-MM-DD; as do CRM são timestamptz
 * e são cortadas em AAAA-MM-DD (mesmo corte do CRM).
 */

type Id = string | number;
type Relacao = Id | { id: Id } | null | undefined;
type Doc = Record<string, unknown>;

export interface FinEventoDoc {
  id: Id;
  eventoComercial?: Relacao;
  nome?: string | null;
  vertical?: string | null;
  tipo?: string | null;
  modalidade?: string | null;
  programa?: string | null;
  modulo?: string | null;
  cliente?: string | null;
  cidade?: string | null;
  uf?: string | null;
  local?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  cargaHoraria?: number | null;
  responsavel?: string | null;
  status?: string | null;
  qtdPrevista?: number | null;
  capacidade?: number | null;
  efetivos?: number | null;
  pagantesPrev?: number | null;
  cortesiasPrev?: number | null;
  refContratual?: string | null;
  observacoes?: string | null;
}

export interface EventoComercialDoc {
  id: Id;
  titulo?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  modalidade?: "presencial" | "online" | "hibrido" | null;
  local?: string | null;
  cliente?: { orgao?: string | null } | Id | null;
  status?: "agendado" | "realizado" | "cancelado" | null;
  contratoEmpenho?: { numero?: string | null } | null;
  moduloCatalogo?: Relacao;
}

export interface ItemHistorico {
  quando: string;
  quem: string;
  acao: string;
  mudancas: { campo: string; antes: unknown; depois: unknown }[];
}

const idDe = (r: Relacao): string => {
  if (r === null || r === undefined) return "";
  return typeof r === "object" ? String(r.id) : String(r);
};
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const soData = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : "");
const cheio = (v: string | null | undefined): string => (v ? v : "");

const MODALIDADE_CRM: Record<string, string> = {
  presencial: "Presencial",
  online: "Online ao vivo",
  hibrido: "Híbrido",
};

const STATUS_CRM: Record<string, StatusOperacional> = {
  agendado: "Planejado",
  realizado: "Realizado",
  cancelado: "Planejado",
};

const STATUS_OPERACIONAL: readonly string[] = [
  "Planejado",
  "Em preparação",
  "Em execução",
  "Realizado",
  "Encerrado",
];

function orgaoDoCrm(c: EventoComercialDoc): string {
  return c.cliente && typeof c.cliente === "object" ? str(c.cliente.orgao) : "";
}

function eventoDoFin(f: FinEventoDoc, c: EventoComercialDoc | undefined): EventoFin {
  const status = STATUS_OPERACIONAL.includes(f.status ?? "")
    ? (f.status as StatusOperacional)
    : "Planejado";
  const base: EventoFin = {
    id: String(f.id),
    nome: str(f.nome),
    vertical: str(f.vertical),
    tipo: str(f.tipo),
    modalidade: str(f.modalidade),
    programa: str(f.programa),
    modulo: str(f.modulo),
    cliente: str(f.cliente),
    cidade: str(f.cidade),
    uf: str(f.uf),
    local: str(f.local),
    dataInicio: cheio(f.dataInicio),
    dataFim: cheio(f.dataFim),
    cargaHoraria: num(f.cargaHoraria),
    responsavel: str(f.responsavel),
    status,
    qtdPrevista: num(f.qtdPrevista),
    capacidade: num(f.capacidade),
    efetivos: num(f.efetivos),
    pagantesPrev: num(f.pagantesPrev),
    cortesiasPrev: num(f.cortesiasPrev),
    refCrm: "",
    refContratual: str(f.refContratual),
    observacoes: str(f.observacoes),
    origem: "financeiro",
    eventoComercialId: null,
    cadastroPendente: false,
    canceladoNoCrm: false,
    camposDoCrm: [],
  };
  if (!c) return base;
  const doCrm: Record<CampoDoCrm, string> = {
    nome: str(c.titulo),
    modalidade: (c.modalidade && MODALIDADE_CRM[c.modalidade]) || "",
    local: str(c.local),
    dataInicio: soData(c.dataInicio),
    dataFim: soData(c.dataFim),
    cliente: orgaoDoCrm(c),
  };
  return {
    ...base,
    nome: doCrm.nome || base.nome,
    modalidade: doCrm.modalidade || base.modalidade,
    local: doCrm.local || base.local,
    dataInicio: doCrm.dataInicio || base.dataInicio,
    dataFim: doCrm.dataFim || base.dataFim,
    cliente: doCrm.cliente || base.cliente,
    camposDoCrm: CAMPOS_DO_CRM.filter((k) => doCrm[k] !== ""),
    refContratual: base.refContratual || str(c.contratoEmpenho?.numero),
    refCrm: String(c.id),
    origem: "crm",
    eventoComercialId: String(c.id),
    canceladoNoCrm: c.status === "cancelado",
  };
}

function eventoPendente(c: EventoComercialDoc): EventoFin {
  const vazio = eventoDoFin({ id: `crm-${c.id}` }, c);
  return {
    ...vazio,
    status: STATUS_CRM[c.status ?? ""] ?? "Planejado",
    cadastroPendente: true,
  };
}

/** Une `fin-eventos` e eventos comerciais (spec §3.2). Pura. */
export function mesclarEventos(fin: FinEventoDoc[], crm: EventoComercialDoc[]): EventoFin[] {
  const porId = new Map(crm.map((c) => [String(c.id), c]));
  const ligados = new Set<string>();
  const saida: EventoFin[] = [];
  for (const f of fin) {
    const cid = idDe(f.eventoComercial);
    const c = cid ? porId.get(cid) : undefined;
    if (c) ligados.add(cid);
    saida.push(eventoDoFin(f, c));
  }
  for (const c of crm) {
    if (!ligados.has(String(c.id))) saida.push(eventoPendente(c));
  }
  return saida;
}

function receitaDoDoc(d: Doc): ReceitaFin {
  const etapas = Array.isArray(d.etapas) ? (d.etapas as Doc[]) : [];
  return {
    id: String(d.id),
    eventoId: idDe(d.evento as Relacao),
    tipoLancamento: d.tipoLancamento === "Corporativa" ? "Corporativa" : "Evento",
    centroCusto: str(d.centroCusto),
    cliente: str(d.cliente),
    segmento: str(d.segmento),
    origem: str(d.origem),
    tipoReceita: str(d.tipoReceita),
    etapa: str(d.etapa),
    qtde: num(d.qtde),
    valorUnit: num(d.valorUnit),
    desconto: num(d.desconto),
    pagantes: num(d.pagantes),
    cortesias: num(d.cortesias),
    statusEconomico: str(d.statusEconomico),
    criterioReconhecimento: str(d.criterioReconhecimento),
    etapas: etapas.map(
      (e): EtapaReceita => ({
        nome: str(e.nome),
        base: e.base === "percentual" ? "percentual" : "valor",
        valor: num(e.valor),
        percentual: num(e.percentual),
        concluida: e.concluida === true,
        dataConclusao: str(e.dataConclusao),
      }),
    ),
    competencia: str(d.competencia),
    referencia: str(d.referencia),
    observacao: str(d.observacao),
  };
}

function faturamentoDoDoc(d: Doc, eventoDaReceita: Map<string, string>): FaturamentoFin {
  const receitaId = idDe(d.receita as Relacao);
  const valorFaturado = num(d.valorFaturado);
  const valorRecebido = num(d.valorRecebido);
  return {
    id: String(d.id),
    receitaId,
    eventoId: eventoDaReceita.get(receitaId) ?? "",
    parcela: str(d.parcela),
    nf: str(d.nf),
    dataFaturamento: str(d.dataFaturamento),
    valorFaturado,
    vencimento: str(d.vencimento),
    retencaoTributaria: num(d.retencaoTributaria),
    retencaoContratual: num(d.retencaoContratual),
    retencaoContratualLiberada: num(d.retencaoContratualLiberada),
    dataRecebimento: str(d.dataRecebimento),
    valorRecebido,
    contaId: idDe(d.conta as Relacao),
    quitado: d.quitado === true,
    observacao: str(d.observacao),
  };
}

function custoDoDoc(d: Doc): CustoFin {
  const custo: CustoFin = {
    id: String(d.id),
    eventoId: idDe(d.evento as Relacao),
    tipoLancamento: d.tipoLancamento === "Corporativa" ? "Corporativa" : "Evento",
    centroCusto: str(d.centroCusto),
    compartilhada: d.compartilhada === true,
    origemLancamento: str(d.origemLancamento),
    fase: str(d.fase),
    categoria: str(d.categoria),
    subcategoria: str(d.subcategoria),
    descricao: str(d.descricao),
    fornecedor: str(d.fornecedor),
    documento: str(d.documento),
    natureza: str(d.natureza),
    comportamento: str(d.comportamento),
    driver: str(d.driver),
    unidade: str(d.unidade),
    qtde: num(d.qtde),
    valorUnitPrev: num(d.valorUnitPrev),
    valorRealizado: num(d.valorRealizado),
    competencia: str(d.competencia),
    dataPrevista: str(d.dataPrevista),
    criterioApropriacao: str(d.criterioApropriacao),
    observacao: str(d.observacao),
  };
  if (str(d.periodicidade)) custo.periodicidade = str(d.periodicidade);
  return custo;
}

function pagamentoDoDoc(d: Doc, eventoDoCusto: Map<string, string>): PagamentoFin {
  const custoId = idDe(d.custo as Relacao);
  return {
    id: String(d.id),
    custoId,
    eventoId: eventoDoCusto.get(custoId) ?? "",
    documento: str(d.documento),
    vencimento: str(d.vencimento),
    valor: num(d.valor),
    dataPagamento: str(d.dataPagamento),
    valorPago: num(d.valorPago),
    contaId: idDe(d.conta as Relacao),
    observacao: str(d.observacao),
  };
}

function contaDoDoc(d: Doc): ContaFin {
  return {
    id: String(d.id),
    nome: str(d.nome),
    tipo: str(d.tipo),
    banco: str(d.banco),
    agencia: str(d.agencia),
    numero: str(d.numero),
    saldoInicial: num(d.saldoInicial),
    dataSaldoInicial: str(d.dataSaldoInicial),
    ativa: d.ativa !== false,
    observacao: str(d.observacao),
  };
}

const ordemNumerica = (a: { id: string }, b: { id: string }): number =>
  Number(a.id) - Number(b.id) || a.id.localeCompare(b.id);

/** Lê o livro inteiro. Com `req`, lê dentro da transação dele. */
export async function lerLivroFinanceiro(req?: PayloadRequest): Promise<LivroFinanceiro> {
  const payload = req?.payload ?? (await obterPayload());
  const ler = async (collection: string): Promise<Doc[]> => {
    const r = await payload.find({
      collection: collection as "fin-eventos",
      pagination: false,
      depth: 0,
      overrideAccess: true,
      ...(req ? { req } : {}),
    });
    return r.docs as unknown as Doc[];
  };
  const [eventos, receitas, faturamentos, custos, pagamentos, contas, crm] = await Promise.all([
    ler("fin-eventos"),
    ler("fin-receitas"),
    ler("fin-faturamentos"),
    ler("fin-custos"),
    ler("fin-pagamentos"),
    ler("fin-contas"),
    payload
      .find({
        collection: "eventos-comerciais",
        pagination: false,
        depth: 1,
        overrideAccess: true,
        select: {
          titulo: true,
          dataInicio: true,
          dataFim: true,
          modalidade: true,
          local: true,
          cliente: true,
          status: true,
          contratoEmpenho: { numero: true },
          moduloCatalogo: true,
        },
        populate: { "clientes-crm": { orgao: true } },
        ...(req ? { req } : {}),
      })
      .then((r) => r.docs as unknown as EventoComercialDoc[]),
  ]);

  const receitasFin = receitas.map(receitaDoDoc);
  const custosFin = custos.map(custoDoDoc);
  const eventoDaReceita = new Map(receitasFin.map((r) => [r.id, r.eventoId]));
  const eventoDoCusto = new Map(custosFin.map((c) => [c.id, c.eventoId]));

  return {
    eventos: mesclarEventos(eventos as unknown as FinEventoDoc[], crm),
    receitas: receitasFin,
    faturamentos: faturamentos.map((d) => faturamentoDoDoc(d, eventoDaReceita)),
    custos: custosFin,
    pagamentos: pagamentos.map((d) => pagamentoDoDoc(d, eventoDoCusto)),
    contas: contas.map(contaDoDoc).sort(ordemNumerica),
  };
}

/** Corte de dados por tela (regra da v3.8). Pura. */
export function recortarLivroPorTela(livro: LivroFinanceiro, acesso: AcessoPainel): LivroFinanceiro {
  if (temTela(acesso, ["fin.visao-executiva", "fin.eventos"])) return livro;
  const receber = temTela(acesso, ["fin.receber"]);
  const pagar = temTela(acesso, ["fin.pagar"]);
  return {
    eventos: livro.eventos,
    contas: livro.contas,
    receitas: receber ? livro.receitas : [],
    faturamentos: receber ? livro.faturamentos : [],
    custos: pagar ? livro.custos : [],
    pagamentos: pagar ? livro.pagamentos : [],
  };
}

/** Histórico de um lançamento, mais recente primeiro, com o nome de quem alterou. */
export async function lerHistoricoFin(slug: string, id: string): Promise<ItemHistorico[]> {
  const payload = await obterPayload();
  const r = await payload.find({
    collection: "audit-log",
    where: { and: [{ entidade: { equals: slug } }, { entidadeId: { equals: id } }] },
    sort: "-createdAt",
    pagination: false,
    depth: 1,
    overrideAccess: true,
  });
  return (r.docs as unknown as Doc[]).map((d) => {
    const usuario = d.usuario as { nome?: string; name?: string; email?: string } | null | undefined;
    const quem =
      usuario && typeof usuario === "object"
        ? str(usuario.nome) || str(usuario.name) || str(usuario.email) || "—"
        : "—";
    const meta = (d.metadata ?? {}) as { mudancas?: Record<string, { antes: unknown; depois: unknown }> };
    return {
      quando: str(d.createdAt),
      quem,
      acao: str(d.descricao) || str(d.acao),
      mudancas: Object.entries(meta.mudancas ?? {}).map(([campo, v]) => ({
        campo,
        antes: v.antes,
        depois: v.depois,
      })),
    };
  });
}
