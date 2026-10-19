import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { protegerDocumentoComercial } from "../hooks/protegerDocumentoComercial";
import { sanitizarFilename } from "../hooks/sanitizarFilename";
import { registrarDocumentoNaLinhaDoTempo } from "../lib/crm/linhaDoTempo";

/**
 * Coleção privada para documentos comerciais gerados (propostas em PDF —
 * CRM Fase B2). Diferente de `media`, aqui a leitura exige usuário
 * autenticado no painel: propostas carregam preços, descontos e dados de
 * contato (CLAUDE.md §12 · LGPD). Registrada em payload.config.ts numa
 * instância própria do plugin s3Storage, apontando para SUPABASE_BUCKET_PRIVADO
 * (bucket dedicado e privado). Sem essa variável o upload é recusado
 * (`protegerDocumentoComercial`), nunca desviado para o bucket público. SEM `disablePayloadAccessControl` —
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
  // Propostas com preço, contratos e empenhos: só o perfil do CRM (o mesmo das
  // Server Actions — lib/cms/perfis.ts). Excluir, só o super-admin.
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeOperation: [sanitizarFilename, protegerDocumentoComercial],
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
