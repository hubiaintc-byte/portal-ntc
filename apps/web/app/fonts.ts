import { Barlow, Cormorant_Garamond } from "next/font/google";

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
