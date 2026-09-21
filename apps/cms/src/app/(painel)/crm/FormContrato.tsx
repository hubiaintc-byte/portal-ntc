"use client";

import { useId, useRef, useState } from "react";

import { TIPOS_CONTRATO } from "@ntc/lib";

import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";
import type { DadosContrato } from "@/lib/cms/painelCrmEscrita";

import { registrarContratoCrm } from "../acoesCrm";
import { CampoData, CampoNumero, CampoSelect, CampoTexto } from "./CamposCrm";

interface FormContratoProps {
  eventoId: string;
  ocupado: boolean;
  onExecutar: (acao: () => Promise<ResultadoEscrita>, depois?: () => void, aoFalhar?: () => void) => void;
  onFechar: () => void;
}

const VAZIO: DadosContrato = { tipo: "", numero: "", data: "", valor: "" };

/** Registrar contrato/empenho (aba Ações). Arquivo opcional — sem ele, o backend preserva o já registrado. */
export function FormContrato({ eventoId, ocupado, onExecutar, onFechar }: FormContratoProps) {
  const [dados, setDados] = useState<DadosContrato>(VAZIO);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const idArquivo = useId();
  const m =
    <K extends keyof DadosContrato>(campo: K) =>
    (v: DadosContrato[K]) =>
      setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    const arquivo = arquivoRef.current?.files?.[0];
    if (arquivo) fd.append("arquivo", arquivo);
    onExecutar(() => registrarContratoCrm(eventoId, dados, fd), onFechar);
  }

  return (
    <form onSubmit={enviar} className="pcms-acoes__form">
      <div className="pcms-editor__grid">
        <CampoSelect rotulo="Tipo" valor={dados.tipo} onMudar={m("tipo")} opcoes={TIPOS_CONTRATO} />
        <CampoTexto rotulo="Número" valor={dados.numero} onMudar={m("numero")} curto />
        <CampoData rotulo="Data" valor={dados.data} onMudar={m("data")} />
        <CampoNumero rotulo="Valor (R$)" valor={dados.valor} onMudar={m("valor")} curto />
      </div>
      <div className="pcms-field">
        <label htmlFor={idArquivo}>Arquivo (opcional)</label>
        <input id={idArquivo} ref={arquivoRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx" />
      </div>
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
