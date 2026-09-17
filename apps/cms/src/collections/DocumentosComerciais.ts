import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import { sanitizarFilename } from "../hooks/sanitizarFilename";
import { registrarDocumentoNaLinhaDoTempo } from "../lib/crm/linhaDoTempo";

/**
 * Coleção privada para documentos comerciais gerados (propostas em PDF —
 * CRM Fase B2). Diferente de `media`, aqui a leitura exige usuário
 * autenticado no painel: propostas carregam preços, descontos e dados de
 * contato (CLAUDE.md §12 · LGPD). Registrada em payload.config.ts numa
 * instância própria do plugin s3Storage, apontando para SUPABASE_BUCKET_PRIVADO
 * (bucket dedicado e privado — cai no bucket público de `media` como fallback
 * enquanto esse bucket não for criado). SEM `disablePayloadAccessControl` —
 * Payload intermedeia toda leitura pelo próprio access control da coleção.
 */
export const DocumentosComerciais: CollectionConfig = {
  slug: "documentos-comerciais",
  labels: { singular: "Documento Comercial", plural: "Documentos Comerciais" },
  typescript: { interface: "DocumentoComercial" },
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
    afterChange: [registrarDocumentoNaLinhaDoTempo],
  },
  upload: {
    mimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  fields: [
    { name: "alt", type: "text" },
    { name: "descricao", type: "text" },
    { name: "evento", type: "relationship", relationTo: "eventos-comerciais", index: true },
  ],
};
