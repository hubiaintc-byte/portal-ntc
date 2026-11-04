import { describe, expect, it } from "vitest";

import { leadInicialDaUrl } from "./leadInicial";

describe("leadInicialDaUrl", () => {
  it("devolve o id quando é um inteiro positivo", () => {
    expect(leadInicialDaUrl("42")).toBe("42");
  });

  it("recusa array", () => {
    expect(leadInicialDaUrl(["42", "43"])).toBeUndefined();
  });

  it("recusa vazio", () => {
    expect(leadInicialDaUrl("")).toBeUndefined();
  });

  it("recusa texto", () => {
    expect(leadInicialDaUrl("abc")).toBeUndefined();
  });

  it("recusa zero", () => {
    expect(leadInicialDaUrl("0")).toBeUndefined();
  });
});
