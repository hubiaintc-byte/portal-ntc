import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const obterDadosDocumentoPropostaMock = vi.fn();
vi.mock("@/lib/documentoProposta/dados", () => ({
  obterDadosDocumentoProposta: obterDadosDocumentoPropostaMock,
}));

vi.mock("@/lib/documentoProposta/html", () => ({
  montarHtmlDocumentoProposta: vi.fn().mockReturnValue("<html></html>"),
}));

const gerarPdfDeHtmlMock = vi.fn();
vi.mock("@/lib/pdf/gerarPdfDeHtml", () => ({ gerarPdfDeHtml: gerarPdfDeHtmlMock }));

const { gerarESalvarPdfProposta } = await import("./painelCrmEscrita");

describe("gerarESalvarPdfProposta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("gera o PDF, salva em media e vincula à proposta", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      validadeISO: "2026-09-28T12:00:00.000Z",
      dataCriacaoISO: "2026-08-29T12:00:00.000Z",
    });
    gerarPdfDeHtmlMock.mockResolvedValue(Buffer.from("conteudo-pdf-fake"));

    const criarMedia = vi.fn().mockResolvedValue({ id: 77 });
    const update = vi.fn().mockResolvedValue({});
    obterPayloadMock.mockResolvedValue({ create: criarMedia, update });

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(true);
    expect(criarMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "media",
        file: expect.objectContaining({
          mimetype: "application/pdf",
          name: "NTC-PROP-2026-PROGE-SP-X-v01.pdf",
        }),
      }),
    );
    expect(update).toHaveBeenCalledWith({
      collection: "propostas",
      id: "42",
      data: { pdfGerado: 77 },
    });
  });

  it("devolve erro quando a proposta não existe", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue(null);

    const resultado = await gerarESalvarPdfProposta("999");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erro).toBe("Proposta não encontrada.");
    expect(gerarPdfDeHtmlMock).not.toHaveBeenCalled();
  });

  it("em falha na geração do PDF, devolve erro genérico em vez de propagar exceção", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      validadeISO: null,
      dataCriacaoISO: null,
    });
    gerarPdfDeHtmlMock.mockRejectedValue(new Error("chromium não abriu"));

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erro).toBe("Não foi possível gerar o PDF. Tente novamente.");
  });
});
