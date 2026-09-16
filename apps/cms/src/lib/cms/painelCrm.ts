import "server-only";

import type {
  ClienteCrm,
  EnvioProposta,
  Evento,
  Lead,
  Modulo,
  Programa,
  Proposta,
  VersaoProposta,
} from "@ntc/types";

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
}

export interface ClienteCrmDetalhe extends ClienteCrmResumo {
  tipo: string | null;
  cnpj: string | null;
  email: string | null;
  observacoes: string | null;
  responsavelId: string | null;
  contatos: ContatoResumo[];
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

function mapearClienteResumo(doc: ClienteCrm): ClienteCrmResumo {
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

export async function listarClientesCrm(): Promise<ClienteCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "clientes-crm",
    depth: 1,
    limit: 500,
    sort: "orgao",
  });
  return res.docs.map(mapearClienteResumo);
}

export async function obterClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: ClienteCrm;
  try {
    doc = await payload.findByID({ collection: "clientes-crm", id, depth: 1 });
  } catch {
    return null;
  }
  return {
    ...mapearClienteResumo(doc),
    tipo: doc.tipo ?? null,
    cnpj: doc.cnpj ?? null,
    email: doc.email ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
    contatos: mapearContatos(doc),
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

