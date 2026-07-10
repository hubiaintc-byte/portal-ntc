import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal das páginas deste route group (ex-root layout — ver
// comentário em app/layout.tsx). Ordem preservada da importação original.
import "../agenda-prototipo.css";
import "../capacitacao-prototipo.css";
import "../evento-prototipo.css";

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
 * CSS específico das páginas é importado aqui mesmo (ver imports acima).
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
