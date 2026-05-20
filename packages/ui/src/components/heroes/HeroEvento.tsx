import Image from "next/image";
import Link from "next/link";
import { Container } from "../layout/Container";
import type { Area, ImagemRef, Modalidade } from "./tipos";
import { acentoPorArea, formatarPeriodo, rotuloModalidade } from "./tipos";

export interface HeroEventoProps {
  nome: string;
  eyebrow?: string;
  imagem: ImagemRef;
  dataInicio: Date | string;
  dataFim?: Date | string;
  modalidade: Modalidade;
  local?: { cidade: string; estado: string; nomeLocal?: string };
  programa?: { sigla: string; href: string };
  area: Area;
  ctaInscricao?: { rotulo: string; href: string; externo: boolean };
}

export function HeroEvento({
  nome,
  eyebrow,
  imagem,
  dataInicio,
  dataFim,
  modalidade,
  local,
  programa,
  area,
  ctaInscricao,
}: HeroEventoProps) {
  const acento = acentoPorArea(area);
  return (
    <section className="relative w-full overflow-hidden bg-oxford text-osso">
      <Image
        src={imagem.src}
        alt={imagem.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-oxford via-oxford/85 to-oxford/55" aria-hidden />
      <div className="relative py-[var(--spacing-secao-vertical)]">
        <Container variante="amplo">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full bg-osso/10 px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso ring-1 ring-inset ring-osso/30`}
            >
              {rotuloModalidade(modalidade)}
            </span>
            {programa && (
              <Link
                href={programa.href}
                className={`inline-flex items-center rounded-full px-3 py-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-osso ring-1 ring-inset ring-osso/30 transition-colors hover:bg-osso/10 ${acento.texto}`}
              >
                Programa {programa.sigla}
              </Link>
            )}
          </div>
          {eyebrow && (
            <p className="mt-8 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-4 max-w-[24ch] font-titulo text-h1 text-balance text-osso">
            {nome}
          </h1>
          <p className="mt-8 font-titulo text-h3 text-dourado">
            {formatarPeriodo(dataInicio, dataFim, "longo")}
          </p>
          {local && (
            <p className="mt-2 font-corpo text-corpo text-osso/85">
              {local.nomeLocal ? `${local.nomeLocal} · ` : ""}
              {local.cidade}/{local.estado}
            </p>
          )}
          {ctaInscricao && (
            <Link
              href={ctaInscricao.href}
              target={ctaInscricao.externo ? "_blank" : undefined}
              rel={ctaInscricao.externo ? "noopener noreferrer" : undefined}
              className="mt-10 inline-flex items-center bg-dourado px-7 py-3 font-corpo text-corpo text-oxford transition-colors hover:bg-osso focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-osso"
            >
              {ctaInscricao.rotulo} →
            </Link>
          )}
        </Container>
      </div>
    </section>
  );
}
