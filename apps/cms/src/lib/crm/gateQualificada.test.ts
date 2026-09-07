import { describe, expect, it, vi } from "vitest";

import { DIMENSOES_COM04, HARD_GATES_COM04 } from "@ntc/lib";

import { erroDoGateQualificada } from "./gateQualificada";

function avaliacaoCompleta(): Record<string, unknown> {
  const av: Record<string, unknown> = {
    statusAvaliacao: "concluida",
    resultado: "qualificada",
    justificativa: "Confirmada em reunião.",
    proximoPasso: "Enviar proposta.",
    vigente: true,
  };
  for (const d of DIMENSOES_COM04) av[d.campo] = 2;
  for (const g of HARD_GATES_COM04) av[g.campo] = "nao";
  return av;
}

function payloadCom(docs: Record<string, unknown>[]) {
  const find = vi.fn().mockResolvedValue({ docs });
  return { payload: { find } as never, find };
}

describe("erroDoGateQualificada", () => {
  it("bloqueia quando não há avaliação vigente", async () => {
    const { payload } = payloadCom([]);
    expect(await erroDoGateQualificada(payload, 7)).toBe(
      "Estágio Qualificada bloqueado: não há avaliação vigente.",
    );
  });

  it("repassa a mensagem da regra quando a avaliação está incompleta", async () => {
    const av = avaliacaoCompleta();
    av.justificativa = "";
    const { payload } = payloadCom([av]);
    expect(await erroDoGateQualificada(payload, 7)).toBe(
      "Estágio Qualificada bloqueado: justificativa ausente.",
    );
  });

  it("libera quando a avaliação vigente cumpre as 10 condições", async () => {
    const { payload } = payloadCom([avaliacaoCompleta()]);
    expect(await erroDoGateQualificada(payload, 7)).toBeNull();
  });

  it("consulta só a avaliação vigente daquela oportunidade", async () => {
    const { payload, find } = payloadCom([avaliacaoCompleta()]);
    await erroDoGateQualificada(payload, 7);
    const args = find.mock.calls[0]![0] as { collection: string; where: unknown };
    expect(args.collection).toBe("avaliacoes-qualificacao");
    expect(JSON.stringify(args.where)).toContain("\"equals\":7");
    expect(JSON.stringify(args.where)).toContain("vigente");
  });
});
