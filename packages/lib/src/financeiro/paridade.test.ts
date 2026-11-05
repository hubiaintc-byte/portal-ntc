import { describe, expect, it } from "vitest";
import { carregarFixture } from "./__fixtures__/carregar";

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


describe("paridade com o protótipo FIN-05 (reconhecimento, evento e carteira)", () => {
  it("reconhecimentoReceita", async () => {
    const { reconhecimentoReceita } = await import("./reconhecimento");
    for (const r of fx.db.receitas) {
      const esperado = (fx.saidas.reconhecimentoReceita as unknown as Record<string, unknown>)[r.id];
      expect(reconhecimentoReceita(r, fx.db, fx.hoje), r.id).toEqual(esperado);
    }
  });

  it("eventMetrics", async () => {
    const { eventMetrics } = await import("./eventos");
    for (const ev of fx.db.eventos) {
      const esperado = (fx.saidas.eventMetrics as unknown as Record<string, Record<string, unknown>>)[ev.id]!;
      const { demo, ...resto } = esperado;
      const m = eventMetrics(ev, fx.db, fx.hoje);
      const chavesComissao = Object.keys(resto).filter((k) => /^comissao|^nComissoes$|^vendedores$|^custoOperacional/.test(k));
      for (const k of chavesComissao) delete resto[k];
      expect(m, ev.id).toMatchObject(resto);
      const d = demo as { receita: number[]; custoTotal: number[]; resultado: number[] };
      expect(m.demo.receita).toEqual(d.receita);
      expect(m.demo.custo).toEqual(d.custoTotal);
      expect(m.demo.resultado).toEqual(d.resultado);
    }
  });

  it("eventAlerts", async () => {
    const { eventAlerts } = await import("./eventos");
    let total = 0;
    for (const ev of fx.db.eventos) {
      const esperado = (
        (fx.saidas.eventAlerts as unknown as Record<string, { sev: string; titulo: string; detalhe: string; tab: string; valor: number | null }[]>)[ev.id] ?? []
      )
        .filter((a) => a.tab !== "comissoes")
        .map((a) => ({ severidade: a.sev, titulo: a.titulo, detalhe: a.detalhe, aba: a.tab, valor: a.valor }));
      const obtido = eventAlerts(ev, fx.db, fx.hoje).map(({ severidade, titulo, detalhe, aba, valor }) => ({ severidade, titulo, detalhe, aba, valor }));
      expect(obtido, ev.id).toEqual(esperado);
      total += esperado.length;
    }
    expect(total).toBeGreaterThan(0);
  });

  it("portfolio por período", async () => {
    const { portfolio } = await import("./eventos");
    const periodos = Object.keys(fx.saidas.portfolio!);
    expect(periodos.length).toBe(7);
    for (const periodo of periodos) {
      const esperado = (fx.saidas.portfolio as unknown as Record<string, { tot: Record<string, number>; alerts: { sev: string; titulo: string; eventoId: string }[]; evIds: string[]; rows: { id: string; m: Record<string, unknown> }[] }>)[periodo]!;
      const p = portfolio({ periodo: periodo as never, vertical: "all", modalidade: "all", status: "all", tipo: "all" }, fx.db, fx.hoje);
      const tot = Object.fromEntries(Object.entries(esperado.tot).filter(([k]) => !/^comissao/.test(k)));
      expect(p.tot, periodo).toMatchObject(tot);
      expect(p.evIds, periodo).toEqual(esperado.evIds);
      expect(p.rows.map((x) => x.ev.id), periodo).toEqual(esperado.rows.map((x) => x.id));
      expect(p.alerts.map((a) => [a.severidade, a.titulo, a.eventoId]), periodo).toEqual(
        esperado.alerts.filter((a) => (a as { tab?: string }).tab !== "comissoes").map((a) => [a.sev, a.titulo, a.eventoId]),
      );
      for (const [i, x] of esperado.rows.entries()) {
        expect(p.rows[i]!.m.resultadoRealizado, `${periodo} ${x.id}`).toBe(x.m.resultadoRealizado);
      }
    }
  });
});
