import type { CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { superAdmin } from "../access/superAdmin";

/** Contatos (CRM) — pessoas dentro do órgão cliente (spec 2026-07-15). */
export const ContatosCrm: CollectionConfig = {
  slug: "contatos-crm",
  labels: { singular: "Contato (CRM)", plural: "Contatos (CRM)" },
  typescript: { interface: "ContatoCrm" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "cliente", "cargo", "email"],
    group: "CRM",
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: superAdmin,
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", required: true },
    { name: "cargo", type: "text" },
    { name: "setor", type: "text" },
    { name: "email", type: "email" },
    { name: "whatsapp", type: "text" },
    { name: "principal", type: "checkbox", defaultValue: false },
    { name: "decisor", type: "checkbox", defaultValue: false },
  ],
};
