import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal das páginas deste route group (ex-root layout — ver
// comentário em app/layout.tsx). Ordem preservada da importação original.
import "../solucoes-prototipo.css";

/**
 * Layout das páginas do guarda-chuva Soluções:
 *   /solucoes        (porta de 26_Pagina_Solucoes_v1.html)
 *
 * Coexiste com /solucoes-estrategicas/[area] (route group `(vertical)`),
 * que cobre as 3 verticais editoriais. Esta família abriga as páginas
 * comerciais de contratação institucional (modalidades + contratação direta).
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx, (vertical)/layout.tsx e (capacitacao)/layout.tsx.
 *
 * CSS específico vem do root layout (solucoes-prototipo.css).
 */
export default function SolucoesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
