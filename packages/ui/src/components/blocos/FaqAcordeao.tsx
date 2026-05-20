"use client";

import { useId, useState, type ReactNode } from "react";

export interface FaqItem {
  pergunta: string;
  resposta: ReactNode;
}

export interface FaqAcordeaoProps {
  itens: FaqItem[];
}

export function FaqAcordeao({ itens }: FaqAcordeaoProps) {
  const [aberto, setAberto] = useState<number | null>(null);
  const baseId = useId();

  return (
    <ul className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
      {itens.map((item, i) => {
        const expandido = aberto === i;
        const idBotao = `${baseId}-faq-botao-${i}`;
        const idPainel = `${baseId}-faq-painel-${i}`;
        return (
          <li key={item.pergunta}>
            <button
              id={idBotao}
              type="button"
              aria-expanded={expandido}
              aria-controls={idPainel}
              onClick={() => setAberto(expandido ? null : i)}
              className="flex w-full items-baseline justify-between gap-6 py-6 text-left font-titulo text-h4 text-oxford transition-colors hover:text-cardeal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
            >
              <span>{item.pergunta}</span>
              <span aria-hidden className="font-corpo text-h3 text-grafite-suave">
                {expandido ? "−" : "+"}
              </span>
            </button>
            <div
              id={idPainel}
              role="region"
              aria-labelledby={idBotao}
              hidden={!expandido}
              className="pb-6"
            >
              {item.resposta}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
