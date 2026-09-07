"use client";

/**
 * Widget do Cloudflare Turnstile. O script injeta um input escondido
 * `cf-turnstile-response` dentro do <form> que envolve este componente —
 * o submit lê o token de lá.
 *
 * Sem `NEXT_PUBLIC_TURNSTILE_SITE_KEY` o componente não renderiza nada:
 * é o estado de entrega desta sessão (chaves ainda não provisionadas) e
 * também o comportamento certo em dev local.
 *
 * O <script async> é o nativo do React 19 (hoisted para o <head> e
 * deduplicado por src), não o `next/script`: @ntc/ui não depende do Next
 * e não vai passar a depender por causa de uma tag de script.
 */
export function CampoTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-language="pt-br" />
    </>
  );
}
