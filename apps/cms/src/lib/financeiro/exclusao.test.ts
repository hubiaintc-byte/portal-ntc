import { describe, expect, it, vi } from "vitest";

import { bloquearEventoComFinanceiro } from "./exclusao";

const MENSAGEM = "Este evento tem lançamentos no Financeiro e não pode ser apagado.";

function fakeReq(d: {
  finEventos: Array<{ id: number }>;
  receitas: number;
  custos: number;
  falhar?: boolean;
}) {
  const find = vi.fn(async () => {
    if (d.falhar) throw new Error("conexão perdida");
    return { docs: d.finEventos, totalDocs: d.finEventos.length };
  });
  const count = vi.fn(async ({ collection }: { collection: string }) => ({
    totalDocs: collection === "fin-receitas" ? d.receitas : d.custos,
  }));
  return { payload: { find, count } };
}

const hook = bloquearEventoComFinanceiro as unknown as (
  args: Record<string, unknown>,
) => Promise<void>;

describe("bloquearEventoComFinanceiro", () => {
  it("evento com fin-eventos e receita: lança com a mensagem (400)", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }], receitas: 1, custos: 0 });
    await expect(hook({ id: 4, req: { payload } })).rejects.toMatchObject({
      message: MENSAGEM,
      status: 400,
    });
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "fin-eventos",
        where: { eventoComercial: { equals: 4 } },
      }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "fin-receitas", where: { evento: { in: [9] } } }),
    );
  });

  it("evento com fin-eventos e só custo: lança", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }], receitas: 0, custos: 2 });
    await expect(hook({ id: 4, req: { payload } })).rejects.toThrow(MENSAGEM);
  });

  it("sem fin-eventos: passa", async () => {
    const { payload } = fakeReq({ finEventos: [], receitas: 0, custos: 0 });
    await expect(hook({ id: 4, req: { payload } })).resolves.toBeUndefined();
    expect(payload.count).not.toHaveBeenCalled();
  });

  it("com fin-eventos mas sem lançamentos: passa", async () => {
    const { payload } = fakeReq({ finEventos: [{ id: 9 }], receitas: 0, custos: 0 });
    await expect(hook({ id: 4, req: { payload } })).resolves.toBeUndefined();
  });

  it("consulta que falha: lança (falha fechado)", async () => {
    const { payload } = fakeReq({ finEventos: [], receitas: 0, custos: 0, falhar: true });
    await expect(hook({ id: 4, req: { payload } })).rejects.toThrow("conexão perdida");
  });
});
