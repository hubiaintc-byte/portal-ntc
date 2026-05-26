"use client";

import { useEffect, useState } from "react";

/**
 * Countdown da sidebar do módulo. Espelha o IIFE 8 do protótipo
 * (linhas ~3550-3620 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Lê deadline ISO + tipo "numerico" | "textual".
 * - setInterval(60_000) atualiza dias/horas/minutos.
 * - SSR-safe: render inicial com "—" para evitar hydration mismatch.
 * - Renderiza AMBOS counter + text divs sempre no DOM (display:none no
 *   inativo) — fidelidade ao protótipo (lição do PROSUS Brasília).
 * - Se deadline já passou, mostra "Inscrições encerradas" no text div.
 *
 * IDs do HTML: `sbCountdown`, `sbCdCounter`, `sbCdText` (prefixo .sb-).
 */

interface ModuloCountdownSidebarProps {
  label: string;
  dateText: string;
  deadline: string;
  tipo: "numerico" | "textual";
}

interface Tempo {
  d: number;
  h: number;
  m: number;
  expirado: boolean;
}

function calcular(deadline: string): Tempo {
  const alvo = new Date(deadline).getTime();
  const agora = Date.now();
  const diff = alvo - agora;
  if (diff <= 0) return { d: 0, h: 0, m: 0, expirado: true };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { d, h, m, expirado: false };
}

export function ModuloCountdownSidebar({
  label,
  dateText,
  deadline,
  tipo,
}: ModuloCountdownSidebarProps) {
  const [tempo, setTempo] = useState<Tempo | null>(null);

  useEffect(() => {
    setTempo(calcular(deadline));
    const id = window.setInterval(() => {
      setTempo(calcular(deadline));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const d = tempo?.d ?? 0;
  const h = tempo?.h ?? 0;
  const m = tempo?.m ?? 0;
  const expirado = tempo?.expirado ?? false;

  return (
    <div
      className="sb-countdown"
      id="sbCountdown"
      data-deadline={deadline}
      data-tipo={tipo}
    >
      <div className="sb-cd-label">{label}</div>
      <div className="sb-cd-date">{dateText}</div>

      <div
        className="sb-cd-counter"
        id="sbCdCounter"
        style={tipo === "numerico" && !expirado ? undefined : { display: "none" }}
      >
        <div className="item">
          <span className="num" data-cd="d">{tempo ? d : "—"}</span>
          <span className="lbl">dias</span>
        </div>
        <div className="item">
          <span className="num" data-cd="h">{tempo ? h : "—"}</span>
          <span className="lbl">horas</span>
        </div>
        <div className="item">
          <span className="num" data-cd="m">{tempo ? m : "—"}</span>
          <span className="lbl">min</span>
        </div>
      </div>
      <div
        className="sb-cd-text"
        id="sbCdText"
        style={tipo === "textual" || expirado ? undefined : { display: "none" }}
      >
        {expirado ? (
          <strong>Inscrições encerradas</strong>
        ) : (
          <>Faltam <strong>{tempo ? d : "—"}</strong> dias</>
        )}
      </div>
    </div>
  );
}
