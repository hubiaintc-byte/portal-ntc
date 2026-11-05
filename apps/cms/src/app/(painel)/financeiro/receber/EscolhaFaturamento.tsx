"use client";

import { useEffect, useRef, useState } from "react";

import type { EventoFin } from "@ntc/lib";

import { CampoSelect } from "../eventos/CamposWizard";
import { Gaveta } from "../ui/Gaveta";
import { Icone } from "../ui/Icone";
import { eventosParaFaturar } from "./dadosReceber";

/**
 * `openFaturamentoEscolha` do protótipo: "Qual é a origem da receita?".
 * Com `textos`, também o `openTituloEscolha` de Pagar ("Qual é a origem da
 * despesa?"), que abre a aba Pagamentos do evento.
 * Evento ou projeto → escolhe o evento aqui e abre a área dele na aba
 * Faturamento e recebimentos (o protótipo mandava para a lista de eventos com
 * um aviso); só aparece para quem tem a tela Eventos. Receita corporativa →
 * abre o faturamento corporativo.
 */

/** Os textos do modal: os do faturamento (Receber) ou os do título (Pagar, `openTituloEscolha`). */
export interface TextosEscolhaOrigem {
  eyebrow: string;
  titulo: string;
  eventoDescricao: string;
  corporativoRotulo: string;
  corporativoDescricao: string;
  corporativoVazio: string;
  eventoAjuda: string;
  eventoBotao: string;
}

export const TEXTOS_ESCOLHA_FATURAMENTO: TextosEscolhaOrigem = {
  eyebrow: "Novo faturamento",
  titulo: "Qual é a origem da receita?",
  eventoDescricao: "Faturar uma receita vinculada a um evento da carteira",
  corporativoRotulo: "Receita corporativa",
  corporativoDescricao: "Faturar uma receita institucional sem evento",
  corporativoVazio: "Nenhuma receita corporativa contratada",
  eventoAjuda: "Abre o evento na aba Faturamento e recebimentos.",
  eventoBotao: "Abrir faturamento do evento",
};

interface EscolhaFaturamentoProps {
  /** Eventos do livro; `null` = a pessoa não tem a tela Eventos (só o corporativo). */
  eventos: readonly EventoFin[] | null;
  /** Há lançamento corporativo para escolher (receita contratada / despesa registrada). */
  temCorporativa: boolean;
  aoEscolherEvento: (eventoId: string) => void;
  aoEscolherCorporativo: () => void;
  aoFechar: () => void;
  /** Padrão: os do faturamento. */
  textos?: TextosEscolhaOrigem;
}

export function EscolhaFaturamento({
  eventos,
  temCorporativa,
  aoEscolherEvento,
  aoEscolherCorporativo,
  aoFechar,
  textos: T = TEXTOS_ESCOLHA_FATURAMENTO,
}: EscolhaFaturamentoProps) {
  const [passo, setPasso] = useState<"origem" | "evento">("origem");
  const [eventoId, setEventoId] = useState("");
  const [erro, setErro] = useState<string | undefined>(undefined);
  const lista = eventos ? eventosParaFaturar(eventos) : [];
  const nomes = new Map(lista.map((e) => [e.id, e.nome]));
  const caixa = useRef<HTMLDivElement>(null);
  const montou = useRef(false);
  // A escolha some ao trocar de passo: o foco vai ao select do evento (ou volta à escolha).
  // Na abertura quem foca é a Gaveta (`data-autofocus` na primeira escolha habilitada).
  useEffect(() => {
    if (!montou.current) {
      montou.current = true;
      return;
    }
    const alvo = passo === "evento" ? "#f_eventoFaturar" : ".choice:not(:disabled)";
    caixa.current?.querySelector<HTMLElement>(alvo)?.focus();
  }, [passo]);

  const abrirEvento = () => {
    if (!eventoId) return setErro("Selecione o evento.");
    aoEscolherEvento(eventoId);
  };

  const rodape =
    passo === "origem" ? (
      <>
        <span className="spacer" />
        <button type="button" className="btn btn-secondary" onClick={aoFechar}>
          Cancelar
        </button>
      </>
    ) : (
      <>
        <button type="button" className="btn btn-ghost" onClick={() => setPasso("origem")}>
          Voltar
        </button>
        <span className="spacer" />
        <button type="button" className="btn btn-secondary" onClick={aoFechar}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={abrirEvento}>
          <Icone nome="receipt" tamanho="sm" />
          {T.eventoBotao}
        </button>
      </>
    );

  return (
    <Gaveta
      forma="modal"
      tamanho="sm"
      eyebrow={T.eyebrow}
      titulo={T.titulo}
      aoFechar={aoFechar}
      rodape={rodape}
    >
      <div ref={caixa}>
        {passo === "origem" ? (
          <div className="choice-grid">
            {eventos && (
              <button
                type="button"
                className="choice"
                data-autofocus={lista.length > 0 || undefined}
                disabled={lista.length === 0}
                onClick={() => setPasso("evento")}
              >
                <Icone nome="calendar" />
                <b>Evento ou projeto</b>
                <span>{T.eventoDescricao}</span>
              </button>
            )}
            <button
              type="button"
              className="choice"
              data-autofocus={(temCorporativa && !(eventos && lista.length > 0)) || undefined}
              disabled={!temCorporativa}
              onClick={aoEscolherCorporativo}
            >
              <Icone nome="home" />
              <b>{T.corporativoRotulo}</b>
              <span>{temCorporativa ? T.corporativoDescricao : T.corporativoVazio}</span>
            </button>
          </div>
        ) : (
          <div
            className="form"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) abrirEvento();
            }}
          >
            <CampoSelect
              campo="eventoFaturar"
              rotulo="Evento"
              obrigatorio
              ajuda={T.eventoAjuda}
              opcoes={lista.map((e) => e.id)}
              rotuloDe={(id) => `${id} · ${nomes.get(id) ?? ""}`}
              valor={eventoId}
              aoMudar={(v) => {
                setEventoId(v);
                setErro(undefined);
              }}
              erro={erro}
            />
          </div>
        )}
      </div>
    </Gaveta>
  );
}
