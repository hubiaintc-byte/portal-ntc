/**
 * Derivados da avaliação de qualificação, gravados pelo hook beforeChange da
 * coleção: score, faixa e a data de conclusão. Persistidos (e não só
 * calculados na tela) para permitir ordenar e filtrar — decisão de docs/17 §4.
 */
import { calcularScore, faixaDoScore, type AvaliacaoCom04 } from "@ntc/lib";

export interface DerivadosAvaliacao {
  scoreTotal: number | null;
  faixa: string | null;
  concluidaEm: string | null;
}

export function montarDerivadosAvaliacao(
  dados: AvaliacaoCom04,
  hojeISO: string,
): DerivadosAvaliacao {
  const scoreTotal = calcularScore(dados);
  const concluidaAtual = typeof dados.concluidaEm === "string" ? dados.concluidaEm : null;
  return {
    scoreTotal,
    faixa: faixaDoScore(scoreTotal),
    concluidaEm:
      dados.statusAvaliacao === "concluida" ? (concluidaAtual ?? hojeISO) : concluidaAtual,
  };
}
