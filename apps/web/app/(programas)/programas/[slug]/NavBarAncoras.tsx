"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { NavAnchor } from "./conteudoIndex";

/**
 * `NavBarAncoras` — sticky nav abaixo do header com âncoras
 * internas + dois CTAs ("Solicitar proposta", "Solicitar folder").
 * Reproduz `.prog-nav` dos 15 HTMLs de programa.
 *
 * Scrollspy via IntersectionObserver: o link da seção mais visível
 * recebe `.is-active`. Padrão espelhado de NavBarInternaSticky
 * (vertical) e NavBarAncoras (o-grupo).
 */

interface Props {
  anchors: NavAnchor[];
  slug: string;
}

export function NavBarAncoras({ anchors, slug }: Props) {
  const [ativo, setAtivo] = useState<string>(
    anchors[0]?.href.replace(/^#/, "") ?? "",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ids = anchors.map((a) => a.href.replace(/^#/, ""));
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
  }, [anchors]);

  const rolarPara = (id: string) => {
    const alvo = document.getElementById(id);
    if (alvo) alvo.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="prog-nav" aria-label="Navegação interna do programa">
      <div className="container prog-nav-inner">
        <div className="prog-nav-anchors" role="tablist">
          {anchors.map((a) => {
            const id = a.href.replace(/^#/, "");
            return (
              <a
                key={id}
                className={`prog-nav-link${ativo === id ? " is-active" : ""}`}
                href={a.href}
                onClick={(e) => {
                  e.preventDefault();
                  rolarPara(id);
                }}
              >
                {a.rotulo}
              </a>
            );
          })}
        </div>
        <div className="prog-nav-actions">
          <Link
            className="prog-nav-action primary"
            href={`/contato?programa=${slug}`}
          >
            Solicitar proposta
          </Link>
          <Link
            className="prog-nav-action"
            href={`/contato?programa=${slug}&assunto=folder`}
          >
            Solicitar folder
          </Link>
        </div>
      </div>
    </nav>
  );
}
