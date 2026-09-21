"use client";

import { useState } from "react";

import {
  acoesDeEvento,
  eventoCorrente,
  indiceDoEstagio,
  MODALIDADES_EVENTO,
  rotuloDoEstagio,
  TIPOS_CONTRATO,
  type AcaoEvento,
  type EstagioLead,
  type StatusEvento,
} from "@ntc/lib";

import type { CatalogoCrm, LeadCrmDetalhe } from "@/lib/cms/painelCrm";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

import { cancelarEventoCrm, marcarEventoRealizadoCrm } from "../acoesCrm";
import { dataLegivel } from "./CamposCrm";
import { EditorLinks } from "./EditorLinks";
import { FormContrato } from "./FormContrato";
import { FormEvento } from "./FormEvento";
import { rotuloDeLista, seloDeStatusEvento } from "./seloStatus";

type Executar = (acao: () => Promise<ResultadoEscrita>, depois?: () => void, aoFalhar?: () => void) => void;

interface AbaAcoesProps {
  lead: LeadCrmDetalhe;
  catalogo: CatalogoCrm;
  ocupado: boolean;
  onExecutar: Executar;
}

type SubformAberto = "agendar" | "registrar-contrato" | "links" | null;

const ROTULO_ACAO: Record<AcaoEvento, string> = {
  agendar: "Agendar evento",
  "registrar-contrato": "Registrar contrato/empenho",
  links: "Links de inscrição",
  realizado: "Marcar realizado",
  cancelar: "Cancelar evento",
};

const ROTULO_STATUS_EVENTO: Record<string, string> = {
  agendado: "Agendado",
  realizado: "Realizado",
  cancelado: "Cancelado",
};

/**
 * Aba Ações do modal do lead (spec-adendo 2026-09-17 §2): evento corrente,
 * ações conforme `acoesDeEvento` e eventos anteriores em lista compacta.
 * Aviso, não bloqueio, quando o estágio já avançou sem evento.
 */
export function AbaAcoes({ lead, catalogo, ocupado, onExecutar }: AbaAcoesProps) {
  const [subform, setSubform] = useState<SubformAberto>(null);
  const [confirmando, setConfirmando] = useState<"realizado" | "cancelar" | null>(null);

  const eventos = lead.eventos;
  const corrente = eventoCorrente(
    eventos.map((e) => ({
      id: e.id,
      status: e.status as StatusEvento,
      dataInicioISO: e.dataInicioISO,
      temContrato: e.contrato !== null,
      numLinks: e.links.length,
    })),
  );
  const eventoCorrenteCompleto = corrente ? (eventos.find((e) => e.id === corrente.id) ?? null) : null;
  const acoes = acoesDeEvento(lead, corrente);
  const anteriores = eventoCorrenteCompleto ? eventos.filter((e) => e.id !== eventoCorrenteCompleto.id) : eventos;

  const semEventoEstagioAvancado =
    eventos.length === 0 && indiceDoEstagio(lead.estagio as EstagioLead) >= indiceDoEstagio("evento-agendado");

  function abrirAcao(acao: AcaoEvento) {
    if (acao === "agendar") setSubform("agendar");
    else if (acao === "registrar-contrato") setSubform("registrar-contrato");
    else if (acao === "links") setSubform("links");
    else setConfirmando(acao);
  }

  function fecharTudo() {
    setSubform(null);
    setConfirmando(null);
  }

  return (
    <div className="pcms-acoes">
      {eventoCorrenteCompleto ? (
        <section className="pcms-det-bloco pcms-acoes__evento">
          <h3>{eventoCorrenteCompleto.titulo}</h3>
          <dl className="pcms-deflist">
            <div className="pcms-deflist__item">
              <dt>Datas</dt>
              <dd>
                {dataLegivel(eventoCorrenteCompleto.dataInicioISO)}
                {eventoCorrenteCompleto.dataFimISO ? ` – ${dataLegivel(eventoCorrenteCompleto.dataFimISO)}` : ""}
              </dd>
            </div>
            <div className="pcms-deflist__item">
              <dt>Modalidade</dt>
              <dd>{eventoCorrenteCompleto.modalidade ? rotuloDeLista(MODALIDADES_EVENTO, eventoCorrenteCompleto.modalidade) : "—"}</dd>
            </div>
            <div className="pcms-deflist__item">
              <dt>Status</dt>
              <dd>
                <span className={seloDeStatusEvento(eventoCorrenteCompleto.status)}>
                  {ROTULO_STATUS_EVENTO[eventoCorrenteCompleto.status] ?? eventoCorrenteCompleto.status}
                </span>
              </dd>
            </div>
            <div className="pcms-deflist__item">
              <dt>Contrato</dt>
              <dd>
                {eventoCorrenteCompleto.contrato
                  ? `${eventoCorrenteCompleto.contrato.tipo ? rotuloDeLista(TIPOS_CONTRATO, eventoCorrenteCompleto.contrato.tipo) : "Contrato"} ${eventoCorrenteCompleto.contrato.numero ?? ""}`.trim()
                  : "sem contrato"}
              </dd>
            </div>
            <div className="pcms-deflist__item">
              <dt>Links</dt>
              <dd>{eventoCorrenteCompleto.links.length} links</dd>
            </div>
            <div className="pcms-deflist__item">
              <dt>Documentos</dt>
              <dd>{eventoCorrenteCompleto.numDocumentos} documentos</dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="pcms-vazio">Nenhum evento registrado para este lead.</p>
      )}

      {acoes.length > 0 && (
        <div className="pcms-acoes__botoes">
          {acoes.map((acao) => (
            <button
              key={acao}
              type="button"
              className={`pcms-btn ${acao === "cancelar" ? "pcms-btn--perigo" : "pcms-btn--ghost"} pcms-btn--mini`}
              disabled={ocupado}
              aria-expanded={subform === acao || confirmando === acao}
              onClick={() => abrirAcao(acao)}
            >
              {ROTULO_ACAO[acao]}
            </button>
          ))}
        </div>
      )}

      {subform === "agendar" && (
        <FormEvento leadId={lead.id} catalogo={catalogo} ocupado={ocupado} onExecutar={onExecutar} onFechar={fecharTudo} />
      )}
      {subform === "registrar-contrato" && eventoCorrenteCompleto && (
        <FormContrato
          eventoId={eventoCorrenteCompleto.id}
          contratoAtual={eventoCorrenteCompleto.contrato}
          ocupado={ocupado}
          onExecutar={onExecutar}
          onFechar={fecharTudo}
        />
      )}
      {subform === "links" && eventoCorrenteCompleto && (
        <EditorLinks
          eventoId={eventoCorrenteCompleto.id}
          linksIniciais={eventoCorrenteCompleto.links}
          ocupado={ocupado}
          onExecutar={onExecutar}
          onFechar={fecharTudo}
        />
      )}

      {confirmando && eventoCorrenteCompleto && (
        <div className="pcms-acoes__confirmar">
          <p>
            {confirmando === "realizado"
              ? `Marcar "${eventoCorrenteCompleto.titulo}" como realizado?`
              : `Cancelar o evento "${eventoCorrenteCompleto.titulo}"?`}
          </p>
          <div className="pcms-acoes__botoes">
            <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" disabled={ocupado} onClick={fecharTudo}>
              Voltar
            </button>
            <button
              type="button"
              className={`pcms-btn pcms-btn--mini${confirmando === "cancelar" ? " pcms-btn--perigo" : ""}`}
              disabled={ocupado}
              onClick={() =>
                onExecutar(
                  () =>
                    confirmando === "realizado"
                      ? marcarEventoRealizadoCrm(eventoCorrenteCompleto.id)
                      : cancelarEventoCrm(eventoCorrenteCompleto.id),
                  fecharTudo,
                )
              }
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {anteriores.length > 0 && (
        <section className="pcms-det-bloco">
          <h3>Eventos anteriores</h3>
          <ul className="pcms-eventos-cliente">
            {anteriores.map((ev) => (
              <li key={ev.id}>
                {ev.titulo} · {dataLegivel(ev.dataInicioISO)} ·{" "}
                <span className={seloDeStatusEvento(ev.status)}>{ROTULO_STATUS_EVENTO[ev.status] ?? ev.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {semEventoEstagioAvancado && (
        <p className="pcms-aviso">
          Este lead está em {rotuloDoEstagio(lead.estagio)} sem evento agendado — agende ou ajuste o estágio.
        </p>
      )}
    </div>
  );
}
