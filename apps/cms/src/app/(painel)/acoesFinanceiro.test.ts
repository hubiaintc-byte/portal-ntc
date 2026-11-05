import { afterEach, describe, expect, it, vi } from "vitest";

const obterUsuarioCmsMock = vi.fn();
const obterUsuarioAutenticadoMock = vi.fn();
// As guardas reproduzem `autenticacao.ts` sobre os mocks de sessão, com
// `temTela`/`acessoDoUsuario` reais — a regra é exercitada de verdade.
vi.mock("@/lib/cms/autenticacao", async () => {
  const { temTela, acessoDoUsuario } = await import("@/lib/cms/telas");
  type U = { administrador?: boolean; telas?: string[] } | null;
  const comTela = (obter: () => Promise<U>) => async (telas: Parameters<typeof temTela>[1]) => {
    const u = await obter();
    return u && temTela(acessoDoUsuario(u), telas) ? u : null;
  };
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComTela: comTela(obterUsuarioCmsMock),
    obterUsuarioAutenticadoComTela: comTela(obterUsuarioAutenticadoMock),
    obterAdministradorAutenticado: async () => {
      const u = (await obterUsuarioAutenticadoMock()) as U;
      return u && acessoDoUsuario(u).administrador ? u : null;
    },
  };
});
const revalidatePathMock = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

const okId = async () => ({ ok: true, id: "1" });
const escrita = {
  salvarEventoFin: vi.fn(okId),
  salvarReceitaFin: vi.fn(okId),
  salvarEtapasFin: vi.fn(okId),
  salvarFaturamentoFin: vi.fn(okId),
  salvarCustoFin: vi.fn(okId),
  salvarPagamentoFin: vi.fn(okId),
  salvarContaFin: vi.fn(okId),
  excluirEventoFin: vi.fn(okId),
  excluirReceitaFin: vi.fn(okId),
  excluirFaturamentoFin: vi.fn(okId),
  excluirCustoFin: vi.fn(okId),
  excluirPagamentoFin: vi.fn(okId),
  excluirContaFin: vi.fn(okId),
};
vi.mock("@/lib/financeiro/escrita", () => escrita);
const lerHistoricoFinMock = vi.fn(async () => []);
vi.mock("@/lib/financeiro/leitura", () => ({ lerHistoricoFin: lerHistoricoFinMock }));

const acoes = await import("./acoesFinanceiro");

const RECUSADO = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };
const com = (...telas: string[]) => ({ id: 1, collection: "users", administrador: false, telas });
const ADMIN = { id: 2, collection: "users", administrador: true, telas: [] };
const TODAS_FIN = com("fin.visao-executiva", "fin.eventos", "fin.receber", "fin.pagar");

const receita = (eventoId: string) => ({ eventoId }) as never;
const custo = (eventoId: string) => ({ eventoId }) as never;

afterEach(() => vi.clearAllMocks());

const exclusoes = () => [
  acoes.excluirEventoFinAcao("1"),
  acoes.excluirReceitaFinAcao("1"),
  acoes.excluirFaturamentoFinAcao("1"),
  acoes.excluirCustoFinAcao("1"),
  acoes.excluirPagamentoFinAcao("1"),
  acoes.excluirContaFinAcao("1"),
];

describe("acoesFinanceiro — exclusão", () => {
  it("excluir exige administrador", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(TODAS_FIN);
    for (const r of await Promise.all(exclusoes())) expect(r).toEqual(RECUSADO);
    for (const [nome, f] of Object.entries(escrita)) if (nome.startsWith("excluir")) expect(f).not.toHaveBeenCalled();
    expect(revalidatePathMock).not.toHaveBeenCalled();

    obterUsuarioAutenticadoMock.mockResolvedValue(ADMIN);
    for (const r of await Promise.all(exclusoes())) expect(r).toEqual({ ok: true, id: "1" });
    expect(escrita.excluirReceitaFin).toHaveBeenCalledWith("1", ADMIN);
    expect(revalidatePathMock).toHaveBeenCalledWith("/financeiro");
  });
});

describe("acoesFinanceiro — telas", () => {
  it("receita corporativa exige fin.receber", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.eventos"));
    expect(await acoes.salvarReceitaFinAcao(null, receita(""))).toEqual(RECUSADO);
    expect(escrita.salvarReceitaFin).not.toHaveBeenCalled();
    expect(await acoes.salvarReceitaFinAcao(null, receita("3"))).toEqual({ ok: true, id: "1" });

    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.receber"));
    expect((await acoes.salvarReceitaFinAcao(null, receita(""))).ok).toBe(true);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.pagar"));
    expect(await acoes.salvarReceitaFinAcao(null, receita("3"))).toEqual(RECUSADO);
  });

  it("despesa corporativa exige fin.pagar", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.eventos"));
    expect(await acoes.salvarCustoFinAcao(null, custo(""))).toEqual(RECUSADO);
    expect((await acoes.salvarCustoFinAcao(null, custo("3"))).ok).toBe(true);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.pagar"));
    expect((await acoes.salvarCustoFinAcao(null, custo(""))).ok).toBe(true);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.receber"));
    expect(await acoes.salvarCustoFinAcao(null, custo("3"))).toEqual(RECUSADO);
  });

  it("evento só com fin.eventos; conta com fin.receber ou fin.pagar", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.receber", "fin.pagar", "fin.visao-executiva"));
    expect(await acoes.salvarEventoFinAcao(null, {} as never)).toEqual(RECUSADO);
    expect((await acoes.salvarContaFinAcao(null, {} as never)).ok).toBe(true);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.eventos"));
    expect((await acoes.salvarEventoFinAcao("crm-12", {} as never)).ok).toBe(true);
    expect(escrita.salvarEventoFin).toHaveBeenCalledWith("crm-12", {}, com("fin.eventos"));
    expect(await acoes.salvarContaFinAcao(null, {} as never)).toEqual(RECUSADO);
  });

  it("etapas, faturamento e pagamento seguem as telas da receita e do custo", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.receber"));
    expect((await acoes.salvarEtapasFinAcao("1", [])).ok).toBe(true);
    expect((await acoes.salvarFaturamentoFinAcao(null, {} as never)).ok).toBe(true);
    expect(await acoes.salvarPagamentoFinAcao(null, {} as never)).toEqual(RECUSADO);
    obterUsuarioAutenticadoMock.mockResolvedValue(com("fin.pagar"));
    expect((await acoes.salvarPagamentoFinAcao(null, {} as never)).ok).toBe(true);
    expect(await acoes.salvarFaturamentoFinAcao(null, {} as never)).toEqual(RECUSADO);
  });

  it("sem sessão recusa tudo sem tocar a escrita", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    expect(await acoes.salvarReceitaFinAcao(null, receita("1"))).toEqual(RECUSADO);
    expect(await acoes.salvarContaFinAcao(null, {} as never)).toEqual(RECUSADO);
    for (const f of Object.values(escrita)) expect(f).not.toHaveBeenCalled();
  });

  it("falha da escrita não revalida", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(ADMIN);
    escrita.salvarContaFin.mockResolvedValueOnce({ ok: false, erro: "x" } as never);
    expect(await acoes.salvarContaFinAcao(null, {} as never)).toEqual({ ok: false, erro: "x" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("acoesFinanceiro — histórico", () => {
  it("carregarHistoricoFinAcao recusa slug fora dos seis", async () => {
    obterUsuarioCmsMock.mockResolvedValue(com("fin.pagar"));
    for (const slug of ["audit-log", "users", "leads", "fin-movimentos", ""]) {
      expect(await acoes.carregarHistoricoFinAcao(slug, "3")).toEqual(RECUSADO);
    }
    expect(lerHistoricoFinMock).not.toHaveBeenCalled();
    expect(await acoes.carregarHistoricoFinAcao("fin-receitas", "003")).toEqual({ ok: true, itens: [] });
    expect(lerHistoricoFinMock).toHaveBeenCalledWith("fin-receitas", "3");
  });

  it("exige uma tela fin.* e id numérico", async () => {
    obterUsuarioCmsMock.mockResolvedValue(com("crm.leads"));
    expect(await acoes.carregarHistoricoFinAcao("fin-contas", "1")).toEqual(RECUSADO);
    obterUsuarioCmsMock.mockResolvedValue(com("fin.visao-executiva"));
    expect(await acoes.carregarHistoricoFinAcao("fin-contas", "abc")).toEqual(RECUSADO);
    expect(lerHistoricoFinMock).not.toHaveBeenCalled();
  });
});

describe("acoesFinanceiro — histórico com falha", () => {
  it("falha na leitura do histórico vira mensagem genérica", async () => {
    obterUsuarioCmsMock.mockResolvedValue(com("fin.receber"));
    lerHistoricoFinMock.mockRejectedValueOnce(new Error("conexão"));
    const erro = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await acoes.carregarHistoricoFinAcao("fin-receitas", "3")).toEqual({
      ok: false,
      erro: "Não foi possível carregar o histórico. Tente novamente.",
    });
    erro.mockRestore();
  });
  it("slug ou id não texto é recusado", async () => {
    obterUsuarioCmsMock.mockResolvedValue(com("fin.receber"));
    expect(await acoes.carregarHistoricoFinAcao(1 as never, "3")).toEqual(RECUSADO);
    expect(await acoes.carregarHistoricoFinAcao("fin-receitas", 3 as never)).toEqual(RECUSADO);
  });
});
