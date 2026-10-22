"use server";

import { revalidatePath } from "next/cache";
import type { RequiredDataFromCollectionSlug } from "payload";

import { VERTICAIS_CONTATO } from "@ntc/lib";
import type { Rodape } from "@ntc/types";

import {
  obterAdministrador,
  obterUsuarioAutenticadoComTela,
  obterUsuarioCms,
  obterUsuarioCmsComTela,
} from "@/lib/cms/autenticacao";
import { acessoDoUsuario, temTela, type TelaPainel } from "@/lib/cms/telas";
import {
  listarAreasCms,
  listarCardsCorpoDocenteCms,
  listarConteudosCms,
  listarOpcoesPalestranteCms,
  obterConteudoCms,
  obterEventoCms,
  obterPalestranteCms,
  type ConteudoCmsDetalhe,
  type CardCorpoDocenteResumo,
  type ConteudoCmsResumo,
  type EventoCmsDetalhe,
  type PalestranteCmsDetalhe,
} from "@/lib/cms/painelCms";
import {
  criarEventoDePdf,
  criarEventoEmBrancoCms,
  definirOcultarPalestrante,
  despublicarConteudoCms,
  despublicarEvento,
  ehCamposPalestrante,
  enviarMidiaConteudo as enviarMidiaConteudoCms,
  enviarMidiaEvento,
  excluirConteudoCms,
  publicarConteudoCms,
  publicarEvento,
  salvarCamposEvento,
  salvarContatosCms,
  salvarConteudoCms,
  salvarEventosHome,
  salvarOrdemCorpoDocenteCms,
  salvarPalestranteCms,
  vincularPalestrantesEvento,
  type CamposContatos,
  type CamposConteudo,
  type CamposEventoCompletos,
  type ResultadoEscrita,
  type ResultadoImportacao,
} from "@/lib/cms/painelCmsEscrita";
import {
  criarUsuario,
  editarUsuario,
  listarUsuarios,
  reenviarConvite,
  removerUsuario,
  type PayloadUsuarios,
  type ResultadoUsuarios,
  type UsuarioGestaoResumo,
} from "@/lib/cms/painelCmsUsuarios";
import { listarPasskeysDoUsuario, removerPasskey, type PasskeyResumo } from "@/lib/cms/painelPasskeys";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Server Actions do Painel Admin. Toda action valida a sessão (cookie
 * payload-token) ANTES de tocar a Local API — Server Actions são endpoints
 * públicos; sem a guarda, qualquer um com a URL escreveria no banco.
 */

const TELAS_EVENTOS: readonly TelaPainel[] = ["site.eventos"];
const TELAS_PALESTRANTES: readonly TelaPainel[] = ["site.palestrantes"];
const TELAS_CORPO_DOCENTE: readonly TelaPainel[] = ["site.corpo-docente"];
const TELAS_HOME: readonly TelaPainel[] = ["site.home"];
const TELAS_CONTEUDOS: readonly TelaPainel[] = ["site.conteudos"];
const TELAS_CONTATOS: readonly TelaPainel[] = ["site.contatos"];

const ERRO_SESSAO = "Sessão expirada. Entre novamente.";

const RECUSADO: ResultadoEscrita = { ok: false, erro: ERRO_SESSAO };
/** Escritas que também exigem perfil (a Local API ignora o `access` das coleções). */
const RECUSADO_PERFIL: ResultadoEscrita = { ok: false, erro: "Sessão expirada ou sem permissão para esta ação." };

export async function carregarEvento(id: string): Promise<EventoCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterEventoCms(id);
}

export async function carregarPalestrante(id: string): Promise<PalestranteCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterPalestranteCms(id);
}

/** Salva o conjunto completo de campos editáveis e retorna o detalhe atualizado. */
export async function salvarEvento(
  id: string,
  campos: CamposEventoCompletos,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return { resultado: RECUSADO_PERFIL, evento: null };
  const resultado = await salvarCamposEvento(id, campos);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Faz upload de capa ou folder PDF (via FormData) e devolve o detalhe
 * atualizado. O File chega no campo "arquivo" do FormData.
 */
export async function enviarMidia(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return { resultado: RECUSADO_PERFIL, evento: null };
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { resultado: { ok: false, erro: "Nenhum arquivo selecionado." }, evento: null };
  }
  const resultado = await enviarMidiaEvento(id, campo, arquivo);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Publica ou despublica o evento e devolve o detalhe atualizado. */
export async function alternarPublicacaoEvento(
  id: string,
  publicar: boolean,
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return { resultado: RECUSADO_PERFIL, evento: null };
  const resultado = publicar ? await publicarEvento(id) : await despublicarEvento(id);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/** Vincula os palestrantes (ids) ao evento e devolve o detalhe atualizado. */
export async function salvarPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<{ resultado: ResultadoEscrita; evento: EventoCmsDetalhe | null }> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return { resultado: RECUSADO_PERFIL, evento: null };
  const resultado = await vincularPalestrantesEvento(id, idsEspecialistas);
  if (resultado.ok) revalidatePath("/");
  const evento = resultado.ok ? await obterEventoCms(id) : null;
  return { resultado, evento };
}

/**
 * Importa um folder PDF criando um Evento em rascunho com o PDF vinculado.
 * O File chega no campo "arquivo" do FormData. Os campos restantes ficam para
 * a porta do PDF + revisão no detalhe.
 */
export async function importarEventoPdf(formData: FormData): Promise<ResultadoImportacao> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return RECUSADO_PERFIL;
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, erro: "Nenhum arquivo selecionado." };
  }
  if (arquivo.type !== "application/pdf" && !arquivo.name.toLowerCase().endsWith(".pdf")) {
    return { ok: false, erro: "Envie um arquivo PDF." };
  }
  const resultado = await criarEventoDePdf(arquivo);
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/** Cria um evento em branco (rascunho) para o editor preencher no detalhe. */
export async function criarEventoEmBranco(): Promise<ResultadoEscrita & { id?: string }> {
  if (!(await obterUsuarioCmsComTela(TELAS_EVENTOS))) return RECUSADO_PERFIL;
  const resultado = await criarEventoEmBrancoCms();
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/** Salva os eventos em destaque na Home. */
export async function salvarEventosDestaqueHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCmsComTela(TELAS_HOME))) return RECUSADO_PERFIL;
  const resultado = await salvarEventosHome(idsEventos);
  if (resultado.ok) revalidatePath("/");
  return resultado;
}

/**
 * Mostra/oculta um palestrante no site público e devolve o detalhe atualizado.
 * O afterChange da coleção Especialistas revalida o Corpo Docente sozinho.
 */
export async function alternarOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }> {
  if (!(await obterUsuarioCmsComTela(TELAS_PALESTRANTES))) return { resultado: RECUSADO_PERFIL, palestrante: null };
  const resultado = await definirOcultarPalestrante(id, oculto);
  if (resultado.ok) revalidatePath("/");
  const palestrante = resultado.ok ? await obterPalestranteCms(id) : null;
  return { resultado, palestrante };
}

const DADOS_INVALIDOS: ResultadoEscrita = { ok: false, erro: "Dados do formulário inválidos." };
const AVISO_SEM_RELEITURA = "Salvo. Não foi possível recarregar os dados — reabra o palestrante.";

// Até 15 dígitos: acima disso `Number` perde precisão e o id canônico deixa de ser inteiro.
const ehIdNumerico = (v: unknown): v is string => typeof v === "string" && /^\d{1,15}$/.test(v);
/** "007" e "7" são o mesmo registro: sem isso, um id forjado duplicaria um card. */
const idCanonico = (v: string): string => String(Number(v));

/**
 * Cria (`id` vazio) ou edita um palestrante, gravando PUBLICADO, junto com o
 * card dele no Corpo Docente. O `FormData` traz `id`, `campos` (JSON de
 * `CamposPalestrante`), `foto` (File, opcional) e `fotoAlt`.
 */
export async function salvarPalestrante(
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; palestrante: PalestranteCmsDetalhe | null }> {
  // O usuário cru vai para `executarEmTransacao` (vira `req.user`).
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_PALESTRANTES);
  if (!usuario) return { resultado: RECUSADO_PERFIL, palestrante: null };

  const idBruto = formData.get("id");
  const idTexto = typeof idBruto === "string" && idBruto.trim() !== "" ? idBruto.trim() : null;
  if (idTexto !== null && !ehIdNumerico(idTexto)) return { resultado: DADOS_INVALIDOS, palestrante: null };
  const id = idTexto === null ? null : idCanonico(idTexto);

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("campos") ?? ""));
  } catch {
    return { resultado: DADOS_INVALIDOS, palestrante: null };
  }
  if (!ehCamposPalestrante(bruto)) return { resultado: DADOS_INVALIDOS, palestrante: null };
  if (![...bruto.linhasAtuacaoIds, ...bruto.programasIds].every(ehIdNumerico)) {
    return { resultado: DADOS_INVALIDOS, palestrante: null };
  }
  // O bloco Corpo Docente só é gravado por quem tem a tela Corpo Docente
  // (spec §7): `corpoDocente` não nulo = o bloco veio no formulário.
  if (bruto.corpoDocente !== null && !temTela(acessoDoUsuario(usuario), TELAS_CORPO_DOCENTE)) {
    return { resultado: RECUSADO_PERFIL, palestrante: null };
  }
  const campos = {
    ...bruto,
    linhasAtuacaoIds: bruto.linhasAtuacaoIds.map(idCanonico),
    programasIds: bruto.programasIds.map(idCanonico),
  };

  const arquivo = formData.get("foto");
  const foto =
    arquivo instanceof File && arquivo.size > 0
      ? { arquivo, alt: String(formData.get("fotoAlt") ?? "") }
      : null;

  const resultado = await salvarPalestranteCms(usuario, id, campos, foto);
  if (resultado.ok) revalidatePath("/");
  if (!resultado.ok || !resultado.id) return { resultado, palestrante: null };

  // A escrita já foi confirmada: uma falha na releitura não pode virar erro
  // (o PO tentaria salvar de novo e criaria outro registro).
  const palestrante = await obterPalestranteCms(resultado.id).catch(() => null);
  if (!palestrante) return { resultado: { ...resultado, aviso: AVISO_SEM_RELEITURA }, palestrante: null };
  return { resultado, palestrante };
}

/** Cards de pessoa do Corpo Docente, na ordem atual, para a tela de ordenação. */
export async function carregarCorpoDocente(): Promise<CardCorpoDocenteResumo[]> {
  if (!(await obterUsuarioCms())) return [];
  return listarCardsCorpoDocenteCms();
}

/** Grava a ordem dos cards e devolve a lista relida. */
export async function salvarOrdemCorpoDocente(
  idsNaOrdem: string[],
): Promise<{ resultado: ResultadoEscrita; cards: CardCorpoDocenteResumo[] | null }> {
  const usuario = await obterUsuarioAutenticadoComTela(TELAS_CORPO_DOCENTE);
  if (!usuario) return { resultado: RECUSADO_PERFIL, cards: null };
  if (!Array.isArray(idsNaOrdem) || !idsNaOrdem.every(ehIdNumerico)) {
    return { resultado: DADOS_INVALIDOS, cards: null };
  }
  const resultado = await salvarOrdemCorpoDocenteCms(usuario, idsNaOrdem.map(idCanonico));
  if (resultado.ok) revalidatePath("/");
  const cards = resultado.ok ? await listarCardsCorpoDocenteCms() : null;
  return { resultado, cards };
}

/** Áreas e programas para os selects de relação do formulário do palestrante. */
export async function carregarOpcoesPalestrante(): Promise<{
  areas: { id: string; nome: string }[];
  programas: { id: string; sigla: string }[];
}> {
  if (!(await obterUsuarioCms())) return { areas: [], programas: [] };
  return listarOpcoesPalestranteCms();
}

/**
 * Server Actions da gestão de usuários (tela "Usuários"). Guarda MAIS
 * restrita que as demais: exige administrador, não apenas sessão
 * válida — só administradores criam/editam/removem contas administrativas.
 */

const RECUSADO_SUPER_ADMIN: ResultadoEscrita = {
  ok: false,
  erro: "Você não tem permissão para esta ação.",
};

/**
 * Adapta o Payload real (Local API) à superfície mínima mockável
 * PayloadUsuarios. `data: Record<string, unknown>` na interface (para
 * permitir mock nos testes) não corresponde ao tipo gerado da collection —
 * cast pontual, mesmo padrão de painelCmsEscrita.ts (criarEventoDePdf).
 */
async function obterPayloadUsuarios(): Promise<PayloadUsuarios> {
  const payload = await obterPayload();
  return {
    find: (args) => payload.find(args),
    create: (args) =>
      payload.create({
        collection: "users",
        data: args.data as RequiredDataFromCollectionSlug<"users">,
        overrideAccess: args.overrideAccess,
      }),
    update: (args) =>
      payload.update({
        collection: "users",
        id: args.id,
        data: args.data as RequiredDataFromCollectionSlug<"users">,
        overrideAccess: args.overrideAccess,
      }),
    delete: (args) => payload.delete(args),
    forgotPassword: (args) => payload.forgotPassword(args),
    sendEmail: (args) => payload.sendEmail(args),
  };
}

export async function carregarUsuarios(): Promise<UsuarioGestaoResumo[]> {
  const usuario = await obterAdministrador();
  if (!usuario) return [];
  return listarUsuarios(await obterPayloadUsuarios());
}

export async function criarUsuarioCms(dados: {
  nome: string;
  email: string;
  perfil: string;
}): Promise<{ resultado: ResultadoUsuarios; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterAdministrador();
  if (!usuario) {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await criarUsuario(p, dados);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

export async function editarUsuarioCms(
  id: string,
  dados: { nome: string; perfil: string },
): Promise<{ resultado: ResultadoEscrita; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterAdministrador();
  if (!usuario) {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await editarUsuario(p, id, dados);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

export async function removerUsuarioCms(
  id: string,
): Promise<{ resultado: ResultadoEscrita; usuarios: UsuarioGestaoResumo[] }> {
  const usuario = await obterAdministrador();
  if (!usuario) {
    return { resultado: RECUSADO_SUPER_ADMIN, usuarios: [] };
  }
  const p = await obterPayloadUsuarios();
  const resultado = await removerUsuario(p, id, usuario.id);
  const usuarios = await listarUsuarios(p);
  return { resultado, usuarios };
}

/**
 * Reenvia o convite de definição de senha (mesmo fluxo de criarUsuarioCms,
 * sem recriar o usuário) — aponta para o aviso "Reenviar convite" da T4
 * quando o e-mail original falhou, ou para um usuário que perdeu o link.
 */
export async function reenviarConviteUsuarioCms(id: string): Promise<ResultadoEscrita> {
  const usuario = await obterAdministrador();
  if (!usuario) return RECUSADO_SUPER_ADMIN;
  const p = await obterPayloadUsuarios();
  return reenviarConvite(p, id);
}

/**
 * Passkeys de outro usuário (tela Usuários) — mesma guarda super-admin das
 * demais actions deste bloco; remoção reaproveita removerPasskey (Task 4)
 * com chamadorEhSuperAdmin=true, que ignora a checagem de dono.
 */
export async function listarPasskeysDeUsuarioCms(usuarioId: string): Promise<PasskeyResumo[]> {
  const usuario = await obterAdministrador();
  if (!usuario) return [];
  return listarPasskeysDoUsuario(usuarioId);
}

export async function removerPasskeyAdminCms(passkeyId: string): Promise<ResultadoEscrita> {
  const usuario = await obterAdministrador();
  if (!usuario) return RECUSADO_SUPER_ADMIN;
  return removerPasskey(passkeyId, usuario.id, true);
}

/**
 * Server Actions de Conteúdos editoriais (telas de lista e detalhe do
 * painel) e de Contatos institucionais (tela Configurações).
 *
 * Leitura: basta a sessão — o spec de conteúdos §6.4 dá a lista ao
 * `editor-eventos` ("vê a lista e não edita"), e os contatos institucionais
 * aparecem no rodapé de toda página pública.
 *
 * Escrita: exige tela do site. Toda escrita destas telas chama a Local
 * API com `overrideAccess: true`, então o `access: editorInstitucional`
 * declarado em `Conteudos.ts` e em `Rodape.ts` nunca chega a ser consultado —
 * é esta guarda que faz a regra valer (spec de conteúdos §6.4, spec de
 * contatos §5).
 */

const RECUSADO_EDITORIAL: ResultadoEscrita = {
  ok: false,
  erro: "Você não tem permissão para esta ação.",
};

/** `null` libera a escrita; qualquer outro retorno é a recusa a devolver. */
async function barrarSemTela(telas: readonly TelaPainel[]): Promise<ResultadoEscrita | null> {
  const usuario = await obterUsuarioCms();
  if (!usuario) return RECUSADO;
  if (!temTela(usuario.acesso, telas)) return RECUSADO_EDITORIAL;
  return null;
}

export async function listarConteudos(): Promise<ConteudoCmsResumo[]> {
  if (!(await obterUsuarioCms())) return [];
  return listarConteudosCms();
}

export async function carregarConteudo(id: string): Promise<ConteudoCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterConteudoCms(id);
}

export async function carregarAreas(): Promise<{ id: string; nome: string }[]> {
  if (!(await obterUsuarioCms())) return [];
  return listarAreasCms();
}

export async function salvarConteudo(
  id: string | null,
  campos: CamposConteudo,
): Promise<ResultadoEscrita & { id?: string }> {
  const barrado = await barrarSemTela(TELAS_CONTEUDOS);
  if (barrado) return barrado;
  const r = await salvarConteudoCms(id, campos);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function publicarConteudo(id: string): Promise<ResultadoEscrita> {
  const barrado = await barrarSemTela(TELAS_CONTEUDOS);
  if (barrado) return barrado;
  const r = await publicarConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function despublicarConteudo(id: string): Promise<ResultadoEscrita> {
  const barrado = await barrarSemTela(TELAS_CONTEUDOS);
  if (barrado) return barrado;
  const r = await despublicarConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function excluirConteudo(id: string): Promise<ResultadoEscrita> {
  const barrado = await barrarSemTela(TELAS_CONTEUDOS);
  if (barrado) return barrado;
  const r = await excluirConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}

/**
 * Envia a imagem de destaque ou o anexo do conteúdo (File no campo "arquivo"
 * do FormData) e devolve o detalhe atualizado, com os nomes dos arquivos já
 * vinculados. Exige o conteúdo salvo — sem id não há documento para apontar.
 *
 * O campo "alt" do FormData é o texto alternativo escrito pelo editor, que
 * vai para a Media e daí para a página pública de leitura (§10).
 */
export async function enviarMidiaConteudo(
  id: string,
  campo: "imagemDestaque" | "anexoDownload",
  formData: FormData,
): Promise<{ resultado: ResultadoEscrita; conteudo: ConteudoCmsDetalhe | null }> {
  const barrado = await barrarSemTela(TELAS_CONTEUDOS);
  if (barrado) return { resultado: barrado, conteudo: null };
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { resultado: { ok: false, erro: "Nenhum arquivo selecionado." }, conteudo: null };
  }
  const altBruto = formData.get("alt");
  const alt = typeof altBruto === "string" ? altBruto : "";
  const resultado = await enviarMidiaConteudoCms(id, campo, arquivo, alt);
  if (resultado.ok) revalidatePath("/");
  const conteudo = resultado.ok ? await obterConteudoCms(id) : null;
  return { resultado, conteudo };
}

/**
 * Server Actions de Contatos institucionais (tela Configurações). A leitura
 * exige sessão; a escrita exige tela do site (`barrarNaoEditorial`).
 */

const CONTATOS_VAZIOS: CamposContatos = {
  telefoneInstitucional: "",
  whatsappInstitucional: "",
  emailInstitucional: "",
  emailImprensa: "",
  emailParcerias: "",
  emailDpo: "",
  emailSuporte: "",
  emailEventos: "",
  enderecoCompleto: "",
  razaoSocial: "",
  cnpj: "",
  verticais: VERTICAIS_CONTATO.map((v) => ({ vertical: v.valor, email: "", opcaoTelefone: "" })),
};

/**
 * Lê o Global `rodape` e devolve os campos editáveis, com "" no lugar de
 * `null`/`undefined` (o formulário controla inputs de texto, não aceita
 * `null`). `verticais` sempre traz as 3 linhas fixas de `VERTICAIS_CONTATO`,
 * na mesma ordem canônica — uma vertical ainda sem registro no Global
 * aparece com os campos em branco, não é omitida.
 */
export async function carregarContatosCms(): Promise<CamposContatos> {
  if (!(await obterUsuarioCms())) return CONTATOS_VAZIOS;

  const payload = await obterPayload();
  const g = (await payload.findGlobal({ slug: "rodape" }).catch(() => null)) as Rodape | null;
  if (!g) return CONTATOS_VAZIOS;

  return {
    telefoneInstitucional: g.telefoneInstitucional ?? "",
    whatsappInstitucional: g.whatsappInstitucional ?? "",
    emailInstitucional: g.emailInstitucional ?? "",
    emailImprensa: g.emailImprensa ?? "",
    emailParcerias: g.emailParcerias ?? "",
    emailDpo: g.emailDpo ?? "",
    emailSuporte: g.emailSuporte ?? "",
    emailEventos: g.emailEventos ?? "",
    enderecoCompleto: g.enderecoCompleto ?? "",
    razaoSocial: g.razaoSocial ?? "",
    cnpj: g.cnpj ?? "",
    verticais: VERTICAIS_CONTATO.map((v) => {
      const existente = g.verticais?.find((x) => x.vertical === v.valor);
      return {
        vertical: v.valor,
        email: existente?.email ?? "",
        opcaoTelefone: existente?.opcaoTelefone ?? "",
      };
    }),
  };
}

/** Salva os contatos institucionais (gate de tela + validação + Global). */
export async function salvarContatos(campos: CamposContatos): Promise<ResultadoEscrita> {
  const barrado = await barrarSemTela(TELAS_CONTATOS);
  if (barrado) return barrado;
  return salvarContatosCms(campos);
}
