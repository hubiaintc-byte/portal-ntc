"use client";

import { Fragment, useEffect, useState } from "react";

import type { LinkEventOn } from "./conteudoEventOn";

/**
 * Barra de navegação interna da página /eventon. Espelha o IIFE 7
 * (scroll-spy) de 27_Pagina_EventOn_v1.html:
 *
 * - IntersectionObserver sobre as seções alvo, com
 *   `rootMargin: -(headerH + 80)px 0px -55% 0px`; a seção que entra
 *   vira a ativa (`is-active`).
 * - O sticky é só CSS (`.eo-subnav { position: sticky }`), sem classe
 *   por JS — diferente da subnav de /capacitacao.
 *
 * SSR: renderiza sem link ativo.
 */

interface SubnavEventOnProps {
  links: LinkEventOn[];
}

export function SubnavEventOn({ links }: SubnavEventOnProps) {
  const [ativoId, setAtivoId] = useState<string | null>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const alvos = links
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (alvos.length === 0) return;

    const headerH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 88;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setAtivoId(e.target.id);
        }
      },
      { rootMargin: `-${headerH + 80}px 0px -55% 0px`, threshold: 0 },
    );
    alvos.forEach((alvo) => io.observe(alvo));
    return () => io.disconnect();
  }, [links]);

  return (
    <nav className="eo-subnav" aria-label="Navegação interna da Plataforma EventOn">
      <div className="eo-subnav-inner">
        {links.map((link, i) => {
          const ativo = ativoId !== null && link.href === `#${ativoId}`;
          return (
            <Fragment key={link.href}>
              {i > 0 && (
                <span className="eo-subnav-sep" aria-hidden="true">
                  ·
                </span>
              )}
              <a
                href={link.href}
                data-track={link.track}
                className={ativo ? "is-active" : undefined}
                aria-current={ativo ? "location" : undefined}
              >
                {link.texto}
              </a>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
