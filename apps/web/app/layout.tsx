import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { barlow, cormorant } from "./fonts";
import "./globals.css";

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
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  );
}
