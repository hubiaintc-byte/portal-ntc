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

  it("texto começando com = + - @ (ou tab/CR) é neutralizado com apóstrofo; número e dinheiro não", () => {
    const col = [
      { titulo: "t", valor: (l: { t: string; n: number; d: number }) => l.t },
      { titulo: "n", valor: (l: { t: string; n: number; d: number }) => l.n },
      { titulo: "d", valor: (l: { t: string; n: number; d: number }) => l.d, dinheiro: true },
    ];
    const linhas = [
      { t: "=HYPERLINK(\"http://x\")", n: -3, d: -150 },
      { t: "+55 61", n: 0, d: 0 },
      { t: "-cmd", n: 1, d: 1 },
      { t: "@SUM(A1)", n: 1, d: 1 },
      { t: "\tcolado", n: 1, d: 1 },
      { t: "Prefeitura =X", n: 1, d: 1 },
    ];
    const l = gerarCsv(col, linhas).slice(1).split("\n");
    expect(l[1]).toBe('"\'=HYPERLINK(""http://x"")";-3;-1,50');
    expect(l[2]).toBe("'+55 61;0;0,00");
    expect(l[3]).toBe("'-cmd;1;0,01");
    expect(l[4]).toBe("'@SUM(A1);1;0,01");
    expect(l[5]).toBe("'\tcolado;1;0,01");
    expect(l[6]).toBe("Prefeitura =X;1;0,01");
  });
});
