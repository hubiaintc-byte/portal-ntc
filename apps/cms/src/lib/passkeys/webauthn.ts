import "server-only";

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { obterConfigRp } from "./rp";

/**
 * Wrapper puro sobre @simplewebauthn/server — SEM nenhuma dependência de
 * Payload/Local API. Quem chama (lib/cms/painelPasskeys.ts) resolve as
 * credenciais existentes e persiste o resultado; este módulo só fala o
 * protocolo WebAuthn.
 */

export interface CredencialParaOpcoes {
  credentialId: string;
  transports: string[];
}

export async function montarOpcoesRegistro(params: {
  usuarioId: string;
  emailUsuario: string;
  nomeUsuario: string;
  credenciaisExistentes: CredencialParaOpcoes[];
}): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; challenge: string }> {
  const { rpID, rpName } = obterConfigRp();
  const opcoes = await generateRegistrationOptions({
    rpID,
    rpName,
    userID: new TextEncoder().encode(params.usuarioId),
    userName: params.emailUsuario,
    userDisplayName: params.nomeUsuario,
    attestationType: "none",
    excludeCredentials: params.credenciaisExistentes.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });
  return { opcoes, challenge: opcoes.challenge };
}

export interface RegistroVerificado {
  credentialId: string;
  publicKeyBase64: string;
  counter: number;
  transports: string[];
}

export async function conferirRegistro(params: {
  resposta: RegistrationResponseJSON;
  challenge: string;
}): Promise<RegistroVerificado | null> {
  const { rpID, origin } = obterConfigRp();
  const verificacao = await verifyRegistrationResponse({
    response: params.resposta,
    expectedChallenge: params.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  if (!verificacao.verified || !verificacao.registrationInfo) return null;
  const { credential } = verificacao.registrationInfo;
  return {
    credentialId: credential.id,
    publicKeyBase64: Buffer.from(credential.publicKey).toString("base64"),
    counter: credential.counter,
    transports: credential.transports ?? [],
  };
}

export async function montarOpcoesAutenticacao(params: {
  credenciaisPermitidas: CredencialParaOpcoes[];
}): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string }> {
  const { rpID } = obterConfigRp();
  const opcoes = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: params.credenciaisPermitidas.map((c) => ({
      id: c.credentialId,
      transports: c.transports,
    })),
  });
  return { opcoes, challenge: opcoes.challenge };
}

export async function conferirAutenticacao(params: {
  resposta: AuthenticationResponseJSON;
  challenge: string;
  credentialIdEsperado: string;
  publicKeyBase64: string;
  counterAtual: number;
}): Promise<{ novoContador: number } | null> {
  const { rpID, origin } = obterConfigRp();
  const verificacao = await verifyAuthenticationResponse({
    response: params.resposta,
    expectedChallenge: params.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: params.credentialIdEsperado,
      publicKey: new Uint8Array(Buffer.from(params.publicKeyBase64, "base64")),
      counter: params.counterAtual,
    },
  });
  if (!verificacao.verified) return null;
  const { newCounter } = verificacao.authenticationInfo;
  // Contador não avançou (ou retrocedeu) = indício de credencial clonada/replay.
  if (newCounter <= params.counterAtual) {
    console.error("[conferirAutenticacao] contador não avançou — possível clonagem", {
      credentialId: params.credentialIdEsperado,
      counterAtual: params.counterAtual,
      newCounter,
    });
    return null;
  }
  return { novoContador: newCounter };
}
