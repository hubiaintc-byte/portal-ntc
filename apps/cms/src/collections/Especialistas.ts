import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";
import { autoSlug } from "../hooks/autoSlug";
import { TITULACAO_DOCENTE } from "../shared/types";

/**
 * Especialistas (doc 11 §8).
 *
 * Docentes, coordenadores científicos e palestrantes. Foto em proporção
 * 20:23 (skill ntc-palestrantes). Grupo `apresentacaoOTT` reservado v2.
 */
export const Especialistas: CollectionConfig = {
  slug: "especialistas",
  labels: { singular: "Especialista", plural: "Especialistas" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "titulacao", "instituicao"],
    group: "Editorial",
    listSearchableFields: ["nome", "instituicao"],
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true },
  fields: [
    { name: "nome", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("nome")] },
    },
    {
      name: "foto",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "Proporção 20:23 — conforme skill ntc-palestrantes." },
    },
    {
      name: "titulacao",
      type: "select",
      options: TITULACAO_DOCENTE.map((t) => ({ label: t, value: t })),
      required: true,
    },
    { name: "instituicao", type: "text", required: true },
    { name: "cargoAtual", type: "text" },
    {
      name: "curriculoCurto",
      type: "richText",
      required: true,
      admin: { description: "3 a 5 linhas — destaque editorial." },
    },
    { name: "curriculoCompleto", type: "richText" },
    { name: "linkLattes", type: "text" },
    { name: "linkLinkedin", type: "text" },
    {
      name: "linhasAtuacao",
      type: "relationship",
      relationTo: "areas",
      hasMany: true,
    },
    {
      name: "apresentacaoOTT",
      type: "group",
      admin: {
        description: "[Reservado v2 — perfil público na OTT própria]",
        hidden: true,
      },
      fields: [
        { name: "ativo", type: "checkbox", defaultValue: false },
        { name: "biografiaEstendida", type: "richText" },
      ],
    },
  ],
};
