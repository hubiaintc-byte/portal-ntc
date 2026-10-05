import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const executarEmTransacaoMock = vi.fn(
  async (payload: unknown, usuario: unknown, fn: (req: unknown) => unknown) => fn({ payload, user: usuario }),
);
vi.mock("@/lib/crm/transacao", () => ({ executarEmTransacao: executarEmTransacaoMock }));

const { salvarPrograma, excluirPrograma, salvarModulo, excluirModulo } = await import("./catalogoCrmEscrita");
type DadosPrograma = Parameters<typeof salvarPrograma>[1];
type DadosModulo = Parameters<typeof salvarModulo>[1];

const usuario = { id: 5, collection: "users", nome: "Ana", perfil: "super-admin", email: "a@b.c", createdAt: "", updatedAt: "" } as never;

interface Opcoes {
  siglaEmUso?: boolean;
  numeroEmUso?: boolean;
  statusPrincipal?: string;
  statusUltima?: string;
  contagens?: Record<string, number>;
  moduloAtual?: Record<string, unknown>;
  programaGravado?: Record<string, unknown>;
}

function payloadFalso(o: Opcoes = {}) {
  const create = vi.fn(async ({ data }: { collection?: string; data: Record<string, unknown> }) => ({ id: 77, ...data }));
  const update = vi.fn(async ({ data }: { collection?: string; id?: unknown; data: Record<string, unknown> }) => ({ id: 1, ...data }));
  const del = vi.fn(async () => ({ id: 1 }));
  const find = vi.fn(async () => ({ docs: o.siglaEmUso ? [{ id: 2 }] : [] }));
  const count = vi.fn(async ({ collection }: { collection: string }) => {
    if (collection === "modulos" && o.numeroEmUso !== undefined) return { totalDocs: o.numeroEmUso ? 1 : 0 };
    return { totalDocs: o.contagens?.[collection] ?? 0 };
  });
  const findByID = vi.fn(async ({ collection, draft }: { collection: string; draft?: boolean }) => {
    if (collection === "modulos") return o.moduloAtual ?? { id: 9, programa: 4 };
    return {
      id: 4,
      sigla: "EDU",
      _status: draft ? (o.statusUltima ?? "published") : (o.statusPrincipal ?? "published"),
      ...(o.programaGravado ?? {}),
    };
  });
  return { create, update, delete: del, find, count, findByID };
}

const programaBase: DadosPrograma = {
  sigla: " edu ",
  nomeCompleto: "Educação",
  areaId: "2",
  cargaHorariaTotal: "64 horas",
  textos: { visaoGeral: "Texto **forte**." },
  eixos: [{ titulo: " E ", descricao: "D " }, { titulo: "", descricao: "" }],
  diferenciais: [],
  resultados: [" R ", " "],
};

afterEach(() => vi.clearAllMocks());

describe("salvarPrograma", () => {
  it("programa novo nasce rascunho, sigla em maiúsculas, listas sem itens vazios e aparadas", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma(null, programaBase, false, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    const args = p.create.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(true);
    expect(args.data).toMatchObject({ sigla: "EDU", _status: "draft", area: 2, eixosTematicos: [{ titulo: "E", descricao: "D" }], resultadosEsperados: [{ resultado: "R" }] });
  });

  it("só grava os textos enviados — campo ausente não é tocado", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    await salvarPrograma("4", { ...programaBase, textos: { objetivo: "" } }, false, usuario);
    const data = (p.update.mock.calls[0]![0] as { data: Record<string, unknown> }).data;
    expect(data.objetivo).toBeNull();
    expect("visaoGeral" in data).toBe(false);
    expect("problema" in data).toBe(false);
  });

  it("publicar envia os dados do formulário com _status published numa só escrita", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", programaBase, true, usuario);
    expect(r.ok).toBe(true);
    expect(p.update).toHaveBeenCalledTimes(1);
    const args = p.update.mock.calls[0]![0] as { data: Record<string, unknown>; draft: boolean };
    expect(args.draft).toBe(false);
    expect(args.data).toMatchObject({ _status: "published", nomeCompleto: "Educação" });
  });

  it("publicar sem visão geral (nem no formulário nem gravada) lista as faltas e não escreve", async () => {
    const p = payloadFalso({ programaGravado: { visaoGeral: null } });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarPrograma("4", { ...programaBase, areaId: "", textos: {} }, true, usuario);
    expect(r).toEqual({ ok: false, erro: "Para publicar, preencha: Área, Visão geral." });
    expect(p.update).not.toHaveBeenCalled();
  });

  it("rascunho sem sigla recusa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, { ...programaBase, sigla: "" }, false, usuario)).toEqual({ ok: false, erro: "Para salvar, preencha: Sigla." });
  });

  it("sigla duplicada (comparada em maiúsculas) recusa", async () => {
    const p = payloadFalso({ siglaEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarPrograma(null, programaBase, false, usuario)).toEqual({ ok: false, erro: "Já existe um programa com a sigla EDU." });
    expect(p.find).toHaveBeenCalledWith(expect.objectContaining({ where: { and: [{ sigla: { equals: "EDU" } }] } }));
  });
});

describe("excluirPrograma", () => {
  it("com módulos recusa antes de apagar", async () => {
    const p = payloadFalso({ contagens: { modulos: 2 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: false, erro: "Vinculado a 2 módulos — exclua ou desvincule antes." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("sem dependentes apaga", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirPrograma("4", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: "4" }));
  });
});

const moduloBase: DadosModulo = {
  programaId: "4",
  numero: "3",
  titulo: "Gestão",
  ementa: "Ementa **x**.",
  cargaHoraria: "8h",
  tituloComercial: "",
  valor: "1.500,50",
  replay: "",
  certificacao: "",
};

describe("salvarModulo", () => {
  it("cria, converte valor e recalcula modulosQuantidade publicado quando o programa está publicado", async () => {
    const p = payloadFalso({ numeroEmUso: false });
    obterPayloadMock.mockResolvedValue(p);
    const r = await salvarModulo(null, moduloBase, usuario);
    expect(r).toEqual({ ok: true, id: "77" });
    expect(p.create.mock.calls[0]![0]).toMatchObject({ collection: "modulos", data: { programa: 4, numero: 3, comercial: { valor: 1500.5, tituloComercial: null } } });
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBeFalsy();
    expect("modulosQuantidade" in recalculo.data).toBe(true);
    expect("_status" in recalculo.data).toBe(false);
  });

  it("programa com alterações pendentes: recálculo grava no rascunho", async () => {
    const p = payloadFalso({ numeroEmUso: false, statusUltima: "draft" });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo(null, moduloBase, usuario);
    const recalculo = p.update.mock.calls.find((c) => (c[0] as { collection: string }).collection === "programas")![0] as { draft?: boolean; data: Record<string, unknown> };
    expect(recalculo.draft).toBe(true);
    expect(recalculo.data._status).toBe("draft");
  });

  it("número repetido no programa de destino recusa com a sigla", async () => {
    const p = payloadFalso({ numeroEmUso: true });
    obterPayloadMock.mockResolvedValue(p);
    expect(await salvarModulo("9", moduloBase, usuario)).toEqual({ ok: false, erro: "Já existe o módulo 3 em EDU." });
    expect(p.count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "modulos",
        where: { and: [{ programa: { equals: "4" } }, { numero: { equals: 3 } }, { id: { not_equals: "9" } }] },
      }),
    );
  });

  it("mudar de programa recalcula os dois", async () => {
    const p = payloadFalso({ numeroEmUso: false, moduloAtual: { id: 9, programa: 8 } });
    obterPayloadMock.mockResolvedValue(p);
    await salvarModulo("9", moduloBase, usuario);
    const recalculados = p.update.mock.calls
      .filter((c) => (c[0] as { collection: string }).collection === "programas")
      .map((c) => String((c[0] as { id: unknown }).id));
    expect(recalculados.sort()).toEqual(["4", "8"]);
  });

  it("valida número, obrigatórios e valor", async () => {
    obterPayloadMock.mockResolvedValue(payloadFalso({ numeroEmUso: false }));
    expect(await salvarModulo(null, { ...moduloBase, numero: "0" }, usuario)).toEqual({ ok: false, erro: "Número do módulo deve ser um inteiro a partir de 1." });
    expect(await salvarModulo(null, { ...moduloBase, titulo: " ", ementa: "" }, usuario)).toEqual({ ok: false, erro: "Preencha: Título, Ementa." });
    expect(await salvarModulo(null, { ...moduloBase, valor: "abc" }, usuario)).toEqual({ ok: false, erro: "Valor de referência inválido." });
  });
});

describe("excluirModulo", () => {
  it("usado em proposta recusa", async () => {
    const p = payloadFalso({ contagens: { propostas: 1 } });
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: false, erro: "Usado em 1 proposta — não pode ser excluído." });
    expect(p.delete).not.toHaveBeenCalled();
  });
  it("livre: apaga e recalcula o programa", async () => {
    const p = payloadFalso();
    obterPayloadMock.mockResolvedValue(p);
    expect(await excluirModulo("9", usuario)).toEqual({ ok: true });
    expect(p.delete).toHaveBeenCalledWith(expect.objectContaining({ collection: "modulos", id: "9" }));
    expect(p.update).toHaveBeenCalledWith(expect.objectContaining({ collection: "programas", id: 4 }));
  });
});
