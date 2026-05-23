import { NextResponse } from "next/server";

/**
 * Resposta padronizada para as 4 rotas `/api/forms/*` enquanto o
 * Payload/CMS não está implantado em produção (sessão de deploy
 * 2026-05-23). Mantém o contrato `FormularioResposta` consumido
 * pelo `<FormularioSoberano>` em @ntc/ui, mas com `ok: false`.
 *
 * Quando o CMS subir, deletar este helper e restaurar os handlers
 * originais que chamam `obterPayload()` (ver `lib/payloadClient.ts`).
 */
export function respostaFormsOff() {
  return NextResponse.json(
    {
      ok: false,
      message: "Formulários temporariamente indisponíveis. Em breve voltam ao ar.",
    },
    { status: 503 },
  );
}
