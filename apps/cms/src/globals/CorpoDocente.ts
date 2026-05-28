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
        {
          label: "Manifesto",
          fields: [
            { name: "marker", type: "text", required: true },
            {
              name: "tituloManifesto",
              type: "richText",
              required: true,
              admin: { description: "Aceita <em>." },
            },
            { name: "lede", type: "textarea", required: true },
            {
              name: "archCards",
              type: "array",
              minRows: 4,
              maxRows: 4,
              admin: { description: "Educação · Gestão Pública · Contratações · Saúde." },
              fields: [
                {
                  name: "area",
                  type: "select",
                  required: true,
                  options: [
                    { label: "educacao", value: "educacao" },
                    { label: "gestao-publica", value: "gestao-publica" },
                    { label: "contratacoes", value: "contratacoes" },
                    { label: "saude", value: "saude" },
                  ],
                },
                { name: "eyebrow", type: "text", required: true },
                { name: "tituloArch", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
                { name: "selo", type: "text", required: true },
              ],
            },
            {
              name: "camadas",
              type: "array",
              minRows: 5,
              maxRows: 5,
              admin: { description: "5 camadas de autoridade (01..05)." },
              fields: [
                { name: "num", type: "text", required: true },
                { name: "tituloCamada", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "callout",
              type: "group",
              fields: [
                { name: "tituloCallout", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "nota",
              type: "richText",
              required: true,
              admin: { description: "Aceita <strong>." },
            },
          ],
        },
        {
          label: "Cards (Featured/Experts/Axis)",
          fields: [
            {
              name: "cards",
              type: "array",
              minRows: 1,
              admin: {
                description:
                  "Lista única ordenável. Cada item tem 'formato' (featured/expert/axis) que decide quais campos aparecem. Cards featured/expert apontam para Especialistas; cards axis (Saúde) são narrativas de eixo sem pessoa relacionada.",
              },
              fields: [
                {
                  name: "formato",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Featured (autoridade grande)", value: "featured" },
                    { label: "Expert (card menor)", value: "expert" },
                    { label: "Axis Saúde (sem foto, com SVG)", value: "axis" },
                  ],
                },

                // ---- featured/expert: relação com Especialista ----
                {
                  name: "especialista",
                  type: "relationship",
                  relationTo: "especialistas",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description:
                      "Especialista relacionado. Foto, nome e dataset de filtro são herdados dele.",
                  },
                },

                // ---- embrulho editorial comum ----
                {
                  name: "tag",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Ex: "Autoridade convidada", "Coordenação científica · Educação".',
                  },
                },
                {
                  name: "axisBadge",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Selo no rodapé da foto. Ex: "Gestão Pública · Direito constitucional".',
                  },
                },
                {
                  name: "credencialCard",
                  type: "textarea",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: "Parágrafo de credencial exibido no card (≠ currículo curto do Especialista).",
                  },
                },
                {
                  name: "metaAtuacao",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Linha "Atuação · Tribunal X" (use <strong> no valor).',
                  },
                },
                {
                  name: "metaEixos",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Linha "Eixos · LIDERA · SIGA" (use <strong> no valor).',
                  },
                },
                {
                  name: "ctaHref",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                  },
                },
                {
                  name: "ctaRotulo",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato !== "axis",
                    description: 'Default no adapter: "Consultar disponibilidade".',
                  },
                },

                // ---- expert only ----
                {
                  name: "programasTexto",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                    description: 'Prefixo antes do strong. Ex: "Vinculação · ".',
                  },
                },
                {
                  name: "programasStrong",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                  },
                },
                {
                  name: "sufixoPrograma",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "expert",
                  },
                },

                // ---- axis only ----
                {
                  name: "area",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: 'Slug do eixo. Ex: "atencao-primaria".',
                  },
                },
                {
                  name: "axisTag",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "tituloAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "credencialAxis",
                  type: "textarea",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "programasTextoAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "programasStrongAxis",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "styleAccent",
                  type: "text",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: "Cor de destaque CSS (hex ou token).",
                  },
                },
                {
                  name: "styleAccentDark",
                  type: "text",
                  admin: { condition: (_, sibling) => sibling?.formato === "axis" },
                },
                {
                  name: "iconeSvgInner",
                  type: "textarea",
                  admin: {
                    condition: (_, sibling) => sibling?.formato === "axis",
                    description: "innerHTML completo do <svg> do card (path/circle/rect).",
                  },
                },
              ],
            },
          ],
        },
        // Tabs 5-9 adicionadas nas próximas tasks
      ],
    },
  ],
};
