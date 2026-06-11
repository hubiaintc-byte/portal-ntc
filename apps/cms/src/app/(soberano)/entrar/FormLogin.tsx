"use client";

import { useActionState } from "react";

import { entrar, type EstadoLogin } from "../acoesAuth";

/** Formulário de login — invoca a Server Action `entrar` com estado de erro. */
export function FormLogin() {
  const [estado, agir, enviando] = useActionState<EstadoLogin | null, FormData>(entrar, null);

  return (
    <form className="pcms-login__form" action={agir}>
      <h1 className="pcms-login__titulo">Acesso restrito</h1>
      <p className="pcms-login__subtitulo">Entre com as credenciais da equipe editorial.</p>

      <label className="pcms-login__label" htmlFor="login-email">
        E-mail
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        className="pcms-login__campo"
        autoComplete="email"
        required
      />

      <label className="pcms-login__label" htmlFor="login-senha">
        Senha
      </label>
      <input
        id="login-senha"
        name="senha"
        type="password"
        className="pcms-login__campo"
        autoComplete="current-password"
        required
      />

      <label className="pcms-login__manter">
        <input type="checkbox" name="manter" />
        Manter sessão iniciada
      </label>

      {estado?.erro ? (
        <p className="pcms-login__erro" role="alert">
          {estado.erro}
        </p>
      ) : null}

      <button type="submit" className="pcms-login__entrar" disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
