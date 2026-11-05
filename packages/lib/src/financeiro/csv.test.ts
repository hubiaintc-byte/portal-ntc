import { describe, expect, it } from "vitest";
import { gerarCsv } from "./csv";

describe("gerarCsv", () => {
  it("CSV escapa ponto e vírgula e aspas", () => {
    const csv = gerarCsv(
      [
        { titulo: "Nome; completo", valor: (l: { a: string }) => l.a },
        { titulo: "Valor", valor: () => 123456, dinheiro: true },
      ],
      [{ a: 'Órgão "X"; Y' }, { a: "linha\nquebrada" }],
    );
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\n")[0]).toBe('"Nome; completo";Valor');
    expect(csv).toContain('"Órgão ""X""; Y";1234,56');
    expect(csv).toContain('"linha\nquebrada";1234,56');
  });

  it("dinheiro em reais com vírgula, inclusive negativo e centavos < 10", () => {
    const col = [{ titulo: "v", valor: (x: number) => x, dinheiro: true }];
    expect(gerarCsv(col, [5, -5, -123450, 0]).slice(1)).toBe("v\n0,05\n-0,05\n-1234,50\n0,00");
  });
});
