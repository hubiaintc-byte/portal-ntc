"use client";

import { useEffect, useRef, useState } from "react";

import type { EventoBase } from "./conteudoEventos";

/**
 * Dropdown "Adicionar à agenda" do subnav. Espelha o IIFE 7 do protótipo
 * (linhas ~3015-3095 de 03_Pagina_Evento_PROSUS_Brasilia_v3.html):
 *
 * - Toggle abre/fecha dropdown.
 * - Click fora ou Escape fecha.
 * - 4 links: Google Calendar, Outlook, Apple (.ics download), generic .ics.
 * - URLs geradas dinamicamente com base em agendaIcs.
 */

interface AgendaDropdownProps {
  dados: EventoBase["agendaIcs"];
}

function gerarUrlGoogle(d: EventoBase["agendaIcs"]): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: d.titulo,
    dates: `${d.startISO}/${d.endISO}`,
    details: d.descricao,
    location: d.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarUrlOutlook(d: EventoBase["agendaIcs"]): string {
  // Converte Z para formato ISO completo
  const start = `${d.startISO.slice(0, 4)}-${d.startISO.slice(4, 6)}-${d.startISO.slice(6, 11)}:${d.startISO.slice(11, 13)}:${d.startISO.slice(13, 15)}Z`;
  const end = `${d.endISO.slice(0, 4)}-${d.endISO.slice(4, 6)}-${d.endISO.slice(6, 11)}:${d.endISO.slice(11, 13)}:${d.endISO.slice(13, 15)}Z`;
  const params = new URLSearchParams({
    subject: d.titulo,
    body: d.descricao,
    startdt: start,
    enddt: end,
    location: d.location,
    path: "/calendar/action/compose",
    rru: "addevent",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function gerarIcs(d: EventoBase["agendaIcs"]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo NTC//Eventos//PT",
    "BEGIN:VEVENT",
    `UID:${d.filename}@gruponctc.org.br`,
    `DTSTAMP:${d.startISO}`,
    `DTSTART:${d.startISO}`,
    `DTEND:${d.endISO}`,
    `SUMMARY:${d.titulo}`,
    `DESCRIPTION:${d.descricao.replace(/\n/g, "\\n")}`,
    `LOCATION:${d.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

export function AgendaDropdown({ dados }: AgendaDropdownProps) {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onClickFora = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("click", onClickFora);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onClickFora);
      document.removeEventListener("keydown", onEscape);
    };
  }, [aberto]);

  const urlGoogle = gerarUrlGoogle(dados);
  const urlOutlook = gerarUrlOutlook(dados);
  const icsUri = `data:text/calendar;charset=utf-8,${encodeURIComponent(gerarIcs(dados))}`;

  const id = `agendaWrap-${dados.filename.replace(/\.ics$/, "")}`;
  const toggleId = `agendaToggle-${dados.filename.replace(/\.ics$/, "")}`;

  return (
    <div className="evt-nav-action-wrap" id={id} ref={wrapRef}>
      <button
        type="button"
        className="evt-nav-action"
        id={toggleId}
        aria-haspopup="true"
        aria-expanded={aberto}
        onClick={(e) => {
          e.stopPropagation();
          setAberto((v) => !v);
        }}
      >
        Adicionar à agenda
      </button>
      {aberto && (
        <div className="evt-agenda-dropdown" role="menu">
          <a
            href={urlGoogle}
            target="_blank"
            rel="noopener noreferrer"
            data-cms-link="cal-google"
          >
            Google Calendar
          </a>
          <a
            href={urlOutlook}
            target="_blank"
            rel="noopener noreferrer"
            data-cms-link="cal-outlook"
          >
            Outlook
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-apple"
          >
            Apple Calendar (.ics)
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-ics"
          >
            Baixar arquivo .ics
          </a>
        </div>
      )}
    </div>
  );
}
