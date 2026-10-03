import { NextResponse } from "next/server";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import { obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const usuario = await obterUsuarioCms();
  if (!usuario) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;
  const dados = await obterDadosDocumentoProposta(id);
  if (!dados) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }

  const { html } = montarHtmlDocumentoProposta(dados);
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
