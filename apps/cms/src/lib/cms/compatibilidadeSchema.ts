import type { Config, Field, Plugin } from "payload";

/**
 * Ajustes de schema da atualização Payload 3.18 → 3.90.
 *
 * O banco é um só para dev e produção, e o `payload:push:schema` é manual
 * (CLAUDE.md §14). Estes dois ajustes deixam o código novo rodar contra o
 * schema que JÁ está no banco, sem exigir push no mesmo deploy.
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

const COLECOES_COM_STORAGE = ["media", "documentos-comerciais"];

function tornarObjectKeyVirtual(fields: Field[]): Field[] {
  return fields.map((field) =>
    "name" in field && field.name === "_objectKey" && field.type === "text"
      ? { ...field, virtual: true }
      : field,
  );
}

/**
 * Plugin que precisa vir DEPOIS dos `s3Storage`: o plugin de storage do
 * Payload 3.90 acrescenta o campo `_objectKey` às coleções de upload, com
 * coluna própria (`_objectkey`) que não existe no banco — e toda leitura de
 * `media`/`documentos-comerciais` (e de qualquer documento que as popule)
 * falharia com `column "_objectkey" does not exist`.
 *
 * O `_objectKey` só é preenchido em uploads feitos direto do navegador
 * (`clientUploads`), que este projeto não usa: nos uploads pelo servidor ele
 * fica vazio. Marcá-lo como `virtual` (sem coluna) é, portanto, equivalente
 * para nós. TEMPORÁRIO: depois do push que cria a coluna, remover este plugin.
 */
export const objectKeySemColuna: Plugin = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((colecao) =>
    COLECOES_COM_STORAGE.includes(colecao.slug)
      ? { ...colecao, fields: tornarObjectKeyVirtual(colecao.fields) }
      : colecao,
  ),
});
