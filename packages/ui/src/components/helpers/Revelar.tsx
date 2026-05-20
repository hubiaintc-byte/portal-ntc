"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface RevelarProps {
  children: ReactNode;
  delay?: number;
}

export function Revelar({ children, delay = 0 }: RevelarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animar, setAnimar] = useState(false);
  const [revelado, setRevelado] = useState(true);

  useEffect(() => {
    const reduzMovimento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) return;

    setAnimar(true);
    setRevelado(false);

    const no = ref.current;
    if (!no) return;

    const obs = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            const t = window.setTimeout(() => setRevelado(true), delay);
            obs.disconnect();
            return () => window.clearTimeout(t);
          }
        }
        return;
      },
      { threshold: 0.15 },
    );
    obs.observe(no);
    return () => obs.disconnect();
  }, [delay]);

  const classes = animar
    ? `transition-[opacity,transform] duration-[400ms] ease-out ${
        revelado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`
    : "";

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
