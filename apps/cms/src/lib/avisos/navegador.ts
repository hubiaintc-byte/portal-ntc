"use client";

import { desativarAvisosCms } from "@/app/(painel)/acoesAuth";

/**
 * Helpers do navegador para os avisos (web push) e a instalação do app
 * Painel NTC. Código de cliente: nada aqui roda no servidor, e o único
 * contato com ele é a Server Action de desativar.
 */

/** O navegador tem tudo o que o web push precisa. */
export function suportaAvisos(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** O painel está aberto como app instalado (tela cheia), não numa aba. */
export function estaInstalado(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneIos = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return window.matchMedia("(display-mode: standalone)").matches || standaloneIos;
}

export function plataforma(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent;
  // iPad com iPadOS se apresenta como Mac; o toque denuncia.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/** Converte a chave pública VAPID (base64url) no formato que o `pushManager` aceita. */
export function base64UrlParaUint8Array(s: string): Uint8Array {
  const preenchimento = "=".repeat((4 - (s.length % 4)) % 4);
  const base64 = (s + preenchimento).replace(/-/g, "+").replace(/_/g, "/");
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/** Inscreve este aparelho no push (reaproveita a inscrição existente). */
export async function inscreverEsteAparelho(chavePublica: string): Promise<PushSubscriptionJSON> {
  const registro = await navigator.serviceWorker.ready;
  const existente = await registro.pushManager.getSubscription();
  const inscricao =
    existente ??
    (await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaUint8Array(chavePublica) as BufferSource,
    }));
  return inscricao.toJSON();
}

/**
 * Cancela a inscrição deste aparelho e apaga a do servidor. Devolve o
 * endpoint removido, ou `null` se o aparelho não estava inscrito.
 */
export async function desinscreverEsteAparelho(): Promise<string | null> {
  if (!suportaAvisos()) return null;
  const registro = await navigator.serviceWorker.getRegistration("/");
  const inscricao = await registro?.pushManager.getSubscription();
  if (!inscricao) return null;
  const endpoint = inscricao.endpoint;
  await inscricao.unsubscribe();
  await desativarAvisosCms(endpoint);
  return endpoint;
}

/**
 * Para o "Sair": cancela a inscrição só no navegador, sem chamar Server
 * Action (a action `sair` apaga a do banco). Espera no máximo `limiteMs`,
 * engole erros e devolve o endpoint que estava inscrito, ou `null`.
 */
export async function cancelarInscricaoLocal(limiteMs: number): Promise<string | null> {
  let endpoint: string | null = null;
  let relogio: ReturnType<typeof setTimeout> | undefined;
  const esgotou = new Promise<void>((resolver) => {
    relogio = setTimeout(resolver, limiteMs);
  });
  const cancelar = (async () => {
    if (!suportaAvisos()) return;
    const registro = await navigator.serviceWorker.getRegistration("/");
    const inscricao = await registro?.pushManager.getSubscription();
    if (!inscricao) return;
    endpoint = inscricao.endpoint;
    await inscricao.unsubscribe();
  })().catch(() => undefined);
  try {
    await Promise.race([cancelar, esgotou]);
  } finally {
    clearTimeout(relogio);
  }
  return endpoint;
}
