import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Cobre a corrente inteira do save de cliente: sessão do painel →
 * Server Action → Local API. Sem sessão a action recusa antes de tocar a
 * Local API — Server Actions são endpoints públicos.
 *
 * Mesmo padrão de mock de painelCrmEscrita.versao.test.ts: `vi.mock` no topo
 * (hoistado pelo Vitest) troca a Local API, a autenticação e o cache do Next
 * antes de acoesCrm.ts resolver seus imports.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const obterUsuarioCmsMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioCms: obterUsuarioCmsMock,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { salvarClienteCrm } = await import("./acoesCrm");
type DadosClienteCrm = Parameters<typeof salvarClienteCrm>[1];

const usuarioFalso = { id: "5", nome: "Ana Diretora", perfil: "super-admin" };

const dadosBase: DadosClienteCrm = {
  orgao: "SME",
  sigla: "",
  tipo: "",
  municipio: "",
  uf: "SP",
  esfera: "",
  area: "",
  cnpj: "",
  email: "",
  origem: "manual",
  responsavel: "",
  observacoes: "",
  contatos: [],
};

function montarPayloadFalso() {
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, ...data }));
  obterPayloadMock.mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create,
    update,
  });
  return { create, update };
}

afterEach(() => vi.clearAllMocks());

describe("salvarClienteCrm — sessão antes da Local API", () => {
  it("cria o cliente na coleção clientes-crm com sessão válida", async () => {
    const { create } = montarPayloadFalso();
    obterUsuarioCmsMock.mockResolvedValue(usuarioFalso);

    const resultado = await salvarClienteCrm(null, dadosBase);

    expect(resultado.ok).toBe(true);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ collection: "clientes-crm" }));
  });

  it("atualiza o cliente pelo id com sessão válida", async () => {
    const { update } = montarPayloadFalso();
    obterUsuarioCmsMock.mockResolvedValue(usuarioFalso);

    const resultado = await salvarClienteCrm("7", dadosBase);

    expect(resultado.ok).toBe(true);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: "clientes-crm", id: "7" }));
  });

  it("recusa sem sessão, antes de tocar a Local API", async () => {
    const { create, update } = montarPayloadFalso();
    obterUsuarioCmsMock.mockResolvedValue(null);

    const resultado = await salvarClienteCrm(null, dadosBase);

    expect(resultado).toEqual({ ok: false, erro: "Sessão expirada. Entre novamente." });
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
