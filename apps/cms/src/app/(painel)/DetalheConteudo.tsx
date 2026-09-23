"use client";

import { useMemo, useRef, useState, useTransition } from "react";

import { CONTEUDO_CATEGORIA, lexicalParaHtmlEditorial, rotuloCategoria } from "@ntc/lib";

import type {
  ConteudoCmsDetalhe,
  PalestranteCmsResumo,
  SituacaoConteudo,
} from "@/lib/cms/painelCms";
import type { CamposConteudo } from "@/lib/cms/painelCmsEscrita";
import { markdownParaLexical } from "@/lib/markdownLexical";

import { BarraFormatacao, aplicarNoTextarea, atalhoDaTecla } from "./BarraFormatacao";

import {
  despublicarConteudo,
  enviarMidiaConteudo,
  excluirConteudo,
  publicarConteudo,
  salvarConteudo,
} from "./acoes";
import { AvisoForm } from "./crm/CamposCrm";
import { CLASSE_SITUACAO, ROTULO_SITUACAO } from "./selosConteudo";

/** Categorias cujo conteúdo é um arquivo para download (o campo Anexo só aparece nelas). */
const CATEGORIAS_COM_ANEXO = ["material", "estudo"];

/** Mesmo teto que `validarConteudo` aplica no servidor (painelCmsEscrita.ts). */
const LIDE_MAXIMO = 280;

function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

/** Monta o estado editável a partir do detalhe carregado (ou vazio, em "Novo conteúdo"). */
function camposDe(conteudo: ConteudoCmsDetalhe | null): CamposConteudo {
  if (!conteudo) {
    return {
      titulo: "",
      slug: "",
      categoria: "artigo",
      areaId: "",
      lide: "",
      corpoMarkdown: "",
      assinatura: "",
      autorIds: [],
      dataPublicacao: hojeISO(),
      destaque: false,
      anunciarEmPreparacao: false,
      linkExterno: "",
      seoTitulo: "",
      seoDescricao: "",
    };
  }
  return {
    titulo: conteudo.titulo,
    slug: conteudo.slug,
    categoria: conteudo.categoria,
    areaId: conteudo.areaId ?? "",
    lide: conteudo.lide,
    corpoMarkdown: conteudo.corpoMarkdown,
    assinatura: conteudo.assinatura,
    autorIds: [...conteudo.autorIds],
    dataPublicacao: conteudo.dataISO?.slice(0, 10) ?? hojeISO(),
    destaque: conteudo.destaque,
    anunciarEmPreparacao: conteudo.anunciarEmPreparacao,
    linkExterno: conteudo.linkExterno,
    seoTitulo: conteudo.seoTitulo,
    seoDescricao: conteudo.seoDescricao,
  };
}

interface DetalheConteudoProps {
  /** Conteúdo carregado, ou null quando a tela abre em "Novo conteúdo". */
  conteudo: ConteudoCmsDetalhe | null;
  areas: { id: string; nome: string }[];
  palestrantes: PalestranteCmsResumo[];
  onVoltar: () => void;
  /** Avisa o shell para recarregar a lista (a tela continua aberta). */
  onSalvou: () => void;
}

interface CampoArquivoProps {
  conteudoId: string | null;
  campo: "imagemDestaque" | "anexoDownload";
  rotulo: string;
  accept: string;
  /** Resumo do arquivo já vinculado (ex. nome do PDF ou "Sem imagem"). */
  atual: string;
  onEnviado: (detalhe: ConteudoCmsDetalhe) => void;
}

/**
 * Upload de imagem de destaque / anexo do conteúdo.
 *
 * O <CampoUpload> já existente é específico do evento (a coleção e o par de
 * campos são fixos na própria Server Action), então o conteúdo tem o seu.
 * Só habilita depois que o rascunho existe — sem id não há documento para
 * apontar a Media.
 *
 * A imagem de destaque pede o texto alternativo aqui: é o `alt` que a página
 * de leitura publica (§10), e o painel não tem tela de Mídias para corrigi-lo
 * depois. O anexo não pede — é um PDF, nunca renderizado como imagem.
 */
function CampoArquivo({ conteudoId, campo, rotulo, accept, atual, onEnviado }: CampoArquivoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const idInput = `ct-arquivo-${campo}`;
  const idAlt = `ct-alt-${campo}`;
  const pedeAlt = campo === "imagemDestaque";
  // `media.alt` é obrigatório na coleção Media: enviar em branco seria
  // recusado pelo Payload com a mensagem crua de validação, então o envio
  // só libera com a descrição escrita.
  const faltaAlt = pedeAlt && alt.trim().length === 0;

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !conteudoId) return;
    setErro(null);

    const fd = new FormData();
    fd.append("arquivo", arquivo);
    fd.append("alt", alt);

    iniciar(async () => {
      const { resultado, conteudo } = await enviarMidiaConteudo(conteudoId, campo, fd);
      if (resultado.ok && conteudo) onEnviado(conteudo);
      else setErro(resultado.erro ?? "Falha no upload.");
    });
  }

  return (
    <div className="pcms-upload">
      <label className="pcms-det-meta__rot" htmlFor={idInput}>
        {rotulo}
      </label>
      <p className="pcms-upload__atual">{atual}</p>
      {pedeAlt && (
        <div className="pcms-field">
          <label htmlFor={idAlt}>Texto alternativo da imagem</label>
          <input
            id={idAlt}
            type="text"
            value={alt}
            maxLength={180}
            placeholder="Ex.: Plateia do seminário, vista do palco"
            aria-describedby={`${idAlt}-ajuda`}
            onChange={(e) => setAlt(e.target.value)}
            disabled={enviando || conteudoId === null}
          />
          <p id={`${idAlt}-ajuda`} className="pcms-editor__hint">
            Descreve a imagem para quem usa leitor de tela e aparece quando ela não carrega.
            Obrigatório para enviar.
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        id={idInput}
        type="file"
        accept={accept}
        className="pcms-upload__input"
        onChange={aoEscolher}
        disabled={enviando || conteudoId === null || faltaAlt}
      />
      {/*
        O input acima é `display: none` (pcms-upload__input), logo não é
        focável nem exposto a leitor de tela: o controle operável é este
        botão. Dois deles convivem na tela quando a categoria tem anexo, e
        "Escolher arquivo" sozinho não os distingue (§10).
      */}
      <button
        type="button"
        className="pcms-btn pcms-btn--ghost"
        aria-label={`Escolher arquivo — ${rotulo}`}
        onClick={() => inputRef.current?.click()}
        disabled={enviando || conteudoId === null || faltaAlt}
      >
        {enviando ? "Enviando…" : "Escolher arquivo"}
      </button>
      {conteudoId === null && (
        <p className="pcms-editor__hint">Salve o rascunho para habilitar o envio de arquivos.</p>
      )}
      {conteudoId !== null && faltaAlt && (
        <p className="pcms-editor__hint">
          Escreva o texto alternativo para habilitar o envio da imagem.
        </p>
      )}
      {erro && <p className="pcms-upload__erro">{erro}</p>}
    </div>
  );
}

/**
 * Detalhe do conteúdo editorial — formulário completo com o corpo em
 * Markdown leve e pré-visualização ao vivo ao lado, pelo mesmo serializador
 * (`lexicalParaHtmlEditorial`) que o site usa para renderizar o publicado.
 */
export function DetalheConteudo({
  conteudo,
  areas,
  palestrantes,
  onVoltar,
  onSalvou,
}: DetalheConteudoProps) {
  const [id, setId] = useState<string | null>(conteudo?.id ?? null);
  const [campos, setCampos] = useState<CamposConteudo>(() => camposDe(conteudo));
  /** A barra de formatação lê a seleção daqui e devolve o foco. */
  const corpoRef = useRef<HTMLTextAreaElement>(null);
  const [situacao, setSituacao] = useState<SituacaoConteudo>(conteudo?.situacao ?? "rascunho");
  const [imagemNome, setImagemNome] = useState<string | null>(
    conteudo?.imagemDestaqueUrl ? "Imagem vinculada" : null,
  );
  const [anexoNome, setAnexoNome] = useState<string | null>(conteudo?.anexoNome ?? null);
  const [buscaAutor, setBuscaAutor] = useState("");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [processando, iniciar] = useTransition();

  const previewHtml = useMemo(
    () => lexicalParaHtmlEditorial(markdownParaLexical(campos.corpoMarkdown)),
    [campos.corpoMarkdown],
  );

  const autoresFiltrados = useMemo(() => {
    const termo = buscaAutor.trim().toLowerCase();
    if (termo.length === 0) return palestrantes;
    return palestrantes.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [palestrantes, buscaAutor]);

  function mudar<K extends keyof CamposConteudo>(chave: K, valor: CamposConteudo[K]) {
    setCampos((c) => ({ ...c, [chave]: valor }));
  }

  function alternarAutor(idAutor: string) {
    setCampos((c) => ({
      ...c,
      autorIds: c.autorIds.includes(idAutor)
        ? c.autorIds.filter((v) => v !== idAutor)
        : [...c.autorIds, idAutor],
    }));
  }

  /** Situação de um conteúdo não publicado: depende só do "anunciar em preparação". */
  function situacaoDeRascunho(): SituacaoConteudo {
    return campos.anunciarEmPreparacao ? "em-preparacao" : "rascunho";
  }

  function aplicarMidia(detalhe: ConteudoCmsDetalhe) {
    setImagemNome(detalhe.imagemDestaqueUrl ? "Imagem vinculada" : null);
    setAnexoNome(detalhe.anexoNome);
    onSalvou();
  }

  /** Regras que o conteúdo precisa cumprir para ir ao ar (§5.3: nada é inventado no publicado). */
  function faltaParaPublicar(): string | null {
    if (campos.titulo.trim().length === 0) return "Informe o título antes de publicar.";
    if (campos.lide.trim().length === 0) return "Informe a lide antes de publicar.";
    if (campos.corpoMarkdown.trim().length === 0)
      return "Escreva o corpo do texto antes de publicar.";
    if (campos.categoria.trim().length === 0) return "Escolha a categoria antes de publicar.";
    if (campos.autorIds.length === 0 && campos.assinatura.trim().length === 0) {
      return "Informe ao menos um autor ou uma assinatura antes de publicar.";
    }
    return null;
  }

  function salvar() {
    setErro(null);
    setSucesso(null);
    iniciar(async () => {
      const r = await salvarConteudo(id, campos);
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível salvar o conteúdo.");
        return;
      }
      if (r.id) setId(r.id);
      // Salvar grava no rascunho e nunca publica: um conteúdo já publicado
      // continua publicado, com as edições esperando o próximo "Publicar".
      if (situacao !== "publicado") setSituacao(situacaoDeRascunho());
      setSucesso("Rascunho salvo.");
      onSalvou();
    });
  }

  function publicar() {
    const falta = faltaParaPublicar();
    if (falta) {
      setSucesso(null);
      setErro(falta);
      return;
    }
    setErro(null);
    setSucesso(null);
    iniciar(async () => {
      // Salva antes: publicar só vira o _status, então sem isto o que iria ao
      // ar seria a última versão gravada, não o que está na tela.
      const salvo = await salvarConteudo(id, campos);
      if (!salvo.ok) {
        setErro(salvo.erro ?? "Não foi possível salvar o conteúdo.");
        return;
      }
      const idAtual = salvo.id ?? id;
      if (!idAtual) {
        setErro("Não foi possível identificar o conteúdo salvo.");
        return;
      }
      setId(idAtual);
      const r = await publicarConteudo(idAtual);
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível publicar o conteúdo.");
        return;
      }
      setSituacao("publicado");
      setSucesso("Conteúdo publicado.");
      onSalvou();
    });
  }

  function despublicar() {
    if (!id) return;
    setErro(null);
    setSucesso(null);
    iniciar(async () => {
      const r = await despublicarConteudo(id);
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível despublicar o conteúdo.");
        return;
      }
      setSituacao(situacaoDeRascunho());
      setSucesso("Conteúdo despublicado — voltou a rascunho.");
      onSalvou();
    });
  }

  function excluir() {
    if (!id) return;
    setErro(null);
    setSucesso(null);
    iniciar(async () => {
      const r = await excluirConteudo(id);
      if (!r.ok) {
        setErro(r.erro ?? "Não foi possível excluir o conteúdo.");
        setConfirmandoExclusao(false);
        return;
      }
      onSalvou();
      onVoltar();
    });
  }

  const tituloTela = campos.titulo.trim().length > 0 ? campos.titulo.trim() : "Novo conteúdo";
  const mostraAnexo = CATEGORIAS_COM_ANEXO.includes(campos.categoria);

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Conteúdos <span>/ {tituloTela}</span>
      </button>

      <div className="pcms-det-head">
        <div>
          <p className="pcms-pagehead__eyebrow">Publicação editorial</p>
          <h1>{tituloTela}</h1>
        </div>
        <div className="pcms-det-head__acoes">
          <span className={CLASSE_SITUACAO[situacao]}>{ROTULO_SITUACAO[situacao]}</span>
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            onClick={salvar}
            disabled={processando}
          >
            {processando ? "Salvando…" : "Salvar rascunho"}
          </button>
          {situacao === "publicado" ? (
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={despublicar}
              disabled={processando}
            >
              Despublicar
            </button>
          ) : (
            <button type="button" className="pcms-btn" onClick={publicar} disabled={processando}>
              Publicar
            </button>
          )}
          {id !== null &&
            (confirmandoExclusao ? (
              <>
                <button
                  type="button"
                  className="pcms-btn pcms-btn--ghost"
                  onClick={() => setConfirmandoExclusao(false)}
                  disabled={processando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="pcms-btn pcms-btn--perigo"
                  onClick={excluir}
                  disabled={processando}
                >
                  Confirmar exclusão
                </button>
              </>
            ) : (
              <button
                type="button"
                className="pcms-btn pcms-btn--perigo"
                onClick={() => setConfirmandoExclusao(true)}
                disabled={processando}
              >
                Excluir
              </button>
            ))}
        </div>
      </div>

      <AvisoForm erro={erro} />
      {sucesso && (
        <p className="pcms-form-aviso" role="status">
          {sucesso}
        </p>
      )}

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          <section className="pcms-editor">
            <div className="pcms-editor__head">Texto</div>

            <div className="pcms-field">
              <label htmlFor="ct-titulo">Título</label>
              <input
                id="ct-titulo"
                type="text"
                value={campos.titulo}
                onChange={(e) => mudar("titulo", e.target.value)}
              />
            </div>

            <div className="pcms-field">
              {/*
                Contador ao vivo ao lado do rótulo: com `maxLength` sozinho,
                colar um texto mais longo perde o excedente em silêncio. Fica
                fora do <label> para não entrar no nome acessível do campo —
                é descrição (aria-describedby), não nome.
              */}
              <div className="pcms-field__rotulo-linha">
                <label htmlFor="ct-lide">Lide (resumo de abertura)</label>
                <span className="pcms-contador" id="ct-lide-contador">
                  {campos.lide.length}/{LIDE_MAXIMO}
                </span>
              </div>
              <textarea
                id="ct-lide"
                rows={3}
                maxLength={LIDE_MAXIMO}
                value={campos.lide}
                aria-describedby="ct-lide-contador"
                onChange={(e) => mudar("lide", e.target.value)}
              />
            </div>

            <p className="pcms-editor__hint">
              Formatação: <code>## Subtítulo</code> · <code>### Subtítulo menor</code> ·{" "}
              <code>**negrito**</code> · <code>*itálico*</code> · <code>[texto](https://…)</code> ·{" "}
              <code>&gt; citação</code> · <code>- item</code> · <code>1. item</code>. Linha em
              branco separa parágrafos.
            </p>

            <div className="pcms-editor-duplo">
              <div className="pcms-field">
                <label htmlFor="ct-corpo">Corpo do texto</label>
                <BarraFormatacao
                  textareaRef={corpoRef}
                  valor={campos.corpoMarkdown}
                  onMudar={(novo) => mudar("corpoMarkdown", novo)}
                />
                <textarea
                  id="ct-corpo"
                  ref={corpoRef}
                  value={campos.corpoMarkdown}
                  onChange={(e) => mudar("corpoMarkdown", e.target.value)}
                  onKeyDown={(e) => {
                    const acao = atalhoDaTecla(e);
                    if (!acao) return;
                    // Sem isto o navegador aplica o negrito/itálico dele no
                    // textarea, que não formata nada e só rouba o atalho.
                    e.preventDefault();
                    aplicarNoTextarea(corpoRef.current, campos.corpoMarkdown, acao, (novo) =>
                      mudar("corpoMarkdown", novo),
                    );
                  }}
                />
              </div>
              <div className="pcms-field">
                <span className="pcms-det-meta__rot" id="ct-preview-rot">
                  Pré-visualização
                </span>
                {previewHtml.length > 0 ? (
                  <div
                    className="pcms-rich pcms-editor-duplo__preview"
                    role="region"
                    aria-labelledby="ct-preview-rot"
                    tabIndex={0}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <div
                    className="pcms-rich pcms-editor-duplo__preview"
                    role="region"
                    aria-labelledby="ct-preview-rot"
                    tabIndex={0}
                  >
                    <p className="pcms-editor__hint">
                      O texto formatado aparece aqui enquanto você digita.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <aside className="pcms-det-side">
          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Publicação</div>
            <div className="pcms-det-card__body">
              <div className="pcms-field">
                <label htmlFor="ct-det-categoria">Categoria</label>
                <select
                  id="ct-det-categoria"
                  value={campos.categoria}
                  onChange={(e) => mudar("categoria", e.target.value)}
                >
                  {CONTEUDO_CATEGORIA.map((c) => (
                    <option key={c} value={c}>
                      {rotuloCategoria(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pcms-field">
                <label htmlFor="ct-det-area">Vertical</label>
                <select
                  id="ct-det-area"
                  value={campos.areaId}
                  onChange={(e) => mudar("areaId", e.target.value)}
                >
                  <option value="">Transversal</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pcms-field">
                <label htmlFor="ct-det-data">Data de publicação</label>
                <input
                  id="ct-det-data"
                  type="date"
                  value={campos.dataPublicacao}
                  onChange={(e) => mudar("dataPublicacao", e.target.value)}
                />
              </div>

              <div className="pcms-field pcms-field--check">
                <label htmlFor="ct-det-destaque">
                  <input
                    id="ct-det-destaque"
                    type="checkbox"
                    checked={campos.destaque}
                    onChange={(e) => mudar("destaque", e.target.checked)}
                  />
                  Destaque
                </label>
              </div>

              {situacao !== "publicado" && (
                <div className="pcms-field pcms-field--check">
                  <label htmlFor="ct-det-preparacao">
                    <input
                      id="ct-det-preparacao"
                      type="checkbox"
                      checked={campos.anunciarEmPreparacao}
                      onChange={(e) => mudar("anunciarEmPreparacao", e.target.checked)}
                    />
                    Anunciar como &ldquo;em preparação&rdquo;
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Autoria</div>
            <div className="pcms-det-card__body">
              <div className="pcms-seletor">
                <label className="pcms-det-meta__rot" htmlFor="ct-det-busca-autor">
                  Autores ({campos.autorIds.length} selecionados)
                </label>
                <input
                  id="ct-det-busca-autor"
                  type="search"
                  className="pcms-seletor__busca"
                  placeholder="Buscar especialista…"
                  value={buscaAutor}
                  onChange={(e) => setBuscaAutor(e.target.value)}
                />
                <div className="pcms-seletor__lista">
                  {autoresFiltrados.map((p) => (
                    <label key={p.id} className="pcms-seletor__item">
                      <input
                        type="checkbox"
                        checked={campos.autorIds.includes(p.id)}
                        onChange={() => alternarAutor(p.id)}
                      />
                      <span className="pcms-seletor__nome">
                        <strong>{p.nome}</strong>
                        <small>{p.titulacao}</small>
                      </span>
                    </label>
                  ))}
                  {autoresFiltrados.length === 0 && (
                    <p className="pcms-seletor__vazio">Nenhum resultado.</p>
                  )}
                </div>
              </div>

              <div className="pcms-field">
                <label htmlFor="ct-det-assinatura">Assinatura</label>
                <input
                  id="ct-det-assinatura"
                  type="text"
                  value={campos.assinatura}
                  onChange={(e) => mudar("assinatura", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Arquivos</div>
            <div className="pcms-det-card__body">
              <CampoArquivo
                conteudoId={id}
                campo="imagemDestaque"
                rotulo="Imagem de destaque"
                accept="image/*"
                atual={imagemNome ?? "Sem imagem"}
                onEnviado={aplicarMidia}
              />
              {mostraAnexo && (
                <CampoArquivo
                  conteudoId={id}
                  campo="anexoDownload"
                  rotulo="Anexo para download"
                  accept="application/pdf"
                  atual={anexoNome ?? "Sem anexo"}
                  onEnviado={aplicarMidia}
                />
              )}
              <div className="pcms-field">
                <label htmlFor="ct-det-link">Link externo</label>
                <input
                  id="ct-det-link"
                  type="url"
                  value={campos.linkExterno}
                  onChange={(e) => mudar("linkExterno", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Endereço e SEO</div>
            <div className="pcms-det-card__body">
              <div className="pcms-field">
                <label htmlFor="ct-det-slug">Slug</label>
                <input
                  id="ct-det-slug"
                  type="text"
                  value={campos.slug}
                  aria-describedby="ct-det-slug-ajuda"
                  onChange={(e) => mudar("slug", e.target.value)}
                />
                <p className="pcms-editor__hint" id="ct-det-slug-ajuda">
                  Deixe em branco para gerar a partir do título.
                </p>
              </div>

              <div className="pcms-field">
                <label htmlFor="ct-det-seo-titulo">SEO — título</label>
                <input
                  id="ct-det-seo-titulo"
                  type="text"
                  value={campos.seoTitulo}
                  onChange={(e) => mudar("seoTitulo", e.target.value)}
                />
              </div>

              <div className="pcms-field">
                <label htmlFor="ct-det-seo-descricao">SEO — descrição</label>
                <textarea
                  id="ct-det-seo-descricao"
                  rows={3}
                  value={campos.seoDescricao}
                  onChange={(e) => mudar("seoDescricao", e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
