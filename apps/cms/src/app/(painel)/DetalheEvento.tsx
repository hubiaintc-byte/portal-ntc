"use client";

import { useState, useTransition } from "react";

import type { EventoCmsDetalhe, PalestranteCmsResumo } from "@/lib/cms/painelCms";

import { alternarPublicacaoEvento, salvarEvento } from "./acoes";
import { CampoUpload } from "./CampoUpload";
import { SeletorPalestrantes } from "./SeletorPalestrantes";

const ROTULO_STATUS: Record<EventoCmsDetalhe["status"], string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  agendado: "Agendado",
};

interface DetalheEventoProps {
  evento: EventoCmsDetalhe;
  palestrantesDisponiveis: PalestranteCmsResumo[];
  onVoltar: () => void;
}

/** Tela cheia de detalhe de um evento — leitura + edição de campos via CMS. */
export function DetalheEvento({
  evento: eventoInicial,
  palestrantesDisponiveis,
  onVoltar,
}: DetalheEventoProps) {
  const [evento, setEvento] = useState(eventoInicial);
  const [editando, setEditando] = useState(false);
  const [gerenciandoPalestrantes, setGerenciandoPalestrantes] = useState(false);
  const [salvando, iniciarSalvar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  // Rascunho de edição dos campos de texto.
  const [nome, setNome] = useState(evento.titulo);
  const [dataInicio, setDataInicio] = useState(evento.dataInicioISO ?? "");
  const [resumo, setResumo] = useState(evento.resumo ?? "");

  function abrirEdicao() {
    setNome(evento.titulo);
    setDataInicio(evento.dataInicioISO ?? "");
    setResumo(evento.resumo ?? "");
    setErro(null);
    setEditando(true);
  }

  function salvar() {
    setErro(null);
    iniciarSalvar(async () => {
      const { resultado, evento: atualizado } = await salvarEvento(evento.id, {
        nome,
        dataInicio,
        resumo,
      });
      if (resultado.ok && atualizado) {
        setEvento(atualizado);
        setEditando(false);
      } else {
        setErro(resultado.erro ?? "Não foi possível salvar.");
      }
    });
  }

  function alternarPublicacao() {
    const publicar = evento.status !== "publicado";
    setErro(null);
    iniciarSalvar(async () => {
      const { resultado, evento: atualizado } = await alternarPublicacaoEvento(evento.id, publicar);
      if (resultado.ok && atualizado) {
        setEvento(atualizado);
      } else {
        setErro(resultado.erro ?? "Não foi possível alterar a publicação.");
      }
    });
  }

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Eventos <span>/ {evento.titulo}</span>
      </button>

      {evento.capaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="pcms-det-capa" src={evento.capaUrl} alt={`Capa do evento ${evento.titulo}`} />
      )}

      <div className="pcms-det-head">
        <div>
          {evento.eyebrow && <p className="pcms-pagehead__eyebrow">{evento.eyebrow}</p>}
          <h1>{evento.titulo}</h1>
        </div>
        <div className="pcms-det-head__acoes">
          <span className={`pcms-selo pcms-selo--${evento.status}`}>
            {ROTULO_STATUS[evento.status]}
          </span>
          {!editando && (
            <>
              <button type="button" className="pcms-btn pcms-btn--ghost" onClick={abrirEdicao}>
                Editar
              </button>
              <button
                type="button"
                className="pcms-btn"
                onClick={alternarPublicacao}
                disabled={salvando}
              >
                {evento.status === "publicado" ? "Despublicar" : "Publicar"}
              </button>
            </>
          )}
        </div>
      </div>

      {editando && (
        <section className="pcms-editor">
          <div className="pcms-editor__head">Editar campos</div>
          <div className="pcms-field">
            <label htmlFor="ed-nome">Nome do evento</label>
            <input id="ed-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="pcms-field">
            <label htmlFor="ed-data">Data de início</label>
            <input
              id="ed-data"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="pcms-field">
            <label htmlFor="ed-resumo">Resumo</label>
            <textarea
              id="ed-resumo"
              rows={3}
              maxLength={280}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
            />
          </div>
          {erro && <p className="pcms-upload__erro">{erro}</p>}
          <div className="pcms-editor__acoes">
            <button type="button" className="pcms-btn" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={() => setEditando(false)}
              disabled={salvando}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

      <div className="pcms-det-meta">
        <div>
          <span className="pcms-det-meta__rot">Data</span>
          {evento.data}
        </div>
        <div>
          <span className="pcms-det-meta__rot">Modalidade</span>
          {evento.modalidade}
        </div>
        <div>
          <span className="pcms-det-meta__rot">Local</span>
          {evento.local}
        </div>
        {evento.cargaHoraria && (
          <div>
            <span className="pcms-det-meta__rot">Carga horária</span>
            {evento.cargaHoraria}
          </div>
        )}
        {evento.programa && (
          <div>
            <span className="pcms-det-meta__rot">Programa</span>
            {evento.programa}
          </div>
        )}
        {evento.area && (
          <div>
            <span className="pcms-det-meta__rot">Área</span>
            {evento.area}
          </div>
        )}
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          {evento.resumo && (
            <section className="pcms-det-bloco">
              <h2>Resumo</h2>
              <p>{evento.resumo}</p>
            </section>
          )}
          {evento.objetivosHtml && (
            <section className="pcms-det-bloco">
              <h2>Objetivos</h2>
              <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: evento.objetivosHtml }} />
            </section>
          )}
          {evento.conteudoProgramaticoHtml && (
            <section className="pcms-det-bloco">
              <h2>Conteúdo programático</h2>
              <div
                className="pcms-rich"
                dangerouslySetInnerHTML={{ __html: evento.conteudoProgramaticoHtml }}
              />
            </section>
          )}
          {evento.faq.length > 0 && (
            <section className="pcms-det-bloco">
              <h2>Perguntas frequentes</h2>
              {evento.faq.map((f, i) => (
                <div key={i} className="pcms-faq-item">
                  <strong>{f.pergunta}</strong>
                  <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: f.respostaHtml }} />
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="pcms-det-aside">
          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Mídia</div>
            <div className="pcms-det-card__body">
              <CampoUpload
                eventoId={evento.id}
                campo="imagemCapa"
                rotulo="Capa do evento"
                accept="image/*"
                atual={evento.capaNome ?? "Sem capa"}
                onAtualizado={setEvento}
              />
              <CampoUpload
                eventoId={evento.id}
                campo="folderPdf"
                rotulo="Folder (PDF)"
                accept="application/pdf"
                atual={evento.folderPdfNome ?? "Sem folder"}
                onAtualizado={setEvento}
              />
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Inscrição</div>
            <div className="pcms-det-card__body">
              <p>
                <span className="pcms-det-meta__rot">Valor</span>
                {evento.valor ?? "—"}
              </p>
              <p>
                <span className="pcms-det-meta__rot">Status</span>
                {evento.inscricaoAberta ? "Aberta" : "Encerrada"}
              </p>
              {evento.linkInscricao && <p className="pcms-det-link">{evento.linkInscricao}</p>}
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head pcms-det-card__head--acao">
              Palestrantes
              {!gerenciandoPalestrantes && (
                <button
                  type="button"
                  className="pcms-link-acao"
                  onClick={() => setGerenciandoPalestrantes(true)}
                >
                  Gerenciar
                </button>
              )}
            </div>
            <div className="pcms-det-card__body">
              {gerenciandoPalestrantes ? (
                <SeletorPalestrantes
                  eventoId={evento.id}
                  vinculadosIds={evento.palestrantes.map((p) => p.id)}
                  disponiveis={palestrantesDisponiveis}
                  onAtualizado={setEvento}
                  onFechar={() => setGerenciandoPalestrantes(false)}
                />
              ) : evento.palestrantes.length > 0 ? (
                evento.palestrantes.map((p) => (
                  <div key={p.id} className="pcms-det-pessoa">
                    <span className="pcms-avatar" aria-hidden="true">
                      {p.iniciais}
                    </span>
                    <span>
                      <strong>{p.nome}</strong>
                      <small>{p.titulacao}</small>
                    </span>
                  </div>
                ))
              ) : (
                <p className="pcms-seletor__vazio">Nenhum palestrante vinculado.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
