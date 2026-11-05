"use client";

import type { ReactNode } from "react";

import { Gaveta } from "./Gaveta";

/**
 * `confirmDialog({ title, message, confirmLabel, danger })` do protótipo
 * FIN-05: modal `sm` com eyebrow "Confirmação necessária" (perigo) ou
 * "Confirmação", a mensagem e Cancelar / confirmar (`data-autofocus`).
 */

interface ConfirmacaoProps {
  titulo: string;
  rotuloConfirmar?: string;
  perigo?: boolean;
  /** Enquanto a ação roda: o botão de confirmar fica desabilitado. */
  ocupado?: boolean;
  aoConfirmar: () => void;
  aoFechar: () => void;
  children: ReactNode;
}

export function Confirmacao({
  titulo,
  rotuloConfirmar = "Confirmar",
  perigo = false,
  ocupado = false,
  aoConfirmar,
  aoFechar,
  children,
}: ConfirmacaoProps) {
  return (
    <Gaveta
      forma="modal"
      tamanho="sm"
      eyebrow={perigo ? "Confirmação necessária" : "Confirmação"}
      titulo={titulo}
      aoFechar={aoFechar}
      rodape={
        <>
          <span className="spacer" />
          <button type="button" className="btn btn-secondary" onClick={aoFechar}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${perigo ? "btn-danger" : "btn-primary"}`}
            data-autofocus
            disabled={ocupado}
            onClick={aoConfirmar}
          >
            {rotuloConfirmar}
          </button>
        </>
      }
    >
      <div style={{ fontSize: 14, color: "var(--grafite)", lineHeight: 1.55 }}>{children}</div>
    </Gaveta>
  );
}
