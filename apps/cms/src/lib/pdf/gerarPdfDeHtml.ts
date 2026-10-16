import "server-only";

import type { Browser } from "playwright-core";

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
 * Gera o PDF a partir de uma string HTML já completa (ver
 * montarHtmlDocumentoProposta). Tamanho, margens, cabeçalho e rodapé vêm do
 * `@page` do próprio documento (`preferCSSPageSize`) — inclusive a capa e a
 * contracapa sem margem, que os templates do Playwright não sabiam fazer.
 */
export async function gerarPdfDeHtml(html: string): Promise<Buffer> {
  const browser = await abrirBrowser();
  try {
    // O documento é estático e autocontido (fontes e logos embutidos, nenhum
    // <script>): o Chromium roda sem JavaScript e sem rede. Se algum texto
    // escapar do escape do HTML, ele não executa nem consegue mandar a
    // proposta para fora. `page.evaluate` (abaixo) continua funcionando — o
    // Playwright avalia num mundo isolado, não pelos scripts da página.
    const contexto = await browser.newContext({ javaScriptEnabled: false });
    const page = await contexto.newPage();
    await page.route("**/*", (rota) => rota.abort());
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
      printBackground: true,
      preferCSSPageSize: true,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
