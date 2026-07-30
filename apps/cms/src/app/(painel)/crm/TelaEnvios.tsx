"use client";

import { CANAIS_ENVIO, STATUS_ENVIO } from "@ntc/lib";

import type { EnvioResumo } from "@/lib/cms/painelCrm";

import { rotuloDeLista, seloDeEnvio } from "./seloStatus";

interface TelaEnviosProps {
  envios: EnvioResumo[];
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd); "—" para nulo. */
function formatarDataBR(iso: string | null): string {
  if (iso === null) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Tabela consolidada de envios de propostas — sem "novo": envio nasce no detalhe da proposta. */
export function TelaEnvios({ envios }: TelaEnviosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Envios</h1>
          <p>Registro de envios de propostas aos clientes.</p>
        </div>
      </div>

      {envios.length === 0 ? (
        <p>Nenhum envio registrado ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Data</th>
              <th>Proposta</th>
              <th>Canal</th>
              <th>Destinatário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {envios.map((e) => (
              <tr key={e.id}>
                <td>{formatarDataBR(e.data)}</td>
                <td>{e.propostaCodigo}</td>
                <td>{rotuloDeLista(CANAIS_ENVIO, e.canal)}</td>
                <td>{e.destinatarios || "—"}</td>
                <td>
                  <span className={seloDeEnvio(e.status)}>{rotuloDeLista(STATUS_ENVIO, e.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
