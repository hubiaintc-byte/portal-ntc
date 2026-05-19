import type { Access } from "payload";

/**
 * Acesso restrito a qualquer usuário autenticado no admin.
 * Doc 11 §16 · CLAUDE.md §10.1.
 */
export const authenticated: Access = ({ req }) => Boolean(req.user);
