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

/**
 * Teto do corpo JSON dos formulários: o maior envio legítimo (mensagem de
 * 5.000 caracteres + campos curtos + origem) fica bem abaixo disso. Sem ele,
 * um script poderia gravar leads de ~4 MB cada (limite da Vercel), já que o
 * `payloadBruto` guarda o corpo inteiro.
 */
export const LIMITE_CORPO_BYTES = 64 * 1024;

export type CorpoLido =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; resposta: NextResponse };

/** Lê o corpo como objeto JSON, recusando o que passar do teto (413) ou não for objeto (400). */
export async function lerCorpoJson(req: Request, limite = LIMITE_CORPO_BYTES): Promise<CorpoLido> {
  const grande = { ok: false as const, resposta: respostaErro("O envio passou do tamanho permitido.", 413) };
  const invalido = { ok: false as const, resposta: respostaErro("Corpo da requisição inválido.", 400) };
  if (Number(req.headers.get("content-length") ?? 0) > limite) return grande;
  const texto = await req.text().catch(() => null);
  if (texto === null) return invalido;
  if (new TextEncoder().encode(texto).byteLength > limite) return grande;
  let body: unknown;
  try {
    body = JSON.parse(texto);
  } catch {
    return invalido;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return invalido;
  return { ok: true, body: body as Record<string, unknown> };
}

/** O corpo cru para o `payloadBruto`, sem o token do captcha (uso único, não precisa ficar no banco). */
export function corpoParaRegistro(body: Record<string, unknown>): Record<string, unknown> {
  const resto = { ...body };
  delete resto.hcaptchaToken;
  return resto;
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
