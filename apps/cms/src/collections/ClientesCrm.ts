import type { CollectionConfig } from "payload";

import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CLIENTE,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";
import { bloquearClienteComDependentes } from "../lib/crm/exclusaoCliente";

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
    defaultColumns: ["orgao", "uf", "esfera", "responsavel"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        const contatos = Array.isArray(data?.contatos) ? data.contatos : [];
        const principais = contatos.filter((c) => c?.principal === true);
        if (principais.length > 1) {
          throw new Error("Só um contato pode ser o principal.");
        }
        return data;
      },
    ],
    beforeDelete: [bloquearClienteComDependentes],
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
    { name: "email", type: "email" },
    { name: "origem", type: "select", options: ORIGENS_CLIENTE, defaultValue: "manual" },
    {
      name: "contatos",
      type: "array",
      admin: { description: "Pessoas do órgão. No máximo um contato principal." },
      fields: [
        { name: "nome", type: "text", required: true },
        { name: "cargo", type: "text" },
        { name: "setor", type: "text" },
        { name: "email", type: "email" },
        { name: "whatsapp", type: "text" },
        { name: "principal", type: "checkbox", defaultValue: false },
        { name: "decisor", type: "checkbox", defaultValue: false },
      ],
    },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "observacoes", type: "textarea" },
    {
      name: "clienteSite",
      type: "relationship",
      relationTo: "clientes",
      admin: { description: "Instituição correspondente na vitrine do site, se houver." },
    },
  ],
};
