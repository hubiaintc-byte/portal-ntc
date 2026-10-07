import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { TypedUser } from "payload";

import { obterPayload } from "@/lib/payloadClient";

import { temPerfil, type PerfilPainel } from "./perfis";

/**
 * Sessão do Painel Admin — validada contra o JWT do Payload (collection
 * Users), gravado pelo login /entrar no cookie payload-token.
 */

export const COOKIE_SESSAO = "payload-token";

/**
 * Usuário autenticado como o Payload o devolve — é este objeto (não o resumo
 * abaixo) que a Local API aceita em `user` para popular `req.user` nos hooks
 * de coleção. Sem ele, toda transição de estágio sairia com autor "sistema".
 */
export type UsuarioAutenticado = Extract<TypedUser, { collection: "users" }>;

export interface UsuarioCms {
  id: string;
  nome: string;
  email: string;
  perfil: string;
}

/**
 * Lê o cookie e valida com o Payload, devolvendo o usuário cru da coleção
 * `users`. null = sem sessão válida/expirada. Use quando o usuário precisa
 * ser repassado à Local API (`user:`) para chegar aos hooks como `req.user`.
 */
export async function obterUsuarioAutenticado(): Promise<UsuarioAutenticado | null> {
  const jarra = await cookies();
  const token = jarra.get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  try {
    const payload = await obterPayload();
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    });
    if (!user || user.collection !== "users") return null;
    return user;
  } catch {
    return null;
  }
}

/** Resumo serializável da sessão para as telas. null = sem sessão válida. */
export async function obterUsuarioCms(): Promise<UsuarioCms | null> {
  const usuario = await obterUsuarioAutenticado();
  if (!usuario) return null;
  return resumirUsuario(usuario);
}

/** Projeção enxuta do usuário do Payload para o que as telas consomem. */
function resumirUsuario(usuario: UsuarioAutenticado): UsuarioCms {
  return {
    id: String(usuario.id),
    nome: usuario.nome,
    // payload.auth() alarga email para string|undefined (união de coleções
    // auth); na collection users o campo é obrigatório.
    email: usuario.email ?? "",
    perfil: usuario.perfil,
  };
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

/**
 * Sessão com perfil: `null` sem sessão OU com perfil fora de `permitidos`.
 * É a guarda das Server Actions — a Local API ignora o `access` das coleções.
 */
export async function obterUsuarioCmsComPerfil(permitidos: readonly PerfilPainel[]): Promise<UsuarioCms | null> {
  const usuario = await obterUsuarioCms();
  return usuario && temPerfil(usuario.perfil, permitidos) ? usuario : null;
}

/** Como `obterUsuarioCmsComPerfil`, devolvendo o usuário cru (para `user:` da Local API). */
export async function obterUsuarioAutenticadoComPerfil(
  permitidos: readonly PerfilPainel[],
): Promise<UsuarioAutenticado | null> {
  const usuario = await obterUsuarioAutenticado();
  return usuario && temPerfil(usuario.perfil, permitidos) ? usuario : null;
}

/** Guarda de página por perfil: sem sessão vai a /entrar; perfil insuficiente, a "/". */
export async function exigirPerfil(permitidos: readonly PerfilPainel[]): Promise<UsuarioCms> {
  const usuario = await exigirUsuarioCms();
  if (!temPerfil(usuario.perfil, permitidos)) redirect("/");
  return usuario;
}
