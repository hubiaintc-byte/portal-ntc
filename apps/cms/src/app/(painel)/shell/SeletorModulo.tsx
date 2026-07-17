"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { ModuloPainel } from "./ShellPainel";

interface OpcaoModulo {
  id: ModuloPainel;
  rotulo: string;
  descricao: string;
  href: string;
}

const OPCOES: OpcaoModulo[] = [
  { id: "site", rotulo: "Site", descricao: "Conteúdo editorial", href: "/" },
  { id: "crm", rotulo: "CRM", descricao: "Comercial", href: "/crm" },
];

/** Droplist de módulo (workspace switcher) da sidebar do painel. */
export function SeletorModulo({ modulo }: { modulo: ModuloPainel }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(e: MouseEvent) {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  const atual = OPCOES.find((o) => o.id === modulo);
  if (!atual) return null;

  return (
    <div className="pcms-seletor" ref={raiz}>
      <button
        type="button"
        className="pcms-seletor__botao"
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => setAberto((v) => !v)}
      >
        <span className="pcms-seletor__textos">
          <span className="pcms-seletor__modulo">{atual.rotulo}</span>
          <span className="pcms-seletor__desc">{atual.descricao}</span>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="pcms-seletor__seta">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {aberto && (
        <div className="pcms-seletor__menu" role="menu" aria-label="Trocar de módulo">
          {OPCOES.map((o) => (
            <Link
              key={o.id}
              role="menuitem"
              href={o.href}
              className={`pcms-seletor__opcao${o.id === modulo ? " pcms-seletor__opcao--ativa" : ""}`}
              aria-current={o.id === modulo ? "page" : undefined}
              onClick={() => setAberto(false)}
            >
              <span className="pcms-seletor__modulo">{o.rotulo}</span>
              <span className="pcms-seletor__desc">{o.descricao}</span>
              {o.id === modulo && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="pcms-seletor__check">
                  <path d="m5 12 5 5 9-10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
