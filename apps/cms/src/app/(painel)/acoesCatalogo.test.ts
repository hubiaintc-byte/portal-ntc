import { afterEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
// As variantes com perfil reproduzem `autenticacao.ts` sobre os mocks de
// sessão, com o `temPerfil` real — a regra de perfil é exercitada de verdade.
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temPerfil } = await import("@/lib/cms/perfis");
  const comPerfil =
    (obter: () => Promise<{ perfil?: string } | null>) =>
    async (permitidos: Parameters<typeof temPerfil>[1]) => {
      const u = await obter();
      return u && temPerfil(u.perfil, permitidos) ? u : null;
    };
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComPerfil: comPerfil(obterUsuarioCmsMock),
    obterUsuarioAutenticadoComPerfil: comPerfil(obterUsuarioAutenticadoMock),
  };
});
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const escrita = {
  salvarPrograma: vi.fn(async () => ({ ok: true, id: "1" })),
  excluirPrograma: vi.fn(async () => ({ ok: true })),
  salvarModulo: vi.fn(async () => ({ ok: true, id: "2" })),
  excluirModulo: vi.fn(async () => ({ ok: true })),
};
vi.mock("@/lib/cms/catalogoCrmEscrita", () => escrita);
const leitura = { obterProgramaCatalogo: vi.fn(async () => null), obterModuloCatalogo: vi.fn(async () => null) };
vi.mock("@/lib/cms/catalogoCrm", () => leitura);

const acoes = await import("./acoesCatalogo");

const RECUSADO = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };

afterEach(() => vi.clearAllMocks());

describe("acoesCatalogo sem sessão", () => {
  it("recusa as quatro escritas sem tocar a escrita", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    const dadosP = { sigla: "", nomeCompleto: "", areaId: "", cargaHorariaTotal: "", textos: {}, eixos: [], diferenciais: [], resultados: [] };
    const dadosM = { programaId: "", numero: "", titulo: "", ementa: "", cargaHoraria: "", tituloComercial: "", valor: "", replay: "", certificacao: "" };
    expect(await acoes.salvarProgramaCatalogoCrm(null, dadosP, false)).toEqual(RECUSADO);
    expect(await acoes.excluirProgramaCatalogoCrm("1")).toEqual(RECUSADO);
    expect(await acoes.salvarModuloCatalogoCrm(null, dadosM)).toEqual(RECUSADO);
    expect(await acoes.excluirModuloCatalogoCrm("1")).toEqual(RECUSADO);
    for (const f of Object.values(escrita)) expect(f).not.toHaveBeenCalled();
  });
  it("leituras devolvem null sem sessão", async () => {
    obterUsuarioCmsMock.mockResolvedValue(null);
    expect(await acoes.carregarProgramaCatalogoCrm("1")).toBeNull();
    expect(await acoes.carregarModuloCatalogoCrm("1")).toBeNull();
    expect(leitura.obterProgramaCatalogo).not.toHaveBeenCalled();
  });
});

describe("acoesCatalogo com sessão", () => {
  it("repassa o usuário à escrita", async () => {
    const u = { id: 5, perfil: "editor-institucional" };
    obterUsuarioAutenticadoMock.mockResolvedValue(u);
    await acoes.excluirModuloCatalogoCrm("9");
    expect(escrita.excluirModulo).toHaveBeenCalledWith("9", u);
  });
});

describe("acoesCatalogo por perfil", () => {
  const dadosM = { programaId: "", numero: "", titulo: "", ementa: "", cargaHoraria: "", tituloComercial: "", valor: "", replay: "", certificacao: "" };

  it("comercial e institucional escrevem no catálogo", async () => {
    for (const perfil of ["atendimento-comercial", "editor-institucional", "super-admin"]) {
      obterUsuarioAutenticadoMock.mockResolvedValue({ id: 1, perfil });
      await acoes.salvarModuloCatalogoCrm(null, dadosM);
    }
    expect(escrita.salvarModulo).toHaveBeenCalledTimes(3);
  });

  it("editor de eventos não escreve no catálogo", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue({ id: 1, perfil: "editor-eventos" });
    expect(await acoes.salvarModuloCatalogoCrm(null, dadosM)).toEqual(RECUSADO);
    expect(await acoes.excluirProgramaCatalogoCrm("1")).toEqual(RECUSADO);
    for (const f of Object.values(escrita)) expect(f).not.toHaveBeenCalled();
  });
});
