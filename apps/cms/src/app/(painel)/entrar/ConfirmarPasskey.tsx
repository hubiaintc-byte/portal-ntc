"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";

import { verificarAutenticacaoPasskey, type EstadoLogin } from "../acoesAuth";

interface ConfirmarPasskeyProps {
  precisaPasskey: NonNullable<EstadoLogin["precisaPasskey"]>;
}

/**
 * Segunda etapa do login — aparece só quando `entrar()` já validou a
 * senha e o usuário tem passkey cadastrado. A cerimônia do navegador
 * (Touch ID etc.) só dispara com um clique explícito do usuário, não
 * automaticamente ao montar (mais previsível entre navegadores).
 */
export function ConfirmarPasskey({ precisaPasskey }: ConfirmarPasskeyProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  async function confirmar() {
    setErro(null);
    setConfirmando(true);
    try {
      const resposta = await startAuthentication({ optionsJSON: precisaPasskey.opcoesAutenticacao });
      const resultado = await verificarAutenticacaoPasskey(precisaPasskey.tokenPendente, resposta);
      if (resultado.erro) setErro(resultado.erro);
      // sucesso: verificarAutenticacaoPasskey já chama redirect("/") no servidor.
    } catch {
      setErro("Não foi possível confirmar com o passkey. Tente novamente.");
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="pcms-login__form">
      <h1 className="pcms-login__titulo">Confirme sua identidade</h1>
      <p className="pcms-login__subtitulo">Use o passkey cadastrado neste dispositivo (Touch ID, Windows Hello etc.).</p>
      {erro ? (
        <p className="pcms-login__erro" role="alert">
          {erro}
        </p>
      ) : null}
      <button type="button" className="pcms-login__entrar" onClick={confirmar} disabled={confirmando}>
        {confirmando ? "Confirmando…" : "Confirmar com passkey"}
      </button>
    </div>
  );
}
