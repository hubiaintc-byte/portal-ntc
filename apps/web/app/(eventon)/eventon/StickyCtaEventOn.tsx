"use client";

import { useEffect, useState } from "react";

import { stickyCtaEventOn } from "./conteudoEventOn";

/**
 * CTA fixo mobile da página /eventon. Espelha o IIFE 4 de
 * 27_Pagina_EventOn_v1.html, no molde de StickyCtaCapacitacao:
 *
 * - Aparece após `scrollY > 800` (o CSS só o mostra abaixo de 768px).
 * - O `×` dispensa para o resto da sessão (estado local).
 */

export function StickyCtaEventOn() {
  const [visivel, setVisivel] = useState(false);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    if (dispensado) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisivel(window.scrollY > 800);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [dispensado]);

  if (dispensado) return null;

  return (
    <div
      className={`sticky-cta-mobile${visivel ? " is-visible" : ""}`}
      id="stickyCta"
      role="complementary"
      aria-label="Chamada institucional móvel"
    >
      <button
        className="sticky-cta-mobile-dismiss"
        id="stickyCtaDismiss"
        type="button"
        aria-label="Fechar chamada"
        onClick={() => setDispensado(true)}
      >
        ×
      </button>
      <a
        className={stickyCtaEventOn.classe}
        href={stickyCtaEventOn.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cms-link={stickyCtaEventOn.cmsLink}
        data-track={stickyCtaEventOn.track}
      >
        {stickyCtaEventOn.texto} <span className="btn-arrow">→</span>
      </a>
    </div>
  );
}
