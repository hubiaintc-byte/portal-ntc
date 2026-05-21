import type { Metadata } from "next";

import {
  BlocoCtaInstitucional,
  CardArea,
  Container,
  Eyebrow,
  Grade,
  HeroInstitucional,
  Secao,
  TituloSecao,
} from "@ntc/ui";
import { extrairResumoDeRichText } from "@/lib/payload/richTextHelpers";

import { carregarAreas } from "@/lib/payload/fetchAreas";
import { mapearAreaParaCard } from "@/lib/payload/mappers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Soluções Estratégicas · Grupo NTC",
  description:
    "Três áreas de atuação institucional — NTC Educação, NTC Gestão Pública e NTC Saúde — com programas, eventos e especialistas em cada vertical.",
};

const HERO = {
  eyebrow: "Soluções estratégicas",
  titulo: "Três áreas. Um método institucional.",
  subtitulo:
    "O Grupo NTC atua em três verticais que se conectam pela mesma metodologia editorial e pela mesma fidelidade ao interesse público.",
  imagem: {
    src: "https://picsum.photos/seed/ntc-solucoes/1600/900",
    alt: "Soluções estratégicas Grupo NTC",
  },
};

export default async function SolucoesEstrategicasPage() {
  const areas = await carregarAreas();

  const cards = areas.map((a) => {
    const posicionamentoCurto = extrairResumoDeRichText(a.posicionamento, 240);
    return mapearAreaParaCard(a, posicionamentoCurto);
  });

  return (
    <main id="conteudo">
      <HeroInstitucional
        eyebrow={HERO.eyebrow}
        titulo={HERO.titulo}
        subtitulo={HERO.subtitulo}
        imagem={HERO.imagem}
        altura="editorial"
      />

      <Secao fundo="pergaminho" vertical="padrao">
        <Container variante="amplo">
          <TituloSecao
            eyebrow="As três áreas"
            titulo="Onde aplicamos inteligência institucional"
            alinhamento="centro"
          />
          <div className="mt-16">
            {cards.length > 0 ? (
              <Grade colunas={3} gap="medio">
                {cards.map((c) => (
                  <CardArea key={c.area} {...c} />
                ))}
              </Grade>
            ) : (
              <div className="mx-auto max-w-[60ch] text-center">
                <Eyebrow>Em curadoria</Eyebrow>
                <p className="mt-4 font-corpo text-corpo text-grafite text-pretty">
                  As três áreas estão sendo publicadas pela equipe editorial via{" "}
                  <code className="font-mono text-pequeno text-oxford">
                    /admin/collections/areas
                  </code>
                  .
                </p>
              </div>
            )}
          </div>
        </Container>
      </Secao>

      <BlocoCtaInstitucional
        titulo="Solicite uma proposta institucional"
        descricao="Conte-nos sobre o desafio da sua rede pública. Em até 2 dias úteis nossa equipe retorna com a modalidade e o programa mais adequados."
        rotuloCta="Solicitar proposta"
        linkCta="/contato/proposta"
        variante="oxford"
      />
    </main>
  );
}
