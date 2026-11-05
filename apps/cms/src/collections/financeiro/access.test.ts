import type { CollectionConfig } from "payload";
import { describe, expect, it } from "vitest";

import { FinContas } from "./FinContas";
import { FinCustos } from "./FinCustos";
import { FinEventos } from "./FinEventos";
import { FinFaturamentos } from "./FinFaturamentos";
import { FinPagamentos } from "./FinPagamentos";
import { FinReceitas } from "./FinReceitas";

type Operacao = "read" | "create" | "update" | "delete";
type Usuario = { administrador?: boolean; telas?: string[] } | null;

function pode(c: CollectionConfig, op: Operacao, user: Usuario): unknown {
  const fn = c.access?.[op];
  if (typeof fn !== "function") throw new Error(`${c.slug}.access.${op} ausente`);
  return fn({ req: { user } } as never);
}

const TODAS = [FinEventos, FinReceitas, FinFaturamentos, FinCustos, FinPagamentos, FinContas];
const admin: Usuario = { administrador: true };
const todasTelasFin: Usuario = {
  telas: ["fin.visao-executiva", "fin.eventos", "fin.receber", "fin.pagar"],
};

describe("access das coleções fin-*", () => {
  it("slugs são os seis do financeiro", () => {
    expect(TODAS.map((c) => c.slug)).toEqual([
      "fin-eventos",
      "fin-receitas",
      "fin-faturamentos",
      "fin-custos",
      "fin-pagamentos",
      "fin-contas",
    ]);
  });

  it("não-admin com fin.receber não tem delete em fin-receitas", () => {
    expect(pode(FinReceitas, "delete", { telas: ["fin.receber"] })).toBe(false);
  });

  it("nenhuma tela fin.* dá delete, em nenhuma coleção", () => {
    for (const c of TODAS) expect(pode(c, "delete", todasTelasFin)).toBe(false);
  });

  it("create/update fechados na REST para todos, inclusive administrador (escrita só pelas Server Actions)", () => {
    for (const c of TODAS) {
      for (const op of ["create", "update"] as const) {
        expect(pode(c, op, admin)).toBe(false);
        expect(pode(c, op, todasTelasFin)).toBe(false);
        expect(pode(c, op, null)).toBe(false);
      }
    }
  });

  it("read por grupo: receitas e faturamentos só com visão executiva, eventos ou receber", () => {
    for (const c of [FinReceitas, FinFaturamentos]) {
      expect(pode(c, "read", { telas: ["fin.pagar"] })).toBe(false);
      for (const t of ["fin.visao-executiva", "fin.eventos", "fin.receber"])
        expect(pode(c, "read", { telas: [t] })).toBe(true);
    }
  });

  it("read por grupo: custos e pagamentos só com visão executiva, eventos ou pagar", () => {
    for (const c of [FinCustos, FinPagamentos]) {
      expect(pode(c, "read", { telas: ["fin.receber"] })).toBe(false);
      for (const t of ["fin.visao-executiva", "fin.eventos", "fin.pagar"])
        expect(pode(c, "read", { telas: [t] })).toBe(true);
    }
  });

  it("read: eventos e contas com qualquer tela fin.*", () => {
    for (const c of [FinEventos, FinContas]) {
      for (const t of ["fin.visao-executiva", "fin.eventos", "fin.receber", "fin.pagar"])
        expect(pode(c, "read", { telas: [t] })).toBe(true);
    }
  });

  it("read: nada para quem só tem telas de outros módulos ou anônimo", () => {
    for (const c of TODAS) {
      expect(pode(c, "read", { telas: ["crm.leads", "site.eventos"] })).toBe(false);
      expect(pode(c, "read", null)).toBe(false);
    }
  });

  it("admin lê e exclui tudo", () => {
    for (const c of TODAS) {
      for (const op of ["read", "delete"] as const) expect(pode(c, op, admin)).toBe(true);
    }
  });
});

describe("guardas de exclusão registradas", () => {
  it("fin-eventos, fin-receitas, fin-custos e fin-contas têm beforeDelete; parcela e título excluem livre", () => {
    for (const c of [FinEventos, FinReceitas, FinCustos, FinContas])
      expect(c.hooks?.beforeDelete?.length).toBe(1);
    for (const c of [FinFaturamentos, FinPagamentos]) expect(c.hooks?.beforeDelete).toBeUndefined();
  });
});
