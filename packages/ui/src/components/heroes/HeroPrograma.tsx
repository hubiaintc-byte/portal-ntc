import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, rotuloArea } from "./tipos";

export interface HeroProgramaProps {
  sigla: string;
  nomeCompleto: string;
  eyebrow?: string;
  imagem: ImagemRef;
  area: Area;
  cargaHorariaTotal: string;
  modulosQuantidade?: number;
  ctaPrincipal?: { rotulo: string; href: string };
}

export function HeroPrograma({
  sigla,
  nomeCompleto,
  eyebrow,
  imagem,
  area,
  cargaHorariaTotal,
  modulosQuantidade,
  ctaPrincipal,
}: HeroProgramaProps) {
  const acento = acentoPorArea(area);
  return (
    <section className="relative w-full bg-osso text-grafite">
      <div className="relative grid min-h-[70vh] grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative flex items-center py-[var(--spacing-secao-vertical)]">
          <Container variante="editorial">
            {eyebrow && (
              <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${acento.texto}`}>
                {eyebrow}
              </p>
            )}
            <p className={`mt-6 font-corpo text-eyebrow uppercase tracking-[0.22em] ${acento.texto}`}>
              {rotuloArea(area)}
            </p>
            <h1
              className="mt-4 font-titulo font-medium text-oxford"
              style={{ letterSpacing: "0.04em", fontSize: "clamp(3.5rem, 8vw, 6.5rem)", lineHeight: 0.95 }}
            >
              {sigla}
            </h1>
            <p className="mt-4 max-w-[28ch] font-titulo text-h3 text-balance text-grafite">
              {nomeCompleto}
            </p>
            {ctaPrincipal && (
              <Link
                href={ctaPrincipal.href}
                className="mt-10 inline-flex items-center bg-oxford px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-oxford-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
              >
                {ctaPrincipal.rotulo} →
              </Link>
            )}
          </Container>
        </div>
        <div className="relative min-h-[40vh] lg:min-h-full">
          {/* TODO sessão de logos: substituir por <LockupPrograma sigla={sigla} /> quando o conjunto de SVGs estiver pronto. Até lá, imagem editorial do programa. */}
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className={`border-t border-linha-sutil ${acento.bg10}`}>
        <Container variante="amplo">
          <dl className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
            <div>
              <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                Carga horária
              </dt>
              <dd className="mt-2 font-titulo text-h4 text-oxford">{cargaHorariaTotal}</dd>
            </div>
            {typeof modulosQuantidade === "number" && (
              <div>
                <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                  Módulos
                </dt>
                <dd className="mt-2 font-titulo text-h4 text-oxford">{modulosQuantidade}</dd>
              </div>
            )}
            <div>
              <dt className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                Vertical
              </dt>
              <dd className="mt-2 font-titulo text-h4 text-oxford">{rotuloArea(area)}</dd>
            </div>
          </dl>
        </Container>
      </div>
    </section>
  );
}
