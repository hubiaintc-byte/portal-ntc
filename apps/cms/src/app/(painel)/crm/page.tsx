import { exigirUsuarioCms } from "@/lib/cms/autenticacao";
import { listarLeadsCms, type LeadCmsResumo } from "@/lib/cms/painelCms";
import {
  listarClientesCrm,
  listarContatosCrm,
  listarOportunidadesCrm,
  listarUsuariosCms,
  obterCatalogoCrm,
  listarProgramasCrm,
  listarModulosCrm,
  listarProdutosCrm,
  listarPropostasCrm,
  todosEnviosCrm,
  versoesDeProposta,
  type CatalogoCrm,
  type ClienteCrmResumo,
  type ContatoCrmResumo,
  type OportunidadeCrmResumo,
  type UsuarioCmsResumo,
  type ProgramaCrmResumo,
  type ModuloCrmResumo,
  type ProdutoCrmResumo,
  type PropostaResumo,
  type EnvioResumo,
  type VersaoResumo,
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
  let programas: ProgramaCrmResumo[] = [];
  let modulos: ModuloCrmResumo[] = [];
  let produtos: ProdutoCrmResumo[] = [];
  let propostas: PropostaResumo[] = [];
  let envios: EnvioResumo[] = [];
  let versoes: VersaoResumo[] = [];
  let erroLeitura = false;

  try {
    [clientes, contatos, oportunidades, leads, catalogo, usuarios, programas, modulos, produtos, propostas, envios] =
      await Promise.all([
        listarClientesCrm(),
        listarContatosCrm(),
        listarOportunidadesCrm(),
        listarLeadsCms(),
        obterCatalogoCrm(),
        listarUsuariosCms(),
        listarProgramasCrm(),
        listarModulosCrm(),
        listarProdutosCrm(),
        listarPropostasCrm(),
        todosEnviosCrm(),
      ]);

    // Lista achatada de versões de todas as propostas (TelaVersoes espera não
    // agrupada — ver task-5-report.md). `listarPropostasCrm()` já devolve só a
    // versão vigente por codigoBase, então o número de chamadas aqui é o
    // número de propostas distintas (catálogo curado, volume baixo — não é
    // N+1 pesado no sentido de paginação/alto tráfego). Ver task-6-report.md
    // para a decisão eager vs. lazy.
    const basesUnicas = [...new Set(propostas.map((p) => p.codigoBase))];
    const versoesPorBase = await Promise.all(basesUnicas.map((base) => versoesDeProposta(base)));
    versoes = versoesPorBase.flat();
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
      programas={programas}
      modulos={modulos}
      produtos={produtos}
      propostas={propostas}
      envios={envios}
      versoes={versoes}
      hojeISO={hojeISO}
      erroLeitura={erroLeitura}
    />
  );
}
