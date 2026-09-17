import { describe, expect, it, vi } from "vitest";

import { bloquearClienteComDependentes } from "./exclusaoCliente";

function fakeReq(d: { leads: number; eventos: number }) {
  const count = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "leads") return { totalDocs: d.leads };
    return { totalDocs: d.eventos };
  });
  return { payload: { count } };
}

describe("bloquearClienteComDependentes", () => {
  it("sem leads nem eventos: resolve (não bloqueia)", async () => {
    const { payload } = fakeReq({ leads: 0, eventos: 0 });
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
  });

  it("com 1 lead e 0 eventos: rejeita com a mensagem de podeApagarCliente", async () => {
    const { payload } = fakeReq({ leads: 1, eventos: 0 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 3, req: { payload } })).rejects.toThrow(
      "Tem 1 negócio e 0 eventos — apague ou revincule antes.",
    );
  });

  it("com leads e eventos: rejeita contando os dois", async () => {
    const { payload } = fakeReq({ leads: 2, eventos: 1 });
    const hook = bloquearClienteComDependentes as unknown as (args: Record<string, unknown>) => Promise<void>;
    await expect(hook({ id: 5, req: { payload } })).rejects.toThrow(
      "Tem 2 negócios e 1 evento — apague ou revincule antes.",
    );
  });
});
