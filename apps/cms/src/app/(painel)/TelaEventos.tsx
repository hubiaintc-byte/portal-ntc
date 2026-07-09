import { useState } from "react";

import type { EventoCmsResumo } from "@/lib/cms/painelCms";

import { ModalImportarPdf } from "./ModalImportarPdf";

const ROTULO_STATUS: Record<EventoCmsResumo["status"], string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
};

interface TelaEventosProps {
  eventos: EventoCmsResumo[];
  onAbrir: (id: string) => void;
  /** Abre o evento recém-importado direto em modo de edição (revisão). */
  onAbrirImportado: (id: string) => void;
}

/** Listagem de eventos — dados reais do banco (somente leitura). */
export function TelaEventos({ eventos, onAbrir, onAbrirImportado }: TelaEventosProps) {
  const [modalImportar, setModalImportar] = useState(false);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Agenda institucional</p>
          <h1>Eventos</h1>
          <p>
            {eventos.length === 0
              ? "Nenhum evento cadastrado ainda."
              : `${eventos.length} ${eventos.length === 1 ? "evento" : "eventos"} no portal — rascunhos inclusos.`}
          </p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            onClick={() => setModalImportar(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 16V4M8 8l4-4 4 4" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            Importar PDF
          </button>
          <button type="button" className="pcms-btn" disabled title="Em breve">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo evento
          </button>
        </div>
      </div>

      {modalImportar && (
        <ModalImportarPdf
          onFechar={() => setModalImportar(false)}
          onImportado={(id) => {
            setModalImportar(false);
            onAbrirImportado(id);
          }}
        />
      )}

      <div className="pcms-toolbar">
        <div className="pcms-filtros">
          <button type="button" className="pcms-chip pcms-chip--ativo">
            Todos
          </button>
          <button type="button" className="pcms-chip">
            Presencial
          </button>
          <button type="button" className="pcms-chip">
            Online
          </button>
          <button type="button" className="pcms-chip">
            Híbrido
          </button>
        </div>
      </div>

      {eventos.length === 0 ? (
        <div className="pcms-vazio">
          Nenhum evento cadastrado ainda.
        </div>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data</th>
              <th>Local</th>
              <th>Modalidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((e) => (
              <tr
                key={e.id}
                className="pcms-linha-click"
                tabIndex={0}
                role="button"
                aria-label={`Abrir evento ${e.titulo}`}
                onClick={() => onAbrir(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onAbrir(e.id);
                  }
                }}
              >
                <td>
                  <div className="pcms-cel-nome">
                    <span>
                      <strong>{e.titulo}</strong>
                      {e.programa && <small>Programa {e.programa}</small>}
                    </span>
                  </div>
                </td>
                <td>{e.data}</td>
                <td>{e.local}</td>
                <td>
                  <span className="pcms-modalidade">{e.modalidade}</span>
                </td>
                <td>
                  <span className={`pcms-selo pcms-selo--${e.status}`}>
                    {ROTULO_STATUS[e.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
