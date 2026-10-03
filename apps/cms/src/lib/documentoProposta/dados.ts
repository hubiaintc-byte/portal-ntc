import "server-only";

import type {
  ClienteCrm,
  Especialista,
  Evento,
  Modulo,
  Programa,
  Proposta,
  User,
} from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

import { subtituloProposta } from "./capa";
import { lexicalDocumentoParaHtml } from "./lexicalDocumento";
import {
  cargaHorariaTotalDosModulos,
  modulosContadosDoDocumento,
} from "./modulos";
import type { PosicaoExtra } from "./montar";

export interface ItemDocumento {
  rotulo: string;
  cargaHoraria: string;
  valorUnitario: number;
}

/** Os 12 textos corridos do documento, já convertidos de Lexical para HTML. */
export interface ConteudoHtmlProposta {
  apresentacao: string;
  contexto: string;
  objetivos: string;
  publicoAlvo: string;
  metodologia: string;
  eventon: string;
  certificacaoReplay: string;
  cancelamento: string;
  protecaoConteudo: string;
  fundamentacaoLegal: string;
  proximosPassos: string;
  fechamento: string;
}

export interface ParTituladoDocumento {
  titulo: string;
  descricao: string;
}

export interface DocenteDocumento {
  nome: string;
  credencial: string;
  eixo: string;
}

export interface ModuloDetalhadoDocumento {
  codigo: string;
  titulo: string;
  cargaHoraria: string | null;
  ementaHtml: string;
}

export interface SecaoExtraDocumento {
  titulo: string;
  corpoHtml: string;
  posicao: PosicaoExtra;
}

export interface DadosDocumentoProposta {
  id: string;
  codigo: string;
  codigoBase: string;
  versao: number;
  tipoTexto: string;
  subtitulo: string;
  modalidade: string;
  replay: string;
  condPagto: string;
  condEspecificas: string;
  dataCriacaoISO: string | null;
  validadeISO: string | null;
  elaboradorNome: string;
  aprovadorNome: string;
  clienteOrgao: string;
  clienteSigla: string;
  clienteUf: string;
  clienteMunicipio: string;
  clienteCnpj: string;
  clienteDirigente: string;
  clienteDirigenteCargo: string;
  /** "Contato Institucional" da seção 3: e-mail do órgão, ou do contato principal. */
  clienteContatoEmail: string;
  programaNome: string;
  programaSigla: string;
  itens: ItemDocumento[];
  cargaHorariaTotalModulos: string;
  conteudoHtml: ConteudoHtmlProposta;
  eixos: ParTituladoDocumento[];
  diferenciais: ParTituladoDocumento[];
  resultados: string[];
  docentes: DocenteDocumento[];
  modulosDetalhados: ModuloDetalhadoDocumento[];
  secoesExtras: SecaoExtraDocumento[];
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

/** Rótulo de exibição da titulação da ficha do especialista (select slug). */
const TITULACAO_TEXTO: Record<string, string> = {
  doutorado: "Doutorado",
  "pos-doutorado": "Pós-doutorado",
  mestrado: "Mestrado",
  especializacao: "Especialização",
  graduacao: "Graduação",
};

const POSICOES_EXTRA: PosicaoExtra[] = [
  "antes-quadro-comercial",
  "apos-condicoes-comerciais",
  "fim",
];

function ehObjeto<T>(v: number | T | null | undefined): v is T {
  return typeof v === "object" && v !== null;
}

function texto(v: string | null | undefined): string {
  return v ?? "";
}

/** Credencial derivada da ficha: titulação · instituição · cargo atual. */
/**
 * Credencial derivada da ficha do especialista — fallback da leitura e valor
 * gravado na criação da proposta (`painelCrmEscrita.criarProposta`). Exportada
 * para que as duas pontas não divirjam no formato.
 */
export function credencialDaFicha(e: Especialista): string {
  return [TITULACAO_TEXTO[e.titulacao] ?? "", texto(e.instituicao), texto(e.cargoAtual)]
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .join(" · ");
}

function posicaoDeExtra(v: string | null | undefined): PosicaoExtra {
  return POSICOES_EXTRA.find((p) => p === v) ?? "fim";
}

export async function obterDadosDocumentoProposta(
  id: string,
): Promise<DadosDocumentoProposta | null> {
  const payload = await obterPayload();
  let doc: Proposta;
  try {
    // depth 2: o nível 1 popula as relações diretas da proposta — inclusive as
    // que vivem dentro de arrays (`docentes.especialista`,
    // `modulosDetalhados.modulo`), porque array e group não consomem depth —, e
    // o nível 2 cobre as relações dentro desses documentos. Nenhum campo lido
    // aqui declara maxDepth, então não há nada a elevar.
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
  // O programa só entra na capa e no cabeçalho (nome e sigla). Desde a Sessão 2
  // todo o CONTEÚDO do documento vive na própria proposta — ler o programa aqui
  // reintroduziria a divergência que os campos de texto resolveram.
  const programa = ehObjeto<Programa>(doc.programa) ? doc.programa : null;
  const elaborador = ehObjeto<User>(doc.elaborador) ? doc.elaborador : null;
  const aprovador = ehObjeto<User>(doc.aprovador) ? doc.aprovador : null;

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

  const conteudoHtml: ConteudoHtmlProposta = {
    apresentacao: lexicalDocumentoParaHtml(doc.textoApresentacao),
    contexto: lexicalDocumentoParaHtml(doc.textoContexto),
    objetivos: lexicalDocumentoParaHtml(doc.textoObjetivos),
    publicoAlvo: lexicalDocumentoParaHtml(doc.textoPublicoAlvo),
    metodologia: lexicalDocumentoParaHtml(doc.textoMetodologia),
    eventon: lexicalDocumentoParaHtml(doc.textoEventon),
    certificacaoReplay: lexicalDocumentoParaHtml(doc.textoCertificacaoReplay),
    cancelamento: lexicalDocumentoParaHtml(doc.textoCancelamento),
    protecaoConteudo: lexicalDocumentoParaHtml(doc.textoProtecaoConteudo),
    fundamentacaoLegal: lexicalDocumentoParaHtml(doc.textoFundamentacaoLegal),
    proximosPassos: lexicalDocumentoParaHtml(doc.textoProximosPassos),
    fechamento: lexicalDocumentoParaHtml(doc.textoFechamento),
  };

  const eixos: ParTituladoDocumento[] = (doc.eixos ?? []).map((e) => ({
    titulo: texto(e.titulo),
    descricao: texto(e.descricao),
  }));
  const diferenciais: ParTituladoDocumento[] = (doc.diferenciais ?? []).map((d) => ({
    titulo: texto(d.titulo),
    descricao: texto(d.descricao),
  }));
  const resultados: string[] = (doc.resultados ?? []).map((r) => texto(r.texto));

  // Campo livre vence a ficha: o seletor da tela pré-preenche nome e
  // credencial a partir do especialista, então deixar a ficha vencer apagaria
  // a edição do usuário a cada leitura.
  const docentes: DocenteDocumento[] = (doc.docentes ?? []).map((d) => {
    const ficha = ehObjeto<Especialista>(d.especialista) ? d.especialista : null;
    const nomeLivre = texto(d.nome).trim();
    const credencialLivre = texto(d.credencial).trim();
    return {
      nome: nomeLivre || texto(ficha?.nome),
      credencial: credencialLivre || (ficha ? credencialDaFicha(ficha) : ""),
      eixo: texto(d.eixo),
    };
  });

  // `codigo` repete o formato de `linhasDoQuadro` (M + numero com 2 dígitos).
  // Sem a relação populada (só o id), fica vazio em vez de inventar número.
  const modulosDetalhados: ModuloDetalhadoDocumento[] = (doc.modulosDetalhados ?? []).map((m) => {
    const catalogo = ehObjeto<Modulo>(m.modulo) ? m.modulo : null;
    return {
      codigo: catalogo ? `M${String(catalogo.numero).padStart(2, "0")}` : "",
      titulo: texto(m.tituloExibido).trim() || texto(catalogo?.titulo),
      cargaHoraria: catalogo?.cargaHoraria ?? null,
      ementaHtml: lexicalDocumentoParaHtml(m.ementa),
    };
  });

  // Fonte única da contagem (ver `modulos.ts`): subtítulo, carga horária, capa,
  // Resumo, Arquitetura e Quadro Comercial falam todos deste conjunto.
  const contados = modulosContadosDoDocumento(modulosDetalhados);

  const secoesExtras: SecaoExtraDocumento[] = (doc.secoesExtras ?? []).map((s) => ({
    titulo: texto(s.titulo),
    corpoHtml: lexicalDocumentoParaHtml(s.corpo),
    posicao: posicaoDeExtra(s.posicao),
  }));

  return {
    id: String(doc.id),
    codigo: doc.codigo,
    codigoBase: doc.codigoBase,
    versao: doc.versao ?? 1,
    tipoTexto: TIPO_TEXTO[doc.tipo ?? ""] ?? "Proposta Técnico-Comercial",
    subtitulo: subtituloProposta(doc.tipo ?? "", contados.length, programa?.sigla ?? ""),
    modalidade: doc.modalidade ?? "A definir",
    replay: doc.replay ?? "90 dias",
    condPagto: doc.condPagto ?? "À vista após emissão da Nota Fiscal · 15 dias",
    condEspecificas: doc.condEspecificas ?? "",
    dataCriacaoISO: doc.dataCriacao ?? null,
    validadeISO: doc.validade ?? null,
    elaboradorNome: elaborador?.nome ?? "Comercial NTC",
    aprovadorNome: aprovador?.nome ?? "",
    clienteOrgao: cliente?.orgao ?? "—",
    clienteSigla: cliente?.sigla ?? cliente?.orgao ?? "—",
    clienteUf: cliente?.uf ?? "",
    clienteMunicipio: cliente?.municipio ?? "—",
    clienteCnpj: texto(cliente?.cnpj),
    clienteDirigente: contatoPrincipal?.nome ?? "—",
    clienteDirigenteCargo: texto(contatoPrincipal?.cargo),
    // O e-mail institucional do órgão vem primeiro; sem ele, o do contato
    // principal. É o que o modelo imprime em "Contato Institucional".
    clienteContatoEmail: texto(cliente?.email) || texto(contatoPrincipal?.email),
    programaNome: programa?.nomeCompleto ?? "Programa Estratégico NTC",
    programaSigla: programa?.sigla ?? "",
    itens,
    cargaHorariaTotalModulos: cargaHorariaTotalDosModulos(contados),
    conteudoHtml,
    eixos,
    diferenciais,
    resultados,
    docentes,
    modulosDetalhados,
    secoesExtras,
    valorUnitario,
    qtdPagantes: doc.qtdPagantes ?? 0,
    cortesias: doc.cortesias ?? 0,
    percDesconto: doc.percDesconto ?? 0,
    valorBruto: doc.valorBruto ?? 0,
    desconto: doc.desconto ?? 0,
    valorLiquido: doc.valorLiquido ?? 0,
  };
}
