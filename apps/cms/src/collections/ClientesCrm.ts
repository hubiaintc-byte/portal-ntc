import type { CollectionConfig } from "payload";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  STATUS_CLIENTE_CRM,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/**
 * Clientes (CRM) — conta comercial do funil (spec 2026-07-15 §Modelagem).
 * NÃO confundir com a coleção `clientes` (vitrine de instituições no site);
 * `clienteSite` liga as duas quando o prospect vira case público.
 */
export const ClientesCrm: CollectionConfig = {
  slug: "clientes-crm",
  labels: { singular: "Cliente (CRM)", plural: "Clientes (CRM)" },
  typescript: { interface: "ClienteCrm" },
  admin: {
    useAsTitle: "orgao",
    defaultColumns: ["orgao", "uf", "status", "responsavel"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "orgao", type: "text", required: true },
    { name: "sigla", type: "text" },
    { name: "tipo", type: "select", options: TIPOS_INSTITUICAO },
    { name: "municipio", type: "text" },
    { name: "uf", type: "select", options: UFS },
    { name: "esfera", type: "select", options: ESFERAS_CRM },
    { name: "area", type: "select", options: AREAS_CRM },
    { name: "cnpj", type: "text" },
    { name: "dirigente", type: "text" },
    { name: "cargoDirigente", type: "text" },
    { name: "email", type: "email" },
    { name: "origem", type: "select", options: ORIGENS_CRM },
    {
      name: "potencial",
      type: "number",
      min: 0,
      admin: { description: "Potencial estimado de contratação (R$)." },
    },
    { name: "status", type: "select", options: STATUS_CLIENTE_CRM, defaultValue: "prospect" },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "proximaAcao", type: "text" },
    { name: "observacoes", type: "textarea" },
    {
      name: "clienteSite",
      type: "relationship",
      relationTo: "clientes",
      admin: { description: "Instituição correspondente na vitrine do site, se houver." },
    },
  ],
};
