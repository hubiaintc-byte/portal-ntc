"use client";

import { useMemo, useState, useTransition } from "react";

import type { EventoCmsResumo } from "@/lib/cms/painelCms";

import { salvarEventosDestaqueHome } from "./acoes";

interface TelaHomeProps {
  eventos: EventoCmsResumo[];
  selecionadosIniciais: string[];
}

const ROTULO_STATUS: Record<string, string> = {
  publicado: "Publicado",
  agendado: "Agendado",
  rascunho: "Rascunho",
};

/**
 * Curadoria da Home — define QUAIS eventos aparecem na seção de agenda da
 * página inicial e em QUE ORDEM.
 *
 * Dois painéis: "Na Home" (ordenados, com posição e setas ↑/↓) e
 * "Disponíveis" (demais eventos, com ação de adicionar). A ordem da lista
 * "Na Home" é a ordem persistida no Global home (eventosAgendaDestaque).
 */
export function TelaHome({ eventos, selecionadosIniciais }: TelaHomeProps) {
  // `ordem` guarda os ids na Home, NA SEQUÊNCIA de exibição.
  const [ordem, setOrdem] = useState<string[]>(() =>
    selecionadosIniciais.filter((id) => eventos.some((e) => e.id === id)),
  );
  const [salvando, iniciar] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackOk, setFeedbackOk] = useState(false);

  const porId = useMemo(() => new Map(eventos.map((e) => [e.id, e])), [eventos]);
  const naHome = ordem.map((id) => porId.get(id)).filter((e): e is EventoCmsResumo => Boolean(e));
  const disponiveis = eventos.filter((e) => !ordem.includes(e.id));

  function adicionar(id: string) {
    setOrdem((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function remover(id: string) {
    setOrdem((prev) => prev.filter((x) => x !== id));
  }

  function mover(indice: number, direcao: -1 | 1) {
    setOrdem((prev) => {
      const alvo = indice + direcao;
      if (alvo < 0 || alvo >= prev.length) return prev;
      const novo = [...prev];
      const atual = novo[indice];
      const vizinho = novo[alvo];
      if (atual === undefined || vizinho === undefined) return prev;
      novo[indice] = vizinho;
      novo[alvo] = atual;
      return novo;
    });
  }

  function salvar() {
    setFeedback(null);
    iniciar(async () => {
      const resultado = await salvarEventosDestaqueHome(ordem);
      setFeedbackOk(resultado.ok);
      setFeedback(resultado.ok ? "Destaques da Home atualizados." : (resultado.erro ?? "Erro ao salvar."));
    });
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Curadoria</p>
          <h1>Home</h1>
          <p>Defina quais eventos aparecem na seção de agenda da página inicial e em que ordem.</p>
        </div>
        <button type="button" className="pcms-btn" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando…" : `Salvar (${naHome.length})`}
        </button>
      </div>

      {feedback && (
        <p className={`pcms-aviso${feedbackOk ? " pcms-aviso--ok" : " pcms-aviso--erro"}`}>{feedback}</p>
      )}

      <div className="pcms-curadoria">
        {/* ---------- Painel: eventos na Home (ordenados) ---------- */}
        <section className="pcms-painel">
          <div className="pcms-painel__head">
            Na Home <span className="pcms-painel__contagem">{naHome.length}</span>
          </div>

          {naHome.length === 0 ? (
            <p className="pcms-curadoria__vazio">
              Nenhum evento na Home ainda. Adicione eventos pela lista de disponíveis abaixo.
            </p>
          ) : (
            <ol className="pcms-home-lista">
              {naHome.map((e, i) => (
                <li key={e.id} className="pcms-home-row">
                  <span className="pcms-home-row__pos" aria-hidden="true">
                    {i + 1}
                  </span>

                  <span className="pcms-home-row__txt">
                    <strong>{e.titulo}</strong>
                    <small>
                      {e.data} · {e.modalidade}
                      {e.programa ? ` · ${e.programa}` : ""}
                    </small>
                  </span>

                  <span className={`pcms-selo pcms-selo--${e.status}`}>
                    {ROTULO_STATUS[e.status] ?? e.status}
                  </span>

                  <span className="pcms-home-row__acoes">
                    <button
                      type="button"
                      className="pcms-iconbtn"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      aria-label={`Mover "${e.titulo}" para cima`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 19V6M6 12l6-6 6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="pcms-iconbtn"
                      onClick={() => mover(i, 1)}
                      disabled={i === naHome.length - 1}
                      aria-label={`Mover "${e.titulo}" para baixo`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 5v13M18 12l-6 6-6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="pcms-iconbtn pcms-iconbtn--remover"
                      onClick={() => remover(e.id)}
                      aria-label={`Remover "${e.titulo}" da Home`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* ---------- Painel: eventos disponíveis ---------- */}
        <section className="pcms-painel">
          <div className="pcms-painel__head">
            Disponíveis <span className="pcms-painel__contagem">{disponiveis.length}</span>
          </div>

          {disponiveis.length === 0 ? (
            <p className="pcms-curadoria__vazio">
              {eventos.length === 0
                ? "Nenhum evento cadastrado."
                : "Todos os eventos já estão na Home."}
            </p>
          ) : (
            <ul className="pcms-home-lista">
              {disponiveis.map((e) => (
                <li key={e.id} className="pcms-home-row">
                  <span className="pcms-home-row__txt">
                    <strong>{e.titulo}</strong>
                    <small>
                      {e.data} · {e.modalidade}
                      {e.programa ? ` · ${e.programa}` : ""}
                    </small>
                  </span>

                  <span className={`pcms-selo pcms-selo--${e.status}`}>
                    {ROTULO_STATUS[e.status] ?? e.status}
                  </span>

                  <button
                    type="button"
                    className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                    onClick={() => adicionar(e.id)}
                  >
                    Adicionar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
