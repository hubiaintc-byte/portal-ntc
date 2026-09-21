"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioAutenticado, obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterClienteCrm,
  obterLeadCrm,
  obterPropostaCrm,
  type ClienteCrmDetalhe,
  type LeadCrmDetalhe,
  type PropostaDetalhe,
} from "@/lib/cms/painelCrm";
import {
  adicionarNota,
  agendarEvento,
  apagarCliente,
  apagarLead,
  atualizarClienteCrm,
  atualizarLeadCrm,
  atualizarProposta,
  cancelarEvento,
  criarClienteCrm,
  criarLeadManual,
  criarProposta,
  criarVersaoProposta,
  gerarESalvarPdfProposta,
  marcarEventoRealizado,
  marcarLeadPerdido,
  moverLead,
  reabrirLead,
  registrarContratoEmpenho,
  registrarEnvio,
  removerDocumentoEvento,
  salvarLinksInscricao,
  subirDocumentoEvento,
  vincularClienteAoLead,
  type DadosClienteCrm,
  type DadosContrato,
  type DadosEnvio,
  type DadosEvento,
  type DadosLeadManual,
  type DadosLink,
  type DadosProposta,
} from "@/lib/cms/painelCrmEscrita";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

/**
 * Server Actions do módulo CRM. Toda action valida a sessão ANTES de tocar a
 * Local API — Server Actions são endpoints públicos (mesma regra de acoes.ts).
 */

const RECUSADO: ResultadoEscrita = { ok: false, erro: "Sessão expirada. Entre novamente." };

export async function carregarClienteCrm(id: string): Promise<ClienteCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterClienteCrm(id);
}

export async function salvarClienteCrm(
  id: string | null,
  dados: DadosClienteCrm,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = id === null ? await criarClienteCrm(dados) : await atualizarClienteCrm(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function carregarPropostaCrm(id: string): Promise<PropostaDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterPropostaCrm(id);
}

export async function salvarPropostaCrm(
  id: string | null,
  dados: DadosProposta,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = id === null ? await criarProposta(dados) : await atualizarProposta(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function novaVersaoPropostaCrm(
  codBase: string,
  motivo: string,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await criarVersaoProposta(codBase, motivo);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function registrarEnvioCrm(dados: DadosEnvio): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await registrarEnvio(dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function gerarPdfPropostaCrm(id: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await gerarESalvarPdfProposta(id);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function carregarLeadCrm(id: string): Promise<LeadCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterLeadCrm(id);
}

export async function salvarLeadCrm(id: string | null, dados: DadosLeadManual): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = id === null ? await criarLeadManual(dados, usuario) : await atualizarLeadCrm(id, dados, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function moverLeadCrm(id: string, estagio: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await moverLead(id, estagio, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function marcarLeadPerdidoCrm(id: string, motivo: string, detalhe: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await marcarLeadPerdido(id, motivo, detalhe, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function reabrirLeadCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await reabrirLead(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function vincularClienteCrm(leadId: string, clienteId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await vincularClienteAoLead(leadId, clienteId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function adicionarNotaCrm(clienteId: string, leadId: string | null, texto: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await adicionarNota(clienteId, leadId, texto, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function agendarEventoCrm(leadId: string, dados: DadosEvento): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await agendarEvento(leadId, dados, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

/** O arquivo do contrato/empenho é opcional — chega no campo "arquivo" do FormData quando presente. */
export async function registrarContratoCrm(
  eventoId: string,
  dados: DadosContrato,
  formData: FormData,
): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const bruto = formData.get("arquivo");
  const arquivo = bruto instanceof File && bruto.size > 0 ? bruto : null;
  const r = await registrarContratoEmpenho(eventoId, dados, arquivo, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function salvarLinksCrm(eventoId: string, links: DadosLink[]): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await salvarLinksInscricao(eventoId, links, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function marcarEventoRealizadoCrm(eventoId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await marcarEventoRealizado(eventoId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function cancelarEventoCrm(eventoId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await cancelarEvento(eventoId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

/** O arquivo é obrigatório aqui (diferente de registrarContratoCrm) — chega no campo "arquivo" do FormData. */
export async function subirDocumentoEventoCrm(
  eventoId: string,
  descricao: string,
  formData: FormData,
): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Nenhum arquivo selecionado." };
  }
  const r = await subirDocumentoEvento(eventoId, arquivo, descricao, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function removerDocumentoEventoCrm(documentoId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await removerDocumentoEvento(documentoId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function apagarLeadCrm(leadId: string, confirmacaoNome: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await apagarLead(leadId, confirmacaoNome, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function apagarClienteCrm(clienteId: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const r = await apagarCliente(clienteId, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}
