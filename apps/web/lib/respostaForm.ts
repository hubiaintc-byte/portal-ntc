import { NextResponse } from "next/server";

/**
 * Helpers de resposta padronizadas das rotas `/api/forms/*`.
 *
 * Formato segue o contrato `FormularioResposta` consumido pelo
 * `<FormularioSoberano>` em @ntc/ui:
 *  - 200 → { ok: true, leadId, message }
 *  - 422 → { ok: false, message, erros: { campo: "mensagem" } }
 *  - 429 → { ok: false, message } com header Retry-After
 *  - outros → { ok: false, message }
 */

export function respostaSucesso(leadId: string | number, message = "Recebemos sua solicitação. Em breve nossa equipe entra em contato.") {
  return NextResponse.json({ ok: true, leadId, message }, { status: 200 });
}

export function respostaValidacao(erros: Record<string, string>, message = "Verifique os campos destacados.") {
  return NextResponse.json({ ok: false, message, erros }, { status: 422 });
}

export function respostaRateLimit(retryAfterSegundos = 60) {
  return NextResponse.json(
    {
      ok: false,
      message: "Recebemos muitas requisições deste IP em pouco tempo. Aguarde e tente novamente.",
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSegundos) } },
  );
}

export function respostaErro(message: string, status = 500) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function respostaArquivoMuitoGrande(maxMb: number) {
  return NextResponse.json(
    { ok: false, message: `Arquivo maior que o limite de ${maxMb} MB.` },
    { status: 413 },
  );
}

import type { ZodError } from "zod";

export function errosDeZod(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const chave = issue.path.join(".");
    if (!out[chave]) out[chave] = issue.message;
  }
  return out;
}
