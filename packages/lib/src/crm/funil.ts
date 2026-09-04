/**
 * Funil comercial P0 — 11 estágios (posição) × 3 situações (condição), espelho
 * do campo `status` legado e tabela de migração. Espelha o módulo P0_SETUP do
 * protótipo NTC_Comercial_Premium v3.3 P0. Puro, sem I/O: usado no cliente
 * (selects), no servidor (hooks do Payload) e no script de migração.
 *
 * Fonte: docs/17_Migracao_P0_Processo_Comercial_B2G_v1.md §1.1 e §1.5.
 */

import { opcoes, type OpcaoLista } from "./listas";

export const ESTAGIO_OPORTUNIDADE: OpcaoLista[] = opcoes([
  "Mapeada",
  "Prospecção / Relacionamento",
  "Demanda Identificada",
  "Qualificada",
  "Diagnóstico Realizado",
  "Solução em Construção",
  "Proposta em Elaboração",
  "Proposta Enviada",
  "Negociação / Tramitação",
  "Contratação em Formalização",
  "Ganha",
]);

export const SITUACAO_OPORTUNIDADE: OpcaoLista[] = opcoes([
  "Ativa",
  "Perdida",
  "Adiada / Nurturing",
]);

/** Estágios com equivalente direto no enum legado STATUS_OPORTUNIDADE. */
const LEGADO_POR_ESTAGIO: Record<string, string> = {
  ganha: "contratada",
  "contratacao-em-formalizacao": "aprovada",
  "negociacao-tramitacao": "em-negociacao",
  "proposta-enviada": "proposta-enviada",
  "prospeccao-relacionamento": "apresentacao-institucional",
};

/**
 * Preenche o campo `status` legado a partir do par estágio+situação, para o
 * Dashboard e os gráficos continuarem funcionando até a Sessão H7 migrá-los.
 *
 * "Adiada / Nurturing" vira `cancelada` porque é o único valor legado que tira
 * a oportunidade do funil ativo sem registrá-la como perda (ver
 * STATUS_OPORTUNIDADE_FECHADA em ./listas). É perda de informação consciente e
 * temporária — o espelho inteiro morre quando o campo legado for removido.
 */
export function estagioLegado(estagio: string, situacao: string): string {
  if (situacao === "perdida") return "perdida";
  if (situacao === "adiada-nurturing") return "cancelada";
  return LEGADO_POR_ESTAGIO[estagio] ?? "em-qualificacao";
}

export interface PlanoMigracaoP0 {
  estagio: string;
  situacao: string;
  /** true ⇒ o destino é provisório e exige confirmação humana antes de virar verdade histórica. */
  revisao: boolean;
  flag: string;
}

const FALLBACK_PERDIDA =
  "[VALIDAR COM A DIREÇÃO] estágio anterior desconhecido — Mapeada é fallback técnico, NÃO verdade histórica";

const TABELA_MIGRACAO: Record<string, PlanoMigracaoP0> = {
  "em-qualificacao": {
    estagio: "demanda-identificada",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] confirmar se já havia avaliação de qualificação",
  },
  "apresentacao-institucional": {
    estagio: "prospeccao-relacionamento",
    situacao: "ativa",
    revisao: false,
    flag: "",
  },
  "proposta-enviada": { estagio: "proposta-enviada", situacao: "ativa", revisao: false, flag: "" },
  "em-negociacao": {
    estagio: "negociacao-tramitacao",
    situacao: "ativa",
    revisao: false,
    flag: "",
  },
  aprovada: {
    estagio: "contratacao-em-formalizacao",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] aceite do cliente não é Ganha",
  },
  contratada: {
    estagio: "contratacao-em-formalizacao",
    situacao: "ativa",
    revisao: true,
    flag: "[VALIDAR COM A DIREÇÃO] Ganha exige contratação formalizada e handoff aceito",
  },
  perdida: { estagio: "mapeada", situacao: "perdida", revisao: true, flag: FALLBACK_PERDIDA },
  cancelada: {
    estagio: "mapeada",
    situacao: "perdida",
    revisao: true,
    flag: `${FALLBACK_PERDIDA}; Cancelada pode ser Perdida, Adiada/Nurturing ou cancelamento administrativo`,
  },
};

/** Converte o `status` legado no par estágio+situação, marcando o que precisa de revisão humana. */
export function planejarMigracaoOportunidade(statusLegado: string | null): PlanoMigracaoP0 {
  if (statusLegado === null) {
    return {
      estagio: "mapeada",
      situacao: "ativa",
      revisao: true,
      flag: "[VALIDAR COM A DIREÇÃO] oportunidade sem status legado",
    };
  }
  return (
    TABELA_MIGRACAO[statusLegado] ?? {
      estagio: "mapeada",
      situacao: "ativa",
      revisao: true,
      flag: `[VALIDAR COM A DIREÇÃO] status legado desconhecido: ${statusLegado}`,
    }
  );
}
