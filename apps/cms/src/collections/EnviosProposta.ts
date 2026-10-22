import { acessoPorTela, administrador } from "../access/porTela";
import type { CollectionConfig } from "payload";

import { CANAIS_ENVIO, STATUS_ENVIO } from "@ntc/lib";

/** Registro de envios de propostas — registro de fato, não disparo (Fase B1). */
export const EnviosProposta: CollectionConfig = {
  slug: "envios",
  labels: { singular: "Envio", plural: "Envios" },
  typescript: { interface: "EnvioProposta" },
  admin: {
    useAsTitle: "destinatarios",
    defaultColumns: ["proposta", "data", "canal", "status"],
    group: "CRM",
  },
  access: {
    read: acessoPorTela(["crm.propostas"]),
    create: acessoPorTela(["crm.propostas"]),
    update: acessoPorTela(["crm.propostas"]),
    delete: administrador,
  },
  fields: [
    { name: "proposta", type: "relationship", relationTo: "propostas", required: true },
    { name: "data", type: "date" },
    { name: "canal", type: "select", options: CANAIS_ENVIO },
    { name: "destinatarios", type: "text" },
    { name: "status", type: "select", options: STATUS_ENVIO },
    { name: "observacoes", type: "textarea" },
  ],
};
