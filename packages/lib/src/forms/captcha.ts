/**
 * Verificação de captcha via Cloudflare Turnstile (decisão do PO em
 * 07/09/2026 — substitui o hCaptcha que só existia no nome).
 *
 * Falha fechada em todos os caminhos de erro: sem token, sem secret,
 * provedor fora do ar ou resposta inesperada ⇒ rejeita. Tratar
 * indisponibilidade do provedor como "pode passar" abriria o formulário
 * justamente quando não dá pra verificar nada.
 *
 * Com `CAPTCHA_ENABLED` diferente de "true" a verificação é pulada — é
 * o estado de entrega desta sessão, até o PO provisionar as chaves.
 */
const URL_SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface RespostaSiteverify {
  success?: boolean;
}

export async function verificarCaptcha(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  if (process.env.CAPTCHA_ENABLED !== "true") return true;
  if (!token) return false;

  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    console.error("[verificarCaptcha] CAPTCHA_ENABLED=true mas TURNSTILE_SECRET não está definida");
    return false;
  }

  const corpo = new URLSearchParams({ secret, response: token });
  if (ip) corpo.set("remoteip", ip);

  try {
    const res = await fetch(URL_SITEVERIFY, { method: "POST", body: corpo });
    if (!res.ok) {
      console.error("[verificarCaptcha] siteverify respondeu", res.status);
      return false;
    }
    const dados = (await res.json()) as RespostaSiteverify;
    return dados.success === true;
  } catch (e) {
    console.error("[verificarCaptcha]", e);
    return false;
  }
}
