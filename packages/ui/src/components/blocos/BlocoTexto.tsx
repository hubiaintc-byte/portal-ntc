import { Container } from "../layout/Container";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { RichTextContent } from "../helpers/richtext/tipos";

export interface BlocoTextoProps {
  titulo?: string;
  eyebrow?: string;
  corpo: RichTextContent;
  largura?: "editorial" | "texto";
}

export function BlocoTexto({
  titulo,
  eyebrow,
  corpo,
  largura = "texto",
}: BlocoTextoProps) {
  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante={largura}>
        {eyebrow && (
          <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-cardeal">
            {eyebrow}
          </p>
        )}
        {titulo && (
          <h2 className={`font-titulo text-h2 text-balance text-oxford ${eyebrow ? "mt-4" : ""}`}>
            {titulo}
          </h2>
        )}
        <div className={titulo || eyebrow ? "mt-8" : ""}>
          <RenderizadorLexical content={corpo} />
        </div>
      </Container>
    </section>
  );
}
