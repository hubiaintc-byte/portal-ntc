import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { BannerCookies } from "@ntc/ui";
import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";

import { barlow, barlowCondensed, cormorant } from "./fonts";
import "./globals.css";
// CSS da Home v3 Premium (portada literal do HTML do protótipo).
// Fica no root porque carrega os tokens base e as regras de
// header/footer/btn que TODAS as páginas usam (HeaderHome/FooterHome
// são montados em todos os route groups).
//
// Os demais *-prototipo.css moveram para o layout do route group da
// própria página (perf: 712 KB de CSS render-blocking em toda rota →
// só o CSS da rota visitada). O 404 histórico de CSS em route group
// com parênteses (Next 15.0) não reproduz no 15.5 — validado com
// `next start` + curl dos stylesheets por rota.
import "./home-prototipo.css";

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
  openGraph: {
    type: "website",
    siteName: "Grupo NTC",
    locale: "pt_BR",
    url: "/",
    title: "Portal Grupo NTC · Inteligência institucional. Impacto real.",
    description:
      "O novo padrão da formação institucional para a Administração Pública brasileira.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1242,
        height: 907,
        alt: "Grupo NTC — Inteligência institucional. Impacto real.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Grupo NTC",
    description:
      "Inteligência institucional. Impacto real. Grupo NTC — formação para a Administração Pública brasileira.",
    images: ["/og-default.jpg"],
  },
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
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
        <BannerCookies politicaVersao={POLITICA_VERSAO_ATUAL} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
