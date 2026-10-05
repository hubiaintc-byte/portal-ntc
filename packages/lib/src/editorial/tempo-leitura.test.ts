import { describe, expect, it } from "vitest";

import { calcularTempoLeituraMin } from "./tempo-leitura";

describe("calcularTempoLeituraMin", () => {
  it("devolve 1 para texto curto — nunca zero", () => {
    expect(calcularTempoLeituraMin("Três palavras aqui.")).toBe(1);
    expect(calcularTempoLeituraMin("")).toBe(1);
  });

  it("conta ~200 palavras por minuto, arredondando para cima", () => {
    expect(calcularTempoLeituraMin("palavra ".repeat(200))).toBe(1);
    expect(calcularTempoLeituraMin("palavra ".repeat(201))).toBe(2);
    expect(calcularTempoLeituraMin("palavra ".repeat(1000))).toBe(5);
  });

  it("ignora espaços e quebras repetidas na contagem", () => {
    expect(calcularTempoLeituraMin("uma    duas\n\n\ntrês")).toBe(1);
  });
});
