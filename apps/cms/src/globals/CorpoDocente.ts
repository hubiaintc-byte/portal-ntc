import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global CorpoDocente — página /o-grupo/corpo-docente.
 *
 * Singleton. Estrutura em 9 tabs (hero, métricas, manifesto, cards,
 * credibilidade, credenciamento, FAQ, CTA final, sticky CTA mobile).
 *
 * Os cards são uma lista única com toggle de formato
 * (featured|expert|axis); admin.condition esconde campos irrelevantes
 * por formato. Cards featured/expert referenciam especialistas;
 * cards axis são narrativas de eixo (Saúde) sem pessoa relacionada.
 *
 * Versions com drafts habilitados — equipe editorial publica sob revisão.
 *
 * Spec: docs/superpowers/specs/2026-05-28-cms-corpo-docente-design.md
 */
export const CorpoDocente: GlobalConfig = {
  slug: "corpo-docente",
  label: "Corpo Docente (/o-grupo/corpo-docente)",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero & Quicklinks",
          fields: [
            {
              name: "hero",
              type: "group",
              fields: [
                { name: "eyebrow", type: "text", required: true },
                {
                  name: "titulo",
                  type: "richText",
                  required: true,
                  admin: {
                    description:
                      "Aceita <span class='accent'> e <br>. Lexical restritivo aplicado globalmente.",
                  },
                },
                {
                  name: "subtitulo",
                  type: "richText",
                  required: true,
                  admin: {
                    description: "Aceita <em>. Lexical restritivo.",
                  },
                },
                {
                  name: "quicklinks",
                  type: "array",
                  minRows: 1,
                  maxRows: 8,
                  fields: [
                    {
                      name: "tipo",
                      type: "select",
                      required: true,
                      options: [
                        { label: "Âncora (#id)", value: "anchor" },
                        { label: "Atalho de tab", value: "tab" },
                      ],
                    },
                    { name: "rotulo", type: "text", required: true },
                    {
                      name: "href",
                      type: "text",
                      required: true,
                      admin: {
                        condition: (_, sibling) => sibling?.tipo === "anchor",
                      },
                    },
                    {
                      name: "vertShortcut",
                      type: "select",
                      required: true,
                      options: [
                        { label: "todos", value: "todos" },
                        { label: "educacao", value: "educacao" },
                        { label: "gestao-publica", value: "gestao-publica" },
                        { label: "contratacoes", value: "contratacoes" },
                        { label: "saude", value: "saude" },
                      ],
                      admin: {
                        condition: (_, sibling) => sibling?.tipo === "tab",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Métricas",
          fields: [
            {
              name: "metricas",
              type: "array",
              minRows: 4,
              maxRows: 4,
              admin: {
                description:
                  "4 cards de números: Educação · Gestão Pública · Núcleo Contratações · Saúde.",
              },
              fields: [
                {
                  name: "classe",
                  type: "select",
                  required: true,
                  options: [
                    { label: "is-edu (Educação · esmeralda)", value: "is-edu" },
                    { label: "is-gov (Gestão Pública · Oxford)", value: "is-gov" },
                    { label: "is-cpr (Contratações · cardeal)", value: "is-cpr" },
                    { label: "is-sau (Saúde · oliva)", value: "is-sau" },
                  ],
                },
                { name: "sublabel", type: "text", required: true },
                { name: "num", type: "text", required: true, admin: { description: "Número exibido (ex: '60', '31', '5')." } },
                { name: "label", type: "text", required: true },
                { name: "detalhe", type: "textarea", required: true },
              ],
            },
          ],
        },
        // Tabs 3-9 adicionadas nas próximas tasks
      ],
    },
  ],
};
