import { describe, expect, it } from "vitest";

import { cssBaseProposta, cssVariaveisProposta, PALETA_PROPOSTA } from "./tokens";

describe("PALETA_PROPOSTA", () => {
  it("usa as cores do modelo", () => {
    expect(PALETA_PROPOSTA.navy).toBe("#0E2A47");
    expect(PALETA_PROPOSTA.gold).toBe("#B68B40");
    expect(PALETA_PROPOSTA.offwhite).toBe("#F5EDD8");
  });

  it("não contém nenhum hex da paleta Soberana", () => {
    const hexes = Object.values(PALETA_PROPOSTA).map((h) => h.toUpperCase());
    expect(hexes).not.toContain("#11365E");
    expect(hexes).not.toContain("#B5995A");
    expect(hexes).not.toContain("#F4EFE6");
  });
});

describe("cssVariaveisProposta", () => {
  it("declara todas as variáveis em :root", () => {
    const css = cssVariaveisProposta();
    for (const valor of Object.values(PALETA_PROPOSTA)) expect(css).toContain(valor);
    expect(css).toContain(":root");
  });
});

describe("cssBaseProposta", () => {
  it("não traz fonte externa", () => expect(cssBaseProposta()).not.toContain("fonts.googleapis"));
  it("não usa margin boxes, que o Chromium ignora", () => {
    const css = cssBaseProposta();
    expect(css).not.toContain("@top-left");
    expect(css).not.toContain("@bottom-right");
  });
});
