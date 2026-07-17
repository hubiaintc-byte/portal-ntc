"use server";

import { revalidatePath } from "next/cache";
import type { RequiredDataFromCollectionSlug } from "payload";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  obterEventoCms,
  obterLeadCms,
  obterPalestranteCms,
  type EventoCmsDetalhe,
  type LeadCmsDetalhe,
  type PalestranteCmsDetalhe,
} from "@/lib/cms/painelCms";
import {
  criarEventoDePdf,
  definirOcultarPalestrante,
  despublicarEvento,
  enviarMidiaEvento,
  publicarEvento,
  salvarCamposEvento,
  salvarEventosHome,
  vincularPalestrantesEvento,
  type CamposEventoCompletos,
  type ResultadoEscrita,
  type ResultadoImportacao,
} from "@/lib/cms/painelCmsEscrita";
import {
  criarUsuario,
  editarUsuario,
  listarUsuarios,
  reenviarConvite,
  removerUsuario,
  type PayloadUsuarios,
  type ResultadoUsuarios,
  type UsuarioGestaoResumo,
} from "@/lib/cms/painelCmsUsuarios";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Server Actions do Painel Admin. Toda action valida a sessão (cookie
 * payload-token) ANTES de tocar a Local API — Server Actions são endpoints
 * públicos; sem a guarda, qualquer um com a URL escreveria no banco.
 */

const ERRO_SESSAO = "Sessão expirada. Entre novamente.";

const RECUSADO: ResultadoEscrita = { ok: false, erro: ERRO_SESSAO };

export async function carregarEvento(id: string): Promise<EventoCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterEventoCms(id);
}

export async function carregarPalestrante(id: string): Promise<PalestranteCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterPalestranteCms(id);
}

export async function carregarLead(id: string): Promise<LeadCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterLeadCms(id);
}

/** Salva o conjunto completo de campos editáveis e retorna o detalhe atualizado. */
export async function salvarEvento(
  id: string,
  campos: CamposEventoCompletos,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = await salvarCamposEvento(id, campos);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Faz upload de capa ou folder PDF (via FormData) e devolve o detalhe
 * atualizado. O File chega no campo "arquivo" do FormData.
 */
export async function enviarMidia(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { resultado: { ok: false, erro: "Nenhum arquivo selecionado." }, evento: null };
  }
  const resultado = await enviarMidiaEvento(id, campo, arquivo);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Publica ou despublica o evento e devolve o detalhe atualizado. */
export async function alternarPublicacaoEvento(
  id: string,
  publicar: boolean,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = publicar ? await publicarEvento(id) : await despublicarEvento(id);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Vincula os palestrantes (ids) ao evento e devolve o detalhe atualizado. */
export async function salvarPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, evento: null };
  const resultado = await vincularPalestrantesEvento(id, idsEspecialistas);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Importa um folder PDF criando um Evento em rascunho com o PDF vinculado.
 * O File chega no campo "arquivo" do FormData. Os campos restantes ficam para
 * a porta do PDF + revisão no detalhe.
 */
export async function importarEventoPdf(formData: FormData): Promise<ResultadoImportacao> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Nenhum arquivo selecionado." };
  }
  if (arquivo.type !== "application/pdf" && !arquivo.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, erro: "Envie um arquivo PDF." };
  }
  const resultado = await criarEventoDePdf(arquivo);
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/** Salva os eventos em destaque na Home. */
export async function salvarEventosDestaqueHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await salvarEventosHome(idsEventos);
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/**
 * Mostra/oculta um palestrante no site público e devolve o detalhe atualizado.
 * O afterChange da coleção Especialistas revalida o Corpo Docente sozinho.
 */
export async function alternarOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }> {
  if (!(await obterUsuarioCms())) return { resultado: RECUSADO, palestrante: null };
  const resultado = await definirOcultarPalestrante(id, oculto);
  if (resultado.ok) revalidatePath("/");
  const palestrante = resultado.ok ? await obterPalestranteCms(id) : null;
  return { resultado, palestrante };
}

/**
 * Server Actions da gestão de usuários (tela "Usuários"). Guarda MAIS
 * restrita que as demais: exige perfil "super-admin", não apenas sessão
 * válida — só super-admins criam/editam/removem contas administrativas.
 */

const RECUSADO_SUPER_ADMIN: ResultadoEscrita = {
  ok: false,
  erro: "Você não tem permissão para esta ação.",
};

/**
 * Adapta o Payload real (Local API) à superfície mínima mockável
 * PayloadUsuarios. `data: Record<string, unknown>` na interface (para
 * permitir mock nos testes) não corresponde ao tipo gerado da collection —
 * cast pontual, mesmo padrão de painelCmsEscrita.ts (criarEventoDePdf).
 */
async function obterPayloadUsuarios(): Promise<PayloadUsuarios> {
  const payload = await obterPayload();
  return {
    find: (args) => payload.find(args),
    create: (args) =>
      payload.create({
        collection: "users",
        data: args.data as RequiredDataFromCollectionSlug<"users">,
        overrideAccess: args.overrideAccess,
      }),
    update: (args) =>
      payload.update({
        collection: "users",
        id: args.id,
        data: args.data as RequiredDataFromCollectionSlug<"users">,
        overrideAccess: args.overrideAccess,
      }),
    delete: (args) => payload.delete(args),
    forgotPassword: (args) => payload.forgotPassword(args),
    sendEmail: (args) => payload.sendEmail(args),
  };
}

export async function carregarUsuarios(): Promise<UsuarioGestaoResumo[]> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") return [];
  return listarUsuarios(await obterPayloadUsuarios());
}

export async function criarUsuarioCms(dados: {
  nome: string;
  email: string;
  perfil: string;
}): Promise<{ resultado: ResultadoUsuarios; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await criarUsuario(p, dados);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

export async function editarUsuarioCms(
  id: string,
  dados: { nome: string; perfil: string },
): Promise<{ resultado: ResultadoEscrita; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await editarUsuario(p, id, dados);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

export async function removerUsuarioCms(
  id: string,
): Promise<{ resultado: ResultadoEscrita; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await removerUsuario(p, id, usuario.id);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

/**
 * Reenvia o convite de definição de senha (mesmo fluxo de criarUsuarioCms,
 * sem recriar o usuário) — aponta para o aviso "Reenviar convite" da T4
 * quando o e-mail original falhou, ou para um usuário que perdeu o link.
 */
export async function reenviarConviteUsuarioCms(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") return RECUSADO_SUPER_ADMIN;
  const p = await obterPayloadUsuarios();
  return reenviarConvite(p, id);
}
