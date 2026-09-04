import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Cobre a corrente inteira do save de oportunidade: sessão do painel →
 * Server Action → Local API. O defeito que este teste tranca é a sessão ser
 * validada e descartada, deixando `req.user` nulo no hook que grava o
 * histórico de estágio — toda transição sairia com ator "sistema".
 *
 * Mesmo padrão de mock de painelCrmEscrita.versao.test.ts: `vi.mock` no topo
 * (hoistado pelo Vitest) troca a Local API, a autenticação e o cache do Next
 * antes de acoesCrm.ts resolver seus imports.
 */
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const obterUsuarioAutenticadoMock = vi.fn();
vi.mock("@/lib/cms/autenticacao", () => ({
  obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
  obterUsuarioCms: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { salvarOportunidadeCrm } = await import("./acoesCrm");

const usuarioFalso = {
  id: 5,
  collection: "users",
  nome: "Ana Diretora",
  perfil: "super-admin",
  email: "ana@institutontc.com.br",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const dadosBase = {
  cliente: "3",
  programa: "2",
  modulos: [],
  eventos: [],
  uf: "SP",
  origem: "indicacao",
  quantidade: "80",
  modalidade: "Online",
  valor: "104400",
  probabilidade: "70",
  estagio: "proposta-em-elaboracao",
  situacao: "ativa",
  dataAbertura: "2026-09-01",
  dataPrevFechamento: "",
  proximaAcao: "Enviar proposta",
  followup: "2026-09-10",
  responsavel: "1",
  observacoes: "",
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

describe("salvarOportunidadeCrm — usuário da sessão chega à Local API", () => {
  it("repassa o usuário da sessão ao criar", async () => {
    const { create } = montarPayloadFalso();
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);

    const resultado = await salvarOportunidadeCrm(null, dadosBase);

    expect(resultado.ok).toBe(true);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ user: usuarioFalso }));
  });

  it("repassa o usuário da sessão ao atualizar", async () => {
    const { update } = montarPayloadFalso();
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);

    const resultado = await salvarOportunidadeCrm("7", dadosBase);

    expect(resultado.ok).toBe(true);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: "7", user: usuarioFalso }));
  });

  it("recusa sem sessão, antes de tocar a Local API", async () => {
    const { create, update } = montarPayloadFalso();
    obterUsuarioAutenticadoMock.mockResolvedValue(null);

    const resultado = await salvarOportunidadeCrm(null, dadosBase);

    expect(resultado).toEqual({ ok: false, erro: "Sessão expirada. Entre novamente." });
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
