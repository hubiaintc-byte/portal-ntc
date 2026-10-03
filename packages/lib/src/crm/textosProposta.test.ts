import { describe, expect, it } from "vitest";

import { textosPadraoProposta, type ContextoTextosProposta } from "./textosProposta";

const CTX: ContextoTextosProposta = {
  clienteOrgao: "Secretaria Municipal de Educação de Palmas",
  clienteSigla: "SEMED-Palmas", programaSigla: "EDUTEC",
  modalidade: "Online ao vivo · EventON NTC", replay: "180 dias", numModulos: 3,
};

describe("textosPadraoProposta", () => {
  it("devolve as 7 chaves, todas preenchidas", () => {
    const t = textosPadraoProposta(CTX);
    const chaves = ["eventon", "certificacaoReplay", "cancelamento", "protecaoConteudo", "fundamentacaoLegal", "proximosPassos", "fechamento"] as const;
    expect(Object.keys(t).sort()).toEqual([...chaves].sort());
    for (const c of chaves) expect(t[c].length).toBeGreaterThan(80);
  });

  it("interpola órgão e sigla do cliente", () => {
    const t = textosPadraoProposta(CTX);
    expect(t.fechamento).toContain("Secretaria Municipal de Educação de Palmas");
    expect(t.proximosPassos).toContain("SEMED-Palmas");
  });

  it("interpola o replay", () => {
    expect(textosPadraoProposta(CTX).certificacaoReplay).toContain("180 dias");
  });

  it("não deixa marcador sem substituir", () => {
    for (const texto of Object.values(textosPadraoProposta(CTX))) {
      expect(texto).not.toMatch(/\{\{|\}\}|\$\{/);
    }
  });

  it("separa parágrafos por linha em branco", () => {
    expect(textosPadraoProposta(CTX).eventon).toContain("\n\n");
  });
});
