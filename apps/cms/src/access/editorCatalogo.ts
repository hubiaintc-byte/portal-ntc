import type { Access } from "payload";

import { PERFIS_CATALOGO, temPerfil } from "../lib/cms/perfis";
import type { User } from "../shared/user-shape";

/**
 * Programas e Módulos: editados no Catálogo do CRM pelo comercial e pelo
 * institucional (decisão do PO, 07/10/2026). Mesmo conjunto que as Server
 * Actions do catálogo exigem.
 */
export const editorCatalogo: Access = ({ req }) =>
  temPerfil((req.user as User | null | undefined)?.perfil, PERFIS_CATALOGO);
