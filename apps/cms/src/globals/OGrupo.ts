import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global "O Grupo NTC" (doc 13 §2.2).
 *
 * Singleton da página `/o-grupo` — isolado do Global Home para permitir
 * que a equipe editorial publique a apresentação institucional sem
 * tocar na Home. Todos os campos opcionais — a página /o-grupo aplica
 * fallback gracioso (oculta a seção) quando o campo está vazio.
 */
export const OGrupo: GlobalConfig = {
  slug: "o-grupo",
  label: "O Grupo NTC",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text" },
        { name: "subtitulo", type: "textarea" },
        { name: "imagem", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "apresentacao",
      type: "richText",
      label: "Apresentação institucional",
      admin: { description: "Quem somos. Texto editorial curto, 2-3 parágrafos." },
    },
    {
      name: "trajetoria",
      type: "richText",
      label: "Trajetória",
      admin: { description: "Origens, marcos e evolução." },
    },
    {
      name: "posicionamento",
      type: "richText",
      label: "Posicionamento editorial",
      admin: { description: "Onde nos colocamos diante do ecossistema público." },
    },
    {
      name: "numerosImpacto",
      type: "array",
      maxRows: 4,
      label: "Números de impacto",
      fields: [
        { name: "valor", type: "text", required: true },
        { name: "rotulo", type: "text", required: true },
      ],
    },
    {
      name: "metodologia",
      type: "richText",
      label: "Metodologia",
      admin: { description: "Como entregamos. Pilares, princípios, abordagem." },
    },
    {
      name: "especialistasDestaque",
      type: "relationship",
      relationTo: "especialistas",
      hasMany: true,
      maxDepth: 1,
      admin: {
        description:
          "Especialistas exibidos em destaque no /o-grupo. Em vazio, a seção é omitida.",
      },
    },
    {
      name: "clientesDestaque",
      type: "relationship",
      relationTo: "clientes",
      hasMany: true,
      admin: {
        description:
          "Clientes exibidos em destaque no /o-grupo. Em vazio, a seção é omitida.",
      },
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
