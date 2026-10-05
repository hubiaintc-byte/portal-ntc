import { NextResponse } from "next/server";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import { gerarESalvarPdfProposta } from "@/lib/cms/painelCrmEscrita";
import { obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";

/**
 * O documento da proposta, sempre montado a partir do conteúdo atual.
 *
 * É o destino do único botão de PDF do detalhe: gera, **salva** em
 * `documentos-comerciais` (o PDF de registro, que a proposta passa a apontar
 * em `pdfGerado` e que a Sessão 5 vai anexar no e-mail) e devolve os bytes na
 * mesma requisição, para o navegador abrir o visualizador — de onde se baixa.
 * Antes havia dois botões, "Gerar PDF" e "Baixar PDF": o segundo servia o
 * arquivo da geração anterior e podia estar desatualizado em relação ao que
 * tinha acabado de ser editado. Com uma porta só, isso não acontece.
 *
 * `?html=1` devolve o HTML sem passar pelo Chromium e **sem salvar nada** —
 * caminho de diagnóstico, para inspecionar a montagem sem gastar geração.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obterUsuarioCms();
  if (!usuario) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;

  if (new URL(req.url).searchParams.get("html") === "1") {
    const dados = await obterDadosDocumentoProposta(id);
    if (!dados) {
      return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
    }
    const { html } = montarHtmlDocumentoProposta(dados);
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  const resultado = await gerarESalvarPdfProposta(id);
  if (!resultado.ok || !resultado.pdf) {
    const erro = resultado.ok ? "Não foi possível gerar o PDF. Tente novamente." : resultado.erro;
    return NextResponse.json({ erro }, { status: erro === "Proposta não encontrada." ? 404 : 500 });
  }

  const dados = await obterDadosDocumentoProposta(id);
  const nome = `${dados?.codigo ?? `proposta-${id}`}.pdf`;
  return new NextResponse(new Uint8Array(resultado.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      // `inline`: abre no visualizador do navegador, com o botão de baixar ali.
      "Content-Disposition": `inline; filename="${nome}"`,
      // Documento comercial com preço e dados de contato: nunca em cache
      // compartilhado, e sempre refeito a cada abertura (LGPD, CLAUDE.md §12).
      "Cache-Control": "private, no-store",
    },
  });
}
