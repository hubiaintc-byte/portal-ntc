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
  // Como `UsuarioCms`, o resumo carrega o `acesso` já normalizado.
  const comTelaResumo = (telas: Parameters<typeof temTela>[1]) =>
    comTela(obterUsuarioCmsMock)(telas).then((u) => (u ? { ...u, acesso: acessoDoUsuario(u) } : null));
  return {
    obterUsuarioCms: obterUsuarioCmsMock,
    obterUsuarioAutenticado: obterUsuarioAutenticadoMock,
    obterUsuarioCmsComTela: comTelaResumo,
    obterUsuarioAutenticadoComTela: comTela(obterUsuarioAutenticadoMock),
  };
});

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/**
 * agendarEventoCrm/apagarLeadCrm chamam funções de painelCrmEscrita.ts que
 * escrevem via `executarEmTransacao` (transação real do Payload — não dá
 * para exercitar contra o payload falso deste arquivo). Mesmo padrão de
 * painelCrmEscrita.evento.test.ts: mocka o helper para só invocar `fn` com
 * um req de mentira, preservando o usuário repassado como segundo argumento.
 */
const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const { moverLeadCrm, salvarClienteCrm, apagarClienteCrm, carregarClienteCrm, carregarLeadCrm, salvarLeadCrm, vincularClienteCrm, marcarEventoRealizadoCrm, adicionarNotaCrm, agendarEventoCrm, apagarLeadCrm, restaurarConteudoPropostaCrm, salvarSecaoConteudoPropostaCrm } = await import("./acoesCrm");
type DadosClienteCrm = Parameters<typeof salvarClienteCrm>[1];
type DadosEvento = Parameters<typeof agendarEventoCrm>[1];

const usuarioFalso = { id: "5", nome: "Ana Diretora", administrador: true, telas: [] };

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
  const findByID = vi.fn(async () => ({ id: 7, cliente: 3 }));
  const count = vi.fn(async () => ({ totalDocs: 0 }));
  obterPayloadMock.mockResolvedValue({
    find: vi.fn().mockResolvedValue({ docs: [] }),
    create,
    update,
    findByID,
    count,
  });
  return { create, update, findByID, count };
}

const dadosEventoBase: DadosEvento = {
  titulo: "Curso de Gestão Escolar",
  dataInicio: "2026-10-01",
  dataFim: "",
  modalidade: "presencial",
  local: "Auditório central",
  moduloCatalogo: "",
  observacoes: "",
};

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

    expect(resultado).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe("moverLeadCrm", () => {
  it("sem sessão recusa sem tocar a Local API", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    const { update } = montarPayloadFalso();
    expect(await moverLeadCrm("7", "em-contato")).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(update).not.toHaveBeenCalled();
  });

  it("repassa o usuário da sessão à Local API (autor da transição na linha do tempo)", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);
    const { update } = montarPayloadFalso();
    expect(await moverLeadCrm("7", "em-contato")).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: "leads", user: usuarioFalso }));
  });
});

describe("agendarEventoCrm", () => {
  it("sem sessão recusa sem tocar a Local API", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    const { create } = montarPayloadFalso();
    expect(await agendarEventoCrm("7", dadosEventoBase)).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(create).not.toHaveBeenCalled();
    expect(executarEmTransacaoMock).not.toHaveBeenCalled();
  });

  it("repassa o usuário da sessão para a escrita transacional do evento", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);
    montarPayloadFalso();
    const resultado = await agendarEventoCrm("7", dadosEventoBase);
    expect(resultado).toEqual({ ok: true });
    expect(executarEmTransacaoMock).toHaveBeenCalledWith(expect.anything(), usuarioFalso, expect.any(Function));
  });
});

describe("apagarLeadCrm", () => {
  it("sem sessão recusa sem tocar a Local API", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    montarPayloadFalso();
    expect(await apagarLeadCrm("7", "Ana Contato")).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(executarEmTransacaoMock).not.toHaveBeenCalled();
  });
});

describe("restaurarConteudoPropostaCrm", () => {
  it("sem sessão recusa sem tocar o banco", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    montarPayloadFalso();
    expect(await restaurarConteudoPropostaCrm("9", "tudo")).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });
});

describe("salvarSecaoConteudoPropostaCrm", () => {
  it("sem sessão recusa sem tocar o banco", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(null);
    montarPayloadFalso();
    expect(
      await salvarSecaoConteudoPropostaCrm("9", "apresentacao", { tipo: "texto", texto: "Oi." }),
    ).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("com sessão grava o campo da seção, com o usuário como autor", async () => {
    obterUsuarioAutenticadoMock.mockResolvedValue(usuarioFalso);
    const { update } = montarPayloadFalso();
    expect(
      await salvarSecaoConteudoPropostaCrm("9", "fechamento", { tipo: "texto", texto: "Fecho." }),
    ).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "propostas", id: "9", user: usuarioFalso }),
    );
    const data = (update.mock.calls[0]![0] as { data: Record<string, unknown> }).data;
    expect(Object.keys(data)).toEqual(["textoFechamento"]);
  });
});

const RECUSA = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };

function logar(usuario: { id: string; nome: string; administrador: boolean; telas: string[] }) {
  obterUsuarioCmsMock.mockResolvedValue(usuario);
  obterUsuarioAutenticadoMock.mockResolvedValue(usuario);
}

describe("acoesCrm — permissão por tela", () => {
  it("usuário sem telas do CRM: recusa sem tocar a Local API", async () => {
    logar({ id: "8", nome: "Editor", administrador: false, telas: ["site.eventos"] });
    expect(await moverLeadCrm("1", "em-contato")).toEqual(RECUSA);
    expect(await salvarClienteCrm(null, dadosBase)).toEqual(RECUSA);
    expect(await apagarLeadCrm("1", "Fulano")).toEqual(RECUSA);
    expect(obterPayloadMock).not.toHaveBeenCalled();
  });

  it("secretaria (leads + propostas): move lead e salva proposta; cliente é recusado", async () => {
    const { update } = montarPayloadFalso();
    logar({ id: "9", nome: "Secretaria", administrador: false, telas: ["crm.leads", "crm.propostas"] });
    expect((await moverLeadCrm("1", "em-contato")).ok).toBe(true);
    update.mockClear();
    expect(await salvarClienteCrm(null, dadosBase)).toEqual(RECUSA);
    expect(await apagarClienteCrm("3")).toEqual(RECUSA);
    expect(await carregarClienteCrm("3")).toBeNull();
    expect(update).not.toHaveBeenCalled();
    // proposta: passa pela guarda (o resultado do restante não importa aqui)
    obterPayloadMock.mockClear();
    await salvarSecaoConteudoPropostaCrm("9", "fechamento", { tipo: "texto", texto: "x" });
    expect(obterPayloadMock).toHaveBeenCalled();
  });

  it("só Clientes: carregarClienteCrm lê os negócios sem os campos pessoais do lead (§3.8)", async () => {
    montarPayloadFalso();
    logar({ id: "9", nome: "Clientes", administrador: false, telas: ["crm.clientes"] });
    await carregarClienteCrm("3");
    const payload = await obterPayloadMock.mock.results[0]!.value;
    const chamadaLeads = payload.find.mock.calls.find(([a]: [{ collection: string }]) => a.collection === "leads")[0];
    expect(chamadaLeads.select).not.toHaveProperty("email");
  });

  it("Clientes e Leads: carregarClienteCrm lê os negócios completos", async () => {
    montarPayloadFalso();
    logar({ id: "9", nome: "Comercial", administrador: false, telas: ["crm.clientes", "crm.leads"] });
    await carregarClienteCrm("3");
    const payload = await obterPayloadMock.mock.results[0]!.value;
    const chamadaLeads = payload.find.mock.calls.find(([a]: [{ collection: string }]) => a.collection === "leads")[0];
    expect(chamadaLeads.select).toHaveProperty("email");
  });

  it("só Leads: salvarLeadCrm com cliente novo e vincularClienteCrm passam (§3.7)", async () => {
    montarPayloadFalso();
    logar({ id: "9", nome: "Leads", administrador: false, telas: ["crm.leads"] });
    const guarda = await vincularClienteCrm("1", "3");
    expect(guarda).not.toEqual(RECUSA);
    const r = await salvarLeadCrm(null, {
      nome: "Fulano", email: "f@x.gov.br", telefone: "", cargo: "", instituicao: "", esfera: "", programa: "",
      modalidade: "", participantesEstimados: "", mensagem: "", cliente: "", novoClienteOrgao: "SME Nova",
      responsavel: "", valorEstimado: "", dataPrevistaEvento: "", observacoes: "",
    });
    expect(r).not.toEqual(RECUSA);
  });

  it("só Clientes: carregarLeadCrm null, evento realizado ok, agendar recusado, nota ok", async () => {
    montarPayloadFalso();
    logar({ id: "10", nome: "Clientes", administrador: false, telas: ["crm.clientes"] });
    expect(await carregarLeadCrm("1")).toBeNull();
    expect(await agendarEventoCrm("1", dadosEventoBase)).toEqual(RECUSA);
    expect(await marcarEventoRealizadoCrm("4")).not.toEqual(RECUSA);
    expect(await adicionarNotaCrm("3", null, "nota")).not.toEqual(RECUSA);
    expect(await moverLeadCrm("1", "em-contato")).toEqual(RECUSA);
  });
});
