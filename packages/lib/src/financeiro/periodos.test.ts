import { describe, expect, test } from "vitest";
import { inPeriod, periodosDisponiveis } from "./periodos";
import type { LivroFinanceiro, ReceitaFin } from "./tipos";

function livroCom(receita: Partial<ReceitaFin>): LivroFinanceiro {
  return {
    eventos: [],
    receitas: [{ id: "RC-1", ...receita } as ReceitaFin],
    faturamentos: [],
    custos: [],
    pagamentos: [],
    contas: [],
  };
}

describe("períodos", () => {
  test("períodos cobrem o ano de hoje e os anos do livro", () => {
    const v = periodosDisponiveis(livroCom({ competencia: "2028-02-01" }), "2026-07-15").map((p) => p.valor);
    expect(v).toEqual(
      expect.arrayContaining(["all", "2025", "2026", "2026-Q3", "2027", "2028", "2028-Q1"]),
    );
  });
  test("rótulos como os do protótipo", () => {
    const p = periodosDisponiveis(livroCom({}), "2026-07-15");
    expect(p[0]).toEqual({ valor: "all", rotulo: "Todo o período" });
    expect(p.find((x) => x.valor === "2026")?.rotulo).toBe("Ano 2026");
    expect(p.find((x) => x.valor === "2026-Q3")?.rotulo).toBe("3º trimestre 2026");
  });
  test("inPeriod", () => {
    expect(inPeriod("2026-07-01", "2026-Q3")).toBe(true);
    expect(inPeriod("2026-10-01", "2026-Q3")).toBe(false);
    expect(inPeriod("2026-10-01", "2026")).toBe(true);
    expect(inPeriod("2025-07-01", "2026")).toBe(false);
    expect(inPeriod(undefined, "2026")).toBe(false);
    expect(inPeriod(undefined, "all")).toBe(true);
  });
});
