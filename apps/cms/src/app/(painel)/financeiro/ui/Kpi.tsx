import type { ReactNode } from "react";

import type { Centavos } from "@ntc/lib";

import { Dica } from "./Selo";

const NUM = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface ValorGrandeProps {
  /** Centavos inteiros. `null`/não finito ⇒ "—" apagado; zero ⇒ "—". */
  valor: Centavos | null;
}

/**
 * `bigMoney(v)` do protótipo: "R$" menor, inteiros e ",centavos" menores,
 * sinal "−" na frente. Zero e ausência viram "—" (livro vazio não mostra
 * "R$ 0,00" nos cartões, como no protótipo).
 */
export function ValorGrande({ valor }: ValorGrandeProps) {
  if (valor === null || !Number.isFinite(valor)) return <span className="muted">—</span>;
  const x = valor / 100;
  if (Math.abs(x) < 0.005) return <span className="num">—</span>;
  const [inteiros, centavos] = NUM.format(Math.abs(x)).split(",");
  return (
    <span className="num">
      {x < 0 ? "−" : ""}
      <span className="cur">R$</span>
      {inteiros}
      <span className="cents">,{centavos}</span>
    </span>
  );
}

export type DestaqueKpi = "azul" | "verde" | "vermelho" | "grafite";

interface KpiProps {
  rotulo: string;
  /** Centavos; o cartão sempre mostra dinheiro (`bigMoney`). */
  valor: Centavos | null;
  /** Linha de baixo (`k-foot`): texto, barra `.bar`, selos. */
  rodape?: ReactNode;
  /** Filete à esquerda (`accent-*`). */
  destaque?: DestaqueKpi;
  /** Texto do "i" ao lado do rótulo. */
  dica?: string;
  /** Classes extras (ex.: `card` para o cartão solto, como em `.grid.g-4 > .kpi.card`). */
  className?: string;
}

/** `kpi(label, value, foot, accent, tip)` do protótipo. */
export function Kpi({ rotulo, valor, rodape, destaque, dica, className }: KpiProps) {
  const classe = ["kpi", destaque ? `accent-${destaque}` : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={classe}>
      <div className="k-label">
        {rotulo}
        {dica && <Dica texto={dica} />}
      </div>
      <div className="k-value">
        <ValorGrande valor={valor} />
      </div>
      <div className="k-foot">{rodape}</div>
    </div>
  );
}

interface BarraProps {
  /** Fração 0–1 (fora disso é cortada; não finita ⇒ 0). */
  fracao: number;
  cor?: "verde" | "vermelho" | "grafite";
  /** Descrição para leitor de tela (ex.: "62% da receita contratada"). */
  rotulo: string;
}

/** `.bar > i` do protótipo (barras ÷ dos KPIs). Divisão por zero chega aqui como 0. */
export function Barra({ fracao, cor, rotulo }: BarraProps) {
  const f = Number.isFinite(fracao) ? Math.max(0, Math.min(1, fracao)) : 0;
  return (
    <div className={`bar${cor ? ` ${cor}` : ""}`} role="img" aria-label={rotulo}>
      <i style={{ width: `${(f * 100).toFixed(1)}%` }} />
    </div>
  );
}
