import { beforeEach, describe, expect, it, vi } from "vitest";

const count = vi.fn();
const find = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ count, find }),
}));

import { contarLeadsCms } from "./painelCms";

/**
 * O painel do Site é aberto a todos os perfis. Ele mostrava as contagens de
 * leads carregando os próprios leads (nome, e-mail, instituição) e mandando
 * tudo ao navegador, inclusive de editores sem acesso ao CRM.
 */
describe("contarLeadsCms", () => {
  beforeEach(() => {
    count.mockReset();
    find.mockReset();
  });

  it("conta no banco: total e últimos 30 dias, sem ler documentos", async () => {
    count.mockResolvedValueOnce({ totalDocs: 19 }).mockResolvedValueOnce({ totalDocs: 2 });

    const r = await contarLeadsCms(new Date("2026-10-19T12:00:00.000Z"));

    expect(r).toEqual({ total: 19, ultimos30Dias: 2 });
    expect(count).toHaveBeenCalledWith({ collection: "leads" });
    expect(count).toHaveBeenCalledWith({
      collection: "leads",
      where: { createdAt: { greater_than_equal: "2026-09-19T12:00:00.000Z" } },
    });
    expect(find).not.toHaveBeenCalled();
  });

  it("devolve só números — nada de nome, e-mail ou instituição", async () => {
    count.mockResolvedValue({ totalDocs: 3 });
    const r = await contarLeadsCms();
    expect(Object.keys(r).sort()).toEqual(["total", "ultimos30Dias"]);
  });
});
