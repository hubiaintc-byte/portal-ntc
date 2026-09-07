import { describe, expect, it } from "vitest";

import { validarNovaSenha } from "./validarNovaSenha";

describe("validarNovaSenha", () => {
  it("rejeita senha abaixo do mínimo", () => {
    expect(validarNovaSenha("curta12", "curta12")).toContain("8 caracteres");
  });

  it("aceita senha exatamente no mínimo", () => {
    expect(validarNovaSenha("curta123", "curta123")).toBeNull();
  });

  it("rejeita confirmação divergente", () => {
    expect(validarNovaSenha("senha-bem-longa-1", "senha-bem-longa-2")).toBe(
      "As senhas não conferem.",
    );
  });

  it("aceita senha válida", () => {
    expect(validarNovaSenha("senha-bem-longa-1", "senha-bem-longa-1")).toBeNull();
  });
});
