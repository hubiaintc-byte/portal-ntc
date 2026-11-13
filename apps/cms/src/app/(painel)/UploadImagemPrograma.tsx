"use client";

import { useId, useRef, useState, useTransition } from "react";

import type { AlvoImagemPrograma } from "@/lib/cms/paginaProgramaCatalogo";

import { enviarImagemProgramaCatalogoCrm, removerImagemProgramaCatalogoCrm } from "./acoesCatalogo";
import { nomeAcessivelAcao } from "./rotuloImagemPrograma";

/** Os tipos aceitos (sem SVG: o otimizador de imagens do Next recusa). */
const ACEITOS = "image/jpeg,image/png,image/webp,image/avif";

interface UploadImagemProgramaProps {
  /** `null` = programa ainda não salvo. */
  programaId: string | null;
  alvo: AlvoImagemPrograma | null;
  rotulo: string;
  /** De quem é a imagem ("Imagem do topo", "Especialista Ana Lima"…), no nome acessível dos botões. */
  identificacao: string;
  /** Id da media vinculada, "" se não há. */
  midiaId: string;
  /** Depois de enviar/remover: o novo id ("" ao remover), para o formulário não sobrescrever no próximo salvar. */
  onMudou: (midiaId: string) => void;
}

/**
 * Envio e remoção da imagem (media) do topo, do cartão ou de um docente — no
 * padrão do `CampoUpload` da capa do evento. A media vence o caminho
 * `/img/…`; removê-la devolve o caminho. Grava na hora (fora do Salvar).
 */
export function UploadImagemPrograma({ programaId, alvo, rotulo, identificacao, midiaId, onMudou }: UploadImagemProgramaProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const motivoBloqueio =
    programaId === null
      ? "Salve o programa para enviar imagens."
      : alvo === null
        ? "Salve o programa para enviar a imagem desta linha."
        : null;

  const textoEnviar = enviando ? "Enviando…" : midiaId !== "" ? "Trocar imagem" : "Enviar imagem";

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || programaId === null || alvo === null) return;
    setErro(null);
    setAviso(null);
    const fd = new FormData();
    fd.append("arquivo", file);
    iniciar(async () => {
      const r = await enviarImagemProgramaCatalogoCrm(programaId, alvo, fd);
      if (r.ok && r.midiaId) {
        onMudou(r.midiaId);
        setAviso(r.aviso ?? null);
      } else setErro(r.erro ?? "Falha no envio da imagem.");
    });
  }

  function remover() {
    if (programaId === null || alvo === null) return;
    setErro(null);
    setAviso(null);
    iniciar(async () => {
      const r = await removerImagemProgramaCatalogoCrm(programaId, alvo);
      if (r.ok) {
        onMudou("");
        setAviso(r.aviso ?? null);
      } else setErro(r.erro ?? "Falha ao remover a imagem.");
    });
  }

  return (
    <div className="pcms-upload">
      <span className="pcms-det-meta__rot" id={`${id}-rot`}>
        {rotulo}
      </span>
      <p className="pcms-upload__atual">
        {midiaId !== ""
          ? "Imagem enviada vinculada — no site ela vence o caminho."
          : "Nenhuma imagem enviada — o site usa o caminho."}
      </p>
      {motivoBloqueio ? (
        <p className="pcms-editor__hint">{motivoBloqueio}</p>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACEITOS}
            className="pcms-upload__input"
            onChange={aoEscolher}
            disabled={enviando}
            aria-labelledby={`${id}-rot`}
          />
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            aria-label={nomeAcessivelAcao(textoEnviar, identificacao)}
          >
            {textoEnviar}
          </button>
          {midiaId !== "" && (
            <button
              type="button"
              className="pcms-btn pcms-btn--ghost"
              onClick={remover}
              disabled={enviando}
              aria-label={nomeAcessivelAcao("Remover imagem enviada", identificacao)}
            >
              Remover imagem enviada
            </button>
          )}
        </>
      )}
      {erro && <p className="pcms-upload__erro">{erro}</p>}
      {aviso && (
        <p className="pcms-form-aviso" role="status">
          {aviso}
        </p>
      )}
    </div>
  );
}
