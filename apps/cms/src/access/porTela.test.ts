import { describe, expect, it } from "vitest";

import { Areas } from "../collections/Areas";
import { Clientes } from "../collections/Clientes";
import { ClientesCrm } from "../collections/ClientesCrm";
import { Conteudos } from "../collections/Conteudos";
import { DocumentosComerciais } from "../collections/DocumentosComerciais";
import { Eventos } from "../collections/Eventos";
import { EventosComerciais } from "../collections/EventosComerciais";
import { Leads } from "../collections/Leads";
import { LinhaDoTempo } from "../collections/LinhaDoTempo";
import { Media } from "../collections/Media";
import { Programas } from "../collections/Programas";
import { Propostas } from "../collections/Propostas";
import { Users } from "../collections/Users";
import { Home } from "../globals/Home";
import { Rodape } from "../globals/Rodape";

type Op = "read" | "create" | "update" | "delete";
interface Cfg {
  access?: Partial<Record<Op, unknown>>;
}
const chamar = (c: Cfg, op: Op, user: unknown, extra: Record<string, unknown> = {}) =>
  (c.access?.[op] as (a: unknown) => unknown)({ req: { user, query: {} }, ...extra });

const secretaria = {
  id: 2,
  collection: "users",
  administrador: false,
  telas: ["crm.dashboard", "crm.leads", "crm.propostas"],
};
const soClientes = { id: 3, collection: "users", administrador: false, telas: ["crm.clientes"] };
const admin = { id: 1, collection: "users", administrador: true, telas: [] };
const semTelas = { id: 4, collection: "users", administrador: false, telas: [] };

describe("access por tela", () => {
  it("secretaria (leads + propostas)", () => {
    for (const op of ["read", "create", "update"] as const)
      expect(chamar(Leads, op, secretaria)).toBe(true);
    expect(chamar(ClientesCrm, "create", secretaria)).toBe(false);
    expect(chamar(ClientesCrm, "read", secretaria)).toBe(true);
    expect(chamar(Propostas, "update", secretaria)).toBe(true);
    expect(chamar(Programas, "update", secretaria)).toBe(false);
    expect(chamar(Eventos, "update", secretaria)).toBe(false);
    expect(chamar(Leads, "delete", secretaria)).toBe(false);
  });

  it("só Clientes não lê leads mas mexe no evento comercial e no documento", () => {
    expect(chamar(Leads, "read", soClientes)).toBe(false);
    expect(chamar(EventosComerciais, "update", soClientes)).toBe(true);
    expect(chamar(ClientesCrm, "update", soClientes)).toBe(true);
    expect(chamar(DocumentosComerciais, "create", soClientes)).toBe(true);
    expect(chamar(Propostas, "read", soClientes)).toBe(false);
  });

  it("administrador tem acesso total; sem telas, nada", () => {
    expect(chamar(Areas, "update", admin)).toBe(true);
    expect(chamar(Leads, "delete", admin)).toBe(true);
    expect(chamar(Areas, "update", secretaria)).toBe(false);
    expect(chamar(Clientes, "update", secretaria)).toBe(false);
    expect(chamar(Leads, "read", semTelas)).toBe(false);
    expect(chamar(Leads, "read", null)).toBe(false);
  });

  it("site: cada tela escreve só a sua coleção", () => {
    const ev = { id: 5, administrador: false, telas: ["site.eventos"] };
    expect(chamar(Eventos, "update", ev)).toBe(true);
    expect(chamar(Conteudos, "update", ev)).toBe(false);
    expect(chamar(Media, "create", ev)).toBe(true);
    expect(chamar(Media, "create", secretaria)).toBe(false);
    expect(chamar(Home, "update" as Op, ev)).toBe(false);
    expect(
      chamar(Rodape, "update" as Op, { id: 6, administrador: false, telas: ["site.contatos"] }),
    ).toBe(true);
  });

  it("linha-do-tempo: só nota, por tela", () => {
    expect(chamar(LinhaDoTempo, "create", secretaria, { data: { tipo: "nota" } })).toBe(true);
    expect(chamar(LinhaDoTempo, "create", secretaria, { data: { tipo: "evento" } })).toBe(false);
    expect(chamar(LinhaDoTempo, "create", semTelas, { data: { tipo: "nota" } })).toBe(false);
  });

  it("users: próprio registro, administrador/telas só pelo administrador", () => {
    expect(chamar(Users, "read", secretaria)).toEqual({ id: { equals: 2 } });
    expect(chamar(Users, "update", secretaria)).toEqual({ id: { equals: 2 } });
    expect(chamar(Users, "read", admin)).toBe(true);
    expect(chamar(Users, "create", secretaria)).toBe(false);
    expect(chamar(Users, "delete", admin)).toBe(true);
    const campo = (nome: string) =>
      (Users.fields as { name?: string; access?: { update?: unknown } }[]).find(
        (f) => f.name === nome,
      );
    for (const nome of ["administrador", "telas"]) {
      const f = campo(nome)?.access?.update as (a: unknown) => boolean;
      expect(f({ req: { user: secretaria } })).toBe(false);
      expect(f({ req: { user: admin } })).toBe(true);
    }
  });
});
