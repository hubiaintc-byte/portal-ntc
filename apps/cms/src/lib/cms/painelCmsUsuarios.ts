import "server-only";

import { randomInt } from "node:crypto";

import { emailBoasVindasHtml } from "@/lib/emailsCms";

import type { ResultadoEscrita } from "./painelCmsEscrita";

/**
 * Gestão de usuários do Painel Admin (tela "Usuários", só super-admin).
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

export interface UsuarioCmsResumo {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  atualizadoEm: string;
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
    docs: { id: string | number; nome: string; email: string; perfil: string; updatedAt: string }[];
  }>;
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

export async function listarUsuarios(p: PayloadUsuarios): Promise<UsuarioCmsResumo[]> {
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
    perfil: u.perfil,
    atualizadoEm: u.updatedAt,
  }));
}

export async function criarUsuario(
  p: PayloadUsuarios,
  dados: { nome: string; email: string; perfil: string },
): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "" || dados.email.trim() === "") {
    return { ok: false, erro: "Informe nome e e-mail." };
  }

  try {
    await p.create({
      collection: "users",
      data: {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        perfil: dados.perfil,
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
  // só perde o convite automático (o super-admin pode reenviar depois via
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
  }

  return { ok: true };
}

export async function editarUsuario(
  p: PayloadUsuarios,
  id: string,
  dados: { nome: string; perfil: string },
): Promise<ResultadoEscrita> {
  if (dados.nome.trim() === "") return { ok: false, erro: "Informe o nome." };
  try {
    await p.update({
      collection: "users",
      id,
      data: { nome: dados.nome.trim(), perfil: dados.perfil },
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
  idSolicitante: string,
): Promise<ResultadoEscrita> {
  if (id === idSolicitante) {
    return { ok: false, erro: "Você não pode remover a si mesmo." };
  }
  try {
    const todos = await p.find({
      collection: "users",
      limit: 200,
      depth: 0,
      sort: "nome",
      overrideAccess: true,
    });
    const alvo = todos.docs.find((u) => String(u.id) === id);
    if (alvo?.perfil === "super-admin") {
      const superAdmins = todos.docs.filter((u) => u.perfil === "super-admin");
      if (superAdmins.length <= 1) {
        return { ok: false, erro: "Não é possível remover o último super-administrador." };
      }
    }
    await p.delete({ collection: "users", id, overrideAccess: true });
    return { ok: true };
  } catch (e) {
    console.error("[removerUsuario]", e);
    return { ok: false, erro: ERRO_GENERICO };
  }
}
