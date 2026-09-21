import "server-only";

import type {
  ClienteCrm,
  DocumentoComercial,
  EnvioProposta,
  Evento,
  EventoComercial,
  Lead,
  LinhaDoTempo,
  Modulo,
  Programa,
  Proposta,
  VersaoProposta,
} from "@ntc/types";
import type { Payload, Where } from "payload";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura de dados do módulo CRM (rota /crm). SOMENTE LEITURA, via Local API.
 * Mapeia as coleções leads/clientes-crm/propostas para tipos enxutos que as
 * telas consomem. server-only: nunca vaza ao browser.
 */

export interface ContatoResumo {
  nome: string;
  cargo: string | null;
  setor: string | null;
  email: string | null;
  whatsapp: string | null;
  principal: boolean;
  decisor: boolean;
}

export interface ClienteCrmResumo {
  id: string;
  orgao: string;
  sigla: string | null;
  municipio: string | null;
  uf: string | null;
  esfera: string | null;
  area: string | null;
  origem: string | null;
  responsavelNome: string | null;
  contatoPrincipal: string | null;
  /** Leads do CRM (`tipo = proposta`) vinculados ao cliente. */
  numNegocios: number;
  /** ISO do item mais recente da linha do tempo do cliente, ou null se vazia. */
  ultimoItemISO: string | null;
}

export interface ClienteCrmDetalhe extends ClienteCrmResumo {
  tipo: string | null;
  cnpj: string | null;
  email: string | null;
  observacoes: string | null;
  responsavelId: string | null;
  contatos: ContatoResumo[];
  negocios: LeadCrmResumo[];
  linhaDoTempo: ItemLinhaDoTempoResumo[];
  eventos: EventoComercialResumo[];
  /** Propostas com `cliente` = este, inclusive as que sobreviveram ao lead que as originou (apagarLead desvincula só o lead). */
  numPropostas: number;
}

export interface LeadCrmResumo {
  id: string;
  nome: string;
  email: string;
  instituicao: string;
  cargo: string | null;
  programaSigla: string | null;
  participantesEstimados: number | null;
  estagio: string;
  perdido: boolean;
  motivoPerda: string | null;
  clienteId: string | null;
  clienteNome: string | null;
  responsavelId: string | null;
  responsavelNome: string | null;
  valorEstimado: number | null;
  origemEntrada: string;
  /** ISO de createdAt. */
  criadoEmISO: string;
  /** ISO de updatedAt — proxy de "dias na coluna" até a Sessão 5 gravar por transição. */
  atualizadoEmISO: string;
}

export interface CatalogoCrm {
  programas: { id: string; sigla: string; nome: string }[];
  modulos: { id: string; titulo: string; numero: number; programaId: string | null }[];
  eventos: { id: string; nome: string }[];
}

export interface UsuarioCmsResumo {
  id: string;
  nome: string;
}

export interface ProgramaCrmResumo {
  id: string;
  sigla: string;
  nome: string;
  area: string | null;
}

export interface ModuloCrmResumo {
  id: string;
  numero: number;
  titulo: string;
  tituloComercial: string | null;
  programaSigla: string | null;
  valor: number | null;
  replay: string | null;
  certificacao: string | null;
}

export interface ProdutoCrmResumo {
  id: string;
  nome: string;
  codigo: string | null;
  valor: number | null;
}

export interface PropostaResumo {
  id: string;
  codigo: string;
  codigoBase: string;
  versao: number;
  clienteNome: string;
  programaSigla: string;
  valorLiquido: number;
  status: string;
  vigente: boolean;
  leadId: string | null;
}

export interface PropostaDetalhe extends PropostaResumo {
  itens: { rotulo: string; detalhe: string }[];
  envios: EnvioResumo[];
  elaboradorNome: string;
  aprovadorNome: string;
  /** Campos crus (ids/valores) para round-trip fiel no FormProposta em modo edição. */
  clienteId: string | null;
  programaId: string | null;
  leadId: string | null;
  tipo: string | null;
  modalidade: string | null;
  replay: string | null;
  condPagto: string | null;
  condEspecificas: string | null;
  observacoes: string | null;
  valorUnitario: number | null;
  qtdPagantes: number | null;
  cortesias: number | null;
  percDesconto: number | null;
  validadeDias: number | null;
  modulosIds: string[];
  eventosIds: string[];
  elaboradorId: string | null;
  aprovadorId: string | null;
  pdfGeradoUrl: string | null;
}

export interface VersaoResumo {
  id: string;
  codBase: string;
  nVersao: number;
  data: string | null;
  valorLiquido: number;
  status: string;
  motivo: string;
  propostaId: string;
}

export interface EnvioResumo {
  id: string;
  propostaCodigo: string;
  data: string | null;
  canal: string;
  destinatarios: string;
  status: string;
  observacoes: string;
}

/** Relationship do Payload: extrai id como string, populado ou não. */
function idRel(v: unknown): string | null {
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: string | number }).id);
  return null;
}

/** Relationship populado: extrai uma propriedade de exibição. */
function campoRel(v: unknown, campo: string): string | null {
  if (v && typeof v === "object" && campo in v) {
    const bruto = (v as Record<string, unknown>)[campo];
    return typeof bruto === "string" && bruto.length > 0 ? bruto : null;
  }
  return null;
}

const soData = (iso: string | null | undefined): string | null => (iso ? iso.slice(0, 10) : null);

/** Relationship populado: extrai uma propriedade numérica de exibição. */
function campoRelNum(v: unknown, campo: string): number | null {
  if (v && typeof v === "object" && campo in v) {
    const bruto = (v as Record<string, unknown>)[campo];
    return typeof bruto === "number" ? bruto : null;
  }
  return null;
}

function mapearContatos(doc: ClienteCrm): ContatoResumo[] {
  return (doc.contatos ?? []).map((c) => ({
    nome: c.nome,
    cargo: c.cargo ?? null,
    setor: c.setor ?? null,
    email: c.email ?? null,
    whatsapp: c.whatsapp ?? null,
    principal: c.principal ?? false,
    decisor: c.decisor ?? false,
  }));
}

/** Agregados por cliente que não vivem no documento (spec §4.5: nº de negócios e último registro). */
interface AgregadosCliente {
  numNegocios: number;
  ultimoItemISO: string | null;
}

function mapearClienteResumo(doc: ClienteCrm, agregados: AgregadosCliente): ClienteCrmResumo {
  const contatos = mapearContatos(doc);
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    municipio: doc.municipio ?? null,
    uf: doc.uf ?? null,
    esfera: doc.esfera ?? null,
    area: doc.area ?? null,
    origem: doc.origem ?? null,
    responsavelNome: campoRel(doc.responsavel, "nome"),
    contatoPrincipal: (contatos.find((c) => c.principal) ?? contatos[0])?.nome ?? null,
    numNegocios: agregados.numNegocios,
    ultimoItemISO: agregados.ultimoItemISO,
  };
}

export function mapearLeadCrm(doc: Lead): LeadCrmResumo {
  return {
    id: String(doc.id),
    nome: doc.nome,
    email: doc.email,
    instituicao: doc.instituicao ?? "—",
    cargo: doc.cargo ?? null,
    programaSigla: campoRel(doc.detalhesProposta?.programa, "sigla"),
    participantesEstimados: doc.detalhesProposta?.participantesEstimados ?? null,
    estagio: doc.estagio ?? "lead",
    perdido: doc.perdido === true,
    motivoPerda: doc.motivoPerda ?? null,
    clienteId: idRel(doc.cliente),
    clienteNome: campoRel(doc.cliente, "orgao"),
    responsavelId: idRel(doc.responsavel),
    responsavelNome: campoRel(doc.responsavel, "nome"),
    valorEstimado: doc.valorEstimado ?? null,
    origemEntrada: doc.origemEntrada ?? "site",
    criadoEmISO: doc.createdAt,
    atualizadoEmISO: doc.updatedAt,
  };
}

/** Só os leads do CRM: `tipo = proposta` (site e manuais). */
export async function listarLeadsCrm(): Promise<LeadCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "leads",
    depth: 1,
    limit: 500,
    sort: "-createdAt",
    where: { tipo: { equals: "proposta" } },
  });
  return res.docs.map(mapearLeadCrm);
}

export interface ItemLinhaDoTempoResumo {
  id: string;
  tipo: string;
  titulo: string;
  detalhe: string | null;
  usuarioNome: string | null;
  emISO: string;
  leadId: string | null;
  referencia: { colecao: string; id: string } | null;
}

function mapearItemLinhaDoTempo(doc: LinhaDoTempo): ItemLinhaDoTempoResumo {
  const ref = doc.referencia;
  return {
    id: String(doc.id),
    tipo: doc.tipo,
    titulo: doc.titulo,
    detalhe: doc.detalhe ?? null,
    usuarioNome: campoRel(doc.usuario, "nome"),
    emISO: doc.em,
    leadId: idRel(doc.lead),
    referencia: ref?.colecao && ref.id ? { colecao: ref.colecao, id: ref.id } : null,
  };
}

export async function listarLinhaDoTempo(
  filtro: { clienteId: string } | { leadId: string },
): Promise<ItemLinhaDoTempoResumo[]> {
  const payload = await obterPayload();
  const where: Where = "clienteId" in filtro ? { cliente: { equals: filtro.clienteId } } : { lead: { equals: filtro.leadId } };
  const res = await payload.find({ collection: "linha-do-tempo", depth: 1, limit: 300, sort: "-em", where });
  return res.docs.map(mapearItemLinhaDoTempo);
}

export interface DocumentoEventoResumo {
  id: string;
  nome: string;
  descricao: string | null;
  url: string;
  tamanho: number | null;
  criadoEmISO: string;
}

export interface EventoComercialResumo {
  id: string;
  titulo: string;
  dataInicioISO: string;
  dataFimISO: string | null;
  status: string;
  modalidade: string | null;
  local: string | null;
  observacoes: string | null;
  leadId: string | null;
  leadNome: string | null;
  clienteId: string;
  moduloTitulo: string | null;
  contrato: {
    tipo: string | null;
    numero: string | null;
    dataISO: string | null;
    valor: number | null;
    arquivo: { nome: string; url: string } | null;
  } | null;
  links: { rotulo: string; url: string }[];
  documentos: DocumentoEventoResumo[];
  numDocumentos: number;
}

function mapearDocumentoEvento(doc: DocumentoComercial): DocumentoEventoResumo {
  return {
    id: String(doc.id),
    nome: doc.filename ?? "",
    descricao: doc.descricao ?? null,
    url: doc.url ?? "",
    tamanho: doc.filesize ?? null,
    criadoEmISO: doc.createdAt,
  };
}

/** Relationship populado com um DocumentoComercial: extrai { nome, url } ou null. */
function arquivoDoContrato(v: unknown): { nome: string; url: string } | null {
  if (v && typeof v === "object" && "url" in v) {
    const doc = v as DocumentoComercial;
    return { nome: doc.filename ?? "", url: doc.url ?? "" };
  }
  return null;
}

function mapearEventoComercial(doc: EventoComercial, documentos: DocumentoEventoResumo[]): EventoComercialResumo {
  const c = doc.contratoEmpenho;
  const arquivo = arquivoDoContrato(c?.arquivo);
  const tipo = c?.tipo ?? null;
  const numero = c?.numero ?? null;
  const dataISO = c?.data ?? null;
  const valor = c?.valor ?? null;
  const contratoVazio = tipo === null && numero === null && dataISO === null && valor === null && arquivo === null;
  return {
    id: String(doc.id),
    titulo: doc.titulo,
    dataInicioISO: doc.dataInicio,
    dataFimISO: doc.dataFim ?? null,
    status: doc.status,
    modalidade: doc.modalidade ?? null,
    local: doc.local ?? null,
    observacoes: doc.observacoes ?? null,
    leadId: idRel(doc.lead),
    leadNome: campoRel(doc.lead, "nome"),
    clienteId: idRel(doc.cliente) ?? "",
    moduloTitulo: campoRel(doc.moduloCatalogo, "titulo"),
    contrato: contratoVazio ? null : { tipo, numero, dataISO, valor, arquivo },
    links: (doc.linksInscricao ?? []).map((l) => ({ rotulo: l.rotulo, url: l.url })),
    documentos,
    numDocumentos: documentos.length,
  };
}

/**
 * Busca os documentos de um lote de eventos numa única `find` (evita N+1) e
 * agrupa por evento antes de mapear. Pula a busca quando não há eventos.
 */
async function mapearEventosComDocumentos(
  payload: Payload,
  docs: EventoComercial[],
): Promise<EventoComercialResumo[]> {
  if (docs.length === 0) return [];
  const documentosRes = await payload.find({
    collection: "documentos-comerciais",
    depth: 0,
    limit: 500,
    sort: "-createdAt",
    where: { evento: { in: docs.map((d) => d.id) } },
  });
  const porEvento = new Map<string, DocumentoEventoResumo[]>();
  for (const documento of documentosRes.docs) {
    const eventoId = idRel(documento.evento);
    if (!eventoId) continue;
    const lista = porEvento.get(eventoId) ?? [];
    lista.push(mapearDocumentoEvento(documento));
    porEvento.set(eventoId, lista);
  }
  return docs.map((doc) => mapearEventoComercial(doc, porEvento.get(String(doc.id)) ?? []));
}

export async function listarEventosDoLead(leadId: string): Promise<EventoComercialResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "eventos-comerciais",
    depth: 1,
    limit: 100,
    sort: "-dataInicio",
    where: { lead: { equals: leadId } },
  });
  return mapearEventosComDocumentos(payload, res.docs);
}

export interface LeadCrmDetalhe extends LeadCrmResumo {
  telefone: string | null;
  esfera: string | null;
  modalidade: string | null;
  mensagem: string | null;
  programaId: string | null;
  origem: { rotulo: string; valor: string }[];
  consentimento: { aceito: boolean; timestamp: string | null; politicaVersao: string | null; ipSubmissao: string | null };
  observacoes: string | null;
  dataPrevistaEventoISO: string | null;
  perdidoEmISO: string | null;
  detalhePerda: string | null;
  clienteCasadoPor: string | null;
  linhaDoTempo: ItemLinhaDoTempoResumo[];
  eventos: EventoComercialResumo[];
  numPropostas: number;
  numEnvios: number;
}

export async function obterLeadCrm(id: string): Promise<LeadCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: Lead;
  try {
    doc = await payload.findByID({ collection: "leads", id, depth: 1 });
  } catch {
    return null;
  }
  if (doc.tipo !== "proposta") return null;
  const [linhaDoTempo, eventos, propostasRes, enviosRes] = await Promise.all([
    listarLinhaDoTempo({ leadId: id }),
    listarEventosDoLead(id),
    payload.count({ collection: "propostas", where: { lead: { equals: id } } }),
    payload.count({ collection: "envios-email", where: { lead: { equals: id } } }),
  ]);
  const og = doc.origem ?? {};
  const origem: { rotulo: string; valor: string }[] = [];
  const par = (rotulo: string, v: unknown) => { if (typeof v === "string" && v !== "") origem.push({ rotulo, valor: v }); };
  par("Página", og.paginaSubmissao); par("Referrer", og.referrer); par("utm_source", og.utmSource);
  par("utm_medium", og.utmMedium); par("utm_campaign", og.utmCampaign); par("utm_term", og.utmTerm); par("utm_content", og.utmContent);
  const cons = doc.consentimentoLgpd;
  return {
    ...mapearLeadCrm(doc),
    telefone: doc.telefone ?? null,
    esfera: doc.esfera ?? null,
    modalidade: doc.detalhesProposta?.modalidade ?? null,
    mensagem: doc.detalhesProposta?.mensagem ?? null,
    programaId: idRel(doc.detalhesProposta?.programa),
    origem,
    consentimento: {
      aceito: cons?.aceito === true,
      timestamp: cons?.timestamp ?? null,
      politicaVersao: cons?.politicaVersao ?? null,
      ipSubmissao: cons?.ipSubmissao ?? null,
    },
    observacoes: doc.observacoes ?? null,
    dataPrevistaEventoISO: soData(doc.dataPrevistaEvento),
    perdidoEmISO: doc.perdidoEm ?? null,
    detalhePerda: doc.detalhePerda ?? null,
    clienteCasadoPor: doc.clienteCasadoPor ?? null,
    linhaDoTempo,
    eventos,
    numPropostas: propostasRes.totalDocs,
    numEnvios: enviosRes.totalDocs,
  };
}

export async function listarClientesCrm(): Promise<ClienteCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "clientes-crm",
    depth: 1,
    limit: 500,
    sort: "orgao",
  });
  // Agregados client-side (duas leituras, sem N+1): nº de negócios por
  // cliente e o item mais recente da linha do tempo (ordenada por -em, o
  // primeiro visto por cliente é o último registro).
  const [leads, itens] = await Promise.all([
    payload.find({ collection: "leads", depth: 0, limit: 1000, where: { tipo: { equals: "proposta" } } }),
    payload.find({ collection: "linha-do-tempo", depth: 0, limit: 1000, sort: "-em" }),
  ]);
  const negociosPorCliente = new Map<string, number>();
  for (const lead of leads.docs) {
    const clienteId = idRel(lead.cliente);
    if (clienteId) negociosPorCliente.set(clienteId, (negociosPorCliente.get(clienteId) ?? 0) + 1);
  }
  const ultimoItemPorCliente = new Map<string, string>();
  for (const item of itens.docs) {
    const clienteId = idRel(item.cliente);
    if (clienteId && !ultimoItemPorCliente.has(clienteId)) ultimoItemPorCliente.set(clienteId, item.em);
  }
  return res.docs.map((doc) =>
    mapearClienteResumo(doc, {
      numNegocios: negociosPorCliente.get(String(doc.id)) ?? 0,
      ultimoItemISO: ultimoItemPorCliente.get(String(doc.id)) ?? null,
    }),
  );
}

export async function obterClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: ClienteCrm;
  try {
    doc = await payload.findByID({ collection: "clientes-crm", id, depth: 1 });
  } catch {
    return null;
  }
  const [negocios, linhaDoTempo, eventosRes, propostas] = await Promise.all([
    payload.find({ collection: "leads", depth: 1, limit: 200, sort: "-createdAt", where: { cliente: { equals: doc.id }, tipo: { equals: "proposta" } } }),
    listarLinhaDoTempo({ clienteId: id }),
    payload.find({ collection: "eventos-comerciais", depth: 1, limit: 100, sort: "-dataInicio", where: { cliente: { equals: doc.id } } }),
    // Conta à parte dos negócios: uma proposta sobrevive à desvinculação de
    // `apagarLead` (que só limpa `propostas.lead`, não `propostas.cliente`).
    payload.count({ collection: "propostas", where: { cliente: { equals: doc.id } } }),
  ]);
  const eventos = await mapearEventosComDocumentos(payload, eventosRes.docs);
  const negociosMapeados = negocios.docs.map(mapearLeadCrm);
  return {
    ...mapearClienteResumo(doc, {
      numNegocios: negociosMapeados.length,
      ultimoItemISO: linhaDoTempo[0]?.emISO ?? null,
    }),
    tipo: doc.tipo ?? null,
    cnpj: doc.cnpj ?? null,
    email: doc.email ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
    contatos: mapearContatos(doc),
    negocios: negociosMapeados,
    linhaDoTempo,
    eventos,
    numPropostas: propostas.totalDocs,
  };
}

export async function obterCatalogoCrm(): Promise<CatalogoCrm> {
  const payload = await obterPayload();
  const [programas, modulos, eventos] = await Promise.all([
    payload.find({ collection: "programas", depth: 0, limit: 100, draft: true, sort: "sigla" }),
    payload.find({ collection: "modulos", depth: 0, limit: 500, draft: true, sort: "numero" }),
    payload.find({ collection: "eventos", depth: 0, limit: 500, draft: true, sort: "nome" }),
  ]);
  return {
    programas: programas.docs.map((p) => ({ id: String(p.id), sigla: p.sigla ?? "", nome: p.nomeCompleto ?? "" })),
    modulos: modulos.docs.map((m) => ({ id: String(m.id), titulo: m.titulo, numero: m.numero, programaId: idRel(m.programa) })),
    eventos: eventos.docs.map((e) => ({ id: String(e.id), nome: e.nome })),
  };
}

export async function listarUsuariosCms(): Promise<UsuarioCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "users", depth: 0, limit: 100, sort: "nome" });
  return res.docs.map((u) => ({ id: String(u.id), nome: u.nome ?? u.email }));
}

export async function listarProgramasCrm(): Promise<ProgramaCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "programas", depth: 1, limit: 100, draft: true, sort: "sigla" });
  return res.docs.map((p: Programa) => ({
    id: String(p.id),
    sigla: p.sigla ?? "",
    nome: p.nomeCompleto ?? "",
    area: campoRel(p.area, "nome"),
  }));
}

export async function listarModulosCrm(): Promise<ModuloCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "modulos", depth: 1, limit: 500, draft: true, sort: "numero" });
  return res.docs.map((m: Modulo) => ({
    id: String(m.id),
    numero: m.numero,
    titulo: m.titulo,
    tituloComercial: m.comercial?.tituloComercial ?? null,
    programaSigla: campoRel(m.programa, "sigla"),
    valor: m.comercial?.valor ?? null,
    replay: m.comercial?.replay ?? null,
    certificacao: m.comercial?.certificacao ?? null,
  }));
}

export async function listarProdutosCrm(): Promise<ProdutoCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "eventos", depth: 0, limit: 500, draft: true, sort: "nome" });
  return res.docs.map((e: Evento) => ({
    id: String(e.id),
    nome: e.nome,
    codigo: e.comercial?.codigo ?? null,
    valor: e.comercial?.valor ?? null,
  }));
}

function mapearPropostaResumo(doc: Proposta): PropostaResumo {
  const status = doc.status ?? "rascunho";
  return {
    id: String(doc.id),
    codigo: doc.codigo,
    codigoBase: doc.codigoBase,
    versao: doc.versao ?? 1,
    clienteNome: campoRel(doc.cliente, "orgao") ?? "",
    programaSigla: campoRel(doc.programa, "sigla") ?? "",
    valorLiquido: doc.valorLiquido ?? 0,
    status,
    vigente: status !== "substituida",
    leadId: idRel(doc.lead),
  };
}

function mapearEnvioResumo(doc: EnvioProposta): EnvioResumo {
  return {
    id: String(doc.id),
    propostaCodigo: campoRel(doc.proposta, "codigo") ?? "",
    data: soData(doc.data),
    canal: doc.canal ?? "",
    destinatarios: doc.destinatarios ?? "",
    status: doc.status ?? "",
    observacoes: doc.observacoes ?? "",
  };
}

/** Só a versão vigente (maior `versao`) de cada `codigoBase`. */
export async function listarPropostasCrm(): Promise<PropostaResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "propostas", limit: 1000, depth: 1 });
  const porBase = new Map<string, PropostaResumo>();
  for (const doc of res.docs) {
    const resumo = mapearPropostaResumo(doc);
    const atual = porBase.get(resumo.codigoBase);
    if (!atual || resumo.versao > atual.versao) porBase.set(resumo.codigoBase, resumo);
  }
  return [...porBase.values()].sort((a, b) => b.codigo.localeCompare(a.codigo));
}

export async function obterPropostaCrm(id: string): Promise<PropostaDetalhe | null> {
  const payload = await obterPayload();
  let doc: Proposta;
  try {
    doc = await payload.findByID({ collection: "propostas", id, depth: 1 });
  } catch {
    return null;
  }
  const modulosItens = (Array.isArray(doc.modulos) ? doc.modulos : []).map((m) => ({
    rotulo: `M${campoRelNum(m, "numero") ?? ""} · ${campoRel(m, "titulo") ?? ""}`,
    detalhe: campoRel(m, "titulo") ?? "",
  }));
  const eventosItens = (Array.isArray(doc.eventos) ? doc.eventos : []).map((e) => ({
    rotulo: `${campoRel(e, "tipo") ?? "—"} · ${campoRel(e, "nome") ?? ""}`,
    detalhe: campoRel(e, "nome") ?? "",
  }));
  const modulosIds = (Array.isArray(doc.modulos) ? doc.modulos : [])
    .map((m) => idRel(m) ?? "")
    .filter((id) => id !== "");
  const eventosIds = (Array.isArray(doc.eventos) ? doc.eventos : [])
    .map((e) => idRel(e) ?? "")
    .filter((id) => id !== "");
  const enviosRes = await payload.find({
    collection: "envios",
    depth: 1,
    limit: 200,
    where: { proposta: { equals: doc.id } },
    sort: "-data",
  });
  return {
    ...mapearPropostaResumo(doc),
    itens: [...modulosItens, ...eventosItens],
    envios: enviosRes.docs.map(mapearEnvioResumo),
    elaboradorNome: campoRel(doc.elaborador, "nome") ?? "",
    aprovadorNome: campoRel(doc.aprovador, "nome") ?? "",
    clienteId: idRel(doc.cliente),
    programaId: idRel(doc.programa),
    leadId: idRel(doc.lead),
    tipo: doc.tipo ?? null,
    modalidade: doc.modalidade ?? null,
    replay: doc.replay ?? null,
    condPagto: doc.condPagto ?? null,
    condEspecificas: doc.condEspecificas ?? null,
    observacoes: doc.observacoes ?? null,
    valorUnitario: doc.valorUnitario ?? null,
    qtdPagantes: doc.qtdPagantes ?? null,
    cortesias: doc.cortesias ?? null,
    percDesconto: doc.percDesconto ?? null,
    validadeDias: doc.validadeDias ?? null,
    modulosIds,
    eventosIds,
    elaboradorId: idRel(doc.elaborador),
    aprovadorId: idRel(doc.aprovador),
    pdfGeradoUrl:
      doc.pdfGerado && typeof doc.pdfGerado === "object" && "url" in doc.pdfGerado
        ? ((doc.pdfGerado as { url?: string | null }).url ?? null)
        : null,
  };
}

export async function versoesDeProposta(codBase: string): Promise<VersaoResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "versoes",
    depth: 1,
    limit: 200,
    where: { codBase: { equals: codBase } },
    sort: "-nVersao",
  });
  return res.docs.map((doc: VersaoProposta) => ({
    id: String(doc.id),
    codBase: doc.codBase,
    nVersao: doc.nVersao ?? 1,
    data: soData(doc.data),
    valorLiquido: campoRelNum(doc.proposta, "valorLiquido") ?? 0,
    status: doc.statusAnterior ?? "",
    motivo: doc.motivo ?? "",
    propostaId: idRel(doc.proposta) ?? "",
  }));
}

export async function todosEnviosCrm(): Promise<EnvioResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "envios", depth: 1, limit: 500, sort: "-data" });
  return res.docs.map(mapearEnvioResumo);
}

