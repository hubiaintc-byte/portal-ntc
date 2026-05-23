"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoContato";

interface FaqAccordionProps {
  items: readonly FaqItem[];
}

/**
 * Accordion da FAQ da página /contato (porta do bloco 5 do script
 * de 12_Pagina_Contato_v1.html).
 *
 * O primeiro item começa aberto (campo `abertaPorDefault`); toggle
 * via clique no botão `.faq-q`. Atualiza `aria-expanded` e a classe
 * `is-open` do `.faq-item`.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const [aberto, setAberto] = useState<ReadonlySet<string>>(
    () => new Set(items.filter((i) => i.abertaPorDefault).map((i) => i.id)),
  );

  const toggle = (id: string) => {
    setAberto((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  return (
    <div className="faq-list">
      {items.map((item) => {
        const isOpen = aberto.has(item.id);
        return (
          <div
            key={item.id}
            className={`faq-item${isOpen ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              {item.pergunta}
            </button>
            <div
              className="faq-a"
              dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
            />
          </div>
        );
      })}
    </div>
  );
}
