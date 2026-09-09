import { describe, expect, it, vi } from "vitest";

import { desmarcarOutrasVigentes, filtroOutrasVigentes } from "./vigenciaAvaliacao";

/**
 * Critério de aceite de docs/17 §4 (Sessão H2): "teste de que salvar uma
 * segunda avaliação vigente desmarca a anterior na mesma transação".
 * Mesmo padrão de gateQualificada.test.ts: a Local API é um duplo, então a
 * regra é exercitada sem banco.
 */
function payloadCom() {
  const update = vi.fn().mockResolvedValue({ docs: [], errors: [] });
  return { payload: { update } as never, update };
}

/** Sentinela: só precisa ser a MESMA referência que volta na chamada da Local API. */
const reqFalso = { transactionID: "tx-1" } as never;

describe("filtroOutrasVigentes", () => {
  it("filtra as outras avaliações vigentes da mesma oportunidade", () => {
    expect(filtroOutrasVigentes({ id: 12, vigente: true, oportunidade: 7 })).toEqual({
      and: [
        { oportunidade: { equals: 7 } },
        { id: { not_equals: 12 } },
        { vigente: { equals: true } },
      ],
    });
  });

  it("aceita a relação já populada pela Local API", () => {
    expect(filtroOutrasVigentes({ id: 12, vigente: true, oportunidade: { id: 7 } })).toMatchObject({
      and: [{ oportunidade: { equals: 7 } }, { id: { not_equals: 12 } }, { vigente: { equals: true } }],
    });
  });

  it("não filtra nada quando a avaliação não é a vigente", () => {
    expect(filtroOutrasVigentes({ id: 12, vigente: false, oportunidade: 7 })).toBeNull();
  });

  it("não filtra nada quando a avaliação não tem oportunidade", () => {
    expect(filtroOutrasVigentes({ id: 12, vigente: true, oportunidade: null })).toBeNull();
  });
});

describe("desmarcarOutrasVigentes", () => {
  it("desmarca as anteriores da mesma oportunidade", async () => {
    const { payload, update } = payloadCom();
    await desmarcarOutrasVigentes(payload, { id: 12, vigente: true, oportunidade: 7 }, reqFalso);
    expect(update).toHaveBeenCalledTimes(1);
    const args = update.mock.calls[0]![0] as {
      collection: string;
      where: unknown;
      data: unknown;
    };
    expect(args.collection).toBe("avaliacoes-qualificacao");
    expect(args.data).toEqual({ vigente: false });
    expect(args.where).toEqual({
      and: [
        { oportunidade: { equals: 7 } },
        { id: { not_equals: 12 } },
        { vigente: { equals: true } },
      ],
    });
  });

  it("repassa o req para a escrita entrar na mesma transação", async () => {
    const { payload, update } = payloadCom();
    await desmarcarOutrasVigentes(payload, { id: 12, vigente: true, oportunidade: 7 }, reqFalso);
    const args = update.mock.calls[0]![0] as { req: unknown };
    expect(args.req).toBe(reqFalso);
  });

  it("não escreve nada quando a avaliação salva não é a vigente", async () => {
    const { payload, update } = payloadCom();
    await desmarcarOutrasVigentes(payload, { id: 12, vigente: false, oportunidade: 7 }, reqFalso);
    expect(update).not.toHaveBeenCalled();
  });

  it("não escreve nada quando a avaliação não aponta para uma oportunidade", async () => {
    const { payload, update } = payloadCom();
    await desmarcarOutrasVigentes(payload, { id: 12, vigente: true }, reqFalso);
    expect(update).not.toHaveBeenCalled();
  });
});
