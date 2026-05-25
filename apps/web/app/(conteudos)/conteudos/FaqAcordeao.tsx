"use client";

import { useState } from "react";

import type { ItemFaq } from "./conteudoConteudos";

/**
 * FAQ acordeão da página /conteudos. Espelha o IIFE do protótipo
 * (linhas 2462-2476 de 28_Pagina_Conteudos_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<article class="cont-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens começam fechados.
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
}

interface FaqAcordeaoProps {
  itens: ItemFaq[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(() => new Set());

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("cont_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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
            className={`cont-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="cont-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="cont-faq-icon" aria-hidden="true">+</span>
            </button>
            <div className="cont-faq-body" id={item.id}>
              <div
                className="cont-faq-body-inner"
                dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
              />
            </div>
          </article>
        );
      })}
    </>
  );
}
