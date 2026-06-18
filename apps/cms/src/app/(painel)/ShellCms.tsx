"use client";

import { useState, useTransition } from "react";

import type {
  EventoCmsDetalhe,
  EventoCmsResumo,
  LeadCmsDetalhe,
  LeadCmsResumo,
  PalestranteCmsDetalhe,
  PalestranteCmsResumo,
} from "@/lib/cms/painelCms";

import { carregarEvento, carregarLead, carregarPalestrante } from "./acoes";
import { sair } from "./acoesAuth";
import { TelaDashboard } from "./TelaDashboard";
import { TelaHome } from "./TelaHome";
import { TelaPalestrantes } from "./TelaPalestrantes";
import { TelaEventos } from "./TelaEventos";
import { TelaLeads } from "./TelaLeads";
import { TelaConfiguracoes } from "./TelaConfiguracoes";
import { DetalheEvento } from "./DetalheEvento";
import { DetalheLead } from "./DetalheLead";
import { DetalhePalestrante } from "./DetalhePalestrante";

/**
 * Casco do Painel Admin (sidebar Oxford + topbar + conteúdo).
 *
 * Estado de navegação client-side; os DADOS são reais, lidos server-side na
 * page.tsx (Local API do Payload, somente leitura) e recebidos por props.
 */

interface ShellCmsProps {
  /** Usuário autenticado (rodapé da sidebar). */
  usuario: { nome: string; email: string };
  eventos: EventoCmsResumo[];
  palestrantes: PalestranteCmsResumo[];
  leads: LeadCmsResumo[];
  eventosHomeIds: string[];
  erroLeitura: boolean;
}

type TelaId = "dashboard" | "palestrantes" | "eventos" | "home" | "leads" | "config";

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
  home: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  ),
  leads: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" />
      <path d="m3 7 9 6 9-6" />
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
  { id: "home", rotulo: "Home", icone: Ico.home },
];

const NAV_COMERCIAL: ItemNav[] = [{ id: "leads", rotulo: "Leads", icone: Ico.leads }];

const NAV_SISTEMA: ItemNav[] = [{ id: "config", rotulo: "Configurações", icone: Ico.config }];

const CRUMB: Record<TelaId, string> = {
  dashboard: "Painel",
  palestrantes: "Editorial · Palestrantes",
  eventos: "Editorial · Eventos",
  home: "Editorial · Home",
  leads: "Comercial · Leads",
  config: "Sistema · Configurações",
};

/** Iniciais para o avatar da sidebar ("Maria Souza" → "MS"). */
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase() || "NT";
}

export function ShellCms({
  usuario,
  eventos,
  palestrantes,
  leads,
  eventosHomeIds,
  erroLeitura,
}: ShellCmsProps) {
  const [tela, setTela] = useState<TelaId>("dashboard");
  const [eventoDet, setEventoDet] = useState<EventoCmsDetalhe | null>(null);
  const [palestranteDet, setPalestranteDet] = useState<PalestranteCmsDetalhe | null>(null);
  const [leadDet, setLeadDet] = useState<LeadCmsDetalhe | null>(null);
  const [carregando, iniciarCarga] = useTransition();

  function abrirEvento(id: string) {
    iniciarCarga(async () => {
      const det = await carregarEvento(id);
      if (det) setEventoDet(det);
    });
  }

  function abrirPalestrante(id: string) {
    iniciarCarga(async () => {
      const det = await carregarPalestrante(id);
      if (det) setPalestranteDet(det);
    });
  }

  function abrirLead(id: string) {
    iniciarCarga(async () => {
      const det = await carregarLead(id);
      if (det) setLeadDet(det);
    });
  }

  // Trocar de tela pela sidebar sempre fecha qualquer detalhe aberto.
  function irPara(id: TelaId) {
    setEventoDet(null);
    setPalestranteDet(null);
    setLeadDet(null);
    setTela(id);
  }

  function renderItem(item: ItemNav) {
    return (
      <button
        key={item.id}
        type="button"
        className={`pcms-nav__item${tela === item.id ? " pcms-nav__item--ativo" : ""}`}
        aria-current={tela === item.id ? "page" : undefined}
        onClick={() => irPara(item.id)}
      >
        {item.icone}
        {item.rotulo}
      </button>
    );
  }

  const detalheAberto = eventoDet ?? palestranteDet ?? leadDet;

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

        <nav className="pcms-nav" aria-label="Navegação principal do CMS">
          <div className="pcms-nav__group">
            <p className="pcms-nav__label">Editorial</p>
            {NAV_PRINCIPAL.map(renderItem)}
          </div>
          <div className="pcms-nav__group">
            <p className="pcms-nav__label">Comercial</p>
            {NAV_COMERCIAL.map(renderItem)}
          </div>
          <div className="pcms-nav__group">
            <p className="pcms-nav__label">Sistema</p>
            {NAV_SISTEMA.map(renderItem)}
          </div>
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

        <main className="pcms-content" aria-busy={carregando}>
          {carregando && <div className="pcms-carregando">Carregando…</div>}

          {eventoDet ? (
            <DetalheEvento
              evento={eventoDet}
              palestrantesDisponiveis={palestrantes}
              onVoltar={() => setEventoDet(null)}
            />
          ) : palestranteDet ? (
            <DetalhePalestrante palestrante={palestranteDet} onVoltar={() => setPalestranteDet(null)} />
          ) : leadDet ? (
            <DetalheLead lead={leadDet} onVoltar={() => setLeadDet(null)} />
          ) : (
            !detalheAberto && (
              <>
                {tela === "dashboard" && (
                  <TelaDashboard
                    eventos={eventos}
                    palestrantes={palestrantes}
                    leads={leads}
                    erroLeitura={erroLeitura}
                  />
                )}
                {tela === "palestrantes" && (
                  <TelaPalestrantes palestrantes={palestrantes} onAbrir={abrirPalestrante} />
                )}
                {tela === "eventos" && <TelaEventos eventos={eventos} onAbrir={abrirEvento} />}
                {tela === "home" && (
                  <TelaHome eventos={eventos} selecionadosIniciais={eventosHomeIds} />
                )}
                {tela === "leads" && <TelaLeads leads={leads} onAbrir={abrirLead} />}
                {tela === "config" && <TelaConfiguracoes />}
              </>
            )
          )}
        </main>
      </div>
    </div>
  );
}
