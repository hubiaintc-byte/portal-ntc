"use client";

import { useState, useTransition } from "react";

import type { PalestranteCmsDetalhe } from "@/lib/cms/painelCms";

import { alternarOcultarPalestrante, carregarOpcoesPalestrante } from "./acoes";
import { FormPalestrante, rotuloDocente } from "./FormPalestrante";

type OpcoesPalestrante = Awaited<ReturnType<typeof carregarOpcoesPalestrante>>;

function vertAttr(vertical: string | null): string | undefined {
  if (!vertical) return undefined;
  const v = vertical.toLowerCase();
  if (v.includes("gest")) return "gestao-publica";
  if (v.includes("saúd") || v.includes("saud")) return "saude";
  if (v.includes("educ")) return "educacao";
  return undefined;
}

interface DetalhePalestranteProps {
  palestrante: PalestranteCmsDetalhe;
  onVoltar: () => void;
  /**
   * Avisa o shell para recarregar a lista depois de salvar no formulário.
   * Com `avisoSemReleitura`, gravou mas não deu para reler: o shell volta à
   * lista e mostra o aviso.
   */
  onSalvou: (avisoSemReleitura?: string) => void;
  /**
   * false ⇒ sem a tela de escrita em palestrantes (`capacidades.editarPalestrantes`):
   * some "Editar" e o switch "Ocultar do site" vira texto de estado.
   */
  podeEditar: boolean;
  /** `capacidades.editarCardCorpoDocente`: repassado ao formulário. */
  podeEditarCard: boolean;
}

/** Tela cheia de detalhe de um palestrante — leitura, visibilidade e modo edição. */
export function DetalhePalestrante({ palestrante: inicial, onVoltar, onSalvou, podeEditar, podeEditarCard }: DetalhePalestranteProps) {
  const [p, setP] = useState(inicial);
  const [salvando, iniciarSalvar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [opcoes, setOpcoes] = useState<OpcoesPalestrante | null>(null);
  const [editando, setEditando] = useState(false);
  const [abrindoEdicao, iniciarAbrirEdicao] = useTransition();
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  function abrirEdicao() {
    setErroEdicao(null);
    iniciarAbrirEdicao(async () => {
      try {
        setOpcoes(await carregarOpcoesPalestrante());
        setEditando(true);
      } catch {
        setErroEdicao("Não foi possível abrir a edição — verifique a conexão e tente de novo.");
      }
    });
  }

  function alternarVisibilidade() {
    const oculto = !p.ocultarDoSite;
    setErro(null);
    iniciarSalvar(async () => {
      const { resultado, palestrante } = await alternarOcultarPalestrante(p.id, oculto);
      if (resultado.ok && palestrante) {
        setP(palestrante);
      } else {
        setErro(resultado.erro ?? "Não foi possível atualizar a visibilidade.");
      }
    });
  }

  if (podeEditar && editando && opcoes) {
    return (
      <FormPalestrante
        palestrante={p}
        opcoes={opcoes}
        podeEditarCard={podeEditarCard}
        onCancelar={() => setEditando(false)}
        onSalvou={(salvo, aviso) => {
          setEditando(false);
          if (salvo) {
            setP(salvo);
            onSalvou();
          } else {
            onSalvou(aviso ?? "Salvo.");
          }
        }}
      />
    );
  }

  const card = p.editavel.corpoDocente;

  return (
    <>
      <button type="button" className="pcms-breadcrumb" onClick={onVoltar}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Palestrantes <span>/ {p.nome}</span>
      </button>

      <div className="pcms-perfil-head">
        {p.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="pcms-perfil-foto" src={p.fotoUrl} alt={`Foto de ${p.nome}`} />
        ) : (
          <span className="pcms-perfil-foto pcms-perfil-foto--vazia" data-vertical={vertAttr(p.vertical)}>
            {p.iniciais}
          </span>
        )}
        <div className="pcms-perfil-id">
          <p className="pcms-pagehead__eyebrow">{p.titulacao}</p>
          <h1>{p.nome}</h1>
          <p className="pcms-perfil-cargo">
            {[p.cargoAtual, p.instituicao].filter(Boolean).join(" · ")}
          </p>
          {p.vertical && <span className="pcms-selo-vert">{rotuloDocente(p.vertical)}</span>}
          {p.ocultarDoSite && <span className="pcms-selo pcms-selo--oculto">Oculto do site</span>}
        </div>
        {podeEditar && (
          <div className="pcms-det-head__acoes">
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={abrirEdicao}
              disabled={abrindoEdicao}
            >
              {abrindoEdicao ? "Abrindo…" : "Editar"}
            </button>
            {erroEdicao && (
              <p className="pcms-erro" role="alert">
                {erroEdicao}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="pcms-det-grid">
        <div className="pcms-det-main">
          {p.curriculoCurtoHtml && (
            <section className="pcms-det-bloco">
              <h2>Currículo</h2>
              <div className="pcms-rich" dangerouslySetInnerHTML={{ __html: p.curriculoCurtoHtml }} />
            </section>
          )}
          {p.curriculoCompletoHtml && (
            <section className="pcms-det-bloco">
              <h2>Currículo completo</h2>
              <div
                className="pcms-rich"
                dangerouslySetInnerHTML={{ __html: p.curriculoCompletoHtml }}
              />
            </section>
          )}
        </div>

        <aside className="pcms-det-aside">
          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Visibilidade no site</div>
            <div className="pcms-det-card__body">
              <div className="pcms-toggle-row">
                <span>
                  Ocultar do site
                  <small>
                    {p.ocultarDoSite
                      ? "Não aparece no Corpo Docente nem como palestrante de eventos."
                      : "Aparece normalmente nas páginas públicas."}
                  </small>
                </span>
                {podeEditar ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={p.ocultarDoSite}
                    aria-label="Ocultar do site"
                    className={`pcms-switch${p.ocultarDoSite ? " pcms-switch--on" : ""}`}
                    onClick={alternarVisibilidade}
                    disabled={salvando}
                  />
                ) : (
                  <span className={`pcms-selo pcms-selo--${p.ocultarDoSite ? "oculto" : "publicado"}`}>
                    {p.ocultarDoSite ? "Oculto" : "Visível"}
                  </span>
                )}
              </div>
              {erro && <p className="pcms-erro">{erro}</p>}
            </div>
          </div>

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Corpo Docente</div>
            <div className="pcms-det-card__body">
              {card ? (
                <>
                  <span className="pcms-selo pcms-selo--info">
                    {card.formato === "featured" ? "Destaque" : "Card comum"}
                  </span>
                  {card.textos.tag && <p className="pcms-det-link">{card.textos.tag}</p>}
                  {p.ocultarDoSite && (
                    <p className="pcms-editor__hint">
                      Não aparece na página enquanto estiver oculto do site
                    </p>
                  )}
                </>
              ) : (
                <p className="pcms-editor__hint">Não aparece no Corpo Docente</p>
              )}
            </div>
          </div>

          {p.linhasAtuacao.length > 0 && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Linhas de atuação</div>
              <div className="pcms-det-card__body">
                <div className="pcms-tags">
                  {p.linhasAtuacao.map((l) => (
                    <span key={l} className="pcms-chip pcms-chip--ativo">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(p.linkLattes || p.linkLinkedin) && (
            <div className="pcms-det-card">
              <div className="pcms-det-card__head">Links</div>
              <div className="pcms-det-card__body">
                {p.linkLattes && <p className="pcms-det-link">{p.linkLattes}</p>}
                {p.linkLinkedin && <p className="pcms-det-link">{p.linkLinkedin}</p>}
              </div>
            </div>
          )}

          <div className="pcms-det-card">
            <div className="pcms-det-card__head">Foto</div>
            <div className="pcms-det-card__body">
              <span className={`pcms-selo pcms-selo--${p.temFoto ? "publicado" : "rascunho"}`}>
                {p.temFoto ? "Vinculada" : "Pendente"}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
