import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { caminhosDoPrograma, pedirRevalidacao, revalidarProgramas, revalidarProgramasDoEvento } = await import(
  "./revalidarSite"
);

const fetchMock = vi.fn(async () => ({ ok: true }));

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("PAYLOAD_PUBLIC_FRONT_URL", "https://site.test");
  vi.stubEnv("REVALIDATE_SECRET", "s3gredo");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

const corpos = () =>
  fetchMock.mock.calls.map((c) => JSON.parse(((c as unknown[])[1] as { body: string }).body) as Record<string, string>);

describe("caminhosDoPrograma", () => {
  it("página, lista, vertente, layout (menu) e mapa do site", () => {
    expect(caminhosDoPrograma({ slug: "edutec", areaSigla: "educacao" })).toEqual([
      { path: "/programas/edutec" },
      { path: "/programas" },
      { path: "/solucoes-estrategicas/educacao" },
      { path: "/", escopo: "layout" },
      { path: "/mapa-do-site" },
    ]);
  });
  it("área fora das três vertentes e slug ausente não viram path", () => {
    expect(caminhosDoPrograma({ slug: null, areaSigla: "outra" })).toEqual([
      { path: "/programas" },
      { path: "/", escopo: "layout" },
      { path: "/mapa-do-site" },
    ]);
  });
});

describe("pedirRevalidacao", () => {
  it("POST com o segredo para cada pedido", async () => {
    expect(await pedirRevalidacao([{ path: "/programas" }, { path: "/", escopo: "layout" }])).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://site.test/api/revalidate",
      expect.objectContaining({ method: "POST", headers: expect.objectContaining({ "X-Revalidate-Secret": "s3gredo" }) }),
    );
    expect(corpos()).toEqual([{ path: "/programas" }, { path: "/", escopo: "layout" }]);
  });
  it("resposta não-ok ou rede caída devolvem false, sem lançar", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    expect(await pedirRevalidacao([{ path: "/programas" }])).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("rede"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await pedirRevalidacao([{ path: "/programas" }])).toBe(false);
  });
});

function payloadFalso() {
  const findByID = vi.fn(async ({ collection, id }: { collection: string; id: unknown }) => {
    if (collection === "eventos") return { id, programa: 4 };
    if (String(id) === "4") return { id: 4, slug: "edutec", area: { sigla: "educacao" } };
    return { id, slug: "proge", area: { sigla: "gestao-publica" } };
  });
  const find = vi.fn(async () => ({ docs: [{ id: 30, programa: 8 }] }));
  return { findByID, find };
}

describe("revalidarProgramas", () => {
  it("junta os paths dos programas sem repetir", async () => {
    const p = payloadFalso();
    expect(await revalidarProgramas(p as never, ["4", 8])).toBe(true);
    const paths = corpos().map((c) => c.path);
    expect(paths).toContain("/programas/edutec");
    expect(paths).toContain("/programas/proge");
    expect(paths).toContain("/solucoes-estrategicas/gestao-publica");
    expect(paths.filter((x) => x === "/programas")).toHaveLength(1);
  });
  it("falha ao ler o programa vira false", async () => {
    const p = payloadFalso();
    p.findByID.mockRejectedValueOnce(new Error("banco"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await revalidarProgramas(p as never, ["4"])).toBe(false);
  });
});

describe("revalidarProgramasDoEvento", () => {
  it("revalida a página do programa do evento e a dos programas dos módulos que o vinculam", async () => {
    const p = payloadFalso();
    expect(await revalidarProgramasDoEvento(p as never, "12")).toBe(true);
    expect(p.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "modulos", where: { eventosVinculados: { equals: "12" } } }),
    );
    expect(corpos().map((c) => c.path).sort()).toEqual(["/programas/edutec", "/programas/proge"]);
  });
});
