import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, rotuloArea } from "./tipos";

export interface CardProgramaProps {
  sigla: string;
  nomeCompleto: string;
  eyebrow?: string;
  imagem?: ImagemRef;
  area: Area;
  resumoVisaoGeral?: string;
  href: string;
  variante?: "editorial" | "compacto";
}

export function CardPrograma({
  sigla,
  nomeCompleto,
  eyebrow,
  imagem,
  area,
  resumoVisaoGeral,
  href,
  variante = "editorial",
}: CardProgramaProps) {
  const acento = acentoPorArea(area);

  if (variante === "compacto") {
    return (
      <Link
        href={href}
        className="group flex h-full flex-col justify-between border border-linha-sutil bg-osso p-6 transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
      >
        <div>
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {rotuloArea(area)}
          </p>
          <h3 className="mt-4 font-titulo text-h3 text-oxford">{sigla}</h3>
          <p className="mt-2 font-corpo text-corpo text-grafite">{nomeCompleto}</p>
        </div>
        <span className="mt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
          Conhecer →
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      {imagem && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-pergaminho">
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        {eyebrow && (
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {eyebrow}
          </p>
        )}
        <h3 className="mt-3 font-titulo text-h3 text-oxford">{sigla}</h3>
        <p className="mt-2 font-corpo text-corpo text-grafite">{nomeCompleto}</p>
        {resumoVisaoGeral && (
          <p className="mt-4 line-clamp-3 font-corpo text-pequeno text-grafite-suave text-pretty">
            {resumoVisaoGeral}
          </p>
        )}
        <span className="mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
          Conhecer o programa →
        </span>
      </div>
    </Link>
  );
}
