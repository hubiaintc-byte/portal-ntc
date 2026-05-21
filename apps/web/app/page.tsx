import type { Metadata } from "next";

import {
  BlocoCitacao,
  BlocoCtaInstitucional,
  BlocoNumeros,
  Container,
  Eyebrow,
  GradeEspecialistas,
  GradeEventos,
  GradeProgramas,
  HeroInstitucional,
  Secao,
  TituloSecao,
  type EspecialistaItem,
  type EventoItem,
  type ProgramaItem,
} from "@ntc/ui";
import type { Especialista } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";
import { carregarHome } from "@/lib/payload/fetchHome";
import {
  imagemRef,
  mapearEspecialista,
  mapearEvento,
  mapearPrograma,
} from "@/lib/payload/mappers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Grupo NTC — Núcleo de Tecnologia e Conhecimento",
  description:
    "Inteligência institucional aplicada à formação e ao desenvolvimento de capacidades públicas. Educação · Gestão Pública · Saúde.",
};

const HERO_FALLBACK = {
  eyebrow: "Grupo NTC · Núcleo de Tecnologia e Conhecimento",
  titulo: "Inteligência institucional. Impacto real.",
  subtitulo:
    "Formação e desenvolvimento de capacidades públicas em Educação, Gestão Pública e Saúde — com método editorial, evidência empírica e cuidado institucional.",
  imagem: {
    src: "https://picsum.photos/seed/ntc-home/1600/1000",
    alt: "Imagem editorial institucional do Grupo NTC",
  },
};

export default async function HomePage() {
  const { global, areasEmFoco, eventosDestaque, clientesDestaque } = await carregarHome();
  const heroImagem =
    imagemRef(global?.hero?.imagem, global?.hero?.titulo ?? HERO_FALLBACK.titulo) ??
    HERO_FALLBACK.imagem;

  const hero = {
    eyebrow: global?.hero?.eyebrow ?? HERO_FALLBACK.eyebrow,
    titulo: global?.hero?.titulo ?? HERO_FALLBACK.titulo,
    subtitulo: global?.hero?.subtitulo ?? HERO_FALLBACK.subtitulo,
    imagem: heroImagem,
    ctas: (global?.hero?.ctas ?? [])
      .map((c) =>
        c.rotulo && c.link
          ? {
              rotulo: c.rotulo,
              href: c.link,
              variante: (c.variante ?? "primario") as "primario" | "secundario",
            }
          : null,
      )
      .filter((c): c is { rotulo: string; href: string; variante: "primario" | "secundario" } =>
        Boolean(c),
      ),
  };

  const numeros = (global?.numerosImpacto ?? []).map((n) => ({
    valor: n.valor,
    rotulo: n.rotulo,
  }));

  const programasAreasEmFoco: ProgramaItem[] = areasEmFoco
    .flatMap((a) =>
      Array.isArray(a.programasDestacados)
        ? a.programasDestacados.filter(
            (p): p is import("@ntc/types").Programa =>
              typeof p === "object" && p !== null && "sigla" in p,
          )
        : [],
    )
    .map(mapearPrograma);

  const eventos: EventoItem[] = eventosDestaque
    .map(mapearEvento)
    .filter((e): e is EventoItem => e !== null)
    .slice(0, 6);

  const especialistasDestaque = await carregarEspecialistasParaHome();
  const especialistas: EspecialistaItem[] = especialistasDestaque
    .map(mapearEspecialista)
    .filter((e): e is EspecialistaItem => e !== null);

  const cta = global?.ctaInstitucional;

  return (
    <main id="conteudo">
      <HeroInstitucional
        eyebrow={hero.eyebrow ?? undefined}
        titulo={hero.titulo}
        subtitulo={hero.subtitulo ?? undefined}
        imagem={hero.imagem}
        ctas={hero.ctas.length > 0 ? hero.ctas : undefined}
        altura="completa"
      />

      {numeros.length > 0 ? (
        <BlocoNumeros titulo="Capacidade institucional" numeros={numeros} fundo="osso" />
      ) : null}

      {programasAreasEmFoco.length > 0 ? (
        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Programas estratégicos"
              titulo="Da formação à transformação institucional"
              subtitulo="Conheça os programas em destaque nas três áreas de atuação do Grupo NTC."
            />
            <div className="mt-12">
              <GradeProgramas programas={programasAreasEmFoco} variante="editorial" />
            </div>
          </Container>
        </Secao>
      ) : null}

      {eventos.length > 0 ? (
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Agenda institucional"
              titulo="Próximos eventos com inscrição aberta"
            />
            <div className="mt-12">
              <GradeEventos eventos={eventos} agruparPorMes />
            </div>
          </Container>
        </Secao>
      ) : null}

      {especialistas.length > 0 ? (
        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Corpo Docente"
              titulo="Especialistas com trajetória institucional"
            />
            <div className="mt-12">
              <GradeEspecialistas especialistas={especialistas} modo="regular" />
            </div>
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
          titulo="Inteligência institucional para o que vem agora"
          descricao="Conheça nossas modalidades de atuação e como o Grupo NTC pode apoiar sua rede pública."
          rotuloCta="Solicitar proposta"
          linkCta="/contato/proposta"
          variante="oxford"
        />
      )}

      {clientesDestaque.length === 0 && areasEmFoco.length === 0 && eventos.length === 0 ? (
        <Secao fundo="osso" vertical="compacto">
          <Container variante="editorial">
            <Eyebrow>Sobre a Home</Eyebrow>
            <p className="mt-4 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
              O conteúdo institucional desta página é publicado pela equipe editorial via{" "}
              <code className="font-mono text-pequeno text-oxford">/admin/globals/home</code>.
              As seções acima aparecerão à medida que os campos do CMS forem preenchidos.
            </p>
          </Container>
        </Secao>
      ) : null}

      <BlocoCitacao
        citacao="A capacidade institucional não se decreta. Constrói-se com método, evidência e tempo."
        autoria="Manifesto Soberano 2026"
        variante="discreta"
      />
    </main>
  );
}

async function carregarEspecialistasParaHome(): Promise<Especialista[]> {
  try {
    const payload = await obterPayload();
    const resultado = await payload.find({
      collection: "especialistas",
      depth: 1,
      limit: 4,
      sort: "-updatedAt",
    });
    return resultado.docs as Especialista[];
  } catch {
    return [];
  }
}
