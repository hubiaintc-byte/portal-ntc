"use client";

import { useState, useTransition } from "react";

import {
  CAMPOS_TEXTO_PROGRAMA,
  podeExcluirPrograma,
  rotuloSituacaoPrograma,
  type CampoTextoPrograma,
  type ItemTituloDescricao,
} from "@ntc/lib";

import type { AreaOpcao, ProgramaCatalogoDetalhe } from "@/lib/cms/catalogoCrm";
import type { DadosPrograma } from "@/lib/cms/catalogoCrmEscrita";

import { excluirProgramaCatalogoCrm, salvarProgramaCatalogoCrm } from "../acoesCatalogo";

import { CampoMarkdown } from "./CampoMarkdown";
import { AvisoForm, CampoSelect, CampoTexto } from "./CamposCrm";
import { EditorListaCatalogo } from "./EditorListaCatalogo";
import { seloDeSituacaoPrograma } from "./seloStatus";

interface DetalheProgramaCatalogoProps {
  programa: ProgramaCatalogoDetalhe | null;
  areas: AreaOpcao[];
  onVoltar: () => void;
  /** Depois de salvar/publicar: o Shell recarrega o detalhe pelo id. */
  onSalvo: (id: string) => void;
  onExcluido: () => void;
  onAbrirModulo: (id: string) => void;
  onNovoModulo: (programaId: string) => void;
}

const TEXTOS_VAZIOS: Record<CampoTextoPrograma, string> = { visaoGeral: "", problema: "", objetivo: "", publicoAlvo: "", metodologia: "" };

export function DetalheProgramaCatalogo({ programa: p, areas, onVoltar, onSalvo, onExcluido, onAbrirModulo, onNovoModulo }: DetalheProgramaCatalogoProps) {
  const novo = p === null;
  const [sigla, setSigla] = useState(p?.sigla ?? "");
  const [nome, setNome] = useState(p?.nomeCompleto ?? "");
  const [temas, setTemas] = useState(p?.temas ?? "");
  const [areaId, setAreaId] = useState(p?.areaId ?? "");
  const [carga, setCarga] = useState(p?.cargaHorariaTotal ?? "");
  const [textos, setTextos] = useState<Record<CampoTextoPrograma, string>>(p?.textos ?? TEXTOS_VAZIOS);
  const [alterados, setAlterados] = useState<Set<CampoTextoPrograma>>(new Set());
  const [eixos, setEixos] = useState<ItemTituloDescricao[]>(p?.eixos ?? []);
  const [diferenciais, setDiferenciais] = useState<ItemTituloDescricao[]>(p?.diferenciais ?? []);
  const [resultados, setResultados] = useState<{ texto: string }[]>((p?.resultados ?? []).map((texto) => ({ texto })));
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [enviando, iniciar] = useTransition();

  const podeExcluir = p ? podeExcluirPrograma(p.dependentes) : { ok: false as const, motivo: "" };

  function mudarTexto(chave: CampoTextoPrograma, v: string) {
    if (v === textos[chave]) return;
    setTextos((t) => ({ ...t, [chave]: v }));
    setAlterados((s) => new Set(s).add(chave));
  }

  function gravar(publicar: boolean) {
    setErro(null);
    const enviar: Partial<Record<CampoTextoPrograma, string>> = {};
    for (const { chave } of CAMPOS_TEXTO_PROGRAMA) if (novo || alterados.has(chave)) enviar[chave] = textos[chave];
    const dados: DadosPrograma = {
      sigla,
      nomeCompleto: nome,
      temas,
      areaId,
      cargaHorariaTotal: carga,
      textos: enviar,
      eixos,
      diferenciais,
      resultados: resultados.map((r) => r.texto),
    };
    iniciar(async () => {
      const r = await salvarProgramaCatalogoCrm(p?.id ?? null, dados, publicar);
      if (r.ok) {
        if (r.id) onSalvo(r.id);
      } else setErro(r.erro ?? "Erro ao salvar o programa.");
    });
  }

  function confirmarExclusao() {
    if (!p) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirProgramaCatalogoCrm(p.id);
      if (r.ok) onExcluido();
      else {
        setErro(r.erro ?? "Erro ao excluir o programa.");
        setExcluindo(false);
      }
    });
  }

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Programas <span>/ {novo ? "Novo programa" : p.sigla}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Catálogo Institucional · Programa</p>
          <h1>{novo ? "Novo programa" : p.nomeCompleto || p.sigla}</h1>
          {!novo && <span className={seloDeSituacaoPrograma(p.situacao)}>{rotuloSituacaoPrograma(p.situacao)}</span>}
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn pcms-btn--ghost" disabled={enviando} onClick={() => gravar(false)}>
            {enviando ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button type="button" className="pcms-btn" disabled={enviando} onClick={() => gravar(true)}>
            Publicar
          </button>
        </div>
      </div>

      {(novo || p.situacao === "rascunho") && (
        <p className="pcms-aviso" role="note">
          Rascunho não aparece no wizard de proposta. Publique para que ele possa ser vendido.
        </p>
      )}
      {!novo && p.situacao === "alteracoes-pendentes" && (
        <p className="pcms-aviso" role="note">
          Há alterações não publicadas. Propostas novas continuam usando a versão publicada até você publicar.
        </p>
      )}
      <p className="pcms-aviso" role="note">
        Editar um programa não altera propostas já criadas — use &ldquo;Restaurar padrão&rdquo; na proposta para trazer o texto novo.
      </p>
      <AvisoForm erro={erro} />

      <section className="pcms-det-bloco">
        <h2>Identificação</h2>
        <CampoTexto rotulo="Sigla" valor={sigla} onMudar={setSigla} obrigatorio curto />
        <CampoTexto rotulo="Nome completo" valor={nome} onMudar={setNome} obrigatorio />
        <CampoTexto rotulo="Linha de temas (capa da proposta; ex.: Cultura Digital · IA · Computação)" valor={temas} onMudar={setTemas} />
        <CampoSelect rotulo="Área" valor={areaId} onMudar={setAreaId} opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))} />
        <CampoTexto rotulo="Carga horária total (ex.: 64 horas)" valor={carga} onMudar={setCarga} curto />
      </section>

      <section className="pcms-det-bloco">
        <h2>Textos</h2>
        {CAMPOS_TEXTO_PROGRAMA.map(({ chave, rotulo }) => (
          <CampoMarkdown
            key={chave}
            rotulo={rotulo}
            valor={textos[chave]}
            onMudar={(v) => mudarTexto(chave, v)}
            avisoPerda={!novo && p.textosComPerda.includes(chave)}
          />
        ))}
      </section>

      <EditorListaCatalogo
        rotulo="Eixos temáticos"
        rotuloItem="Eixo"
        itens={eixos}
        onMudar={setEixos}
        novo={() => ({ titulo: "", descricao: "" })}
        campos={[{ chave: "titulo", rotulo: "Título" }, { chave: "descricao", rotulo: "Descrição", area: true }]}
      />
      <EditorListaCatalogo
        rotulo="Diferenciais"
        rotuloItem="Diferencial"
        itens={diferenciais}
        onMudar={setDiferenciais}
        novo={() => ({ titulo: "", descricao: "" })}
        campos={[{ chave: "titulo", rotulo: "Título" }, { chave: "descricao", rotulo: "Descrição (opcional)", area: true }]}
      />
      <EditorListaCatalogo
        rotulo="Resultados esperados"
        rotuloItem="Resultado"
        itens={resultados}
        onMudar={setResultados}
        novo={() => ({ texto: "" })}
        campos={[{ chave: "texto", rotulo: "Resultado", area: true }]}
      />

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Módulos do programa</h2>
          {p.modulos.length === 0 ? (
            <p>Nenhum módulo.</p>
          ) : (
            <ul>
              {p.modulos.map((m) => (
                <li key={m.id}>
                  <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onAbrirModulo(m.id)}>
                    Módulo {m.numero} — {m.titulo}
                    {m.cargaHoraria ? ` (${m.cargaHoraria})` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => onNovoModulo(p.id)}>
            Novo módulo neste programa
          </button>
        </section>
      )}

      {!novo && (
        <section className="pcms-det-bloco">
          <h2>Zona de risco</h2>
          {!podeExcluir.ok && <p className="pcms-pagehead__aviso-apagar">{podeExcluir.motivo}</p>}
          {!excluindo ? (
            <button type="button" className="pcms-btn pcms-btn--perigo" disabled={!podeExcluir.ok || enviando} onClick={() => setExcluindo(true)}>
              Excluir programa
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
