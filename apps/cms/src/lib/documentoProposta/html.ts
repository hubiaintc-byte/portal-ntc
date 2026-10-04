import "server-only";

import { montarCapa, montarResumoExecutivo } from "./capa";
import type { DadosDocumentoProposta } from "./dados";
import {
  cargaHorariaTotalCurta,
  esc,
  formatarDataDocumentoOpcional,
} from "./formato";
import { FONTES_EMBUTIDAS_CSS } from "./fontsEmbutidas";
import { contagemDeItensDoDocumento } from "./modulos";
import {
  montarSecoes,
  type SecaoDocumento,
  type SecaoNumerada,
  type SecaoOmitida,
} from "./montar";
import { ORDEM_MODELO } from "./ordem";
import { secoesComerciais } from "./secoes/comercial";
import { secoesInstitucionais } from "./secoes/institucional";
import { secoesDeConteudo } from "./secoes/programa";
import { cssBaseProposta, cssVariaveisProposta } from "./tokens";

/**
 * Montagem final do documento da proposta: capa + Resumo Executivo + as 21
 * seções numeradas do modelo aprovado (docs/prototipos/proposta-modelo-v1.html).
 *
 * Simplificações deliberadas em relação ao modelo, todas registradas:
 * - o `@page` do modelo é descartado inteiro. As margin boxes (`@top-*`,
 *   `@bottom-*`) não são implementadas pelo Chromium; cabeçalho e rodapé vêm
 *   do `headerTemplate`/`footerTemplate` de `pdf/gerarPdfDeHtml.ts`, que segue
 *   o conteúdo e a tipografia das margin boxes do modelo.
 * - como o Playwright aplica cabeçalho/rodapé em TODAS as páginas, o
 *   `@page :first` do modelo (capa sem cabeçalho) não é reproduzido.
 * - a `<section class="contracapa">` do modelo está fora do escopo do spec
 *   (capa + Resumo Executivo + 21 seções) e não é montada aqui.
 * - o `<link>` do Google Fonts do modelo é descartado: as fontes da marca vão
 *   embutidas em base64 (`fontsEmbutidas.ts`), sem chamada de rede.
 */

/**
 * Seção 3 do modelo (linhas 245-259) — as **13 caixas** do modelo, na ordem
 * dele e com os rótulos dele. Fica aqui, onde já vivia antes desta sessão,
 * porque é o único bloco que fala da identificação do próprio documento — não
 * do programa nem do negócio. O estilo em linha do código e do contato é o que
 * o modelo aplica (linhas 246 e 252).
 *
 * Até a fix wave da revisão final só 6 caixas eram impressas, e o comentário
 * daqui afirmava que as outras "não têm campo na proposta" — era falso:
 * `clientes-crm` tem `cnpj` e `email`, `contatos[]` tem `cargo` e `email`, e
 * `DadosDocumentoProposta` já carregava UF, município, dirigente, modalidade,
 * replay e elaborador (que não era impresso em lugar nenhum: o documento tinha
 * perdido a autoria que a Fase B2 trazia na capa).
 *
 * **Caixa sem dado é omitida, nunca impressa vazia** (CLAUDE.md §5.3).
 */
function secaoIdentificacao(d: DadosDocumentoProposta): SecaoDocumento {
  const estiloCodigo =
    "font-family:'Barlow';font-size:11pt;letter-spacing:1pt;color:var(--navy);font-weight:600";
  const estiloContato =
    "font-family:'Barlow';font-size:10pt;color:var(--navy);font-weight:600";
  const estiloCargo = "font-size:8.5pt;color:var(--ink-mid)";

  /**
   * Caixa de conteúdo HTML já montado; vazio omite a caixa inteira. `classe`
   * segue o modelo caixa por caixa (linhas 246-258): das 13, só a de Versão usa
   * `value` (Cormorant 14pt `--navy`); as outras 12 usam `text` (corpo 9.8pt).
   */
  const caixa = (
    rotulo: string,
    html: string,
    estilo = "",
    classe: "text" | "value" = "text",
  ): string =>
    html.trim().length === 0
      ? ""
      : `<div class="box"><div class="label">${esc(rotulo)}</div><div class="${classe}"${estilo ? ` style="${estilo}"` : ""}>${html}</div></div>`;
  /** Caixa de texto simples; "—" e vazio contam como ausência. */
  const caixaTexto = (rotulo: string, valor: string, estilo = ""): string =>
    caixa(rotulo, esc(presenteNaIdentificacao(valor)), estilo);

  const data = (iso: string | null): string => formatarDataDocumentoOpcional(iso);
  const emissaoValidade = [data(d.dataCriacaoISO), data(d.validadeISO)]
    .filter((p) => p.length > 0)
    .join(" · ");
  const ufMunicipio = [d.clienteUf, d.clienteMunicipio]
    .map(presenteNaIdentificacao)
    .filter((p) => p.length > 0)
    .join(" · ");
  const siglaPropria =
    d.clienteSigla.trim() && d.clienteSigla !== d.clienteOrgao ? d.clienteSigla.trim() : "";
  const cargo = presenteNaIdentificacao(d.clienteDirigenteCargo);
  const dirigente = presenteNaIdentificacao(d.clienteDirigente);
  const elaboradorAprovador = [d.elaboradorNome, d.aprovadorNome]
    .map(presenteNaIdentificacao)
    .filter((p) => p.length > 0)
    .map((p) => esc(p))
    .join("<br>");

  const caixas = [
    caixa("Código da Proposta", esc(d.codigo), estiloCodigo),
    caixa("Versão", `v${String(d.versao).padStart(2, "0")}`, "", "value"),
    caixa(
      "Cliente",
      `<strong>${esc(d.clienteOrgao)}</strong>${siglaPropria ? `<br>${esc(siglaPropria)}` : ""}`,
    ),
    caixaTexto("UF · Município", ufMunicipio),
    caixaTexto("CNPJ", d.clienteCnpj),
    caixa(
      "Dirigente",
      dirigente
        ? `${esc(dirigente)}${cargo ? `<br><span style="${estiloCargo}">${esc(cargo)}</span>` : ""}`
        : "",
    ),
    caixaTexto("Contato Institucional", d.clienteContatoEmail, estiloContato),
    caixa(
      "Programa",
      `${esc(d.programaNome)}${d.programaSigla.trim() ? ` (${esc(d.programaSigla)})` : ""}`,
    ),
    caixaTexto("Escopo", escopoContratado(d)),
    caixaTexto("Modalidade", d.modalidade),
    caixaTexto("Replay", d.replay),
    caixaTexto("Emissão · Validade", emissaoValidade),
    caixa("Elaborador · Aprovador", elaboradorAprovador),
  ].filter((c) => c.length > 0);

  return {
    chave: "identificacao",
    titulo: "Dados de Identificação da Proposta",
    corpoHtml: `<div class="grid2">\n${caixas.join("\n")}\n</div>`,
  };
}

/** "—" e "A definir" são marcadores de ausência, não dado a imprimir. */
function presenteNaIdentificacao(v: string): string {
  const t = v.trim();
  return t === "—" || t === "A definir" ? "" : t;
}

/**
 * "3 módulos-evento · 24h totais" (caixa Escopo do modelo). Conta pela fonte
 * única do documento (`modulos.ts`) e omite a parte de horas quando não há
 * total legível a afirmar.
 */
function escopoContratado(d: DadosDocumentoProposta): string {
  const n = contagemDeItensDoDocumento(d);
  const carga = cargaHorariaTotalCurta(d.cargaHorariaTotalModulos);
  return [n > 0 ? `${n} ${n === 1 ? "módulo-evento" : "módulos-evento"}` : "", carga ? `${carga} totais` : ""]
    .filter((p) => p.length > 0)
    .join(" · ");
}

function baseDoDocumento(d: DadosDocumentoProposta): SecaoDocumento[] {
  const produzidas = [
    secaoIdentificacao(d),
    ...secoesDeConteudo(d),
    ...secoesComerciais(d),
    ...secoesInstitucionais(d),
  ];
  const porChave = new Map(produzidas.map((s) => [s.chave, s]));
  const ordenadas = ORDEM_MODELO.flatMap((chave) => {
    const s = porChave.get(chave);
    return s ? [s] : [];
  });
  // Chave produzida que não está na ordem do modelo vai para o fim em vez de
  // desaparecer: seção nova esquecida na lista é visível, não silenciosa.
  const naOrdem = new Set(ORDEM_MODELO);
  return [...ordenadas, ...produzidas.filter((s) => !naOrdem.has(s.chave))];
}

function renderizarSecoes(secoes: SecaoNumerada[]): string {
  return secoes
    .map(
      (s) =>
        `<section class="sec"><h2><span class="num">${s.numero}</span>${esc(s.titulo)}</h2>${s.corpoHtml}</section>`,
    )
    .join("\n");
}

function estilosDocumento(): string {
  return `<style>
${FONTES_EMBUTIDAS_CSS}
${cssVariaveisProposta()}
${cssBaseProposta()}
</style>`;
}

export interface DocumentoPropostaMontado {
  html: string;
  /**
   * Seções que ficaram fora — o "relatório de geração" do spec §1.1. Era
   * calculado por `montarSecoes` e jogado fora aqui: ninguém lia, e a informação
   * importa justamente no momento em que o PO gera o PDF.
   *
   * Cobre o que `montarSecoes` descarta: seção base de corpo vazio e seção
   * extra sem título ou sem corpo. **Não** cobre a seção 17 (EventON) quando a
   * modalidade não é online — `secoesInstitucionais` nem a produz, e a tela já
   * marca aquele editor com o selo "não sai no documento".
   */
  omitidas: SecaoOmitida[];
}

export function montarHtmlDocumentoProposta(
  dados: DadosDocumentoProposta,
): DocumentoPropostaMontado {
  const { secoes, omitidas } = montarSecoes(baseDoDocumento(dados), dados.secoesExtras);

  const html = `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>${esc(dados.codigo)} · Proposta Instituto NTC</title>
${estilosDocumento()}
</head>
<body>
${montarCapa(dados)}
<div class="body-wrap">
${montarResumoExecutivo(dados)}
${renderizarSecoes(secoes)}
</div>
</body></html>`;

  return { html, omitidas };
}
