import { describe, expect, it, vi } from "vitest";

// navegador.ts chama a Server Action de desativar; aqui só o helper puro importa.
vi.mock("@/app/(painel)/acoesAuth", () => ({ desativarAvisosCms: vi.fn() }));

import { base64UrlParaUint8Array } from "./navegador";

describe("base64UrlParaUint8Array", () => {
  it("decodifica base64url sem preenchimento", () => {
    expect(Array.from(base64UrlParaUint8Array("AQID"))).toEqual([1, 2, 3]);
  });

  it("aceita os caracteres - e _ do base64url", () => {
    expect(Array.from(base64UrlParaUint8Array("-_8"))).toEqual([251, 255]);
  });
});
