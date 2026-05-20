import Image from "next/image";
import { Container } from "../layout/Container";
import type { ImagemRef } from "./tipos";
import { formatarData } from "./tipos";

export interface HeroConteudoProps {
  categoria: string;
  titulo: string;
  lide: string;
  imagem: ImagemRef;
  autor?: { nome: string; titulacao: string };
  dataPublicacao: Date | string;
  tempoLeitura?: string;
}

export function HeroConteudo({
  categoria,
  titulo,
  lide,
  imagem,
  autor,
  dataPublicacao,
  tempoLeitura,
}: HeroConteudoProps) {
  return (
    <section className="w-full bg-pergaminho text-grafite">
      <Container variante="texto" as="article">
        <div className="py-[var(--spacing-secao-vertical)]">
          <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {categoria}
          </p>
          <h1 className="mt-6 font-titulo text-h1 text-balance text-oxford">{titulo}</h1>
          <p className="mt-8 font-titulo text-h4 leading-relaxed text-grafite text-pretty">
            {lide}
          </p>
          <dl className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-linha-sutil pt-6 font-corpo text-pequeno text-grafite-suave">
            {autor && (
              <div>
                <dt className="sr-only">Autor</dt>
                <dd className="text-grafite">
                  <span className="font-titulo text-corpo text-oxford">{autor.nome}</span>
                  <span className="ml-2 uppercase tracking-[0.18em] text-grafite-suave">
                    {autor.titulacao}
                  </span>
                </dd>
              </div>
            )}
            <div>
              <dt className="sr-only">Publicado em</dt>
              <dd>{formatarData(dataPublicacao, "longo")}</dd>
            </div>
            {tempoLeitura && (
              <div>
                <dt className="sr-only">Tempo de leitura</dt>
                <dd>{tempoLeitura}</dd>
              </div>
            )}
          </dl>
        </div>
      </Container>
      <div className="relative aspect-[16/7] w-full">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
