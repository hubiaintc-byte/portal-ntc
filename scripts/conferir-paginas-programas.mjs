#!/usr/bin/env node
/**
 * Conferência 1:1 das páginas de programa: compara o site de ANTES
 * (produção, ainda estático) com o de DEPOIS (lendo do CMS) e imprime o
 * diff de cada página. Sai 0 só se todas as páginas forem idênticas.
 *
 * Páginas: as 15 de `/programas/<slug>` (slugs do instantâneo congelado
 * `apps/cms/src/seed/assets/paginas-programas.json`) mais as listas:
 * `/programas`, as 3 vertentes de `/solucoes-estrategicas/<área>` e
 * `/mapa-do-site`.
 *
 * De cada uma extrai o `<main>` e o mega-menu `#mega-programas` do
 * cabeçalho, remove a seção `#modulos-abertos`, os links que dependem dela
 * (item da navegação interna, "Ver módulos abertos", CTA `.open-module-cta`
 * do detalhamento), os selos de status de módulo (`m-status`) e a marca
 * `pc-flag` dos cartões (esses vêm dos eventos e mudam de propósito),
 * normaliza espaços e compara. Regras puras em
 * `packages/lib/src/programas/conferirHtml.ts`.
 *
 * Diferença ESPERADA (não conta como falha): `/mapa-do-site` com o diff
 * feito só de troca de ordem — a Gestão Pública passa de LIDERA·AGIP·SIGA
 * para AGIP·LIDERA·SIGA (ruling R19, ordem única do cartão). Sai como
 * `ESPERADO` com o diff impresso, para o PO conferir.
 *
 * Também ESPERADO: diferença feita só da troca de nome completo e endereço
 * para os do CMS (decisão do PO, 12/11 — PROAPS+ e PROSUS+ passam a
 * `/programas/proaps-plus` e `/programas/prosus-plus`, com redirecionamento
 * dos antigos). A tabela fica em `scripts/identidade-programas-cms.json`.
 *
 * Uso (Node >= 22.18 — importa o .ts sem flag):
 *   node scripts/conferir-paginas-programas.mjs <ANTES> <DEPOIS>
 *   ex.: node scripts/conferir-paginas-programas.mjs https://www.institutontc.com.br http://localhost:3000
 *
 * As URLs-base são argumentos (nada de porta fixa). Só faz GET.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  aplicarIdentidadeCms,
  compararPaginas,
  normalizarProgramaContato,
  soReordenacao,
} from "../packages/lib/src/programas/conferirHtml.ts";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

const [antesBase, depoisBase] = process.argv.slice(2).map((u) => u.replace(/\/+$/, ""));
if (!antesBase || !depoisBase) {
  console.error("Uso: node scripts/conferir-paginas-programas.mjs <URL-ANTES> <URL-DEPOIS>");
  process.exit(2);
}

const instantaneo = JSON.parse(
  readFileSync(join(raiz, "apps/cms/src/seed/assets/paginas-programas.json"), "utf8"),
);
const caminhos = [
  ...instantaneo.programas.map((p) => `/programas/${p.slug}`),
  "/programas",
  "/solucoes-estrategicas/educacao",
  "/solucoes-estrategicas/gestao-publica",
  "/solucoes-estrategicas/saude",
  "/mapa-do-site",
];

async function baixar(base, caminho) {
  const resposta = await fetch(`${base}${caminho}`, {
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
  });
  if (!resposta.ok) throw new Error(`${base}${caminho} respondeu ${resposta.status}`);
  return resposta.text();
}

/** Nome completo e endereço oficiais são os do CMS (decisão do PO, 12/11). */
const trocasIdentidade = JSON.parse(
  readFileSync(join(raiz, "scripts/identidade-programas-cms.json"), "utf8"),
).programas;

/** Páginas cuja reordenação pura é esperada (R19). */
const REORDENACAO_ESPERADA = new Set(["/mapa-do-site"]);

function imprimir(diff) {
  for (const l of diff.slice(0, 80)) console.log(`      ${l.tipo} ${l.texto.slice(0, 200)}`);
  if (diff.length > 80) console.log(`      … mais ${diff.length - 80} linhas`);
}

let comDiferenca = 0;
let esperadas = 0;
for (const caminho of caminhos) {
  try {
    const [antes, depois] = await Promise.all([
      baixar(antesBase, caminho),
      baixar(depoisBase, caminho),
    ]);
    const diffBruto = compararPaginas(antes, depois);
    if (diffBruto.length === 0) {
      console.log(`OK    ${caminho}`);
      continue;
    }
    const diff = compararPaginas(
      normalizarProgramaContato(aplicarIdentidadeCms(antes, trocasIdentidade), trocasIdentidade),
      normalizarProgramaContato(depois, trocasIdentidade),
    );
    if (diff.length === 0) {
      esperadas += 1;
      console.log(`ESPERADO ${caminho}  (só nome completo/endereço do CMS — decisão de 12/11)`);
      imprimir(diffBruto);
      continue;
    }
    if (REORDENACAO_ESPERADA.has(caminho) && soReordenacao(diff)) {
      esperadas += 1;
      console.log(`ESPERADO ${caminho}  (só troca de ordem — R19, Gestão Pública AGIP·LIDERA·SIGA)`);
      imprimir(diff);
      continue;
    }
    comDiferenca += 1;
    console.log(`DIFF  ${caminho}  (${diff.length} linhas)`);
    imprimir(diff);
  } catch (erro) {
    comDiferenca += 1;
    console.log(`ERRO  ${caminho}  ${erro instanceof Error ? erro.message : erro}`);
  }
}

console.log(
  `\n${caminhos.length - comDiferenca}/${caminhos.length} páginas sem diferença inesperada` +
    (esperadas ? ` (${esperadas} com diferença esperada)` : "") +
    (comDiferenca ? ` — ${comDiferenca} com diferença ou erro.` : "."),
);
process.exit(comDiferenca === 0 ? 0 : 1);
