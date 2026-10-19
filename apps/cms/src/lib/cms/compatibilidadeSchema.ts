/**
 * Ajustes de schema da atualização Payload 3.18 → 3.90.
 *
 * Sobrou só a marca de RLS: os ajustes temporários (`_objectKey` virtual,
 * sessões e `minRequestInterval` desligados) saíram em 19/10/2026, depois do
 * push que criou as colunas e tabelas do 3.90.
 */

const ENABLE_RLS = Symbol.for("drizzle:EnableRLS");

/**
 * `afterSchemaInit` do adapter Postgres: marca TODAS as tabelas com RLS ligado.
 *
 * No Supabase as 126 tabelas do Payload estão com `relrowsecurity = true` e
 * nenhuma policy — ou seja, a API REST pública do Supabase (PostgREST, chave
 * anon) não lê nada delas; o Payload conecta como dono e não é afetado. O
 * drizzle-kit 0.31 (que veio com o Payload 3.90) passou a comparar o estado de
 * RLS e, sem esta marca, o `payload:push:schema` emitiria
 * `ALTER TABLE … DISABLE ROW LEVEL SECURITY` nas 126 tabelas — sem prompt
 * nenhum, porque o drizzle não trata isso como perda de dado — e exporia
 * usuários, leads e propostas à chave anon. NÃO remover.
 */
export function manterRlsLigado<S extends { tables: Record<string, unknown> }>({ schema }: { schema: S }): S {
  for (const tabela of Object.values(schema.tables)) {
    if (tabela && typeof tabela === "object") {
      (tabela as Record<symbol, unknown>)[ENABLE_RLS] = true;
    }
  }
  return schema;
}
