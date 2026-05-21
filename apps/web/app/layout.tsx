import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { BannerCookies } from "@ntc/ui";
import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";

import { barlow, cormorant } from "./fonts";
import "./globals.css";

/**
 * Layout raiz mínimo: `<html>`, `<body>`, fontes auto-hospedadas
 * (next/font) e o `<BannerCookies>` que precisa aparecer em toda
 * rota (LGPD — CLAUDE.md §12).
 *
 * Cabeçalho e rodapé moveram-se para layouts de route group:
 * - `app/(home)/layout.tsx`: header + footer do protótipo (CSS literal).
 * - `app/(site)/layout.tsx`: `<NavegacaoSoberana>` + `<RodapeSoberano>`
 *   do @ntc/ui (rotas institucionais que ainda não foram portadas do
 *   HTML).
 *
 * Skip-link permanece no root para acessibilidade global.
 */

export const metadata: Metadata = {
  title: {
    default: "Portal Grupo NTC",
    template: "%s · Grupo NTC",
  },
  description: "Inteligência institucional. Impacto real.",
  metadataBase: new URL(process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11365E",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
        <BannerCookies politicaVersao={POLITICA_VERSAO_ATUAL} />
      </body>
    </html>
  );
}
