import { Barlow, Barlow_Condensed, Cormorant_Garamond } from "next/font/google";

/**
 * Fontes Soberana 2026 (CLAUDE.md §3, Inventário §2).
 *
 * Cormorant Garamond para títulos editoriais, Barlow para corpo e interface.
 * Auto-hospedadas via next/font/google em build — sem ping para Google em
 * runtime. font-display: swap conforme DAB §12.4.
 */

export const cormorant = Cormorant_Garamond({
  // Só "latin": cobre todos os diacríticos do pt-BR; "latin-ext" dobrava o
  // número de preloads de fonte (22 arquivos · 404 KB) sem glifo necessário.
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-titulo",
  preload: true,
  // Georgia casa melhor com Cormorant que o `serif` genérico; o next/font
  // gera o fallback com size-adjust/ascent-override calibrado contra esta
  // família, eliminando o reflow do swap nos títulos grandes do hero (CLS).
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-corpo",
  preload: true,
  // Arial é o fallback métrico de referência do next/font para Barlow;
  // mantém o size-adjust calibrado para o corpo de texto não refluir no swap.
  fallback: ["Arial", "system-ui", "sans-serif"],
});

/**
 * Barlow Condensed — variante condensada para navs internas, eyebrows,
 * tags e elementos UI compactos do protótipo (var --font-cond no CSS).
 * Sem ela, o fallback Barlow regular fica mais largo e quebra a nav
 * sticky das páginas de programa.
 */
export const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  display: "swap",
  variable: "--font-corpo-cond",
  preload: true,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});
