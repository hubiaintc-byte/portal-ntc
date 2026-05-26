import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EVENTOS_AGENDA } from "./conteudoEventos";
import { EventoPresencialLayout } from "./EventoPresencialLayout";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(EVENTOS_AGENDA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const evento = EVENTOS_AGENDA[slug];
  if (!evento) return {};
  return {
    title: `${evento.titulo} · Grupo NTC`,
    description: evento.subtitulo,
  };
}

/**
 * Página /agenda/[slug] — template dinâmico para eventos individuais.
 *
 * Faz lookup do evento por slug em EVENTOS_AGENDA e renderiza o Layout
 * apropriado baseado em evento.formato ("presencial" | "hibrido" | "online").
 *
 * Apenas EventoPresencialLayout implementado nesta sessão.
 * Slugs híbridos/online caem em notFound() até que seus layouts sejam portados.
 */
export default async function EventoPage({ params }: PageProps) {
  const { slug } = await params;
  const evento = EVENTOS_AGENDA[slug];
  if (!evento) notFound();

  switch (evento.formato) {
    case "presencial":
      return <EventoPresencialLayout evento={evento} />;
    case "hibrido":
    case "online":
      // TODO: implementar EventoHibridoLayout e EventoOnlineLayout em sessões futuras
      notFound();
  }
}
