import { extractText, getDocumentProxy } from "unpdf";

/**
 * Extrai o texto de cada página do PDF (ordem do documento). PDFs sem camada
 * de texto (escaneados) retornam strings vazias — o chamador decide o
 * fallback.
 */
export async function extrairTextoPdf(dados: Uint8Array): Promise<string[]> {
  const pdf = await getDocumentProxy(dados);
  const { text } = await extractText(pdf, { mergePages: false });
  return text;
}
