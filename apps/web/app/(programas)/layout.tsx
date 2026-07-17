import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal das páginas deste route group (ex-root layout — ver
// comentário em app/layout.tsx). Ordem preservada da importação original.
import "../programas-prototipo.css";
import "../modulo-prototipo.css";

/**
 * Layout das páginas individuais de programa (/programas/[slug]).
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (vertical)/layout.tsx e (o-grupo)/layout.tsx.
 *
 * CSS específico (.prog-hero, .prog-nav, .prog-section etc.) vem
 * de programas-prototipo.css, importado no root layout.
 */
export default function ProgramasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
