"use client";

import { useState } from "react";

import type { ItemFaqEvento } from "./conteudoEventos";

/**
 * FAQ accordion da página /agenda/[slug]. Espelha o IIFE 5 do protótipo
 * (linhas ~2960-2980 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <p>, <strong>).
 *
 * Mesmo padrão de FaqCapacitacao adaptado às classes .faq-item / .faq-question
 * / .faq-answer / .faq-answer-inner.
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqEventoProps {
  itens: ItemFaqEvento[];
}

export function FaqEvento({ itens }: FaqEventoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("evento_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
      return next;
    });
  };

  return (
    <>
      {itens.map((item) => {
        const aberto = abertos.has(item.id);
        return (
          <div
            key={item.id}
            className={`faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="faq-question"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              {item.pergunta}
            </button>
            <div className="faq-answer" id={item.id}>
              <div
                className="faq-answer-inner"
                dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
