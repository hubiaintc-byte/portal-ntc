import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import {
  Container,
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

const SECOES: { slug: string; titulo: string; descricao: string }[] = [
  {
    slug: "heroes-e-cards",
    titulo: "Heroes e Cards",
    descricao:
      "5 famílias de Hero (institucional, área, programa, evento, conteúdo) e 5 famílias de Card. §5 e §6 do Inventário.",
  },
  {
    slug: "blocos",
    titulo: "Blocos editoriais",
    descricao:
      "Unidades composíveis dentro de páginas — números, citações, texto Lexical, CTAs cromáticos, imagem com legenda, FAQ, programação. §7.",
  },
  {
    slug: "listings",
    titulo: "Listings e grids",
    descricao:
      "GradeProgramas, GradeEventos, GradeEspecialistas, ListaModulos e FiltrosAgenda. §8.",
  },
  {
    slug: "utilitarios",
    titulo: "Utilitários tipográficos",
    descricao: "Eyebrow, TituloSecao, LinkEditorial e Selo. §10.",
  },
  {
    slug: "helpers",
    titulo: "Helpers sistêmicos",
    descricao: "ImagemSoberana, JsonLd, Revelar, RenderizadorLexical. §12.",
  },
];

export default function DesignSystemIndex() {
  return (
    <>
      <NavegacaoSoberana
        rotas={ROTAS}
        ctaPrincipal={{ rotulo: "Solicitar proposta", href: "/contato" }}
        ctaSecundario={{ rotulo: "Área do Participante", href: "/eventon/area" }}
      />

      <main id="conteudo">
        <Secao fundo="osso" vertical="padrao">
          <Container variante="editorial">
            <p className="font-corpo text-eyebrow uppercase tracking-[0.22em] text-grafite-suave">
              Sandbox interna · não-listada no sitemap
            </p>
            <h1 className="mt-4 font-titulo text-h1 text-balance text-oxford">
              Design System <em className="text-cardeal">Soberana 2026</em>
            </h1>
            <p className="mt-6 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
              Catálogo navegável dos componentes do <code className="font-mono text-pequeno text-oxford">@ntc/ui</code>. Cada categoria abre uma
              página com amostras, variantes e dados mock para validação visual.
            </p>
          </Container>
        </Secao>

        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SECOES.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/design-system/${s.slug}` as Route}
                    className="group flex h-full flex-col border border-linha-sutil bg-osso p-8 transition-colors hover:border-oxford focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado"
                  >
                    <h2 className="font-titulo text-h3 text-oxford">{s.titulo}</h2>
                    <p className="mt-3 font-corpo text-corpo text-grafite text-pretty">
                      {s.descricao}
                    </p>
                    <span className="mt-auto pt-6 font-corpo text-pequeno uppercase tracking-[0.18em] text-oxford">
                      Abrir →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Secao>
      </main>
    </>
  );
}
