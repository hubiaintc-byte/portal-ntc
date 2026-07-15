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
import { ShellPainel, type GrupoNav } from "./shell/ShellPainel";
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
  // true ⇒ o detalhe abre direto em edição (revisão pós-importação de PDF).
  const [eventoEmEdicao, setEventoEmEdicao] = useState(false);
  const [palestranteDet, setPalestranteDet] = useState<PalestranteCmsDetalhe | null>(null);
  const [leadDet, setLeadDet] = useState<LeadCmsDetalhe | null>(null);
  const [carregando, iniciarCarga] = useTransition();

  function abrirEvento(id: string, emEdicao = false) {
    iniciarCarga(async () => {
      const det = await carregarEvento(id);
      if (det) {
        setEventoDet(det);
        setEventoEmEdicao(emEdicao);
      }
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

  const detalheAberto = eventoDet ?? palestranteDet ?? leadDet;

  const grupos: GrupoNav[] = [
    { rotulo: "Editorial", itens: NAV_PRINCIPAL },
    { rotulo: "Comercial", itens: NAV_COMERCIAL },
    { rotulo: "Sistema", itens: NAV_SISTEMA },
  ];

  return (
    <ShellPainel
      modulo="site"
      usuario={usuario}
      grupos={grupos}
      telaAtiva={tela}
      onIrPara={(id) => irPara(id as TelaId)}
      breadcrumb={CRUMB[tela]}
      carregando={carregando}
    >
      {eventoDet ? (
        <DetalheEvento
          key={eventoDet.id}
          evento={eventoDet}
          palestrantesDisponiveis={palestrantes}
          edicaoInicial={eventoEmEdicao}
          onVoltar={() => {
            setEventoDet(null);
            setEventoEmEdicao(false);
          }}
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
            {tela === "eventos" && (
              <TelaEventos
                eventos={eventos}
                onAbrir={abrirEvento}
                onAbrirImportado={(id) => abrirEvento(id, true)}
              />
            )}
            {tela === "home" && <TelaHome eventos={eventos} selecionadosIniciais={eventosHomeIds} />}
            {tela === "leads" && <TelaLeads leads={leads} onAbrir={abrirLead} />}
            {tela === "config" && <TelaConfiguracoes />}
          </>
        )
      )}
    </ShellPainel>
  );
}
