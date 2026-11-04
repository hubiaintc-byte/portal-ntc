import { afterEach, describe, expect, it, vi } from "vitest";

// navegador.ts chama a Server Action de desativar; aqui só o helper puro importa.
vi.mock("@/app/(painel)/acoesAuth", () => ({ desativarAvisosCms: vi.fn() }));

import { base64UrlParaUint8Array, cancelarInscricaoLocal } from "./navegador";

describe("base64UrlParaUint8Array", () => {
  it("decodifica base64url sem preenchimento", () => {
    expect(Array.from(base64UrlParaUint8Array("AQID"))).toEqual([1, 2, 3]);
  });

  it("aceita os caracteres - e _ do base64url", () => {
    expect(Array.from(base64UrlParaUint8Array("-_8"))).toEqual([251, 255]);
  });
});

describe("cancelarInscricaoLocal", () => {
  afterEach(() => vi.unstubAllGlobals());

  function comInscricao(unsubscribe: () => Promise<boolean>) {
    const inscricao = { endpoint: "https://push.exemplo/a", unsubscribe: vi.fn(unsubscribe) };
    vi.stubGlobal("window", { PushManager: {}, Notification: {} });
    vi.stubGlobal("navigator", {
      serviceWorker: {
        getRegistration: async () => ({ pushManager: { getSubscription: async () => inscricao } }),
      },
    });
    return inscricao;
  }

  it("cancela a inscrição e devolve o endpoint", async () => {
    const inscricao = comInscricao(async () => true);
    expect(await cancelarInscricaoLocal(1000)).toBe("https://push.exemplo/a");
    expect(inscricao.unsubscribe).toHaveBeenCalled();
  });

  it("não espera além do limite, mas devolve o endpoint", async () => {
    comInscricao(() => new Promise<boolean>(() => {}));
    expect(await cancelarInscricaoLocal(10)).toBe("https://push.exemplo/a");
  });

  it("erro no cancelamento é engolido", async () => {
    comInscricao(async () => {
      throw new Error("falhou");
    });
    expect(await cancelarInscricaoLocal(1000)).toBe("https://push.exemplo/a");
  });

  it("sem suporte a push devolve null", async () => {
    expect(await cancelarInscricaoLocal(10)).toBeNull();
  });
});
