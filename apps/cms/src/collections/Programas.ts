import type { CollectionConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";
import { autoSlug } from "../hooks/autoSlug";
import { seoFields } from "../shared/seoFields";

/**
 * Programas Estratégicos (doc 11 §5).
 *
 * Quinze instâncias previstas (doc 11 §18 — lista canônica até confirmação
 * via skill ntc-grupo · CLAUDE.md §17 pendência 11). Schema rico, espelha o
 * template editorial do folder de programa institucional.
 */
export const Programas: CollectionConfig = {
  slug: "programas",
  labels: { singular: "Programa Estratégico", plural: "Programas Estratégicos" },
  admin: {
    useAsTitle: "nomeCompleto",
    defaultColumns: ["sigla", "nomeCompleto", "area", "_status"],
    group: "Editorial",
    listSearchableFields: ["sigla", "nomeCompleto", "slug"],
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identificação",
          fields: [
            {
              name: "sigla",
              type: "text",
              required: true,
              unique: true,
              admin: { description: "Ex.: PROGE, EDUTEC, PROSUS+" },
            },
            { name: "nomeCompleto", type: "text", required: true },
            { name: "eyebrow", type: "text", label: "Eyebrow editorial" },
            {
              name: "area",
              type: "relationship",
              relationTo: "areas",
              required: true,
            },
            {
              name: "imagemCapa",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "lockupSvg",
              type: "upload",
              relationTo: "media",
              admin: { description: "Lockup SVG vertical do programa." },
            },
          ],
        },
        {
          label: "Visão Geral",
          fields: [
            { name: "cargaHorariaTotal", type: "text", required: true },
            { name: "modulosQuantidade", type: "number" },
            { name: "visaoGeral", type: "richText", required: true },
            { name: "problema", type: "richText" },
            { name: "objetivo", type: "richText" },
            { name: "publicoAlvo", type: "richText" },
          ],
        },
        {
          label: "Eixos e Resultados",
          fields: [
            {
              name: "eixosTematicos",
              type: "array",
              fields: [
                { name: "titulo", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "resultadosEsperados",
              type: "array",
              fields: [{ name: "resultado", type: "textarea", required: true }],
            },
            {
              name: "diferenciais",
              type: "array",
              fields: [
                { name: "titulo", type: "text", required: true },
                { name: "descricao", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Coordenação e Docentes",
          fields: [
            {
              name: "coordenacaoCientifica",
              type: "relationship",
              relationTo: "especialistas",
              hasMany: true,
            },
            {
              name: "docentes",
              type: "relationship",
              relationTo: "especialistas",
              hasMany: true,
            },
          ],
        },
        {
          label: "Modalidades",
          fields: [
            {
              name: "modalidadesEntrega",
              type: "array",
              fields: [
                {
                  name: "tipo",
                  type: "select",
                  options: [
                    { label: "in-company", value: "in-company" },
                    { label: "turma-aberta", value: "turma-aberta" },
                    { label: "sob-medida", value: "sob-medida" },
                    { label: "hibrida", value: "hibrida" },
                  ],
                  required: true,
                },
                { name: "descricao", type: "textarea" },
              ],
            },
            {
              name: "contratacaoInstitucional",
              type: "group",
              fields: [
                { name: "disponivel", type: "checkbox", defaultValue: true },
                { name: "observacoes", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "FAQ e Relacionados",
          fields: [
            {
              name: "faq",
              type: "array",
              fields: [
                { name: "pergunta", type: "text", required: true },
                { name: "resposta", type: "richText", required: true },
              ],
            },
            {
              name: "programasRelacionados",
              type: "relationship",
              relationTo: "programas",
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("nomeCompleto")] },
    },
    ...seoFields,
  ],
};
