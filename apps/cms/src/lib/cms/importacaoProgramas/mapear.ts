/**
 * Mapeador puro: instantâneo JSON (ver `tipos.ts`) → forma dos campos do
 * Payload para `programas`/`modulos`. Sem I/O, sem import de Payload —
 * quem grava no banco é a Task 3 (import propriamente dito), que consome
 * `MapeamentoPrograma` daqui.
 *
 * `avisos` acumula tudo que a origem não tinha ou que a conversão HTML→
 * Lexical teve que descartar (tag fora do subconjunto suportado); nada
 * disso interrompe o mapeamento — o programa inteiro é mapeado mesmo com
 * lacunas, e quem decide o que fazer com os avisos é quem chama (Task 4
 * imprime o relatório).
 */

import { textoParaLexical } from "@/lib/lexicalBuilders";

import { extrairCartoesDeResultado, htmlParaLexical, listaParaLexical } from "../htmlParaLexical";
import type { DocumentoLexical } from "../htmlParaLexical";
import type { ModuloInstantaneo, ProgramaInstantaneo } from "./tipos";

export interface CamposPrograma {
  visaoGeral: DocumentoLexical;
  problema: DocumentoLexical;
  objetivo?: DocumentoLexical;
  publicoAlvo: DocumentoLexical;
  eixosTematicos: { titulo: string; descricao: string }[];
  resultadosEsperados: { resultado: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; resposta: DocumentoLexical }[];
  modulosQuantidade: number;
}

export interface CamposModulo {
  numero: number;
  titulo: string;
  ementa: DocumentoLexical;
  cargaHoraria: string;
}

export interface Aviso {
  campo: string;
  motivo: string;
}

export interface MapeamentoPrograma {
  campos: CamposPrograma;
  modulos: CamposModulo[];
  avisos: Aviso[];
}

// Tabela fechada de I a XX: os programas não numeram módulo além de XX,
// e uma tabela de 20 entradas é mais honesta e mais curta que um parser
// geral de numerais romanos (que aceitaria formas fora do que a origem
// realmente usa).
const ROMANOS_I_A_XX: readonly string[] = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];

/** Converte um numeral romano de I a XX (forma canônica) em inteiro; qualquer outra coisa é `null`. */
export function romanoParaInteiro(v: string): number | null {
  const indice = ROMANOS_I_A_XX.indexOf(v);
  return indice === -1 ? null : indice + 1;
}

function mapearModulo(m: ModuloInstantaneo, avisos: Aviso[]): CamposModulo | null {
  const numero = romanoParaInteiro(m.numero);
  if (numero === null) {
    avisos.push({ campo: `modulos[${m.numero}].numero`, motivo: "numeral romano fora de I–XX" });
    return null;
  }

  if (m.topicos.length === 0) {
    avisos.push({ campo: `modulos[${m.numero}].topicos`, motivo: "ausente na origem" });
  }

  const { doc: ementa, tagsIgnoradas } = listaParaLexical(m.descricao, m.topicos);
  for (const tag of tagsIgnoradas) {
    avisos.push({ campo: `modulos[${m.numero}].ementa`, motivo: `tag ignorada: ${tag}` });
  }

  return { numero, titulo: m.titulo, ementa, cargaHoraria: m.cargaHoraria };
}

export function mapearPrograma(p: ProgramaInstantaneo): MapeamentoPrograma {
  const avisos: Aviso[] = [];

  const visao = htmlParaLexical(p.visaoGeralHtml);
  for (const tag of visao.tagsIgnoradas) avisos.push({ campo: "visaoGeral", motivo: `tag ignorada: ${tag}` });

  const problema = htmlParaLexical(p.problemaHtml);
  for (const tag of problema.tagsIgnoradas) avisos.push({ campo: "problema", motivo: `tag ignorada: ${tag}` });

  let objetivo: DocumentoLexical | undefined;
  if (p.objetivoHtml === null) {
    avisos.push({ campo: "objetivo", motivo: "ausente na origem" });
  } else {
    const resultado = htmlParaLexical(p.objetivoHtml);
    objetivo = resultado.doc;
    for (const tag of resultado.tagsIgnoradas) avisos.push({ campo: "objetivo", motivo: `tag ignorada: ${tag}` });
  }

  const publico = listaParaLexical(p.publicoHtml, p.publicoChips);
  for (const tag of publico.tagsIgnoradas) avisos.push({ campo: "publicoAlvo", motivo: `tag ignorada: ${tag}` });

  const resultadosEsperados = extrairCartoesDeResultado(p.resultadosHtml).map((resultado) => ({ resultado }));

  if (p.diferenciais.length === 0) {
    avisos.push({ campo: "diferenciais", motivo: "ausente na origem" });
  }

  const faq = p.faq.map((item) => ({ pergunta: item.pergunta, resposta: textoParaLexical(item.resposta) }));

  const modulos: CamposModulo[] = [];
  for (const m of p.modulos) {
    const mapeado = mapearModulo(m, avisos);
    if (mapeado) modulos.push(mapeado);
  }

  const campos: CamposPrograma = {
    visaoGeral: visao.doc,
    problema: problema.doc,
    ...(objetivo ? { objetivo } : {}),
    publicoAlvo: publico.doc,
    eixosTematicos: p.eixos,
    resultadosEsperados,
    diferenciais: p.diferenciais,
    faq,
    modulosQuantidade: modulos.length,
  };

  return { campos, modulos, avisos };
}
