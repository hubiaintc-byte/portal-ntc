import Image from "next/image";

export interface CardClienteProps {
  nome: string;
  logo: { src: string; alt: string };
  esfera?: string;
  estado?: string;
  variante?: "mosaico" | "lista";
}

export function CardCliente({
  nome,
  logo,
  esfera,
  estado,
  variante = "mosaico",
}: CardClienteProps) {
  if (variante === "lista") {
    return (
      <article className="flex items-center gap-6 border border-linha-sutil bg-osso p-5">
        <div className="relative h-14 w-24 shrink-0 bg-pergaminho">
          <Image
            src={logo.src}
            alt={logo.alt}
            fill
            sizes="96px"
            className="object-contain p-2"
          />
        </div>
        <div>
          <h3 className="font-titulo text-h4 text-oxford">{nome}</h3>
          {(esfera || estado) && (
            <p className="mt-1 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
              {[esfera, estado].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-28 items-center justify-center border border-linha-sutil bg-pergaminho p-5">
      <div className="relative h-full w-full">
        <Image
          src={logo.src}
          alt={logo.alt || nome}
          fill
          sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 50vw"
          className="object-contain"
        />
      </div>
    </article>
  );
}
