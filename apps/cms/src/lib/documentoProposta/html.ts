import "server-only";

import { montarCapa, montarResumoExecutivo } from "./capa";
import type { DadosDocumentoProposta } from "./dados";
import { esc, formatarDataDocumentoOpcional } from "./formato";
import { FONTES_EMBUTIDAS_CSS } from "./fontsEmbutidas";
import { montarSecoes, type SecaoDocumento, type SecaoNumerada } from "./montar";
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
 * Seção 3 do modelo (linhas 245-259). Fica aqui, onde já vivia antes desta
 * sessão, porque é o único bloco que fala da identificação do próprio
 * documento — não do programa nem do negócio. As seis caixas são as de antes;
 * o estilo em linha do código é o que o modelo aplica (linha 246). As outras
 * caixas do modelo (CNPJ, contato institucional, cargo do dirigente) não têm
 * campo na proposta e não foram inventadas.
 */
function secaoIdentificacao(d: DadosDocumentoProposta): SecaoDocumento {
  const data = (iso: string | null): string => esc(formatarDataDocumentoOpcional(iso) || "—");
  const estiloCodigo =
    "font-family:'Barlow';font-size:11pt;letter-spacing:1pt;color:var(--navy);font-weight:600";
  return {
    chave: "identificacao",
    titulo: "Dados de Identificação da Proposta",
    corpoHtml: `<div class="grid2">
<div class="box"><div class="label">Código da Proposta</div><div class="text" style="${estiloCodigo}">${esc(d.codigo)}</div></div>
<div class="box"><div class="label">Versão</div><div class="value">v${String(d.versao).padStart(2, "0")}</div></div>
<div class="box"><div class="label">Cliente</div><div class="text"><strong>${esc(d.clienteOrgao)}</strong>${d.clienteSigla.trim() && d.clienteSigla !== d.clienteOrgao ? `<br>${esc(d.clienteSigla)}` : ""}</div></div>
<div class="box"><div class="label">Programa</div><div class="text">${esc(d.programaNome)}${d.programaSigla.trim() ? ` (${esc(d.programaSigla)})` : ""}</div></div>
<div class="box"><div class="label">Emissão</div><div class="text">${data(d.dataCriacaoISO)}</div></div>
<div class="box"><div class="label">Validade</div><div class="text">${data(d.validadeISO)}</div></div>
</div>`,
  };
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

export function montarHtmlDocumentoProposta(dados: DadosDocumentoProposta): string {
  const { secoes } = montarSecoes(baseDoDocumento(dados), dados.secoesExtras);

  return `<!DOCTYPE html><html lang="pt-BR"><head>
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
}
