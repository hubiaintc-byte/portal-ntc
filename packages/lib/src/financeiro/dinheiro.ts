import type { Centavos } from "./tipos";

/**
 * Lê reais brasileiros digitados ("1.234,56", "1234,5", "1234", "R$ 10") e
 * devolve centavos inteiros; `null` se não for um valor válido.
 */
export function paraCentavos(texto: string): Centavos | null {
  const limpo = texto.replace(/^\s*R\$\s*/i, "").trim();
  const m = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(limpo);
  if (!m) return null;
  const inteiros = Number(m[1]!.replace(/\./g, ""));
  const cents = m[2] ? Number(m[2].padEnd(2, "0")) : 0;
  const total = inteiros * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

/** `123456` → `R$ 1.234,56` (negativo: `-R$ 1.234,56`). */
export function formatarReais(c: Centavos): string {
  const neg = c < 0;
  const abs = Math.abs(Math.round(c));
  const inteiros = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const cents = String(abs % 100).padStart(2, "0");
  return `${neg ? "-" : ""}R$ ${inteiros},${cents}`;
}

/** Data civil (`AAAA-MM-DD`) em America/Sao_Paulo. */
export function hojeEmSaoPaulo(agora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

/** `2026-07-15` → `2026-07`. */
export function mesDe(dataISO: string): string {
  return dataISO.slice(0, 7);
}
