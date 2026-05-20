import { Container } from "../layout/Container";

export interface BlocoCitacaoProps {
  citacao: string;
  autoria: string;
  cargo?: string;
  variante?: "discreta" | "cerimonial";
}

export function BlocoCitacao({
  citacao,
  autoria,
  cargo,
  variante = "discreta",
}: BlocoCitacaoProps) {
  if (variante === "cerimonial") {
    return (
      <section className="bg-pergaminho py-[var(--spacing-secao-vertical)]">
        <Container variante="texto">
          <figure className="flex flex-col items-center text-center">
            <span aria-hidden className="block h-px w-16 bg-dourado" />
            <blockquote className="mt-8 font-titulo text-h2 italic text-balance text-oxford">
              <span aria-hidden>"</span>
              {citacao}
              <span aria-hidden>"</span>
            </blockquote>
            <figcaption className="mt-8 font-corpo">
              <span className="block font-titulo text-h4 text-oxford">{autoria}</span>
              {cargo && (
                <span className="mt-1 block text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
                  {cargo}
                </span>
              )}
            </figcaption>
          </figure>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="texto">
        <figure className="border-l-2 border-dourado pl-6">
          <blockquote className="font-titulo text-h3 italic text-grafite">
            {citacao}
          </blockquote>
          <figcaption className="mt-4 font-corpo text-pequeno">
            <span className="font-titulo text-corpo text-oxford">{autoria}</span>
            {cargo && (
              <span className="ml-2 uppercase tracking-[0.18em] text-grafite-suave">
                {cargo}
              </span>
            )}
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
