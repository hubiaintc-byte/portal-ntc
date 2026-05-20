import { Container } from "../layout/Container";
import { ImagemSoberana, type ProporcaoImagem } from "../helpers/ImagemSoberana";

export interface BlocoImagemLegendaProps {
  imagem: { src: string; alt: string };
  legenda?: string;
  credito?: string;
  proporcao?: ProporcaoImagem;
  largura?: "editorial" | "amplo";
}

export function BlocoImagemLegenda({
  imagem,
  legenda,
  credito,
  proporcao = "16:9",
  largura = "editorial",
}: BlocoImagemLegendaProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante={largura}>
        <figure>
          <ImagemSoberana
            src={imagem.src}
            alt={imagem.alt}
            proporcao={proporcao}
            sizes="(min-width: 1024px) 80vw, 100vw"
          />
          {(legenda || credito) && (
            <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-l-2 border-linha-sutil pl-4 font-corpo">
              {legenda && (
                <span className="text-corpo text-grafite text-pretty">{legenda}</span>
              )}
              {credito && (
                <span className="text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {credito}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      </Container>
    </section>
  );
}
