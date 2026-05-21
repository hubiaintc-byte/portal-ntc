import type { ReactNode } from "react";

import { HeaderHome } from "./HeaderHome";
import { FooterHome } from "./FooterHome";
import { InteracoesScroll } from "./InteracoesScroll";

/**
 * Layout da rota raiz `/` (Home v3 Premium portada literalmente do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html).
 *
 * Importa o CSS proprietário do protótipo (home.css). Renderiza
 * o header (sticky + mega menu + mobile drawer) e o footer literais
 * do HTML aprovado, com as interações reescritas em Client Components
 * pequenos (`HeaderHome`, com megas e drawer).
 */
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderHome />
      {children}
      <FooterHome />
      <InteracoesScroll />
    </>
  );
}
