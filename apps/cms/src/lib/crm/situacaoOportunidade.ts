/**
 * Guard de estreitamento de `situacao` (docs/17 §1.1) — mesmo padrão de
 * `ehEstagioOportunidade`/`lerEstagioOuNulo` em historicoEstagio.ts.
 *
 * Extraído para módulo compartilhado porque tanto o importador do CRM legado
 * (`seed/importarCrm.ts`) quanto o script de migração P0
 * (`seed/migrarOportunidadesP0.ts`) precisam estreitar
 * `PlanoMigracaoP0.situacao` — tipado como `string` solto em `@ntc/lib` — para
 * o union literal exigido pelo campo `select` `situacao` da coleção
 * `oportunidades`.
 */

import type { RequiredDataFromCollectionSlug } from "payload";

import { SITUACAO_OPORTUNIDADE } from "@ntc/lib";

export type SituacaoOportunidade = NonNullable<RequiredDataFromCollectionSlug<"oportunidades">["situacao"]>;

/**
 * Type guard de verdade: confirma que `v` é uma das 3 situações válidas de
 * `SITUACAO_OPORTUNIDADE`, não apenas uma `string`. Um valor fora da lista é
 * tratado como inválido, nunca propagado.
 */
export function ehSituacaoOportunidade(v: string): v is SituacaoOportunidade {
  return SITUACAO_OPORTUNIDADE.some((opcao) => opcao.value === v);
}
