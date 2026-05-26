"use client";

import { useEffect, useState } from "react";

import { ModuloAgendaDropdown } from "./ModuloAgendaDropdown";
import type { Modulo, NavLink } from "./conteudoModulos";

/**
 * Subnav interno do módulo com scroll-spy. Espelha o IIFE 6 do protótipo
 * (linhas ~3415-3458 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - IntersectionObserver com rootMargin: '-30% 0px -55% 0px', threshold: 0.
 * - Adiciona is-active + aria-current="location" ao link cuja seção está visível.
 * - Sticky vem do CSS (.evt-nav: position: sticky).
 *
 * Ações: 1 botão Inscrever-se (scrolla para #contato), 1 botão Baixar folder,
 * 1 ModuloAgendaDropdown.
 */

interface ModuloSubnavProps {
  links: NavLink[];
  folderHref: string;
  folderCmsLink: string;
  inscricaoCmsLink: string;
  agendaIcs: Modulo["agendaIcs"];
}

export function ModuloSubnav({
  links,
  folderHref,
  folderCmsLink,
  inscricaoCmsLink,
  agendaIcs,
}: ModuloSubnavProps) {
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

  const onClickFolder = () => {
    if (folderHref && folderHref !== "#") {
      window.open(folderHref, "_blank", "noopener");
    }
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
                data-anchor={link.href.replace(/^#/, "")}
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
            className="evt-nav-action act-inscrever primary"
            data-cms-link={inscricaoCmsLink}
            onClick={onClickInscrever}
          >
            Inscrever-se
          </button>
          <button
            type="button"
            className="evt-nav-action act-folder"
            data-cms-link={folderCmsLink}
            onClick={onClickFolder}
          >
            Baixar folder
          </button>
          <ModuloAgendaDropdown dados={agendaIcs} />
        </div>
      </div>
    </nav>
  );
}
