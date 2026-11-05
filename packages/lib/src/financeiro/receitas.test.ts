import { describe, expect, it } from "vitest";
import { faturamentoFin, receitaFin, valorReceita } from "./receitas";
import type { FaturamentoFin, LivroFinanceiro, ReceitaFin } from "./tipos";

const receita = (p: Partial<ReceitaFin> = {}): ReceitaFin => ({ id: "R1", qtde: 1, valorUnit: 1000, desconto: 0, statusEconomico: "Contratada", ...p }) as ReceitaFin;
const fat = (p: Partial<FaturamentoFin> = {}): FaturamentoFin =>
  ({ id: "F1", receitaId: "R1", valorFaturado: 1000, retencaoTributaria: 0, retencaoContratual: 0, retencaoContratualLiberada: 0, valorRecebido: 0, quitado: false, vencimento: "2026-07-14", ...p }) as FaturamentoFin;
const livro = (faturamentos: FaturamentoFin[]): LivroFinanceiro => ({ eventos: [], receitas: [], faturamentos, custos: [], pagamentos: [], contas: [] });

describe("receitas", () => {
  it("parcela parcialmente recebida nunca é vencida", () => {
    const m = faturamentoFin(fat({ valorRecebido: 1 }), "2026-07-15");
    expect(m.exigivel).toBeGreaterThan(0);
    expect(m.vencido).toBe(false);
  });
  it("parcela sem recebimento e vencida ontem é vencida", () => {
    expect(faturamentoFin(fat(), "2026-07-15").vencido).toBe(true);
    expect(faturamentoFin(fat({ vencimento: "2026-07-15" }), "2026-07-15").vencido).toBe(false);
  });
  it("status de receita Prevista quando statusEconomico é Prevista", () => {
    const r = receita({ statusEconomico: "Prevista" });
    const m = receitaFin(r, livro([fat()]));
    expect(m.status).toBe("Prevista");
    expect(m.contratado).toBe(0);
    expect(m.aFaturar).toBe(0);
  });
  it("valor da receita nunca é negativo", () => {
    expect(valorReceita(receita({ desconto: 5000 }))).toBe(0);
  });
});
