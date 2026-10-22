import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.hoisted(() => vi.fn());
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ find }) }));

import { fetchEvento } from "./eventos";
import { buscarOverride } from "./overrideEventoOnline";

const SO_PUBLICADO = { _status: { equals: "published" } };

describe("leitura de eventos pelo site", () => {
  beforeEach(() => {
    find.mockReset();
  });

  it("fetchEvento consulta só eventos publicados e devolve null se não houver", async () => {
    find.mockResolvedValue({ docs: [] });
    await expect(fetchEvento("novo-evento-rascunho-abc")).resolves.toBeNull();
    const args = find.mock.calls[0]?.[0];
    expect(args.collection).toBe("eventos");
    expect(args.where.and).toContainEqual(SO_PUBLICADO);
    expect(args.where.and).toContainEqual({ slug: { equals: "novo-evento-rascunho-abc" } });
    expect(args.draft).toBeUndefined();
  });

  it("buscarOverride consulta só eventos publicados", async () => {
    find.mockResolvedValue({ docs: [] });
    await expect(buscarOverride("edutec-m01-2026")).resolves.toBeNull();
    const args = find.mock.calls[0]?.[0];
    expect(args.where.and).toContainEqual(SO_PUBLICADO);
    expect(args.draft).toBeUndefined();
  });
});
