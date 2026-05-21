import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BlocoCtaInstitucional,
  BlocoNumeros,
  BlocoTexto,
  Container,
  GradeProgramas,
  HeroArea,
  Secao,
  TituloSecao,
  type ProgramaItem,
} from "@ntc/ui";
import type { RichTextContent } from "@ntc/ui";

import { carregarArea } from "@/lib/payload/fetchArea";
import { imagemRef, mapearPrograma } from "@/lib/payload/mappers";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ area: "educacao" }, { area: "gestao-publica" }, { area: "saude" }];
}

interface PageProps {
  params: Promise<{ area: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { area: slug } = await params;
  const { area } = await carregarArea(slug);
  if (!area) {
    return { title: "Área Estratégica não encontrada · Grupo NTC" };
  }
  return {
    title: `${area.nome} · Grupo NTC`,
    description: area.subtituloHero,
  };
}

const CTA_POR_AREA: Record<string, "oxford" | "cardeal" | "oliva"> = {
  educacao: "oxford",
  "gestao-publica": "cardeal",
  saude: "oliva",
};

function ehRichText(v: unknown): v is RichTextContent {
  return (
    typeof v === "object" &&
    v !== null &&
    "root" in (v as Record<string, unknown>) &&
    typeof (v as { root: unknown }).root === "object"
  );
}

export default async function AreaPage({ params }: PageProps) {
  const { area: slug } = await params;
  const { area, programas } = await carregarArea(slug);
  if (!area) notFound();

  const imagemHero = imagemRef(area.imagemHero, area.nome);
  if (!imagemHero) {
    notFound();
  }

  const programasItens: ProgramaItem[] = programas.map(mapearPrograma);

  const numeros = (area.numerosImpacto ?? []).map((n) => ({
    valor: n.valor,
    rotulo: n.rotulo,
  }));

  const corAcento = area.corAcento || "#11365E";
  const varianteCta = CTA_POR_AREA[area.sigla] ?? "oxford";

  return (
    <main id="conteudo">
      <HeroArea
        area={area.sigla}
        eyebrow={area.eyebrow ?? undefined}
        titulo={area.tituloHero}
        subtitulo={area.subtituloHero}
        imagem={imagemHero}
        corAcento={corAcento}
      />

      {ehRichText(area.posicionamento) ? (
        <BlocoTexto eyebrow="Posicionamento" titulo="Como atuamos nesta área" corpo={area.posicionamento} />
      ) : null}

      {numeros.length > 0 ? (
        <BlocoNumeros
          titulo="Capacidade desta área"
          numeros={numeros}
          fundo="pergaminho"
          vert={area.sigla}
        />
      ) : null}

      {programasItens.length > 0 ? (
        <Secao fundo="osso" vertical="padrao">
          <Container variante="amplo">
            <TituloSecao
              eyebrow={`Programas · ${area.nome}`}
              titulo="Programas estratégicos da área"
              vert={area.sigla}
            />
            <div className="mt-12">
              <GradeProgramas
                programas={programasItens}
                variante="editorial"
                agruparPorArea={false}
              />
            </div>
          </Container>
        </Secao>
      ) : null}

      <BlocoCtaInstitucional
        titulo={`Solicite uma proposta em ${area.nome}`}
        descricao="Conte-nos sobre o desafio institucional da sua rede. Nossa equipe responde em até 2 dias úteis."
        rotuloCta="Solicitar proposta"
        linkCta={`/contato/proposta?area=${area.slug}`}
        variante={varianteCta}
      />
    </main>
  );
}
