import { describe, expect, it } from "vitest";

import {
  destinoDepoisDoLogin,
  mostraModuloCrm,
  navCrmVisivel,
  navSiteVisivel,
  telaInicialCrm,
  telaInicialSite,
} from "./navegacao";
import type { AcessoPainel } from "./telas";

const VAZIO: AcessoPainel = { administrador: false, telas: [] };
const ADMIN: AcessoPainel = { administrador: true, telas: [] };
const SECRETARIA: AcessoPainel = {
  administrador: false,
  telas: ["crm.dashboard", "crm.leads", "crm.clientes"],
};

describe("destinoDepoisDoLogin", () => {
  it("sem nenhuma tela, vai para o módulo Site (Minha conta)", () => {
    expect(destinoDepoisDoLogin(VAZIO)).toBe("/");
  });

  it("só com telas do CRM, vai para /crm", () => {
    expect(destinoDepoisDoLogin(SECRETARIA)).toBe("/crm");
  });

  it("administrador vai para o Site", () => {
    expect(destinoDepoisDoLogin(ADMIN)).toBe("/");
  });

  it("com alguma tela do Site e do CRM, fica no Site", () => {
    expect(
      destinoDepoisDoLogin({ administrador: false, telas: ["crm.leads", "site.eventos"] }),
    ).toBe("/");
  });
});

describe("telaInicialSite", () => {
  it("sem nenhuma tela do Site, abre Configurações (Minha conta)", () => {
    expect(telaInicialSite(VAZIO)).toBe("config");
    expect(telaInicialSite(SECRETARIA)).toBe("config");
  });

  it("administrador abre o Painel", () => {
    expect(telaInicialSite(ADMIN)).toBe("dashboard");
  });

  it("abre a primeira tela marcada na ordem do menu, não na ordem gravada", () => {
    expect(telaInicialSite({ administrador: false, telas: ["site.home", "site.eventos"] })).toBe(
      "eventos",
    );
  });

  it("só Contatos do site (sem item de menu próprio) abre Configurações", () => {
    expect(telaInicialSite({ administrador: false, telas: ["site.contatos"] })).toBe("config");
  });
});

describe("telaInicialCrm", () => {
  it("secretaria abre o Dashboard", () => {
    expect(telaInicialCrm(SECRETARIA)).toBe("painel");
  });

  it("só catálogo abre Programas", () => {
    expect(telaInicialCrm({ administrador: false, telas: ["crm.modulos", "crm.programas"] })).toBe(
      "programas",
    );
  });

  it("administrador abre o Dashboard", () => {
    expect(telaInicialCrm(ADMIN)).toBe("painel");
  });
});

describe("menus", () => {
  it("o menu do Site lista só as telas marcadas, na ordem do menu", () => {
    expect(
      navSiteVisivel({
        administrador: false,
        telas: ["site.home", "site.palestrantes", "crm.leads"],
      }),
    ).toEqual(["palestrantes", "home"]);
  });

  it("o menu do CRM lista só as telas marcadas", () => {
    expect(navCrmVisivel(SECRETARIA)).toEqual(["painel", "leads", "clientes"]);
    expect(navCrmVisivel(VAZIO)).toEqual([]);
  });

  it("administrador vê todos os itens", () => {
    expect(navSiteVisivel(ADMIN)).toEqual([
      "dashboard",
      "palestrantes",
      "corpo-docente",
      "eventos",
      "conteudos",
      "home",
    ]);
    expect(navCrmVisivel(ADMIN)).toHaveLength(8);
  });

  it("o CRM só aparece no seletor com alguma tela crm.*", () => {
    expect(mostraModuloCrm(VAZIO)).toBe(false);
    expect(mostraModuloCrm({ administrador: false, telas: ["site.eventos"] })).toBe(false);
    expect(mostraModuloCrm({ administrador: false, telas: ["crm.produtos"] })).toBe(true);
    expect(mostraModuloCrm(ADMIN)).toBe(true);
  });
});
