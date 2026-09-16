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
  atualizarClienteCrm,
  atualizarLeadCrm,
  atualizarProposta,
  criarClienteCrm,
  criarLeadManual,
  criarProposta,
  criarVersaoProposta,
  gerarESalvarPdfProposta,
  marcarLeadPerdido,
  moverLead,
  reabrirLead,
  registrarEnvio,
  vincularClienteAoLead,
  type DadosClienteCrm,
  type DadosEnvio,
  type DadosLeadManual,
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
