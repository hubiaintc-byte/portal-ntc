"use client";

import { useEffect, useRef, useState } from "react";

import type { Modulo } from "./conteudoModulos";

/**
 * Dropdown "Adicionar à agenda" do subnav. Espelha o IIFE 7 do protótipo
 * (linhas ~3475-3548 de 04_Pagina_Evento_EDUTEC_M01_Online_v2.html):
 *
 * - Toggle abre/fecha dropdown.
 * - Click fora ou Escape fecha.
 * - 4 links: Google Calendar, Outlook · Office 365, Apple Calendar (.ics), .ics genérico.
 * - URLs geradas dinamicamente com base em agendaIcs.
 *
 * Mesmo padrão de AgendaDropdown do PROSUS, com nomes/textos adaptados.
 */

interface ModuloAgendaDropdownProps {
  dados: Modulo["agendaIcs"];
}

function gerarUrlGoogle(d: Modulo["agendaIcs"]): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: d.titulo,
    dates: `${d.startISO}/${d.endISO}`,
    details: d.descricao,
    location: d.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function gerarUrlOutlook(d: Modulo["agendaIcs"]): string {
  const start = `${d.startISO.slice(0, 4)}-${d.startISO.slice(4, 6)}-${d.startISO.slice(6, 8)}T${d.startISO.slice(9, 11)}:${d.startISO.slice(11, 13)}:${d.startISO.slice(13, 15)}Z`;
  const end = `${d.endISO.slice(0, 4)}-${d.endISO.slice(4, 6)}-${d.endISO.slice(6, 8)}T${d.endISO.slice(9, 11)}:${d.endISO.slice(11, 13)}:${d.endISO.slice(13, 15)}Z`;
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

function gerarIcs(d: Modulo["agendaIcs"]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grupo NTC//Modulos//PT",
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

export function ModuloAgendaDropdown({ dados }: ModuloAgendaDropdownProps) {
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

  return (
    <div className="evt-nav-action-wrap" id="agendaWrap" ref={wrapRef}>
      <button
        type="button"
        className="evt-nav-action act-agenda"
        id="agendaToggle"
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
            rel="noopener"
            data-cms-link="cal-google"
          >
            Google Calendar
          </a>
          <a
            href={urlOutlook}
            target="_blank"
            rel="noopener"
            data-cms-link="cal-outlook"
          >
            Outlook · Office 365
          </a>
          <a
            href={icsUri}
            download={dados.filename}
            data-cms-link="cal-apple"
          >
            Apple Calendar
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
