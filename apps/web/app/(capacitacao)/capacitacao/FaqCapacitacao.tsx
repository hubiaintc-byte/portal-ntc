"use client";

import { useState } from "react";

import type { ItemFaqCap } from "./conteudoCapacitacao";

/**
 * FAQ acordeão da página /capacitacao. Espelha o IIFE do protótipo
 * (linhas 2571-2584 de 27_Pagina_Capacitacao_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<article class="cap-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // No-op intencional para manter call sites prontos.
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqCapacitacaoProps {
  itens: ItemFaqCap[];
}

export function FaqCapacitacao({ itens }: FaqCapacitacaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("cap_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
      return next;
    });
  };

  return (
    <>
      {itens.map((item) => {
        const aberto = abertos.has(item.id);
        return (
          <article
            key={item.id}
            className={`cap-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="cap-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="cap-faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="cap-faq-body" id={item.id}>
              <div
                className="cap-faq-body-inner"
                dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
              />
            </div>
          </article>
        );
      })}
    </>
  );
}
