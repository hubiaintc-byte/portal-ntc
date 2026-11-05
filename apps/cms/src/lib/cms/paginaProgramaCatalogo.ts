/**
 * Bloco "Página do site" do programa no Catálogo do painel: o group
 * `programas.pagina` em forma de formulário (tudo string, listas sem `id`
 * de linha) e de volta. Regras puras — sem `server-only`, a tela usa
 * `paginaVazia` e os tipos.
 *
 * Imagens: o painel edita o caminho (`/img/…`); uma imagem enviada (media)
 * já vinculada é preservada pelo id e vence o caminho no site.
 */

import { ctaHrefPermitido, type PaginaParaPublicar } from "@ntc/lib";
import type { Programa } from "@ntc/types";

export interface LinhaBarraDados {
  rotulo: string;
  valor: string;
  valorSub: string;
}

export interface LinhaTexto {
  texto: string;
}

export interface LinhaContador {
  num: string;
  lbl: string;
}

export interface LinhaCoordenacao {
  /** Id da linha no array gravado ("" em linha nova) — o envio de imagem acha a linha por ele. */
  linhaId: string;
  tag: string;
  /** Id da media enviada, "" se não há. Preservado, não editado na tela. */
  imagemId: string;
  imagemCaminho: string;
  imagemAlt: string;
  eixoBadge: string;
  nome: string;
  credencial: string;
  eixo: string;
  modulos: string;
}

export type LinhaEspecialista = Omit<LinhaCoordenacao, "tag" | "eixo">;

export interface LinhaModalidade {
  destaque: boolean;
  tag: string;
  titulo: string;
  descricao: string;
  ctaRotulo: string;
  ctaHref: string;
}

export interface LinhaResumo {
  rotulo: string;
  valor: string;
}

export interface PaginaProgramaEdicao {
  identidadeVisual: string;
  heroTitulo: string;
  heroSubtitulo: string;
  /** Id da media do topo, "" se não há. */
  heroImagemId: string;
  heroImagemCaminho: string;
  barraDados: LinhaBarraDados[];
  visaoGeralTitulo: string;
  problemaTitulo: string;
  problemaDestaque: string;
  publicoChips: LinhaTexto[];
  docentes: {
    titulo: string;
    intro: string;
    coordenacaoMarcador: string;
    especialistasMarcador: string;
    contadores: LinhaContador[];
    nota: string;
    coordenacao: LinhaCoordenacao[];
    especialistas: LinhaEspecialista[];
  };
  modalidadesIntro: string;
  modalidadesCards: LinhaModalidade[];
  modulosAbertosMicrocopy: string;
  chamadaFinalTitulo: string;
  chamadaFinalTexto: string;
  resumoLateral: LinhaResumo[];
  entregas: LinhaTexto[];
  cartao: {
    nome: string;
    tagline: string;
    meta: string;
    imagemId: string;
    imagemCaminho: string;
    /** Número inteiro em texto; "" = sem ordem. */
    ordem: string;
    descricaoMenu: string;
    descricaoMapa: string;
  };
}

/** Identidades visuais da página — fonte única: o select `pagina.identidadeVisual` do schema lê daqui. */
export const IDENTIDADES_VISUAIS = [
  "vertente",
  "AGIP",
  "EDUTEC",
  "EGIDE",
  "FUTURA",
  "LIDERA",
  "PEAR",
  "PEI",
  "PINEI",
  "PROAPS",
  "PROGE",
  "PROGIR",
  "PROSUS",
  "SIGA",
  "SIGS",
  "VIVAESCOLA",
] as const;

export function paginaVazia(): PaginaProgramaEdicao {
  return {
    identidadeVisual: "vertente",
    heroTitulo: "",
    heroSubtitulo: "",
    heroImagemId: "",
    heroImagemCaminho: "",
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
    cartao: {
      nome: "",
      tagline: "",
      meta: "",
      imagemId: "",
      imagemCaminho: "",
      ordem: "",
      descricaoMenu: "",
      descricaoMapa: "",
    },
  };
}

const txt = (v: string | null | undefined): string => v ?? "";

function idMidia(v: unknown): string {
  if (typeof v === "number" || typeof v === "string") return String(v);
  if (v && typeof v === "object" && "id" in v) return String((v as { id: unknown }).id);
  return "";
}

/** Group gravado (depth 0 ou populado) → formulário. */
export function paginaDoDocumento(pg: Programa["pagina"] | null | undefined): PaginaProgramaEdicao {
  const vazia = paginaVazia();
  if (!pg) return vazia;
  const d = pg.docentes ?? {};
  const c = pg.cartao ?? {};
  return {
    identidadeVisual: pg.identidadeVisual ?? vazia.identidadeVisual,
    heroTitulo: txt(pg.heroTitulo),
    heroSubtitulo: txt(pg.heroSubtitulo),
    heroImagemId: idMidia(pg.heroImagem),
    heroImagemCaminho: txt(pg.heroImagemCaminho),
    barraDados: (pg.barraDados ?? []).map((b) => ({ rotulo: txt(b.rotulo), valor: txt(b.valor), valorSub: txt(b.valorSub) })),
    visaoGeralTitulo: txt(pg.visaoGeralTitulo),
    problemaTitulo: txt(pg.problemaTitulo),
    problemaDestaque: txt(pg.problemaDestaque),
    publicoChips: (pg.publicoChips ?? []).map((x) => ({ texto: txt(x.texto) })),
    docentes: {
      titulo: txt(d.titulo),
      intro: txt(d.intro),
      coordenacaoMarcador: txt(d.coordenacaoMarcador),
      especialistasMarcador: txt(d.especialistasMarcador),
      contadores: (d.contadores ?? []).map((k) => ({ num: txt(k.num), lbl: txt(k.lbl) })),
      nota: txt(d.nota),
      coordenacao: (d.coordenacao ?? []).map((x) => ({
        linhaId: txt(x.id),
        tag: txt(x.tag),
        imagemId: idMidia(x.imagem),
        imagemCaminho: txt(x.imagemCaminho),
        imagemAlt: txt(x.imagemAlt),
        eixoBadge: txt(x.eixoBadge),
        nome: txt(x.nome),
        credencial: txt(x.credencial),
        eixo: txt(x.eixo),
        modulos: txt(x.modulos),
      })),
      especialistas: (d.especialistas ?? []).map((x) => ({
        linhaId: txt(x.id),
        imagemId: idMidia(x.imagem),
        imagemCaminho: txt(x.imagemCaminho),
        imagemAlt: txt(x.imagemAlt),
        eixoBadge: txt(x.eixoBadge),
        nome: txt(x.nome),
        credencial: txt(x.credencial),
        modulos: txt(x.modulos),
      })),
    },
    modalidadesIntro: txt(pg.modalidadesIntro),
    modalidadesCards: (pg.modalidadesCards ?? []).map((m) => ({
      destaque: m.destaque === true,
      tag: txt(m.tag),
      titulo: txt(m.titulo),
      descricao: txt(m.descricao),
      ctaRotulo: txt(m.ctaRotulo),
      ctaHref: txt(m.ctaHref),
    })),
    modulosAbertosMicrocopy: txt(pg.modulosAbertosMicrocopy),
    chamadaFinalTitulo: txt(pg.chamadaFinalTitulo),
    chamadaFinalTexto: txt(pg.chamadaFinalTexto),
    resumoLateral: (pg.resumoLateral ?? []).map((r) => ({ rotulo: txt(r.rotulo), valor: txt(r.valor) })),
    entregas: (pg.entregas ?? []).map((x) => ({ texto: txt(x.texto) })),
    cartao: {
      nome: txt(c.nome),
      tagline: txt(c.tagline),
      meta: txt(c.meta),
      imagemId: idMidia(c.imagem),
      imagemCaminho: txt(c.imagemCaminho),
      ordem: c.ordem === null || c.ordem === undefined ? "" : String(c.ordem),
      descricaoMenu: txt(c.descricaoMenu),
      descricaoMapa: txt(c.descricaoMapa),
    },
  };
}

const ouNulo = (v: string): string | null => (v.trim() === "" ? null : v.trim());
const midiaOuNula = (id: string): number | null => (/^\d+$/.test(id.trim()) ? Number(id.trim()) : null);
const ORDEM = /^\d+$/;

/** Linha em que todo campo de texto está em branco não é dado (o id da linha não conta). */
function semLinhasVazias<T extends object>(linhas: readonly T[]): T[] {
  return linhas.filter((l) =>
    Object.entries(l).some(([k, v]) => k !== "linhaId" && typeof v === "string" && v.trim() !== ""),
  );
}

/** Mantém o id da linha do array entre salvamentos (o envio de imagem do docente depende dele). */
const idDaLinha = (linhaId: string): { id?: string } => (linhaId === "" ? {} : { id: linhaId });

/** Formulário → group `pagina` do Payload (o group inteiro, para um `update`). */
export function paginaParaGravar(e: PaginaProgramaEdicao): Record<string, unknown> {
  const ordem = e.cartao.ordem.trim();
  return {
    identidadeVisual: (IDENTIDADES_VISUAIS as readonly string[]).includes(e.identidadeVisual)
      ? e.identidadeVisual
      : "vertente",
    heroTitulo: ouNulo(e.heroTitulo),
    heroSubtitulo: ouNulo(e.heroSubtitulo),
    heroImagem: midiaOuNula(e.heroImagemId),
    heroImagemCaminho: ouNulo(e.heroImagemCaminho),
    barraDados: semLinhasVazias(e.barraDados).map((b) => ({
      rotulo: ouNulo(b.rotulo),
      valor: ouNulo(b.valor),
      valorSub: ouNulo(b.valorSub),
    })),
    visaoGeralTitulo: ouNulo(e.visaoGeralTitulo),
    problemaTitulo: ouNulo(e.problemaTitulo),
    problemaDestaque: ouNulo(e.problemaDestaque),
    publicoChips: semLinhasVazias(e.publicoChips).map((x) => ({ texto: x.texto.trim() })),
    docentes: {
      titulo: ouNulo(e.docentes.titulo),
      intro: ouNulo(e.docentes.intro),
      coordenacaoMarcador: ouNulo(e.docentes.coordenacaoMarcador),
      especialistasMarcador: ouNulo(e.docentes.especialistasMarcador),
      contadores: semLinhasVazias(e.docentes.contadores).map((k) => ({ num: ouNulo(k.num), lbl: ouNulo(k.lbl) })),
      nota: ouNulo(e.docentes.nota),
      coordenacao: semLinhasVazias(e.docentes.coordenacao).map((x) => ({
        ...idDaLinha(x.linhaId),
        tag: ouNulo(x.tag),
        imagem: midiaOuNula(x.imagemId),
        imagemCaminho: ouNulo(x.imagemCaminho),
        imagemAlt: ouNulo(x.imagemAlt),
        eixoBadge: ouNulo(x.eixoBadge),
        nome: ouNulo(x.nome),
        credencial: ouNulo(x.credencial),
        eixo: ouNulo(x.eixo),
        modulos: ouNulo(x.modulos),
      })),
      especialistas: semLinhasVazias(e.docentes.especialistas).map((x) => ({
        ...idDaLinha(x.linhaId),
        imagem: midiaOuNula(x.imagemId),
        imagemCaminho: ouNulo(x.imagemCaminho),
        imagemAlt: ouNulo(x.imagemAlt),
        eixoBadge: ouNulo(x.eixoBadge),
        nome: ouNulo(x.nome),
        credencial: ouNulo(x.credencial),
        modulos: ouNulo(x.modulos),
      })),
    },
    modalidadesIntro: ouNulo(e.modalidadesIntro),
    modalidadesCards: semLinhasVazias(e.modalidadesCards).map((m) => ({
      destaque: m.destaque,
      tag: ouNulo(m.tag),
      titulo: ouNulo(m.titulo),
      descricao: ouNulo(m.descricao),
      ctaRotulo: ouNulo(m.ctaRotulo),
      ctaHref: ouNulo(m.ctaHref),
    })),
    modulosAbertosMicrocopy: ouNulo(e.modulosAbertosMicrocopy),
    chamadaFinalTitulo: ouNulo(e.chamadaFinalTitulo),
    chamadaFinalTexto: ouNulo(e.chamadaFinalTexto),
    resumoLateral: semLinhasVazias(e.resumoLateral).map((r) => ({ rotulo: ouNulo(r.rotulo), valor: ouNulo(r.valor) })),
    entregas: semLinhasVazias(e.entregas).map((x) => ({ texto: x.texto.trim() })),
    cartao: {
      nome: ouNulo(e.cartao.nome),
      tagline: ouNulo(e.cartao.tagline),
      meta: ouNulo(e.cartao.meta),
      imagem: midiaOuNula(e.cartao.imagemId),
      imagemCaminho: ouNulo(e.cartao.imagemCaminho),
      ordem: ORDEM.test(ordem) ? Number(ordem) : null,
      descricaoMenu: ouNulo(e.cartao.descricaoMenu),
      descricaoMapa: ouNulo(e.cartao.descricaoMapa),
    },
  };
}

/**
 * Caminho de imagem servido pelo próprio site: começa com uma barra só e só
 * tem letras, números, `/`, `_`, `.` e `-` (nada de aspas, parênteses ou
 * espaço — o caminho também vai para `url()` no CSS da página).
 */
const CAMINHO_IMAGEM = /^\/[A-Za-z0-9/_.-]+$/;
const caminhoValido = (c: string): boolean => {
  const t = c.trim();
  return t === "" || (CAMINHO_IMAGEM.test(t) && !t.startsWith("//"));
};

const MSG_CAMINHO = "o caminho deve começar com / e ter só letras, números, /, _, . e -";
const MSG_LINK = "o link do botão deve começar com /, #, http://, https:// ou mailto:";

/** O que impede gravar (mesmo em rascunho): links e caminhos que o site não aceita. */
export function errosDaPagina(e: PaginaProgramaEdicao): string[] {
  const erros: string[] = [];
  if (!caminhoValido(e.heroImagemCaminho)) erros.push(`Imagem do topo: ${MSG_CAMINHO}`);
  e.docentes.coordenacao.forEach((x, i) => {
    if (!caminhoValido(x.imagemCaminho)) erros.push(`Coordenação ${i + 1}: ${MSG_CAMINHO}`);
  });
  e.docentes.especialistas.forEach((x, i) => {
    if (!caminhoValido(x.imagemCaminho)) erros.push(`Especialista ${i + 1}: ${MSG_CAMINHO}`);
  });
  e.modalidadesCards.forEach((m, i) => {
    if (!ctaHrefPermitido(m.ctaHref)) erros.push(`Modalidade ${i + 1}: ${MSG_LINK}`);
  });
  if (!caminhoValido(e.cartao.imagemCaminho)) erros.push(`Cartão: ${MSG_CAMINHO}`);
  const ordem = e.cartao.ordem.trim();
  if (ordem !== "" && !ORDEM.test(ordem)) erros.push("Cartão: a ordem deve ser um número inteiro");
  return erros;
}

export function paginaParaPublicar(e: PaginaProgramaEdicao): PaginaParaPublicar {
  return {
    heroTitulo: e.heroTitulo,
    heroSubtitulo: e.heroSubtitulo,
    temImagemTopo: e.heroImagemId.trim() !== "" || e.heroImagemCaminho.trim() !== "",
    cartaoNome: e.cartao.nome,
    cartaoTagline: e.cartao.tagline,
    cartaoDescricaoMenu: e.cartao.descricaoMenu,
    cartaoDescricaoMapa: e.cartao.descricaoMapa,
  };
}

/* ---------------- Imagens enviadas (media) ---------------- */

/** Onde a imagem enviada entra no group `pagina`. Docentes pela linha (id do array). */
export type AlvoImagemPrograma =
  | { tipo: "topo" }
  | { tipo: "cartao" }
  | { tipo: "coordenacao"; linhaId: string }
  | { tipo: "especialista"; linhaId: string };

/** Formato do alvo vindo da Server Action (o cliente pode mandar qualquer coisa). */
export function ehAlvoImagem(v: unknown): v is AlvoImagemPrograma {
  if (!v || typeof v !== "object") return false;
  const a = v as { tipo?: unknown; linhaId?: unknown };
  if (a.tipo === "topo" || a.tipo === "cartao") return true;
  return (a.tipo === "coordenacao" || a.tipo === "especialista") && typeof a.linhaId === "string" && a.linhaId !== "";
}

type LinhaComImagem = { id?: string | null; imagem?: unknown };

/**
 * Cópia do group com a relação de imagem do alvo trocada (`null` limpa).
 * Só a relação muda — o caminho legado fica, e o site volta a usá-lo sem a
 * media. Devolve `null` se a linha do docente não existe no gravado.
 */
export function comImagem(
  pagina: Programa["pagina"] | null | undefined,
  alvo: AlvoImagemPrograma,
  midiaId: number | null,
): NonNullable<Programa["pagina"]> | null {
  const copia = structuredClone(pagina ?? {}) as NonNullable<Programa["pagina"]>;
  if (alvo.tipo === "topo") {
    copia.heroImagem = midiaId;
    return copia;
  }
  if (alvo.tipo === "cartao") {
    copia.cartao = { ...(copia.cartao ?? {}), imagem: midiaId };
    return copia;
  }
  const docentes = copia.docentes ?? {};
  const linhas = (alvo.tipo === "coordenacao" ? docentes.coordenacao : docentes.especialistas) as
    | LinhaComImagem[]
    | null
    | undefined;
  const linha = (linhas ?? []).find((l) => l.id === alvo.linhaId);
  if (!linha) return null;
  linha.imagem = midiaId;
  return copia;
}
