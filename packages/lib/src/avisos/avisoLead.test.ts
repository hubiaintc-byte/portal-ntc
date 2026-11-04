import { describe, expect, it } from "vitest";
import { deveAvisarLead, montarAvisoLead } from "./avisoLead";

describe("deveAvisarLead", () => {
  it("avisa na criação vinda do site", () => expect(deveAvisarLead({ operation: "create", origemEntrada: "site" })).toBe(true));
  it("não avisa lead manual", () => expect(deveAvisarLead({ operation: "create", origemEntrada: "manual" })).toBe(false));
  it("não avisa update", () => expect(deveAvisarLead({ operation: "update", origemEntrada: "site" })).toBe(false));
  it("não avisa sem origem", () => expect(deveAvisarLead({ operation: "create", origemEntrada: null })).toBe(false));
});

describe("montarAvisoLead", () => {
  it("proposta vai para o lead no CRM", () =>
    expect(montarAvisoLead({ id: 42, tipo: "proposta" })).toEqual({
      title: "Novo lead · Proposta", body: "Chegou pelo site. Toque para abrir o painel.",
      url: "/crm?lead=42", tag: "lead-proposta",
    }));
  it("newsletter vai para a raiz", () => expect(montarAvisoLead({ id: 7, tipo: "newsletter" }).url).toBe("/"));
  it("tipo desconhecido vira 'Novo lead' e raiz", () =>
    expect(montarAvisoLead({ id: 1, tipo: "xyz" })).toMatchObject({ title: "Novo lead", url: "/", tag: "lead" }));
  it("tipo herdado do protótipo não vaza", () =>
    expect(montarAvisoLead({ id: 1, tipo: "constructor" })).toMatchObject({ title: "Novo lead", tag: "lead" }));
  it("só tem as quatro chaves (sem dado pessoal)", () =>
    expect(Object.keys(montarAvisoLead({ id: 1, tipo: "contato" })).sort()).toEqual(["body", "tag", "title", "url"]));
});
