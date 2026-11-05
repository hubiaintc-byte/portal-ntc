/**
 * Página estática de programa (`ConteudoPrograma`, dos `conteudo<SIGLA>.ts`)
 * → campos do CMS (`CamposPaginaPrograma`). É o inverso de
 * `camposParaPagina` (@ntc/lib): o que é molde ou derivado lá não é
 * guardado aqui. Usado pela carga dos 15 e pelo teste de ida e volta
 * (`paginaParaCampos.test.ts`). Função pura, sem I/O.
 *
 * `avisos` relata o que a conversão não conseguiu levar fielmente (tag
 * fora do subconjunto, numeral romano inválido, HTML fora do formato
 * esperado); para os 15 é vazio.
 */

import { escaparTexto, htmlInlineParaMarcacao } from "@ntc/lib";
import type { CamposPaginaPrograma, CartaoModalidadePagina, ConteudoPrograma, ModuloPrograma } from "@ntc/lib";

import { extrairCartoesDeResultado, htmlParaLexical } from "../htmlParaLexical";
import { romanoParaInteiro } from "./mapear";

const ENTIDADES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };

function decodificar(texto: string): string {
  return texto.replace(/&(amp|lt|gt|quot|#39);/g, (bruto, c: string) => ENTIDADES[c] ?? bruto);
}

const RE_INTRO_DOCENTES = /^<p class="faculty-prime-intro">([\s\S]*)<\/p>$/;
const RE_MODALIDADES = /^(?:<p>([\s\S]*?)<\/p>)?(?:\n<div class="modes-grid">\n([\s\S]*)<\/div>)?$/;
const RE_CARTAO_MODALIDADE =
  /  <article class="mode-card-prog( featured)?">\n    <span class="tag">(.*?)<\/span>\n    <h4>(.*?)<\/h4>\n    <p>(.*?)<\/p>\n    <a class="cta" href="(.*?)">(.*?)<\/a>\n  <\/article>\n/g;

/** "64h" → "64 horas". */
function cargaLonga(curta: string): string | null {
  const m = /^(\d+)h$/.exec(curta.trim());
  return m ? `${m[1]} horas` : null;
}

export function paginaParaCampos(p: ConteudoPrograma): { campos: CamposPaginaPrograma; avisos: string[] } {
  const avisos: string[] = [];

  const inline = (campo: string, html: string | undefined): string => {
    const { texto, tagsDesconhecidas } = htmlInlineParaMarcacao(html ?? "");
    for (const tag of tagsDesconhecidas) avisos.push(`${campo}: tag ignorada <${tag}>`);
    return texto;
  };
  const corpo = (campo: string, html: string) => {
    const { doc, tagsIgnoradas } = htmlParaLexical(html);
    for (const tag of tagsIgnoradas) avisos.push(`${campo}: tag ignorada <${tag}>`);
    return doc;
  };
  const textoPuro = (texto: string) => htmlParaLexical(`<p>${escaparTexto(texto)}</p>`).doc;

  const statCarga = p.hero.stats[1]?.num ?? "";
  const cargaHorariaTotal = cargaLonga(statCarga);
  if (cargaHorariaTotal === null) avisos.push(`hero.stats: carga horária "${statCarga}" fora do formato "64h"`);

  const topicosPorNumero = new Map((p.detalhamento?.itens ?? []).map((d) => [d.numero, d.topicos]));
  const modulos: ModuloPrograma[] = [];
  for (const m of p.modulos.itens) {
    const numero = romanoParaInteiro(m.numero);
    if (numero === null) {
      avisos.push(`modulos: numeral romano "${m.numero}" fora de I–XX`);
      continue;
    }
    modulos.push({
      numero,
      titulo: m.titulo,
      descricao: textoPuro(m.descricao),
      topicos: [...(topicosPorNumero.get(m.numero) ?? [])],
      cargaHoraria: m.cargaHoraria ?? "",
    });
  }
  modulos.sort((a, b) => a.numero - b.numero);

  const intro = RE_INTRO_DOCENTES.exec(p.docentes.introHtml);
  if (!intro && p.docentes.introHtml) avisos.push("docentes.introHtml fora do formato esperado");

  const modalidades = RE_MODALIDADES.exec(p.modalidades.corpoHtml);
  const cartoes: CartaoModalidadePagina[] = [];
  if (!modalidades) {
    avisos.push("modalidades.corpoHtml fora do formato esperado");
  } else if (modalidades[2]) {
    const consumido = [...modalidades[2].matchAll(RE_CARTAO_MODALIDADE)];
    if (consumido.map((c) => c[0]).join("") !== modalidades[2]) {
      avisos.push("modalidades.corpoHtml: cartão fora do formato esperado");
    }
    for (const c of consumido) {
      cartoes.push({
        destaque: Boolean(c[1]),
        tag: decodificar(c[2] ?? ""),
        titulo: decodificar(c[3] ?? ""),
        descricao: decodificar(c[4] ?? ""),
        ctaHref: decodificar(c[5] ?? ""),
        ctaRotulo: decodificar(c[6] ?? ""),
      });
    }
  }

  const resultados = extrairCartoesDeResultado(p.resultados.corpoHtml);
  if (resultados.length === 0 && p.resultados.corpoHtml) avisos.push("resultados.corpoHtml sem result-card");

  const campos: CamposPaginaPrograma = {
    sigla: p.sigla,
    slug: p.slug,
    nomeCompleto: p.nomeCompleto,
    vertical: p.vertical,
    cargaHorariaTotal: cargaHorariaTotal ?? "",
    visaoGeral: corpo("visaoGeral", p.visaoGeral.corpoHtml),
    problema: corpo("problema", p.problema.corpoHtml),
    objetivo: p.objetivoGeral ? corpo("objetivoGeral", p.objetivoGeral.corpoHtml) : null,
    publicoAlvo: corpo("publico", p.publico.corpoHtml),
    eixos: p.eixos.itens.map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    resultados,
    diferenciais: (p.diferenciais?.itens ?? []).map((d) => ({ titulo: d.titulo, descricao: d.descricao })),
    faq: p.faq.itens.map((f) => ({ pergunta: f.pergunta, resposta: textoPuro(f.resposta) })),
    modulos,
    pagina: {
      identidadeVisual: p.siglaCss,
      heroTitulo: inline("hero.tituloHtml", p.hero.tituloHtml),
      heroSubtitulo: p.hero.sub,
      heroImagem: p.hero.bgSrc,
      barraDados: p.metaBar.map((b) => ({ rotulo: b.rotulo, valor: b.valor, valorSub: b.valorSub ?? "" })),
      visaoGeralTitulo: inline("visaoGeral.tituloHtml", p.visaoGeral.tituloHtml ?? escaparTexto(p.visaoGeral.titulo)),
      problemaTitulo: inline("problema.tituloHtml", p.problema.tituloHtml ?? escaparTexto(p.problema.titulo)),
      problemaDestaque: inline("problema.destaqueHtml", p.problema.destaqueHtml),
      publicoChips: [...(p.publico.chips ?? [])],
      docentes: {
        titulo: inline("docentes.tituloHtml", p.docentes.tituloHtml ?? escaparTexto(p.docentes.titulo)),
        intro: intro ? inline("docentes.introHtml", intro[1]) : "",
        coordenacaoMarcador: p.docentes.coordenacaoMarker,
        especialistasMarcador: p.docentes.especialistasMarker,
        contadores: p.docentes.counters.map((k) => ({ num: k.num, lbl: k.lbl })),
        nota: p.docentes.nota,
        coordenacao: p.docentes.coordenacao.map((d) => ({
          tag: d.tag,
          imgSrc: d.imgSrc,
          imgAlt: d.imgAlt,
          eixoBadge: d.axisBadge,
          nome: d.nome,
          credencial: d.credencial,
          eixo: d.eixo,
          modulos: d.modulos,
        })),
        especialistas: p.docentes.especialistas.map((d) => ({
          imgSrc: d.imgSrc,
          imgAlt: d.imgAlt,
          eixoBadge: d.axisBadge,
          nome: d.nome,
          credencial: d.credencial,
          modulos: d.modulos,
        })),
      },
      modalidadesIntro: decodificar(modalidades?.[1] ?? ""),
      modalidadesCards: cartoes,
      modulosAbertosMicrocopy: p.modulosAbertos.microcopy,
      chamadaFinalTitulo: inline("ctaFinal.tituloHtml", p.ctaFinal?.tituloHtml),
      chamadaFinalTexto: p.ctaFinal?.corpo ?? "",
      resumoLateral: (p.sidebar?.rows ?? []).map((r) => ({ rotulo: r.rotulo, valor: r.valor })),
      entregas: [...(p.sidebar?.entregas ?? [])],
      // Preenchido por outra tarefa, a partir das listas e menus do site.
      cartao: { nome: "", tagline: "", meta: "", imagem: "", ordem: null },
    },
  };

  return { campos, avisos };
}
