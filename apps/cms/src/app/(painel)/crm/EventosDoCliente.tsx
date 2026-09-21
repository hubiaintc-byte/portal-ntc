"use client";

import { useState, useTransition } from "react";

import { MODALIDADES_EVENTO, TIPOS_CONTRATO } from "@ntc/lib";

import type { EventoComercialResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { removerDocumentoEventoCrm } from "../acoesCrm";
import { AvisoForm, dataLegivel } from "./CamposCrm";
import { rotuloDeLista, seloDeStatusEvento } from "./seloStatus";
import { UploadDocumento } from "./UploadDocumento";

interface EventosDoClienteProps {
  eventos: EventoComercialResumo[];
  onAbrirLead: (id: string) => void;
  onAtualizado: () => void;
}

type FiltroEvento = "todos" | "agendado" | "realizado" | "cancelado";

const FILTROS: { id: FiltroEvento; rotulo: string }[] = [
  { id: "todos", rotulo: "Todos" },
  { id: "agendado", rotulo: "Agendados" },
  { id: "realizado", rotulo: "Realizados" },
  { id: "cancelado", rotulo: "Cancelados" },
];

const ROTULO_STATUS_EVENTO: Record<string, string> = { agendado: "Agendado", realizado: "Realizado", cancelado: "Cancelado" };

/** "1024" → "1 KB"; "2202009" → "2,1 MB". Sem dependência nova. */
function tamanhoLegivel(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Acervo de eventos do cliente: filtro por status, cards expansíveis com contrato, links e documentos. */
export function EventosDoCliente({ eventos, onAbrirLead, onAtualizado }: EventosDoClienteProps) {
  const [filtro, setFiltro] = useState<FiltroEvento>("todos");

  const filtrados = filtro === "todos" ? eventos : eventos.filter((ev) => ev.status === filtro);

  return (
    <div className="pcms-eventos-cliente-bloco">
      <div className="pcms-filtros">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`pcms-chip${filtro === f.id ? " pcms-chip--ativo" : ""}`}
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="pcms-vazio">
          {eventos.length === 0 ? "Nenhum evento ainda." : "Nenhum evento neste filtro."}
        </div>
      ) : (
        <div className="pcms-evento-lista">
          {filtrados.map((ev) => (
            <CardEvento key={ev.id} evento={ev} onAbrirLead={onAbrirLead} onAtualizado={onAtualizado} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardEventoProps {
  evento: EventoComercialResumo;
  onAbrirLead: (id: string) => void;
  onAtualizado: () => void;
}

function CardEvento({ evento: ev, onAbrirLead, onAtualizado }: CardEventoProps) {
  const [confirmandoRemocao, setConfirmandoRemocao] = useState<string | null>(null);
  const [removendo, iniciarRemocao] = useTransition();
  const [erroRemocao, setErroRemocao] = useState<string | null>(null);

  function removerDocumento(id: string) {
    setErroRemocao(null);
    iniciarRemocao(async () => {
      const r = await removerDocumentoEventoCrm(id);
      if (r.ok) {
        setConfirmandoRemocao(null);
        onAtualizado();
      } else {
        setErroRemocao(r.erro ?? "Erro ao remover documento.");
      }
    });
  }

  return (
    <details className="pcms-evento-card">
      <summary>
        <span className="pcms-evento-card__titulo">{ev.titulo}</span>
        <span className="pcms-evento-card__meta">
          {dataLegivel(ev.dataInicioISO)}
          {ev.dataFimISO ? ` – ${dataLegivel(ev.dataFimISO)}` : ""}
          {ev.modalidade ? ` · ${rotuloDeLista(MODALIDADES_EVENTO, ev.modalidade)}` : ""}
        </span>
        <span className={seloDeStatusEvento(ev.status)}>{ROTULO_STATUS_EVENTO[ev.status] ?? ev.status}</span>
        {ev.leadId && (
          <button
            type="button"
            className="pcms-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAbrirLead(ev.leadId as string);
            }}
          >
            lead: {ev.leadNome ?? "—"}
          </button>
        )}
      </summary>

      <div className="pcms-evento-card__corpo">
        <section className="pcms-evento-card__bloco">
          <h4>Contrato/empenho</h4>
          {ev.contrato ? (
            <>
              <dl className="pcms-deflist">
                <div className="pcms-deflist__item">
                  <dt>Tipo</dt>
                  <dd>{ev.contrato.tipo ? rotuloDeLista(TIPOS_CONTRATO, ev.contrato.tipo) : "—"}</dd>
                </div>
                <div className="pcms-deflist__item">
                  <dt>Número</dt>
                  <dd>{ev.contrato.numero ?? "—"}</dd>
                </div>
                <div className="pcms-deflist__item">
                  <dt>Data</dt>
                  <dd>{ev.contrato.dataISO ? dataLegivel(ev.contrato.dataISO) : "—"}</dd>
                </div>
                <div className="pcms-deflist__item">
                  <dt>Valor</dt>
                  <dd>{ev.contrato.valor !== null ? formatarMoedaBRL(ev.contrato.valor) : "—"}</dd>
                </div>
              </dl>
              {ev.contrato.arquivo && (
                <a href={ev.contrato.arquivo.url} target="_blank" rel="noopener noreferrer" className="pcms-btn pcms-btn--ghost pcms-btn--mini">
                  Baixar
                </a>
              )}
            </>
          ) : (
            <p className="pcms-vazio">Sem contrato registrado.</p>
          )}
        </section>

        <section className="pcms-evento-card__bloco">
          <h4>Links</h4>
          {ev.links.length === 0 ? (
            <p className="pcms-vazio">Nenhum link de inscrição.</p>
          ) : (
            <ul className="pcms-evento-card__links">
              {ev.links.map((l, i) => (
                <li key={`${i}-${l.url}`}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pcms-evento-card__bloco">
          <h4>Documentos</h4>
          <AvisoForm erro={erroRemocao} />
          {ev.documentos.length === 0 ? (
            <p className="pcms-vazio">Nenhum documento enviado.</p>
          ) : (
            <table className="pcms-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Tamanho</th>
                  <th className="pcms-sr-only">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ev.documentos.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.nome}</td>
                    <td>{doc.descricao ?? "—"}</td>
                    <td>{dataLegivel(doc.criadoEmISO)}</td>
                    <td>{tamanhoLegivel(doc.tamanho)}</td>
                    <td>
                      <div className="pcms-evento-card__acoes-doc">
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="pcms-btn pcms-btn--ghost pcms-btn--mini">
                          Baixar
                        </a>
                        {confirmandoRemocao === doc.id ? (
                          <>
                            <button
                              type="button"
                              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                              disabled={removendo}
                              onClick={() => {
                                setConfirmandoRemocao(null);
                                setErroRemocao(null);
                              }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="pcms-btn pcms-btn--perigo pcms-btn--mini"
                              disabled={removendo}
                              onClick={() => removerDocumento(doc.id)}
                            >
                              {removendo ? "Removendo…" : "Confirmar"}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                            onClick={() => setConfirmandoRemocao(doc.id)}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <UploadDocumento eventoId={ev.id} onEnviado={onAtualizado} />
        </section>
      </div>
    </details>
  );
}
