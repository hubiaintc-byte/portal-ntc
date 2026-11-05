"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Raiz `.fin05` do módulo, para camadas `position: fixed` (gaveta, modal,
 * menu, toasts, dica). Elas não podem ficar dentro de `.view-enter`: a
 * animação de entrada usa `transform`, e durante ela um descendente fixo é
 * posicionado contra o contêiner animado e "pula". Renderizadas por portal
 * direto no `.fin05` (que não tem transform), continuam com os estilos
 * escopados e ficam presas à janela.
 *
 * Valor do contexto: `undefined` = fora do `ShellFinanceiro` (renderiza no
 * lugar); `null` = raiz ainda não montada (não renderiza).
 */
export const RaizFin05Contexto = createContext<HTMLElement | null | undefined>(undefined);

/** O elemento `.fin05` do casco (ver `RaizFin05Contexto`). */
export function useRaizFin05(): HTMLElement | null | undefined {
  return useContext(RaizFin05Contexto);
}

/** Renderiza `children` direto no `.fin05`, fora do `.view-enter`. */
export function PortalFin05({ children }: { children: ReactNode }) {
  const raiz = useRaizFin05();
  if (raiz === undefined) return <>{children}</>;
  if (raiz === null) return null;
  return createPortal(children, raiz);
}
