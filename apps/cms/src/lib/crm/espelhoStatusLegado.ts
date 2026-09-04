/**
 * Regra do espelho `status` legado ⇐ estágio+situação (docs/17 §1.1 · M6).
 * Pura: o hook `beforeChange` da coleção só decide persistir o que esta
 * função calcular.
 *
 * Uma atualização parcial (PATCH via REST/Local API) pode enviar só um dos
 * dois campos — por exemplo, só `situacao`, quando a Direção move uma
 * oportunidade para "Perdida" sem tocar no estágio. Nesse caso o campo
 * ausente no `data` precisa ser lido do documento já persistido
 * (`originalDoc`), nunca substituído por um default fixo: usar o default
 * corromperia o espelho, fazendo `status` regredir para o estágio inicial
 * mesmo com a oportunidade avançada no funil.
 */

import { estagioLegado } from "@ntc/lib";

export interface CamposFunilOportunidade {
  estagio?: string | null;
  situacao?: string | null;
}

const campoTexto = (v: string | null | undefined): string | null => (typeof v === "string" ? v : null);

/**
 * Calcula o `status` legado a partir do par estágio+situação, priorizando o
 * valor que está chegando na escrita (`data`) e caindo para o valor já
 * persistido (`originalDoc`) quando o campo não veio nesta escrita. Só
 * devolve `null` quando NENHUM dos dois campos existe em nenhuma das duas
 * fontes — aí não há nada a espelhar (ex.: criação que ainda não define
 * estágio nem situação).
 */
export function calcularStatusLegadoEspelhado(
  data: CamposFunilOportunidade | null | undefined,
  originalDoc: CamposFunilOportunidade | null | undefined,
): string | null {
  const dataEstagio = campoTexto(data?.estagio);
  const dataSituacao = campoTexto(data?.situacao);
  const originalEstagio = campoTexto(originalDoc?.estagio);
  const originalSituacao = campoTexto(originalDoc?.situacao);

  if (dataEstagio === null && dataSituacao === null && originalEstagio === null && originalSituacao === null) {
    return null;
  }

  const estagio = dataEstagio ?? originalEstagio ?? "mapeada";
  const situacao = dataSituacao ?? originalSituacao ?? "ativa";
  return estagioLegado(estagio, situacao);
}
