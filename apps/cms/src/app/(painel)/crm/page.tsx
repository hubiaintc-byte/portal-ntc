import { redirect } from "next/navigation";

import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { mostraModuloCrm } from "@/lib/cms/navegacao";
import { capacidadesDoAcesso, TELAS_LEADS, temTela } from "@/lib/cms/telas";
import {
  listarClientesCrm,
  listarClientesOpcoesCrm,
  listarLeadsCrm,
  listarLeadsOpcoesCrm,
  listarUsuariosCms,
  obterCatalogoCrm,
  listarProdutosCrm,
  listarPropostasCrm,
  todosEnviosCrm,
  type CatalogoCrm,
  type ClienteCrmResumo,
  type ClienteOpcao,
  type LeadCrmResumo,
  type LeadOpcao,
  type UsuarioCmsResumo,
  type ProdutoCrmResumo,
  type PropostaResumo,
  type EnvioResumo,
} from "@/lib/cms/painelCrm";
import {
  listarAreasCrm,
  listarModulosCrm,
  listarProgramasCrm,
  type AreaOpcao,
  type ModuloCrmResumo,
  type ProgramaCrmResumo,
} from "@/lib/cms/catalogoCrm";

import { ShellCrm } from "./ShellCrm";

export const dynamic = "force-dynamic";

const CATALOGO_VAZIO: CatalogoCrm = { programas: [], modulos: [], eventos: [], especialistas: [] };

/** Só lê quando a pessoa tem a tela; senão devolve o vazio sem tocar o banco. */
function seTiver<T>(pode: boolean, ler: () => Promise<T>, vazio: T): Promise<T> {
  return pode ? ler() : Promise.resolve(vazio);
}

/**
 * Rota /crm — módulo CRM do Portal Admin. Server Component: carrega SÓ os
 * conjuntos das telas que a pessoa tem, mais os dados de apoio mínimos
 * (spec §3.3, §6 — nenhum dado pessoal de uma tela não marcada chega ao
 * navegador). Banco indisponível ⇒ listas vazias + erroLeitura (mesmo
 * padrão da rota /). Sem nenhuma tela `crm.*`, volta ao Site.
 */
export default async function PainelCrmPage() {
  const usuario = await exigirUsuarioCms();
  const { acesso } = usuario;
  if (!mostraModuloCrm(acesso)) redirect("/");

  // O que a interface deixa esta pessoa fazer — mesmas regras das Server
  // Actions, que seguem sendo a barreira real.
  const capacidades = capacidadesDoAcesso(acesso);

  const verLeads = temTela(acesso, TELAS_LEADS);
  const verClientes = temTela(acesso, ["crm.clientes"]);
  const verPropostas = temTela(acesso, ["crm.propostas"]);
  const verCatalogo = temTela(acesso, ["crm.programas", "crm.modulos"]);

  let clientes: ClienteCrmResumo[] = [];
  let clientesOpcoes: ClienteOpcao[] = [];
  let leads: LeadCrmResumo[] = [];
  let leadsOpcoes: LeadOpcao[] = [];
  let catalogo: CatalogoCrm = CATALOGO_VAZIO;
  let usuarios: UsuarioCmsResumo[] = [];
  let programas: ProgramaCrmResumo[] = [];
  let modulos: ModuloCrmResumo[] = [];
  let produtos: ProdutoCrmResumo[] = [];
  let propostas: PropostaResumo[] = [];
  let envios: EnvioResumo[] = [];
  let areas: AreaOpcao[] = [];
  let erroLeitura = false;

  try {
    [
      clientes,
      clientesOpcoes,
      leads,
      leadsOpcoes,
      catalogo,
      usuarios,
      programas,
      modulos,
      produtos,
      propostas,
      envios,
      areas,
    ] = await Promise.all([
      seTiver(verClientes, listarClientesCrm, []),
      // Apoio: o select de cliente do lead e do wizard, para quem não tem Clientes.
      seTiver(!verClientes && (verLeads || verPropostas), listarClientesOpcoesCrm, []),
      seTiver(verLeads, listarLeadsCrm, []),
      // Apoio: o select de lead do wizard, para quem tem Propostas sem Dashboard/Leads.
      seTiver(!verLeads && verPropostas, listarLeadsOpcoesCrm, []),
      seTiver(verLeads || verPropostas, obterCatalogoCrm, CATALOGO_VAZIO),
      // Responsáveis (só nome): selects do lead, do cliente e da proposta.
      seTiver(verLeads || verClientes || verPropostas, listarUsuariosCms, []),
      seTiver(verCatalogo, listarProgramasCrm, []),
      seTiver(verCatalogo, listarModulosCrm, []),
      seTiver(temTela(acesso, ["crm.produtos"]), listarProdutosCrm, []),
      seTiver(verPropostas, listarPropostasCrm, []),
      seTiver(temTela(acesso, ["crm.envios"]), todosEnviosCrm, []),
      seTiver(verCatalogo, listarAreasCrm, []),
    ]);
  } catch (e) {
    console.error("[PainelCrmPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  const hojeISO = new Date().toISOString();

  return (
    <ShellCrm
      usuario={usuario}
      acesso={acesso}
      capacidades={capacidades}
      clientes={clientes}
      clientesOpcoes={clientesOpcoes}
      leads={leads}
      leadsOpcoes={leadsOpcoes}
      catalogo={catalogo}
      usuarios={usuarios}
      programas={programas}
      areas={areas}
      modulos={modulos}
      produtos={produtos}
      propostas={propostas}
      envios={envios}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
