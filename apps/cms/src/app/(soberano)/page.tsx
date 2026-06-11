import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import {
  listarEventosCms,
  listarPalestrantesCms,
  obterEventosHomeIds,
  type EventoCmsResumo,
  type PalestranteCmsResumo,
} from "@/lib/cms/prototipoCms";

import { ShellCms } from "./ShellCms";

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
