import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";
import { autoSlug } from "../hooks/autoSlug";
import { seoFields } from "../shared/seoFields";
import { AREA_SIGLAS } from "../shared/types";

/**
 * Áreas Estratégicas (doc 11 §4).
 *
 * Três instâncias fixas — Educação, Gestão Pública, Saúde — criadas via seed
 * (doc 11 §18). Não permitimos `delete` para preservar a integridade do
 * sistema editorial (CLAUDE.md §1 · verticais canônicas).
 */
export const Areas: CollectionConfig = {
  slug: "areas",
  labels: { singular: "Área Estratégica", plural: "Áreas Estratégicas" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "sigla", "updatedAt"],
    group: "Editorial",
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: () => false,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  fields: [
    {
      name: "sigla",
      type: "select",
      options: AREA_SIGLAS.map((s) => ({ label: s, value: s })),
      required: true,
      unique: true,
      admin: { description: "Identificador interno da área." },
    },
    { name: "nome", type: "text", required: true, label: "Nome da Área" },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("nome")] },
    },
    {
      name: "eyebrow",
      type: "text",
      label: "Eyebrow (texto sobrescrito ao título)",
    },
    { name: "tituloHero", type: "text", required: true },
    { name: "subtituloHero", type: "textarea", required: true },
    { name: "imagemHero", type: "upload", relationTo: "media", required: true },
    {
      name: "corAcento",
      type: "text",
      required: true,
      defaultValue: "#11365E",
      admin: {
        description:
          "Cor de acento da área (Oxford/Cardeal/Oliva). Mantém hierarquia 60·15·10·5 da Soberana 2026.",
      },
    },
    {
      name: "posicionamento",
      type: "richText",
      required: true,
      label: "Posicionamento editorial da área",
    },
    {
      name: "numerosImpacto",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "valor", type: "text", required: true },
        { name: "rotulo", type: "text", required: true },
      ],
    },
    {
      name: "programasDestacados",
      type: "relationship",
      relationTo: "programas",
      hasMany: true,
      admin: { description: "Programas exibidos em destaque na página da área." },
    },
    {
      name: "cardHome",
      type: "group",
      label: "Card Home v3 (3 áreas premium)",
      admin: {
        description:
          "Campos do card grande de área na Home portada (.area-card).",
      },
      fields: [
        { name: "num", type: "text", admin: { description: 'Ex.: "01", "02", "03"' } },
        { name: "verticalCode", type: "select", options: [{ label: "edu", value: "edu" }, { label: "gov", value: "gov" }, { label: "sau", value: "sau" }] },
        { name: "tituloLinha1", type: "text", admin: { description: 'Ex.: "Educação"' } },
        { name: "tituloLinha2", type: "text", admin: { description: 'Ex.: "com excelência."' } },
        { name: "tagline", type: "textarea" },
        { name: "programasCount", type: "text", admin: { description: 'Ex.: "9"' } },
        { name: "linkProgramasRotulo", type: "text", defaultValue: "Ver programas da área" },
        { name: "linkProgramasHref", type: "text" },
        { name: "linkEventosRotulo", type: "text", defaultValue: "Ver módulos e eventos abertos" },
        { name: "linkEventosHref", type: "text" },
      ],
    },
    ...seoFields,
  ],
};
