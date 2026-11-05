"use client";

import type { KeyboardEvent, ReactNode } from "react";

/**
 * Tabela do protótipo FIN-05: `.table-wrap > table.t`, cabeçalho em Barlow
 * Condensed, números à direita (`.r`), rodapé de totais (`tfoot`) e linha
 * clicável (`tr.click`). Para a linha clicável funcionar no teclado, ela
 * ganha `tabIndex` e abre com Enter/Espaço (no protótipo era só clique).
 */

export interface ColunaTabela<T> {
  id: string;
  titulo: ReactNode;
  /** `dir` = `.r` (valores), `centro` = `.c`. */
  alinhar?: "esq" | "dir" | "centro";
  celula: (linha: T) => ReactNode;
  /** Célula do `tfoot` desta coluna (totais). */
  rodape?: ReactNode;
  /** Classe extra da célula (`num`, `actions`, `idc`…). */
  className?: string;
}

interface TabelaProps<T> {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  chave: (linha: T) => string;
  /** Nome da tabela para leitor de tela (`<caption>` oculto). */
  rotulo: string;
  aoClicarLinha?: (linha: T) => void;
  /** Classe extra da linha (`group-row`, `child-row`…). */
  classeLinha?: (linha: T) => string | undefined;
  /** Mostrado no lugar do corpo quando não há linhas (`.empty`). */
  vazio?: ReactNode;
  /** Classes extras do `<table>` (ex.: `demo`). */
  className?: string;
}

function alinhamento(a: ColunaTabela<unknown>["alinhar"]): string {
  return a === "dir" ? "r" : a === "centro" ? "c" : "";
}

export function Tabela<T>({
  colunas,
  linhas,
  chave,
  rotulo,
  aoClicarLinha,
  classeLinha,
  vazio,
  className,
}: TabelaProps<T>) {
  if (linhas.length === 0 && vazio !== undefined) return <>{vazio}</>;
  const temRodape = colunas.some((c) => c.rodape !== undefined);

  function teclar(e: KeyboardEvent<HTMLTableRowElement>, linha: T) {
    if (!aoClicarLinha || e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      aoClicarLinha(linha);
    }
  }

  return (
    <div className="table-wrap">
      <table className={`t${className ? ` ${className}` : ""}`}>
        <caption className="sr-only">{rotulo}</caption>
        <thead>
          <tr>
            {colunas.map((c) => (
              <th key={c.id} scope="col" className={alinhamento(c.alinhar) || undefined}>
                {c.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const extra = classeLinha?.(l);
            const classe = [aoClicarLinha ? "click" : "", extra ?? ""].filter(Boolean).join(" ");
            return (
              <tr
                key={chave(l)}
                className={classe || undefined}
                tabIndex={aoClicarLinha ? 0 : undefined}
                onClick={aoClicarLinha ? () => aoClicarLinha(l) : undefined}
                onKeyDown={aoClicarLinha ? (e) => teclar(e, l) : undefined}
              >
                {colunas.map((c) => (
                  <td key={c.id} className={[alinhamento(c.alinhar), c.className ?? ""].filter(Boolean).join(" ") || undefined}>
                    {c.celula(l)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        {temRodape && (
          <tfoot>
            <tr>
              {colunas.map((c) => (
                <td key={c.id} className={alinhamento(c.alinhar) || undefined}>
                  {c.rodape}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
