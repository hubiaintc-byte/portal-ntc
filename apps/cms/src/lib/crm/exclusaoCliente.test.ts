import { describe, expect, it, vi } from "vitest";

import { bloquearClienteComDependentes } from "./exclusaoCliente";

function fakeReq(d: { leads: number; eventos: number; propostas: number }) {
  const count = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "leads") return { totalDocs: d.leads };
    if (collection === "eventos-comerciais") return { totalDocs: d.eventos };
    return { totalDocs: d.propostas };
  });
  return { payload: { count } };
}

describe("bloquearClienteComDependentes", () => {
  it("sem leads, eventos nem propostas: resolve (não bloqueia)", async () => {
    const { payload } = fakeReq({ leads: 0, eventos: 0, propostas: 0 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 3, req: { payload } })).resolves.toBeUndefined();
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "leads",
        where: { and: [{ cliente: { equals: 3 } }, { tipo: { equals: "proposta" } }] },
      }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "eventos-comerciais", where: { cliente: { equals: 3 } } }),
    );
    expect(payload.count).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "propostas", where: { cliente: { equals: 3 } } }),
    );
  });

  it("com 1 lead e 0 eventos/propostas: rejeita com a mensagem de podeApagarCliente", async () => {
    const { payload } = fakeReq({ leads: 1, eventos: 0, propostas: 0 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 3, req: { payload } })).rejects.toThrow(
      "Tem 1 negócio, 0 eventos e 0 propostas — apague ou revincule antes.",
    );
  });

  it("com leads, eventos e propostas: rejeita contando os três", async () => {
    const { payload } = fakeReq({ leads: 2, eventos: 1, propostas: 3 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 5, req: { payload } })).rejects.toThrow(
      "Tem 2 negócios, 1 evento e 3 propostas — apague ou revincule antes.",
    );
  });

  it("só com proposta (lead já apagado, cliente ainda referenciado): rejeita", async () => {
    const { payload } = fakeReq({ leads: 0, eventos: 0, propostas: 1 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 7, req: { payload } })).rejects.toThrow(
      "Tem 0 negócios, 0 eventos e 1 proposta — apague ou revincule antes.",
    );
  });
});
