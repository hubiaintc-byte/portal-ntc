import type { Config } from "payload";
import { describe, expect, it } from "vitest";

import { manterRlsLigado, objectKeySemColuna } from "./compatibilidadeSchema";

describe("manterRlsLigado", () => {
  it("marca todas as tabelas com o símbolo de RLS do drizzle", () => {
    const tabelas = { users: {}, media: {} };
    const resultado = manterRlsLigado({ schema: { tables: tabelas, enums: {} } });
    const simbolo = Symbol.for("drizzle:EnableRLS");
    expect((resultado.tables.users as Record<symbol, unknown>)[simbolo]).toBe(true);
    expect((resultado.tables.media as Record<symbol, unknown>)[simbolo]).toBe(true);
  });
});

describe("objectKeySemColuna", () => {
  it("torna _objectKey virtual só nas coleções de storage", () => {
    const config = {
      collections: [
        { slug: "media", fields: [{ name: "alt", type: "text" }, { name: "_objectKey", type: "text" }] },
        { slug: "programas", fields: [{ name: "_objectKey", type: "text" }] },
      ],
    } as unknown as Config;
    const saida = objectKeySemColuna(config) as Config;
    const [media, programas] = saida.collections ?? [];
    expect(media?.fields[0]).toEqual({ name: "alt", type: "text" });
    expect(media?.fields[1]).toEqual({ name: "_objectKey", type: "text", virtual: true });
    expect(programas?.fields[0]).toEqual({ name: "_objectKey", type: "text" });
  });
});
