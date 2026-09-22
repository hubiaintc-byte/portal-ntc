import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();

vi.mock("./payloadClient", () => ({ obterPayload: async () => ({ find }) }));

import {
  carregarConteudo,
  listarConteudosPublicados,
  listarDestaques,
  listarRelacionados,
  type ConteudoLeitura,
} from "./conteudos";

const publicado = {
  id: 1,
  titulo: "Cinco anos de Lei 14.133",
  slug: "cinco-anos-de-lei-14133",
  categoria: "estudo",
  area: { nome: "NTC Gestão Pública", slug: "gestao-publica" },
  lide: "Leitura técnica longa.",
  assinatura: "Curadoria NTC Gestão Pública",
  dataPublicacao: "2026-09-20T00:00:00.000Z",
  destaque: true,
  anunciarEmPreparacao: false,
  tempoLeituraMin: 7,
  autor: [],
  _status: "published",
};

const emPreparacao = {
  ...publicado,
  id: 2,
  titulo: "IA generativa no setor público",
  slug: "ia-generativa-no-setor-publico",
  categoria: "nota-tecnica",
  area: null,
  destaque: false,
  anunciarEmPreparacao: true,
  _status: "draft",
};

// Corpo em bloco (não retorno implícito): find.mockReset() devolve o
// próprio mock (é encadeável); um `() => find.mockReset()` faz o
// beforeEach devolver esse mock, e o runner do Vitest 4 trata um valor de
// hook que é uma função como cleanup e o invoca de novo depois do teste —
// disparando uma 2ª chamada não tratada do mock corrente (ex.: o rejeitado
// do teste "banco falha", virando unhandled rejection e derrubando o teste
// mesmo com o catch correto no código). Ver vitest-dev/vitest#10845.
beforeEach(() => {
  find.mockReset();
});

describe("listarConteudosPublicados", () => {
  it("dá href ao publicado e nenhum ao que está em preparação", async () => {
    find.mockResolvedValue({ docs: [publicado, emPreparacao] });
    const cards = await listarConteudosPublicados();
    expect(cards[0]!.href).toBe("/conteudos/estudos/cinco-anos-de-lei-14133");
    expect(cards[0]!.emPreparacao).toBe(false);
    expect(cards[1]!.href).toBeNull();
    expect(cards[1]!.emPreparacao).toBe(true);
  });

  it("mapeia a área para a sigla de vertical do protótipo", async () => {
    find.mockResolvedValue({ docs: [publicado, emPreparacao] });
    const cards = await listarConteudosPublicados();
    expect(cards[0]!.vert).toBe("gov");
    expect(cards[1]!.vert).toBe("trans");
    expect(cards[1]!.verticalLabel).toBe("Transversal");
  });

  it("descarta rascunho que não pede anúncio", async () => {
    find.mockResolvedValue({
      docs: [publicado, { ...emPreparacao, anunciarEmPreparacao: false }],
    });
    const cards = await listarConteudosPublicados();
    expect(cards).toHaveLength(1);
  });

  it("devolve lista vazia — e não lança — quando o banco falha", async () => {
    find.mockRejectedValue(new Error("connection refused"));
    await expect(listarConteudosPublicados()).resolves.toEqual([]);
  });
});

describe("listarDestaques", () => {
  it("devolve no máximo 3", async () => {
    find.mockResolvedValue({
      docs: [1, 2, 3, 4].map((n) => ({ ...publicado, id: n, slug: `slug-${n}` })),
    });
    expect(await listarDestaques()).toHaveLength(3);
  });
});

describe("carregarConteudo", () => {
  it("devolve null para segmento de categoria inexistente, sem ir ao banco", async () => {
    expect(await carregarConteudo("podcasts", "qualquer")).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  it("devolve null quando o documento está em rascunho", async () => {
    find.mockResolvedValue({ docs: [] });
    expect(await carregarConteudo("estudos", "cinco-anos-de-lei-14133")).toBeNull();
  });

  it("consulta filtrando por slug e categoria", async () => {
    find.mockResolvedValue({ docs: [{ ...publicado, corpo: { root: { children: [] } } }] });
    await carregarConteudo("estudos", "cinco-anos-de-lei-14133");
    const args = find.mock.calls[0]![0];
    expect(args.where.slug.equals).toBe("cinco-anos-de-lei-14133");
    expect(args.where.categoria.equals).toBe("estudo");
  });
});

describe("listarRelacionados", () => {
  it("usa os conteudosRelacionados escolhidos pelo editor quando existem", async () => {
    find.mockResolvedValue({
      docs: [
        {
          ...publicado,
          corpo: { root: { children: [] } },
          conteudosRelacionados: [
            { ...publicado, id: 99, slug: "outro-conteudo", titulo: "Outro conteúdo" },
          ],
        },
      ],
    });

    const leitura: ConteudoLeitura = {
      id: "1",
      titulo: publicado.titulo,
      lide: publicado.lide,
      categoria: "estudo",
      tipoLabel: "Estudo",
      vert: "gov",
      verticalLabel: "NTC Gestão Pública",
      href: "/conteudos/estudos/cinco-anos-de-lei-14133",
      emPreparacao: false,
      dataLegivel: "Publicado · 20/09/2026",
      assinatura: publicado.assinatura,
      imagemUrl: null,
      search: "cinco anos de lei 14.133 leitura tecnica longa.",
      slug: publicado.slug,
      corpoHtml: "",
      tempoLeituraMin: 7,
      autores: [],
      anexoUrl: null,
      linkExterno: null,
      dataISO: publicado.dataPublicacao,
      seoTitulo: "",
      seoDescricao: "",
    };

    const relacionados = await listarRelacionados(leitura);
    expect(relacionados).toHaveLength(1);
    expect(relacionados[0]!.id).toBe("99");
    expect(relacionados[0]!.titulo).toBe("Outro conteúdo");
  });
});
