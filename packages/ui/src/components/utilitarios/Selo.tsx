import type { ReactNode } from "react";

export type VarianteSelo = "dourado" | "oxford" | "neutro" | "cardeal" | "oliva";

export interface SeloProps {
  variante: VarianteSelo;
  children: ReactNode;
  tamanho?: "pequeno" | "medio";
}

const PALETA: Record<VarianteSelo, string> = {
  dourado: "bg-dourado text-oxford",
  oxford: "bg-oxford text-osso",
  neutro: "bg-pergaminho text-grafite ring-1 ring-inset ring-linha-sutil",
  cardeal: "bg-cardeal text-osso",
  oliva: "bg-oliva text-osso",
};

const TAMANHO: Record<NonNullable<SeloProps["tamanho"]>, string> = {
  pequeno: "px-2.5 py-0.5 text-eyebrow",
  medio: "px-3 py-1 text-pequeno",
};

export function Selo({ variante, children, tamanho = "pequeno" }: SeloProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-corpo uppercase tracking-[0.18em] ${PALETA[variante]} ${TAMANHO[tamanho]}`}
    >
      {children}
    </span>
  );
}
