"use client";

import { useRef, useState } from "react";

import { cancelarInscricaoLocal } from "@/lib/avisos/navegador";

import { sair } from "../acoesAuth";
import { SeletorModulo } from "./SeletorModulo";

import type { ModuloPainel } from "@/lib/cms/telas";

export type { ModuloPainel };

/** Tempo máximo que o "Sair" espera o navegador cancelar a inscrição dos avisos. */
const ESPERA_DESINSCRICAO_MS = 2000;

export interface ItemNavPainel {
  id: string;
  rotulo: string;
  icone: React.ReactNode;
}

export interface GrupoNav {
  rotulo: string;
  itens: ItemNavPainel[];
}

interface ShellPainelProps {
  modulo: ModuloPainel;
  /** O seletor mostra o CRM só com alguma tela `crm.*`; o Site aparece sempre (Minha conta). */
  mostrarCrm: boolean;
  /** O seletor mostra o Financeiro só com alguma tela `fin.*`. */
  mostrarFinanceiro: boolean;
  usuario: { nome: string; email: string };
  /** Rótulo do rodapé da sidebar: "Administrador" ou "Equipe". */
  administrador: boolean;
  grupos: GrupoNav[];
  telaAtiva: string;
  onIrPara: (id: string) => void;
  breadcrumb: string;
  carregando: boolean;
  children: React.ReactNode;
}

/** Iniciais para o avatar da sidebar ("Maria Souza" → "MS"). */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "NT";
}

/**
 * Casco visual compartilhado do Portal Admin (sidebar Oxford + topbar +
 * conteúdo) — usado pelos módulos Site (/) e CRM (/crm). O seletor de módulo
 * navega por rota real; a navegação interna de cada módulo é client-side.
 */
export function ShellPainel({
  modulo,
  mostrarCrm,
  mostrarFinanceiro,
  usuario,
  administrador,
  grupos,
  telaAtiva,
  onIrPara,
  breadcrumb,
  carregando,
  children,
}: ShellPainelProps) {
  const formSair = useRef<HTMLFormElement>(null);
  const campoEndpoint = useRef<HTMLInputElement>(null);
  /** O passo do navegador já rodou: o próximo envio segue direto para a action. */
  const prontoParaSair = useRef(false);
  const [saindo, setSaindo] = useState(false);

  /**
   * "Sair" desinscreve este aparelho dos avisos (aparelho compartilhado não
   * segue recebendo depois do logout). No navegador só cancela a inscrição
   * local, com tempo-limite, e põe o endpoint no campo oculto; quem apaga a
   * inscrição no banco é a própria action `sair`, ainda com a sessão válida.
   * Nenhuma outra Server Action roda no logout, e se o JS falhar antes do
   * `preventDefault` a action segue sozinha.
   */
  function sairDesinscrevendo(e: React.FormEvent<HTMLFormElement>) {
    if (prontoParaSair.current) return;
    e.preventDefault();
    if (saindo) return;
    setSaindo(true);
    void cancelarInscricaoLocal(ESPERA_DESINSCRICAO_MS)
      .catch(() => null)
      .then((endpoint) => {
        if (campoEndpoint.current) campoEndpoint.current.value = endpoint ?? "";
        prontoParaSair.current = true;
        const form = formSair.current;
        // Safari < 16 não tem requestSubmit: chama a action direto.
        if (form && typeof form.requestSubmit === "function") form.requestSubmit();
        else void sair(form ? new FormData(form) : undefined);
        // requestSubmit despacha o submit na hora; a marca só valia para ele.
        prontoParaSair.current = false;
      });
  }

  return (
    <div className="pcms-root">
      <aside className="pcms-sidebar">
        <div className="pcms-sidebar__brand">
          {/* Logo institucional com fundo transparente (decisão do PO em 17/07). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-ntc.svg" alt="Grupo NTC" className="pcms-sidebar__logo" />
          <span className="pcms-sidebar__painel-rotulo">Painel Admin</span>
        </div>

        <SeletorModulo modulo={modulo} mostrarCrm={mostrarCrm} mostrarFinanceiro={mostrarFinanceiro} />

        <nav className="pcms-nav" aria-label="Navegação principal do painel">
          {grupos.map((grupo) => (
            <div key={grupo.rotulo} className="pcms-nav__group">
              <p className="pcms-nav__label">{grupo.rotulo}</p>
              {grupo.itens.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`pcms-nav__item${telaAtiva === item.id ? " pcms-nav__item--ativo" : ""}`}
                  aria-current={telaAtiva === item.id ? "page" : undefined}
                  onClick={() => onIrPara(item.id)}
                >
                  {item.icone}
                  {item.rotulo}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pcms-sidebar__usuario">
          <div className="pcms-avatar-mini">{iniciais(usuario.nome)}</div>
          <div className="pcms-sidebar__usuario-info">
            <strong>{usuario.nome}</strong>
            <span className="pcms-sidebar__perfil">{administrador ? "Administrador" : "Equipe"}</span>
          </div>
          <form ref={formSair} action={sair} onSubmit={sairDesinscrevendo} className="pcms-sair__form">
            <input ref={campoEndpoint} type="hidden" name="endpoint" defaultValue="" />
            <button type="submit" className="pcms-sair" aria-label="Sair da sessão" title="Sair" disabled={saindo}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4H5v16h4" />
                <path d="m14 8 4 4-4 4" />
                <path d="M18 12H9" />
              </svg>
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="pcms-main">
        <header className="pcms-topbar">
          <div className="pcms-topbar__crumb">
            Grupo NTC · <b>{breadcrumb}</b>
          </div>
          <label className="pcms-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Buscar no portal…" aria-label="Buscar" />
          </label>
        </header>

        <main className="pcms-content" aria-busy={carregando}>
          {carregando && <div className="pcms-carregando">Carregando…</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
