#!/usr/bin/env node
/**
 * Gera o instantâneo JSON do conteúdo editorial dos 15 programas do site,
 * para o seed do Payload (Task 4) importar sem `apps/cms` precisar
 * importar de `apps/web` em runtime.
 *
 * Lê cada `conteudo<SIGLA>.ts` diretamente (nunca via `conteudoIndex.ts` —
 * o índice faz `import { X } from "./conteudoX"` sem extensão, e o
 * resolver do Node recusa com ERR_MODULE_NOT_FOUND). A partir do Node
 * 22.18 (LTS) a remoção de tipos é nativa e ligada por padrão, sem flag,
 * então os `.ts` carregam sem dependência nova (§5.4 do CLAUDE.md —
 * `tsx` não entra) — ver a checagem de versão logo abaixo.
 *
 * A forma de saída espelha `apps/cms/src/lib/cms/importacaoProgramas/tipos.ts`
 * (`Instantaneo`/`ProgramaInstantaneo`/`ModuloInstantaneo`) à mão, porque
 * este script `.mjs` não pode importar aquele tipo.
 *
 * Uso:
 *   node scripts/gerar-instantaneo-programas.mjs
 *   pnpm programas:instantaneo
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Guarda de versão: import de `.ts` sem flag só existe a partir do Node
// 22.18 (LTS) — abaixo disso, `import(DIR_PROGRAMAS + arquivo)` falha com
// um erro de sintaxe difícil de associar à causa real. `.nvmrc` e
// `engines.node` documentam o mesmo mínimo; esta checagem só torna a causa
// óbvia em vez de deixar o Node falhar por conta própria mais abaixo.
const MINIMO_NODE = [22, 18, 0];
function checarVersaoNode() {
  const partes = process.versions.node.split(".").map(Number);
  for (let i = 0; i < MINIMO_NODE.length; i += 1) {
    if ((partes[i] ?? 0) > MINIMO_NODE[i]) return;
    if ((partes[i] ?? 0) < MINIMO_NODE[i]) {
      console.error(
        `Este script precisa do Node >= ${MINIMO_NODE.join(".")} (import de .ts sem flag). ` +
          `Versão atual: ${process.versions.node}.`,
      );
      process.exit(1);
    }
  }
}
checarVersaoNode();

const DIR_PROGRAMAS = "../apps/web/app/(programas)/programas/[slug]/";
const SAIDA = join(__dirname, "..", "apps/cms/src/seed/assets/programas.json");

/**
 * Mapeia um módulo de `detalhamento.itens` (DetalhamentoItem) para
 * ModuloInstantaneo — só os campos que a interface declara.
 */
function mapearModuloDeDetalhamento(item) {
  return {
    numero: item.numero,
    titulo: item.titulo,
    cargaHoraria: item.cargaHoraria,
    descricao: item.descricao,
    topicos: item.topicos ?? [],
  };
}

/**
 * Fallback para quando o programa não tem `detalhamento` — usa
 * `modulos.itens` (Modulo), que não tem `topicos`. Caminho não exercitado
 * hoje: os 15 programas atuais sempre têm `detalhamento`; sem cobertura de
 * teste própria.
 */
function mapearModuloDeModulos(item) {
  return {
    numero: item.numero,
    titulo: item.titulo,
    cargaHoraria: item.cargaHoraria ?? "",
    descricao: item.descricao,
    topicos: [],
  };
}

// Regex que a carga horária total deve bater no `metaBar` da origem — ex.:
// "64 horas". Nada é somado a partir dos módulos individuais (formato "8h"
// por módulo não é o mesmo formato do total, e inventar a soma seria
// adivinhar); quando nenhuma entrada bate, o programa emite "" e quem
// mapeia (mapear.ts) trata como ausente, sem sobrescrever o banco.
const REGEX_CARGA_HORARIA_TOTAL = /^\d+\s+horas$/;

/**
 * Mapeia um ConteudoPrograma (a forma completa do site) para
 * ProgramaInstantaneo (o subconjunto do instantâneo).
 */
function mapearPrograma(p) {
  const modulos = p.detalhamento?.itens
    ? p.detalhamento.itens.map(mapearModuloDeDetalhamento)
    : (p.modulos?.itens ?? []).map(mapearModuloDeModulos);

  const entradaCargaHoraria = (p.metaBar ?? []).find((m) => REGEX_CARGA_HORARIA_TOTAL.test(m.valor));

  return {
    sigla: p.sigla,
    slug: p.slug,
    nomeCompleto: p.nomeCompleto,
    visaoGeralHtml: p.visaoGeral.corpoHtml,
    problemaHtml: p.problema.corpoHtml + (p.problema.destaqueHtml ? `<p>${p.problema.destaqueHtml}</p>` : ""),
    objetivoHtml: p.objetivoGeral?.corpoHtml ?? null,
    publicoHtml: p.publico.corpoHtml,
    publicoChips: p.publico.chips ?? [],
    eixos: p.eixos.itens.map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    resultadosHtml: p.resultados.corpoHtml,
    diferenciais: (p.diferenciais?.itens ?? []).map((d) => ({
      titulo: d.titulo,
      descricao: d.descricao,
    })),
    faq: p.faq.itens.map((f) => ({ pergunta: f.pergunta, resposta: f.resposta })),
    modulos,
    cargaHorariaTotal: entradaCargaHoraria ? entradaCargaHoraria.valor : "",
  };
}

async function main() {
  const arquivos = (await readdir(new URL(DIR_PROGRAMAS, import.meta.url)))
    .filter((f) => /^conteudo[A-Z]/.test(f) && f !== "conteudoIndex.ts")
    .sort();

  const programas = [];
  for (const arquivo of arquivos) {
    const mod = await import(DIR_PROGRAMAS + arquivo);
    const programa = Object.values(mod)[0];
    programas.push(mapearPrograma(programa));
  }

  const instantaneo = { programas };

  await mkdir(dirname(SAIDA), { recursive: true });
  await writeFile(SAIDA, JSON.stringify(instantaneo, null, 2) + "\n", "utf8");

  const totalModulos = programas.reduce((total, p) => total + p.modulos.length, 0);
  console.log(`Instantâneo gerado: ${programas.length} programas, ${totalModulos} módulos.`);
  console.log(`→ ${SAIDA}`);
}

main().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
});
