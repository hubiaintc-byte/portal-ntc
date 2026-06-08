import React from "react";

import { barlow, cormorant } from "@/app/fonts";

/**
 * Provider que injeta as fontes auto-hospedadas Soberana 2026 no admin.
 *
 * O RootLayout do Payload monta o <html> internamente e não aceita
 * className, então não há como aplicar a classe do next/font no <html>
 * (era por isso que custom.scss usava @import do Google — ping externo
 * que contraria CLAUDE.md §3/§11). Aqui envolvemos o admin com um wrapper
 * `display: contents`: ele carrega as classes .variable do next/font
 * (--font-titulo, --font-corpo) sem interferir no layout flex do painel,
 * e as variáveis herdam para todo o conteúdo abaixo.
 *
 * Registrado em payload.config.ts → admin.components.providers.
 */
export const FonteProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className={`${cormorant.variable} ${barlow.variable}`} style={{ display: "contents" }}>
      {children}
    </div>
  );
};

export default FonteProvider;
