import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { LivroFinanceiro } from "./tipos";

type Saidas = Record<string, Record<string, Record<string, unknown>>>;

export interface FixtureParidade {
  hoje: string;
  db: LivroFinanceiro;
  saidas: Saidas;
}

/** Lê o fixture do protótipo e completa os campos de integração que ele não tem. */
export function carregarFixture(): FixtureParidade {
  const bruto = JSON.parse(
    readFileSync(new URL("./__fixtures__/paridade-fin05.json", import.meta.url), "utf8"),
  ) as { hoje: string; db: Record<string, unknown[]>; saidas: Saidas };
  const db = {
    ...bruto.db,
    eventos: bruto.db.eventos!.map((e) => ({
      origem: "financeiro",
      eventoComercialId: null,
      cadastroPendente: false,
      canceladoNoCrm: false,
      ...(e as object),
    })),
  } as unknown as LivroFinanceiro;
  return { hoje: bruto.hoje, db, saidas: bruto.saidas };
}

const fx = carregarFixture();

describe("paridade com o protótipo FIN-05 (receitas, parcelas, custos, títulos)", () => {
  it("receitaFin", async () => {
    const { receitaFin } = await import("./receitas");
    for (const r of fx.db.receitas) {
      const { parcelasIds, ...esperado } = fx.saidas.receitaFin![r.id] as Record<string, unknown> & {
        parcelasIds: string[];
      };
      const m = receitaFin(r, fx.db);
      expect(m, r.id).toMatchObject(esperado);
      expect(m.parcelas.map((p) => p.id), r.id).toEqual(parcelasIds);
    }
  });

  it("faturamentoFin", async () => {
    const { faturamentoFin } = await import("./receitas");
    for (const f of fx.db.faturamentos) {
      expect(faturamentoFin(f, fx.hoje), f.id).toMatchObject(fx.saidas.fatrecFin![f.id]!);
    }
  });

  it("custoFin", async () => {
    const { custoFin } = await import("./custos");
    for (const c of fx.db.custos) {
      const { pagamentosIds, ...esperado } = fx.saidas.custoFin![c.id] as Record<string, unknown> & {
        pagamentosIds: string[];
      };
      const m = custoFin(c, fx.db);
      expect(m, c.id).toMatchObject(esperado);
      expect(m.pagamentos.map((p) => p.id), c.id).toEqual(pagamentosIds);
    }
  });

  it("pagamentoFin", async () => {
    const { pagamentoFin } = await import("./custos");
    for (const p of fx.db.pagamentos) {
      expect(pagamentoFin(p, fx.hoje), p.id).toMatchObject(fx.saidas.pagamentoFin![p.id]!);
    }
  });

  it("o fixture exerce vencidos de parcela e de título", () => {
    expect(Object.values(fx.saidas.fatrecFin!).some((x) => x.vencido === true)).toBe(true);
    expect(Object.values(fx.saidas.pagamentoFin!).some((x) => x.vencido === true)).toBe(true);
  });
});
