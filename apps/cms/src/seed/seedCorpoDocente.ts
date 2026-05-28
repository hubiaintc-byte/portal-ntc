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

async function main(): Promise<void> {
  const payload = await getPayload({ config });

  const fotos = await uploadFotos(payload);
  payload.logger.info(`[seed:corpo-docente] Fotos OK (${Object.keys(fotos).length}).`);

  // TODO próximas tasks: especialistas + global
  payload.logger.info("[seed:corpo-docente] Etapa fotos concluída (etapas 2+3 nas próximas tasks).");
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:corpo-docente] Falha:", err);
  process.exit(1);
});
