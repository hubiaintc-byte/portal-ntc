/**
 * Derivados da avaliação de qualificação, gravados pelo hook beforeChange da
 * coleção: score, faixa e a data de conclusão. Persistidos (e não só
 * calculados na tela) para permitir ordenar e filtrar — decisão de docs/17 §4.
 *
 * A derivação não depende de QUANTO do documento o chamador enviou. Uma
 * escrita parcial (PATCH via REST/Local API, ou o `payload.update({ where })`
 * que o hook de vigência dispara com apenas `{ vigente: false }`) pode trazer
 * só um punhado de campos; os que não vierem são lidos do documento já
 * persistido (`originalDoc`), no mesmo espírito de
 * `calcularStatusLegadoEspelhado` (Sessão H1). Presença da CHAVE é o critério,
 * não o valor: uma nota enviada explicitamente como `null` (o avaliador
 * limpou o campo) apaga a nota; uma chave ausente é campo não tocado.
 */
import { DIMENSOES_COM04, calcularScore, faixaDoScore, type AvaliacaoCom04 } from "@ntc/lib";

export interface DerivadosAvaliacao {
  scoreTotal: number | null;
  faixa: string | null;
  concluidaEm: string | null;
}

const FORMATO_DATA_SP = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Data de hoje em São Paulo, no formato `YYYY-MM-DD` que o campo `concluidaEm`
 * armazena. `new Date().toISOString()` carimbaria a data de AMANHÃ para tudo
 * que fosse concluído depois das 21h no horário de Brasília — a avaliação é
 * registro comercial datado, então o dia precisa ser o dia de quem avalia.
 * `en-CA` é o locale cujo formato numérico curto já é `YYYY-MM-DD`.
 */
export function hojeEmSaoPaulo(agora: Date = new Date()): string {
  return FORMATO_DATA_SP.format(agora);
}

/** Valor do campo nesta escrita; cai para o documento persistido quando a chave não veio. */
function valorDoCampo(
  campo: string,
  dados: AvaliacaoCom04 | null | undefined,
  originalDoc: AvaliacaoCom04 | null | undefined,
): unknown {
  if (dados !== null && dados !== undefined && campo in dados) return dados[campo];
  return originalDoc?.[campo];
}

/**
 * Normaliza a data de conclusão para o `YYYY-MM-DD` do campo. O adapter pode
 * devolver a data já como `Date` (ou como ISO completo) no `originalDoc`; sem
 * normalizar, um `Date` não seria reconhecido como data existente e a
 * conclusão seria recarimbada com a data de hoje a cada edição. O recorte é em
 * UTC de propósito: é assim que o Payload persiste um campo `date` sem hora, e
 * converter para o fuso local moveria a data um dia para trás.
 */
function comoDataDeCampo(valor: unknown): string | null {
  if (typeof valor === "string") return valor.length === 0 ? null : valor.slice(0, 10);
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor.toISOString().slice(0, 10);
  return null;
}

export function montarDerivadosAvaliacao(
  dados: AvaliacaoCom04 | null | undefined,
  hojeISO: string,
  originalDoc?: AvaliacaoCom04 | null,
): DerivadosAvaliacao {
  const notas: AvaliacaoCom04 = {};
  for (const d of DIMENSOES_COM04) notas[d.campo] = valorDoCampo(d.campo, dados, originalDoc);
  const scoreTotal = calcularScore(notas);
  const statusAvaliacao = valorDoCampo("statusAvaliacao", dados, originalDoc);
  const concluidaAtual = comoDataDeCampo(valorDoCampo("concluidaEm", dados, originalDoc));
  return {
    scoreTotal,
    faixa: faixaDoScore(scoreTotal),
    concluidaEm: statusAvaliacao === "concluida" ? (concluidaAtual ?? hojeISO) : concluidaAtual,
  };
}
