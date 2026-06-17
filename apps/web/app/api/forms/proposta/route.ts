import {
  aposCriarLead,
  checarRateLimit,
  extrairOrigem,
  POLITICA_VERSAO_ATUAL,
  schemaProposta,
  verificarHcaptcha,
} from "@ntc/lib";

import { obterPayload } from "@/lib/payloadClient";
import {
  errosDeZod,
  respostaErro,
  respostaRateLimit,
  respostaSucesso,
  respostaValidacao,
} from "@/lib/respostaForm";

/**
 * POST /api/forms/proposta
 *
 * Persiste um Lead { tipo: 'proposta' } no Payload e dispara
 * fire-and-forget `aposCriarLead` (no-op nesta sessão; sessão futura
 * troca por Resend). Pipeline alinhado à DAB §7 e §9 — persistência
 * precede side-effects, Lead nunca se perde.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return respostaErro("Corpo da requisição inválido.", 400);
  }

  const captchaToken =
    typeof (body as Record<string, unknown>).hcaptchaToken === "string"
      ? ((body as Record<string, unknown>).hcaptchaToken as string)
      : undefined;
  const captchaOk = await verificarHcaptcha(captchaToken);
  if (!captchaOk) return respostaErro("Falha na verificação de captcha.", 400);

  const validacao = schemaProposta.safeParse(body);
  if (!validacao.success) return respostaValidacao(errosDeZod(validacao.error));

  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const limit = await checarRateLimit(ip, "/api/forms/proposta");
  if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);

  const dados = validacao.data;
  const origem = extrairOrigem(req, dados.origem);

  try {
    const payload = await obterPayload();
    const lead = await payload.create({
      collection: "leads",
      data: {
        tipo: "proposta",
        status: "novo",
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cargo: dados.cargo,
        instituicao: dados.instituicao,
        esfera: dados.esfera,
        detalhesProposta: {
          programa: dados.programaId ? Number(dados.programaId) : undefined,
          modalidade: dados.modalidade,
          participantesEstimados: dados.participantesEstimados,
          mensagem: dados.mensagem,
        },
        origem: {
          paginaSubmissao: origem.paginaSubmissao,
          referrer: origem.referrer,
          utmSource: origem.utmSource,
          utmMedium: origem.utmMedium,
          utmCampaign: origem.utmCampaign,
          utmTerm: origem.utmTerm,
          utmContent: origem.utmContent,
        },
        consentimentoLgpd: {
          aceito: true,
          timestamp: new Date().toISOString(),
          politicaVersao: dados.consentimentoLgpd.politicaVersao || POLITICA_VERSAO_ATUAL,
          ipSubmissao: origem.ipSubmissao,
        },
        payloadBruto: body as Record<string, unknown>,
      },
    });

    void aposCriarLead("proposta", {
      id: lead.id,
      email: dados.email,
      nome: dados.nome,
    }).catch((err) => console.error("[aposCriarLead] proposta", err));

    return respostaSucesso(lead.id);
  } catch (err) {
    console.error("[/api/forms/proposta] erro persistência", err);
    return respostaErro("Falha interna ao registrar sua solicitação. Tente novamente em instantes.");
  }
}
