import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { CtaHero, ImagemRef } from "./tipos";

export interface HeroInstitucionalProps {
  eyebrow?: string;
  titulo: string;
  subtitulo?: string;
  imagem: ImagemRef;
  ctas?: CtaHero[];
  altura?: "completa" | "editorial";
}

const alturaClasse: Record<NonNullable<HeroInstitucionalProps["altura"]>, string> = {
  editorial: "min-h-[75vh]",
  completa: "min-h-[100vh]",
};

const ctaClasse: Record<CtaHero["variante"], string> = {
  primario:
    "inline-flex items-center justify-center bg-oxford px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-oxford-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
  secundario:
    "inline-flex items-center justify-center border border-osso px-7 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-osso hover:text-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
};

export function HeroInstitucional({
  eyebrow,
  titulo,
  subtitulo,
  imagem,
  ctas,
  altura = "editorial",
}: HeroInstitucionalProps) {
  return (
    <section className={`relative w-full overflow-hidden bg-oxford text-osso ${alturaClasse[altura]}`}>
      <Image
        src={imagem.src}
        alt={imagem.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-oxford/40 via-oxford/60 to-oxford" aria-hidden />
      <div className="relative flex h-full min-h-inherit items-end pb-[var(--spacing-secao-vertical)] pt-[calc(var(--spacing-secao-vertical)*0.75)]">
        <Container variante="amplo">
          {eyebrow && (
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 max-w-[22ch] font-titulo text-h1 text-balance text-osso">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-6 max-w-[52ch] font-corpo text-corpo text-osso/85 text-pretty">
              {subtitulo}
            </p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-4">
              {ctas.map((cta) => (
                <Link key={cta.href + cta.rotulo} href={cta.href} className={ctaClasse[cta.variante]}>
                  {cta.rotulo}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </div>
    </section>
  );
}
