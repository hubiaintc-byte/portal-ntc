import { beforeEach, describe, expect, it, vi } from "vitest";

const afterMock = vi.fn();
vi.mock("next/server", () => ({ after: afterMock }));
const enviarMock = vi.fn();
vi.mock("./enviarAviso", () => ({ enviarAvisoATodos: enviarMock }));

const { avisarLeadNovo } = await import("./avisarLeadNovo");

const doc = { id: 1, origemEntrada: "site", tipo: "proposta", nome: "Ana" };
const req = { payload: {} };
const chamar = (operation: string) =>
  (avisarLeadNovo as unknown as (a: unknown) => unknown)({ doc, operation, req });

beforeEach(() => {
  vi.clearAllMocks();
  enviarMock.mockResolvedValue(undefined);
});

describe("avisarLeadNovo", () => {
  it("com after disponível: agenda uma vez e devolve o doc sem esperar o envio", () => {
    expect(chamar("create")).toBe(doc);
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(enviarMock).not.toHaveBeenCalled();
  });

  it("quando after lança: avisa no log, dispara solto e não rejeita", () => {
    afterMock.mockImplementation(() => {
      throw new Error("fora de request");
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(chamar("create")).toBe(doc);
    expect(warn).toHaveBeenCalledWith("[avisoLead] after indisponível, disparo solto");
    expect(enviarMock).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("em update não avisa", () => {
    expect(chamar("update")).toBe(doc);
    expect(afterMock).not.toHaveBeenCalled();
    expect(enviarMock).not.toHaveBeenCalled();
  });
});
