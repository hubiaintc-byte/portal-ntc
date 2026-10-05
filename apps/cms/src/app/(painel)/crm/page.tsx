import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import {
  listarClientesCrm,
  listarLeadsCrm,
  listarUsuariosCms,
  obterCatalogoCrm,
  listarProdutosCrm,
  listarPropostasCrm,
  todosEnviosCrm,
  type CatalogoCrm,
  type ClienteCrmResumo,
  type LeadCrmResumo,
  type UsuarioCmsResumo,
  type ProdutoCrmResumo,
  type PropostaResumo,
  type EnvioResumo,
} from "@/lib/cms/painelCrm";
import {
  listarModulosCrm,
  listarProgramasCrm,
  type ModuloCrmResumo,
  type ProgramaCrmResumo,
} from "@/lib/cms/catalogoCrm";

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
  let leads: LeadCrmResumo[] = [];
  let catalogo: CatalogoCrm = { programas: [], modulos: [], eventos: [], especialistas: [] };
  let usuarios: UsuarioCmsResumo[] = [];
  let programas: ProgramaCrmResumo[] = [];
  let modulos: ModuloCrmResumo[] = [];
  let produtos: ProdutoCrmResumo[] = [];
  let propostas: PropostaResumo[] = [];
  let envios: EnvioResumo[] = [];
  let erroLeitura = false;

  try {
    [clientes, leads, catalogo, usuarios, programas, modulos, produtos, propostas, envios] =
      await Promise.all([
        listarClientesCrm(),
        listarLeadsCrm(),
        obterCatalogoCrm(),
        listarUsuariosCms(),
        listarProgramasCrm(),
        listarModulosCrm(),
        listarProdutosCrm(),
        listarPropostasCrm(),
        todosEnviosCrm(),
      ]);
  } catch (e) {
    console.error("[PainelCrmPage] Erro ao ler banco:", e);
    erroLeitura = true;
  }

  const hojeISO = new Date().toISOString();

  return (
    <ShellCrm
      usuario={usuario}
      clientes={clientes}
      leads={leads}
      catalogo={catalogo}
      usuarios={usuarios}
      programas={programas}
      modulos={modulos}
      produtos={produtos}
      propostas={propostas}
      envios={envios}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
