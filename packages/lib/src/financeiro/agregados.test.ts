import { describe, expect, it } from "vitest";
import {
  aging, cashSeries, cronogramaFaturamento, phaseDonut, serieExigivelPorMes, serieObrigacoesPorMes,
  seriePagantesCortesias, serieReceitaXCusto, serieSegmento, serieVertical, serieOrcadoRealizado, groupCosts,
} from "./agregados";
import { consolidado, corpAlerts, extrato, resumoSaldosPorConta, saldoGeral, saldosPorConta } from "./consolidado";
import { eventMetrics, portfolio } from "./eventos";
import type { LivroFinanceiro } from "./tipos";

const vazio: LivroFinanceiro = { eventos: [], receitas: [], faturamentos: [], custos: [], pagamentos: [], contas: [] };
const hoje = "2026-07-15";
const filtro = { periodo: "all", vertical: "all", modalidade: "all", status: "all", tipo: "all", escopo: "all", centro: "all" } as const;

const semNaN = (v: unknown): boolean => JSON.stringify(v, (_, x) => (typeof x === "number" && !Number.isFinite(x) ? "NaN!" : x)).indexOf("NaN!") < 0;

describe("agregados", () => {
  it("aging separa vencido e faixas", () => {
    const d = (n: number) => new Date(Date.UTC(2026, 6, 15 + n)).toISOString().slice(0, 10);
    const r = aging(
      [
        { vencimento: d(-1), valor: 100 },
        { vencimento: d(0), valor: 1 },
        { vencimento: d(10), valor: 200 },
        { vencimento: d(45), valor: 300 },
        { vencimento: d(75), valor: 400 },
        { vencimento: d(120), valor: 500 },
        { vencimento: "", valor: 7 },
        { vencimento: d(5), valor: 0 },
      ],
      hoje,
    );
    expect(r).toEqual({ vencido: 100, d30: 201, d60: 300, d90: 400, mais: 500, semData: 7 });
  });

  it("livro vazio não produz NaN", () => {
    const k = consolidado(filtro, vazio, hoje);
    expect(semNaN(k)).toBe(true);
    expect(k.execucaoOrcamento).toBeNull();
    expect(k.saldoAtual).toBe(0);
    const p = portfolio(filtro, vazio, hoje);
    const saidas = [
      k, cashSeries(vazio, []), cronogramaFaturamento(vazio, "x"), phaseDonut(vazio, []), serieVertical(p.rows),
      serieOrcadoRealizado(vazio, [], 8), serieSegmento({ rf: [] }), seriePagantesCortesias({ rf: [] }),
      serieExigivelPorMes([]), serieObrigacoesPorMes([]), aging([], hoje), corpAlerts(vazio, hoje),
      extrato(vazio), saldoGeral(vazio), saldosPorConta(vazio), groupCosts(vazio, [], "fase"),
      serieReceitaXCusto({ contratada: 0, orcado: 0, faturada: 0, realizado: 0, recebida: 0, pago: 0 }),
    ];
    for (const s of saidas) expect(semNaN(s)).toBe(true);
    expect(cashSeries(vazio, []).labels).toEqual([]);
    expect(eventMetrics).toBeTypeOf("function");
  });

  it("séries mensais ordenam e formatam o mês", () => {
    expect(serieExigivelPorMes([{ vencimento: "2026-08-10", valor: 5 }, { vencimento: "2026-07-01", valor: 3 }, { vencimento: "2026-08-20", valor: 2 }, { vencimento: "", valor: 9 }, { vencimento: "2026-09-01", valor: 0 }])).toEqual({
      labels: ["jul/26", "ago/26"],
      series: [{ nome: "Exigível", valores: [3, 7] }],
    });
  });
});

describe("resumoSaldosPorConta", () => {
  it("projeta só os números de saldosPorConta, sem movimentos", () => {
    const conta = { id: "5", nome: "C", tipo: "Conta corrente", banco: "", agencia: "", numero: "", saldoInicial: 1000, dataSaldoInicial: "2026-01-01", ativa: true, observacao: "" };
    const livro: LivroFinanceiro = {
      ...vazio,
      contas: [conta, { ...conta, id: "6", saldoInicial: 0 }],
      faturamentos: [{ id: "50", receitaId: "10", eventoId: "", parcela: "1", nf: "", dataFaturamento: "2026-07-01", valorFaturado: 500, vencimento: "", retencaoTributaria: 0, retencaoContratual: 0, retencaoContratualLiberada: 0, dataRecebimento: "2026-07-02", valorRecebido: 500, contaId: "5", quitado: false, observacao: "" }],
      pagamentos: [{ id: "70", custoId: "20", eventoId: "", documento: "", vencimento: "", valor: 200, dataPagamento: "2026-07-03", valorPago: 200, contaId: "5", observacao: "" }],
    };
    expect(resumoSaldosPorConta(livro)).toEqual([
      { contaId: "5", movimentos: 2, entradas: 500, saidas: 200, saldo: 1300 },
      { contaId: "6", movimentos: 0, entradas: 0, saidas: 0, saldo: 0 },
    ]);
    expect(resumoSaldosPorConta(vazio)).toEqual([]);
    const r = resumoSaldosPorConta(livro)[0]!;
    expect(Object.keys(r).sort()).toEqual(["contaId", "entradas", "movimentos", "saidas", "saldo"]);
  });
});
