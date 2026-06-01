#!/usr/bin/env node
/**
 * Dispara revalidação on-demand de páginas em produção.
 *
 * Uso:
 *   node scripts/revalidar.mjs /o-grupo/corpo-docente
 *   node scripts/revalidar.mjs /o-grupo/corpo-docente /agenda/prosus-brasilia
 *   pnpm revalidar /o-grupo/corpo-docente
 *   pnpm revalidar:corpo-docente            (atalho — rota fixa)
 *
 * Necessário porque o CMS roda local: o hook de revalidação na sua
 * máquina aponta para PAYLOAD_PUBLIC_FRONT_URL local, não para produção.
 * Este script faz o POST autenticado para o site live, fazendo a edição
 * que você acabou de publicar aparecer em segundos (sem rebuild).
 *
 * Lê REVALIDATE_SECRET de apps/web/.env. A URL de produção pode ser
 * sobrescrita via env SITE_URL.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");

const SITE_URL = process.env.SITE_URL || "https://www.institutontc.com.br";

function lerSecret() {
  if (process.env.REVALIDATE_SECRET) return process.env.REVALIDATE_SECRET;
  try {
    const env = readFileSync(join(raiz, "apps/web/.env"), "utf8");
    const linha = env.split("\n").find((l) => l.startsWith("REVALIDATE_SECRET="));
    return linha ? linha.slice("REVALIDATE_SECRET=".length).trim() : "";
  } catch {
    return "";
  }
}

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("Uso: node scripts/revalidar.mjs <path> [<path>...]");
  console.error('Ex.: node scripts/revalidar.mjs /o-grupo/corpo-docente');
  process.exit(1);
}

const secret = lerSecret();
if (!secret) {
  console.error("ERRO: REVALIDATE_SECRET não encontrado (env ou apps/web/.env).");
  process.exit(1);
}

let falhou = false;
for (const path of paths) {
  try {
    const res = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Revalidate-Secret": secret },
      body: JSON.stringify({ path }),
    });
    const corpo = await res.json().catch(() => ({}));
    if (res.ok && corpo.revalidated) {
      console.log(`✓ revalidado: ${path}`);
    } else {
      falhou = true;
      console.error(`✗ falhou (${res.status}): ${path} — ${JSON.stringify(corpo)}`);
    }
  } catch (e) {
    falhou = true;
    console.error(`✗ erro de rede: ${path} — ${e?.message ?? e}`);
  }
}
process.exit(falhou ? 1 : 0);
