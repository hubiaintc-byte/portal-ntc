"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { ItemMenu } from "./tipos";

export interface MenuMobileDrawerProps {
  aberto: boolean;
  rotas: ItemMenu[];
  ctaPrincipal?: { rotulo: string; href: string };
  ctaSecundario?: { rotulo: string; href: string };
  logoSrc?: string;
  logoAlt?: string;
  aoFechar: () => void;
}

export function MenuMobileDrawer({
  aberto,
  rotas,
  ctaPrincipal,
  ctaSecundario,
  logoSrc = "/logos/logo-light.svg",
  logoAlt = "Grupo NTC",
  aoFechar,
}: MenuMobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const botaoFecharRef = useRef<HTMLButtonElement>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const drawerId = useId();

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        aoFechar();
      }
    };

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", aoTeclar);
    botaoFecharRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoFechar]);

  useEffect(() => {
    if (!aberto) setExpandido(null);
  }, [aberto]);

  const alternarSub = (chave: string) => {
    setExpandido((atual) => (atual === chave ? null : chave));
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={aoFechar}
        className={[
          "fixed inset-0 z-40 bg-oxford-escuro/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          aberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />
      <aside
        ref={drawerRef}
        id={drawerId}
        aria-hidden={!aberto}
        aria-label="Menu principal"
        className={[
          "fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[360px] flex-col bg-osso shadow-2xl",
          "transition-transform duration-300 ease-out lg:hidden",
          aberto ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-linha-sutil px-6 py-5">
          <img src={logoSrc} alt={logoAlt} className="h-10 w-auto" />
          <button
            ref={botaoFecharRef}
            type="button"
            onClick={aoFechar}
            aria-label="Fechar menu"
            className="flex h-10 w-10 items-center justify-center text-grafite transition-colors hover:text-oxford"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            >
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        </div>

        <nav aria-label="Navegação móvel" className="flex-1 overflow-y-auto py-2">
          <ul>
            {rotas.map((rota, indice) => {
              const chave = `${rota.rotulo}-${indice}`;
              const temFilhos = !!rota.filhos && rota.filhos.length > 0;
              const subAberto = expandido === chave;

              if (!temFilhos) {
                return (
                  <li key={chave}>
                    <a
                      href={rota.href}
                      onClick={aoFechar}
                      className="block border-b border-linha-sutil/60 px-6 py-4 font-titulo text-h4 text-oxford transition-colors hover:bg-pergaminho/60"
                    >
                      {rota.rotulo}
                    </a>
                  </li>
                );
              }

              return (
                <li key={chave}>
                  <button
                    type="button"
                    onClick={() => alternarSub(chave)}
                    aria-expanded={subAberto}
                    className="flex w-full items-center justify-between border-b border-linha-sutil/60 px-6 py-4 text-left font-titulo text-h4 text-oxford transition-colors hover:bg-pergaminho/60"
                  >
                    <span>{rota.rotulo}</span>
                    <span aria-hidden="true" className="font-corpo text-pequeno text-grafite-suave">
                      {subAberto ? "−" : "+"}
                    </span>
                  </button>
                  {subAberto && (
                    <ul className="bg-pergaminho/40">
                      {rota.filhos!.map((filho, indiceFilho) => (
                        <li key={`${filho.rotulo}-${indiceFilho}`}>
                          <a
                            href={filho.href}
                            onClick={aoFechar}
                            className="block border-b border-linha-sutil/40 px-8 py-3 transition-colors hover:bg-osso"
                          >
                            <strong className="block font-titulo text-corpo font-semibold text-oxford">
                              {filho.rotulo}
                            </strong>
                            {filho.descricao && (
                              <span className="mt-0.5 block font-corpo text-pequeno text-grafite-suave">
                                {filho.descricao}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {(ctaPrincipal || ctaSecundario) && (
          <div className="flex flex-col gap-3 border-t border-linha-sutil px-6 py-5">
            {ctaPrincipal && (
              <a
                href={ctaPrincipal.href}
                onClick={aoFechar}
                className="inline-flex w-full items-center justify-center bg-dourado px-5 py-3 font-corpo text-pequeno font-medium uppercase tracking-[0.16em] text-oxford-escuro transition-colors hover:bg-dourado/90"
              >
                {ctaPrincipal.rotulo}
              </a>
            )}
            {ctaSecundario && (
              <a
                href={ctaSecundario.href}
                onClick={aoFechar}
                className="inline-flex w-full items-center justify-center border border-oxford px-5 py-3 font-corpo text-pequeno font-medium uppercase tracking-[0.16em] text-oxford transition-colors hover:bg-oxford hover:text-osso"
              >
                {ctaSecundario.rotulo}
              </a>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
