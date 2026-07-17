"use client";

import Link from "next/link";
import { useActionState } from "react";

import { solicitarRecuperacao, type EstadoLogin } from "../../acoesAuth";

/** Formulário do "esqueci minha senha" — resposta sempre genérica. */
export function FormRecuperar() {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(
    solicitarRecuperacao,
    null,
  );

  return (
    <form className="pcms-login__form" action={agir}>
      <h1 className="pcms-login__titulo">Recuperar acesso</h1>
      <p className="pcms-login__subtitulo">
        Informe o e-mail da sua conta. Enviaremos um link para redefinir a senha.
      </p>

      <label className="pcms-login__label" htmlFor="rec-email">
        E-mail
      </label>
      <input
        id="rec-email"
        name="email"
        type="email"
        className="pcms-login__campo"
        autoComplete="email"
        required
      />

      {estado?.erro ? (
        <p className="pcms-login__erro" role="alert">
          {estado.erro}
        </p>
      ) : null}
      {estado?.ok ? (
        <p className="pcms-login__ok" role="status">
          {estado.ok}
        </p>
      ) : null}

      <button type="submit" className="pcms-login__entrar" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar link de redefinição"}
      </button>

      <p className="pcms-login__voltar">
        <Link href="/entrar">Voltar ao login</Link>
      </p>
    </form>
  );
}
