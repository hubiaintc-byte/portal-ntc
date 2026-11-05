#!/usr/bin/env node
/**
 * Gera o instantâneo JSON das 15 páginas de programa (conteúdo completo,
 * forma `ConteudoPrograma` de @ntc/lib) para o seed do CMS.
 *
 * Importa cada `conteudo<SIGLA>.ts` direto (nunca o índice, cujos imports
 * não têm extensão). Node >= 22.18 carrega `.ts` sem flag.
 *
 * Uso: pnpm programas:instantaneo-paginas
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MINIMO_NODE = [22, 18, 0];
function checarVersaoNode() {
  const partes = process.versions.node.split(".").map(Number);
  for (let i = 0; i < MINIMO_NODE.length; i += 1) {
    if ((partes[i] ?? 0) > MINIMO_NODE[i]) return;
    if ((partes[i] ?? 0) < MINIMO_NODE[i]) {
      console.error(
        `Este script precisa do Node >= ${MINIMO_NODE.join(".")} (import de .ts sem flag). Versão atual: ${process.versions.node}.`,
      );
      process.exit(1);
    }
  }
}
checarVersaoNode();

const DIR_PROGRAMAS = "../apps/web/app/(programas)/programas/[slug]/";
const SAIDA = join(__dirname, "..", "apps/cms/src/seed/assets/paginas-programas.json");

// Mesma ordem de PROGRAMAS em conteudoIndex.ts.
const NOMES = [
  "AGIP", "EDUTEC", "EGIDE", "FUTURA", "LIDERA", "PEAR", "PEI", "PINEI",
  "PROAPS", "PROGE", "PROGIR", "PROSUS", "SIGA", "SIGS", "VIVAESCOLA",
];

async function main() {
  const programas = [];
  for (const nome of NOMES) {
    const mod = await import(`${DIR_PROGRAMAS}conteudo${nome}.ts`);
    if (!mod[nome]) throw new Error(`conteudo${nome}.ts não exporta ${nome}`);
    programas.push(mod[nome]);
  }
  await mkdir(dirname(SAIDA), { recursive: true });
  await writeFile(SAIDA, JSON.stringify({ geradoEm: new Date().toISOString(), programas }, null, 2) + "\n", "utf8");
  console.log(`Instantâneo gerado: ${programas.length} programas.`);
  console.log(`→ ${SAIDA}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
