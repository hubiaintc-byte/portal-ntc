"use client";

import { useEffect, useState } from "react";

import {
  desinscreverEsteAparelho,
  estaInstalado,
  inscreverEsteAparelho,
  plataforma,
  suportaAvisos,
} from "@/lib/avisos/navegador";

import { ativarAvisosCms, chaveAvisosCms } from "./acoesAuth";

const MSG_BLOQUEADO = "Os avisos estão bloqueados nas configurações do navegador para este site.";
const MSG_IOS = "No iPhone, instale o Painel NTC na Tela de Início para receber avisos.";
const MSG_FALHA = "Não foi possível ativar os avisos neste aparelho.";

type Estado =
  | { tipo: "verificando" }
  | { tipo: "oculto" }
  | { tipo: "ios-fora-do-app" }
  | { tipo: "bloqueado" }
  | { tipo: "pronto"; ativo: boolean; chave: string };

/**
 * Avisos de lead novo (web push) neste aparelho — Configurações → Minha
 * conta. Não aparece se o recurso não está configurado no servidor (sem
 * chave VAPID) ou se o navegador não suporta push (fora do iOS, onde a
 * orientação é instalar o app).
 */
export function AvisosDoAparelho() {
  const [estado, setEstado] = useState<Estado>({ tipo: "verificando" });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    async function verificar(): Promise<Estado> {
      const chave = await chaveAvisosCms();
      if (!chave) return { tipo: "oculto" };
      if (!suportaAvisos()) {
        return plataforma() === "ios" && !estaInstalado() ? { tipo: "ios-fora-do-app" } : { tipo: "oculto" };
      }
      if (Notification.permission === "denied") return { tipo: "bloqueado" };
      const registro = await navigator.serviceWorker.getRegistration("/");
      const inscricao = await registro?.pushManager.getSubscription();
      return { tipo: "pronto", ativo: Boolean(inscricao), chave };
    }
    verificar()
      .then((e) => {
        if (vivo) setEstado(e);
      })
      .catch(() => {
        if (vivo) setEstado({ tipo: "oculto" });
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function ativar(chave: string) {
    setErro(null);
    setOcupado(true);
    try {
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        if (permissao === "denied") setEstado({ tipo: "bloqueado" });
        return;
      }
      const inscricao = await inscreverEsteAparelho(chave);
      const p256dh = inscricao.keys?.p256dh;
      const auth = inscricao.keys?.auth;
      if (!inscricao.endpoint || !p256dh || !auth) {
        setErro(MSG_FALHA);
        return;
      }
      const r = await ativarAvisosCms({
        endpoint: inscricao.endpoint,
        p256dh,
        auth,
        aparelho: navigator.userAgent.slice(0, 200),
      });
      if (!r.ok) {
        setErro(r.erro ?? MSG_FALHA);
        return;
      }
      setEstado({ tipo: "pronto", ativo: true, chave });
    } catch {
      setErro(MSG_FALHA);
    } finally {
      setOcupado(false);
    }
  }

  async function desativar(chave: string) {
    setErro(null);
    setOcupado(true);
    try {
      await desinscreverEsteAparelho();
      setEstado({ tipo: "pronto", ativo: false, chave });
    } catch {
      setErro("Não foi possível desativar os avisos neste aparelho.");
    } finally {
      setOcupado(false);
    }
  }

  if (estado.tipo === "verificando" || estado.tipo === "oculto") return null;

  return (
    <>
      <hr className="pcms-editor__hr" />
      <h4>Avisos de lead novo</h4>
      {estado.tipo === "ios-fora-do-app" ? (
        <p className="pcms-form-aviso" role="status">
          {MSG_IOS}
        </p>
      ) : estado.tipo === "bloqueado" ? (
        <p className="pcms-form-aviso" role="status">
          {MSG_BLOQUEADO}
        </p>
      ) : (
        <>
          {erro ? (
            <p className="pcms-login__erro" role="alert">
              {erro}
            </p>
          ) : null}
          <button
            type="button"
            className="pcms-btn"
            disabled={ocupado}
            onClick={() => (estado.ativo ? desativar(estado.chave) : ativar(estado.chave))}
          >
            {ocupado && !estado.ativo
              ? "Ativando…"
              : estado.ativo
                ? "Desativar avisos neste aparelho"
                : "Ativar avisos neste aparelho"}
          </button>
        </>
      )}
    </>
  );
}
