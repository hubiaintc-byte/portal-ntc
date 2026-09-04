/**
 * Regra de registro do histórico de estágio (docs/17 §1.2 e §4.0 · M6).
 * Pura: o hook da coleção só decide persistir o que esta função montar.
 */

export interface EntradaTransicaoEstagio {
  oportunidadeId: number | string;
  anterior: string | null;
  novo: string | null;
  usuarioId?: number | string | null;
  atorSistema?: string | null;
  motivo?: string | null;
}

export interface TransicaoEstagio {
  oportunidade: number;
  estagioAnterior: string | null;
  estagioNovo: string;
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
