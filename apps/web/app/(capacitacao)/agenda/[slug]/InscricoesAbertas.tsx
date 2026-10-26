"use client";

import { useEffect, useState, type ReactNode } from "react";

import { ehCtaDeInscricao } from "@/lib/eventos/encerramentoInscricoes";

/**
 * Esconde os botões de inscrição quando o prazo (`deadline`, 8h do primeiro
 * dia — ver lib/eventos/encerramentoInscricoes.ts) passa. A página é ISR, então
 * a decisão é tomada no navegador: o HTML do servidor sai com os botões e o
 * efeito os remove no mount (prazo vencido) ou no minuto em que vencer.
 */

const UM_MINUTO = 60_000;

export function useInscricoesAbertas(deadline: string): boolean {
  const [abertas, setAbertas] = useState(true);

  useEffect(() => {
    const alvo = new Date(deadline).getTime();
    if (Number.isNaN(alvo)) return;
    const conferir = () => setAbertas(Date.now() < alvo);
    conferir();
    const id = window.setInterval(conferir, UM_MINUTO);
    return () => window.clearInterval(id);
  }, [deadline]);

  return abertas;
}

interface InscricoesAbertasProps {
  deadline: string;
  children: ReactNode;
}

export function InscricoesAbertas({ deadline, children }: InscricoesAbertasProps) {
  return useInscricoesAbertas(deadline) ? <>{children}</> : null;
}

interface CtaComPrazoProps {
  texto: string;
  deadline: string | undefined;
  children: ReactNode;
}

/** Envolve um CTA da página: só some depois do prazo se for de inscrição. */
export function CtaComPrazo({ texto, deadline, children }: CtaComPrazoProps) {
  if (!deadline || !ehCtaDeInscricao(texto)) return <>{children}</>;
  return <InscricoesAbertas deadline={deadline}>{children}</InscricoesAbertas>;
}
