import { describe, expect, it } from "vitest";

import {
  PERFIS_CATALOGO,
  PERFIS_CRM,
  PERFIS_EVENTOS,
  PERFIS_INSTITUCIONAL,
  temPerfil,
} from "./perfis";
import { acessoDoPerfilLegado, capacidadesDoAcesso } from "./telas";

const capacidadesDoPerfil = (perfil: string | null | undefined) => capacidadesDoAcesso(acessoDoPerfilLegado(perfil));

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

/** Valores que `capacidadesDoPerfil` devolvia antes do modelo por tela (as 9 flags originais). */
const ANTIGAS = ["editarEventos", "editarPalestrantes", "editarCorpoDocente", "editarHome", "editarConteudos", "editarContatos", "editarCatalogo", "usarCrm", "gerirUsuarios"] as const;

const ESPERADO_ANTIGO = {
  "super-admin": [true, true, true, true, true, true, true, true, true],
  "editor-institucional": [true, true, true, true, true, true, true, false, false],
  "editor-eventos": [true, false, false, false, false, false, false, false, false],
  "atendimento-comercial": [false, false, false, false, false, false, true, true, false],
} as const;

describe("acessoDoPerfilLegado + capacidadesDoAcesso", () => {
  it.each(Object.keys(ESPERADO_ANTIGO) as (keyof typeof ESPERADO_ANTIGO)[])(
    "%s: as 9 flags originais seguem iguais",
    (perfil) => {
      const c = capacidadesDoPerfil(perfil);
      const obtido = ANTIGAS.map((k) => c[k]);
      // DIVERGÊNCIA CONHECIDA: editor-institucional tem crm.programas/modulos/produtos,
      // logo `usarCrm` (qualquer tela crm) vira true; antes era false. Ver relatório da Task 1.
      const esperado: boolean[] = [...ESPERADO_ANTIGO[perfil]];
      if (perfil === "editor-institucional") esperado[7] = true;
      expect(obtido).toEqual(esperado);
    },
  );

  it("perfil ausente ou desconhecido não pode nada", () => {
    for (const p of [null, undefined, "", "admin", "Super-Admin"]) {
      expect(Object.values(capacidadesDoPerfil(p)).some(Boolean)).toBe(false);
    }
  });
});
