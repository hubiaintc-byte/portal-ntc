/**
 * Capa do documento da proposta (Sessão 2). Módulo puro — sem I/O.
 *
 * Por ora só o subtítulo: o rótulo editorial que a capa imprime abaixo do
 * título ("Combo de Três Módulos · EDUTEC"), derivado do tipo da proposta,
 * da quantidade de módulos contratados e da sigla do programa.
 */

import { divisaoExata } from "@ntc/lib";

import type { DadosDocumentoProposta } from "./dados";
import {
  esc,
  formatarDataDocumentoOpcional,
  formatarInteiroDocumento,
  formatarMoedaDocumento,
  formatarPercentualDocumento,
} from "./formato";
import { LOGO_PROPOSTA_HTML } from "./logoProposta";

/** Dois a dez por extenso; acima disso o algarismo lê melhor que a palavra. */
const POR_EXTENSO: Record<number, string> = {
  2: "Dois",
  3: "Três",
  4: "Quatro",
  5: "Cinco",
  6: "Seis",
  7: "Sete",
  8: "Oito",
  9: "Nove",
  10: "Dez",
};

export function subtituloProposta(
  tipo: string,
  numModulos: number,
  programaSigla: string,
): string {
  const prefixo = prefixoDoEscopo(tipo, numModulos);
  const sigla = programaSigla.trim();
  if (!prefixo) return sigla;
  if (!sigla) return prefixo;
  return `${prefixo} · ${sigla}`;
}

/**
 * Trilha completa não depende da contagem: o escopo é o programa inteiro,
 * mesmo que os módulos ainda não tenham sido lançados na proposta. Sem
 * módulos e sem ser trilha, a capa fica só com a sigla — nunca com um
 * "Combo de 0 Módulos".
 */
function prefixoDoEscopo(tipo: string, numModulos: number): string {
  if (tipo === "programa-completo") return "Trilha Completa";
  if (numModulos <= 0) return "";
  if (numModulos === 1) return "Módulo Avulso";
  return `Combo de ${POR_EXTENSO[numModulos] ?? String(numModulos)} Módulos`;
}

// ---------------------------------------------------------------------------
// Capa e Resumo Executivo — transcritos de docs/prototipos/proposta-modelo-v1.html
// (capa: linhas 167-194; resumo: 195-244, sem o `.header-pag`, que no nosso
// gerador é o headerTemplate do Playwright). Elemento sem dado é omitido.
// ---------------------------------------------------------------------------

/** Valor útil para imprimir: não vazio e não o marcador "—" de ausência. */
function presente(v: string): string {
  const t = v.trim();
  return t === "—" ? "" : t;
}

function itemMeta(rotulo: string, valor: string): string {
  const v = presente(valor);
  return v ? `<div><strong>${rotulo}</strong>${esc(v)}</div>` : "";
}

export function montarCapa(d: DadosDocumentoProposta): string {
  const sigla = d.programaSigla.trim();
  const titulo = sigla || d.programaNome;
  const subtitulo = sigla ? d.programaNome : "";
  const ufMunicipio = [d.clienteUf, d.clienteMunicipio]
    .map(presente)
    .filter((p) => p.length > 0)
    .join(" · ");
  const participantes =
    d.qtdPagantes > 0 || d.cortesias > 0
      ? `${formatarInteiroDocumento(d.qtdPagantes)} pagantes + ${formatarInteiroDocumento(d.cortesias)} cortesias`
      : "";
  const meta = [
    itemMeta("Cliente", d.clienteSigla),
    itemMeta("UF · Município", ufMunicipio),
    itemMeta("Dirigente", d.clienteDirigente),
    itemMeta("Modalidade", d.modalidade),
    itemMeta("Carga Horária", d.cargaHorariaTotalModulos),
    itemMeta("Participantes", participantes),
    itemMeta("Emissão", formatarDataDocumentoOpcional(d.dataCriacaoISO)),
    itemMeta("Validade", formatarDataDocumentoOpcional(d.validadeISO)),
  ]
    .filter((m) => m.length > 0)
    .join("\n      ");

  return `<div class="cover">
  <div class="cover-top">
    ${LOGO_PROPOSTA_HTML}
    <div class="selo">Proposta Técnico-Comercial</div>
    ${d.subtitulo.trim() ? `<div class="selo-tipo">${esc(d.subtitulo)}</div>` : ""}
    ${sigla ? `<div class="selo-programa">Programa ${esc(sigla)}</div>` : ""}
  </div>
  <div class="cover-mid">
    <div class="titulo">${esc(titulo)}</div>
    ${subtitulo ? `<div class="subtitulo">${esc(subtitulo)}</div>` : ""}
    <div class="linha-deco"></div>
    <div class="destinatario">Destinada a<strong>${esc(d.clienteOrgao)}</strong></div>
  </div>
  <div class="cover-bot">
    <div class="meta">
      ${meta}
    </div>
    <div class="codigo">${esc(d.codigo)}</div>
  </div>
</div>`;
}

/** Códigos "M01 · M02" a partir dos rótulos "M1 · Título"; vazio se algum não casa. */
function codigosDosItens(d: DadosDocumentoProposta): string {
  const codigos: string[] = [];
  for (const i of d.itens) {
    const n = /^M(\d+)\b/.exec(i.rotulo)?.[1];
    if (!n) return "";
    codigos.push(`M${n.padStart(2, "0")}`);
  }
  return codigos.join(" · ");
}

function card(rotulo: string, valor: string, desc: string, menor = false): string {
  return `<div class="card"><div class="label">${esc(rotulo)}</div><div class="value${menor ? " menor" : ""}">${esc(valor)}</div>${desc ? `<div class="desc">${esc(desc)}</div>` : ""}</div>`;
}

function itemNegociado(rotulo: string, valor: string, desc: string): string {
  return `<div class="item-neg">
      <div class="label-neg">${esc(rotulo)}</div>
      <div class="valor-neg">${esc(valor)}</div>
      ${desc ? `<div class="desc-neg">${esc(desc)}</div>` : ""}
    </div>`;
}

export function montarResumoExecutivo(d: DadosDocumentoProposta): string {
  const n = d.itens.length;
  const sigla = d.programaSigla.trim();
  const orgao = presente(d.clienteOrgao);
  const clienteSigla = presente(d.clienteSigla);
  // Divisão por zero: sem pagante não existe valor por inscrição.
  const porInscricao = d.qtdPagantes > 0 ? d.valorLiquido / d.qtdPagantes : null;
  const valorPorInscricao = porInscricao === null ? "" : formatarMoedaDocumento(porInscricao);
  const porModulo = n > 1 && divisaoExata(d.qtdPagantes, n);
  const cortesiasPorModulo = n > 1 && divisaoExata(d.cortesias, n);
  const comDesconto = d.percDesconto > 0;
  const tabela = d.valorUnitario > 0 ? formatarMoedaDocumento(d.valorUnitario) : "";

  // Objeto: frase do modelo (linha 203), parametrizada; cláusulas sem dado caem.
  const codigos = codigosDosItens(d);
  const objeto = [
    "<strong>Objeto</strong> · Realização de formação institucional",
    n > 0 ? ` composta por <strong>${n} ${n === 1 ? "módulo-evento" : "módulos-evento"}</strong>` : "",
    sigla ? ` do Programa Estratégico <strong>${esc(sigla)}</strong>` : "",
    codigos ? ` (${esc(codigos)})` : "",
    presente(d.modalidade) ? `, em modalidade ${esc(d.modalidade)}` : "",
    orgao ? `, destinada à formação de quadros da ${esc(orgao)}` : "",
    d.qtdPagantes > 0
      ? `, com ${formatarInteiroDocumento(d.qtdPagantes)} inscrições pagantes${d.cortesias > 0 ? ` e ${formatarInteiroDocumento(d.cortesias)} cortesias institucionais` : ""}`
      : "",
    ".",
  ].join("");

  const descInv = [
    n > 0 ? `${n} ${n === 1 ? "módulo-evento" : "módulos-evento"}` : "",
    d.qtdPagantes > 0 ? `${formatarInteiroDocumento(d.qtdPagantes)} inscrições pagantes` : "",
    valorPorInscricao ? `valor por inscrição ${valorPorInscricao}` : "",
  ]
    .filter((p) => p.length > 0)
    .join(" · ");

  const itensNeg = [
    presente(d.replay)
      ? itemNegociado("Replay Ampliado", d.replay, "Em vez dos 7 dias padrão dos eventos abertos")
      : "",
    d.cortesias > 0
      ? itemNegociado(
          "Cortesias Institucionais",
          `${formatarInteiroDocumento(d.cortesias)} cortesias`,
          [
            cortesiasPorModulo ? `${formatarInteiroDocumento(d.cortesias / n)} por módulo` : "",
            clienteSigla ? `destinadas por ${clienteSigla}` : "",
          ]
            .filter((p) => p.length > 0)
            .join(" · "),
        )
      : "",
    comDesconto
      ? itemNegociado(
          "Desconto Institucional",
          formatarPercentualDocumento(d.percDesconto),
          tabela ? `Sobre valor de tabela ${tabela}/inscrição` : "",
        )
      : "",
  ].filter((i) => i.length > 0);

  const prefixoEscopo = d.subtitulo.split(" · ")[0]?.trim() ?? "";
  const escopo = prefixoEscopo && prefixoEscopo !== sigla ? prefixoEscopo : d.tipoTexto;

  const cards = [
    card("Programa", sigla || d.programaNome, "", true),
    card("Escopo Contratado", escopo, n > 0 ? `${n} ${n === 1 ? "módulo-evento" : "módulos-evento"} institucionais` : ""),
    presente(d.modalidade) ? card("Modalidade", d.modalidade, "", true) : "",
    presente(d.cargaHorariaTotalModulos)
      ? card("Carga Horária Total", d.cargaHorariaTotalModulos, "")
      : "",
    d.qtdPagantes > 0
      ? card(
          "Inscrições Pagantes",
          formatarInteiroDocumento(d.qtdPagantes),
          porModulo ? `${formatarInteiroDocumento(d.qtdPagantes / n)} por módulo × ${n} módulos` : "",
        )
      : "",
    valorPorInscricao
      ? card("Valor por Inscrição", valorPorInscricao, tabela ? `Tabela: ${tabela}` : "")
      : "",
  ].filter((c) => c.length > 0);

  return `<section class="resumo-exec">
  <div class="titulo-pagina">Resumo Executivo da Proposta</div>
  <div class="subtitulo-pagina">Visão consolidada do escopo, modalidade, investimento e condições contratuais</div>

  <div class="objeto-destacado">${objeto}</div>

  <div class="card-investimento">
    <div>
      <div class="label-inv">Investimento Líquido Total</div>
      <div class="valor-inv">${formatarMoedaDocumento(d.valorLiquido)}</div>
      ${descInv ? `<div class="desc-inv">${descInv}</div>` : ""}
    </div>
    <div>
      ${comDesconto ? `<div class="badge-desc">${formatarPercentualDocumento(d.percDesconto)} de desconto</div>` : ""}
    </div>
  </div>

  <div class="card-negociado">
    <div class="titulo-neg">Condição institucional negociada${clienteSigla ? ` para ${esc(clienteSigla)}` : ""}</div>
    ${itensNeg.join("\n    ")}
  </div>

  <div class="cards-resumo">
    ${cards.join("\n    ")}
  </div>
</section>`;
}
