"use client";

import { useState, useTransition } from "react";

import { podeExcluirModulo } from "@ntc/lib";

import type { ModuloCatalogoDetalhe, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";
import type { DadosModulo } from "@/lib/cms/catalogoCrmEscrita";

import { excluirModuloCatalogoCrm, salvarModuloCatalogoCrm } from "../acoesCatalogo";

import { CampoMarkdown } from "./CampoMarkdown";
import { AvisoForm, CampoNumero, CampoSelect, CampoTexto } from "./CamposCrm";

interface DetalheModuloCatalogoProps {
  modulo: ModuloCatalogoDetalhe | null;
  programaIdInicial?: string;
  programas: ProgramaCrmResumo[];
  onVoltar: () => void;
  onSalvo: (id: string) => void;
  onExcluido: () => void;
}

export function DetalheModuloCatalogo({ modulo: m, programaIdInicial, programas, onVoltar, onSalvo, onExcluido }: DetalheModuloCatalogoProps) {
  const novo = m === null;
  const [dados, setDados] = useState<DadosModulo>({
    programaId: m?.programaId ?? programaIdInicial ?? "",
    numero: m?.numero ?? "",
    titulo: m?.titulo ?? "",
    ementa: m?.ementa ?? "",
    cargaHoraria: m?.cargaHoraria ?? "",
    tituloComercial: m?.tituloComercial ?? "",
    valor: m?.valor ?? "",
    replay: m?.replay ?? "",
    certificacao: m?.certificacao ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [enviando, iniciar] = useTransition();
  const podeExcluir = m ? podeExcluirModulo(m.dependentes) : { ok: false as const, motivo: "" };

  const mudar = (campo: keyof DadosModulo) => (v: string) => setDados((d) => ({ ...d, [campo]: v }));

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const { ementa, ...resto } = dados;
      const ementaMudou = novo || ementa !== (m?.ementa ?? "");
      const r = await salvarModuloCatalogoCrm(m?.id ?? null, ementaMudou ? { ...resto, ementa } : resto);
      if (r.ok) {
        if (r.id) onSalvo(r.id);
      } else setErro(r.erro ?? "Erro ao salvar o módulo.");
    });
  }

  function confirmarExclusao() {
    if (!m) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirModuloCatalogoCrm(m.id);
      if (r.ok) onExcluido();
      else {
        setErro(r.erro ?? "Erro ao excluir o módulo.");
        setExcluindo(false);
      }
    });
  }

  const sigla = programas.find((p) => p.id === dados.programaId)?.sigla;

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Módulos <span>/ {novo ? "Novo módulo" : `${sigla ?? ""} M${m.numero}`}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional · Módulo</p>
          <h1>{novo ? "Novo módulo" : m.titulo}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" disabled={enviando} onClick={salvar}>
            {enviando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <p className="pcms-aviso" role="note">
        Editar um módulo não altera propostas já criadas.
      </p>
      <AvisoForm erro={erro} />

      <section className="pcms-det-bloco">
        <h2>Módulo</h2>
        <CampoSelect
          rotulo="Programa"
          valor={dados.programaId}
          onMudar={mudar("programaId")}
          opcoes={programas.map((p) => ({ value: p.id, label: `${p.sigla} — ${p.nome}` }))}
          obrigatorio
        />
        <CampoNumero rotulo="Número" valor={dados.numero} onMudar={mudar("numero")} curto />
        <CampoTexto rotulo="Título" valor={dados.titulo} onMudar={mudar("titulo")} obrigatorio />
        <CampoMarkdown rotulo="Ementa" valor={dados.ementa ?? ""} onMudar={mudar("ementa")} avisoPerda={!novo && m.ementaComPerda} />
        <CampoTexto rotulo="Carga horária (ex.: 8h)" valor={dados.cargaHoraria} onMudar={mudar("cargaHoraria")} curto />
      </section>

      <section className="pcms-det-bloco">
        <h2>Dados comerciais</h2>
        <CampoTexto rotulo="Título comercial" valor={dados.tituloComercial} onMudar={mudar("tituloComercial")} />
        <CampoNumero rotulo="Valor de referência (R$)" valor={dados.valor} onMudar={mudar("valor")} curto />
        <CampoTexto rotulo="Replay" valor={dados.replay} onMudar={mudar("replay")} curto />
        <CampoTexto rotulo="Certificação" valor={dados.certificacao} onMudar={mudar("certificacao")} />
      </section>

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Zona de risco</h2>
          {!podeExcluir.ok && <p className="pcms-pagehead__aviso-apagar">{podeExcluir.motivo}</p>}
          {!excluindo ? (
            <button type="button" className="pcms-btn pcms-btn--perigo" disabled={!podeExcluir.ok || enviando} onClick={() => setExcluindo(true)}>
              Excluir módulo
            </button>
          ) : (
            <>
              <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => setExcluindo(false)}>
                Cancelar
              </button>
              <button type="button" className="pcms-btn pcms-btn--perigo" disabled={enviando} onClick={confirmarExclusao}>
                {enviando ? "Excluindo…" : "Confirmar exclusão"}
              </button>
            </>
          )}
        </section>
      )}
    </>
  );
}
