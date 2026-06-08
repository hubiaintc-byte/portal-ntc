"use client";

import { useState } from "react";

import type { EventoCmsResumo, PalestranteCmsResumo } from "@/lib/cms/prototipoCms";

import { TelaDashboard } from "./TelaDashboard";
import { TelaPalestrantes } from "./TelaPalestrantes";
import { TelaEventos } from "./TelaEventos";
import { TelaConfiguracoes } from "./TelaConfiguracoes";

/**
 * Casco do protótipo de CMS Soberana (sidebar Oxford + topbar + conteúdo).
 *
 * Estado de navegação client-side; os DADOS são reais, lidos server-side na
 * page.tsx (Local API do Payload, somente leitura) e recebidos por props.
 */

interface ShellCmsProps {
  eventos: EventoCmsResumo[];
  palestrantes: PalestranteCmsResumo[];
  erroLeitura: boolean;
}

type TelaId = "dashboard" | "palestrantes" | "eventos" | "config";

interface ItemNav {
  id: TelaId;
  rotulo: string;
  icone: React.ReactNode;
}

/* Ícones lineares funcionais, peso 1.5 (CLAUDE.md §3). */
const Ico = {
  painel: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  palestrantes: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.4" />
      <path d="M17 14.8c2.4.6 4 2.6 4 5.2" />
    </svg>
  ),
  eventos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  ),
  config: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  ),
};

const NAV_PRINCIPAL: ItemNav[] = [
  { id: "dashboard", rotulo: "Painel", icone: Ico.painel },
  { id: "palestrantes", rotulo: "Palestrantes", icone: Ico.palestrantes },
  { id: "eventos", rotulo: "Eventos", icone: Ico.eventos },
];

const NAV_SISTEMA: ItemNav[] = [{ id: "config", rotulo: "Configurações", icone: Ico.config }];

const CRUMB: Record<TelaId, string> = {
  dashboard: "Painel",
  palestrantes: "Editorial · Palestrantes",
  eventos: "Editorial · Eventos",
  config: "Sistema · Configurações",
};

export function ShellCms({ eventos, palestrantes, erroLeitura }: ShellCmsProps) {
  const [tela, setTela] = useState<TelaId>("dashboard");

  function renderItem(item: ItemNav) {
    return (
      <button
        key={item.id}
        type="button"
        className={`pcms-nav__item${tela === item.id ? " pcms-nav__item--ativo" : ""}`}
        aria-current={tela === item.id ? "page" : undefined}
        onClick={() => setTela(item.id)}
      >
        {item.icone}
        {item.rotulo}
      </button>
    );
  }

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
            <span>Painel Soberano</span>
          </div>
        </div>

        <nav className="pcms-nav" aria-label="Navegação principal do CMS">
          <div className="pcms-nav__group">
            <p className="pcms-nav__label">Editorial</p>
            {NAV_PRINCIPAL.map(renderItem)}
          </div>
          <div className="pcms-nav__group">
            <p className="pcms-nav__label">Sistema</p>
            {NAV_SISTEMA.map(renderItem)}
          </div>
        </nav>

        <div className="pcms-sidebar__foot">
          <div className="pcms-avatar-mini">EN</div>
          <div>
            <strong>Equipe NTC</strong>
            <span>contato@institutontc.com.br</span>
          </div>
        </div>
      </aside>

      <div className="pcms-main">
        <header className="pcms-topbar">
          <div className="pcms-topbar__crumb">
            Grupo NTC · <b>{CRUMB[tela]}</b>
          </div>
          <label className="pcms-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Buscar no portal…" aria-label="Buscar" />
          </label>
        </header>

        <main className="pcms-content">
          {tela === "dashboard" && (
            <TelaDashboard
              eventos={eventos}
              palestrantes={palestrantes}
              erroLeitura={erroLeitura}
            />
          )}
          {tela === "palestrantes" && <TelaPalestrantes palestrantes={palestrantes} />}
          {tela === "eventos" && <TelaEventos eventos={eventos} />}
          {tela === "config" && <TelaConfiguracoes />}
        </main>
      </div>
    </div>
  );
}
