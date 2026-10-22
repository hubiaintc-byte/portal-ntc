import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { acessoDoPerfilLegado, capacidadesDoAcesso } from "@/lib/cms/telas";
import {
  listarConteudosCms,
  listarEventosCms,
  contarLeadsCms,
  listarPalestrantesCms,
  obterEventosHomeIds,
  type ConteudoCmsResumo,
  type EventoCmsResumo,
  type ResumoLeadsCms,
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
  let resumoLeads: ResumoLeadsCms = { total: 0, ultimos30Dias: 0 };
  let conteudos: ConteudoCmsResumo[] = [];
  let eventosHomeIds: string[] = [];
  let erroLeitura = false;

  try {
    [eventos, palestrantes, resumoLeads, conteudos, eventosHomeIds] = await Promise.all([
      listarEventosCms(),
      listarPalestrantesCms(),
      contarLeadsCms(),
      listarConteudosCms(),
      obterEventosHomeIds(),
    ]);
  } catch (e) {
    console.error("[PainelPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  // O que a interface deixa este perfil fazer — calculado aqui, no servidor,
  // com as mesmas regras das Server Actions (que seguem sendo a barreira real).
  const capacidades = capacidadesDoAcesso(acessoDoPerfilLegado(usuario.perfil));

  return (
    <ShellCms
      usuario={usuario}
      capacidades={capacidades}
      eventos={eventos}
      palestrantes={palestrantes}
      resumoLeads={resumoLeads}
      conteudos={conteudos}
      eventosHomeIds={eventosHomeIds}
      erroLeitura={erroLeitura}
    />
  );
}
