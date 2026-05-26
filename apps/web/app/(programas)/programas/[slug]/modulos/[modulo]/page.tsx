import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MODULOS_PROGRAMAS, lookupModulo } from "./conteudoModulos";
import { ModuloOnlineLayout } from "./ModuloOnlineLayout";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string; modulo: string }>;
}

export function generateStaticParams() {
  return Object.entries(MODULOS_PROGRAMAS).flatMap(([slug, modulos]) =>
    Object.keys(modulos).map((modulo) => ({ slug, modulo })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, modulo } = await params;
  const m = lookupModulo(slug, modulo);
  if (!m) return {};
  return {
    title: m.metaTitle,
    description: m.metaDescription,
  };
}

/**
 * Página /programas/[slug]/modulos/[modulo] — template dinâmico para
 * módulos individuais de programas.
 *
 * Faz lookup do módulo por slug+modulo em MODULOS_PROGRAMAS e renderiza
 * o Layout apropriado baseado em formato (atualmente só "online-ao-vivo").
 *
 * Futuros formatos (presencial/híbrido) entrarão com switch quando surgirem.
 */
export default async function ModuloPage({ params }: PageProps) {
  const { slug, modulo } = await params;
  const m = lookupModulo(slug, modulo);
  if (!m) notFound();

  // Atualmente só formato online-ao-vivo. Switch quando surgir 2º formato.
  return <ModuloOnlineLayout modulo={m} />;
}
