import type { ReactNode } from "react";

import { NavegacaoSoberana, RodapeSoberano } from "@ntc/ui";
import type { RodapeData } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";
import { CTA_PRINCIPAL, CTA_SECUNDARIO, ROTAS_MENU } from "@/lib/menu";

/**
 * Layout das rotas institucionais ainda não portadas do HTML do
 * protótipo: `/o-grupo`, `/o-grupo/corpo-docente`,
 * `/solucoes-estrategicas`, `/solucoes-estrategicas/[area]`,
 * `/design-system/*`.
 *
 * Quando uma rota é portada (markup + CSS do HTML aprovado), ela é
 * movida para `app/(home-derivada)/...` ou ganha seu próprio route
 * group, e perde o `<NavegacaoSoberana>` + `<RodapeSoberano>` deste
 * layout em troca do header/footer literal do protótipo
 * correspondente.
 */

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
    console.warn("[(site)/layout] falha ao carregar Global rodape — usando fallback", err);
    return RODAPE_FALLBACK;
  }
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const rodape = await carregarRodape();
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS_MENU}
        ctaPrincipal={CTA_PRINCIPAL}
        ctaSecundario={CTA_SECUNDARIO}
      />
      {children}
      <RodapeSoberano dados={rodape} />
    </>
  );
}
