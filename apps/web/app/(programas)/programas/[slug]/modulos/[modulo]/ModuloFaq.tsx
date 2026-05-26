"use client";

import { useState } from "react";

import type { ItemFaqModulo } from "./conteudoModulos";

/**
 * FAQ accordion da página /programas/[slug]/modulos/[modulo]. Espelha o
 * IIFE 5 do protótipo (linhas ~3460-3475 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <p>, <strong>).
 *
 * Mesmo padrão de FaqEvento adaptado às classes .faq-item / .faq-question
 * / .faq-answer / .faq-answer-inner (idênticas neste template).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface ModuloFaqProps {
  itens: ItemFaqModulo[];
}

export function ModuloFaq({ itens }: ModuloFaqProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("modulo_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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
