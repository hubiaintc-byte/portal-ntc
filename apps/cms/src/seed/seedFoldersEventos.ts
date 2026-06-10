/**
 * Vincular folders PDF aos Eventos — Portal Grupo NTC.
 *
 * Lê uma pasta com PDFs de folder no padrão de nome
 * "Folder · Módulo NN PROGRAMA · … .pdf" (ex.: "Folder · Módulo 01 EDUTEC ·
 * Cultura Digital … 2026 - Nova Data.pdf"), deriva o slug do evento
 * (`<programa>-mNN-2026`), sobe cada PDF para a coleção `media` e aponta o
 * campo `folderPdf` do Evento correspondente.
 *
 * NÃO cria eventos (slug sem evento no CMS é reportado e pulado), NÃO mexe
 * em outros campos e NÃO deleta a Media antiga (só re-vincula — reversível).
 *
 * O vínculo grava SEM draft:true, reenviando o `_status` atual do evento —
 * o site lê o registro publicado (overrideEventoOnline), então gravar em
 * rascunho deixaria o folder invisível. Mesma regra do enviarMidiaEvento.
 *
 * Uso:
 *   pnpm payload:seed:folders -- "/caminho/da/pasta"            # grava
 *   pnpm payload:seed:folders -- "/caminho/da/pasta" --dry-run  # só relatório
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

/**
 * Extrai (programa, módulo) do nome do arquivo e monta o slug do evento.
 * "Folder · Módulo 03 PROGE · …" → "proge-m03-2026". Normaliza NFC antes
 * (macOS grava nomes em NFD e o regex com acento falharia).
 */
function slugDoArquivo(nomeArquivo: string): string | null {
  const nome = nomeArquivo.normalize("NFC");
  const m = nome.match(/M[óo]dulo\s+(\d{2})\s+([A-ZÀ-Ü]+)/i);
  if (!m) return null;
  return `${m[2]!.toLowerCase()}-m${m[1]}-2026`;
}

async function vincularFolders(pastaArg: string, dryRun: boolean): Promise<void> {
  const payload = await getPayload({ config });
  const pasta = path.resolve(process.cwd(), pastaArg);
  payload.logger.info(
    `[seed:folders] Pasta: ${pasta}${dryRun ? "  (DRY-RUN — nada será gravado)" : ""}`,
  );

  const entradas = await readdir(pasta, { withFileTypes: true });
  const pdfs = entradas
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
    .map((e) => e.name)
    .filter((n) => /folder/i.test(n.normalize("NFC")));

  if (pdfs.length === 0) {
    payload.logger.warn(`[seed:folders] Nenhum PDF de folder na raiz de ${pasta}.`);
    return;
  }

  const vinculados: string[] = [];
  const semSlug: string[] = [];
  const semEvento: { arquivo: string; slug: string }[] = [];

  for (const arquivo of pdfs) {
    const slug = slugDoArquivo(arquivo);
    if (!slug) {
      semSlug.push(arquivo);
      continue;
    }

    const res = await payload.find({
      collection: "eventos",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    });
    const evento = res.docs[0] as
      | { id: number; nome?: string; _status?: "draft" | "published" | null }
      | undefined;
    if (!evento) {
      semEvento.push({ arquivo, slug });
      continue;
    }

    if (dryRun) {
      vinculados.push(`${arquivo}  →  ${slug} (evento ${evento.id})`);
      continue;
    }

    const data = await readFile(path.join(pasta, arquivo));
    const media = await payload.create({
      collection: "media",
      data: { alt: `Folder do evento ${evento.nome ?? slug}` },
      file: { data, mimetype: "application/pdf", name: arquivo, size: data.length },
      overrideAccess: true,
    });

    const status = evento._status === "published" ? "published" : "draft";
    await payload.update({
      collection: "eventos",
      id: evento.id,
      data: { folderPdf: media.id, _status: status } as never,
      overrideAccess: true,
    });

    vinculados.push(`${arquivo}  →  ${slug} (media=${media.id}, ${status})`);
    payload.logger.info(`[seed:folders] ✓ ${arquivo} → ${slug}`);
  }

  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(`[seed:folders] RESUMO${dryRun ? " (DRY-RUN)" : ""}`);
  payload.logger.info(`  Vinculados: ${vinculados.length}`);
  for (const v of vinculados) payload.logger.info(`     ✓ ${v}`);
  if (semSlug.length > 0) {
    payload.logger.warn(`  Sem padrão "Módulo NN PROGRAMA" no nome (ignorados):`);
    for (const a of semSlug) payload.logger.warn(`     • ${a}`);
  }
  if (semEvento.length > 0) {
    payload.logger.warn(`  Slug sem evento no CMS (nada gravado):`);
    for (const s of semEvento) payload.logger.warn(`     • ${s.arquivo} → ${s.slug}`);
  }
  payload.logger.info("──────────────────────────────────────────────");
}

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const pastaArg = rawArgs.find((a) => !a.startsWith("--"));

if (!pastaArg) {
  console.error(
    '[seed:folders] ERRO: informe o caminho da pasta. Ex.: pnpm payload:seed:folders -- "/Users/.../pasta" [--dry-run]',
  );
  process.exit(1);
}

void vincularFolders(pastaArg, dryRun)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed:folders] ERRO:", err);
    process.exit(1);
  });
