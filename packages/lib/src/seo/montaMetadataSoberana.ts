import type { Metadata } from "next";

export interface MetadataSoberanaInput {
  titulo: string;
  descricao: string;
  imagemOg?: string;
  tipo?: "website" | "article" | "event";
}

const DEFAULT_OG = "/og-default.jpg";
const SUFIXO_INSTITUCIONAL = "Grupo NTC";

export function montaMetadataSoberana(input: MetadataSoberanaInput): Metadata {
  const tituloCompleto = input.titulo.includes(SUFIXO_INSTITUCIONAL)
    ? input.titulo
    : `${input.titulo} — ${SUFIXO_INSTITUCIONAL}`;
  const imagem = input.imagemOg ?? DEFAULT_OG;
  const tipoOg = input.tipo === "event" ? "article" : (input.tipo ?? "website");

  return {
    title: tituloCompleto,
    description: input.descricao,
    openGraph: {
      title: tituloCompleto,
      description: input.descricao,
      type: tipoOg,
      images: [{ url: imagem }],
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: tituloCompleto,
      description: input.descricao,
      images: [imagem],
    },
  };
}
