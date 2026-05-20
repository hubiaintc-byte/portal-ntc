import Image from "next/image";
import Link from "next/link";
import type { Area, ImagemRef, Modalidade } from "./tipos";
import { acentoPorArea, formatarData, rotuloModalidade } from "./tipos";

export interface CardEventoProps {
  nome: string;
  eyebrow?: string;
  imagem: ImagemRef;
  dataInicio: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string };
  programa?: { sigla: string };
  area: Area;
  inscricaoAberta: boolean;
  href: string;
}

export function CardEvento({
  nome,
  eyebrow,
  imagem,
  dataInicio,
  modalidade,
  local,
  programa,
  area,
  inscricaoAberta,
  href,
}: CardEventoProps) {
  const acento = acentoPorArea(area);
  const rotulo = inscricaoAberta ? "Inscrever-se →" : "Detalhes →";
  return (
    <Link
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-pergaminho">
        <Image
          src={imagem.src}
          alt={imagem.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
        <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-oxford/90 px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso">
          {rotuloModalidade(modalidade)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7">
        {(eyebrow || programa) && (
          <p className={`font-corpo text-eyebrow uppercase tracking-[0.18em] ${acento.texto}`}>
            {eyebrow ?? (programa ? `Programa ${programa.sigla}` : "")}
          </p>
        )}
        <p className="mt-3 font-titulo text-h4 text-oxford">{formatarData(dataInicio, "longo")}</p>
        <h3 className="mt-2 font-titulo text-h3 text-balance text-grafite">{nome}</h3>
        {local && (
          <p className="mt-3 font-corpo text-pequeno text-grafite-suave">
            {local.cidade}/{local.estado}
          </p>
        )}
        <span
          className={`mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] ${
            inscricaoAberta ? "text-cardeal" : "text-oxford"
          }`}
        >
          {rotulo}
        </span>
      </div>
    </Link>
  );
}
