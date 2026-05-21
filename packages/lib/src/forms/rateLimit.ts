/**
 * Rate limit por (IP, rota) — stub flag-controlled.
 *
 * `RATELIMIT_ENABLED=false` (default desta sessão) → retorna `{ ok: true }`
 * sem armazenar nada. Quando ligado em sessão própria, este módulo será
 * substituído por implementação com store distribuído (Upstash Redis ou
 * equivalente). Manter o contrato — o resto do código não muda.
 */
export interface ResultadoRateLimit {
  ok: boolean;
  retryAfterSegundos?: number;
}

export async function checarRateLimit(_ip: string, _rota: string): Promise<ResultadoRateLimit> {
  const habilitado = process.env.RATELIMIT_ENABLED === "true";
  if (!habilitado) return { ok: true };

  // Stub: sem store ainda; sessão própria implementa. Devolve ok para não
  // bloquear o desenvolvimento quando alguém liga a flag por engano.
  return { ok: true };
}
