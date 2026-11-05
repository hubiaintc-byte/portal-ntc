import { describe, expect, test } from "vitest";
import { LISTAS_FIN, modalidadeKeys, nomeCentro } from "./listas";

describe("listas", () => {
  test("listas não trazem comissão", () => {
    expect(LISTAS_FIN.categorias.map((c) => c.nome)).not.toContain("Comissões comerciais");
    expect(LISTAS_FIN).not.toHaveProperty("vendedores");
    expect(LISTAS_FIN).not.toHaveProperty("modalidadesComissao");
    expect(LISTAS_FIN).not.toHaveProperty("basesComissao");
    expect(LISTAS_FIN).not.toHaveProperty("condicoesAquisicao");
  });
  test("tamanhos conferem com o mapa", () => {
    expect(LISTAS_FIN.categorias).toHaveLength(22);
    expect(LISTAS_FIN.drivers).toHaveLength(20);
    expect(LISTAS_FIN.unidades).toHaveLength(12);
    expect(LISTAS_FIN.ufs).toHaveLength(27);
    expect(LISTAS_FIN.categoriasCorporativas).toHaveLength(8);
    expect(LISTAS_FIN.origensReceitaCorp).toHaveLength(5);
    expect(Object.values(LISTAS_FIN.programas).flat()).toHaveLength(15);
  });
  test("nomeCentro", () => {
    expect(nomeCentro("OPE")).toBe("Operações e Eventos");
    expect(nomeCentro("XXX")).toBe("XXX");
    expect(nomeCentro("")).toBe("—");
  });
  test("modalidadeKeys", () => {
    expect(modalidadeKeys("Online ao vivo")).toEqual(["on"]);
    expect(modalidadeKeys("Presencial")).toEqual(["pr"]);
    expect(modalidadeKeys("Híbrido")).toEqual(["on", "pr"]);
  });
});
