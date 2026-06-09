import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchEvento } from "@/lib/cms/eventos";
import { aplicarOverrideOnline, buscarOverride } from "@/lib/cms/overrideEventoOnline";

import { EVENTOS_AGENDA } from "./conteudoEventos";
import { EventoPresencialLayout } from "./EventoPresencialLayout";
import { EventoOnlineLayout } from "./EventoOnlineLayout";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const estaticos = Object.keys(EVENTOS_AGENDA);
  try {
    const { obterPayload } = await import("@/lib/payloadClient");
    const payload = await obterPayload();
    const res = await payload.find({ collection: "eventos", limit: 100, depth: 0 });
    const doCms = res.docs
      .map((d) => (d as { slug?: string }).slug)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set([...estaticos, ...doCms])).map((slug) => ({ slug }));
  } catch {
    return estaticos.map((slug) => ({ slug }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const evento =
    (await fetchEvento(slug).catch(() => null)) ?? EVENTOS_AGENDA[slug];
  if (!evento) return {};
  return {
    title: `${evento.titulo} · Grupo NTC`,
    description: evento.subtitulo,
  };
}

/**
 * Página /agenda/[slug] — template dinâmico para eventos individuais.
 *
 * Faz lookup do evento por slug no CMS (fetchEvento) com fallback para o
 * estático EVENTOS_AGENDA, e renderiza o Layout apropriado baseado em
 * evento.formato ("presencial" | "hibrido" | "online").
 *
 * Presencial e híbrido compartilham EventoPresencialLayout (ambos têm `local`).
 * Online usa EventoOnlineLayout (estrutura evt-* do protótipo EDUTEC).
 */
export default async function EventoPage({ params }: PageProps) {
  const { slug } = await params;

  // Quando há evento ESTÁTICO para o slug, ele é a fonte de conteúdo (textos
  // validados na porta); o CMS apenas sobrescreve capa/data/folder (override).
  // Slugs sem estático caem no fluxo CMS completo (fetchEvento/adaptarEvento).
  const estatico = EVENTOS_AGENDA[slug];

  if (estatico?.formato === "online") {
    const ovr = await buscarOverride(slug);
    const eventoFinal = ovr ? aplicarOverrideOnline(estatico, ovr) : estatico;
    return <EventoOnlineLayout evento={eventoFinal} />;
  }

  const evento =
    estatico ??
    (await fetchEvento(slug).catch((err) => {
      console.error("[agenda] fetch CMS falhou, usando fallback:", err);
      return null;
    }));

  if (!evento) notFound();

  switch (evento.formato) {
    case "presencial":
    case "hibrido":
      return <EventoPresencialLayout evento={evento} />;
    case "online":
      return <EventoOnlineLayout evento={evento} />;
  }
}
