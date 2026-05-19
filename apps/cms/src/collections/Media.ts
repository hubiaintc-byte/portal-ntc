import type { CollectionConfig } from "payload";

/**
 * Coleção Media — base para uploads do Portal Grupo NTC.
 *
 * Servida via Supabase Storage (S3-compat) configurado no payload.config.ts.
 * Próxima janela: campos editoriais (creditoFoto, areaTematica, alt em
 * múltiplos idiomas) e organização em pastas conforme DAB §4 (Bloco 3 — Mídia).
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "filename",
  },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/svg+xml",
      "application/pdf",
      "video/mp4",
      "video/webm",
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description:
          "Descrição alternativa para acessibilidade (WCAG 2.1 AA · CLAUDE.md §10). Imagens decorativas devem usar string vazia.",
      },
    },
  ],
};
