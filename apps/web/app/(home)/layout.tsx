import type { ReactNode } from "react";

import { carregarContatos } from "@/lib/contatos";

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
export default async function HomeLayout({ children }: { children: ReactNode }) {
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
