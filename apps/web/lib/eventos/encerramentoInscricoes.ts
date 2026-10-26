/**
 * Regra única de encerramento das inscrições de evento: elas ficam abertas
 * até as 8h (horário de Brasília) do primeiro dia do evento. A partir desse
 * instante o evento sai de "Inscrições abertas" e vai para "Eventos
 * realizados" na agenda, some da Home e a página do evento mostra
 * "Inscrições encerradas".
 *
 * Brasília não tem horário de verão desde 2019, então o fuso é fixo em -03:00.
 */

const HORA_ENCERRAMENTO = "08:00:00";
const FUSO_BRASILIA = "-03:00";

/** Instante ISO do encerramento a partir da data de início ("2026-11-04" ou um ISO completo). */
export function encerramentoInscricoesISO(dataInicio: string): string {
  return `${dataInicio.slice(0, 10)}T${HORA_ENCERRAMENTO}${FUSO_BRASILIA}`;
}

export function inscricoesEncerradas(dataInicio: string, agora: Date): boolean {
  return agora.getTime() >= new Date(encerramentoInscricoesISO(dataInicio)).getTime();
}
