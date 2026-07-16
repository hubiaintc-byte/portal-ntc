"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_SESSAO, obterUsuarioCms } from "@/lib/cms/autenticacao";
import { obterPayload } from "@/lib/payloadClient";
import { validarNovaSenha } from "@/lib/validarNovaSenha";

const QUATORZE_DIAS_S = 60 * 60 * 24 * 14;

export interface EstadoLogin {
  erro?: string;
  ok?: string;
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
  try {
    const payload = await obterPayload();
    ({ token } = await payload.login({
      collection: "users",
      data: { email, password: senha },
    }));
  } catch (e) {
    // 401 = credencial inválida/lockout (APIError do Payload). Qualquer outra
    // coisa (banco fora etc.) recebe mensagem neutra, sem vazar detalhe.
    const status = (e as { status?: number }).status;
    return status === 401
      ? { erro: "E-mail ou senha incorretos." }
      : { erro: "Não foi possível entrar. Tente novamente." };
  }
  if (!token) return { erro: "Não foi possível entrar. Tente novamente." };

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
  try {
    const payload = await obterPayload();
    ({ token: tokenSessao } = await payload.resetPassword({
      collection: "users",
      data: { token, password: senha },
      overrideAccess: true,
    }));
  } catch {
    return { erro: "Link inválido ou expirado. Solicite uma nova redefinição." };
  }

  if (tokenSessao) {
    const jarra = await cookies();
    jarra.set(COOKIE_SESSAO, tokenSessao, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
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
