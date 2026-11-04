import { beforeEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { salvarInscricao, removerInscricao, removerInscricoesDoUsuario } = await import("./inscricoesAviso");

const valida = { endpoint: "https://push.exemplo/abc", p256dh: "k", auth: "a", aparelho: "iPhone" };

function mockPayload(docs: { id: number }[] = []) {
  return {
    find: vi.fn().mockResolvedValue({ docs }),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  };
}

beforeEach(() => vi.clearAllMocks());

describe("salvarInscricao", () => {
  it("cria quando o endpoint é novo", async () => {
    const p = mockPayload();
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarInscricao("1", valida)).toEqual({ ok: true });
    expect(p.create).toHaveBeenCalledTimes(1);
    expect(p.update).not.toHaveBeenCalled();
  });

  it("mesmo endpoint por dois usuários resulta num update para o segundo", async () => {
    const p = mockPayload([{ id: 7 }]);
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarInscricao("2", valida)).toEqual({ ok: true });
    expect(p.create).not.toHaveBeenCalled();
    expect(p.update).toHaveBeenCalledTimes(1);
    expect(p.update.mock.calls[0]?.[0]).toMatchObject({
      collection: "inscricoes-aviso",
      id: 7,
      data: { usuario: 2, endpoint: valida.endpoint, p256dh: "k", auth: "a" },
    });
  });

  it("recusa endpoint http:// e campos vazios", async () => {
    const p = mockPayload();
    obterPayloadMock.mockResolvedValue(p);
    const msg = "Não foi possível ativar os avisos neste aparelho.";
    expect(await salvarInscricao("1", { ...valida, endpoint: "http://x/y" })).toEqual({ ok: false, erro: msg });
    expect(await salvarInscricao("1", { ...valida, p256dh: "" })).toEqual({ ok: false, erro: msg });
    expect(await salvarInscricao("1", { ...valida, auth: " " })).toEqual({ ok: false, erro: msg });
    expect(p.find).not.toHaveBeenCalled();
  });
});

describe("removerInscricao", () => {
  it("filtra pelo dono, para não apagar inscrição de outro usuário", async () => {
    const p = mockPayload();
    obterPayloadMock.mockResolvedValue(p);
    expect(await removerInscricao("1", valida.endpoint)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith({
      collection: "inscricoes-aviso",
      where: { and: [{ endpoint: { equals: valida.endpoint } }, { usuario: { equals: "1" } }] },
      overrideAccess: true,
    });
  });
});

describe("removerInscricoesDoUsuario", () => {
  it("apaga todas as inscrições do usuário", async () => {
    const p = mockPayload();
    await removerInscricoesDoUsuario(p, "5");
    expect(p.delete).toHaveBeenCalledWith({
      collection: "inscricoes-aviso",
      where: { usuario: { equals: "5" } },
      overrideAccess: true,
    });
  });
});
