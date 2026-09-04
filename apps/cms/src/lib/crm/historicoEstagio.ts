/**
 * Regra de registro do histórico de estágio (docs/17 §1.2 e §4.0 · M6).
 * Pura: o hook da coleção só decide persistir o que esta função montar.
 */

import type { RequiredDataFromCollectionSlug } from "payload";

import { ESTAGIO_OPORTUNIDADE } from "@ntc/lib";

/**
 * União literal dos 11 slugs de estágio, derivada dos tipos gerados do
 * Payload (mesmo padrão de `apps/cms/src/seed/importarCrm.ts`) — evita
 * `estagioNovo`/`estagioAnterior` como `string` solto, que o Payload rejeita
 * na escrita em `historico-estagio` (campo `select`, união literal).
 */
export type EstagioOportunidade = NonNullable<RequiredDataFromCollectionSlug<"oportunidades">["estagio"]>;

export interface EntradaTransicaoEstagio {
  oportunidadeId: number | string;
  anterior: EstagioOportunidade | null;
  novo: EstagioOportunidade | null;
  usuarioId?: number | string | null;
  atorSistema?: string | null;
  motivo?: string | null;
}

export interface TransicaoEstagio {
  oportunidade: number;
  estagioAnterior: EstagioOportunidade | null;
  estagioNovo: EstagioOportunidade;
  dataHora: string;
  usuario: number | null;
  atorSistema: string | null;
  motivo: string | null;
}

const numeroOuNulo = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Type guard de verdade: confirma que `v` é um dos 11 slugs válidos de
 * `ESTAGIO_OPORTUNIDADE`, não apenas uma `string`. Usada pelo hook da
 * coleção para estreitar valores soltos vindos de `doc`/`previousDoc` (que o
 * Payload tipa como o union literal, mas que na prática podem carregar
 * qualquer string se o dado no banco estiver corrompido ou desatualizado).
 * Um valor fora da lista é tratado como ausente, nunca propagado.
 */
export function ehEstagioOportunidade(v: unknown): v is EstagioOportunidade {
  return typeof v === "string" && ESTAGIO_OPORTUNIDADE.some((opcao) => opcao.value === v);
}

/** Lê `v` como estágio válido, ou `null` quando não é (ausente ou fora da lista). */
export function lerEstagioOuNulo(v: unknown): EstagioOportunidade | null {
  return ehEstagioOportunidade(v) ? v : null;
}

/**
 * Devolve o documento da transição, ou null quando não há transição a registrar
 * (estágio ausente ou inalterado). Toda transição sai com autor legível: o
 * usuário da sessão quando existe, senão um ator de sistema nomeado — nunca
 * uma referência a um usuário inexistente, que a tela renderizaria como "—".
 */
export function montarTransicaoEstagio(e: EntradaTransicaoEstagio): TransicaoEstagio | null {
  if (e.novo === null || e.novo === e.anterior) return null;
  const usuario = numeroOuNulo(e.usuarioId);
  const oportunidade = numeroOuNulo(e.oportunidadeId);
  if (oportunidade === null) return null;
  return {
    oportunidade,
    estagioAnterior: e.anterior,
    estagioNovo: e.novo,
    dataHora: new Date().toISOString(),
    usuario,
    atorSistema: usuario === null ? (e.atorSistema ?? "sistema") : (e.atorSistema ?? null),
    motivo: e.motivo ?? null,
  };
}
