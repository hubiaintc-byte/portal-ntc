import { z } from "zod";

/**
 * Origem do submit do formulário coletada do request HTTP.
 *
 * Combina o que o front envia em `body.origem` (página atual, UTMs) com o
 * que o servidor consegue ler dos headers (`x-forwarded-for`, `referer`).
 * O IP entra no grupo `consentimentoLgpd.ipSubmissao` do Lead (CLAUDE.md §12).
 */

export const origemFrontSchema = z.object({
  pagina: z.string(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
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
