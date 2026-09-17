import "server-only";

import { randomBytes } from "node:crypto";

import { calcularValoresProposta, codigoDaVersao, ehEstagioLead, gerarCodigoBase, MOTIVOS_PERDA, proximaVersao } from "@ntc/lib";
import type { RequiredDataFromCollectionSlug } from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";
import { ESFERA_LEAD_PARA_CLIENTE } from "@/lib/crm/casamento";
import { obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";
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

export async function criarProposta(dados: DadosProposta): Promise<ResultadoEscrita> {
  // Falha fechado: id não numérico não pode chegar ao Payload como NaN.
  const leadId = idOuNulo(dados.lead);
  if (leadId === null) return { ok: false, erro: "Selecione o lead." };
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
    await payload.create({
      collection: "propostas",
      data: {
        ...dadosProposta(dados, clienteId, leadId, { codigoBase, codigo, versao }),
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
  // Programa vazio = sem programa (proposta customizada), permitido. Valor
  // não vazio que não resolve para um id válido é erro — falha fechado, não
  // grava null silenciosamente por cima de um programa já vinculado.
  if (dados.programa.trim() !== "" && idOuNulo(dados.programa) === null) {
    return { ok: false, erro: "Selecione um programa válido." };
  }
  try {
    const payload = await obterPayload();
    // Recarrega para preservar codigoBase/codigo/versao — não são reeditáveis
    // pelo formulário (mudam só via criarVersaoProposta).
    const atual = await payload.findByID({ collection: "propostas", id, depth: 0 });
    await payload.update({
      collection: "propostas",
      id,
      data: dadosProposta(dados, clienteId, leadId, {
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
    let clienteId = idOuNulo(dados.cliente);
    if (clienteId === null) {
      // "Criar o cliente na hora": o contato do lead vira o contato principal
      // do órgão novo. A esfera passa pelo mesmo mapa do casamento automático
      // — `privada`/`terceiro-setor` não existem em clientes-crm e viram null.
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
        user: usuario,
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
    await payload.create({ collection: "leads", data, user: usuario });
    return { ok: true };
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
