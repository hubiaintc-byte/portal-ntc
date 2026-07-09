"use client";

import { useState, useTransition } from "react";

import type { EventoCmsDetalhe, PalestranteCmsResumo } from "@/lib/cms/painelCms";
import type { CamposEventoCompletos } from "@/lib/cms/painelCmsEscrita";

import { alternarPublicacaoEvento, salvarEvento } from "./acoes";
import { CampoUpload } from "./CampoUpload";
import { SeletorPalestrantes } from "./SeletorPalestrantes";

const ROTULO_STATUS: Record<EventoCmsDetalhe["status"], string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
};

const MODALIDADES = [
  { valor: "", rotulo: "— selecionar —" },
  { valor: "online", rotulo: "Online" },
  { valor: "presencial", rotulo: "Presencial" },
  { valor: "hibrido", rotulo: "Híbrido" },
];

/** Monta o estado editável a partir do detalhe carregado. */
function camposDe(evento: EventoCmsDetalhe): CamposEventoCompletos {
  return {
    nome: evento.titulo,
    dataInicio: evento.dataInicioISO ?? "",
    dataFim: evento.dataFimISO ?? "",
    resumo: evento.resumo ?? "",
    modalidade: evento.modalidadeValor ?? "",
    cargaHoraria: evento.cargaHoraria ?? "",
    valor: evento.valor ?? "",
    linkInscricaoExterna: evento.linkInscricao ?? "",
    localNome: evento.localNome ?? "",
    localEndereco: evento.localEndereco ?? "",
    localCidade: evento.localCidade ?? "",
    localEstado: evento.localEstado ?? "",
    replayDisponivel: evento.replayDisponivel,
    prazoReplay: evento.prazoReplay ?? "",
    publicoAlvoTexto: evento.publicoAlvoTexto,
    objetivosTexto: evento.objetivosTexto,
    conteudoProgramaticoTexto: evento.conteudoProgramaticoTexto,
    programacaoDetalhada: evento.programacaoDetalhada.map((p) => ({ ...p })),
    diferenciais: evento.diferenciais.map((d) => ({ ...d })),
    faq: evento.faqEditavel.map((f) => ({ ...f })),
  };
}

interface DetalheEventoProps {
  evento: EventoCmsDetalhe;
  palestrantesDisponiveis: PalestranteCmsResumo[];
  onVoltar: () => void;
  /** true ⇒ abre direto no modo de edição (revisão pós-importação de PDF). */
  edicaoInicial?: boolean;
}

/** Tela cheia de detalhe de um evento — leitura + edição completa via CMS. */
export function DetalheEvento({
  evento: eventoInicial,
  palestrantesDisponiveis,
  onVoltar,
  edicaoInicial = false,
}: DetalheEventoProps) {
  const [evento, setEvento] = useState(eventoInicial);
  const [editando, setEditando] = useState(edicaoInicial);
  const [gerenciandoPalestrantes, setGerenciandoPalestrantes] = useState(false);
  const [salvando, iniciarSalvar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [campos, setCampos] = useState<CamposEventoCompletos>(() => camposDe(eventoInicial));

  function mudar<K extends keyof CamposEventoCompletos>(chave: K, valor: CamposEventoCompletos[K]) {
    setCampos((c) => ({ ...c, [chave]: valor }));
  }

  function mudarLinha<K extends "programacaoDetalhada" | "diferenciais" | "faq">(
    chave: K,
    indice: number,
    linha: CamposEventoCompletos[K][number],
  ) {
    setCampos((c) => {
      const lista = [...c[chave]] as CamposEventoCompletos[K];
      lista[indice] = linha;
      return { ...c, [chave]: lista };
    });
  }

  function removerLinha(chave: "programacaoDetalhada" | "diferenciais" | "faq", indice: number) {
    setCampos((c) => ({ ...c, [chave]: c[chave].filter((_, i) => i !== indice) }));
  }

  function abrirEdicao() {
    setCampos(camposDe(evento));
    setErro(null);
    setEditando(true);
  }

  function salvar() {
    setErro(null);
    iniciarSalvar(async () => {
      const { resultado, evento: atualizado } = await salvarEvento(evento.id, campos);
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
            <input
              id="ed-nome"
              type="text"
              value={campos.nome}
              onChange={(e) => mudar("nome", e.target.value)}
            />
          </div>
          <div className="pcms-field">
            <label htmlFor="ed-resumo">Resumo (até 280 caracteres)</label>
            <textarea
              id="ed-resumo"
              rows={3}
              maxLength={280}
              value={campos.resumo}
              onChange={(e) => mudar("resumo", e.target.value)}
            />
          </div>

          <div className="pcms-editor__grid">
            <div className="pcms-field">
              <label htmlFor="ed-data">Data de início</label>
              <input
                id="ed-data"
                type="date"
                value={campos.dataInicio}
                onChange={(e) => mudar("dataInicio", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-data-fim">Data de término (opcional)</label>
              <input
                id="ed-data-fim"
                type="date"
                value={campos.dataFim}
                onChange={(e) => mudar("dataFim", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-modalidade">Modalidade</label>
              <select
                id="ed-modalidade"
                value={campos.modalidade}
                onChange={(e) => mudar("modalidade", e.target.value)}
              >
                {MODALIDADES.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.rotulo}
                  </option>
                ))}
              </select>
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-carga">Carga horária</label>
              <input
                id="ed-carga"
                type="text"
                value={campos.cargaHoraria}
                onChange={(e) => mudar("cargaHoraria", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-valor">Valor (ex.: R$ 1.470)</label>
              <input
                id="ed-valor"
                type="text"
                value={campos.valor}
                onChange={(e) => mudar("valor", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-link">Link de inscrição externa</label>
              <input
                id="ed-link"
                type="url"
                value={campos.linkInscricaoExterna}
                onChange={(e) => mudar("linkInscricaoExterna", e.target.value)}
              />
            </div>
          </div>

          <div className="pcms-editor__grid">
            <div className="pcms-field">
              <label htmlFor="ed-local-nome">Local / plataforma</label>
              <input
                id="ed-local-nome"
                type="text"
                value={campos.localNome}
                onChange={(e) => mudar("localNome", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-local-endereco">Endereço</label>
              <input
                id="ed-local-endereco"
                type="text"
                value={campos.localEndereco}
                onChange={(e) => mudar("localEndereco", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-local-cidade">Cidade</label>
              <input
                id="ed-local-cidade"
                type="text"
                value={campos.localCidade}
                onChange={(e) => mudar("localCidade", e.target.value)}
              />
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-local-uf">UF</label>
              <input
                id="ed-local-uf"
                type="text"
                maxLength={2}
                value={campos.localEstado}
                onChange={(e) => mudar("localEstado", e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="pcms-editor__grid">
            <div className="pcms-field pcms-field--check">
              <label htmlFor="ed-replay">
                <input
                  id="ed-replay"
                  type="checkbox"
                  checked={campos.replayDisponivel}
                  onChange={(e) => mudar("replayDisponivel", e.target.checked)}
                />
                Replay disponível
              </label>
            </div>
            <div className="pcms-field">
              <label htmlFor="ed-prazo-replay">Replay disponível até</label>
              <input
                id="ed-prazo-replay"
                type="date"
                value={campos.prazoReplay}
                onChange={(e) => mudar("prazoReplay", e.target.value)}
                disabled={!campos.replayDisponivel}
              />
            </div>
          </div>

          <p className="pcms-editor__hint">
            Nos campos de texto abaixo, cada linha vira um parágrafo; linhas iniciadas com
            &quot;-&nbsp;&quot; viram itens de lista.
          </p>
          <div className="pcms-field">
            <label htmlFor="ed-publico">Público-alvo</label>
            <textarea
              id="ed-publico"
              rows={5}
              value={campos.publicoAlvoTexto}
              onChange={(e) => mudar("publicoAlvoTexto", e.target.value)}
            />
          </div>
          <div className="pcms-field">
            <label htmlFor="ed-objetivos">Objetivos</label>
            <textarea
              id="ed-objetivos"
              rows={7}
              value={campos.objetivosTexto}
              onChange={(e) => mudar("objetivosTexto", e.target.value)}
            />
          </div>
          <div className="pcms-field">
            <label htmlFor="ed-conteudo">Conteúdo programático</label>
            <textarea
              id="ed-conteudo"
              rows={10}
              value={campos.conteudoProgramaticoTexto}
              onChange={(e) => mudar("conteudoProgramaticoTexto", e.target.value)}
            />
          </div>

          <div className="pcms-editor__head pcms-editor__head--sub">
            Programação detalhada
            <button
              type="button"
              className="pcms-link-acao"
              onClick={() =>
                mudar("programacaoDetalhada", [
                  ...campos.programacaoDetalhada,
                  { horario: "", titulo: "", descricao: "" },
                ])
              }
            >
              Adicionar sessão
            </button>
          </div>
          {campos.programacaoDetalhada.map((sessao, i) => (
            <div key={i} className="pcms-editor__linha">
              <div className="pcms-field pcms-field--curto">
                <label htmlFor={`ed-prog-h-${i}`}>Horário</label>
                <input
                  id={`ed-prog-h-${i}`}
                  type="text"
                  placeholder="08h00 – 10h00"
                  value={sessao.horario}
                  onChange={(e) =>
                    mudarLinha("programacaoDetalhada", i, { ...sessao, horario: e.target.value })
                  }
                />
              </div>
              <div className="pcms-field">
                <label htmlFor={`ed-prog-t-${i}`}>Título</label>
                <input
                  id={`ed-prog-t-${i}`}
                  type="text"
                  value={sessao.titulo}
                  onChange={(e) =>
                    mudarLinha("programacaoDetalhada", i, { ...sessao, titulo: e.target.value })
                  }
                />
              </div>
              <div className="pcms-field">
                <label htmlFor={`ed-prog-d-${i}`}>Descrição</label>
                <input
                  id={`ed-prog-d-${i}`}
                  type="text"
                  value={sessao.descricao}
                  onChange={(e) =>
                    mudarLinha("programacaoDetalhada", i, { ...sessao, descricao: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="pcms-link-acao pcms-link-acao--remover"
                onClick={() => removerLinha("programacaoDetalhada", i)}
              >
                Remover
              </button>
            </div>
          ))}

          <div className="pcms-editor__head pcms-editor__head--sub">
            Diferenciais
            <button
              type="button"
              className="pcms-link-acao"
              onClick={() =>
                mudar("diferenciais", [...campos.diferenciais, { titulo: "", descricao: "" }])
              }
            >
              Adicionar diferencial
            </button>
          </div>
          {campos.diferenciais.map((dif, i) => (
            <div key={i} className="pcms-editor__linha">
              <div className="pcms-field pcms-field--curto">
                <label htmlFor={`ed-dif-t-${i}`}>Título (opcional)</label>
                <input
                  id={`ed-dif-t-${i}`}
                  type="text"
                  value={dif.titulo}
                  onChange={(e) => mudarLinha("diferenciais", i, { ...dif, titulo: e.target.value })}
                />
              </div>
              <div className="pcms-field">
                <label htmlFor={`ed-dif-d-${i}`}>Descrição</label>
                <input
                  id={`ed-dif-d-${i}`}
                  type="text"
                  value={dif.descricao}
                  onChange={(e) =>
                    mudarLinha("diferenciais", i, { ...dif, descricao: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="pcms-link-acao pcms-link-acao--remover"
                onClick={() => removerLinha("diferenciais", i)}
              >
                Remover
              </button>
            </div>
          ))}

          <div className="pcms-editor__head pcms-editor__head--sub">
            Perguntas frequentes
            <button
              type="button"
              className="pcms-link-acao"
              onClick={() => mudar("faq", [...campos.faq, { pergunta: "", respostaTexto: "" }])}
            >
              Adicionar pergunta
            </button>
          </div>
          {campos.faq.map((item, i) => (
            <div key={i} className="pcms-editor__linha pcms-editor__linha--faq">
              <div className="pcms-field">
                <label htmlFor={`ed-faq-p-${i}`}>Pergunta</label>
                <input
                  id={`ed-faq-p-${i}`}
                  type="text"
                  value={item.pergunta}
                  onChange={(e) => mudarLinha("faq", i, { ...item, pergunta: e.target.value })}
                />
              </div>
              <div className="pcms-field">
                <label htmlFor={`ed-faq-r-${i}`}>Resposta</label>
                <textarea
                  id={`ed-faq-r-${i}`}
                  rows={2}
                  value={item.respostaTexto}
                  onChange={(e) => mudarLinha("faq", i, { ...item, respostaTexto: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="pcms-link-acao pcms-link-acao--remover"
                onClick={() => removerLinha("faq", i)}
              >
                Remover
              </button>
            </div>
          ))}

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
          {evento.publicoAlvoHtml && (
            <section className="pcms-det-bloco">
              <h2>Público-alvo</h2>
              <div
                className="pcms-rich"
                dangerouslySetInnerHTML={{ __html: evento.publicoAlvoHtml }}
              />
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
          {evento.programacaoDetalhada.length > 0 && (
            <section className="pcms-det-bloco">
              <h2>Programação detalhada</h2>
              {evento.programacaoDetalhada.map((p, i) => (
                <div key={i} className="pcms-faq-item">
                  <strong>
                    {p.horario} · {p.titulo}
                  </strong>
                  {p.descricao && <div className="pcms-rich">{p.descricao}</div>}
                </div>
              ))}
            </section>
          )}
          {evento.diferenciais.length > 0 && (
            <section className="pcms-det-bloco">
              <h2>Diferenciais</h2>
              <ul className="pcms-det-lista">
                {evento.diferenciais.map((d, i) => (
                  <li key={i}>{[d.titulo, d.descricao].filter(Boolean).join(" — ")}</li>
                ))}
              </ul>
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
