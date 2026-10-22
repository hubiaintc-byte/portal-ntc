import type { Access, FieldAccess } from "payload";

import { acessoDoUsuario, temTela, type TelaPainel } from "../lib/cms/telas";

type UsuarioReq =
  | { administrador?: boolean | null; telas?: readonly string[] | null }
  | null
  | undefined;

/** Access de coleção/global: libera o administrador e quem tem alguma das telas. */
export function acessoPorTela(telas: readonly TelaPainel[]): Access {
  return ({ req }) => temTela(acessoDoUsuario(req.user as UsuarioReq), telas);
}

/** Só administrador. */
export const administrador: Access = ({ req }) =>
  acessoDoUsuario(req.user as UsuarioReq).administrador;

/** Versão field-level (retorna só boolean). */
export const administradorField: FieldAccess = ({ req }) =>
  acessoDoUsuario(req.user as UsuarioReq).administrador;

/** users: administrador vê/atualiza todos; os demais, só o próprio registro. */
export const proprioOuAdministrador: Access = ({ req }) => {
  const user = req.user as
    | (UsuarioReq & { id?: number | string; collection?: string })
    | null
    | undefined;
  if (!user) return false;
  if (user.collection && user.collection !== "users") return false;
  if (acessoDoUsuario(user).administrador) return true;
  if (user.id === undefined) return false;
  return { id: { equals: user.id } };
};
