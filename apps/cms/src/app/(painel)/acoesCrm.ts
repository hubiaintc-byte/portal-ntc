"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterClienteCrm,
  obterPropostaCrm,
  type ClienteCrmDetalhe,
  type PropostaDetalhe,
} from "@/lib/cms/painelCrm";
import {
  atualizarClienteCrm,
  atualizarProposta,
  criarClienteCrm,
  criarProposta,
  criarVersaoProposta,
  gerarESalvarPdfProposta,
  registrarEnvio,
  type DadosClienteCrm,
  type DadosEnvio,
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
