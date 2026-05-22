"use client";

import { useState } from "react";

import type { DetalhamentoItem } from "./conteudoIndex";

interface ModulosAcordeaoProps {
  itens: DetalhamentoItem[];
  slug: string;
}

/**
 * `ModulosAcordeao` — acordeão da seção Detalhamento. Reproduz
 * `.module-detail` / `.module-detail-item` dos protótipos HTML.
 * Apenas um item aberto por vez; aria-expanded atualizado para a11y.
 * Items com ctaInscricao exibem CTA "Ver módulo aberto · próxima turma →".
 */
export function ModulosAcordeao({ itens, slug }: ModulosAcordeaoProps) {
  const [aberto, setAberto] = useState<number | null>(null);

  return (
    <div className="module-detail">
      {itens.map((item, idx) => {
        const isAberto = aberto === idx;
        return (
          <div key={idx} className={`module-detail-item${isAberto ? " is-open" : ""}`}>
            <button
              type="button"
              className="module-detail-head"
              aria-expanded={isAberto}
              onClick={() => setAberto(isAberto ? null : idx)}
            >
              <span className="md-num">{item.numero}</span>
              <span className="md-title">{item.titulo}</span>
              <span className="md-ch">{item.cargaHoraria}</span>
            </button>
            <div className="module-detail-body">
              <div className="module-detail-body-inner">
                <p>{item.descricao}</p>
                {item.topicos.length > 0 ? (
                  <ul>
                    {item.topicos.map((t, ti) => (
                      <li key={ti}>{t}</li>
                    ))}
                  </ul>
                ) : null}
                {item.ctaInscricao ? (
                  <a
                    href={`/contato/proposta?programa=${slug}&modulo=${item.numero}`}
                    className="open-module-cta"
                  >
                    Ver módulo aberto · próxima turma →
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
