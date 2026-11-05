import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { mesclarEventos, lerLivroFinanceiro, recortarLivroPorTela, lerHistoricoFin } = await import("./leitura");

const fin = { id: 5, eventoComercial: 12, nome: "Reserva", dataInicio: "2026-10-01", dataFim: "2026-10-03", modalidade: "Presencial", cliente: "Antigo", refContratual: "" };
const crm = {
  id: 12,
  titulo: "Turma EDUTEC",
  dataInicio: "2026-11-02T00:00:00.000Z",
  dataFim: null,
  modalidade: "online" as const,
  local: "Brasília",
  cliente: { orgao: "SME Teste" },
  status: "agendado" as const,
  contratoEmpenho: { numero: "2026NE1" },
};

const um = <T,>(l: T[]): T => {
  const x = l[0];
  if (x === undefined) throw new Error("lista vazia");
  return x;
};

describe("mesclarEventos", () => {
  it("evento do CRM sem dataFim usa a do financeiro", () => {
    const e = um(mesclarEventos([fin], [crm]));
    expect(e.dataInicio).toBe("2026-11-02");
    expect(e.dataFim).toBe("2026-10-03");
    expect(e.id).toBe("5");
    expect(e.origem).toBe("crm");
    expect(e.cliente).toBe("SME Teste");
  });
  it("modalidade online do CRM vira \"Online ao vivo\"", () => {
    expect(um(mesclarEventos([fin], [crm])).modalidade).toBe("Online ao vivo");
    expect(um(mesclarEventos([fin], [{ ...crm, modalidade: "hibrido" }])).modalidade).toBe("Híbrido");
  });
  it("evento cancelado no CRM fica com canceladoNoCrm", () => {
    expect(um(mesclarEventos([fin], [{ ...crm, status: "cancelado" }])).canceladoNoCrm).toBe(true);
    expect(um(mesclarEventos([fin], [crm])).canceladoNoCrm).toBe(false);
  });
  it("evento comercial sem cadastro financeiro aparece pendente com id crm-<id>", () => {
    const r = mesclarEventos([], [crm]);
    expect(r).toHaveLength(1);
    expect(um(r)).toMatchObject({ id: "crm-12", cadastroPendente: true, origem: "crm", eventoComercialId: "12", nome: "Turma EDUTEC", cargaHoraria: 0 });
  });
  it("refContratual cai no número do contrato", () => {
    expect(um(mesclarEventos([fin], [crm])).refContratual).toBe("2026NE1");
    expect(um(mesclarEventos([{ ...fin, refContratual: "X" }], [crm])).refContratual).toBe("X");
  });
  it("camposDoCrm lista só os campos que o CRM preencheu", () => {
    expect(um(mesclarEventos([fin], [crm])).camposDoCrm).toEqual(["nome", "modalidade", "local", "dataInicio", "cliente"]);
    const semNada = { id: 13, titulo: "", dataInicio: null, dataFim: null, modalidade: null, local: "", cliente: null, status: "agendado" as const };
    expect(um(mesclarEventos([], [semNada])).camposDoCrm).toEqual([]);
    expect(um(mesclarEventos([{ id: 9, nome: "Próprio" }], [])).camposDoCrm).toEqual([]);
  });
  it("evento só do financeiro tem origem financeiro", () => {
    const r = mesclarEventos([{ id: 9, nome: "Próprio" }], []);
    expect(um(r)).toMatchObject({ origem: "financeiro", eventoComercialId: null, cadastroPendente: false });
  });
});

function payloadFalso(extra: Record<string, Record<string, unknown>[]> = {}) {
  const dados: Record<string, Record<string, unknown>[]> = {
    "fin-eventos": [{ id: 1, nome: "E" }],
    "fin-receitas": [{ id: 3, evento: 1, valorUnit: 100 }],
    "fin-faturamentos": [{ id: 4, receita: 3, conta: 2, valorFaturado: 100 }],
    "fin-custos": [{ id: 6, evento: 1 }],
    "fin-pagamentos": [{ id: 7, custo: 6, valor: 50 }],
    "fin-contas": [{ id: 10, nome: "B" }, { id: 2, nome: "A" }],
    "eventos-comerciais": [],
    ...extra,
  };
  const find = vi.fn(async ({ collection }: { collection: string }) => ({ docs: dados[collection] ?? [] }));
  obterPayloadMock.mockResolvedValue({ find });
  return { find };
}

describe("lerLivroFinanceiro", () => {
  it("faturamento referencia receita por id string e herda o evento", async () => {
    payloadFalso();
    const l = await lerLivroFinanceiro();
    expect(um(l.faturamentos)).toMatchObject({ receitaId: "3", eventoId: "1", contaId: "2" });
    expect(um(l.pagamentos)).toMatchObject({ custoId: "6", eventoId: "1" });
    expect(um(l.receitas).eventoId).toBe("1");
  });
  it("quitado gravado passa direto e ausente vira false", async () => {
    payloadFalso({ "fin-faturamentos": [{ id: 4, receita: 3, quitado: true }, { id: 5, receita: 3 }] });
    const l = await lerLivroFinanceiro();
    expect(l.faturamentos.map((f) => f.quitado)).toEqual([true, false]);
  });
  it("contas ordenadas por id numérico crescente", async () => {
    payloadFalso();
    expect((await lerLivroFinanceiro()).contas.map((c) => c.id)).toEqual(["2", "10"]);
  });
  it("lê sem paginação e com depth 0 (eventos comerciais com depth 1)", async () => {
    const { find } = payloadFalso();
    await lerLivroFinanceiro();
    const chamadas = find.mock.calls.map((c) => c[0] as Record<string, unknown>);
    expect(chamadas.every((c) => c.pagination === false)).toBe(true);
    expect(chamadas.find((c) => c.collection === "eventos-comerciais")?.depth).toBe(1);
    expect(chamadas.find((c) => c.collection === "fin-receitas")?.depth).toBe(0);
  });
});

describe("recortarLivroPorTela", () => {
  const livro = {
    eventos: [{ id: "1" }], contas: [{ id: "1" }], receitas: [{ id: "1" }], faturamentos: [{ id: "1" }],
    custos: [{ id: "1" }], pagamentos: [{ id: "1" }],
  } as never as Parameters<typeof recortarLivroPorTela>[0];
  it("quem só tem fin.receber não recebe custos nem pagamentos", () => {
    const r = recortarLivroPorTela(livro, { administrador: false, telas: ["fin.receber"] });
    expect(r.custos).toEqual([]);
    expect(r.pagamentos).toEqual([]);
    expect(r.receitas).toHaveLength(1);
    expect(r.eventos).toHaveLength(1);
    expect(r.contas).toHaveLength(1);
  });
  it("quem só tem fin.pagar não recebe receitas nem faturamentos", () => {
    const r = recortarLivroPorTela(livro, { administrador: false, telas: ["fin.pagar"] });
    expect(r.receitas).toEqual([]);
    expect(r.faturamentos).toEqual([]);
    expect(r.custos).toHaveLength(1);
  });
  it("visão executiva, eventos e administrador recebem tudo", () => {
    for (const a of [{ administrador: true, telas: [] }, { administrador: false, telas: ["fin.eventos" as const] }, { administrador: false, telas: ["fin.visao-executiva" as const] }])
      expect(recortarLivroPorTela(livro, a)).toBe(livro);
  });
});

describe("lerHistoricoFin", () => {
  it("resolve o nome e lista as mudanças", async () => {
    const find = vi.fn(async () => ({
      docs: [{ createdAt: "2026-11-04T10:00:00Z", descricao: "Receita RC-0003 alterada", usuario: { id: 1, nome: "Ana" }, metadata: { mudancas: { qtde: { antes: 1, depois: 2 } } } }],
    }));
    obterPayloadMock.mockResolvedValue({ find });
    const h = await lerHistoricoFin("fin-receitas", "3");
    expect(h).toEqual([{ quando: "2026-11-04T10:00:00Z", quem: "Ana", acao: "Receita RC-0003 alterada", mudancas: [{ campo: "qtde", antes: 1, depois: 2 }] }]);
    expect((find.mock.calls[0] as unknown as [{ sort: string }])[0].sort).toBe("-createdAt");
  });
});
