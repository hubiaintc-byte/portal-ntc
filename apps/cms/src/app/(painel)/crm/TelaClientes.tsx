"use client";

import { AREAS_CRM, STATUS_CLIENTE_CRM } from "@ntc/lib";

import type { ClienteCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeCliente } from "./seloStatus";

interface TelaClientesProps {
  clientes: ClienteCrmResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaClientes({ clientes, onAbrir, onNovo }: TelaClientesProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Comercial</p>
          <h1>Clientes</h1>
          <p>Órgãos e instituições do funil comercial.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo cliente
          </button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Órgão</th>
              <th>UF</th>
              <th>Área</th>
              <th>Potencial</th>
              <th>Status</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(c.id);
                  }
                }}
              >
                <td>
                  <strong>{c.orgao}</strong>
                  {c.sigla !== null && <> · {c.sigla}</>}
                </td>
                <td>{c.uf ?? "—"}</td>
                <td>{rotuloDeLista(AREAS_CRM, c.area)}</td>
                <td>{c.potencial !== null ? formatarMoedaBRL(c.potencial) : "—"}</td>
                <td>
                  <span className={seloDeCliente(c.status)}>
                    {rotuloDeLista(STATUS_CLIENTE_CRM, c.status)}
                  </span>
                </td>
                <td>{c.responsavelNome ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
