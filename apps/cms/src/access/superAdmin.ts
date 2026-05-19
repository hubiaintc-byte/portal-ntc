import type { Access, FieldAccess } from "payload";

import type { User } from "../shared/user-shape";

const isSuperAdmin = (user: User | null | undefined): boolean =>
  user?.perfil === "super-admin";

/**
 * Apenas super-admins (1-2 pessoas — DAB §10.1).
 * Versão para collection-level access (read/create/update/delete).
 */
export const superAdmin: Access = ({ req }) => isSuperAdmin(req.user as User | null | undefined);

/**
 * Versão field-level — usada em `field.access.update` etc., onde o
 * tipo esperado é `FieldAccess` (retorna apenas boolean, não Where).
 */
export const superAdminField: FieldAccess = ({ req }) =>
  isSuperAdmin(req.user as User | null | undefined);
