"use client";

import { useState } from "react";

import { MODALIDADES_EVENTO } from "@ntc/lib";

import type { CatalogoCrm } from "@/lib/cms/painelCrm";
import type { ResultadoEscrita } from "@/lib/cms/painelCmsEscrita";
import type { DadosEvento } from "@/lib/cms/painelCrmEscrita";

import { agendarEventoCrm } from "../acoesCrm";
import { CampoArea, CampoData, CampoSelect, CampoTexto } from "./CamposCrm";

interface FormEventoProps {
  leadId: string;
  catalogo: CatalogoCrm;
  ocupado: boolean;
  onExecutar: (acao: () => Promise<ResultadoEscrita>, depois?: () => void, aoFalhar?: () => void) => void;
  onFechar: () => void;
}

const VAZIO: DadosEvento = {
  titulo: "",
  dataInicio: "",
  dataFim: "",
  modalidade: "",
  local: "",
  moduloCatalogo: "",
  observacoes: "",
};

/** Agendar evento (aba Ações → "Agendar evento"). Fecha só no sucesso — o erro sobe pelo AvisoForm do ModalLead. */
export function FormEvento({ leadId, catalogo, ocupado, onExecutar, onFechar }: FormEventoProps) {
  const [dados, setDados] = useState<DadosEvento>(VAZIO);
  const m =
    <K extends keyof DadosEvento>(campo: K) =>
    (v: DadosEvento[K]) =>
      setDados((d) => ({ ...d, [campo]: v }));

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    onExecutar(() => agendarEventoCrm(leadId, dados), onFechar);
  }

  return (
    <form onSubmit={enviar} className="pcms-acoes__form">
      <div className="pcms-editor__grid">
        <CampoTexto rotulo="Título" valor={dados.titulo} onMudar={m("titulo")} obrigatorio />
        <CampoData rotulo="Data de início" valor={dados.dataInicio} onMudar={m("dataInicio")} obrigatorio />
        <CampoData rotulo="Data de fim" valor={dados.dataFim} onMudar={m("dataFim")} />
        <CampoSelect rotulo="Modalidade" valor={dados.modalidade} onMudar={m("modalidade")} opcoes={MODALIDADES_EVENTO} />
        <CampoTexto rotulo="Local" valor={dados.local} onMudar={m("local")} />
        <CampoSelect
          rotulo="Módulo"
          valor={dados.moduloCatalogo}
          onMudar={m("moduloCatalogo")}
          opcoes={catalogo.modulos.map((mo) => ({ label: mo.titulo, value: mo.id }))}
        />
      </div>
      <CampoArea rotulo="Observações" valor={dados.observacoes} onMudar={m("observacoes")} />
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
