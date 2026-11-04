/**
 * Lê o `?lead=` da URL do /crm (destino do aviso de lead novo). Só um id
 * inteiro positivo passa; qualquer outra coisa é ignorada em silêncio.
 */
export function leadInicialDaUrl(valor: string | string[] | undefined): string | undefined {
  if (typeof valor !== "string") return undefined;
  return /^[1-9]\d*$/.test(valor) ? valor : undefined;
}
