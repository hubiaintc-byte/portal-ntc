"use client";

import { useMemo, useState } from "react";

import { CONTEUDO_CATEGORIA, rotuloCategoria } from "@ntc/lib";

import type { ConteudoCmsResumo, SituacaoConteudo } from "@/lib/cms/painelCms";

const ROTULO_SITUACAO: Record<SituacaoConteudo, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  "em-preparacao": "Em preparação",
};

interface TelaConteudosProps {
  conteudos: ConteudoCmsResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

/** Lista de conteúdos editoriais — busca, filtros e acesso ao detalhe. */
export function TelaConteudos({ conteudos, onAbrir, onNovo }: TelaConteudosProps) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [situacao, setSituacao] = useState<string>("todas");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return conteudos.filter((c) => {
      if (categoria !== "todas" && c.categoria !== categoria) return false;
      if (situacao !== "todas" && c.situacao !== situacao) return false;
      if (termo.length > 0 && !c.titulo.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [conteudos, busca, categoria, situacao]);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Publicação editorial</p>
          <h1>Conteúdos</h1>
          <p>
            {conteudos.length === 0
              ? "Nenhum conteúdo cadastrado ainda."
              : `${conteudos.length} ${conteudos.length === 1 ? "conteúdo" : "conteúdos"} — rascunhos inclusos.`}
          </p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo conteúdo
          </button>
        </div>
      </div>

      <div className="pcms-toolbar">
        <div className="pcms-field">
          <label htmlFor="ct-busca">Buscar por título</label>
          <input
            id="ct-busca"
            type="search"
            value={busca}
            placeholder="Título do conteúdo..."
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="pcms-field">
          <label htmlFor="ct-categoria">Categoria</label>
          <select
            id="ct-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todas">Todas</option>
            {CONTEUDO_CATEGORIA.map((c) => (
              <option key={c} value={c}>
                {rotuloCategoria(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field">
          <label htmlFor="ct-situacao">Situação</label>
          <select id="ct-situacao" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="publicado">Publicado</option>
            <option value="rascunho">Rascunho</option>
            <option value="em-preparacao">Em preparação</option>
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="pcms-vazio">Nenhum conteúdo encontrado com esses filtros.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Categoria</th>
              <th scope="col">Vertical</th>
              <th scope="col">Data</th>
              <th scope="col">Situação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id}>
                <td>
                  <button type="button" className="pcms-link" onClick={() => onAbrir(c.id)}>
                    {c.titulo}
                  </button>
                  {c.destaque && <span className="pcms-selo">Destaque</span>}
                </td>
                <td>{c.categoriaRotulo}</td>
                <td>{c.vertical}</td>
                <td>{c.dataISO ? new Date(c.dataISO).toLocaleDateString("pt-BR") : "—"}</td>
                <td>
                  <span
                    className={
                      c.situacao === "publicado" ? "pcms-selo pcms-selo--ok" : "pcms-selo"
                    }
                  >
                    {ROTULO_SITUACAO[c.situacao]}
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
