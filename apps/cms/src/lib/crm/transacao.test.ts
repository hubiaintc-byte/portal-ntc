import { afterEach, describe, expect, it, vi } from "vitest";

const createLocalReqMock = vi.fn(async () => ({ id: "req1" }));
const initTransactionMock = vi.fn(async () => true);
const commitTransactionMock = vi.fn(async () => undefined);
const killTransactionMock = vi.fn(async () => undefined);

vi.mock("payload", () => ({
  createLocalReq: createLocalReqMock,
  initTransaction: initTransactionMock,
  commitTransaction: commitTransactionMock,
  killTransaction: killTransactionMock,
}));

const { executarEmTransacao } = await import("./transacao");

const usuario = { id: 5, collection: "users" } as never;
const payload = {} as never;

afterEach(() => {
  vi.clearAllMocks();
  createLocalReqMock.mockResolvedValue({ id: "req1" });
  initTransactionMock.mockResolvedValue(true);
  commitTransactionMock.mockResolvedValue(undefined);
  killTransactionMock.mockResolvedValue(undefined);
});

describe("executarEmTransacao", () => {
  it("cria o req com o usuário da sessão, inicia a transação e comita no sucesso", async () => {
    const fn = vi.fn(async (req: unknown) => {
      expect(req).toEqual({ id: "req1" });
      return "resultado";
    });

    const resultado = await executarEmTransacao(payload, usuario, fn);

    expect(resultado).toBe("resultado");
    expect(createLocalReqMock).toHaveBeenCalledWith({ user: usuario }, payload);
    expect(initTransactionMock).toHaveBeenCalledWith({ id: "req1" });
    expect(fn).toHaveBeenCalledWith({ id: "req1" });
    expect(commitTransactionMock).toHaveBeenCalledWith({ id: "req1" });
    expect(killTransactionMock).not.toHaveBeenCalled();
  });

  it("mata a transação e repropaga o erro quando fn falha, sem comitar", async () => {
    const erro = new Error("falhou no meio da escrita");
    const fn = vi.fn(async () => {
      throw erro;
    });

    await expect(executarEmTransacao(payload, usuario, fn)).rejects.toThrow("falhou no meio da escrita");

    expect(killTransactionMock).toHaveBeenCalledWith({ id: "req1" });
    expect(commitTransactionMock).not.toHaveBeenCalled();
  });

  it("chama init antes de fn, e fn antes de commit", async () => {
    const ordem: string[] = [];
    initTransactionMock.mockImplementationOnce(async () => {
      ordem.push("init");
      return true;
    });
    commitTransactionMock.mockImplementationOnce(async () => {
      ordem.push("commit");
    });
    const fn = vi.fn(async () => {
      ordem.push("fn");
      return null;
    });

    await executarEmTransacao(payload, usuario, fn);

    expect(ordem).toEqual(["init", "fn", "commit"]);
  });
});
