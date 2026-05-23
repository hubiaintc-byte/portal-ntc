/**
 * Ícones SVG lineares portados literalmente dos blocos
 * `<svg viewBox="0 0 24 24">...</svg>` do
 * 08_Pagina_O_Grupo_NTC_v3.html.
 *
 * Estilo institucional: stroke 1.5–1.6, sem preenchimento, monocromáticos
 * com `color: currentColor` herdado do container (.d-icon, .mfs-icon,
 * .mvv-icon, .efl-icon). Use as constantes ICONE_DIFERENCIAIS,
 * ICONE_METODOLOGIA, ICONE_MVV, ICONE_EVENTON para resolver o ícone
 * a partir do enum salvo no CMS.
 */

import type { ReactNode } from "react";

import type {
  IconeDiferencial,
  IconeMetodologia,
  IconeEventon,
  IconeMvv,
} from "./conteudoOGrupo";

const svgProps = {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
};

export const ICONE_DIFERENCIAIS: Record<IconeDiferencial, ReactNode> = {
  medalha: (
    <svg {...svgProps}>
      <circle cx="12" cy="10" r="6" />
      <path d="M9 15l-2 6 5-3 5 3-2-6" />
      <path d="M12 6v4l3 2" />
    </svg>
  ),
  edificio: (
    <svg {...svgProps}>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-7h6v7" />
      <path d="M9 10h6" />
    </svg>
  ),
  modulos: (
    <svg {...svgProps}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <path d="M10 6.5h4M10 17.5h4M6.5 10v4M17.5 10v4" />
    </svg>
  ),
  regua: (
    <svg {...svgProps}>
      <path d="M3 21L21 3" />
      <path d="M3 21h18V3" />
      <path d="M7 17l-2-2M11 13l-2-2M15 9l-2-2M19 5l-2-2" />
    </svg>
  ),
  lampada: (
    <svg {...svgProps}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.5 1 2.5h6c0-1 .4-1.9 1-2.5A6 6 0 0 0 12 3z" />
      <path d="M9.5 13h5" />
    </svg>
  ),
  mapa: (
    <svg {...svgProps}>
      <path d="M6 4l4-1 5 2 4 1-1 6-3 3 1 4-5 2-4-3-2-5 1-4z" />
      <circle cx="13" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
};

export const ICONE_METODOLOGIA: Record<IconeMetodologia, ReactNode> = {
  lupa: (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l5 5" />
    </svg>
  ),
  grafico: (
    <svg {...svgProps}>
      <path d="M3 12h6l2-7 2 14 2-7h6" />
    </svg>
  ),
  lista: (
    <svg {...svgProps}>
      <path d="M4 6h16M4 12h16M4 18h10" />
      <circle cx="19" cy="18" r="2" />
    </svg>
  ),
  play: (
    <svg {...svgProps}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  ),
  escudo: (
    <svg {...svgProps}>
      <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  documento: (
    <svg {...svgProps}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  ),
};

export const ICONE_MVV: Record<IconeMvv, ReactNode> = {
  missao: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  visao: (
    <svg {...svgProps}>
      <path d="M3 17l5-9 4 4 4-6 5 11" />
      <path d="M3 20h18" />
    </svg>
  ),
  valores: (
    <svg {...svgProps}>
      <path d="M4 8h16" />
      <path d="M4 8l2-3h12l2 3" />
      <path d="M6 8v10" />
      <path d="M12 8v10" />
      <path d="M18 8v10" />
      <path d="M3 19h18" />
    </svg>
  ),
};

export const ICONE_EVENTON: Record<IconeEventon, ReactNode> = {
  escudo: (
    <svg {...svgProps}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  globo: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  camera: (
    <svg {...svgProps}>
      <rect x="3" y="6" width="14" height="12" rx="1" />
      <polygon points="17 10 22 7 22 17 17 14" />
    </svg>
  ),
  telas: (
    <svg {...svgProps}>
      <rect x="3" y="4" width="14" height="10" rx="1" />
      <rect x="9" y="14" width="2" height="4" />
      <path d="M6 20h8" />
      <rect x="18" y="10" width="3" height="8" rx="0.5" />
    </svg>
  ),
  chat: (
    <svg {...svgProps}>
      <path d="M21 11a8 8 0 1 1-3.5-6.6L21 4l-1 4-4 1" />
      <path d="M9 12h6M9 9h6" />
    </svg>
  ),
  certificado: (
    <svg {...svgProps}>
      <path d="M4 4h12l4 4v12H4z" />
      <circle cx="12" cy="13" r="3" />
      <path d="M9 18l3-3 3 3" />
    </svg>
  ),
};
