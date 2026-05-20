import type { Metadata } from "next";

import {
  Breadcrumbs,
  Container,
  Eyebrow,
  LinkEditorial,
  Secao,
  Selo,
  TituloSecao,
} from "@ntc/ui";

export const metadata: Metadata = {
  title: "Utilitários — Design System",
  robots: { index: false, follow: false },
};

export default function PaginaUtilitarios() {
  return (
    <main id="conteudo">
      <Secao fundo="osso" vertical="compacto">
        <Container variante="amplo">
          <Breadcrumbs
            itens={[
              { rotulo: "Início", href: "/" },
              { rotulo: "Design System", href: "/design-system" },
              { rotulo: "Utilitários" },
            ]}
          />
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="editorial">
          <h1 className="font-titulo text-h1 text-balance text-oxford">Utilitários tipográficos</h1>
          <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite-suave">
            §10 do Inventário. Eyebrow, TituloSecao, LinkEditorial, Selo.
          </p>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">Eyebrow</h2>
          <div className="mt-6 flex flex-col gap-4">
            <Eyebrow>Padrão · cinza editorial</Eyebrow>
            <Eyebrow variante="dourado">Variante dourada</Eyebrow>
            <Eyebrow vert="educacao">Vert · Educação (Oxford)</Eyebrow>
            <Eyebrow vert="gestao-publica">Vert · Gestão Pública (Cardeal)</Eyebrow>
            <Eyebrow vert="saude">Vert · Saúde (Oliva)</Eyebrow>
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">TituloSecao</h2>
          <div className="mt-10 grid gap-12 md:grid-cols-2">
            <TituloSecao
              eyebrow="Esquerda · padrão"
              titulo="Inteligência institucional"
              subtitulo="Subtítulo opcional em corpo editorial, no máximo 60 caracteres por linha."
            />
            <TituloSecao
              eyebrow="Centro · Saúde"
              titulo="Governança no SUS"
              subtitulo="Subtítulo alinhado ao centro."
              alinhamento="centro"
              vert="saude"
            />
          </div>
        </Container>
      </Secao>

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">LinkEditorial</h2>
          <div className="mt-6 flex flex-col gap-3 font-corpo text-corpo text-grafite">
            <p>
              Link interno padrão:{" "}
              <LinkEditorial href="/o-grupo">Conheça o Grupo NTC</LinkEditorial>.
            </p>
            <p>
              Link externo:{" "}
              <LinkEditorial href="https://www.gov.br" externo>
                Portal Gov.br
              </LinkEditorial>
              .
            </p>
          </div>
          <div className="mt-10 bg-oxford p-8">
            <p className="font-corpo text-corpo text-osso">
              Link inverso sobre fundo Oxford:{" "}
              <LinkEditorial href="/o-grupo" variante="inverso">
                Conheça o Grupo NTC
              </LinkEditorial>
              .
            </p>
          </div>
        </Container>
      </Secao>

      <Secao fundo="osso" vertical="padrao">
        <Container variante="amplo">
          <h2 className="font-titulo text-h3 text-oxford">Selo</h2>
          <p className="mt-2 font-corpo text-corpo text-grafite-suave">
            Pílulas para tags, modalidades, status.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Selo variante="dourado">Dourado</Selo>
            <Selo variante="oxford">Oxford</Selo>
            <Selo variante="cardeal">Cardeal</Selo>
            <Selo variante="oliva">Oliva</Selo>
            <Selo variante="neutro">Neutro</Selo>
            <Selo variante="oxford" tamanho="medio">Tamanho médio</Selo>
          </div>
        </Container>
      </Secao>
    </main>
  );
}
