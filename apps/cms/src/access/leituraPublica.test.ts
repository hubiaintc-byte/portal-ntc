import { describe, expect, it } from "vitest";

import { Areas } from "../collections/Areas";
import { Conteudos } from "../collections/Conteudos";
import { Especialistas } from "../collections/Especialistas";
import { Eventos } from "../collections/Eventos";
import { Modulos } from "../collections/Modulos";
import { Programas } from "../collections/Programas";
import { CorpoDocente } from "../globals/CorpoDocente";
import { Home } from "../globals/Home";
import { OGrupo } from "../globals/OGrupo";

/**
 * A REST pública do Payload entregava rascunhos (`read: () => true`), inclusive
 * especialistas ocultos do site e campos comerciais. O site lê pela Local API
 * (overrideAccess), então estas regras só valem para quem chama a API de fora.
 */
type Req = { user?: { id: number } | null; query?: Record<string, unknown> };
const ler = (fn: unknown, req: Req) => (fn as (a: { req: Req }) => unknown)({ req });

const anonimo: Req = { user: null, query: {} };
const anonimoPedindoRascunho: Req = { user: null, query: { draft: "true" } };
const logado: Req = { user: { id: 1 }, query: { draft: "true" } };
const publicado = { _status: { equals: "published" } };

describe("coleções com rascunho", () => {
  for (const c of [Areas, Programas, Eventos, Conteudos]) {
    it(`${c.slug}: anônimo vê só publicado, não pede rascunho; logado vê tudo`, () => {
      expect(ler(c.access?.read, anonimo)).toEqual(publicado);
      expect(ler(c.access?.read, anonimoPedindoRascunho)).toBe(false);
      expect(ler(c.access?.read, logado)).toBe(true);
    });
  }

  it("especialistas: anônimo não vê os ocultos do site", () => {
    expect(ler(Especialistas.access?.read, anonimo)).toEqual({
      and: [
        publicado,
        { or: [{ ocultarDoSite: { equals: false } }, { ocultarDoSite: { exists: false } }] },
      ],
    });
    expect(ler(Especialistas.access?.read, anonimoPedindoRascunho)).toBe(false);
    expect(ler(Especialistas.access?.read, logado)).toBe(true);
  });
});

describe("globals com rascunho", () => {
  for (const g of [Home, OGrupo, CorpoDocente]) {
    it(`${g.slug}: anônimo lê o publicado, mas não o rascunho`, () => {
      expect(ler(g.access?.read, anonimo)).toBe(true);
      expect(ler(g.access?.read, anonimoPedindoRascunho)).toBe(false);
      expect(ler(g.access?.read, logado)).toBe(true);
    });
  }
});

describe("campos comerciais", () => {
  type Campo = { name?: string; type?: string; access?: { read?: unknown }; fields?: Campo[]; tabs?: { fields: Campo[] }[] };
  const achar = (campos: Campo[], nome: string): Campo | undefined => {
    for (const c of campos) {
      if (c.name === nome) return c;
      const filhos = [...(c.fields ?? []), ...(c.tabs ?? []).flatMap((t) => t.fields)];
      const r = achar(filhos, nome);
      if (r) return r;
    }
    return undefined;
  };

  it.each([
    [Eventos, "comercial"],
    [Eventos, "linkReplay"],
    [Eventos, "observacoesCertificado"],
    [Modulos, "comercial"],
  ])("%s.%s só para logado", (colecao, nome) => {
    const campo = achar(colecao.fields as Campo[], nome);
    expect(campo, nome).toBeDefined();
    expect(ler(campo?.access?.read, anonimo)).toBe(false);
    expect(ler(campo?.access?.read, logado)).toBe(true);
  });
});
