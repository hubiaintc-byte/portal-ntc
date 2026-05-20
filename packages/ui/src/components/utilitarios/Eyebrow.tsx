import type { ReactNode } from "react";
import { acentoPorArea, type Area } from "../heroes/tipos";

export interface EyebrowProps {
  children: ReactNode;
  vert?: Area;
  variante?: "padrao" | "dourado";
}

export function Eyebrow({ children, vert, variante = "padrao" }: EyebrowProps) {
  const cor =
    variante === "dourado"
      ? "text-dourado"
      : vert
        ? acentoPorArea(vert).texto
        : "text-grafite-suave";
  return (
    <p className={`font-corpo text-eyebrow uppercase tracking-[0.22em] ${cor}`}>
      {children}
    </p>
  );
}
