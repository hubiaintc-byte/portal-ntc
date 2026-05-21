import type { Metadata } from "next";

import {
  BlocoCtaInstitucional,
  BlocoNumeros,
  BlocoTexto,
  Container,
  Eyebrow,
  GradeClientes,
  GradeEspecialistas,
  HeroInstitucional,
  Secao,
  TituloSecao,
  type ClienteItem,
  type EspecialistaItem,
} from "@ntc/ui";
import type { RichTextContent } from "@ntc/ui";

import { carregarOGrupo } from "@/lib/payload/fetchOGrupo";
import { imagemRef, mapearCliente, mapearEspecialista } from "@/lib/payload/mappers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "O Grupo NTC · Inteligência institucional aplicada",
  description:
    "Quem somos, como trabalhamos e por que existimos. Conheça o Grupo NTC — Núcleo de Tecnologia e Conhecimento.",
};

const HERO_FALLBACK = {
  eyebrow: "Quem somos",
  titulo: "O Grupo NTC",
  subtitulo:
    "Núcleo de Tecnologia e Conhecimento — inteligência institucional aplicada à formação e ao desenvolvimento de capacidades públicas.",
  imagem: {
    src: "https://picsum.photos/seed/ntc-grupo/1600/900",
    alt: "Imagem editorial institucional do Grupo NTC",
  },
};

function ehRichText(v: unknown): v is RichTextContent {
  return (
    typeof v === "object" &&
    v !== null &&
    "root" in (v as Record<string, unknown>) &&
    typeof (v as { root: unknown }).root === "object"
  );
}

export default async function OGrupoPage() {
  const { global, especialistas, clientes } = await carregarOGrupo();

  const heroImagem =
    imagemRef(global?.hero?.imagem, global?.hero?.titulo ?? HERO_FALLBACK.titulo) ??
    HERO_FALLBACK.imagem;

  const heroProps = {
    eyebrow: global?.hero?.eyebrow ?? HERO_FALLBACK.eyebrow,
    titulo: global?.hero?.titulo ?? HERO_FALLBACK.titulo,
    subtitulo: global?.hero?.subtitulo ?? HERO_FALLBACK.subtitulo,
    imagem: heroImagem,
  };

  const numeros = (global?.numerosImpacto ?? []).map((n) => ({
    valor: n.valor,
    rotulo: n.rotulo,
  }));

  const especialistasMapeados: EspecialistaItem[] = especialistas
    .map(mapearEspecialista)
    .filter((e): e is EspecialistaItem => e !== null);

  const clientesMapeados: ClienteItem[] = clientes
    .map(mapearCliente)
    .filter((c): c is ClienteItem => c !== null);

  const cta = global?.ctaInstitucional;

  const conteudoVazio =
    !global ||
    (!ehRichText(global.apresentacao) &&
      !ehRichText(global.trajetoria) &&
      !ehRichText(global.posicionamento) &&
      !ehRichText(global.metodologia) &&
      numeros.length === 0);

  return (
    <main id="conteudo">
      <HeroInstitucional
        eyebrow={heroProps.eyebrow ?? undefined}
        titulo={heroProps.titulo}
        subtitulo={heroProps.subtitulo ?? undefined}
        imagem={heroProps.imagem}
        altura="editorial"
      />

      {ehRichText(global?.apresentacao) ? (
        <BlocoTexto eyebrow="Apresentação" titulo="Quem somos" corpo={global.apresentacao} />
      ) : null}

      {ehRichText(global?.trajetoria) ? (
        <BlocoTexto eyebrow="Trajetória" titulo="De onde viemos" corpo={global.trajetoria} />
      ) : null}

      {ehRichText(global?.posicionamento) ? (
        <BlocoTexto
          eyebrow="Posicionamento"
          titulo="Onde nos colocamos"
          corpo={global.posicionamento}
        />
      ) : null}

      {numeros.length > 0 ? (
        <BlocoNumeros titulo="Capacidade institucional" numeros={numeros} fundo="pergaminho" />
      ) : null}

      {ehRichText(global?.metodologia) ? (
        <BlocoTexto eyebrow="Metodologia" titulo="Como entregamos" corpo={global.metodologia} />
      ) : null}

      {especialistasMapeados.length > 0 ? (
        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Corpo Docente"
              titulo="Especialistas que sustentam o método"
              subtitulo="Trajetórias institucionais em Educação, Gestão Pública e Saúde."
            />
            <div className="mt-12">
              <GradeEspecialistas especialistas={especialistasMapeados} modo="expandido" />
            </div>
          </Container>
        </Secao>
      ) : null}

      {clientesMapeados.length > 0 ? (
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Instituições atendidas"
              titulo="Redes públicas que confiam no Grupo NTC"
            />
            <div className="mt-12">
              <GradeClientes clientes={clientesMapeados} colunas={5} />
            </div>
          </Container>
        </Secao>
      ) : null}

      {conteudoVazio ? (
        <Secao fundo="osso" vertical="compacto">
          <Container variante="editorial">
            <Eyebrow>Sobre esta página</Eyebrow>
            <p className="mt-4 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
              O conteúdo institucional desta página é publicado pela equipe editorial via{" "}
              <code className="font-mono text-pequeno text-oxford">/admin/globals/o-grupo</code>.
            </p>
          </Container>
        </Secao>
      ) : null}

      {cta?.titulo && cta?.rotuloCta && cta?.linkCta ? (
        <BlocoCtaInstitucional
          titulo={cta.titulo}
          descricao={cta.descricao ?? undefined}
          rotuloCta={cta.rotuloCta}
          linkCta={cta.linkCta}
          variante="oxford"
        />
      ) : (
        <BlocoCtaInstitucional
          titulo="Conheça nossas modalidades de atuação"
          descricao="In-company, turma aberta, sob medida ou contratação institucional — escolha como o Grupo NTC pode apoiar sua rede pública."
          rotuloCta="Conhecer as soluções"
          linkCta="/solucoes-estrategicas"
          variante="oxford"
        />
      )}
    </main>
  );
}
