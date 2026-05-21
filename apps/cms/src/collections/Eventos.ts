import type { CollectionConfig } from "payload";

import { editorEventos } from "../access/editorEventos";
import { autoSlug } from "../hooks/autoSlug";
import { revalidatePage } from "../hooks/revalidatePage";
import { seoFields } from "../shared/seoFields";
import { MODALIDADE_EVENTO } from "../shared/types";

/**
 * Eventos (doc 11 §7).
 *
 * Coração operacional do portal — coleção que a equipe mais cadastra. Inclui
 * hook de revalidação on-demand (`/agenda` + `/eventos/:slug`) executado
 * apenas em produção (DAB §6 · CLAUDE.md §11).
 */
export const Eventos: CollectionConfig = {
  slug: "eventos",
  labels: { singular: "Evento", plural: "Eventos" },
  admin: {
    useAsTitle: "nome",
    defaultColumns: ["nome", "dataInicio", "modalidade", "_status"],
    group: "Editorial",
    listSearchableFields: ["nome", "slug"],
  },
  access: {
    read: () => true,
    create: editorEventos,
    update: editorEventos,
    delete: editorEventos,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    afterChange: [revalidatePage(["/agenda", "/eventos/:slug"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identificação",
          fields: [
            { name: "nome", type: "text", required: true },
            { name: "eyebrow", type: "text" },
            {
              name: "programa",
              type: "relationship",
              relationTo: "programas",
              admin: { description: "Programa do qual o evento deriva (opcional)." },
            },
            {
              name: "area",
              type: "relationship",
              relationTo: "areas",
              required: true,
            },
            {
              name: "imagemCapa",
              type: "upload",
              relationTo: "media",
              required: true,
            },
          ],
        },
        {
          label: "Data, Local e Modalidade",
          fields: [
            {
              name: "dataInicio",
              type: "date",
              required: true,
              admin: { date: { pickerAppearance: "dayAndTime" } },
            },
            {
              name: "dataFim",
              type: "date",
              admin: { date: { pickerAppearance: "dayAndTime" } },
            },
            { name: "fusoHorario", type: "text", defaultValue: "America/Sao_Paulo" },
            {
              name: "modalidade",
              type: "select",
              options: MODALIDADE_EVENTO.map((m) => ({ label: m, value: m })),
              required: true,
            },
            {
              name: "local",
              type: "group",
              admin: {
                condition: (data) => data?.modalidade !== "online",
              },
              fields: [
                { name: "nomeLocal", type: "text" },
                { name: "endereco", type: "text" },
                { name: "cidade", type: "text" },
                { name: "estado", type: "text", maxLength: 2 },
              ],
            },
            { name: "cargaHoraria", type: "text", required: true },
          ],
        },
        {
          label: "Conteúdo Editorial",
          fields: [
            { name: "resumo", type: "textarea", required: true, maxLength: 280 },
            { name: "publicoAlvo", type: "richText" },
            { name: "objetivos", type: "richText" },
            { name: "conteudoProgramatico", type: "richText" },
            {
              name: "programacaoDetalhada",
              type: "array",
              fields: [
                { name: "horario", type: "text", required: true },
                { name: "titulo", type: "text", required: true },
                { name: "descricao", type: "textarea" },
                {
                  name: "palestrante",
                  type: "relationship",
                  relationTo: "especialistas",
                  hasMany: true,
                },
              ],
            },
            {
              name: "palestrantes",
              type: "relationship",
              relationTo: "especialistas",
              hasMany: true,
            },
            {
              name: "diferenciais",
              type: "array",
              fields: [
                { name: "titulo", type: "text" },
                { name: "descricao", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Inscrição",
          fields: [
            { name: "inscricaoAberta", type: "checkbox", defaultValue: true },
            {
              name: "linkInscricaoExterna",
              type: "text",
              admin: {
                description: "URL da plataforma terceira de inscrição (v1).",
              },
            },
            {
              name: "plataformaTerceira",
              type: "select",
              options: [
                { label: "sympla", value: "sympla" },
                { label: "even3", value: "even3" },
                { label: "eventbrite", value: "eventbrite" },
                { label: "webinar-atual", value: "webinar-atual" },
                { label: "outra", value: "outra" },
              ],
              admin: {
                description: "Plataforma que processa a inscrição (provisório v1).",
              },
            },
            {
              name: "valor",
              type: "text",
              admin: {
                description: 'Ex.: "Gratuito" · "R$ 480" · "Sob proposta"',
              },
            },
            { name: "vagasLimitadas", type: "checkbox", defaultValue: false },
            {
              name: "totalVagas",
              type: "number",
              admin: { condition: (d) => Boolean(d?.vagasLimitadas) },
            },
            {
              name: "inscricaoNativa",
              type: "group",
              admin: {
                description:
                  "[Reservado v2 — OTT própria] Ativado quando plataforma própria estiver pronta.",
                hidden: true,
              },
              fields: [
                { name: "ativa", type: "checkbox", defaultValue: false },
                { name: "idEventoOTT", type: "text" },
              ],
            },
          ],
        },
        {
          label: "Pós-evento",
          fields: [
            { name: "replayDisponivel", type: "checkbox" },
            {
              name: "linkReplay",
              type: "text",
              admin: { condition: (d) => Boolean(d?.replayDisponivel) },
            },
            {
              name: "prazoReplay",
              type: "date",
              admin: { condition: (d) => Boolean(d?.replayDisponivel) },
            },
            { name: "certificadoEmitido", type: "checkbox" },
            { name: "observacoesCertificado", type: "textarea" },
          ],
        },
        {
          label: "Relacionados e FAQ",
          fields: [
            {
              name: "eventosRelacionados",
              type: "relationship",
              relationTo: "eventos",
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
            {
              name: "faq",
              type: "array",
              fields: [
                { name: "pergunta", type: "text", required: true },
                { name: "resposta", type: "richText", required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
      hooks: { beforeChange: [autoSlug("nome")] },
    },
    {
      name: "cardHome",
      type: "group",
      label: "Card na Home (porta v3 Premium)",
      admin: {
        description:
          "Campos exibidos no card da Home — formato comercial, selo de status, datas montadas, modalidade, preços e flag de destaque. Vivem fora do conteúdo editorial completo do evento.",
      },
      fields: [
        {
          name: "formato",
          type: "select",
          options: [
            "Seminário",
            "Simpósio",
            "Oficina",
            "Jornada",
            "Congresso",
            "Curso Executivo",
            "Fórum",
            "Encontro",
            "Imersão",
          ].map((f) => ({ label: f, value: f })),
        },
        {
          name: "destaque",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Quando true, o card recebe a borda dourada e o selo 'Evento em destaque' (máx. 1 por vez).",
          },
        },
        {
          name: "selo",
          type: "select",
          options: [
            { label: "Inscrições abertas", value: "inscricoes-abertas" },
            { label: "Últimas vagas", value: "ultimas-vagas" },
            { label: "Em breve", value: "em-breve" },
          ],
        },
        {
          name: "datas",
          type: "group",
          admin: {
            description:
              "Texto pré-formatado para o card (não é a data ISO do dataInicio/dataFim — esses ficam para a página interna).",
          },
          fields: [
            {
              name: "variante",
              type: "select",
              options: [
                { label: "Single (1 dia)", value: "single" },
                { label: "Range (consecutivos)", value: "range" },
                { label: "Multi (não consecutivos)", value: "multi" },
              ],
            },
            { name: "diasInicio", type: "text", admin: { description: 'Ex.: "05" ou "22"' } },
            { name: "diasFim", type: "text", admin: { description: 'Ex.: "07" ou "23"' } },
            { name: "monYr", type: "text", admin: { description: 'Ex.: "Jun · 2026"' } },
            { name: "encontros", type: "text", admin: { description: 'Ex.: "4 encontros"' } },
            { name: "periodo", type: "text", admin: { description: 'Ex.: "Jun – Jul · 2026"' } },
          ],
        },
        {
          name: "modalidadeTexto",
          type: "text",
          admin: { description: 'Ex.: "Presencial · Brasília", "Online ao vivo + replay", "Híbrido · SP".' },
        },
        {
          name: "modalidadeCor",
          type: "select",
          options: [
            { label: "Padrão (Oxford)", value: "padrao" },
            { label: "Presencial (Cardeal)", value: "presencial" },
            { label: "Híbrido (Oliva)", value: "hibrido" },
          ],
          defaultValue: "padrao",
        },
        { name: "programLink", type: "text", admin: { description: 'Ex.: "Seminário · NTC Saúde"' } },
        { name: "coordenacaoTexto", type: "textarea" },
        { name: "metaCargaHoraria", type: "text", admin: { description: 'Ex.: "20h · 3 dias"' } },
        { name: "metaLocal", type: "text", admin: { description: 'Ex.: "Brasília · DF"' } },
        { name: "programaBindingSigla", type: "text", admin: { description: 'Ex.: "PROSUS+"' } },
        { name: "precoIndividual", type: "text", admin: { description: 'Ex.: "R$ 2.890"' } },
        { name: "precoInstitucional", type: "text", defaultValue: "Sob consulta" },
        {
          name: "esMetaCompacto",
          type: "text",
          admin: {
            description:
              'Card secundário · Ex.: "Online · 12h · 2 tardes R$ 1.290" (concatena tudo em uma linha).',
          },
        },
        { name: "areaVert", type: "select", options: [{ label: "edu", value: "edu" }, { label: "gov", value: "gov" }, { label: "sau", value: "sau" }] },
      ],
    },
    ...seoFields,
  ],
};
