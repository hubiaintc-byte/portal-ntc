import {
  aposCriarLead,
  checarRateLimit,
  extrairOrigem,
  POLITICA_VERSAO_ATUAL,
  schemaContato,
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
 * POST /api/forms/contato
 *
 * Persiste um Lead { tipo: 'contato' } no Payload. Distribuição interna
 * (imprensa@/parcerias@/contato@) será feita pela sessão de e-mail,
 * com base em `detalhesContato.assunto`.
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

  const validacao = schemaContato.safeParse(body);
  if (!validacao.success) return respostaValidacao(errosDeZod(validacao.error));

  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const limit = await checarRateLimit(ip, "/api/forms/contato");
  if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);

  const dados = validacao.data;
  const origem = extrairOrigem(req, dados.origem);

  try {
    const payload = await obterPayload();
    const lead = await payload.create({
      collection: "leads",
      data: {
        tipo: "contato",
        status: "novo",
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cargo: dados.cargo,
        instituicao: dados.instituicao,
        detalhesContato: {
          assunto: dados.assunto,
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

    void aposCriarLead("contato", {
      id: lead.id,
      email: dados.email,
      nome: dados.nome,
    }).catch((err) => console.error("[aposCriarLead] contato", err));

    return respostaSucesso(lead.id);
  } catch (err) {
    console.error("[/api/forms/contato] erro persistência", err);
    return respostaErro("Falha interna ao registrar sua mensagem. Tente novamente em instantes.");
  }
}
