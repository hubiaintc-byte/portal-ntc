import "server-only";

import {
  calcularValoresProposta,
  codigoDaVersao,
  gerarCodigoBase,
  proximaVersao,
} from "@ntc/lib";
import type { RequiredDataFromCollectionSlug } from "payload";

import { obterPayload } from "@/lib/payloadClient";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Escrita do módulo CRM via Local API. Toda função devolve ResultadoEscrita
 * com mensagem neutra — o detalhe do erro vai para o console do servidor.
 */

export interface DadosClienteCrm {
  orgao: string;
  sigla: string;
  tipo: string;
  municipio: string;
  uf: string;
  esfera: string;
  area: string;
  cnpj: string;
  dirigente: string;
  cargoDirigente: string;
  email: string;
  origem: string;
  potencial: string;
  status: string;
  responsavel: string;
  proximaAcao: string;
  observacoes: string;
}

export interface DadosContatoCrm {
  nome: string;
  cliente: string;
  cargo: string;
  setor: string;
  email: string;
  whatsapp: string;
  principal: boolean;
  decisor: boolean;
}

export interface DadosOportunidade {
  cliente: string;
  programa: string;
  modulos: string[];
  eventos: string[];
  uf: string;
  origem: string;
  quantidade: string;
  modalidade: string;
  valor: string;
  probabilidade: string;
  status: string;
  dataAbertura: string;
  dataPrevFechamento: string;
  proximaAcao: string;
  followup: string;
  responsavel: string;
  observacoes: string;
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

export function gerarCodigoOportunidade(ano: number, sequencia: number): string {
  return `OPO-${ano}-${String(sequencia).padStart(3, "0")}`;
}

/**
 * Deriva a próxima sequência a partir do maior sufixo numérico já usado no
 * ano, em vez de contar quantos registros existem — o importador legado
 * preserva códigos verbatim e pode pular números, deixando o conjunto
 * esparso (ex.: OPO-2026-001 e OPO-2026-005 sem 002-004). Contar registros
 * geraria um código já existente e a unique constraint rejeitaria o save.
 */
export function proximaSequencia(codigos: string[], ano: number): number {
  const prefixo = `OPO-${ano}-`;
  let maiorSufixo = 0;
  for (const codigo of codigos) {
    if (!codigo.startsWith(prefixo)) continue;
    const sufixo = Number(codigo.slice(prefixo.length));
    if (Number.isInteger(sufixo) && sufixo > maiorSufixo) {
      maiorSufixo = sufixo;
    }
  }
  return maiorSufixo + 1;
}

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

// Os campos abaixo são `select` na coleção (uniões literais geradas pelo
// Payload em payload-types); os dados chegam como string livre do formulário
// (a UI só oferece as opções válidas da coleção) — cast pontual campo a
// campo, sem `any`, mesmo padrão de painelCmsEscrita.ts (salvarCamposEvento).
type ClienteCrmData = RequiredDataFromCollectionSlug<"clientes-crm">;
type ContatoCrmData = RequiredDataFromCollectionSlug<"contatos-crm">;
type OportunidadeData = RequiredDataFromCollectionSlug<"oportunidades">;

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
    dirigente: ouNulo(dados.dirigente),
    cargoDirigente: ouNulo(dados.cargoDirigente),
    email: ouNulo(dados.email),
    origem: ouNulo(dados.origem) as ClienteCrmData["origem"],
    potencial: numeroOuNulo(dados.potencial),
    status: (ouNulo(dados.status) ?? "prospect") as ClienteCrmData["status"],
    responsavel: idOuNulo(dados.responsavel),
    proximaAcao: ouNulo(dados.proximaAcao),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarClienteCrm(dados: DadosClienteCrm): Promise<ResultadoEscrita> {
  if (dados.orgao.trim() === "") return { ok: false, erro: "Informe o órgão." };
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
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "clientes-crm", id, data: dadosCliente(dados) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarClienteCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function dadosContato(dados: DadosContatoCrm, clienteId: number): ContatoCrmData {
  return {
    nome: dados.nome.trim(),
    cliente: clienteId,
    cargo: ouNulo(dados.cargo),
    setor: ouNulo(dados.setor),
    email: ouNulo(dados.email),
    whatsapp: ouNulo(dados.whatsapp),
    principal: dados.principal,
    decisor: dados.decisor,
  };
}

export async function criarContatoCrm(dados: DadosContatoCrm): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "") return { ok: false, erro: "Informe nome e cliente." };
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.create({ collection: "contatos-crm", data: dadosContato(dados, clienteId) });
    return { ok: true };
  } catch (e) {
    console.error("[criarContatoCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarContatoCrm(
  id: string,
  dados: DadosContatoCrm,
): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "") return { ok: false, erro: "Informe nome e cliente." };
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({ collection: "contatos-crm", id, data: dadosContato(dados, clienteId) });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarContatoCrm]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

function dadosOportunidade(
  dados: DadosOportunidade,
  clienteId: number,
): Omit<OportunidadeData, "codigo"> {
  return {
    cliente: clienteId,
    programa: idOuNulo(dados.programa),
    modulos: idsLista(dados.modulos),
    eventos: idsLista(dados.eventos),
    uf: ouNulo(dados.uf) as OportunidadeData["uf"],
    origem: ouNulo(dados.origem) as OportunidadeData["origem"],
    quantidade: numeroOuNulo(dados.quantidade),
    modalidade: ouNulo(dados.modalidade),
    valor: numeroOuNulo(dados.valor),
    probabilidade: numeroOuNulo(dados.probabilidade),
    status: (ouNulo(dados.status) ?? "em-qualificacao") as OportunidadeData["status"],
    dataAbertura: ouNulo(dados.dataAbertura),
    dataPrevFechamento: ouNulo(dados.dataPrevFechamento),
    proximaAcao: ouNulo(dados.proximaAcao),
    followup: ouNulo(dados.followup),
    responsavel: idOuNulo(dados.responsavel),
    observacoes: ouNulo(dados.observacoes),
  };
}

export async function criarOportunidade(dados: DadosOportunidade): Promise<ResultadoEscrita> {
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    const ano = new Date().getFullYear();
    const existentes = await payload.find({
      collection: "oportunidades",
      where: { codigo: { like: `OPO-${ano}-` } },
      limit: 1000,
      depth: 0,
      select: { codigo: true },
    });
    const codigos = existentes.docs.map((doc) => doc.codigo).filter((c): c is string => Boolean(c));
    const codigo = gerarCodigoOportunidade(ano, proximaSequencia(codigos, ano));
    await payload.create({
      collection: "oportunidades",
      data: { codigo, ...dadosOportunidade(dados, clienteId) },
    });
    return { ok: true };
  } catch (e) {
    console.error("[criarOportunidade]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function atualizarOportunidade(
  id: string,
  dados: DadosOportunidade,
): Promise<ResultadoEscrita> {
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "oportunidades",
      id,
      data: dadosOportunidade(dados, clienteId),
    });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarOportunidade]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

// --- Propostas (spec 2026-07-22 · Fase B1) -------------------------------

export interface DadosProposta {
  cliente: string;
  programa: string;
  oportunidade: string;
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
    cliente: clienteId,
    programa: idOuNulo(dados.programa),
    oportunidade: idOuNulo(dados.oportunidade),
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

export async function criarProposta(dados: DadosProposta): Promise<ResultadoEscrita> {
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
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
    const validade = new Date(agora);
    validade.setDate(validade.getDate() + validadeDias);
    await payload.create({
      collection: "propostas",
      data: {
        ...dadosProposta(dados, clienteId, { codigoBase, codigo, versao }),
        dataCriacao: agora.toISOString(),
        validade: validade.toISOString(),
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
  const clienteId = idOuNulo(dados.cliente);
  if (clienteId === null) return { ok: false, erro: "Selecione o cliente." };
  try {
    const payload = await obterPayload();
    // Recarrega para preservar codigoBase/codigo/versao — não são reeditáveis
    // pelo formulário (mudam só via criarVersaoProposta).
    const atual = await payload.findByID({ collection: "propostas", id, depth: 0 });
    await payload.update({
      collection: "propostas",
      id,
      data: dadosProposta(dados, clienteId, {
        codigoBase: atual.codigoBase,
        codigo: atual.codigo,
        versao: atual.versao ?? 1,
      }),
    });
    return { ok: true };
  } catch (e) {
    console.error("[atualizarProposta]", e);
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

    const nova = await payload.create({
      collection: "propostas",
      data: {
        codigoBase: vigente.codigoBase,
        codigo,
        versao,
        oportunidade: vigente.oportunidade,
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
        elaborador: vigente.elaborador,
        aprovador: vigente.aprovador,
        validadeDias: vigente.validadeDias ?? 30,
        dataCriacao: agora.toISOString(),
        validade: agora.toISOString(),
        motivoRevisao: motivo,
        substitui: vigente.codigo,
      } as PropostaData,
    });

    await payload.update({
      collection: "propostas",
      id: vigente.id,
      data: { status: "substituida" as PropostaData["status"] },
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
