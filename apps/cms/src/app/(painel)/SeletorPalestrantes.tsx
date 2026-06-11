"use client";

import { useState, useTransition } from "react";

import type { EventoCmsDetalhe, PalestranteCmsResumo } from "@/lib/cms/painelCms";

import { salvarPalestrantesEvento } from "./acoes";

interface SeletorPalestrantesProps {
  eventoId: string;
  /** Ids já vinculados ao evento. */
  vinculadosIds: string[];
  /** Todos os especialistas disponíveis (os 53). */
  disponiveis: PalestranteCmsResumo[];
  onAtualizado: (evento: EventoCmsDetalhe) => void;
  onFechar: () => void;
}

/** Seletor multi de especialistas para vincular como palestrantes do evento. */
export function SeletorPalestrantes({
  eventoId,
  vinculadosIds,
  disponiveis,
  onAtualizado,
  onFechar,
}: SeletorPalestrantesProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set(vinculadosIds));
  const [busca, setBusca] = useState("");
  const [salvando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function alternar(id: string) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function salvar() {
    setErro(null);
    iniciar(async () => {
      const { resultado, evento } = await salvarPalestrantesEvento(eventoId, [...selecionados]);
      if (resultado.ok && evento) {
        onAtualizado(evento);
        onFechar();
      } else {
        setErro(resultado.erro ?? "Não foi possível salvar.");
      }
    });
  }

  const filtrados = busca.trim()
    ? disponiveis.filter((p) => p.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    : disponiveis;

  return (
    <div className="pcms-seletor">
      <input
        type="search"
        className="pcms-seletor__busca"
        placeholder="Buscar especialista…"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        aria-label="Buscar especialista"
      />
      <div className="pcms-seletor__lista">
        {filtrados.map((p) => (
          <label key={p.id} className="pcms-seletor__item">
            <input
              type="checkbox"
              checked={selecionados.has(p.id)}
              onChange={() => alternar(p.id)}
            />
            <span className="pcms-avatar pcms-avatar--mini" aria-hidden="true">
              {p.iniciais}
            </span>
            <span className="pcms-seletor__nome">
              <strong>{p.nome}</strong>
              <small>{p.titulacao}</small>
            </span>
          </label>
        ))}
        {filtrados.length === 0 && <p className="pcms-seletor__vazio">Nenhum resultado.</p>}
      </div>
      {erro && <p className="pcms-upload__erro">{erro}</p>}
      <div className="pcms-editor__acoes">
        <button type="button" className="pcms-btn" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando…" : `Salvar (${selecionados.size})`}
        </button>
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost"
          onClick={onFechar}
          disabled={salvando}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
