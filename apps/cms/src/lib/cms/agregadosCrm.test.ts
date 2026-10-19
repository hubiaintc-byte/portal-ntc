import { PgDialect } from "@payloadcms/db-postgres/drizzle/pg-core";
import type { Payload } from "payload";
import { describe, expect, it, vi } from "vitest";

const { contarModulosPorPrograma, contarNegociosPorCliente, ultimoItemLinhaDoTempoPorCliente } = await import(
  "./agregadosCrm"
);

const dialeto = new PgDialect();

function payloadCom(rows: Record<string, unknown>[]) {
  const execute = vi.fn<(consulta: unknown) => Promise<{ rows: Record<string, unknown>[] }>>(async () => ({ rows }));
  const payload = { db: { drizzle: { execute } } } as unknown as Payload;
  const sqlExecutado = (): string => dialeto.sqlToQuery(execute.mock.calls[0]?.[0] as never).sql;
  return { payload, sqlExecutado };
}

describe("contarNegociosPorCliente", () => {
  it("conta só os leads do CRM, agrupados por cliente", async () => {
    const { payload, sqlExecutado } = payloadCom([
      { cliente_id: 3, n: 2 },
      { cliente_id: 5, n: 1 },
    ]);
    const mapa = await contarNegociosPorCliente(payload);
    expect([...mapa]).toEqual([
      ["3", 2],
      ["5", 1],
    ]);
    expect(sqlExecutado()).toMatch(/from leads where tipo = 'proposta' and cliente_id is not null group by cliente_id/);
  });
});

describe("ultimoItemLinhaDoTempoPorCliente", () => {
  it("devolve o ISO do item mais recente no formato que o Payload entrega (Date ou texto)", async () => {
    const { payload, sqlExecutado } = payloadCom([
      { cliente_id: 3, ultimo: new Date("2026-10-01T12:30:00.000Z") },
      { cliente_id: 4, ultimo: "2026-09-30 21:00:00+00" },
    ]);
    const mapa = await ultimoItemLinhaDoTempoPorCliente(payload);
    expect(mapa.get("3")).toBe("2026-10-01T12:30:00.000Z");
    expect(mapa.get("4")).toBe("2026-09-30T21:00:00.000Z");
    expect(sqlExecutado()).toMatch(/max\(em\) as ultimo from linha_do_tempo .* group by cliente_id/);
  });
});

describe("contarModulosPorPrograma", () => {
  it("conta módulos por programa e ignora linha sem programa", async () => {
    const { payload, sqlExecutado } = payloadCom([
      { programa_id: 1, n: 8 },
      { programa_id: null, n: 2 },
    ]);
    const mapa = await contarModulosPorPrograma(payload);
    expect([...mapa]).toEqual([["1", 8]]);
    expect(sqlExecutado()).toMatch(/from modulos where programa_id is not null group by programa_id/);
  });
});
