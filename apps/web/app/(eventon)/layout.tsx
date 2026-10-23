import type { ReactNode } from "react";

import { carregarContatos } from "@/lib/contatos";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal da página deste route group (ver comentário em app/layout.tsx).
import "../eventon-prototipo.css";

/**
 * Layout da página /eventon (porta de 27_Pagina_EventOn_v1.html).
 *
 * Route group próprio porque o CSS do protótipo redefine classes
 * genéricas (.hero-page, .crumb, .btn, .sticky-cta-mobile) que também
 * existem no CSS de (capacitacao) e (institucional) — aqui a cascata
 * fica isolada.
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (solucoes)/layout.tsx e (capacitacao)/layout.tsx.
 * `<InteracoesScroll />` é obrigatório: sem ele `.fade-in` fica invisível.
 */
export default async function EventOnLayout({ children }: { children: ReactNode }) {
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
