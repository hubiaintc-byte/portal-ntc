"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioAutenticado, obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  listarHistoricoEstagio,
  obterAvaliacaoCrm,
  obterClienteCrm,
  obterOportunidadeCrm,
  obterPropostaCrm,
  type AvaliacaoDetalhe,
  type ClienteCrmDetalhe,
  type OportunidadeCrmDetalhe,
  type PropostaDetalhe,
  type TransicaoEstagioResumo,
} from "@/lib/cms/painelCrm";
import {
  atualizarAvaliacao,
  atualizarClienteCrm,
  atualizarContatoCrm,
  atualizarOportunidade,
  atualizarProposta,
  criarAvaliacao,
  criarClienteCrm,
  criarContatoCrm,
  criarOportunidade,
  criarProposta,
  criarVersaoProposta,
  gerarESalvarPdfProposta,
  registrarEnvio,
  type DadosAvaliacao,
  type DadosClienteCrm,
  type DadosContatoCrm,
  type DadosEnvio,
  type DadosOportunidade,
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

export async function carregarOportunidadeCrm(id: string): Promise<OportunidadeCrmDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterOportunidadeCrm(id);
}

export async function carregarHistoricoOportunidade(
  id: string,
): Promise<TransicaoEstagioResumo[]> {
  // Server Action é endpoint público: sessão antes de qualquer leitura.
  if (!(await obterUsuarioCms())) return [];
  return listarHistoricoEstagio(id);
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

/**
 * O usuário da sessão desce até a Local API (parâmetro `usuario`) para virar
 * `req.user` no hook que grava o histórico de estágio — sem isso toda
 * transição do funil sairia com autor "sistema". `obterUsuarioAutenticado`
 * devolve o mesmo objeto que `obterUsuarioCms` já buscava, então continua
 * sendo uma única validação de sessão por save.
 */
export async function salvarOportunidadeCrm(
  id: string | null,
  dados: DadosOportunidade,
): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const resultado =
    id === null
      ? await criarOportunidade(dados, usuario)
      : await atualizarOportunidade(id, dados, usuario);
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

export async function carregarAvaliacaoCrm(id: string): Promise<AvaliacaoDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterAvaliacaoCrm(id);
}

/** Ver `salvarOportunidadeCrm`: `usuario` chega à Local API para popular `req.user`. */
export async function salvarAvaliacaoCrm(
  id: string | null,
  dados: DadosAvaliacao,
): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return RECUSADO;
  const resultado =
    id === null ? await criarAvaliacao(dados, usuario) : await atualizarAvaliacao(id, dados, usuario);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}
