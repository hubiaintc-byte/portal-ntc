import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout das páginas do guarda-chuva Conteúdos:
 *   /conteudos        (porta de 28_Pagina_Conteudos_v1.html)
 *
 * Esta família abriga a biblioteca editorial do Grupo NTC — artigos,
 * estudos, notas técnicas, webinars e materiais didáticos. Futuro
 * `/conteudos/[slug]` ficará neste mesmo route group.
 *
 * Reaproveita o header + footer + interações de scroll da Home v3,
 * mesmo padrão de (institucional)/layout.tsx, (programas)/layout.tsx,
 * (o-grupo)/layout.tsx, (vertical)/layout.tsx, (capacitacao)/layout.tsx
 * e (solucoes)/layout.tsx.
 *
 * CSS específico vem do root layout (conteudos-prototipo.css).
 */
export default function ConteudosLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
