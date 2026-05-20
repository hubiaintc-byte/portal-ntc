import { Container } from "../layout/Container";
import { JsonLd } from "../helpers/JsonLd";
import { RenderizadorLexical } from "../helpers/richtext/RenderizadorLexical";
import type { RichTextContent } from "../helpers/richtext/tipos";
import { FaqAcordeao } from "./FaqAcordeao";

export interface BlocoFaqProps {
  titulo?: string;
  itens: { pergunta: string; resposta: RichTextContent }[];
  variante?: "acordeao" | "expandido";
}

function textoPlainoDe(corpo: RichTextContent): string {
  const partes: string[] = [];
  const walk = (no: { type?: string; text?: string; children?: unknown }) => {
    if (no.type === "text" && typeof no.text === "string") {
      partes.push(no.text);
      return;
    }
    if (Array.isArray(no.children)) {
      for (const f of no.children) walk(f as { type?: string; text?: string; children?: unknown });
    }
  };
  walk(corpo.root as unknown as { type?: string; text?: string; children?: unknown });
  return partes.join(" ").trim();
}

export function BlocoFaq({ titulo, itens, variante = "acordeao" }: BlocoFaqProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: itens.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: textoPlainoDe(item.resposta),
      },
    })),
  };

  const itensRenderizados = itens.map((item) => ({
    pergunta: item.pergunta,
    resposta: <RenderizadorLexical content={item.resposta} />,
  }));

  return (
    <section className="bg-osso py-[var(--spacing-bloco-vertical)]">
      <Container variante="editorial">
        {titulo && (
          <h2 className="font-titulo text-h2 text-balance text-oxford">{titulo}</h2>
        )}
        <div className={titulo ? "mt-10" : ""}>
          {variante === "acordeao" ? (
            <FaqAcordeao itens={itensRenderizados} />
          ) : (
            <dl className="flex flex-col divide-y divide-linha-sutil border-y border-linha-sutil">
              {itens.map((item) => (
                <div key={item.pergunta} className="py-8">
                  <dt className="font-titulo text-h4 text-oxford">{item.pergunta}</dt>
                  <dd className="mt-4">
                    <RenderizadorLexical content={item.resposta} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </Container>
      <JsonLd schema={schema} />
    </section>
  );
}
