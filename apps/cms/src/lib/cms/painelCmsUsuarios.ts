import "server-only";

import { randomInt } from "node:crypto";

import { emailBoasVindasHtml } from "@/lib/emailsCms";

import type { ResultadoEscrita } from "./painelCmsEscrita";
import { acessoDoUsuario, type TelaPainel } from "./telas";

/**
 * Gestão de usuários do Painel Admin (tela "Usuários", só administrador).
 * Núcleo testável recebe a superfície mínima mockável da Local API
 * (PayloadUsuarios) — mesmo padrão de casarOuCriarPalestrantes.ts.
 *
 * Convite: cria o usuário com senha aleatória (nunca usada — o usuário
 * nunca sabe qual é), dispara forgotPassword (mesmo fluxo de "esqueci a
 * senha", disableEmail:true para controlar o e-mail aqui) e envia o
 * e-mail de boas-vindas com o link de definição de senha. Sem
 * RESEND_API_KEY, o adapter de e-mail do Payload loga no console
 * (CLAUDE.md §19.2/19.3) — aqui replicamos a mesma degradação: falha só
 * no envio não desfaz a criação do usuário (ele já existe; o
 * super-admin pode reenviar depois via "esqueci a senha").
 */

export interface UsuarioGestaoResumo {
  id: string;
  nome: string;
  email: string;
  administrador: boolean;
  telas: TelaPainel[];
  atualizadoEm: string;
}

/**
 * Resultado das escritas da gestão de usuários: como ResultadoEscrita, mas
 * com `aviso` para sucesso parcial (usuário criado, convite não enviado).
 */
export interface ResultadoUsuarios extends ResultadoEscrita {
  aviso?: string;
}

/** Superfície mínima da Local API usada aqui — permite mock nos testes. */
export interface PayloadUsuarios {
  find(args: {
    collection: "users";
    limit: number;
    depth: 0;
    sort: string;
    overrideAccess: true;
  }): Promise<{
    docs: { id: string | number; nome: string; email: string; administrador?: boolean | null; telas?: string[] | null; updatedAt: string }[];
  }>;
  findByID(args: {
    collection: "users";
    id: string | number;
    depth: 0;
    overrideAccess: true;
  }): Promise<{ id: string | number; administrador?: boolean | null } | null>;
  count(args: {
    collection: "users";
    where: { administrador: { equals: true } };
    overrideAccess: true;
  }): Promise<{ totalDocs: number }>;
  create(args: {
    collection: "users";
    data: Record<string, unknown>;
    overrideAccess: true;
  }): Promise<{ id: string | number }>;
  update(args: {
    collection: "users";
    id: string | number;
    data: Record<string, unknown>;
    overrideAccess: true;
  }): Promise<unknown>;
  delete(args: { collection: "users"; id: string | number; overrideAccess: true }): Promise<unknown>;
  forgotPassword(args: {
    collection: "users";
    data: { email: string };
    disableEmail: true;
  }): Promise<string | null | undefined>;
  sendEmail(args: { to: string; subject: string; html: string }): Promise<unknown>;
}

const ALFABETO_SENHA =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

/** Senha aleatória de 24 caracteres — nunca é revelada; o usuário define a própria via convite. */
export function gerarSenhaAleatoria(): string {
  let senha = "";
  for (let i = 0; i < 24; i++) {
    senha += ALFABETO_SENHA[randomInt(ALFABETO_SENHA.length)];
  }
  return senha;
}

const ERRO_GENERICO = "Não foi possível salvar. Tente novamente.";

export async function listarUsuarios(p: PayloadUsuarios): Promise<UsuarioGestaoResumo[]> {
  const res = await p.find({
    collection: "users",
    limit: 200,
    depth: 0,
    sort: "nome",
    overrideAccess: true,
  });
  return res.docs.map((u) => ({
    id: String(u.id),
    nome: u.nome,
    email: u.email,
    administrador: acessoDoUsuario(u).administrador,
    telas: [...acessoDoUsuario(u).telas],
    atualizadoEm: u.updatedAt,
  }));
}

export async function criarUsuario(
  p: PayloadUsuarios,
  dados: { nome: string; email: string; administrador: boolean; telas: TelaPainel[] },
): Promise<ResultadoUsuarios> {
  if (dados.nome.trim() === "" || dados.email.trim() === "") {
    return { ok: false, erro: "Informe nome e e-mail." };
  }

  try {
    await p.create({
      collection: "users",
      data: {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        administrador: dados.administrador === true,
        telas: acessoDoUsuario({ telas: dados.telas }).telas,
        password: gerarSenhaAleatoria(),
      },
      overrideAccess: true,
    });
  } catch (e) {
    console.error("[criarUsuario]", e);
    const mensagem = e instanceof Error ? e.message : "";
    if (mensagem.toLowerCase().includes("email")) {
      return { ok: false, erro: "Já existe usuário com este e-mail." };
    }
    return { ok: false, erro: ERRO_GENERICO };
  }

  // Usuário já está criado — falha a partir daqui não desfaz o cadastro,
  // só perde o convite automático (o administrador pode reenviar depois via
  // "esqueci a senha").
  try {
    const token = await p.forgotPassword({
      collection: "users",
      data: { email: dados.email.trim() },
      disableEmail: true,
    });
    await p.sendEmail({
      to: dados.email.trim(),
      subject: "Bem-vindo(a) ao Painel Admin NTC",
      html: emailBoasVindasHtml({ nome: dados.nome.trim(), token: token ?? "" }),
    });
  } catch (e) {
    console.error("[criarUsuario] convite por e-mail falhou", e);
    return {
      ok: true,
      aviso: 'Usuário criado, mas o e-mail de convite falhou — use "Reenviar convite".',
    };
  }

  return { ok: true };
}

/**
 * Reenvia o convite de definição de senha (mesmo fluxo de `criarUsuario`,
 * sem recriar o usuário) — usado quando o e-mail original falhou ou o
 * usuário perdeu o link.
 */
export async function reenviarConvite(p: PayloadUsuarios, id: string): Promise<ResultadoEscrita> {
  const res = await p.find({
    collection: "users",
    limit: 200,
    depth: 0,
    sort: "nome",
    overrideAccess: true,
  });
  const alvo = res.docs.find((u) => String(u.id) === id);
  if (!alvo) return { ok: false, erro: "Usuário não encontrado." };

  try {
    const token = await p.forgotPassword({
      collection: "users",
      data: { email: alvo.email },
      disableEmail: true,
    });
    await p.sendEmail({
      to: alvo.email,
      subject: "Bem-vindo(a) ao Painel Admin NTC",
      html: emailBoasVindasHtml({ nome: alvo.nome, token: token ?? "" }),
    });
    return { ok: true };
  } catch (e) {
    console.error("[reenviarConvite]", e);
    return { ok: false, erro: "Não foi possível reenviar o convite. Tente novamente." };
  }
}

const MSG_ULTIMO_ADMIN = "Não é possível remover o último administrador.";
const MSG_NAO_ENCONTRADO = "Usuário não encontrado.";

// Até 15 dígitos: acima disso `Number` perde precisão. O adapter converte "02"/" 2" em 2,
// então só o id canônico passa — senão uma guarda por igualdade de string seria contornada.
const idValido = (v: unknown): v is string => typeof v === "string" && /^[1-9]\d{0,14}$/.test(v);

/** Busca o alvo e diz se ele é administrador e se é o único. `null` = não existe. */
async function situacaoDoAlvo(
  p: PayloadUsuarios,
  id: string,
): Promise<{ administrador: boolean; unico: boolean } | null> {
  const alvo = await p.findByID({ collection: "users", id, depth: 0, overrideAccess: true });
  if (!alvo) return null;
  const administrador = alvo.administrador === true;
  if (!administrador) return { administrador, unico: false };
  const { totalDocs } = await p.count({
    collection: "users",
    where: { administrador: { equals: true } },
    overrideAccess: true,
  });
  return { administrador, unico: totalDocs <= 1 };
}

export async function editarUsuario(
  p: PayloadUsuarios,
  id: string,
  dados: { nome: string; administrador: boolean; telas: TelaPainel[] },
  autorId: string,
): Promise<ResultadoEscrita> {
  if (!idValido(id)) return { ok: false, erro: MSG_NAO_ENCONTRADO };
  if (dados.nome.trim() === "") return { ok: false, erro: "Informe o nome." };
  const administrador = dados.administrador === true;
  if (!administrador && id === autorId) {
    return { ok: false, erro: "Você não pode tirar o seu próprio acesso de administrador." };
  }
  try {
    const alvo = await situacaoDoAlvo(p, id);
    if (!alvo) return { ok: false, erro: MSG_NAO_ENCONTRADO };
    // Desmarcar o último administrador deixaria o painel sem quem gerencie usuários.
    if (!administrador && alvo.administrador && alvo.unico) {
      return { ok: false, erro: MSG_ULTIMO_ADMIN };
    }
    await p.update({
      collection: "users",
      id,
      data: {
        nome: dados.nome.trim(),
        administrador,
        telas: acessoDoUsuario({ telas: dados.telas }).telas,
      },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    console.error("[editarUsuario]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}

export async function removerUsuario(
  p: PayloadUsuarios,
  id: string,
  autorId: string,
): Promise<ResultadoEscrita> {
  if (!idValido(id)) return { ok: false, erro: MSG_NAO_ENCONTRADO };
  if (id === autorId) {
    return { ok: false, erro: "Você não pode remover a si mesmo." };
  }
  try {
    const alvo = await situacaoDoAlvo(p, id);
    if (!alvo) return { ok: false, erro: MSG_NAO_ENCONTRADO };
    if (alvo.administrador && alvo.unico) return { ok: false, erro: MSG_ULTIMO_ADMIN };
    await p.delete({ collection: "users", id, overrideAccess: true });
    return { ok: true };
  } catch (e) {
    console.error("[removerUsuario]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
