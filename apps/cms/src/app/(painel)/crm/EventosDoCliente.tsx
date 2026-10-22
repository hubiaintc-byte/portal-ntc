"use client";

import { useState, useTransition } from "react";

import { acoesDoAcervo, MODALIDADES_EVENTO, TIPOS_CONTRATO, type AcaoEvento } from "@ntc/lib";

import type { EventoComercialResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";

import { cancelarEventoCrm, marcarEventoRealizadoCrm, removerDocumentoEventoCrm } from "../acoesCrm";
import { AvisoForm, dataLegivel } from "./CamposCrm";
import { EditorLinks } from "./EditorLinks";
import { FormContrato } from "./FormContrato";
import { rotuloDeLista, seloDeStatusEvento } from "./seloStatus";
import { UploadDocumento } from "./UploadDocumento";

interface EventosDoClienteProps {
  eventos: EventoComercialResumo[];
  /** Ausente = sem Dashboard/Leads: o lead do evento sai só como texto. */
  onAbrirLead?: (id: string) => void;
  /**
   * `capacidades.acompanharEventos`, calculada no servidor: mostra contrato,
   * links, realizado e cancelar no card do evento agendado (spec §3.8).
   */
  podeAcompanhar: boolean;
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
export function EventosDoCliente({ eventos, onAbrirLead, podeAcompanhar, onAtualizado }: EventosDoClienteProps) {
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
            <CardEvento
              key={ev.id}
              evento={ev}
              onAbrirLead={onAbrirLead}
              podeAcompanhar={podeAcompanhar}
              onAtualizado={onAtualizado}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CardEventoProps {
  evento: EventoComercialResumo;
  onAbrirLead?: (id: string) => void;
  podeAcompanhar: boolean;
  onAtualizado: () => void;
}

const ROTULO_ACAO_ACERVO: Partial<Record<AcaoEvento, string>> = {
  "registrar-contrato": "Registrar contrato/empenho",
  links: "Links de inscrição",
  realizado: "Marcar realizado",
  cancelar: "Cancelar evento",
};

/**
 * Acompanhamento do evento agendado no acervo do cliente (spec §3.8): as
 * mesmas ações da aba Ações do modal do lead (menos "Agendar"), com os
 * mesmos formulários e Server Actions. Depois de cada uma, recarrega o
 * cliente (`onAtualizado`), como o upload de documento.
 */
function AcompanhamentoEvento({ evento: ev, onAtualizado }: { evento: EventoComercialResumo; onAtualizado: () => void }) {
  const [aberto, setAberto] = useState<AcaoEvento | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, iniciar] = useTransition();
  const acoes = acoesDoAcervo(ev.status);

  function executar(acao: () => Promise<ResultadoEscrita>, depois?: () => void, aoFalhar?: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) {
        setErro(r.erro ?? "Erro.");
        aoFalhar?.();
        return;
      }
      depois?.();
      onAtualizado();
    });
  }

  const fechar = () => setAberto(null);

  if (acoes.length === 0) return null;

  return (
    <section className="pcms-evento-card__bloco">
      <h4>Acompanhamento</h4>
      <AvisoForm erro={erro} />
      <div className="pcms-acoes__botoes">
        {acoes.map((acao) => (
          <button
            key={acao}
            type="button"
            className={`pcms-btn ${acao === "cancelar" ? "pcms-btn--perigo" : "pcms-btn--ghost"} pcms-btn--mini`}
            disabled={ocupado}
            aria-expanded={aberto === acao}
            onClick={() => {
              setErro(null);
              setAberto(acao);
            }}
          >
            {ROTULO_ACAO_ACERVO[acao]}
          </button>
        ))}
      </div>
      {aberto === "registrar-contrato" && (
        <FormContrato eventoId={ev.id} contratoAtual={ev.contrato} ocupado={ocupado} onExecutar={executar} onFechar={fechar} />
      )}
      {aberto === "links" && (
        <EditorLinks eventoId={ev.id} linksIniciais={ev.links} ocupado={ocupado} onExecutar={executar} onFechar={fechar} />
      )}
      {(aberto === "realizado" || aberto === "cancelar") && (
        <div className="pcms-acoes__confirmar">
          <p>{aberto === "realizado" ? `Marcar "${ev.titulo}" como realizado?` : `Cancelar o evento "${ev.titulo}"?`}</p>
          <div className="pcms-acoes__botoes">
            <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" disabled={ocupado} onClick={fechar}>
              Voltar
            </button>
            <button
              type="button"
              className={`pcms-btn pcms-btn--mini${aberto === "cancelar" ? " pcms-btn--perigo" : ""}`}
              disabled={ocupado}
              onClick={() =>
                executar(
                  () => (aberto === "realizado" ? marcarEventoRealizadoCrm(ev.id) : cancelarEventoCrm(ev.id)),
                  fechar,
                )
              }
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function CardEvento({ evento: ev, onAbrirLead, podeAcompanhar, onAtualizado }: CardEventoProps) {
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
        {ev.leadId && !onAbrirLead && <span className="pcms-evento-card__meta">lead: {ev.leadNome ?? "—"}</span>}
        {ev.leadId && onAbrirLead && (
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
        {podeAcompanhar && <AcompanhamentoEvento evento={ev} onAtualizado={onAtualizado} />}

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
