import {
  aposCriarLead,
  checarRateLimit,
  extrairOrigem,
  POLITICA_VERSAO_ATUAL,
  schemaNewsletter,
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
 * POST /api/forms/newsletter
 *
 * Persiste um Lead { tipo: 'newsletter' } com áreas de interesse. As
 * IDs em `areasInteresse` são strings vindas do front e convertidas
 * para number antes de ir ao Payload (relationship hasMany para `areas`).
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

  const validacao = schemaNewsletter.safeParse(body);
  if (!validacao.success) return respostaValidacao(errosDeZod(validacao.error));

  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const limit = await checarRateLimit(ip, "/api/forms/newsletter");
  if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);

  const dados = validacao.data;
  const origem = extrairOrigem(req, dados.origem);

  try {
    const payload = await obterPayload();
    const lead = await payload.create({
      collection: "leads",
      data: {
        tipo: "newsletter",
        status: "novo",
        nome: dados.nome,
        email: dados.email,
        detalhesNewsletter: {
          areasInteresse: dados.areasInteresse.map((id) => Number(id)).filter((n) => !Number.isNaN(n)),
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

    void aposCriarLead("newsletter", {
      id: lead.id,
      email: dados.email,
      nome: dados.nome,
    }).catch((err) => console.error("[aposCriarLead] newsletter", err));

    return respostaSucesso(lead.id, "Inscrição confirmada. Em breve você receberá nossos conteúdos.");
  } catch (err) {
    console.error("[/api/forms/newsletter] erro persistência", err);
    return respostaErro("Falha interna ao registrar sua inscrição. Tente novamente em instantes.");
  }
}
