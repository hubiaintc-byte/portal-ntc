"use client";

import { useState } from "react";

/**
 * Rascunho de uma seção do conteúdo do documento da proposta (Task 13).
 *
 * Mora num módulo próprio, e não dentro do componente, para a REGRA ser
 * testável sem infra de teste de React: `reduzirRascunho` é pura e cobre o
 * que a tela tem de garantir —
 *
 * 1. **salvar não reverte.** O rascunho salvo vira o novo "último salvo" e a
 *    marca da prop NÃO é tocada. (Era o Critical do fix round 1: um estado
 *    só fazia os dois papéis, e a re-renderização imediata depois do salvar
 *    comparava a marca nova com a prop velha e devolvia o texto de antes —
 *    salvar no banco e reverter na tela, com um segundo salvar regravando o
 *    texto velho por cima do bom.)
 * 2. **prop nova reseta.** Quando o detalhe é recarregado (depois de
 *    "Restaurar padrão") e o CONTEÚDO que chega é outro, o rascunho volta ao
 *    valor do servidor. Prop com o mesmo conteúdo e identidade nova não
 *    reseta nada — é o que evita que restaurar uma seção descarte o que está
 *    sendo digitado nas outras.
 * 3. **desfazer volta ao último salvo**, não à prop original.
 */

export interface EstadoRascunho<T> {
  /** Serial do `valorInicial` da última prop observada. Só a ação "prop" mexe. */
  marcaProp: string;
  valor: T;
  /** O que está no servidor na visão desta seção: a prop, ou o último salvo daqui. */
  ultimoSalvo: T;
  sujo: boolean;
}

export type AcaoRascunho<T> =
  | { tipo: "prop"; valorInicial: T }
  | { tipo: "mudar"; valor: T }
  | { tipo: "salvo"; valor: T }
  | { tipo: "desfazer" };

/** Serialização estável o suficiente para comparar conteúdo de texto/array simples. */
export const serialRascunho = (v: unknown): string => JSON.stringify(v) ?? "";

export function estadoInicialRascunho<T>(valorInicial: T): EstadoRascunho<T> {
  return {
    marcaProp: serialRascunho(valorInicial),
    valor: valorInicial,
    ultimoSalvo: valorInicial,
    sujo: false,
  };
}

export function reduzirRascunho<T>(
  estado: EstadoRascunho<T>,
  acao: AcaoRascunho<T>,
): EstadoRascunho<T> {
  switch (acao.tipo) {
    case "prop": {
      const marca = serialRascunho(acao.valorInicial);
      // Mesmo conteúdo: nada a fazer (identidade nova a cada leitura do
      // servidor não pode descartar rascunho).
      if (marca === estado.marcaProp) return estado;
      return { marcaProp: marca, valor: acao.valorInicial, ultimoSalvo: acao.valorInicial, sujo: false };
    }
    case "mudar":
      return { ...estado, valor: acao.valor, sujo: true };
    case "salvo":
      // A marca da prop fica como está, de propósito: a prop não mudou (salvar
      // não recarrega o detalhe), e mexer nela faria a próxima renderização
      // "resetar" para o valor de antes do salvar.
      return { ...estado, valor: acao.valor, ultimoSalvo: acao.valor, sujo: false };
    case "desfazer":
      return { ...estado, valor: estado.ultimoSalvo, sujo: false };
  }
}

export interface Rascunho<T> {
  valor: T;
  sujo: boolean;
  mudar: (novo: T) => void;
  desfazer: () => void;
  marcarSalvo: (salvo: T) => void;
}

/** O hook em cima do redutor: um estado só, ajustado na renderização quando a prop muda. */
export function useRascunho<T>(valorInicial: T): Rascunho<T> {
  const [estado, setEstado] = useState(() => estadoInicialRascunho(valorInicial));

  // Ajuste de estado derivado de prop, no padrão do React (setState em
  // renderização, condicionado — o redutor devolve o MESMO objeto quando não
  // há o que mudar, então não há laço).
  const aposProp = reduzirRascunho(estado, { tipo: "prop", valorInicial });
  if (aposProp !== estado) setEstado(aposProp);

  const despachar = (acao: AcaoRascunho<T>) => setEstado((e) => reduzirRascunho(e, acao));

  return {
    valor: aposProp.valor,
    sujo: aposProp.sujo,
    mudar: (novo) => despachar({ tipo: "mudar", valor: novo }),
    desfazer: () => despachar({ tipo: "desfazer" }),
    marcarSalvo: (salvo) => despachar({ tipo: "salvo", valor: salvo }),
  };
}
