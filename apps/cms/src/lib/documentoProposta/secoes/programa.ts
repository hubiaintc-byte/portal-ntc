/**
 * Seções de conteúdo do documento da proposta (4 a 14 do modelo, menos a 6,
 * que é comercial): Apresentação, Contexto, Objetivos, Público-alvo,
 * Arquitetura da Solução, Módulos Contratados, Metodologia, Corpo Docente,
 * Diferenciais e Resultados Esperados. Módulo puro — sem I/O.
 *
 * Transcritas de docs/prototipos/proposta-modelo-v1.html (linhas 260-339, que
 * é a fonte visual autoritativa — CLAUDE.md §18). Cinco delas são texto
 * corrido da própria proposta e vão tal e qual (o HTML já vem de
 * `lexicalDocumento.ts`, com o texto escapado no nó de texto). As outras cinco
 * montam a mobília do modelo a partir dos campos estruturados da proposta,
 * **omitindo cada elemento sem dado** em vez de imprimir rótulo vazio ou
 * inventar conteúdo (CLAUDE.md §5.3).
 *
 * Elementos do modelo deliberadamente NÃO reproduzidos, por não haver dado na
 * proposta: o badge de data do módulo, o `.grid-mod` ("Entregas Formativas
 * Principais" e "Conduzido por") e a `.nota-anexo` dos cartões de módulo.
 *
 * Os números de seção não aparecem aqui: `montarSecoes` numera pela posição
 * final, depois de descartar as seções de corpo vazio.
 */

import type {
  DadosDocumentoProposta,
  DocenteDocumento,
  ModuloDetalhadoDocumento,
} from "../dados";
import { esc } from "../formato";
import type { SecaoDocumento } from "../montar";

/** Valor útil para imprimir: não vazio, sem o marcador "—" nem "A definir". */
function util(v: string): string {
  const t = v.trim();
  return t === "—" || t === "A definir" ? "" : t;
}

/**
 * Estilo que o modelo aplica à ementa do módulo (linha 281). No modelo é um
 * `<p>`; aqui a ementa já chega como HTML de bloco (parágrafos, listas), então
 * o estilo vai num `<div>` envolvente — `text-align` e `font-size` herdam.
 */
const ESTILO_EMENTA =
  "font-size:9.5pt;line-height:1.5;color:var(--ink);margin-bottom:8pt;text-align:justify";

function caixa(rotulo: string, valor: string, classeValor: "value" | "text"): string {
  return `<div class="box"><div class="label">${esc(rotulo)}</div><div class="${classeValor}">${esc(valor)}</div></div>`;
}

// --- Arquitetura da Solução (9) ---------------------------------------------

/** "24h" a partir de "24h · 3 módulos · 8h por módulo"; senão, o texto inteiro. */
function cargaHorariaCurta(v: string): string {
  const t = util(v);
  return /^(\d+\s*h)\b/.exec(t)?.[1] ?? t;
}

function montarArquitetura(d: DadosDocumentoProposta): string {
  const n = d.modulosDetalhados.length;
  const sigla = d.programaSigla.trim();
  const carga = cargaHorariaCurta(d.cargaHorariaTotalModulos);
  const modalidade = util(d.modalidade);
  const replay = util(d.replay);
  const eixos = d.eixos.filter((e) => e.titulo.trim() || e.descricao.trim());

  // Sem nenhum dado, o parágrafo do modelo viraria prosa sem informação —
  // melhor omitir a seção inteira do que imprimir uma frase oca num
  // documento contratual.
  if (n === 0 && !sigla && !carga && !modalidade && !replay && eixos.length === 0) return "";

  const programa = sigla ? ` do Programa <strong>${esc(sigla)}</strong>` : "";
  const nucleo =
    n > 0
      ? `em torno de <strong>${n} ${n === 1 ? "módulo-evento" : "módulos-evento"}</strong>${programa}`
      : `em torno dos módulos-evento contratados${programa}`;
  const paragrafo = [
    `<p>A arquitetura técnico-pedagógica da presente proposta articula-se ${nucleo}`,
    carga ? `, com carga horária total de <strong>${esc(carga)}</strong>` : "",
    modalidade ? `, em modalidade <strong>${esc(modalidade)}</strong>` : "",
    replay ? `, com replay institucional de <strong>${esc(replay)}</strong>` : "",
    ".</p>",
  ].join("");

  const caixas = [
    carga ? caixa("Carga Horária Total", carga, "value") : "",
    n > 0 ? caixa("Módulos-Evento", String(n), "value") : "",
    modalidade ? caixa("Modalidade", modalidade, "text") : "",
  ].filter((c) => c.length > 0);
  const grid3 = caixas.length > 0 ? `\n<div class="grid3">${caixas.join("")}</div>` : "";

  // Os eixos temáticos entram DEPOIS do grid3 (decisão desta task): o grid3 é
  // a mobília do modelo, os eixos são o conteúdo próprio da proposta.
  const caixasEixo = eixos.map((e) => {
    const titulo = e.titulo.trim();
    const descricao = e.descricao.trim();
    return `<div class="box">${titulo ? `<div class="label">${esc(titulo)}</div>` : ""}${descricao ? `<div class="text">${esc(descricao)}</div>` : ""}</div>`;
  });
  const grid2 = caixasEixo.length > 0 ? `\n<div class="grid2">${caixasEixo.join("")}</div>` : "";

  return `${paragrafo}${grid3}${grid2}`;
}

// --- Módulos Contratados (10) -----------------------------------------------

function cartaoModulo(
  m: ModuloDetalhadoDocumento,
  posicao: number,
  modalidade: string,
): string {
  const codigo = m.codigo.trim();
  const titulo = m.titulo.trim();
  const rotulo = codigo && titulo ? `${esc(codigo)} · ${esc(titulo)}` : esc(codigo || titulo);
  const carga = util(m.cargaHoraria ?? "");
  const badges = [
    carga ? `<span class="badge gold">${esc(carga)}</span>` : "",
    modalidade ? `<span class="badge outline">${esc(modalidade)}</span>` : "",
  ].filter((b) => b.length > 0);

  return `<div class="modulo-premium">
<div class="numero">${posicao}</div>
<div class="titulo-mod">${rotulo}</div>${
    badges.length > 0 ? `\n<div class="badges">${badges.join("")}</div>` : ""
  }${m.ementaHtml.trim() ? `\n<div style="${ESTILO_EMENTA}">${m.ementaHtml}</div>` : ""}
</div>`;
}

function montarModulos(d: DadosDocumentoProposta): string {
  const modulos = d.modulosDetalhados.filter((m) => m.codigo.trim() || m.titulo.trim());
  if (modulos.length === 0) return "";

  const orgao = util(d.clienteOrgao);
  const porQuem = orgao ? ` selecionados pela <strong>${esc(orgao)}</strong> e` : "";
  const intro = `<p>A presente proposta contempla os seguintes módulos-evento,${porQuem} estruturados como combo formativo institucional:</p>`;

  const modalidade = util(d.modalidade);
  const cartoes = modulos.map((m, i) => cartaoModulo(m, i + 1, modalidade));
  return `${intro}\n${cartoes.join("\n")}`;
}

// --- Corpo Docente e Curadoria (12) -----------------------------------------

function cartaoDocente(x: DocenteDocumento): string {
  const credencial = x.credencial.trim();
  const eixo = x.eixo.trim();
  return `<div class="docente-card"><div class="nome">${esc(x.nome.trim())}</div>${
    credencial ? `<div class="titulacao">${esc(credencial)}</div>` : ""
  }${eixo ? `<div class="bio">Eixo · ${esc(eixo)}</div>` : ""}</div>`;
}

/**
 * Lista vazia é o caso normal hoje: nenhum especialista está vinculado a
 * programa no CMS (import de 30/09, §2.2 do spec), então a seção costuma ser
 * omitida — e o PO preenche os docentes à mão na tela da proposta.
 */
function montarDocentes(d: DadosDocumentoProposta): string {
  const docentes = d.docentes.filter((x) => x.nome.trim().length > 0);
  if (docentes.length === 0) return "";
  const intro =
    "<p>O presente combo formativo será conduzido pelos seguintes especialistas do <strong>Instituto NTC do Brasil</strong>:</p>";
  return `${intro}\n${docentes.map(cartaoDocente).join("\n")}`;
}

// --- Diferenciais NTC (13) e Resultados Esperados (14) ----------------------

function montarDiferenciais(d: DadosDocumentoProposta): string {
  const itens = d.diferenciais
    .map((x) => {
      const titulo = x.titulo.trim();
      const descricao = x.descricao.trim();
      if (titulo && descricao) return `<li><strong>${esc(titulo)}</strong> · ${esc(descricao)}</li>`;
      if (titulo) return `<li><strong>${esc(titulo)}</strong></li>`;
      if (descricao) return `<li>${esc(descricao)}</li>`;
      return "";
    })
    .filter((i) => i.length > 0);
  return itens.length > 0 ? `<ul>${itens.join("")}</ul>` : "";
}

/** O modelo imprime um parágrafo; a proposta guarda uma lista. Um item só vira
 * parágrafo (como no modelo); vários viram lista, para não emendar frases. */
function montarResultados(d: DadosDocumentoProposta): string {
  const itens = d.resultados.map((r) => r.trim()).filter((r) => r.length > 0);
  const unico = itens[0];
  if (unico === undefined) return "";
  if (itens.length === 1) return `<p>${esc(unico)}</p>`;
  return `<ul>${itens.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>`;
}

export function secoesDeConteudo(d: DadosDocumentoProposta): SecaoDocumento[] {
  const c = d.conteudoHtml;
  return [
    { chave: "apresentacao", titulo: "Apresentação Executiva", corpoHtml: c.apresentacao },
    { chave: "contexto", titulo: "Contexto e Justificativa", corpoHtml: c.contexto },
    { chave: "objetivos", titulo: "Objetivos", corpoHtml: c.objetivos },
    { chave: "publico-alvo", titulo: "Público-alvo", corpoHtml: c.publicoAlvo },
    { chave: "arquitetura", titulo: "Arquitetura da Solução", corpoHtml: montarArquitetura(d) },
    { chave: "modulos", titulo: "Módulos Contratados", corpoHtml: montarModulos(d) },
    { chave: "metodologia", titulo: "Metodologia", corpoHtml: c.metodologia },
    { chave: "docentes", titulo: "Corpo Docente e Curadoria", corpoHtml: montarDocentes(d) },
    { chave: "diferenciais", titulo: "Diferenciais NTC", corpoHtml: montarDiferenciais(d) },
    { chave: "resultados", titulo: "Resultados Esperados", corpoHtml: montarResultados(d) },
  ];
}
