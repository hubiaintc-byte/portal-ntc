import type { Metadata } from "next";

import {
  Container,
  Eyebrow,
  GradeEspecialistas,
  HeroInstitucional,
  Secao,
  TituloSecao,
  type EspecialistaItem,
} from "@ntc/ui";

import { carregarEspecialistas } from "@/lib/payload/fetchEspecialistas";
import { mapearEspecialista } from "@/lib/payload/mappers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corpo Docente · Grupo NTC",
  description:
    "Doutoras e doutores com trajetória institucional em Educação, Gestão Pública e Saúde — o corpo docente do Grupo NTC.",
};

const HERO = {
  eyebrow: "Quem ensina no Grupo NTC",
  titulo: "Corpo Docente",
  subtitulo:
    "Doutoras e doutores com experiência em gestão pública e formação de capacidades — sustentam o método editorial do Grupo NTC.",
  imagem: {
    src: "https://picsum.photos/seed/ntc-corpo-docente/1600/900",
    alt: "Especialistas do corpo docente do Grupo NTC",
  },
};

export default async function CorpoDocentePage() {
  const especialistas = await carregarEspecialistas();
  const mapeados: EspecialistaItem[] = especialistas
    .map(mapearEspecialista)
    .filter((e): e is EspecialistaItem => e !== null);

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
            eyebrow="Corpo Docente NTC"
            titulo="Trajetórias institucionais"
            alinhamento="centro"
          />
          <div className="mt-16">
            {mapeados.length > 0 ? (
              <GradeEspecialistas especialistas={mapeados} modo="cerimonial" />
            ) : (
              <div className="mx-auto max-w-[60ch] text-center">
                <Eyebrow>Em curadoria</Eyebrow>
                <p className="mt-4 font-corpo text-corpo text-grafite text-pretty">
                  O corpo docente do Grupo NTC está sendo publicado pela equipe editorial via{" "}
                  <code className="font-mono text-pequeno text-oxford">
                    /admin/collections/especialistas
                  </code>
                  . Em breve esta página reflete a lista completa.
                </p>
              </div>
            )}
          </div>
        </Container>
      </Secao>
    </main>
  );
}
