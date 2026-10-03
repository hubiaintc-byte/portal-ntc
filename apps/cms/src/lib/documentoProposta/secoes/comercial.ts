/**
 * Seções comerciais do documento da proposta (Sessão 2): Objeto, Quadro
 * Comercial e Condições Comerciais. Módulo puro — sem I/O.
 * Transcritas de docs/prototipos/proposta-modelo-v1.html (seção 6: linha 264;
 * seção 15: 340-351; seção 16: 352-359). Os números de seção não aparecem
 * aqui: `montarSecoes` numera pela posição final.
 */

import { divisaoExata, linhasDoQuadro, type LinhaQuadro } from "@ntc/lib";

import type { DadosDocumentoProposta } from "../dados";
import {
  esc,
  formatarDataDocumentoOpcional,
  horasDoTotalDosModulos,
  formatarInteiroDocumento,
  formatarMoedaDocumento,
  formatarPercentualDocumento,
} from "../formato";
import {
  contagemDeItensDoDocumento,
  modulosContadosDoDocumento,
} from "../modulos";
import type { SecaoDocumento } from "../montar";

/** Valor útil para imprimir: não vazio, sem o marcador "—" nem "A definir". */
function util(v: string): string {
  const t = v.trim();
  return t === "—" || t === "A definir" ? "" : t;
}

/** "1 módulo" / "N módulos". */
function contagemModulos(n: number): string {
  return `${n} ${n === 1 ? "módulo" : "módulos"}`;
}

/** Texto livre: linha em branco separa parágrafos; quebra simples vira <br>. */
function paragrafosLivres(texto: string): string {
  return texto
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${esc(p).replace(/\r?\n/g, "<br>")}</p>`)
    .join("\n");
}

// --- Objeto -----------------------------------------------------------------

function montarObjeto(d: DadosDocumentoProposta): string {
  // Contagem e enumeração falam do mesmo conjunto: os módulos contados do
  // documento (fonte única em ../modulos.ts). Sem módulo de código legível, a
  // enumeração cai nos itens contratados — é o que faz uma proposta de
  // produto/evento avulso NOMEAR o que está sendo vendido, como na Fase B2.
  const legiveis = modulosContadosDoDocumento(d.modulosDetalhados);
  const n = contagemDeItensDoDocumento(d);
  const orgao = util(d.clienteOrgao);
  const sigla = d.programaSigla.trim();
  const programa = sigla ? ` do Programa Estratégico ${esc(sigla)}` : "";
  const escopo =
    n > 0
      ? `<strong>${n} ${n === 1 ? "módulo-evento" : "módulos-evento"}${programa}</strong>`
      : sigla
        ? `<strong>módulos-evento${programa}</strong>`
        : "<strong>módulos-evento</strong>";

  const lista =
    legiveis.length > 0
      ? legiveis.map((m) => `Módulo ${esc(m.digitos)} · ${esc(m.titulo)}`)
      : d.itens.map((i) => esc(i.rotulo));
  const especificamente = lista.length > 0 ? `, especificamente: ${lista.join(", ")}` : "";

  const horas = horasDoTotalDosModulos(d.cargaHorariaTotalModulos);
  const totalizando =
    horas === null ? "" : `, totalizando <strong>${horas} horas formativas</strong>`;

  const modalidade = util(d.modalidade);
  const emModalidade = modalidade ? `, em modalidade <strong>${esc(modalidade)}</strong>` : "";

  const quant: string[] = [];
  if (d.qtdPagantes > 0) quant.push(`${formatarInteiroDocumento(d.qtdPagantes)} inscrições pagantes`);
  if (d.cortesias > 0) quant.push(`${formatarInteiroDocumento(d.cortesias)} cortesias institucionais`);
  const com = quant.length > 0 ? `, com ${quant.join(" e ")}` : "";

  const contratante = orgao ? `ao(à) <strong>${esc(orgao)}</strong>` : "ao órgão contratante";
  return `<p>Constitui objeto da presente proposta a prestação, pelo <strong>Instituto NTC do Brasil</strong> ${contratante}, dos serviços de capacitação institucional referentes a ${escopo}${especificamente}${totalizando}${emModalidade}${com}, observados os quantitativos, condições comerciais e cláusulas pactuadas neste documento.</p>`;
}

// --- Quadro Comercial -------------------------------------------------------

/**
 * Tabela por módulo do modelo (seção 15): pagantes e cortesias divididos
 * igualmente, valor unitário líquido e subtotal por linha.
 */
function tabelaPorModulo(linhas: LinhaQuadro[]): string {
  return `<table class="qc"><thead><tr><th>Item</th><th>Módulo</th><th>CH</th><th class="qc-right">Pagantes + Cortesias</th><th class="qc-right">Valor unit.</th><th class="qc-right">Subtotal</th></tr></thead><tbody>${linhas
    .map(
      (l) =>
        `<tr><td><strong>${esc(l.codigo)}</strong></td><td>${esc(l.titulo)}</td><td>${esc(l.cargaHoraria.trim() || "—")}</td><td class="qc-right">${formatarInteiroDocumento(l.pagantes)} + ${formatarInteiroDocumento(l.cortesias)}</td><td class="qc-right">${formatarMoedaDocumento(l.valorUnitarioLiquido)}</td><td class="qc-right">${formatarMoedaDocumento(l.subtotal)}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}

/**
 * Fallback da Fase B2 (rótulo · CH · valor unitário), para quando NÃO há módulo
 * de código legível e há item contratado — o caso de uma proposta
 * `produto-evento-avulso`. Sem ele o documento não nomeava em lugar nenhum o
 * que estava sendo vendido, regressão em relação à Fase B2 apontada na revisão
 * final. Não traz quantitativo por item: distribuir pagantes por evento não foi
 * modelado nesta sessão.
 */
function tabelaDeItens(itens: DadosDocumentoProposta["itens"]): string {
  return `<table class="qc"><thead><tr><th>Item</th><th>CH</th><th class="qc-right">Valor unitário</th></tr></thead><tbody>${itens
    .map(
      (i) =>
        `<tr><td>${esc(i.rotulo)}</td><td>${esc(i.cargaHoraria.trim() || "—")}</td><td class="qc-right">${formatarMoedaDocumento(i.valorUnitario)}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}

function montarQuadro(d: DadosDocumentoProposta): string {
  const modulos = modulosContadosDoDocumento(d.modulosDetalhados);
  const n = modulos.length;
  // Sem pagante não há quantitativo a publicar: a tabela por módulo e as linhas
  // de pagantes somem, como o Resumo Executivo já omitia os cards de pagantes e
  // de valor por inscrição (decisão da fix wave: omitir nos dois).
  const semPagantes = d.qtdPagantes <= 0;
  const linhas = semPagantes
    ? []
    : linhasDoQuadro({
        modulos,
        qtdPagantes: d.qtdPagantes,
        cortesias: d.cortesias,
        valorLiquido: d.valorLiquido,
      });
  const exata =
    linhas.length > 0 && divisaoExata(d.qtdPagantes, n) && divisaoExata(d.cortesias, n);
  const pag = formatarInteiroDocumento(d.qtdPagantes);
  const cort = formatarInteiroDocumento(d.cortesias);

  const intro = semPagantes
    ? "<p>Apresentamos o quadro de investimento da presente proposta.</p>"
    : exata
      ? `<p>Apresentamos o quadro de investimento da presente proposta, fundamentado em <strong>${formatarInteiroDocumento(d.qtdPagantes / n)} inscrições pagantes</strong> e <strong>${formatarInteiroDocumento(d.cortesias / n)} cortesias institucionais por módulo-evento</strong>, totalizando <strong>${pag} inscrições pagantes e ${cort} cortesias</strong> ao longo ${n === 1 ? "do 1 módulo contratado" : `dos ${n} módulos contratados`}.</p>`
      : `<p>Apresentamos o quadro de investimento da presente proposta, fundamentado em <strong>${pag} inscrições pagantes</strong> e <strong>${cort} cortesias institucionais</strong>.</p>`;

  const tabela =
    linhas.length > 0
      ? tabelaPorModulo(linhas)
      : n === 0 && d.itens.length > 0
        ? tabelaDeItens(d.itens)
        : "";

  const descPag = exata ? ` (${formatarInteiroDocumento(d.qtdPagantes / n)} × ${contagemModulos(n)})` : "";
  const descCort = exata ? ` (${formatarInteiroDocumento(d.cortesias / n)} × ${contagemModulos(n)})` : "";
  const linhaDesconto = semPagantes
    ? ""
    : `<tr><td>Valor com desconto institucional por inscrição</td><td class="qc-right"><strong>${formatarMoedaDocumento(d.valorLiquido / d.qtdPagantes)}</strong></td></tr>\n`;
  const linhaPagantes = semPagantes
    ? ""
    : `<tr><td>Inscrições pagantes total${descPag}</td><td class="qc-right">${pag}</td></tr>\n`;

  const resumo = `<table class="qc"><thead><tr><th colspan="2">Resumo Financeiro</th></tr></thead><tbody>
<tr><td>Valor de tabela por inscrição (folder oficial)</td><td class="qc-right">${formatarMoedaDocumento(d.valorUnitario)}</td></tr>
${linhaDesconto}${linhaPagantes}<tr><td>Cortesias institucionais total${descCort}</td><td class="qc-right">${cort}</td></tr>
<tr><td>Total de acessos</td><td class="qc-right"><strong>${formatarInteiroDocumento(d.qtdPagantes + d.cortesias)}</strong></td></tr>
<tr><td>Valor bruto (tabela)</td><td class="qc-right">${formatarMoedaDocumento(d.valorBruto)}</td></tr>
<tr><td>Desconto institucional (${formatarPercentualDocumento(d.percDesconto)})</td><td class="qc-right">${formatarMoedaDocumento(d.desconto)}</td></tr>
<tr class="total"><td>VALOR LÍQUIDO DA PROPOSTA</td><td class="qc-right">${formatarMoedaDocumento(d.valorLiquido)}</td></tr>
</tbody></table>`;

  return `${intro}\n${tabela}\n${resumo}`;
}

// --- Condições Comerciais ---------------------------------------------------

/** Prosa institucional fixa do modelo (seção 16); não há campo na proposta. */
const CLAUSULAS_COMPLEMENTARES =
  "A presente proposta comercial é válida até a data indicada em seu quadro de identificação, estando sujeita à disponibilidade de vagas, agenda docente, condições operacionais, confirmação formal pelo Instituto NTC e manutenção das condições comerciais apresentadas. A contratação poderá ser formalizada mediante instrumento compatível com os procedimentos administrativos do órgão contratante, tais como nota de empenho, autorização de fornecimento, ordem de serviço, contrato administrativo, termo de adesão ou documento equivalente. A reserva de vagas somente será considerada efetiva após a confirmação formal da inscrição e a emissão do documento de contratação. O órgão contratante deverá informar previamente eventual retenção ou recolhimento de tributos.";

function montarCondicoes(d: DadosDocumentoProposta): string {
  const validade = formatarDataDocumentoOpcional(d.validadeISO) || "—";
  const especificas = d.condEspecificas.trim()
    ? `\n<h3>Condições Específicas</h3>\n${paragrafosLivres(d.condEspecificas)}`
    : "";
  return `<div class="grid2">
<div class="box"><div class="label">Forma de Pagamento</div><div class="text">${esc(d.condPagto)}</div></div>
<div class="box"><div class="label">Validade</div><div class="value">${esc(validade)}</div></div>
<div class="box"><div class="label">Modalidade</div><div class="text">${esc(d.modalidade)}</div></div>
<div class="box"><div class="label">Replay Institucional</div><div class="value menor">${esc(d.replay)}</div></div>
</div>
<h3>Cláusulas Comerciais Complementares</h3>
<p>${CLAUSULAS_COMPLEMENTARES}</p>${especificas}`;
}

export function secoesComerciais(d: DadosDocumentoProposta): SecaoDocumento[] {
  return [
    { chave: "objeto", titulo: "Objeto da Proposta", corpoHtml: montarObjeto(d) },
    { chave: "quadro-comercial", titulo: "Quadro Comercial", corpoHtml: montarQuadro(d) },
    {
      chave: "condicoes-comerciais",
      titulo: "Condições Comerciais",
      corpoHtml: montarCondicoes(d),
    },
  ];
}
