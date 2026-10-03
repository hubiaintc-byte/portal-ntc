/**
 * Composição do conteúdo inicial da proposta (Sessão 2). Módulo puro: sem I/O
 * e sem conhecimento de Lexical. Os cinco textos Lexical do programa e a
 * `ementa` dos módulos são copiados por quem grava (criação da proposta).
 */

import {
  textosPadraoProposta,
  type ChaveTextoInstitucional,
  type ContextoTextosProposta,
} from "./textosProposta";

export interface ProgramaParaConteudo {
  eixos: { titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  resultados: string[];
}

export interface ModuloParaConteudo {
  id: string;
  titulo: string;
}

export interface ConteudoInicialProposta {
  eixos: { titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  resultados: { texto: string }[];
  modulosDetalhados: { modulo: string; tituloExibido: string }[];
  textos: Record<ChaveTextoInstitucional, string>;
}

export function conteudoInicialProposta(p: {
  programa: ProgramaParaConteudo | null;
  modulos: ModuloParaConteudo[];
  contextoTextos: ContextoTextosProposta;
}): ConteudoInicialProposta {
  const { programa, modulos, contextoTextos } = p;
  return {
    eixos: programa ? programa.eixos.map((e) => ({ titulo: e.titulo, descricao: e.descricao })) : [],
    diferenciais: programa
      ? programa.diferenciais.map((d) => ({ titulo: d.titulo, descricao: d.descricao }))
      : [],
    resultados: programa ? programa.resultados.map((texto) => ({ texto })) : [],
    modulosDetalhados: programa ? modulos.map((m) => ({ modulo: m.id, tituloExibido: m.titulo })) : [],
    textos: textosPadraoProposta(contextoTextos),
  };
}
