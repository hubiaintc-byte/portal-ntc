// apps/cms/src/lib/passkeys/rp.ts
import "server-only";

/**
 * Configuração de Relying Party do WebAuthn — deriva de
 * PAYLOAD_PUBLIC_SERVER_URL (já existe, nenhuma env var nova). rpID
 * precisa ser exatamente o hostname (sem porta, sem protocolo) — o
 * WebAuthn valida isso rigorosamente contra o domínio real do navegador.
 */
export interface ConfigRp {
  rpID: string;
  rpName: string;
  origin: string;
}

export function obterConfigRp(): ConfigRp {
  const url = new URL(process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001");
  return {
    rpID: url.hostname,
    rpName: "Painel Admin NTC",
    origin: url.origin,
  };
}
