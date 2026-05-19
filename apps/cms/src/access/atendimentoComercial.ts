import type { Access } from "payload";

import type { User } from "../shared/user-shape";

/**
 * super-admin e atendimento-comercial (DAB §10.1).
 * Acesso somente à coleção Leads para gestão do funil institucional.
 */
export const atendimentoComercial: Access = ({ req }) => {
  const user = req.user as User | null | undefined;
  if (!user?.perfil) return false;
  return ["super-admin", "atendimento-comercial"].includes(user.perfil);
};
