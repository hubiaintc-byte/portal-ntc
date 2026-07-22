"use client";

import type { VersaoResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaVersoesProps {
  versoes: VersaoResumo[];
  onAbrirProposta: (propostaId: string) => void;
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd); "—" para nulo. */
function formatarDataBR(iso: string | null): string {
  if (iso === null) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Lista achatada de todas as versões de todas as propostas (não agrupada por
 * codigoBase — ver task-5-report.md para a justificativa da escolha). Cada
 * linha abre a proposta daquela versão.
 */
export function TelaVersoes({ versoes, onAbrirProposta }: TelaVersoesProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Versões</h1>
          <p>Histórico de versões das propostas.</p>
        </div>
      </div>

      {versoes.length === 0 ? (
        <p>Nenhuma versão registrada ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Cód. base</th>
              <th>Versão</th>
              <th>Data</th>
              <th>Valor líquido</th>
              <th>Status</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {versoes.map((v) => (
              <tr
                key={v.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrirProposta(v.propostaId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrirProposta(v.propostaId);
                  }
                }}
              >
                <td>
                  <strong>{v.codBase}</strong>
                </td>
                <td>v{v.nVersao}</td>
                <td>{formatarDataBR(v.data)}</td>
                <td>{formatarMoedaBRL(v.valorLiquido)}</td>
                <td>{v.status || "—"}</td>
                <td>{v.motivo || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
