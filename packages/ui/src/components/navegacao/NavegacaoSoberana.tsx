"use client";

import { useEffect, useState } from "react";

import { MenuMobileDrawer } from "./MenuMobileDrawer";
import type { ItemMenu } from "./tipos";

export interface NavegacaoSoberanaProps {
  rotas: ItemMenu[];
  ctaPrincipal?: { rotulo: string; href: string };
  ctaSecundario?: { rotulo: string; href: string };
  logoLight?: string;
  logoDark?: string;
  hrefHome?: string;
}

export function NavegacaoSoberana({
  rotas,
  ctaPrincipal,
  ctaSecundario,
  logoLight = "/logos/logo-light.svg",
  logoDark = "/logos/logo-dark.svg",
  hrefHome = "/",
}: NavegacaoSoberanaProps) {
  const [comScroll, setComScroll] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);

  useEffect(() => {
    const aoRolar = () => setComScroll(window.scrollY > 8);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <>
      <header
        className={[
          "sticky top-0 z-30 w-full bg-oxford text-osso",
          "transition-shadow duration-300",
          comScroll ? "shadow-[0_1px_0_0_rgba(181,153,90,0.25)]" : "",
        ].join(" ")}
      >
        <div className="mx-auto flex w-full max-w-[min(108ch,100%)] items-center justify-between gap-6 px-[var(--spacing-margem-editorial)] py-4">
          <a
            href={hrefHome}
            aria-label="Grupo NTC — Página inicial"
            className="flex items-center"
          >
            <img
              src={logoLight}
              alt="Grupo NTC"
              className="h-12 w-auto sm:h-14"
              data-logo-dark={logoDark}
            />
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {rotas.map((rota, indice) => {
              const key = `${rota.rotulo}-${indice}`;
              const classesItem =
                "font-corpo text-pequeno font-medium uppercase tracking-[0.16em] text-osso/85 transition-colors hover:text-dourado focus-visible:text-dourado px-3 py-2";

              if (rota.filhos && rota.filhos.length > 0) {
                return (
                  <button
                    key={key}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                    className={classesItem}
                    title="Mega menu em construção"
                  >
                    {rota.rotulo}
                  </button>
                );
              }

              return (
                <a key={key} href={rota.href} className={classesItem}>
                  {rota.rotulo}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {ctaPrincipal && (
              <a
                href={ctaPrincipal.href}
                className="hidden items-center border border-dourado px-4 py-2 font-corpo text-pequeno font-medium uppercase tracking-[0.16em] text-dourado transition-colors hover:bg-dourado hover:text-oxford-escuro md:inline-flex"
              >
                {ctaPrincipal.rotulo}
              </a>
            )}
            {ctaSecundario && (
              <a
                href={ctaSecundario.href}
                className="hidden items-center bg-dourado px-4 py-2 font-corpo text-pequeno font-medium uppercase tracking-[0.16em] text-oxford-escuro transition-colors hover:bg-dourado/90 md:inline-flex"
              >
                {ctaSecundario.rotulo}
              </a>
            )}
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={drawerAberto}
              aria-controls="menu-mobile-drawer"
              onClick={() => setDrawerAberto(true)}
              className="flex h-11 w-11 items-center justify-center text-osso transition-colors hover:text-dourado lg:hidden"
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              >
                <line x1="3" y1="6" x2="19" y2="6" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="16" x2="19" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MenuMobileDrawer
        aberto={drawerAberto}
        rotas={rotas}
        ctaPrincipal={ctaPrincipal}
        ctaSecundario={ctaSecundario}
        logoSrc={logoDark}
        aoFechar={() => setDrawerAberto(false)}
      />
    </>
  );
}
