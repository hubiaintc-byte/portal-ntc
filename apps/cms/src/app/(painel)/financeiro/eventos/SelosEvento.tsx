"use client";

import type { AlertaFin, EventoFin } from "@ntc/lib";

import { Icone } from "../ui/Icone";
import { CLASSE_VERTICAL, ChipVertical, Selo, SeloStatus } from "../ui/Selo";
import { intervaloDatas, tipoCurto } from "../ui/formato";

/**
 * Peças da lista de Eventos: selos de origem/pendência/cancelamento (portal,
 * spec §3.2 e §4.4), o ponto de alerta e o cartão (`eventCard` do protótipo).
 */

/** Selo de origem: "CRM" (evento comercial) ou "Financeiro" (evento próprio). */
export function SeloOrigem({ evento }: { evento: EventoFin }) {
  return evento.origem === "crm" ? (
    <Selo cor="azul" titulo="Evento comercial do CRM">
      CRM
    </Selo>
  ) : (
    <Selo cor="outline" titulo="Evento criado no financeiro">
      Financeiro
    </Selo>
  );
}

/** "Cadastro financeiro pendente" e "Cancelado no CRM", quando valem. */
export function SelosSituacaoCrm({ evento }: { evento: EventoFin }) {
  return (
    <>
      {evento.cadastroPendente && (
        <Selo cor="dourado" icone="alert">
          Cadastro financeiro pendente
        </Selo>
      )}
      {evento.canceladoNoCrm && (
        <Selo cor="vermelho" icone="x">
          Cancelado no CRM
        </Selo>
      )}
    </>
  );
}

/** `.alert-dot` com a contagem de pendências Vencido/Pendente. */
export function PontoAlerta({ alertas }: { alertas: AlertaFin[] | undefined }) {
  const n = alertas?.length ?? 0;
  if (!n) return null;
  const texto = `${n} pendência(s) financeira(s)`;
  return (
    <span className="alert-dot" title={texto}>
      <Icone nome="alert" tamanho="xs" />
      <span aria-hidden="true">{n}</span>
      <span className="sr-only">{texto}</span>
    </span>
  );
}

const ICONE_MODALIDADE = {
  "Online ao vivo": "wifi",
  Presencial: "pin",
  Híbrido: "hybrid",
} as const;

export function IconeModalidade({ modalidade }: { modalidade: string }) {
  const nome = ICONE_MODALIDADE[modalidade as keyof typeof ICONE_MODALIDADE];
  return nome ? <Icone nome={nome} tamanho="sm" /> : null;
}

/** Linha do local: online = "Transmissão online · "; cidade/UF só se houver. */
export function textoLocal(e: EventoFin): string {
  const prefixo =
    e.modalidade === "Online ao vivo" ? "Transmissão online · " : e.local ? `${e.local} · ` : "";
  const cidade = e.cidade || e.uf ? `${e.cidade}/${e.uf}` : "";
  return (prefixo + cidade).replace(/ · $/, "");
}

interface CartaoEventoProps {
  evento: EventoFin;
  alertas: AlertaFin[] | undefined;
  /** Abre o evento (ou o cadastro, se pendente). */
  aoAbrir: () => void;
}

/**
 * `eventCard(e, alerts)`. O `article[role=link]` do protótipo vira
 * `<button>` (ação de navegação por estado, sem `<div onClick>`); o nome
 * acessível é o nome do evento mais os selos de situação. Evento do CRM
 * pendente diz "Completar cadastro" no lugar de "Ver evento".
 */
export function CartaoEvento({ evento: e, alertas, aoAbrir }: CartaoEventoProps) {
  const prog = [e.programa, e.modulo].filter(Boolean).join(" · ");
  const rotulo = [
    e.nome,
    e.cadastroPendente ? "Cadastro financeiro pendente" : "",
    e.canceladoNoCrm ? "Cancelado no CRM" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <button
      type="button"
      className={`ev-card ${CLASSE_VERTICAL[e.vertical] ?? ""}`}
      aria-label={rotulo}
      onClick={aoAbrir}
    >
      <div className="ec-top">
        {e.vertical ? <ChipVertical vertical={e.vertical} /> : null}
        <SeloOrigem evento={e} />
        <span className="ec-id">{e.id}</span>
      </div>
      <h4>{e.nome}</h4>
      <div className="ec-prog">
        {tipoCurto(e.tipo)}
        {prog ? ` · ${prog}` : ""}
      </div>
      <div className="ec-meta">
        <div>
          <Icone nome="calendar" tamanho="sm" />
          <span className="num">{intervaloDatas(e.dataInicio, e.dataFim)}</span>
        </div>
        <div>
          <IconeModalidade modalidade={e.modalidade} />
          <span>{e.modalidade || "—"}</span>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <Icone nome="pin" tamanho="sm" />
          <span>{textoLocal(e) || "—"}</span>
        </div>
      </div>
      <div className="ec-foot ec-foot-selos">
        <SeloStatus status={e.status} tipo="operacional" />
        <SelosSituacaoCrm evento={e} />
        <PontoAlerta alertas={alertas} />
        <span className="ec-go">
          {e.cadastroPendente ? "Completar cadastro" : "Ver evento"}{" "}
          <Icone nome="arrowR" tamanho="sm" />
        </span>
      </div>
    </button>
  );
}
