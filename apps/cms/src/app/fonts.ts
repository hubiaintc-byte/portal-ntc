import { Barlow, Cormorant_Garamond } from "next/font/google";

/**
 * Fontes Soberana 2026 para o admin do Payload (CLAUDE.md §3, §11).
 *
 * Espelho de apps/web/app/fonts.ts: Cormorant Garamond para títulos
 * editoriais, Barlow para corpo e interface. Auto-hospedadas via
 * next/font/google em build — sem ping para fonts.googleapis.com em
 * runtime (substitui o @import que existia em custom.scss).
 *
 * As classes .variable expõem --font-titulo e --font-corpo; são aplicadas
 * ao admin pelo FonteProvider (admin.components.providers), e as variáveis
 * herdam para todo o painel via custom.scss.
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
