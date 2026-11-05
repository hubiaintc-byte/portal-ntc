import type { Centavos } from "./tipos";

export interface ColunaCsv<T> {
  titulo: string;
  valor: (linha: T) => string | number;
  /** O valor é dinheiro em centavos: sai em reais com vírgula decimal (`1234,50`). */
  dinheiro?: boolean;
}

const BOM = "﻿";

const escapar = (x: unknown): string => {
  const s = x == null ? "" : String(x);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Injeção de fórmula: texto que começa com `=`, `+`, `-`, `@` (ou tab/CR) vira
 * fórmula ao abrir no Excel/Sheets; ganha um apóstrofo na frente. Só texto —
 * números e dinheiro gerados pelo código saem como estão.
 */
const neutralizar = (x: unknown): unknown =>
  typeof x === "string" && /^[=+\-@\t\r]/.test(x) ? `'${x}` : x;

export function centavosParaCsv(c: Centavos): string {
  const v = Number(c) || 0;
  if (!Number.isInteger(v)) return (v / 100).toFixed(2).replace(".", ",");
  const abs = Math.abs(v);
  return `${v < 0 ? "-" : ""}${Math.floor(abs / 100)},${String(abs % 100).padStart(2, "0")}`;
}

/** CSV como o do protótipo: separador `;`, BOM UTF-8, `\n`, aspas dobradas; texto neutralizado contra fórmula. */
export function gerarCsv<T>(colunas: ColunaCsv<T>[], linhas: T[]): string {
  const cab = colunas.map((c) => escapar(neutralizar(c.titulo))).join(";");
  const corpo = linhas.map((l) =>
    colunas
      .map((c) => escapar(c.dinheiro ? centavosParaCsv(Number(c.valor(l)) || 0) : neutralizar(c.valor(l))))
      .join(";"),
  );
  return BOM + [cab, ...corpo].join("\n");
}
