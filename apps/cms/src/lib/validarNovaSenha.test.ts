import { describe, expect, it } from "vitest";

import { validarNovaSenha } from "./validarNovaSenha";

describe("validarNovaSenha", () => {
  it("rejeita senha curta", () => {
    expect(validarNovaSenha("curta123", "curta123")).toContain("12 caracteres");
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
