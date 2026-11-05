"use server";

import { revalidatePath } from "next/cache";

import type {
  DadosContaFin,
  DadosCustoFin,
  DadosEventoFin,
  DadosFaturamentoFin,
  DadosPagamentoFin,
  DadosReceitaFin,
  EtapaReceita,
} from "@ntc/lib";

import {
  obterAdministradorAutenticado,
  obterUsuarioAutenticadoComTela,
  obterUsuarioCmsComTela,
  type UsuarioAutenticado,
} from "@/lib/cms/autenticacao";
import { TELAS_FIN, type TelaPainel } from "@/lib/cms/telas";
import {
  excluirContaFin,
  excluirCustoFin,
  excluirEventoFin,
  excluirFaturamentoFin,
  excluirPagamentoFin,
  excluirReceitaFin,
  salvarContaFin,
  salvarCustoFin,
  salvarEtapasFin,
  salvarEventoFin,
  salvarFaturamentoFin,
  salvarPagamentoFin,
  salvarReceitaFin,
  type ResultadoFin,
} from "@/lib/financeiro/escrita";
import { lerHistoricoFin, type ItemHistorico } from "@/lib/financeiro/leitura";

/**
 * Server Actions do Financeiro. Sessão e tela conferidas ANTES de tocar a
 * escrita; toda exclusão é só de administrador (spec §4.2). Lançamento
 * corporativo (sem evento) exige a tela dele — quem só tem `fin.eventos` não
 * lança corporativo; a escrita repete a regra sobre o que está gravado.
 */

const TELAS_EVENTO: readonly TelaPainel[] = ["fin.eventos"];
const TELAS_RECEITA: readonly TelaPainel[] = ["fin.eventos", "fin.receber"];
const TELAS_CUSTO: readonly TelaPainel[] = ["fin.eventos", "fin.pagar"];
const TELAS_CONTA: readonly TelaPainel[] = ["fin.receber", "fin.pagar"];

const SLUGS_FIN: readonly string[] = [
  "fin-eventos",
  "fin-receitas",
  "fin-faturamentos",
  "fin-custos",
  "fin-pagamentos",
  "fin-contas",
];

const RECUSADO = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." } as const;

export type ResultadoHistoricoFin = { ok: true; itens: ItemHistorico[] } | { ok: false; erro: string };

async function executar(
  usuario: UsuarioAutenticado | null,
  fn: (u: UsuarioAutenticado) => Promise<ResultadoFin>,
): Promise<ResultadoFin> {
  if (!usuario) return RECUSADO;
  const r = await fn(usuario);
  if (r.ok) revalidatePath("/financeiro");
  return r;
}

const comTela = (telas: readonly TelaPainel[]) => obterUsuarioAutenticadoComTela(telas);
const corporativo = (dados: { eventoId?: unknown } | null | undefined): boolean => !dados?.eventoId;

// ------------------------------------------------------------- escritas

export async function salvarEventoFinAcao(id: string | null, dados: DadosEventoFin): Promise<ResultadoFin> {
  return executar(await comTela(TELAS_EVENTO), (u) => salvarEventoFin(id, dados, u));
}

export async function salvarReceitaFinAcao(id: string | null, dados: DadosReceitaFin): Promise<ResultadoFin> {
  const telas = corporativo(dados) ? (["fin.receber"] as const) : TELAS_RECEITA;
  return executar(await comTela(telas), (u) => salvarReceitaFin(id, dados, u));
}

export async function salvarEtapasFinAcao(receitaId: string, etapas: EtapaReceita[]): Promise<ResultadoFin> {
  return executar(await comTela(TELAS_RECEITA), (u) => salvarEtapasFin(receitaId, etapas, u));
}

export async function salvarFaturamentoFinAcao(id: string | null, dados: DadosFaturamentoFin): Promise<ResultadoFin> {
  return executar(await comTela(TELAS_RECEITA), (u) => salvarFaturamentoFin(id, dados, u));
}

export async function salvarCustoFinAcao(id: string | null, dados: DadosCustoFin): Promise<ResultadoFin> {
  const telas = corporativo(dados) ? (["fin.pagar"] as const) : TELAS_CUSTO;
  return executar(await comTela(telas), (u) => salvarCustoFin(id, dados, u));
}

export async function salvarPagamentoFinAcao(id: string | null, dados: DadosPagamentoFin): Promise<ResultadoFin> {
  return executar(await comTela(TELAS_CUSTO), (u) => salvarPagamentoFin(id, dados, u));
}

export async function salvarContaFinAcao(id: string | null, dados: DadosContaFin): Promise<ResultadoFin> {
  return executar(await comTela(TELAS_CONTA), (u) => salvarContaFin(id, dados, u));
}

// ------------------------------------------------------------ exclusões

export async function excluirEventoFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirEventoFin(id, u));
}

export async function excluirReceitaFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirReceitaFin(id, u));
}

export async function excluirFaturamentoFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirFaturamentoFin(id, u));
}

export async function excluirCustoFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirCustoFin(id, u));
}

export async function excluirPagamentoFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirPagamentoFin(id, u));
}

export async function excluirContaFinAcao(id: string): Promise<ResultadoFin> {
  return executar(await obterAdministradorAutenticado(), (u) => excluirContaFin(id, u));
}

// ------------------------------------------------------------ histórico

/** Histórico de um lançamento: qualquer tela `fin.*`; `slug` só um dos seis `fin-*`. */
export async function carregarHistoricoFinAcao(slug: string, id: string): Promise<ResultadoHistoricoFin> {
  if (!(await obterUsuarioCmsComTela(TELAS_FIN))) return RECUSADO;
  if (typeof slug !== "string" || !SLUGS_FIN.includes(slug)) return RECUSADO;
  if (typeof id !== "string" || !/^\d{1,15}$/.test(id.trim())) return RECUSADO;
  try {
    return { ok: true, itens: await lerHistoricoFin(slug, String(Number(id.trim()))) };
  } catch (e) {
    console.error("[carregarHistoricoFinAcao]", e);
    return { ok: false, erro: "Não foi possível carregar o histórico. Tente novamente." };
  }
}
