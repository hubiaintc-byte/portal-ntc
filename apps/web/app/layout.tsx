import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { BannerCookies, NavegacaoSoberana, RodapeSoberano } from "@ntc/ui";
import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";
import type { RodapeData } from "@ntc/types";

import { barlow, cormorant } from "./fonts";
import "./globals.css";
import { obterPayload } from "@/lib/payloadClient";
import { CTA_PRINCIPAL, CTA_SECUNDARIO, ROTAS_MENU } from "@/lib/menu";

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

const RODAPE_FALLBACK: RodapeData = {
  id: 0,
  assinaturaInstitucional: "Inteligência institucional. Impacto real.",
  emailInstitucional: "contato@institutontc.com.br",
  razaoSocial: "Instituto NTC do Brasil",
};

async function carregarRodape(): Promise<RodapeData> {
  try {
    const payload = await obterPayload();
    return (await payload.findGlobal({ slug: "rodape", depth: 1 })) as RodapeData;
  } catch (err) {
    console.warn("[layout] falha ao carregar Global rodape — usando fallback", err);
    return RODAPE_FALLBACK;
  }
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const rodape = await carregarRodape();
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable}`}>
      <body>
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <NavegacaoSoberana
          rotas={ROTAS_MENU}
          ctaPrincipal={CTA_PRINCIPAL}
          ctaSecundario={CTA_SECUNDARIO}
        />
        {children}
        <RodapeSoberano dados={rodape} />
        <BannerCookies politicaVersao={POLITICA_VERSAO_ATUAL} />
      </body>
    </html>
  );
}
