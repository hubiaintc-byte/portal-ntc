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

  // As duas regras abaixo divergem do modelo DE PROPÓSITO, e a divergência tem
  // de sobreviver a uma futura passada de "fidelidade ao modelo":
  // o Chromium não implementa `@page :first`, então as margens de 22mm (topo) e
  // 20mm (base) que o gerador aplica valem para TODAS as páginas, inclusive a
  // capa. No modelo é o `@page` que dá a altura cheia e o recuo horizontal.
  it("desconta do altura da capa a margem que o PDF aplica em todas as páginas", () => {
    // Capa com 297mm cheios transborda 42mm para uma segunda página quase em
    // branco — bug corrigido na Fase B2 e que a Task 10 reencontrou.
    expect(cssBaseProposta()).toContain("calc(297mm - 42mm)");
    expect(cssBaseProposta()).not.toContain("height:297mm;padding:22mm");
  });

  it("recua o corpo do documento, já que a margem left/right do PDF é zero", () => {
    // left/right = 0 existe para a capa sangrar de borda a borda; sem este
    // padding o texto das seções encostaria na borda do papel.
    expect(cssBaseProposta()).toContain(".body-wrap{padding:0 18mm}");
  });
});
