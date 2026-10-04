"use client";

import { useState } from "react";

import { CANAIS_ENVIO, STATUS_ENVIO, STATUS_PROPOSTA } from "@ntc/lib";

import type { CatalogoCrm, PropostaDetalhe } from "@/lib/cms/painelCrm";
import type { DadosEnvio } from "@/lib/cms/painelCrmEscrita";
import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import { CampoData, CampoSelect, CampoTexto } from "./CamposCrm";
import { ConteudoProposta } from "./ConteudoProposta";
import { rotuloDeLista, seloDeEnvio, seloDeProposta } from "./seloStatus";

interface DetalheStatusProps {
  proposta: PropostaDetalhe;
  catalogo: CatalogoCrm;
  onVoltar: () => void;
  onEditar: () => void;
  onNovaVersao: (codBase: string, motivo: string) => void;
  onRegistrarEnvio: (dados: DadosEnvio) => void;
  onGerarPdf: (id: string) => void;
  gerandoPdf: boolean;
  /**
   * Relatório da última geração de PDF (spec §1.1): títulos das seções que
   * ficaram fora do documento. `null` enquanto nada foi gerado nesta visita;
   * `[]` depois de uma geração sem omissão nenhuma.
   */
  omitidasNoPdf: string[] | null;
  /** Recarrega a proposta — o bloco de conteúdo pede isso depois de restaurar o padrão. */
  onAtualizado: () => void;
}

/** dd/mm/aaaa a partir de uma data ISO (yyyy-mm-dd); "—" para nulo. */
function formatarDataBR(iso: string | null): string {
  if (iso === null) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

/** Tela cheia de detalhe de uma proposta — leitura, com nova versão e registro de envio inline. */
export function DetalheProposta({
  proposta: p,
  catalogo,
  onVoltar,
  onEditar,
  onNovaVersao,
  onRegistrarEnvio,
  onGerarPdf,
  gerandoPdf,
  omitidasNoPdf,
  onAtualizado,
}: DetalheStatusProps) {
  const [novaVersaoAberta, setNovaVersaoAberta] = useState(false);
  // Seções do bloco de conteúdo com alteração não salva — "Editar" e "Voltar"
  // desmontam o detalhe inteiro, e sem este guarda a prosa digitada e não
  // salva ia embora sem aviso.
  const [secoesSujas, setSecoesSujas] = useState(0);
  const [saidaPendente, setSaidaPendente] = useState<"voltar" | "editar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [envioAberto, setEnvioAberto] = useState(false);
  const [envio, setEnvio] = useState<DadosEnvio>({
    proposta: p.id,
    data: new Date().toISOString().slice(0, 10),
    canal: "",
    destinatarios: "",
    status: "",
    observacoes: "",
  });

  const metricas = [
    { rotulo: "Valor líquido", valor: formatarMoedaBRL(p.valorLiquido) },
    { rotulo: "Versão", valor: `v${p.versao}` },
    { rotulo: "Itens contemplados", valor: String(p.itens.length) },
    { rotulo: "Envios registrados", valor: String(p.envios.length) },
  ];

  function sair(tipo: "voltar" | "editar") {
    setSaidaPendente(null);
    if (tipo === "voltar") onVoltar();
    else onEditar();
  }

  /** Com rascunho pendente, o primeiro clique só pede confirmação (sem window.confirm). */
  function tentarSair(tipo: "voltar" | "editar") {
    if (secoesSujas > 0) setSaidaPendente(tipo);
    else sair(tipo);
  }

  function confirmarNovaVersao() {
    if (motivo.trim() === "") return;
    onNovaVersao(p.codigoBase, motivo.trim());
    setNovaVersaoAberta(false);
    setMotivo("");
  }

  function confirmarEnvio(e: React.FormEvent) {
    e.preventDefault();
    onRegistrarEnvio(envio);
    setEnvioAberto(false);
    setEnvio({ ...envio, canal: "", destinatarios: "", status: "", observacoes: "" });
  }

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={() => tentarSair("voltar")}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Propostas <span>/ {p.codigo}</span>
      </button>

      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Operação Comercial</p>
          <h1>{p.codigo}</h1>
        </div>
        <div className="pcms-pagehead__acoes">
          <span className={seloDeProposta(p.status)}>{rotuloDeLista(STATUS_PROPOSTA, p.status)}</span>
          <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => setNovaVersaoAberta(true)}>
            Nova versão
          </button>
          {p.pdfGeradoUrl && (
            <a href={p.pdfGeradoUrl} target="_blank" rel="noreferrer" className="pcms-btn pcms-btn--ghost">
              Baixar PDF
            </a>
          )}
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            disabled={gerandoPdf}
            onClick={() => onGerarPdf(p.id)}
          >
            {gerandoPdf ? "Gerando…" : "Gerar PDF"}
          </button>
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            onClick={() => tentarSair("editar")}
          >
            Editar
          </button>
        </div>
      </div>

      {/* Relatório de geração: o que ficou FORA do PDF que acabou de ser gerado.
          `role="status"` porque é resultado de uma ação do usuário, não erro. */}
      {omitidasNoPdf !== null && !gerandoPdf && (
        <div
          className="pcms-conteudo__confirmar pcms-conteudo__confirmar--relatorio"
          role="status"
        >
          {omitidasNoPdf.length === 0 ? (
            <p>PDF gerado com todas as seções do documento.</p>
          ) : (
            <>
              <p>
                PDF gerado.{" "}
                {omitidasNoPdf.length === 1
                  ? "1 seção ficou fora do documento, por estar vazia ou por ser uma seção extra sem título:"
                  : `${omitidasNoPdf.length} seções ficaram fora do documento, por estarem vazias ou por serem seções extras sem título:`}
              </p>
              <ul className="pcms-conteudo__omitidas">
                {/* Chave pelo índice: dois títulos podem repetir ("Seção extra
                    sem título"), e a lista é só leitura, sem reordenação. */}
                {omitidasNoPdf.map((titulo, i) => (
                  <li key={`${i}-${titulo}`}>{titulo}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {saidaPendente !== null && (
        <div className="pcms-conteudo__confirmar pcms-conteudo__confirmar--tudo" role="alert">
          <p>
            {secoesSujas === 1
              ? "1 seção do conteúdo do documento tem alteração não salva."
              : `${secoesSujas} seções do conteúdo do documento têm alteração não salva.`}{" "}
            {saidaPendente === "voltar"
              ? "Voltar para a lista agora descarta o que você digitou."
              : "Abrir o formulário agora descarta o que você digitou."}
          </p>
          <div className="pcms-conteudo__acoes">
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost pcms-btn--mini"
              onClick={() => setSaidaPendente(null)}
            >
              Continuar editando
            </button>
            <button
              type="button"
              className="pcms-btn pcms-btn--perigo pcms-btn--mini"
              onClick={() => sair(saidaPendente)}
            >
              {saidaPendente === "voltar" ? "Sair sem salvar" : "Editar sem salvar"}
            </button>
          </div>
        </div>
      )}

      <div className="pcms-metricas">
        {metricas.map((m) => (
          <div key={m.rotulo} className="pcms-metrica">
            <div className="pcms-metrica__valor">{m.valor}</div>
            <div className="pcms-metrica__rotulo">{m.rotulo}</div>
          </div>
        ))}
      </div>

      {novaVersaoAberta && (
        <section className="pcms-det-bloco">
          <h2>Motivo da nova versão</h2>
          <div className="pcms-editor__grid">
            <CampoTexto rotulo="Motivo" valor={motivo} onMudar={setMotivo} />
          </div>
          <div className="pcms-pagehead__acoes">
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={() => {
                setNovaVersaoAberta(false);
                setMotivo("");
              }}
            >
              Cancelar
            </button>
            <button type="button" className="pcms-btn" disabled={motivo.trim() === ""} onClick={confirmarNovaVersao}>
              Confirmar nova versão
            </button>
          </div>
        </section>
      )}

      <section className="pcms-det-bloco">
        <h2>Dados gerais</h2>
        <dl className="pcms-deflist">
          <div className="pcms-deflist__item">
            <dt>Cliente</dt>
            <dd>{p.clienteNome}</dd>
          </div>
          <div className="pcms-deflist__item">
            <dt>Programa</dt>
            <dd>{p.programaSigla || "—"}</dd>
          </div>
          <div className="pcms-deflist__item">
            <dt>Código-base</dt>
            <dd>{p.codigoBase}</dd>
          </div>
          <div className="pcms-deflist__item">
            <dt>Vigente</dt>
            <dd>{p.vigente ? "Sim" : "Não — substituída por versão mais recente"}</dd>
          </div>
          <div className="pcms-deflist__item">
            <dt>Elaborador</dt>
            <dd>{p.elaboradorNome || "—"}</dd>
          </div>
          <div className="pcms-deflist__item">
            <dt>Aprovador</dt>
            <dd>{p.aprovadorNome || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="pcms-det-bloco">
        <h2>Itens contemplados</h2>
        {p.itens.length === 0 ? (
          <p>Nenhum item contemplado.</p>
        ) : (
          <table className="pcms-tabela">
            <thead>
              <tr>
                <th>Item</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {p.itens.map((item, i) => (
                <tr key={`${item.rotulo}-${i}`}>
                  <td>{item.rotulo}</td>
                  <td>{item.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <ConteudoProposta
        propostaId={p.id}
        conteudo={p.conteudo}
        catalogo={catalogo}
        onAtualizado={onAtualizado}
        onSujasMudou={setSecoesSujas}
      />

      <section className="pcms-det-bloco">
        <div className="pcms-editor__head--sub">
          Registro de envios
          <button type="button" className="pcms-link-acao" onClick={() => setEnvioAberto(true)}>
            Registrar envio
          </button>
        </div>

        {envioAberto && (
          <form onSubmit={confirmarEnvio}>
            <div className="pcms-editor__grid">
              <CampoData
                rotulo="Data"
                valor={envio.data}
                onMudar={(v) => setEnvio((d) => ({ ...d, data: v }))}
              />
              <CampoSelect
                rotulo="Canal"
                valor={envio.canal}
                onMudar={(v) => setEnvio((d) => ({ ...d, canal: v }))}
                opcoes={CANAIS_ENVIO}
              />
              <CampoTexto
                rotulo="Destinatário"
                valor={envio.destinatarios}
                onMudar={(v) => setEnvio((d) => ({ ...d, destinatarios: v }))}
              />
              <CampoSelect
                rotulo="Status"
                valor={envio.status}
                onMudar={(v) => setEnvio((d) => ({ ...d, status: v }))}
                opcoes={STATUS_ENVIO}
              />
            </div>
            <div className="pcms-pagehead__acoes">
              <button type="button" className="pcms-btn pcms-btn--ghost" onClick={() => setEnvioAberto(false)}>
                Cancelar
              </button>
              <button type="submit" className="pcms-btn">
                Salvar envio
              </button>
            </div>
          </form>
        )}

        {p.envios.length === 0 ? (
          <p>Nenhum envio registrado.</p>
        ) : (
          <table className="pcms-tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Canal</th>
                <th>Destinatário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {p.envios.map((e) => (
                <tr key={e.id}>
                  <td>{formatarDataBR(e.data)}</td>
                  <td>{rotuloDeLista(CANAIS_ENVIO, e.canal)}</td>
                  <td>{e.destinatarios || "—"}</td>
                  <td>
                    <span className={seloDeEnvio(e.status)}>{rotuloDeLista(STATUS_ENVIO, e.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
