"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import { Icone, type NomeIcone } from "./Icone";
import { PortalFin05 } from "./PortalFin05";

/**
 * `openMenu(anchor, items)` do protótipo FIN-05: `.menu[role=menu]` fixo junto
 * do botão que o abriu (alinhado à direita dele; sobe se não couber embaixo),
 * com `button[role=menuitem]` (`.danger`), separadores `hr` e cabeçalhos
 * `.mh`. Foco vai ao primeiro item; Esc e clique fora fecham; setas sobem e
 * descem; ao fechar o foco volta ao botão. Sai por `PortalFin05`.
 */

export interface ItemMenu {
  rotulo: string;
  icone?: NomeIcone;
  perigo?: boolean;
  acao: () => void;
}

export type EntradaMenu = ItemMenu | "-" | { cabecalho: string };

interface MenuContextoProps {
  ancora: HTMLElement;
  itens: EntradaMenu[];
  aoFechar: () => void;
  /** Nome acessível do menu. */
  rotulo: string;
}

export function MenuContexto({ ancora, itens, aoFechar, rotulo }: MenuContextoProps) {
  const caixa = useRef<HTMLDivElement>(null);
  const aoFecharRef = useRef(aoFechar);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

  useLayoutEffect(() => {
    const m = caixa.current;
    if (!m) return;
    const r = ancora.getBoundingClientRect();
    let left = r.right - m.offsetWidth;
    if (left < 8) left = r.left;
    let top = r.bottom + 6;
    if (top + m.offsetHeight > window.innerHeight - 8) top = r.top - m.offsetHeight - 6;
    // Posição escrita direto no elemento já medido (sem estado: nada a re-renderizar).
    m.style.left = `${Math.max(8, left)}px`;
    m.style.top = `${Math.max(8, top)}px`;
    m.style.visibility = "visible";
    m.querySelector<HTMLButtonElement>("button")?.focus();
  }, [ancora]);

  useEffect(() => {
    function clicar(e: MouseEvent) {
      if (
        e.target instanceof Node &&
        (caixa.current?.contains(e.target) || ancora.contains(e.target))
      )
        return;
      aoFecharRef.current();
    }
    function teclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        aoFecharRef.current();
        ancora.focus();
        return;
      }
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const bs = Array.from(caixa.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      if (bs.length === 0) return;
      e.preventDefault();
      const i = bs.indexOf(document.activeElement as HTMLButtonElement);
      const j = e.key === "ArrowDown" ? (i + 1) % bs.length : (i - 1 + bs.length) % bs.length;
      bs[j]?.focus();
    }
    document.addEventListener("mousedown", clicar);
    document.addEventListener("keydown", teclar, true);
    return () => {
      document.removeEventListener("mousedown", clicar);
      document.removeEventListener("keydown", teclar, true);
    };
  }, [ancora]);

  return (
    <PortalFin05>
      <div
        ref={caixa}
        className="menu"
        role="menu"
        aria-label={rotulo}
        style={{ visibility: "hidden", left: 0, top: 0 }}
      >
        {itens.map((it, i) => {
          if (it === "-") return <hr key={i} />;
          if ("cabecalho" in it)
            return (
              <div key={i} className="mh">
                {it.cabecalho}
              </div>
            );
          return (
            <button
              key={i}
              type="button"
              role="menuitem"
              className={it.perigo ? "danger" : undefined}
              onClick={(e) => {
                e.stopPropagation();
                aoFechar();
                it.acao();
              }}
            >
              <Icone nome={it.icone ?? "dot"} tamanho="sm" />
              <span>{it.rotulo}</span>
            </button>
          );
        })}
      </div>
    </PortalFin05>
  );
}
