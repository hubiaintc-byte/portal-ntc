#!/usr/bin/env node
/**
 * Gera o instantâneo JSON das 15 páginas de programa (conteúdo completo,
 * forma `ConteudoPrograma` de @ntc/lib) para o seed do CMS.
 *
 * Também leva os cartões das listas e menus (`cartoes`, um por sigla, forma
 * `PaginaPrograma["cartao"]` + `sigla`): nome, chamada, meta e imagem dos
 * cartões das páginas de vertente (`FALLBACK_VERTICAIS`), a ordem dessas
 * grades (Educação → Gestão Pública → Saúde, 1 a 15) e os textos do menu e
 * do mapa do site (`DESCRICOES_PROGRAMAS_FALLBACK`). Copiados 1:1.
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
const FALLBACK_VERTENTES = "../apps/web/app/(vertical)/solucoes-estrategicas/[area]/conteudoFallback.ts";
const FALLBACK_DESCRICOES = "../apps/web/lib/cms/descricoesProgramasFallback.ts";
const ORDEM_VERTENTES = ["educacao", "gestao-publica", "saude"];
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
  const { FALLBACK_VERTICAIS } = await import(FALLBACK_VERTENTES);
  const { DESCRICOES_PROGRAMAS_FALLBACK } = await import(FALLBACK_DESCRICOES);
  const cartoes = [];
  for (const vertente of ORDEM_VERTENTES) {
    for (const card of FALLBACK_VERTICAIS[vertente].programas.cards) {
      const descricoes = DESCRICOES_PROGRAMAS_FALLBACK[card.sigla];
      if (!descricoes) throw new Error(`sem descrição de menu/mapa para ${card.sigla}`);
      cartoes.push({
        sigla: card.sigla,
        nome: card.nome,
        tagline: card.tagline,
        meta: card.meta,
        imagem: card.imagemSrc,
        ordem: cartoes.length + 1,
        descricaoMenu: descricoes.menu,
        descricaoMapa: descricoes.mapa,
      });
    }
  }
  const siglas = new Set(programas.map((p) => p.sigla));
  const siglasCartoes = new Set(cartoes.map((c) => c.sigla));
  for (const s of siglas) if (!siglasCartoes.has(s)) throw new Error(`sem cartão para ${s}`);
  for (const s of siglasCartoes) if (!siglas.has(s)) throw new Error(`cartão sem página: ${s}`);

  await mkdir(dirname(SAIDA), { recursive: true });
  await writeFile(
    SAIDA,
    JSON.stringify({ geradoEm: new Date().toISOString(), programas, cartoes }, null, 2) + "\n",
    "utf8",
  );
  console.log(`Instantâneo gerado: ${programas.length} programas, ${cartoes.length} cartões.`);
  console.log(`→ ${SAIDA}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
