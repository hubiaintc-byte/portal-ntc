"use client";

import { useState } from "react";

import type { LivroFinanceiro } from "@ntc/lib";

import { mostraModuloCrm, navFinVisivel, telaInicialFin, type TelaFinId } from "@/lib/cms/navegacao";
import type { AcessoPainel, CapacidadesPainel } from "@/lib/cms/telas";

import { ShellPainel, type GrupoNav } from "../shell/ShellPainel";
import { RaizFin05Contexto } from "./ui/PortalFin05";

/**
 * Casco do módulo Financeiro (spec §3.3): a moldura é a do painel
 * (`ShellPainel`, seletor Site | CRM | Financeiro) e o conteúdo vive dentro de
 * `.fin05`, com os estilos do protótipo FIN-05. A navegação é por estado, como
 * no `ShellCrm`: a tela ativa e, em Eventos, o evento aberto e a aba.
 *
 * Contrato com as telas (Tasks 12–17): cada uma recebe `PropsTelaFin` —
 * `livro`, `hojeISO`, `capacidades`, `acesso` e `irPara(tela, extra?)`.
 */

/** Abas da área do evento, na ordem do protótipo (`WS_TABS`), sem Comissões. */
export type AbaEvento = "visao" | "receitas" | "custos" | "faturamento" | "pagamentos" | "resultado";

/** O que uma navegação pode levar além da tela. */
export interface ExtraNavegacao {
  /** Em Eventos: abre a área deste evento (sem ele, a lista). */
  eventoId?: string;
  /** Aba da área do evento (padrão `visao`). */
  aba?: AbaEvento;
  /** Filtros iniciais da tela de destino (ex.: `{ status: "Em execução" }` na lista de Eventos). */
  filtros?: Record<string, string>;
}

export type EstadoTelaFin =
  | { tela: "visao" }
  | { tela: "eventos"; eventoId?: string; aba: AbaEvento; filtros?: Record<string, string> }
  | { tela: "receber"; filtros?: Record<string, string> }
  | { tela: "pagar"; filtros?: Record<string, string> };

export type IrParaFin = (tela: TelaFinId, extra?: ExtraNavegacao) => void;

/** Props comuns de toda tela do Financeiro. */
export interface PropsTelaFin {
  livro: LivroFinanceiro;
  /** Data civil de Brasília (`AAAA-MM-DD`), calculada no servidor. */
  hojeISO: string;
  capacidades: CapacidadesPainel;
  acesso: AcessoPainel;
  irPara: IrParaFin;
}

interface ShellFinanceiroProps {
  usuario: { nome: string; email: string };
  acesso: AcessoPainel;
  capacidades: CapacidadesPainel;
  /** Já recortado por tela no servidor (`recortarLivroPorTela`). */
  livro: LivroFinanceiro;
  hojeISO: string;
  erroLeitura: boolean;
}

/* Ícones do menu: os do protótipo (home, calendar, inn, out) no traço do painel. */
const Ico = {
  visao: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  ),
  eventos: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  ),
  receber: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  ),
  pagar: (
    <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </svg>
  ),
};

/** Rótulos do menu `Ambientes` do protótipo. */
const ROTULO: Record<TelaFinId, string> = {
  visao: "Visão Executiva",
  eventos: "Eventos e Projetos",
  receber: "Receber",
  pagar: "Pagar",
};

function estadoDe(tela: TelaFinId, extra?: ExtraNavegacao): EstadoTelaFin {
  switch (tela) {
    case "visao":
      return { tela };
    case "eventos":
      return { tela, eventoId: extra?.eventoId, aba: extra?.aba ?? "visao", filtros: extra?.filtros };
    case "receber":
    case "pagar":
      return { tela, filtros: extra?.filtros };
  }
}

/**
 * Placeholder desta task; cada tela entra no lugar dela nas Tasks 12–17 e já
 * recebe o contrato completo (`PropsTelaFin`).
 */
function EmConstrucao({ titulo }: PropsTelaFin & { titulo: string }) {
  return (
    <div className="page-head">
      <div className="ph-text">
        <div className="eyebrow">Financeiro</div>
        <h1 className="page-title">{titulo}</h1>
        <p className="page-sub">[em construção]</p>
      </div>
    </div>
  );
}

export function ShellFinanceiro({ usuario, acesso, capacidades, livro, hojeISO, erroLeitura }: ShellFinanceiroProps) {
  const visiveis = navFinVisivel(acesso);
  const [estado, setEstado] = useState<EstadoTelaFin>(() => estadoDe(telaInicialFin(acesso)));
  // Raiz `.fin05` para os portais das camadas fixas (gaveta, menus, toasts).
  const [raiz, setRaiz] = useState<HTMLDivElement | null>(null);

  const irPara: IrParaFin = (tela, extra) => {
    // Tela que a pessoa não tem não abre (o menu já não a mostra; isto
    // cobre os atalhos internos, ex.: um link de Receber na Visão Executiva).
    if (!visiveis.includes(tela)) return;
    setEstado(estadoDe(tela, extra));
    window.scrollTo({ top: 0 });
  };

  const grupos: GrupoNav[] = [
    {
      rotulo: "Ambientes",
      itens: visiveis.map((id) => ({ id, rotulo: ROTULO[id], icone: Ico[id] })),
    },
  ].filter((g) => g.itens.length > 0);

  const eventoAberto =
    estado.tela === "eventos" && estado.eventoId ? livro.eventos.find((e) => e.id === estado.eventoId) : undefined;
  const breadcrumb = eventoAberto
    ? `Financeiro · ${ROTULO.eventos} · ${eventoAberto.nome}`
    : `Financeiro · ${ROTULO[estado.tela]}`;

  const props: PropsTelaFin = { livro, hojeISO, capacidades, acesso, irPara };

  return (
    <ShellPainel
      modulo="financeiro"
      mostrarCrm={mostraModuloCrm(acesso)}
      mostrarFinanceiro
      usuario={usuario}
      administrador={acesso.administrador}
      grupos={grupos}
      telaAtiva={estado.tela}
      onIrPara={(id) => irPara(id as TelaFinId)}
      breadcrumb={breadcrumb}
      carregando={false}
    >
      <RaizFin05Contexto.Provider value={raiz}>
      <div className="fin05" ref={setRaiz}>
        {erroLeitura && (
          <div className="form-error" role="alert">
            Não foi possível ler o banco de dados. Os números abaixo podem estar incompletos.
          </div>
        )}
        <div className="view-enter" key={`${estado.tela}:${estado.tela === "eventos" ? (estado.eventoId ?? "") : ""}`}>
          {estado.tela === "visao" && <EmConstrucao titulo={ROTULO.visao} {...props} />}
          {estado.tela === "eventos" && <EmConstrucao titulo={ROTULO.eventos} {...props} />}
          {estado.tela === "receber" && <EmConstrucao titulo={ROTULO.receber} {...props} />}
          {estado.tela === "pagar" && <EmConstrucao titulo={ROTULO.pagar} {...props} />}
        </div>
      </div>
      </RaizFin05Contexto.Provider>
    </ShellPainel>
  );
}
