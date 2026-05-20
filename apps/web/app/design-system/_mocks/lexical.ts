import type { RichTextContent } from "@ntc/ui";

export const LEXICAL_DEMO: RichTextContent = {
  root: {
    type: "root",
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
        direction: "ltr",
        format: "",
        indent: 0,
        children: [
          { type: "text", version: 1, text: "O Grupo NTC opera em ", format: 0, detail: 0, mode: "normal", style: "" },
          { type: "text", version: 1, text: "três verticais", format: 1, detail: 0, mode: "normal", style: "" },
          { type: "text", version: 1, text: " — Educação, Gestão Pública e Saúde — com método editorial e currículos próprios.", format: 0, detail: 0, mode: "normal", style: "" },
        ],
      },
      {
        type: "heading", version: 1, tag: "h3", direction: "ltr", format: "", indent: 0,
        children: [{ type: "text", version: 1, text: "Princípios editoriais", format: 0, detail: 0, mode: "normal", style: "" }],
      },
      {
        type: "list", version: 1, tag: "ul", listType: "bullet", start: 1, direction: "ltr", format: "", indent: 0,
        children: [
          {
            type: "listitem", version: 1, value: 1, direction: "ltr", format: "", indent: 0,
            children: [{ type: "text", version: 1, text: "Currículos derivados de governança real, não de modismo.", format: 0, detail: 0, mode: "normal", style: "" }],
          },
          {
            type: "listitem", version: 1, value: 2, direction: "ltr", format: "", indent: 0,
            children: [{ type: "text", version: 1, text: "Corpo docente sênior com experiência operacional pública.", format: 0, detail: 0, mode: "normal", style: "" }],
          },
        ],
      },
      {
        type: "paragraph", version: 1, direction: "ltr", format: "", indent: 0,
        children: [
          { type: "text", version: 1, text: "Saiba mais sobre o método em ", format: 0, detail: 0, mode: "normal", style: "" },
          {
            type: "link", version: 1,
            fields: { url: "/o-grupo", linkType: "custom", newTab: false },
            direction: "ltr", format: "", indent: 0,
            children: [{ type: "text", version: 1, text: "nossa página institucional", format: 0, detail: 0, mode: "normal", style: "" }],
          },
          { type: "text", version: 1, text: ".", format: 0, detail: 0, mode: "normal", style: "" },
        ],
      },
    ],
  },
} as RichTextContent;
