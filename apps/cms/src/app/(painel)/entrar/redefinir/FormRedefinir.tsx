"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SENHA_MINIMO } from "@/lib/validarNovaSenha";

import { redefinirSenha, type EstadoLogin } from "../../acoesAuth";

interface FormRedefinirProps {
  token: string;
  /** true quando veio do convite de novo usuário (novo=1). */
  boasVindas: boolean;
}

/** Formulário de nova senha — reset e primeira definição (boas-vindas). */
export function FormRedefinir({ token, boasVindas }: FormRedefinirProps) {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(
    redefinirSenha,
    null,
  );

  return (
    <form className="pcms-login__form" action={agir}>
      <h1 className="pcms-login__titulo">
        {boasVindas ? "Bem-vindo(a) — defina sua senha" : "Definir nova senha"}
      </h1>
      <p className="pcms-login__subtitulo">
        {boasVindas
          ? `Escolha a senha do seu acesso ao Painel Admin (mínimo de ${SENHA_MINIMO} caracteres).`
          : `Escolha uma senha nova com pelo menos ${SENHA_MINIMO} caracteres.`}
      </p>

      <input type="hidden" name="token" value={token} />

      <label className="pcms-login__label" htmlFor="red-senha">
        Nova senha
      </label>
      <input
        id="red-senha"
        name="senha"
        type="password"
        className="pcms-login__campo"
        autoComplete="new-password"
        minLength={SENHA_MINIMO}
        required
      />

      <label className="pcms-login__label" htmlFor="red-confirmacao">
        Confirmar nova senha
      </label>
      <input
        id="red-confirmacao"
        name="confirmacao"
        type="password"
        className="pcms-login__campo"
        autoComplete="new-password"
        minLength={SENHA_MINIMO}
        required
      />

      {estado?.erro ? (
        <p className="pcms-login__erro" role="alert">
          {estado.erro}{" "}
          <Link href="/entrar/recuperar">Solicitar novo link</Link>
        </p>
      ) : null}

      <button type="submit" className="pcms-login__entrar" disabled={enviando || !token}>
        {enviando ? "Salvando…" : "Salvar senha e entrar"}
      </button>

      {!token && (
        <p className="pcms-login__erro" role="alert">
          Link incompleto. <Link href="/entrar/recuperar">Solicite uma nova redefinição.</Link>
        </p>
      )}
    </form>
  );
}
