"use client";

import { useMemo, useState } from "react";

import { filtrarProgramas, rotuloSituacaoPrograma, SITUACOES_PROGRAMA, type SituacaoPrograma } from "@ntc/lib";

import type { AreaOpcao, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";

import { seloDeSituacaoPrograma } from "./seloStatus";

interface TelaProgramasProps {
  programas: ProgramaCrmResumo[];
  areas: AreaOpcao[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

export function TelaProgramas({ programas, areas, onAbrir, onNovo }: TelaProgramasProps) {
  const [busca, setBusca] = useState("");
  const [areaId, setAreaId] = useState("");
  const [situacao, setSituacao] = useState<SituacaoPrograma | "">("");

  const visiveis = useMemo(() => filtrarProgramas(programas, { busca, areaId, situacao }), [programas, busca, areaId, situacao]);
  const filtrando = busca.trim() !== "" || areaId !== "" || situacao !== "";

  function limpar() {
    setBusca("");
    setAreaId("");
    setSituacao("");
  }

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional</p>
          <h1>Programas</h1>
          <p>Programas do catálogo comercial — alimentam o wizard e o documento da proposta. O site não lê daqui.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Novo programa
          </button>
        </div>
      </div>

      <div className="pcms-toolbar pcms-kanban__toolbar">
        <div className="pcms-field pcms-kanban__busca">
          <input type="search" placeholder="Buscar por sigla ou nome" aria-label="Buscar programas" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Área" value={areaId} onChange={(e) => setAreaId(e.target.value)}>
            <option value="">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field pcms-field--curto">
          <select aria-label="Situação" value={situacao} onChange={(e) => setSituacao(e.target.value as SituacaoPrograma | "")}>
            <option value="">Todas as situações</option>
            {SITUACOES_PROGRAMA.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {programas.length === 0 ? (
        <div className="pcms-vazio">Nenhum programa cadastrado.</div>
      ) : visiveis.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum resultado para os filtros.{" "}
          {filtrando && (
            <button type="button" className="pcms-btn pcms-btn--ghost" onClick={limpar}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Sigla</th>
              <th>Nome</th>
              <th>Área</th>
              <th>Situação</th>
              <th>Módulos</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((p) => (
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
                  <strong>{p.sigla}</strong>
                </td>
                <td>{p.nome}</td>
                <td>{p.area ?? "—"}</td>
                <td>
                  <span className={seloDeSituacaoPrograma(p.situacao)}>{rotuloSituacaoPrograma(p.situacao)}</span>
                </td>
                <td>{p.numModulos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
