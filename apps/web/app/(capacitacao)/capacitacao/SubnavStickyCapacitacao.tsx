"use client";

import { useEffect, useState } from "react";

import type { SubnavLink } from "./conteudoCapacitacao";

/**
 * Subnav sticky + active anchor highlight da página /capacitacao.
 * Espelha o IIFE do protótipo (linhas 2655-2686 de
 * 27_Pagina_Capacitacao_v1.html):
 *
 * - Quando o scroll passa do `offsetTop` original da nav, recebe
 *   classe `is-sticky` (CSS faz position: sticky).
 * - Active anchor: compara `getBoundingClientRect().top - (headerH +
 *   subnavH + 24)` de cada seção referenciada; a última cujo top é
 *   ≤ 0 é a seção ativa.
 * - rAF gate no scroll; resize re-mede subnavTop + headerH.
 *
 * SSR: renderiza sem `is-sticky` / `is-active`. Toggles aplicados
 * apenas após o mount.
 */

interface SubnavStickyCapacitacaoProps {
  label: string;
  links: SubnavLink[];
}

export function SubnavStickyCapacitacao({ label, links }: SubnavStickyCapacitacaoProps) {
  const [sticky, setSticky] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const subnav = document.getElementById("capSubnav");
    if (!subnav) return;
    const sections = links
      .map((link) => document.querySelector(link.href) as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let subnavTop = subnav.offsetTop;
    let headerH =
      parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 88;
    let raf = 0;

    const compute = () => {
      const y = window.scrollY;
      setSticky(y >= subnavTop - 1);
      const subnavH = subnav.offsetHeight;
      const margin = headerH + subnavH + 24;
      let nextActive: string | null = null;
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top - margin <= 0) nextActive = s.id;
      }
      setActiveId(nextActive);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };

    const onResize = () => {
      subnavTop = subnav.offsetTop;
      headerH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
        ) || 88;
      compute();
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [links]);

  return (
    <nav
      className={`cap-subnav${sticky ? " is-sticky" : ""}`}
      id="capSubnav"
      aria-label="Navegação interna da Capacitação"
    >
      <div className="container">
        <div className="cap-subnav-inner">
          <span className="cap-subnav-label">{label}</span>
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                data-cms-link={link.cmsLink}
                className={ativo ? "is-active" : undefined}
                aria-current={ativo ? "location" : undefined}
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
