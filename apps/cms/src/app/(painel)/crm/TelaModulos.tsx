"use client";

import { useMemo, useState } from "react";

import { filtrarModulos } from "@ntc/lib";

import type { ModuloCrmResumo, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

interface TelaModulosProps {
  modulos: ModuloCrmResumo[];
  programas: ProgramaCrmResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaModulos({ modulos, programas, onAbrir, onNovo }: TelaModulosProps) {
  const [busca, setBusca] = useState("");
  const [programaId, setProgramaId] = useState("");

  const visiveis = useMemo(() => filtrarModulos(modulos, { busca, programaId }), [modulos, busca, programaId]);
  const filtrando = busca.trim() !== "" || programaId !== "";

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Módulos</h1>
          <p>Módulos do catálogo com seus dados comerciais de referência.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo módulo
          </button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input type="search" placeholder="Buscar por título" aria-label="Buscar módulos" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Programa" value={programaId} onChange={(e) => setProgramaId(e.target.value)}>
            <option value="">Todos os programas</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sigla}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modulos.length === 0 ? (
        <div className="pcms-vazio">Nenhum módulo cadastrado.</div>
      ) : visiveis.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum resultado para os filtros.{" "}
          {filtrando && (
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={() => {
                setBusca("");
                setProgramaId("");
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
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
            {visiveis.map((m) => (
              <tr
                key={m.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(m.id);
                  }
                }}
              >
                <td>{m.numero}</td>
                <td>
                  <strong>{m.tituloComercial ?? m.titulo}</strong>
                </td>
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
