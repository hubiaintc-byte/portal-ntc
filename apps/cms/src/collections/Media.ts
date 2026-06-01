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
    // Variantes em proporção 20:23 (retrato de palestrante — doc 12 §324,
    // doc 11 §782, skill ntc-palestrantes). altura = largura × 23/20.
    // `withoutEnlargement: false` garante que a variante seja SEMPRE gerada
    // mesmo quando a foto original é menor que o alvo — caso contrário o
    // Sharp pula o resize e o Payload grava `url: .../null`, quebrando o
    // preview do admin (retratos verticais ~768px caíam nisso). O card no
    // front usa `object-fit: cover`, então o leve upscale não degrada.
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 460,
        position: "centre",
        withoutEnlargement: false,
      },
      {
        name: "card",
        width: 600,
        height: 690,
        position: "centre",
        withoutEnlargement: false,
      },
      {
        name: "hero",
        width: 800,
        height: 920,
        position: "centre",
        withoutEnlargement: false,
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
