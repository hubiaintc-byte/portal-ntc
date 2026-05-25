"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA_CONTEUDOS } from "./conteudoConteudos";

/**
 * Sticky CTA mobile da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2478-2497 de 28_Pagina_Conteudos_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

export function StickyCtaConteudos() {
  const [visivel, setVisivel] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
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
  }, [dismissed]);

  if (dismissed) return null;

  const onDismiss = () => {
    setDismissed(true);
    setVisivel(false);
    track("cont_sticky_cta_dismissed", { page: "conteudos" });
  };

  const { cta } = STICKY_CTA_CONTEUDOS;

  return (
    <aside
      className={`sticky-cta-mobile${visivel ? " is-visible" : ""}`}
      id="stickyCta"
      aria-label="Ação rápida"
    >
      <button
        className="sticky-cta-mobile-dismiss"
        id="stickyCtaDismiss"
        type="button"
        aria-label="Fechar"
        onClick={onDismiss}
      >
        ×
      </button>
      <a
        className={cta.classe ?? "btn btn--gold"}
        href={cta.href}
        data-cms-link={cta.cmsLink}
        data-track={cta.track}
      >
        {cta.texto}
        {cta.arrow && <span className="btn-arrow"> →</span>}
      </a>
    </aside>
  );
}
