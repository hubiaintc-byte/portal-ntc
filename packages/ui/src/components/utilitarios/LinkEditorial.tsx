import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

export interface LinkEditorialProps {
  href: string;
  externo?: boolean;
  variante?: "padrao" | "inverso";
  children: ReactNode;
}

const PALETA: Record<NonNullable<LinkEditorialProps["variante"]>, string> = {
  padrao:
    "text-oxford decoration-dourado underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
  inverso:
    "text-osso decoration-dourado underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dourado",
};

export function LinkEditorial({
  href,
  externo = false,
  variante = "padrao",
  children,
}: LinkEditorialProps) {
  const classes = `inline underline transition-colors ${PALETA[variante]}`;
  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
        <span aria-hidden className="ml-1 text-pequeno">↗</span>
      </a>
    );
  }
  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  );
}
