import { describe, expect, it } from "vitest";

import { planejarMigracao } from "./migrarPermissoesPorTela";

describe("planejarMigracao", () => {
  it("super-admin vira administrador", () => {
    expect(planejarMigracao([{ id: 1, perfil: "super-admin" }])).toEqual([
      { id: 1, administrador: true, telas: [] },
    ]);
  });

  it("editor-eventos vira Painel e Eventos", () => {
    expect(planejarMigracao([{ id: 2, perfil: "editor-eventos" }])).toEqual([
      { id: 2, administrador: false, telas: ["site.painel", "site.eventos"] },
    ]);
  });

  it("pula quem já tem administrador ou telas", () => {
    expect(
      planejarMigracao([
        { id: 1, perfil: "editor-eventos", administrador: true },
        { id: 2, perfil: "editor-eventos", telas: ["site.home"] },
      ]),
    ).toEqual([]);
  });

  it("perfil desconhecido ou ausente fica sem nada", () => {
    expect(planejarMigracao([{ id: 3, perfil: "xyz" }, { id: 4 }])).toEqual([
      { id: 3, administrador: false, telas: [] },
      { id: 4, administrador: false, telas: [] },
    ]);
  });
});
