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

  it("contarDesde filtra por rota, ip e createdAt e devolve totalDocs", async () => {
    const find = vi.fn().mockResolvedValue({ totalDocs: 3 });
    obterPayloadMock.mockResolvedValue({ find });

    const total = await criarStoreRateLimit().contarDesde(
      ROTA,
      IP,
      new Date("2026-09-07T11:45:00.000Z"),
    );

    expect(total).toBe(3);
    expect(find).toHaveBeenCalledWith(
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
