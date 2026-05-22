"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoIndex";

/**
 * `FaqAcordeao` — acordeão da seção FAQ. Reproduz `.faq-item` dos
 * 15 HTMLs de programa. Apenas um item aberto por vez; aria-expanded
 * atualizado para a11y.
 */
export function FaqAcordeao({ itens }: { itens: FaqItem[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {itens.map((item, idx) => {
        const isAberto = aberto === idx;
        return (
          <div key={idx} className={`faq-item${isAberto ? " is-open" : ""}`}>
            <button
              type="button"
              className="faq-question"
              aria-expanded={isAberto}
              onClick={() => setAberto(isAberto ? null : idx)}
            >
              {item.pergunta}
            </button>
            <div className="faq-answer">
              <div className="faq-answer-inner">{item.resposta}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
