import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { ESTAGIOS_LEAD, MOTIVOS_PERDA, ORIGENS_ENTRADA_LEAD } from "@ntc/lib";

import { atendimentoComercial } from "../access/atendimentoComercial";
import { casarClienteDoLead } from "../lib/crm/casamento";
import { registrarLeadNaLinhaDoTempo } from "../lib/crm/linhaDoTempo";
import { ESFERA_INSTITUCIONAL, LEAD_TIPO } from "../shared/types";

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
 * Access (DAB §10.1): todas as operações, inclusive `create`, exigem
 * `atendimento-comercial` ou `super-admin`. Os 4 handlers do site
 * (`apps/web/app/api/forms/*`) criam leads pela Local API
 * (`obterPayload().create`), que roda com `overrideAccess: true` por padrão
 * e por isso não passa por esta regra. O `create` via REST (`POST /api/leads`)
 * ficava público até a Sessão 1 do kanban; com os campos do CRM (`cliente`,
 * `estagio`, `valorEstimado`…) e os hooks de casamento/linha do tempo agora
 * alcançáveis pelo create, ele passou a ser restrito aos perfis do CRM —
 * um anônimo não pode mais escrever na linha do tempo de um cliente qualquer
 * nem criar clientes em massa sem captcha/rate limit.
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    useAsTitle: "identificacao",
    defaultColumns: ["identificacao", "tipo", "estagio", "createdAt"],
    group: "Comercial",
    listSearchableFields: ["email", "nome", "instituicao"],
  },
  access: {
    read: atendimentoComercial,
    create: atendimentoComercial,
    update: atendimentoComercial,
    delete: atendimentoComercial,
  },
  fields: [
    {
      name: "tipo",
      type: "select",
      options: LEAD_TIPO.map((t) => ({ label: t, value: t })),
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: "identificacao", type: "text", admin: { hidden: true } },
    { name: "observacoesInternas", type: "textarea" },

    // ---- CRM (spec 2026-09-15 §3.1): o lead é o card do kanban ------------
    {
      name: "estagio",
      type: "select",
      options: ESTAGIOS_LEAD,
      defaultValue: "lead",
      required: true,
      index: true,
      admin: { description: "Coluna do kanban comercial." },
    },
    { name: "perdido", type: "checkbox", defaultValue: false, index: true },
    { name: "motivoPerda", type: "select", options: MOTIVOS_PERDA },
    { name: "perdidoEm", type: "date" },
    { name: "detalhePerda", type: "text" },
    { name: "cliente", type: "relationship", relationTo: "clientes-crm", index: true },
    {
      name: "clienteCasadoPor",
      type: "select",
      options: [
        { label: "CNPJ", value: "cnpj" },
        { label: "Domínio do e-mail", value: "dominio" },
        { label: "Nome do órgão", value: "nome" },
        { label: "Cliente criado a partir do lead", value: "criado" },
        { label: "Vínculo manual", value: "manual" },
      ],
    },
    { name: "responsavel", type: "relationship", relationTo: "users" },
    { name: "valorEstimado", type: "number", min: 0 },
    { name: "dataPrevistaEvento", type: "date" },
    { name: "observacoes", type: "textarea" },
    {
      name: "origemEntrada",
      type: "select",
      options: ORIGENS_ENTRADA_LEAD,
      defaultValue: "site",
      required: true,
    },

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
    afterChange: [casarClienteDoLead, registrarLeadNaLinhaDoTempo],
  },
};
