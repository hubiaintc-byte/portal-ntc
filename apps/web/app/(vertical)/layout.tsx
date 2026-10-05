import type { ReactNode } from "react";

import { carregarContatos } from "@/lib/contatos";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal das páginas deste route group (ex-root layout — ver
// comentário em app/layout.tsx). Ordem preservada da importação original.
import "../verticais-prototipo.css";

/**
 * Layout das páginas de vertical (/solucoes-estrategicas/[area]).
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * já que os 3 HTMLs das verticais (07_Pagina_Vertical_NTC_*.html)
 * usam os mesmos elementos.
 *
 * CSS específico de vertical (.breadcrumb, .vert-hero, .vert-meta-bar,
 * .vert-nav, .vert-programs etc.) vem de verticais-prototipo.css,
 * importado no root layout.
 */
export default async function VerticalLayout({ children }: { children: ReactNode }) {
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
