"use client";

import { useEffect, useRef } from "react";

/**
 * `<DialogoPolitica>` — diálogo institucional que apresenta resumo da LGPD
 * e link para a política completa (doc 12 §9, CLAUDE.md §12).
 *
 * Usa `<dialog>` nativo via `showModal()` quando disponível (foco preso,
 * ESC fecha, clique no backdrop fecha). Fallback graceful para overlay
 * manual quando `dialog` não é suportado (Safari iOS <15.4).
 */

interface DialogoPoliticaProps {
  aberto: boolean;
  href: string;
  titulo?: string;
  onClose: () => void;
}

export function DialogoPolitica({
  aberto,
  href,
  titulo = "Política de Privacidade",
  onClose,
}: DialogoPoliticaProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (aberto && !el.open) {
      // showModal pode lançar em ambientes sem suporte; protegemos.
      try {
        el.showModal();
      } catch {
        // fallback: tornar dialog visível com [open] CSS.
        el.setAttribute("open", "");
      }
    } else if (!aberto && el.open) {
      el.close();
    }
  }, [aberto]);

  const onCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  const onClickBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onCancel}
      onClick={onClickBackdrop}
      aria-labelledby="dialogo-politica-titulo"
      className="m-auto max-w-lg bg-osso p-8 shadow-2xl backdrop:bg-grafite/40"
    >
      <h3 id="dialogo-politica-titulo" className="text-h3 font-titulo text-oxford">
        {titulo}
      </h3>
      <p className="mt-4 font-corpo text-corpo text-grafite">
        O Instituto NTC do Brasil trata seus dados pessoais com base na Lei Geral de Proteção de
        Dados (LGPD). Ao prosseguir, você consente com o uso dos dados informados exclusivamente
        para responder à sua solicitação institucional.
      </p>
      <p className="mt-4 font-corpo text-corpo text-grafite">
        Você pode solicitar exclusão, acesso ou correção dos seus dados a qualquer tempo via{" "}
        <a href="/lgpd/solicitar-exclusao" className="underline decoration-oxford">
          /lgpd/solicitar-exclusao
        </a>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-oxford px-6 py-3 font-corpo uppercase tracking-[0.12em] text-oxford hover:bg-oxford hover:text-pergaminho"
        >
          Ler política completa
        </a>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="inline-flex items-center justify-center gap-2 bg-oxford px-6 py-3 font-corpo uppercase tracking-[0.12em] text-pergaminho hover:bg-oxford-claro"
        >
          Fechar
        </button>
      </div>
    </dialog>
  );
}
