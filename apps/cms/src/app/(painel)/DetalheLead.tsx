"use client";

import type { LeadCmsDetalhe, LeadTipoCms } from "@/lib/cms/painelCms";

const ROTULO_TIPO: Record<LeadTipoCms, string> = {
  proposta: "Proposta institucional",
  contato: "Contato",
  newsletter: "Newsletter",
  candidatura: "Candidatura ao corpo docente",
};

const ROTULO_STATUS: Record<string, string> = {
  novo: "Novo",
  "em-atendimento": "Em atendimento",
  qualificado: "Qualificado",
  descartado: "Descartado",
  convertido: "Convertido",
};

interface DetalheLeadProps {
  lead: LeadCmsDetalhe;
  onVoltar: () => void;
}

/** Tela cheia de detalhe de um lead — somente leitura (triagem comercial). */
export function DetalheLead({ lead: l, onVoltar }: DetalheLeadProps) {
  const contato = [
    { rotulo: "E-mail", valor: l.email },
    { rotulo: "Telefone", valor: l.telefone },
    { rotulo: "Cargo", valor: l.cargo },
    { rotulo: "Instituição", valor: l.instituicao },
    { rotulo: "Esfera", valor: l.esfera },
  ].filter((c) => c.valor && c.valor !== "—");

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Leads <span>/ {l.nome}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">{ROTULO_TIPO[l.tipo]}</p>
          <h1>{l.nome}</h1>
          <p>Recebido em {l.data}</p>
        </div>
        <span className={`pcms-selo pcms-selo--${l.status}`}>
          {ROTULO_STATUS[l.status] ?? l.status}
        </span>
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          {l.detalhes.length > 0 && (
            <section className="pcms-det-bloco">
              <h2>{ROTULO_TIPO[l.tipo]}</h2>
              <dl className="pcms-deflist">
                {l.detalhes.map((d) => (
                  <div key={d.rotulo} className="pcms-deflist__item">
                    <dt>{d.rotulo}</dt>
                    <dd>{d.valor}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {l.curriculo && (
            <section className="pcms-det-bloco">
              <h2>Currículo anexado</h2>
              <p className="pcms-det-link">
                <a href={l.curriculo.url} target="_blank" rel="noopener noreferrer">
                  {l.curriculo.nome}
                </a>
              </p>
            </section>
          )}

          {l.observacoesInternas && (
            <section className="pcms-det-bloco">
              <h2>Observações internas</h2>
              <p>{l.observacoesInternas}</p>
            </section>
          )}
        </div>

        <aside className="pcms-det-aside">
          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Contato</div>
            <div className="pcms-det-card__body">
              <dl className="pcms-deflist">
                {contato.map((c) => (
                  <div key={c.rotulo} className="pcms-deflist__item">
                    <dt>{c.rotulo}</dt>
                    <dd>{c.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Consentimento LGPD</div>
            <div className="pcms-det-card__body">
              <span
                className={`pcms-selo pcms-selo--${l.consentimento.aceito ? "publicado" : "rascunho"}`}
              >
                {l.consentimento.aceito ? "Aceito" : "Não registrado"}
              </span>
              <dl className="pcms-deflist">
                {l.consentimento.timestamp && (
                  <div className="pcms-deflist__item">
                    <dt>Data do aceite</dt>
                    <dd>{l.consentimento.timestamp}</dd>
                  </div>
                )}
                {l.consentimento.politicaVersao && (
                  <div className="pcms-deflist__item">
                    <dt>Versão da política</dt>
                    <dd>{l.consentimento.politicaVersao}</dd>
                  </div>
                )}
                {l.consentimento.ipSubmissao && (
                  <div className="pcms-deflist__item">
                    <dt>IP de submissão</dt>
                    <dd>{l.consentimento.ipSubmissao}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {l.origem.length > 0 && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Origem</div>
              <div className="pcms-det-card__body">
                <dl className="pcms-deflist">
                  {l.origem.map((o) => (
                    <div key={o.rotulo} className="pcms-deflist__item">
                      <dt>{o.rotulo}</dt>
                      <dd>{o.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
