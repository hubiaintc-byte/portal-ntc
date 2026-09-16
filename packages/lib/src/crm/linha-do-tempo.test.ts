import { describe, expect, it } from "vitest";

import { montarItemLinhaDoTempo, tituloPerda, tituloTransicao } from "./linha-do-tempo";

const agora = new Date("2026-09-16T12:00:00.000Z");

describe("montarItemLinhaDoTempo", () => {
  it("monta o item com ids numéricos e data fixa", () => {
    expect(
      montarItemLinhaDoTempo({
        clienteId: "3",
        leadId: 7,
        tipo: "transicao",
        titulo: "Movido para Em contato",
        usuarioId: "5",
        referencia: { colecao: "leads", id: "7" },
        agora,
      }),
    ).toEqual({
      cliente: 3,
      lead: 7,
      tipo: "transicao",
      titulo: "Movido para Em contato",
      detalhe: null,
      referencia: { colecao: "leads", id: "7" },
      usuario: 5,
      em: "2026-09-16T12:00:00.000Z",
    });
  });

  it("devolve null sem cliente válido — a linha do tempo é sempre do cliente", () => {
    expect(
      montarItemLinhaDoTempo({ clienteId: null, tipo: "nota", titulo: "x", agora }),
    ).toBeNull();
    expect(
      montarItemLinhaDoTempo({ clienteId: "abc", tipo: "nota", titulo: "x", agora }),
    ).toBeNull();
  });

  it("recusa título vazio", () => {
    expect(montarItemLinhaDoTempo({ clienteId: 1, tipo: "nota", titulo: "  ", agora })).toBeNull();
  });

  it("usuário ausente vira null (ator sistema)", () => {
    expect(
      montarItemLinhaDoTempo({ clienteId: 1, tipo: "lead", titulo: "Lead recebido", agora }),
    ).toMatchObject({ usuario: null, lead: null });
  });
});

describe("títulos", () => {
  it("transição com e sem estágio anterior", () => {
    expect(tituloTransicao("lead", "oportunidade")).toBe("Lead → Oportunidade");
    expect(tituloTransicao(null, "lead")).toBe("Entrou em Lead");
  });

  it("perda com o rótulo do motivo", () => {
    expect(tituloPerda("sem-orcamento")).toBe("Marcado como perdido · Sem orçamento");
    expect(tituloPerda("qualquer")).toBe("Marcado como perdido · qualquer");
  });
});
