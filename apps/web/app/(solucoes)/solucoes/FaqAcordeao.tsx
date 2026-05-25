"use client";

import { useState } from "react";

import type { ItemFaq } from "./conteudoSolucoes";

/**
 * FAQ acordeão da página /solucoes. Espelha o IIFE do protótipo (linhas
 * 2228-2241 de 26_Pagina_Solucoes_v1.html):
 *
 * - Clique no toggle alterna a classe `is-open` no `<div class="sol-faq-item">`
 *   e o atributo `aria-expanded` no `<button>`.
 * - Itens com `arrancaAberto: true` começam expandidos (faq-1).
 * - Resposta renderizada com `dangerouslySetInnerHTML` (contém <strong>, <a>, <p>).
 */

function track(_action: string, _payload?: Record<string, unknown>) {
  // TODO: integrar GA4/Mixpanel quando disponível.
  // No-op intencional para manter call sites prontos.
}

interface FaqAcordeaoProps {
  itens: ItemFaq[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [abertos, setAbertos] = useState<Set<string>>(
    () => new Set(itens.filter((i) => i.arrancaAberto).map((i) => i.id)),
  );

  const toggle = (id: string, pergunta: string) => {
    setAbertos((prev) => {
      const next = new Set(prev);
      const ficaraAberto = !next.has(id);
      if (ficaraAberto) next.add(id);
      else next.delete(id);
      track("sol_faq_toggle", { open: ficaraAberto, q: pergunta.slice(0, 60) });
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
            className={`sol-faq-item${aberto ? " is-open" : ""}`}
          >
            <button
              className="sol-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => toggle(item.id, item.pergunta)}
            >
              <h3>{item.pergunta}</h3>
              <span className="sol-faq-icon" aria-hidden="true">+</span>
            </button>
            <div
              className="sol-faq-body"
              id={item.id}
              dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
            />
          </div>
        );
      })}
    </>
  );
}
