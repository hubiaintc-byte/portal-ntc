import "server-only";

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

import {
  conferirAutenticacao,
  conferirRegistro,
  montarOpcoesAutenticacao,
  montarOpcoesRegistro,
} from "@/lib/passkeys/webauthn";
import { assinarTokenDesafio, verificarTokenDesafio } from "@/lib/passkeys/tokens";
import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Orquestração de passkeys sobre a Local API do Payload — compõe o wrapper
 * puro de protocolo WebAuthn (@/lib/passkeys/webauthn) e os tokens
 * efêmeros assinados/cifrados (@/lib/passkeys/tokens) com leitura/escrita
 * na coleção `passkeys` (Task 1). Não fala com cookies/sessão/HTTP — só
 * recebe usuarioId como string; quem resolve "quem é o usuário atual" é a
 * Server Action que chama este módulo (Task 5).
 *
 * server-only: nunca vaza ao browser.
 */

const ERRO_GENERICO = "Não foi possível completar a operação. Tente novamente.";

interface PasskeyDoc {
  id: string | number;
  usuario: string | number | { id: string | number };
  apelido: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[] | null;
  createdAt: string;
  ultimoUsoEm: string | null;
}

async function buscarPasskeysDoUsuario(usuarioId: string): Promise<PasskeyDoc[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "passkeys",
    where: { usuario: { equals: usuarioId } },
    limit: 50,
    depth: 0,
    overrideAccess: true,
  });
  return res.docs as unknown as PasskeyDoc[];
}

export interface PasskeyResumo {
  id: string;
  apelido: string;
  criadoEm: string;
  ultimoUsoEm: string | null;
}

export async function listarPasskeysDoUsuario(usuarioId: string): Promise<PasskeyResumo[]> {
  const docs = await buscarPasskeysDoUsuario(usuarioId);
  return docs.map((d) => ({
    id: String(d.id),
    apelido: d.apelido,
    criadoEm: d.createdAt,
    ultimoUsoEm: d.ultimoUsoEm,
  }));
}

export async function prepararCadastroPasskey(
  usuarioId: string,
  emailUsuario: string,
  nomeUsuario: string,
): Promise<{ opcoes: PublicKeyCredentialCreationOptionsJSON; tokenDesafio: string }> {
  const existentes = await buscarPasskeysDoUsuario(usuarioId);
  const { opcoes, challenge } = await montarOpcoesRegistro({
    usuarioId,
    emailUsuario,
    nomeUsuario,
    credenciaisExistentes: existentes.map((d) => ({
      credentialId: d.credentialId,
      transports: d.transports ?? [],
    })),
  });
  const tokenDesafio = await assinarTokenDesafio({ userId: usuarioId, challenge });
  return { opcoes, tokenDesafio };
}

export async function confirmarCadastroPasskey(
  usuarioId: string,
  resposta: RegistrationResponseJSON,
  tokenDesafio: string,
  apelido: string,
): Promise<ResultadoEscrita> {
  const claims = await verificarTokenDesafio(tokenDesafio);
  if (!claims || claims.userId !== usuarioId) {
    return { ok: false, erro: "Desafio de cadastro expirado ou inválido. Tente novamente." };
  }
  try {
    const verificado = await conferirRegistro({ resposta, challenge: claims.challenge });
    if (!verificado) return { ok: false, erro: "Não foi possível verificar o passkey." };

    const payload = await obterPayload();
    await payload.create({
      collection: "passkeys",
      data: {
        // O tipo gerado do Payload exige number | User pro relationship, mas
        // a Local API aceita o id como string em runtime (mesmo padrão de
        // where: { usuario: { equals: usuarioId } } logo acima, que não
        // precisa desse cast por não passar pelo tipo de escrita).
        usuario: usuarioId as unknown as number,
        apelido,
        credentialId: verificado.credentialId,
        publicKey: verificado.publicKeyBase64,
        counter: verificado.counter,
        transports: verificado.transports,
      },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    console.error("[confirmarCadastroPasskey]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerPasskey(
  passkeyId: string,
  usuarioIdChamador: string,
  chamadorEhSuperAdmin: boolean,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const doc = (await payload.findByID({
      collection: "passkeys",
      id: passkeyId,
      overrideAccess: true,
    })) as unknown as PasskeyDoc;
    const donoId = typeof doc.usuario === "object" ? String(doc.usuario.id) : String(doc.usuario);
    if (!chamadorEhSuperAdmin && donoId !== usuarioIdChamador) {
      return { ok: false, erro: "Você não tem permissão para remover este passkey." };
    }
    await payload.delete({ collection: "passkeys", id: passkeyId, overrideAccess: true });
    return { ok: true };
  } catch (e) {
    console.error("[removerPasskey]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function prepararLoginPasskey(
  usuarioId: string,
): Promise<{ opcoes: PublicKeyCredentialRequestOptionsJSON; challenge: string } | null> {
  const docs = await buscarPasskeysDoUsuario(usuarioId);
  if (docs.length === 0) return null;
  return montarOpcoesAutenticacao({
    credenciaisPermitidas: docs.map((d) => ({
      credentialId: d.credentialId,
      transports: d.transports ?? [],
    })),
  });
}

export async function confirmarLoginPasskey(
  usuarioId: string,
  resposta: AuthenticationResponseJSON,
  challenge: string,
): Promise<boolean> {
  try {
    const docs = await buscarPasskeysDoUsuario(usuarioId);
    const doc = docs.find((d) => d.credentialId === resposta.id);
    if (!doc) return false;

    const verificado = await conferirAutenticacao({
      resposta,
      challenge,
      credentialIdEsperado: doc.credentialId,
      publicKeyBase64: doc.publicKey,
      counterAtual: doc.counter,
    });
    if (!verificado) return false;

    const payload = await obterPayload();
    await payload.update({
      collection: "passkeys",
      id: doc.id,
      data: { counter: verificado.novoContador, ultimoUsoEm: new Date().toISOString() },
      overrideAccess: true,
    });
    return true;
  } catch (e) {
    console.error("[confirmarLoginPasskey]", e);
    return false;
  }
}
