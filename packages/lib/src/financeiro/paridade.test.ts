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

describe("paridade com o protótipo FIN-05 (consolidado, caixa, alertas corporativos, agregados)", () => {
  const filtro = (periodo: string, escopo: "all" | "eventos" | "corporativo") =>
    ({ periodo, vertical: "all", modalidade: "all", status: "all", tipo: "all", escopo, centro: "all" }) as never;
  const ignorar = /^comissao|^nComissoes$|^custoOperacional/;

  it("consolidado nos 3 escopos × períodos", async () => {
    const { consolidado } = await import("./consolidado");
    const casos = [["consolidado", "all"], ["consolidadoEventos", "eventos"], ["consolidadoCorporativo", "corporativo"]] as const;
    let n = 0;
    for (const [chave, escopo] of casos) {
      const porPeriodo = fx.saidas[chave] as unknown as Record<string, Record<string, unknown>>;
      expect(Object.keys(porPeriodo).length).toBe(7);
      for (const [periodo, bruto] of Object.entries(porPeriodo)) {
        const esperado = Object.fromEntries(Object.entries(bruto).filter(([k]) => !ignorar.test(k)));
        const { demo, ...resto } = esperado;
        const k = consolidado(filtro(periodo, escopo), fx.db, fx.hoje);
        expect(k, `${chave} ${periodo}`).toMatchObject(resto);
        const d = demo as { receita: number[]; custoTotal: number[]; resultado: number[] };
        expect(k.demo.receita).toEqual(d.receita);
        expect(k.demo.custo).toEqual(d.custoTotal);
        expect(k.demo.resultado).toEqual(d.resultado);
        expect(k.nContas).toBe(fx.db.contas.length);
        n++;
      }
    }
    expect(n).toBe(21);
  });

  it("extrato e saldosPorConta", async () => {
    const { extrato, saldosPorConta, saldoGeral } = await import("./consolidado");
    expect(extrato(fx.db)).toEqual(fx.saidas.extrato);
    const esperado = fx.saidas.saldosPorConta as unknown as { contaId: string; entradas: number; saidas: number; saldo: number; movimentosIds: string[] }[];
    const obtido = saldosPorConta(fx.db);
    expect(obtido.map((s) => ({ contaId: s.conta.id, entradas: s.entradas, saidas: s.saidas, saldo: s.saldo, movimentosIds: s.movimentos.map((m) => m.id) }))).toEqual(esperado);
    expect(saldoGeral(fx.db)).toBe(obtido.reduce((a, s) => a + s.saldo, 0));
  });

  it("corpAlerts (sem movimentos/competências)", async () => {
    const { corpAlerts } = await import("./consolidado");
    const esperado = (fx.saidas.corpAlerts as unknown as { sev: string; titulo: string; detalhe: string; valor: number | null; go: string }[]).map((a) => ({
      severidade: a.sev, titulo: a.titulo, detalhe: a.detalhe, valor: a.valor, destino: a.go.replace("#/", ""),
    }));
    const obtido = corpAlerts(fx.db, fx.hoje).map(({ severidade, titulo, detalhe, valor, destino }) => ({ severidade, titulo, detalhe, valor, destino }));
    expect(obtido).toEqual(esperado);
    const titulos = obtido.map((a) => a.titulo);
    expect(titulos).toContain("Recebimento corporativo vencido");
    expect(titulos).toContain("Obrigação corporativa vencida");
  });

  it("aging (receber/pagar), cashSeries e groupCosts", async () => {
    const { aging, cashSeries, groupCosts, phaseDonut } = await import("./agregados");
    const { faturamentoFin } = await import("./receitas");
    const { pagamentoFin } = await import("./custos");
    const { LISTAS_FIN } = await import("./listas");
    const semMes = (a: Record<string, number>) => a;
    expect(semMes(aging(fx.db.faturamentos.map((f) => ({ vencimento: f.vencimento, valor: faturamentoFin(f, fx.hoje).exigivel })), fx.hoje) as never)).toEqual(fx.saidas.agingReceber);
    expect(aging(fx.db.pagamentos.map((p) => ({ vencimento: p.vencimento, valor: pagamentoFin(p, fx.hoje).saldo })), fx.hoje)).toEqual(fx.saidas.agingPagar);

    const cs = fx.saidas.cashSeries as unknown as Record<string, unknown>;
    const comoProto = (s: ReturnType<typeof cashSeries>) => ({ labels: s.labels, fat: s.series[0]!.valores, rec: s.series[1]!.valores, pag: s.series[2]!.valores });
    expect(comoProto(cashSeries(fx.db, fx.db.eventos.map((e) => e.id)))).toEqual(cs.todos);
    const porEvento = cs.porEvento as Record<string, unknown>;
    expect(Object.keys(porEvento).length).toBeGreaterThan(0);
    for (const ev of fx.db.eventos) expect(comoProto(cashSeries(fx.db, [ev.id])), ev.id).toEqual(porEvento[ev.id]);

    const todos = fx.db.eventos.map((e) => e.id);
    const fase = groupCosts(fx.db, todos, "fase");
    expect(fase).toEqual(fx.saidas.groupCostsFase);
    const donut = phaseDonut(fx.db, todos);
    const ordem = LISTAS_FIN.fases.filter((f) => fase.some((g) => g.k === f && g.realizado > 0));
    expect(donut.labels).toEqual(ordem);
    expect(donut.series[0]!.valores).toEqual(ordem.map((f) => fase.find((g) => g.k === f)!.realizado));
  });
});
