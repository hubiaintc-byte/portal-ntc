import type { Access } from "payload";

import type { User } from "../shared/user-shape";

/**
 * super-admin, editor-institucional e editor-eventos (DAB §10.1).
 * Acesso a Eventos e Módulos.
 */
export const editorEventos: Access = ({ req }) => {
  const user = req.user as User | null | undefined;
  if (!user?.perfil) return false;
  return ["super-admin", "editor-institucional", "editor-eventos"].includes(user.perfil);
};
