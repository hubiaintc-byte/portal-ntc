import type { ReactNode } from "react";

export type ColunasGrade = 2 | 3 | 4;
export type GapGrade = "pequeno" | "medio" | "amplo";

export interface GradeProps {
  children: ReactNode;
  colunas?: ColunasGrade;
  gap?: GapGrade;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
}

const colunasClasse: Record<ColunasGrade, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const gapClasse: Record<GapGrade, string> = {
  pequeno: "gap-4 sm:gap-6",
  medio: "gap-6 sm:gap-8 lg:gap-10",
  amplo: "gap-8 sm:gap-12 lg:gap-16",
};

export function Grade({
  children,
  colunas = 3,
  gap = "medio",
  className,
  as: Tag = "div",
}: GradeProps) {
  const classes = ["grid w-full", colunasClasse[colunas], gapClasse[gap], className]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}
