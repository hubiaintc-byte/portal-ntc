"use client";

import { STATUS_OPORTUNIDADE } from "@ntc/lib";

import type { OportunidadeCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface TelaOportunidadesProps {
  oportunidades: OportunidadeCrmResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaOportunidades({ oportunidades, onAbrir, onNovo }: TelaOportunidadesProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Oportunidades</h1>
          <p>Negociações em andamento no funil comercial.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Nova oportunidade
          </button>
        </div>
      </div>

      {oportunidades.length === 0 ? (
        <p>Nenhuma oportunidade cadastrada ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor</th>
              <th>Prob.</th>
              <th>Status</th>
              <th>Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {oportunidades.map((o) => (
              <tr
                key={o.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(o.id);
                  }
                }}
              >
                <td>
                  <strong>{o.codigo}</strong>
                </td>
                <td>{o.clienteNome}</td>
                <td>{o.programaSigla ?? "—"}</td>
                <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                <td>{o.probabilidade !== null ? `${o.probabilidade}%` : "—"}</td>
                <td>
                  <span className={seloDeOportunidade(o.status)}>
                    {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                  </span>
                </td>
                <td>{o.followupISO?.split("-").reverse().join("/") ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
