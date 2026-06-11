"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { COOKIE_SESSAO } from "@/lib/cms/autenticacao";
import { obterPayload } from "@/lib/payloadClient";

const QUATORZE_DIAS_S = 60 * 60 * 24 * 14;

export interface EstadoLogin {
  erro: string;
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
