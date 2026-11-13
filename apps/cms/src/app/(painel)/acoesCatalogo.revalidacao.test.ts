import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { paginaVazia } from "@/lib/cms/paginaProgramaCatalogo";

/**
 * Publicar pela Server Action, sem simular a escrita: só o banco, a sessão e
 * a rede são falsos — prova que o botão Publicar pede ao site a página do
 * programa (spec 2026-11-05 §6.5).
 */
const obterUsuarioAutenticadoMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temTela, acessoDoUsuario } = await import("@/lib/cms/telas");
  return {
    obterUsuarioCmsComTela: vi.fn(),
    obterUsuarioAutenticadoComTela: async (telas: Parameters<typeof temTela>[1]) => {
      const u = await obterUsuarioAutenticadoMock();
      return u && temTela(acessoDoUsuario(u), telas) ? u : null;
    },
  };
});
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/crm/transacao", () => ({
  executarEmTransacao: async (_p: unknown, _u: unknown, fn: (req: unknown) => unknown) => fn({}),
}));
const payload = {
  find: vi.fn(async () => ({ docs: [] })),
  count: vi.fn(async () => ({ totalDocs: 3 })),
  findByID: vi.fn(async () => ({ id: 4, _status: "published", slug: "edutec", area: { id: 2, sigla: "educacao" } })),
  update: vi.fn(async () => ({ id: 4 })),
  create: vi.fn(),
};
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => payload }));

const { salvarProgramaCatalogoCrm } = await import("./acoesCatalogo");

const fetchMock = vi.fn(async () => ({ ok: true }));
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("PAYLOAD_PUBLIC_FRONT_URL", "https://site.test");
  vi.stubEnv("REVALIDATE_SECRET", "s");
});
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Publicar programa (Server Action)", () => {
  it("revalida /programas/edutec no site", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue({ id: 1, administrador: false, telas: ["crm.programas"] });
    const pagina = paginaVazia();
    Object.assign(pagina, { heroTitulo: "T", heroSubtitulo: "S", heroImagemCaminho: "/img/x.webp" });
    Object.assign(pagina.cartao, { nome: "N", tagline: "C", descricaoMenu: "M", descricaoMapa: "P" });
    const r = await salvarProgramaCatalogoCrm(
      "4",
      {
        sigla: "EDUTEC",
        nomeCompleto: "Educação",
        areaId: "2",
        cargaHorariaTotal: "80 horas",
        textos: { visaoGeral: "Texto." },
        eixos: [{ titulo: "E", descricao: "D" }],
        diferenciais: [],
        resultados: [],
        pagina,
      },
      true,
    );
    expect(r).toEqual({ ok: true, id: "4" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://site.test/api/revalidate",
      expect.objectContaining({ body: JSON.stringify({ path: "/programas/edutec" }) }),
    );
  });
});
