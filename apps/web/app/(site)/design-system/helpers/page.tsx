import type { Metadata } from "next";

import {
  Breadcrumbs,
  Container,
  ImagemSoberana,
  JsonLd,
  Revelar,
  RenderizadorLexical,
  Secao,
} from "@ntc/ui";

import { LEXICAL_DEMO } from "../_mocks/lexical";

export const metadata: Metadata = {
  title: "Helpers — Design System",
  robots: { index: false, follow: false },
};

const IMG = "https://picsum.photos/seed/ntc-helper-img/1600/1000";

const SCHEMA_EXEMPLO = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Instituto NTC do Brasil",
  url: "https://gruponctc.org.br",
};

export default function PaginaHelpers() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Helpers" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Helpers sistêmicos</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §12 do Inventário. ImagemSoberana, JsonLd, Revelar, RenderizadorLexical.
          </p>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">ImagemSoberana — 5 proporções</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {(["1:1", "4:3", "3:2", "16:9", "20:23"] as const).map((p) => (
              <div key={p}>
                <ImagemSoberana
                  src={IMG}
                  alt={`Proporção ${p}`}
                  proporcao={p}
                  sizes="(min-width: 1024px) 18vw, 50vw"
                />
                <p className="mt-2 font-corpo text-pequeno uppercase tracking-[0.18em] text-grafite-suave">
                  {p}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">RenderizadorLexical</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Documento Lexical realista renderizado em JSX Soberano.
          </p>
          <div className="mt-8 border-t border-linha-sutil pt-8">
            <RenderizadorLexical content={LEXICAL_DEMO} />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">Revelar — role para ativar</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Os blocos abaixo entram com fade-in + slide-up de 400ms quando entram na viewport
            (respeita prefers-reduced-motion).
          </p>
          <div className="mt-12 flex flex-col gap-12">
            {[0, 100, 200, 300].map((d) => (
              <Revelar key={d} delay={d}>
                <div className="border border-linha-sutil bg-osso p-8">
                  <p className="font-titulo text-h3 text-oxford">Bloco com delay {d}ms</p>
                  <p className="mt-2 font-corpo text-corpo text-grafite">
                    Entrei na viewport e o IntersectionObserver disparou.
                  </p>
                </div>
              </Revelar>
            ))}
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h2 className="font-titulo text-h3 text-oxford">JsonLd</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Injeta &lt;script type=&quot;application/ld+json&quot;&gt; com o schema abaixo. Inspecione
            o HTML para conferir.
          </p>
          <pre className="mt-6 overflow-x-auto bg-pergaminho p-4 font-corpo text-pequeno text-grafite">
            {JSON.stringify(SCHEMA_EXEMPLO, null, 2)}
          </pre>
          <JsonLd schema={SCHEMA_EXEMPLO} />
        </Container>
      </Secao>
    </main>
  );
}
