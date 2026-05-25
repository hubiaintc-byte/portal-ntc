"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA_SOLUCOES } from "./conteudoSolucoes";

/**
 * Sticky CTA mobile da página /solucoes. Espelha o IIFE do protótipo
 * (linhas 2243-2258 de 26_Pagina_Solucoes_v1.html):
 *
 * - Aparece após `scrollY > 800`.
 * - Botão `×` dismissa para o restante da sessão (estado local, sem
 *   sessionStorage — diferente do /agenda).
 * - Listener `scroll` passive com debounce via requestAnimationFrame.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

export function StickyCtaSolucoes() {
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
    track("sticky_cta_dismissed", { page: "solucoes" });
  };

  const { cta } = STICKY_CTA_SOLUCOES;

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
    </div>
  );
}
