"use client";

import { useState, useTransition } from "react";

import { podeExcluirModulo } from "@ntc/lib";

import type { ModuloCatalogoDetalhe, ProgramaCrmResumo } from "@/lib/cms/catalogoCrm";
import type { DadosModulo } from "@/lib/cms/catalogoCrmEscrita";

import { excluirModuloCatalogoCrm, salvarModuloCatalogoCrm } from "./acoesCatalogo";

import { CampoMarkdown } from "./crm/CampoMarkdown";
import { AvisoForm, CampoNumero, CampoSelect, CampoTexto } from "./crm/CamposCrm";
import { EditorListaCatalogo } from "./EditorListaCatalogo";

interface DetalheModuloCatalogoProps {
  modulo: ModuloCatalogoDetalhe | null;
  programaIdInicial?: string;
  programas: ProgramaCrmResumo[];
  onVoltar: () => void;
  /** `aviso`: salvo, mas a revalidação do site falhou — quem abre o detalhe de novo mostra. */
  onSalvo: (id: string, aviso?: string) => void;
  onExcluido: (aviso?: string) => void;
  /**
   * false ⇒ sem a tela Módulos nem Programas (`capacidades.editarModulos`):
   * somem Salvar e a zona de risco; campos desabilitados.
   */
  podeEditar: boolean;
}

export function DetalheModuloCatalogo({
  modulo: m,
  programaIdInicial,
  programas,
  onVoltar,
  onSalvo,
  onExcluido,
  podeEditar,
}: DetalheModuloCatalogoProps) {
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
  const [topicos, setTopicos] = useState<{ texto: string }[]>((m?.topicos ?? []).map((texto) => ({ texto })));
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
      const base = { ...resto, topicos: topicos.map((t) => t.texto) };
      const r = await salvarModuloCatalogoCrm(m?.id ?? null, ementaMudou ? { ...base, ementa } : base);
      if (r.ok) {
        if (r.id) onSalvo(r.id, r.aviso);
      } else setErro(r.erro ?? "Erro ao salvar o módulo.");
    });
  }

  function confirmarExclusao() {
    if (!m) return;
    setErro(null);
    iniciar(async () => {
      const r = await excluirModuloCatalogoCrm(m.id);
      if (r.ok) onExcluido(r.aviso);
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
          <p className="pcms-pagehead__eyebrow">Catálogo · Módulo</p>
          <h1>{novo ? "Novo módulo" : m.titulo}</h1>
        </div>
        {podeEditar && (
          <div className="pcms-pagehead__acoes">
            <button type="button" className="pcms-btn" disabled={enviando} onClick={salvar}>
              {enviando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        )}
      </div>

      <p className="pcms-aviso" role="note">
        Salvar o módulo atualiza a página do programa no site. Propostas já criadas não mudam.
      </p>
      <AvisoForm erro={erro} />

      {/* Sem permissão de escrita, o fieldset desabilita todos os campos de uma vez. */}
      <fieldset className="pcms-somente-leitura" disabled={!podeEditar}>
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
        <CampoMarkdown
          rotulo="Ementa (descrição)"
          valor={dados.ementa ?? ""}
          onMudar={mudar("ementa")}
          avisoPerda={!novo && m.ementaComPerda}
          dica="Os tópicos ficam na lista abaixo; a proposta recebe a descrição e os tópicos juntos."
        />
        <CampoTexto rotulo="Carga horária (ex.: 8h)" valor={dados.cargaHoraria} onMudar={mudar("cargaHoraria")} curto />
      </section>

      <EditorListaCatalogo
        rotulo="Tópicos"
        descricao="Aparecem no detalhamento do módulo, na página do programa."
        rotuloItem="Tópico"
        itens={topicos}
        onMudar={setTopicos}
        novo={() => ({ texto: "" })}
        campos={[{ chave: "texto", rotulo: "Texto" }]}
      />

      <section className="pcms-det-bloco">
        <h2>Dados comerciais</h2>
        <CampoTexto rotulo="Título comercial" valor={dados.tituloComercial} onMudar={mudar("tituloComercial")} />
        <CampoNumero rotulo="Valor de referência (R$)" valor={dados.valor} onMudar={mudar("valor")} curto />
        <CampoTexto rotulo="Replay" valor={dados.replay} onMudar={mudar("replay")} curto />
        <CampoTexto rotulo="Certificação" valor={dados.certificacao} onMudar={mudar("certificacao")} />
      </section>
      </fieldset>

      {podeEditar && !novo && (
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
