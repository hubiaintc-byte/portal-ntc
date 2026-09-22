import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Gates das Server Actions de Conteúdos editoriais.
 *
 * Server Actions são endpoints públicos: sem a guarda, qualquer um com a URL
 * criaria registros `media` (arquivo no Supabase Storage), publicaria e
 * apagaria conteúdo. E como toda escrita chama a Local API com
 * `overrideAccess: true`, o `access: editorInstitucional` declarado em
 * `Conteudos.ts` nunca é consultado — o perfil tem de ser checado aqui
 * (spec §6.4: escrevem `super-admin` e `editor-institucional`;
 * `editor-eventos` vê a lista e não edita).
 *
 * Mesmo padrão de mock de acoesCrm.test.ts — `vi.mock` no topo (hoistado
 * pelo Vitest) troca a Local API, a autenticação e o cache do Next antes de
 * acoes.ts resolver seus imports.
 */
const create = vi.fn();
const update = vi.fn();
const remover = vi.fn();
const find = vi.fn();
vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, find, findByID: vi.fn(), delete: remover }),
}));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioCms: obterUsuarioCmsMock,
  obterUsuarioAutenticado: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { enviarMidiaConteudo, excluirConteudo, listarConteudos, publicarConteudo } =
  await import("./acoes");

const usuarioFalso = { id: "5", nome: "Ana Editora", perfil: "super-admin" };
const editorInstitucional = { id: "6", nome: "Rui Editor", perfil: "editor-institucional" };
const editorEventos = { id: "7", nome: "Iara Eventos", perfil: "editor-eventos" };

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

describe("gate de perfil das escritas de conteúdo", () => {
  it("editor-eventos não publica nem exclui — nada chega à Local API", async () => {
    obterUsuarioCmsMock.mockResolvedValue(editorEventos);

    const publicacao = await publicarConteudo("12");
    const exclusao = await excluirConteudo("12");

    expect(publicacao).toEqual({ ok: false, erro: "Você não tem permissão para esta ação." });
    expect(exclusao).toEqual({ ok: false, erro: "Você não tem permissão para esta ação." });
    expect(update).not.toHaveBeenCalled();
    expect(remover).not.toHaveBeenCalled();
  });

  it("editor-eventos não envia mídia", async () => {
    obterUsuarioCmsMock.mockResolvedValue(editorEventos);

    const arquivo = new File([new Uint8Array([1, 2, 3])], "capa.png", { type: "image/png" });
    const r = await enviarMidiaConteudo("12", "imagemDestaque", formDataCom(arquivo));

    expect(r.resultado.ok).toBe(false);
    expect(r.conteudo).toBeNull();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("editor-institucional publica", async () => {
    obterUsuarioCmsMock.mockResolvedValue(editorInstitucional);
    update.mockResolvedValue({ id: 12 });

    const r = await publicarConteudo("12");

    expect(r.ok).toBe(true);
    expect(update).toHaveBeenCalledOnce();
  });

  it("editor-eventos continua vendo a lista (spec §6.4)", async () => {
    obterUsuarioCmsMock.mockResolvedValue(editorEventos);
    find.mockResolvedValue({
      docs: [{ id: 3, titulo: "Nota técnica", categoria: "nota-tecnica", _status: "published" }],
    });

    const lista = await listarConteudos();

    expect(lista).toHaveLength(1);
    expect(lista[0]?.titulo).toBe("Nota técnica");
  });
});
