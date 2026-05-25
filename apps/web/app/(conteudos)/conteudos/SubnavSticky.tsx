"use client";

import { useEffect, useState } from "react";

import type { SubnavLink } from "./conteudoConteudos";

/**
 * Subnav sticky + active anchor highlight da página /conteudos.
 * Espelha o IIFE do protótipo (linhas 2619-2650 de
 * 28_Pagina_Conteudos_v1.html):
 *
 * - Quando o scroll passa do `offsetTop` original da nav, recebe
 *   classe `is-sticky` (CSS fixa via position: sticky).
 * - Active anchor: compara `getBoundingClientRect().top - (headerH +
 *   subnavH + 24)` de cada seção referenciada; a última cujo top é
 *   ≤ 0 é a seção ativa.
 * - Listeners scroll (passive) + resize.
 *
 * SSR: renderiza sem `is-sticky` / `is-active`. Toggles aplicados
 * apenas após o mount.
 */

interface SubnavStickyProps {
  label: string;
  links: SubnavLink[];
}

export function SubnavSticky({ label, links }: SubnavStickyProps) {
  const [sticky, setSticky] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const subnav = document.getElementById("contSubnav");
    if (!subnav) return;
    const sections = links
      .map((link) => document.querySelector(link.href) as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const subnavTop = subnav.offsetTop;

    const onScroll = () => {
      const y = window.scrollY;
      setSticky(y >= subnavTop - 1);
      const headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) || 88;
      const subnavH = subnav.offsetHeight;
      const margin = headerH + subnavH + 24;
      let nextActive: string | null = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top - margin <= 0) nextActive = s.id;
      }
      setActiveId(nextActive);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [links]);

  return (
    <nav
      className={`cont-subnav${sticky ? " is-sticky" : ""}`}
      id="contSubnav"
      aria-label="Navegação interna de Conteúdos"
    >
      <div className="container">
        <div className="cont-subnav-inner">
          <span className="cont-subnav-label">{label}</span>
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                data-cms-link={link.cmsLink}
                className={ativo ? "is-active" : undefined}
              >
                {link.texto}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
