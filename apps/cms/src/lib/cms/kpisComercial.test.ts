import { describe, expect, it } from "vitest";

import { calcularKpisComercial, formatarMoedaBRL, leadAtivo } from "./kpisComercial";
import type { LeadCrmResumo } from "./painelCrm";

const base: LeadCrmResumo = {
  id: "1", nome: "Ana", email: "ana@x.gov.br", instituicao: "SME", cargo: null, programaSigla: "EDUTEC",
  participantesEstimados: 40, estagio: "em-contato", perdido: false, motivoPerda: null, clienteId: "1",
  clienteNome: "SME", responsavelId: null, responsavelNome: null, valorEstimado: 10000,
  origemEntrada: "site", criadoEmISO: "2026-09-10T00:00:00.000Z", atualizadoEmISO: "2026-09-10T00:00:00.000Z",
};
const hoje = "2026-09-16T12:00:00.000Z";

describe("calcularKpisComercial", () => {
  it("conta leads dos últimos 30 dias, ativos, valor e eventos agendados", () => {
    const leads: LeadCrmResumo[] = [
      base,
      { ...base, id: "2", criadoEmISO: "2026-07-01T00:00:00.000Z", estagio: "evento-agendado", valorEstimado: 5000 },
      { ...base, id: "3", perdido: true, valorEstimado: 99999 },
      { ...base, id: "4", estagio: "evento-realizado", valorEstimado: 77777 },
    ];
    expect(calcularKpisComercial(leads, hoje)).toEqual({
      leadsNovos30d: 3,
      negociosAtivos: 2,
      valorEmNegociacao: 15000,
      eventosAgendados: 1,
    });
  });

  it("lista vazia zera tudo", () => {
    expect(calcularKpisComercial([], hoje)).toEqual({ leadsNovos30d: 0, negociosAtivos: 0, valorEmNegociacao: 0, eventosAgendados: 0 });
  });
});

describe("leadAtivo", () => {
  it("perdido e realizado não são ativos", () => {
    expect(leadAtivo(base)).toBe(true);
    expect(leadAtivo({ ...base, perdido: true })).toBe(false);
    expect(leadAtivo({ ...base, estagio: "evento-realizado" })).toBe(false);
  });
});

describe("formatarMoedaBRL", () => {
  it("formata em real", () => {
    expect(formatarMoedaBRL(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});
