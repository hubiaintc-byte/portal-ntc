// apps/cms/src/lib/passkeys/tokens.ts
import "server-only";

import { createHash } from "node:crypto";

import { EncryptJWT, jwtDecrypt, jwtVerify, SignJWT } from "jose";

/**
 * Duas chaves simétricas de 32 bytes derivadas de PAYLOAD_SECRET via
 * SHA-256 com contexto diferente cada uma (substitui HKDF — jose@5.9.6
 * não exporta hkdf; SHA-256 com sufixo de contexto dá a mesma separação
 * de domínio para este caso de uso). Nunca reusar a mesma chave para JWE
 * e JWS — são propósitos diferentes.
 */
function chave(contexto: string): Uint8Array {
  const segredo = process.env.PAYLOAD_SECRET ?? "";
  return createHash("sha256").update(`${segredo}:${contexto}`).digest();
}

const CHAVE_PONTE = () => chave("passkey-ponte-jwe");
const CHAVE_DESAFIO = () => chave("passkey-desafio-jws");

export interface ClaimsPonte {
  userId: string;
  sessaoReal: string;
  challenge: string;
  manter: boolean;
}

/** Token de ponte do login — CIFRADO (JWE), carrega a sessão real. 5 min. */
export async function cifrarTokenPonte(claims: ClaimsPonte): Promise<string> {
  return new EncryptJWT({ ...claims })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .encrypt(CHAVE_PONTE());
}

/** null em qualquer falha (expirado, adulterado, malformado) — nunca lança. */
export async function decifrarTokenPonte(token: string): Promise<ClaimsPonte | null> {
  try {
    const { payload } = await jwtDecrypt(token, CHAVE_PONTE());
    return {
      userId: String(payload.userId),
      sessaoReal: String(payload.sessaoReal),
      challenge: String(payload.challenge),
      manter: Boolean(payload.manter),
    };
  } catch (e) {
    console.error("[decifrarTokenPonte]", e);
    return null;
  }
}

export interface ClaimsDesafio {
  userId: string;
  challenge: string;
}

/** Token de desafio do cadastro — só ASSINADO (JWS), nada secreto dentro. 5 min. */
export async function assinarTokenDesafio(claims: ClaimsDesafio): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(CHAVE_DESAFIO());
}

export async function verificarTokenDesafio(token: string): Promise<ClaimsDesafio | null> {
  try {
    const { payload } = await jwtVerify(token, CHAVE_DESAFIO());
    return { userId: String(payload.userId), challenge: String(payload.challenge) };
  } catch (e) {
    console.error("[verificarTokenDesafio]", e);
    return null;
  }
}
