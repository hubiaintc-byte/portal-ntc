import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { listarProgramasCrm, obterProgramaCatalogo, obterModuloCatalogo, situacaoDoPrograma } = await import("./catalogoCrm");

const negrito = {
  root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "Forte", format: 1 }] }] },
};

afterEach(() => vi.clearAllMocks());

describe("listarProgramasCrm", () => {
  it("cruza a leitura publicada com a última versão para a situação, e conta módulos", async () => {
    const find = vi.fn(async (args: { collection: string; draft?: boolean }) => {
      if (args.collection === "modulos") return { docs: [{ programa: 1 }, { programa: 1 }, { programa: 2 }] };
      if (args.draft) {
        return { docs: [{ id: 1, sigla: "A", nomeCompleto: "Alfa", area: { id: 9, nome: "Educação" }, _status: "draft" }, { id: 2, sigla: "B", nomeCompleto: "Beta", area: null, _status: "draft" }] };
      }
      return { docs: [{ id: 1, _status: "published" }, { id: 2, _status: "draft" }] };
    });
    obterPayloadMock.mockResolvedValue({ find });
    const lista = await listarProgramasCrm();
    expect(lista).toEqual([
      { id: "1", sigla: "A", nome: "Alfa", areaId: "9", area: "Educação", situacao: "alteracoes-pendentes", numModulos: 2 },
      { id: "2", sigla: "B", nome: "Beta", areaId: null, area: null, situacao: "rascunho", numModulos: 1 },
    ]);
  });
});

describe("situacaoDoPrograma", () => {
  it("lê os dois status do mesmo programa", async () => {
    const findByID = vi.fn(async (a: { draft?: boolean }) => ({ _status: a.draft ? "draft" : "published" }));
    expect(await situacaoDoPrograma({ findByID } as never, 3)).toBe("alteracoes-pendentes");
  });
});

describe("obterProgramaCatalogo", () => {
  it("devolve textos em Markdown, marca perda e traz módulos e dependentes", async () => {
    const ambos = { root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: "x", format: 3 }] }] } };
    const findByID = vi.fn(async (a: { draft?: boolean }) =>
      a.draft
        ? {
            id: 4, _status: "draft", sigla: "EDU", nomeCompleto: "Edu", eyebrow: "Cultura Digital · IA", area: 2, cargaHorariaTotal: "64 horas",
            visaoGeral: negrito, problema: ambos, objetivo: null, publicoAlvo: null, metodologia: null,
            eixosTematicos: [{ titulo: "E", descricao: "D" }], diferenciais: [{ titulo: "T", descricao: null }],
            resultadosEsperados: [{ resultado: "R" }],
          }
        : { id: 4, _status: "published" },
    );
    const find = vi.fn(async () => ({ docs: [{ id: 11, numero: 1, titulo: "M1", cargaHoraria: "8h" }] }));
    const count = vi.fn(async () => ({ totalDocs: 0 }));
    obterPayloadMock.mockResolvedValue({ findByID, find, count });
    const d = await obterProgramaCatalogo("4");
    expect(d).toMatchObject({
      situacao: "alteracoes-pendentes",
      areaId: "2",
      temas: "Cultura Digital · IA",
      textos: { visaoGeral: "**Forte**", objetivo: "" },
      textosComPerda: ["problema"],
      eixos: [{ titulo: "E", descricao: "D" }],
      diferenciais: [{ titulo: "T", descricao: "" }],
      resultados: ["R"],
      modulos: [{ id: "11", numero: 1, titulo: "M1", cargaHoraria: "8h" }],
      dependentes: { modulos: 0, propostas: 0, leads: 0, eventos: 0, especialistas: 0 },
    });
  });
  it("id inexistente devolve null", async () => {
    obterPayloadMock.mockResolvedValue({ findByID: vi.fn(async () => { throw new Error("Not Found"); }) });
    expect(await obterProgramaCatalogo("999")).toBeNull();
  });
});

describe("obterModuloCatalogo", () => {
  it("formata o valor para edição e converte a ementa", async () => {
    const findByID = vi.fn(async () => ({
      id: 5, programa: { id: 4 }, numero: 2, titulo: "T", ementa: negrito, cargaHoraria: null,
      comercial: { tituloComercial: null, valor: 1500.5, replay: "90 dias", certificacao: null },
    }));
    const count = vi.fn(async () => ({ totalDocs: 0 }));
    obterPayloadMock.mockResolvedValue({ findByID, count });
    expect(await obterModuloCatalogo("5")).toMatchObject({
      programaId: "4", numero: "2", ementa: "**Forte**", ementaComPerda: false, cargaHoraria: "",
      tituloComercial: "", valor: "1500,5", replay: "90 dias", certificacao: "",
      dependentes: { propostas: 0, eventosComerciais: 0 },
    });
  });
});
