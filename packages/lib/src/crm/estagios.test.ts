import { describe, expect, it } from "vitest";

import {
  ESTAGIOS_LEAD,
  MOTIVOS_PERDA,
  diasEntre,
  ehEstagioLead,
  indiceDoEstagio,
  rotuloDoEstagio,
} from "./estagios";

describe("ESTAGIOS_LEAD", () => {
  it("tem os 10 estágios do kanban na ordem do spec", () => {
    expect(ESTAGIOS_LEAD.map((e) => e.value)).toEqual([
      "lead",
      "oportunidade",
      "em-contato",
      "proposta-em-producao",
      "proposta-enviada",
      "proposta-aceita",
      "evento-agendado",
      "contrato-recebido",
      "links-enviados",
      "evento-realizado",
    ]);
  });

  it("tem rótulos legíveis", () => {
    expect(rotuloDoEstagio("proposta-em-producao")).toBe("Proposta em produção");
    expect(rotuloDoEstagio("contrato-recebido")).toBe("Contrato/empenho recebido");
    expect(rotuloDoEstagio("inexistente")).toBe("inexistente");
  });
});

describe("ehEstagioLead", () => {
  it("aceita só os slugs da lista", () => {
    expect(ehEstagioLead("lead")).toBe(true);
    expect(ehEstagioLead("evento-realizado")).toBe(true);
    expect(ehEstagioLead("mapeada")).toBe(false);
    expect(ehEstagioLead(null)).toBe(false);
    expect(ehEstagioLead(3)).toBe(false);
  });
});

describe("indiceDoEstagio", () => {
  it("devolve a posição na ordem do kanban", () => {
    expect(indiceDoEstagio("lead")).toBe(0);
    expect(indiceDoEstagio("evento-realizado")).toBe(9);
  });
});

describe("MOTIVOS_PERDA", () => {
  it("tem os 5 motivos do spec", () => {
    expect(MOTIVOS_PERDA.map((m) => m.value)).toEqual([
      "sem-resposta",
      "recusou",
      "sem-orcamento",
      "cancelado",
      "outro",
    ]);
  });
});

describe("diasEntre", () => {
  it("conta dias inteiros entre duas datas ISO", () => {
    expect(diasEntre("2026-09-01T10:00:00.000Z", "2026-09-16T09:00:00.000Z")).toBe(14);
    expect(diasEntre("2026-09-16T10:00:00.000Z", "2026-09-16T12:00:00.000Z")).toBe(0);
  });

  it("nunca devolve negativo nem NaN", () => {
    expect(diasEntre("2026-09-20T00:00:00.000Z", "2026-09-16T00:00:00.000Z")).toBe(0);
    expect(diasEntre("data inválida", "2026-09-16T00:00:00.000Z")).toBe(0);
  });
});
