import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { listarLeadsCms, type LeadCmsResumo } from "@/lib/cms/painelCms";
import {
  listarClientesCrm,
  listarContatosCrm,
  listarOportunidadesCrm,
  listarUsuariosCms,
  obterCatalogoCrm,
  type CatalogoCrm,
  type ClienteCrmResumo,
  type ContatoCrmResumo,
  type OportunidadeCrmResumo,
  type UsuarioCmsResumo,
} from "@/lib/cms/painelCrm";

import { ShellCrm } from "./ShellCrm";

export const dynamic = "force-dynamic";

/**
 * Rota /crm — módulo CRM do Portal Admin. Server Component: carrega SÓ os
 * dados comerciais e entrega ao casco client. Banco indisponível ⇒ listas
 * vazias + erroLeitura (mesmo padrão da rota /).
 */
export default async function PainelCrmPage() {
  const usuario = await exigirUsuarioCms();

  let clientes: ClienteCrmResumo[] = [];
  let contatos: ContatoCrmResumo[] = [];
  let oportunidades: OportunidadeCrmResumo[] = [];
  let leads: LeadCmsResumo[] = [];
  let catalogo: CatalogoCrm = { programas: [], modulos: [], eventos: [] };
  let usuarios: UsuarioCmsResumo[] = [];
  let erroLeitura = false;

  try {
    [clientes, contatos, oportunidades, leads, catalogo, usuarios] = await Promise.all([
      listarClientesCrm(),
      listarContatosCrm(),
      listarOportunidadesCrm(),
      listarLeadsCms(),
      obterCatalogoCrm(),
      listarUsuariosCms(),
    ]);
  } catch (e) {
    console.error("[PainelCrmPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  const hojeISO = new Date().toISOString().slice(0, 10);

  return (
    <ShellCrm
      usuario={usuario}
      clientes={clientes}
      contatos={contatos}
      oportunidades={oportunidades}
      leads={leads}
      catalogo={catalogo}
      usuarios={usuarios}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
