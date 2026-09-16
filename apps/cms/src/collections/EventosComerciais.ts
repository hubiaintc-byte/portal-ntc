import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Evento comercial (spec §3.4): a turma/entrega contratada por um órgão.
 * NÃO tem relação com a coleção `eventos` (agenda pública do site). A
 * inscrição de participantes é feita em plataforma externa — aqui só os links.
 */
export const EventosComerciais: CollectionConfig = {
  slug: "eventos-comerciais",
  labels: { singular: "Evento comercial", plural: "Eventos comerciais" },
  typescript: { interface: "EventoComercial" },
  admin: { useAsTitle: "titulo", defaultColumns: ["titulo", "cliente", "dataInicio", "status"], group: "CRM" },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "lead", type: "relationship", relationTo: "leads", required: true, index: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true, index: true },
    { name: "proposta", type: "relationship", relationTo: "propostas" },
    { name: "titulo", type: "text", required: true },
    { name: "dataInicio", type: "date", required: true },
    { name: "dataFim", type: "date" },
    {
      name: "modalidade",
      type: "select",
      options: [
        { label: "Presencial", value: "presencial" },
        { label: "Online", value: "online" },
        { label: "Híbrido", value: "hibrido" },
      ],
    },
    { name: "local", type: "text" },
    { name: "moduloCatalogo", type: "relationship", relationTo: "modulos" },
    {
      name: "contratoEmpenho",
      type: "group",
      fields: [
        {
          name: "tipo",
          type: "select",
          options: [
            { label: "Contrato", value: "contrato" },
            { label: "Empenho", value: "empenho" },
            { label: "Termo", value: "termo" },
            { label: "Outro", value: "outro" },
          ],
        },
        { name: "numero", type: "text" },
        { name: "data", type: "date" },
        { name: "valor", type: "number", min: 0 },
        { name: "arquivo", type: "upload", relationTo: "documentos-comerciais" },
      ],
    },
    {
      name: "linksInscricao",
      type: "array",
      fields: [
        { name: "rotulo", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "agendado",
      required: true,
      options: [
        { label: "Agendado", value: "agendado" },
        { label: "Realizado", value: "realizado" },
        { label: "Cancelado", value: "cancelado" },
      ],
    },
    { name: "observacoes", type: "textarea" },
  ],
};
