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
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text", required: true },
        { name: "subtitulo", type: "textarea" },
        { name: "imagem", type: "upload", relationTo: "media", required: true },
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
