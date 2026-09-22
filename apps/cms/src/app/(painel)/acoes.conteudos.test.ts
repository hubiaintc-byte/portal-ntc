import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Gate de sessão da Server Action de upload de mídia do conteúdo.
 *
 * Server Actions são endpoints públicos: sem a guarda, qualquer um com a URL
 * criaria registros `media` (arquivo no Supabase Storage) e apontaria campos
 * de qualquer conteúdo. Mesmo padrão de mock de acoesCrm.test.ts — `vi.mock`
 * no topo (hoistado pelo Vitest) troca a Local API, a autenticação e o cache
 * do Next antes de acoes.ts resolver seus imports.
 */
const create = vi.fn();
const update = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, find: vi.fn(), findByID: vi.fn(), delete: vi.fn() }),
}));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { enviarMidiaConteudo } = await import("./acoes");

const usuarioFalso = { id: "5", nome: "Ana Editora", perfil: "super-admin" };

function formDataCom(arquivo: File | string): FormData {
  const fd = new FormData();
  fd.append("arquivo", arquivo);
  return fd;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("enviarMidiaConteudo (Server Action)", () => {
  it("sem sessão, recusa antes de tocar a Local API", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);

    const arquivo = new File([new Uint8Array([1, 2, 3])], "capa.png", { type: "image/png" });
    const r = await enviarMidiaConteudo("12", "imagemDestaque", formDataCom(arquivo));

    expect(r.resultado.ok).toBe(false);
    expect(r.resultado.erro).toMatch(/sessão/i);
    expect(r.conteudo).toBeNull();
    // Nenhuma Media criada, nenhum conteúdo tocado.
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("com sessão, recusa um campo que não seja um File antes de qualquer escrita", async () => {
    obterUsuarioCmsMock.mockResolvedValue(usuarioFalso);

    const r = await enviarMidiaConteudo("12", "imagemDestaque", formDataCom("não sou um arquivo"));

    expect(r.resultado).toEqual({ ok: false, erro: "Nenhum arquivo selecionado." });
    expect(r.conteudo).toBeNull();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("com sessão, recusa arquivo de tamanho zero antes de qualquer escrita", async () => {
    obterUsuarioCmsMock.mockResolvedValue(usuarioFalso);

    const vazio = new File([], "vazio.png", { type: "image/png" });
    const r = await enviarMidiaConteudo("12", "imagemDestaque", formDataCom(vazio));

    expect(r.resultado).toEqual({ ok: false, erro: "Nenhum arquivo selecionado." });
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
