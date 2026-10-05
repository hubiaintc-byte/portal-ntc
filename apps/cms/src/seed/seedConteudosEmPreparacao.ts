import type { RequiredDataFromCollectionSlug } from "payload";

import type { ConteudoCategoria } from "@ntc/lib";
import type { Area } from "@ntc/types";

import { obterPayload } from "../lib/payloadClient";

/**
 * Importa como RASCUNHO os 9 cards que hoje estão escritos no site
 * (conteudoConteudos.ts) como "Em preparação editorial". Eles viram lista
 * de trabalho no painel em vez de sumirem quando a biblioteca passar a ler
 * do CMS.
 *
 * Título, lide e assinatura são copiados literalmente de
 * apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts (CLAUDE.md §5.3
 * — nada de texto institucional inventado). Para os 3 que aparecem em
 * Destaques, a lide usada é a descrição longa da seção DESTAQUES, não a
 * curta do card da Biblioteca.
 *
 * Idempotente por slug: rodar de novo não duplica nem sobrescreve.
 * Uso: pnpm --filter @ntc/cms conteudos:seed-em-preparacao
 */

interface Semente {
  slug: string;
  titulo: string;
  categoria: ConteudoCategoria;
  /** Slug da área em `areas`; null = transversal. */
  areaSlug: string | null;
  lide: string;
  assinatura: string;
  destaque: boolean;
}

const SEMENTES: Semente[] = [
  {
    slug: "cinco-anos-de-lei-14133",
    titulo: "Cinco anos de Lei 14.133: o que mudou nas redes.",
    categoria: "estudo",
    areaSlug: "gestao-publica",
    lide:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações no cotidiano dos órgãos públicos, com diagnóstico do que efetivamente se transformou na prática administrativa, dos riscos que persistem e das frentes em disputa interpretativa entre TCU, AGU e tribunais.",
    assinatura: "Curadoria NTC Gestão Pública",
    destaque: true,
  },
  {
    slug: "recomposicao-da-aprendizagem",
    titulo: "Recomposição da aprendizagem: o que os dados estão dizendo.",
    categoria: "artigo",
    areaSlug: "educacao",
    lide:
      "Artigo editorial sobre o estado atual da alfabetização na idade certa no Brasil pós-pandemia, com leitura crítica dos resultados das principais avaliações e proposições técnicas para gestores municipais e estaduais que estão organizando seus planos de recomposição.",
    assinatura: "Direção Científica NTC",
    destaque: true,
  },
  {
    slug: "previne-brasil-2026",
    titulo: "Previne Brasil 2026: financiamento da APS e o que muda.",
    categoria: "webinar",
    areaSlug: "saude",
    lide:
      "Webinar executivo sobre a arquitetura atual do financiamento da Atenção Primária à Saúde no Brasil, os efeitos das mudanças recentes do programa Previne Brasil sobre a operação das equipes de Saúde da Família e os caminhos de planejamento para a gestão municipal.",
    assinatura: "Equipe NTC Saúde",
    destaque: true,
  },
  {
    slug: "ia-generativa-no-setor-publico",
    titulo: "IA generativa no setor público: limites e oportunidades.",
    categoria: "nota-tecnica",
    areaSlug: null,
    lide:
      "Nota técnica sobre o estado atual da incorporação de inteligência artificial generativa pelos órgãos da administração pública brasileira, com leitura crítica de riscos.",
    assinatura: "Direção Científica NTC",
    destaque: false,
  },
  {
    slug: "educacao-integral-em-escala",
    titulo: "Educação integral em escala: leitura institucional da Lei 14.640/2023.",
    categoria: "estudo",
    areaSlug: "educacao",
    lide:
      "Estudo sobre a implementação da política de educação em tempo integral nas redes públicas brasileiras após a sanção da Lei 14.640/2023.",
    assinatura: "Equipe NTC Educação",
    destaque: false,
  },
  {
    slug: "direcao-estrategica-na-administracao-publica",
    titulo: "A direção estratégica na administração pública contemporânea.",
    categoria: "webinar",
    areaSlug: "gestao-publica",
    lide:
      "Webinar executivo sobre direção institucional, articulação federativa e leitura de cenário para dirigentes da administração pública brasileira.",
    assinatura: "Curadoria NTC Gestão Pública",
    destaque: false,
  },
  {
    slug: "direcao-institucional-em-saude-publica",
    titulo: "Direção institucional em saúde pública: o estado da arte.",
    categoria: "estudo",
    areaSlug: "saude",
    lide:
      "Estudo sobre o desenho da direção institucional do SUS no Brasil — competências, governança, articulação federativa e gargalos de capacidade técnica.",
    assinatura: "Curadoria NTC Saúde",
    destaque: false,
  },
  {
    slug: "governanca-de-dados-no-setor-publico",
    titulo: "Governança de dados no setor público: LGPD e a operação cotidiana.",
    categoria: "webinar",
    areaSlug: null,
    lide:
      "Webinar transversal sobre a aplicação da LGPD na rotina das três áreas — Educação, Gestão Pública e Saúde — com foco em dilemas concretos da operação.",
    assinatura: "Direção Científica NTC",
    destaque: false,
  },
  {
    slug: "primeira-infancia-e-educacao-infantil",
    titulo: "Primeira infância e educação infantil: kit de planejamento de rede.",
    categoria: "material",
    areaSlug: "educacao",
    lide:
      "Material didático para gestores municipais — fluxos, indicadores, modelos e referências para o planejamento da política de creches e pré-escolas.",
    assinatura: "Equipe NTC Educação",
    destaque: false,
  },
];

/**
 * `corpo` nasce com este marcador porque o campo é richText obrigatório na
 * coleção e §5.3 proíbe inventar texto institucional — a redação real fica
 * para a curadoria editorial, depois que o registro existe no painel.
 */
function criarCorpoPlaceholder(): RequiredDataFromCollectionSlug<"conteudos">["corpo"] {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: [
        {
          type: "paragraph",
          format: "",
          indent: 0,
          version: 1,
          direction: "ltr",
          children: [
            {
              type: "text",
              format: 0,
              mode: "normal",
              style: "",
              detail: 0,
              version: 1,
              text: "[conteúdo a ser redigido pela curadoria editorial]",
            },
          ],
        },
      ],
    },
  };
}

async function principal(): Promise<void> {
  const payload = await obterPayload();

  const areas = await payload.find({ collection: "areas", limit: 50 });
  const idPorSlug = new Map<string, number>();
  for (const area of areas.docs as Area[]) {
    idPorSlug.set(area.slug, area.id);
  }

  let criados = 0;
  let pulados = 0;

  for (const semente of SEMENTES) {
    const existente = await payload.find({
      collection: "conteudos",
      where: { slug: { equals: semente.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (existente.docs.length > 0) {
      pulados += 1;
      continue;
    }

    let area: number | null = null;
    if (semente.areaSlug) {
      area = idPorSlug.get(semente.areaSlug) ?? null;
      if (area === null) {
        console.warn(
          `[seed] área "${semente.areaSlug}" não existe no banco — "${semente.titulo}" fica como Transversal.`,
        );
      }
    }

    await payload.create({
      collection: "conteudos",
      draft: true,
      overrideAccess: true,
      data: {
        titulo: semente.titulo,
        slug: semente.slug,
        categoria: semente.categoria,
        area,
        lide: semente.lide,
        assinatura: semente.assinatura,
        destaque: semente.destaque,
        anunciarEmPreparacao: true,
        dataPublicacao: new Date().toISOString(),
        corpo: criarCorpoPlaceholder(),
      },
    });
    criados += 1;
  }

  console.log(`[seed] conteúdos em preparação: ${criados} criados, ${pulados} já existiam.`);
  process.exit(0);
}

void principal().catch((err) => {
  console.error("[seed:conteudos-em-preparacao] Falha:", err);
  process.exit(1);
});
