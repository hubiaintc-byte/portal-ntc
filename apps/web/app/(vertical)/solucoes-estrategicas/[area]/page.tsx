import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600;

const VERTICAIS_VALIDAS = ["educacao", "gestao-publica", "saude"] as const;
type VerticalSlug = (typeof VERTICAIS_VALIDAS)[number];

export function generateStaticParams() {
  return VERTICAIS_VALIDAS.map((area) => ({ area }));
}

interface Props {
  params: Promise<{ area: string }>;
}

const TITULO_POR_VERTICAL: Record<VerticalSlug, string> = {
  educacao: "NTC Educação · Vertical Estratégica · Grupo NTC",
  "gestao-publica": "NTC Gestão Pública · Vertical Estratégica · Grupo NTC",
  saude: "NTC Saúde · Vertical Estratégica · Grupo NTC",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area } = await params;
  if (!VERTICAIS_VALIDAS.includes(area as VerticalSlug)) {
    return { title: "Vertical · Grupo NTC" };
  }
  return { title: TITULO_POR_VERTICAL[area as VerticalSlug] };
}

export default async function VerticalPage({ params }: Props) {
  const { area } = await params;
  if (!VERTICAIS_VALIDAS.includes(area as VerticalSlug)) {
    notFound();
  }
  return (
    <div className="vertical-page" data-vertical={area}>
      <main id="main">
        <section className="vert-section">
          <div className="container">
            <p className="eyebrow">Página em construção</p>
            <h1>NTC {area === "educacao" ? "Educação" : area === "gestao-publica" ? "Gestão Pública" : "Saúde"}</h1>
            <p>A página completa será renderizada nos próximos commits (C5 e C6).</p>
          </div>
        </section>
      </main>
    </div>
  );
}
