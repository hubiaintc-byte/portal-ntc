import { describe, expect, it } from "vitest";

import { subtituloProposta } from "./capa";

describe("subtituloProposta", () => {
  it("trilha completa", () =>
    expect(subtituloProposta("programa-completo", 8, "EDUTEC")).toBe("Trilha Completa · EDUTEC"));
  it("combo por extenso", () =>
    expect(subtituloProposta("modulo-avulso", 3, "EDUTEC")).toBe(
      "Combo de Três Módulos · EDUTEC",
    ));
  it("módulo único", () =>
    expect(subtituloProposta("modulo-avulso", 1, "EDUTEC")).toBe("Módulo Avulso · EDUTEC"));
  it("sem módulos, só o programa", () =>
    expect(subtituloProposta("customizada", 0, "EDUTEC")).toBe("EDUTEC"));
  it("acima de dez volta ao algarismo", () =>
    expect(subtituloProposta("modulo-avulso", 12, "EDUTEC")).toBe(
      "Combo de 12 Módulos · EDUTEC",
    ));
  it("sem sigla, não sobra separador", () =>
    expect(subtituloProposta("modulo-avulso", 2, "")).toBe("Combo de Dois Módulos"));
});
