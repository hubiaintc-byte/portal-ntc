import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import {
  listarEventosCms,
  listarPalestrantesCms,
  obterEventosHomeIds,
  type EventoCmsResumo,
  type PalestranteCmsResumo,
} from "@/lib/cms/painelCms";

import { ShellCms } from "./ShellCms";

// Sempre dinâmico: o painel mostra o estado atual do banco (rascunhos
// inclusos), então não cacheia. Leitura barata via Local API.
export const dynamic = "force-dynamic";

/**
 * Rota / — Painel Admin ligado aos dados reais.
 *
 * Server Component: lê Eventos e Especialistas do Postgres via Local API do
 * Payload e passa para o casco client. Se o banco estiver indisponível, cai
 * para listas vazias — o painel continua navegável e a tela mostra o estado
 * "sem registros".
 */
export default async function PainelPage() {
  const usuario = await exigirUsuarioCms();

  let eventos: EventoCmsResumo[] = [];
  let palestrantes: PalestranteCmsResumo[] = [];
  let eventosHomeIds: string[] = [];
  let erroLeitura = false;

  try {
    [eventos, palestrantes, eventosHomeIds] = await Promise.all([
      listarEventosCms(),
      listarPalestrantesCms(),
      obterEventosHomeIds(),
    ]);
  } catch {
    erroLeitura = true;
  }

  return (
    <ShellCms
      usuario={usuario}
      eventos={eventos}
      palestrantes={palestrantes}
      eventosHomeIds={eventosHomeIds}
      erroLeitura={erroLeitura}
    />
  );
}
