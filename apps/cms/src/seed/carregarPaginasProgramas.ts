/**
 * Carga das páginas dos 15 Programas Estratégicos no CMS — Portal Grupo NTC
 * (Task 6 do plano `docs/superpowers/plans/2026-11-05-programas-lidos-do-cms.md`).
 *
 * Lê `assets/paginas-programas.json` (instantâneo das páginas estáticas) e
 * grava em `programas`/`modulos` os campos da aba "Página do site", dividindo
 * `problema`/`publicoAlvo`/`ementa` nas partes que a página mostra. A regra
 * campo a campo mora em `planejarCargaPaginas` (puro, testado):
 * campo preenchido no CMS e diferente da página **não é sobrescrito** — vai
 * para o relatório de divergências, e o script sai com código 1.
 *
 * - Casa programa por `sigla` (PROAPS+ e PROSUS+ com o `+`); **nunca cria**
 *   programa nem módulo.
 * - Programa com rascunho não publicado (última versão ≠ publicada) não é
 *   tocado: a carga publica, e publicaria a edição pendente junto.
 * - O update do programa grava `_status: "published"`; `modulos` não tem
 *   drafts.
 * - Imagens dos 15 vão pelos campos de caminho; nenhuma `media` é enviada.
 *
 * **Dry-run por padrão.** `PROGRAMAS_CARREGAR_APLICAR=1` aplica.
 * Execução: `pnpm --filter @ntc/cms programas:carregar-paginas`.
 * Idempotente: depois de aplicar, rodar de novo dá "sem mudanças" nos 15.
 */

import type { Payload } from "payload";

import type { ConteudoPrograma } from "@ntc/lib";

import {
  planejarCargaPaginas,
  temRascunhoPendente,
} from "../lib/cms/importacaoProgramas/planejarCargaPaginas";
import type {
  PlanoCargaPagina,
  ProgramaAtual,
} from "../lib/cms/importacaoProgramas/planejarCargaPaginas";

import paginasJson from "./assets/paginas-programas.json";

const estaticos = (paginasJson as { programas: ConteudoPrograma[] }).programas;

const APLICAR = process.env.PROGRAMAS_CARREGAR_APLICAR === "1";
const PREFIXO = "[programas:carregar-paginas]";

async function lerAtual(payload: Payload): Promise<{ atuais: ProgramaAtual[] }> {
  const comum = {
    collection: "programas" as const,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  };
  const publicados = await payload.find({ ...comum, draft: false });
  const ultimas = await payload.find({ ...comum, draft: true });
  const ultimaPorId = new Map(ultimas.docs.map((d) => [d.id, d]));

  const atuais: ProgramaAtual[] = [];
  for (const doc of publicados.docs) {
    const modulos = await payload.find({
      collection: "modulos",
      where: { programa: { equals: doc.id } },
      pagination: false,
      depth: 0,
      overrideAccess: true,
    });
    atuais.push({
      ...(doc as unknown as Omit<ProgramaAtual, "modulos">),
      pagina: (doc.pagina ?? null) as Record<string, unknown> | null,
      modulos: modulos.docs.map((m) => ({
        id: m.id,
        numero: m.numero,
        titulo: m.titulo,
        cargaHoraria: m.cargaHoraria,
        ementa: m.ementa,
        topicos: m.topicos,
      })),
      rascunhoPendente: temRascunhoPendente(doc, ultimaPorId.get(doc.id)),
    });
  }
  return { atuais };
}

async function gravar(
  payload: Payload,
  programaId: number | string,
  plano: PlanoCargaPagina,
): Promise<void> {
  // Cada módulo num update só: ementa e tópicos sempre juntos.
  for (const m of plano.dados.modulos) {
    await payload.update({
      collection: "modulos",
      id: m.id,
      data: m.data as never,
      overrideAccess: true,
    });
  }
  // Problema + destaque e público + chips vão neste mesmo update.
  if (plano.dados.programa) {
    await payload.update({
      collection: "programas",
      id: programaId,
      data: plano.dados.programa as never,
      overrideAccess: true,
    });
  }
}

function descrever(plano: PlanoCargaPagina): string {
  if (plano.acao === "sem-programa")
    return "sem-programa (sigla não encontrada no CMS — nada criado)";
  const partes: string[] = [plano.semMudancas ? "sem mudanças" : plano.acao];
  if (!plano.semMudancas) {
    const campos = Object.keys(plano.dados.programa ?? {}).filter((c) => c !== "_status");
    const pagina = plano.dados.programa?.pagina;
    const camposPagina = pagina && typeof pagina === "object" ? Object.keys(pagina) : [];
    partes.push(`programa: ${campos.join(", ") || "só _status"}`);
    if (camposPagina.length > 0) partes.push(`pagina: ${camposPagina.join(", ")}`);
    partes.push(`módulos a gravar: ${plano.dados.modulos.length}`);
  }
  if (plano.divergencias.length > 0)
    partes.push(`DIVERGÊNCIAS (não gravadas): ${plano.divergencias.join("; ")}`);
  if (plano.avisos.length > 0) partes.push(`avisos: ${plano.avisos.join("; ")}`);
  return partes.join(" · ");
}

async function main(): Promise<void> {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  payload.logger.info(
    `${PREFIXO} ${APLICAR ? "APLICANDO — gravando no banco" : "DRY-RUN — nada será gravado"}`,
  );

  const { atuais } = await lerAtual(payload);
  const porSigla = new Map(atuais.map((a) => [a.sigla.toUpperCase(), a]));

  const linhas: string[] = [];
  let falhas = 0;
  let divergentes = 0;
  let semPrograma = 0;
  let semMudancas = 0;

  for (const estatico of estaticos) {
    const atual = porSigla.get(estatico.sigla.toUpperCase()) ?? null;
    try {
      const plano = planejarCargaPaginas(atual, estatico);
      if (plano.acao === "sem-programa") semPrograma += 1;
      if (plano.acao === "divergente") divergentes += 1;
      if (plano.acao !== "sem-programa" && plano.semMudancas) semMudancas += 1;
      if (APLICAR && atual && !plano.semMudancas) await gravar(payload, atual.id, plano);
      linhas.push(`  ${estatico.sigla}: ${descrever(plano)}`);
    } catch (err) {
      falhas += 1;
      linhas.push(
        `  ${estatico.sigla}: erro · ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  const siglasEstaticas = new Set(estaticos.map((e) => e.sigla.toUpperCase()));
  const soNoCms = atuais
    .filter((a) => !siglasEstaticas.has(a.sigla.toUpperCase()))
    .map((a) => a.sigla);

  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(`${PREFIXO} Linhas por programa:`);
  for (const linha of linhas) payload.logger.info(linha);
  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(
    soNoCms.length > 0
      ? `${PREFIXO} Programas só no CMS (não tocados): ${soNoCms.join(", ")}`
      : `${PREFIXO} Programas só no CMS: nenhum.`,
  );
  payload.logger.info(
    `${PREFIXO} ${linhas.length} programas · sem mudanças: ${semMudancas} · divergentes: ${divergentes} · sem-programa: ${semPrograma} · erros: ${falhas}` +
      (APLICAR ? " · aplicado." : " · dry-run, nada gravado."),
  );

  // Divergência, sigla sem programa ou erro não passam como sucesso.
  const houveFalha = falhas > 0 || divergentes > 0 || semPrograma > 0;
  if (houveFalha) payload.logger.error(`${PREFIXO} Encerrando com falha — ver linhas acima.`);

  // O pool do adapter Postgres segura o processo aberto (mesmo padrão dos seeds).
  process.exit(houveFalha ? 1 : 0);
}

// `await` de topo obrigatório: sob Payload 3.90 o `payload run` só espera o
// import do módulo — com `void main()` o script sairia 0 sem rodar.
if (!process.env.VITEST) {
  try {
    await main();
  } catch (err) {
    console.error(`${PREFIXO} Falha:`, err);
    process.exit(1);
  }
}
