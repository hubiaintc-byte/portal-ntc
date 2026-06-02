/**
 * Vincular fotos reais aos Especialistas — Portal Grupo NTC.
 *
 * Lê uma pasta de fotos (nome do arquivo = "Nome-Sobrenome" do
 * palestrante), faz match contra os Especialistas existentes no CMS,
 * sobe cada foto para a coleção `media` e atualiza o campo `foto` do
 * Especialista correspondente.
 *
 * NÃO mexe em outros campos do Especialista, NÃO cria especialistas
 * novos e NÃO deleta o Media antigo (só re-vincula — reversível).
 *
 * ── Regra de match (segura, sem adivinhação) ──
 * O nome do arquivo na pasta segue o padrão "Nome-Sobrenome", que é
 * sempre um SUBCONJUNTO do nome completo cadastrado no CMS. Match ocorre
 * quando TODOS os tokens normalizados do arquivo aparecem no nome do
 * especialista (acentos/caixa/separadores normalizados). Se um arquivo
 * casar com mais de um especialista, NÃO adivinha — reporta como ambíguo.
 *
 * Para divergências de GRAFIA (onde os tokens não são subconjunto — ex.
 * "Fabricio-Motta" com 2 T vs "Fabrício Mota" com 1 T), use o mapa
 * OVERRIDES abaixo: arquivo → slug do especialista. Estes são auditados
 * manualmente, um por um.
 *
 * Lê APENAS o nível raiz da pasta (subpastas são duplicatas e são
 * ignoradas).
 *
 * Sobrescreve sempre: se o especialista já tem foto, ela é substituída.
 *
 * Uso:
 *   pnpm fotos:especialistas -- "/caminho/da/pasta"            # grava
 *   pnpm fotos:especialistas -- "/caminho/da/pasta" --dry-run  # só relatório
 *
 * Execução direta:
 *   pnpm payload run src/seed/vincularFotosEspecialistas.ts "<pasta>" [--dry-run]
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";

type Id = number;

const MIME_POR_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const EXTENSOES_VALIDAS = Object.keys(MIME_POR_EXT);

/**
 * Overrides manuais para divergências de grafia entre o nome do arquivo
 * e o nome cadastrado no CMS — casos em que a regra de subconjunto de
 * tokens não casa. Cada linha foi auditada individualmente.
 *
 * Chave: nome do arquivo normalizado (sem acento, caixa baixa, separadores
 * viram espaço). Valor: slug do Especialista no CMS.
 */
const OVERRIDES: Record<string, string> = {
  // "Fabricio-Motta" (2 T no arquivo) → "Fabrício Mota" (1 T no CMS).
  "fabricio motta": "perfil-fabricio-mota",
  // "maria-helena-guimaraes-de-castro" (tem "de" a mais) → "Maria Helena Guimarães Castro".
  "maria helena guimaraes de castro": "perfil-maria-helena-guimaraes-castro",
};

/**
 * Normaliza um nome para comparação: remove acentos, baixa a caixa,
 * troca separadores de arquivo por espaço, remove pontuação e colapsa
 * espaços. "Marçal-Justen-Filho" → "marcal justen filho".
 */
function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira diacríticos
    .toLowerCase()
    .replace(/[._-]+/g, " ") // separadores de arquivo viram espaço
    .replace(/[^a-z0-9\s]/g, "") // remove pontuação restante
    .replace(/\s+/g, " ")
    .trim();
}

function tokensDe(nome: string): Set<string> {
  return new Set(normalizarNome(nome).split(" ").filter(Boolean));
}

/** Todos os tokens de `arquivo` aparecem nos tokens de `cms`? */
function ehSubconjunto(arquivoTokens: Set<string>, cmsTokens: Set<string>): boolean {
  for (const t of arquivoTokens) {
    if (!cmsTokens.has(t)) return false;
  }
  return arquivoTokens.size > 0;
}

interface ArquivoFoto {
  nomeArquivo: string;
  chaveNorm: string; // nome normalizado (para overrides)
  tokens: Set<string>;
  ext: string;
}

async function lerPastaRaiz(pasta: string): Promise<ArquivoFoto[]> {
  const entradas = await readdir(pasta, { withFileTypes: true });
  const fotos: ArquivoFoto[] = [];

  for (const entrada of entradas) {
    if (!entrada.isFile()) continue; // ignora subpastas (duplicatas)
    const ext = path.extname(entrada.name).toLowerCase();
    if (!EXTENSOES_VALIDAS.includes(ext)) continue;

    const nomeBase = path.basename(entrada.name, ext);
    fotos.push({
      nomeArquivo: entrada.name,
      chaveNorm: normalizarNome(nomeBase),
      tokens: tokensDe(nomeBase),
      ext,
    });
  }

  return fotos;
}

interface EspecialistaLite {
  id: Id;
  slug: string;
  nome: string;
  tokens: Set<string>;
  temFoto: boolean;
}

async function carregarEspecialistas(
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<EspecialistaLite[]> {
  const lista: EspecialistaLite[] = [];
  let page = 1;
  for (;;) {
    const r = await payload.find({
      collection: "especialistas",
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    });
    for (const doc of r.docs) {
      lista.push({
        id: doc.id as Id,
        slug: doc.slug,
        nome: doc.nome,
        tokens: tokensDe(doc.nome),
        temFoto: doc.foto != null,
      });
    }
    if (!r.hasNextPage) break;
    page += 1;
  }
  return lista;
}

interface ResultadoMatch {
  foto: ArquivoFoto;
  especialista: EspecialistaLite;
  via: "override" | "tokens";
}

async function vincular(pastaArg: string, dryRun: boolean): Promise<void> {
  const payload = await getPayload({ config });

  const pasta = path.resolve(process.cwd(), pastaArg);
  payload.logger.info(
    `[fotos:especialistas] Pasta: ${pasta}${dryRun ? "  (DRY-RUN — nada será gravado)" : ""}`,
  );

  const fotos = await lerPastaRaiz(pasta);
  if (fotos.length === 0) {
    payload.logger.warn(
      `[fotos:especialistas] Nenhuma imagem (${EXTENSOES_VALIDAS.join(", ")}) na raiz de ${pasta}.`,
    );
    return;
  }
  payload.logger.info(`[fotos:especialistas] ${fotos.length} imagens na raiz da pasta.`);

  const especialistas = await carregarEspecialistas(payload);
  const porSlug = new Map(especialistas.map((e) => [e.slug, e]));
  payload.logger.info(`[fotos:especialistas] ${especialistas.length} especialistas no CMS.`);

  const matches: ResultadoMatch[] = [];
  const semMatch: ArquivoFoto[] = [];
  const ambiguos: { arquivo: string; candidatos: string[] }[] = [];

  for (const foto of fotos) {
    // 1) Override manual (grafia divergente) tem prioridade.
    const slugOverride = OVERRIDES[foto.chaveNorm];
    if (slugOverride) {
      const esp = porSlug.get(slugOverride);
      if (esp) {
        matches.push({ foto, especialista: esp, via: "override" });
      } else {
        payload.logger.warn(
          `[fotos:especialistas] override aponta slug inexistente '${slugOverride}' para ${foto.nomeArquivo}.`,
        );
        semMatch.push(foto);
      }
      continue;
    }

    // 2) Subconjunto de tokens.
    const candidatos = especialistas.filter((e) => ehSubconjunto(foto.tokens, e.tokens));
    if (candidatos.length === 0) {
      semMatch.push(foto);
    } else if (candidatos.length > 1) {
      ambiguos.push({ arquivo: foto.nomeArquivo, candidatos: candidatos.map((c) => c.nome) });
    } else {
      matches.push({ foto, especialista: candidatos[0]!, via: "tokens" });
    }
  }

  const vinculados: { arquivo: string; nome: string; mediaId: Id | null; tinhaFoto: boolean }[] = [];

  for (const { foto, especialista } of matches) {
    if (dryRun) {
      vinculados.push({ arquivo: foto.nomeArquivo, nome: especialista.nome, mediaId: null, tinhaFoto: especialista.temFoto });
      continue;
    }

    const filePath = path.join(pasta, foto.nomeArquivo);
    const data = await readFile(filePath);
    const mimetype = MIME_POR_EXT[foto.ext]!;

    const media = await payload.create({
      collection: "media",
      data: { alt: `Retrato de ${especialista.nome} · corpo docente Grupo NTC` },
      file: { data, mimetype, name: foto.nomeArquivo, size: data.length },
      overrideAccess: true,
    });

    await payload.update({
      collection: "especialistas",
      id: especialista.id,
      data: { foto: media.id } as never,
      overrideAccess: true,
    });

    vinculados.push({ arquivo: foto.nomeArquivo, nome: especialista.nome, mediaId: media.id as Id, tinhaFoto: especialista.temFoto });
    payload.logger.info(
      `[fotos:especialistas] vinculou "${foto.nomeArquivo}" → ${especialista.nome} (media=${media.id})${especialista.temFoto ? " [substituiu foto anterior]" : ""}`,
    );
  }

  // Quais especialistas continuam sem foto (não casaram com nenhum arquivo)?
  const slugsVinculados = new Set(matches.map((m) => m.especialista.slug));
  const cmsSemFoto = especialistas.filter((e) => !slugsVinculados.has(e.slug));

  // Relatório.
  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(`[fotos:especialistas] RESUMO${dryRun ? " (DRY-RUN)" : ""}`);
  payload.logger.info(`  Vínculos: ${vinculados.length} (de ${especialistas.length} especialistas)`);
  payload.logger.info(`  Arquivos sem especialista no CMS: ${semMatch.length}`);
  payload.logger.info(`  Ambíguos: ${ambiguos.length}`);
  payload.logger.info(`  Especialistas que ficam sem foto: ${cmsSemFoto.length}`);

  payload.logger.info("  ── Vínculos:");
  for (const v of vinculados) {
    payload.logger.info(`     ✓ ${v.arquivo}  →  ${v.nome}${v.tinhaFoto ? "  [substitui]" : ""}`);
  }

  if (ambiguos.length > 0) {
    payload.logger.warn("  ── AMBÍGUOS (não gravados — resolva manualmente):");
    for (const a of ambiguos) payload.logger.warn(`     • ${a.arquivo}  →  ${a.candidatos.join(" | ")}`);
  }

  if (cmsSemFoto.length > 0) {
    payload.logger.warn("  ── Especialistas SEM foto correspondente na pasta:");
    for (const e of cmsSemFoto) payload.logger.warn(`     • ${e.nome}`);
  }

  if (semMatch.length > 0) {
    payload.logger.info(
      `  ── ${semMatch.length} arquivos sem especialista cadastrado (provavelmente palestrantes ainda não criados no CMS) — ignorados.`,
    );
  }

  payload.logger.info("──────────────────────────────────────────────");
  if (dryRun) {
    payload.logger.info("[fotos:especialistas] DRY-RUN: nada foi gravado. Remova --dry-run para aplicar.");
  } else {
    payload.logger.info("[fotos:especialistas] Pronto. Para refletir em produção: pnpm revalidar:corpo-docente");
  }
}

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes("--dry-run");
const pastaArg = rawArgs.find((a) => !a.startsWith("--"));

if (!pastaArg) {
  console.error(
    '[fotos:especialistas] ERRO: informe o caminho da pasta. Ex.: pnpm fotos:especialistas -- "/Users/.../Imagens Palestrantes" [--dry-run]',
  );
  process.exit(1);
}

void vincular(pastaArg, dryRun)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[fotos:especialistas] ERRO:", err);
    process.exit(1);
  });
