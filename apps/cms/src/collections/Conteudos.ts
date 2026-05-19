import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";
import { autoSlug } from "../hooks/autoSlug";
import { seoFields } from "../shared/seoFields";
import { CONTEUDO_CATEGORIA } from "../shared/types";

/**
 * Conteúdos editoriais (doc 11 §9).
 *
 * Artigos, insights, publicações, notícias e materiais para download.
 * Categoria define a renderização no front e disponibilidade do anexo.
 */
export const Conteudos: CollectionConfig = {
  slug: "conteudos",
  labels: { singular: "Conteúdo", plural: "Conteúdos" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "categoria", "area", "dataPublicacao", "_status"],
    group: "Editorial",
    listSearchableFields: ["titulo", "slug"],
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    { name: "titulo", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("titulo")] },
    },
    {
      name: "categoria",
      type: "select",
      options: CONTEUDO_CATEGORIA.map((c) => ({ label: c, value: c })),
      required: true,
    },
    { name: "area", type: "relationship", relationTo: "areas" },
    { name: "lide", type: "textarea", required: true, maxLength: 280 },
    { name: "imagemDestaque", type: "upload", relationTo: "media", required: true },
    { name: "corpo", type: "richText", required: true },
    {
      name: "autor",
      type: "relationship",
      relationTo: "especialistas",
      hasMany: true,
    },
    {
      name: "dataPublicacao",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: "anexoDownload",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (d) =>
          d?.categoria === "material-download" || d?.categoria === "publicacao",
      },
    },
    {
      name: "conteudosRelacionados",
      type: "relationship",
      relationTo: "conteudos",
      hasMany: true,
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
    },
    ...seoFields,
  ],
};
