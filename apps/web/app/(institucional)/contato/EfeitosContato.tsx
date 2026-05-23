"use client";

import { useEffect } from "react";

/**
 * Efeitos visuais específicos da página /contato.
 *
 * Responsabilidade única: smooth scroll para anchors internos (exceto
 * `#tab-*`, que são tratados pelo RoteadorFormularios). Subtrai 88px
 * do header fixo ao calcular o destino.
 *
 * O reveal de elementos `.fade-in` é responsabilidade do
 * `<InteracoesScroll />` montado em `(institucional)/layout.tsx`.
 *
 * Sem render — apenas side effect global. Montado uma vez no page.tsx.
 */
export function EfeitosContato() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>(
        'a[href^="#"]:not([href^="#tab-"])',
      );
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.length <= 1) return;
      const destino = document.querySelector(href);
      if (!destino) return;
      event.preventDefault();
      const top = destino.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
