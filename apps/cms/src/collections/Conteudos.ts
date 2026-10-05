import type { CollectionConfig } from "payload";

import { BlockquoteFeature, lexicalEditor } from "@payloadcms/richtext-lexical";

import { categoriaParaSegmento, CONTEUDO_CATEGORIA, rotuloCategoria } from "@ntc/lib";

import { editorInstitucional } from "../access/editorInstitucional";
import { autoSlug } from "../hooks/autoSlug";
import { derivarTempoLeitura } from "../hooks/tempoLeitura";
import { lexicalRestrictiveFeatures } from "../shared/lexical-config";
import { seoFields } from "../shared/seoFields";

/**
 * Conteúdos editoriais (doc 11 §9).
 *
 * Artigos, estudos, notas técnicas, webinars, materiais e notícias.
 * Categoria define a renderização no front e disponibilidade do anexo.
 */
export const Conteudos: CollectionConfig = {
  slug: "conteudos",
  labels: { singular: "Conteúdo", plural: "Conteúdos" },
  admin: {
    useAsTitle: "titulo",
    defaultColumns: ["titulo", "categoria", "area", "dataPublicacao", "destaque", "_status"],
    group: "Editorial",
    listSearchableFields: ["titulo", "slug"],
  },
  access: {
    read: () => true,
    create: editorInstitucional,
    update: editorInstitucional,
    delete: editorInstitucional,
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: {
    beforeChange: [derivarTempoLeitura],
    afterChange: [
      async ({ doc }) => {
        if (process.env.NODE_ENV !== "production") return doc;
        const frontUrl = process.env.PAYLOAD_PUBLIC_FRONT_URL;
        const secret = process.env.REVALIDATE_SECRET;
        if (!frontUrl || !secret) {
          console.warn("[Conteudos] PAYLOAD_PUBLIC_FRONT_URL ou REVALIDATE_SECRET ausentes.");
          return doc;
        }
        // O caminho da página de leitura depende da categoria, então este
        // hook monta o path em vez de usar revalidatePage(":slug").
        const paths = ["/conteudos"];
        if (typeof doc?.categoria === "string" && typeof doc?.slug === "string") {
          paths.push(`/conteudos/${categoriaParaSegmento(doc.categoria)}/${doc.slug}`);
        }
        await Promise.allSettled(
          paths.map(async (path) => {
            try {
              await fetch(`${frontUrl}/api/revalidate`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-Revalidate-Secret": secret },
                body: JSON.stringify({ path }),
              });
            } catch (e) {
              console.error(`[Conteudos] Falha ao revalidar ${path}`, e);
            }
          }),
        );
        return doc;
      },
    ],
  },
  fields: [
    { name: "titulo", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("titulo")] },
    },
    {
      name: "categoria",
      type: "select",
      options: CONTEUDO_CATEGORIA.map((c) => ({ label: rotuloCategoria(c), value: c })),
      required: true,
      index: true,
    },
    { name: "area", type: "relationship", relationTo: "areas" },
    { name: "lide", type: "textarea", required: true, maxLength: 280 },
    { name: "imagemDestaque", type: "upload", relationTo: "media" },
    {
      name: "corpo",
      type: "richText",
      required: true,
      editor: lexicalEditor({
        features: () => [...lexicalRestrictiveFeatures, BlockquoteFeature()],
      }),
    },
    {
      name: "autor",
      type: "relationship",
      relationTo: "especialistas",
      hasMany: true,
    },
    {
      name: "dataPublicacao",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
    },
    {
      name: "assinatura",
      type: "text",
      admin: {
        description:
          "Assinatura institucional (ex.: Curadoria NTC Saúde). Use quando o conteúdo não é assinado por um especialista do corpo docente.",
      },
    },
    {
      name: "destaque",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Aparece na seção Destaques de /conteudos (os 3 mais recentes)." },
    },
    {
      name: "anunciarEmPreparacao",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          'Enquanto rascunho, aparece no site como "Em preparação editorial", sem link. Ignorado depois de publicado.',
      },
    },
    {
      name: "tempoLeituraMin",
      type: "number",
      admin: { readOnly: true, description: "Calculado a partir do corpo." },
    },
    {
      name: "linkExterno",
      type: "text",
      admin: { description: "URL do webinar gravado ou do material hospedado fora (opcional)." },
      validate: (valor: unknown) => {
        if (valor === null || valor === undefined || valor === "") return true;
        if (typeof valor === "string" && /^https?:\/\//i.test(valor.trim())) return true;
        return "Informe uma URL começando com http:// ou https://.";
      },
    },
    {
      name: "anexoDownload",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (d) => d?.categoria === "material" || d?.categoria === "estudo",
      },
    },
    {
      name: "conteudosRelacionados",
      type: "relationship",
      relationTo: "conteudos",
      hasMany: true,
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
    },
    ...seoFields,
  ],
};
