"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoFallback";

/**
 * `FaqAcordeao` — Client Component que reproduz o comportamento de
 * acordeão dos `.faq-item` do 07_Pagina_Vertical_NTC_*.html.
 *
 * Apenas um item aberto por vez. Toggle por clique no botão; aria-expanded
 * atualizado para a11y. A animação de `max-height` vem do CSS portado
 * (`verticais-prototipo.css`).
 */
export function FaqAcordeao({ items }: { items: FaqItem[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {items.map((item, idx) => {
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
