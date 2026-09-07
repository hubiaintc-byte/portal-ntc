"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { checarRateLimit, LIMITE_RECUPERACAO } from "@ntc/lib";
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { COOKIE_SESSAO, obterUsuarioCms } from "@/lib/cms/autenticacao";
import {
  confirmarCadastroPasskey,
  confirmarLoginPasskey,
  listarPasskeysDoUsuario,
  prepararCadastroPasskey,
  prepararLoginPasskey,
  removerPasskey,
  type PasskeyResumo,
} from "@/lib/cms/painelPasskeys";
import { obterPayload } from "@/lib/payloadClient";
import { criarStoreRateLimit } from "@/lib/storeRateLimit";
import { cifrarTokenPonte, decifrarTokenPonte } from "@/lib/passkeys/tokens";
import { validarNovaSenha } from "@/lib/validarNovaSenha";

const QUATORZE_DIAS_S = 60 * 60 * 24 * 14;

export interface EstadoLogin {
  erro?: string;
  ok?: string;
  /** Presente quando a senha bateu mas o usuário tem passkey — 2º fator pendente. */
  precisaPasskey?: {
    tokenPendente: string;
    opcoesAutenticacao: PublicKeyCredentialRequestOptionsJSON;
  };
}

/**
 * Server Action do formulário de login (/entrar). Autentica na collection
 * Users via Local API e grava o JWT no cookie httpOnly (payload-token).
 * Falha retorna mensagem genérica (não revela qual campo errou). O lockout
 * de 5 tentativas é o default do Payload.
 */
export async function entrar(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const manter = formData.get("manter") === "on";
  if (!email || !senha) return { erro: "Informe e-mail e senha." };

  let token: string | undefined;
  let usuarioId: string | undefined;
  try {
    const payload = await obterPayload();
    const resultado = await payload.login({
      collection: "users",
      data: { email, password: senha },
    });
    token = resultado.token;
    usuarioId = resultado.user ? String(resultado.user.id) : undefined;
  } catch (e) {
    // 401 = credencial inválida/lockout (APIError do Payload). Qualquer outra
    // coisa (banco fora etc.) recebe mensagem neutra, sem vazar detalhe.
    const status = (e as { status?: number }).status;
    return status === 401
      ? { erro: "E-mail ou senha incorretos." }
      : { erro: "Não foi possível entrar. Tente novamente." };
  }
  if (!token || !usuarioId) return { erro: "Não foi possível entrar. Tente novamente." };

  let pendente: Awaited<ReturnType<typeof prepararLoginPasskey>>;
  try {
    pendente = await prepararLoginPasskey(usuarioId);
  } catch (e) {
    // Falha ao consultar passkeys (ex.: tabela ainda não existe porque
    // pnpm payload:push:schema não rodou) NÃO pode virar bypass do 2º
    // fator nem derrubar o login de quem não tem passkey — falha
    // fechada com mensagem neutra, como qualquer outro erro deste fluxo.
    console.error("[entrar] falha ao consultar passkeys", e);
    return { erro: "Não foi possível entrar. Tente novamente." };
  }
  if (pendente) {
    const tokenPendente = await cifrarTokenPonte({
      userId: usuarioId,
      sessaoReal: token,
      challenge: pendente.challenge,
      manter,
    });
    return { precisaPasskey: { tokenPendente, opcoesAutenticacao: pendente.opcoes } };
  }

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Sem "manter sessão": cookie de sessão (morre ao fechar o navegador).
    ...(manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}

/** Completa o login depois da senha, confirmando o 2º fator (passkey). */
export async function verificarAutenticacaoPasskey(
  tokenPendente: string,
  resposta: AuthenticationResponseJSON,
): Promise<{ erro?: string }> {
  const claims = await decifrarTokenPonte(tokenPendente);
  if (!claims) return { erro: "Sessão de login expirada. Entre novamente." };

  const ok = await confirmarLoginPasskey(claims.userId, resposta, claims.challenge);
  if (!ok) return { erro: "Não foi possível confirmar o passkey. Tente novamente." };

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, claims.sessaoReal, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(claims.manter ? { maxAge: QUATORZE_DIAS_S } : {}),
  });
  redirect("/");
}

/** Encerra a sessão (apaga o cookie) e volta ao login. */
export async function sair(): Promise<void> {
  (await cookies()).delete(COOKIE_SESSAO);
  redirect("/entrar");
}

const MENSAGEM_RECUPERACAO =
  "Se o e-mail estiver cadastrado, você receberá o link de redefinição em instantes.";

/**
 * "Esqueci minha senha" (/entrar/recuperar). Resposta SEMPRE genérica —
 * não revela se o e-mail existe (spec 2026-07-10 §2). Erros de envio ficam
 * no log do servidor.
 */
export async function solicitarRecuperacao(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { erro: "Informe o e-mail." };

  // Sem isto, o endereço de admin (conhecido) pode ser bombardeado de
  // e-mails de recuperação por qualquer um, em loop.
  const cabecalhos = await headers();
  const xff = cabecalhos.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || cabecalhos.get("x-real-ip") || "0.0.0.0";
  const limite = await checarRateLimit(
    ip,
    "/entrar/recuperar",
    criarStoreRateLimit(),
    LIMITE_RECUPERACAO,
  );
  if (!limite.ok) {
    // Mensagem genérica de propósito: não revela se o e-mail existe nem
    // que houve bloqueio por IP (spec 2026-07-10 §2).
    return { ok: MENSAGEM_RECUPERACAO };
  }

  try {
    const payload = await obterPayload();
    await payload.forgotPassword({ collection: "users", data: { email } });
  } catch (e) {
    console.error("[recuperar-senha] falha ao gerar/enviar token:", e);
  }
  return { ok: MENSAGEM_RECUPERACAO };
}

/**
 * Conclui a redefinição (/entrar/redefinir?token=…): valida a senha nova,
 * consome o token do Payload e já autentica (cookie de sessão).
 */
export async function redefinirSenha(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const token = String(formData.get("token") ?? "");
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");
  if (!token) return { erro: "Link inválido. Solicite uma nova redefinição." };

  const invalida = validarNovaSenha(senha, confirmacao);
  if (invalida) return { erro: invalida };

  let tokenSessao: string | undefined;
  let usuarioId: string | undefined;
  try {
    const payload = await obterPayload();
    const resultado = await payload.resetPassword({
      collection: "users",
      data: { token, password: senha },
      overrideAccess: true,
    });
    tokenSessao = resultado.token;
    usuarioId = resultado.user ? String((resultado.user as { id: unknown }).id) : undefined;
  } catch {
    return { erro: "Link inválido ou expirado. Solicite uma nova redefinição." };
  }
  if (!tokenSessao || !usuarioId) {
    return { erro: "Não foi possível concluir. Tente novamente." };
  }

  let pendente: Awaited<ReturnType<typeof prepararLoginPasskey>>;
  try {
    pendente = await prepararLoginPasskey(usuarioId);
  } catch (e) {
    console.error("[redefinirSenha]", e);
    return { erro: "Não foi possível concluir. Tente novamente." };
  }
  if (pendente) {
    const tokenPendente = await cifrarTokenPonte({
      userId: usuarioId,
      sessaoReal: tokenSessao,
      challenge: pendente.challenge,
      manter: false,
    });
    return { precisaPasskey: { tokenPendente, opcoesAutenticacao: pendente.opcoes } };
  }

  const jarra = await cookies();
  jarra.set(COOKIE_SESSAO, tokenSessao, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect("/");
}

/**
 * Troca da própria senha (menu do usuário). Valida a senha atual via login
 * antes de gravar a nova — o access da coleção permite o update do próprio
 * registro, mas exigimos a senha vigente por segurança de sessão aberta.
 */
export async function trocarMinhaSenha(
  _anterior: EstadoLogin | null,
  formData: FormData,
): Promise<EstadoLogin> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { erro: "Sessão expirada. Entre novamente." };

  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  const invalida = validarNovaSenha(senha, confirmacao);
  if (invalida) return { erro: invalida };

  try {
    const payload = await obterPayload();
    await payload.login({
      collection: "users",
      data: { email: usuario.email, password: senhaAtual },
    });
    await payload.update({
      collection: "users",
      id: usuario.id,
      data: { password: senha },
      overrideAccess: true,
    });
  } catch (e) {
    const status = (e as { status?: number }).status;
    return status === 401
      ? { erro: "Senha atual incorreta." }
      : { erro: "Não foi possível alterar a senha. Tente novamente." };
  }
  return { ok: "Senha alterada com sucesso." };
}

/** Opções pra cadastrar um novo passkey — exige sessão ativa. */
export async function obterOpcoesCadastroPasskeyCms(): Promise<
  | { ok: true; opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string }
  | { ok: false; erro: string }
> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  const { opcoes, tokenDesafio } = await prepararCadastroPasskey(usuario.id, usuario.email, usuario.nome);
  return { ok: true, opcoes, tokenDesafio };
}

export async function verificarCadastroPasskeyCms(
  resposta: RegistrationResponseJSON,
  tokenDesafio: string,
  apelido: string,
): Promise<ReturnType<typeof confirmarCadastroPasskey>> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  return confirmarCadastroPasskey(usuario.id, resposta, tokenDesafio, apelido);
}

export async function listarMinhasPasskeysCms(): Promise<PasskeyResumo[]> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return [];
  return listarPasskeysDoUsuario(usuario.id);
}

export async function removerPasskeyProprioCms(
  passkeyId: string,
): Promise<ReturnType<typeof removerPasskey>> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return { ok: false, erro: "Sessão expirada. Entre novamente." };
  return removerPasskey(passkeyId, usuario.id, false);
}
