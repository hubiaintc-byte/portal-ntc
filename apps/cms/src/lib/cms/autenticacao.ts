import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { obterPayload } from "@/lib/payloadClient";

/**
 * Sessão do Painel Admin — validada contra o JWT do Payload (collection
 * Users), gravado pelo login /entrar no cookie payload-token.
 */

export const COOKIE_SESSAO = "payload-token";

export interface UsuarioCms {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

/** Lê o cookie e valida com o Payload. null = sem sessão válida/expirada. */
export async function obterUsuarioCms(): Promise<UsuarioCms | null> {
  const jarra = await cookies();
  const token = jarra.get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    const payload = await obterPayload();
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    });
    if (!user || user.collection !== "users") return null;
    return {
      id: String(user.id),
      nome: user.nome,
      // payload.auth() alarga email para string|undefined (união de coleções
      // auth); na collection users o campo é obrigatório.
      email: user.email ?? "",
      perfil: user.perfil,
    };
  } catch {
    return null;
  }
}

/** Guarda de página: sem sessão, redireciona para /entrar. */
export async function exigirUsuarioCms(): Promise<UsuarioCms> {
  const usuario = await obterUsuarioCms();
  if (!usuario) redirect("/entrar");
  return usuario;
}

/**
 * Guarda de página mais restrita: exige sessão E perfil "super-admin" —
 * usada na tela de gestão de usuários. Sem sessão ou perfil insuficiente,
 * redireciona para "/" (evita revelar a existência da rota a quem não pode
 * acessá-la).
 */
export async function exigirSuperAdmin(): Promise<UsuarioCms> {
  const usuario = await obterUsuarioCms();
  if (!usuario || usuario.perfil !== "super-admin") redirect("/");
  return usuario;
}
