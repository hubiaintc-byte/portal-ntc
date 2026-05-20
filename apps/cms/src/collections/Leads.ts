import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { ESFERA_INSTITUCIONAL, LEAD_STATUS, LEAD_TIPO } from "../shared/types";

/**
 * Leads (doc 11 §11).
 *
 * Persiste todos os submits dos quatro formulários institucionais
 * (proposta · contato · newsletter · candidatura). Discriminator por `tipo`
 * com grupos condicionais.
 *
 * Decisão v1.1 + sessão 19/05/2026: RD Station removido (CLAUDE.md §17.6) e
 * o futuro CRM próprio será sistema à parte que consome esta coleção via API.
 * Por isso o grupo `sincronizacaoCrm` previsto no doc 11 §11 foi omitido —
 * autorização explícita do PO em 2026-05-20 (CLAUDE.md §5.1).
 *
 * `create` é público (formulários enviam via API); demais ações exigem
 * `atendimento-comercial` ou `super-admin` (DAB §10.1).
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    useAsTitle: "identificacao",
    defaultColumns: ["identificacao", "tipo", "status", "createdAt"],
    group: "Comercial",
    listSearchableFields: ["email", "nome", "instituicao"],
  },
  access: {
    read: atendimentoComercial,
    create: () => true,
    update: atendimentoComercial,
    delete: atendimentoComercial,
  },
  fields: [
    {
      name: "tipo",
      type: "select",
      options: LEAD_TIPO.map((t) => ({ label: t, value: t })),
      required: true,
      admin: { readOnly: true },
    },
    { name: "identificacao", type: "text", admin: { hidden: true } },
    {
      name: "status",
      type: "select",
      options: LEAD_STATUS.map((s) => ({ label: s, value: s })),
      defaultValue: "novo",
      required: true,
    },
    { name: "observacoesInternas", type: "textarea" },

    { name: "nome", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "telefone", type: "text" },
    { name: "cargo", type: "text" },
    { name: "instituicao", type: "text" },
    {
      name: "esfera",
      type: "select",
      options: ESFERA_INSTITUCIONAL.map((e) => ({ label: e, value: e })),
    },

    {
      name: "detalhesProposta",
      type: "group",
      admin: { condition: (data) => data?.tipo === "proposta" },
      fields: [
        { name: "programa", type: "relationship", relationTo: "programas" },
        {
          name: "modalidade",
          type: "select",
          options: ["in-company", "turma-aberta", "sob-medida", "proposta-livre"].map((m) => ({
            label: m,
            value: m,
          })),
        },
        { name: "participantesEstimados", type: "number" },
        { name: "mensagem", type: "textarea" },
      ],
    },
    {
      name: "detalhesContato",
      type: "group",
      admin: { condition: (data) => data?.tipo === "contato" },
      fields: [
        {
          name: "assunto",
          type: "select",
          options: ["imprensa", "parcerias", "fornecedor", "duvida-institucional", "outro"].map(
            (a) => ({ label: a, value: a }),
          ),
        },
        { name: "mensagem", type: "textarea" },
      ],
    },
    {
      name: "detalhesNewsletter",
      type: "group",
      admin: { condition: (data) => data?.tipo === "newsletter" },
      fields: [
        { name: "areasInteresse", type: "relationship", relationTo: "areas", hasMany: true },
      ],
    },
    {
      name: "detalhesCandidatura",
      type: "group",
      admin: { condition: (data) => data?.tipo === "candidatura" },
      fields: [
        { name: "titulacao", type: "text" },
        { name: "linhasAtuacao", type: "relationship", relationTo: "areas", hasMany: true },
        { name: "apresentacao", type: "textarea" },
        { name: "linkLattes", type: "text" },
        { name: "linkLinkedin", type: "text" },
        { name: "curriculo", type: "upload", relationTo: "media" },
      ],
    },

    {
      name: "origem",
      type: "group",
      admin: { description: "Página, referrer e UTMs no momento do submit." },
      fields: [
        { name: "paginaSubmissao", type: "text" },
        { name: "referrer", type: "text" },
        { name: "utmSource", type: "text" },
        { name: "utmMedium", type: "text" },
        { name: "utmCampaign", type: "text" },
        { name: "utmTerm", type: "text" },
        { name: "utmContent", type: "text" },
      ],
    },

    {
      name: "consentimentoLgpd",
      type: "group",
      admin: { description: "Registro do aceite LGPD (CLAUDE.md §12)." },
      fields: [
        { name: "aceito", type: "checkbox", required: true },
        { name: "timestamp", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "politicaVersao", type: "text" },
        { name: "ipSubmissao", type: "text" },
      ],
    },

    { name: "payloadBruto", type: "json", admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      (({ data }) => {
        const nome = typeof data?.nome === "string" ? data.nome : "—";
        const instituicao =
          typeof data?.instituicao === "string" && data.instituicao.length > 0
            ? data.instituicao
            : "—";
        const tipo = typeof data?.tipo === "string" ? data.tipo : "—";
        return { ...data, identificacao: `${nome} · ${instituicao} · ${tipo}` };
      }) satisfies CollectionBeforeChangeHook,
    ],
  },
};
