"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoCorpoDocente";

interface FaqAcordeaoProps {
  items: FaqItem[];
}

function html(s: string) {
  return { __html: s };
}

export function FaqAcordeao({ items }: FaqAcordeaoProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="docentes-faq" id="faq" aria-label="Perguntas frequentes sobre o corpo docente">
      <div className="container">
        <div className="docentes-faq-inner">
          <div className="docentes-faq-head fade-in">
            <p className="eyebrow">Tudo sobre a curadoria</p>
            <h2>
              Perguntas <em>frequentes</em>
            </h2>
          </div>

          {items.map((item) => {
            const isOpen = open.has(item.id);
            return (
              <div key={item.id} className={`docentes-faq-item ${isOpen ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="docentes-faq-toggle"
                  aria-expanded={isOpen}
                  aria-controls={item.id}
                  onClick={() => toggle(item.id)}
                >
                  <h3>{item.titulo}</h3>
                  <span className="docentes-faq-icon" aria-hidden="true">
                    +
                  </span>
                </button>
                <div className="docentes-faq-body" id={item.id}>
                  {item.parags.map((p, i) => (
                    <p key={i} dangerouslySetInnerHTML={html(p)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
