"use client";

import Link from "next/link";

import { sair } from "../acoesAuth";

export type ModuloPainel = "site" | "crm";

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
  usuario: { nome: string; email: string };
  grupos: GrupoNav[];
  telaAtiva: string;
  onIrPara: (id: string) => void;
  breadcrumb: string;
  carregando: boolean;
  children: React.ReactNode;
}

const MODULOS: { id: ModuloPainel; rotulo: string; href: string }[] = [
  { id: "site", rotulo: "Site", href: "/" },
  { id: "crm", rotulo: "CRM", href: "/crm" },
];

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
  usuario,
  grupos,
  telaAtiva,
  onIrPara,
  breadcrumb,
  carregando,
  children,
}: ShellPainelProps) {
  return (
    <div className="pcms-root">
      <aside className="pcms-sidebar">
        <div className="pcms-sidebar__brand">
          {/* Logo NTC simplificado para a sidebar escura (lockup vertical). */}
          <svg
            className="pcms-sidebar__logo"
            viewBox="0 0 80 80"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="6" y="20" width="14" height="40" rx="2" fill="#B5995A" />
            <text
              x="44"
              y="54"
              textAnchor="middle"
              fontFamily="Georgia, serif"
              fontSize="34"
              fontWeight="600"
              fill="#F4EFE6"
            >
              N
            </text>
          </svg>
          <div className="pcms-sidebar__wordmark">
            <strong>Grupo NTC</strong>
            <span>Painel Admin</span>
          </div>
        </div>

        <div className="pcms-modulos" role="navigation" aria-label="Módulos do portal">
          {MODULOS.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className={`pcms-modulos__opcao${modulo === m.id ? " pcms-modulos__opcao--ativa" : ""}`}
              aria-current={modulo === m.id ? "page" : undefined}
            >
              {m.rotulo}
            </Link>
          ))}
        </div>

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

        <div className="pcms-sidebar__foot">
          <div className="pcms-avatar-mini">{iniciais(usuario.nome)}</div>
          <div>
            <strong>{usuario.nome}</strong>
            <span>{usuario.email}</span>
          </div>
          <form action={sair} className="pcms-sair__form">
            <button type="submit" className="pcms-sair" aria-label="Sair da sessão" title="Sair">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 4H5v16h4" />
                <path d="m14 8 4 4-4 4" />
                <path d="M18 12H9" />
              </svg>
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
