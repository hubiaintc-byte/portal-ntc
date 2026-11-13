import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CamposPaginaPrograma } from "@ntc/lib";
import type { Modulo, Programa } from "@ntc/types/payload-types";

const find = vi.hoisted(() => vi.fn());
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ find }) }));

import {
  buscarProgramaPublicado,
  docParaCampos,
  listarProgramasPublicados,
  relacionadosDe,
} from "./programas";

const SO_PUBLICADO = { _status: { equals: "published" } };

const LEXICAL = {
  root: {
    type: "root",
    children: [{ type: "paragraph", version: 1, children: [{ type: "text", text: "Texto.", version: 1 }] }],
    direction: null,
    format: "",
    indent: 0,
    version: 1,
  },
} as Programa["visaoGeral"];

function programa(extra: Partial<Programa> = {}): Programa {
  return {
    id: 1,
    sigla: "PROGE",
    nomeCompleto: "Programa de Gestão",
    area: { id: 9, sigla: "gestao-publica" } as Programa["area"],
    cargaHorariaTotal: "64 horas",
    visaoGeral: LEXICAL,
    slug: "proge",
    updatedAt: "",
    createdAt: "",
    ...extra,
  } as Programa;
}

function modulo(numero: number, extra: Partial<Modulo> = {}): Modulo {
  return {
    id: 100 + numero,
    programa: 1,
    numero,
    titulo: `Módulo ${numero}`,
    ementa: LEXICAL as Modulo["ementa"],
    cargaHoraria: "8h",
    topicos: [{ texto: "Tópico A" }, { texto: null }],
    updatedAt: "",
    createdAt: "",
    ...extra,
  } as Modulo;
}

/** Responde `find` por coleção. */
function responder(por: Record<string, unknown[]>) {
  find.mockImplementation(async (args: { collection: string }) => ({ docs: por[args.collection] ?? [] }));
}

function chamada(colecao: string) {
  return find.mock.calls.map((c) => c[0]).find((a) => a.collection === colecao);
}

describe("leitura dos programas pelo site", () => {
  beforeEach(() => {
    find.mockReset();
  });

  it("buscarProgramaPublicado consulta só programa publicado, sem draft", async () => {
    responder({});
    await buscarProgramaPublicado("proge");
    const args = chamada("programas");
    expect(args.where.and).toContainEqual(SO_PUBLICADO);
    expect(args.where.and).toContainEqual({ slug: { equals: "proge" } });
    expect(args.draft).toBeUndefined();
    expect(args.depth).toBe(1);
  });

  it("slug desconhecido (ou só em rascunho) devolve null", async () => {
    responder({ programas: [] });
    await expect(buscarProgramaPublicado("nao-existe")).resolves.toBeNull();
  });

  it("falha do banco propaga (não vira 404)", async () => {
    find.mockRejectedValue(new Error("conexão recusada"));
    await expect(buscarProgramaPublicado("proge")).rejects.toThrow("conexão recusada");
  });

  it("monta a página com módulos ordenados e eventos publicados vinculados ao módulo", async () => {
    const amanha = new Date(Date.now() + 2 * 86_400_000).toISOString();
    responder({
      programas: [programa()],
      modulos: [modulo(1, { eventosVinculados: [55] }), modulo(2)],
      eventos: [
        {
          id: 55,
          slug: "proge-m01",
          nome: "PROGE M01",
          dataInicio: amanha,
          dataFim: null,
          modalidade: "online",
          imagemCapa: { url: "https://cdn.exemplo/capa.webp" },
        },
      ],
    });
    const p = await buscarProgramaPublicado("proge");
    expect(p?.sigla).toBe("PROGE");
    expect(p?.siglaCss).toBe("AGIP");
    expect(p?.modulos.itens.map((m) => m.numero)).toEqual(["I", "II"]);
    expect(p?.modulos.itens[0]?.statusTipo).toBe("aberto");
    expect(p?.modulos.itens[1]?.statusTipo).toBeUndefined();
    expect(p?.modulosAbertos?.feature?.ctaHref).toBe("/agenda/proge-m01");
    expect(p?.modulosAbertos?.feature?.modalidade).toBe("Online");
    expect(p?.modulosAbertos?.feature?.binding).toContain("Módulo I");

    const mods = chamada("modulos");
    expect(mods.where).toEqual({ programa: { equals: 1 } });
    expect(mods.sort).toBe("numero");

    const evs = chamada("eventos");
    expect(evs.where.and).toContainEqual(SO_PUBLICADO);
    expect(evs.where.and).toContainEqual({ or: [{ programa: { equals: 1 } }, { id: { in: [55] } }] });
    expect(evs.draft).toBeUndefined();
    expect(evs.sort).toBe("-dataInicio");
  });

  it("sem evento ativo a seção de módulos abertos some", async () => {
    responder({ programas: [programa()], modulos: [modulo(1)], eventos: [] });
    const p = await buscarProgramaPublicado("proge");
    expect(p?.modulosAbertos).toBeUndefined();
    const evs = chamada("eventos");
    expect(evs.where.and).toContainEqual({ or: [{ programa: { equals: 1 } }] });
  });

  it("listarProgramasPublicados ordena por cartao.ordem e depois sigla, só publicados", async () => {
    const comOrdem = (sigla: string, ordem: number | null, id: number) =>
      programa({ id, sigla, slug: sigla.toLowerCase(), pagina: { cartao: { ordem } } });
    responder({
      programas: [comOrdem("SIGA", null, 3), comOrdem("PROGE", 2, 1), comOrdem("AGIP", 1, 2), comOrdem("EGIDE", null, 4)],
      modulos: [modulo(1, { programa: 1 }), modulo(1, { id: 900, programa: 2 })],
    });
    const lista = await listarProgramasPublicados();
    expect(lista.map((c) => c.sigla)).toEqual(["AGIP", "PROGE", "EGIDE", "SIGA"]);
    expect(lista.find((c) => c.sigla === "PROGE")?.modulos).toHaveLength(1);
    expect(lista.find((c) => c.sigla === "SIGA")?.modulos).toHaveLength(0);
    expect(chamada("programas").where).toEqual(SO_PUBLICADO);
  });
});

describe("docParaCampos", () => {
  it("imagem da media vence o campo de caminho (hero, docentes e cartão)", () => {
    const doc = programa({
      pagina: {
        heroImagem: { id: 1, url: "https://cdn.exemplo/hero.webp" } as never,
        heroImagemCaminho: "/img/fotos/_optimized/antiga.1920.webp",
        docentes: {
          coordenacao: [
            { imagem: { id: 2, url: "https://cdn.exemplo/coord.webp" } as never, imagemCaminho: "/img/x.webp", nome: "C" },
          ],
          especialistas: [{ imagem: null, imagemCaminho: "/img/esp.webp", nome: "E" }],
        },
        cartao: { imagem: { id: 3, url: "https://cdn.exemplo/cartao.webp" } as never, imagemCaminho: "/img/c.webp" },
      },
    });
    const c = docParaCampos(doc, []);
    expect(c.pagina.heroImagem).toBe("https://cdn.exemplo/hero.webp");
    expect(c.pagina.docentes.coordenacao[0]?.imgSrc).toBe("https://cdn.exemplo/coord.webp");
    expect(c.pagina.docentes.especialistas[0]?.imgSrc).toBe("/img/esp.webp");
    expect(c.pagina.cartao.imagem).toBe("https://cdn.exemplo/cartao.webp");
  });

  it("sem media usa o caminho; vertente vem de area.sigla; listas de um texto achatadas", () => {
    const doc = programa({
      pagina: {
        heroImagemCaminho: "/img/fotos/_optimized/hero.1920.webp",
        publicoChips: [{ texto: "Gestores" }, { texto: "" }, { texto: null }],
      },
      resultadosEsperados: [{ resultado: "R1" }],
    });
    const c = docParaCampos(doc, [modulo(2), modulo(1)]);
    expect(c.pagina.heroImagem).toBe("/img/fotos/_optimized/hero.1920.webp");
    expect(c.vertical).toBe("gestao-publica");
    expect(c.pagina.identidadeVisual).toBe("vertente");
    expect(c.pagina.publicoChips).toEqual(["Gestores"]);
    expect(c.resultados).toEqual(["R1"]);
    expect(c.modulos.map((m) => m.numero)).toEqual([1, 2]);
    expect(c.modulos[0]?.topicos).toEqual(["Tópico A"]);
    expect(c.modulos[0]?.descricao).toBe(LEXICAL);
  });
});

describe("relacionadosDe", () => {
  function campos(slug: string, vertical: CamposPaginaPrograma["vertical"]): CamposPaginaPrograma {
    return { sigla: slug.toUpperCase(), slug, nomeCompleto: `Programa ${slug}`, vertical } as CamposPaginaPrograma;
  }

  it("mesma vertente, sem o próprio, até 3, na ordem da lista", () => {
    const todos = [
      campos("a", "educacao"),
      campos("x", "saude"),
      campos("b", "educacao"),
      campos("c", "educacao"),
      campos("d", "educacao"),
      campos("e", "educacao"),
    ];
    const r = relacionadosDe("b", todos);
    expect(r.map((x) => x.slug)).toEqual(["a", "c", "d"]);
    expect(r[0]).toEqual({ slug: "a", sigla: "A", nomeCurto: "Programa a", descritor: "A" });
  });

  it("ordem por sigla, mesmo quando a ordem da lista (cartao.ordem) discorda", () => {
    const todos = [campos("z", "educacao"), campos("m", "educacao"), campos("b", "educacao"), campos("a", "educacao")];
    expect(relacionadosDe("z", todos).map((x) => x.slug)).toEqual(["a", "b", "m"]);
  });

  it("slug fora da lista → vazio", () => {
    expect(relacionadosDe("zz", [campos("a", "educacao")])).toEqual([]);
  });
});
