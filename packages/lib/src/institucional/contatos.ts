/**
 * Telefone e WhatsApp são guardados como o editor digita — "(63) 3212-1199" —
 * e os links são derivados daqui. Um campo só por número: dois campos
 * (texto e link) divergem com o tempo.
 */

/** Só dígitos, com 55 na frente quando o número não trouxe código do país. */
function digitosComPais(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length === 0) return "";
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}

export function telefoneParaHref(numero: string): string {
  const d = digitosComPais(numero);
  return d.length > 0 ? `tel:+${d}` : "";
}

export function whatsappParaHref(numero: string): string {
  const d = digitosComPais(numero);
  return d.length > 0 ? `https://wa.me/${d}` : "";
}

/** As três coordenações que têm canal próprio na página de contato. */
export const VERTICAIS_CONTATO = [
  { valor: "educacao", rotulo: "NTC Educação" },
  { valor: "gestao-publica", rotulo: "NTC Gestão Pública" },
  { valor: "saude", rotulo: "NTC Saúde" },
] as const;
