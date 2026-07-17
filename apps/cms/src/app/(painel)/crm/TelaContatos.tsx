"use client";

import type { ContatoCrmResumo } from "@/lib/cms/painelCrm";

interface TelaContatosProps {
  contatos: ContatoCrmResumo[];
  onEditar: (contato: ContatoCrmResumo) => void;
  onNovo: () => void;
}

export function TelaContatos({ contatos, onEditar, onNovo }: TelaContatosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>Contatos</h1>
          <p>Pessoas de contato nos órgãos e instituições do funil comercial.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo contato
          </button>
        </div>
      </div>

      {contatos.length === 0 ? (
        <p>Nenhum contato cadastrado ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cliente</th>
              <th>Cargo</th>
              <th>E-mail</th>
              <th>WhatsApp</th>
              <th>Principal</th>
              <th>Decisor</th>
            </tr>
          </thead>
          <tbody>
            {contatos.map((c) => (
              <tr
                key={c.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                aria-label={`Editar contato ${c.nome}`}
                onClick={() => onEditar(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEditar(c);
                  }
                }}
              >
                <td>
                  <strong>{c.nome}</strong>
                </td>
                <td>{c.clienteNome}</td>
                <td>{c.cargo ?? "—"}</td>
                <td>{c.email ?? "—"}</td>
                <td>{c.whatsapp ?? "—"}</td>
                <td>
                  {c.principal ? <span className="pcms-selo pcms-selo--info">Principal</span> : "—"}
                </td>
                <td>{c.decisor ? <span className="pcms-selo pcms-selo--info">Decisor</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
