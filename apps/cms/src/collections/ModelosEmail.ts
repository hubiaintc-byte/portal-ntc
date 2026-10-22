import { acessoPorTela, administrador } from "../access/porTela";
import type { CollectionConfig } from "payload";

import { FINALIDADES_EMAIL } from "./EnviosEmail";

/** Modelos de e-mail com placeholders `{{...}}` (spec §3.5). Editor e envio: Sessão 3. */
export const ModelosEmail: CollectionConfig = {
  slug: "modelos-email",
  labels: { singular: "Modelo de e-mail", plural: "Modelos de e-mail" },
  typescript: { interface: "ModeloEmail" },
  admin: { useAsTitle: "nome", defaultColumns: ["nome", "finalidade", "padrao"], group: "CRM" },
  access: {
    read: acessoPorTela(["crm.envios"]),
    create: administrador,
    update: administrador,
    delete: administrador,
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "finalidade", type: "select", options: FINALIDADES_EMAIL, required: true, index: true },
    { name: "padrao", type: "checkbox", defaultValue: false },
    { name: "assunto", type: "text", required: true },
    { name: "corpo", type: "richText", required: true },
    { name: "anexarPdfProposta", type: "checkbox", defaultValue: false },
  ],
};
