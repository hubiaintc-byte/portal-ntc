import { describe, expect, it } from "vitest";

import { gerarCodigoOportunidade, numeroOuNulo, proximaSequencia } from "./painelCrmEscrita";

describe("gerarCodigoOportunidade", () => {
  it("monta OPO-<ano>-<seq> com 3 dígitos", () => {
    expect(gerarCodigoOportunidade(2026, 1)).toBe("OPO-2026-001");
    expect(gerarCodigoOportunidade(2026, 42)).toBe("OPO-2026-042");
  });
});

describe("proximaSequencia", () => {
  it("retorna 1 quando não há códigos", () => {
    expect(proximaSequencia([], 2026)).toBe(1);
  });

  it("retorna maiorSufixo + 1 com códigos esparsos", () => {
    expect(proximaSequencia(["OPO-2026-001", "OPO-2026-005"], 2026)).toBe(6);
  });

  it("ignora códigos de outro ano e strings malformadas", () => {
    expect(
      proximaSequencia(["OPO-2025-009", "OPO-2026-001", "lixo", "OPO-2026-abc"], 2026),
    ).toBe(2);
  });

  it("soma 1 ao maior sufixo mesmo com um único código", () => {
    expect(proximaSequencia(["OPO-2026-042"], 2026)).toBe(43);
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
