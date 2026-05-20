import type { ReactNode } from "react";

export type VarianteContainer = "editorial" | "amplo" | "texto";

export interface ContainerProps {
  children: ReactNode;
  variante?: VarianteContainer;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "main" | "nav";
}

const larguraPorVariante: Record<VarianteContainer, string> = {
  editorial: "max-w-[min(92ch,100%)]",
  amplo: "max-w-[min(108ch,100%)]",
  texto: "max-w-[min(62ch,100%)]",
};

export function Container({
  children,
  variante = "editorial",
  className,
  as: Tag = "div",
}: ContainerProps) {
  const classes = [
    "mx-auto w-full px-[var(--spacing-margem-editorial)]",
    larguraPorVariante[variante],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}
