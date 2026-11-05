import type { ReactNode } from "react";

import { barlowCondensed } from "../../fonts";

import "./financeiro.css";

/**
 * Layout de /financeiro: só carrega os estilos do protótipo FIN-05
 * (escopados em `.fin05`) e expõe a Barlow Condensed (`--font-cond`) para o
 * módulo. O wrapper `.fin05-raiz` é `display: contents` — não muda a moldura
 * do painel, só leva a variável da fonte para baixo.
 */
export default function FinanceiroLayout({ children }: { children: ReactNode }) {
  return <div className={`fin05-raiz ${barlowCondensed.variable}`}>{children}</div>;
}
