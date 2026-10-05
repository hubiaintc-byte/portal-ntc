import type { Rodape } from "@ntc/types";

import { obterPayload } from "../lib/payloadClient";

/**
 * Preenche o global de contatos com os valores que hoje estão escritos no
 * site, para que ele nasça preenchido e o site não mude de aparência no dia
 * em que passar a ler do CMS.
 *
 * Idempotente: campo já preenchido não é tocado.
 * Uso: pnpm --filter @ntc/cms contatos:seed
 */

const PADRAO = {
  telefoneInstitucional: "(63) 3212-1199",
  whatsappInstitucional: "(63) 98444-4040",
  emailInstitucional: "contato@institutontc.com.br",
  emailImprensa: "imprensa@institutontc.com.br",
  emailDpo: "dpo@institutontc.com.br",
  emailSuporte: "suporte@institutontc.com.br",
  emailEventos: "eventosonline@institutontc.com.br",
  enderecoCompleto:
    "Instituto NTC do Brasil\nSCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001\nAsa Sul · CEP 70308-200 · Brasília – DF",
} as const;

const VERTICAIS_PADRAO: NonNullable<Rodape["verticais"]> = [
  { vertical: "educacao", email: "educacao@institutontc.com.br", opcaoTelefone: "opção 1" },
  {
    vertical: "gestao-publica",
    email: "gestaopublica@institutontc.com.br",
    opcaoTelefone: "opção 2",
  },
  { vertical: "saude", email: "saude@institutontc.com.br", opcaoTelefone: "opção 3" },
];

type CampoPadrao = keyof typeof PADRAO;

async function principal(): Promise<void> {
  const payload = await obterPayload();
  const atual = await payload.findGlobal({ slug: "rodape" });

  const data: Partial<Rodape> = {};
  for (const campo of Object.keys(PADRAO) as CampoPadrao[]) {
    const existente = atual[campo];
    if (existente === null || existente === undefined || existente === "") {
      data[campo] = PADRAO[campo];
    }
  }
  if (!Array.isArray(atual.verticais) || atual.verticais.length === 0) {
    data.verticais = VERTICAIS_PADRAO;
  }

  if (Object.keys(data).length === 0) {
    console.log("[seed] contatos: nada a fazer, todos os campos já preenchidos.");
    process.exit(0);
  }

  await payload.updateGlobal({ slug: "rodape", data, overrideAccess: true });
  console.log(`[seed] contatos: ${Object.keys(data).length} campo(s) preenchido(s).`);
  process.exit(0);
}

void principal().catch((err) => {
  console.error("[seed:contatos] Falha:", err);
  process.exit(1);
});
