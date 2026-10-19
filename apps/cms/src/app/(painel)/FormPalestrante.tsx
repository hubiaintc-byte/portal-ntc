"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import type { PalestranteCmsDetalhe } from "@/lib/cms/painelCms";
import type { CamposPalestrante } from "@/lib/cms/painelCmsEscrita";
import { TEXTOS_CARD_VAZIOS, type FormatoCard, type TextosCard } from "@/lib/cms/cardsCorpoDocente";
import {
  ATUACAO_DOCENTE,
  FORMACAO_DOCENTE,
  FRENTE_DOCENTE,
  TIPO_DOCENTE,
  TITULACAO_DOCENTE,
  VERTICAL_DOCENTE,
} from "@/shared/types";

import { BarraFormatacao, aplicarNoTextarea, atalhoDaTecla } from "./BarraFormatacao";
import { salvarPalestrante } from "./acoes";
import { AvisoForm } from "./crm/CamposCrm";

/** Rótulos legíveis dos valores gravados nos selects do especialista. */
const ROTULOS: Record<string, string> = {
  // titulação
  doutorado: "Doutorado",
  "pos-doutorado": "Pós-doutorado",
  mestrado: "Mestrado",
  especializacao: "Especialização",
  graduacao: "Graduação",
  // vertical
  educacao: "Educação",
  "gestao-publica": "Gestão Pública",
  saude: "Saúde",
  // tipo
  autoridade: "Autoridade",
  palestrante: "Palestrante",
  doutrinador: "Doutrinador",
  consultor: "Consultor",
  pesquisador: "Pesquisador",
  // frente
  contratacoes: "Contratações",
  // formação
  "graduacao-experiencia": "Graduação + experiência",
  // atuação
  universidade: "Universidade",
  controle: "Controle",
  judiciario: "Judiciário",
  multilateral: "Multilateral",
  "terceiro-setor": "Terceiro setor",
  consultoria: "Consultoria",
};

/** Rótulo legível de um valor de select; cai no próprio valor se não houver. */
export function rotuloDocente(valor: string): string {
  return ROTULOS[valor] ?? valor;
}

const ROTULO_FORMATO: Record<FormatoCard, string> = {
  featured: "Destaque",
  expert: "Card comum",
};

const AVISO_PERDA = "Salvar este campo remove formatação que o editor não representa";
const DICA_FILTRO = "Usado nos filtros do Corpo Docente — vazio cai em Gestão Pública / Consultor";

type ErrosCampo = Partial<Record<"nome" | "titulacao" | "instituicao" | "curriculoCurto" | "foto", string>>;

interface FormPalestranteProps {
  /** null = novo palestrante. */
  palestrante: PalestranteCmsDetalhe | null;
  opcoes: { areas: { id: string; nome: string }[]; programas: { id: string; sigla: string }[] };
  onCancelar: () => void;
  /**
   * `p` null: gravou, mas a releitura falhou — `aviso` explica e quem chama
   * volta para a lista em vez de mostrar dados velhos.
   */
  onSalvou: (p: PalestranteCmsDetalhe | null, aviso?: string) => void;
}

const CAMPOS_VAZIOS: CamposPalestrante = {
  nome: "",
  titulacao: "",
  instituicao: "",
  cargoAtual: "",
  curriculoCurtoMarkdown: "",
  curriculoCompletoMarkdown: "",
  linkLattes: "",
  linkLinkedin: "",
  vertical: "",
  tipo: "",
  frente: "",
  formacao: "",
  atuacao: [],
  linhasAtuacaoIds: [],
  programasIds: [],
  ocultarDoSite: false,
  corpoDocente: null,
};

/**
 * Formulário único do palestrante: "Novo palestrante" e "Editar".
 * Salvar grava publicado (spec §4.1) — o especialista e o card do Corpo
 * Docente numa transação só, no servidor.
 */
export function FormPalestrante({ palestrante, opcoes, onCancelar, onSalvou }: FormPalestranteProps) {
  const novo = palestrante === null;
  const inicial = palestrante?.editavel ?? CAMPOS_VAZIOS;
  // Markdown de partida dos currículos: só reenvia o que mudou, para não
  // reescrever o Lexical importado a cada salvar (regra do catálogo, v3.4).
  const curtoInicial = useRef(inicial.curriculoCurtoMarkdown ?? "");
  const completoInicial = useRef(inicial.curriculoCompletoMarkdown ?? "");

  const [campos, setCampos] = useState<CamposPalestrante>(() => ({
    ...inicial,
    curriculoCurtoMarkdown: inicial.curriculoCurtoMarkdown ?? "",
    curriculoCompletoMarkdown: inicial.curriculoCompletoMarkdown ?? "",
    atuacao: [...inicial.atuacao],
    linhasAtuacaoIds: [...inicial.linhasAtuacaoIds],
    programasIds: [...inicial.programasIds],
  }));
  const [cardLigado, setCardLigado] = useState(inicial.corpoDocente !== null);
  const [formato, setFormato] = useState<FormatoCard>(inicial.corpoDocente?.formato ?? "expert");
  const [textos, setTextos] = useState<TextosCard>(() => ({
    ...(inicial.corpoDocente?.textos ?? TEXTOS_CARD_VAZIOS),
  }));
  const [confirmandoDesligar, setConfirmandoDesligar] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoAlt, setFotoAlt] = useState("");
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const curtoRef = useRef<HTMLTextAreaElement>(null);
  const completoRef = useRef<HTMLTextAreaElement>(null);

  const [errosCampo, setErrosCampo] = useState<ErrosCampo>({});
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, iniciarSalvar] = useTransition();

  // Libera a URL da pré-visualização ao trocar de arquivo e ao sair da tela.
  useEffect(() => {
    if (!previewFoto) return;
    return () => URL.revokeObjectURL(previewFoto);
  }, [previewFoto]);

  function escolherFoto(arquivo: File | null) {
    setFoto(arquivo);
    setPreviewFoto(arquivo ? URL.createObjectURL(arquivo) : null);
  }

  function mudar<K extends keyof CamposPalestrante>(chave: K, valor: CamposPalestrante[K]) {
    setCampos((c) => ({ ...c, [chave]: valor }));
  }

  function alternarNaLista(chave: "atuacao" | "linhasAtuacaoIds" | "programasIds", valor: string) {
    setCampos((c) => ({
      ...c,
      [chave]: c[chave].includes(valor) ? c[chave].filter((v) => v !== valor) : [...c[chave], valor],
    }));
  }

  function mudarTexto(chave: keyof TextosCard, valor: string) {
    setTextos((t) => ({ ...t, [chave]: valor }));
  }

  /** Desligar um card que já existe no Global pede o segundo clique. */
  function alternarCard() {
    if (!cardLigado) {
      setCardLigado(true);
      return;
    }
    const cardExistia = inicial.corpoDocente !== null;
    if (cardExistia && !confirmandoDesligar) {
      setConfirmandoDesligar(true);
      return;
    }
    setConfirmandoDesligar(false);
    setCardLigado(false);
  }

  const temFotoAtual = palestrante?.temFoto ?? false;

  function validar(): ErrosCampo {
    const e: ErrosCampo = {};
    if (campos.nome.trim() === "") e.nome = "Informe o nome.";
    if (campos.titulacao === "") e.titulacao = "Escolha a titulação.";
    if (campos.instituicao.trim() === "") e.instituicao = "Informe a instituição.";
    if ((campos.curriculoCurtoMarkdown ?? "").trim() === "") e.curriculoCurto = "Informe o currículo curto.";
    if (!foto && !temFotoAtual) e.foto = "Envie a foto do palestrante.";
    return e;
  }

  function salvar() {
    setErro(null);
    const e = validar();
    setErrosCampo(e);
    if (Object.keys(e).length > 0) {
      setErro("Corrija os campos destacados antes de salvar.");
      return;
    }

    const curto = campos.curriculoCurtoMarkdown ?? "";
    const completo = campos.curriculoCompletoMarkdown ?? "";
    const enviar: CamposPalestrante = {
      ...campos,
      // undefined = não mudou: JSON.stringify omite a chave e o servidor não
      // reescreve o campo. No novo, o currículo curto vai sempre.
      curriculoCurtoMarkdown: novo || curto !== curtoInicial.current ? curto : undefined,
      curriculoCompletoMarkdown:
        completo !== completoInicial.current ? completo : undefined,
      corpoDocente: cardLigado ? { formato, textos } : null,
    };

    const fd = new FormData();
    fd.append("id", palestrante?.id ?? "");
    fd.append("campos", JSON.stringify(enviar));
    if (foto) {
      fd.append("foto", foto);
      fd.append("fotoAlt", fotoAlt);
    }

    iniciarSalvar(async () => {
      try {
        const { resultado, palestrante: salvo } = await salvarPalestrante(fd);
        if (resultado.ok) {
          onSalvou(salvo, resultado.aviso);
        } else {
          setErro(resultado.erro ?? "Não foi possível salvar o palestrante.");
        }
      } catch {
        // Server Action rejeitada (rede, timeout): o formulário fica como está.
        setErro("Não foi possível salvar — verifique a conexão e tente de novo.");
      }
    });
  }

  const titulo = campos.nome.trim() || (novo ? "Novo palestrante" : "Palestrante");
  const fotoMostrada = previewFoto ?? palestrante?.fotoUrl ?? null;

  /** Props de acessibilidade de um campo com erro de validação. */
  function a11yErro(chave: keyof ErrosCampo, idErro: string) {
    return errosCampo[chave]
      ? { "aria-invalid": true as const, "aria-describedby": idErro }
      : {};
  }

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onCancelar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Palestrantes <span>/ {titulo}</span>
      </button>

      <div className="pcms-det-head">
        <div>
          <p className="pcms-pagehead__eyebrow">{novo ? "Novo palestrante" : "Editar palestrante"}</p>
          <h1>{titulo}</h1>
        </div>
      </div>

      <AvisoForm erro={erro} />

      <section className="pcms-editor">
        <div className="pcms-editor__head">Identidade</div>

        <div className="pcms-field">
          <label htmlFor="pl-nome">Nome</label>
          <input
            id="pl-nome"
            type="text"
            value={campos.nome}
            onChange={(e) => mudar("nome", e.target.value)}
            {...a11yErro("nome", "pl-nome-erro")}
          />
          {errosCampo.nome && <p id="pl-nome-erro" className="pcms-erro">{errosCampo.nome}</p>}
        </div>

        <div className="pcms-editor__grid">
          <div className="pcms-field">
            <label htmlFor="pl-titulacao">Titulação</label>
            <select
              id="pl-titulacao"
              value={campos.titulacao}
              onChange={(e) => mudar("titulacao", e.target.value)}
              {...a11yErro("titulacao", "pl-titulacao-erro")}
            >
              <option value="">Escolha…</option>
              {TITULACAO_DOCENTE.map((t) => (
                <option key={t} value={t}>
                  {rotuloDocente(t)}
                </option>
              ))}
            </select>
            {errosCampo.titulacao && (
              <p id="pl-titulacao-erro" className="pcms-erro">{errosCampo.titulacao}</p>
            )}
          </div>
          <div className="pcms-field">
            <label htmlFor="pl-instituicao">Instituição</label>
            <input
              id="pl-instituicao"
              type="text"
              value={campos.instituicao}
              onChange={(e) => mudar("instituicao", e.target.value)}
              {...a11yErro("instituicao", "pl-instituicao-erro")}
            />
            {errosCampo.instituicao && (
              <p id="pl-instituicao-erro" className="pcms-erro">{errosCampo.instituicao}</p>
            )}
          </div>
          <div className="pcms-field">
            <label htmlFor="pl-cargo">Cargo atual (opcional)</label>
            <input
              id="pl-cargo"
              type="text"
              value={campos.cargoAtual}
              onChange={(e) => mudar("cargoAtual", e.target.value)}
            />
          </div>
        </div>

        <div className="pcms-upload">
          <label className="pcms-det-meta__rot" htmlFor="pl-foto">
            Foto
          </label>
          {fotoMostrada ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="pcms-perfil-foto"
              src={fotoMostrada}
              alt={previewFoto ? "Pré-visualização da foto escolhida" : `Foto atual de ${titulo}`}
            />
          ) : (
            <p className="pcms-upload__atual">Sem foto</p>
          )}
          <p className="pcms-editor__hint" id="pl-foto-dica">
            Proporção 20:23 (retrato). {foto ? `Escolhida: ${foto.name}` : novo ? "Obrigatória." : ""}
          </p>
          <input
            ref={fotoInputRef}
            id="pl-foto"
            type="file"
            accept="image/*"
            className="pcms-upload__input"
            onChange={(e) => escolherFoto(e.target.files?.[0] ?? null)}
            disabled={salvando}
          />
          {/* O input é display:none; o controle operável é este botão (§10). */}
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            aria-describedby={errosCampo.foto ? "pl-foto-dica pl-foto-erro" : "pl-foto-dica"}
            onClick={() => fotoInputRef.current?.click()}
            disabled={salvando}
          >
            {fotoMostrada ? "Trocar foto" : "Escolher foto"}
          </button>
          {errosCampo.foto && <p id="pl-foto-erro" className="pcms-erro">{errosCampo.foto}</p>}
          {foto && (
            <div className="pcms-field">
              <label htmlFor="pl-foto-alt">Texto alternativo da foto</label>
              <input
                id="pl-foto-alt"
                type="text"
                value={fotoAlt}
                maxLength={180}
                aria-describedby="pl-foto-alt-dica"
                onChange={(e) => setFotoAlt(e.target.value)}
              />
              <p id="pl-foto-alt-dica" className="pcms-editor__hint">
                Descreve a foto para quem usa leitor de tela. Vazio usa o nome do palestrante.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="pcms-editor">
        <div className="pcms-editor__head">Currículo</div>
        <p className="pcms-editor__hint">
          Formatação: <code>**negrito**</code> · <code>*itálico*</code> · <code>- item</code>. Linha
          em branco separa parágrafos.
        </p>

        <div className="pcms-field">
          <label htmlFor="pl-curto">Currículo curto</label>
          {palestrante?.curriculoCurtoComPerda && (
            <p className="pcms-aviso" role="note">
              {AVISO_PERDA}
            </p>
          )}
          <BarraFormatacao
            textareaRef={curtoRef}
            valor={campos.curriculoCurtoMarkdown ?? ""}
            onMudar={(v) => mudar("curriculoCurtoMarkdown", v)}
          />
          <textarea
            id="pl-curto"
            ref={curtoRef}
            rows={5}
            value={campos.curriculoCurtoMarkdown ?? ""}
            onChange={(e) => mudar("curriculoCurtoMarkdown", e.target.value)}
            onKeyDown={(e) => {
              const acao = atalhoDaTecla(e);
              if (!acao) return;
              e.preventDefault();
              aplicarNoTextarea(curtoRef.current, campos.curriculoCurtoMarkdown ?? "", acao, (v) =>
                mudar("curriculoCurtoMarkdown", v),
              );
            }}
            {...a11yErro("curriculoCurto", "pl-curto-erro")}
          />
          {errosCampo.curriculoCurto && (
            <p id="pl-curto-erro" className="pcms-erro">{errosCampo.curriculoCurto}</p>
          )}
        </div>

        <div className="pcms-field">
          <label htmlFor="pl-completo">Currículo completo (opcional)</label>
          {palestrante?.curriculoCompletoComPerda && (
            <p className="pcms-aviso" role="note">
              {AVISO_PERDA}
            </p>
          )}
          <BarraFormatacao
            textareaRef={completoRef}
            valor={campos.curriculoCompletoMarkdown ?? ""}
            onMudar={(v) => mudar("curriculoCompletoMarkdown", v)}
          />
          <textarea
            id="pl-completo"
            ref={completoRef}
            rows={8}
            value={campos.curriculoCompletoMarkdown ?? ""}
            onChange={(e) => mudar("curriculoCompletoMarkdown", e.target.value)}
            onKeyDown={(e) => {
              const acao = atalhoDaTecla(e);
              if (!acao) return;
              e.preventDefault();
              aplicarNoTextarea(
                completoRef.current,
                campos.curriculoCompletoMarkdown ?? "",
                acao,
                (v) => mudar("curriculoCompletoMarkdown", v),
              );
            }}
          />
        </div>
      </section>

      <section className="pcms-editor">
        <div className="pcms-editor__head">Links</div>
        <div className="pcms-editor__grid">
          <div className="pcms-field">
            <label htmlFor="pl-lattes">Currículo Lattes (URL)</label>
            <input
              id="pl-lattes"
              type="url"
              value={campos.linkLattes}
              onChange={(e) => mudar("linkLattes", e.target.value)}
            />
          </div>
          <div className="pcms-field">
            <label htmlFor="pl-linkedin">LinkedIn (URL)</label>
            <input
              id="pl-linkedin"
              type="url"
              value={campos.linkLinkedin}
              onChange={(e) => mudar("linkLinkedin", e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="pcms-editor">
        <div className="pcms-editor__head">Filtros do Corpo Docente</div>
        <div className="pcms-editor__grid">
          <SelectDocente
            id="pl-vertical"
            rotulo="Vertical"
            valor={campos.vertical}
            valores={VERTICAL_DOCENTE}
            dica={DICA_FILTRO}
            onMudar={(v) => mudar("vertical", v)}
          />
          <SelectDocente
            id="pl-tipo"
            rotulo="Tipo"
            valor={campos.tipo}
            valores={TIPO_DOCENTE}
            dica={DICA_FILTRO}
            onMudar={(v) => mudar("tipo", v)}
          />
          <SelectDocente
            id="pl-frente"
            rotulo="Frente"
            valor={campos.frente}
            valores={FRENTE_DOCENTE}
            onMudar={(v) => mudar("frente", v)}
          />
          <SelectDocente
            id="pl-formacao"
            rotulo="Formação"
            valor={campos.formacao}
            valores={FORMACAO_DOCENTE}
            onMudar={(v) => mudar("formacao", v)}
          />
        </div>

        <ListaMarcavel
          id="pl-atuacao"
          rotulo="Atuação"
          itens={ATUACAO_DOCENTE.map((v) => ({ valor: v, rotulo: rotuloDocente(v) }))}
          marcados={campos.atuacao}
          onAlternar={(v) => alternarNaLista("atuacao", v)}
        />
        <ListaMarcavel
          id="pl-linhas"
          rotulo="Linhas de atuação"
          itens={opcoes.areas.map((a) => ({ valor: a.id, rotulo: a.nome }))}
          marcados={campos.linhasAtuacaoIds}
          onAlternar={(v) => alternarNaLista("linhasAtuacaoIds", v)}
        />
        <ListaMarcavel
          id="pl-programas"
          rotulo="Programas relacionados"
          itens={opcoes.programas.map((p) => ({ valor: p.id, rotulo: p.sigla }))}
          marcados={campos.programasIds}
          onAlternar={(v) => alternarNaLista("programasIds", v)}
        />
      </section>

      <section className="pcms-editor">
        <div className="pcms-editor__head">Visibilidade</div>
        <div className="pcms-field pcms-field--check">
          <label htmlFor="pl-oculto">
            <input
              id="pl-oculto"
              type="checkbox"
              checked={campos.ocultarDoSite}
              onChange={(e) => mudar("ocultarDoSite", e.target.checked)}
            />
            Ocultar do site
          </label>
        </div>
      </section>

      <BlocoCorpoDocente
        ligado={cardLigado}
        confirmandoDesligar={confirmandoDesligar}
        oculto={campos.ocultarDoSite}
        formato={formato}
        textos={textos}
        onAlternar={alternarCard}
        onFormato={setFormato}
        onTexto={mudarTexto}
      />

      <div className="pcms-editor__acoes">
        <button type="button" className="pcms-btn" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          className="pcms-btn pcms-btn--ghost"
          onClick={onCancelar}
          disabled={salvando}
        >
          Cancelar
        </button>
      </div>
    </>
  );
}

interface SelectDocenteProps {
  id: string;
  rotulo: string;
  valor: string;
  valores: readonly string[];
  dica?: string;
  onMudar: (v: string) => void;
}

function SelectDocente({ id, rotulo, valor, valores, dica, onMudar }: SelectDocenteProps) {
  return (
    <div className="pcms-field">
      <label htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        value={valor}
        aria-describedby={dica ? `${id}-dica` : undefined}
        onChange={(e) => onMudar(e.target.value)}
      >
        <option value="">—</option>
        {valores.map((v) => (
          <option key={v} value={v}>
            {rotuloDocente(v)}
          </option>
        ))}
      </select>
      {dica && (
        <p id={`${id}-dica`} className="pcms-editor__hint">
          {dica}
        </p>
      )}
    </div>
  );
}

interface ListaMarcavelProps {
  id: string;
  rotulo: string;
  itens: { valor: string; rotulo: string }[];
  marcados: string[];
  onAlternar: (valor: string) => void;
}

/** Múltipla escolha por checkboxes (mesmo idiom do seletor de autores). */
function ListaMarcavel({ id, rotulo, itens, marcados, onAlternar }: ListaMarcavelProps) {
  return (
    <div className="pcms-seletor" role="group" aria-labelledby={`${id}-rot`}>
      <span className="pcms-det-meta__rot" id={`${id}-rot`}>
        {rotulo} ({marcados.length} selecionados)
      </span>
      <div className="pcms-seletor__lista">
        {itens.map((i) => (
          <label key={i.valor} className="pcms-seletor__item">
            <input
              type="checkbox"
              checked={marcados.includes(i.valor)}
              onChange={() => onAlternar(i.valor)}
            />
            <span className="pcms-seletor__nome">
              <strong>{i.rotulo}</strong>
            </span>
          </label>
        ))}
        {itens.length === 0 && <p className="pcms-seletor__vazio">Nenhuma opção.</p>}
      </div>
    </div>
  );
}

interface BlocoCorpoDocenteProps {
  ligado: boolean;
  confirmandoDesligar: boolean;
  oculto: boolean;
  formato: FormatoCard;
  textos: TextosCard;
  onAlternar: () => void;
  onFormato: (f: FormatoCard) => void;
  onTexto: (chave: keyof TextosCard, valor: string) => void;
}

/** Card do palestrante no Global `corpo-docente` (spec §5.3). */
function BlocoCorpoDocente({
  ligado,
  confirmandoDesligar,
  oculto,
  formato,
  textos,
  onAlternar,
  onFormato,
  onTexto,
}: BlocoCorpoDocenteProps) {
  function campo(chave: keyof TextosCard, rotulo: string, dica?: string, area = false) {
    const id = `pl-card-${chave}`;
    const comum = {
      id,
      value: textos[chave],
      "aria-describedby": dica ? `${id}-dica` : undefined,
    };
    return (
      <div className="pcms-field">
        <label htmlFor={id}>{rotulo}</label>
        {area ? (
          <textarea {...comum} rows={3} onChange={(e) => onTexto(chave, e.target.value)} />
        ) : (
          <input {...comum} type="text" onChange={(e) => onTexto(chave, e.target.value)} />
        )}
        {dica && (
          <p id={`${id}-dica`} className="pcms-editor__hint">
            {dica}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="pcms-editor">
      <div className="pcms-editor__head">Corpo Docente</div>

      <div className="pcms-toggle-row">
        <span id="pl-card-rot">
          Aparece no Corpo Docente
          <small>Card novo entra no fim da lista; a ordem se ajusta na tela Corpo Docente.</small>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={ligado}
          aria-labelledby="pl-card-rot"
          aria-describedby={confirmandoDesligar ? "pl-card-confirmar" : undefined}
          className={`pcms-switch${ligado ? " pcms-switch--on" : ""}`}
          onClick={onAlternar}
        />
      </div>
      <p id="pl-card-confirmar" className="pcms-erro" role="status">
        {confirmandoDesligar ? "Tirar do Corpo Docente? Clique de novo para confirmar" : ""}
      </p>

      {ligado && oculto && (
        <p className="pcms-aviso" role="note">
          Não aparece na página enquanto estiver oculto do site
        </p>
      )}

      {ligado && (
        <>
          <div className="pcms-field" role="radiogroup" aria-labelledby="pl-card-formato-rot">
            <span className="pcms-det-meta__rot" id="pl-card-formato-rot">
              Tipo do card
            </span>
            {(Object.keys(ROTULO_FORMATO) as FormatoCard[]).map((f) => (
              <div key={f} className="pcms-field--check">
                <label htmlFor={`pl-card-formato-${f}`}>
                  <input
                    id={`pl-card-formato-${f}`}
                    type="radio"
                    name="pl-card-formato"
                    value={f}
                    checked={formato === f}
                    onChange={() => onFormato(f)}
                  />
                  {ROTULO_FORMATO[f]}
                </label>
              </div>
            ))}
          </div>

          <div className="pcms-editor__grid">
            {campo("tag", "Etiqueta")}
            {campo("axisBadge", "Selo da foto")}
          </div>
          {campo("credencialCard", "Credencial", undefined, true)}

          {formato === "featured" ? (
            <div className="pcms-editor__grid">
              {campo("metaAtuacao", "Linha de atuação", "aceita <strong>")}
              {campo("metaEixos", "Linha de eixos", "aceita <strong>")}
            </div>
          ) : (
            <div className="pcms-editor__grid">
              {campo("programasTexto", "Programas — prefixo")}
              {campo("programasStrong", "Programas — destaque")}
              {campo("sufixoPrograma", "Programas — sufixo")}
            </div>
          )}

          <div className="pcms-editor__grid">
            {campo("ctaHref", "Link do botão", "começa com /, #, http://, https:// ou mailto:")}
            {campo(
              "ctaRotulo",
              "Rótulo do botão",
              formato === "expert" ? "Vazio usa “Consultar disponibilidade”." : undefined,
            )}
          </div>
        </>
      )}
    </section>
  );
}
