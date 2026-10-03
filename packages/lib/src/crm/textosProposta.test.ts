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

  it("1 módulo: concordância no singular, sem 'dos 1 módulos'", () => {
    const t = textosPadraoProposta({ ...CTX, numModulos: 1 });
    expect(t.certificacaoReplay).toContain("carga horária somada do módulo contratado");
    expect(t.certificacaoReplay).not.toMatch(/\bdos 1 módulos?\b/);
  });

  it("0 módulos: a frase não afirma contagem nenhuma", () => {
    const t = textosPadraoProposta({ ...CTX, numModulos: 0 });
    expect(t.certificacaoReplay).toContain("carga horária somada dos módulos contratados");
    expect(t.certificacaoReplay).not.toContain("dos 0 módulos");
  });

  it("vários módulos mantêm a contagem do modelo", () => {
    expect(textosPadraoProposta(CTX).certificacaoReplay).toContain("somada dos 3 módulos contratados");
  });

  it("sem replay, o parágrafo e o subtítulo do replay somem (sem lacuna)", () => {
    const t = textosPadraoProposta({ ...CTX, replay: "" });
    expect(t.certificacaoReplay).not.toContain("Replay Institucional Ampliado");
    expect(t.certificacaoReplay).not.toContain("replay institucional ampliado de");
    expect(t.certificacaoReplay).not.toMatch(/ampliado de\s{2,}/);
    // A Certificação continua inteira.
    expect(t.certificacaoReplay).toContain("## Certificação");
    expect(t.certificacaoReplay.trim().endsWith(".")).toBe(true);
  });

  it("replay só com espaços conta como ausente", () => {
    expect(textosPadraoProposta({ ...CTX, replay: "   " }).certificacaoReplay).not.toContain(
      "Replay Institucional Ampliado",
    );
  });

  it("não deixa marcador sem substituir", () => {
    for (const texto of Object.values(textosPadraoProposta(CTX))) {
      expect(texto).not.toMatch(/\{\{|\}\}|\$\{/);
    }
  });

  it("separa parágrafos por linha em branco", () => {
    expect(textosPadraoProposta(CTX).eventon).toContain("\n\n");
  });

  it("não vaza o cliente do modelo (Palmas/SEMED) para outro cliente", () => {
    const outro: ContextoTextosProposta = {
      ...CTX,
      clienteOrgao: "Secretaria de Estado da Saúde do Tocantins",
      clienteSigla: "SES-TO",
    };
    for (const texto of Object.values(textosPadraoProposta(outro))) {
      expect(texto).not.toMatch(/Palmas|SEMED/);
    }
  });
});
