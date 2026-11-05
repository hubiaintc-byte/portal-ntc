import { describe, expect, it, vi } from "vitest";

import { codigoFin, registrarAuditoriaFin, registrarExclusaoFin } from "./auditoria";

type Hook = (args: Record<string, unknown>) => Promise<unknown>;
const aposMudar = registrarAuditoriaFin as unknown as Hook;
const aposApagar = registrarExclusaoFin as unknown as Hook;

function fakeReq(opts: { falhar?: boolean } = {}) {
  const create = vi.fn(async () => {
    if (opts.falhar) throw new Error("audit-log indisponível");
    return { id: 1 };
  });
  return { user: { id: 7 }, payload: { create } };
}

const colecao = (slug: string) => ({ slug });

describe("codigoFin", () => {
  it("usa os prefixos do protótipo com 4 dígitos", () => {
    expect(codigoFin("fin-receitas", 3)).toBe("RC-0003");
    expect(codigoFin("fin-eventos", "12")).toBe("EV-0012");
    expect(codigoFin("fin-faturamentos", 1)).toBe("FR-0001");
    expect(codigoFin("fin-custos", 10000)).toBe("CU-10000");
    expect(codigoFin("fin-pagamentos", 5)).toBe("PG-0005");
    expect(codigoFin("fin-contas", 2)).toBe("CT-0002");
  });
});

describe("registrarAuditoriaFin (afterChange)", () => {
  const antes = { id: 3, evento: 9, valorUnit: 1000, qtde: 2, createdAt: "a", updatedAt: "a" };

  it("atualização que muda só valorUnit grava só valorUnit em metadata.mudancas", async () => {
    const req = fakeReq();
    const doc = { ...antes, valorUnit: 1500, updatedAt: "b" };
    const r = await aposMudar({
      doc,
      previousDoc: antes,
      operation: "update",
      req,
      collection: colecao("fin-receitas"),
    });
    expect(r).toBe(doc);
    expect(req.payload.create).toHaveBeenCalledTimes(1);
    expect(req.payload.create).toHaveBeenCalledWith({
      collection: "audit-log",
      data: {
        usuario: 7,
        acao: "atualizar",
        entidade: "fin-receitas",
        entidadeId: "3",
        descricao: "Receita RC-0003 alterada",
        metadata: { mudancas: { valorUnit: { antes: 1000, depois: 1500 } } },
      },
      overrideAccess: true,
      req,
    });
  });

  it("relacionamento populado no doc não conta como mudança", async () => {
    const req = fakeReq();
    const doc = { ...antes, evento: { id: 9, nome: "X" }, updatedAt: "b" };
    await aposMudar({
      doc,
      previousDoc: antes,
      operation: "update",
      req,
      collection: colecao("fin-receitas"),
    });
    expect(req.payload.create).not.toHaveBeenCalled();
  });

  it("atualização sem mudança não grava", async () => {
    const req = fakeReq();
    await aposMudar({
      doc: { ...antes, updatedAt: "b" },
      previousDoc: antes,
      operation: "update",
      req,
      collection: colecao("fin-receitas"),
    });
    expect(req.payload.create).not.toHaveBeenCalled();
  });

  it("criação grava o registro inteiro", async () => {
    const req = fakeReq();
    const doc = { id: 1, nome: "Conta A" };
    await aposMudar({
      doc,
      previousDoc: {},
      operation: "create",
      req,
      collection: colecao("fin-contas"),
    });
    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          acao: "criar",
          entidade: "fin-contas",
          entidadeId: "1",
          descricao: "Conta CT-0001 criada",
          metadata: { registro: doc },
        }),
        overrideAccess: true,
        req,
      }),
    );
  });

  it("falha do create do log rejeita o hook", async () => {
    const req = fakeReq({ falhar: true });
    await expect(
      aposMudar({
        doc: { ...antes, valorUnit: 1 },
        previousDoc: antes,
        operation: "update",
        req,
        collection: colecao("fin-receitas"),
      }),
    ).rejects.toThrow("audit-log indisponível");
  });
});

describe("registrarExclusaoFin (afterDelete)", () => {
  it("grava deletar com o registro", async () => {
    const req = fakeReq();
    const doc = { id: 5, documento: "TIT-1" };
    await aposApagar({ doc, id: 5, req, collection: colecao("fin-pagamentos") });
    expect(req.payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          acao: "deletar",
          entidade: "fin-pagamentos",
          entidadeId: "5",
          descricao: "Pagamento PG-0005 excluído",
          metadata: { registro: doc },
        }),
        overrideAccess: true,
        req,
      }),
    );
  });

  it("falha do log rejeita a exclusão", async () => {
    const req = fakeReq({ falhar: true });
    await expect(
      aposApagar({ doc: { id: 5 }, id: 5, req, collection: colecao("fin-pagamentos") }),
    ).rejects.toThrow("audit-log indisponível");
  });
});
