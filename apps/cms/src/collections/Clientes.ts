import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";
import { ESFERA_INSTITUCIONAL } from "../shared/types";

/**
 * Clientes / Instituições atendidas (doc 11 §10).
 *
 * Vitrine de credibilidade. `destaqueHome` marca quem aparece na faixa de
 * clientes da home; `ordem` controla disposição manual quando houver muitos.
 */
export const Clientes: CollectionConfig = {
  slug: "clientes",
  labels: { singular: "Cliente / Instituição", plural: "Clientes / Instituições" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "esfera", "estado"],
    group: "Editorial",
    listSearchableFields: ["nome"],
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  fields: [
    { name: "nome", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    {
      name: "esfera",
      type: "select",
      options: ESFERA_INSTITUCIONAL.map((e) => ({ label: e, value: e })),
      required: true,
    },
    { name: "estado", type: "text", maxLength: 2 },
    { name: "cidade", type: "text" },
    {
      name: "areasAtendidas",
      type: "relationship",
      relationTo: "areas",
      hasMany: true,
    },
    { name: "descricaoBreve", type: "textarea" },
    { name: "destaqueHome", type: "checkbox", defaultValue: false },
    { name: "ordem", type: "number", defaultValue: 100 },
  ],
};
