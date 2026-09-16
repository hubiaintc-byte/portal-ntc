"use client";

import { useId, useState, useTransition } from "react";

import type { ItemLinhaDoTempoResumo } from "@/lib/cms/painelCrm";

interface LinhaDoTempoProps {
  itens: ItemLinhaDoTempoResumo[];
  /** Quando presente, mostra o campo de nota manual. */
  onNota?: (texto: string) => Promise<string | null>;
}

const FMT = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Lista cronológica (mais recente primeiro) + nota manual. Usada no modal do lead e no detalhe do cliente. */
export function LinhaDoTempo({ itens, onNota }: LinhaDoTempoProps) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciar] = useTransition();
  const idNota = useId();

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!onNota) return;
    setErro(null);
    iniciar(async () => {
      const r = await onNota(texto);
      if (r === null) setTexto("");
      else setErro(r);
    });
  }

  return (
    <div className="pcms-timeline">
      {onNota && (
        <form className="pcms-timeline__nota" onSubmit={enviar}>
          <label htmlFor={idNota}>Nota</label>
          <textarea
            id={idNota}
            rows={2}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Registro manual: ligação, reunião, combinado…"
          />
          {erro && (
            <p className="pcms-form-aviso pcms-form-aviso--erro" role="alert">
              {erro}
            </p>
          )}
          <button type="submit" className="pcms-btn pcms-btn--mini" disabled={salvando || texto.trim() === ""}>
            Adicionar nota
          </button>
        </form>
      )}
      {itens.length === 0 ? (
        <div className="pcms-vazio">Nada registrado ainda.</div>
      ) : (
        <ol className="pcms-timeline__lista">
          {itens.map((i) => (
            <li key={i.id} className={`pcms-timeline__item pcms-timeline__item--${i.tipo}`}>
              <time dateTime={i.emISO}>{FMT.format(new Date(i.emISO))}</time>
              <div>
                <strong>{i.titulo}</strong>
                {i.detalhe && <p>{i.detalhe}</p>}
                <small>{i.usuarioNome ?? "Sistema"}</small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
