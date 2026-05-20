import type { CollectionConfig } from "payload";

import { superAdmin } from "../access/superAdmin";

/**
 * Log de auditoria (doc 11 §12).
 *
 * Registro append-only de ações administrativas (login, criar, atualizar,
 * publicar, despublicar, deletar). Read-only para super-admin; nunca editável
 * pela UI. A escrita acontece exclusivamente via hooks internos (ainda a
 * desenvolver em janelas posteriores).
 */
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  labels: { singular: "Log de Auditoria", plural: "Logs de Auditoria" },
  admin: {
    useAsTitle: "descricao",
    defaultColumns: ["createdAt", "usuario", "acao", "entidade"],
    group: "Sistema",
  },
  access: {
    read: superAdmin,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "usuario", type: "relationship", relationTo: "users" },
    {
      name: "acao",
      type: "select",
      options: ["criar", "atualizar", "publicar", "despublicar", "deletar", "login", "logout"].map(
        (a) => ({ label: a, value: a }),
      ),
    },
    { name: "entidade", type: "text" },
    { name: "entidadeId", type: "text" },
    { name: "descricao", type: "text" },
    { name: "metadata", type: "json" },
    { name: "ip", type: "text" },
  ],
};
