import { describe, expect, it } from "vitest";

import { validarCentavos, validarCentavosComSinal, validarCompetencia, validarData } from "./campos";
import { FinContas } from "./FinContas";

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

describe("saldo inicial da conta (aceita negativo, como o validarConta do protótipo)", () => {
  it("validarCentavosComSinal aceita inteiro negativo e recusa fração", () => {
    expect(validarCentavosComSinal(-500)).toBe(true);
    expect(validarCentavosComSinal(0)).toBe(true);
    expect(validarCentavosComSinal(null)).toBe(true);
    expect(validarCentavosComSinal(1.5)).toBe("Valor em centavos inteiros.");
    expect(validarCentavosComSinal("10")).toBe("Valor em centavos inteiros.");
  });
  it("fin-contas.saldoInicial usa o validador com sinal; os demais centavos seguem não negativos", () => {
    const campo = FinContas.fields.find((f) => "name" in f && f.name === "saldoInicial") as { validate?: unknown };
    expect(campo.validate).toBe(validarCentavosComSinal);
    expect(validarCentavos(-500)).not.toBe(true);
  });
});
