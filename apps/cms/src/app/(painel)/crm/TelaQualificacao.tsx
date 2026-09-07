"use client";

import { FAIXA_SCORE, RESULTADO_QUALIFICACAO, STATUS_AVALIACAO } from "@ntc/lib";

import type { AvaliacaoResumo } from "@/lib/cms/painelCrm";

import { rotuloDeLista, seloDeFaixa, seloDeResultado } from "./seloStatus";

interface TelaQualificacaoProps {
  avaliacoes: AvaliacaoResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd); "—" para nulo. */
function formatarDataBR(iso: string | null): string {
  if (iso === null) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Avaliações de qualificação — método COM-04 (Manual NTC-COM-CRM-01 §§13-19,
 * docs/17). Uma oportunidade pode ter mais de uma avaliação no tempo; só a
 * marcada vigente conta para o gate do estágio Qualificada.
 */
export function TelaQualificacao({ avaliacoes, onAbrir, onNovo }: TelaQualificacaoProps) {
  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Processo Comercial B2G</p>
          <h1>Qualificação (COM-04)</h1>
          <p>Avaliações de qualificação das oportunidades pelo método COM-04.</p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            Nova avaliação
          </button>
        </div>
      </div>

      {avaliacoes.length === 0 ? (
        <p>Nenhuma avaliação registrada ainda.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Oportunidade</th>
              <th>Status</th>
              <th>Score</th>
              <th>Faixa</th>
              <th>Resultado</th>
              <th>Vigente</th>
              <th>Concluída em</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.map((a) => (
              <tr
                key={a.id}
                className="pcms-linha-click"
                role="button"
                tabIndex={0}
                onClick={() => onAbrir(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAbrir(a.id);
                  }
                }}
              >
                <td>
                  <strong>{a.oportunidadeCodigo || "—"}</strong>
                </td>
                <td>{rotuloDeLista(STATUS_AVALIACAO, a.statusAvaliacao)}</td>
                <td>{a.scoreTotal !== null ? `${a.scoreTotal} / 27` : "—"}</td>
                <td>
                  {a.faixa !== null ? (
                    <span className={seloDeFaixa(a.faixa)}>{rotuloDeLista(FAIXA_SCORE, a.faixa)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {a.resultado !== null ? (
                    <span className={seloDeResultado(a.resultado)}>
                      {rotuloDeLista(RESULTADO_QUALIFICACAO, a.resultado)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{a.vigente ? <span className="pcms-selo pcms-selo--ok">Vigente</span> : "—"}</td>
                <td>{formatarDataBR(a.concluidaEmISO)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
