import type { Access } from "payload";

import type { User } from "../shared/user-shape";

/**
 * super-admin e editor-institucional (DAB §10.1).
 * Acesso editorial às coleções institucionais: Programas, Áreas, Conteúdos,
 * Especialistas, Globals.
 */
export const editorInstitucional: Access = ({ req }) => {
  const user = req.user as User | null | undefined;
  if (!user?.perfil) return false;
  return ["super-admin", "editor-institucional"].includes(user.perfil);
};
