import { describe, expect, it } from "vitest";
import {
  acoesDeEvento,
  acoesDoAcervo,
  estagioDaAcaoEvento,
  eventoCorrente,
  negociosQuePodemAgendar,
  urlValida,
  type EventoParaAcoes,
} from "./eventos";

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

describe("acoesDoAcervo", () => {
  it("evento agendado: contrato, links, realizado, cancelar (agendar é do cliente, não do evento)", () =>
    expect(acoesDoAcervo("agendado")).toEqual(["registrar-contrato", "links", "realizado", "cancelar"]));
  it("realizado, cancelado ou desconhecido: nada", () => {
    expect(acoesDoAcervo("realizado")).toEqual([]);
    expect(acoesDoAcervo("cancelado")).toEqual([]);
    expect(acoesDoAcervo("outro")).toEqual([]);
  });
});

describe("negociosQuePodemAgendar", () => {
  const ev = (id: string, leadId: string | null, status: string, dataInicioISO = "2026-10-01") => ({ id, leadId, status, dataInicioISO });
  const a = { id: "1", perdido: false };
  const b = { id: "2", perdido: false };
  const perdido = { id: "3", perdido: true };

  it("negócio sem evento pode agendar; perdido não", () =>
    expect(negociosQuePodemAgendar([a, perdido], [])).toEqual([a]));
  it("negócio com evento agendado não pode; com realizado ou cancelado, pode", () => {
    expect(negociosQuePodemAgendar([a, b], [ev("10", "1", "agendado"), ev("11", "2", "realizado")])).toEqual([b]);
    expect(negociosQuePodemAgendar([a], [ev("12", "1", "cancelado")])).toEqual([a]);
  });
  it("evento de outro negócio ou sem lead não bloqueia", () =>
    expect(negociosQuePodemAgendar([a], [ev("13", "2", "agendado"), ev("14", null, "agendado")])).toEqual([a]));
  it("agendado antigo continua corrente mesmo com realizado mais novo", () =>
    expect(
      negociosQuePodemAgendar([a], [ev("15", "1", "agendado", "2026-01-01"), ev("16", "1", "realizado", "2026-12-01")]),
    ).toEqual([]));
});
