import type { ReactNode } from "react";

import { carregarContatos } from "@/lib/contatos";

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
export default async function ProgramasLayout({ children }: { children: ReactNode }) {
  const contatos = await carregarContatos();

  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome contatos={contatos} />
      <InteracoesScroll />
    </>
  );
}
