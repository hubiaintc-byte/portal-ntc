import type { Field } from "payload";

/**
 * Campos de SEO reutilizáveis (doc 11 §17).
 *
 * Anexáveis a qualquer coleção editorial. Quando vazios, o sistema usa
 * fallback editorial — título da entidade, descrição derivada, primeira
 * imagem com role de hero etc. Limites de tamanho seguem boas práticas
 * de SERP/Open Graph.
 */
export const seoFields: Field[] = [
  {
    name: "seo",
    type: "group",
    label: "SEO",
    admin: {
      description:
        "Campos opcionais — quando vazios, o sistema usa fallback editorial automaticamente.",
    },
    fields: [
      {
        name: "tituloSeo",
        type: "text",
        maxLength: 60,
        admin: {
          description: "Título usado na SERP e em Open Graph. Máx. 60 caracteres.",
        },
      },
      {
        name: "descricaoSeo",
        type: "textarea",
        maxLength: 160,
        admin: {
          description: "Meta description e Open Graph description. Máx. 160 caracteres.",
        },
      },
      {
        name: "imagemOg",
        type: "upload",
        relationTo: "media",
        admin: {
          description: "Imagem Open Graph (1200×630 recomendado).",
        },
      },
    ],
  },
];
