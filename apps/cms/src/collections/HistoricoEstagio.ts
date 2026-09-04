import type { CollectionConfig } from "payload";

import { ESTAGIO_OPORTUNIDADE } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";

/**
 * Histórico de estágio — trilha imutável das transições do funil
 * (docs/17 §1.2 · manual NTC-COM-CRM-01 §30).
 *
 * Append-only: create/update/delete negados para TODO perfil, inclusive
 * super-admin. A escrita acontece só pela Local API interna (hook da coleção
 * oportunidades e script de migração), que roda com overrideAccess padrão.
 */
export const HistoricoEstagio: CollectionConfig = {
  slug: "historico-estagio",
  labels: { singular: "Transição de Estágio", plural: "Histórico de Estágio" },
  typescript: { interface: "HistoricoEstagio" },
  admin: {
    useAsTitle: "estagioNovo",
    defaultColumns: ["oportunidade", "estagioAnterior", "estagioNovo", "dataHora"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: "oportunidade",
      type: "relationship",
      relationTo: "oportunidades",
      required: true,
      index: true,
    },
    { name: "estagioAnterior", type: "select", options: ESTAGIO_OPORTUNIDADE },
    { name: "estagioNovo", type: "select", options: ESTAGIO_OPORTUNIDADE, required: true },
    { name: "dataHora", type: "date", required: true },
    { name: "usuario", type: "relationship", relationTo: "users" },
    {
      name: "atorSistema",
      type: "text",
      admin: {
        description: "Preenchido quando a transição não veio de um usuário (migração, importador).",
      },
    },
    { name: "motivo", type: "textarea" },
  ],
};
