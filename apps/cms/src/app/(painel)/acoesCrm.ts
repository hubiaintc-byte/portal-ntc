"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterClienteCrm,
  obterOportunidadeCrm,
  type ClienteCrmDetalhe,
  type OportunidadeCrmDetalhe,
} from "@/lib/cms/painelCrm";
import {
  atualizarClienteCrm,
  atualizarContatoCrm,
  atualizarOportunidade,
  criarClienteCrm,
  criarContatoCrm,
  criarOportunidade,
  type DadosClienteCrm,
  type DadosContatoCrm,
  type DadosOportunidade,
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

export async function carregarOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterOportunidadeCrm(id);
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

export async function salvarContatoCrm(
  id: string | null,
  dados: DadosContatoCrm,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = id === null ? await criarContatoCrm(dados) : await atualizarContatoCrm(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}

export async function salvarOportunidadeCrm(
  id: string | null,
  dados: DadosOportunidade,
): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado =
    id === null ? await criarOportunidade(dados) : await atualizarOportunidade(id, dados);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}
