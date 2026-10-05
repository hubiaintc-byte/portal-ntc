/** Palavras por minuto de leitura adulta em texto institucional. */
const PALAVRAS_POR_MINUTO = 200;

/**
 * Tempo de leitura em minutos inteiros, mínimo 1 — "0 min de leitura"
 * num artigo curto é pior do que arredondar para cima.
 */
export function calcularTempoLeituraMin(texto: string): number {
  const palavras = texto
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0).length;
  if (palavras === 0) return 1;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}
