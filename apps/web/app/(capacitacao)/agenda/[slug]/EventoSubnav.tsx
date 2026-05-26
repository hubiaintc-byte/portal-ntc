"use client";

import { useEffect, useState } from "react";

import { AgendaDropdown } from "./AgendaDropdown";
import type { EventoBase, NavLink } from "./conteudoEventos";

/**
 * Subnav interno do evento com scroll-spy. Espelha o IIFE 6 do protótipo
 * (linhas ~2985-3010 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - IntersectionObserver com rootMargin: '-30% 0px -55% 0px', threshold: 0.
 * - Adiciona is-active ao link cuja seção está visível.
 * - Sticky vem do CSS (.evt-nav: position: sticky).
 *
 * Ações: 1 botão Inscrever-se (scrolla para #contato), 1 link Baixar folder,
 * 1 AgendaDropdown.
 */

interface EventoSubnavProps {
  links: NavLink[];
  folderHref: string;
  folderCmsLink: string;
  inscricaoCmsLink: string;
  agendaIcs: EventoBase["agendaIcs"];
}

export function EventoSubnav({
  links,
  folderHref,
  folderCmsLink,
  inscricaoCmsLink,
  agendaIcs,
}: EventoSubnavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    links.find((l) => l.isActive)?.href.slice(1) ?? null,
  );

  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );

    for (const s of sections) observer.observe(s);
    return () => observer.disconnect();
  }, [links]);

  const onClickInscrever = () => {
    const alvo = document.getElementById("contato");
    if (alvo) alvo.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="evt-nav" aria-label="Navegação interna do evento">
      <div className="container evt-nav-inner">
        <div className="evt-nav-anchors" role="tablist">
          {links.map((link) => {
            const ativo = activeId !== null && link.href === `#${activeId}`;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`evt-nav-link${ativo ? " is-active" : ""}`}
                aria-current={ativo ? "location" : undefined}
              >
                {link.texto}
              </a>
            );
          })}
        </div>
        <div className="evt-nav-actions">
          <button
            type="button"
            className="evt-nav-action primary"
            data-cms-link={inscricaoCmsLink}
            onClick={onClickInscrever}
          >
            Inscrever-se
          </button>
          <button
            type="button"
            className="evt-nav-action"
            data-cms-link={folderCmsLink}
            onClick={() => {
              if (folderHref && folderHref !== "#") {
                window.open(folderHref, "_blank", "noopener");
              }
            }}
          >
            Baixar folder
          </button>
          <AgendaDropdown dados={agendaIcs} />
        </div>
      </div>
    </nav>
  );
}
