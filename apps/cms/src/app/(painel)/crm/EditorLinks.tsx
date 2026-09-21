"use client";

import { useState } from "react";

import { urlValida } from "@ntc/lib";

import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";
import type { DadosLink } from "@/lib/cms/painelCrmEscrita";

import { salvarLinksCrm } from "../acoesCrm";
import { AvisoForm } from "./CamposCrm";

interface EditorLinksProps {
  eventoId: string;
  linksIniciais: DadosLink[];
  ocupado: boolean;
  onExecutar: (acao: () => Promise<ResultadoEscrita>, depois?: () => void, aoFalhar?: () => void) => void;
  onFechar: () => void;
}

/** Links de inscrição do evento (aba Ações). Validação de URL e rótulo é local — não move o card. */
export function EditorLinks({ eventoId, linksIniciais, ocupado, onExecutar, onFechar }: EditorLinksProps) {
  const [links, setLinks] = useState<DadosLink[]>(linksIniciais);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const mudar = (i: number, campo: keyof DadosLink, v: string) =>
    setLinks((ls) => ls.map((l, j) => (j === i ? { ...l, [campo]: v } : l)));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErroLocal(null);
    for (const link of links) {
      if (link.rotulo.trim() === "") {
        setErroLocal("Informe o rótulo do link.");
        return;
      }
      if (!urlValida(link.url)) {
        setErroLocal(`Link inválido: ${link.url}`);
        return;
      }
    }
    onExecutar(() => salvarLinksCrm(eventoId, links), onFechar);
  }

  return (
    <form onSubmit={enviar} className="pcms-acoes__form">
      <AvisoForm erro={erroLocal} />
      {links.length === 0 && <p className="pcms-vazio">Nenhum link. Adicione o link de inscrição do evento.</p>}
      {links.map((l, i) => (
        <div key={i} className="pcms-links__linha">
          <input
            aria-label={`Rótulo do link ${i + 1}`}
            placeholder="Rótulo"
            value={l.rotulo}
            onChange={(e) => mudar(i, "rotulo", e.target.value)}
          />
          <input
            aria-label={`URL do link ${i + 1}`}
            placeholder="https://…"
            value={l.url}
            onChange={(e) => mudar(i, "url", e.target.value)}
          />
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost pcms-btn--mini"
            aria-label={`Remover link ${l.rotulo || i + 1}`}
            onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))}
          >
            Remover
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pcms-btn pcms-btn--ghost pcms-btn--mini"
        onClick={() => setLinks((ls) => [...ls, { rotulo: "", url: "" }])}
      >
        Adicionar link
      </button>
      <div className="pcms-modal__foot">
        <button type="button" className="pcms-btn pcms-btn--ghost pcms-btn--mini" onClick={onFechar} disabled={ocupado}>
          Cancelar
        </button>
        <button type="submit" className="pcms-btn pcms-btn--mini" disabled={ocupado}>
          {ocupado ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
