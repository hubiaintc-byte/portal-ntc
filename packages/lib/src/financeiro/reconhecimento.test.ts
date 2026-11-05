import { describe, expect, it } from "vitest";
import { custoCompetencia, receitaReconhecida, reconhecimentoReceita } from "./reconhecimento";
import type { EventoFin, LivroFinanceiro, ReceitaFin } from "./tipos";

const evento = (o: Partial<EventoFin> = {}): EventoFin =>
  ({ id: "EV-1", dataInicio: "2026-03-10", dataFim: "2026-03-11", status: "Planejado", ...o }) as EventoFin;
const receita = (o: Partial<ReceitaFin> = {}): ReceitaFin =>
  ({ id: "RC-1", eventoId: "EV-1", qtde: 1, valorUnit: 100000, desconto: 0, statusEconomico: "Contratada", criterioReconhecimento: "", etapas: [], competencia: "2026-05-01", ...o }) as ReceitaFin;
const livro = (e: EventoFin): LivroFinanceiro => ({ eventos: [e], receitas: [], faturamentos: [], custos: [], pagamentos: [], contas: [] });

describe("reconhecimento", () => {
  it("Integral no encerramento só reconhece com status Encerrado", () => {
    const r = receita({ criterioReconhecimento: "Integral no encerramento" });
    expect(reconhecimentoReceita(r, livro(evento({ status: "Realizado" })), "2026-07-15")).toEqual([]);
    const ok = reconhecimentoReceita(r, livro(evento({ status: "Encerrado" })), "2026-07-15");
    expect(ok).toHaveLength(1);
    expect(ok[0]).toMatchObject({ mes: "2026-03", valor: 100000, provisorio: false });
  });

  it("execução declarada depende de hoje", () => {
    const l = livro(evento());
    expect(reconhecimentoReceita(receita(), l, "2026-03-10")).toEqual([]);
    expect(receitaReconhecida(receita(), l, "2026-03-11")).toBe(100000);
  });

  it("receita prevista não reconhece; corporativa usa a competência", () => {
    expect(reconhecimentoReceita(receita({ statusEconomico: "Prevista" }), livro(evento()), "2026-07-15")).toEqual([]);
    const c = reconhecimentoReceita(receita({ eventoId: "" }), livro(evento()), "2026-07-15");
    expect(c[0]).toMatchObject({ mes: "2026-05", valor: 100000, rotulo: "Competência declarada" });
  });

  it("etapas concluídas; percentual arredonda em centavos", () => {
    const r = receita({
      etapas: [
        { nome: "M1", base: "percentual", valor: 0, percentual: 33.33, concluida: true, dataConclusao: "2026-04-02" },
        { nome: "M2", base: "valor", valor: 5000, percentual: 0, concluida: false, dataConclusao: "" },
      ],
    });
    expect(reconhecimentoReceita(r, livro(evento()), "2026-07-15")).toEqual([
      { mes: "2026-04", valor: 33330, rotulo: "M1", criterio: "Etapa/módulo concluído", provisorio: false },
    ]);
  });

  it("custoCompetencia usa competência, senão data prevista", () => {
    expect(custoCompetencia({ competencia: "2026-06-30", dataPrevista: "2026-08-01" })).toBe("2026-06");
    expect(custoCompetencia({ competencia: "", dataPrevista: "2026-08-01" })).toBe("2026-08");
  });
});
