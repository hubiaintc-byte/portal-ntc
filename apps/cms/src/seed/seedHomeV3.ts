/**
 * Seed da Home v3 Premium — Portal Grupo NTC.
 *
 * Fonte: 02_Prototipo_Home_GrupoNTC_v3_Premium.html (textos exatos
 * validados pelo Instituto NTC).
 *
 * O que faz:
 * 1. Resolve as IDs das imagens previamente uploadadas (rode
 *    pnpm payload:seed:imagens-home antes desta).
 * 2. Atualiza imagemHero das 3 Áreas (preenche o required que estava
 *    pendente desde o seed inicial).
 * 3. Atualiza imagemCapa e nomeCompleto dos 15 Programas com os nomes
 *    canônicos do mega-menu do HTML.
 * 4. Cria 4 Especialistas exemplo (foto expert-01..04, idempotente
 *    por slug).
 * 5. Cria 3 Eventos exemplo (PROSUS+ Brasília, PEAR Online, AGIP SP,
 *    idempotente por slug).
 * 6. Popula o Global Home com heroSlider de 6 slides, numerosImpacto,
 *    areasEmFoco, eventosAgendaDestaque, ctaInstitucional.
 *
 * Idempotente: pode rodar várias vezes; updates só alteram os campos
 * sob curadoria desta sessão.
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

/** Converte string|number do Payload em number (postgres adapter usa int). */
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
    cargaHoraria: "8h · 2 noites",
    resumo:
      "Online ao vivo com replay protegido em 30 dias. Estratégias práticas de recomposição da aprendizagem, alfabetização e formação docente, com referências nacionais.",
    inscricaoAberta: true,
  },
  {
    slug: "agip-sp-junho-2026",
    nome: "Integridade e performance nas contratações públicas — fundamentos avançados",
    eyebrow: "NTC Gestão Pública · AGIP · São Paulo",
    imagemArquivo: "area-gestao-publica.png",
    area: "gestao-publica",
    programaSigla: "AGIP",
    dataInicio: "2026-06-18T09:00:00.000Z",
    dataFim: "2026-06-20T18:00:00.000Z",
    modalidade: "hibrido",
    local: { cidade: "São Paulo", estado: "SP" },
    cargaHoraria: "20h · 3 dias",
    resumo:
      "Seminário presencial em São Paulo · 18 a 20 de junho · 20 horas · ministros, juristas e autoridades em Lei 14.133/2021 compõem o painel do programa.",
    inscricaoAberta: true,
  },
];

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  payload.logger.info("[seed:home-v3] Iniciando seed da Home v3 Premium.");

  // ---- 1. Resolve IDs das imagens já uploadadas ----
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

  // ---- 2. Atualiza as 3 Áreas com imagemHero ----
  const areaSlugs: ("educacao" | "gestao-publica" | "saude")[] = [
    "educacao",
    "gestao-publica",
    "saude",
  ];
  const areaIds: Record<string, Id> = {};
  for (const sigla of areaSlugs) {
    const res = await payload.find({
      collection: "areas",
      where: { sigla: { equals: sigla } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    if (res.docs.length === 0) {
      payload.logger.warn(`[seed:home-v3] Área ${sigla} não encontrada (rode seed.ts antes).`);
      continue;
    }
    const area = res.docs[0]!;
    areaIds[sigla] = num(area.id);
    const imagemId = mediaIds[IMAGEM_POR_AREA[sigla]]!;
    await payload.update({
      collection: "areas",
      id: area.id,
      data: {
        imagemHero: imagemId,
        subtituloHero:
          sigla === "educacao"
            ? "Soluções estruturadas para redes públicas de ensino."
            : sigla === "gestao-publica"
              ? "Governança, integridade e performance na Administração Pública."
              : "Inteligência institucional aplicada ao SUS.",
      } as never,
      overrideAccess: true,
      draft: true,
    });
    payload.logger.info(`[seed:home-v3] Área ${sigla} atualizada (id=${area.id}).`);
  }

  // ---- 3. Atualiza nomeCompleto + imagemCapa dos 15 Programas ----
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
      payload.logger.warn(
        `[seed:home-v3] Programa ${programa.sigla} não encontrado (rode seed.ts antes).`,
      );
      continue;
    }
    const doc = res.docs[0]!;
    programaIds[programa.sigla] = num(doc.id);
    const imagemArquivo = IMAGEM_POR_AREA[programa.area];
    await payload.update({
      collection: "programas",
      id: doc.id,
      data: {
        nomeCompleto: programa.nomeCompleto,
        slug,
        imagemCapa: mediaIds[imagemArquivo],
      } as never,
      overrideAccess: true,
      draft: true,
    });
    payload.logger.info(`[seed:home-v3] Programa ${programa.sigla} atualizado (id=${doc.id}).`);
  }

  // ---- 4. Cria 4 especialistas exemplo ----
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
      payload.logger.info(
        `[seed:home-v3] Especialista já existe: ${esp.slug} (id=${existing.docs[0]!.id}).`,
      );
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
    payload.logger.info(`[seed:home-v3] Especialista criado: ${esp.slug} (id=${created.id}).`);
  }

  // ---- 5. Cria 3 eventos exemplo ----
  const eventoIds: Record<string, Id> = {};
  for (const evento of EVENTOS_SEED) {
    const existing = await payload.find({
      collection: "eventos",
      where: { slug: { equals: evento.slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    });
    if (existing.docs.length > 0) {
      eventoIds[evento.slug] = num(existing.docs[0]!.id);
      payload.logger.info(
        `[seed:home-v3] Evento já existe: ${evento.slug} (id=${existing.docs[0]!.id}).`,
      );
      continue;
    }
    const created = await payload.create({
      collection: "eventos",
      data: {
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
      } as never,
      overrideAccess: true,
      draft: true,
    });
    eventoIds[evento.slug] = num(created.id);
    payload.logger.info(`[seed:home-v3] Evento criado: ${evento.slug} (id=${created.id}).`);
  }

  // ---- 6. Popula o Global Home ----
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
            titulo: "O novo padrão da formação <accent>institucional</accent> para a Administração Pública brasileira.",
            subtitulo:
              "Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida para órgãos públicos, redes de ensino, sistemas de saúde e instituições governamentais.",
            ctas: [
              {
                rotulo: "Ver eventos com inscrições abertas",
                link: "/agenda",
                variante: "primario",
              },
              {
                rotulo: "Solicitar proposta institucional",
                link: "/contato/proposta",
                variante: "secundario",
              },
              {
                rotulo: "Conhecer programas estratégicos",
                link: "/programas",
                variante: "textlink",
              },
            ],
          },
          {
            tipo: "evento",
            imagem: mediaIds["area-saude.png"],
            eyebrow: "Evento em destaque · Inscrições abertas",
            titulo: "Governança, financiamento e <accent>performance</accent> no SUS — Brasília 2026.",
            subtitulo:
              "Curso executivo presencial em Brasília · 05 a 07 de junho · 24 horas · com a coordenação científica do NTC Saúde e convidados especialistas em gestão do SUS, governança e financiamento.",
            eventoPill: { data: "05–07 Jun", local: "Brasília", modalidade: "Presencial" },
            ctas: [
              { rotulo: "Inscrever-se", link: "/eventos/prosus-mais-brasilia-2026-junho", variante: "primario" },
              {
                rotulo: "Ver detalhes do evento",
                link: "/eventos/prosus-mais-brasilia-2026-junho",
                variante: "secundario",
              },
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
              { rotulo: "Conhecer evento", link: "/programas/agip", variante: "primario" },
              { rotulo: "Inscrever-se", link: "/eventos/agip-sp-junho-2026", variante: "secundario" },
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
              { rotulo: "Conhecer programa", link: "/programas/pear", variante: "primario" },
              {
                rotulo: "Ver módulos abertos",
                link: "/agenda?programa=PEAR",
                variante: "secundario",
              },
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
              { rotulo: "Solicitar proposta", link: "/contato/proposta", variante: "primario" },
              { rotulo: "Agendar apresentação", link: "/contato", variante: "secundario" },
            ],
          },
          {
            tipo: "eventon",
            imagem: mediaIds["eventon-estudio.png"],
            eyebrow: "EventOn · Plataforma própria · Infraestrutura digital",
            titulo: "Transmissão ao vivo, replay, certificado e <accent>suporte</accent> em uma única plataforma.",
            subtitulo:
              "A infraestrutura digital própria do Grupo NTC para realização de eventos institucionais ao vivo — capacitações, seminários, jornadas executivas e trilhas formativas voltadas à Administração Pública brasileira.",
            ctas: [
              { rotulo: "Acessar EventOn", link: "/eventon", variante: "primario" },
              { rotulo: "Suporte ao participante", link: "/contato", variante: "secundario" },
            ],
          },
        ],
      },
      numerosImpacto: [
        { valor: "20+", rotulo: "Anos de atuação institucional" },
        { valor: "15", rotulo: "Programas estratégicos" },
        { valor: "3", rotulo: "Áreas: Educação · Gestão · Saúde" },
        { valor: "500+", rotulo: "Instituições atendidas" },
      ],
      areasEmFoco: Object.values(areaIds),
      eventosAgendaDestaque: Object.values(eventoIds),
      ctaInstitucional: {
        titulo: "Precisa formar uma equipe, rede ou instituição inteira?",
        descricao:
          "Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas completos, módulos específicos, trilhas formativas e soluções sob medida para secretarias, autarquias, fundações, escolas de governo, redes públicas e órgãos governamentais.",
        rotuloCta: "Solicitar proposta institucional",
        linkCta: "/contato/proposta",
      },
    } as never,
    overrideAccess: true,
  });
  payload.logger.info("[seed:home-v3] Global Home atualizado com heroSlider + numerosImpacto + áreas + eventos + CTA.");

  payload.logger.info("[seed:home-v3] Concluído.");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:home-v3] Falha:", err);
  process.exit(1);
});
