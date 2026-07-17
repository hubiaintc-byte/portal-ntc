"use client";

import type { ProgramaCrmResumo } from "@/lib/cms/painelCrm";

interface TelaProgramasProps {
  programas: ProgramaCrmResumo[];
}

export function TelaProgramas({ programas }: TelaProgramasProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Programas</h1>
          <p>Programas do catálogo institucional (edição no módulo Site).</p>
        </div>
      </div>

      {programas.length === 0 ? (
        <div className="pcms-vazio">Nenhum programa cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome</th>
              <th>Área</th>
            </tr>
          </thead>
          <tbody>
            {programas.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.sigla}</strong></td>
                <td>{p.nome}</td>
                <td>{p.area ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
