import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

/**
 * Layout da rota `/o-grupo` (e subrotas como `/o-grupo/corpo-docente`),
 * portada literalmente do 08_Pagina_O_Grupo_NTC_v3.html.
 *
 * Reaproveita `HeaderHome` e `FooterHome` do route group `(home)` —
 * markup e CSS são idênticos entre a Home v3 e a página O Grupo v3
 * (mesma .site-header, .nav-primary, .mega-*, .site-footer no
 * protótipo aprovado). `InteracoesScroll` reaplica o efeito
 * `.fade-in` quando o usuário rola até cada seção.
 *
 * CSS específico desta página é injetado pelo root layout
 * (`o-grupo-prototipo.css`). Tokens base e regras de header/footer
 * vêm de `home-prototipo.css`, também no root.
 */
export default function OGrupoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
