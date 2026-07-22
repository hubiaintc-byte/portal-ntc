"use client";

import { STATUS_PROPOSTA } from "@ntc/lib";

import type { PropostaResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { rotuloDeLista, seloDeProposta } from "./seloStatus";

interface TelaPropostasProps {
  propostas: PropostaResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaPropostas({ propostas, onAbrir, onNovo }: TelaPropostasProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Propostas</h1>
          <p>Propostas comerciais vigentes por cliente.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Nova proposta
          </button>
        </div>
      </div>

      {propostas.length === 0 ? (
        <p>Nenhuma proposta cadastrada ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Programa</th>
              <th>Valor líquido</th>
              <th>Status</th>
              <th>Versão</th>
            </tr>
          </thead>
          <tbody>
            {propostas.map((p) => (
              <tr
                key={p.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(p.id);
                  }
                }}
              >
                <td>
                  <strong>{p.codigo}</strong>
                </td>
                <td>{p.clienteNome}</td>
                <td>{p.programaSigla || "—"}</td>
                <td>{formatarMoedaBRL(p.valorLiquido)}</td>
                <td>
                  <span className={seloDeProposta(p.status)}>
                    {rotuloDeLista(STATUS_PROPOSTA, p.status)}
                  </span>
                </td>
                <td>v{p.versao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
