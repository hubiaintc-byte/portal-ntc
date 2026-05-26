"use client";

import { useEffect, useState } from "react";

/**
 * Countdown da sidebar do evento. Espelha o IIFE 8 do protótipo
 * (linhas ~3100-3170 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Lê deadline ISO + tipo "numerico" | "textual".
 * - setInterval(60_000) atualiza dias/horas/minutos.
 * - SSR-safe: render inicial com "—"/"0" para evitar hydration mismatch.
 * - Cleanup limpa interval no unmount.
 *
 * Se deadline já passou, mostra "Inscrições encerradas".
 */

interface CountdownSidebarProps {
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

export function CountdownSidebar({ label, dateText, deadline, tipo }: CountdownSidebarProps) {
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
      className="sidebar-countdown"
      id="sidebarCountdown"
      data-deadline={deadline}
      data-tipo={tipo}
    >
      <div className="sidebar-cd-label">{label}</div>
      <div className="sidebar-cd-date">{dateText}</div>

      {expirado ? (
        <div className="sidebar-cd-text" style={{ display: "block" }}>
          <strong>Inscrições encerradas</strong>
        </div>
      ) : tipo === "numerico" ? (
        <div className="sidebar-cd-counter" id="sidebarCdCounter">
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
      ) : (
        <div className="sidebar-cd-text" id="sidebarCdText">
          Faltam <strong>{tempo ? d : "—"}</strong> dias
        </div>
      )}
    </div>
  );
}
