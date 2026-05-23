"use client";

import { useEffect, useState } from "react";

interface StickyCtaMobileProps {
  rotulo: string;
  href: string;
}

export function StickyCtaMobile({ rotulo, href }: StickyCtaMobileProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) {
      setVisible(false);
      return;
    }
    const onScroll = () => {
      setVisible(window.scrollY > 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dismissed]);

  return (
    <div
      className={`sticky-cta-mobile ${visible ? "is-visible" : ""}`}
      id="stickyCta"
      role="complementary"
      aria-label="Chamada institucional móvel"
    >
      <button
        type="button"
        className="sticky-cta-mobile-dismiss"
        aria-label="Fechar chamada"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
      <a className="btn btn--gold" href={href}>
        {rotulo} <span className="btn-arrow">→</span>
      </a>
    </div>
  );
}
