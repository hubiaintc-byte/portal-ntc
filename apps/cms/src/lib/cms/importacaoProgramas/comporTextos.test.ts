import { describe, expect, it } from "vitest";

import type { ConteudoPrograma } from "@ntc/lib";

import paginas from "@/seed/assets/paginas-programas.json";
import instantaneo from "@/seed/assets/programas.json";

import { comporEmenta, comporProblema, comporPublicoAlvo } from "./comporTextos";
import { mapearPrograma } from "./mapear";
import { paginaParaCampos } from "./paginaParaCampos";
import type { ProgramaInstantaneo } from "./tipos";

const paginasPorSigla = new Map((paginas as { programas: ConteudoPrograma[] }).programas.map((p) => [p.sigla, p]));
const antigos = (instantaneo as { programas: ProgramaInstantaneo[] }).programas;

describe("proposta compõe os textos como a de 30/09", () => {
  it("os dois instantâneos têm as mesmas siglas", () => {
    expect([...paginasPorSigla.keys()].sort()).toEqual(antigos.map((p) => p.sigla).sort());
  });

  for (const antigo of antigos) {
    it(antigo.sigla, () => {
      const pagina = paginasPorSigla.get(antigo.sigla);
      if (!pagina) throw new Error(`sem página para ${antigo.sigla}`);
      const { campos } = paginaParaCampos(pagina);
      const hoje = mapearPrograma(antigo);

      expect(comporProblema(campos.problema, campos.pagina.problemaDestaque)).toEqual(hoje.campos.problema);
      expect(comporPublicoAlvo(campos.publicoAlvo, campos.pagina.publicoChips)).toEqual(hoje.campos.publicoAlvo);
      expect(campos.modulos.map((m) => m.numero)).toEqual(hoje.modulos.map((m) => m.numero));
      campos.modulos.forEach((m, i) => {
        expect(comporEmenta(m.descricao, m.topicos)).toEqual(hoje.modulos[i]?.ementa);
      });
    });
  }

  it("sem as partes novas devolve o documento original intacto", () => {
    const doc = { root: { children: [{ type: "paragraph" }] } };
    expect(comporProblema(doc, "")).toBe(doc);
    expect(comporProblema(doc, undefined)).toBe(doc);
    expect(comporPublicoAlvo(doc, [])).toBe(doc);
    expect(comporPublicoAlvo(doc, null)).toBe(doc);
    expect(comporEmenta(doc, [])).toBe(doc);
    expect(comporEmenta(null, ["a"])).toBeNull();
  });

  it("não altera o documento de entrada", () => {
    const doc = { root: { children: [] as unknown[] } };
    comporEmenta(doc, ["a"]);
    expect(doc.root.children).toHaveLength(0);
  });
});
