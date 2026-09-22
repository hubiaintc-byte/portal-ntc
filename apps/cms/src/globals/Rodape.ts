import type { GlobalConfig } from "payload";

import { VERTICAIS_CONTATO } from "@ntc/lib";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global Rodapé (doc 11 §14).
 *
 * Singleton com identidade institucional do rodapé — assinatura, contatos,
 * redes sociais, links legais (LGPD obrigatórios) e dados corporativos.
 */
export const Rodape: GlobalConfig = {
  slug: "rodape",
  label: "Contatos institucionais",
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
    { name: "emailSuporte", type: "email" },
    { name: "emailEventos", type: "email" },
    {
      name: "verticais",
      type: "array",
      label: "Coordenações por vertical",
      maxRows: 3,
      fields: [
        {
          name: "vertical",
          type: "select",
          required: true,
          options: VERTICAIS_CONTATO.map((v) => ({ label: v.rotulo, value: v.valor })),
        },
        // Opcional de propósito: a tela de Configurações grava sempre as 3
        // linhas de VERTICAIS_CONTATO, mesmo em branco, e o site já cobre a
        // ausência pelo fallback (`mesclarVerticais`, apps/web/lib/contatos.ts).
        // Com `required: true` aqui, salvar o Global antes do seed — ou
        // limpar o e-mail de uma vertical — falharia com a mensagem crua de
        // validação do Payload.
        { name: "email", type: "email" },
        { name: "opcaoTelefone", type: "text", admin: { description: 'Ex.: "opção 1"' } },
      ],
    },
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
