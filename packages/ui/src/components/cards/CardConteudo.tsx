import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef } from "./tipos";
import { acentoPorArea, formatarData } from "./tipos";

export interface CardConteudoProps {
  titulo: string;
  lide: string;
  categoria: string;
  imagem: ImagemRef;
  area?: Area;
  dataPublicacao: Date | string;
  tempoLeitura?: string;
  href: string;
}

export function CardConteudo({
  titulo,
  lide,
  categoria,
  imagem,
  area,
  dataPublicacao,
  tempoLeitura,
  href,
}: CardConteudoProps) {
  const acentoTexto = area ? acentoPorArea(area).texto : "text-cardeal";
  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-pergaminho">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acentoTexto}`}>
          {categoria}
        </p>
        <h3 className="mt-3 font-titulo text-h3 text-balance text-oxford">{titulo}</h3>
        <p className="mt-3 line-clamp-3 font-corpo text-corpo text-grafite text-pretty">{lide}</p>
        <p className="mt-auto pt-6 font-corpo text-pequeno text-grafite-suave">
          {formatarData(dataPublicacao, "longo")}
          {tempoLeitura ? ` · ${tempoLeitura}` : ""}
        </p>
      </div>
    </Link>
  );
}
