import { describe, expect, it } from "vitest";

import { TELAS, TELAS_LEADS, acessoDoUsuario, capacidadesDoAcesso, telasDoModulo, temTela } from "./telas";

describe("TELAS", () => {
  it("tem 15 telas com ids únicos", () => {
    expect(TELAS).toHaveLength(15);
    expect(new Set(TELAS.map((t) => t.id)).size).toBe(15);
  });
});

describe("acessoDoUsuario", () => {
  it("filtra ids desconhecidos e remove duplicatas", () => {
    expect(acessoDoUsuario({ telas: ["crm.leads", "inexistente", "crm.leads"] })).toEqual({
      administrador: false,
      telas: ["crm.leads"],
    });
  });

  it("usuário ausente não tem acesso", () => {
    expect(acessoDoUsuario(null)).toEqual({ administrador: false, telas: [] });
    expect(acessoDoUsuario(undefined)).toEqual({ administrador: false, telas: [] });
  });
});

describe("temTela", () => {
  it("administrador passa em tudo", () => {
    expect(temTela({ administrador: true, telas: [] }, ["crm.clientes"])).toBe(true);
  });
  it("exige interseção não vazia", () => {
    expect(temTela({ administrador: false, telas: ["crm.leads"] }, ["crm.clientes"])).toBe(false);
    expect(temTela({ administrador: false, telas: ["crm.leads"] }, TELAS_LEADS)).toBe(true);
  });
  it("acesso nulo não passa", () => {
    expect(temTela(null, TELAS_LEADS)).toBe(false);
  });
});

describe("telasDoModulo", () => {
  it("administrador recebe todas as telas do módulo", () => {
    expect(telasDoModulo({ administrador: true, telas: [] }, "crm")).toHaveLength(8);
    expect(telasDoModulo({ administrador: true, telas: [] }, "site")).toHaveLength(7);
  });
  it("não administrador recebe só as suas, na ordem do menu", () => {
    expect(telasDoModulo({ administrador: false, telas: ["crm.leads", "site.home"] }, "crm")).toEqual(["crm.leads"]);
  });
});

describe("capacidadesDoAcesso", () => {
  it("secretaria: CRM e leads, sem catálogo nem usuários", () => {
    const c = capacidadesDoAcesso({
      administrador: false,
      telas: ["crm.dashboard", "crm.leads", "crm.propostas"],
    });
    expect(c).toMatchObject({
      usarCrm: true,
      verLeads: true,
      editarCatalogo: false,
      gerirUsuarios: false,
      editarEventos: false,
    });
  });

  it("card do Corpo Docente exige palestrantes e corpo-docente", () => {
    expect(
      capacidadesDoAcesso({ administrador: false, telas: ["site.palestrantes"] }),
    ).toMatchObject({ editarPalestrantes: true, editarCardCorpoDocente: false });
    expect(
      capacidadesDoAcesso({ administrador: false, telas: ["site.palestrantes", "site.corpo-docente"] }),
    ).toMatchObject({ editarCardCorpoDocente: true });
  });

  it("acompanhar eventos no acervo do cliente: Clientes, Dashboard ou Leads", () => {
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.clientes"] }).acompanharEventos).toBe(true);
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.leads"] }).acompanharEventos).toBe(true);
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.propostas"] }).acompanharEventos).toBe(false);
  });

  it("administrador pode tudo", () => {
    expect(Object.values(capacidadesDoAcesso({ administrador: true, telas: [] })).every(Boolean)).toBe(true);
  });
});
