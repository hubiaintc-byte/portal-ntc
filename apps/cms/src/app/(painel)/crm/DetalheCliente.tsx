"use client";

import { useState, useTransition } from "react";

import { AREAS_CRM, ESFERAS_CRM, ORIGENS_CLIENTE, podeApagarCliente, TIPOS_INSTITUICAO, rotuloDoEstagio } from "@ntc/lib";

import type { ClienteCrmDetalhe } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { apagarClienteCrm } from "../acoesCrm";
import { AvisoForm } from "./CamposCrm";
import { EventosDoCliente } from "./EventosDoCliente";
import { LinhaDoTempo } from "./LinhaDoTempo";
import { rotuloDeLista, seloDeEstagioLead } from "./seloStatus";

interface DetalheClienteProps {
  cliente: ClienteCrmDetalhe;
  onVoltar: () => void;
  onEditar: () => void;
  onAbrirLead: (id: string) => void;
  onNovoLead: () => void;
  onNota: (texto: string) => Promise<string | null>;
  onAtualizado: () => void;
  onApagado: () => void;
}

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

/** Detalhe do cliente, o ativo permanente: dados + contatos, negócios, eventos e a linha do tempo com nota manual. */
export function DetalheCliente({
  cliente: c,
  onVoltar,
  onEditar,
  onAbrirLead,
  onNovoLead,
  onNota,
  onAtualizado,
  onApagado,
}: DetalheClienteProps) {
  const [apagando, setApagando] = useState(false);
  const [enviando, iniciar] = useTransition();
  const [erroApagar, setErroApagar] = useState<string | null>(null);

  const podeApagar = podeApagarCliente({ numLeads: c.negocios.length, numEventos: c.eventos.length, numPropostas: c.numPropostas });

  function confirmarExclusao() {
    setErroApagar(null);
    iniciar(async () => {
      const r = await apagarClienteCrm(c.id);
      if (r.ok) {
        onApagado();
      } else {
        setErroApagar(r.erro ?? "Erro ao apagar o cliente.");
        setApagando(false);
      }
    });
  }

  const dados = [
    { rotulo: "Órgão", valor: c.orgao },
    { rotulo: "Sigla", valor: c.sigla ?? "—" },
    { rotulo: "Tipo", valor: rotuloDeLista(TIPOS_INSTITUICAO, c.tipo) },
    { rotulo: "Município", valor: c.municipio !== null ? `${c.municipio}${c.uf !== null ? ` / ${c.uf}` : ""}` : (c.uf ?? "—") },
    { rotulo: "Esfera", valor: rotuloDeLista(ESFERAS_CRM, c.esfera) },
    { rotulo: "Área", valor: rotuloDeLista(AREAS_CRM, c.area) },
    { rotulo: "CNPJ", valor: c.cnpj ?? "—" },
    { rotulo: "E-mail", valor: c.email ?? "—" },
    { rotulo: "Origem", valor: rotuloDeLista(ORIGENS_CLIENTE, c.origem) },
    { rotulo: "Responsável", valor: c.responsavelNome ?? "—" },
  ];

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Clientes <span>/ {c.orgao}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Cliente</p>
          <h1>{c.orgao}</h1>
          {c.observacoes && <p>{c.observacoes}</p>}
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={onEditar}>
            Editar
          </button>
          <button type="button" className="pcms-btn" onClick={onNovoLead}>
            Novo lead
          </button>
          {!apagando ? (
            <button
              type="button"
              className="pcms-btn pcms-btn--perigo"
              disabled={!podeApagar.ok}
              title={podeApagar.ok ? undefined : podeApagar.motivo}
              onClick={() => setApagando(true)}
            >
              Apagar cliente
            </button>
          ) : (
            <>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => setApagando(false)}>
                Cancelar
              </button>
              <button type="button" className="pcms-btn pcms-btn--perigo" disabled={enviando} onClick={confirmarExclusao}>
                {enviando ? "Apagando…" : "Confirmar exclusão"}
              </button>
            </>
          )}
        </div>
      </div>
      {!podeApagar.ok && <p className="pcms-pagehead__aviso-apagar">{podeApagar.motivo}</p>}
      <AvisoForm erro={erroApagar} />

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          <section className="pcms-det-bloco">
            <h2>Dados</h2>
            <dl className="pcms-deflist">
              {dados.map((d) => (
                <div key={d.rotulo} className="pcms-deflist__item">
                  <dt>{d.rotulo}</dt>
                  <dd>{d.valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="pcms-det-bloco">
            <h2>Contatos</h2>
            {c.contatos.length === 0 ? (
              <div className="pcms-vazio">Nenhum contato cadastrado.</div>
            ) : (
              <table className="pcms-tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo</th>
                    <th>Setor</th>
                    <th>E-mail</th>
                    <th>WhatsApp</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {c.contatos.map((ct, i) => (
                    <tr key={`${i}-${ct.nome}`}>
                      <td>
                        <strong>{ct.nome}</strong>
                      </td>
                      <td>{ct.cargo ?? "—"}</td>
                      <td>{ct.setor ?? "—"}</td>
                      <td>{ct.email ?? "—"}</td>
                      <td>{ct.whatsapp ?? "—"}</td>
                      <td>
                        {ct.principal && <span className="pcms-selo pcms-selo--ok">Principal</span>}{" "}
                        {ct.decisor && <span className="pcms-selo pcms-selo--info">Decisor</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="pcms-det-bloco">
            <h2>Negócios</h2>
            {c.negocios.length === 0 ? (
              <div className="pcms-vazio">Nenhum lead deste cliente.</div>
            ) : (
              <table className="pcms-tabela">
                <thead>
                  <tr>
                    <th>Recebido</th>
                    <th>Contato</th>
                    <th>Programa</th>
                    <th>Valor</th>
                    <th>Estágio</th>
                  </tr>
                </thead>
                <tbody>
                  {c.negocios.map((l) => (
                    <tr
                      key={l.id}
                      className="pcms-linha-click"
                      role="button"
                      tabIndex={0}
                      aria-label={`Abrir lead de ${l.nome}`}
                      onClick={() => onAbrirLead(l.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onAbrirLead(l.id);
                        }
                      }}
                    >
                      <td>{FMT.format(new Date(l.criadoEmISO))}</td>
                      <td>{l.nome}</td>
                      <td>{l.programaSigla ?? "—"}</td>
                      <td>{l.valorEstimado !== null ? formatarMoedaBRL(l.valorEstimado) : "—"}</td>
                      <td>
                        <span className={seloDeEstagioLead(l.estagio)}>{rotuloDoEstagio(l.estagio)}</span>
                        {l.perdido && (
                          <>
                            {" "}
                            <span className="pcms-selo pcms-selo--erro">Perdido</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="pcms-det-bloco">
            <h2>Eventos</h2>
            <EventosDoCliente eventos={c.eventos} onAbrirLead={onAbrirLead} onAtualizado={onAtualizado} />
          </section>
        </div>

        <aside className="pcms-det-side">
          <section className="pcms-det-bloco">
            <h2>Linha do tempo</h2>
            <LinhaDoTempo itens={c.linhaDoTempo} onNota={onNota} />
          </section>
        </aside>
      </div>
    </>
  );
}
