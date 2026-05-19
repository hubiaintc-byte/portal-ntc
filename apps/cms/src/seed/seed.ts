/**
 * Seed mínimo — Portal Grupo NTC · Sprint F (doc 11 §18).
 *
 * Cria as 3 Áreas Estratégicas e os 15 Programas em rascunho.
 * Idempotente: verifica existência antes de criar, então pode rodar várias
 * vezes sem duplicar.
 *
 * Execução: `pnpm --filter @ntc/cms payload:seed`, que internamente roda
 * `pnpm payload run src/seed/seed.ts` — esse comando inicializa o Payload
 * com config + .env carregados e executa o script (top-level await OK).
 */

import { getPayload } from "payload";

import config from "../payload.config";

type AreaSeed = {
  sigla: "educacao" | "gestao-publica" | "saude";
  nome: string;
  corAcento: string;
};

const AREAS: AreaSeed[] = [
  { sigla: "educacao", nome: "NTC Educação", corAcento: "#11365E" },
  { sigla: "gestao-publica", nome: "NTC Gestão Pública", corAcento: "#8E2B27" },
  { sigla: "saude", nome: "NTC Saúde", corAcento: "#5C6B3B" },
];

type ProgramaSeed = {
  sigla: string;
  nomeCompleto: string;
  area: AreaSeed["sigla"];
};

const PROGRAMAS: ProgramaSeed[] = [
  { sigla: "PROGE", nomeCompleto: "Programa de Gestão Estratégica", area: "educacao" },
  { sigla: "EDUTEC", nomeCompleto: "Educação e Tecnologia", area: "educacao" },
  {
    sigla: "PEAR",
    nomeCompleto: "Programa de Educação e Aprendizagem em Rede",
    area: "educacao",
  },
  { sigla: "PEI", nomeCompleto: "Programa de Educação Inclusiva", area: "educacao" },
  { sigla: "PROGIR", nomeCompleto: "Gestão e Inovação em Resultados", area: "educacao" },
  {
    sigla: "EGIDE",
    nomeCompleto: "Excelência em Gestão e Inovação para Diretores Escolares",
    area: "educacao",
  },
  { sigla: "PINEI", nomeCompleto: "Inovação na Educação Infantil", area: "educacao" },
  {
    sigla: "VIVAESCOLA",
    nomeCompleto: "Bem-Estar e Cultura Positiva na Escola",
    area: "educacao",
  },
  { sigla: "FUTURA", nomeCompleto: "Educação para o Futuro", area: "educacao" },
  {
    sigla: "SIGA",
    nomeCompleto: "Soluções Inteligentes de Governança e Administração",
    area: "gestao-publica",
  },
  {
    sigla: "AGIP",
    nomeCompleto: "Governança, Integridade e Performance nas Contratações Públicas",
    area: "gestao-publica",
  },
  {
    sigla: "LIDERA",
    nomeCompleto: "Liderança, Direção Estratégica e Resultados na Administração",
    area: "gestao-publica",
  },
  {
    sigla: "PROSUS+",
    nomeCompleto: "Governança, Financiamento e Performance no SUS",
    area: "saude",
  },
  {
    sigla: "PROAPS+",
    nomeCompleto: "Alta Performance na Atenção Primária e Redes de Cuidado",
    area: "saude",
  },
  {
    sigla: "SIGS",
    nomeCompleto:
      "Saúde Inteligente, Governança Digital, IA e Transformação do SUS",
    area: "saude",
  },
];

/** Slug consistente entre seed e autoSlug hook (sem '+', acentos etc.). */
const programaSlug = (sigla: string): string =>
  sigla.toLowerCase().replace("+", "-plus");

const emptyRichText = {
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    children: [
      {
        type: "paragraph",
        format: "" as const,
        indent: 0,
        version: 1,
        children: [],
      },
    ],
    direction: null,
  },
};

const main = async (): Promise<void> => {
  const payload = await getPayload({ config });

  payload.logger.info("[seed] Iniciando seed mínimo (3 Áreas + 15 Programas).");

  const areaMap: Record<AreaSeed["sigla"], string | number> = {} as Record<
    AreaSeed["sigla"],
    string | number
  >;

  for (const area of AREAS) {
    const existing = await payload.find({
      collection: "areas",
      where: { sigla: { equals: area.sigla } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      draft: true,
    });

    if (existing.docs.length > 0) {
      const doc = existing.docs[0]!;
      areaMap[area.sigla] = doc.id;
      payload.logger.info(`[seed] Área já existe: ${area.sigla} (id=${doc.id}).`);
      continue;
    }

    const created = await payload.create({
      collection: "areas",
      data: {
        sigla: area.sigla,
        nome: area.nome,
        slug: area.sigla,
        tituloHero: area.nome,
        subtituloHero: "[texto a definir pela equipe editorial]",
        corAcento: area.corAcento,
        // imagemHero é required mas seed roda antes de mídias — Payload aceita
        // null em draft. Caso falhe, equipe edita no admin com mídia real.
        posicionamento: emptyRichText,
        _status: "draft",
      } as never,
      draft: true,
      overrideAccess: true,
    });

    areaMap[area.sigla] = created.id;
    payload.logger.info(`[seed] Área criada: ${area.sigla} (id=${created.id}).`);
  }

  for (const programa of PROGRAMAS) {
    const slug = programaSlug(programa.sigla);
    const existing = await payload.find({
      collection: "programas",
      where: { sigla: { equals: programa.sigla } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      draft: true,
    });

    if (existing.docs.length > 0) {
      payload.logger.info(
        `[seed] Programa já existe: ${programa.sigla} (id=${existing.docs[0]!.id}).`,
      );
      continue;
    }

    const created = await payload.create({
      collection: "programas",
      data: {
        sigla: programa.sigla,
        nomeCompleto: programa.nomeCompleto,
        slug,
        area: areaMap[programa.area],
        cargaHorariaTotal: "A definir",
        visaoGeral: emptyRichText,
        _status: "draft",
      } as never,
      draft: true,
      overrideAccess: true,
    });

    payload.logger.info(
      `[seed] Programa criado: ${programa.sigla} (id=${created.id}, área=${programa.area}).`,
    );
  }

  payload.logger.info("[seed] Concluído.");
};

await main();
process.exit(0);
