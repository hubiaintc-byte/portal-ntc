"use client";

import { useState, useTransition } from "react";

import type { CardCorpoDocenteResumo } from "@/lib/cms/painelCms";

import { salvarOrdemCorpoDocente } from "./acoes";
import { AvisoForm } from "./crm/CamposCrm";

interface TelaCorpoDocenteProps {
  /** null enquanto a primeira leitura não terminou. */
  cards: CardCorpoDocenteResumo[] | null;
  carregando: boolean;
  erroCarga: string | null;
  onAbrirPalestrante: (id: string) => void;
  onSalvou: (cards: CardCorpoDocenteResumo[]) => void;
}

/**
 * Ordem dos cards de pessoa do Corpo Docente (Global `corpo-docente`).
 * Incluir ou tirar alguém não é feito aqui: é no formulário do palestrante.
 */
export function TelaCorpoDocente({
  cards,
  carregando,
  erroCarga,
  onAbrirPalestrante,
  onSalvou,
}: TelaCorpoDocenteProps) {
  const [ordem, setOrdem] = useState<string[]>(() => (cards ?? []).map((c) => c.especialistaId));
  // Nova leitura do servidor reinicia a ordem local (ajuste de estado durante
  // a renderização, padrão do React para derivar estado de props).
  const [cardsBase, setCardsBase] = useState(cards);
  if (cards !== cardsBase) {
    setCardsBase(cards);
    setOrdem((cards ?? []).map((c) => c.especialistaId));
  }
  const [salvando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const original = (cards ?? []).map((c) => c.especialistaId);
  const porId = new Map((cards ?? []).map((c) => [c.especialistaId, c]));
  const lista = ordem.map((id) => porId.get(id)).filter((c): c is CardCorpoDocenteResumo => Boolean(c));
  const mudou = ordem.join(",") !== original.join(",");

  function mover(indice: number, direcao: -1 | 1) {
    setSalvo(false);
    setOrdem((prev) => {
      const alvo = indice + direcao;
      const atual = prev[indice];
      const vizinho = prev[alvo];
      if (atual === undefined || vizinho === undefined) return prev;
      const novo = [...prev];
      novo[indice] = vizinho;
      novo[alvo] = atual;
      return novo;
    });
  }

  function salvar() {
    setErro(null);
    setSalvo(false);
    iniciar(async () => {
      try {
        const { resultado, cards: relidos } = await salvarOrdemCorpoDocente(ordem);
        if (resultado.ok && relidos) {
          setSalvo(true);
          onSalvou(relidos);
        } else {
          setErro(resultado.erro ?? "Não foi possível salvar a ordem.");
        }
      } catch {
        setErro("Não foi possível salvar a ordem. Tente de novo.");
      }
    });
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Corpo docente</p>
          <h1>Corpo Docente</h1>
          <p>
            Ordem dos cards na página pública. Para incluir ou tirar alguém, abra o palestrante.
          </p>
        </div>
        <button type="button" className="pcms-btn" onClick={salvar} disabled={!mudou || salvando}>
          {salvando ? "Salvando…" : "Salvar ordem"}
        </button>
      </div>

      <AvisoForm erro={erroCarga ?? erro} />
      {salvo && (
        <p className="pcms-aviso pcms-aviso--ok" role="status">
          Ordem do Corpo Docente atualizada.
        </p>
      )}

      <section className="pcms-painel">
        {cards === null ? (
          <p className="pcms-curadoria__vazio">{carregando ? "Carregando…" : "Sem dados para mostrar."}</p>
        ) : lista.length === 0 ? (
          <p className="pcms-curadoria__vazio">Nenhum card de pessoa no Corpo Docente.</p>
        ) : (
          <ol className="pcms-home-lista">
            {lista.map((c, i) => (
              <li key={c.especialistaId} className="pcms-home-row">
                <span className="pcms-home-row__pos" aria-hidden="true">
                  {i + 1}
                </span>

                {c.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura do painel, URL do storage
                  <img className="pcms-avatar pcms-avatar--foto" src={c.fotoUrl} alt="" />
                ) : (
                  <span className="pcms-avatar" aria-hidden="true">
                    {c.nome.charAt(0)}
                  </span>
                )}

                <span className="pcms-home-row__txt">
                  <button
                    type="button"
                    className="pcms-btn pcms-btn--ghost pcms-btn--mini"
                    onClick={() => onAbrirPalestrante(c.especialistaId)}
                  >
                    {c.nome}
                  </button>
                </span>

                <span className="pcms-selo pcms-selo--destaque">
                  {c.formato === "featured" ? "Destaque" : "Card comum"}
                </span>
                {c.ocultarDoSite && <span className="pcms-selo pcms-selo--oculto">Oculto do site</span>}

                <span className="pcms-home-row__acoes">
                  <button
                    type="button"
                    className="pcms-iconbtn"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0 || salvando}
                    aria-label={`Subir ${c.nome}`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 19V6M6 12l6-6 6 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="pcms-iconbtn"
                    onClick={() => mover(i, 1)}
                    disabled={i === lista.length - 1 || salvando}
                    aria-label={`Descer ${c.nome}`}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5v13M18 12l-6 6-6-6" />
                    </svg>
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
