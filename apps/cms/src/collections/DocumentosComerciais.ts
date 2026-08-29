import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import { sanitizarFilename } from "../hooks/sanitizarFilename";

/**
 * Coleção privada para documentos comerciais gerados (propostas em PDF —
 * CRM Fase B2). Diferente de `media`, aqui a leitura exige usuário
 * autenticado no painel: propostas carregam preços, descontos e dados de
 * contato (CLAUDE.md §12 · LGPD). Servida via o mesmo bucket S3/Supabase,
 * mas SEM `disablePayloadAccessControl` — Payload intermedeia toda leitura
 * pelo próprio access control da coleção.
 */
export const DocumentosComerciais: CollectionConfig = {
  slug: "documentos-comerciais",
  labels: { singular: "Documento Comercial", plural: "Documentos Comerciais" },
  admin: {
    useAsTitle: "filename",
    group: "CRM",
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeOperation: [sanitizarFilename],
  },
  upload: {
    mimeTypes: ["application/pdf"],
  },
  fields: [{ name: "alt", type: "text" }],
};
