/**
 * Verificação de hCaptcha — stub flag-controlled.
 *
 * `HCAPTCHA_ENABLED=false` (default desta sessão) → retorna `true` sem chamar
 * provedor. Quando ligado em sessão própria, este módulo passa a chamar
 * `https://hcaptcha.com/siteverify` com `HCAPTCHA_SECRET` e o token do front.
 */
export async function verificarHcaptcha(_token: string | undefined): Promise<boolean> {
  const habilitado = process.env.HCAPTCHA_ENABLED === "true";
  if (!habilitado) return true;

  // Implementação real entra em sessão própria; sem token quando habilitado
  // é falha explícita.
  if (!_token) return false;

  // Stub conservador: enquanto a integração real não chega, falha se
  // habilitado sem token. Não chama o provedor ainda.
  return false;
}
