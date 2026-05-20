import type { Block } from "payload";

/**
 * Blocks editoriais reutilizáveis (doc 11 §15).
 *
 * Composição editorial controlada para páginas que precisam de flexibilidade
 * sem comprometer a identidade Soberana 2026 (CLAUDE.md §3). Variantes de
 * estilo são enums fechados — nada de texto livre para classe CSS.
 */

export const blocoTexto: Block = {
  slug: "blocoTexto",
  labels: { singular: "Bloco · Texto", plural: "Blocos · Texto" },
  fields: [
    { name: "titulo", type: "text" },
    { name: "corpo", type: "richText", required: true },
  ],
};

export const blocoCitacao: Block = {
  slug: "blocoCitacao",
  labels: { singular: "Bloco · Citação", plural: "Blocos · Citação" },
  fields: [
    { name: "citacao", type: "textarea", required: true },
    { name: "autoria", type: "text", required: true },
  ],
};

export const blocoImagemLegenda: Block = {
  slug: "blocoImagemLegenda",
  labels: { singular: "Bloco · Imagem com Legenda", plural: "Blocos · Imagem com Legenda" },
  fields: [
    { name: "imagem", type: "upload", relationTo: "media", required: true },
    { name: "legenda", type: "text" },
    { name: "credito", type: "text" },
  ],
};

export const blocoNumeros: Block = {
  slug: "blocoNumeros",
  labels: { singular: "Bloco · Números", plural: "Blocos · Números" },
  fields: [
    { name: "titulo", type: "text" },
    {
      name: "numeros",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "valor", type: "text", required: true },
        { name: "rotulo", type: "text", required: true },
      ],
    },
  ],
};

export const blocoCtaInstitucional: Block = {
  slug: "blocoCtaInstitucional",
  labels: { singular: "Bloco · CTA Institucional", plural: "Blocos · CTA Institucional" },
  fields: [
    { name: "titulo", type: "text", required: true },
    { name: "descricao", type: "textarea" },
    { name: "rotuloCta", type: "text", required: true },
    { name: "linkCta", type: "text", required: true },
    {
      name: "variante",
      type: "select",
      options: ["oxford", "cardeal", "oliva", "neutro"].map((v) => ({ label: v, value: v })),
    },
  ],
};

export const blocksEditoriais = [
  blocoTexto,
  blocoCitacao,
  blocoImagemLegenda,
  blocoNumeros,
  blocoCtaInstitucional,
];
