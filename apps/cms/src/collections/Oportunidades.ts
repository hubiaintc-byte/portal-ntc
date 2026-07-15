import type { CollectionConfig } from "payload";

import { ORIGENS_CRM, STATUS_OPORTUNIDADE, UFS } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Oportunidades — funil comercial (spec 2026-07-15 §Modelagem).
 * Catálogo único: aponta para as coleções editoriais programas/modulos/eventos.
 * Pipeline ponderado (valor × probabilidade) é derivado na tela, não persistido.
 */
export const Oportunidades: CollectionConfig = {
  slug: "oportunidades",
  labels: { singular: "Oportunidade", plural: "Oportunidades" },
  typescript: { interface: "Oportunidade" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valor", "probabilidade", "status"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "programa", type: "relationship", relationTo: "programas" },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "uf", type: "select", options: UFS },
    { name: "origem", type: "select", options: ORIGENS_CRM },
    {
      name: "quantidade",
      type: "number",
      min: 0,
      admin: { description: "Quantidade estimada de participantes." },
    },
    { name: "modalidade", type: "text" },
    { name: "valor", type: "number", min: 0, admin: { description: "Valor estimado (R$)." } },
    { name: "probabilidade", type: "number", min: 0, max: 100 },
    {
      name: "status",
      type: "select",
      options: STATUS_OPORTUNIDADE,
      defaultValue: "em-qualificacao",
    },
    { name: "dataAbertura", type: "date" },
    { name: "dataPrevFechamento", type: "date" },
    { name: "proximaAcao", type: "text" },
    { name: "followup", type: "date", admin: { description: "Data do próximo follow-up." } },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "observacoes", type: "textarea" },
  ],
};
