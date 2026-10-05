"use client";

import { useId } from "react";

interface CampoItem<T> {
  chave: keyof T & string;
  rotulo: string;
  area?: boolean;
}

interface EditorListaCatalogoProps<T> {
  rotulo: string;
  /** "Eixo", "Diferencial", "Resultado" — usado em "Eixo 2" e nos nomes acessíveis dos botões. */
  rotuloItem: string;
  itens: T[];
  onMudar: (itens: T[]) => void;
  novo: () => T;
  campos: CampoItem<T>[];
}

/** Lista editável do catálogo: adicionar, remover e reordenar por botões (acessível por teclado). */
export function EditorListaCatalogo<T extends { [K in keyof T]: string }>({ rotulo, rotuloItem, itens, onMudar, novo, campos }: EditorListaCatalogoProps<T>) {
  const base = useId();

  function mudar(i: number, chave: keyof T & string, valor: string) {
    onMudar(itens.map((it, j) => (j === i ? { ...it, [chave]: valor } : it)));
  }
  function mover(i: number, delta: -1 | 1) {
    const j = i + delta;
    if (j < 0 || j >= itens.length) return;
    const copia = [...itens];
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
    onMudar(copia);
  }

  return (
    <section className="pcms-det-bloco">
      <h2>{rotulo}</h2>
      {itens.length === 0 && <p>Nenhum item.</p>}
      <ol className="pcms-lista-catalogo">
        {itens.map((it, i) => (
          <li key={i} className="pcms-lista-catalogo__item">
            <p className="pcms-lista-catalogo__titulo">
              {rotuloItem} {i + 1}
            </p>
            {campos.map((c) => {
              const id = `${base}-${i}-${c.chave}`;
              return (
                <div key={c.chave} className="pcms-field">
                  <label htmlFor={id}>{c.rotulo}</label>
                  {c.area ? (
                    <textarea id={id} rows={3} value={it[c.chave]} onChange={(e) => mudar(i, c.chave, e.target.value)} />
                  ) : (
                    <input id={id} type="text" value={it[c.chave]} onChange={(e) => mudar(i, c.chave, e.target.value)} />
                  )}
                </div>
              );
            })}
            <div className="pcms-lista-catalogo__acoes">
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={i === 0} onClick={() => mover(i, -1)} aria-label={`Mover ${rotuloItem} ${i + 1} para cima`}>
                ↑
              </button>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={i === itens.length - 1} onClick={() => mover(i, 1)} aria-label={`Mover ${rotuloItem} ${i + 1} para baixo`}>
                ↓
              </button>
              <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onMudar(itens.filter((_, j) => j !== i))} aria-label={`Remover ${rotuloItem} ${i + 1}`}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onMudar([...itens, novo()])}>
        Adicionar {rotuloItem.toLowerCase()}
      </button>
    </section>
  );
}
