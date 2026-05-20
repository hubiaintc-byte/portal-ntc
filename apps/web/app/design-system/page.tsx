import type { Metadata } from "next";

import {
  Breadcrumbs,
  Container,
  Grade,
  type ItemMenu,
  NavegacaoSoberana,
  Secao,
} from "@ntc/ui";

export const metadata: Metadata = {
  title: "Design System — sandbox interno",
  robots: { index: false, follow: false },
};

const ROTAS: ItemMenu[] = [
  { rotulo: "Grupo NTC", href: "/grupo" },
  {
    rotulo: "Programas",
    filhos: [
      { rotulo: "EDUTEC", href: "/programas/edutec", descricao: "Educação Digital" },
      { rotulo: "PEAR", href: "/programas/pear", descricao: "Alfabetização" },
      { rotulo: "PROSUS+", href: "/programas/prosus", descricao: "Governança no SUS" },
    ],
  },
  {
    rotulo: "Capacitação",
    filhos: [
      { rotulo: "Agenda Geral NTC", href: "/capacitacao", descricao: "Eventos abertos" },
      { rotulo: "EventOn", href: "/eventon", descricao: "Plataforma de acesso e replay" },
    ],
  },
  {
    rotulo: "Soluções",
    filhos: [
      { rotulo: "NTC Educação", href: "/educacao", descricao: "Redes públicas de ensino" },
      { rotulo: "NTC Gestão Pública", href: "/gestao-publica", descricao: "Administração" },
      { rotulo: "NTC Saúde", href: "/saude", descricao: "SUS" },
    ],
  },
  { rotulo: "Conteúdos", href: "/conteudos" },
  { rotulo: "Contato", href: "/contato" },
];

const PROGRAMAS_DEMO = [
  { sigla: "EDUTEC", titulo: "Educação Digital", vertical: "NTC Educação" },
  { sigla: "PEAR", titulo: "Alfabetização de Alta Performance", vertical: "NTC Educação" },
  { sigla: "PEI", titulo: "Educação Integral", vertical: "NTC Educação" },
  { sigla: "AGIP", titulo: "Contratações Públicas", vertical: "NTC Gestão Pública" },
  { sigla: "LIDERA", titulo: "Direção Estratégica", vertical: "NTC Gestão Pública" },
  { sigla: "PROSUS+", titulo: "Governança no SUS", vertical: "NTC Saúde" },
];

export default function DesignSystemPage() {
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS}
        ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato" }}
        ctaSecundario={{ rotulo: "Área do Participante", href: "/eventon/area" }}
      />

      <main id="conteudo">
        <Secao fundo="osso" vertical="compacto">
          <Container variante="amplo">
            <Breadcrumbs
              itens={[
                { rotulo: "Início", href: "/" },
                { rotulo: "Design System", href: "/_design-system" },
                { rotulo: "Layout e Navegação" },
              ]}
            />
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
              Sandbox interna · não-listada no sitemap
            </p>
            <h1 className="mt-4 text-h1 text-balance">
              Layout primitives e navegação <em className="text-cardeal">Soberana</em>
            </h1>
            <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-pretty">
              Esta página existe apenas como checkpoint visual da Janela A do Sprint F.
              Aqui você confere a navegação principal, o drawer mobile, breadcrumbs com
              JSON-LD e os três primitives de layout — <code>Container</code>,{" "}
              <code>Secao</code> e <code>Grade</code> — que são a base de todas as páginas
              do portal.
            </p>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
              Container · variante editorial
            </p>
            <h2 className="mt-3 text-h2">Largura editorial padrão (92ch)</h2>
            <p className="mt-6 font-corpo text-corpo text-pretty">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus
              rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie
              magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat
              nisl ut dapibus.
            </p>
            <p className="mt-4 font-corpo text-corpo text-pretty">
              Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio.
              Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec
              congue lacinia dui, a porttitor lectus condimentum laoreet. Nunc eu ullamcorper
              orci. Quisque eget odio ac lectus vestibulum faucibus eget in metus.
            </p>
          </Container>
        </Secao>

        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
              Grade · 3 colunas · gap médio
            </p>
            <h2 className="mt-3 text-h2">Programas em evidência (placeholder)</h2>
            <Grade colunas={3} gap="medio" className="mt-10">
              {PROGRAMAS_DEMO.map((programa) => (
                <article
                  key={programa.sigla}
                  className="flex h-full flex-col border border-linha-sutil bg-osso p-8 transition-colors hover:border-oxford"
                >
                  <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-grafite-suave">
                    {programa.vertical}
                  </p>
                  <h3 className="mt-4 font-titulo text-h3 text-oxford">{programa.sigla}</h3>
                  <p className="mt-3 font-corpo text-corpo text-grafite text-pretty">
                    {programa.titulo}
                  </p>
                </article>
              ))}
            </Grade>
          </Container>
        </Secao>

        <Secao fundo="oxford" vertical="padrao">
          <Container variante="texto">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.18em] text-dourado">
              Secao · fundo oxford · variante texto (62ch)
            </p>
            <h2 className="mt-3 text-h2 text-osso">
              Tipografia editorial em fundo institucional
            </h2>
            <p className="mt-6 font-corpo text-corpo text-osso/90 text-pretty">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
              ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
              ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </Container>
        </Secao>
      </main>
    </>
  );
}
