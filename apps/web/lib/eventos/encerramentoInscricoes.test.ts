import { describe, expect, it } from "vitest";

import { ehCtaDeInscricao, encerramentoInscricoesISO, inscricoesEncerradas } from "./encerramentoInscricoes";

describe("encerramentoInscricoesISO", () => {
  it("fecha às 8h de Brasília do primeiro dia", () => {
    expect(encerramentoInscricoesISO("2026-11-04")).toBe("2026-11-04T08:00:00-03:00");
  });

  it("aceita ISO completo e usa só a data", () => {
    expect(encerramentoInscricoesISO("2026-11-04T12:00:00.000Z")).toBe("2026-11-04T08:00:00-03:00");
  });
});

describe("inscricoesEncerradas", () => {
  it("abertas às 7h59 de Brasília do primeiro dia", () => {
    expect(inscricoesEncerradas("2026-11-04", new Date("2026-11-04T10:59:59Z"))).toBe(false);
  });

  it("encerradas às 8h em ponto de Brasília", () => {
    expect(inscricoesEncerradas("2026-11-04", new Date("2026-11-04T11:00:00Z"))).toBe(true);
  });

  it("abertas na véspera à noite", () => {
    expect(inscricoesEncerradas("2026-11-04", new Date("2026-11-04T02:00:00Z"))).toBe(false);
  });
});

describe("ehCtaDeInscricao", () => {
  it("reconhece os botões de inscrição das páginas de evento", () => {
    for (const t of ["Inscrever-se", "Inscrever-se agora", "Inscrever equipe ou grupo", "Inscrever equipe ou grupo institucional"]) {
      expect(ehCtaDeInscricao(t)).toBe(true);
    }
  });

  it("mantém os demais botões", () => {
    for (const t of ["Baixar folder", "Solicitar proposta institucional", "Ver agenda completa", "Saiba mais"]) {
      expect(ehCtaDeInscricao(t)).toBe(false);
    }
  });
});
