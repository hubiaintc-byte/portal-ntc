/**
 * Planejador da carga das páginas dos 15 programas no CMS (Task 6 do plano
 * de 05/11/2026). Função pura: recebe o que o CMS guarda hoje e a página
 * estática (`conteudo<SIGLA>.ts`, via o instantâneo), e devolve o que
 * gravar. Quem lê e grava no banco é `seed/carregarPaginasProgramas.ts`.
 *
 * Regra de cada campo (vale para os que já existem desde 30/09 e para os
 * novos da aba "Página do site"):
 * - igual nos dois lados → nada a gravar;
 * - vazio no CMS → grava o da página estática;
 * - preenchido e diferente → **divergência**: o campo não é gravado (pode
 *   ser edição feita no painel depois de 30/09) e vai para o relatório.
 *
 * Três campos o import de 30/09 guardou juntos e a página mostra
 * separados: `problema` (corpo + destaque), `publicoAlvo` (parágrafo +
 * chips) e `modulos.ementa` (descrição + tópicos). A comparação desses é
 * feita sobre o documento **composto** (`comporTextos.ts`) dos dois lados,
 * e a divisão grava o documento e a sua parte **na mesma escrita** — senão
 * a proposta, que compõe os dois, duplicaria o conteúdo.
 *
 * Imagens dos 15 vão pelos campos de caminho (`heroImagemCaminho`,
 * `imagemCaminho`); nenhuma `media` é enviada. `pagina.cartao` vem do
 * terceiro argumento (o cartão do instantâneo); sem ele, nada do cartão é
 * gravado.
 */

import { lexicalParaHtmlEditorial } from "@ntc/lib";
import type { ConteudoPrograma, PaginaPrograma } from "@ntc/lib";

import { comporEmenta, comporProblema, comporPublicoAlvo, textosDeLista } from "./comporTextos";
import { paginaParaCampos } from "./paginaParaCampos";

export interface ModuloAtual {
  id: number | string;
  numero: number;
  titulo?: string | null;
  cargaHoraria?: string | null;
  ementa: unknown;
  topicos?: { texto?: string | null }[] | null;
}

/** Programa como o CMS o devolve (Local API, `depth: 0`), mais os seus módulos. */
export interface ProgramaAtual {
  id: number | string;
  sigla: string;
  slug?: string | null;
  nomeCompleto?: string | null;
  cargaHorariaTotal?: string | null;
  _status?: string | null;
  visaoGeral: unknown;
  problema: unknown;
  objetivo: unknown;
  publicoAlvo: unknown;
  eixosTematicos?: { titulo?: string | null; descricao?: string | null }[] | null;
  resultadosEsperados?: { resultado?: string | null }[] | null;
  diferenciais?: { titulo?: string | null; descricao?: string | null }[] | null;
  faq?: { pergunta?: string | null; resposta?: unknown }[] | null;
  pagina?: Record<string, unknown> | null;
  modulos: ModuloAtual[];
  /** A última versão (rascunho) difere da publicada: nada é gravado. */
  rascunhoPendente?: boolean;
}

export interface EscritaModulo {
  id: number | string;
  numero: number;
  data: Record<string, unknown>;
}

export interface PlanoCargaPagina {
  sigla: string;
  acao: "atualizar" | "divergente" | "sem-programa";
  divergencias: string[];
  avisos: string[];
  dados: {
    /** `data` do `payload.update` do programa, ou `null` se nada muda. */
    programa: Record<string, unknown> | null;
    modulos: EscritaModulo[];
  };
  semMudancas: boolean;
}

const RASCUNHO = "rascunho não publicado";

function ehObjeto(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Forma comparável: sem `id` das linhas de array e sem valores vazios
 * (`null`, `""`, `false`, lista/grupo vazios), com as chaves em ordem — o
 * que volta do Payload depois de gravar compara igual ao que foi enviado.
 */
function normalizar(v: unknown): unknown {
  if (v === null || v === undefined || v === "" || v === false) return undefined;
  if (Array.isArray(v)) {
    const itens = v.map((i) => normalizar(i) ?? null);
    return itens.length === 0 ? undefined : itens;
  }
  if (ehObjeto(v)) {
    const saida: Record<string, unknown> = {};
    for (const chave of Object.keys(v).sort()) {
      if (chave === "id") continue;
      const valor = normalizar(v[chave]);
      if (valor !== undefined) saida[chave] = valor;
    }
    return Object.keys(saida).length === 0 ? undefined : saida;
  }
  return v;
}

function chave(v: unknown): string {
  return JSON.stringify(normalizar(v) ?? null);
}

const html = (doc: unknown): string => lexicalParaHtmlEditorial(doc);

type Decisao = "igual" | "escrever" | "divergente";

/** Compara as formas já prontas para comparar (`""`/`null` = vazio). */
function decidir(atual: string, alvo: string, vazio: string): Decisao {
  if (atual === alvo) return "igual";
  if (atual === vazio) return "escrever";
  return "divergente";
}

const VAZIO_CHAVE = "null";

/** `PaginaPrograma` (URLs e listas achatadas) → forma do group `pagina` do Payload. */
function paginaParaPayload(p: PaginaPrograma): Record<string, unknown> {
  return {
    identidadeVisual: p.identidadeVisual,
    heroTitulo: p.heroTitulo,
    heroSubtitulo: p.heroSubtitulo,
    heroImagemCaminho: p.heroImagem,
    barraDados: p.barraDados.map((b) => ({
      rotulo: b.rotulo,
      valor: b.valor,
      valorSub: b.valorSub,
    })),
    visaoGeralTitulo: p.visaoGeralTitulo,
    problemaTitulo: p.problemaTitulo,
    problemaDestaque: p.problemaDestaque,
    publicoChips: p.publicoChips.map((texto) => ({ texto })),
    docentes: {
      titulo: p.docentes.titulo,
      intro: p.docentes.intro,
      coordenacaoMarcador: p.docentes.coordenacaoMarcador,
      especialistasMarcador: p.docentes.especialistasMarcador,
      contadores: p.docentes.contadores.map((k) => ({ num: k.num, lbl: k.lbl })),
      nota: p.docentes.nota,
      coordenacao: p.docentes.coordenacao.map((d) => ({
        tag: d.tag,
        imagemCaminho: d.imgSrc,
        imagemAlt: d.imgAlt,
        eixoBadge: d.eixoBadge,
        nome: d.nome,
        credencial: d.credencial,
        eixo: d.eixo,
        modulos: d.modulos,
      })),
      especialistas: p.docentes.especialistas.map((d) => ({
        imagemCaminho: d.imgSrc,
        imagemAlt: d.imgAlt,
        eixoBadge: d.eixoBadge,
        nome: d.nome,
        credencial: d.credencial,
        modulos: d.modulos,
      })),
    },
    modalidadesIntro: p.modalidadesIntro,
    modalidadesCards: p.modalidadesCards.map((c) => ({
      destaque: c.destaque,
      tag: c.tag,
      titulo: c.titulo,
      descricao: c.descricao,
      ctaRotulo: c.ctaRotulo,
      ctaHref: c.ctaHref,
    })),
    modulosAbertosMicrocopy: p.modulosAbertosMicrocopy,
    chamadaFinalTitulo: p.chamadaFinalTitulo,
    chamadaFinalTexto: p.chamadaFinalTexto,
    resumoLateral: p.resumoLateral.map((r) => ({ rotulo: r.rotulo, valor: r.valor })),
    entregas: p.entregas.map((texto) => ({ texto })),
    cartao: {
      nome: p.cartao.nome,
      tagline: p.cartao.tagline,
      meta: p.cartao.meta,
      imagemCaminho: p.cartao.imagem,
      ordem: p.cartao.ordem,
      descricaoMenu: p.cartao.descricaoMenu,
      descricaoMapa: p.cartao.descricaoMapa,
    },
  };
}

/** Grupos dentro de `pagina` comparados campo a campo. */
const SUBGRUPOS = new Set(["docentes", "cartao"]);
/** Partes que só são gravadas junto com o seu documento (ver o cabeçalho). */
const PARTES = new Set(["problemaDestaque", "publicoChips"]);

function planoVazio(
  sigla: string,
  acao: PlanoCargaPagina["acao"],
  divergencias: string[],
): PlanoCargaPagina {
  return {
    sigla,
    acao,
    divergencias,
    avisos: [],
    dados: { programa: null, modulos: [] },
    semMudancas: true,
  };
}

export function planejarCargaPaginas(
  atual: ProgramaAtual | null,
  estatico: ConteudoPrograma,
  cartao?: PaginaPrograma["cartao"],
): PlanoCargaPagina {
  const sigla = estatico.sigla;
  if (!atual || atual.sigla.toUpperCase() !== sigla.toUpperCase())
    return planoVazio(sigla, "sem-programa", []);
  if (atual.rascunhoPendente) return planoVazio(sigla, "divergente", [RASCUNHO]);

  const { campos, avisos } = paginaParaCampos(estatico, cartao);
  const divergencias: string[] = [];
  const escrita: Record<string, unknown> = {};
  const paginaAtual = atual.pagina ?? {};
  const paginaEscrita: Record<string, unknown> = {};

  const campoSimples = (
    caminho: string,
    valorAtual: unknown,
    valorAlvo: unknown,
    gravar: () => void,
  ) => {
    const d = decidir(chave(valorAtual), chave(valorAlvo), VAZIO_CHAVE);
    if (d === "escrever") gravar();
    else if (d === "divergente") divergencias.push(caminho);
  };
  const campoLexical = (nome: "visaoGeral" | "objetivo", alvo: unknown) => {
    const d = decidir(html(atual[nome]), html(alvo), "");
    if (d === "escrever") escrita[nome] = alvo;
    else if (d === "divergente") divergencias.push(nome);
  };

  // Identidade do programa (endereço e nome completo): o CMS é a fonte oficial
  // (decisão do PO, 12/11). Só preenche se vazio; valor diferente fica como
  // está no CMS e não conta como divergência.
  const identidade = [
    ["slug", atual.slug, campos.slug],
    ["nomeCompleto", atual.nomeCompleto, campos.nomeCompleto],
  ] as const;
  for (const [nome, a, b] of identidade) {
    if (decidir(chave(a), chave(b), VAZIO_CHAVE) === "escrever") escrita[nome] = b;
  }

  // Carga horária: só preenche se vazio; diferença é relatada.
  const textos = [
    [
      "cargaHorariaTotal",
      atual.cargaHorariaTotal === "A definir" ? null : atual.cargaHorariaTotal,
      campos.cargaHorariaTotal,
    ],
  ] as const;
  for (const [nome, a, b] of textos) campoSimples(nome, a, b, () => (escrita[nome] = b));

  campoLexical("visaoGeral", campos.visaoGeral);
  campoLexical("objetivo", campos.objetivo);

  // Documento dividido + parte: comparados compostos, gravados juntos.
  const destaqueAtual =
    typeof paginaAtual.problemaDestaque === "string" ? paginaAtual.problemaDestaque : "";
  const dProblema = decidir(
    html(comporProblema(atual.problema, destaqueAtual)),
    html(comporProblema(campos.problema, campos.pagina.problemaDestaque)),
    "",
  );
  if (dProblema === "divergente") divergencias.push("problema");
  else if (
    html(atual.problema) !== html(campos.problema) ||
    chave(destaqueAtual) !== chave(campos.pagina.problemaDestaque)
  ) {
    escrita.problema = campos.problema;
    paginaEscrita.problemaDestaque = campos.pagina.problemaDestaque;
  }

  const chipsAtuais = textosDeLista(
    paginaAtual.publicoChips as { texto?: string | null }[] | null | undefined,
  );
  const dPublico = decidir(
    html(comporPublicoAlvo(atual.publicoAlvo, chipsAtuais)),
    html(comporPublicoAlvo(campos.publicoAlvo, campos.pagina.publicoChips)),
    "",
  );
  if (dPublico === "divergente") divergencias.push("publicoAlvo");
  else if (
    html(atual.publicoAlvo) !== html(campos.publicoAlvo) ||
    chave(chipsAtuais) !== chave(campos.pagina.publicoChips)
  ) {
    escrita.publicoAlvo = campos.publicoAlvo;
    paginaEscrita.publicoChips = campos.pagina.publicoChips.map((texto) => ({ texto }));
  }

  // Listas que já existem desde 30/09.
  const eixos = campos.eixos.map((e) => ({ titulo: e.titulo, descricao: e.descricao }));
  campoSimples(
    "eixosTematicos",
    atual.eixosTematicos,
    eixos,
    () => (escrita.eixosTematicos = eixos),
  );
  const resultados = campos.resultados.map((resultado) => ({ resultado }));
  campoSimples(
    "resultadosEsperados",
    atual.resultadosEsperados,
    resultados,
    () => (escrita.resultadosEsperados = resultados),
  );
  const diferenciais = campos.diferenciais.map((d) => ({
    titulo: d.titulo,
    descricao: d.descricao,
  }));
  campoSimples(
    "diferenciais",
    atual.diferenciais,
    diferenciais,
    () => (escrita.diferenciais = diferenciais),
  );
  const faqComparavel = (
    lista: { pergunta?: string | null; resposta?: unknown }[] | null | undefined,
  ) => (lista ?? []).map((f) => ({ pergunta: f.pergunta, resposta: html(f.resposta) }));
  campoSimples(
    "faq",
    faqComparavel(atual.faq),
    faqComparavel(campos.faq),
    () => (escrita.faq = campos.faq),
  );

  // Aba "Página do site".
  const paginaAlvo = paginaParaPayload(campos.pagina);
  for (const [nome, alvo] of Object.entries(paginaAlvo)) {
    if (PARTES.has(nome)) continue;
    if (SUBGRUPOS.has(nome) && ehObjeto(alvo)) {
      const grupoAtual = ehObjeto(paginaAtual[nome])
        ? (paginaAtual[nome] as Record<string, unknown>)
        : {};
      const grupoEscrita: Record<string, unknown> = {};
      for (const [sub, alvoSub] of Object.entries(alvo)) {
        campoSimples(
          `pagina.${nome}.${sub}`,
          grupoAtual[sub],
          alvoSub,
          () => (grupoEscrita[sub] = alvoSub),
        );
      }
      if (Object.keys(grupoEscrita).length > 0) paginaEscrita[nome] = grupoEscrita;
      continue;
    }
    // O default do select é "vertente": para a carga, conta como vazio.
    const valorAtual =
      nome === "identidadeVisual" && paginaAtual[nome] === "vertente" ? null : paginaAtual[nome];
    campoSimples(`pagina.${nome}`, valorAtual, alvo, () => (paginaEscrita[nome] = alvo));
  }
  if (Object.keys(paginaEscrita).length > 0) escrita.pagina = paginaEscrita;

  // Módulos: casados por número; nunca criados.
  const escritasModulos: EscritaModulo[] = [];
  const atuaisPorNumero = new Map(atual.modulos.map((m) => [m.numero, m]));
  const numerosEstaticos = new Set(campos.modulos.map((m) => m.numero));
  for (const m of campos.modulos) {
    const mAtual = atuaisPorNumero.get(m.numero);
    if (!mAtual) {
      divergencias.push(`modulos[${m.numero}]`);
      continue;
    }
    const data: Record<string, unknown> = {};
    campoSimples(
      `modulos[${m.numero}].titulo`,
      mAtual.titulo,
      m.titulo,
      () => (data.titulo = m.titulo),
    );
    campoSimples(
      `modulos[${m.numero}].cargaHoraria`,
      mAtual.cargaHoraria,
      m.cargaHoraria,
      () => (data.cargaHoraria = m.cargaHoraria),
    );
    const topicosAtuais = textosDeLista(mAtual.topicos);
    const dEmenta = decidir(
      html(comporEmenta(mAtual.ementa, topicosAtuais)),
      html(comporEmenta(m.descricao, m.topicos)),
      "",
    );
    if (dEmenta === "divergente") divergencias.push(`modulos[${m.numero}].ementa`);
    else if (
      html(mAtual.ementa) !== html(m.descricao) ||
      chave(topicosAtuais) !== chave(m.topicos)
    ) {
      data.ementa = m.descricao;
      data.topicos = m.topicos.map((texto) => ({ texto }));
    }
    if (Object.keys(data).length > 0)
      escritasModulos.push({ id: mAtual.id, numero: m.numero, data });
  }
  const avisosPlano = [...avisos];
  for (const m of atual.modulos) {
    if (!numerosEstaticos.has(m.numero))
      avisosPlano.push(`modulos[${m.numero}]: só no CMS, não tocado`);
  }

  const programa =
    Object.keys(escrita).length > 0 || atual._status !== "published"
      ? { ...escrita, _status: "published" }
      : null;

  return {
    sigla,
    acao: divergencias.length > 0 ? "divergente" : "atualizar",
    divergencias,
    avisos: avisosPlano,
    dados: { programa, modulos: escritasModulos },
    semMudancas: programa === null && escritasModulos.length === 0,
  };
}

/**
 * Compara a versão publicada com a última versão (rascunho) nos campos que a
 * carga lê. Diferença = há edição não publicada no painel, e a carga, que
 * publica, a publicaria junto.
 */
export function temRascunhoPendente(publicado: unknown, ultimaVersao: unknown): boolean {
  const comparavel = (doc: unknown) => {
    if (!ehObjeto(doc)) return null;
    const resto = { ...doc };
    for (const ignorado of ["updatedAt", "createdAt", "_status"]) delete resto[ignorado];
    return chave(resto);
  };
  return comparavel(publicado) !== comparavel(ultimaVersao);
}
