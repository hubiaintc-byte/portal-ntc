import { describe, expect, it } from "vitest";

import { capacidadesDoAcesso } from "../lib/cms/telas";
import { acessoDoPerfilLegado, planejarMigracao } from "./migrarPermissoesPorTela";

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

describe("acessoDoPerfilLegado + capacidadesDoAcesso", () => {
  const capacidadesDoPerfil = (perfil: string | null | undefined) => capacidadesDoAcesso(acessoDoPerfilLegado(perfil));
  const verdadeiras = (perfil: string | null | undefined) =>
    Object.entries(capacidadesDoPerfil(perfil))
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort();

  it("super-admin vira administrador com tudo liberado", () => {
    const c = capacidadesDoPerfil("super-admin");
    expect(c.gerirUsuarios).toBe(true);
    expect(c.editarEventos && c.editarHome && c.editarConteudos && c.editarCatalogo && c.usarCrm).toBe(true);
  });

  it("editor-institucional edita o site e o catálogo, sem gerir usuários", () => {
    const c = capacidadesDoPerfil("editor-institucional");
    expect(c).toMatchObject({
      editarEventos: true,
      editarPalestrantes: true,
      editarCorpoDocente: true,
      editarHome: true,
      editarConteudos: true,
      editarContatos: true,
      editarCatalogo: true,
      gerirUsuarios: false,
      verLeads: false,
    });
  });

  it("editor-eventos só edita eventos", () => {
    expect(verdadeiras("editor-eventos")).toEqual(["editarEventos"]);
  });

  it("atendimento-comercial usa o CRM, sem editar o site", () => {
    const c = capacidadesDoPerfil("atendimento-comercial");
    expect(c).toMatchObject({ usarCrm: true, verLeads: true, editarEventos: false, editarCatalogo: true, gerirUsuarios: false });
  });

  it("perfil ausente ou desconhecido não pode nada", () => {
    for (const p of [null, undefined, "", "admin", "Super-Admin"]) {
      expect(verdadeiras(p)).toEqual([]);
    }
  });
});
