import { describe, expect, it } from "vitest";

import {
  PERFIS_CATALOGO,
  PERFIS_CRM,
  PERFIS_EVENTOS,
  PERFIS_INSTITUCIONAL,
  capacidadesDoPerfil,
  temPerfil,
} from "./perfis";

describe("temPerfil", () => {
  it("CRM: só super-admin e atendimento-comercial", () => {
    expect(temPerfil("super-admin", PERFIS_CRM)).toBe(true);
    expect(temPerfil("atendimento-comercial", PERFIS_CRM)).toBe(true);
    expect(temPerfil("editor-institucional", PERFIS_CRM)).toBe(false);
    expect(temPerfil("editor-eventos", PERFIS_CRM)).toBe(false);
  });

  it("catálogo: comercial e institucional, não o editor de eventos", () => {
    expect(temPerfil("atendimento-comercial", PERFIS_CATALOGO)).toBe(true);
    expect(temPerfil("editor-institucional", PERFIS_CATALOGO)).toBe(true);
    expect(temPerfil("editor-eventos", PERFIS_CATALOGO)).toBe(false);
  });

  it("eventos e institucional não incluem o comercial", () => {
    expect(temPerfil("atendimento-comercial", PERFIS_EVENTOS)).toBe(false);
    expect(temPerfil("editor-eventos", PERFIS_EVENTOS)).toBe(true);
    expect(temPerfil("atendimento-comercial", PERFIS_INSTITUCIONAL)).toBe(false);
    expect(temPerfil("editor-eventos", PERFIS_INSTITUCIONAL)).toBe(false);
  });

  it("recusa perfil ausente ou desconhecido", () => {
    expect(temPerfil(null, PERFIS_CRM)).toBe(false);
    expect(temPerfil(undefined, PERFIS_CATALOGO)).toBe(false);
    expect(temPerfil("admin", PERFIS_CRM)).toBe(false);
  });
});

describe("capacidadesDoPerfil", () => {
  it("super-admin pode tudo", () => {
    const c = capacidadesDoPerfil("super-admin");
    expect(Object.values(c).every(Boolean)).toBe(true);
  });

  it("editor-institucional: site inteiro e catálogo, sem CRM nem usuários", () => {
    expect(capacidadesDoPerfil("editor-institucional")).toEqual({
      editarEventos: true,
      editarPalestrantes: true,
      editarCorpoDocente: true,
      editarHome: true,
      editarConteudos: true,
      editarContatos: true,
      editarCatalogo: true,
      usarCrm: false,
      gerirUsuarios: false,
    });
  });

  it("editor-eventos: só eventos", () => {
    expect(capacidadesDoPerfil("editor-eventos")).toEqual({
      editarEventos: true,
      editarPalestrantes: false,
      editarCorpoDocente: false,
      editarHome: false,
      editarConteudos: false,
      editarContatos: false,
      editarCatalogo: false,
      usarCrm: false,
      gerirUsuarios: false,
    });
  });

  it("atendimento-comercial: CRM e catálogo, nada do site", () => {
    expect(capacidadesDoPerfil("atendimento-comercial")).toEqual({
      editarEventos: false,
      editarPalestrantes: false,
      editarCorpoDocente: false,
      editarHome: false,
      editarConteudos: false,
      editarContatos: false,
      editarCatalogo: true,
      usarCrm: true,
      gerirUsuarios: false,
    });
  });

  it("perfil ausente ou desconhecido não pode nada", () => {
    for (const p of [null, undefined, "", "admin", "Super-Admin"]) {
      expect(Object.values(capacidadesDoPerfil(p)).some(Boolean)).toBe(false);
    }
  });
});
