import { describe, expect, it } from "vitest";

import { validarCompetencia, validarData } from "./campos";

describe("validarData", () => {
  it("aceita data civil válida, inclusive 29/02 em ano bissexto, e vazio", () => {
    for (const v of ["2026-01-31", "2028-02-29", "2026-12-01", "", null, undefined])
      expect(validarData(v)).toBe(true);
  });

  it("recusa data impossível ou fora do formato", () => {
    for (const v of [
      "2026-02-31",
      "2026-13-45",
      "2027-02-29",
      "2026-00-10",
      "2026-04-31",
      "2026-1-01",
      "01/02/2026",
      20260101,
    ]) {
      expect(validarData(v)).toBe("Data no formato AAAA-MM-DD.");
    }
  });
});

describe("validarCompetencia", () => {
  it("aceita AAAA-MM e recusa mês inválido", () => {
    expect(validarCompetencia("2026-11")).toBe(true);
    expect(validarCompetencia("2026-13")).not.toBe(true);
  });
});
