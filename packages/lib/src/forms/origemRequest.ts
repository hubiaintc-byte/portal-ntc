import { z } from "zod";

/**
 * Origem do submit do formulário coletada do request HTTP.
 *
 * Combina o que o front envia em `body.origem` (página atual, UTMs) com o
 * que o servidor consegue ler dos headers (`x-forwarded-for`, `referer`).
 * O IP entra no grupo `consentimentoLgpd.ipSubmissao` do Lead (CLAUDE.md §12).
 */

// A origem vem do navegador, não da pessoa (URL, referrer, UTMs): um valor
// longo é truncado em vez de recusar o envio de quem só preencheu o formulário.
const truncado = (n: number) => z.string().transform((v) => v.slice(0, n));
const url = () => truncado(1000);
const utm = () => truncado(200).optional();

export const origemFrontSchema = z.object({
  pagina: url(),
  referrer: url().optional(),
  utm_source: utm(),
  utm_medium: utm(),
  utm_campaign: utm(),
  utm_term: utm(),
  utm_content: utm(),
});

export type OrigemFront = z.infer<typeof origemFrontSchema>;

export interface OrigemResolvida {
  paginaSubmissao: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  ipSubmissao: string;
}

interface RequestLike {
  headers: { get(name: string): string | null };
}

export function extrairOrigem(request: RequestLike, origemFront: OrigemFront): OrigemResolvida {
  const xff = request.headers.get("x-forwarded-for");
  const xrip = request.headers.get("x-real-ip");
  const ip = (xff?.split(",")[0]?.trim() ?? xrip ?? "0.0.0.0").trim();
  const referer = request.headers.get("referer") ?? undefined;

  return {
    paginaSubmissao: origemFront.pagina,
    referrer: origemFront.referrer ?? referer,
    utmSource: origemFront.utm_source,
    utmMedium: origemFront.utm_medium,
    utmCampaign: origemFront.utm_campaign,
    utmTerm: origemFront.utm_term,
    utmContent: origemFront.utm_content,
    ipSubmissao: ip,
  };
}
