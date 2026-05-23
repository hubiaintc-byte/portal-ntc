/**
 * Seed da Home v3 Premium — Portal Grupo NTC.
 *
 * Fonte: 02_Prototipo_Home_GrupoNTC_v3_Premium.html (textos exatos
 * validados pelo Instituto NTC).
 *
 * O que faz:
 * 1. Resolve as IDs das imagens já uploadadas.
 * 2. Atualiza imagemHero + cardHome das 3 Áreas com os 3 cards
 *    premium do HTML.
 * 3. Atualiza nomeCompleto + imagemCapa + cardHome dos 6 Programas
 *    em evidência (PEAR, AGIP, PROSUS+, EDUTEC, PROGE, LIDERA) e
 *    nomeCompleto + imagemCapa nos demais 9.
 * 4. Cria 4 Especialistas exemplo.
 * 5. Cria 6 Eventos (3 principais + 3 secundários) com cardHome
 *    completo.
 * 6. Popula Global Home com TODOS os groups portados do HTML.
 *
 * Idempotente para criações; updates são intencionalmente
 * sobrescritivos.
 *
 * Execução: pnpm payload:seed:home-v3.
 */

import { getPayload } from "payload";

import config from "../payload.config";
import { PROGRAMAS_CANONICOS, slugDoPrograma } from "./programasShell";

type Id = number;
interface MediaIdMap {
  [arquivo: string]: Id;
}

const emptyRichText = {
  root: {
    type: "root",
    format: "" as const,
    indent: 0,
    version: 1,
    children: [
      { type: "paragraph", format: "" as const, indent: 0, version: 1, children: [] },
    ],
    direction: null,
  },
};

function num(id: string | number): Id {
  return typeof id === "number" ? id : Number(id);
}

const IMAGEM_POR_AREA: Record<"educacao" | "gestao-publica" | "saude", string> = {
  educacao: "area-educacao.jpg",
  "gestao-publica": "area-gestao-publica.png",
  saude: "area-saude.png",
};

const ESPECIALISTAS_SEED = [
  {
    slug: "joana-mendonca",
    nome: "Joana Mendonça",
    titulacao: "doutorado" as const,
    instituicao: "Universidade de Brasília · UnB",
    cargoAtual: "Pesquisadora em Gestão Pública",
    foto: "expert-01.png",
  },
  {
    slug: "carlos-eduardo-azevedo",
    nome: "Carlos Eduardo Azevedo",
    titulacao: "pos-doutorado" as const,
    instituicao: "Fundação Oswaldo Cruz · Fiocruz",
    cargoAtual: "Sanitarista, especialista em SUS",
    foto: "expert-02.png",
  },
  {
    slug: "luciana-prates",
    nome: "Luciana Prates",
    titulacao: "doutorado" as const,
    instituicao: "Universidade de São Paulo · USP",
    cargoAtual: "Pesquisadora em alfabetização e currículo",
    foto: "expert-03.png",
  },
  {
    slug: "rodrigo-vilela",
    nome: "Rodrigo Vilela",
    titulacao: "doutorado" as const,
    instituicao: "Tribunal de Contas da União · TCU",
    cargoAtual: "Auditor federal · Lei 14.133/2021",
    foto: "expert-04.png",
  },
];

interface EventoSeed {
  slug: string;
  nome: string;
  eyebrow: string;
  imagemArquivo: string;
  area: "educacao" | "gestao-publica" | "saude";
  programaSigla: string;
  dataInicio: string;
  dataFim?: string;
  modalidade: "online" | "presencial" | "hibrido";
  local?: { cidade: string; estado: string };
  cargaHoraria: string;
  resumo: string;
  inscricaoAberta: boolean;
  cardHome: Record<string, unknown>;
}

const EVENTOS_SEED: EventoSeed[] = [
  {
    slug: "prosus-mais-brasilia-2026-junho",
    nome: "Governança, financiamento e performance no SUS — Edição 2026",
    eyebrow: "Seminário · NTC Saúde",
    imagemArquivo: "area-saude.png",
    area: "saude",
    programaSigla: "PROSUS+",
    dataInicio: "2026-06-05T09:00:00.000Z",
    dataFim: "2026-06-07T18:00:00.000Z",
    modalidade: "presencial",
    local: { cidade: "Brasília", estado: "DF" },
    cargaHoraria: "20h · 3 dias",
    resumo:
      "Curso executivo presencial em Brasília · 05 a 07 de junho · 24 horas · com a coordenação científica do NTC Saúde e convidados especialistas em gestão do SUS, governança e financiamento.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Seminário",
      destaque: true,
      selo: "ultimas-vagas",
      datas: { variante: "range", diasInicio: "05", diasFim: "07", monYr: "Jun · 2026" },
      modalidadeTexto: "Presencial · Brasília",
      modalidadeCor: "presencial",
      programLink: "Seminário · NTC Saúde",
      coordenacaoTexto:
        "NTC Saúde · Especialistas em gestão do SUS, governança e financiamento · com convidados",
      metaCargaHoraria: "20h · 3 dias",
      metaLocal: "Brasília · DF",
      programaBindingSigla: "PROSUS+",
      precoIndividual: "R$ 2.890",
      precoInstitucional: "Sob consulta",
      areaVert: "sau",
    },
  },
  {
    slug: "pear-online-maio-2026",
    nome: "Alfabetização de Alta Performance: estratégias para recomposição da aprendizagem",
    eyebrow: "Seminário · NTC Educação",
    imagemArquivo: "area-educacao.jpg",
    area: "educacao",
    programaSigla: "PEAR",
    dataInicio: "2026-05-22T19:00:00.000Z",
    dataFim: "2026-05-23T22:00:00.000Z",
    modalidade: "online",
    cargaHoraria: "16h · 2 dias",
    resumo:
      "Online ao vivo com replay protegido. Estratégias práticas de recomposição da aprendizagem, alfabetização e formação docente, com referências nacionais.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Seminário",
      selo: "inscricoes-abertas",
      datas: { variante: "range", diasInicio: "22", diasFim: "23", monYr: "Mai · 2026" },
      modalidadeTexto: "Online ao vivo + replay",
      modalidadeCor: "padrao",
      programLink: "Seminário · NTC Educação",
      coordenacaoTexto:
        "NTC Educação · Especialistas em alfabetização, currículo e formação docente · com convidados",
      metaCargaHoraria: "16h · 2 dias",
      metaLocal: "Plataforma EventOn",
      programaBindingSigla: "PEAR",
      precoIndividual: "R$ 1.490",
      precoInstitucional: "Sob consulta",
      areaVert: "edu",
    },
  },
  {
    slug: "agip-sp-junho-2026",
    nome: "Integridade e performance nas contratações públicas — fundamentos avançados",
    eyebrow: "Oficina · NTC Gestão Pública",
    imagemArquivo: "area-gestao-publica.png",
    area: "gestao-publica",
    programaSigla: "AGIP",
    dataInicio: "2026-06-18T09:00:00.000Z",
    dataFim: "2026-07-09T18:00:00.000Z",
    modalidade: "hibrido",
    local: { cidade: "São Paulo", estado: "SP" },
    cargaHoraria: "24h · 4 encontros",
    resumo:
      "Seminário híbrido em São Paulo · ministros, juristas e autoridades em Lei 14.133/2021 compõem o painel do programa.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Oficina",
      selo: "inscricoes-abertas",
      datas: { variante: "multi", encontros: "4 encontros", periodo: "Jun – Jul · 2026" },
      modalidadeTexto: "Híbrido · SP",
      modalidadeCor: "hibrido",
      programLink: "Oficina · NTC Gestão Pública",
      coordenacaoTexto:
        "NTC Gestão Pública · Especialistas em contratações, integridade e governança · com convidados",
      metaCargaHoraria: "24h · 4 encontros",
      metaLocal: "São Paulo · SP",
      programaBindingSigla: "AGIP",
      precoIndividual: "R$ 1.890",
      precoInstitucional: "Sob consulta",
      areaVert: "gov",
    },
  },
  // 3 secundários
  {
    slug: "lidera-online-maio-2026",
    nome: "Liderança e direção estratégica para secretários e diretores",
    eyebrow: "Curso Executivo · NTC Gestão Pública",
    imagemArquivo: "area-gestao-publica.png",
    area: "gestao-publica",
    programaSigla: "LIDERA",
    dataInicio: "2026-05-28T19:00:00.000Z",
    dataFim: "2026-05-29T22:00:00.000Z",
    modalidade: "online",
    cargaHoraria: "12h · 2 tardes",
    resumo: "Curso executivo online de 2 tardes para secretários e diretores.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Curso Executivo",
      datas: { variante: "range", diasInicio: "28", diasFim: "29", monYr: "Mai · 2026" },
      programLink: "Curso Executivo · NTC Gestão Pública",
      programaBindingSigla: "LIDERA",
      esMetaCompacto: "Online · 12h · 2 tardes R$ 1.290",
      areaVert: "gov",
    },
  },
  {
    slug: "edutec-sp-junho-2026",
    nome: "Tecnologias e IA aplicadas à gestão escolar pública",
    eyebrow: "Jornada · NTC Educação",
    imagemArquivo: "area-educacao.jpg",
    area: "educacao",
    programaSigla: "EDUTEC",
    dataInicio: "2026-06-12T09:00:00.000Z",
    dataFim: "2026-06-26T18:00:00.000Z",
    modalidade: "hibrido",
    local: { cidade: "São Paulo", estado: "SP" },
    cargaHoraria: "18h · 3 encontros",
    resumo: "Jornada híbrida com 3 encontros em São Paulo.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Jornada",
      datas: { variante: "multi", encontros: "3 encontros", periodo: "Jun · 2026" },
      programLink: "Jornada · NTC Educação",
      programaBindingSigla: "EDUTEC",
      esMetaCompacto: "Híbrido · SP · 18h · 3 encontros R$ 1.690",
      areaVert: "edu",
    },
  },
  {
    slug: "proaps-online-julho-2026",
    nome: "Alta performance na atenção primária e redes de cuidado",
    eyebrow: "Simpósio · NTC Saúde",
    imagemArquivo: "area-saude.png",
    area: "saude",
    programaSigla: "PROAPS+",
    dataInicio: "2026-07-02T09:00:00.000Z",
    dataFim: "2026-07-03T18:00:00.000Z",
    modalidade: "online",
    cargaHoraria: "16h · 2 dias",
    resumo: "Simpósio online de 2 dias sobre APS e redes de cuidado.",
    inscricaoAberta: true,
    cardHome: {
      formato: "Simpósio",
      datas: { variante: "range", diasInicio: "02", diasFim: "03", monYr: "Jul · 2026" },
      programLink: "Simpósio · NTC Saúde",
      programaBindingSigla: "PROAPS+",
      esMetaCompacto: "Online · 16h · 2 dias R$ 1.490",
      areaVert: "sau",
    },
  },
];

// CardHome para as 3 áreas (do HTML linhas 2755–2805)
const AREAS_CARD_HOME: Record<"educacao" | "gestao-publica" | "saude", Record<string, unknown>> = {
  educacao: {
    num: "01",
    verticalCode: "edu",
    tituloLinha1: "Educação",
    tituloLinha2: "com excelência.",
    tagline:
      "Soluções estruturadas para redes públicas de ensino — gestão escolar, alfabetização, educação inclusiva, tecnologia, currículo e primeira infância.",
    programasCount: "9",
    linkProgramasRotulo: "Ver programas da área",
    linkProgramasHref: "#programas",
    linkEventosRotulo: "Ver módulos e eventos abertos",
    linkEventosHref: "#eventos-abertos",
  },
  "gestao-publica": {
    num: "02",
    verticalCode: "gov",
    tituloLinha1: "Governança",
    tituloLinha2: "com transformação.",
    tagline:
      "Capacitação executiva e técnica para a Administração Pública — liderança, contratações, governança, integridade e performance institucional.",
    programasCount: "3",
    linkProgramasRotulo: "Ver programas da área",
    linkProgramasHref: "#programas",
    linkEventosRotulo: "Ver módulos e eventos abertos",
    linkEventosHref: "#eventos-abertos",
  },
  saude: {
    num: "03",
    verticalCode: "sau",
    tituloLinha1: "Saúde",
    tituloLinha2: "com qualidade.",
    tagline:
      "Inteligência institucional aplicada ao SUS — atenção primária, governança digital, financiamento e transformação dos sistemas públicos de saúde.",
    programasCount: "3",
    linkProgramasRotulo: "Ver programas da área",
    linkProgramasHref: "#programas",
    linkEventosRotulo: "Ver módulos e eventos abertos",
    linkEventosHref: "#eventos-abertos",
  },
};

// CardHome para os 6 programas em evidência (HTML linhas 2820–2913)
const PROGRAMAS_EVIDENCIA_CARD: Record<string, Record<string, unknown>> = {
  PEAR: {
    areaLabel: "NTC Educação",
    nameEvidencia: "Alfabetização e Recomposição",
    valueEvidencia: "Recompor a aprendizagem com método e velocidade nas redes públicas de ensino.",
    modulosCount: "8 módulos",
    cargaHorariaEvidencia: "64h",
    flagModuloAberto: true,
    tituloLong: "PEAR — Programa Estratégico de Alfabetização de Alta Performance e Recomposição da Aprendizagem",
    linkAreaCor: "padrao",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Ver módulo aberto",
    ctaSecundarioLink: "#eventos-abertos",
  },
  AGIP: {
    areaLabel: "NTC Gestão Pública",
    nameEvidencia: "Contratações Públicas",
    valueEvidencia: "Elevar integridade e performance das contratações como vantagem institucional.",
    modulosCount: "8 módulos",
    cargaHorariaEvidencia: "64h",
    flagModuloAberto: true,
    tituloLong: "AGIP — Programa Avançado de Governança, Integridade e Performance nas Contratações Públicas",
    linkAreaCor: "crimson",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Ver módulo aberto",
    ctaSecundarioLink: "#eventos-abertos",
  },
  "PROSUS+": {
    areaLabel: "NTC Saúde",
    nameEvidencia: "Governança no SUS",
    valueEvidencia: "Governança, financiamento e performance estratégica do Sistema Único de Saúde.",
    modulosCount: "6 módulos",
    cargaHorariaEvidencia: "48h",
    flagModuloAberto: true,
    tituloLong: "PROSUS+ — Programa Estratégico de Governança, Financiamento e Performance no SUS",
    linkAreaCor: "olive",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Ver módulo aberto",
    ctaSecundarioLink: "#eventos-abertos",
  },
  EDUTEC: {
    areaLabel: "NTC Educação",
    nameEvidencia: "Educação Digital",
    valueEvidencia: "Tecnologias e inovação aplicadas à gestão das redes públicas de ensino.",
    modulosCount: "10 módulos",
    cargaHorariaEvidencia: "80h",
    flagModuloAberto: true,
    tituloLong: "EDUTEC — Programa Estratégico de Educação Digital, Inovação e Tecnologias para Redes Públicas de Ensino",
    linkAreaCor: "padrao",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Ver módulo aberto",
    ctaSecundarioLink: "#eventos-abertos",
  },
  PROGE: {
    areaLabel: "NTC Educação",
    nameEvidencia: "Gestão Escolar",
    valueEvidencia: "Gestão escolar e coordenação pedagógica orientadas a resultados mensuráveis.",
    modulosCount: "10 módulos",
    cargaHorariaEvidencia: "80h",
    flagModuloAberto: false,
    tituloLong: "PROGE — Programa Estratégico de Gestão Escolar, Coordenação Pedagógica e Resultados",
    linkAreaCor: "padrao",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Solicitar proposta",
    ctaSecundarioLink: "#contratacao",
  },
  LIDERA: {
    areaLabel: "NTC Gestão Pública",
    nameEvidencia: "Liderança e Direção",
    valueEvidencia: "Direção estratégica e formação executiva para a Administração Pública.",
    modulosCount: "8 módulos",
    cargaHorariaEvidencia: "64h",
    flagModuloAberto: false,
    tituloLong: "LIDERA — Liderança, Direção Estratégica e Resultados na Administração",
    linkAreaCor: "crimson",
    ctaConhecer: "Conhecer programa",
    ctaConhecerLink: "#programas",
    ctaSecundario: "Solicitar proposta",
    ctaSecundarioLink: "#contratacao",
  },
};

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  payload.logger.info("[seed:home-v3] Iniciando seed da Home v3 Premium.");

  // 1. Imagens
  const mediaIds: MediaIdMap = {};
  const arquivosNecessarios = [
    "hero-principal.jpg",
    "area-saude.png",
    "area-gestao-publica.png",
    "area-educacao.jpg",
    "contratacao.png",
    "eventon-estudio.png",
    "expert-01.png",
    "expert-02.png",
    "expert-03.png",
    "expert-04.png",
  ];
  for (const arquivo of arquivosNecessarios) {
    const res = await payload.find({
      collection: "media",
      where: { filename: { equals: arquivo } },
      limit: 1,
      overrideAccess: true,
    });
    if (res.docs.length === 0) {
      throw new Error(
        `[seed:home-v3] Imagem ${arquivo} não encontrada. Rode 'pnpm payload:seed:imagens-home' antes.`,
      );
    }
    mediaIds[arquivo] = num(res.docs[0]!.id);
  }
  payload.logger.info(`[seed:home-v3] ${Object.keys(mediaIds).length} imagens resolvidas.`);

  // 2. Áreas
  const areaIds: Record<string, Id> = {};
  for (const sigla of ["educacao", "gestao-publica", "saude"] as const) {
    const res = await payload.find({
      collection: "areas",
      where: { sigla: { equals: sigla } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    if (res.docs.length === 0) {
      payload.logger.warn(`[seed:home-v3] Área ${sigla} não encontrada.`);
      continue;
    }
    const area = res.docs[0]!;
    areaIds[sigla] = num(area.id);
    const subtitulo =
      sigla === "educacao"
        ? "Soluções estruturadas para redes públicas de ensino."
        : sigla === "gestao-publica"
          ? "Governança, integridade e performance na Administração Pública."
          : "Inteligência institucional aplicada ao SUS.";
    await payload.update({
      collection: "areas",
      id: area.id,
      data: {
        imagemHero: mediaIds[IMAGEM_POR_AREA[sigla]],
        subtituloHero: subtitulo,
        cardHome: AREAS_CARD_HOME[sigla],
      } as never,
      overrideAccess: true,
      draft: true,
    });
    payload.logger.info(`[seed:home-v3] Área ${sigla} atualizada (id=${area.id}).`);
  }

  // 3. Programas (15 + cardHome para os 6 em evidência)
  const programaIds: Record<string, Id> = {};
  for (const programa of PROGRAMAS_CANONICOS) {
    const slug = slugDoPrograma(programa.sigla);
    const res = await payload.find({
      collection: "programas",
      where: { sigla: { equals: programa.sigla } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    if (res.docs.length === 0) {
      payload.logger.warn(`[seed:home-v3] Programa ${programa.sigla} não encontrado.`);
      continue;
    }
    const doc = res.docs[0]!;
    programaIds[programa.sigla] = num(doc.id);
    const cardHome = PROGRAMAS_EVIDENCIA_CARD[programa.sigla];
    await payload.update({
      collection: "programas",
      id: doc.id,
      data: {
        nomeCompleto: programa.nomeCompleto,
        slug,
        imagemCapa: mediaIds[IMAGEM_POR_AREA[programa.area]],
        ...(cardHome ? { cardHome } : {}),
      } as never,
      overrideAccess: true,
      draft: true,
    });
    payload.logger.info(`[seed:home-v3] Programa ${programa.sigla} atualizado (id=${doc.id}).`);
  }

  // 4. Especialistas (idempotente)
  const especialistaIds: Record<string, Id> = {};
  for (const esp of ESPECIALISTAS_SEED) {
    const existing = await payload.find({
      collection: "especialistas",
      where: { slug: { equals: esp.slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    if (existing.docs.length > 0) {
      especialistaIds[esp.slug] = num(existing.docs[0]!.id);
      payload.logger.info(`[seed:home-v3] Especialista já existe: ${esp.slug}.`);
      continue;
    }
    const created = await payload.create({
      collection: "especialistas",
      data: {
        nome: esp.nome,
        slug: esp.slug,
        titulacao: esp.titulacao,
        instituicao: esp.instituicao,
        cargoAtual: esp.cargoAtual,
        foto: mediaIds[esp.foto],
        curriculoCurto: emptyRichText,
      } as never,
      overrideAccess: true,
      draft: true,
    });
    especialistaIds[esp.slug] = num(created.id);
    payload.logger.info(`[seed:home-v3] Especialista criado: ${esp.slug}.`);
  }

  // 5. Eventos (6 total: 3 principais + 3 secundários). Update se existe.
  const eventoIds: Record<string, Id> = {};
  for (const evento of EVENTOS_SEED) {
    const existing = await payload.find({
      collection: "eventos",
      where: { slug: { equals: evento.slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    const data = {
      slug: evento.slug,
      nome: evento.nome,
      eyebrow: evento.eyebrow,
      area: areaIds[evento.area],
      programa: programaIds[evento.programaSigla],
      imagemCapa: mediaIds[evento.imagemArquivo],
      dataInicio: evento.dataInicio,
      dataFim: evento.dataFim,
      modalidade: evento.modalidade,
      local: evento.local,
      cargaHoraria: evento.cargaHoraria,
      resumo: evento.resumo,
      inscricaoAberta: evento.inscricaoAberta,
      cardHome: evento.cardHome,
    } as never;
    if (existing.docs.length > 0) {
      const id = num(existing.docs[0]!.id);
      eventoIds[evento.slug] = id;
      await payload.update({
        collection: "eventos",
        id,
        data,
        overrideAccess: true,
        draft: true,
      });
      payload.logger.info(`[seed:home-v3] Evento atualizado: ${evento.slug} (id=${id}).`);
    } else {
      const created = await payload.create({
        collection: "eventos",
        data,
        overrideAccess: true,
        draft: true,
      });
      eventoIds[evento.slug] = num(created.id);
      payload.logger.info(`[seed:home-v3] Evento criado: ${evento.slug} (id=${created.id}).`);
    }
  }

  // 6. Global Home — populate completo com os textos do HTML.
  const eventosPrincipaisSlugs = [
    "prosus-mais-brasilia-2026-junho",
    "pear-online-maio-2026",
    "agip-sp-junho-2026",
  ];
  const eventosSecundariosSlugs = [
    "lidera-online-maio-2026",
    "edutec-sp-junho-2026",
    "proaps-online-julho-2026",
  ];
  const programasEvidenciaSlugs = ["PEAR", "AGIP", "PROSUS+", "EDUTEC", "PROGE", "LIDERA"];

  await payload.updateGlobal({
    slug: "home",
    data: {
      heroSlider: {
        intervaloMs: 7000,
        slides: [
          {
            tipo: "institucional",
            imagem: mediaIds["hero-principal.jpg"],
            eyebrow: "Grupo NTC · Núcleo de Tecnologia e Conhecimento",
            titulo:
              "O novo padrão da formação <accent>institucional</accent> para a Administração Pública brasileira.",
            subtitulo:
              "Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
            ctas: [
              { rotulo: "Ver eventos com inscrições abertas", link: "#eventos-abertos", variante: "primario" },
              { rotulo: "Solicitar proposta institucional", link: "#contratacao", variante: "secundario" },
              { rotulo: "Conhecer programas estratégicos", link: "#programas", variante: "textlink" },
            ],
          },
          {
            tipo: "evento",
            imagem: mediaIds["area-saude.png"],
            eyebrow: "Evento em destaque · Inscrições abertas",
            titulo:
              "Governança, financiamento e <accent>performance</accent> no SUS — Brasília 2026.",
            subtitulo:
              "Curso executivo presencial em Brasília · 05 a 07 de junho · 24 horas · com a coordenação científica do NTC Saúde e convidados especialistas em gestão do SUS, governança e financiamento.",
            eventoPill: { data: "05–07 Jun", local: "Brasília", modalidade: "Presencial" },
            ctas: [
              { rotulo: "Inscrever-se", link: "#eventos-abertos", variante: "primario" },
              { rotulo: "Ver detalhes do evento", link: "#eventos-abertos", variante: "secundario" },
            ],
          },
          {
            tipo: "evento",
            imagem: mediaIds["area-gestao-publica.png"],
            eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
            titulo: "Integridade e performance nas <accent>contratações públicas</accent>.",
            subtitulo:
              "Seminário presencial em São Paulo · 18 a 20 de junho · 20 horas · ministros, juristas e autoridades em Lei 14.133/2021 compõem o painel do programa.",
            eventoPill: { data: "18–20 Jun", local: "São Paulo", modalidade: "Híbrido" },
            ctas: [
              { rotulo: "Conhecer evento", link: "#programas", variante: "primario" },
              { rotulo: "Inscrever-se", link: "#eventos-abertos", variante: "secundario" },
            ],
          },
          {
            tipo: "programa",
            imagem: mediaIds["area-educacao.jpg"],
            eyebrow: "NTC Educação · PEAR · Programa Estratégico",
            titulo: "Alfabetização de <accent>Alta Performance</accent> para redes públicas.",
            subtitulo:
              "Recomposição da aprendizagem, currículo e formação docente em escala. Programa estruturado para secretarias de educação, redes municipais e estaduais que buscam resultados sustentáveis.",
            ctas: [
              { rotulo: "Conhecer programa", link: "#programas", variante: "primario" },
              { rotulo: "Ver módulos abertos", link: "#capacitacao", variante: "secundario" },
            ],
          },
          {
            tipo: "solucao",
            imagem: mediaIds["contratacao.png"],
            eyebrow: "Soluções institucionais · In company · Turmas fechadas",
            titulo: "Capacitações <accent>sob medida</accent> para a sua instituição.",
            subtitulo:
              "Programas, jornadas e trilhas do portfólio NTC entregues exclusivamente à sua equipe, rede ou órgão público — com desenho, especialistas, formato e calendário alinhados aos objetivos da contratante.",
            ctas: [
              { rotulo: "Solicitar proposta", link: "#contratacao", variante: "primario" },
              { rotulo: "Agendar apresentação", link: "#contato", variante: "secundario" },
            ],
          },
          {
            tipo: "eventon",
            imagem: mediaIds["eventon-estudio.png"],
            eyebrow: "EventOn · Plataforma própria · Infraestrutura digital",
            titulo:
              "Transmissão ao vivo, replay, certificado e <accent>suporte</accent> em uma única plataforma.",
            subtitulo:
              "A infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira.",
            ctas: [
              { rotulo: "Acessar EventOn", link: "#eventon", variante: "primario" },
              { rotulo: "Suporte ao participante", link: "#contato", variante: "secundario" },
            ],
          },
        ],
      },
      statusBar: {
        livePillTexto: "Inscrições abertas agora",
        atualizadoEm: "Atualizado · Maio · 2026",
      },
      eventosSecao: {
        eyebrow: "Capacitação e Desenvolvimento",
        titulo: "Eventos com inscrições abertas",
        intro:
          "Seminários, oficinas, jornadas, simpósios e cursos executivos do Grupo NTC, disponíveis para participação individual, inscrição de equipes e contratação institucional.",
      },
      eventosPrincipais: eventosPrincipaisSlugs.map((s) => eventoIds[s]).filter(Boolean),
      eventosSecundarios: eventosSecundariosSlugs.map((s) => eventoIds[s]).filter(Boolean),
      agendaBand: {
        titulo: "Agenda Geral NTC",
        descricao:
          "Consulte todos os eventos, módulos, turmas e capacitações disponíveis no calendário do Grupo NTC.",
        chips: [
          { rotulo: "Educação" },
          { rotulo: "Gestão Pública" },
          { rotulo: "Saúde" },
          { rotulo: "Online" },
          { rotulo: "Presencial" },
          { rotulo: "Híbrido" },
          { rotulo: "Inscrições abertas" },
          { rotulo: "Próximas turmas" },
        ],
        ctaRotulo: "Ver agenda completa",
        ctaLink: "#capacitacao",
      },
      introCurta: {
        headline:
          "O Grupo NTC estrutura programas, eventos, trilhas e soluções institucionais para desenvolver capacidades públicas com rigor, escala e aplicabilidade.",
        corpo:
          "Atuamos em três verticais — NTC Educação, NTC Gestão Pública e NTC Saúde — com 15 programas estruturados, corpo docente especializado e capacidade nacional de entrega para a Administração Pública brasileira.",
        highlights: [
          { num: "15", numEhTexto: false, lbl: "Programas estratégicos\nnas três verticais" },
          { num: "3 áreas", numEhTexto: true, lbl: "Educação · Gestão Pública\n· Saúde" },
          { num: "Eventos e turmas", numEhTexto: true, lbl: "Abertos · Fechados\n· Sob medida" },
        ],
        linkRotulo: "Conheça o Grupo NTC",
        linkHref: "#sobre",
      },
      programasSecao: {
        eyebrow: "Portfólio estruturante",
        titulo: "Programas estratégicos que estruturam a atuação do Grupo NTC",
        intro:
          "Cada programa é uma solução estruturada — com identidade, módulos e coordenação científica próprias — distribuída em três verticais que organizam todo o portfólio.",
        introLinha: "Camada institucional · três áreas estratégicas",
        evidenciaTitulo: "Programas em evidência",
        evidenciaSub: "Seleção comercial · Atualizado para Maio · 2026",
      },
      programasEmEvidencia: programasEvidenciaSlugs.map((s) => programaIds[s]).filter(Boolean),
      areasEmFoco: ["educacao", "gestao-publica", "saude"].map((s) => areaIds[s]).filter(Boolean),
      curadoria: {
        eyebrow: "Curadoria científica · Corpo docente",
        headlineBold: "Ministros e ex-ministros do STF e do TCU.",
        subhead: "Juristas, gestores públicos, pesquisadores e autoridades técnicas.",
        contexto:
          "A curadoria científica do Grupo NTC reúne profissionais de referência nacional nas áreas de Educação, Gestão Pública, Contratações Públicas e Saúde. A composição docente é estruturada conforme o programa, o evento, a demanda institucional e os objetivos de cada contratante.",
        ctaTexto: "Corpo docente completo →",
        ctaLink: "#docentes",
        vitrines: [
          {
            vertical: "gov",
            labelCuradoria: "Curadoria por vertical",
            labelDestaque: "Curadoria técnica <em>nacional</em>",
            nome: "NTC Gestão Pública e Contratações",
            credenciais: [
              { texto: "Juristas e doutrinadores em Direito Administrativo" },
              { texto: "Auditores do TCU e especialistas em Lei 14.133/2021" },
              { texto: "Procuradores federais e gestores públicos" },
              { texto: "Referências em governança, integridade e performance" },
            ],
            cta: "Conhecer curadoria",
            link: "#docentes",
          },
          {
            vertical: "edu",
            labelCuradoria: "Curadoria por vertical",
            labelDestaque: "Curadoria educacional <em>nacional</em>",
            nome: "NTC Educação",
            credenciais: [
              { texto: "Pesquisadores e gestores educacionais de referência" },
              { texto: "Especialistas em alfabetização, currículo e avaliação" },
              { texto: "Autoridades em primeira infância e educação inclusiva" },
              { texto: "Lideranças em transformação digital de redes públicas" },
            ],
            cta: "Conhecer curadoria",
            link: "#docentes",
          },
          {
            vertical: "sau",
            labelCuradoria: "Curadoria por vertical",
            labelDestaque: "Curadoria SUS e <em>saúde pública</em>",
            nome: "NTC Saúde",
            credenciais: [
              { texto: "Gestores do SUS e ex-secretários estaduais" },
              { texto: "Sanitaristas e pesquisadores de referência nacional" },
              { texto: "Especialistas em atenção primária e redes de cuidado" },
              { texto: "Autoridades em saúde digital, financiamento e dados" },
            ],
            cta: "Conhecer curadoria",
            link: "#docentes",
          },
        ],
        rodapeTexto:
          "A curadoria científica do Grupo NTC é construída programa a programa, evento a evento, conforme a demanda institucional do cliente.",
        rodapeCta: "Conhecer corpo docente completo",
      },
      solucoes: {
        eyebrow: "Visão arquitetural",
        titulo: "Soluções estratégicas para o desenvolvimento institucional do setor público",
        corpo:
          "O Grupo NTC organiza sua atuação em uma arquitetura ampla de soluções, que vai além da oferta de eventos abertos — combinando programas, trilhas, jornadas, turmas fechadas e formatos institucionais customizados.",
        lista: [
          { texto: "Programas estratégicos" },
          { texto: "Trilhas formativas" },
          { texto: "Jornadas executivas" },
          { texto: "Eventos abertos" },
          { texto: "Turmas fechadas" },
          { texto: "Soluções in company" },
          { texto: "Projetos institucionais" },
          { texto: "Soluções sob medida" },
        ],
      },
      modalidades: {
        eyebrow: "Modalidades de participação",
        titulo: "Eventos online e eventos presenciais",
        intro:
          "O Grupo NTC opera com forte presença em capitais estratégicas e simultaneamente sustenta uma plataforma digital própria de transmissão e replay.",
        online: {
          titulo: "Eventos online",
          lista: [
            { texto: "Transmissão ao vivo" },
            { texto: "Interação com docentes" },
            { texto: "Replay protegido" },
            { texto: "Certificado" },
            { texto: "Acesso EventOn" },
          ],
          ctaRotulo: "Ver eventos online",
          ctaLink: "#eventos-abertos",
        },
        presencial: {
          titulo: "Eventos presenciais",
          lista: [
            { texto: "Experiência imersiva" },
            { texto: "Networking executivo" },
            { texto: "Capitais estratégicas" },
            { texto: "Certificação" },
            { texto: "Atendimento institucional" },
          ],
          ctaRotulo: "Ver eventos presenciais",
          ctaLink: "#eventos-abertos",
        },
      },
      eventOn: {
        eyebrow: "EventOn · Plataforma do Grupo NTC",
        titulo: "EventOn: acesso, replay e certificado em um só ambiente",
        descricao:
          "O EventOn é a infraestrutura digital dos eventos online do Grupo NTC, reunindo acesso ao vivo, replay protegido, materiais de apoio, suporte ao participante e emissão de certificados.",
        ctas: [
          { rotulo: "Acessar EventOn", link: "#eventon", variante: "gold" },
          { rotulo: "Suporte ao participante", link: "#eventon", variante: "ghost-light" },
        ],
        operacoes: [
          {
            num: "01",
            titulo: "Acessar evento ao vivo",
            descricao: "Sala de transmissão protegida com login e interação com docentes.",
            linkRotulo: "Acessar agora →",
            link: "#eventon",
          },
          {
            num: "02",
            titulo: "Assistir replay",
            descricao: "Conteúdo gravado disponível em prazo determinado para inscritos.",
            linkRotulo: "Ver replays →",
            link: "#eventon",
          },
          {
            num: "03",
            titulo: "Emitir certificado",
            descricao: "Certificado validável por código QR após cumprimento dos requisitos.",
            linkRotulo: "Emitir certificado →",
            link: "#eventon",
          },
          {
            num: "04",
            titulo: "Falar com suporte",
            descricao: "Atendimento dedicado para participantes durante e após o evento.",
            linkRotulo: "Abrir chamado →",
            link: "#eventon",
          },
        ],
      },
      contratacao: {
        eyebrow: "Contratação institucional",
        titulo: "Precisa formar uma equipe, rede ou <em>instituição inteira</em>?",
        descricao:
          "Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas completos, módulos específicos, trilhas formativas e soluções sob medida para secretarias, autarquias, fundações, escolas de governo, redes públicas e órgãos governamentais.",
        ctas: [
          { rotulo: "Solicitar proposta institucional", link: "#contato", variante: "gold" },
          { rotulo: "Inscrever minha equipe", link: "#contato", variante: "ghost-light" },
          { rotulo: "Agendar apresentação", link: "#contato", variante: "ghost-light" },
        ],
        asideTitulo: "Modelos disponíveis",
        modelos: [
          { texto: "Programa completo entregue exclusivamente à instituição contratante" },
          { texto: "Módulos específicos em formato in company" },
          { texto: "Turma fechada presencial, online ou híbrida" },
          { texto: "Trilhas e jornadas curadas para necessidades específicas" },
          { texto: "Soluções sob medida com customização de ementas e cargas" },
          { texto: "Atendimento dedicado para órgãos públicos em todo o país" },
        ],
      },
      diferenciaisSecao: {
        eyebrow: "Diferenciais institucionais",
        titulo: "O que sustenta a entrega do Grupo NTC.",
      },
      diferenciais: [
        {
          num: "01",
          titulo: "Trajetória consolidada",
          descricao:
            "Cerca de duas décadas dedicadas à formação institucional para a Administração Pública brasileira.",
        },
        {
          num: "02",
          titulo: "Excelência docente",
          descricao:
            "Corpo docente formado por especialistas reconhecidos com atuação na gestão pública nacional.",
        },
        {
          num: "03",
          titulo: "Arquitetura programática",
          descricao:
            "Programas estruturados em módulos e trilhas, com ementas, coordenação científica e linha editorial próprias.",
        },
        {
          num: "04",
          titulo: "Aderência ao setor público",
          descricao:
            "Cada programa é desenhado a partir de desafios concretos da Administração Pública, com aplicabilidade direta.",
        },
        {
          num: "05",
          titulo: "Flexibilidade de contratação",
          descricao:
            "Eventos abertos, módulos avulsos, turmas fechadas, trilhas customizadas e soluções in company.",
        },
        {
          num: "06",
          titulo: "Execução nacional",
          descricao:
            "Capacidade operacional para atendimento simultâneo a múltiplos órgãos em diferentes regiões do país.",
        },
        {
          num: "07",
          titulo: "Eventos online e presenciais",
          descricao:
            "Plataforma EventOn própria para transmissão ao vivo e replay; estrutura ativa em capitais estratégicas.",
        },
        {
          num: "08",
          titulo: "Certificação e suporte",
          descricao:
            "Emissão de certificados validáveis e atendimento dedicado ao participante e às instituições contratantes.",
        },
      ],
      numerosImpacto: [
        { valor: "Duas décadas", valorEhTexto: true, rotulo: "De atuação institucional" },
        { valor: "Milhares", valorEhTexto: true, rotulo: "Participantes capacitados" },
        { valor: "Múltiplas regiões", valorEhTexto: true, rotulo: "Eventos realizados" },
        { valor: "Diferentes esferas", valorEhTexto: true, rotulo: "Órgãos públicos atendidos" },
        { valor: "Nacional", valorEhTexto: true, rotulo: "Presença operacional" },
      ],
      numerosDisclaimer:
        "Indicadores institucionais — números exatos sujeitos à validação interna do Grupo NTC.",
      provaInstitucional: {
        eyebrow: "Atuação institucional",
        headline:
          "Atuação junto a órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais em diferentes regiões do país.",
        categorias: [
          { texto: "Secretarias estaduais" },
          { texto: "Prefeituras" },
          { texto: "Autarquias" },
          { texto: "Escolas de governo" },
          { texto: "Redes públicas de ensino" },
          { texto: "Instituições parceiras" },
        ],
        nota: "Logos institucionais serão inseridos após autorização formal de cada órgão.",
      },
      ctaFinal: {
        eyebrow: "Próximos passos",
        titulo: "Encontre a formação certa para sua <em>instituição</em> ou equipe.",
        subtitulo:
          "Participe dos eventos abertos, inscreva sua equipe ou solicite uma proposta institucional para programas, módulos e soluções sob medida.",
        ctas: [
          { rotulo: "Ver eventos com inscrições abertas", link: "#eventos-abertos", variante: "gold" },
          { rotulo: "Solicitar proposta institucional", link: "#contratacao", variante: "ghost-light" },
          { rotulo: "Falar com a equipe", link: "#contato", variante: "ghost-light" },
        ],
        tagline: "— Inteligência institucional. Impacto real. —",
      },
      // Legacy preservado
      ctaInstitucional: {
        titulo: "Precisa formar uma equipe, rede ou instituição inteira?",
        descricao:
          "Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas completos, módulos específicos, trilhas formativas e soluções sob medida.",
        rotuloCta: "Solicitar proposta institucional",
        linkCta: "/contato/proposta",
      },
    } as never,
    overrideAccess: true,
  });
  payload.logger.info("[seed:home-v3] Global Home populado com todos os groups.");
  payload.logger.info("[seed:home-v3] Concluído.");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:home-v3] Falha:", err);
  process.exit(1);
});
