"use client";

import type { OportunidadeCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";
import { STATUS_OPORTUNIDADE } from "@ntc/lib";

import { rotuloDeLista, seloDeOportunidade } from "./seloStatus";

interface TelaFollowupsProps {
  followups: OportunidadeCrmResumo[];
  onAbrirOportunidade: (id: string) => void;
}

export function TelaFollowups({ followups, onAbrirOportunidade }: TelaFollowupsProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Follow-ups</h1>
          <p>Todas as oportunidades abertas com follow-up agendado, das mais próximas às futuras.</p>
        </div>
      </div>

      {followups.length === 0 ? (
        <div className="pcms-vazio">Nenhum follow-up agendado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Follow-up</th>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {followups.map((o) => (
              <tr
                key={o.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                aria-label={`Abrir oportunidade ${o.codigo}`}
                onClick={() => onAbrirOportunidade(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrirOportunidade(o.id);
                  }
                }}
              >
                <td>{o.followupISO?.split("-").reverse().join("/") ?? "—"}</td>
                <td>{o.codigo}</td>
                <td>{o.clienteNome}</td>
                <td>{o.programaSigla ?? "—"}</td>
                <td>{o.valor !== null ? formatarMoedaBRL(o.valor) : "—"}</td>
                <td>
                  <span className={seloDeOportunidade(o.status)}>
                    {rotuloDeLista(STATUS_OPORTUNIDADE, o.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
