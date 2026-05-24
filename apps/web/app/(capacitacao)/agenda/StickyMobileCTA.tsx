"use client";

import { useEffect, useState } from "react";

import { STICKY_CTA } from "./conteudoAgenda";

const DISMISSED_KEY = "ntc_agenda_sticky_dismissed";

/**
 * Barra fixa mobile com atendimento. Espelha o IIFE `initStickyCTA` do
 * protótipo (linhas 3738-3762 de 09_Pagina_Agenda_v2.html):
 *
 * - Aparece após scroll passar do bottom do `.agenda-hero` + 80px.
 * - Pode ser fechada pelo `×`; dismiss persiste em sessionStorage.
 * - Toggle de classe `.is-visible` no `<aside>` e de `aria-hidden`.
 *
 * Renderiza nada se já foi dismissed na sessão atual.
 */
export function StickyMobileCTA() {
  const [montado, setMontado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // sessionStorage pode falhar em alguns contextos (Safari private mode).
    }
    if (dismissed) return;
    setMontado(true);

    const hero = document.querySelector<HTMLElement>(".agenda-hero");
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 400;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setVisivel(window.scrollY > heroBottom + 80);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  if (!montado) return null;

  const dismiss = () => {
    setVisivel(false);
    setMontado(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <aside
      className={`agenda-sticky-mobile-cta${visivel ? " is-visible" : ""}`}
      id="agenda-sticky-cta"
      aria-hidden={!visivel}
    >
      <button
        className="smc-close"
        type="button"
        id="smc-close"
        aria-label="Fechar atendimento"
        onClick={dismiss}
      >
        ×
      </button>
      <div className="smc-text">
        <strong>{STICKY_CTA.strong}</strong>
        {STICKY_CTA.texto}
      </div>
      <a
        className="smc-btn"
        href={STICKY_CTA.cta.href}
        data-cms-link={STICKY_CTA.cta.cmsLink}
        data-track={STICKY_CTA.cta.track}
      >
        {STICKY_CTA.cta.texto} <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
