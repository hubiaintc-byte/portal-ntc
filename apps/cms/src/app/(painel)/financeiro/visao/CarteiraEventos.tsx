"use client";

import type { IrParaFin } from "../ShellFinanceiro";
import { Icone } from "../ui/Icone";
import { CLASSE_VERTICAL, SeloStatus } from "../ui/Selo";
import { intervaloDatas, tipoCurto } from "../ui/formato";
import type { VisaoExecutiva } from "./dadosVisao";

interface CarteiraEventosProps {
  v: VisaoExecutiva;
  /** A pessoa tem a tela Eventos: as células e os eventos viram botões. */
  temEventos: boolean;
  irPara: IrParaFin;
  /** Clique numa célula de status: Eventos filtrado por ele (e pelos filtros da tela). */
  abrirEventosPorStatus: (status: string) => void;
}

/** Seção "Carteira de eventos": faixa por status operacional e Eventos recentes. */
export function CarteiraEventos({
  v,
  temEventos,
  irPara,
  abrirEventosPorStatus,
}: CarteiraEventosProps) {
  return (
    <>
      <div className="section-title">
        <h2>Carteira de eventos</h2>
        <span className="st-line" />
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="status-row">
          {v.porStatus.map(({ status, n, fracao }) => {
            const conteudo = (
              <>
                <div className="sc-n num">{n}</div>
                <div className="sc-l">
                  <SeloStatus status={status} tipo="operacional" />
                </div>
                <div className="sc-bar">
                  <i style={{ width: `${fracao * 100}%` }} />
                </div>
              </>
            );
            return temEventos ? (
              <button
                key={status}
                type="button"
                className="status-cell"
                aria-label={`${n} eventos ${status}`}
                onClick={() => abrirEventosPorStatus(status)}
              >
                {conteudo}
              </button>
            ) : (
              <div key={status} className="status-cell sem-link">
                {conteudo}
              </div>
            );
          })}
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div>
            <h3>Eventos recentes</h3>
            <div className="ch-sub">Ordenados pela data mais próxima de hoje</div>
          </div>
          {temEventos && (
            <div className="ch-right">
              <button type="button" className="linkbtn" onClick={() => irPara("eventos")}>
                Ver todos <Icone nome="arrowR" tamanho="xs" />
              </button>
            </div>
          )}
        </div>
        <div className="rlist" style={{ marginTop: 12 }}>
          {v.recentes.map((e) => {
            const conteudo = (
              <>
                <span className="rbar" />
                <div style={{ minWidth: 0 }}>
                  <div className="rname">{e.nome}</div>
                  <div className="rmeta">
                    {e.id} · {e.vertical} · {tipoCurto(e.tipo)} · {e.modalidade} ·{" "}
                    {intervaloDatas(e.dataInicio, e.dataFim)}
                  </div>
                </div>
                <div>
                  <SeloStatus status={e.status} tipo="operacional" />
                </div>
              </>
            );
            const classe = `ritem ${CLASSE_VERTICAL[e.vertical] ?? ""}`;
            return temEventos ? (
              <button
                key={e.id}
                type="button"
                className={classe}
                onClick={() => irPara("eventos", { eventoId: e.id })}
              >
                {conteudo}
              </button>
            ) : (
              <div key={e.id} className={`${classe} sem-link`}>
                {conteudo}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
