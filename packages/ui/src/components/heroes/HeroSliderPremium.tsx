"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { ImagemRef } from "./tipos";

/**
 * `<HeroSliderPremium>` — vitrine editorial da Home v3 Premium
 * (02_Prototipo_Home_GrupoNTC_v3_Premium.html).
 *
 * Client Component. Autoplay configurável (default 7s), parallax sutil
 * via translateY no scroll, indicadores de progresso, prev/next, dots
 * clicáveis, pause-on-hover/focus, respeito a prefers-reduced-motion
 * (autoplay desliga, parallax some, animações instantâneas).
 *
 * O título de cada slide aceita a sintaxe `<accent>palavra</accent>`
 * para destacar palavras em dourado italic — corresponde ao
 * `<span class="accent">` do protótipo.
 */

export type TipoSlide = "institucional" | "evento" | "programa" | "solucao" | "eventon";
export type VarianteCtaSlide = "primario" | "secundario" | "textlink";

export interface VerticalAcento {
  /** Identificador da vertical para tonalizar o overlay (edu, gov, sau). */
  vertical?: "edu" | "gov" | "sau";
}

export interface CtaSlide {
  rotulo: string;
  link: string;
  variante: VarianteCtaSlide;
}

export interface EventoPillSlide {
  data?: string;
  local?: string;
  modalidade?: string;
}

export interface SlidePremium extends VerticalAcento {
  tipo: TipoSlide;
  imagem: ImagemRef;
  eyebrow: string;
  /** Pode conter `<accent>palavra</accent>` para destaque dourado italic. */
  titulo: string;
  subtitulo: string;
  eventoPill?: EventoPillSlide;
  ctas: CtaSlide[];
  rotuloA11y?: string;
}

export interface HeroSliderPremiumProps {
  slides: SlidePremium[];
  intervaloMs?: number;
}

const ROTULO_TIPO: Record<TipoSlide, string> = {
  institucional: "Institucional",
  evento: "Evento",
  programa: "Programa",
  solucao: "Solução",
  eventon: "EventOn",
};

function renderTituloComAccent(titulo: string): ReactNode {
  // Parse leve: divide pelo par <accent>...</accent>. Outras tags são
  // ignoradas — esta é uma sintaxe restrita, não HTML livre.
  const partes = titulo.split(/(<accent>.*?<\/accent>)/g);
  return partes.map((parte, idx) => {
    const match = parte.match(/^<accent>(.*?)<\/accent>$/);
    if (match) {
      return (
        <span key={idx} className="font-titulo italic font-medium text-dourado">
          {match[1]}
        </span>
      );
    }
    return <span key={idx}>{parte}</span>;
  });
}

function classesOverlayVertical(vertical: VerticalAcento["vertical"]): string {
  switch (vertical) {
    case "edu":
      return "bg-gradient-to-br from-oxford-escuro/95 via-oxford/80 to-oxford-escuro/55";
    case "gov":
      return "bg-gradient-to-br from-oxford-escuro/95 via-cardeal/75 to-oxford-escuro/55";
    case "sau":
      return "bg-gradient-to-br from-oxford-escuro/95 via-oliva/75 to-oxford-escuro/55";
    default:
      return "bg-gradient-to-br from-oxford-escuro/95 via-oxford/70 to-oxford-escuro/60";
  }
}

function classesCtaSlide(v: VarianteCtaSlide): string {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 font-corpo text-corpo transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado";
  if (v === "primario") {
    return `${base} bg-dourado text-oxford hover:bg-osso hover:text-oxford-escuro`;
  }
  if (v === "secundario") {
    return `${base} border border-osso/60 text-osso hover:bg-osso hover:text-oxford`;
  }
  // textlink
  return `inline-flex items-center font-corpo text-pequeno uppercase tracking-[0.18em] text-dourado underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado`;
}

export function HeroSliderPremium({ slides, intervaloMs = 7000 }: HeroSliderPremiumProps) {
  const total = slides.length;
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
  }, []);

  const avancar = useCallback(() => {
    setAtivo((i) => (i + 1) % total);
  }, [total]);

  const retroceder = useCallback(() => {
    setAtivo((i) => (i - 1 + total) % total);
  }, [total]);

  // Autoplay
  useEffect(() => {
    if (pausado || prefersReducedMotion.current || total < 2) return;
    const id = window.setTimeout(avancar, intervaloMs);
    return () => window.clearTimeout(id);
  }, [ativo, pausado, intervaloMs, total, avancar]);

  // Parallax sutil (translateY do bg em função do scroll)
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion.current) return;
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // Move o bg metade da velocidade do scroll, limitado a ±60px.
          const offset = Math.max(-60, Math.min(60, -rect.top * 0.05));
          setParallaxY(offset);
        }
        rafId = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Teclado: ← → para navegar quando o slider tem foco.
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      avancar();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      retroceder();
    }
  };

  const slidesRender = useMemo(() => slides, [slides]);

  if (total === 0) return null;

  return (
    <section
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-oxford-escuro text-osso ${pausado ? "is-paused" : ""}`}
      style={{ minHeight: "92vh" }}
      aria-label="Apresentação do Grupo NTC — vitrine editorial"
      aria-roledescription="carousel"
      tabIndex={0}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={onKeyDown}
    >
      {slidesRender.map((slide, idx) => {
        const isAtivo = idx === ativo;
        return (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isAtivo ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={!isAtivo}
            aria-label={
              slide.rotuloA11y ?? `Slide ${idx + 1} de ${total} · ${ROTULO_TIPO[slide.tipo]}`
            }
            data-tipo={slide.tipo}
            data-vertical={slide.vertical}
          >
            <div
              className="absolute inset-x-0 -top-10 -bottom-32"
              style={{
                transform: `scale(1.04) translateY(${parallaxY}px)`,
                transition: "transform 9000ms ease-out",
                willChange: "transform",
              }}
            >
              <Image
                src={slide.imagem.src}
                alt={slide.imagem.alt}
                fill
                sizes="100vw"
                priority={idx === 0}
                className="object-cover"
                style={{ filter: "saturate(85%) contrast(1.05)" }}
              />
            </div>

            <div className={`absolute inset-0 ${classesOverlayVertical(slide.vertical)}`} aria-hidden />

            <div className="relative z-[2] flex h-full min-h-[92vh] items-end pb-32 pt-24">
              <div className="mx-auto w-full max-w-[min(108ch,100%)] px-[var(--spacing-margem-editorial)]">
                <div className="max-w-[760px]">
                  <p className="inline-flex items-center gap-3 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
                    <span aria-hidden className="block h-px w-8 bg-dourado" />
                    {slide.eyebrow}
                  </p>

                  {slide.eventoPill ? <EventoPill pill={slide.eventoPill} /> : null}

                  <h2 className="mt-4 font-titulo text-balance text-osso text-[clamp(36px,5.4vw,72px)] font-medium leading-[1.04] tracking-tight">
                    {renderTituloComAccent(slide.titulo)}
                  </h2>

                  <p className="mt-6 max-w-[680px] font-corpo text-corpo text-osso/85 text-pretty">
                    {slide.subtitulo}
                  </p>

                  {slide.ctas.length > 0 ? (
                    <div className="mt-10 flex flex-wrap items-center gap-3">
                      {slide.ctas.map((cta, ctaIdx) => (
                        <CtaSlideLink key={ctaIdx} cta={cta} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Controles */}
      <div
        className="absolute inset-x-0 bottom-20 z-10 flex items-center gap-4 px-8 sm:bottom-16 md:px-12"
        style={{ pointerEvents: "auto" }}
      >
        <div
          role="tablist"
          aria-label="Indicadores do slider"
          className="flex max-w-[320px] flex-1 items-center gap-2"
        >
          {slidesRender.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === ativo}
              aria-label={`Ir para slide ${idx + 1} de ${total}`}
              onClick={() => setAtivo(idx)}
              className="relative h-0.5 max-w-[44px] flex-1 bg-osso/20 transition-colors hover:bg-osso/40"
            >
              {idx === ativo ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-dourado"
                  style={{
                    width: pausado || prefersReducedMotion.current ? "100%" : "0%",
                    animation:
                      pausado || prefersReducedMotion.current
                        ? "none"
                        : `heroProgress ${intervaloMs}ms linear forwards`,
                  }}
                />
              ) : null}
            </button>
          ))}
        </div>

        <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-osso/80 whitespace-nowrap">
          <strong className="font-titulo not-italic text-dourado">{String(ativo + 1).padStart(2, "0")}</strong>
          <span className="mx-1">/</span>
          {String(total).padStart(2, "0")}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={retroceder}
            aria-label="Slide anterior"
            className="grid size-10 place-items-center border border-dourado/35 bg-oxford-escuro/55 text-osso backdrop-blur transition-colors hover:border-dourado hover:bg-dourado hover:text-oxford-escuro"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={avancar}
            aria-label="Próximo slide"
            className="grid size-10 place-items-center border border-dourado/35 bg-oxford-escuro/55 text-osso backdrop-blur transition-colors hover:border-dourado hover:bg-dourado hover:text-oxford-escuro"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`@keyframes heroProgress { from { width: 0%; } to { width: 100%; } }`}</style>
    </section>
  );
}

function EventoPill({ pill }: { pill: EventoPillSlide }) {
  const partes = [pill.data, pill.local, pill.modalidade].filter(Boolean);
  if (partes.length === 0) return null;
  return (
    <span
      className="mt-6 inline-flex flex-wrap items-center gap-2 border border-dourado/35 bg-oxford-escuro/40 px-3 py-1.5 font-corpo text-pequeno uppercase tracking-[0.12em] text-osso backdrop-blur"
      aria-label="Resumo do evento"
    >
      {partes.map((p, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i === 0 ? (
            <strong className="font-titulo italic not-italic text-dourado normal-case tracking-normal">
              {p}
            </strong>
          ) : (
            <>
              <span aria-hidden className="text-dourado/60">·</span>
              <span>{p}</span>
            </>
          )}
        </span>
      ))}
    </span>
  );
}

function CtaSlideLink({ cta }: { cta: CtaSlide }) {
  const classes = classesCtaSlide(cta.variante);
  // Para links externos / âncoras, usar <a>; senão <Link>.
  const ehInterno = cta.link.startsWith("/");
  if (ehInterno) {
    return (
      <Link href={cta.link} className={classes}>
        {cta.rotulo}
        {cta.variante !== "textlink" ? <span aria-hidden>→</span> : null}
      </Link>
    );
  }
  return (
    <a href={cta.link} className={classes}>
      {cta.rotulo}
      {cta.variante !== "textlink" ? <span aria-hidden>→</span> : null}
    </a>
  );
}
