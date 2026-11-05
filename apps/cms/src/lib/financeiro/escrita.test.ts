import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  DadosContaFin,
  DadosCustoFin,
  DadosEventoFin,
  DadosFaturamentoFin,
  DadosPagamentoFin,
  DadosReceitaFin,
} from "@ntc/lib";

vi.mock("server-only", () => ({}));
const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

/** A transação falsa: o mesmo `req` (com o payload simulado) para tudo dentro dela. */
const REQ_TX = { transactionID: "tx-1" } as Record<string, unknown>;
const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) =>
    fn(Object.assign(REQ_TX, { payload, user: usuario })),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const escrita = await import("./escrita");

type Doc = Record<string, unknown> & { id: number };
type Where = Record<string, unknown>;

const COLECOES = [
  "fin-eventos",
  "fin-receitas",
  "fin-faturamentos",
  "fin-custos",
  "fin-pagamentos",
  "fin-contas",
  "eventos-comerciais",
] as const;

const valorDe = (v: unknown): unknown => (v && typeof v === "object" && "id" in v ? (v as { id: unknown }).id : v);

function casa(d: Doc, where: Where | undefined): boolean {
  if (!where) return true;
  return Object.entries(where).every(([campo, cond]) => {
    if (campo === "and") return (cond as Where[]).every((w) => casa(d, w));
    const c = cond as { equals?: unknown; in?: unknown[] };
    const v = valorDe(d[campo]);
    if ("equals" in c) return String(v) === String(c.equals);
    if (c.in) return c.in.map(String).includes(String(v));
    return true;
  });
}

/** Banco em memória: o que a "tela" leu antes pode mudar até a transação reler. */
function bancoFalso(inicial: Partial<Record<(typeof COLECOES)[number], Doc[]>> = {}) {
  const db: Record<string, Doc[]> = Object.fromEntries(COLECOES.map((c) => [c, structuredClone(inicial[c] ?? [])]));
  let proximo = 500;
  const ops: { op: string; collection: string; id?: unknown; req?: unknown }[] = [];
  const payload = {
    find: vi.fn(async (a: { collection: string; where?: Where; req?: unknown }) => {
      ops.push({ op: "find", collection: a.collection, req: a.req });
      return { docs: (db[a.collection] ?? []).filter((d) => casa(d, a.where)).map((d) => structuredClone(d)) };
    }),
    create: vi.fn(async (a: { collection: string; data: Record<string, unknown>; req?: unknown }) => {
      const doc = { ...a.data, id: proximo++ };
      db[a.collection]?.push(doc);
      ops.push({ op: "create", collection: a.collection, id: doc.id, req: a.req });
      return doc;
    }),
    update: vi.fn(async (a: { collection: string; id: unknown; data: Record<string, unknown>; req?: unknown }) => {
      const lista = db[a.collection] ?? [];
      const i = lista.findIndex((d) => String(d.id) === String(a.id));
      const doc = { ...(lista[i] as Doc), ...a.data };
      lista[i] = doc;
      ops.push({ op: "update", collection: a.collection, id: a.id, req: a.req });
      return doc;
    }),
    delete: vi.fn(async (a: { collection: string; id: unknown; req?: unknown }) => {
      const lista = db[a.collection] ?? [];
      db[a.collection] = lista.filter((d) => String(d.id) !== String(a.id));
      ops.push({ op: "delete", collection: a.collection, id: a.id, req: a.req });
      return { id: a.id };
    }),
  };
  obterPayloadMock.mockResolvedValue(payload);
  const escritas = () => ops.filter((o) => o.op !== "find");
  return { db, payload, ops, escritas };
}

const usuario = { id: 5, collection: "users", nome: "Ana", administrador: true, telas: [] } as never;
const soEventos = { id: 6, collection: "users", nome: "Bia", administrador: false, telas: ["fin.eventos"] } as never;

const receitaDoc = (id: number, extra: Record<string, unknown> = {}): Doc => ({
  id,
  evento: 1,
  tipoLancamento: "Evento",
  centroCusto: "OPE",
  cliente: "SME",
  segmento: "Municipal",
  tipoReceita: "Inscrição",
  qtde: 1,
  valorUnit: 10000,
  desconto: 0,
  statusEconomico: "Contratada",
  ...extra,
});

const dadosFaturamento = (extra: Partial<DadosFaturamentoFin> = {}): DadosFaturamentoFin => ({
  receitaId: "3",
  parcela: "Parcela 2",
  nf: "",
  dataFaturamento: "2026-11-01",
  valorFaturado: 5000,
  vencimento: "2026-11-30",
  retencaoTributaria: 0,
  retencaoContratual: 0,
  retencaoContratualLiberada: 0,
  dataRecebimento: "",
  valorRecebido: 0,
  contaId: "",
  quitado: false,
  observacao: "",
  ...extra,
});

const dadosReceita = (extra: Partial<DadosReceitaFin> = {}): DadosReceitaFin => ({
  eventoId: "1",
  tipoLancamento: "Evento",
  centroCusto: "",
  cliente: "SME Teste",
  segmento: "Municipal",
  origem: "",
  tipoReceita: "Inscrição",
  etapa: "",
  qtde: 2,
  valorUnit: 5000,
  desconto: 0,
  pagantes: 2,
  cortesias: 0,
  statusEconomico: "Contratada",
  criterioReconhecimento: "Execução declarada (provisório)",
  etapas: [],
  competencia: "",
  referencia: "",
  observacao: "",
  ...extra,
});

const dadosEvento = (extra: Partial<DadosEventoFin> = {}): DadosEventoFin => ({
  nome: "",
  vertical: "Educação",
  tipo: "Evento aberto",
  modalidade: "",
  programa: "",
  modulo: "",
  cliente: "",
  cidade: "Palmas",
  uf: "TO",
  local: "",
  dataInicio: "",
  dataFim: "2026-11-03",
  cargaHoraria: 8,
  responsavel: "Coordenação",
  status: "Planejado",
  qtdPrevista: 40,
  capacidade: 50,
  efetivos: 0,
  pagantesPrev: 40,
  cortesiasPrev: 0,
  refContratual: "",
  observacoes: "",
  ...extra,
});

afterEach(() => vi.clearAllMocks());

describe("faturamento contra o livro relido na transação", () => {
  it("segundo faturamento acima do saldo é recusado com o livro relido na transação", async () => {
    // A tela leu a receita de R$ 100,00 sem faturamento (saldo 100). Antes de
    // gravar, outra aba faturou R$ 80,00 — está no banco, não no que a tela viu.
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }], "fin-receitas": [receitaDoc(3)] });
    banco.db["fin-faturamentos"]?.push({ id: 40, receita: 3, parcela: "Parcela 1", valorFaturado: 8000 });

    const r = await escrita.salvarFaturamentoFin(null, dadosFaturamento({ valorFaturado: 5000 }), usuario);

    expect(r).toEqual({ ok: false, erro: "Faturamento excede o saldo a faturar da receita (R$ 20,00).", campo: "valorFaturado" });
    expect(banco.escritas()).toEqual([]);
    // A releitura usou o `req` da transação em todas as consultas.
    const finds = banco.ops.filter((o) => o.op === "find");
    expect(finds.length).toBeGreaterThanOrEqual(7);
    expect(finds.every((o) => o.req === REQ_TX)).toBe(true);
  });

  it("dentro do saldo grava ligado à receita por id numérico", async () => {
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }], "fin-receitas": [receitaDoc(3)] });
    const r = await escrita.salvarFaturamentoFin(null, dadosFaturamento({ receitaId: "003" }), usuario);
    expect(r.ok).toBe(true);
    const criado = banco.payload.create.mock.calls[0]?.[0];
    expect(criado?.collection).toBe("fin-faturamentos");
    expect(criado?.data).toMatchObject({ receita: 3, conta: null, valorFaturado: 5000 });
    expect(criado?.data).not.toHaveProperty("eventoId");
    expect(criado?.req).toBe(REQ_TX);
  });
});

describe("receita", () => {
  it("receita de evento sem centro grava OPE", async () => {
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }] });
    const r = await escrita.salvarReceitaFin(null, dadosReceita({ centroCusto: "" }), usuario);
    expect(r).toEqual({ ok: true, id: "500" });
    expect(banco.payload.create.mock.calls[0]?.[0].data).toMatchObject({ evento: 1, centroCusto: "OPE" });
  });

  it("evento ainda pendente no CRM não recebe lançamento", async () => {
    const banco = bancoFalso({ "eventos-comerciais": [{ id: 12, titulo: "T" }] });
    const r = await escrita.salvarReceitaFin(null, dadosReceita({ eventoId: "crm-12" }), usuario);
    expect(r.ok).toBe(false);
    expect(banco.escritas()).toEqual([]);
  });

  it("quem só tem fin.eventos não altera receita corporativa gravada", async () => {
    const banco = bancoFalso({
      "fin-eventos": [{ id: 1, nome: "E" }],
      "fin-receitas": [receitaDoc(3, { evento: null, tipoLancamento: "Corporativa", centroCusto: "ADM" })],
    });
    const r = await escrita.salvarReceitaFin("3", dadosReceita({ eventoId: "1" }), soEventos);
    expect(r).toEqual({ ok: false, erro: "Sessão expirada ou sem permissão para esta ação." });
    expect(banco.escritas()).toEqual([]);
  });

  it("id não numérico é recusado sem tocar o banco", async () => {
    const banco = bancoFalso();
    expect(await escrita.salvarReceitaFin("abc", dadosReceita(), usuario)).toEqual({ ok: false, erro: "Dados do formulário inválidos." });
    expect(banco.ops).toEqual([]);
  });

  it("excluir receita com faturamento é recusado com a mensagem do protótipo", async () => {
    const banco = bancoFalso({
      "fin-eventos": [{ id: 1, nome: "E" }],
      "fin-receitas": [receitaDoc(3)],
      "fin-faturamentos": [{ id: 40, receita: 3, valorFaturado: 100 }],
    });
    const r = await escrita.excluirReceitaFin("3", usuario);
    expect(r).toEqual({
      ok: false,
      erro: "Esta receita possui 1 faturamento(s) vinculado(s). Exclua-os antes para preservar a rastreabilidade.",
    });
    expect(banco.escritas()).toEqual([]);
  });

  it("etapas sem nome são descartadas e o critério passa a ser por etapa", async () => {
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }], "fin-receitas": [receitaDoc(3)] });
    const r = await escrita.salvarEtapasFin(
      "3",
      [
        { nome: " Módulo 01 ", base: "valor", valor: 6000, percentual: 0, concluida: true, dataConclusao: "2026-10-15" },
        { nome: "  ", base: "valor", valor: 10, percentual: 0, concluida: false, dataConclusao: "" },
      ],
      usuario,
    );
    expect(r).toEqual({ ok: true, id: "3" });
    const dados = banco.payload.update.mock.calls[0]?.[0].data;
    expect(dados).toEqual({
      etapas: [{ nome: "Módulo 01", base: "valor", valor: 6000, percentual: 0, concluida: true, dataConclusao: "2026-10-15" }],
      criterioReconhecimento: "Por etapa/módulo concluído",
    });
  });
});

describe("custo, pagamento e conta", () => {
  it("custo de evento sem centro grava OPE", async () => {
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }] });
    const d: DadosCustoFin = {
      eventoId: "1", tipoLancamento: "Evento", centroCusto: "", compartilhada: false, origemLancamento: "", fase: "Execução",
      categoria: "Logística", subcategoria: "", descricao: "Passagens", fornecedor: "", documento: "", natureza: "", comportamento: "",
      driver: "", unidade: "", qtde: 1, valorUnitPrev: 1000, valorRealizado: 0, competencia: "", dataPrevista: "", criterioApropriacao: "", observacao: "",
    };
    expect((await escrita.salvarCustoFin(null, d, usuario)).ok).toBe(true);
    expect(banco.payload.create.mock.calls[0]?.[0].data).toMatchObject({ evento: 1, centroCusto: "OPE" });
  });

  it("pagamento acima do saldo do custo é recusado", async () => {
    const banco = bancoFalso({ "fin-eventos": [{ id: 1, nome: "E" }], "fin-custos": [{ id: 6, evento: 1, qtde: 1, valorUnitPrev: 1000 }] });
    const d: DadosPagamentoFin = { custoId: "6", documento: "", vencimento: "2026-11-10", valor: 1500, dataPagamento: "", valorPago: 0, contaId: "", observacao: "" };
    expect(await escrita.salvarPagamentoFin(null, d, usuario)).toEqual({
      ok: false,
      erro: "Valor programado excede o saldo do custo (R$ 10,00).",
      campo: "valor",
    });
    expect(banco.escritas()).toEqual([]);
  });

  it("conta usada não se exclui", async () => {
    const banco = bancoFalso({
      "fin-eventos": [{ id: 1, nome: "E" }],
      "fin-receitas": [receitaDoc(3)],
      "fin-faturamentos": [{ id: 40, receita: 3, conta: 2, valorFaturado: 100, valorRecebido: 100 }],
      "fin-contas": [{ id: 2, nome: "BB" }],
    });
    expect(await escrita.excluirContaFin("2", usuario)).toEqual({
      ok: false,
      erro: "Esta conta possui 1 movimentação(ões) vinculada(s). Inative-a em vez de excluí-la.",
    });
    expect(banco.escritas()).toEqual([]);
  });

  it("conta nova grava os campos do cadastro", async () => {
    const banco = bancoFalso();
    const d: DadosContaFin = { nome: "BB", tipo: "Conta corrente", banco: "001", agencia: "1", numero: "2", saldoInicial: 0, dataSaldoInicial: "2026-11-01", ativa: true, observacao: "" };
    expect((await escrita.salvarContaFin(null, d, usuario)).ok).toBe(true);
    expect(banco.payload.create.mock.calls[0]?.[0]).toMatchObject({ collection: "fin-contas", data: d });
  });
});

describe("evento", () => {
  it("excluir evento do financeiro cascateia na ordem", async () => {
    const banco = bancoFalso({
      "fin-eventos": [{ id: 1, nome: "Próprio" }],
      "fin-receitas": [receitaDoc(3)],
      "fin-faturamentos": [{ id: 40, receita: 3, valorFaturado: 100 }],
      "fin-custos": [{ id: 6, evento: 1 }],
      "fin-pagamentos": [{ id: 7, custo: 6, valor: 50 }],
    });
    const r = await escrita.excluirEventoFin("1", usuario);
    expect(r).toEqual({ ok: true, id: "1" });
    expect(banco.escritas().map((o) => [o.collection, o.id])).toEqual([
      ["fin-pagamentos", 7],
      ["fin-custos", 6],
      ["fin-faturamentos", 40],
      ["fin-receitas", 3],
      ["fin-eventos", 1],
    ]);
    expect(banco.escritas().every((o) => o.req === REQ_TX && o.op === "delete")).toBe(true);
  });

  it("excluir evento ligado ao CRM com lançamento é recusado", async () => {
    const banco = bancoFalso({
      "eventos-comerciais": [{ id: 12, titulo: "Turma" }],
      "fin-eventos": [{ id: 1, eventoComercial: 12 }],
      "fin-custos": [{ id: 6, evento: 1 }],
    });
    expect(await escrita.excluirEventoFin("1", usuario)).toEqual({
      ok: false,
      erro: "Este evento tem lançamentos; exclua-os antes de remover o cadastro financeiro.",
    });
    expect(banco.escritas()).toEqual([]);
  });

  it("excluir evento ligado ao CRM sem lançamento remove só o cadastro financeiro", async () => {
    const banco = bancoFalso({ "eventos-comerciais": [{ id: 12, titulo: "Turma" }], "fin-eventos": [{ id: 1, eventoComercial: 12 }] });
    expect(await escrita.excluirEventoFin("1", usuario)).toEqual({ ok: true, id: "1" });
    expect(banco.escritas().map((o) => [o.op, o.collection])).toEqual([["delete", "fin-eventos"]]);
  });

  it("evento crm-12 cria fin-eventos ligado ao 12 e não escreve em eventos-comerciais", async () => {
    const banco = bancoFalso({
      "eventos-comerciais": [
        { id: 12, titulo: "Turma EDUTEC", dataInicio: "2026-11-02T00:00:00.000Z", dataFim: null, modalidade: "online", local: "", cliente: { orgao: "SME" }, status: "agendado" },
      ],
    });
    // Nome, modalidade e início vazios no formulário: o CRM preenche e vence.
    const r = await escrita.salvarEventoFin("crm-12", dadosEvento(), usuario);
    expect(r).toEqual({ ok: true, id: "500" });
    expect(banco.escritas().map((o) => [o.op, o.collection])).toEqual([["create", "fin-eventos"]]);
    const data = banco.payload.create.mock.calls[0]?.[0].data;
    expect(data).toMatchObject({
      eventoComercial: 12,
      // preenchidos pelo CRM: não duplicados
      nome: null,
      modalidade: null,
      dataInicio: null,
      cliente: null,
      // vazios no CRM: ficam do lado financeiro
      dataFim: "2026-11-03",
      local: "",
      cargaHoraria: 8,
      responsavel: "Coordenação",
    });
  });

  it("crm-12 já com cadastro financeiro não cria outro", async () => {
    const banco = bancoFalso({ "eventos-comerciais": [{ id: 12, titulo: "T" }], "fin-eventos": [{ id: 1, eventoComercial: 12 }] });
    const r = await escrita.salvarEventoFin("crm-12", dadosEvento(), usuario);
    expect(r.ok).toBe(false);
    expect(banco.escritas()).toEqual([]);
  });

  it("evento próprio valida e grava todos os campos", async () => {
    const banco = bancoFalso();
    expect(await escrita.salvarEventoFin(null, dadosEvento({ nome: "" }), usuario)).toEqual({ ok: false, erro: "Informe o nome do evento.", campo: "nome" });
    const d = dadosEvento({ nome: "Seminário", modalidade: "Presencial", local: "Auditório", dataInicio: "2026-11-01" });
    expect((await escrita.salvarEventoFin(null, d, usuario)).ok).toBe(true);
    expect(banco.payload.create.mock.calls[0]?.[0].data).toEqual(d);
  });
});
