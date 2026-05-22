import { Barlow, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";

/**
 * Fontes Soberana 2026 (CLAUDE.md §3, Inventário §2).
 *
 * Cormorant Garamond para títulos editoriais, Barlow para corpo e interface.
 * Auto-hospedadas via next/font/google em build — sem ping para Google em
 * runtime. font-display: swap conforme DAB §12.4.
 */

export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-titulo",
  preload: true,
});

export const barlow = Barlow({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-corpo",
  preload: true,
});

/**
 * Barlow Condensed — variante condensada para navs internas, eyebrows,
 * tags e elementos UI compactos do protótipo (var --font-cond no CSS).
 * Sem ela, o fallback Barlow regular fica mais largo e quebra a nav
 * sticky das páginas de programa.
 */
export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-corpo-cond",
  preload: true,
});
