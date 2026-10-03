import { afterEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterPropostaCrm } = await import("./painelCrm");
const { textoComSubtitulosParaLexical } = await import("@/lib/lexicalBuilders");

/**
 * `PropostaDetalhe.conteudo` — a forma EDITÁVEL do conteúdo do documento
 * (Task 13). O que importa aqui: Lexical chega como texto puro na convenção
 * de `textoComSubtitulosParaLexical` (o ciclo editar → salvar → editar não
 * pode corromper o texto), relação chega como id em string, e `modalidadeOnline`
 * repete a regra do documento (spec §7).
 */

const TEXTO_INSTITUCIONAL =
  "## Certificação\n\nA emissão observará os critérios.\n\n- presença\n- participação";

function propostaNoBanco(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 9,
    codigo: "NTC-PROP-2026-EDUTEC-SP-SME-v01",
    codigoBase: "NTC-PROP-2026-EDUTEC-SP-SME",
    versao: 1,
    modalidade: "Online ao vivo",
    textoApresentacao: textoComSubtitulosParaLexical("Primeiro parágrafo.\n\nSegundo parágrafo."),
    textoCertificacaoReplay: textoComSubtitulosParaLexical(TEXTO_INSTITUCIONAL),
    eixos: [{ titulo: "Eixo 1", descricao: "Base.", id: "a1" }],
    diferenciais: [{ titulo: "Diferencial", descricao: null, id: "b1" }],
    resultados: [{ texto: "Resultado A.", id: "c1" }],
    docentes: [
      { especialista: { id: 11, nome: "Ana Ribeiro" }, nome: "Ana Ribeiro", credencial: "Doutorado · USP", eixo: null, id: "d1" },
      { especialista: null, nome: "Especialista convidado", credencial: null, eixo: null, id: "d2" },
    ],
    modulosDetalhados: [
      { modulo: { id: 10, numero: 1, titulo: "Módulo 1" }, tituloExibido: "M1", ementa: textoComSubtitulosParaLexical("Ementa do módulo."), id: "e1" },
    ],
    secoesExtras: [
      { titulo: "Anexo A", corpo: textoComSubtitulosParaLexical("Texto do anexo."), posicao: "antes-quadro-comercial", id: "f1" },
    ],
    ...extra,
  };
}

function payloadFalso(doc: Record<string, unknown>) {
  const findByID = vi.fn(async () => doc);
  const find = vi.fn(async () => ({ docs: [] }));
  obterPayloadMock.mockResolvedValue({ findByID, find });
  return { findByID, find };
}

afterEach(() => vi.clearAllMocks());

describe("obterPropostaCrm — conteudo editável", () => {
  it("os textos chegam como texto puro, com '## ' e '- ' preservados", async () => {
    payloadFalso(propostaNoBanco());
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.apresentacao).toBe("Primeiro parágrafo.\n\nSegundo parágrafo.");
    expect(p?.conteudo.certificacaoReplay).toBe(TEXTO_INSTITUCIONAL);
  });

  it("texto ausente chega como string vazia (seção que não sai no documento)", async () => {
    payloadFalso(propostaNoBanco());
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.fechamento).toBe("");
    expect(p?.conteudo.metodologia).toBe("");
  });

  it("listas chegam como arrays simples, sem o id de linha do Payload", async () => {
    payloadFalso(propostaNoBanco());
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.eixos).toEqual([{ titulo: "Eixo 1", descricao: "Base." }]);
    expect(p?.conteudo.diferenciais).toEqual([{ titulo: "Diferencial", descricao: "" }]);
    expect(p?.conteudo.resultados).toEqual(["Resultado A."]);
  });

  it("relação chega como id em string, e docente sem ficha com id vazio", async () => {
    payloadFalso(propostaNoBanco());
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.docentes).toEqual([
      { especialistaId: "11", nome: "Ana Ribeiro", credencial: "Doutorado · USP", eixo: "" },
      { especialistaId: "", nome: "Especialista convidado", credencial: "", eixo: "" },
    ]);
    expect(p?.conteudo.modulosDetalhados).toEqual([
      { moduloId: "10", tituloExibido: "M1", ementa: "Ementa do módulo." },
    ]);
  });

  it("seção extra chega com corpo em texto puro e a posição gravada", async () => {
    payloadFalso(propostaNoBanco());
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.secoesExtras).toEqual([
      { titulo: "Anexo A", corpo: "Texto do anexo.", posicao: "antes-quadro-comercial" },
    ]);
  });

  it("listas ausentes chegam como arrays vazios", async () => {
    payloadFalso({
      id: 9,
      codigo: "X-v01",
      codigoBase: "X",
      versao: 1,
      eixos: null,
      diferenciais: null,
      resultados: null,
      docentes: null,
      modulosDetalhados: null,
      secoesExtras: null,
    });
    const p = await obterPropostaCrm("9");
    expect(p?.conteudo.eixos).toEqual([]);
    expect(p?.conteudo.docentes).toEqual([]);
    expect(p?.conteudo.secoesExtras).toEqual([]);
  });

  it("modalidadeOnline segue a regra do documento (presencial e híbrido são falso)", async () => {
    payloadFalso(propostaNoBanco());
    expect((await obterPropostaCrm("9"))?.conteudo.modalidadeOnline).toBe(true);

    vi.clearAllMocks();
    payloadFalso(propostaNoBanco({ modalidade: "Híbrido · presencial + online" }));
    expect((await obterPropostaCrm("9"))?.conteudo.modalidadeOnline).toBe(false);

    vi.clearAllMocks();
    payloadFalso(propostaNoBanco({ modalidade: "" }));
    expect((await obterPropostaCrm("9"))?.conteudo.modalidadeOnline).toBe(false);
  });
});
