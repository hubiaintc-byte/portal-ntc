/**
 * Importação do conteúdo editorial dos 15 Programas Estratégicos para o
 * CMS — Portal Grupo NTC.
 *
 * Lê `assets/programas.json` (instantâneo gerado por
 * `scripts/gerar-instantaneo-programas.mjs`, Task 3) e grava em
 * `programas`/`modulos` via Local API, seguindo o precedente de
 * `seed/seedFoldersEventos.ts` e `seed/vincularFotosEspecialistas.ts`
 * (mesma ideia: copiar para o CMS o que o site já publica, de forma
 * idempotente).
 *
 * **Nunca cria programa.** A lista canônica dos 15 é
 * `seed/programasShell.ts`; uma sigla do instantâneo sem correspondência
 * no banco é relatada como erro, não criada (spec §4). Programa casado
 * por `sigla` (case-insensitive) é sempre atualizado; módulo é casado por
 * `(programa, numero)` — atualizado se existe, criado se não.
 *
 * **Publicação não é opcional.** `programas` tem `versions: { drafts:
 * true }`, e o gerador do PDF de proposta lê com `payload.findByID` sem
 * `draft: true` — a versão publicada. O script grava com
 * `_status: "published"`; `modulos` não tem `versions` configurado (sem
 * drafts), então não recebe `_status` (spec §3.1).
 *
 * **Dry-run por padrão** (`PROGRAMAS_IMPORTAR_APLICAR=1` para aplicar):
 * em dry-run o script só lê (inclusive o `payload.find` que decide se um
 * módulo seria criado ou atualizado) e nunca chama `create`/`update`.
 *
 * Execução: `pnpm --filter @ntc/cms programas:importar`.
 *
 * Spec: docs/superpowers/specs/2026-09-30-importar-programas-cms-design.md
 */

import type { Payload } from "payload";

import { mapearPrograma } from "../lib/cms/importacaoProgramas/mapear";
import type { CamposModulo } from "../lib/cms/importacaoProgramas/mapear";
import type { Instantaneo } from "../lib/cms/importacaoProgramas/tipos";

import instantaneoJson from "./assets/programas.json";

const instantaneo: Instantaneo = instantaneoJson;

const APLICAR = process.env.PROGRAMAS_IMPORTAR_APLICAR === "1";

export interface LinhaRelatorio {
  sigla: string;
  acao: "criado" | "atualizado" | "erro";
  modulosCriados: number;
  modulosAtualizados: number;
  avisos: string[];
}

/**
 * Casa os programas do instantâneo com os que já existem no banco, por
 * `sigla` (ignorando caixa). Pura, sem I/O — o que os testes cobrem. Nunca
 * produz criação: sigla sem correspondência vai para `semCorrespondencia`.
 */
export function planejarImportacao(
  instantaneo: Instantaneo,
  programasNoBanco: { id: number; sigla: string }[],
): { paraImportar: { sigla: string; id: number }[]; semCorrespondencia: string[] } {
  const idPorSigla = new Map(programasNoBanco.map((p) => [p.sigla.toUpperCase(), p.id]));

  const paraImportar: { sigla: string; id: number }[] = [];
  const semCorrespondencia: string[] = [];

  for (const p of instantaneo.programas) {
    const id = idPorSigla.get(p.sigla.toUpperCase());
    if (id === undefined) {
      semCorrespondencia.push(p.sigla);
    } else {
      paraImportar.push({ sigla: p.sigla, id });
    }
  }

  return { paraImportar, semCorrespondencia };
}

/**
 * Casa (ou cria, se aplicando) um módulo por `(programa, numero)`. A
 * leitura roda sempre — inclusive em dry-run, para o relatório saber se
 * seria "criado" ou "atualizado" — só a escrita é condicionada a `APLICAR`.
 */
async function processarModulo(
  payload: Payload,
  programaId: number,
  modulo: CamposModulo,
): Promise<"criado" | "atualizado"> {
  const existente = await payload.find({
    collection: "modulos",
    where: { and: [{ programa: { equals: programaId } }, { numero: { equals: modulo.numero } }] },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  const doc = existente.docs[0];
  if (doc) {
    if (APLICAR) {
      await payload.update({
        collection: "modulos",
        id: doc.id,
        data: { ...modulo, programa: programaId } as never,
        overrideAccess: true,
      });
    }
    return "atualizado";
  }

  if (APLICAR) {
    await payload.create({
      collection: "modulos",
      data: { ...modulo, programa: programaId } as never,
      overrideAccess: true,
    });
  }
  return "criado";
}

async function main(): Promise<void> {
  const { getPayload } = await import("payload");
  const { default: config } = await import("../payload.config");
  const payload = await getPayload({ config });

  payload.logger.info(
    `[programas:importar] ${APLICAR ? "APLICANDO — gravando no banco" : "DRY-RUN — nada será gravado"}`,
  );
  payload.logger.info(`[programas:importar] Instantâneo gerado em ${instantaneo.geradoEm}`);

  const resultadoProgramas = await payload.find({
    collection: "programas",
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  const programasNoBanco = resultadoProgramas.docs.map((p) => ({ id: p.id, sigla: p.sigla }));
  const plano = planejarImportacao(instantaneo, programasNoBanco);

  const linhas: LinhaRelatorio[] = [];

  for (const { sigla, id } of plano.paraImportar) {
    const origem = instantaneo.programas.find((p) => p.sigla === sigla);
    if (!origem) {
      // Não deveria acontecer — planejarImportacao só produz entradas a
      // partir do próprio instantâneo — mas falha relatada, não silenciosa.
      linhas.push({
        sigla,
        acao: "erro",
        modulosCriados: 0,
        modulosAtualizados: 0,
        avisos: ["estado inconsistente: sigla planejada não encontrada no instantâneo"],
      });
      continue;
    }

    try {
      const { campos, modulos, avisos } = mapearPrograma(origem);

      let modulosCriados = 0;
      let modulosAtualizados = 0;
      for (const modulo of modulos) {
        const resultado = await processarModulo(payload, id, modulo);
        if (resultado === "criado") modulosCriados += 1;
        else modulosAtualizados += 1;
      }

      if (APLICAR) {
        await payload.update({
          collection: "programas",
          id,
          data: { ...campos, _status: "published" } as never,
          overrideAccess: true,
        });
      }

      linhas.push({
        sigla,
        acao: "atualizado",
        modulosCriados,
        modulosAtualizados,
        avisos: avisos.map((a) => `${a.campo}: ${a.motivo}`),
      });
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : String(err);
      linhas.push({ sigla, acao: "erro", modulosCriados: 0, modulosAtualizados: 0, avisos: [mensagem] });
    }
  }

  const idsImportados = new Set(plano.paraImportar.map((p) => p.id));
  const programasImportados = resultadoProgramas.docs.filter((p) => idsImportados.has(p.id));

  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info("[programas:importar] Linhas por programa:");
  for (const linha of linhas) {
    const sufixoAvisos = linha.avisos.length > 0 ? ` · avisos: ${linha.avisos.join("; ")}` : "";
    payload.logger.info(
      `  ${linha.sigla}: ${linha.acao} · módulos criados=${linha.modulosCriados} atualizados=${linha.modulosAtualizados}${sufixoAvisos}`,
    );
  }

  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(
    plano.semCorrespondencia.length > 0
      ? `[programas:importar] Siglas sem correspondência no banco (${plano.semCorrespondencia.length}): ${plano.semCorrespondencia.join(", ")}`
      : "[programas:importar] Siglas sem correspondência: nenhuma.",
  );

  const tagsIgnoradas = [
    ...new Set(
      linhas
        .flatMap((l) => l.avisos)
        .filter((a) => a.includes("tag ignorada:"))
        .map((a) => a.slice(a.indexOf("tag ignorada:") + "tag ignorada:".length).trim()),
    ),
  ];
  payload.logger.info(
    tagsIgnoradas.length > 0
      ? `[programas:importar] Tags ignoradas (${tagsIgnoradas.length}): ${tagsIgnoradas.join(", ")}`
      : "[programas:importar] Tags ignoradas: nenhuma.",
  );

  const semCargaHoraria = programasImportados
    .filter((p) => p.cargaHorariaTotal === "A definir")
    .map((p) => p.sigla);
  payload.logger.info(
    semCargaHoraria.length > 0
      ? `[programas:importar] Carga horária ainda "A definir" (${semCargaHoraria.length}): ${semCargaHoraria.join(", ")}`
      : '[programas:importar] Carga horária: nenhum programa em "A definir".',
  );

  const semDocente = programasImportados
    .filter((p) => !p.docentes || p.docentes.length === 0)
    .map((p) => p.sigla);
  payload.logger.info(
    semDocente.length > 0
      ? `[programas:importar] Sem docente vinculado (${semDocente.length}): ${semDocente.join(", ")} — vínculo é manual (CLAUDE.md/spec §2.2), não faz parte deste import.`
      : "[programas:importar] Docentes: todos os programas importados têm ao menos um vinculado.",
  );

  payload.logger.info("──────────────────────────────────────────────");
  payload.logger.info(
    `[programas:importar] Concluído. ${linhas.filter((l) => l.acao === "atualizado").length}/${linhas.length} programas ${APLICAR ? "atualizados" : "seriam atualizados"}.`,
  );

  // O adapter Postgres mantém o pool de conexões aberto — sem isso o
  // processo nunca sai sozinho (mesmo padrão de todo seed script deste
  // diretório: seedCorpoDocente.ts, vincularFotosEspecialistas.ts, etc.).
  process.exit(0);
}

// process.env.VITEST é setado pelo próprio Vitest em todo runner (mesma
// ideia do JEST_WORKER_ID do Jest) — usado aqui só para este módulo poder
// exportar `planejarImportacao` para teste sem disparar `main()` (que abre
// conexão real com o banco) como efeito colateral do import.
if (!process.env.VITEST) {
  void main().catch((err) => {
    console.error("[programas:importar] Falha:", err);
    process.exit(1);
  });
}
