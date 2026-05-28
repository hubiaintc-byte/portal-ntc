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

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const fotos = await uploadFotos(payload);
  payload.logger.info(`[seed:corpo-docente] Fotos OK (${Object.keys(fotos).length}).`);

  const especialistas = await upsertEspecialistasFeatured(payload, fotos);
  payload.logger.info(`[seed:corpo-docente] Especialistas Featured OK (${Object.keys(especialistas).length}).`);

  // TODO próxima task: Global CorpoDocente
  payload.logger.info("[seed:corpo-docente] Etapas 1+2 concluídas (Global na próxima task).");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:corpo-docente] Falha:", err);
  process.exit(1);
});
