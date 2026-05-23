"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * `NavBarAncoras` — nav sticky abaixo do header com 8 âncoras +
 * 2 botões de ação. Reproduz `.grupo-nav` do 08_Pagina_O_Grupo_NTC_v3.html.
 *
 * Scrollspy via IntersectionObserver: o link da seção mais visível
 * recebe a classe `is-active` (estilizada em `o-grupo-prototipo.css`
 * com cor `dourado-soft` + border-bottom dourado).
 */

interface Ancora {
  id: string;
  rotulo: string;
}

const ANCORAS: Ancora[] = [
  { id: "sintese", rotulo: "Síntese" },
  { id: "proposta-valor", rotulo: "Valor" },
  { id: "areas", rotulo: "Áreas" },
  { id: "trajetoria", rotulo: "Trajetória" },
  { id: "portfolio", rotulo: "Programas" },
  { id: "autoridade", rotulo: "Autoridade" },
  { id: "credibilidade", rotulo: "Credibilidade" },
  { id: "juridico", rotulo: "Contratação" },
];

export function NavBarAncoras() {
  const [ativo, setAtivo] = useState<string>("sintese");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const alvos = ANCORAS.map((a) => document.getElementById(a.id)).filter(
      (el): el is HTMLElement => el !== null,
    );

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
  }, []);

  const rolarPara = (id: string) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="grupo-nav" aria-label="Navegação interna · O Grupo">
      <div className="container grupo-nav-inner">
        <div className="grupo-nav-anchors" role="tablist">
          {ANCORAS.map((a) => (
            <a
              key={a.id}
              className={`grupo-nav-link${ativo === a.id ? " is-active" : ""}`}
              href={`#${a.id}`}
              onClick={(e) => {
                e.preventDefault();
                rolarPara(a.id);
              }}
            >
              {a.rotulo}
            </a>
          ))}
        </div>
        <div className="grupo-nav-actions">
          <button
            type="button"
            className="grupo-nav-action primary"
            onClick={() => rolarPara("cta-final")}
            data-cms-link="proposta-institucional"
          >
            Solicitar proposta
          </button>
          <Link
            className="grupo-nav-action"
            href="/#contato"
            data-cms-link="folder-institucional"
          >
            Baixar portfólio
          </Link>
        </div>
      </div>
    </nav>
  );
}
