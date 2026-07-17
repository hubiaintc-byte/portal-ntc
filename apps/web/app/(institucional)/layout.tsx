import type { ReactNode } from "react";

import { HeaderHome } from "../(home)/HeaderHome";
import { FooterHome } from "../(home)/FooterHome";
import { InteracoesScroll } from "../(home)/InteracoesScroll";

// CSS literal das páginas deste route group (ex-root layout — ver
// comentário em app/layout.tsx). Ordem preservada da importação original.
import "../institucional-prototipo.css";
import "../contato-prototipo.css";

/**
 * Layout das páginas institucionais:
 *   /politica-de-privacidade
 *   /termos-de-uso
 *   /politica-de-cookies
 *   /lgpd
 *   /mapa-do-site
 *   /contato
 *
 * Portadas literalmente dos protótipos 30, 31, 32, 33, 34 e 12. As 5
 * primeiras compartilham o mesmo bloco <style> (em
 * apps/web/app/institucional-prototipo.css); /contato tem seu próprio
 * CSS portado (apps/web/app/contato-prototipo.css). Todas usam o
 * mesmo header e footer (HeaderHome/FooterHome do route group (home)).
 *
 * `<InteracoesScroll />` é obrigatório: os CSSs portados definem
 * `.fade-in { opacity: 0 }` e dependem da classe `.is-visible`
 * adicionada via JS para revelar os elementos. Sem ele, blocos como
 * hero-page-content e cta-final-inner ficam invisíveis.
 */
export default function LayoutInstitucional({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
