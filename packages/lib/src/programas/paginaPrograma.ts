/**
 * Adaptador da página de programa: campos do CMS → `ConteudoPrograma`, o
 * objeto que `apps/web/app/(programas)/programas/[slug]/page.tsx` renderiza.
 *
 * Três origens para cada valor:
 * - **molde** (`molde.ts`): igual nos 15, só troca sigla/slug;
 * - **derivado**: calculado dos campos (estatísticas, títulos dos módulos,
 *   numeral romano, rótulo da vertente);
 * - **campo**: lido do programa, dos módulos ou do group `pagina`.
 *
 * Texto digitado no painel que vai para `dangerouslySetInnerHTML` passa por
 * `marcacaoParaHtml`/`escaparTexto` (só <strong>/<em> sobrevivem). Função
 * pura, sem I/O; a ida e volta com os 15 é testada no cms
 * (`paginaParaCampos.test.ts`).
 */

import { escaparTexto, marcacaoParaHtml } from "./marcacaoLeve";
import { MOLDE, ROTULO_VERTICAL, SIGLA_CSS_DA_VERTENTE, interpolarMolde } from "./molde";
import { paragrafosParaHtml, textoDoLexical } from "./paragrafos";
import { inteiroParaRomano } from "./romanos";
import type {
  CamposPaginaPrograma,
  CartaoModalidadePagina,
  ConteudoPrograma,
  DetalhamentoItem,
  ExtrasEventos,
  MetaItem,
  Modulo,
  ModuloPrograma,
  PaginaPrograma,
} from "./tipos";

/** `pagina` sem nada preenchido — programa novo, ou base para testes. */
export function paginaVazia(): PaginaPrograma {
  return {
    identidadeVisual: "vertente",
    heroTitulo: "",
    heroSubtitulo: "",
    heroImagem: "",
    barraDados: [],
    visaoGeralTitulo: "",
    problemaTitulo: "",
    problemaDestaque: "",
    publicoChips: [],
    docentes: {
      titulo: "",
      intro: "",
      coordenacaoMarcador: "",
      especialistasMarcador: "",
      contadores: [],
      nota: "",
      coordenacao: [],
      especialistas: [],
    },
    modalidadesIntro: "",
    modalidadesCards: [],
    modulosAbertosMicrocopy: "",
    chamadaFinalTitulo: "",
    chamadaFinalTexto: "",
    resumoLateral: [],
    entregas: [],
    cartao: { nome: "", tagline: "", meta: "", imagem: "", ordem: null },
  };
}

/** Texto visível de um HTML inline já escapado (o `titulo` ao lado do `tituloHtml`). */
function textoDoHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function tituloMolde(tituloHtml: string): { titulo: string; tituloHtml: string } {
  return { titulo: textoDoHtml(tituloHtml), tituloHtml };
}

function tituloDoPainel(marcacao: string): { titulo: string; tituloHtml: string } {
  return tituloMolde(marcacaoParaHtml(marcacao));
}

/** Escapa um valor de atributo HTML entre aspas duplas (o `&` das query strings fica como está). */
function escaparAtributo(valor: string): string {
  return valor.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** "64 horas" → "64h"; outro formato fica como veio. */
function cargaCurta(total: string): string {
  const m = /^(\d+)\s*horas?$/.exec(total.trim());
  return m ? `${m[1]}h` : total;
}

function horasDoModulo(carga: string): number | null {
  const m = /^(\d+)\s*h$/.exec(carga.trim());
  return m ? Number(m[1]) : null;
}

function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

function introDosModulos(sigla: string, modulos: ModuloPrograma[], cargaTotal: string): string | undefined {
  if (modulos.length === 0) return undefined;
  const horas = modulos.map((m) => horasDoModulo(m.cargaHoraria));
  const primeira = horas[0];
  const iguais = primeira !== null && primeira !== undefined && horas.every((h) => h === primeira);
  const sequenciais = modulos.length === 1 ? "sequencial" : "sequenciais";
  const cada = iguais ? ` de ${plural(primeira, "hora", "horas")} cada` : "";
  const total = cargaTotal.trim() ? `, totalizando ${cargaTotal.trim()} de formação executiva` : "";
  return (
    `O ${sigla} é composto por ${plural(modulos.length, "módulo", "módulos")} ${sequenciais}${cada}${total}. ` +
    "Pode ser contratado como trilha completa ou módulo a módulo."
  );
}

function siglaCssDe(c: CamposPaginaPrograma): string {
  const id = c.pagina.identidadeVisual;
  return !id || id === "vertente" ? SIGLA_CSS_DA_VERTENTE[c.vertical] : id;
}

function corpoResultados(resultados: string[]): string {
  if (resultados.length === 0) return "";
  const cartoes = resultados
    .map(
      (r, i) =>
        `  <div class="result-card"><span class="r-num">${String(i + 1).padStart(2, "0")}</span><p>${escaparTexto(r)}</p></div>\n`,
    )
    .join("");
  return `<div class="results-grid">\n${cartoes}</div>`;
}

function cartaoModalidade(c: CartaoModalidadePagina): string {
  return (
    `  <article class="mode-card-prog${c.destaque ? " featured" : ""}">\n` +
    `    <span class="tag">${escaparTexto(c.tag)}</span>\n` +
    `    <h4>${escaparTexto(c.titulo)}</h4>\n` +
    `    <p>${escaparTexto(c.descricao)}</p>\n` +
    `    <a class="cta" href="${escaparAtributo(c.ctaHref)}">${escaparTexto(c.ctaRotulo)}</a>\n` +
    "  </article>\n"
  );
}

function corpoModalidades(p: PaginaPrograma): string {
  const intro = p.modalidadesIntro ? `<p>${escaparTexto(p.modalidadesIntro)}</p>` : "";
  if (p.modalidadesCards.length === 0) return intro;
  return `${intro}\n<div class="modes-grid">\n${p.modalidadesCards.map(cartaoModalidade).join("")}</div>`;
}

export function camposParaPagina(c: CamposPaginaPrograma, extras: ExtrasEventos): ConteudoPrograma {
  const pg = c.pagina;
  const v = { sigla: c.sigla, slug: c.slug };
  const molde = (texto: string) => interpolarMolde(texto, v);
  const modulos = [...c.modulos].sort((a, b) => a.numero - b.numero);
  const qtdModulos = modulos.length;

  const itensModulos: Modulo[] = modulos.map((m) => {
    const status = extras.status.get(m.numero);
    return {
      numero: inteiroParaRomano(m.numero),
      titulo: m.titulo,
      descricao: textoDoLexical(m.descricao),
      ...(m.cargaHoraria ? { cargaHoraria: m.cargaHoraria } : {}),
      ...(status ? { statusRotulo: status.rotulo, statusTipo: status.tipo } : {}),
    };
  });

  const itensDetalhamento: DetalhamentoItem[] = modulos.map((m) => ({
    numero: inteiroParaRomano(m.numero),
    titulo: m.titulo,
    cargaHoraria: m.cargaHoraria,
    descricao: textoDoLexical(m.descricao),
    topicos: m.topicos,
    ...(extras.status.get(m.numero)?.tipo === "aberto" ? { ctaInscricao: true } : {}),
  }));

  const metaBar: MetaItem[] = pg.barraDados.map((b) => ({
    rotulo: b.rotulo,
    valor: b.valor,
    ...(b.valorSub ? { valorSub: b.valorSub } : {}),
  }));

  const { feature, miniStack } = extras.modulosAbertos;

  return {
    sigla: c.sigla,
    siglaCss: siglaCssDe(c),
    siglaExibida: c.sigla,
    slug: c.slug,
    nomeCompleto: c.nomeCompleto,
    vertical: c.vertical,
    verticalRotulo: ROTULO_VERTICAL[c.vertical],
    breadcrumb: { current: c.sigla },
    hero: {
      bgSrc: pg.heroImagem,
      eyebrow: MOLDE.hero.eyebrow,
      stats: [String(qtdModulos), cargaCurta(c.cargaHorariaTotal), String(c.eixos.length)].map((num, i) => ({
        num,
        lbl: MOLDE.hero.statsLbl[i] as string,
      })),
      tituloHtml: marcacaoParaHtml(pg.heroTitulo),
      sub: pg.heroSubtitulo,
      ctas: MOLDE.hero.ctas.map((cta) => ({ rotulo: cta.rotulo, href: molde(cta.href), variante: cta.variante })),
    },
    metaBar,
    navAnchors: MOLDE.navAnchors.map((a) => ({ ...a })),
    visaoGeral: {
      eyebrow: MOLDE.visaoGeral.eyebrow,
      ...tituloDoPainel(pg.visaoGeralTitulo),
      corpoHtml: paragrafosParaHtml(c.visaoGeral, { classePrimeiro: "lede-block", separador: "\n" }),
    },
    problema: {
      eyebrow: MOLDE.problema.eyebrow,
      ...tituloDoPainel(pg.problemaTitulo),
      corpoHtml: paragrafosParaHtml(c.problema, { separador: "\n" }),
      ...(pg.problemaDestaque ? { destaqueHtml: marcacaoParaHtml(pg.problemaDestaque) } : {}),
    },
    ...(c.objetivo !== null && c.objetivo !== undefined
      ? {
          objetivoGeral: {
            eyebrow: MOLDE.objetivoGeral.eyebrow,
            ...tituloMolde(MOLDE.objetivoGeral.tituloHtml),
            corpoHtml: paragrafosParaHtml(c.objetivo, { classePrimeiro: "lede-block", separador: "\n" }),
          },
        }
      : {}),
    publico: {
      eyebrow: MOLDE.publico.eyebrow,
      titulo: MOLDE.publico.titulo,
      corpoHtml: paragrafosParaHtml(c.publicoAlvo, { separador: "\n" }),
      ...(pg.publicoChips.length > 0 ? { chips: [...pg.publicoChips] } : {}),
    },
    eixos: {
      eyebrow: MOLDE.eixos.eyebrow,
      ...tituloMolde(MOLDE.eixos.tituloHtml),
      itens: c.eixos.map((e) => ({ titulo: e.titulo, descricao: e.descricao })),
    },
    modulos: {
      eyebrow: MOLDE.modulos.eyebrow,
      ...tituloMolde(`Estrutura modular · <em>${plural(qtdModulos, "módulo", "módulos")}</em>`),
      ...(() => {
        const intro = introDosModulos(c.sigla, modulos, c.cargaHorariaTotal);
        return intro ? { intro } : {};
      })(),
      itens: itensModulos,
    },
    ...(qtdModulos > 0
      ? {
          detalhamento: {
            eyebrow: MOLDE.detalhamento.eyebrow,
            titulo: MOLDE.detalhamento.titulo,
            intro: MOLDE.detalhamento.intro,
            itens: itensDetalhamento,
          },
        }
      : {}),
    resultados: {
      eyebrow: MOLDE.resultados.eyebrow,
      ...tituloMolde(molde(MOLDE.resultados.tituloHtml)),
      corpoHtml: corpoResultados(c.resultados),
    },
    ...(c.diferenciais.length > 0
      ? {
          diferenciais: {
            eyebrow: MOLDE.diferenciais.eyebrow,
            ...tituloMolde(molde(MOLDE.diferenciais.tituloHtml)),
            itens: c.diferenciais.map((d) => ({ titulo: d.titulo, descricao: d.descricao })),
          },
        }
      : {}),
    docentes: {
      eyebrow: MOLDE.docentes.eyebrow,
      ...tituloDoPainel(pg.docentes.titulo),
      pill: MOLDE.docentes.pill,
      introHtml: pg.docentes.intro ? `<p class="faculty-prime-intro">${marcacaoParaHtml(pg.docentes.intro)}</p>` : "",
      coordenacaoMarker: pg.docentes.coordenacaoMarcador,
      coordenacao: pg.docentes.coordenacao.map((d) => ({
        tag: d.tag,
        imgSrc: d.imgSrc,
        imgAlt: d.imgAlt,
        axisBadge: d.eixoBadge,
        nome: d.nome,
        credencial: d.credencial,
        eixo: d.eixo,
        modulos: d.modulos,
      })),
      especialistasMarker: pg.docentes.especialistasMarcador,
      especialistas: pg.docentes.especialistas.map((d) => ({
        imgSrc: d.imgSrc,
        imgAlt: d.imgAlt,
        axisBadge: d.eixoBadge,
        nome: d.nome,
        credencial: d.credencial,
        modulos: d.modulos,
      })),
      counters: pg.docentes.contadores.map((k) => ({ num: k.num, lbl: k.lbl })),
      nota: pg.docentes.nota,
      ctaPrimario: MOLDE.docentes.ctaPrimario,
      ctaSecundario: molde(MOLDE.docentes.ctaSecundario),
    },
    modalidades: {
      eyebrow: MOLDE.modalidades.eyebrow,
      ...tituloMolde(MOLDE.modalidades.tituloHtml),
      corpoHtml: corpoModalidades(pg),
    },
    modulosAbertos: {
      eyebrow: MOLDE.modulosAbertos.eyebrow,
      ...tituloMolde(molde(MOLDE.modulosAbertos.tituloHtml)),
      corpoHtml: MOLDE.modulosAbertos.corpoHtml,
      ...(feature ? { feature: { ...feature, ...MOLDE.modulosAbertos.feature } } : {}),
      ...(miniStack ? { miniStack: miniStack.map((m) => ({ ...m, ctaRotulo: MOLDE.modulosAbertos.miniCtaRotulo })) } : {}),
      microcopy: pg.modulosAbertosMicrocopy,
      bottomCtas: MOLDE.modulosAbertos.bottomCtas.map((b) => ({
        rotulo: molde(b.rotulo),
        href: molde(b.href),
        primario: b.primario,
      })),
    },
    faq: {
      eyebrow: MOLDE.faq.eyebrow,
      titulo: MOLDE.faq.titulo,
      itens: c.faq.map((f) => ({ pergunta: f.pergunta, resposta: textoDoLexical(f.resposta) })),
    },
    ...(pg.chamadaFinalTitulo || pg.chamadaFinalTexto
      ? {
          ctaFinal: {
            eyebrow: MOLDE.ctaFinal.eyebrow,
            tituloHtml: marcacaoParaHtml(pg.chamadaFinalTitulo),
            corpo: pg.chamadaFinalTexto,
          },
        }
      : {}),
    ...(pg.resumoLateral.length > 0 || pg.entregas.length > 0
      ? {
          sidebar: {
            titulo: MOLDE.sidebar.titulo,
            rows: pg.resumoLateral.map((r) => ({ rotulo: r.rotulo, valor: r.valor })),
            entregasTitulo: MOLDE.sidebar.entregasTitulo,
            entregas: [...pg.entregas],
          },
        }
      : {}),
  };
}
