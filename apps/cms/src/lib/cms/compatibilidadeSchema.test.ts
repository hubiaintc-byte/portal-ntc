import { describe, expect, it } from "vitest";

import { manterRlsLigado } from "./compatibilidadeSchema";

describe("manterRlsLigado", () => {
  it("marca todas as tabelas com o símbolo de RLS do drizzle", () => {
    const tabelas = { users: {}, media: {} };
    const resultado = manterRlsLigado({ schema: { tables: tabelas, enums: {} } });
    const simbolo = Symbol.for("drizzle:EnableRLS");
    expect((resultado.tables.users as Record<symbol, unknown>)[simbolo]).toBe(true);
    expect((resultado.tables.media as Record<symbol, unknown>)[simbolo]).toBe(true);
  });
});
