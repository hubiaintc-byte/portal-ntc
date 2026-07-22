import type { CollectionConfig } from "payload";

import { STATUS_PROPOSTA, TIPOS_PROPOSTA } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Propostas comerciais (spec 2026-07-22 · Fase B1). Derivados (valorBruto,
 * desconto, valorLiquido) são gravados pela Server Action a partir dos inputs.
 * Versionamento: codigoBase agrupa versões; codigo é unique por versão.
 */
export const Propostas: CollectionConfig = {
  slug: "propostas",
  labels: { singular: "Proposta", plural: "Propostas" },
  typescript: { interface: "Proposta" },
  admin: {
    useAsTitle: "codigo",
    defaultColumns: ["codigo", "cliente", "valorLiquido", "status", "versao"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "codigoBase", type: "text", required: true, index: true },
    { name: "codigo", type: "text", required: true, unique: true },
    { name: "versao", type: "number", defaultValue: 1 },
    { name: "oportunidade", type: "relationship", relationTo: "oportunidades" },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "programa", type: "relationship", relationTo: "programas" },
    { name: "tipo", type: "select", options: TIPOS_PROPOSTA },
    { name: "status", type: "select", options: STATUS_PROPOSTA, defaultValue: "rascunho" },
    { name: "modulos", type: "relationship", relationTo: "modulos", hasMany: true },
    { name: "eventos", type: "relationship", relationTo: "eventos", hasMany: true },
    { name: "valorUnitario", type: "number", min: 0 },
    { name: "qtdPagantes", type: "number", min: 0 },
    { name: "cortesias", type: "number", min: 0 },
    { name: "percDesconto", type: "number", min: 0, max: 100 },
    { name: "valorBruto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "desconto", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "valorLiquido", type: "number", admin: { readOnly: true, description: "Derivado." } },
    { name: "modalidade", type: "text" },
    { name: "replay", type: "text" },
    { name: "condPagto", type: "text" },
    { name: "condEspecificas", type: "textarea" },
    { name: "observacoes", type: "textarea" },
    { name: "elaborador", type: "relationship", relationTo: "users" },
    { name: "aprovador", type: "relationship", relationTo: "users" },
    { name: "validadeDias", type: "number", defaultValue: 30 },
    { name: "dataCriacao", type: "date" },
    { name: "validade", type: "date" },
    { name: "motivoRevisao", type: "text" },
    { name: "substitui", type: "text", admin: { description: "Código da versão substituída." } },
  ],
};
