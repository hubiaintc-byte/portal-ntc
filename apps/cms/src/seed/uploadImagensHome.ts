/**
 * Seed de upload de imagens da Home v3 Premium.
 *
 * Lê arquivos locais em `apps/cms/src/seed/assets/` e os envia para o
 * Supabase Storage como documentos da coleção Media (prefix `home/`).
 *
 * Idempotente: verifica `filename` no Payload antes de criar — se já
 * existe, mantém. Rode quantas vezes precisar.
 *
 * Execução:
 *   pnpm --filter @ntc/cms payload run src/seed/uploadImagensHome.ts
 * ou
 *   pnpm payload:seed:imagens-home
 */

import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

interface ImagemSeed {
  /** Nome do arquivo em apps/cms/src/seed/assets/. */
  arquivo: string;
  /** Alt institucional (CLAUDE.md §10 — a11y). */
  alt: string;
  /** Crédito opcional (CMS Media.credito). */
  credito?: string;
}

/**
 * Manifesto canônico das imagens da Home v3 Premium. Cada `alt` foi
 * escrito como descrição editorial — substitui imagens decorativas
 * apenas quando puramente decorativas (alt vazio).
 *
 * Imagens auxiliares (autoridade-*, conteudo-*, sintese-*) ficam para
 * sessões futuras (programas, conteúdos); aqui carregamos apenas o
 * que a Home v3 efetivamente consome.
 */
const IMAGENS: ImagemSeed[] = [
  { arquivo: "hero-principal.jpg", alt: "Plenário público com mesa institucional ao fundo" },
  { arquivo: "area-saude.png", alt: "Profissionais do SUS em reunião executiva" },
  { arquivo: "area-gestao-publica.png", alt: "Auditório com autoridades em sessão da administração pública" },
  { arquivo: "area-educacao.jpg", alt: "Sala de aula com alunos em rede pública de ensino" },
  // contratacao.jpg do prototipo é na verdade PNG; o Payload/Sharp salva como .png
  // ao detectar o mime real. Mantemos o registro como .png para preservar
  // idempotência do seed.
  { arquivo: "contratacao.png", alt: "Mãos sobre mesa institucional em acordo de contratação" },
  { arquivo: "eventon-estudio.png", alt: "Estúdio de transmissão ao vivo da plataforma EventOn" },
  { arquivo: "expert-01.png", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-02.png", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-03.png", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "expert-04.png", alt: "Especialista do corpo docente Grupo NTC" },
  { arquivo: "plenario-publico.png", alt: "Plenário público em sessão institucional" },
  { arquivo: "solucoes-lab.png", alt: "Mesa de trabalho com material de planejamento estratégico" },
];

const MIME_POR_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  payload.logger.info(
    `[seed:imagens-home] Iniciando upload de ${IMAGENS.length} imagens para o Supabase Storage.`,
  );

  const baseDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "assets");

  let criadas = 0;
  let mantidas = 0;
  let faltando = 0;

  for (const img of IMAGENS) {
    const filePath = path.join(baseDir, img.arquivo);

    try {
      await stat(filePath);
    } catch {
      payload.logger.warn(
        `[seed:imagens-home] Arquivo ausente em assets/: ${img.arquivo}. Pulando.`,
      );
      faltando++;
      continue;
    }

    const ext = path.extname(img.arquivo).toLowerCase();
    const mime = MIME_POR_EXT[ext];
    if (!mime) {
      payload.logger.warn(
        `[seed:imagens-home] Extensão não suportada: ${img.arquivo}. Pulando.`,
      );
      faltando++;
      continue;
    }

    // O storage S3 do Payload (configurado em payload.config.ts) já
    // usa prefix "media" global. Mantemos o filename plano para que a
    // checagem de duplicidade funcione e o Payload não sanitize barras.
    const filenameDestino = img.arquivo;
    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: filenameDestino } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      payload.logger.info(
        `[seed:imagens-home] Já existe: ${filenameDestino} (id=${existing.docs[0]!.id}).`,
      );
      mantidas++;
      continue;
    }

    const buffer = await readFile(filePath);
    const fileSize = buffer.byteLength;

    const created = await payload.create({
      collection: "media",
      data: {
        alt: img.alt,
        credito: img.credito,
        arquivoOriginal: true,
      },
      file: {
        data: buffer,
        mimetype: mime,
        name: filenameDestino,
        size: fileSize,
      },
      overrideAccess: true,
    });

    payload.logger.info(
      `[seed:imagens-home] Criada: ${filenameDestino} (id=${created.id}, ${Math.round(fileSize / 1024)}KB).`,
    );
    criadas++;
  }

  payload.logger.info(
    `[seed:imagens-home] Concluído. Criadas: ${criadas}, mantidas: ${mantidas}, faltando: ${faltando}.`,
  );
  process.exit(0);
}

void main().catch((err) => {
  console.error("[seed:imagens-home] Falha:", err);
  process.exit(1);
});
