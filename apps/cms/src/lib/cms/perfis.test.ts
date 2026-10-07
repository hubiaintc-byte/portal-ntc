import { describe, expect, it } from "vitest";

import { PERFIS_CATALOGO, PERFIS_CRM, PERFIS_EVENTOS, PERFIS_INSTITUCIONAL, temPerfil } from "./perfis";

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
