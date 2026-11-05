import { formatarReais, type Centavos, type SerieGrafico } from "@ntc/lib";

/**
 * Formatação pura das primitivas do Financeiro (sem React, testável no
 * Vitest em `node`): ticks e resumo dos gráficos e a exibição do campo de
 * dinheiro, transcritos do protótipo FIN-05.
 */

const NUM_INT = new Intl.NumberFormat("pt-BR");
const NUM = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const valorFinito = (v: number): number => (Number.isFinite(v) ? v : 0);

/** `Charts.compact` do protótipo: centavos → "1,2 mi" / "350 mil" / "800". */
export function compacto(centavos: number): string {
  const v = valorFinito(Number(centavos || 0)) / 100;
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
  if (a >= 1e3) return `${(v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return v.toLocaleString("pt-BR");
}

/** `fmtPct(v, 1)` do protótipo; não finito (÷ 0) ⇒ "—". */
export function porcentagem(f: number): string {
  if (!Number.isFinite(f)) return "—";
  return `${(f * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

/** Resumo textual dos números de um gráfico, para o `aria-label` (spec §5). */
export function resumoGrafico(dados: SerieGrafico, dinheiro = true): string {
  const fmt = (v: number) => (dinheiro ? formatarReais(valorFinito(v)) : NUM_INT.format(valorFinito(v)));
  if (dados.labels.length === 0 || dados.series.length === 0) return "sem dados no recorte";
  return dados.labels
    .map((rot, i) => {
      const partes = dados.series.map((s) =>
        dados.series.length === 1 ? fmt(s.valores[i] ?? 0) : `${s.nome} ${fmt(s.valores[i] ?? 0)}`,
      );
      return `${rot}: ${partes.join(", ")}`;
    })
    .join("; ");
}

/** Exibição no campo de dinheiro: centavos → "1.234,56"; zero/vazio → "" (`_num.format` do protótipo). */
export function textoDeCentavos(c: Centavos | null): string {
  return c ? NUM.format(c / 100) : "";
}
