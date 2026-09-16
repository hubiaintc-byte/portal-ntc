import "server-only";

import type { ClienteCrm, Evento, Modulo, Programa, Proposta, User } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

export interface ItemDocumento {
  rotulo: string;
  cargaHoraria: string;
  valorUnitario: number;
}

export interface DadosDocumentoProposta {
  id: string;
  codigo: string;
  codigoBase: string;
  versao: number;
  tipoTexto: string;
  modalidade: string;
  replay: string;
  condPagto: string;
  condEspecificas: string;
  dataCriacaoISO: string | null;
  validadeISO: string | null;
  elaboradorNome: string;
  clienteOrgao: string;
  clienteSigla: string;
  clienteUf: string;
  clienteMunicipio: string;
  clienteDirigente: string;
  programaNome: string;
  programaSigla: string;
  itens: ItemDocumento[];
  valorUnitario: number;
  qtdPagantes: number;
  cortesias: number;
  percDesconto: number;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
}

const TIPO_TEXTO: Record<string, string> = {
  "programa-completo": "Trilha Completa de Programa Estratégico",
  "modulo-avulso": "Módulo Avulso",
  "produto-evento-avulso": "Produto/Evento Avulso",
  customizada: "Solução Customizada · In Company",
};

function ehObjeto<T>(v: number | T | null | undefined): v is T {
  return typeof v === "object" && v !== null;
}

export async function obterDadosDocumentoProposta(
  id: string,
): Promise<DadosDocumentoProposta | null> {
  const payload = await obterPayload();
  let doc: Proposta;
  try {
    doc = await payload.findByID({ collection: "propostas", id, depth: 2 });
  } catch (e) {
    console.error("[obterDadosDocumentoProposta]", e);
    return null;
  }

  const cliente = ehObjeto<ClienteCrm>(doc.cliente) ? doc.cliente : null;
  // Contatos vivem embutidos no cliente (spec 2026-09-15 §3.2); o "dirigente"
  // do documento é o contato principal, ou o primeiro cadastrado.
  const contatos = cliente?.contatos ?? [];
  const contatoPrincipal = contatos.find((c) => c.principal === true) ?? contatos[0] ?? null;
  const programa = ehObjeto<Programa>(doc.programa) ? doc.programa : null;
  const elaborador = ehObjeto<User>(doc.elaborador) ? doc.elaborador : null;

  const modulos = (doc.modulos ?? []).filter((m): m is Modulo => ehObjeto<Modulo>(m));
  const eventos = (doc.eventos ?? []).filter((e): e is Evento => ehObjeto<Evento>(e));
  const valorUnitario = doc.valorUnitario ?? 0;

  const itens: ItemDocumento[] = [
    ...modulos.map((m) => ({
      rotulo: `M${m.numero} · ${m.titulo}`,
      cargaHoraria: m.cargaHoraria ?? "",
      valorUnitario,
    })),
    ...eventos.map((e) => ({
      rotulo: e.nome,
      cargaHoraria: e.cargaHoraria ?? "",
      valorUnitario,
    })),
  ];

  return {
    id: String(doc.id),
    codigo: doc.codigo,
    codigoBase: doc.codigoBase,
    versao: doc.versao ?? 1,
    tipoTexto: TIPO_TEXTO[doc.tipo ?? ""] ?? "Proposta Técnico-Comercial",
    modalidade: doc.modalidade ?? "A definir",
    replay: doc.replay ?? "90 dias",
    condPagto: doc.condPagto ?? "À vista após emissão da Nota Fiscal · 15 dias",
    condEspecificas: doc.condEspecificas ?? "",
    dataCriacaoISO: doc.dataCriacao ?? null,
    validadeISO: doc.validade ?? null,
    elaboradorNome: elaborador?.nome ?? "Comercial NTC",
    clienteOrgao: cliente?.orgao ?? "—",
    clienteSigla: cliente?.sigla ?? cliente?.orgao ?? "—",
    clienteUf: cliente?.uf ?? "",
    clienteMunicipio: cliente?.municipio ?? "—",
    clienteDirigente: contatoPrincipal?.nome ?? "—",
    programaNome: programa?.nomeCompleto ?? "Programa Estratégico NTC",
    programaSigla: programa?.sigla ?? "",
    itens,
    valorUnitario,
    qtdPagantes: doc.qtdPagantes ?? 0,
    cortesias: doc.cortesias ?? 0,
    percDesconto: doc.percDesconto ?? 0,
    valorBruto: doc.valorBruto ?? 0,
    desconto: doc.desconto ?? 0,
    valorLiquido: doc.valorLiquido ?? 0,
  };
}
