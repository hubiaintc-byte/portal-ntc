import type { Metadata } from "next";
import type { ReactNode } from "react";

import { barlow, cormorant } from "../fonts";

import "./painel.css";

export const metadata: Metadata = {
  title: "Painel Admin NTC · Grupo NTC",
  robots: { index: false, follow: false },
  icons: [{ rel: "icon", type: "image/svg+xml", url: "/favicon.svg" }],
};

/**
 * Layout raiz do route group (painel) — o Painel Admin na raiz do app cms
 * (rotas / e /entrar). O grupo (payload) mantém apenas a API REST/GraphQL
 * do Payload (/api); a UI do admin Payload foi removida.
 * Fontes via next/font (src/app/fonts.ts), expostas como
 * --font-titulo/--font-corpo — as mesmas vars que o painel.css usa.
 */
export default function PainelLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
