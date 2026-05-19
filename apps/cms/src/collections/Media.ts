import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Coleção Media — base para uploads do Portal Grupo NTC.
 *
 * Servida via Supabase Storage (S3-compat) configurado no payload.config.ts.
 * Mídia é pública para leitura (URLs aparecem no front), mas escrita
 * restrita a editores institucionais e super-admins (DAB §10.1).
 *
 * imageSizes gerados pelo Sharp on-upload — economiza bandwidth e ajusta
 * automaticamente para `next/image` no front, que escolhe a variante via
 * `sizes` (DAB §12.3 · Inventário "ImagemSoberana").
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Mídia", plural: "Mídias" },
  admin: {
    useAsTitle: "filename",
    defaultColumns: ["filename", "alt", "credito", "updatedAt"],
    group: "Sistema",
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
    readVersions: authenticated,
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
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: undefined,
        position: "centre",
      },
      {
        name: "card",
        width: 800,
        height: undefined,
        position: "centre",
      },
      {
        name: "hero",
        width: 1600,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      label: "Texto alternativo (alt)",
      type: "text",
      required: true,
      admin: {
        description:
          "Descrição alternativa para acessibilidade (WCAG 2.1 AA · CLAUDE.md §10). Imagens decorativas devem usar string vazia.",
      },
    },
    {
      name: "credito",
      label: "Crédito",
      type: "text",
      admin: {
        description:
          'Crédito autoral exibido em legendas editoriais (ex.: "Foto: arquivo Grupo NTC").',
      },
    },
    {
      name: "arquivoOriginal",
      label: "Arquivo original do Grupo NTC",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Marque quando o arquivo foi produzido pelo Grupo NTC (não derivado de fonte externa). Útil para auditoria de uso editorial.",
      },
    },
  ],
};
