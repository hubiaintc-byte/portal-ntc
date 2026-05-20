import Image from "next/image";
import { Container } from "../layout/Container";
import type { Area, ImagemRef } from "./tipos";
import { rotuloArea } from "./tipos";

export interface HeroAreaProps {
  area: Area;
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  imagem: ImagemRef;
  corAcento: string;
}

export function HeroArea({ area, eyebrow, titulo, subtitulo, imagem, corAcento }: HeroAreaProps) {
  return (
    <section className="relative w-full overflow-hidden bg-pergaminho text-grafite">
      <div className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative flex items-center py-[var(--spacing-secao-vertical)]">
          <Container variante="editorial">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="block h-px w-16"
                style={{ backgroundColor: corAcento }}
              />
              <span
                className="font-corpo text-eyebrow uppercase tracking-[0.22em]"
                style={{ color: corAcento }}
              >
                {rotuloArea(area)}
              </span>
            </div>
            {eyebrow && (
              <p className="mt-8 font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-4 max-w-[18ch] font-titulo text-h1 text-balance text-oxford">
              {titulo}
            </h1>
            {subtitulo && (
              <p className="mt-6 max-w-[48ch] font-corpo text-corpo text-grafite text-pretty">
                {subtitulo}
              </p>
            )}
          </Container>
        </div>
        <div className="relative min-h-[40vh] lg:min-h-full">
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-px"
            style={{ backgroundColor: corAcento }}
          />
        </div>
      </div>
    </section>
  );
}
