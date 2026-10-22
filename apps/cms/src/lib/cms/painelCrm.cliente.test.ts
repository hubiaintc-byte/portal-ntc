import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { listarClientesOpcoesCrm, listarLeadsOpcoesCrm, obterClienteCrm } =
  await import("./painelCrm");

/**
 * Detalhe do cliente para quem tem a tela Clientes sem Dashboard/Leads
 * (spec §3.8): os negócios saem só com o nome do contato e o estágio —
 * nada de e-mail, telefone ou a mensagem original do lead chega ao navegador.
 */

const CLIENTE = { id: 3, orgao: "SME Teste", sigla: "SME", contatos: [], responsavel: null };

const LEAD_COMPLETO = {
  id: 7,
  nome: "Ana Souza",
  email: "ana@sme.gov.br",
  telefone: "61999990000",
  instituicao: "SME Teste",
  cargo: "Diretora",
  detalhesProposta: {
    programa: { id: 1, sigla: "EDUTEC" },
    participantesEstimados: 300,
    mensagem: "Mensagem privada",
  },
  estagio: "em-contato",
  perdido: false,
  motivoPerda: null,
  cliente: { id: 3, orgao: "SME Teste" },
  responsavel: null,
  valorEstimado: 1000,
  origemEntrada: "site",
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-02T12:00:00.000Z",
};

function payloadFalso() {
  const find = vi.fn(
    async ({ collection, select }: { collection: string; select?: Record<string, unknown> }) => {
      if (collection !== "leads") return { docs: [] };
      // Simula o `select` do Payload: só os campos pedidos voltam.
      const doc: Record<string, unknown> = { id: LEAD_COMPLETO.id };
      for (const [campo, valor] of Object.entries(LEAD_COMPLETO)) {
        if (select === undefined || select[campo] !== undefined) doc[campo] = valor;
      }
      return { docs: [doc] };
    },
  );
  obterPayloadMock.mockResolvedValue({
    findByID: vi.fn(async () => CLIENTE),
    find,
    count: vi.fn(async () => ({ totalDocs: 0 })),
  });
  return { find };
}

afterEach(() => vi.clearAllMocks());

describe("obterClienteCrm — negócios", () => {
  it("negociosMinimos: devolve só id, nome do contato, estágio e perdido", async () => {
    const { find } = payloadFalso();
    const c = await obterClienteCrm("3", { negociosMinimos: true });
    expect(c?.negociosMinimos).toBe(true);
    expect(c?.negocios).toEqual([
      { id: "7", nome: "Ana Souza", estagio: "em-contato", perdido: false },
    ]);
    const negocio = c?.negocios[0];
    expect(negocio).not.toHaveProperty("email");
    expect(negocio).not.toHaveProperty("telefone");
    expect(negocio).not.toHaveProperty("mensagem");
    // E nem pede ao banco os campos pessoais.
    const chamadaLeads = find.mock.calls.find(([a]) => a.collection === "leads")![0];
    expect(chamadaLeads.select).not.toHaveProperty("email");
    expect(chamadaLeads.select).not.toHaveProperty("telefone");
    expect(chamadaLeads.select).not.toHaveProperty("detalhesProposta");
  });

  it("sem a opção, segue devolvendo o resumo completo do lead", async () => {
    payloadFalso();
    const c = await obterClienteCrm("3");
    expect(c?.negociosMinimos).toBe(false);
    expect(c?.negocios[0]).toMatchObject({ id: "7", nome: "Ana Souza", email: "ana@sme.gov.br" });
  });
});

describe("dados de apoio (spec §3.3)", () => {
  it("listarClientesOpcoesCrm devolve só id, órgão e sigla", async () => {
    const find = vi.fn(async () => ({
      docs: [{ id: 3, orgao: "SME Teste", sigla: "SME", cnpj: "x", email: "y" }],
    }));
    obterPayloadMock.mockResolvedValue({ find });
    expect(await listarClientesOpcoesCrm()).toEqual([
      { id: "3", orgao: "SME Teste", sigla: "SME" },
    ]);
    expect((find.mock.calls[0] as unknown as [unknown])[0]).toMatchObject({
      collection: "clientes-crm",
      select: { orgao: true, sigla: true },
    });
  });

  it("listarLeadsOpcoesCrm devolve só o necessário ao wizard, sem e-mail nem mensagem", async () => {
    const find = vi.fn(async () => ({ docs: [LEAD_COMPLETO] }));
    obterPayloadMock.mockResolvedValue({ find });
    expect(await listarLeadsOpcoesCrm()).toEqual([
      {
        id: "7",
        nome: "Ana Souza",
        instituicao: "SME Teste",
        clienteId: "3",
        programaSigla: "EDUTEC",
      },
    ]);
    const args = (find.mock.calls[0] as unknown as [{ select: Record<string, unknown> }])[0];
    expect(args.select).not.toHaveProperty("email");
    expect(args.select).not.toHaveProperty("telefone");
  });
});
