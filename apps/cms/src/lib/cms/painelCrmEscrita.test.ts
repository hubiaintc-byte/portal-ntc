import { describe, expect, it } from "vitest";

import { gerarCodigoOportunidade, numeroOuNulo } from "./painelCrmEscrita";

describe("gerarCodigoOportunidade", () => {
  it("monta OPO-<ano>-<seq> com 3 dígitos", () => {
    expect(gerarCodigoOportunidade(2026, 1)).toBe("OPO-2026-001");
    expect(gerarCodigoOportunidade(2026, 42)).toBe("OPO-2026-042");
  });
});

describe("numeroOuNulo", () => {
  it("converte string de formulário em número ou null", () => {
    expect(numeroOuNulo("140000")).toBe(140000);
    expect(numeroOuNulo("75,5")).toBe(75.5);
    expect(numeroOuNulo("")).toBeNull();
    expect(numeroOuNulo("abc")).toBeNull();
  });
});
