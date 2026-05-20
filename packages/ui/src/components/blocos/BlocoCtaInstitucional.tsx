import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Container } from "../layout/Container";

export type VarianteCta = "oxford" | "cardeal" | "oliva" | "neutro";

export interface BlocoCtaInstitucionalProps {
  titulo: string;
  descricao?: string;
  rotuloCta: string;
  linkCta: string;
  variante?: VarianteCta;
  imagem?: { src: string; alt: string };
}

const PALETA: Record<
  VarianteCta,
  { fundo: string; texto: string; textoSuave: string; botao: string; botaoHover: string }
> = {
  oxford: {
    fundo: "bg-oxford",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-dourado text-oxford",
    botaoHover: "hover:bg-osso",
  },
  cardeal: {
    fundo: "bg-cardeal",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-osso text-cardeal",
    botaoHover: "hover:bg-dourado hover:text-oxford",
  },
  oliva: {
    fundo: "bg-oliva",
    texto: "text-osso",
    textoSuave: "text-osso/85",
    botao: "bg-osso text-oliva",
    botaoHover: "hover:bg-dourado hover:text-oxford",
  },
  neutro: {
    fundo: "bg-pergaminho",
    texto: "text-oxford",
    textoSuave: "text-grafite",
    botao: "bg-oxford text-osso",
    botaoHover: "hover:bg-oxford-escuro",
  },
};

export function BlocoCtaInstitucional({
  titulo,
  descricao,
  rotuloCta,
  linkCta,
  variante = "oxford",
  imagem,
}: BlocoCtaInstitucionalProps) {
  const p = PALETA[variante];
  return (
    <section className={`${p.fundo} ${p.texto} py-[var(--spacing-secao-vertical)]`}>
      <Container variante="amplo">
        <div className={`grid gap-10 ${imagem ? "lg:grid-cols-[1.2fr_1fr] lg:items-center" : ""}`}>
          <div>
            <h2 className="font-titulo text-h2 text-balance">{titulo}</h2>
            {descricao && (
              <p className={`mt-6 max-w-[52ch] font-corpo text-corpo text-pretty ${p.textoSuave}`}>
                {descricao}
              </p>
            )}
            <Link
              href={linkCta as Route}
              className={`mt-10 inline-flex items-center px-7 py-3 font-corpo text-corpo transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado ${p.botao} ${p.botaoHover}`}
            >
              {rotuloCta} →
            </Link>
          </div>
          {imagem && (
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={imagem.src}
                alt={imagem.alt}
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
