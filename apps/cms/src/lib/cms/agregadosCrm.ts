import "server-only";

import { sql, type PostgresAdapter } from "@payloadcms/db-postgres";
import type { Payload } from "payload";

/**
 * Agregados das listas do CRM calculados no banco (GROUP BY), em vez de trazer
 * coleções inteiras para contar em memória. SOMENTE LEITURA.
 *
 * Os nomes de tabela/coluna são os que o adapter Postgres do Payload gera para
 * relacionamentos simples (`<campo>_id` na própria tabela). Nenhuma dessas
 * coleções tem `trash` nem `versions`, então a tabela principal é exatamente o
 * que um `payload.find` sem filtro leria.
 */

type Linha = Record<string, unknown>;

async function consultar(payload: Payload, consulta: ReturnType<typeof sql>): Promise<Linha[]> {
  const res = await (payload.db as unknown as PostgresAdapter).drizzle.execute(consulta);
  return res.rows as Linha[];
}

function contagens(linhas: Linha[], chave: string): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const l of linhas) {
    const id = l[chave];
    if (id === null || id === undefined) continue;
    mapa.set(String(id), Number(l.n));
  }
  return mapa;
}

/** Mesmo formato que o Payload entrega num campo `date` (ISO com milissegundos, em UTC). */
function paraISO(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string" && v.length > 0) return new Date(v).toISOString();
  return null;
}

/** Nº de leads do CRM (`tipo = proposta`) por cliente. */
export async function contarNegociosPorCliente(payload: Payload): Promise<Map<string, number>> {
  const linhas = await consultar(
    payload,
    sql`select cliente_id, count(*)::int as n from leads where tipo = 'proposta' and cliente_id is not null group by cliente_id`,
  );
  return contagens(linhas, "cliente_id");
}

/** ISO do item mais recente da linha do tempo de cada cliente. */
export async function ultimoItemLinhaDoTempoPorCliente(payload: Payload): Promise<Map<string, string>> {
  const linhas = await consultar(
    payload,
    sql`select cliente_id, max(em) as ultimo from linha_do_tempo where cliente_id is not null group by cliente_id`,
  );
  const mapa = new Map<string, string>();
  for (const l of linhas) {
    const iso = paraISO(l.ultimo);
    if (l.cliente_id !== null && l.cliente_id !== undefined && iso) mapa.set(String(l.cliente_id), iso);
  }
  return mapa;
}

/** Nº de módulos por programa. */
export async function contarModulosPorPrograma(payload: Payload): Promise<Map<string, number>> {
  const linhas = await consultar(
    payload,
    sql`select programa_id, count(*)::int as n from modulos where programa_id is not null group by programa_id`,
  );
  return contagens(linhas, "programa_id");
}
