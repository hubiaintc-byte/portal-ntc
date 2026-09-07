import { describe, expect, it, vi } from "vitest";

import { DIMENSOES_COM04, HARD_GATES_COM04 } from "@ntc/lib";

import { decisaoGateQualificada, erroDoGateQualificada } from "./gateQualificada";

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

describe("decisaoGateQualificada", () => {
  it("aciona o gate quando a oportunidade é criada já como Qualificada", () => {
    // Criação: não existe `originalDoc`. Sem id ainda — o chamador (hook da
    // coleção) deve bloquear direto, sem consultar a Local API.
    const decisao = decisaoGateQualificada({ estagio: "qualificada" }, undefined);
    expect(decisao).toEqual({ precisaGate: true, oportunidadeId: undefined });
  });

  it("aciona o gate quando a atualização transiciona outro estágio para Qualificada", () => {
    const decisao = decisaoGateQualificada(
      { estagio: "qualificada" },
      { estagio: "negociacao", id: 7 },
    );
    expect(decisao).toEqual({ precisaGate: true, oportunidadeId: 7 });
  });

  it("NÃO aciona o gate ao editar uma oportunidade já Qualificada por motivo não relacionado", () => {
    const decisao = decisaoGateQualificada(
      { estagio: "qualificada" },
      { estagio: "qualificada", id: 7 },
    );
    expect(decisao.precisaGate).toBe(false);
  });

  it("NÃO aciona o gate quando a transição é para qualquer outro estágio", () => {
    const decisao = decisaoGateQualificada(
      { estagio: "perdida" },
      { estagio: "negociacao", id: 7 },
    );
    expect(decisao.precisaGate).toBe(false);
  });

  it("NÃO aciona o gate numa criação que não é Qualificada", () => {
    const decisao = decisaoGateQualificada({ estagio: "mapeada" }, undefined);
    expect(decisao.precisaGate).toBe(false);
  });
});
