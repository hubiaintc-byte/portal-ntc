"use client";

import { useEffect } from "react";

/**
 * `InteracoesScroll` — porta o script de "aparição ao scroll" do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html (linhas 3551–3561).
 *
 * Procura todos os elementos `.fade-in` e adiciona `.is-visible`
 * quando entram em ~8% do viewport. Sem IO disponível, marca tudo
 * imediatamente.
 *
 * Sem este componente, todos os blocos da Home ficam com
 * `opacity: 0` (regra `.fade-in` do home-prototipo.css), o que faz
 * a página parecer vazia abaixo do hero slider.
 */
export function InteracoesScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const alvos = document.querySelectorAll<HTMLElement>(".fade-in");
    if (alvos.length === 0) return;

    if (!("IntersectionObserver" in window)) {
      alvos.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    alvos.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
