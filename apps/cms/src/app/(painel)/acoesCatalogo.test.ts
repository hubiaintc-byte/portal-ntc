import { afterEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
// As variantes com tela reproduzem `autenticacao.ts` sobre os mocks de
// sessão, com `temTela`/`acessoDoUsuario` reais — a regra é exercitada de verdade.
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temTela, acessoDoUsuario } = await import("@/lib/cms/telas");
  const comTela =
    (obter: () => Promise<{ administrador?: boolean; telas?: string[] } | null>) =>
    async (telas: Parameters<typeof temTela>[1]) => {
      const u = await obter();
      return u && temTela(acessoDoUsuario(u), telas) ? u : null;
    };
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComTela: comTela(obterUsuarioCmsMock),
    obterUsuarioAutenticadoComTela: comTela(obterUsuarioAutenticadoMock),
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
    const u = { id: 5, administrador: false, telas: ["crm.modulos"] };
    obterUsuarioAutenticadoMock.mockResolvedValue(u);
    await acoes.excluirModuloCatalogoCrm("9");
    expect(escrita.excluirModulo).toHaveBeenCalledWith("9", u);
  });
});

describe("acoesCatalogo por tela", () => {
  const dadosM = { programaId: "", numero: "", titulo: "", ementa: "", cargaHoraria: "", tituloComercial: "", valor: "", replay: "", certificacao: "" };
  const dadosP = { sigla: "", nomeCompleto: "", areaId: "", cargaHorariaTotal: "", textos: {}, eixos: [], diferenciais: [], resultados: [] };
  const com = (...telas: string[]) => ({ id: 1, administrador: false, telas });

  it("crm.modulos sem crm.programas escreve módulo, não programa", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("crm.modulos"));
    expect((await acoes.salvarModuloCatalogoCrm(null, dadosM)).ok).toBe(true);
    expect(await acoes.excluirModuloCatalogoCrm("1")).toEqual({ ok: true });
    expect(await acoes.salvarProgramaCatalogoCrm(null, dadosP, false)).toEqual(RECUSADO);
    expect(await acoes.excluirProgramaCatalogoCrm("1")).toEqual(RECUSADO);
    expect(escrita.salvarPrograma).not.toHaveBeenCalled();
    expect(escrita.excluirPrograma).not.toHaveBeenCalled();
  });

  it("crm.programas escreve programa e módulo (o detalhe do programa cria módulo)", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("crm.programas"));
    expect((await acoes.salvarProgramaCatalogoCrm(null, dadosP, false)).ok).toBe(true);
    expect((await acoes.salvarModuloCatalogoCrm(null, dadosM)).ok).toBe(true);
  });

  it("administrador escreve; quem só tem outra tela não escreve", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue({ id: 1, administrador: true, telas: [] });
    expect((await acoes.salvarModuloCatalogoCrm(null, dadosM)).ok).toBe(true);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("crm.propostas", "site.eventos"));
    expect(await acoes.salvarModuloCatalogoCrm(null, dadosM)).toEqual(RECUSADO);
    expect(await acoes.excluirProgramaCatalogoCrm("1")).toEqual(RECUSADO);
    expect(escrita.salvarModulo).toHaveBeenCalledTimes(1);
    expect(escrita.excluirPrograma).not.toHaveBeenCalled();
  });

  it("leituras do detalhe: crm.programas, crm.modulos ou crm.propostas; outra tela não", async () => {
    for (const t of ["crm.programas", "crm.modulos", "crm.propostas"]) {
      obterUsuarioCmsMock.mockResolvedValue(com(t));
      await acoes.carregarProgramaCatalogoCrm("1");
      await acoes.carregarModuloCatalogoCrm("1");
    }
    expect(leitura.obterProgramaCatalogo).toHaveBeenCalledTimes(3);
    expect(leitura.obterModuloCatalogo).toHaveBeenCalledTimes(3);
    obterUsuarioCmsMock.mockResolvedValue(com("crm.leads", "site.painel"));
    expect(await acoes.carregarProgramaCatalogoCrm("1")).toBeNull();
    expect(await acoes.carregarModuloCatalogoCrm("1")).toBeNull();
    expect(leitura.obterProgramaCatalogo).toHaveBeenCalledTimes(3);
  });
});
