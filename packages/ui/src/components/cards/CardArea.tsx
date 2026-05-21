import Image from "next/image";
import Link from "next/link";

import type { Area, ImagemRef } from "../heroes/tipos";
import { acentoPorArea, rotuloArea } from "../heroes/tipos";

/**
 * `<CardArea>` — card editorial para cada Área Estratégica (doc 13 §3.1).
 *
 * Usado na visão geral `/solucoes-estrategicas` (3 instâncias) e em
 * destaques institucionais. Difere do `<CardPrograma>` porque:
 * - O título é o nome da Área (não sigla).
 * - O corpo é o posicionamento editorial curto, não resumo de programa.
 * - O CTA usa cor de acento da área (Oxford, Cardeal, Oliva).
 *
 * `imagem` é opcional; sem ela, o card vira "editorial puro" sem mídia.
 */

export interface CardAreaProps {
  area: Area;
  nome: string;
  eyebrow?: string;
  posicionamento?: string;
  imagem?: ImagemRef;
  href: string;
}

export function CardArea({ area, nome, eyebrow, posicionamento, imagem, href }: CardAreaProps) {
  const acento = acentoPorArea(area);
  const rotulo = eyebrow ?? rotuloArea(area);

  return (
    <Link
      href={href}
      data-area={area}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      {imagem ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-pergaminho">
          <Image
            src={imagem.src}
            alt={imagem.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-8">
        <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
          {rotulo}
        </p>
        <h3 className="mt-4 font-titulo text-h2 text-oxford">{nome}</h3>
        {posicionamento ? (
          <p className="mt-4 line-clamp-4 font-corpo text-corpo text-grafite text-pretty">
            {posicionamento}
          </p>
        ) : null}
        <span className={`mt-auto pt-8 font-corpo text-pequeno uppercase tracking-[0.18em] ${acento.texto}`}>
          Conhecer a área →
        </span>
      </div>
    </Link>
  );
}
