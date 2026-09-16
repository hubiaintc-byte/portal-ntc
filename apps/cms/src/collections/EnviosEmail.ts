import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";

export const FINALIDADES_EMAIL = [
  { label: "Proposta", value: "proposta" },
  { label: "Solicitação de documentos", value: "documentos" },
  { label: "Links de inscrição", value: "links-inscricao" },
  { label: "Livre", value: "livre" },
];

/**
 * Log de tudo que saiu por e-mail do CRM (spec §3.6). Append-only; escrita
 * só pela Local API interna (Sessão 3 — e-mail). Nesta sessão a coleção
 * existe para o push de schema ser único.
 */
export const EnviosEmail: CollectionConfig = {
  slug: "envios-email",
  labels: { singular: "Envio de e-mail", plural: "Envios de e-mail" },
  typescript: { interface: "EnvioEmail" },
  admin: { useAsTitle: "assunto", defaultColumns: ["enviadoEm", "cliente", "finalidade", "status"], group: "CRM" },
  access: { read: atendimentoComercial, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: "lead", type: "relationship", relationTo: "leads", index: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", index: true },
    { name: "modelo", type: "relationship", relationTo: "modelos-email" },
    { name: "finalidade", type: "select", options: FINALIDADES_EMAIL, required: true },
    { name: "destinatarios", type: "text", required: true },
    { name: "copia", type: "text" },
    { name: "assunto", type: "text", required: true },
    { name: "corpoRenderizado", type: "textarea", required: true },
    { name: "anexos", type: "relationship", relationTo: "documentos-comerciais", hasMany: true },
    { name: "enviadoPor", type: "relationship", relationTo: "users" },
    { name: "enviadoEm", type: "date", required: true, index: true },
    { name: "idResend", type: "text" },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Enviado", value: "enviado" },
        { label: "Falhou", value: "falhou" },
      ],
      required: true,
    },
    { name: "erro", type: "text" },
  ],
};
