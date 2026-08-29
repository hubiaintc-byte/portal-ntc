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

  it("gera o PDF, salva em documentos-comerciais e vincula à proposta", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      validadeISO: "2026-09-28T12:00:00.000Z",
      dataCriacaoISO: "2026-08-29T12:00:00.000Z",
    });
    gerarPdfDeHtmlMock.mockResolvedValue(Buffer.from("conteudo-pdf-fake"));

    const findByID = vi.fn().mockResolvedValue({ pdfGerado: null });
    const criarMedia = vi.fn().mockResolvedValue({ id: 77 });
    const update = vi.fn().mockResolvedValue({});
    const del = vi.fn().mockResolvedValue({});
    obterPayloadMock.mockResolvedValue({ findByID, create: criarMedia, update, delete: del });

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(true);
    expect(criarMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "documentos-comerciais",
        file: expect.objectContaining({
          mimetype: "application/pdf",
          name: expect.stringMatching(/^NTC-PROP-2026-PROGE-SP-X-v01-[a-z0-9]+\.pdf$/),
        }),
      }),
    );
    expect(update).toHaveBeenCalledWith({
      collection: "propostas",
      id: "42",
      data: { pdfGerado: 77 },
    });
    expect(del).not.toHaveBeenCalled();
  });

  it("remove o PDF anterior após gerar e vincular o novo", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v02",
      validadeISO: "2026-09-28T12:00:00.000Z",
      dataCriacaoISO: "2026-08-29T12:00:00.000Z",
    });
    gerarPdfDeHtmlMock.mockResolvedValue(Buffer.from("conteudo-pdf-fake"));

    const findByID = vi.fn().mockResolvedValue({ pdfGerado: 55 });
    const criarMedia = vi.fn().mockResolvedValue({ id: 77 });
    const update = vi.fn().mockResolvedValue({});
    const del = vi.fn().mockResolvedValue({});
    obterPayloadMock.mockResolvedValue({ findByID, create: criarMedia, update, delete: del });

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(true);
    expect(del).toHaveBeenCalledWith({ collection: "documentos-comerciais", id: 55 });
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
