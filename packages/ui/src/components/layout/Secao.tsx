import type { ReactNode } from "react";

export type FundoSecao = "osso" | "pergaminho" | "oxford" | "graficaOxford";
export type VerticalSecao = "padrao" | "amplo" | "compacto";
export type VertSecao = "educacao" | "gestao-publica" | "saude";

export interface SecaoProps {
  children: ReactNode;
  fundo?: FundoSecao;
  vertical?: VerticalSecao;
  vert?: VertSecao | null;
  id?: string;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

const fundoClasse: Record<FundoSecao, string> = {
  osso: "bg-osso text-grafite",
  pergaminho: "bg-pergaminho text-grafite",
  oxford: "bg-oxford text-osso [&_h1]:text-osso [&_h2]:text-osso [&_h3]:text-osso [&_h4]:text-osso",
  graficaOxford:
    "bg-oxford text-osso [&_h1]:text-osso [&_h2]:text-osso [&_h3]:text-osso [&_h4]:text-osso bg-[radial-gradient(circle_at_top_right,rgba(181,153,90,0.10),transparent_60%)]",
};

const verticalClasse: Record<VerticalSecao, string> = {
  padrao: "py-[var(--spacing-secao-vertical)]",
  amplo: "py-[calc(var(--spacing-secao-vertical)*1.35)]",
  compacto: "py-[var(--spacing-bloco-vertical)]",
};

export function Secao({
  children,
  fundo = "osso",
  vertical = "padrao",
  vert = null,
  id,
  className,
  as: Tag = "section",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
}: SecaoProps) {
  const classes = [fundoClasse[fundo], verticalClasse[vertical], className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      id={id}
      className={classes}
      data-vert={vert ?? undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {children}
    </Tag>
  );
}
