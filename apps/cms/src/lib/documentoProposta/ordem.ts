/**
 * Ordem das seções no modelo aprovado (`docs/prototipos/proposta-modelo-v1.html`).
 *
 * Mora num módulo PURO (sem `server-only` e sem import nenhum) porque tem dois
 * leitores: o montador do documento (`html.ts`, que monta a base por esta
 * lista — "Objeto da Proposta" é a seção 6 do modelo mas nasce em
 * `secoes/comercial.ts`, e concatenar os módulos de seção jogaria ela para
 * depois de "Resultados Esperados"; montar por chave também garante que uma
 * seção omitida não desloque as outras) e a tela de edição do conteúdo
 * (`(painel)/crm/ConteudoProposta.tsx`, Client Component, que deriva daqui a
 * ordem dos editores — seção acrescentada ao documento não pode ficar
 * silenciosamente sem editor).
 */
export const ORDEM_MODELO: string[] = [
  "identificacao",
  "apresentacao",
  "contexto",
  "objeto",
  "objetivos",
  "publico-alvo",
  "arquitetura",
  "modulos",
  "metodologia",
  "docentes",
  "diferenciais",
  "resultados",
  "quadro-comercial",
  "condicoes-comerciais",
  "eventon",
  "certificacao-replay",
  "cancelamento",
  "protecao-conteudo",
  "fundamentacao-legal",
  "proximos-passos",
  "fechamento",
];

/**
 * Seções que o documento GERA a partir de valores da proposta (identificação,
 * objeto, quadro e dados das condições comerciais) — são cálculo, não redação
 * (spec §1), e por isso não têm editor na tela de conteúdo.
 */
export const SECOES_GERADAS: string[] = [
  "identificacao",
  "objeto",
  "quadro-comercial",
  "condicoes-comerciais",
];
