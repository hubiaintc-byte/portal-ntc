/**
 * Seed do Corpo Docente — Portal Grupo NTC · Sessão 1 do CMS.
 *
 * O que faz:
 *   1. Upload de fotos genéricas para Media (idempotente).
 *   2. Cria/atualiza Especialistas Featured (~10) via Local API.
 *   3. Atualiza Global CorpoDocente com hero, métricas, manifesto,
 *      cards (featured + axis nesta sessão; experts ficam pra sessão 2),
 *      credibilidade, credenciamento, FAQ, CTA final, sticky.
 *
 * Idempotente para criações; updates em Especialistas e no Global são
 * intencionalmente sobrescritivos.
 *
 * Execução: pnpm payload:seed:corpo-docente
 *
 * Spec: docs/superpowers/specs/2026-05-28-cms-corpo-docente-design.md
 */

import { execSync } from "node:child_process";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

type Id = number;

interface FotoSeed {
  arquivo: string;
  alt: string;
}

const FOTOS: FotoSeed[] = [
  { arquivo: "autoridade-gestao-publica.1920.webp", alt: "Autoridade institucional · Gestão Pública" },
  { arquivo: "autoridade-contratacoes.1920.webp", alt: "Autoridade institucional · Contratações Públicas" },
  { arquivo: "autoridade-educacao.1920.webp", alt: "Autoridade institucional · Educação" },
  { arquivo: "autoridade-saude.1920.webp", alt: "Autoridade institucional · Saúde" },
  { arquivo: "expert-01.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-02.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-03.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-04.1920.webp", alt: "Especialista do corpo docente Grupo NTC" },
];

const MIME_POR_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

/**
 * Resolve o diretório base das fotos.
 *
 * As fotos vivem em `apps/web/public/img/fotos/_optimized/` (gitignored).
 * Em git worktrees, `import.meta.url` aponta para o diretório da worktree,
 * que não tem a pasta `img/` (gitignored). Por isso, resolvemos via
 * `git rev-parse --git-common-dir` para obter o root do repositório
 * principal onde as fotos realmente estão.
 */
function resolverFotosBaseDir(): string {
  const seedDir = path.dirname(new URL(import.meta.url).pathname);
  const localPath = path.resolve(seedDir, "../../../web/public/img/fotos/_optimized");

  // Tenta o caminho local (funciona quando não é worktree ou quando a pasta
  // img/ está presente no worktree).
  try {
    statSync(localPath);
    return localPath;
  } catch {
    // Não existe localmente — tenta via git common dir (worktree).
  }

  try {
    const gitCommonDir = execSync("git rev-parse --git-common-dir", {
      cwd: seedDir,
      encoding: "utf8",
    }).trim();
    // git-common-dir retorna o path do .git/ do repo principal.
    const repoRoot = path.resolve(gitCommonDir, "..");
    return path.join(repoRoot, "apps/web/public/img/fotos/_optimized");
  } catch {
    throw new Error(
      "[seed:corpo-docente] Não foi possível resolver o diretório de fotos. " +
        "Confirme que o repo principal está acessível via git worktree.",
    );
  }
}

type FotoIdMap = Record<string, Id>;

/**
 * Especialistas Featured — extraídos literalmente de
 * apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts
 * (linhas 408-506). Currículo curto = credencial do card. Programas
 * relacionados resolvidos por slug em runtime (Programas precisam
 * existir — seedHomeV3 já cria os 15).
 *
 * Nota: o card de Min. Vital do Rêgo no HTML usa `autoridade-tcu.1920.webp`
 * que não está no nosso set de fotos — substituído por
 * `autoridade-contratacoes.1920.webp` (TCU = controle externo, mesma
 * família visual).
 */
interface EspecialistaFeaturedSeed {
  slug: string;
  nome: string;
  fotoArquivo: string;
  vertical: "educacao" | "gestao-publica" | "saude";
  tipo: "autoridade" | "palestrante" | "doutrinador" | "consultor" | "pesquisador";
  frente?: "contratacoes";
  formacao: "doutorado" | "mestrado" | "especializacao" | "graduacao-experiencia";
  atuacao: ("universidade" | "gestao-publica" | "controle" | "judiciario" | "multilateral" | "terceiro-setor" | "consultoria")[];
  programasSlugs: string[];
  titulacao: "doutorado" | "pos-doutorado" | "mestrado" | "especializacao" | "graduacao";
  instituicao: string;
  curriculoCurtoTexto: string;
}

const ESPECIALISTAS_FEATURED: EspecialistaFeaturedSeed[] = [
  {
    slug: "perfil-luiz-fux",
    nome: "Min. Luiz Fux",
    fotoArquivo: "autoridade-gestao-publica.1920.webp",
    vertical: "gestao-publica",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["judiciario"],
    programasSlugs: ["lidera", "siga"],
    titulacao: "doutorado",
    instituicao: "Supremo Tribunal Federal",
    curriculoCurtoTexto:
      "Ministro do Supremo Tribunal Federal. Autoridade em direito constitucional, jurisdição superior, governança pública e liderança institucional do Estado.",
  },
  {
    slug: "perfil-vital-do-rego",
    nome: "Min. Vital do Rêgo Filho",
    fotoArquivo: "autoridade-contratacoes.1920.webp",
    vertical: "gestao-publica",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["controle"],
    programasSlugs: ["siga", "lidera", "agip"],
    titulacao: "doutorado",
    instituicao: "Tribunal de Contas da União · Presidência",
    curriculoCurtoTexto:
      "Ministro e atual Presidente do Tribunal de Contas da União. Referência em controle externo, governança pública, contas públicas e modernização institucional do Estado brasileiro.",
  },
  {
    slug: "perfil-jorge-jacoby",
    nome: "Jorge Jacoby Fernandes",
    fotoArquivo: "autoridade-contratacoes.1920.webp",
    vertical: "gestao-publica",
    tipo: "doutrinador",
    frente: "contratacoes",
    formacao: "doutorado",
    atuacao: ["universidade", "consultoria"],
    programasSlugs: ["agip"],
    titulacao: "doutorado",
    instituicao: "Doutrina nacional · Licitações e contratos",
    curriculoCurtoTexto:
      "Doutrinador de referência nacional em licitações, contratos administrativos, contratação direta, controle e capacitação de agentes públicos.",
  },
  {
    slug: "perfil-maria-ines-fini",
    nome: "Maria Inês Fini",
    fotoArquivo: "autoridade-educacao.1920.webp",
    vertical: "educacao",
    tipo: "autoridade",
    formacao: "doutorado",
    atuacao: ["gestao-publica", "universidade"],
    programasSlugs: ["proge", "pear", "futura", "edutec"],
    titulacao: "doutorado",
    instituicao: "Avaliação educacional · políticas públicas",
    curriculoCurtoTexto:
      "Coordenadora científica da curadoria educacional do Grupo NTC. Referência nacional em avaliação educacional, ENEM, políticas públicas e formação de redes públicas de ensino.",
  },
];

function richTextFromTexto(texto: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children: [
            { type: "text", format: 0, mode: "normal", style: "", text: texto, version: 1, detail: 0 },
          ],
        },
      ],
    },
  };
}

/**
 * Constrói um documento Lexical inline a partir de texto que pode
 * conter <strong>, <em>, <span class="accent"> e <br>. Implementação
 * mínima — suficiente para os textos institucionais do Corpo Docente.
 *
 * Para o seed inicial, geramos um único parágrafo com texto puro
 * (sem inline formatting Lexical) — as tags HTML viram texto literal
 * e o lexicalToHtml do loader não vai re-aplicá-las. O `<br>` vira
 * linebreak Lexical real. Equipe editorial enriquece a formatação
 * via admin depois.
 */
function richTextInlineHtml(html: string) {
  // <br> vira linebreak Lexical; demais tags inline ficam como texto literal.
  const linhas = html.replace(/<br\s*\/?>/gi, "\n").split("\n");
  const children = linhas.flatMap((linha, i) => {
    const nodes: unknown[] = [
      { type: "text", format: 0, mode: "normal", style: "", text: linha, version: 1, detail: 0 },
    ];
    if (i < linhas.length - 1) nodes.push({ type: "linebreak", version: 1 });
    return nodes;
  });

  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children,
        },
      ],
    },
  };
}

async function uploadFotos(payload: Awaited<ReturnType<typeof getPayload>>): Promise<FotoIdMap> {
  payload.logger.info(`[seed:corpo-docente] Upload de ${FOTOS.length} fotos.`);
  const map: FotoIdMap = {};

  const fotosBaseDir = resolverFotosBaseDir();
  payload.logger.info(`[seed:corpo-docente] Fotos base dir: ${fotosBaseDir}`);

  for (const foto of FOTOS) {
    const existente = await payload.find({
      collection: "media",
      where: { filename: { equals: foto.arquivo } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existente.docs[0]) {
      map[foto.arquivo] = existente.docs[0].id as Id;
      payload.logger.info(`[seed:corpo-docente] mantém ${foto.arquivo} (id=${existente.docs[0].id})`);
      continue;
    }

    const filePath = path.join(fotosBaseDir, foto.arquivo);
    const data = await readFile(filePath);
    const ext = path.extname(foto.arquivo).toLowerCase();
    const mimetype = MIME_POR_EXT[ext];
    if (!mimetype) throw new Error(`MIME desconhecido para ${foto.arquivo}`);

    const criada = await payload.create({
      collection: "media",
      data: { alt: foto.alt },
      file: { data, mimetype, name: foto.arquivo, size: data.length },
      overrideAccess: true,
    });

    map[foto.arquivo] = criada.id as Id;
    payload.logger.info(`[seed:corpo-docente] cria ${foto.arquivo} (id=${criada.id})`);
  }

  return map;
}

async function resolverProgramasIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slugs: string[],
): Promise<Id[]> {
  const ids: Id[] = [];
  for (const slug of slugs) {
    const r = await payload.find({
      collection: "programas",
      where: { slug: { equals: slug } },
      limit: 1,
    });
    if (r.docs[0]) {
      ids.push(r.docs[0].id as Id);
    } else {
      payload.logger.warn(`[seed:corpo-docente] programa '${slug}' não encontrado — pulando.`);
    }
  }
  return ids;
}

type EspecialistaIdMap = Record<string, Id>;

async function upsertEspecialistasFeatured(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fotos: FotoIdMap,
): Promise<EspecialistaIdMap> {
  payload.logger.info(`[seed:corpo-docente] Upsert de ${ESPECIALISTAS_FEATURED.length} Especialistas Featured.`);
  const map: EspecialistaIdMap = {};

  for (const esp of ESPECIALISTAS_FEATURED) {
    const fotoId = fotos[esp.fotoArquivo];
    if (!fotoId) throw new Error(`foto '${esp.fotoArquivo}' não foi carregada (etapa 1).`);

    const programasIds = await resolverProgramasIds(payload, esp.programasSlugs);

    const dadosBase = {
      nome: esp.nome,
      slug: esp.slug,
      foto: fotoId,
      titulacao: esp.titulacao,
      instituicao: esp.instituicao,
      curriculoCurto: richTextFromTexto(esp.curriculoCurtoTexto) as never,
      vertical: esp.vertical,
      tipo: esp.tipo,
      ...(esp.frente ? { frente: esp.frente } : {}),
      formacao: esp.formacao,
      atuacao: esp.atuacao,
      ...(programasIds.length ? { programasRelacionados: programasIds } : {}),
    };

    const existente = await payload.find({
      collection: "especialistas",
      where: { slug: { equals: esp.slug } },
      limit: 1,
    });

    if (existente.docs[0]) {
      const atualizado = await payload.update({
        collection: "especialistas",
        id: existente.docs[0].id,
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = atualizado.id as Id;
      payload.logger.info(`[seed:corpo-docente] atualiza Especialista '${esp.slug}' (id=${atualizado.id})`);
    } else {
      const criado = await payload.create({
        collection: "especialistas",
        data: dadosBase as never,
        overrideAccess: true,
      });
      map[esp.slug] = criado.id as Id;
      payload.logger.info(`[seed:corpo-docente] cria Especialista '${esp.slug}' (id=${criado.id})`);
    }
  }

  return map;
}

async function upsertGlobal(
  payload: Awaited<ReturnType<typeof getPayload>>,
  especialistas: EspecialistaIdMap,
): Promise<void> {
  payload.logger.info("[seed:corpo-docente] Atualizando Global corpo-docente.");

  // Featured cards — link to Especialistas + editorial wrapping
  const cardsFeatured = [
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-luiz-fux"],
      tag: "Autoridade convidada",
      axisBadge: "Gestão Pública · Direito constitucional",
      credencialCard:
        "Ministro do Supremo Tribunal Federal. Autoridade em direito constitucional, jurisdição superior, governança pública e liderança institucional do Estado.",
      metaAtuacao: "Atuação · <strong>Supremo Tribunal Federal</strong>",
      metaEixos: "Eixos relacionados · <strong>LIDERA · SIGA</strong>",
      ctaHref: "/contato?categoria=curadoria-gov#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-vital-do-rego"],
      tag: "Autoridade convidada",
      axisBadge: "Gestão Pública · Controle e governança",
      credencialCard:
        "Ministro e atual Presidente do Tribunal de Contas da União. Referência em controle externo, governança pública, contas públicas e modernização institucional do Estado brasileiro.",
      metaAtuacao:
        "Atuação · <strong>Tribunal de Contas da União · Presidência</strong>",
      metaEixos: "Eixos relacionados · <strong>SIGA · LIDERA · AGIP</strong>",
      ctaHref: "/contato?categoria=curadoria-gov#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-jorge-jacoby"],
      tag: "Doutrinador de referência nacional",
      axisBadge: "Contratações · Doutrina nacional",
      credencialCard:
        "Doutrinador de referência nacional em licitações, contratos administrativos, contratação direta, controle e capacitação de agentes públicos.",
      metaAtuacao:
        "Atuação · <strong>Licitações · contratos · controle · capacitação pública</strong>",
      metaEixos: "Eixo relacionado · <strong>AGIP</strong> · Núcleo Contratações",
      ctaHref: "/contato?categoria=curadoria-cp#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
    {
      formato: "featured" as const,
      especialista: especialistas["perfil-maria-ines-fini"],
      tag: "Coordenação científica · Educação",
      axisBadge: "Educação · Avaliação e políticas públicas",
      credencialCard:
        "Coordenadora científica da curadoria educacional do Grupo NTC. Referência nacional em avaliação educacional, ENEM, políticas públicas e formação de redes públicas de ensino.",
      metaAtuacao:
        "Atuação · <strong>Avaliação educacional · políticas públicas · redes de ensino</strong>",
      metaEixos:
        "Eixos relacionados · <strong>PROGE · PEAR · FUTURA · EDUTEC</strong>",
      ctaHref: "/contato?categoria=curadoria-edu#tab-proposta",
      ctaRotulo: "Consultar disponibilidade",
    },
  ].filter((c) => c.especialista !== undefined);

  // Axis Saúde cards — narratives without person relation
  const cardsAxis = [
    {
      formato: "axis" as const,
      area: "governanca-sus",
      axisTag: "Frente 01 · Saúde",
      tituloAxis: "Gestão do SUS e governança",
      credencialAxis:
        "Lideranças com trajetória em secretarias, conselhos, órgãos reguladores e estruturas decisórias da saúde pública. Curadoria em composição estratégica conforme objeto da contratação.",
      programasTextoAxis: "Eixos relacionados · ",
      programasStrongAxis: "SIGS · PROSUS+",
      ctaHref: "/contato?categoria=curadoria-saude#tab-proposta",
      ctaRotulo: "Solicitar caderno docente",
      styleAccent: "var(--oliva)",
      styleAccentDark: "#2B3E12",
      iconeSvgInner:
        '<path d="M32 8L8 20v18c0 14 11 22 24 26 13-4 24-12 24-26V20L32 8z"/><path d="M32 24v18M24 32l8 8 8-8"/>',
    },
    {
      formato: "axis" as const,
      area: "aps",
      axisTag: "Frente 02 · Saúde",
      tituloAxis: "Atenção primária e redes de cuidado",
      credencialAxis:
        "Especialistas em APS, ESF, resolutividade, coordenação de redes, modelos assistenciais integrados e implementação territorial da Política Nacional de Atenção Básica.",
      programasTextoAxis: "Eixo relacionado · ",
      programasStrongAxis: "PROAPS+",
      ctaHref: "/contato?categoria=curadoria-saude#tab-proposta",
      ctaRotulo: "Solicitar caderno docente",
      styleAccent: "var(--oliva)",
      styleAccentDark: "#2B3E12",
      iconeSvgInner:
        '<circle cx="32" cy="32" r="20"/><path d="M32 18v14l10 6M18 22l-4-4M46 22l4-4M14 50l4-4M50 46l-4-4"/>',
    },
    {
      formato: "axis" as const,
      area: "saude-digital",
      axisTag: "Frente 03 · Saúde",
      tituloAxis: "Saúde digital, dados e IA",
      credencialAxis:
        "Profissionais com atuação em transformação digital do SUS, interoperabilidade, prontuário eletrônico, telessaúde, dados clínicos e inteligência artificial aplicada.",
      programasTextoAxis: "Eixo relacionado · ",
      programasStrongAxis: "SIGS",
      ctaHref: "/contato?categoria=curadoria-saude#tab-proposta",
      ctaRotulo: "Solicitar caderno docente",
      styleAccent: "var(--oliva)",
      styleAccentDark: "#2B3E12",
      iconeSvgInner:
        '<rect x="10" y="14" width="44" height="30" rx="3"/><path d="M22 50h20M28 44v6M36 44v6M18 24h10M18 32h6M30 28h18"/>',
    },
    {
      formato: "axis" as const,
      area: "planejamento-financiamento-saude",
      axisTag: "Frente 04 · Saúde",
      tituloAxis: "Planejamento, financiamento e performance",
      credencialAxis:
        "Referências em Plano de Saúde, PAS, RAG, SIOPS, financiamento público da saúde, sustentabilidade do sistema, indicadores e capacidade institucional de decisão.",
      programasTextoAxis: "Eixos relacionados · ",
      programasStrongAxis: "SIGS · PROSUS+",
      ctaHref: "/contato?categoria=curadoria-saude#tab-proposta",
      ctaRotulo: "Solicitar caderno docente",
      styleAccent: "var(--oliva)",
      styleAccentDark: "#2B3E12",
      iconeSvgInner:
        '<path d="M8 50h48M14 42v8M24 32v18M34 24v26M44 36v14M54 14v36"/>',
    },
    {
      formato: "axis" as const,
      area: "regulacao-compliance-saude",
      axisTag: "Frente 05 · Saúde",
      tituloAxis: "Regulação, controle, compliance e qualidade",
      credencialAxis:
        "Regulação assistencial, auditoria SUS, compliance público, segurança do paciente, qualidade assistencial e controle interno do sistema de saúde.",
      programasTextoAxis: "Eixos relacionados · ",
      programasStrongAxis: "SIGS · PROSUS+",
      ctaHref: "/contato?categoria=curadoria-saude#tab-proposta",
      ctaRotulo: "Solicitar caderno docente",
      styleAccent: "var(--oliva)",
      styleAccentDark: "#2B3E12",
      iconeSvgInner:
        '<path d="M32 8L10 18v16c0 14 10 22 22 24 12-2 22-10 22-24V18L32 8z"/><path d="M24 32l6 6 12-12"/>',
    },
  ];

  const cards = [...cardsFeatured, ...cardsAxis];

  await payload.updateGlobal({
    slug: "corpo-docente",
    overrideAccess: true,
    data: {
      hero: {
        eyebrow: "Curadoria nacional · Instituto NTC do Brasil · Edição 2026",
        titulo: richTextInlineHtml(
          'Corpo Docente <span class="accent">do Grupo NTC</span>.<br>Autoridades, pesquisadores, gestores, doutrinadores e palestrantes que sustentam nossos programas.',
        ),
        subtitulo: richTextInlineHtml(
          'Uma curadoria nacional de especialistas em Educação, Gestão Pública, Contratações Públicas e Saúde — mobilizada por eixo formativo, programa, perfil da instituição contratante e objetivo da formação. <em>Contratações Públicas integra a NTC Gestão Pública como núcleo técnico especializado.</em>',
        ),
        quicklinks: [
          { tipo: "anchor", rotulo: "Ver toda a curadoria", href: "#especialistas" },
          { tipo: "tab", rotulo: "Educação", vertShortcut: "educacao" },
          { tipo: "tab", rotulo: "Gestão Pública", vertShortcut: "gestao-publica" },
          { tipo: "tab", rotulo: "Contratações Públicas", vertShortcut: "contratacoes" },
          { tipo: "tab", rotulo: "Saúde", vertShortcut: "saude" },
          { tipo: "anchor", rotulo: "Credenciar especialista", href: "#credenciamento" },
        ],
      },
      metricas: [
        {
          classe: "is-edu",
          sublabel: "NTC Educação",
          num: "60",
          label: "Especialistas e referências técnicas",
          detalhe:
            "Alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
        },
        {
          classe: "is-gov",
          sublabel: "NTC Gestão Pública",
          num: "31",
          label: "Autoridades e especialistas",
          detalhe:
            "Ministros, pensadores, juristas, gestores públicos, conferencistas nacionais e referências em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
        },
        {
          classe: "is-cpr",
          sublabel: "Núcleo Contratações Públicas · Frente da NTC Gestão Pública",
          num: "31",
          label: "Autoridades, doutrinadores e especialistas",
          detalhe:
            "Núcleo técnico especializado com foco em Lei 14.133/2021, licitações, contratos, controle externo, TCU, concessões, PPPs, obras públicas, infraestrutura, compliance e gestão contratual.",
        },
        {
          classe: "is-sau",
          sublabel: "NTC Saúde",
          num: "5",
          label: "Frentes técnicas em Saúde Pública",
          detalhe:
            "Governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde — curadoria especializada em composição estratégica.",
        },
      ],
      marker: "Arquitetura da curadoria",
      tituloManifesto: richTextInlineHtml(
        "Uma rede nacional de especialistas, organizada por <em>área, programa e demanda institucional</em>.",
      ),
      lede:
        "O Corpo Docente do Grupo NTC não é uma lista fixa de professores. É uma curadoria técnica, científica e institucional, mobilizada conforme o eixo formativo, o programa, o perfil da instituição contratante e os objetivos de cada entrega.",
      archCards: [
        {
          area: "educacao",
          eyebrow: "NTC Educação · Área estratégica",
          tituloArch: "Educação",
          descricao:
            "Especialistas em alfabetização, gestão escolar, educação digital, IA, primeira infância, inclusão, convivência, avaliação, ensino médio e políticas educacionais.",
          selo: "60 especialistas e referências técnicas",
        },
        {
          area: "gestao-publica",
          eyebrow: "NTC Gestão Pública · Área estratégica",
          tituloArch: "Gestão Pública",
          descricao:
            "Autoridades, pensadores, juristas, gestores públicos e conferencistas nacionais em liderança, governança, ética, direito público, políticas públicas, Estado e modernização institucional.",
          selo: "31 autoridades e especialistas",
        },
        {
          area: "contratacoes",
          eyebrow: "Frente especializada da NTC Gestão Pública",
          tituloArch: "Contratações Públicas",
          descricao:
            "Núcleo técnico especializado da NTC Gestão Pública, reunindo autoridades, doutrinadores, ministros, auditores, juristas e especialistas em Lei 14.133/2021, licitações, contratos, controle externo, concessões, PPPs, obras e gestão contratual.",
          selo: "Núcleo especializado · 31 nomes",
        },
        {
          area: "saude",
          eyebrow: "NTC Saúde · Área estratégica",
          tituloArch: "Saúde",
          descricao:
            "Curadoria especializada em governança do SUS, atenção primária, redes de cuidado, saúde digital, dados, IA, financiamento, performance, regulação e liderança em saúde.",
          selo: "5 frentes técnicas em Saúde Pública",
        },
      ],
      camadas: [
        { num: "01", tituloCamada: "Autoridades de referência", descricao: "Ministros, conselheiros, dirigentes, ex-presidentes de órgãos e lideranças de alta projeção." },
        { num: "02", tituloCamada: "Palestrantes e pensadores", descricao: "Nomes ligados à liderança, ética, comportamento, comunicação, cultura institucional e alta performance." },
        { num: "03", tituloCamada: "Doutrinadores e técnicos", descricao: "Juristas, autores, professores, pareceristas, auditores e especialistas setoriais." },
        { num: "04", tituloCamada: "Consultores sêniores", descricao: "Profissionais com experiência aplicada em redes públicas, órgãos, secretarias e tribunais." },
        { num: "05", tituloCamada: "Pesquisadores e coordenação científica", descricao: "Perfis acadêmicos, coordenadores científicos e especialistas em metodologia e produção técnica." },
      ],
      callout: {
        tituloCallout: "Por que Contratações Públicas aparece separada?",
        descricao:
          "Contratações Públicas integra a NTC Gestão Pública, mas possui núcleo próprio de curadoria em razão de sua densidade técnica, volume de especialistas, relevância jurídica e importância programática no AGIP. Por isso, aparece como frente destacada — sem ser tratada como uma quarta vertical institucional.",
      },
      nota: richTextInlineHtml(
        "A composição docente é definida <strong>caso a caso</strong>, conforme programa, eixo, formato, perfil da instituição contratante e objetivo da formação. O Instituto NTC do Brasil não opera com corpo docente fixo permanente.",
      ),
      cards,
      credibilidade: {
        eyebrow: "Duas décadas de trajetória nacional",
        tituloCredibilidade: richTextInlineHtml(
          "A curadoria docente do Grupo NTC é respaldada por <em>mais de 20 anos</em> de atuação nacional.",
        ),
        lede:
          "Centenas de eventos realizados e milhares de agentes públicos capacitados em formações presenciais, on-line e híbridas. Essa trajetória sustenta a seleção de especialistas, a composição de programas e a entrega de soluções sob medida para instituições públicas brasileiras.",
        items: [
          { num: "20+", label: "Anos de atuação nacional", detalhe: "Trajetória institucional ininterrupta de formação de quadros públicos brasileiros — Instituto NTC do Brasil." },
          { num: "500+", label: "Eventos realizados", detalhe: "300+ encontros presenciais e 200+ online — seminários, jornadas, oficinas, cursos executivos, simpósios e congressos." },
          { num: "400 mil+", label: "Agentes capacitados", detalhe: "Servidores federais, estaduais e municipais formados em todas as áreas estratégicas do Grupo NTC." },
          { num: "98%", label: "Índice de satisfação", detalhe: "Avaliação positiva consolidada de participantes em eventos abertos e formações in company." },
        ],
        rodape: richTextInlineHtml(
          'Atuação junto a · <strong>Órgãos federais · Governos estaduais · Municípios · Secretarias · Redes públicas · Sistema de Saúde · Órgãos de controle · Legislativo · Autarquias e fundações</strong>',
        ),
      },
      credenciamento: {
        eyebrow: "Credenciamento de especialistas",
        tituloCredenciamento: richTextInlineHtml(
          "Você é pesquisador, gestor ou formador e quer integrar o <em>corpo docente</em> do Grupo NTC?",
        ),
        descricao:
          "O Grupo NTC mantém um processo contínuo de credenciamento de especialistas para os 22 eixos formativos das três verticais. A curadoria científica avalia currículo, trajetória institucional, produção acadêmica e experiência aplicada antes de qualquer convite operacional.",
        lista: [
          { texto: "Atuação por programa ou eixo — você indica os territórios onde tem autoridade técnica comprovada." },
          { texto: "Modalidades de atuação: docente convidado, consultor sênior, pesquisador associado ou curadoria de referência." },
          { texto: "Cadastro institucional preserva LGPD desde o primeiro contato. Você controla seus dados." },
          { texto: "Sem exclusividade — você pode atuar no Grupo NTC e em outras frentes acadêmicas e institucionais simultaneamente." },
        ],
        ctas: [
          { rotulo: "Enviar cadastro de especialista", href: "/contato?categoria=credenciamento#tab-atendimento", variante: "gold" },
          // Original tinha "secondary" (en) — mapeado para "secundario" (pt) que é o que o CMS aceita
          { rotulo: "Conversar com a curadoria", href: "/contato#tab-atendimento", variante: "secundario" },
        ],
        aside: {
          eyebrow: "O que precisa estar pronto",
          tituloAside: "Material institucional mínimo",
          intro: "Para acelerar o processo de avaliação pela curadoria científica, tenha em mãos antes de enviar:",
          checklist: [
            { texto: "Currículo Lattes atualizado" },
            { texto: "Áreas de atuação e eixos do Grupo NTC" },
            { texto: "3 publicações ou produções relevantes" },
            { texto: "2 referências institucionais" },
            { texto: "Experiência aplicada em rede pública" },
            { texto: "Disponibilidade e expectativa de honorários" },
          ],
          nota: "A análise inicial dura até 10 dias úteis. Em caso de adequação, a curadoria agenda uma conversa de alinhamento institucional antes do credenciamento formal.",
        },
      },
      faqItems: [
        {
          id: "faq-1",
          pergunta: "Por que Contratações Públicas aparece separada de Gestão Pública?",
          parags: [
            { texto: "Contratações Públicas <strong>integra a área NTC Gestão Pública</strong>, mas possui núcleo próprio de curadoria em razão de sua densidade técnica, volume de especialistas, relevância jurídica e importância programática no AGIP. Por isso, a página apresenta essa frente separadamente — <strong>sem tratá-la como uma quarta vertical institucional</strong>." },
            { texto: "A arquitetura-mãe do Grupo NTC permanece composta por três áreas estratégicas: Educação, Gestão Pública e Saúde. Contratações Públicas é uma frente especializada da NTC Gestão Pública." },
          ],
        },
        {
          id: "faq-2",
          pergunta: "A composição docente é fixa?",
          parags: [
            { texto: "Não. A composição docente é definida <strong>conforme programa, eixo, formato, perfil da instituição contratante e objetivo da formação</strong>. O Grupo NTC trabalha com uma rede de autoridades, especialistas e consultores mobilizados de forma estratégica para cada entrega." },
            { texto: "Cada turma fechada, in company ou jornada executiva recebe uma equipe operacional dimensionada caso a caso, com nomes reais e currículos completos apresentados em proposta formal." },
          ],
        },
        {
          id: "faq-3",
          pergunta: "Como o Grupo NTC seleciona os especialistas?",
          parags: [
            { texto: "A curadoria científica é orientada por três critérios cumulativos: <strong>autoridade técnica comprovada</strong> (produção acadêmica, atuação em rede, publicações), <strong>experiência aplicada</strong> em políticas públicas brasileiras (gestão de Estado, controle, redes públicas, organismos multilaterais) e <strong>capacidade pedagógica</strong> de formação de quadros executivos. Cada eixo formativo tem critérios específicos validados pelo conselho científico do Grupo." },
            { texto: "A curadoria é dinâmica — os especialistas são convocados por programa, eixo e demanda institucional, sem corpo docente fixo permanente." },
          ],
        },
        {
          id: "faq-4-camadas",
          pergunta: "Quais são as 5 camadas de curadoria do Grupo NTC?",
          parags: [
            { texto: "<strong>1 · Autoridades de referência</strong>: ministros, conselheiros, ex-presidentes de órgãos nacionais, autoridades de Estado, grandes nomes institucionais e lideranças de alta projeção." },
            { texto: "<strong>2 · Palestrantes e pensadores nacionais</strong>: nomes voltados à liderança, ética, comportamento, cultura institucional, comunicação, propósito e alta performance pública." },
            { texto: "<strong>3 · Especialistas técnicos e doutrinadores</strong>: juristas, professores, autores, pareceristas, auditores, especialistas setoriais e referências técnicas de cada campo." },
            { texto: "<strong>4 · Consultores sêniores</strong>: profissionais com atuação prática em redes públicas, órgãos, secretarias, tribunais, sistemas de saúde, escolas de governo e projetos institucionais." },
            { texto: "<strong>5 · Pesquisadores associados e coordenação científica</strong>: perfis acadêmicos, pesquisadores, coordenadores científicos, especialistas em metodologia, produção técnica e curadoria pedagógica." },
          ],
        },
        {
          id: "faq-4",
          pergunta: "Posso escolher os especialistas que vão atuar na turma in company da minha instituição?",
          parags: [
            { texto: "Sim, parcialmente. Em contratações in company, a curadoria do Grupo NTC apresenta uma <strong>composição docente sugerida</strong> calibrada para a instituição contratante, o eixo formativo e os resultados esperados. A instituição pode validar essa composição, sugerir substituições por especialistas equivalentes da curadoria ou indicar nomes complementares — desde que estes passem pela validação científica do Grupo." },
            { texto: "Não há cobrança adicional por escolha de docentes da curadoria — a calibragem da equipe está incluída no escopo da contratação institucional." },
          ],
        },
        {
          id: "faq-5",
          pergunta: "Como me cadastrar para integrar o corpo docente do Grupo NTC?",
          parags: [
            { texto: "O credenciamento ocorre em três passos: <strong>(1)</strong> envio do cadastro institucional com currículo Lattes, áreas de atuação e referências; <strong>(2)</strong> análise pela curadoria científica em até 10 dias úteis; <strong>(3)</strong> conversa de alinhamento institucional caso haja adequação aos eixos formativos. Após o credenciamento formal, o especialista entra no banco da curadoria e pode ser convocado por programa ou demanda institucional." },
            { texto: "O cadastro é feito pelo canal de credenciamento desta página ou pelo formulário institucional da página de Contato." },
          ],
        },
        {
          id: "faq-6",
          pergunta: "O Grupo NTC remunera os especialistas convidados? Há exclusividade?",
          parags: [
            { texto: "Sim — toda atuação docente no Grupo NTC é remunerada conforme tabela institucional, escopo da contratação (in company · turma fechada · sob medida) e tipo de vínculo (curadoria · convidado · consultor · pesquisador). Os valores são acordados em contrato individual antes da entrega." },
            { texto: "Não há cláusula de exclusividade. O especialista pode atuar no Grupo NTC e em outras frentes acadêmicas, consultivas ou institucionais simultaneamente, desde que não haja conflito de interesse explícito com um programa em curso." },
          ],
        },
        {
          id: "faq-7",
          pergunta: "Como funciona a propriedade intelectual de materiais produzidos pelos especialistas?",
          parags: [
            { texto: "Materiais didáticos, slides, apostilas, mentorias e atividades produzidos especificamente para um programa do Grupo NTC ficam regulados por contrato individual. Em regra: o Grupo NTC licencia o material para uso no programa, evento ou jornada contratada; o especialista preserva os direitos autorais para uso em sua atuação independente (publicações próprias, cursos próprios, atuação acadêmica)." },
            { texto: "Quando há produção autoral (livros, capítulos, artigos), os créditos seguem o padrão acadêmico, com menção institucional do Grupo NTC quando o material for fruto da atuação contratada." },
          ],
        },
        {
          id: "faq-8",
          pergunta: "Como o Grupo NTC trata os dados pessoais dos especialistas (LGPD)?",
          parags: [
            { texto: "O cadastro institucional do especialista é tratado conforme a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018). Os dados são coletados apenas para a finalidade declarada (avaliação pela curadoria + composição operacional de turmas), retidos pelo período necessário ao vínculo contratual ou enquanto o especialista mantiver interesse em ser considerado, e nunca compartilhados com terceiros sem consentimento explícito." },
            { texto: "O Encarregado de Dados (DPO) do Grupo NTC é <strong>dpo@institutontc.com.br</strong> · qualquer especialista pode solicitar acesso, correção ou exclusão dos próprios dados a qualquer tempo." },
          ],
        },
      ],
      ctaFinal: {
        eyebrow: "Composição docente sob medida",
        tituloCtaFinal: richTextInlineHtml(
          "Monte a equipe de especialistas <em>para a sua instituição</em>.",
        ),
        descricao:
          "Solicite uma composição docente alinhada ao seu programa, eixo formativo, perfil dos participantes e objetivos institucionais. A curadoria científica do Grupo NTC dimensiona a equipe operacional ideal para cada entrega — turma fechada, in company, jornada executiva ou solução sob medida.",
        ctaPrincipal: {
          rotulo: "Solicitar composição docente para minha instituição",
          href: "/contato?categoria=composicao-docente#tab-proposta",
          variante: "gold",
        },
        ctaSecundario: {
          rotulo: "Agendar conversa com a curadoria",
          href: "/contato#tab-atendimento",
          variante: "ghost-light",
        },
        separadorAreas: "— Solicitação direta por área estratégica —",
        ctasArea: [
          { rotulo: "Curadoria para rede de ensino", href: "/contato?categoria=curadoria-edu#tab-proposta" },
          { rotulo: "Curadoria para lideranças públicas", href: "/contato?categoria=curadoria-gov#tab-proposta" },
          { rotulo: "Especialistas em Lei 14.133/2021", href: "/contato?categoria=curadoria-cp#tab-proposta" },
          { rotulo: "Curadoria para equipes do SUS", href: "/contato?categoria=curadoria-saude#tab-proposta" },
        ],
      },
      stickyCta: {
        rotulo: "Solicitar proposta institucional",
        href: "/contato#tab-proposta",
      },
    } as never,
  });

  payload.logger.info("[seed:corpo-docente] Global corpo-docente atualizado.");
}

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const fotos = await uploadFotos(payload);
  payload.logger.info(`[seed:corpo-docente] Fotos OK (${Object.keys(fotos).length}).`);

  const especialistas = await upsertEspecialistasFeatured(payload, fotos);
  payload.logger.info(`[seed:corpo-docente] Especialistas Featured OK (${Object.keys(especialistas).length}).`);

  await upsertGlobal(payload, especialistas);

  payload.logger.info("[seed:corpo-docente] Concluído (3 etapas).");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:corpo-docente] Falha:", err);
  process.exit(1);
});
