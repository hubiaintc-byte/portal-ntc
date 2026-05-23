"use client";

import type { Quicklink } from "./conteudoCorpoDocente";
import { useCorpoDocenteCtx } from "./CorpoDocenteContext";

interface HeroQuicklinksProps {
  items: Quicklink[];
}

export function HeroQuicklinks({ items }: HeroQuicklinksProps) {
  const ctx = useCorpoDocenteCtx();

  return (
    <div className="hero-quicklinks" aria-label="Navegação rápida por área">
      {items.map((q) =>
        q.tipo === "anchor" ? (
          <a key={q.rotulo} href={q.href}>
            {q.rotulo}
          </a>
        ) : (
          <button
            key={q.rotulo}
            type="button"
            onClick={() => ctx.requestTab(q.vertShortcut)}
          >
            {q.rotulo}
          </button>
        )
      )}
    </div>
  );
}
