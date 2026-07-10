"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * `SliderHero` — vitrine editorial rotativa (6 slides) literal do
 * 02_Prototipo_Home_GrupoNTC_v3_Premium.html (linhas 2179–2334) e do
 * script de slider (3470–3680).
 *
 * Comportamento:
 * - Autoplay 7s, configurável via `intervaloMs`.
 * - Pausa em hover, foco e quando o slider sai da viewport.
 * - Setas ← / → no teclado (com slider em foco).
 * - Dots clicáveis + arrows prev/next.
 * - Barra de progresso animada via CSS no dot ativo.
 * - Respeita `prefers-reduced-motion` (sem autoplay).
 */

export type TipoSlide = "institucional" | "evento" | "programa" | "solucao" | "eventon";
export type VerticalSlide = "edu" | "gov" | "sau";
export type VarianteCtaSlide = "gold" | "ghost-light" | "textlink";

export interface CtaSlide {
  rotulo: string;
  href: string;
  variante: VarianteCtaSlide;
}

export interface SlidePremium {
  /** Tipo editorial — usado em data-tipo para hooks de QA/CMS. */
  tipo: TipoSlide;
  /** Vertical opcional (tonaliza o gradient overlay). */
  vertical?: VerticalSlide;
  /** URL da imagem de fundo (Supabase Storage, fallback handled outside). */
  imagemSrc: string;
  imagemAlt?: string;
  eyebrow: string;
  /** Aceita `<accent>palavra</accent>` para destaque dourado italic. */
  titulo: string;
  subtitulo: string;
  /** Pílula opcional (data·local·modalidade) para slides de evento. */
  eventoPill?: { texto: string };
  ctas: CtaSlide[];
  /** Link textual abaixo dos CTAs (slide institucional). */
  textlink?: { rotulo: string; href: string };
  rotuloA11y?: string;
}

interface SliderHeroProps {
  slides: SlidePremium[];
  intervaloMs?: number;
}

const ROTULO_TIPO: Record<TipoSlide, string> = {
  institucional: "Institucional",
  evento: "Evento",
  programa: "Programa",
  solucao: "Soluções",
  eventon: "EventOn",
};

function renderTituloComAccent(titulo: string) {
  const partes = titulo.split(/(<accent>.*?<\/accent>)/g);
  return partes.map((p, i) => {
    const m = p.match(/^<accent>(.*?)<\/accent>$/);
    if (m) return <span key={i} className="accent">{m[1]}</span>;
    return <span key={i}>{p}</span>;
  });
}

export function SliderHero({ slides, intervaloMs = 7000 }: SliderHeroProps) {
  const total = slides.length;
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const avancar = useCallback(() => setAtivo((i) => (i + 1) % total), [total]);
  const retroceder = useCallback(() => setAtivo((i) => (i - 1 + total) % total), [total]);

  // Autoplay
  useEffect(() => {
    if (pausado || prefersReducedMotion.current || total < 2) return;
    const id = window.setTimeout(avancar, intervaloMs);
    return () => window.clearTimeout(id);
  }, [ativo, pausado, intervaloMs, total, avancar]);

  // Pausa quando slider sai da viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setPausado((p) => (entry && entry.intersectionRatio < 0.2) || p),
      { threshold: [0, 0.2, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      avancar();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      retroceder();
    }
  };

  const intervaloVar = { "--slide-duration": `${intervaloMs}ms` } as React.CSSProperties;

  if (total === 0) return null;

  return (
    <section
      ref={containerRef}
      className={`hero ${pausado ? "is-paused" : ""}`}
      id="hero-slider"
      aria-label="Apresentação do Grupo NTC · vitrine editorial"
      aria-roledescription="carousel"
      style={intervaloVar}
      tabIndex={0}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      onKeyDown={onKeyDown}
    >
      {slides.map((slide, idx) => {
        const isAtivo = idx === ativo;
        return (
          <div
            key={idx}
            className={`hero-slide ${isAtivo ? "is-active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={!isAtivo}
            aria-label={slide.rotuloA11y ?? `Slide ${idx + 1} de ${total} · ${ROTULO_TIPO[slide.tipo]}`}
            data-tipo={slide.tipo}
            data-vertical={slide.vertical}
          >
            <img
              className="hero-slide-bg"
              src={slide.imagemSrc}
              alt={slide.imagemAlt ?? ""}
              aria-hidden="true"
              // Slide 1 é o LCP da Home: baixa com prioridade máxima; os
              // demais ficam lazy para não competir com ele na primeira dobra.
              fetchPriority={idx === 0 ? "high" : "auto"}
              loading={idx === 0 ? "eager" : "lazy"}
            />
            <div className="container hero-slide-content">
              <div className="hero-slide-text">
                <p className="eyebrow light">{slide.eyebrow}</p>
                {slide.eventoPill ? (
                  <span className="hero-event-pill" aria-label="Resumo do evento">
                    {slide.eventoPill.texto}
                  </span>
                ) : null}
                {/*
                  H1 no slide institucional, H2 nos demais — espelha
                  o HTML original (linhas 2187 e 2213+).
                  Mantém o CSS .hero-slide h1 e .hero-slide-title
                  ativos conforme cada caso.
                */}
                {slide.tipo === "institucional" ? (
                  <h1>{renderTituloComAccent(slide.titulo)}</h1>
                ) : (
                  <h2 className="hero-slide-title">{renderTituloComAccent(slide.titulo)}</h2>
                )}
                <p className="hero-slide-sub">{slide.subtitulo}</p>
                {slide.ctas.length > 0 ? (
                  <div className="hero-slide-ctas">
                    {slide.ctas.map((cta, ci) => (
                      <a
                        key={ci}
                        className={`btn btn--${cta.variante === "gold" ? "gold" : "ghost-light"}`}
                        href={cta.href}
                      >
                        {cta.rotulo}
                        <span className="btn-arrow" aria-hidden>
                          →
                        </span>
                      </a>
                    ))}
                  </div>
                ) : null}
                {slide.textlink ? (
                  <a className="hero-slide-textlink" href={slide.textlink.href}>
                    {slide.textlink.rotulo}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}

      <div className="hero-controls">
        <div className="hero-dots" role="tablist" aria-label="Indicadores do slider">
          {slides.map((s, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              className={`hero-dot ${idx === ativo ? "is-active" : ""}`}
              data-slide={idx}
              aria-selected={idx === ativo}
              aria-label={`Slide ${idx + 1} · ${s.rotuloA11y ?? ROTULO_TIPO[s.tipo]}`}
              onClick={() => setAtivo(idx)}
            />
          ))}
        </div>
        <span className="hero-count" aria-live="polite">
          <strong>{String(ativo + 1).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
        </span>
        <div className="hero-arrows">
          <button
            type="button"
            className="hero-arrow"
            aria-label="Slide anterior"
            onClick={retroceder}
          >
            <svg viewBox="0 0 24 24">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="hero-arrow"
            aria-label="Próximo slide"
            onClick={avancar}
          >
            <svg viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="hero-trust">
        <div className="verticals">
          <span>Educação</span>
          <span>Gestão Pública</span>
          <span>Saúde</span>
        </div>
        <span className="scroll-hint">Eventos e módulos abertos</span>
      </div>
    </section>
  );
}
