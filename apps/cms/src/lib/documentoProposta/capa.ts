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
  cargaHorariaTotalLegivel,
  esc,
  formatarDataDocumentoOpcional,
  formatarInteiroDocumento,
  formatarMoedaDocumento,
  formatarPercentualDocumento,
} from "./formato";
import { LOGO_OFICIAL_SVG, LOGO_PROPOSTA_HTML, LOGO_RESUMO_PROPOSTA_HTML } from "./logoProposta";
import { contagemDeItensDoDocumento, modulosContadosDoDocumento } from "./modulos";

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
// (capa: linhas 167-194; resumo: 195-244, com o `.header-pag` — a faixa com
// logo e "Resumo Executivo" no corpo da página, que não se confunde com o
// cabeçalho corrido do Playwright). Elemento sem dado é omitido.
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
  const temas = presente(d.programaTemas);
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
    // Sem horas legíveis no campo não há carga horária a imprimir: "3 módulos"
    // sob o rótulo "Carga Horária" afirmaria o que o dado não diz.
    itemMeta("Carga Horária", cargaHorariaTotalLegivel(d.cargaHorariaTotalModulos)),
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
    ${temas ? `<div class="tagline-programa">${esc(temas)}</div>` : ""}
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

/**
 * Enumeração "M01 · M02" dos módulos contados — a mesma fonte única do Quadro
 * Comercial (`modulos.ts`). Antes era derivada dos rótulos de `itens`, e o
 * primeiro rótulo que não casasse `/^M\d+/` (o nome de um evento, por exemplo)
 * fazia a enumeração desaparecer em silêncio.
 */
function codigosDosModulos(d: DadosDocumentoProposta): string {
  return modulosContadosDoDocumento(d.modulosDetalhados)
    .map((m) => `M${m.digitos.padStart(2, "0")}`)
    .join(" · ");
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
  // `n` é o que a PROSA afirma vender (módulos contados ou, sem eles, os itens
  // contratados); `nModulos` é a base de TODA divisão por módulo. São iguais
  // sempre que há módulo de código legível — ver `modulos.ts`.
  const nModulos = modulosContadosDoDocumento(d.modulosDetalhados).length;
  const n = contagemDeItensDoDocumento(d);
  const sigla = d.programaSigla.trim();
  const orgao = presente(d.clienteOrgao);
  const clienteSigla = presente(d.clienteSigla);
  // Divisão por zero: sem pagante não existe valor por inscrição.
  const porInscricao = d.qtdPagantes > 0 ? d.valorLiquido / d.qtdPagantes : null;
  const valorPorInscricao = porInscricao === null ? "" : formatarMoedaDocumento(porInscricao);
  const porModulo = nModulos > 1 && divisaoExata(d.qtdPagantes, nModulos);
  const cortesiasPorModulo = nModulos > 1 && divisaoExata(d.cortesias, nModulos);
  const comDesconto = d.percDesconto > 0;
  const tabela = d.valorUnitario > 0 ? formatarMoedaDocumento(d.valorUnitario) : "";

  // Objeto: frase do modelo (linha 203), parametrizada; cláusulas sem dado caem.
  const codigos = codigosDosModulos(d);
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
            cortesiasPorModulo
              ? `${formatarInteiroDocumento(d.cortesias / nModulos)} por módulo`
              : "",
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
    card("Programa", sigla || d.programaNome, presente(d.programaTemas), true),
    card("Escopo Contratado", escopo, n > 0 ? `${n} ${n === 1 ? "módulo-evento" : "módulos-evento"} institucionais` : ""),
    presente(d.modalidade) ? card("Modalidade", d.modalidade, "", true) : "",
    cargaHorariaTotalLegivel(d.cargaHorariaTotalModulos)
      ? card("Carga Horária Total", cargaHorariaTotalLegivel(d.cargaHorariaTotalModulos), "")
      : "",
    d.qtdPagantes > 0
      ? card(
          "Inscrições Pagantes",
          formatarInteiroDocumento(d.qtdPagantes),
          porModulo
            ? `${formatarInteiroDocumento(d.qtdPagantes / nModulos)} por módulo × ${nModulos} módulos`
            : "",
        )
      : "",
    valorPorInscricao
      ? card("Valor por Inscrição", valorPorInscricao, tabela ? `Tabela: ${tabela}` : "")
      : "",
  ].filter((c) => c.length > 0);

  return `<section class="resumo-exec">
  <div class="header-pag">
    <div>${LOGO_RESUMO_PROPOSTA_HTML}</div>
    <div class="programa-id">Resumo Executivo${sigla ? `<span class="sigla">${esc(sigla)}</span>` : ""}</div>
  </div>
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

/**
 * Contracapa — transcrita de docs/prototipos/proposta-modelo-v1.html (linhas
 * 371-397). Endereço, contatos e slogan são os dados institucionais do modelo
 * aprovado; sigla, linha de temas, código e versão vêm da proposta. A área de
 * QR code do CSS do modelo não é usada (o modelo também não a usa).
 */
export function montarContracapa(d: DadosDocumentoProposta): string {
  const sigla = d.programaSigla.trim();
  const temas = presente(d.programaTemas);
  const versao = `v${String(d.versao).padStart(2, "0")}`;
  const seloFinal = [`Proposta ${d.codigo}`, `Versão ${versao}`, sigla].filter((p) => p.length > 0).join(" · ");

  return `<section class="contracapa">
  <div class="contracapa-fundo"></div>
  <div class="contracapa-top"><div class="selo-cima">Instituto NTC do Brasil</div></div>
  <div class="contracapa-mid">
    <div class="logo-grande">${LOGO_OFICIAL_SVG}</div>
    <div class="slogan">Inteligência institucional.<br>Impacto real.</div>
    <div class="submotto">Excelência técnica para formar, capacitar e fortalecer a Administração Pública.</div>
    <div class="linha-deco-c"></div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:11.5pt;color:#D6B070;font-style:italic;letter-spacing:1pt;text-align:center;max-width:140mm;line-height:1.55">
      Programas Estratégicos do Instituto NTC do Brasil${sigla ? ` &nbsp;·&nbsp; ${esc(sigla)}` : ""}
${temas ? `      <br>\n      <span style="color:#C9BC9A;font-size:10pt;letter-spacing:.5pt;font-style:normal">${esc(temas)}</span>\n` : ""}    </div>
  </div>
  <div class="contracapa-bot">
    <div class="endereco">Endereço Institucional</div>
    <div class="dados-end">Grupo NTC · Instituto NTC do Brasil<br>SCS Quadra 9 · Bloco C · Ed. Parque Cidade Corporate · Sala 1001 · Asa Sul<br>CEP 70308-200 · Brasília — DF</div>
    <div class="contatos-titulo">Fale com a NTC · Coordenação Comercial</div>
    <div class="contatos">
      <div><strong>Telefone</strong> (63) 3212-1199</div>
      <div><strong>WhatsApp</strong> (63) 98444-4040</div>
      <div><strong>E-mail</strong> contato@institutontc.com.br</div>
      <div><strong>Site</strong> www.institutontc.com.br</div>
    </div>
    <div class="selo-final">${esc(seloFinal)}</div>
  </div>
</section>`;
}
