"use client";

import type { ModuloCrmResumo } from "@/lib/cms/painelCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaModulosProps {
  modulos: ModuloCrmResumo[];
}

export function TelaModulos({ modulos }: TelaModulosProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Módulos</h1>
          <p>Módulos do catálogo com seus dados comerciais de referência.</p>
        </div>
      </div>

      {modulos.length === 0 ? (
        <div className="pcms-vazio">Nenhum módulo cadastrado.</div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Título</th>
              <th>Programa</th>
              <th>Valor ref.</th>
              <th>Replay</th>
              <th>Certificação</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((m) => (
              <tr key={m.id}>
                <td>{m.numero}</td>
                <td><strong>{m.tituloComercial ?? m.titulo}</strong></td>
                <td>{m.programaSigla ?? "—"}</td>
                <td>{m.valor !== null ? formatarMoedaBRL(m.valor) : "—"}</td>
                <td>{m.replay ?? "—"}</td>
                <td>{m.certificacao ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
