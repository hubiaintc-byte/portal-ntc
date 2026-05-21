import type { Metadata } from "next";

import {
  BlocoCitacao,
  BlocoCtaInstitucional,
  BlocoEventOn,
  BlocoNumeros,
  Container,
  Eyebrow,
  GradeEspecialistas,
  GradeEventos,
  GradeProgramas,
  HeroInstitucional,
  HeroSliderPremium,
  Secao,
  TituloSecao,
  type EspecialistaItem,
  type EventoItem,
  type OperacaoEventOn,
  type ProgramaItem,
  type SlidePremium,
  type TipoSlide,
} from "@ntc/ui";
import type { Especialista, Programa } from "@ntc/types";

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
  title: "Grupo NTC · Inteligência institucional. Impacto real.",
  description:
    "O novo padrão da formação institucional para a Administração Pública brasileira. Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida.",
};

/**
 * Mapeia o slide vindo do Global Home (payload-types) para o shape
 * `SlidePremium` consumido pelo `<HeroSliderPremium>`. Slides sem
 * imagem populada são descartados — o componente não aceita ImagemRef
 * `undefined`.
 */
function mapearSlide(slide: NonNullable<NonNullable<ReturnType<typeof slidesDoGlobal>>[number]>): SlidePremium | null {
  const imagem = imagemRef(slide.imagem, slide.titulo);
  if (!imagem) return null;

  const tipo: TipoSlide = (slide.tipo ?? "institucional") as TipoSlide;

  return {
    tipo,
    imagem,
    eyebrow: slide.eyebrow,
    titulo: slide.titulo,
    subtitulo: slide.subtitulo,
    eventoPill: slide.eventoPill
      ? {
          data: slide.eventoPill.data ?? undefined,
          local: slide.eventoPill.local ?? undefined,
          modalidade: slide.eventoPill.modalidade ?? undefined,
        }
      : undefined,
    ctas: (slide.ctas ?? []).map((c) => ({
      rotulo: c.rotulo,
      link: c.link,
      variante: (c.variante ?? "primario") as "primario" | "secundario" | "textlink",
    })),
  };
}

// Tipo auxiliar para extrair o shape de slides do Global Home.
type SlidesArray = NonNullable<NonNullable<Awaited<ReturnType<typeof carregarHome>>["global"]>["heroSlider"]>["slides"];

function slidesDoGlobal(slides: SlidesArray | null | undefined): SlidesArray {
  return slides ?? [];
}

// Operações fixas do bloco EventOn (textos exatos do protótipo).
const OPERACOES_EVENTON: OperacaoEventOn[] = [
  {
    numero: "01",
    titulo: "Acessar evento ao vivo",
    descricao: "Sala de transmissão protegida com login e interação com docentes.",
    linkRotulo: "Acessar agora",
    link: "/eventon",
  },
  {
    numero: "02",
    titulo: "Assistir replay",
    descricao: "Conteúdo gravado disponível em prazo determinado para inscritos.",
    linkRotulo: "Ver replays",
    link: "/eventon",
  },
  {
    numero: "03",
    titulo: "Emitir certificado",
    descricao: "Certificado validável por código QR após cumprimento dos requisitos.",
    linkRotulo: "Emitir certificado",
    link: "/eventon",
  },
  {
    numero: "04",
    titulo: "Falar com suporte",
    descricao: "Atendimento dedicado para participantes durante e após o evento.",
    linkRotulo: "Abrir chamado",
    link: "/contato",
  },
];

export default async function HomePage() {
  const { global, areasEmFoco, eventosDestaque } = await carregarHome();
  const slidesGlobal = slidesDoGlobal(global?.heroSlider?.slides);
  const slidesMapeados: SlidePremium[] = (slidesGlobal ?? [])
    .map(mapearSlide)
    .filter((s): s is SlidePremium => s !== null);
  const intervaloMs = global?.heroSlider?.intervaloMs ?? 7000;

  const numeros = (global?.numerosImpacto ?? []).map((n) => ({
    valor: n.valor,
    rotulo: n.rotulo,
  }));

  // Programas para a Home: todos os programas das áreasEmFoco (a equipe
  // editorial decide quais áreas entram via /admin/globals/home).
  const programasItens: ProgramaItem[] = await carregarProgramasPorAreas(
    areasEmFoco.map((a) => a.id),
  );

  const eventos: EventoItem[] = eventosDestaque
    .map(mapearEvento)
    .filter((e): e is EventoItem => e !== null)
    .slice(0, 6);

  const especialistasDestaque = await carregarEspecialistasParaHome();
  const especialistas: EspecialistaItem[] = especialistasDestaque
    .map(mapearEspecialista)
    .filter((e): e is EspecialistaItem => e !== null);

  const cta = global?.ctaInstitucional;

  // Imagem do bloco EventOn — usa a Media `eventon-estudio.png` que o
  // seed já carregou. Resolvida via primeira foto disponível ou
  // fallback Picsum.
  const eventonImagem = await carregarImagemEventOn();

  return (
    <main id="conteudo">
      {slidesMapeados.length > 0 ? (
        <HeroSliderPremium slides={slidesMapeados} intervaloMs={intervaloMs} />
      ) : (
        <HeroInstitucional
          eyebrow="Grupo NTC · Núcleo de Tecnologia e Conhecimento"
          titulo="Inteligência institucional. Impacto real."
          subtitulo="Programas estratégicos, módulos com inscrições abertas, eventos online e presenciais, trilhas formativas e soluções sob medida."
          imagem={{
            src: "https://picsum.photos/seed/ntc-home/1600/1000",
            alt: "Imagem editorial institucional do Grupo NTC",
          }}
          altura="completa"
        />
      )}

      {eventos.length > 0 ? (
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Capacitação e Desenvolvimento"
              titulo="Eventos com inscrições abertas"
              subtitulo="Seminários, oficinas, jornadas, simpósios e cursos executivos do Grupo NTC, disponíveis para participação individual, inscrição de equipes e contratação institucional."
            />
            <div className="mt-12">
              <GradeEventos eventos={eventos} />
            </div>
          </Container>
        </Secao>
      ) : null}

      {programasItens.length > 0 ? (
        <Secao fundo="pergaminho" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Programas estratégicos"
              titulo="Da formação à transformação institucional"
              subtitulo="Quinze programas estratégicos distribuídos em três áreas — Educação, Gestão Pública e Saúde — com método editorial, evidência empírica e cuidado institucional."
            />
            <div className="mt-12">
              <GradeProgramas programas={programasItens} variante="editorial" />
            </div>
          </Container>
        </Secao>
      ) : null}

      {especialistas.length > 0 ? (
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow="Curadoria científica · Corpo docente"
              titulo="Ministros e ex-ministros do STF e do TCU."
              subtitulo="Juristas, gestores públicos, pesquisadores e autoridades técnicas. A curadoria científica do Grupo NTC reúne profissionais de referência nacional nas áreas de Educação, Gestão Pública, Contratações Públicas e Saúde."
            />
            <div className="mt-12">
              <GradeEspecialistas especialistas={especialistas} modo="regular" />
            </div>
          </Container>
        </Secao>
      ) : null}

      {numeros.length > 0 ? (
        <BlocoNumeros titulo="Capacidade institucional" numeros={numeros} fundo="pergaminho" />
      ) : null}

      <BlocoEventOn
        eyebrow="EventOn · Plataforma do Grupo NTC"
        titulo="EventOn: acesso, replay e certificado em um só ambiente"
        descricao="O EventOn é a infraestrutura digital dos eventos online do Grupo NTC, reunindo acesso ao vivo, replay protegido, materiais de apoio, suporte ao participante e emissão de certificados."
        imagemFundo={eventonImagem}
        ctas={[
          { rotulo: "Acessar EventOn", link: "/eventon" },
          { rotulo: "Suporte ao participante", link: "/contato" },
        ]}
        operacoes={OPERACOES_EVENTON}
      />

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
          titulo="Precisa formar uma equipe, rede ou instituição inteira?"
          descricao="Além dos eventos abertos, o Grupo NTC desenvolve turmas fechadas, programas completos, módulos específicos, trilhas formativas e soluções sob medida para secretarias, autarquias, fundações, escolas de governo, redes públicas e órgãos governamentais."
          rotuloCta="Solicitar proposta institucional"
          linkCta="/contato/proposta"
          variante="oxford"
        />
      )}

      <BlocoCitacao
        citacao="A capacidade institucional não se decreta. Constrói-se com método, evidência e tempo."
        autoria="Manifesto Soberano 2026"
        variante="discreta"
      />

      {slidesMapeados.length === 0 && eventos.length === 0 && programasItens.length === 0 ? (
        <Secao fundo="osso" vertical="compacto">
          <Container variante="editorial">
            <Eyebrow>Sobre esta página</Eyebrow>
            <p className="mt-4 max-w-[60ch] font-corpo text-corpo text-grafite text-pretty">
              O conteúdo institucional desta página é publicado pela equipe editorial via{" "}
              <code className="font-mono text-pequeno text-oxford">/admin/globals/home</code>. As
              seções acima aparecerão à medida que os campos do CMS forem preenchidos. Para
              popular com o conteúdo aprovado da Home v3, rode{" "}
              <code className="font-mono text-pequeno text-oxford">pnpm payload:seed:home-v3</code>.
            </p>
          </Container>
        </Secao>
      ) : null}
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

async function carregarProgramasPorAreas(areaIds: number[]): Promise<ProgramaItem[]> {
  if (areaIds.length === 0) return [];
  try {
    const payload = await obterPayload();
    const resultado = await payload.find({
      collection: "programas",
      depth: 1,
      limit: 50,
      where: { area: { in: areaIds } },
    });
    return (resultado.docs as Programa[]).map(mapearPrograma);
  } catch {
    return [];
  }
}

async function carregarImagemEventOn(): Promise<{ src: string; alt: string }> {
  try {
    const payload = await obterPayload();
    const res = await payload.find({
      collection: "media",
      where: { filename: { equals: "eventon-estudio.png" } },
      limit: 1,
      depth: 0,
    });
    const doc = res.docs[0];
    if (doc?.url) return { src: doc.url, alt: doc.alt || "Estúdio EventOn" };
  } catch {
    // fallback
  }
  return {
    src: "https://picsum.photos/seed/eventon/1600/900",
    alt: "Estúdio EventOn",
  };
}
