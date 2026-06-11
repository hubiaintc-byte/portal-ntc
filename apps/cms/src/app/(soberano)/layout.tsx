import type { Metadata } from "next";
import type { ReactNode } from "react";

import { barlow, cormorant } from "../fonts";

import "./prototipo-cms.css";

export const metadata: Metadata = {
  title: "Painel Admin NTC · Grupo NTC",
  robots: { index: false, follow: false },
};

/**
 * Layout raiz do route group (soberano) — o CMS Soberano na raiz do app cms
 * (rotas / e /entrar). O grupo (payload) tem seu próprio layout raiz
 * (RootLayout do Payload em /admin e /api); os dois não se sobrepõem.
 * Fontes Soberana via next/font (src/app/fonts.ts), expostas como
 * --font-titulo/--font-corpo — as mesmas vars que o prototipo-cms.css usa.
 */
export default function SoberanoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
