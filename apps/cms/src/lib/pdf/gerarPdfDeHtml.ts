import "server-only";

import type { Browser } from "playwright-core";

import { esc } from "@/lib/documentoProposta/formato";

export interface MetaCabecalhoPdf {
  codigo: string;
  /** Sigla do programa, como o `@top-left` do modelo a imprime. Vazia some. */
  siglaPrograma: string;
  validadeFormatada: string;
  emitidaFormatada: string;
}

/** Detecta ambiente serverless (Vercel/AWS Lambda) vs. dev local. */
function ehServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function abrirBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");

  if (ehServerless()) {
    const chromiumServerless = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: chromiumServerless.args,
      executablePath: await chromiumServerless.executablePath(),
      headless: true,
    });
  }

  // Dev local: usa o Chromium que o `playwright` da raiz do monorepo já
  // baixou (mesmo binário usado pelos scripts de diagnóstico visual).
  const playwrightLocal = await import("playwright");
  return chromium.launch({
    executablePath: playwrightLocal.chromium.executablePath(),
    headless: true,
  });
}

/**
 * Cabeçalho e rodapé seguem os margin boxes do modelo aprovado
 * (docs/prototipos/proposta-modelo-v1.html, linhas 15-18), que o Chromium não
 * implementa como paged media — daí vir pelo header/footerTemplate. Tipografia
 * e cores são as de lá: Cormorant Garamond 9pt dourado `#B68B40` à esquerda do
 * cabeçalho, Barlow 8pt `#6B6B6B` nos outros três cantos. NÃO voltar ao
 * dourado da paleta Soberana (`#B5995A`): o documento da proposta é a exceção
 * de paleta registrada em documentoProposta/tokens.ts.
 */
const ESTILO_LINHA =
  "width:100%;font-family:Barlow,sans-serif;font-size:8pt;color:#6B6B6B;padding:0 18mm;display:flex;justify-content:space-between;";

function headerTemplate(meta: MetaCabecalhoPdf): string {
  const sigla = meta.siglaPrograma.trim();
  const esquerda = sigla
    ? `Instituto NTC do Brasil · ${esc(sigla)}`
    : "Instituto NTC do Brasil";
  return `<div style="${ESTILO_LINHA}">
    <span style="font-family:'Cormorant Garamond',serif;font-size:9pt;color:#B68B40;font-weight:600;letter-spacing:1pt;">${esquerda}</span>
    <span style="letter-spacing:0.5pt;">${esc(meta.codigo)}</span>
  </div>`;
}

function footerTemplate(meta: MetaCabecalhoPdf): string {
  return `<div style="${ESTILO_LINHA}">
    <span style="letter-spacing:0.4pt;">Validade: ${esc(meta.validadeFormatada)} · Emitida: ${esc(meta.emitidaFormatada)}</span>
    <span style="letter-spacing:0.4pt;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>`;
}

/**
 * Gera o PDF a partir de uma string HTML já completa (ver
 * montarHtmlDocumentoProposta). Cabeçalho/rodapé aparecem em TODAS as
 * páginas incluindo a capa — simplificação deliberada desta sessão (ver
 * Global Constraints do plano).
 */
export async function gerarPdfDeHtml(html: string, meta: MetaCabecalhoPdf): Promise<Buffer> {
  const browser = await abrirBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    // As fontes da marca (Cormorant Garamond, Barlow) vão embutidas como
    // data URI base64 no próprio HTML (ver
    // documentoProposta/fontsEmbutidas.ts) — sem chamada de rede. Mesmo
    // assim, decodificar/parsear um @font-face com src em base64 não é
    // síncrono com `waitUntil: "load"`; sem aguardar `document.fonts.ready`
    // o Chromium pode tirar o snapshot do PDF ainda no fallback
    // Helvetica/Times.
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate(meta),
      footerTemplate: footerTemplate(meta),
      margin: { top: "22mm", bottom: "20mm", left: "0", right: "0" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
