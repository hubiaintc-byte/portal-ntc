import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { BannerCookies } from "@ntc/ui";
import { POLITICA_VERSAO_ATUAL } from "@ntc/lib";

import { barlow, barlowCondensed, cormorant } from "./fonts";
import "./globals.css";
// CSS da Home v3 Premium (portada literal do HTML do protótipo).
// Importado aqui no root layout porque o Next 15 entrega CSS via
// path do componente importador; route groups com parênteses
// `(home)` causam 404 (parens não escapados pelo browser). O escopo
// das regras é seguro pois usam classes específicas (.site-header,
// .hero-slide, .event-card, etc.) que não colidem com /o-grupo,
// /solucoes-estrategicas* ou /design-system/*.
import "./home-prototipo.css";
// CSS da página /o-grupo v3 (portada literal de
// 08_Pagina_O_Grupo_NTC_v3.html). Reaproveita os tokens base de
// home-prototipo.css; este arquivo só carrega classes específicas
// da página (.grupo-hero, .grupo-meta-bar, .sintese-editorial,
// .pilares-grid--dark, .mvv-band-grid, .portfolio-vert-card,
// .trajetoria-visual, .programas-matrix, .metodo-flow,
// .autoridade-mosaic, .credibilidade-mosaic, .eventon-mockup,
// .juridico-block, .grupo-cta-final--image).
import "./o-grupo-prototipo.css";
// CSS das páginas de vertical (/solucoes-estrategicas/[area]).
// Portado literal de 07_Pagina_Vertical_NTC_Educacao_v1.html (linhas
// 1467-2188). Os 3 HTMLs das verticais usam o MESMO CSS — variações
// cromáticas vêm de .vertical-page[data-vertical=educacao|gestao-publica|saude].
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css.
import "./verticais-prototipo.css";
// CSS das páginas individuais de programa (/programas/[slug]).
// Portado literal de 10_Pagina_Programa_LIDERA_v1.html. Os 15 HTMLs
// de programa usam o MESMO CSS — variações cromáticas vêm de
// .program-page[data-programa="LIDERA|EDUTEC|SIGS|..."].
import "./programas-prototipo.css";
// CSS da página de Corpo Docente (/o-grupo/corpo-docente).
// Portado literal dos 2 blocos <style> de
// 25_Pagina_Corpo_Docente_v1.html. Tokens base vêm de
// home-prototipo.css; aqui só vão classes específicas
// (.docentes-*, .arch-*, .expert-*, .efc-*, .eac-*, .ec-*,
// .credibilidade-*, .ci-*, .cta-credenciamento-*, .sticky-cta-mobile,
// .pg-*, .docentes-chip, .docentes-empty, .curadoria-pill).
import "./corpo-docente-prototipo.css";
// CSS das 5 páginas institucionais (/politica-de-privacidade,
// /termos-de-uso, /politica-de-cookies, /lgpd, /mapa-do-site).
// Portado literal de 30_Pagina_Privacidade_v1.html (linhas 51-345).
// Os 5 HTMLs institucionais compartilham o MESMO <style> — diff
// byte-a-byte confirmou. Tokens base e regras de header/footer/btn
// já vêm de home-prototipo.css.
import "./institucional-prototipo.css";
// CSS da página /contato (portada literal de 12_Pagina_Contato_v1.html,
// linhas 141-1078). Classes específicas: .hero-page, .router,
// .router-tab, .form-panel, .form-shell, .form-aside, .form-grid,
// .form-field, .form-bulk, .file-field, .channels, .channel-card,
// .hq-card, .vert-card, .sla-bar, .sla-cell, .faq, .faq-item,
// .lgpd, .lgpd-cell, .cta-final, .cta-final-inner. Tokens base e
// regras de header/footer/btn já vêm de home-prototipo.css.
import "./contato-prototipo.css";
// CSS da página /agenda (portada literal de 09_Pagina_Agenda_v2.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.agenda-hero, .agenda-tabs,
// .agenda-filterbar, .agenda-grid, .event-card, .agenda-destaques,
// .agenda-empty, .agenda-pagination, .agenda-intercta, .agenda-context,
// .agenda-sticky-mobile-cta, .event-deadline-seal).
import "./agenda-prototipo.css";
// CSS da página /solucoes (portada literal de 26_Pagina_Solucoes_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.hero-page, .sol-metrics,
// .sol-manifesto, .sol-pilares, .sol-modalidades, .sol-card, .sol-detail,
// .sol-parallax, .sol-juridico, .sol-vitrine, .sol-processo, .sol-faq,
// .sol-cta-final, .sticky-cta-mobile).
import "./solucoes-prototipo.css";
// CSS da página /conteudos (portada literal de 28_Pagina_Conteudos_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.cont-metrics, .cont-subnav,
// .cont-manifesto, .cont-thesis, .cont-featured, .cont-biblioteca,
// .cont-card, .cont-tipos, .cont-verticais, .cont-newsletter, .cont-faq,
// .cont-cta-final, .sticky-cta-mobile).
import "./conteudos-prototipo.css";
// CSS da página /capacitacao (portada literal de 27_Pagina_Capacitacao_v1.html).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas da página (.cap-metrics, .cap-subnav,
// .cap-manifesto, .cap-pilares, .cap-verticais, .cap-modalidades,
// .cap-vs-solucoes, .cap-formatos, .cap-eixos, .cap-curadoria,
// .cap-eventon, .cap-proximos, .cap-evento-card, .cap-caminhos,
// .cap-faq, .cap-cta-final, .sticky-cta-mobile).
import "./capacitacao-prototipo.css";
// CSS da página /agenda/[slug] (template de evento — portada literal de
// 03_Pagina_Evento_PROSUS_Brasilia_v3.html e futuros AGIP SP, EDUTEC M01, etc).
// Tokens base e regras de header/footer/btn vêm de home-prototipo.css;
// aqui só vão classes específicas (.event-hero, .event-meta-bar, .evt-nav,
// .event-layout, .event-section, .event-sidebar, .sidebar-card, .schedule-day,
// .speaker-detail-card, .event-diff-card, .venue-grid, .replay-cert-card,
// .rules-list, .faq-item, .related-events-section, .event-secondary-card).
import "./evento-prototipo.css";

/**
 * Layout raiz mínimo: `<html>`, `<body>`, fontes auto-hospedadas
 * (next/font) e o `<BannerCookies>` que precisa aparecer em toda
 * rota (LGPD — CLAUDE.md §12).
 *
 * Cabeçalho e rodapé moveram-se para layouts de route group:
 * - `app/(home)/layout.tsx`: header + footer do protótipo (CSS literal).
 * - `app/(site)/layout.tsx`: `<NavegacaoSoberana>` + `<RodapeSoberano>`
 *   do @ntc/ui (rotas institucionais que ainda não foram portadas do
 *   HTML).
 *
 * Skip-link permanece no root para acessibilidade global.
 */

export const metadata: Metadata = {
  title: {
    default: "Portal Grupo NTC",
    template: "%s · Grupo NTC",
  },
  description: "Inteligência institucional. Impacto real.",
  metadataBase: new URL(process.env.PAYLOAD_PUBLIC_FRONT_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "Grupo NTC",
    locale: "pt_BR",
    url: "/",
    title: "Portal Grupo NTC · Inteligência institucional. Impacto real.",
    description:
      "O novo padrão da formação institucional para a Administração Pública brasileira.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1242,
        height: 907,
        alt: "Grupo NTC — Inteligência institucional. Impacto real.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Grupo NTC",
    description:
      "Inteligência institucional. Impacto real. Grupo NTC — formação para a Administração Pública brasileira.",
    images: ["/og-default.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11365E",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Pular para o conteúdo principal
        </a>
        {children}
        <BannerCookies politicaVersao={POLITICA_VERSAO_ATUAL} />
      </body>
    </html>
  );
}
