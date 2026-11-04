"use client";

import { useSyncExternalStore } from "react";

import { estaInstalado, plataforma } from "@/lib/avisos/navegador";

const TEXTO_POR_PLATAFORMA = {
  ios: "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.",
  android: "No Chrome, abra o menu e toque em Instalar app.",
  desktop: "No Chrome ou no Edge, clique no ícone de instalar na barra de endereço.",
} as const;

/** Nada a assinar: o modo de exibição e a plataforma não mudam com a página aberta. */
function semAssinatura(): () => void {
  return () => {};
}

function textoDoAparelho(): string | null {
  return estaInstalado() ? null : TEXTO_POR_PLATAFORMA[plataforma()];
}

/**
 * Como instalar o app Painel NTC neste aparelho. Some quando o painel já
 * está aberto como app instalado. Decide no cliente (depende do navegador),
 * por isso não renderiza nada no servidor.
 */
export function OrientacaoInstalacao() {
  // No servidor (e na hidratação) é `null`; o navegador decide depois.
  const texto = useSyncExternalStore(semAssinatura, textoDoAparelho, () => null);

  if (!texto) return null;
  return <p className="pcms-editor__hint">{texto}</p>;
}
