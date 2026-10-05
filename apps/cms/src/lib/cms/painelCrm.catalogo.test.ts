import { describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterCatalogoCrm } = await import("./painelCrm");

describe("obterCatalogoCrm (wizard de proposta)", () => {
  it("lista só programas publicados e só módulos deles", async () => {
    const find = vi.fn(async (a: { collection: string; where?: unknown; draft?: boolean }) => {
      if (a.collection === "programas") {
        expect(a.where).toEqual({ _status: { equals: "published" } });
        expect(a.draft).toBe(false);
        return { docs: [{ id: 1, sigla: "PUB", nomeCompleto: "Publicado" }] };
      }
      if (a.collection === "modulos") return { docs: [{ id: 10, titulo: "Do publicado", numero: 1, programa: 1 }, { id: 11, titulo: "De rascunho", numero: 1, programa: 2 }] };
      return { docs: [] };
    });
    obterPayloadMock.mockResolvedValue({ find });
    const c = await obterCatalogoCrm();
    expect(c.programas.map((p) => p.sigla)).toEqual(["PUB"]);
    expect(c.modulos.map((m) => m.id)).toEqual(["10"]);
  });
});
