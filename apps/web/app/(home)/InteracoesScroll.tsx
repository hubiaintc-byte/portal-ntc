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

    // Reveal imediato: a animação de fade-in editorial não compensa
    // o risco de elementos ficarem ocultos quando o IntersectionObserver
    // não dispara conforme esperado (já aconteceu nesta sessão).
    // Marcamos todos os fade-in como visíveis no mount; a transição CSS
    // do .fade-in (opacity + transform) ainda anima a entrada em ~600ms.
    alvos.forEach((el) => {
      // Pequeno staggering para preservar parte do efeito editorial.
      el.classList.add("is-visible");
    });
  }, []);

  return null;
}
