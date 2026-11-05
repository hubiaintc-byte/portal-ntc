import { describe, expect, it, vi } from "vitest";

import {
  bloquearContaEmUso,
  bloquearCustoComPagamento,
  bloquearEventoComFinanceiro,
  bloquearFinEventoComLancamentos,
  bloquearReceitaComFaturamento,
  RecusaFinanceiro,
} from "./exclusao";

type Hook = (args: Record<string, unknown>) => Promise<void>;
const MENSAGEM_CRM = "Este evento tem lançamentos no Financeiro e não pode ser apagado.";

/** Payload simulado: `contagens` por coleção; `falhar` faz toda consulta rejeitar. */
function fakeReq(d: {
  finEventos?: Array<{ id: number }>;
  contagens?: Record<string, number>;
  falhar?: boolean;
}) {
  const find = vi.fn(async () => {
    if (d.falhar) throw new Error("conexão perdida");
    const docs = d.finEventos ?? [];
    return { docs, totalDocs: docs.length };
  });
  const count = vi.fn(async ({ collection, where }: { collection: string; where: unknown }) => {
    if (d.falhar) throw new Error("conexão perdida");
    void where;
    return { totalDocs: d.contagens?.[collection] ?? 0 };
  });
  const del = vi.fn(async () => ({ id: 1 }));
  return { payload: { find, count, delete: del } };
}

describe("bloquearEventoComFinanceiro (beforeDelete de eventos-comerciais)", () => {
  const hook = bloquearEventoComFinanceiro as unknown as Hook;

  it("evento com fin-eventos e receita: lança com a mensagem (400) e não apaga nada", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }], contagens: { "fin-receitas": 1 } });
    const req = { payload };
    await expect(hook({ id: 4, req })).rejects.toMatchObject({
      message: MENSAGEM_CRM,
      status: 400,
    });
    await expect(hook({ id: 4, req })).rejects.toBeInstanceOf(RecusaFinanceiro);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "fin-eventos",
        where: { eventoComercial: { equals: 4 } },
      }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "fin-receitas", where: { evento: { in: [9] } } }),
    );
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("evento com fin-eventos e só custo: lança", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }], contagens: { "fin-custos": 2 } });
    await expect(hook({ id: 4, req: { payload } })).rejects.toThrow(MENSAGEM_CRM);
  });

  it("sem fin-eventos: passa sem contar nem apagar", async () => {
    const { payload } = fakeReq({ finEventos: [] });
    await expect(hook({ id: 4, req: { payload } })).resolves.toBeUndefined();
    expect(payload.count).not.toHaveBeenCalled();
    expect(payload.delete).not.toHaveBeenCalled();
  });

  it("com fin-eventos sem lançamentos: apaga o cadastro financeiro na mesma transação", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }] });
    const req = { payload };
    await expect(hook({ id: 4, req })).resolves.toBeUndefined();
    expect(payload.delete).toHaveBeenCalledTimes(1);
    expect(payload.delete).toHaveBeenCalledWith({ collection: "fin-eventos", id: 9, req });
  });

  it("consulta que falha: lança (falha fechado)", async () => {
    const { payload } = fakeReq({ falhar: true });
    await expect(hook({ id: 4, req: { payload } })).rejects.toThrow("conexão perdida");
  });
});

const guardas: Array<{
  nome: string;
  hook: Hook;
  dependentes: Record<string, number>;
  mensagem: string;
  consultas: Array<{ collection: string; where: unknown }>;
}> = [
  {
    nome: "bloquearReceitaComFaturamento (fin-receitas)",
    hook: bloquearReceitaComFaturamento as unknown as Hook,
    dependentes: { "fin-faturamentos": 2 },
    mensagem:
      "Esta receita possui 2 faturamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.",
    consultas: [{ collection: "fin-faturamentos", where: { receita: { equals: 3 } } }],
  },
  {
    nome: "bloquearCustoComPagamento (fin-custos)",
    hook: bloquearCustoComPagamento as unknown as Hook,
    dependentes: { "fin-pagamentos": 1 },
    mensagem:
      "Este custo possui 1 pagamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.",
    consultas: [{ collection: "fin-pagamentos", where: { custo: { equals: 3 } } }],
  },
  {
    nome: "bloquearContaEmUso (fin-contas)",
    hook: bloquearContaEmUso as unknown as Hook,
    dependentes: { "fin-faturamentos": 1, "fin-pagamentos": 2 },
    mensagem: "Esta conta possui 3 movimentação(ões) vinculada(s). Inative-a em vez de excluí-la.",
    consultas: [
      { collection: "fin-faturamentos", where: { conta: { equals: 3 } } },
      { collection: "fin-pagamentos", where: { conta: { equals: 3 } } },
    ],
  },
  {
    nome: "bloquearFinEventoComLancamentos (fin-eventos)",
    hook: bloquearFinEventoComLancamentos as unknown as Hook,
    dependentes: { "fin-receitas": 1, "fin-custos": 1 },
    mensagem: "Este evento tem lançamentos; exclua-os antes de remover o cadastro financeiro.",
    consultas: [
      { collection: "fin-receitas", where: { evento: { equals: 3 } } },
      { collection: "fin-custos", where: { evento: { equals: 3 } } },
    ],
  },
];

for (const g of guardas) {
  describe(g.nome, () => {
    it("com dependentes: lança com a mensagem do protótipo (400)", async () => {
      const { payload } = fakeReq({ contagens: g.dependentes });
      const req = { payload };
      await expect(g.hook({ id: 3, req })).rejects.toMatchObject({
        message: g.mensagem,
        status: 400,
      });
      await expect(g.hook({ id: 3, req })).rejects.toBeInstanceOf(RecusaFinanceiro);
      for (const c of g.consultas) expect(payload.count).toHaveBeenCalledWith({ ...c, req });
    });

    it("sem dependentes: passa", async () => {
      const { payload } = fakeReq({});
      await expect(g.hook({ id: 3, req: { payload } })).resolves.toBeUndefined();
    });

    it("consulta que falha: lança (falha fechado)", async () => {
      const { payload } = fakeReq({ falhar: true });
      await expect(g.hook({ id: 3, req: { payload } })).rejects.toThrow("conexão perdida");
    });
  });
}
