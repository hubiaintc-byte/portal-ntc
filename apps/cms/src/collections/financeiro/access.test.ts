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

  it("com fin.pagar não cria fin-receitas", () => {
    expect(pode(FinReceitas, "create", { telas: ["fin.pagar"] })).toBe(false);
    expect(pode(FinFaturamentos, "create", { telas: ["fin.pagar"] })).toBe(false);
  });

  it("com fin.receber não cria custo nem pagamento", () => {
    expect(pode(FinCustos, "create", { telas: ["fin.receber"] })).toBe(false);
    expect(pode(FinPagamentos, "update", { telas: ["fin.receber"] })).toBe(false);
  });

  it("create/update por tela, como no brief", () => {
    expect(pode(FinEventos, "create", { telas: ["fin.eventos"] })).toBe(true);
    expect(pode(FinEventos, "create", { telas: ["fin.receber", "fin.pagar"] })).toBe(false);
    expect(pode(FinReceitas, "update", { telas: ["fin.eventos"] })).toBe(true);
    expect(pode(FinFaturamentos, "create", { telas: ["fin.receber"] })).toBe(true);
    expect(pode(FinCustos, "create", { telas: ["fin.pagar"] })).toBe(true);
    expect(pode(FinPagamentos, "create", { telas: ["fin.eventos"] })).toBe(true);
    expect(pode(FinContas, "create", { telas: ["fin.receber"] })).toBe(true);
    expect(pode(FinContas, "update", { telas: ["fin.pagar"] })).toBe(true);
    expect(pode(FinContas, "create", { telas: ["fin.eventos"] })).toBe(false);
  });

  it("read: qualquer tela fin.*, e nada para quem só tem telas de outros módulos ou anônimo", () => {
    for (const c of TODAS) {
      expect(pode(c, "read", { telas: ["fin.visao-executiva"] })).toBe(true);
      expect(pode(c, "read", { telas: ["crm.leads", "site.eventos"] })).toBe(false);
      expect(pode(c, "read", null)).toBe(false);
    }
  });

  it("admin pode tudo", () => {
    for (const c of TODAS) {
      for (const op of ["read", "create", "update", "delete"] as const)
        expect(pode(c, op, admin)).toBe(true);
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
