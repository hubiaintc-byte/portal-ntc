import "server-only";

import { randomBytes } from "node:crypto";

import {
  calcularValoresProposta,
  codigoDaVersao,
  conteudoInicialProposta,
  divisaoExata,
  ehEstagioLead,
  estagioDaAcaoEvento,
  exigeConfirmacaoDupla,
  gerarCodigoBase,
  MOTIVOS_PERDA,
  podeApagarCliente,
  proximaVersao,
  tituloLeadApagado,
  urlValida,
  type AcaoEvento,
  type ChaveTextoInstitucional,
  type ConteudoInicialProposta,
  type ProgramaParaConteudo,
} from "@ntc/lib";
import type { Especialista, Modulo, Programa, Proposta } from "@ntc/types";
import type { Payload, RequiredDataFromCollectionSlug } from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";
import { ESFERA_LEAD_PARA_CLIENTE } from "@/lib/crm/casamento";
import { entradasDoDocumento, registrarNaLinhaDoTempo } from "@/lib/crm/linhaDoTempo";
import { executarEmTransacao } from "@/lib/crm/transacao";
import { credencialDaFicha, obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";
import { textoComSubtitulosParaLexical } from "@/lib/lexicalBuilders";
import { gerarPdfDeHtml } from "@/lib/pdf/gerarPdfDeHtml";
import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Escrita do módulo CRM via Local API. Toda função devolve ResultadoEscrita
 * com mensagem neutra — o detalhe do erro vai para o console do servidor.
 */

export interface DadosContato {
  nome: string;
  cargo: string;
  setor: string;
  email: string;
  whatsapp: string;
  principal: boolean;
  decisor: boolean;
}

export interface DadosClienteCrm {
  orgao: string;
  sigla: string;
  tipo: string;
  municipio: string;
  uf: string;
  esfera: string;
  area: string;
  cnpj: string;
  email: string;
  origem: string;
  responsavel: string;
  observacoes: string;
  contatos: DadosContato[];
}

const ouNulo = (v: string): string | null => (v.trim().length > 0 ? v.trim() : null);

/** Relationship do Payload é id numérico; "" (placeholder "— selecionar —") vira null. */
const idOuNulo = (v: string): number | null => {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Relationship hasMany: converte lista de ids string em números, descartando inválidos. */
const idsLista = (v: string[]): number[] =>
  v.map((s) => Number(s)).filter((n) => !Number.isNaN(n));

export function numeroOuNulo(v: string): number | null {
  const limpo = v.trim().replace(/\./g, "").replace(",", ".");
  if (limpo === "") return null;
  const n = Number(limpo);
  return Number.isFinite(n) ? n : null;
}

/** Deriva o id de um relationship do Payload, populado (objeto) ou não (número). */
function idDeRelacionamento(v: number | { id: number | string } | null | undefined): number | null {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "id" in v) {
    const n = Number(v.id);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

/** ISO da validade: hoje + validadeDias. Fonte única usada por criarProposta e criarVersaoProposta. */
function dataValidade(validadeDias: number): string {
  const validade = new Date();
  validade.setDate(validade.getDate() + validadeDias);
  return validade.toISOString();
}

// Os campos abaixo são `select` na coleção (uniões literais geradas pelo
// Payload em payload-types); os dados chegam como string livre do formulário
// (a UI só oferece as opções válidas da coleção) — cast pontual campo a
// campo, sem `any`, mesmo padrão de painelCmsEscrita.ts (salvarCamposEvento).
type ClienteCrmData = RequiredDataFromCollectionSlug<"clientes-crm">;

function dadosCliente(dados: DadosClienteCrm): ClienteCrmData {
  return {
    orgao: dados.orgao.trim(),
    sigla: ouNulo(dados.sigla),
    tipo: ouNulo(dados.tipo) as ClienteCrmData["tipo"],
    municipio: ouNulo(dados.municipio),
    uf: ouNulo(dados.uf) as ClienteCrmData["uf"],
    esfera: ouNulo(dados.esfera) as ClienteCrmData["esfera"],
    area: ouNulo(dados.area) as ClienteCrmData["area"],
    cnpj: ouNulo(dados.cnpj),
    email: ouNulo(dados.email),
    origem: (ouNulo(dados.origem) ?? "manual") as ClienteCrmData["origem"],
    responsavel: idOuNulo(dados.responsavel),
    observacoes: ouNulo(dados.observacoes),
    contatos: dados.contatos
      .filter((c) => c.nome.trim() !== "")
      .map((c) => ({
        nome: c.nome.trim(),
        cargo: ouNulo(c.cargo),
        setor: ouNulo(c.setor),
        email: ouNulo(c.email),
        whatsapp: ouNulo(c.whatsapp),
        principal: c.principal,
        decisor: c.decisor,
      })),
  };
}

/** Mesma regra do hook `beforeChange` da coleção — aqui para a mensagem chegar ao formulário. */
const ERRO_PRINCIPAL = "Só um contato pode ser o principal.";

export async function criarClienteCrm(dados: DadosClienteCrm): Promise<ResultadoEscrita> {
  if (dados.orgao.trim() === "") return { ok: false, erro: "Informe o órgão." };
  if (dados.contatos.filter((c) => c.principal).length > 1) return { ok: false, erro: ERRO_PRINCIPAL };
  try {
    const payload = await obterPayload();
    await payload.create({ collection: "clientes-crm", data: dadosCliente(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[criarClienteCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarClienteCrm(
  id: string,
  dados: DadosClienteCrm,
): Promise<ResultadoEscrita> {
  if (dados.orgao.trim() === "") return { ok: false, erro: "Informe o órgão." };
  if (dados.contatos.filter((c) => c.principal).length > 1) return { ok: false, erro: ERRO_PRINCIPAL };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "clientes-crm", id, data: dadosCliente(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarClienteCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// --- Propostas (spec 2026-07-22 · Fase B1) -------------------------------

export interface DadosProposta {
  cliente: string;
  programa: string;
  lead: string;
  tipo: string;
  modulos: string[];
  eventos: string[];
  valorUnitario: string;
  qtdPagantes: string;
  cortesias: string;
  percDesconto: string;
  modalidade: string;
  replay: string;
  condPagto: string;
  condEspecificas: string;
  observacoes: string;
  elaborador: string;
  aprovador: string;
  validadeDias: string;
  status: string;
}

export interface DadosEnvio {
  proposta: string;
  data: string;
  canal: string;
  destinatarios: string;
  status: string;
  observacoes: string;
}

type PropostaData = RequiredDataFromCollectionSlug<"propostas">;
type VersaoData = RequiredDataFromCollectionSlug<"versoes">;
type EnvioData = RequiredDataFromCollectionSlug<"envios">;

/**
 * Mapper puro: resolve relationships, parseia números do form e grava os
 * derivados (valorBruto/desconto/valorLiquido) via calcularValoresProposta.
 * codigoBase/codigo/versao vêm fixados pelo chamador (criar/atualizar
 * decidem a sequência de versionamento antes de montar os dados).
 * `percDesconto` é gravado como número 0–100 (não fração) — mesma unidade
 * que a coleção `propostas` e o formulário usam.
 */
export function dadosProposta(
  dados: DadosProposta,
  clienteId: number,
  leadId: number,
  ids: { codigoBase: string; codigo: string; versao: number },
): PropostaData {
  const valorUnitario = numeroOuNulo(dados.valorUnitario) ?? 0;
  const qtdPagantes = numeroOuNulo(dados.qtdPagantes) ?? 0;
  const cortesias = numeroOuNulo(dados.cortesias) ?? 0;
  const percDesconto = numeroOuNulo(dados.percDesconto) ?? 0;
  const valores = calcularValoresProposta({
    valorUnitario,
    qtdPagantes,
    cortesias,
    percDesconto,
  });
  return {
    codigoBase: ids.codigoBase,
    codigo: ids.codigo,
    versao: ids.versao,
    lead: leadId,
    cliente: clienteId,
    programa: idOuNulo(dados.programa),
    tipo: ouNulo(dados.tipo) as PropostaData["tipo"],
    status: (ouNulo(dados.status) ?? "rascunho") as PropostaData["status"],
    modulos: idsLista(dados.modulos),
    eventos: idsLista(dados.eventos),
    valorUnitario,
    qtdPagantes,
    cortesias,
    percDesconto,
    valorBruto: valores.valorBruto,
    desconto: valores.desconto,
    valorLiquido: valores.valorLiquido,
    modalidade: ouNulo(dados.modalidade),
    replay: ouNulo(dados.replay),
    condPagto: ouNulo(dados.condPagto),
    condEspecificas: ouNulo(dados.condEspecificas),
    observacoes: ouNulo(dados.observacoes),
    elaborador: idOuNulo(dados.elaborador),
    aprovador: idOuNulo(dados.aprovador),
    validadeDias: numeroOuNulo(dados.validadeDias) ?? 30,
  };
}

// --- Conteúdo do documento da proposta (spec 2026-10-03 · Sessão 2) -------

type PropostaRichText = PropostaData["textoApresentacao"];
type PropostaModulosDetalhados = PropostaData["modulosDetalhados"];
type ModulosDetalhadosNoBanco = NonNullable<Proposta["modulosDetalhados"]>;

/**
 * Pagantes e cortesias são distribuídos igualmente pelos módulos no quadro
 * comercial (`linhasDoQuadro`), que devolve [] — e omite a tabela — quando a
 * divisão não é exata. Aqui a escrita recusa antes de gravar, para o documento
 * nunca nascer sem o quadro. Sem módulos não há o que dividir.
 */
function erroDeMultiplos(dados: DadosProposta): string | null {
  const n = idsLista(dados.modulos).length;
  if (n === 0) return null;
  const qtdPagantes = numeroOuNulo(dados.qtdPagantes) ?? 0;
  const cortesias = numeroOuNulo(dados.cortesias) ?? 0;
  if (divisaoExata(qtdPagantes, n) && divisaoExata(cortesias, n)) return null;
  return `Pagantes e cortesias precisam ser múltiplos de ${n} (número de módulos).`;
}

/** Há algum texto fora de espaços em branco neste nó Lexical (ou descendentes)? */
function noLexicalTemTexto(no: unknown): boolean {
  if (no === null || typeof no !== "object") return false;
  const registro = no as Record<string, unknown>;
  if (typeof registro.text === "string" && registro.text.trim().length > 0) return true;
  const filhos = registro.children;
  return Array.isArray(filhos) && filhos.some((f) => noLexicalTemTexto(f));
}

/**
 * Documento richText com conteúdo de fato. Campo ausente, `null` e documento
 * só com parágrafo vazio (o que o editor grava ao limpar o campo) contam
 * todos como vazios.
 */
function temTextoLexical(documento: unknown): boolean {
  if (documento === null || typeof documento !== "object") return false;
  return noLexicalTemTexto((documento as { root?: unknown }).root);
}

/**
 * `{ campo: documento }` quando há texto; `{}` quando não — campo ausente no
 * objeto gravado faz o documento omitir a seção (em vez de imprimir um
 * título com corpo vazio).
 */
function seTemTexto<K extends string>(
  campo: K,
  valor: unknown,
): Partial<Record<K, PropostaRichText>> {
  if (!temTextoLexical(valor)) return {};
  return { [campo]: valor as PropostaRichText } as Record<K, PropostaRichText>;
}

/**
 * Os cinco textos que vêm do programa, copiados tal e qual (nunca
 * reserializados — o documento Lexical do catálogo vale como está).
 */
function textosDoPrograma(programa: Programa | null): Partial<PropostaData> {
  if (programa === null) return {};
  return {
    ...seTemTexto("textoApresentacao", programa.visaoGeral),
    ...seTemTexto("textoContexto", programa.problema),
    ...seTemTexto("textoObjetivos", programa.objetivo),
    ...seTemTexto("textoPublicoAlvo", programa.publicoAlvo),
    ...seTemTexto("textoMetodologia", programa.metodologia),
  };
}

/** Arrays do programa para a função pura — `?? []`, porque todos são opcionais. */
function programaParaConteudo(programa: Programa | null): ProgramaParaConteudo | null {
  if (programa === null) return null;
  return {
    eixos: (programa.eixosTematicos ?? []).map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    diferenciais: (programa.diferenciais ?? []).map((d) => ({
      titulo: d.titulo,
      descricao: d.descricao ?? "",
    })),
    resultados: (programa.resultadosEsperados ?? []).map((r) => r.resultado),
  };
}

/** Módulos do catálogo na ordem dos ids pedidos (o `find` não garante ordem). */
async function modulosDoCatalogo(payload: Payload, ids: number[]): Promise<Modulo[]> {
  if (ids.length === 0) return [];
  const achados = await payload.find({
    collection: "modulos",
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length,
  });
  const porId = new Map(achados.docs.map((m) => [Number(m.id), m]));
  return ids.map((id) => porId.get(id)).filter((m): m is Modulo => m !== undefined);
}

/**
 * Fichas dos especialistas vinculados ao programa. O programa é buscado com
 * `depth: 0` (ver `criarProposta`), então `docentes` chega como ids e precisa
 * desta consulta; referências já populadas são aproveitadas sem ir ao banco.
 */
async function fichasDosDocentes(
  payload: Payload,
  refs: (number | Especialista)[],
): Promise<Especialista[]> {
  if (refs.length === 0) return [];
  const porId = new Map<number, Especialista>();
  for (const ref of refs) {
    if (typeof ref !== "number") porId.set(Number(ref.id), ref);
  }
  const pendentes = refs.filter((r): r is number => typeof r === "number");
  if (pendentes.length > 0) {
    const achados = await payload.find({
      collection: "especialistas",
      where: { id: { in: pendentes } },
      depth: 0,
      limit: pendentes.length,
    });
    for (const doc of achados.docs) porId.set(Number(doc.id), doc);
  }
  return refs
    .map((ref) => porId.get(typeof ref === "number" ? ref : Number(ref.id)))
    .filter((e): e is Especialista => e !== undefined);
}

/**
 * Tudo que a criação da proposta grava de conteúdo: os 5 textos do programa,
 * os 7 institucionais (convertidos de texto puro para Lexical com a convenção
 * de subtítulo "## " dos textos padrão), as 3 listas, os docentes e os módulos
 * detalhados com a ementa do catálogo.
 */
function conteudoParaGravar(p: {
  conteudo: ConteudoInicialProposta;
  programa: Programa | null;
  modulos: Modulo[];
  docentes: Especialista[];
}): Partial<PropostaData> {
  const lexical = (texto: string): PropostaRichText =>
    textoComSubtitulosParaLexical(texto) as PropostaRichText;
  return {
    ...textosDoPrograma(p.programa),
    textoEventon: lexical(p.conteudo.textos.eventon),
    textoCertificacaoReplay: lexical(p.conteudo.textos.certificacaoReplay),
    textoCancelamento: lexical(p.conteudo.textos.cancelamento),
    textoProtecaoConteudo: lexical(p.conteudo.textos.protecaoConteudo),
    textoFundamentacaoLegal: lexical(p.conteudo.textos.fundamentacaoLegal),
    textoProximosPassos: lexical(p.conteudo.textos.proximosPassos),
    textoFechamento: lexical(p.conteudo.textos.fechamento),
    eixos: p.conteudo.eixos,
    diferenciais: p.conteudo.diferenciais,
    resultados: p.conteudo.resultados,
    docentes: p.docentes.map((ficha) => ({
      especialista: Number(ficha.id),
      nome: ficha.nome,
      credencial: credencialDaFicha(ficha),
      eixo: null,
    })),
    modulosDetalhados: p.modulos.map((m) => ({
      modulo: Number(m.id),
      tituloExibido: m.titulo,
      // Mesma regra dos textos: ementa vazia ou ausente não é gravada, para o
      // documento omitir o corpo do módulo em vez de imprimir um bloco branco.
      ...seTemTexto("ementa", m.ementa),
    })),
  };
}

/**
 * `{ campo: itens }` quando a lista existe na origem (mesmo vazia); `{}`
 * quando é `null`/ausente — campo ausente na vigente continua ausente na
 * versão nova.
 */
function seLista<K extends string, T, U>(
  campo: K,
  valor: T[] | null | undefined,
  mapear: (item: T) => U,
): Partial<Record<K, U[]>> {
  if (!valor) return {};
  return { [campo]: valor.map(mapear) } as Record<K, U[]>;
}

/**
 * Conteúdo do documento copiado da versão que está sendo substituída — nunca
 * recalculado a partir do programa: a nova versão nasce com o que foi
 * revisado e enviado àquele cliente (quem quiser o padrão de volta usa
 * "Restaurar padrão"). As relações são gravadas como id (`idDeRelacionamento`
 * cobre a vigente lida com relação populada) e os `id` que o Payload gera
 * para item de array ficam de fora, para a nova versão ter linhas próprias.
 */
function conteudoDaVersaoAnterior(vigente: Proposta): Partial<PropostaData> {
  return {
    ...seTemTexto("textoApresentacao", vigente.textoApresentacao),
    ...seTemTexto("textoContexto", vigente.textoContexto),
    ...seTemTexto("textoObjetivos", vigente.textoObjetivos),
    ...seTemTexto("textoPublicoAlvo", vigente.textoPublicoAlvo),
    ...seTemTexto("textoMetodologia", vigente.textoMetodologia),
    ...seTemTexto("textoEventon", vigente.textoEventon),
    ...seTemTexto("textoCertificacaoReplay", vigente.textoCertificacaoReplay),
    ...seTemTexto("textoCancelamento", vigente.textoCancelamento),
    ...seTemTexto("textoProtecaoConteudo", vigente.textoProtecaoConteudo),
    ...seTemTexto("textoFundamentacaoLegal", vigente.textoFundamentacaoLegal),
    ...seTemTexto("textoProximosPassos", vigente.textoProximosPassos),
    ...seTemTexto("textoFechamento", vigente.textoFechamento),
    ...seLista("eixos", vigente.eixos, (e) => ({ titulo: e.titulo, descricao: e.descricao })),
    ...seLista("diferenciais", vigente.diferenciais, (d) => ({
      titulo: d.titulo,
      descricao: d.descricao,
    })),
    ...seLista("resultados", vigente.resultados, (r) => ({ texto: r.texto })),
    ...seLista("docentes", vigente.docentes, (d) => ({
      especialista: idDeRelacionamento(d.especialista),
      nome: d.nome,
      credencial: d.credencial,
      eixo: d.eixo,
    })),
    ...seLista("modulosDetalhados", vigente.modulosDetalhados, (m) => ({
      modulo: idDeRelacionamento(m.modulo),
      tituloExibido: m.tituloExibido,
      ementa: m.ementa,
    })),
    // Seção livre do PO: não há "Restaurar padrão" que a traga de volta —
    // perder um anexo textual escrito à mão é irreversível.
    ...seLista("secoesExtras", vigente.secoesExtras, (s) => ({
      titulo: s.titulo,
      corpo: s.corpo,
      posicao: s.posicao,
    })),
  };
}

/**
 * Merge dos módulos detalhados na edição: entrada já existente **nunca** é
 * sobrescrita (a edição manual do PO sobrevive a cada salvar), módulo
 * acrescentado entra com título e ementa do catálogo naquele momento, módulo
 * removido da seleção tem a entrada descartada. Entrada sem módulo vinculado
 * (texto livre do PO) é preservada.
 */
function mesclarModulosDetalhados(
  existentes: ModulosDetalhadosNoBanco,
  selecionados: number[],
  novosDoCatalogo: Modulo[],
): PropostaModulosDetalhados {
  const mantidas = existentes
    .filter((e) => {
      const id = idDeRelacionamento(e.modulo);
      return id === null || selecionados.includes(id);
    })
    .map((e) => ({ ...e, modulo: idDeRelacionamento(e.modulo) }));
  const novas = novosDoCatalogo.map((m) => ({
    modulo: Number(m.id),
    tituloExibido: m.titulo,
    ...seTemTexto("ementa", m.ementa),
  }));
  return [...mantidas, ...novas] as PropostaModulosDetalhados;
}

/**
 * Composição única do conteúdo do documento a partir do estado atual
 * (programa, cliente, módulos selecionados, modalidade, replay). Usada pela
 * criação da proposta e por "Restaurar conteúdo padrão" — as duas precisam
 * calcular exatamente o mesmo, então não há segunda cópia desta lógica.
 */
async function calcularConteudoProposta(
  payload: Payload,
  p: {
    programa: Programa | null;
    cliente: { orgao: string; sigla?: string | null };
    moduloIds: number[];
    modalidade: string;
    replay: string;
  },
): Promise<Partial<PropostaData>> {
  // O programa vem com depth 0: `docentes` são ids e precisam da consulta própria.
  const [modulosCatalogo, docentes] = await Promise.all([
    modulosDoCatalogo(payload, p.moduloIds),
    fichasDosDocentes(payload, p.programa?.docentes ?? []),
  ]);
  const conteudo = conteudoInicialProposta({
    programa: programaParaConteudo(p.programa),
    modulos: modulosCatalogo.map((m) => ({ id: String(m.id), titulo: m.titulo })),
    contextoTextos: {
      clienteOrgao: p.cliente.orgao,
      clienteSigla: p.cliente.sigla ?? p.cliente.orgao,
      programaSigla: p.programa?.sigla ?? "",
      modalidade: p.modalidade.trim(),
      replay: p.replay.trim(),
      numModulos: modulosCatalogo.length,
    },
  });
  return conteudoParaGravar({ conteudo, programa: p.programa, modulos: modulosCatalogo, docentes });
}

export async function criarProposta(dados: DadosProposta): Promise<ResultadoEscrita> {
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const leadId = idOuNulo(dados.lead);
  if (leadId === null) return { ok: false, erro: "Selecione o lead." };
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  // Programa obrigatório nos 4 tipos de proposta (decisão do PO, 30/09/2026 —
  // antes era opcional para a Customizada/In Company). A tela também marca o
  // select como `required`; esta é a defesa que vale para quem não passa por ela.
  if (idOuNulo(dados.programa) === null) return { ok: false, erro: "Selecione o programa." };
  const erroMultiplos = erroDeMultiplos(dados);
  if (erroMultiplos !== null) return { ok: false, erro: erroMultiplos };
  try {
    const payload = await obterPayload();
    const [programaDoc, clienteDoc] = await Promise.all([
      dados.programa.trim() !== ""
        ? payload.findByID({ collection: "programas", id: dados.programa, depth: 0 })
        : null,
      payload.findByID({ collection: "clientes-crm", id: clienteId, depth: 0 }),
    ]);
    const ano = new Date().getFullYear();
    const codigoBase = gerarCodigoBase({
      ano,
      siglaPrograma: programaDoc?.sigla ?? "GERAL",
      uf: clienteDoc.uf ?? "XX",
      siglaCliente: clienteDoc.sigla ?? clienteDoc.orgao,
    });
    const existentes = await payload.find({
      collection: "propostas",
      where: { codigoBase: { equals: codigoBase } },
      limit: 1000,
      depth: 0,
      select: { codigo: true },
    });
    const codigos = existentes.docs.map((doc) => doc.codigo).filter((c): c is string => Boolean(c));
    const versao = proximaVersao(codigos);
    const codigo = codigoDaVersao(codigoBase, versao);
    const agora = new Date();
    const validadeDias = numeroOuNulo(dados.validadeDias) ?? 30;
    const conteudo = await calcularConteudoProposta(payload, {
      programa: programaDoc,
      cliente: clienteDoc,
      moduloIds: idsLista(dados.modulos),
      modalidade: dados.modalidade,
      replay: dados.replay,
    });
    await payload.create({
      collection: "propostas",
      data: {
        ...dadosProposta(dados, clienteId, leadId, { codigoBase, codigo, versao }),
        ...conteudo,
        dataCriacao: agora.toISOString(),
        validade: dataValidade(validadeDias),
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[criarProposta]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarProposta(
  id: string,
  dados: DadosProposta,
): Promise<ResultadoEscrita> {
  const leadId = idOuNulo(dados.lead);
  if (leadId === null) return { ok: false, erro: "Selecione o lead." };
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  // Programa obrigatório desde 30/09/2026 (decisão do PO): vale para os 4
  // tipos, inclusive Customizada/In Company, que antes podia ficar sem. Vazio
  // ou id que não resolve são o mesmo erro — falha fechado, e nunca grava null
  // por cima de um programa já vinculado.
  if (idOuNulo(dados.programa) === null) return { ok: false, erro: "Selecione o programa." };
  const erroMultiplos = erroDeMultiplos(dados);
  if (erroMultiplos !== null) return { ok: false, erro: erroMultiplos };
  try {
    const payload = await obterPayload();
    // Recarrega para preservar codigoBase/codigo/versao — não são reeditáveis
    // pelo formulário (mudam só via criarVersaoProposta).
    const atual = await payload.findByID({ collection: "propostas", id, depth: 0 });
    // Os 12 textos e as listas de conteúdo (eixos/diferenciais/resultados/
    // docentes) ficam fora do objeto de propósito: `payload.update` é parcial,
    // e campo ausente não é tocado — é isso que preserva o que o PO editou à
    // mão. Só `modulosDetalhados` acompanha a seleção de módulos, e só quando
    // ela muda.
    const existentes: ModulosDetalhadosNoBanco = atual.modulosDetalhados ?? [];
    const selecionados = idsLista(dados.modulos);
    const idsExistentes = existentes
      .map((e) => idDeRelacionamento(e.modulo))
      .filter((n): n is number => n !== null);
    const acrescentados = selecionados.filter((s) => !idsExistentes.includes(s));
    const removidos = idsExistentes.filter((e) => !selecionados.includes(e));
    const novosDoCatalogo = await modulosDoCatalogo(payload, acrescentados);
    const mudouSelecao = acrescentados.length > 0 || removidos.length > 0;
    await payload.update({
      collection: "propostas",
      id,
      data: {
        ...dadosProposta(dados, clienteId, leadId, {
          codigoBase: atual.codigoBase,
          codigo: atual.codigo,
          versao: atual.versao ?? 1,
        }),
        ...(mudouSelecao
          ? {
              modulosDetalhados: mesclarModulosDetalhados(
                existentes,
                selecionados,
                novosDoCatalogo,
              ),
            }
          : {}),
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarProposta]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export type AlvoRestauracao =
  | "tudo"
  | ChaveTextoInstitucional
  | "apresentacao"
  | "contexto"
  | "objetivos"
  | "publicoAlvo"
  | "metodologia"
  | "eixos"
  | "diferenciais"
  | "resultados"
  | "docentes"
  | "modulos";

const CAMPOS_TEXTO_RESTAURAVEIS = [
  "textoApresentacao", "textoContexto", "textoObjetivos", "textoPublicoAlvo", "textoMetodologia",
  "textoEventon", "textoCertificacaoReplay", "textoCancelamento", "textoProtecaoConteudo",
  "textoFundamentacaoLegal", "textoProximosPassos", "textoFechamento",
] as const;
const CAMPOS_LISTA_RESTAURAVEIS = [
  "eixos", "diferenciais", "resultados", "docentes", "modulosDetalhados",
] as const;
/**
 * Listas que "tudo" NÃO toca. `docentes`: hoje nenhum programa tem especialista
 * vinculado, então o recálculo devolve [] e "tudo" apagaria, de forma
 * irreversível, os docentes que o PO digitou à mão; ele tem alvo próprio. Mesmo
 * princípio de `secoesExtras`, que nem é restaurável. Não "corrigir" isto.
 */
const LISTAS_FORA_DO_TUDO: readonly string[] = ["docentes"];
type CampoRestauravel =
  | (typeof CAMPOS_TEXTO_RESTAURAVEIS)[number]
  | (typeof CAMPOS_LISTA_RESTAURAVEIS)[number];

/**
 * Alvo de uma seção -> o único campo que ele toca. Primitivo do mapa:
 * `camposDoAlvo` ("tudo" incluído) e `salvarSecaoConteudoProposta` leem daqui,
 * para restaurar e salvar nunca divergirem sobre qual campo é qual seção.
 */
function campoDoAlvo(alvo: Exclude<AlvoRestauracao, "tudo">): CampoRestauravel {
  switch (alvo) {
    case "docentes": return "docentes";
    case "apresentacao": return "textoApresentacao";
    case "contexto": return "textoContexto";
    case "objetivos": return "textoObjetivos";
    case "publicoAlvo": return "textoPublicoAlvo";
    case "metodologia": return "textoMetodologia";
    case "eixos": return "eixos";
    case "diferenciais": return "diferenciais";
    case "resultados": return "resultados";
    case "modulos": return "modulosDetalhados";
    case "eventon": return "textoEventon";
    case "certificacaoReplay": return "textoCertificacaoReplay";
    case "cancelamento": return "textoCancelamento";
    case "protecaoConteudo": return "textoProtecaoConteudo";
    case "fundamentacaoLegal": return "textoFundamentacaoLegal";
    case "proximosPassos": return "textoProximosPassos";
    case "fechamento": return "textoFechamento";
  }
}

/** Alvo do botão -> campos que ele toca. "tudo" não inclui docentes (ver LISTAS_FORA_DO_TUDO). */
function camposDoAlvo(alvo: AlvoRestauracao): readonly CampoRestauravel[] {
  if (alvo === "tudo") {
    return [
      ...CAMPOS_TEXTO_RESTAURAVEIS,
      ...CAMPOS_LISTA_RESTAURAVEIS.filter((c) => !LISTAS_FORA_DO_TUDO.includes(c)),
    ];
  }
  return [campoDoAlvo(alvo)];
}

/**
 * "Restaurar conteúdo padrão": recalcula o conteúdo a partir do estado atual
 * da proposta (mesma composição da criação) e grava SÓ o alvo pedido.
 *
 * - Alvo cujo recálculo vem vazio (texto sem conteúdo no programa, ou
 *   institucional vazio) vira `null`, nunca documento Lexical vazio: o padrão
 *   ali é "sem conteúdo", e é o campo ausente que faz o documento omitir a
 *   seção. Lista vazia grava `[]`.
 * - "modulos" SOBRESCREVE `modulosDetalhados` com o catálogo atual, ao
 *   contrário do merge preservador de `atualizarProposta`: desfazer a edição
 *   manual é justamente o objetivo do botão.
 * - Uma única escrita, então sem `executarEmTransacao`; `usuario` vai no
 *   `user` do update (autoria para os hooks), como nas ações do lead.
 */
export async function restaurarConteudoProposta(
  id: string,
  alvo: AlvoRestauracao,
  usuario: UsuarioAutenticado,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const atual = await payload.findByID({ collection: "propostas", id, depth: 0 });
    const clienteId = idDeRelacionamento(atual.cliente);
    if (clienteId === null) return { ok: false, erro: "Proposta sem cliente vinculado." };
    const programaId = idDeRelacionamento(atual.programa);
    const [programa, cliente] = await Promise.all([
      programaId === null
        ? null
        : payload.findByID({ collection: "programas", id: programaId, depth: 0 }),
      payload.findByID({ collection: "clientes-crm", id: clienteId, depth: 0 }),
    ]);
    const calculado = await calcularConteudoProposta(payload, {
      programa,
      cliente,
      moduloIds: (atual.modulos ?? [])
        .map((m) => idDeRelacionamento(m))
        .filter((n): n is number => n !== null),
      modalidade: atual.modalidade ?? "",
      replay: atual.replay ?? "",
    });
    const data: Record<string, unknown> = {};
    for (const campo of camposDoAlvo(alvo)) {
      const valor: unknown = calculado[campo];
      const ehTexto = (CAMPOS_TEXTO_RESTAURAVEIS as readonly string[]).includes(campo);
      if (ehTexto) data[campo] = temTextoLexical(valor) ? valor : null;
      else data[campo] = valor ?? [];
    }
    await payload.update({
      collection: "propostas",
      id,
      data: data as Partial<PropostaData>,
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[restaurarConteudoProposta]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * Alvo de uma seção EDITÁVEL do conteúdo do documento: os mesmos alvos de
 * `AlvoRestauracao` menos "tudo" (que não é uma seção, e por isso não se
 * salva), mais `secoesExtras` — seção livre do PO, que não tem padrão a
 * restaurar e por isso nunca entrou em `AlvoRestauracao`.
 */
export type AlvoConteudoProposta = Exclude<AlvoRestauracao, "tudo"> | "secoesExtras";

/**
 * O que a tela manda para uma seção. Discriminado por `tipo` e conferido
 * contra o alvo (`TIPO_DE_ALVO`) antes de qualquer escrita: Server Action é
 * endpoint público, e um par alvo/valor trocado gravaria lista em campo de
 * texto. Texto chega PURO (convenção de `textoComSubtitulosParaLexical`:
 * parágrafos por linha, "- " item de lista, "## " subtítulo).
 */
export type ValorSecaoProposta =
  | { tipo: "texto"; texto: string }
  | { tipo: "pares"; itens: { titulo: string; descricao: string }[] }
  | { tipo: "resultados"; itens: string[] }
  | {
      tipo: "docentes";
      itens: { especialistaId: string; nome: string; credencial: string; eixo: string }[];
    }
  | { tipo: "modulos"; itens: { moduloId: string; tituloExibido: string; ementa: string }[] }
  | { tipo: "extras"; itens: { titulo: string; corpo: string; posicao: string }[] };

const TIPO_DE_ALVO: Record<AlvoConteudoProposta, ValorSecaoProposta["tipo"]> = {
  apresentacao: "texto",
  contexto: "texto",
  objetivos: "texto",
  publicoAlvo: "texto",
  metodologia: "texto",
  eventon: "texto",
  certificacaoReplay: "texto",
  cancelamento: "texto",
  protecaoConteudo: "texto",
  fundamentacaoLegal: "texto",
  proximosPassos: "texto",
  fechamento: "texto",
  eixos: "pares",
  diferenciais: "pares",
  resultados: "resultados",
  docentes: "docentes",
  modulos: "modulos",
  secoesExtras: "extras",
};

/** As três posições da seção extra (coleção `propostas`); valor estranho cai em "fim". */
const POSICOES_EXTRA: readonly string[] = [
  "antes-quadro-comercial",
  "apos-condicoes-comerciais",
  "fim",
];

const posicaoDeExtra = (v: string): string => (POSICOES_EXTRA.includes(v) ? v : "fim");

/**
 * Texto puro -> Lexical, com `null` para texto vazio. Mesma regra das Tasks 11
 * e 12 (`seTemTexto`/`restaurarConteudoProposta`): é o campo ausente ou nulo
 * que faz o documento OMITIR a seção, e um Lexical com parágrafo vazio
 * imprimiria um título sem corpo num documento contratual.
 */
function lexicalOuNulo(texto: string): PropostaRichText | null {
  if (texto.trim().length === 0) return null;
  const documento = textoComSubtitulosParaLexical(texto) as PropostaRichText;
  return temTextoLexical(documento) ? documento : null;
}

/** O valor da seção na forma que o Payload grava. Item sem conteúdo é descartado. */
function valorGravavelDaSecao(valor: ValorSecaoProposta): unknown {
  switch (valor.tipo) {
    case "texto":
      return lexicalOuNulo(valor.texto);
    case "pares":
      return valor.itens
        .filter((i) => i.titulo.trim().length > 0 || i.descricao.trim().length > 0)
        .map((i) => ({ titulo: ouNulo(i.titulo), descricao: ouNulo(i.descricao) }));
    case "resultados":
      return valor.itens
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((texto) => ({ texto }));
    case "docentes":
      // Docente é guardado se tem nome OU ficha: o modelo traz "Especialista
      // convidado", que não é pessoa cadastrada (decisão do PO).
      return valor.itens
        .filter((d) => d.nome.trim().length > 0 || idOuNulo(d.especialistaId) !== null)
        .map((d) => ({
          especialista: idOuNulo(d.especialistaId),
          nome: ouNulo(d.nome),
          credencial: ouNulo(d.credencial),
          eixo: ouNulo(d.eixo),
        }));
    case "modulos":
      // A seleção de módulos é do wizard: a tela só edita título e ementa,
      // então nada é descartado aqui (perder a linha perderia o módulo).
      return valor.itens.map((m) => ({
        modulo: idOuNulo(m.moduloId),
        tituloExibido: ouNulo(m.tituloExibido),
        ementa: lexicalOuNulo(m.ementa),
      }));
    case "extras":
      return valor.itens
        .filter((s) => s.titulo.trim().length > 0 || s.corpo.trim().length > 0)
        .map((s) => ({
          titulo: ouNulo(s.titulo),
          corpo: lexicalOuNulo(s.corpo),
          posicao: posicaoDeExtra(s.posicao),
        }));
  }
}

/**
 * Salva UMA seção do conteúdo do documento, vinda da tela em texto puro/arrays
 * simples. Grava só o campo daquele alvo (`campoDoAlvo`, o mesmo mapa de
 * "Restaurar padrão"), numa única escrita — sem transação, como
 * `restaurarConteudoProposta` —, com `usuario` no `user` do update.
 */
export async function salvarSecaoConteudoProposta(
  id: string,
  alvo: AlvoConteudoProposta,
  valor: ValorSecaoProposta,
  usuario: UsuarioAutenticado,
): Promise<ResultadoEscrita> {
  if (valor.tipo !== TIPO_DE_ALVO[alvo]) {
    return { ok: false, erro: "Conteúdo incompatível com a seção." };
  }
  const campo = alvo === "secoesExtras" ? "secoesExtras" : campoDoAlvo(alvo);
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "propostas",
      id,
      data: { [campo]: valorGravavelDaSecao(valor) } as Partial<PropostaData>,
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[salvarSecaoConteudoProposta]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function criarVersaoProposta(
  codBase: string,
  motivo: string,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const vigentes = await payload.find({
      collection: "propostas",
      where: { codigoBase: { equals: codBase } },
      limit: 1000,
      depth: 0,
      sort: "-versao",
    });
    const vigente = vigentes.docs[0];
    if (!vigente) return { ok: false, erro: "Proposta não encontrada." };

    const versao = (vigente.versao ?? 1) + 1;
    const codigo = codigoDaVersao(codBase, versao);
    const agora = new Date();
    const validadeDias = vigente.validadeDias ?? 30;

    // Marca a anterior como substituída ANTES de criar a nova versão vigente:
    // nunca há duas vigentes ao mesmo tempo. No pior caso (falha logo após
    // este update), a anterior fica substituída sem sucessora — estado
    // detectável e corrigível na próxima tentativa, ao contrário de duas
    // vigentes simultâneas.
    await payload.update({
      collection: "propostas",
      id: vigente.id,
      data: { status: "substituida" as PropostaData["status"] },
    });

    const nova = await payload.create({
      collection: "propostas",
      data: {
        codigoBase: vigente.codigoBase,
        codigo,
        versao,
        lead: vigente.lead,
        cliente: vigente.cliente,
        programa: vigente.programa,
        tipo: vigente.tipo,
        status: "rascunho" as PropostaData["status"],
        modulos: vigente.modulos,
        eventos: vigente.eventos,
        valorUnitario: vigente.valorUnitario,
        qtdPagantes: vigente.qtdPagantes,
        cortesias: vigente.cortesias,
        percDesconto: vigente.percDesconto,
        valorBruto: vigente.valorBruto,
        desconto: vigente.desconto,
        valorLiquido: vigente.valorLiquido,
        modalidade: vigente.modalidade,
        replay: vigente.replay,
        condPagto: vigente.condPagto,
        condEspecificas: vigente.condEspecificas,
        observacoes: vigente.observacoes,
        // Conteúdo do documento: copiado da vigente, nunca recalculado do
        // programa — sem isto a nova versão nasceria sem texto nenhum e o
        // documento sairia quase vazio (a regra do PDF omite seção sem corpo).
        ...conteudoDaVersaoAnterior(vigente),
        elaborador: vigente.elaborador,
        aprovador: vigente.aprovador,
        validadeDias,
        dataCriacao: agora.toISOString(),
        validade: dataValidade(validadeDias),
        motivoRevisao: motivo,
        substitui: vigente.codigo,
      } as PropostaData,
    });

    await payload.create({
      collection: "versoes",
      data: {
        codBase,
        nVersao: versao,
        proposta: nova.id,
        data: agora.toISOString(),
        substitui: vigente.codigo,
        motivo,
        sintese: motivo,
        statusAnterior: "Substituída",
        vigente: true,
      } satisfies VersaoData,
    });

    return { ok: true };
  } catch (e) {
    console.error("[criarVersaoProposta]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function registrarEnvio(dados: DadosEnvio): Promise<ResultadoEscrita> {
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const propostaId = idOuNulo(dados.proposta);
  if (propostaId === null) return { ok: false, erro: "Selecione a proposta." };
  try {
    const payload = await obterPayload();
    await payload.create({
      collection: "envios",
      data: {
        proposta: propostaId,
        data: ouNulo(dados.data),
        canal: ouNulo(dados.canal) as EnvioData["canal"],
        destinatarios: ouNulo(dados.destinatarios),
        status: ouNulo(dados.status) as EnvioData["status"],
        observacoes: ouNulo(dados.observacoes),
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[registrarEnvio]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// --- Geração de PDF da proposta (spec 2026-08-29 · Fase B2) ---------------

function formatarDataCurta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export async function gerarESalvarPdfProposta(id: string): Promise<ResultadoEscrita> {
  const dados = await obterDadosDocumentoProposta(id);
  if (!dados) return { ok: false, erro: "Proposta não encontrada." };

  try {
    const html = montarHtmlDocumentoProposta(dados);
    const pdf = await gerarPdfDeHtml(html, {
      codigo: dados.codigo,
      siglaPrograma: dados.programaSigla,
      validadeFormatada: formatarDataCurta(dados.validadeISO),
      emitidaFormatada: formatarDataCurta(dados.dataCriacaoISO),
    });

    const payload = await obterPayload();

    const propostaAtual = await payload.findByID({ collection: "propostas", id, depth: 0 });
    const pdfAnteriorId =
      typeof propostaAtual.pdfGerado === "string" || typeof propostaAtual.pdfGerado === "number"
        ? propostaAtual.pdfGerado
        : null;

    // Sufixo aleatório: mesmo que o bucket ainda não seja privado (ver
    // SUPABASE_BUCKET_PRIVADO em payload.config.ts), o nome do objeto não
    // pode ser adivinhado só a partir do código da proposta.
    const sufixo = randomBytes(4).toString("hex");
    const nomeArquivo = `${dados.codigo}-${sufixo}.pdf`;
    const media = await payload.create({
      collection: "documentos-comerciais",
      data: { alt: `Proposta ${dados.codigo}` },
      file: { data: pdf, mimetype: "application/pdf", name: nomeArquivo, size: pdf.length },
    });
    await payload.update({ collection: "propostas", id, data: { pdfGerado: media.id } });

    if (pdfAnteriorId !== null) {
      try {
        await payload.delete({ collection: "documentos-comerciais", id: pdfAnteriorId });
      } catch (e) {
        console.error("[gerarESalvarPdfProposta] falha ao remover PDF anterior", e);
      }
    }

    return { ok: true };
  } catch (e) {
    console.error("[gerarESalvarPdfProposta]", e);
    return { ok: false, erro: "Não foi possível gerar o PDF. Tente novamente." };
  }
}

// --- Lead (kanban) e linha do tempo (spec 2026-09-15 · Sessão 1) ----------

type LeadData = RequiredDataFromCollectionSlug<"leads">;
type LinhaDoTempoData = RequiredDataFromCollectionSlug<"linha-do-tempo">;

export interface DadosLeadManual {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  instituicao: string;
  esfera: string;
  programa: string;
  modalidade: string;
  participantesEstimados: string;
  mensagem: string;
  cliente: string;
  /** Órgão de um cliente a criar na hora, quando `cliente` está vazio (só na criação; a edição ignora). */
  novoClienteOrgao: string;
  responsavel: string;
  valorEstimado: string;
  dataPrevistaEvento: string;
  observacoes: string;
}

/** Regras comuns a criação e edição: só o contato é obrigatório. */
function validarContatoDoLead(dados: DadosLeadManual): string | null {
  if (dados.nome.trim() === "") return "Informe o nome do contato.";
  if (dados.email.trim() === "") return "Informe o e-mail do contato.";
  return null;
}

/**
 * Criação exige um cliente (existente ou a criar). A edição não passa por
 * aqui: o vínculo com o cliente muda só por `vincularClienteAoLead`, que
 * registra a troca na linha do tempo — e um lead ainda sem cliente continua
 * editável nos demais campos.
 */
function validarLeadManual(dados: DadosLeadManual): string | null {
  const erro = validarContatoDoLead(dados);
  if (erro) return erro;
  if (idOuNulo(dados.cliente) === null && dados.novoClienteOrgao.trim() === "") {
    return "Selecione o cliente ou informe o órgão para criar um novo.";
  }
  return null;
}

/** Campos editáveis pela UI (criação manual e edição do modal). */
function camposEditaveisDoLead(dados: DadosLeadManual): Partial<LeadData> {
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim(),
    telefone: ouNulo(dados.telefone),
    cargo: ouNulo(dados.cargo),
    instituicao: ouNulo(dados.instituicao),
    esfera: ouNulo(dados.esfera) as LeadData["esfera"],
    detalhesProposta: {
      programa: idOuNulo(dados.programa),
      modalidade: ouNulo(dados.modalidade) as NonNullable<LeadData["detalhesProposta"]>["modalidade"],
      participantesEstimados: numeroOuNulo(dados.participantesEstimados),
      mensagem: ouNulo(dados.mensagem),
    },
    responsavel: idOuNulo(dados.responsavel),
    valorEstimado: numeroOuNulo(dados.valorEstimado),
    dataPrevistaEvento: ouNulo(dados.dataPrevistaEvento),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarLeadManual(dados: DadosLeadManual, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const erro = validarLeadManual(dados);
  if (erro) return { ok: false, erro };
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      let clienteId = idOuNulo(dados.cliente);
      if (clienteId === null) {
        // "Criar o cliente na hora": o contato do lead vira o contato principal
        // do órgão novo. A esfera passa pelo mesmo mapa do casamento automático
        // — `privada`/`terceiro-setor` não existem em clientes-crm e viram null.
        // Cliente e lead entram na mesma transação (executarEmTransacao): se a
        // escrita do lead falhar, o cliente recém-criado não fica órfão.
        const esferaLead = ouNulo(dados.esfera);
        const novo = await payload.create({
          collection: "clientes-crm",
          data: {
            orgao: dados.novoClienteOrgao.trim(),
            esfera: esferaLead === null ? null : (ESFERA_LEAD_PARA_CLIENTE[esferaLead] ?? null),
            origem: "manual",
            contatos: [
              {
                nome: dados.nome.trim(),
                cargo: ouNulo(dados.cargo),
                setor: null,
                email: dados.email.trim(),
                whatsapp: ouNulo(dados.telefone),
                principal: true,
                decisor: false,
              },
            ],
          },
          req,
        });
        clienteId = Number(novo.id);
      }
      const data: LeadData = {
        ...camposEditaveisDoLead(dados),
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        tipo: "proposta",
        origemEntrada: "manual",
        estagio: "lead",
        perdido: false,
        cliente: clienteId,
        clienteCasadoPor: "manual",
        consentimentoLgpd: { aceito: false },
      };
      await payload.create({ collection: "leads", data, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[criarLeadManual]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarLeadCrm(id: string, dados: DadosLeadManual, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const erro = validarContatoDoLead(dados);
  if (erro) return { ok: false, erro };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: camposEditaveisDoLead(dados), user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarLeadCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function moverLead(id: string, estagio: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  if (!ehEstagioLead(estagio)) return { ok: false, erro: "Estágio inválido." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { estagio }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[moverLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function marcarLeadPerdido(id: string, motivo: string, detalhe: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  if (!MOTIVOS_PERDA.some((m) => m.value === motivo)) return { ok: false, erro: "Informe o motivo da perda." };
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "leads",
      id,
      data: { perdido: true, motivoPerda: motivo as LeadData["motivoPerda"], detalhePerda: ouNulo(detalhe), perdidoEm: new Date().toISOString() },
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[marcarLeadPerdido]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function reabrirLead(id: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { perdido: false, motivoPerda: null, detalhePerda: null, perdidoEm: null }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[reabrirLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function vincularClienteAoLead(id: string, clienteId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const cliente = idOuNulo(clienteId);
  if (cliente === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "leads", id, data: { cliente, clienteCasadoPor: "manual" }, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[vincularClienteAoLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * Nota manual na linha do tempo. Com `leadId`, o cliente é derivado do lead
 * no banco (o `clienteId` passado pelo cliente HTTP é ignorado): uma nota do
 * modal nunca cai na linha do tempo de outro cliente. Sem `leadId`, a nota é
 * do cliente informado (tela do cliente).
 */
export async function adicionarNota(clienteId: string, leadId: string | null, texto: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const detalhe = texto.trim();
  if (detalhe === "") return { ok: false, erro: "Escreva a nota." };
  const lead = leadId === null ? null : idOuNulo(leadId);
  if (leadId !== null && lead === null) return { ok: false, erro: "Lead inválido." };
  try {
    const payload = await obterPayload();
    let cliente: number | null;
    if (lead !== null) {
      const doc = await payload.findByID({ collection: "leads", id: lead, depth: 0 });
      const ref = doc.cliente;
      cliente = typeof ref === "number" ? ref : typeof ref === "object" && ref !== null ? Number(ref.id) : null;
      if (cliente === null || !Number.isFinite(cliente)) return { ok: false, erro: "Lead sem cliente vinculado." };
    } else {
      cliente = idOuNulo(clienteId);
      if (cliente === null) return { ok: false, erro: "Cliente inválido." };
    }
    const data: LinhaDoTempoData = {
      cliente,
      lead,
      tipo: "nota",
      titulo: "Nota",
      detalhe,
      usuario: Number(usuario.id),
      em: new Date().toISOString(),
    };
    await payload.create({ collection: "linha-do-tempo", data, user: usuario });
    return { ok: true };
  } catch (e) {
    console.error("[adicionarNota]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// --- Evento comercial, documentos e exclusão (spec-adendo 2026-09-17 · Sessão 4) ---

type EventoComercialData = RequiredDataFromCollectionSlug<"eventos-comerciais">;
type ContratoEmpenhoData = NonNullable<EventoComercialData["contratoEmpenho"]>;
type DocumentoComercialData = RequiredDataFromCollectionSlug<"documentos-comerciais">;

export interface DadosEvento {
  titulo: string;
  dataInicio: string;
  dataFim: string;
  modalidade: string;
  local: string;
  moduloCatalogo: string;
  observacoes: string;
}

export interface DadosContrato {
  tipo: string;
  numero: string;
  data: string;
  valor: string;
}

export interface DadosLink {
  rotulo: string;
  url: string;
}

export const TAMANHO_MAX_DOCUMENTO = 20 * 1024 * 1024;
export const MIMES_DOCUMENTO = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

function erroDoArquivo(arquivo: File): string | null {
  if (arquivo.size > TAMANHO_MAX_DOCUMENTO) return "Arquivo maior que 20 MB.";
  if (!MIMES_DOCUMENTO.includes(arquivo.type)) return "Tipo de arquivo não permitido.";
  return null;
}

/** As três ações que movem o card fecham nas mesmas mensagens do kanban — nunca null nestes casos. */
function estagioObrigatorio(acao: AcaoEvento): string {
  const estagio = estagioDaAcaoEvento(acao);
  if (estagio === null) throw new Error(`Ação sem estágio de destino: ${acao}`);
  return estagio;
}

/** Cria o evento comercial vinculado ao cliente do lead e move o card. */
export async function agendarEvento(leadId: string, dados: DadosEvento, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  const titulo = dados.titulo.trim();
  if (titulo === "") return { ok: false, erro: "Informe o título do evento." };
  const dataInicio = ouNulo(dados.dataInicio);
  if (dataInicio === null) return { ok: false, erro: "Informe a data de início." };
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const lead = await payload.findByID({ collection: "leads", id: leadId, depth: 0, req });
      const clienteId = idDeRelacionamento(lead.cliente);
      if (clienteId === null) return { ok: false, erro: "Lead sem cliente vinculado." };
      const data: EventoComercialData = {
        lead: Number(leadId),
        cliente: clienteId,
        titulo,
        dataInicio,
        dataFim: ouNulo(dados.dataFim),
        modalidade: ouNulo(dados.modalidade) as EventoComercialData["modalidade"],
        local: ouNulo(dados.local),
        moduloCatalogo: idOuNulo(dados.moduloCatalogo),
        status: "agendado",
        observacoes: ouNulo(dados.observacoes),
      };
      await payload.create({ collection: "eventos-comerciais", data, req });
      await payload.update({
        collection: "leads",
        id: leadId,
        data: { estagio: estagioObrigatorio("agendar") as LeadData["estagio"] },
        req,
      });
      return { ok: true };
    });
  } catch (e) {
    console.error("[agendarEvento]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * Registra contrato/empenho (com upload opcional) e move o card para
 * "Contrato/empenho recebido" — a menos que o evento já tenha ficado sem
 * lead (apagado com dependentes, spec §5.6), caso em que só o grupo muda.
 * Sem arquivo novo, preserva o arquivo já registrado (o grupo inteiro é
 * substituído na escrita — não dá para enviar só os campos que mudaram).
 */
export async function registrarContratoEmpenho(
  eventoId: string,
  dados: DadosContrato,
  arquivo: File | null,
  usuario: UsuarioAutenticado,
): Promise<ResultadoEscrita> {
  if (arquivo !== null) {
    const erro = erroDoArquivo(arquivo);
    if (erro) return { ok: false, erro };
  }
  const algumCampoPreenchido =
    dados.tipo.trim() !== "" || dados.numero.trim() !== "" || dados.data.trim() !== "" || dados.valor.trim() !== "";
  if (!algumCampoPreenchido && arquivo === null) {
    return { ok: false, erro: "Informe ao menos um dado do contrato ou anexe o arquivo." };
  }
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const evento = await payload.findByID({ collection: "eventos-comerciais", id: eventoId, depth: 0, req });
      let arquivoId = idDeRelacionamento(evento.contratoEmpenho?.arquivo);
      if (arquivo !== null) {
        const documento = await payload.create({
          collection: "documentos-comerciais",
          data: { evento: Number(eventoId), descricao: "Contrato/empenho", alt: arquivo.name },
          file: {
            data: Buffer.from(await arquivo.arrayBuffer()),
            mimetype: arquivo.type,
            name: arquivo.name,
            size: arquivo.size,
          },
          req,
        });
        arquivoId = Number(documento.id);
      }
      const contratoEmpenho: ContratoEmpenhoData = {
        tipo: ouNulo(dados.tipo) as ContratoEmpenhoData["tipo"],
        numero: ouNulo(dados.numero),
        data: ouNulo(dados.data),
        valor: numeroOuNulo(dados.valor),
        arquivo: arquivoId,
      };
      await payload.update({ collection: "eventos-comerciais", id: eventoId, data: { contratoEmpenho }, req });
      const leadId = idDeRelacionamento(evento.lead);
      if (leadId !== null) {
        await payload.update({
          collection: "leads",
          id: String(leadId),
          data: { estagio: estagioObrigatorio("registrar-contrato") as LeadData["estagio"] },
          req,
        });
      }
      return { ok: true };
    });
  } catch (e) {
    console.error("[registrarContratoEmpenho]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** Salva os links de inscrição do evento. Não move o card. */
export async function salvarLinksInscricao(eventoId: string, links: DadosLink[], usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  for (const link of links) {
    if (!urlValida(link.url)) return { ok: false, erro: `Link inválido: ${link.url}` };
  }
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos-comerciais",
      id: eventoId,
      data: { linksInscricao: links.map((l) => ({ rotulo: l.rotulo.trim(), url: l.url.trim() })) },
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[salvarLinksInscricao]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** Marca o evento como realizado e move o card para "Evento realizado". */
export async function marcarEventoRealizado(eventoId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const evento = await payload.findByID({ collection: "eventos-comerciais", id: eventoId, depth: 0, req });
      await payload.update({
        collection: "eventos-comerciais",
        id: eventoId,
        data: { status: "realizado" as EventoComercialData["status"] },
        req,
      });
      const leadId = idDeRelacionamento(evento.lead);
      if (leadId !== null) {
        await payload.update({
          collection: "leads",
          id: String(leadId),
          data: { estagio: estagioObrigatorio("realizado") as LeadData["estagio"] },
          req,
        });
      }
      return { ok: true };
    });
  } catch (e) {
    console.error("[marcarEventoRealizado]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** Cancela o evento. Não mexe no card — cancelar não é um destino de estágio. */
export async function cancelarEvento(eventoId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos-comerciais",
      id: eventoId,
      data: { status: "cancelado" as EventoComercialData["status"] },
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[cancelarEvento]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/** Anexa um documento avulso ao evento (fora do fluxo de contrato/empenho). */
export async function subirDocumentoEvento(
  eventoId: string,
  arquivo: File,
  descricao: string,
  usuario: UsuarioAutenticado,
): Promise<ResultadoEscrita> {
  const erro = erroDoArquivo(arquivo);
  if (erro) return { ok: false, erro };
  try {
    const payload = await obterPayload();
    const data: DocumentoComercialData = {
      evento: Number(eventoId),
      descricao: ouNulo(descricao),
      alt: arquivo.name,
    };
    await payload.create({
      collection: "documentos-comerciais",
      data,
      file: {
        data: Buffer.from(await arquivo.arrayBuffer()),
        mimetype: arquivo.type,
        name: arquivo.name,
        size: arquivo.size,
      },
      user: usuario,
    });
    return { ok: true };
  } catch (e) {
    console.error("[subirDocumentoEvento]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * Remove um documento comercial. O item "Documento removido" na linha do
 * tempo é responsabilidade daqui (não de um hook `afterDelete`, que não tem
 * o cliente à mão sem outra consulta — mesma nota de `registrarDocumentoNaLinhaDoTempo`).
 * Só remove documentos vinculados a um evento — sem `evento`, este endpoint
 * poderia apagar qualquer outro documento comercial (ex.: o PDF gerado de
 * proposta) sem deixar rastro na linha do tempo.
 */
export async function removerDocumentoEvento(documentoId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const documento = await payload.findByID({ collection: "documentos-comerciais", id: documentoId, depth: 0, req });
      const eventoId = idDeRelacionamento(documento.evento);
      if (eventoId === null) return { ok: false, erro: "Documento não pertence a um evento." };
      const evento = await payload.findByID({ collection: "eventos-comerciais", id: eventoId, depth: 0, req });
      const clienteId = idDeRelacionamento(evento.cliente);
      const leadId = idDeRelacionamento(evento.lead);
      const entradas = entradasDoDocumento({
        operation: "delete",
        doc: documento,
        clienteId,
        leadId,
        usuarioId: Number(usuario.id),
      });
      for (const entrada of entradas) {
        await registrarNaLinhaDoTempo(req, entrada);
      }
      await payload.delete({ collection: "documentos-comerciais", id: documentoId, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[removerDocumentoEvento]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * `payload.update` com `where` (em vez de `id`) nunca rejeita por falha de
 * um documento — ele devolve `{ docs, errors }` e segue em frente. Sem essa
 * checagem, um `errors` não vazio passava batido e a transação seguia até o
 * `delete` do lead, que aí sim falhava (ex.: `lead_id NOT NULL` em
 * `eventos-comerciais`/`propostas` — CLAUDE.md §19.3 item 0) com uma
 * mensagem que não dizia o que realmente deu errado.
 */
function lancarSeFalhouDesvinculo(resultado: { errors: { id: unknown; message: string }[] }, colecao: string): void {
  if (resultado.errors.length > 0) {
    throw new Error(`Falha ao desvincular lead em ${colecao}: ${resultado.errors.map((e) => e.message).join("; ")}`);
  }
}

/**
 * Apaga o lead (spec §5.6). Com evento/proposta/envio vinculado, exige
 * digitar o nome do contato para confirmar (dupla confirmação). Desvincula
 * (não apaga) os dependentes — nenhuma cascata — e grava "Lead apagado" na
 * linha do tempo do cliente, se houver, antes de apagar. As quatro
 * desvinculações rodam em sequência (não `Promise.all`) para que cada
 * `errors[]` seja checado antes de seguir — ver `lancarSeFalhouDesvinculo`.
 */
export async function apagarLead(leadId: string, confirmacaoNome: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const lead = await payload.findByID({ collection: "leads", id: leadId, depth: 0, req });
      const [eventos, propostas, envios] = await Promise.all([
        payload.count({ collection: "eventos-comerciais", where: { lead: { equals: leadId } }, req }),
        payload.count({ collection: "propostas", where: { lead: { equals: leadId } }, req }),
        payload.count({ collection: "envios-email", where: { lead: { equals: leadId } }, req }),
      ]);
      if (
        exigeConfirmacaoDupla({
          numEventos: eventos.totalDocs,
          numPropostas: propostas.totalDocs,
          numEnvios: envios.totalDocs,
        })
      ) {
        const nomeConfere = confirmacaoNome.trim().toLowerCase() === lead.nome.trim().toLowerCase();
        if (!nomeConfere) return { ok: false, erro: "Digite o nome do contato para confirmar." };
      }
      const clienteId = idDeRelacionamento(lead.cliente);
      if (clienteId !== null) {
        await registrarNaLinhaDoTempo(req, {
          clienteId,
          leadId: null,
          tipo: "lead",
          titulo: tituloLeadApagado({ nome: lead.nome, instituicao: lead.instituicao ?? null, estagio: lead.estagio }),
          usuarioId: Number(usuario.id),
          referencia: null,
        });
      }
      const desvincula = { where: { lead: { equals: leadId } }, data: { lead: null }, req } as const;
      const resultadoEventos = await payload.update({ collection: "eventos-comerciais", ...desvincula });
      lancarSeFalhouDesvinculo(resultadoEventos, "eventos-comerciais");
      const resultadoPropostas = await payload.update({ collection: "propostas", ...desvincula });
      lancarSeFalhouDesvinculo(resultadoPropostas, "propostas");
      const resultadoEnvios = await payload.update({ collection: "envios-email", ...desvincula });
      lancarSeFalhouDesvinculo(resultadoEnvios, "envios-email");
      const resultadoLinhaDoTempo = await payload.update({ collection: "linha-do-tempo", ...desvincula });
      lancarSeFalhouDesvinculo(resultadoLinhaDoTempo, "linha-do-tempo");
      await payload.delete({ collection: "leads", id: leadId, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[apagarLead]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

/**
 * Apaga o cliente (spec §5.6) — só permitido sem leads (tipo proposta),
 * eventos nem propostas vinculados. Propostas contam à parte porque
 * `propostas.cliente` sobrevive à desvinculação de `apagarLead` (que só
 * limpa `propostas.lead`) — sem essa contagem, um cliente nessa situação
 * passava aqui e só falhava no `delete`, contra a FK `NOT NULL` de
 * `propostas.cliente_id`, com o erro genérico do `catch`. O hook
 * `beforeDelete` de `clientes-crm` repete a mesma regra
 * (`bloquearClienteComDependentes`); a checagem aqui evita uma viagem ao
 * banco a mais quando já sabemos que vai falhar.
 */
export async function apagarCliente(clienteId: string, usuario: UsuarioAutenticado): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, async (req) => {
      const [leads, eventos, propostas] = await Promise.all([
        payload.count({
          collection: "leads",
          where: { and: [{ cliente: { equals: clienteId } }, { tipo: { equals: "proposta" } }] },
          req,
        }),
        payload.count({ collection: "eventos-comerciais", where: { cliente: { equals: clienteId } }, req }),
        payload.count({ collection: "propostas", where: { cliente: { equals: clienteId } }, req }),
      ]);
      const r = podeApagarCliente({ numLeads: leads.totalDocs, numEventos: eventos.totalDocs, numPropostas: propostas.totalDocs });
      if (!r.ok) return { ok: false, erro: r.motivo };
      await payload.delete({ collection: "linha-do-tempo", where: { cliente: { equals: clienteId } }, req });
      await payload.delete({ collection: "clientes-crm", id: clienteId, req });
      return { ok: true };
    });
  } catch (e) {
    console.error("[apagarCliente]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
