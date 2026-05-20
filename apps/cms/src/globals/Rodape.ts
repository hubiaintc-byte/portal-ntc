import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global Rodapé (doc 11 §14).
 *
 * Singleton com identidade institucional do rodapé — assinatura, contatos,
 * redes sociais, links legais (LGPD obrigatórios) e dados corporativos.
 */
export const Rodape: GlobalConfig = {
  slug: "rodape",
  label: "Rodapé Institucional",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  fields: [
    {
      name: "assinaturaInstitucional",
      type: "text",
      defaultValue: "Inteligência institucional. Impacto real.",
    },
    { name: "enderecoCompleto", type: "textarea" },
    { name: "emailInstitucional", type: "email", required: true },
    { name: "emailImprensa", type: "email" },
    { name: "emailParcerias", type: "email" },
    { name: "emailDpo", type: "email" },
    { name: "telefoneInstitucional", type: "text" },
    { name: "whatsappInstitucional", type: "text" },
    {
      name: "redesSociais",
      type: "array",
      fields: [
        {
          name: "rede",
          type: "select",
          options: ["linkedin", "instagram", "youtube", "facebook", "x", "tiktok"].map((r) => ({
            label: r,
            value: r,
          })),
        },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "linksLegais",
      type: "array",
      fields: [
        { name: "rotulo", type: "text", required: true },
        { name: "link", type: "text", required: true },
      ],
      defaultValue: [
        { rotulo: "Política de Privacidade", link: "/politica-de-privacidade" },
        { rotulo: "Termos de Uso", link: "/termos-de-uso" },
        { rotulo: "LGPD — Solicitar Exclusão", link: "/lgpd/solicitar-exclusao" },
      ],
    },
    { name: "cnpj", type: "text" },
    { name: "razaoSocial", type: "text" },
  ],
};
