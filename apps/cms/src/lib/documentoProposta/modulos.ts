/**
 * Contagem de módulos do documento da proposta — **fonte única**. Módulo puro
 * (sem I/O e sem import de `dados.ts`, para não fechar ciclo: é `dados.ts` que
 * importa daqui).
 *
 * Antes da fix wave da revisão final o documento contava módulos em três
 * lugares diferentes — `itens.length` (módulos **mais** eventos) na capa e no
 * Resumo Executivo, `modulosDetalhados.length` na Arquitetura da Solução e os
 * `modulosDetalhados` de código legível no Quadro Comercial. Com um evento na
 * proposta, o mesmo PDF imprimia dois quantitativos incompatíveis. Agora as
 * quatro camadas derivam de `modulosContadosDoDocumento`.
 *
 * A regra é **todo-ou-nada**, a mesma que o Quadro Comercial já aplicava: se
 * QUALQUER `modulosDetalhados` estiver sem número legível (relação com o
 * catálogo não populada, módulo apagado do catálogo), a função devolve `[]` e o
 * documento não publica nenhum quantitativo por módulo. Contar só os legíveis
 * mudaria a base da divisão de pagantes e cortesias e produziria números que
 * não fecham — pior, num documento contratual, que omitir.
 */

/** O que a contagem precisa de uma linha de `modulosDetalhados`. */
export interface EntradaModuloDetalhado {
  codigo: string;
  titulo: string;
  cargaHoraria: string | null;
}

export interface ModuloContadoDocumento {
  /** Dígitos do código, como gravados ("01"). */
  digitos: string;
  /** O mesmo número, para `linhasDoQuadro`. */
  numero: number;
  titulo: string;
  cargaHoraria: string | null;
}

/** Dígitos do código ("M01" -> "01"); null se o código não é legível. */
export function digitosDoCodigo(codigo: string): string | null {
  return /\d+/.exec(codigo)?.[0] ?? null;
}

export function modulosContadosDoDocumento(
  modulosDetalhados: readonly EntradaModuloDetalhado[],
): ModuloContadoDocumento[] {
  const saida: ModuloContadoDocumento[] = [];
  for (const m of modulosDetalhados) {
    const digitos = digitosDoCodigo(m.codigo);
    if (digitos === null) return [];
    saida.push({
      digitos,
      numero: Number(digitos),
      titulo: m.titulo,
      // Campo de texto do Payload pode chegar "" — `linhasDoQuadro` só trata null.
      cargaHoraria: m.cargaHoraria && m.cargaHoraria.trim() ? m.cargaHoraria : null,
    });
  }
  return saida;
}

/**
 * Quantos itens o documento afirma vender, para a PROSA (capa, Resumo, Objeto):
 * os módulos contados; sem eles, os itens contratados — é o fallback da Fase B2
 * que mantém o documento nomeando o que vende numa proposta de
 * `produto-evento-avulso` (§Important 2 da revisão final).
 *
 * **Não serve de base para divisão nenhuma**: pagantes e cortesias por módulo
 * saem sempre de `modulosContadosDoDocumento`, que é o conjunto do Quadro.
 */
export function contagemDeItensDoDocumento(d: {
  modulosDetalhados: readonly EntradaModuloDetalhado[];
  itens: readonly unknown[];
}): number {
  const modulos = modulosContadosDoDocumento(d.modulosDetalhados);
  return modulos.length > 0 ? modulos.length : d.itens.length;
}

/**
 * Horas de uma carga horária legível como número puro ("8h", "8 horas").
 * Valores compostos do catálogo ("16h · 2 dias") devolvem null de propósito:
 * somar formatos heterogêneos num documento contratual inventaria total.
 */
function horasDe(carga: string | null | undefined): number | null {
  if (!carga) return null;
  const casou = /^(\d+)\s*(?:h|horas?)$/i.exec(carga.trim());
  const bruto = casou?.[1];
  if (!bruto) return null;
  const n = Number(bruto);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * "24h · 3 módulos · 8h por módulo" quando todos os módulos têm a mesma carga
 * legível; cargas diferentes, ausentes ou ilegíveis caem para "3 módulos".
 * Sem módulos, string vazia. Conta o mesmo conjunto de
 * `modulosContadosDoDocumento`, para a carga horária da capa e do Resumo nunca
 * falar de um número de módulos diferente do do Quadro.
 */
export function cargaHorariaTotalDosModulos(
  modulos: readonly { cargaHoraria: string | null }[],
): string {
  const n = modulos.length;
  if (n === 0) return "";
  const contagem = n === 1 ? "1 módulo" : `${n} módulos`;
  const horas = modulos.map((m) => horasDe(m.cargaHoraria));
  const primeira = horas[0];
  if (primeira == null || horas.some((h) => h !== primeira)) return contagem;
  if (n === 1) return `${primeira}h · ${contagem}`;
  return `${primeira * n}h · ${contagem} · ${primeira}h por módulo`;
}
