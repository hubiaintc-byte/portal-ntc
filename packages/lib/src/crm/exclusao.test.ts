import { describe, expect, it } from "vitest";
import { exigeConfirmacaoDupla, podeApagarCliente, tituloLeadApagado } from "./exclusao";

describe("podeApagarCliente", () => {
  it("só sem dependentes", () => {
    expect(podeApagarCliente({ numLeads: 0, numEventos: 0 })).toEqual({ ok: true });
    expect(podeApagarCliente({ numLeads: 2, numEventos: 1 })).toEqual({ ok: false, motivo: "Tem 2 negócios e 1 evento — apague ou revincule antes." });
    expect(podeApagarCliente({ numLeads: 1, numEventos: 0 })).toEqual({ ok: false, motivo: "Tem 1 negócio e 0 eventos — apague ou revincule antes." });
  });
});

describe("exigeConfirmacaoDupla", () => {
  it("qualquer dependente exige", () => {
    expect(exigeConfirmacaoDupla({ numEventos: 0, numPropostas: 0, numEnvios: 0 })).toBe(false);
    expect(exigeConfirmacaoDupla({ numEventos: 1, numPropostas: 0, numEnvios: 0 })).toBe(true);
    expect(exigeConfirmacaoDupla({ numEventos: 0, numPropostas: 0, numEnvios: 3 })).toBe(true);
  });
});

describe("tituloLeadApagado", () => {
  it("monta o título com órgão e estágio legíveis", () => {
    expect(tituloLeadApagado({ nome: "Ana", instituicao: "SME", estagio: "em-contato" })).toBe("Lead apagado · Ana (SME, estava em Em contato)");
    expect(tituloLeadApagado({ nome: "Ana", instituicao: null, estagio: "lead" })).toBe("Lead apagado · Ana (estava em Lead)");
  });
});
