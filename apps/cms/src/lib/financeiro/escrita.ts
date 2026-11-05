import "server-only";

import {
  comDefaultsDeLancamento,
  CRIT_PROVISORIO,
  hojeEmSaoPaulo,
  podeExcluirConta,
  podeExcluirCusto,
  podeExcluirReceita,
  validarConta,
  validarCusto,
  validarEtapas,
  validarEvento,
  validarFaturamento,
  validarPagamento,
  validarReceita,
  type DadosContaFin,
  type DadosCustoFin,
  type DadosEventoFin,
  type DadosFaturamentoFin,
  type DadosPagamentoFin,
  type DadosReceitaFin,
  type EtapaReceita,
  type EventoFin,
  type LivroFinanceiro,
  type ResultadoValidacao,
} from "@ntc/lib";
import { APIError, type PayloadRequest } from "payload";

import type { UsuarioAutenticado } from "@/lib/cms/autenticacao";
import { acessoDoUsuario, temTela, type TelaPainel } from "@/lib/cms/telas";
import { executarEmTransacao } from "@/lib/crm/transacao";
import { obterPayload } from "@/lib/payloadClient";

import { MSG_EVENTO_FIN_COM_LANCAMENTOS } from "./exclusao";
import { lerLivroFinanceiro, mesclarEventos, type EventoComercialDoc } from "./leitura";

/**
 * Escrita do livro financeiro (spec §3.2 e §4.2). Toda função roda numa
 * transação (`executarEmTransacao`) e segue a mesma ordem: **relê o livro
 * dentro da transação** (`lerLivroFinanceiro(req)` — nunca o que a tela tinha),
 * aplica os defaults, valida com as regras de `@ntc/lib` e só então grava.
 * Toda recusa acontece ANTES da primeira escrita (um `return { ok: false }`
 * comita — ver `transacao.ts`). A auditoria (`audit-log`) é gravada pelos hooks
 * das coleções, com o mesmo `req`.
 *
 * Os campos gravados são uma lista fechada por coleção: o que vier a mais de
 * uma Server Action forjada é descartado. Ids chegam como texto e são
 * canônicos ("007" = "7"); id não numérico é recusado antes de tocar o banco.
 *
 * Evento ligado ao CRM: nada é escrito em `eventos-comerciais`, e os campos que
 * o CRM já preenche (nome, datas, modalidade, local, cliente) gravam `null` no
 * `fin-eventos` — o que fica é a reserva para o campo vazio no CRM.
 */

export type ResultadoFin = { ok: true; id: string } | { ok: false; erro: string; campo?: string };

const DADOS_INVALIDOS: ResultadoFin = { ok: false, erro: "Dados do formulário inválidos." };
const RECUSADO: ResultadoFin = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };
const ERRO_SALVAR = "Não foi possível salvar. Tente novamente.";
const ERRO_EXCLUIR = "Não foi possível excluir. Tente novamente.";
const MSG_NAO_ENCONTRADO = "Registro não encontrado. Recarregue a página.";
/** Mensagem do protótipo (`saveComissao`). */
const MSG_EVENTO_INEXISTENTE = "Evento vinculado inexistente.";
const MSG_SEM_CADASTRO = "Complete o cadastro financeiro do evento antes de lançar nele.";
const MSG_PENDENTE_SEM_CADASTRO = "Este evento ainda não tem cadastro financeiro.";
const CRIT_POR_ETAPA = "Por etapa/módulo concluído";

const PREFIXO_CRM = "crm-";

// ------------------------------------------------------------------ ids

/** Até 15 dígitos: acima disso `Number` perde precisão. `null` = inválido. */
function idCanonico(v: unknown): string | null {
  return typeof v === "string" && /^\d{1,15}$/.test(v.trim()) ? String(Number(v.trim())) : null;
}

/** Relacionamento opcional: "" fica "" (sem vínculo); `null` = inválido. */
function relacaoCanonica(v: unknown): string | null {
  if (v === "" || v === null || v === undefined) return "";
  return idCanonico(v);
}

const paraRelacao = (id: string): number | null => (id ? Number(id) : null);

// ------------------------------------------------------------- execução

function falhou(r: ResultadoValidacao): ResultadoFin | null {
  if (r.ok) return null;
  return r.campo ? { ok: false, erro: r.erro, campo: r.campo } : { ok: false, erro: r.erro };
}

/**
 * Roda `fn` na transação. Recusa de regra no nível da coleção (`APIError` 400
 * dos `beforeDelete`, com as mensagens do protótipo) chega à tela como está;
 * qualquer outra falha desfaz tudo e vira a mensagem genérica.
 */
async function naTransacao(
  usuario: UsuarioAutenticado,
  rotulo: string,
  erroGenerico: string,
  fn: (req: PayloadRequest) => Promise<ResultadoFin>,
): Promise<ResultadoFin> {
  try {
    const payload = await obterPayload();
    return await executarEmTransacao(payload, usuario, fn);
  } catch (e) {
    if (e instanceof APIError && e.status === 400 && e.name !== "ValidationError") {
      return { ok: false, erro: e.message };
    }
    console.error(`[${rotulo}]`, e);
    return { ok: false, erro: erroGenerico };
  }
}

/**
 * Lançamento corporativo (sem evento) só por quem tem a tela dele: quem tem
 * apenas `fin.eventos` não cria, não altera nem fatura/paga o corporativo. A
 * action confere o que chega; aqui se confere também o que está gravado.
 */
function podeCorporativo(usuario: UsuarioAutenticado, tela: TelaPainel): boolean {
  return temTela(acessoDoUsuario(usuario), [tela]);
}

/** O evento do lançamento precisa existir e já ter cadastro financeiro. */
function conferirEvento(livro: LivroFinanceiro, eventoId: string): ResultadoFin | null {
  if (!eventoId) return null;
  const ev = livro.eventos.find((e) => e.id === eventoId && !e.cadastroPendente);
  return ev ? null : { ok: false, erro: MSG_EVENTO_INEXISTENTE, campo: "eventoId" };
}

/** `eventoId` do formulário: "" (corporativo), id canônico, ou recusa. */
function eventoDoLancamento(v: unknown): { id: string } | ResultadoFin {
  if (typeof v === "string" && v.startsWith(PREFIXO_CRM)) return { ok: false, erro: MSG_SEM_CADASTRO, campo: "eventoId" };
  const id = relacaoCanonica(v);
  return id === null ? DADOS_INVALIDOS : { id };
}

const ehResultado = (x: { id: string } | ResultadoFin): x is ResultadoFin => "ok" in x;

/** Alvo da escrita: `null` (criação), id canônico existente, ou recusa. */
function alvo<T extends { id: string }>(id: string | null, lista: T[]): { id: string | null; atual: T | null } | ResultadoFin {
  if (id === null) return { id: null, atual: null };
  const c = idCanonico(id);
  if (c === null) return DADOS_INVALIDOS;
  const atual = lista.find((x) => x.id === c);
  return atual ? { id: c, atual } : { ok: false, erro: MSG_NAO_ENCONTRADO };
}
const ehAlvo = <T>(x: { id: string | null; atual: T | null } | ResultadoFin): x is { id: string | null; atual: T | null } =>
  !("ok" in x);

// --------------------------------------------------------------- evento

const CAMPOS_DO_CRM = ["nome", "modalidade", "local", "dataInicio", "dataFim", "cliente"] as const;

/** O evento comercial como a leitura o vê, só com os valores do CRM. */
async function eventoComercialPuro(req: PayloadRequest, id: string): Promise<EventoFin | null> {
  const r = await req.payload.find({
    collection: "eventos-comerciais",
    where: { id: { equals: Number(id) } },
    limit: 1,
    depth: 1,
    overrideAccess: true,
    select: {
      titulo: true,
      dataInicio: true,
      dataFim: true,
      modalidade: true,
      local: true,
      cliente: true,
      status: true,
      contratoEmpenho: { numero: true },
      moduloCatalogo: true,
    },
    populate: { "clientes-crm": { orgao: true } },
    req,
  });
  const doc = r.docs[0] as unknown as EventoComercialDoc | undefined;
  return doc ? (mesclarEventos([], [doc])[0] ?? null) : null;
}

function docDoEvento(d: DadosEventoFin): Record<string, unknown> {
  return {
    nome: d.nome,
    vertical: d.vertical,
    tipo: d.tipo,
    modalidade: d.modalidade,
    programa: d.programa,
    modulo: d.modulo,
    cliente: d.cliente,
    cidade: d.cidade,
    uf: d.uf,
    local: d.local,
    dataInicio: d.dataInicio,
    dataFim: d.dataFim,
    cargaHoraria: d.cargaHoraria,
    responsavel: d.responsavel,
    status: d.status,
    qtdPrevista: d.qtdPrevista,
    capacidade: d.capacidade,
    efetivos: d.efetivos,
    pagantesPrev: d.pagantesPrev,
    cortesiasPrev: d.cortesiasPrev,
    refContratual: d.refContratual,
    observacoes: d.observacoes,
  };
}

/**
 * Cria ou altera o cadastro financeiro de um evento. `id`: `null` cria evento
 * próprio do financeiro; `"crm-<n>"` cria o `fin-eventos` ligado ao evento
 * comercial `n` (só se ele ainda não tiver um); id numérico altera.
 */
export async function salvarEventoFin(id: string | null, dados: DadosEventoFin, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  let comercialNovo: string | null = null;
  let finId: string | null = null;
  if (id !== null && id.startsWith(PREFIXO_CRM)) {
    comercialNovo = idCanonico(id.slice(PREFIXO_CRM.length));
    if (comercialNovo === null) return DADOS_INVALIDOS;
  } else if (id !== null) {
    finId = idCanonico(id);
    if (finId === null) return DADOS_INVALIDOS;
  }

  return naTransacao(usuario, "salvarEventoFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    let comercialId: string | null;
    if (comercialNovo !== null) {
      // Só existe "crm-n" no livro enquanto o evento comercial não tem cadastro financeiro.
      const pendente = livro.eventos.find((e) => e.id === `${PREFIXO_CRM}${comercialNovo}` && e.cadastroPendente);
      if (!pendente) return { ok: false, erro: MSG_NAO_ENCONTRADO };
      comercialId = comercialNovo;
    } else if (finId !== null) {
      const atual = livro.eventos.find((e) => e.id === finId && !e.cadastroPendente);
      if (!atual) return { ok: false, erro: MSG_NAO_ENCONTRADO };
      comercialId = atual.eventoComercialId;
    } else {
      comercialId = null;
    }

    const crm = comercialId ? await eventoComercialPuro(req, comercialId) : null;
    if (comercialId && !crm) return { ok: false, erro: MSG_NAO_ENCONTRADO };

    // Validação sobre o evento mesclado (valor do CRM vence); gravação sem os do CRM.
    const mesclado: DadosEventoFin = { ...dados };
    const data = docDoEvento(dados);
    if (crm) {
      for (const campo of CAMPOS_DO_CRM) {
        if (crm[campo]) {
          mesclado[campo] = crm[campo];
          data[campo] = null;
        }
      }
    }
    const erro = falhou(validarEvento(mesclado));
    if (erro) return erro;

    if (finId !== null) {
      await req.payload.update({ collection: "fin-eventos", id: Number(finId), data, req });
      return { ok: true, id: finId };
    }
    const criado = await req.payload.create({
      collection: "fin-eventos",
      data: comercialId ? { ...data, eventoComercial: Number(comercialId) } : data,
      req,
    });
    return { ok: true, id: String(criado.id) };
  });
}

/**
 * Exclui o cadastro financeiro do evento. Evento próprio do financeiro:
 * cascata como `Service.deleteEvento` (pagamentos → custos → faturamentos →
 * receitas → evento). Ligado ao CRM: só sem receitas nem custos, e o evento
 * comercial nunca é apagado.
 */
export async function excluirEventoFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (typeof id === "string" && id.startsWith(PREFIXO_CRM)) return { ok: false, erro: MSG_PENDENTE_SEM_CADASTRO };
  const finId = idCanonico(id);
  if (finId === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirEventoFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const ev = livro.eventos.find((e) => e.id === finId && !e.cadastroPendente);
    if (!ev) return { ok: false, erro: MSG_NAO_ENCONTRADO };
    const receitas = livro.receitas.filter((r) => r.eventoId === finId);
    const custos = livro.custos.filter((c) => c.eventoId === finId);
    if (ev.origem === "crm" && (receitas.length > 0 || custos.length > 0)) {
      return { ok: false, erro: MSG_EVENTO_FIN_COM_LANCAMENTOS };
    }
    const doEvento = <T extends { eventoId: string }>(xs: T[]): T[] => xs.filter((x) => x.eventoId === finId);
    const ordem: Array<[Parameters<PayloadRequest["payload"]["delete"]>[0]["collection"], { id: string }[]]> = [
      ["fin-pagamentos", doEvento(livro.pagamentos)],
      ["fin-custos", custos],
      ["fin-faturamentos", doEvento(livro.faturamentos)],
      ["fin-receitas", receitas],
    ];
    for (const [collection, linhas] of ordem) {
      for (const l of linhas) await req.payload.delete({ collection, id: Number(l.id), req });
    }
    await req.payload.delete({ collection: "fin-eventos", id: Number(finId), req });
    return { ok: true, id: finId };
  });
}

// -------------------------------------------------------------- receita

function docDaReceita(d: DadosReceitaFin): Record<string, unknown> {
  return {
    evento: paraRelacao(d.eventoId),
    tipoLancamento: d.tipoLancamento,
    centroCusto: d.centroCusto,
    cliente: d.cliente,
    segmento: d.segmento,
    origem: d.origem,
    tipoReceita: d.tipoReceita,
    etapa: d.etapa,
    qtde: d.qtde,
    valorUnit: d.valorUnit,
    desconto: d.desconto,
    pagantes: d.pagantes,
    cortesias: d.cortesias,
    statusEconomico: d.statusEconomico,
    criterioReconhecimento: d.criterioReconhecimento,
    competencia: d.competencia,
    referencia: d.referencia,
    observacao: d.observacao,
  };
}

/**
 * Cria ou altera uma receita. As etapas são de `salvarEtapasFin`: na criação
 * gravam as que vierem; na alteração não são tocadas.
 */
export async function salvarReceitaFin(id: string | null, dados: DadosReceitaFin, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (id !== null && idCanonico(id) === null) return DADOS_INVALIDOS;
  const ev = eventoDoLancamento(dados.eventoId);
  if (ehResultado(ev)) return ev;
  const d = comDefaultsDeLancamento({ ...dados, eventoId: ev.id });

  return naTransacao(usuario, "salvarReceitaFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.receitas);
    if (!ehAlvo(a)) return a;
    if ((!d.eventoId || (a.atual && !a.atual.eventoId)) && !podeCorporativo(usuario, "fin.receber")) return RECUSADO;
    const erro = falhou(validarReceita(d, livro, a.id)) ?? conferirEvento(livro, d.eventoId);
    if (erro) return erro;

    const data = docDaReceita(d);
    if (a.id !== null) {
      await req.payload.update({ collection: "fin-receitas", id: Number(a.id), data, req });
      return { ok: true, id: a.id };
    }
    const criado = await req.payload.create({
      collection: "fin-receitas",
      data: { ...data, etapas: limparEtapas(Array.isArray(d.etapas) ? d.etapas : []) },
      req,
    });
    return { ok: true, id: String(criado.id) };
  });
}

/** Como o "Salvar etapas" do protótipo: sem nome é descartada; concluída sem data ganha hoje. */
function limparEtapas(etapas: EtapaReceita[]): EtapaReceita[] {
  const hoje = hojeEmSaoPaulo(new Date());
  return etapas
    .filter((e) => e && typeof e.nome === "string" && e.nome.trim())
    .map((e) => {
      const percentual = e.base === "percentual";
      return {
        nome: e.nome.trim(),
        base: percentual ? "percentual" : "valor",
        valor: percentual ? 0 : Number(e.valor) || 0,
        percentual: percentual ? Number(e.percentual) || 0 : 0,
        concluida: !!e.concluida,
        dataConclusao: e.concluida ? e.dataConclusao || hoje : "",
      };
    });
}

/** Etapas de reconhecimento da receita (drawer "Etapas e reconhecimento econômico"). */
export async function salvarEtapasFin(receitaId: string, etapas: EtapaReceita[], usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(receitaId) === null || !Array.isArray(etapas)) return DADOS_INVALIDOS;
  return naTransacao(usuario, "salvarEtapasFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(receitaId, livro.receitas);
    if (!ehAlvo(a)) return a;
    const r = a.atual;
    if (!r || a.id === null) return { ok: false, erro: MSG_NAO_ENCONTRADO };
    if (!r.eventoId && !podeCorporativo(usuario, "fin.receber")) return RECUSADO;
    const limpa = limparEtapas(etapas);
    const erro = falhou(validarEtapas(r, limpa));
    if (erro) return erro;
    await req.payload.update({
      collection: "fin-receitas",
      id: Number(a.id),
      data: { etapas: limpa, criterioReconhecimento: limpa.length ? CRIT_POR_ETAPA : r.criterioReconhecimento || CRIT_PROVISORIO },
      req,
    });
    return { ok: true, id: a.id };
  });
}

export async function excluirReceitaFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirReceitaFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.receitas);
    if (!ehAlvo(a)) return a;
    const rid = a.id as string;
    const erro = falhou(podeExcluirReceita(rid, livro));
    if (erro) return erro;
    await req.payload.delete({ collection: "fin-receitas", id: Number(rid), req });
    return { ok: true, id: rid };
  });
}

// ---------------------------------------------------------- faturamento

export async function salvarFaturamentoFin(
  id: string | null,
  dados: DadosFaturamentoFin,
  usuario: UsuarioAutenticado,
): Promise<ResultadoFin> {
  if (id !== null && idCanonico(id) === null) return DADOS_INVALIDOS;
  const receitaId = relacaoCanonica(dados.receitaId);
  const contaId = relacaoCanonica(dados.contaId);
  if (receitaId === null || contaId === null) return DADOS_INVALIDOS;
  const d: DadosFaturamentoFin = { ...dados, receitaId, contaId };

  return naTransacao(usuario, "salvarFaturamentoFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.faturamentos);
    if (!ehAlvo(a)) return a;
    const corporativa = (rid: string | undefined): boolean => {
      const r = livro.receitas.find((x) => x.id === rid);
      return !!r && !r.eventoId;
    };
    if ((corporativa(receitaId) || corporativa(a.atual?.receitaId)) && !podeCorporativo(usuario, "fin.receber")) return RECUSADO;
    const erro = falhou(validarFaturamento(d, livro, a.id));
    if (erro) return erro;

    const data = {
      receita: Number(receitaId),
      parcela: d.parcela,
      nf: d.nf,
      dataFaturamento: d.dataFaturamento,
      valorFaturado: d.valorFaturado,
      vencimento: d.vencimento,
      retencaoTributaria: d.retencaoTributaria,
      retencaoContratual: d.retencaoContratual,
      retencaoContratualLiberada: d.retencaoContratualLiberada,
      dataRecebimento: d.dataRecebimento,
      valorRecebido: d.valorRecebido,
      conta: paraRelacao(contaId),
      quitado: d.quitado === true,
      observacao: d.observacao,
    };
    if (a.id !== null) {
      await req.payload.update({ collection: "fin-faturamentos", id: Number(a.id), data, req });
      return { ok: true, id: a.id };
    }
    const criado = await req.payload.create({ collection: "fin-faturamentos", data, req });
    return { ok: true, id: String(criado.id) };
  });
}

/** Excluir parcela é livre (protótipo). */
export async function excluirFaturamentoFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirFaturamentoFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.faturamentos);
    if (!ehAlvo(a)) return a;
    const fid = a.id as string;
    await req.payload.delete({ collection: "fin-faturamentos", id: Number(fid), req });
    return { ok: true, id: fid };
  });
}

// ---------------------------------------------------------------- custo

function docDoCusto(d: DadosCustoFin): Record<string, unknown> {
  return {
    evento: paraRelacao(d.eventoId),
    tipoLancamento: d.tipoLancamento,
    centroCusto: d.centroCusto,
    compartilhada: d.compartilhada === true,
    origemLancamento: d.origemLancamento,
    fase: d.fase,
    categoria: d.categoria,
    subcategoria: d.subcategoria,
    descricao: d.descricao,
    fornecedor: d.fornecedor,
    documento: d.documento,
    natureza: d.natureza,
    comportamento: d.comportamento,
    driver: d.driver,
    unidade: d.unidade,
    qtde: d.qtde,
    valorUnitPrev: d.valorUnitPrev,
    valorRealizado: d.valorRealizado,
    competencia: d.competencia,
    dataPrevista: d.dataPrevista,
    periodicidade: d.periodicidade ?? "",
    criterioApropriacao: d.criterioApropriacao,
    observacao: d.observacao,
  };
}

export async function salvarCustoFin(id: string | null, dados: DadosCustoFin, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (id !== null && idCanonico(id) === null) return DADOS_INVALIDOS;
  const ev = eventoDoLancamento(dados.eventoId);
  if (ehResultado(ev)) return ev;
  const d = comDefaultsDeLancamento({ ...dados, eventoId: ev.id });

  return naTransacao(usuario, "salvarCustoFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.custos);
    if (!ehAlvo(a)) return a;
    if ((!d.eventoId || (a.atual && !a.atual.eventoId)) && !podeCorporativo(usuario, "fin.pagar")) return RECUSADO;
    const erro = falhou(validarCusto(d, livro, a.id)) ?? conferirEvento(livro, d.eventoId);
    if (erro) return erro;

    const data = docDoCusto(d);
    if (a.id !== null) {
      await req.payload.update({ collection: "fin-custos", id: Number(a.id), data, req });
      return { ok: true, id: a.id };
    }
    const criado = await req.payload.create({ collection: "fin-custos", data, req });
    return { ok: true, id: String(criado.id) };
  });
}

export async function excluirCustoFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirCustoFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.custos);
    if (!ehAlvo(a)) return a;
    const cid = a.id as string;
    const erro = falhou(podeExcluirCusto(cid, livro));
    if (erro) return erro;
    await req.payload.delete({ collection: "fin-custos", id: Number(cid), req });
    return { ok: true, id: cid };
  });
}

// ------------------------------------------------------------ pagamento

export async function salvarPagamentoFin(id: string | null, dados: DadosPagamentoFin, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (id !== null && idCanonico(id) === null) return DADOS_INVALIDOS;
  const custoId = relacaoCanonica(dados.custoId);
  const contaId = relacaoCanonica(dados.contaId);
  if (custoId === null || contaId === null) return DADOS_INVALIDOS;
  const d: DadosPagamentoFin = { ...dados, custoId, contaId };

  return naTransacao(usuario, "salvarPagamentoFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.pagamentos);
    if (!ehAlvo(a)) return a;
    const corporativo = (cid: string | undefined): boolean => {
      const c = livro.custos.find((x) => x.id === cid);
      return !!c && !c.eventoId;
    };
    if ((corporativo(custoId) || corporativo(a.atual?.custoId)) && !podeCorporativo(usuario, "fin.pagar")) return RECUSADO;
    const erro = falhou(validarPagamento(d, livro, a.id));
    if (erro) return erro;

    const data = {
      custo: Number(custoId),
      documento: d.documento,
      vencimento: d.vencimento,
      valor: d.valor,
      dataPagamento: d.dataPagamento,
      valorPago: d.valorPago,
      conta: paraRelacao(contaId),
      observacao: d.observacao,
    };
    if (a.id !== null) {
      await req.payload.update({ collection: "fin-pagamentos", id: Number(a.id), data, req });
      return { ok: true, id: a.id };
    }
    const criado = await req.payload.create({ collection: "fin-pagamentos", data, req });
    return { ok: true, id: String(criado.id) };
  });
}

/** Excluir título é livre (protótipo). */
export async function excluirPagamentoFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirPagamentoFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.pagamentos);
    if (!ehAlvo(a)) return a;
    const pid = a.id as string;
    await req.payload.delete({ collection: "fin-pagamentos", id: Number(pid), req });
    return { ok: true, id: pid };
  });
}

// ---------------------------------------------------------------- conta

export async function salvarContaFin(id: string | null, dados: DadosContaFin, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (id !== null && idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "salvarContaFin", ERRO_SALVAR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.contas);
    if (!ehAlvo(a)) return a;
    const erro = falhou(validarConta(dados));
    if (erro) return erro;
    const data = {
      nome: dados.nome,
      tipo: dados.tipo,
      banco: dados.banco,
      agencia: dados.agencia,
      numero: dados.numero,
      saldoInicial: dados.saldoInicial,
      dataSaldoInicial: dados.dataSaldoInicial,
      ativa: dados.ativa !== false,
      observacao: dados.observacao,
    };
    if (a.id !== null) {
      await req.payload.update({ collection: "fin-contas", id: Number(a.id), data, req });
      return { ok: true, id: a.id };
    }
    const criado = await req.payload.create({ collection: "fin-contas", data, req });
    return { ok: true, id: String(criado.id) };
  });
}

export async function excluirContaFin(id: string, usuario: UsuarioAutenticado): Promise<ResultadoFin> {
  if (idCanonico(id) === null) return DADOS_INVALIDOS;
  return naTransacao(usuario, "excluirContaFin", ERRO_EXCLUIR, async (req) => {
    const livro = await lerLivroFinanceiro(req);
    const a = alvo(id, livro.contas);
    if (!ehAlvo(a)) return a;
    const cid = a.id as string;
    const erro = falhou(podeExcluirConta(cid, livro));
    if (erro) return erro;
    await req.payload.delete({ collection: "fin-contas", id: Number(cid), req });
    return { ok: true, id: cid };
  });
}
