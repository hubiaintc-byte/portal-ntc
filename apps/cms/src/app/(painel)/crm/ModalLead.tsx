"use client";

import { useEffect, useState, useTransition } from "react";

import { ESTAGIOS_LEAD, MOTIVOS_PERDA, rotuloDoEstagio } from "@ntc/lib";

import type { CatalogoCrm, ClienteCrmResumo, LeadCrmDetalhe, UsuarioCmsResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { adicionarNotaCrm, marcarLeadPerdidoCrm, moverLeadCrm, reabrirLeadCrm, vincularClienteCrm } from "../acoesCrm";
import { AvisoForm } from "./CamposCrm";
import { FormLead } from "./FormLead";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { seloDeEstagioLead } from "./seloStatus";

type Aba = "dados" | "historico";

interface ModalLeadProps {
  /** null = modo criação (Novo Lead). */
  lead: LeadCrmDetalhe | null;
  clientes: ClienteCrmResumo[];
  catalogo: CatalogoCrm;
  usuarios: UsuarioCmsResumo[];
  onFechar: () => void;
  /** Recarrega o lead após qualquer escrita (o pai chama carregarLeadCrm). */
  onAtualizado: (id: string) => void;
  onAbrirCliente: (id: string) => void;
}

const FMT_DATA_HORA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** "2026-03-10" → "10/03/2026"; ISO com hora → data e hora locais. */
function dataLegivel(iso: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso.split("-").reverse().join("/");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : FMT_DATA_HORA.format(d);
}

function Par({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="pcms-deflist__item">
      <dt>{rotulo}</dt>
      <dd>{valor}</dd>
    </div>
  );
}

/** Modal único do lead (spec §4.4): usado no kanban, em Leads e no cliente. A aba Ações chega na Sessão 2. */
export function ModalLead({ lead, clientes, catalogo, usuarios, onFechar, onAtualizado, onAbrirCliente }: ModalLeadProps) {
  const [aba, setAba] = useState<Aba>("dados");
  const [editando, setEditando] = useState(lead === null);
  const [perdendo, setPerdendo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [clienteNovo, setClienteNovo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, iniciar] = useTransition();

  // Fechar com Esc (mesmo padrão do ModalImportarPdf).
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  function executar(acao: () => Promise<{ ok: boolean; erro?: string }>, depois?: () => void) {
    setErro(null);
    iniciar(async () => {
      const r = await acao();
      if (!r.ok) {
        setErro(r.erro ?? "Erro.");
        return;
      }
      depois?.();
      if (lead) onAtualizado(lead.id);
    });
  }

  const titulo = lead ? (lead.clienteNome ?? lead.instituicao) : "Novo lead";

  return (
    <div
      className="pcms-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pcms-modal-lead-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="pcms-modal pcms-modal--largo">
        <div className="pcms-modal__head">
          <div>
            <p className="pcms-pagehead__eyebrow">{lead ? `Lead · ${lead.nome}` : "Comercial"}</p>
            <h2 id="pcms-modal-lead-titulo">
              {lead?.clienteId ? (
                <button type="button" className="pcms-link" onClick={() => onAbrirCliente(lead.clienteId as string)}>
                  {titulo}
                </button>
              ) : (
                titulo
              )}
            </h2>
          </div>
          <button type="button" className="pcms-modal__fechar" onClick={onFechar} aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lead && (
          <div className="pcms-modal__barra">
            <label className="pcms-modal__estagio">
              Estágio
              <select
                value={lead.estagio}
                disabled={ocupado || lead.perdido}
                aria-label="Estágio do lead"
                onChange={(e) => {
                  const estagio = e.target.value;
                  executar(() => moverLeadCrm(lead.id, estagio));
                }}
              >
                {ESTAGIOS_LEAD.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <span className={seloDeEstagioLead(lead.estagio)}>{rotuloDoEstagio(lead.estagio)}</span>
            {lead.perdido && (
              <span className="pcms-selo pcms-selo--erro">
                Perdido · {MOTIVOS_PERDA.find((m) => m.value === lead.motivoPerda)?.label ?? lead.motivoPerda}
              </span>
            )}
            <span className="pcms-modal__resp">{lead.responsavelNome ?? "Sem responsável"}</span>
            <div className="pcms-modal__acoes">
              {!lead.perdido && !editando && (
                <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" onClick={() => setEditando(true)}>
                  Editar
                </button>
              )}
              {lead.perdido ? (
                <button type="button" className="pcms-btn pcms-btn--mini" disabled={ocupado} onClick={() => executar(() => reabrirLeadCrm(lead.id))}>
                  Reabrir
                </button>
              ) : (
                <button
                  type="button"
                  className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                  disabled={ocupado}
                  aria-expanded={perdendo}
                  onClick={() => setPerdendo((v) => !v)}
                >
                  Marcar como perdido
                </button>
              )}
            </div>
          </div>
        )}

        {lead && perdendo && (
          <form
            className="pcms-modal__perda"
            onSubmit={(e) => {
              e.preventDefault();
              executar(() => marcarLeadPerdidoCrm(lead.id, motivo, detalhe), () => setPerdendo(false));
            }}
          >
            <label>
              Motivo
              <select value={motivo} onChange={(e) => setMotivo(e.target.value)} required>
                <option value="">Selecione</option>
                {MOTIVOS_PERDA.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Detalhe
              <input type="text" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} />
            </label>
            <button type="submit" className="pcms-btn pcms-btn--mini" disabled={ocupado}>
              Confirmar perda
            </button>
          </form>
        )}

        {lead && (
          <div className="pcms-modal__abas" role="tablist" aria-label="Seções do lead">
            {(["dados", "historico"] as Aba[]).map((a) => (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={aba === a}
                className={`pcms-chip${aba === a ? " pcms-chip--ativo" : ""}`}
                onClick={() => setAba(a)}
              >
                {a === "dados" ? "Dados" : "Histórico"}
              </button>
            ))}
          </div>
        )}

        <div className="pcms-modal__body">
          <AvisoForm erro={erro} />
          {editando ? (
            <FormLead
              inicial={lead}
              clientes={clientes}
              catalogo={catalogo}
              usuarios={usuarios}
              onSalvo={() => {
                setEditando(false);
                if (lead) onAtualizado(lead.id);
                else onFechar();
              }}
              onCancelar={() => (lead ? setEditando(false) : onFechar())}
            />
          ) : lead && aba === "dados" ? (
            <>
              <section className="pcms-det-bloco">
                <h3>Contato</h3>
                <dl className="pcms-deflist">
                  <Par rotulo="Nome" valor={lead.nome} />
                  <Par rotulo="E-mail" valor={lead.email} />
                  <Par rotulo="Telefone" valor={lead.telefone ?? "—"} />
                  <Par rotulo="Cargo" valor={lead.cargo ?? "—"} />
                  <Par rotulo="Instituição informada" valor={lead.instituicao} />
                  <Par rotulo="Esfera" valor={lead.esfera ?? "—"} />
                </dl>
              </section>
              <section className="pcms-det-bloco">
                <h3>Interesse</h3>
                <dl className="pcms-deflist">
                  <Par rotulo="Programa" valor={lead.programaSigla ?? "—"} />
                  <Par rotulo="Modalidade" valor={lead.modalidade ?? "—"} />
                  <Par rotulo="Participantes estimados" valor={lead.participantesEstimados ?? "—"} />
                  <Par rotulo="Valor estimado" valor={lead.valorEstimado !== null ? formatarMoedaBRL(lead.valorEstimado) : "—"} />
                  <Par rotulo="Data prevista" valor={lead.dataPrevistaEventoISO ? dataLegivel(lead.dataPrevistaEventoISO) : "—"} />
                </dl>
                {lead.mensagem && <blockquote className="pcms-modal__mensagem">{lead.mensagem}</blockquote>}
                {lead.observacoes && (
                  <p>
                    <strong>Observações internas:</strong> {lead.observacoes}
                  </p>
                )}
              </section>
              <section className="pcms-det-bloco">
                <h3>Cliente</h3>
                <p>
                  {lead.clienteNome ?? "Sem cliente vinculado"}
                  {lead.clienteCasadoPor && <small> · vínculo por {lead.clienteCasadoPor}</small>}
                </p>
                <div className="pcms-modal__vincular">
                  <select value={clienteNovo} onChange={(e) => setClienteNovo(e.target.value)} aria-label="Trocar cliente">
                    <option value="">Trocar cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.orgao}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="pcms-btn pcms-btn--mini"
                    disabled={ocupado || clienteNovo === ""}
                    onClick={() => executar(() => vincularClienteCrm(lead.id, clienteNovo), () => setClienteNovo(""))}
                  >
                    Vincular
                  </button>
                </div>
              </section>
              <section className="pcms-det-bloco">
                <h3>Origem e LGPD</h3>
                <dl className="pcms-deflist">
                  <Par rotulo="Entrada" valor={lead.origemEntrada} />
                  {lead.origem.map((o) => (
                    <Par key={o.rotulo} rotulo={o.rotulo} valor={o.valor} />
                  ))}
                  <Par
                    rotulo="Consentimento"
                    valor={
                      lead.consentimento.aceito
                        ? `Aceito em ${lead.consentimento.timestamp ? dataLegivel(lead.consentimento.timestamp) : "—"} · política ${lead.consentimento.politicaVersao ?? "—"} · IP ${lead.consentimento.ipSubmissao ?? "—"}`
                        : "Não registrado (lead manual)"
                    }
                  />
                </dl>
              </section>
            </>
          ) : lead ? (
            <LinhaDoTempo
              itens={lead.linhaDoTempo}
              onNota={
                lead.clienteId
                  ? async (t) => {
                      const r = await adicionarNotaCrm(lead.clienteId as string, lead.id, t);
                      if (r.ok) onAtualizado(lead.id);
                      return r.ok ? null : (r.erro ?? "Erro.");
                    }
                  : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
