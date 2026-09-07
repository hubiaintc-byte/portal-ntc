/**
 * Rate limit por (IP, rota) — decisão pura, store injetado.
 *
 * O store real vive em cada app (só eles alcançam a Local API do
 * Payload); aqui fica a regra: contar as tentativas da janela, decidir,
 * registrar a atual e apagar o que saiu da janela. Mesma ideia de
 * superfície mínima mockável de `PayloadUsuarios` em painelCmsUsuarios.ts.
 *
 * Falha fechada: se o store quebrar, a requisição é BLOQUEADA. Tratar
 * erro de banco como "pode passar" transformaria uma indisponibilidade
 * em porta aberta.
 */
export interface ResultadoRateLimit {
  ok: boolean;
  retryAfterSegundos?: number;
}

export interface LimiteRota {
  maxTentativas: number;
  janelaSegundos: number;
}

export interface StoreRateLimit {
  contarDesde(rota: string, ip: string, desde: Date): Promise<number>;
  registrar(rota: string, ip: string): Promise<void>;
  limparAntesDe(rota: string, ip: string, antesDe: Date): Promise<void>;
}

/** Formulários públicos: 5 envios por IP a cada 10 minutos. */
export const LIMITE_PADRAO: LimiteRota = { maxTentativas: 5, janelaSegundos: 600 };

/**
 * Recuperação de senha: mais apertado. O endereço do admin é conhecido e
 * cada tentativa dispara um e-mail — 3 por IP a cada 15 minutos.
 */
export const LIMITE_RECUPERACAO: LimiteRota = { maxTentativas: 3, janelaSegundos: 900 };

export async function checarRateLimit(
  ip: string,
  rota: string,
  store: StoreRateLimit,
  limite: LimiteRota = LIMITE_PADRAO,
): Promise<ResultadoRateLimit> {
  if (process.env.RATELIMIT_ENABLED !== "true") return { ok: true };

  const inicioJanela = new Date(Date.now() - limite.janelaSegundos * 1000);
  try {
    await store.limparAntesDe(rota, ip, inicioJanela);
    const tentativas = await store.contarDesde(rota, ip, inicioJanela);
    if (tentativas >= limite.maxTentativas) {
      return { ok: false, retryAfterSegundos: limite.janelaSegundos };
    }
    await store.registrar(rota, ip);
    return { ok: true };
  } catch (e) {
    console.error("[checarRateLimit]", e);
    return { ok: false, retryAfterSegundos: limite.janelaSegundos };
  }
}
