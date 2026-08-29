import "server-only";

import type { Browser } from "playwright-core";

export interface MetaCabecalhoPdf {
  codigo: string;
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

function headerTemplate(meta: MetaCabecalhoPdf): string {
  return `<div style="width:100%;font-family:Barlow,sans-serif;font-size:8px;color:#5A5A5A;padding:0 18mm;display:flex;justify-content:space-between;">
    <span style="font-family:'Cormorant Garamond',serif;color:#B5995A;font-weight:600;letter-spacing:0.5px;">Instituto NTC do Brasil</span>
    <span>${meta.codigo}</span>
  </div>`;
}

function footerTemplate(meta: MetaCabecalhoPdf): string {
  return `<div style="width:100%;font-family:Barlow,sans-serif;font-size:8px;color:#5A5A5A;padding:0 18mm;display:flex;justify-content:space-between;">
    <span>Validade: ${meta.validadeFormatada} · Emitida: ${meta.emitidaFormatada}</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
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
    // `waitUntil: "load"` garante que a folha de estilo do Google Fonts
    // carregou, mas não que os arquivos de fonte (Cormorant Garamond,
    // Barlow) já foram baixados/parseados — sem isto o Chromium tira o
    // snapshot do PDF ainda no fallback Helvetica/Times.
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
