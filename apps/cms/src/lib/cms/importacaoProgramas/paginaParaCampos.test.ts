import { describe, expect, it } from "vitest";

import { camposParaPagina } from "@ntc/lib";
import type { ConteudoPrograma, ExtrasEventos } from "@ntc/lib";

import instantaneo from "@/seed/assets/paginas-programas.json";

import { romanoParaInteiro } from "./mapear";
import { paginaParaCampos } from "./paginaParaCampos";

const programas = (instantaneo as { programas: ConteudoPrograma[] }).programas;

function extrasDe(p: ConteudoPrograma): ExtrasEventos {
  const status: ExtrasEventos["status"] = new Map();
  for (const m of p.modulos.itens) {
    const n = romanoParaInteiro(m.numero);
    if (n !== null && m.statusRotulo && m.statusTipo) status.set(n, { rotulo: m.statusRotulo, tipo: m.statusTipo });
  }
  return { modulosAbertos: { feature: p.modulosAbertos?.feature, miniStack: p.modulosAbertos?.miniStack }, status };
}

describe("ida e volta das 15 páginas de programa", () => {
  it("o instantâneo tem os 15", () => {
    expect(programas).toHaveLength(15);
  });

  for (const p of programas) {
    it(p.slug, () => {
      const { campos, avisos } = paginaParaCampos(p);
      expect(avisos).toEqual([]);
      expect(camposParaPagina(campos, extrasDe(p))).toStrictEqual(p);
    });
  }
});
