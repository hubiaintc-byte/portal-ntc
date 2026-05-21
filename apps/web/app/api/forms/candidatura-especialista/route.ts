import {
  aposCriarLead,
  checarRateLimit,
  extrairOrigem,
  POLITICA_VERSAO_ATUAL,
  schemaCandidatura,
  verificarHcaptcha,
} from "@ntc/lib";

import { obterPayload } from "@/lib/payloadClient";
import {
  errosDeZod,
  respostaArquivoMuitoGrande,
  respostaErro,
  respostaRateLimit,
  respostaSucesso,
  respostaValidacao,
} from "@/lib/respostaForm";

/**
 * POST /api/forms/candidatura-especialista
 *
 * Recebe multipart/form-data com o campo `curriculo` (PDF ≤10MB) e os
 * demais campos como JSON string (`origem`, `consentimentoLgpd`,
 * `linhasAtuacao`). Faz upload do PDF como Media (prefixo
 * `candidaturas/`) e persiste o Lead { tipo: 'candidatura' } apontando
 * para o arquivo via relationship.
 */

const MAX_MB = 10;

function tentarJson(s: FormDataEntryValue | null): unknown {
  if (typeof s !== "string") return s;
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respostaErro("Corpo da requisição inválido (esperado multipart/form-data).", 400);
  }

  const arquivo = form.get("curriculo");
  if (!(arquivo instanceof File)) {
    return respostaValidacao({ curriculo: "Envie o currículo em PDF." });
  }
  if (arquivo.type !== "application/pdf") {
    return respostaValidacao({ curriculo: "Apenas arquivos PDF são aceitos." });
  }
  if (arquivo.size > MAX_MB * 1024 * 1024) {
    return respostaArquivoMuitoGrande(MAX_MB);
  }

  const linhasAtuacaoRaw = tentarJson(form.get("linhasAtuacao"));
  const linhasAtuacao = Array.isArray(linhasAtuacaoRaw)
    ? (linhasAtuacaoRaw as unknown[]).filter((x): x is string => typeof x === "string")
    : [];

  const body = {
    nome: form.get("nome"),
    email: form.get("email"),
    telefone: form.get("telefone"),
    titulacao: form.get("titulacao"),
    apresentacao: form.get("apresentacao"),
    linkLattes: form.get("linkLattes") || undefined,
    linkLinkedin: form.get("linkLinkedin") || undefined,
    linhasAtuacao,
    origem: tentarJson(form.get("origem")),
    consentimentoLgpd: tentarJson(form.get("consentimentoLgpd")),
    hcaptchaToken: form.get("hcaptchaToken") ?? undefined,
  };

  const captchaToken =
    typeof body.hcaptchaToken === "string" ? (body.hcaptchaToken as string) : undefined;
  const captchaOk = await verificarHcaptcha(captchaToken);
  if (!captchaOk) return respostaErro("Falha na verificação de captcha.", 400);

  const validacao = schemaCandidatura.safeParse(body);
  if (!validacao.success) return respostaValidacao(errosDeZod(validacao.error));

  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  const limit = await checarRateLimit(ip, "/api/forms/candidatura-especialista");
  if (!limit.ok) return respostaRateLimit(limit.retryAfterSegundos);

  const dados = validacao.data;
  const origem = extrairOrigem(req, dados.origem);

  try {
    const payload = await obterPayload();

    // Upload do PDF como Media. Prefixo `candidaturas/` aplicado pelo
    // adapter S3 via campo `filename` — o storage-s3 do Payload usa o
    // `prefix` global da collection (média global é "media/"), então
    // colocamos o prefixo no nome do arquivo para isolar candidaturas.
    const bufferArquivo = Buffer.from(await arquivo.arrayBuffer());
    const nomeSeguro = arquivo.name.replace(/[^\w.\-]+/g, "_");
    const media = await payload.create({
      collection: "media",
      data: {
        alt: `Currículo — ${dados.nome}`,
      },
      file: {
        data: bufferArquivo,
        mimetype: arquivo.type,
        name: `candidaturas/${Date.now()}-${nomeSeguro}`,
        size: arquivo.size,
      },
    });

    const lead = await payload.create({
      collection: "leads",
      data: {
        tipo: "candidatura",
        status: "novo",
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        detalhesCandidatura: {
          titulacao: dados.titulacao,
          linhasAtuacao: dados.linhasAtuacao
            .map((id) => Number(id))
            .filter((n) => !Number.isNaN(n)),
          apresentacao: dados.apresentacao,
          linkLattes: dados.linkLattes || undefined,
          linkLinkedin: dados.linkLinkedin || undefined,
          curriculo: media.id,
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
        payloadBruto: {
          ...body,
          curriculo: { nome: arquivo.name, tamanho: arquivo.size, mime: arquivo.type, mediaId: media.id },
        },
      },
    });

    void aposCriarLead("candidatura", {
      id: lead.id,
      email: dados.email,
      nome: dados.nome,
    }).catch((err) => console.error("[aposCriarLead] candidatura", err));

    return respostaSucesso(lead.id, "Candidatura recebida. O corpo docente entrará em contato.");
  } catch (err) {
    console.error("[/api/forms/candidatura-especialista] erro persistência", err);
    return respostaErro("Falha interna ao registrar sua candidatura. Tente novamente em instantes.");
  }
}
