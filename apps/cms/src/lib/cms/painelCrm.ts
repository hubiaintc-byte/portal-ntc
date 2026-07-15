import "server-only";

import type { ClienteCrm, ContatoCrm, Oportunidade } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Leitura de dados do módulo CRM (rota /crm). SOMENTE LEITURA, via Local API.
 * Mapeia as coleções clientes-crm/contatos-crm/oportunidades para tipos
 * enxutos que as telas consomem. server-only: nunca vaza ao browser.
 */

export interface ClienteCrmResumo {
  id: string;
  orgao: string;
  sigla: string | null;
  municipio: string | null;
  uf: string | null;
  area: string | null;
  status: string;
  potencial: number | null;
  responsavelNome: string | null;
}

export interface ClienteCrmDetalhe extends ClienteCrmResumo {
  tipo: string | null;
  esfera: string | null;
  cnpj: string | null;
  dirigente: string | null;
  cargoDirigente: string | null;
  email: string | null;
  origem: string | null;
  proximaAcao: string | null;
  observacoes: string | null;
  responsavelId: string | null;
  contatos: ContatoCrmResumo[];
  oportunidades: OportunidadeCrmResumo[];
}

export interface ContatoCrmResumo {
  id: string;
  nome: string;
  clienteId: string;
  clienteNome: string;
  cargo: string | null;
  setor: string | null;
  email: string | null;
  whatsapp: string | null;
  principal: boolean;
  decisor: boolean;
}

export interface OportunidadeCrmResumo {
  id: string;
  codigo: string;
  clienteId: string;
  clienteNome: string;
  programaSigla: string | null;
  valor: number | null;
  probabilidade: number | null;
  status: string;
  dataAberturaISO: string | null;
  followupISO: string | null;
  responsavelNome: string | null;
}

export interface OportunidadeCrmDetalhe extends OportunidadeCrmResumo {
  programaId: string | null;
  modulos: { id: string; titulo: string }[];
  eventos: { id: string; nome: string }[];
  uf: string | null;
  origem: string | null;
  quantidade: number | null;
  modalidade: string | null;
  dataPrevFechamentoISO: string | null;
  proximaAcao: string | null;
  observacoes: string | null;
  responsavelId: string | null;
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

function mapearClienteResumo(doc: ClienteCrm): ClienteCrmResumo {
  return {
    id: String(doc.id),
    orgao: doc.orgao,
    sigla: doc.sigla ?? null,
    municipio: doc.municipio ?? null,
    uf: doc.uf ?? null,
    area: doc.area ?? null,
    status: doc.status ?? "prospect",
    potencial: doc.potencial ?? null,
    responsavelNome: campoRel(doc.responsavel, "nome"),
  };
}

function mapearContato(doc: ContatoCrm): ContatoCrmResumo {
  return {
    id: String(doc.id),
    nome: doc.nome,
    clienteId: idRel(doc.cliente) ?? "",
    clienteNome: campoRel(doc.cliente, "orgao") ?? "",
    cargo: doc.cargo ?? null,
    setor: doc.setor ?? null,
    email: doc.email ?? null,
    whatsapp: doc.whatsapp ?? null,
    principal: doc.principal ?? false,
    decisor: doc.decisor ?? false,
  };
}

function mapearOportunidadeResumo(doc: Oportunidade): OportunidadeCrmResumo {
  return {
    id: String(doc.id),
    codigo: doc.codigo,
    clienteId: idRel(doc.cliente) ?? "",
    clienteNome: campoRel(doc.cliente, "orgao") ?? "",
    programaSigla: campoRel(doc.programa, "sigla"),
    valor: doc.valor ?? null,
    probabilidade: doc.probabilidade ?? null,
    status: doc.status ?? "em-qualificacao",
    dataAberturaISO: soData(doc.dataAbertura),
    followupISO: soData(doc.followup),
    responsavelNome: campoRel(doc.responsavel, "nome"),
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
  const [contatos, oportunidades] = await Promise.all([
    payload.find({ collection: "contatos-crm", depth: 1, limit: 100, where: { cliente: { equals: doc.id } }, sort: "nome" }),
    payload.find({ collection: "oportunidades", depth: 1, limit: 100, where: { cliente: { equals: doc.id } }, sort: "-dataAbertura" }),
  ]);
  return {
    ...mapearClienteResumo(doc),
    tipo: doc.tipo ?? null,
    esfera: doc.esfera ?? null,
    cnpj: doc.cnpj ?? null,
    dirigente: doc.dirigente ?? null,
    cargoDirigente: doc.cargoDirigente ?? null,
    email: doc.email ?? null,
    origem: doc.origem ?? null,
    proximaAcao: doc.proximaAcao ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
    contatos: contatos.docs.map(mapearContato),
    oportunidades: oportunidades.docs.map(mapearOportunidadeResumo),
  };
}

export async function listarContatosCrm(): Promise<ContatoCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "contatos-crm", depth: 1, limit: 500, sort: "nome" });
  return res.docs.map(mapearContato);
}

export async function listarOportunidadesCrm(): Promise<OportunidadeCrmResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "oportunidades", depth: 1, limit: 500, sort: "-dataAbertura" });
  return res.docs.map(mapearOportunidadeResumo);
}

export async function obterOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null> {
  const payload = await obterPayload();
  let doc: Oportunidade;
  try {
    doc = await payload.findByID({ collection: "oportunidades", id, depth: 1 });
  } catch {
    return null;
  }
  const modulos = (Array.isArray(doc.modulos) ? doc.modulos : [])
    .map((m) => ({ id: idRel(m) ?? "", titulo: campoRel(m, "titulo") ?? "" }))
    .filter((m) => m.id !== "");
  const eventos = (Array.isArray(doc.eventos) ? doc.eventos : [])
    .map((e) => ({ id: idRel(e) ?? "", nome: campoRel(e, "nome") ?? "" }))
    .filter((e) => e.id !== "");
  return {
    ...mapearOportunidadeResumo(doc),
    programaId: idRel(doc.programa),
    modulos,
    eventos,
    uf: doc.uf ?? null,
    origem: doc.origem ?? null,
    quantidade: doc.quantidade ?? null,
    modalidade: doc.modalidade ?? null,
    dataPrevFechamentoISO: soData(doc.dataPrevFechamento),
    proximaAcao: doc.proximaAcao ?? null,
    observacoes: doc.observacoes ?? null,
    responsavelId: idRel(doc.responsavel),
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
