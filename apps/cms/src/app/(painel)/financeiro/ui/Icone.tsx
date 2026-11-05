import type { ReactNode } from "react";

/**
 * Ícones do protótipo FIN-05 (`ICONS`/`icon()`), traço 1.7 e desenho
 * próprios do protótipo, transcritos para JSX. O tamanho vem das classes
 * `svg.i`, `.sm` (15px) e `.xs` (13px) do financeiro.css. Decorativos para
 * leitores de tela (`aria-hidden`): o texto ao lado é que nomeia a ação.
 */
const ICONES = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-5.5h4V20" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="7" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /><rect x="13.5" y="13.5" width="7" height="7" rx="1" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="1.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  chart: <><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-5M12 16V8M16 16v-8" /></>,
  report: <><path d="M6 3.5h9l4 4V20.5H6z" /><path d="M15 3.5V8h4" /><path d="M9 17v-3M12 17v-6M15 17v-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  chevR: <><path d="m9 6 6 6-6 6" /></>,
  chevL: <><path d="m15 6-6 6 6 6" /></>,
  chevD: <><path d="m6 9 6 6 6-6" /></>,
  arrowR: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  arrowL: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  more: <><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>,
  list: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r=".8" /><circle cx="4" cy="12" r=".8" /><circle cx="4" cy="18" r=".8" /></>,
  cards: <><rect x="3.5" y="4" width="7.5" height="7" rx="1" /><rect x="13" y="4" width="7.5" height="7" rx="1" /><rect x="3.5" y="13" width="7.5" height="7" rx="1" /><rect x="13" y="13" width="7.5" height="7" rx="1" /></>,
  filter: <><path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" /></>,
  alert: <><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8v.1" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  play: <><path d="M8 5.5v13l10-6.5z" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  file: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5V8h4" /></>,
  receipt: <><path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" /><path d="M9 8h6M9 12h6" /></>,
  half: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none" /></>,
  dot: <><circle cx="12" cy="12" r="3" fill="currentColor" /></>,
  "circle-dashed": <><circle cx="12" cy="12" r="8.5" strokeDasharray="3 3" /></>,
  wifi: <><path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a4.6 4.6 0 0 1 6.4 0" /><circle cx="12" cy="19.2" r=".9" fill="currentColor" /></>,
  pin: <><path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z" /><circle cx="12" cy="9.8" r="2.3" /></>,
  hybrid: <><rect x="3" y="4.5" width="11" height="8" rx="1" /><path d="M6.5 16h4M8.5 12.5V16" /><path d="M17.5 21s-3.5-3.3-3.5-6a3.5 3.5 0 0 1 7 0c0 2.7-3.5 6-3.5 6z" /></>,
  users: <><circle cx="9" cy="8.5" r="3.3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3.3 3.3 0 0 1 0 6.3M18 14.3c1.8.8 3 2.7 3 5.7" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20.5c0-3.9 3.1-7 7-7s7 3.1 7 7" /></>,
  building: <><path d="M4 20.5h16M6 20.5V5h8v15.5M14 9.5h4v11" /><path d="M9 8.5h2M9 12h2M9 15.5h2" /></>,
  tag: <><path d="M3.5 12.2V4.5h7.7l9.3 9.3-7.7 7.7z" /><circle cx="8" cy="9" r="1.2" /></>,
  layers: <><path d="m12 3.5 9 5-9 5-9-5z" /><path d="m3 13.5 9 5 9-5" /></>,
  wallet: <><path d="M4 7.5h15.5V20H4z" /><path d="M4 7.5 16 4v3.5" /><path d="M15 13.5h4.5" /></>,
  coins: <><ellipse cx="9" cy="7" rx="5.5" ry="2.5" /><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7" /><path d="M9.5 16.4c.9.1 1.8.1 2.5.1 3 0 5.5-1.1 5.5-2.5v-.2" /><path d="M14.5 10.8c1.7.3 3 1.1 3 2" /><path d="M3.5 11v4c0 1.4 2.5 2.5 5.5 2.5" /></>,
  out: <><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></>,
  inn: <><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4.5 19.5h15" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  scale: <><path d="M12 4v16M7 20h10M5 7h14" /><path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z" /></>,
  download: <><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" /><path d="M4.5 19.5h15" /></>,
  refresh: <><path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 9" /><path d="M19.5 4v5h-5" /><path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15" /><path d="M4.5 20v-5h5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  bolt: <><path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" /></>,
  sliders: <><path d="M5 4v16M12 4v16M19 4v16" /><circle cx="5" cy="14" r="2" fill="#fff" /><circle cx="12" cy="8" r="2" fill="#fff" /><circle cx="19" cy="16" r="2" fill="#fff" /></>,
  flow: <><circle cx="5" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><path d="M7 12h10M14 9l3 3-3 3" /></>,
  doc: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M9 12h6M9 15.5h6M9 8.5h2" /></>,
  ticket: <><path d="M3.5 7.5h17v3a1.5 1.5 0 0 0 0 3v3h-17v-3a1.5 1.5 0 0 0 0-3z" /><path d="M14 7.5v9" strokeDasharray="1.6 1.8" /></>,
} satisfies Record<string, ReactNode>;

export type NomeIcone = keyof typeof ICONES;

interface IconeProps {
  nome: NomeIcone;
  tamanho?: "sm" | "xs";
  className?: string;
}

/** `icon(nome, tamanho)` do protótipo. */
export function Icone({ nome, tamanho, className }: IconeProps) {
  const classe = ["i", tamanho, className].filter(Boolean).join(" ");
  return (
    <svg className={classe} viewBox="0 0 24 24" aria-hidden="true">
      {ICONES[nome]}
    </svg>
  );
}
