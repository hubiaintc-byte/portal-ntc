import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { capacidadesDoAcesso, temTela } from "@/lib/cms/telas";
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
 * Server Component: lê, via Local API do Payload, só os conjuntos das telas
 * que a pessoa tem e passa para o casco client. Se o banco estiver indisponível, cai
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

  // Cada conjunto só é lido para quem tem uma tela que o usa (spec §3.3, §6).
  const { acesso } = usuario;
  const verPainel = temTela(acesso, ["site.painel"]);
  const seTiver = <T,>(pode: boolean, ler: () => Promise<T>, vazio: T): Promise<T> =>
    pode ? ler() : Promise.resolve(vazio);

  try {
    [eventos, palestrantes, resumoLeads, conteudos, eventosHomeIds] = await Promise.all([
      seTiver(temTela(acesso, ["site.eventos", "site.home", "site.painel"]), listarEventosCms, []),
      // Conteúdos usa a lista para escolher o autor.
      seTiver(
        temTela(acesso, [
          "site.palestrantes",
          "site.eventos",
          "site.corpo-docente",
          "site.conteudos",
          "site.painel",
        ]),
        listarPalestrantesCms,
        [],
      ),
      seTiver(verPainel, contarLeadsCms, resumoLeads),
      seTiver(temTela(acesso, ["site.conteudos", "site.painel"]), listarConteudosCms, []),
      seTiver(temTela(acesso, ["site.home"]), obterEventosHomeIds, []),
    ]);
  } catch (e) {
    console.error("[PainelPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  // O que a interface deixa este perfil fazer — calculado aqui, no servidor,
  // com as mesmas regras das Server Actions (que seguem sendo a barreira real).
  const capacidades = capacidadesDoAcesso(acesso);

  return (
    <ShellCms
      usuario={usuario}
      acesso={acesso}
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
