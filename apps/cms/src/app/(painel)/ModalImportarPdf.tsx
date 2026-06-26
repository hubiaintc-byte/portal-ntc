"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { importarEventoPdf } from "./acoes";

interface ModalImportarPdfProps {
  onFechar: () => void;
}

type Estado =
  | { fase: "selecao" }
  | { fase: "enviando" }
  | { fase: "sucesso"; nome: string }
  | { fase: "erro"; mensagem: string };

/**
 * Modal de importação de folder PDF de evento.
 *
 * Sobe o PDF e cria um Evento EM RASCUNHO com o folder vinculado (Server Action
 * importarEventoPdf). A extração dos demais campos (modalidade, datas,
 * programação, palestrantes) é a etapa de "porta do PDF" feita à parte; o
 * rascunho criado aqui é onde esses dados serão preenchidos e revisados antes
 * de publicar.
 */
export function ModalImportarPdf({ onFechar }: ModalImportarPdfProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<Estado>({ fase: "selecao" });
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  // Fechar com Esc.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);
    setEstado({ fase: "selecao" });
  }

  function enviar() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setEstado({ fase: "erro", mensagem: "Selecione um PDF primeiro." });
      return;
    }
    setEstado({ fase: "enviando" });
    const fd = new FormData();
    fd.append("arquivo", file);
    iniciar(async () => {
      const r = await importarEventoPdf(fd);
      if (r.ok) {
        setEstado({ fase: "sucesso", nome: r.nome ?? file.name });
      } else {
        setEstado({ fase: "erro", mensagem: r.erro ?? "Falha na importação." });
      }
    });
  }

  return (
    <div
      className="pcms-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pcms-modal-importar-titulo"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="pcms-modal">
        <div className="pcms-modal__head">
          <div>
            <p className="pcms-pagehead__eyebrow">Agenda institucional</p>
            <h2 id="pcms-modal-importar-titulo">Importar PDF</h2>
          </div>
          <button
            type="button"
            className="pcms-modal__fechar"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="pcms-modal__body">
          {estado.fase === "sucesso" ? (
            <div className="pcms-modal__ok">
              <p>
                <strong>PDF recebido.</strong> Foi criado um rascunho de evento:
              </p>
              <p className="pcms-modal__nome">{estado.nome}</p>
              <p>
                Agora peça ao Claude para portar este folder — ele lê o PDF, detecta a
                modalidade e preenche os campos do rascunho. Depois é só revisar no detalhe
                do evento e publicar.
              </p>
            </div>
          ) : (
            <>
              <p className="pcms-modal__desc">
                Suba o folder do evento (PDF). Ele será anexado a um novo evento em rascunho
                para ter os dados preenchidos a partir do PDF e revisados antes de publicar.
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="pcms-upload__input"
                onChange={aoEscolher}
                disabled={enviando}
                aria-label="Selecionar folder PDF"
              />
              <button
                type="button"
                className="pcms-btn pcms-btn--ghost"
                onClick={() => inputRef.current?.click()}
                disabled={enviando}
              >
                {nomeArquivo ?? "Escolher PDF"}
              </button>

              {estado.fase === "erro" && <p className="pcms-upload__erro">{estado.mensagem}</p>}
            </>
          )}
        </div>

        <div className="pcms-modal__foot">
          {estado.fase === "sucesso" ? (
            <button type="button" className="pcms-btn" onClick={onFechar}>
              Concluir
            </button>
          ) : (
            <>
              <button
                type="button"
                className="pcms-btn pcms-btn--ghost"
                onClick={onFechar}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="pcms-btn"
                onClick={enviar}
                disabled={enviando || !nomeArquivo}
              >
                {enviando ? "Enviando…" : "Importar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
