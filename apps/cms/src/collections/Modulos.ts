import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Módulos (doc 11 §6).
 *
 * Unidade interna de programa — sem página pública. Vinculado obrigatoriamente
 * a um programa e, opcionalmente, a eventos abertos que o derivam.
 */
export const Modulos: CollectionConfig = {
  slug: "modulos",
  labels: { singular: "Módulo", plural: "Módulos" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["numero", "titulo", "programa", "cargaHoraria"],
    group: "Editorial",
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  fields: [
    {
      name: "programa",
      type: "relationship",
      relationTo: "programas",
      required: true,
    },
    { name: "numero", type: "number", required: true, min: 1 },
    { name: "titulo", type: "text", required: true },
    { name: "ementa", type: "richText", required: true },
    { name: "cargaHoraria", type: "text" },
    {
      name: "eventosVinculados",
      type: "relationship",
      relationTo: "eventos",
      hasMany: true,
      admin: { description: "Eventos abertos que derivam deste módulo." },
    },
    {
      name: "comercial",
      type: "group",
      label: "Dados comerciais (CRM)",
      admin: { description: "Usado pelo módulo CRM do painel; o site ignora este grupo." },
      fields: [
        { name: "tituloComercial", type: "text" },
        { name: "valor", type: "number", min: 0, admin: { description: "Valor de referência (R$)." } },
        { name: "replay", type: "text" },
        { name: "certificacao", type: "text" },
      ],
    },
  ],
};
