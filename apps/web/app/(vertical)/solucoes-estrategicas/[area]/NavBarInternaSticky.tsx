"use client";

import { useEffect, useState } from "react";

import type { NavAction, NavLink } from "./conteudoFallback";

/**
 * `NavBarInternaSticky` — nav sticky abaixo do header com âncoras
 * internas + botões de ação. Reproduz `.vert-nav` do
 * 07_Pagina_Vertical_NTC_*.html.
 *
 * Scrollspy via IntersectionObserver: o link da seção mais visível
 * recebe `.is-active` (estilizada em verticais-prototipo.css com cor
 * dourado-soft + border-bottom dourado).
 *
 * As âncoras vêm do conteudoFallback de cada vertical (id derivado de
 * href: "#programas-edu" → observa elemento com id="programas-edu").
 */

interface Props {
  navLinks: NavLink[];
  navActions: NavAction[];
}

export function NavBarInternaSticky({ navLinks, navActions }: Props) {
  const [ativo, setAtivo] = useState<string>(navLinks[0]?.href.replace(/^#/, "") ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ids = navLinks.map((l) => l.href.replace(/^#/, ""));
    const alvos = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (alvos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visiveis[0]) setAtivo(visiveis[0].target.id);
      },
      {
        rootMargin: "-160px 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    alvos.forEach((alvo) => observer.observe(alvo));
    return () => observer.disconnect();
  }, [navLinks]);

  const rolarPara = (id: string) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="vert-nav" aria-label="Navegação interna da vertical">
      <div className="container vert-nav-inner">
        <div className="vert-nav-anchors" role="tablist">
          {navLinks.map((l) => {
            const id = l.href.replace(/^#/, "");
            return (
              <a
                key={id}
                className={`vert-nav-link${ativo === id ? " is-active" : ""}`}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  rolarPara(id);
                }}
              >
                {l.label}
              </a>
            );
          })}
        </div>
        <div className="vert-nav-actions">
          {navActions.map((a, idx) => (
            <button
              key={idx}
              type="button"
              className={`vert-nav-action${a.primary ? " primary" : ""}`}
              onClick={() => {
                const id = a.href?.replace(/^#/, "");
                if (id) rolarPara(id);
              }}
            >
              {a.rotulo}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
