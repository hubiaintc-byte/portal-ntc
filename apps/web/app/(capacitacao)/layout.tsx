import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas do guarda-chuva Capacitação:
 *   /agenda          (porta de 09_Pagina_Agenda_v2.html)
 *
 * Sessões futuras: /eventos-online, /eventos-presenciais,
 * /eventos-hibridos, /eventon, hub /capacitacao.
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx e (vertical)/layout.tsx.
 *
 * CSS específico de cada página vem do root layout (agenda-prototipo.css).
 */
export default function CapacitacaoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
