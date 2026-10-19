import { beforeEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { criarStoreRateLimit } = await import("./storeRateLimit");

const ROTA = "/entrar/recuperar";
const IP = "1.2.3.4";

describe("criarStoreRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("contarDesde conta (sem trazer as linhas) por rota, ip e createdAt", async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 3 });
    obterPayloadMock.mockResolvedValue({ count });

    const total = await criarStoreRateLimit().contarDesde(
      ROTA,
      IP,
      new Date("2026-09-07T11:45:00.000Z"),
    );

    expect(total).toBe(3);
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tentativas-acesso",
        where: {
          and: [
            { rota: { equals: ROTA } },
            { ip: { equals: IP } },
            { createdAt: { greater_than: "2026-09-07T11:45:00.000Z" } },
          ],
        },
      }),
    );
  });

  it("limparTudoAntesDe apaga tentativas antigas de qualquer rota e IP", async () => {
    const del = vi.fn().mockResolvedValue({ docs: [] });
    obterPayloadMock.mockResolvedValue({ delete: del });

    await criarStoreRateLimit().limparTudoAntesDe?.(new Date("2026-10-18T12:00:00.000Z"));

    expect(del).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tentativas-acesso",
        where: { createdAt: { less_than: "2026-10-18T12:00:00.000Z" } },
      }),
    );
  });

  it("registrar cria uma linha com rota e ip", async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 });
    obterPayloadMock.mockResolvedValue({ create });

    await criarStoreRateLimit().registrar(ROTA, IP);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tentativas-acesso",
        data: { rota: ROTA, ip: IP },
      }),
    );
  });

  it("limparAntesDe apaga só o que saiu da janela daquele par (rota, ip)", async () => {
    const excluir = vi.fn().mockResolvedValue({ docs: [], errors: [] });
    obterPayloadMock.mockResolvedValue({ delete: excluir });

    await criarStoreRateLimit().limparAntesDe(ROTA, IP, new Date("2026-09-07T11:45:00.000Z"));

    expect(excluir).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "tentativas-acesso",
        where: {
          and: [
            { rota: { equals: ROTA } },
            { ip: { equals: IP } },
            { createdAt: { less_than: "2026-09-07T11:45:00.000Z" } },
          ],
        },
      }),
    );
  });
});
