import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";

/**
 * Layout das 5 páginas institucionais:
 *   /politica-de-privacidade
 *   /termos-de-uso
 *   /politica-de-cookies
 *   /lgpd
 *   /mapa-do-site
 *
 * Portadas literalmente dos protótipos 30, 31, 32, 33 e 34. Os 5
 * compartilham o mesmo header, o mesmo footer e o mesmo bloco <style>
 * inline — todos consolidados em apps/web/app/institucional-prototipo.css
 * (importado no root layout) e nos componentes `HeaderHome`/`FooterHome`
 * do route group (home).
 */
export default function LayoutInstitucional({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
    </>
  );
}
