import type { GlobalConfig } from "payload";

import { editorInstitucional } from "../access/editorInstitucional";

/**
 * Global Home (doc 11 §13 + porta literal da
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html).
 *
 * Singleton da página inicial. Após o C5 da sessão "porta do HTML",
 * o Global passa a cobrir TODOS os textos editoriais da Home —
 * statusBar, intro, programas, curadoria, soluções, modalidades,
 * EventOn, contratação, diferenciais, números, prova institucional,
 * CTA final. Os textos vivem em groups para deixar o admin
 * navegável.
 */
export const Home: GlobalConfig = {
  slug: "home",
  label: "Home (Página Inicial)",
  admin: { group: "Páginas Singleton" },
  access: { read: () => true, update: editorInstitucional },
  versions: { drafts: true, max: 20 },
  fields: [
    {
      name: "hero",
      type: "group",
      admin: {
        description:
          "Hero único, usado APENAS como fallback quando heroSlider não tem slides preenchidos. A Home v3 Premium usa heroSlider.",
      },
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text" },
        { name: "subtitulo", type: "textarea" },
        { name: "imagem", type: "upload", relationTo: "media" },
        {
          name: "ctas",
          type: "array",
          maxRows: 2,
          fields: [
            { name: "rotulo", type: "text", required: true },
            { name: "link", type: "text", required: true },
            {
              name: "variante",
              type: "select",
              options: ["primario", "secundario"].map((v) => ({ label: v, value: v })),
            },
          ],
        },
      ],
    },
    {
      name: "heroSlider",
      type: "group",
      label: "Hero Slider Premium",
      fields: [
        {
          name: "intervaloMs",
          type: "number",
          defaultValue: 7000,
          min: 3000,
        },
        {
          name: "slides",
          type: "array",
          maxRows: 6,
          fields: [
            {
              name: "tipo",
              type: "select",
              required: true,
              options: ["institucional", "evento", "programa", "solucao", "eventon"].map((t) => ({
                label: t,
                value: t,
              })),
            },
            { name: "imagem", type: "upload", relationTo: "media", required: true },
            { name: "eyebrow", type: "text", required: true },
            {
              name: "titulo",
              type: "text",
              required: true,
              admin: {
                description:
                  "Use <accent>palavra</accent> para destaque dourado italic.",
              },
            },
            { name: "subtitulo", type: "textarea", required: true },
            {
              name: "eventoPill",
              type: "group",
              fields: [
                { name: "data", type: "text" },
                { name: "local", type: "text" },
                { name: "modalidade", type: "text" },
              ],
            },
            {
              name: "ctas",
              type: "array",
              maxRows: 3,
              fields: [
                { name: "rotulo", type: "text", required: true },
                { name: "link", type: "text", required: true },
                {
                  name: "variante",
                  type: "select",
                  defaultValue: "primario",
                  options: ["primario", "secundario", "textlink"].map((v) => ({
                    label: v,
                    value: v,
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
    // Seção Eventos com inscrições abertas
    {
      name: "statusBar",
      type: "group",
      label: "Status bar (acima de Eventos)",
      fields: [
        { name: "livePillTexto", type: "text", defaultValue: "Inscrições abertas agora" },
        { name: "atualizadoEm", type: "text", defaultValue: "Atualizado · Maio · 2026" },
      ],
    },
    {
      name: "eventosSecao",
      type: "group",
      label: "Cabeçalho da seção Eventos",
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text" },
        { name: "intro", type: "textarea" },
      ],
    },
    {
      name: "eventosPrincipais",
      type: "relationship",
      relationTo: "eventos",
      hasMany: true,
      admin: {
        description: "Até 3 eventos para a grade principal (cards grandes).",
      },
    },
    {
      name: "eventosSecundarios",
      type: "relationship",
      relationTo: "eventos",
      hasMany: true,
      admin: {
        description: "Até 3 eventos para a grade secundária (cards horizontais).",
      },
    },
    {
      name: "agendaBand",
      type: "group",
      label: "Faixa Agenda Geral NTC",
      fields: [
        { name: "titulo", type: "text", defaultValue: "Agenda Geral NTC" },
        { name: "descricao", type: "textarea" },
        {
          name: "chips",
          type: "array",
          maxRows: 12,
          fields: [{ name: "rotulo", type: "text", required: true }],
        },
        { name: "ctaRotulo", type: "text", defaultValue: "Ver agenda completa" },
        { name: "ctaLink", type: "text", defaultValue: "#capacitacao" },
      ],
    },
    // Apresentação institucional enxuta
    {
      name: "introCurta",
      type: "group",
      label: "Apresentação institucional enxuta (#sobre)",
      fields: [
        { name: "headline", type: "textarea" },
        { name: "corpo", type: "textarea" },
        {
          name: "highlights",
          type: "array",
          maxRows: 3,
          fields: [
            { name: "num", type: "text", required: true },
            { name: "numEhTexto", type: "checkbox", defaultValue: false },
            { name: "lbl", type: "textarea", required: true },
          ],
        },
        { name: "linkRotulo", type: "text", defaultValue: "Conheça o Grupo NTC" },
        { name: "linkHref", type: "text", defaultValue: "#sobre" },
      ],
    },
    // Programas — cabeçalho da seção e ponteiro para 6 em evidência
    {
      name: "programasSecao",
      type: "group",
      label: "Cabeçalho da seção Programas",
      fields: [
        { name: "eyebrow", type: "text" },
        { name: "titulo", type: "text" },
        { name: "intro", type: "textarea" },
        { name: "introLinha", type: "text", defaultValue: "Camada institucional · três áreas estratégicas" },
        { name: "evidenciaTitulo", type: "text", defaultValue: "Programas em evidência" },
        { name: "evidenciaSub", type: "text", defaultValue: "Seleção comercial · Atualizado para Maio · 2026" },
      ],
    },
    {
      name: "programasEmEvidencia",
      type: "relationship",
      relationTo: "programas",
      hasMany: true,
      admin: {
        description: "Até 6 programas exibidos na grade 'Programas em evidência'.",
      },
    },
    {
      name: "areasEmFoco",
      type: "relationship",
      relationTo: "areas",
      hasMany: true,
      maxDepth: 1,
    },
    // Curadoria científica
    {
      name: "curadoria",
      type: "group",
      label: "Curadoria científica · Corpo docente",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Curadoria científica · Corpo docente" },
        { name: "headlineBold", type: "text" },
        { name: "subhead", type: "text" },
        { name: "contexto", type: "textarea" },
        { name: "ctaTexto", type: "text", defaultValue: "Corpo docente completo →" },
        { name: "ctaLink", type: "text", defaultValue: "#docentes" },
        {
          name: "vitrines",
          type: "array",
          maxRows: 3,
          fields: [
            {
              name: "vertical",
              type: "select",
              required: true,
              options: ["gov", "edu", "sau"].map((v) => ({ label: v, value: v })),
            },
            { name: "labelCuradoria", type: "text", required: true },
            { name: "labelDestaque", type: "text", required: true },
            { name: "nome", type: "text", required: true },
            {
              name: "credenciais",
              type: "array",
              fields: [{ name: "texto", type: "text", required: true }],
            },
            { name: "cta", type: "text", defaultValue: "Conhecer curadoria" },
            { name: "link", type: "text", defaultValue: "#docentes" },
          ],
        },
        { name: "rodapeTexto", type: "textarea" },
        { name: "rodapeCta", type: "text", defaultValue: "Conhecer corpo docente completo" },
      ],
    },
    // Soluções
    {
      name: "solucoes",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Visão arquitetural" },
        { name: "titulo", type: "text" },
        { name: "corpo", type: "textarea" },
        {
          name: "lista",
          type: "array",
          fields: [{ name: "texto", type: "text", required: true }],
        },
      ],
    },
    // Online × Presencial
    {
      name: "modalidades",
      type: "group",
      label: "Online × Presencial",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Modalidades de participação" },
        { name: "titulo", type: "text" },
        { name: "intro", type: "textarea" },
        {
          name: "online",
          type: "group",
          fields: [
            { name: "titulo", type: "text", defaultValue: "Eventos online" },
            {
              name: "lista",
              type: "array",
              fields: [{ name: "texto", type: "text", required: true }],
            },
            { name: "ctaRotulo", type: "text" },
            { name: "ctaLink", type: "text" },
          ],
        },
        {
          name: "presencial",
          type: "group",
          fields: [
            { name: "titulo", type: "text", defaultValue: "Eventos presenciais" },
            {
              name: "lista",
              type: "array",
              fields: [{ name: "texto", type: "text", required: true }],
            },
            { name: "ctaRotulo", type: "text" },
            { name: "ctaLink", type: "text" },
          ],
        },
      ],
    },
    // EventOn
    {
      name: "eventOn",
      type: "group",
      label: "Bloco EventOn",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "EventOn · Plataforma do Grupo NTC" },
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
        {
          name: "ctas",
          type: "array",
          maxRows: 2,
          fields: [
            { name: "rotulo", type: "text", required: true },
            { name: "link", type: "text", required: true },
            {
              name: "variante",
              type: "select",
              defaultValue: "gold",
              options: ["gold", "ghost-light"].map((v) => ({ label: v, value: v })),
            },
          ],
        },
        {
          name: "operacoes",
          type: "array",
          maxRows: 4,
          fields: [
            { name: "num", type: "text", required: true },
            { name: "titulo", type: "text", required: true },
            { name: "descricao", type: "textarea" },
            { name: "linkRotulo", type: "text" },
            { name: "link", type: "text" },
          ],
        },
      ],
    },
    // Contratação institucional
    {
      name: "contratacao",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Contratação institucional" },
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
        {
          name: "ctas",
          type: "array",
          maxRows: 3,
          fields: [
            { name: "rotulo", type: "text", required: true },
            { name: "link", type: "text", required: true },
            {
              name: "variante",
              type: "select",
              defaultValue: "gold",
              options: ["gold", "ghost-light"].map((v) => ({ label: v, value: v })),
            },
          ],
        },
        { name: "asideTitulo", type: "text", defaultValue: "Modelos disponíveis" },
        {
          name: "modelos",
          type: "array",
          fields: [{ name: "texto", type: "text", required: true }],
        },
      ],
    },
    // Diferenciais
    {
      name: "diferenciaisSecao",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Diferenciais institucionais" },
        { name: "titulo", type: "text" },
      ],
    },
    {
      name: "diferenciais",
      type: "array",
      maxRows: 12,
      fields: [
        { name: "num", type: "text", required: true },
        { name: "titulo", type: "text", required: true },
        { name: "descricao", type: "textarea", required: true },
      ],
    },
    {
      name: "numerosImpacto",
      type: "array",
      maxRows: 6,
      fields: [
        { name: "valor", type: "text", required: true },
        { name: "valorEhTexto", type: "checkbox", defaultValue: false },
        { name: "rotulo", type: "text", required: true },
      ],
    },
    { name: "numerosDisclaimer", type: "textarea" },
    // Prova institucional
    {
      name: "provaInstitucional",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Atuação institucional" },
        { name: "headline", type: "textarea" },
        {
          name: "categorias",
          type: "array",
          fields: [{ name: "texto", type: "text", required: true }],
        },
        { name: "nota", type: "text" },
      ],
    },
    {
      name: "clientesDestaque",
      type: "relationship",
      relationTo: "clientes",
      hasMany: true,
    },
    // CTA final
    {
      name: "ctaFinal",
      type: "group",
      fields: [
        { name: "eyebrow", type: "text", defaultValue: "Próximos passos" },
        { name: "titulo", type: "text" },
        { name: "subtitulo", type: "textarea" },
        {
          name: "ctas",
          type: "array",
          maxRows: 4,
          fields: [
            { name: "rotulo", type: "text", required: true },
            { name: "link", type: "text", required: true },
            {
              name: "variante",
              type: "select",
              defaultValue: "gold",
              options: ["gold", "ghost-light"].map((v) => ({ label: v, value: v })),
            },
          ],
        },
        { name: "tagline", type: "text" },
      ],
    },
    // Legacy
    {
      name: "ctaInstitucional",
      type: "group",
      admin: {
        description:
          "Campo legacy — preserva o CTA institucional original. Substituído pelo ctaFinal na Home v3 portada.",
      },
      fields: [
        { name: "titulo", type: "text" },
        { name: "descricao", type: "textarea" },
        { name: "rotuloCta", type: "text" },
        { name: "linkCta", type: "text" },
      ],
    },
    {
      name: "eventosAgendaDestaque",
      type: "relationship",
      relationTo: "eventos",
      hasMany: true,
      admin: {
        description:
          "Campo legacy — usado pela Home antiga (compose com @ntc/ui). Substituído por eventosPrincipais + eventosSecundarios.",
      },
    },
  ],
};
