import { acessoPorTela } from "../access/porTela";
import type { CollectionConfig } from "payload";

import { autoSlug } from "../hooks/autoSlug";
import { bloquearProgramaComDependentes } from "../lib/crm/exclusaoCatalogo";
import { seoFields } from "../shared/seoFields";
import { leituraPublica } from "../access/leituraPublica";
import { ctaHrefPermitido } from "../lib/cms/cardsCorpoDocente";
import type { Field } from "payload";


const MARCACAO = "Marcação leve: **negrito** e *itálico*.";

const IDENTIDADES = [
  "vertente", "AGIP", "EDUTEC", "EGIDE", "FUTURA", "LIDERA", "PEAR", "PEI",
  "PINEI", "PROAPS", "PROGE", "PROGIR", "PROSUS", "SIGA", "SIGS", "VIVAESCOLA",
];

const campoImagemDocente = (): Field[] => [
  { name: "imagem", type: "upload", relationTo: "media", label: "Imagem" },
  { name: "imagemCaminho", type: "text", label: "Caminho da imagem (/img/…)" },
  { name: "imagemAlt", type: "text", label: "Texto alternativo da imagem" },
  { name: "eixoBadge", type: "text", label: "Selo do eixo" },
  { name: "nome", type: "text", label: "Nome" },
  { name: "credencial", type: "textarea", label: "Credencial" },
];

const validarCtaHref = (valor: string | null | undefined): true | string =>
  !valor || ctaHrefPermitido(valor)
    ? true
    : "O link deve começar com /, #, http://, https:// ou mailto:.";

/** Aba "Página do site": textos e dados da página pública do programa. Tudo opcional. */
const abaPaginaDoSite = {
  label: "Página do site",
  fields: [
    {
      name: "pagina",
      type: "group",
      label: "Página do site",
      fields: [
        {
          name: "identidadeVisual",
          type: "select",
          label: "Identidade visual",
          defaultValue: "vertente",
          options: IDENTIDADES.map((v) => ({ label: v === "vertente" ? "Pela vertente" : v, value: v })),
        },
        { name: "heroTitulo", type: "text", label: "Título do topo", admin: { description: MARCACAO } },
        { name: "heroSubtitulo", type: "textarea", label: "Subtítulo do topo" },
        { name: "heroImagem", type: "upload", relationTo: "media", label: "Imagem do topo" },
        { name: "heroImagemCaminho", type: "text", label: "Caminho da imagem do topo (/img/…)" },
        {
          name: "barraDados",
          type: "array",
          label: "Barra de dados",
          fields: [
            { name: "rotulo", type: "text", label: "Rótulo" },
            { name: "valor", type: "text", label: "Valor" },
            { name: "valorSub", type: "text", label: "Complemento do valor" },
          ],
        },
        { name: "visaoGeralTitulo", type: "text", label: "Título da Visão Geral", admin: { description: MARCACAO } },
        { name: "problemaTitulo", type: "text", label: "Título do Problema", admin: { description: MARCACAO } },
        { name: "problemaDestaque", type: "text", label: "Destaque do Problema", admin: { description: MARCACAO } },
        {
          name: "publicoChips",
          type: "array",
          label: "Chips do público-alvo",
          fields: [{ name: "texto", type: "text", label: "Texto" }],
        },
        {
          name: "docentes",
          type: "group",
          label: "Docentes (página)",
          fields: [
            { name: "titulo", type: "text", label: "Título", admin: { description: MARCACAO } },
            { name: "intro", type: "textarea", label: "Introdução", admin: { description: MARCACAO } },
            { name: "coordenacaoMarcador", type: "text", label: "Marcador da coordenação" },
            { name: "especialistasMarcador", type: "text", label: "Marcador dos especialistas" },
            {
              name: "contadores",
              type: "array",
              label: "Contadores",
              fields: [
                { name: "num", type: "text", label: "Número" },
                { name: "lbl", type: "text", label: "Legenda" },
              ],
            },
            { name: "nota", type: "textarea", label: "Nota" },
            {
              name: "coordenacao",
              type: "array",
              label: "Coordenação científica",
              fields: [
                { name: "tag", type: "text", label: "Etiqueta" },
                ...campoImagemDocente(),
                { name: "eixo", type: "text", label: "Eixo" },
                { name: "modulos", type: "text", label: "Módulos" },
              ],
            },
            {
              name: "especialistas",
              type: "array",
              label: "Especialistas",
              fields: [
                ...campoImagemDocente(),
                { name: "modulos", type: "text", label: "Módulos" },
              ],
            },
          ],
        },
        { name: "modalidadesIntro", type: "textarea", label: "Introdução das modalidades" },
        {
          name: "modalidadesCards",
          type: "array",
          label: "Cartões de modalidades",
          fields: [
            { name: "destaque", type: "checkbox", label: "Destaque" },
            { name: "tag", type: "text", label: "Etiqueta" },
            { name: "titulo", type: "text", label: "Título" },
            { name: "descricao", type: "textarea", label: "Descrição" },
            { name: "ctaRotulo", type: "text", label: "Rótulo do botão" },
            { name: "ctaHref", type: "text", label: "Link do botão", validate: validarCtaHref },
          ],
        },
        { name: "modulosAbertosMicrocopy", type: "textarea", label: "Texto dos módulos abertos" },
        { name: "chamadaFinalTitulo", type: "text", label: "Título da chamada final", admin: { description: MARCACAO } },
        { name: "chamadaFinalTexto", type: "textarea", label: "Texto da chamada final" },
        {
          name: "resumoLateral",
          type: "array",
          label: "Resumo lateral",
          fields: [
            { name: "rotulo", type: "text", label: "Rótulo" },
            { name: "valor", type: "text", label: "Valor" },
          ],
        },
        {
          name: "entregas",
          type: "array",
          label: "Entregas",
          fields: [{ name: "texto", type: "text", label: "Texto" }],
        },
        {
          name: "cartao",
          type: "group",
          label: "Cartão (listas e menus)",
          fields: [
            { name: "nome", type: "text", label: "Nome" },
            { name: "tagline", type: "text", label: "Chamada" },
            { name: "meta", type: "text", label: "Meta" },
            { name: "imagem", type: "upload", relationTo: "media", label: "Imagem" },
            { name: "imagemCaminho", type: "text", label: "Caminho da imagem (/img/…)" },
            { name: "ordem", type: "number", label: "Ordem" },
          ],
        },
      ],
    },
  ],
} as const;

/**
 * Programas Estratégicos (doc 11 §5).
 *
 * Quinze instâncias previstas (doc 11 §18 — lista canônica até confirmação
 * via skill ntc-grupo · CLAUDE.md §17 pendência 11). Schema rico, espelha o
 * template editorial do folder de programa institucional.
 */
export const Programas: CollectionConfig = {
  slug: "programas",
  labels: { singular: "Programa Estratégico", plural: "Programas Estratégicos" },
  admin: {
    useAsTitle: "nomeCompleto",
    defaultColumns: ["sigla", "nomeCompleto", "area", "_status"],
    group: "Editorial",
    listSearchableFields: ["sigla", "nomeCompleto", "slug"],
  },
  access: {
    read: leituraPublica(),
    create: acessoPorTela(["crm.programas"]),
    update: acessoPorTela(["crm.programas"]),
    delete: acessoPorTela(["crm.programas"]),
  },
  versions: { drafts: true, maxPerDoc: 30 },
  hooks: { beforeDelete: [bloquearProgramaComDependentes] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identificação",
          fields: [
            {
              name: "sigla",
              type: "text",
              required: true,
              unique: true,
              admin: { description: "Ex.: PROGE, EDUTEC, PROSUS+" },
            },
            { name: "nomeCompleto", type: "text", required: true },
            { name: "eyebrow", type: "text", label: "Eyebrow editorial" },
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
              // Opcional desde 05/10/2026: o CRM cria programas sem imagem, e o
              // site não lê programas do CMS. Sem push de schema — coleção com
              // drafts já tem a coluna nullable no banco.
            },
            {
              name: "lockupSvg",
              type: "upload",
              relationTo: "media",
              admin: { description: "Lockup SVG vertical do programa." },
            },
          ],
        },
        {
          label: "Visão Geral",
          fields: [
            { name: "cargaHorariaTotal", type: "text", required: true },
            { name: "modulosQuantidade", type: "number" },
            { name: "visaoGeral", type: "richText", required: true },
            { name: "problema", type: "richText" },
            { name: "objetivo", type: "richText" },
            { name: "metodologia", type: "richText" },
            { name: "publicoAlvo", type: "richText" },
          ],
        },
        {
          label: "Eixos e Resultados",
          fields: [
            {
              name: "eixosTematicos",
              type: "array",
              fields: [
                { name: "titulo", type: "text", required: true },
                { name: "descricao", type: "textarea", required: true },
              ],
            },
            {
              name: "resultadosEsperados",
              type: "array",
              fields: [{ name: "resultado", type: "textarea", required: true }],
            },
            {
              name: "diferenciais",
              type: "array",
              fields: [
                { name: "titulo", type: "text", required: true },
                { name: "descricao", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Coordenação e Docentes",
          fields: [
            {
              name: "coordenacaoCientifica",
              type: "relationship",
              relationTo: "especialistas",
              hasMany: true,
            },
            {
              name: "docentes",
              type: "relationship",
              relationTo: "especialistas",
              hasMany: true,
            },
          ],
        },
        {
          label: "Modalidades",
          fields: [
            {
              name: "modalidadesEntrega",
              type: "array",
              fields: [
                {
                  name: "tipo",
                  type: "select",
                  options: [
                    { label: "in-company", value: "in-company" },
                    { label: "turma-aberta", value: "turma-aberta" },
                    { label: "sob-medida", value: "sob-medida" },
                    { label: "hibrida", value: "hibrida" },
                  ],
                  required: true,
                },
                { name: "descricao", type: "textarea" },
              ],
            },
            {
              name: "contratacaoInstitucional",
              type: "group",
              fields: [
                { name: "disponivel", type: "checkbox", defaultValue: true },
                { name: "observacoes", type: "textarea" },
              ],
            },
          ],
        },
        abaPaginaDoSite as unknown as { label: string; fields: Field[] },
        {
          label: "FAQ e Relacionados",
          fields: [
            {
              name: "faq",
              type: "array",
              fields: [
                { name: "pergunta", type: "text", required: true },
                { name: "resposta", type: "richText", required: true },
              ],
            },
            {
              name: "programasRelacionados",
              type: "relationship",
              relationTo: "programas",
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
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
      hooks: { beforeChange: [autoSlug("nomeCompleto")] },
    },
    ...seoFields,
  ],
};
