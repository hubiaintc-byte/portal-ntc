import Image from "next/image";
import Link from "next/link";

import { Container } from "../layout/Container";
import type { ImagemRef } from "../heroes/tipos";

/**
 * `<BlocoEventOn>` — bloco institucional da EventOn
 * (02_Prototipo_Home_GrupoNTC_v3_Premium.html linhas 3105–3151).
 *
 * Server Component. Background editorial em fundo Oxford-escuro com
 * sobreposição em gradient e imagem dourada à direita. Grid
 * 1.1fr | 1fr: coluna esquerda com eyebrow + título + descrição + CTAs;
 * coluna direita com 4 operações numeradas (acesso, replay,
 * certificado, suporte).
 */

export interface OperacaoEventOn {
  numero: string;
  titulo: string;
  descricao: string;
  linkRotulo: string;
  link: string;
}

export interface BlocoEventOnProps {
  eyebrow?: string;
  titulo: string;
  descricao: string;
  imagemFundo: ImagemRef;
  ctas: { rotulo: string; link: string; variante?: "primario" | "secundario" }[];
  operacoes: OperacaoEventOn[];
}

const CLASSES_CTA = {
  primario:
    "inline-flex items-center gap-2 bg-dourado px-6 py-3 font-corpo text-corpo text-oxford-escuro transition-colors hover:bg-osso hover:text-oxford-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
  secundario:
    "inline-flex items-center gap-2 border border-osso/60 px-6 py-3 font-corpo text-corpo text-osso transition-colors hover:bg-osso hover:text-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
} as const;

export function BlocoEventOn({
  eyebrow = "EventOn · Plataforma do Grupo NTC",
  titulo,
  descricao,
  imagemFundo,
  ctas,
  operacoes,
}: BlocoEventOnProps) {
  return (
    <section
      id="eventon"
      className="relative isolate overflow-hidden bg-oxford-escuro py-[var(--spacing-secao-vertical)] text-osso"
      aria-label="EventOn — plataforma de eventos do Grupo NTC"
    >
      <div className="absolute inset-0 z-0" aria-hidden>
        <Image
          src={imagemFundo.src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-right"
          style={{ opacity: 0.2, filter: "saturate(80%)" }}
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-gradient-to-r from-oxford-escuro from-[30%] to-oxford-escuro/70"
      />

      <Container variante="amplo" className="relative z-[2]">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="max-w-[540px]">
            <p className="inline-flex items-center gap-3 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
              <span aria-hidden className="block h-px w-8 bg-dourado" />
              {eyebrow}
            </p>
            <h2 className="mt-4 font-titulo text-h2 text-balance text-osso">{titulo}</h2>
            <p className="mt-6 max-w-[540px] font-corpo text-corpo text-osso/85 text-pretty">
              {descricao}
            </p>
            {ctas.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {ctas.map((cta, idx) => {
                  const v = cta.variante ?? (idx === 0 ? "primario" : "secundario");
                  return cta.link.startsWith("/") ? (
                    <Link key={idx} href={cta.link} className={CLASSES_CTA[v]}>
                      {cta.rotulo}
                      <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <a key={idx} href={cta.link} className={CLASSES_CTA[v]}>
                      {cta.rotulo}
                      <span aria-hidden>→</span>
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {operacoes.map((op) => (
              <li
                key={op.numero}
                className="flex flex-col gap-3 border border-osso/15 bg-oxford-escuro/40 p-6 backdrop-blur transition-colors hover:border-dourado hover:bg-dourado/10"
              >
                <span className="font-titulo italic text-h3 leading-none text-dourado">
                  {op.numero}
                </span>
                <h3 className="font-titulo text-h4 text-osso">{op.titulo}</h3>
                <p className="font-corpo text-pequeno text-osso/80">{op.descricao}</p>
                {op.link.startsWith("/") ? (
                  <Link
                    href={op.link}
                    className="mt-auto inline-flex items-center font-corpo text-eyebrow uppercase tracking-[0.18em] text-dourado underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    {op.linkRotulo} →
                  </Link>
                ) : (
                  <a
                    href={op.link}
                    className="mt-auto inline-flex items-center font-corpo text-eyebrow uppercase tracking-[0.18em] text-dourado underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    {op.linkRotulo} →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
