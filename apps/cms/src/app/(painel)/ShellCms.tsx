"use client";

import { useState, useTransition } from "react";

import type {
  EventoCmsDetalhe,
  EventoCmsResumo,
  LeadCmsResumo,
  PalestranteCmsDetalhe,
  PalestranteCmsResumo,
} from "@/lib/cms/painelCms";

import type { UsuarioGestaoResumo } from "@/lib/cms/painelCmsUsuarios";

import { carregarEvento, carregarPalestrante, carregarUsuarios } from "./acoes";
import { ShellPainel, type GrupoNav } from "./shell/ShellPainel";
import { TelaDashboard } from "./TelaDashboard";
import { TelaHome } from "./TelaHome";
import { TelaPalestrantes } from "./TelaPalestrantes";
import { TelaEventos } from "./TelaEventos";
import { TelaConfiguracoes } from "./TelaConfiguracoes";
import { TelaUsuarios } from "./TelaUsuarios";
import { DetalheEvento } from "./DetalheEvento";
import { DetalhePalestrante } from "./DetalhePalestrante";

/**
 * Casco do Painel Admin (sidebar Oxford + topbar + conteúdo).
 *
 * Estado de navegação client-side; os DADOS são reais, lidos server-side na
 * page.tsx (Local API do Payload, somente leitura) e recebidos por props.
 */

interface ShellCmsProps {
  /** Usuário autenticado (rodapé da sidebar + guarda do item "Usuários"). */
  usuario: { nome: string; email: string; perfil: string; id: string };
  eventos: EventoCmsResumo[];
  palestrantes: PalestranteCmsResumo[];
  leads: LeadCmsResumo[];
  eventosHomeIds: string[];
  erroLeitura: boolean;
}

type TelaId = "dashboard" | "palestrantes" | "eventos" | "home" | "config" | "usuarios";

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
  config: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  ),
  usuarios: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8.5" cy="7.5" r="3" />
      <path d="M2.5 19.5c0-3.1 2.4-5.5 6-5.5s6 2.4 6 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.8 14.3c2.6.4 4.7 2.3 4.7 5.2" />
    </svg>
  ),
};

const NAV_PRINCIPAL: ItemNav[] = [
  { id: "dashboard", rotulo: "Painel", icone: Ico.painel },
  { id: "palestrantes", rotulo: "Palestrantes", icone: Ico.palestrantes },
  { id: "eventos", rotulo: "Eventos", icone: Ico.eventos },
  { id: "home", rotulo: "Home", icone: Ico.home },
];

const CRUMB: Record<TelaId, string> = {
  dashboard: "Painel",
  palestrantes: "Editorial · Palestrantes",
  eventos: "Editorial · Eventos",
  home: "Editorial · Home",
  config: "Sistema · Configurações",
  usuarios: "Sistema · Usuários",
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
  const [carregando, iniciarCarga] = useTransition();

  const ehSuperAdmin = usuario.perfil === "super-admin";

  // Lista de usuários NUNCA vem no payload inicial da page.tsx (evitaria
  // enviar dados de gestão de usuários a quem não é super-admin) — carrega
  // sob demanda quando a tela "Usuários" é aberta pela primeira vez.
  const [usuarios, setUsuarios] = useState<UsuarioGestaoResumo[]>([]);
  const [usuariosCarregados, setUsuariosCarregados] = useState(false);
  const [carregandoUsuarios, iniciarCargaUsuarios] = useTransition();

  function abrirUsuarios() {
    if (usuariosCarregados) return;
    iniciarCargaUsuarios(async () => {
      const lista = await carregarUsuarios();
      setUsuarios(lista);
      setUsuariosCarregados(true);
    });
  }

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

  // Trocar de tela pela sidebar sempre fecha qualquer detalhe aberto.
  function irPara(id: TelaId) {
    setEventoDet(null);
    setPalestranteDet(null);
    setTela(id);
    if (id === "usuarios") abrirUsuarios();
  }

  const detalheAberto = eventoDet ?? palestranteDet;

  const navSistema: ItemNav[] = ehSuperAdmin
    ? [
        { id: "config", rotulo: "Configurações", icone: Ico.config },
        { id: "usuarios", rotulo: "Usuários", icone: Ico.usuarios },
      ]
    : [{ id: "config", rotulo: "Configurações", icone: Ico.config }];

  const grupos: GrupoNav[] = [
    { rotulo: "Editorial", itens: NAV_PRINCIPAL },
    { rotulo: "Sistema", itens: navSistema },
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
            {tela === "config" && <TelaConfiguracoes usuario={usuario} />}
            {tela === "usuarios" && ehSuperAdmin && (
              <TelaUsuarios
                usuarios={usuarios}
                usuarioAtualId={usuario.id}
                carregando={carregandoUsuarios}
                onUsuariosAtualizados={(lista) => {
                  setUsuarios(lista);
                  setUsuariosCarregados(true);
                }}
              />
            )}
          </>
        )
      )}
    </ShellPainel>
  );
}
