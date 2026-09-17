import { describe, expect, it } from "vitest";
import { acoesDeEvento, estagioDaAcaoEvento, eventoCorrente, urlValida, type EventoParaAcoes } from "./eventos";

const ag: EventoParaAcoes = { id: "1", status: "agendado", dataInicioISO: "2026-10-01", temContrato: false, numLinks: 0 };
const re: EventoParaAcoes = { id: "2", status: "realizado", dataInicioISO: "2026-08-01", temContrato: true, numLinks: 2 };

describe("eventoCorrente", () => {
  it("prefere o agendado mais recente", () => {
    expect(eventoCorrente([re, ag, { ...ag, id: "3", dataInicioISO: "2026-09-01" }])?.id).toBe("1");
  });
  it("sem agendado, o mais recente por data", () => {
    expect(eventoCorrente([re, { ...re, id: "4", dataInicioISO: "2026-09-15" }])?.id).toBe("4");
  });
  it("vazio → null", () => expect(eventoCorrente([])).toBeNull());
});

describe("acoesDeEvento", () => {
  it("sem evento: só agendar", () => expect(acoesDeEvento({ perdido: false }, null)).toEqual(["agendar"]));
  it("lead perdido: nada", () => expect(acoesDeEvento({ perdido: true }, null)).toEqual([]));
  it("com evento agendado: contrato, links, realizado, cancelar", () =>
    expect(acoesDeEvento({ perdido: false }, ag)).toEqual(["registrar-contrato", "links", "realizado", "cancelar"]));
  it("evento realizado/cancelado: volta a agendar", () => {
    expect(acoesDeEvento({ perdido: false }, re)).toEqual(["agendar"]);
    expect(acoesDeEvento({ perdido: false }, { ...ag, status: "cancelado" })).toEqual(["agendar"]);
  });
});

describe("estagioDaAcaoEvento", () => {
  it("mapeia as ações que movem o card", () => {
    expect(estagioDaAcaoEvento("agendar")).toBe("evento-agendado");
    expect(estagioDaAcaoEvento("registrar-contrato")).toBe("contrato-recebido");
    expect(estagioDaAcaoEvento("realizado")).toBe("evento-realizado");
    expect(estagioDaAcaoEvento("links")).toBeNull();
    expect(estagioDaAcaoEvento("cancelar")).toBeNull();
  });
});

describe("urlValida", () => {
  it("aceita http(s) e recusa o resto", () => {
    expect(urlValida("https://inscricao.exemplo.com/x?y=1")).toBe(true);
    expect(urlValida("http://a.b")).toBe(true);
    expect(urlValida("javascript:alert(1)")).toBe(false);
    expect(urlValida("inscricao.exemplo.com")).toBe(false);
    expect(urlValida("")).toBe(false);
  });
});
