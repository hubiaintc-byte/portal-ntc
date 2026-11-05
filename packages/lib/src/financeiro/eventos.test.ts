import { describe, expect, it } from "vitest";
import { demonstrativo, eventMetrics, matchEvent, portfolio } from "./eventos";
import type { EventoFin, LivroFinanceiro } from "./tipos";

const vazio: LivroFinanceiro = { eventos: [], receitas: [], faturamentos: [], custos: [], pagamentos: [], contas: [] };
const FILTRO = { periodo: "all", vertical: "all", modalidade: "all", status: "all", tipo: "all" } as const;
const ev = (o: Partial<EventoFin> = {}): EventoFin => ({
  id: "EV-1", nome: "Seminário Águas", vertical: "Educação", tipo: "Seminário", modalidade: "Online", programa: "AGIP",
  modulo: "", cliente: "Prefeitura X", cidade: "Recife", uf: "PE", local: "", dataInicio: "2026-03-10", dataFim: "2026-03-11",
  cargaHoraria: 8, responsavel: "", status: "Planejado", qtdPrevista: 0, capacidade: 0, efetivos: 0, pagantesPrev: 0,
  cortesiasPrev: 0, refCrm: "", refContratual: "", observacoes: "", origem: "financeiro", eventoComercialId: null,
  cadastroPendente: false, canceladoNoCrm: false, ...o,
});

describe("carteira", () => {
  it("livro vazio não produz NaN", () => {
    const p = portfolio(FILTRO, vazio, "2026-07-15");
    expect(p.rows).toEqual([]);
    for (const v of Object.values(p.tot)) {
      expect(v).toBe(0);
      expect(Number.isNaN(v)).toBe(false);
    }
    expect(p.alerts).toEqual([]);
  });

  it("evento sem lançamentos tem razões nulas, não NaN", () => {
    const m = eventMetrics(ev(), vazio, "2026-07-15");
    expect(m.execucaoOrcamento).toBeNull();
    expect(m.custoPorParticipante).toBeNull();
    expect(m.receitaPorPagante).toBeNull();
  });

  it("evento cancelado no CRM soma igual", () => {
    const a = eventMetrics(ev(), vazio, "2026-07-15");
    const b = eventMetrics(ev({ canceladoNoCrm: true }), vazio, "2026-07-15");
    expect(b).toEqual(a);
  });

  it("matchEvent: filtros e busca sem acento", () => {
    expect(matchEvent(ev(), FILTRO)).toBe(true);
    expect(matchEvent(ev(), { ...FILTRO, vertical: "Saúde" })).toBe(false);
    expect(matchEvent(ev(), { ...FILTRO, periodo: "2026-Q2" })).toBe(false);
    expect(matchEvent(ev(), { ...FILTRO, periodo: "2026-Q1" })).toBe(true);
    expect(matchEvent(ev(), { ...FILTRO, q: "aguas recife" })).toBe(true);
    expect(matchEvent(ev(), { ...FILTRO, q: "inexistente" })).toBe(false);
  });

  it("demonstrativo: resultado = receita − custo, em três colunas", () => {
    expect(demonstrativo([100, 80, 60], [30, 50, 70])).toEqual({
      receita: [100, 80, 60], custo: [30, 50, 70], resultado: [70, 30, -10],
    });
  });
});
