import { describe, expect, it } from "vitest";
import type { Field } from "payload";

import { Modulos } from "./Modulos";
import { Programas } from "./Programas";

type Campo = Field & { name?: string; fields?: Field[]; tabs?: { fields: Field[] }[] };

function todos(campos: Field[]): Campo[] {
  const saida: Campo[] = [];
  for (const c of campos as Campo[]) {
    saida.push(c);
    if (c.fields) saida.push(...todos(c.fields));
    if (c.tabs) for (const t of c.tabs) saida.push(...todos(t.fields));
  }
  return saida;
}

function achar(campos: Field[], nome: string): Campo | undefined {
  return todos(campos).find((c) => c.name === nome);
}

describe("campos da página do programa", () => {
  const pagina = achar(Programas.fields, "pagina");

  it("existe o grupo pagina", () => {
    expect(pagina?.type).toBe("group");
  });

  it("nenhum campo dentro de pagina é required", () => {
    const dentro = todos(pagina?.fields ?? []);
    expect(dentro.length).toBeGreaterThan(20);
    expect(dentro.filter((c) => (c as { required?: boolean }).required === true)).toEqual([]);
  });

  it("identidadeVisual tem default vertente", () => {
    const iv = achar(pagina?.fields ?? [], "identidadeVisual") as
      | { defaultValue?: string }
      | undefined;
    expect(iv?.defaultValue).toBe("vertente");
  });

  it("cartao tem descricaoMenu e descricaoMapa, de texto e opcionais", () => {
    const cartao = achar(pagina?.fields ?? [], "cartao");
    for (const nome of ["descricaoMenu", "descricaoMapa"]) {
      const c = achar(cartao?.fields ?? [], nome) as
        | { type?: string; required?: boolean }
        | undefined;
      expect(c?.type).toBe("text");
      expect(c?.required).not.toBe(true);
    }
  });

  it("modulos.topicos é opcional", () => {
    const t = achar(Modulos.fields, "topicos");
    expect(t?.type).toBe("array");
    expect(todos([t as Field]).some((c) => (c as { required?: boolean }).required === true)).toBe(false);
  });
});
