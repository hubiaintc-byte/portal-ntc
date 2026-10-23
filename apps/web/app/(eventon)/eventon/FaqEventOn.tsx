"use client";

import { useState } from "react";

import type { ItemFaqEventOn } from "./conteudoEventOn";

/**
 * FAQ acordeão da página /eventon. Espelha o IIFE 3 de
 * 27_Pagina_EventOn_v1.html:
 *
 * - Clique no toggle alterna `is-open` no `div.eo-faq-item` e
 *   `aria-expanded` no `<button>`.
 * - Só o item com `abertoInicial` começa aberto (faq-1, como no protótipo).
 * - Resposta com `dangerouslySetInnerHTML` (contém os <p> e <strong>).
 */

interface FaqEventOnProps {
  itens: ItemFaqEventOn[];
}

export function FaqEventOn({ itens }: FaqEventOnProps) {
  const [abertos, setAbertos] = useState<Set<string>>(
    () => new Set(itens.filter((item) => item.abertoInicial).map((item) => item.id)),
  );

  const alternar = (id: string) => {
    setAbertos((anterior) => {
      const proximo = new Set(anterior);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  return (
    <>
      {itens.map((item) => {
        const aberto = abertos.has(item.id);
        return (
          <div key={item.id} className={`eo-faq-item${aberto ? " is-open" : ""}`}>
            <button
              className="eo-faq-toggle"
              type="button"
              aria-expanded={aberto}
              aria-controls={item.id}
              onClick={() => alternar(item.id)}
            >
              <h3>{item.pergunta}</h3>
              <span className="eo-faq-icon" aria-hidden="true">
                +
              </span>
            </button>
            <div
              className="eo-faq-body"
              id={item.id}
              dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
            />
          </div>
        );
      })}
    </>
  );
}
