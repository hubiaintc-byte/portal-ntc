"use client";

import { useEffect, useState } from "react";

import { stickyCtaCapacitacao } from "./conteudoCapacitacao";

/**
 * Sticky CTA mobile da página /capacitacao. Espelha o IIFE do protótipo
 * (linhas 2587-2605 de 27_Pagina_Capacitacao_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local, sem sessionStorage).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

export function StickyCtaCapacitacao() {
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
    track("cap_sticky_cta_dismissed", { page: "capacitacao" });
  };

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
        className={stickyCtaCapacitacao.classe ?? "btn btn--gold"}
        href={stickyCtaCapacitacao.href}
        data-cms-link={stickyCtaCapacitacao.cmsLink}
        data-track={stickyCtaCapacitacao.track}
      >
        {stickyCtaCapacitacao.texto}
        {stickyCtaCapacitacao.arrow && <span className="btn-arrow"> →</span>}
      </a>
    </aside>
  );
}
