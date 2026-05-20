import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export interface CardEspecialistaProps {
  nome: string;
  titulacao: string;
  instituicao: string;
  cargoAtual?: string;
  foto: { src: string; alt: string };
  href?: string;
  variante?: "regular" | "expandido" | "cerimonial";
}

function Envoltorio({
  href,
  children,
  className,
}: {
  href?: string;
  children: ReactNode;
  className: string;
}) {
  if (href) {
    return (
      <Link
        href={href}
        className={`${className} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado`}
      >
        {children}
      </Link>
    );
  }
  return <article className={className}>{children}</article>;
}

export function CardEspecialista({
  nome,
  titulacao,
  instituicao,
  cargoAtual,
  foto,
  href,
  variante = "regular",
}: CardEspecialistaProps) {
  if (variante === "cerimonial") {
    return (
      <Envoltorio
        href={href}
        className="group flex h-full flex-col items-center border border-dourado bg-pergaminho p-8 text-center transition-colors hover:border-oxford"
      >
        <div className="relative aspect-[20/23] w-full max-w-[14rem] overflow-hidden bg-osso">
          <Image src={foto.src} alt={foto.alt} fill sizes="14rem" className="object-cover" />
        </div>
        <h3 className="mt-6 font-titulo text-h3 text-oxford">{nome}</h3>
        <span
          aria-hidden
          className="mt-3 inline-block h-px w-12 bg-dourado"
        />
        <p className="mt-3 font-corpo text-eyebrow uppercase tracking-[0.22em] text-dourado">
          {titulacao}
        </p>
        <p className="mt-2 font-corpo text-corpo text-grafite">{instituicao}</p>
        {cargoAtual && (
          <p className="mt-1 font-corpo text-pequeno text-grafite-suave">{cargoAtual}</p>
        )}
      </Envoltorio>
    );
  }

  return (
    <Envoltorio
      href={href}
      className="group flex h-full flex-col border border-linha-sutil bg-osso transition-colors hover:border-oxford"
    >
      <div className="relative aspect-[20/23] w-full overflow-hidden bg-pergaminho">
        <Image
          src={foto.src}
          alt={foto.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-titulo text-h4 text-oxford">{nome}</h3>
        <p className="mt-1 font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
          {titulacao}
        </p>
        <p className="mt-3 font-corpo text-pequeno text-grafite">{instituicao}</p>
        {variante === "expandido" && cargoAtual && (
          <p className="mt-3 font-corpo text-pequeno text-grafite-suave text-pretty">
            {cargoAtual}
          </p>
        )}
      </div>
    </Envoltorio>
  );
}
