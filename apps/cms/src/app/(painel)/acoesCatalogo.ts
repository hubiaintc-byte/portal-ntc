"use server";

import { revalidatePath } from "next/cache";

import { obterUsuarioAutenticadoComTela, obterUsuarioCmsComTela } from "@/lib/cms/autenticacao";
import type { TelaPainel } from "@/lib/cms/telas";
import {
  obterModuloCatalogo,
  obterProgramaCatalogo,
  type ModuloCatalogoDetalhe,
  type ProgramaCatalogoDetalhe,
} from "@/lib/cms/catalogoCrm";
import {
  excluirModulo,
  excluirPrograma,
  salvarModulo,
  salvarPrograma,
  type DadosModulo,
  type DadosPrograma,
  type ResultadoComId,
} from "@/lib/cms/catalogoCrmEscrita";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

/**
 * Server Actions do catálogo comercial (Programas e Módulos no CRM). Mesma
 * regra de acoesCrm.ts: sessão validada ANTES de tocar a Local API.
 */

const TELAS_PROGRAMA: readonly TelaPainel[] = ["crm.programas"];
/** O detalhe do programa também cria módulo (decisão do plano). */
const TELAS_MODULO: readonly TelaPainel[] = ["crm.modulos", "crm.programas"];
/** Quem abre o detalhe: catálogo ou propostas (o wizard consulta o catálogo). */
const TELAS_LEITURA: readonly TelaPainel[] = ["crm.programas", "crm.modulos", "crm.propostas"];

const RECUSADO: ResultadoEscrita = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };

export async function carregarProgramaCatalogoCrm(id: string): Promise<ProgramaCatalogoDetalhe | null> {
  if (!(await obterUsuarioCmsComTela(TELAS_LEITURA))) return null;
  return obterProgramaCatalogo(id);
}

export async function salvarProgramaCatalogoCrm(id: string | null, dados: DadosPrograma, publicar: boolean): Promise<ResultadoComId> {
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_PROGRAMA);
  if (!usuario) return RECUSADO;
  const r = await salvarPrograma(id, dados, publicar, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function excluirProgramaCatalogoCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_PROGRAMA);
  if (!usuario) return RECUSADO;
  const r = await excluirPrograma(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function carregarModuloCatalogoCrm(id: string): Promise<ModuloCatalogoDetalhe | null> {
  if (!(await obterUsuarioCmsComTela(TELAS_LEITURA))) return null;
  return obterModuloCatalogo(id);
}

export async function salvarModuloCatalogoCrm(id: string | null, dados: DadosModulo): Promise<ResultadoComId> {
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_MODULO);
  if (!usuario) return RECUSADO;
  const r = await salvarModulo(id, dados, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}

export async function excluirModuloCatalogoCrm(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_MODULO);
  if (!usuario) return RECUSADO;
  const r = await excluirModulo(id, usuario);
  if (r.ok) revalidatePath("/crm");
  return r;
}
