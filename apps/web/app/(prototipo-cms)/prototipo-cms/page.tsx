import type { Metadata } from "next";

import {
  listarEventosCms,
  listarPalestrantesCms,
  type EventoCmsResumo,
  type PalestranteCmsResumo,
} from "@/lib/cms/prototipoCms";

import { ShellCms } from "./ShellCms";

export const metadata: Metadata = {
  title: "Protótipo CMS · Grupo NTC",
  robots: { index: false, follow: false },
};

// Sempre dinâmico: o protótipo mostra o estado atual do banco (rascunhos
// inclusos), então não cacheia. Leitura barata via Local API.
export const dynamic = "force-dynamic";

/**
 * Rota /prototipo-cms — protótipo de CMS Soberana ligado a DADOS REAIS.
 *
 * Server Component: lê Eventos e Especialistas do Postgres (somente leitura,
 * via Local API do Payload) e passa para o casco client. Se o banco estiver
 * indisponível, cai para listas vazias — o protótipo continua navegável e a
 * tela mostra o estado "sem registros". Não escreve nada, não toca uploads.
 */
export default async function PrototipoCmsPage() {
  let eventos: EventoCmsResumo[] = [];
  let palestrantes: PalestranteCmsResumo[] = [];
  let erroLeitura = false;

  try {
    [eventos, palestrantes] = await Promise.all([
      listarEventosCms(),
      listarPalestrantesCms(),
    ]);
  } catch {
    erroLeitura = true;
  }

  return <ShellCms eventos={eventos} palestrantes={palestrantes} erroLeitura={erroLeitura} />;
}
