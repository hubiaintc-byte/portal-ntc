"use client";

import { useEffect } from "react";

/** Registra o service worker do app Painel NTC (offline + avisos push). */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((e: unknown) => {
      console.error("[sw] falha ao registrar", e);
    });
  }, []);
  return null;
}
