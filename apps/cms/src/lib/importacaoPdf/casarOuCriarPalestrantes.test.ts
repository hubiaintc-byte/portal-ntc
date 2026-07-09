import { describe, expect, it, vi } from "vitest";

import {
  casarOuCriarPalestrantes,
  mapearTitulacao,
  normalizarNome,
  type PayloadPalestrantes,
} from "./casarOuCriarPalestrantes";

function mockPayload(existentes: { id: string; nome: string }[]): PayloadPalestrantes & {
  create: ReturnType<typeof vi.fn>;
} {
  return {
    find: vi.fn().mockResolvedValue({ docs: existentes }),
    create: vi.fn().mockImplementation(() => Promise.resolve({ id: "novo-1" })),
  };
}

describe("normalizarNome / mapearTitulacao", () => {
  it("normaliza acentos, caixa e espaços", () => {
    expect(normalizarNome("  Marialba  GLÓRIA ")).toBe("marialba gloria");
  });

  it("deduz titulação da linha em caps", () => {
    expect(mapearTitulacao("DOUTORAEMCIENCIAS · UNICAMP")).toBe("doutorado");
    expect(mapearTitulacao("PÓS-DOUTORADO · USP")).toBe("pos-doutorado");
    expect(mapearTitulacao("MESTRE EM EDUCAÇÃO")).toBe("mestrado");
    expect(mapearTitulacao("GOOGLE INNOVATOR")).toBe("especializacao");
  });
});

describe("casarOuCriarPalestrantes", () => {
  const folder = { linhaTitulacao: "DOUTORA · UNICAMP", minicurriculo: "Bio extensa." };

  it("vincula existente por nome normalizado sem criar", async () => {
    const payload = mockPayload([{ id: "esp-1", nome: "Roberta Aquino" }]);
    const r = await casarOuCriarPalestrantes(payload, [{ nome: "ROBERTA AQUÍNO", ...folder }]);
    expect(r.ids).toEqual(["esp-1"]);
    expect(r.vinculados).toEqual(["ROBERTA AQUÍNO"]);
    expect(payload.create).not.toHaveBeenCalled();
  });

  it("cria desconhecido oculto do site com campos derivados do folder", async () => {
    const payload = mockPayload([]);
    const r = await casarOuCriarPalestrantes(payload, [{ nome: "Pedro Lino", ...folder }]);
    expect(r.ids).toEqual(["novo-1"]);
    expect(r.criados).toEqual(["Pedro Lino"]);
    const data = payload.create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data.ocultarDoSite).toBe(true);
    expect(data.titulacao).toBe("doutorado");
    expect(data.instituicao).toBe("UNICAMP");
  });

  it("falha na criação vira pendente sem lançar", async () => {
    const payload = mockPayload([]);
    payload.create.mockRejectedValue(new Error("validação"));
    const r = await casarOuCriarPalestrantes(payload, [{ nome: "Fulano Novo", ...folder }]);
    expect(r.ids).toEqual([]);
    expect(r.pendentes).toEqual(["Fulano Novo"]);
  });

  it("lista vazia não consulta o banco", async () => {
    const payload = mockPayload([]);
    const r = await casarOuCriarPalestrantes(payload, []);
    expect(r.ids).toEqual([]);
    expect(payload.find).not.toHaveBeenCalled();
  });
});
