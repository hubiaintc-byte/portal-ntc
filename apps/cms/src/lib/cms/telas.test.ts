import { describe, expect, it } from "vitest";

import {
  IDS_TELAS_GRAVADOS,
  TELAS,
  TELAS_LEADS,
  acessoDoUsuario,
  capacidadesDoAcesso,
  telasDoModulo,
  temTela,
} from "./telas";

describe("TELAS", () => {
  it("tem 14 telas com ids únicos (Produtos / Eventos saiu do menu)", () => {
    expect(TELAS).toHaveLength(14);
    expect(new Set(TELAS.map((t) => t.id)).size).toBe(14);
    expect(TELAS.some((t) => t.id === "crm.produtos")).toBe(false);
  });

  it("Programas e Módulos moram no Site, logo depois de Eventos, com os ids gravados de sempre", () => {
    expect(TELAS.find((t) => t.id === "crm.programas")?.modulo).toBe("site");
    expect(TELAS.find((t) => t.id === "crm.modulos")?.modulo).toBe("site");
    const ids = TELAS.map((t) => t.id);
    const eventos = ids.indexOf("site.eventos");
    expect(ids.slice(eventos, eventos + 3)).toEqual(["site.eventos", "crm.programas", "crm.modulos"]);
  });

  it("os valores gravados (enum de users.telas) não mudam: os 15, na ordem original", () => {
    expect(IDS_TELAS_GRAVADOS).toEqual([
      "site.painel",
      "site.palestrantes",
      "site.corpo-docente",
      "site.eventos",
      "site.conteudos",
      "site.home",
      "site.contatos",
      "crm.dashboard",
      "crm.leads",
      "crm.clientes",
      "crm.propostas",
      "crm.envios",
      "crm.programas",
      "crm.modulos",
      "crm.produtos",
    ]);
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
    expect(telasDoModulo({ administrador: true, telas: [] }, "crm")).toHaveLength(5);
    expect(telasDoModulo({ administrador: true, telas: [] }, "site")).toHaveLength(9);
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
      editarProgramas: false,
      editarModulos: false,
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

  it("catálogo: Programas edita programas e módulos; Módulos só módulos", () => {
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.programas"] })).toMatchObject({
      editarProgramas: true,
      editarModulos: true,
    });
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.modulos"] })).toMatchObject({
      editarProgramas: false,
      editarModulos: true,
    });
  });

  it("acompanhar eventos no acervo do cliente: Clientes, Dashboard ou Leads", () => {
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.clientes"] }).acompanharEventos).toBe(true);
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.leads"] }).acompanharEventos).toBe(true);
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.propostas"] }).acompanharEventos).toBe(false);
  });

  it("Produtos / Eventos gravado não dá mais CRM nenhum; só catálogo não usa o CRM", () => {
    expect(capacidadesDoAcesso(acessoDoUsuario({ telas: ["crm.produtos"] })).usarCrm).toBe(false);
    expect(capacidadesDoAcesso({ administrador: false, telas: ["crm.programas", "crm.modulos"] }).usarCrm).toBe(false);
  });

  it("administrador pode tudo", () => {
    expect(Object.values(capacidadesDoAcesso({ administrador: true, telas: [] })).every(Boolean)).toBe(true);
  });
});
