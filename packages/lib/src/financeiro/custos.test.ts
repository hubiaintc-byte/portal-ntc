import { describe, expect, it } from "vitest";
import { custoFin, pagamentoFin } from "./custos";
import type { CustoFin, LivroFinanceiro, PagamentoFin } from "./tipos";

const custo = (p: Partial<CustoFin> = {}): CustoFin => ({ id: "C1", qtde: 2, valorUnitPrev: 500, valorRealizado: 0, ...p }) as CustoFin;
const livro = (pagamentos: PagamentoFin[] = []): LivroFinanceiro => ({ eventos: [], receitas: [], faturamentos: [], custos: [], pagamentos, contas: [] });

describe("custos e títulos", () => {
  it("desvio só com realizado > 0", () => {
    expect(custoFin(custo(), livro()).desvio).toBe(0);
    const m = custoFin(custo({ valorRealizado: 1500 }), livro());
    expect(m.desvio).toBe(500);
    expect(m.acima).toBe(true);
  });
  it("status do custo", () => {
    const pg = (valorPago: number) => ({ id: "P", custoId: "C1", valor: 1000, valorPago }) as PagamentoFin;
    expect(custoFin(custo(), livro()).status).toBe("Previsto");
    expect(custoFin(custo({ valorRealizado: 1000 }), livro()).status).toBe("Realizado");
    expect(custoFin(custo({ valorRealizado: 1000 }), livro([pg(1)])).status).toBe("Pago parcialmente");
    expect(custoFin(custo({ valorRealizado: 1000 }), livro([pg(1000)])).status).toBe("Pago");
  });
  it("título vencido só com saldo e vencimento anterior a hoje", () => {
    const p = { id: "P", valor: 100, valorPago: 0, vencimento: "2026-07-14" } as PagamentoFin;
    expect(pagamentoFin(p, "2026-07-15").vencido).toBe(true);
    expect(pagamentoFin({ ...p, valorPago: 100 }, "2026-07-15").vencido).toBe(false);
    expect(pagamentoFin({ ...p, vencimento: "" }, "2026-07-15").vencido).toBe(false);
  });
});
