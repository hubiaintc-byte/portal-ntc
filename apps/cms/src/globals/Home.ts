import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global Home (doc 11 §13).
 *
 * Singleton da página inicial. Estrutura fixa (hero, destaques, áreas em foco,
 * eventos da agenda, números, clientes, CTA institucional). Versions com
 * drafts habilitados — equipe editorial publica sob revisão.
 */
export const Home: GlobalConfig = {
  slug: "home",
  label: "Home (Página Inicial)",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      name: "hero",
      type: "group",
      admin: {
        description:
          "Hero único, usado APENAS como fallback quando heroSlider não tem slides preenchidos. A Home v3 Premium usa heroSlider.",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text" },
        { name: "subtitulo", type: "textarea" },
        { name: "imagem", type: "upload", relationTo: "media" },
        {
          name: "ctas",
          type: "array",
          maxRows: 2,
          fields: [
            { name: "rotulo", type: "text", required: true },
            { name: "link", type: "text", required: true },
            {
              name: "variante",
              type: "select",
              options: ["primario", "secundario"].map((v) => ({ label: v, value: v })),
            },
          ],
        },
      ],
    },
    {
      name: "heroSlider",
      type: "group",
      label: "Hero Slider Premium",
      admin: {
        description:
          "Vitrine editorial da Home v3 Premium (até 6 slides com autoplay 7s e parallax). Quando há ao menos 1 slide preenchido, este slider substitui o hero único acima.",
      },
      fields: [
        {
          name: "intervaloMs",
          type: "number",
          defaultValue: 7000,
          admin: {
            description:
              "Intervalo de troca de slides em milissegundos. Padrão 7000 (7s). Mínimo 3000 por acessibilidade (WCAG 2.2.2).",
          },
          min: 3000,
        },
        {
          name: "slides",
          type: "array",
          maxRows: 6,
          admin: {
            description:
              "Cada slide herda o vocabulário de doc 13 §2.1 — tipo, eyebrow, título (com sintaxe <accent>palavra</accent> para destaque dourado italic), subtítulo, pílula de evento opcional, CTAs (até 3).",
          },
          fields: [
            {
              name: "tipo",
              type: "select",
              required: true,
              options: ["institucional", "evento", "programa", "solucao", "eventon"].map((t) => ({
                label: t,
                value: t,
              })),
            },
            { name: "imagem", type: "upload", relationTo: "media", required: true },
            { name: "eyebrow", type: "text", required: true },
            {
              name: "titulo",
              type: "text",
              required: true,
              admin: {
                description:
                  "Use <accent>palavra</accent> para marcar a palavra ou expressão destacada em dourado italic. Ex.: 'Capacitações <accent>sob medida</accent> para a sua instituição.'",
              },
            },
            { name: "subtitulo", type: "textarea", required: true },
            {
              name: "eventoPill",
              type: "group",
              admin: {
                description:
                  "Pílula de resumo de evento (data, local, modalidade). Preencha apenas em slides com tipo=evento.",
              },
              fields: [
                { name: "data", type: "text" },
                { name: "local", type: "text" },
                { name: "modalidade", type: "text" },
              ],
            },
            {
              name: "ctas",
              type: "array",
              maxRows: 3,
              fields: [
                { name: "rotulo", type: "text", required: true },
                { name: "link", type: "text", required: true },
                {
                  name: "variante",
                  type: "select",
                  defaultValue: "primario",
                  options: ["primario", "secundario", "textlink"].map((v) => ({
                    label: v,
                    value: v,
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "destaquesEditoriais",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "titulo", type: "text", required: true },
        { name: "resumo", type: "textarea", required: true },
        { name: "imagem", type: "upload", relationTo: "media", required: true },
        { name: "link", type: "text", required: true },
        { name: "eyebrow", type: "text" },
      ],
    },
    {
      name: "areasEmFoco",
      type: "relationship",
      relationTo: "areas",
      hasMany: true,
      maxDepth: 1,
    },
    {
      name: "eventosAgendaDestaque",
      type: "relationship",
      relationTo: "eventos",
      hasMany: true,
      admin: { description: "Eventos exibidos na seção de agenda da Home." },
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
      name: "clientesDestaque",
      type: "relationship",
      relationTo: "clientes",
      hasMany: true,
    },
    {
      name: "ctaInstitucional",
      type: "group",
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
        { name: "rotuloCta", type: "text" },
        { name: "linkCta", type: "text" },
      ],
    },
  ],
};
