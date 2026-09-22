import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
const findByID = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ find, findByID }),
}));

import { listarConteudosCms, obterConteudoCms } from "./painelCms";

const docBase = {
  id: 7,
  titulo: "Cinco anos de Lei 14.133",
  slug: "cinco-anos-de-lei-14133",
  categoria: "estudo",
  area: { id: 2, nome: "NTC Gestão Pública" },
  lide: "Leitura técnica longa.",
  corpo: {
    root: {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", text: "Corpo.", format: 0 }] }],
    },
  },
  assinatura: "Curadoria NTC Gestão Pública",
  autor: [],
  dataPublicacao: "2026-09-20T00:00:00.000Z",
  destaque: true,
  anunciarEmPreparacao: false,
  _status: "published",
};

beforeEach(() => {
  find.mockReset();
  findByID.mockReset();
});

describe("listarConteudosCms", () => {
  it("mapeia categoria, vertical e situação publicada", async () => {
    find.mockResolvedValue({ docs: [docBase] });
    const [item] = await listarConteudosCms();
    expect(item).toMatchObject({
      id: "7",
      titulo: "Cinco anos de Lei 14.133",
      categoria: "estudo",
      categoriaRotulo: "Estudo",
      vertical: "NTC Gestão Pública",
      situacao: "publicado",
      destaque: true,
    });
  });

  it("chama o Payload com draft para enxergar rascunho", async () => {
    find.mockResolvedValue({ docs: [] });
    await listarConteudosCms();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "conteudos", draft: true, sort: "-dataPublicacao" }),
    );
  });

  it('chama de "Transversal" o conteúdo sem área', async () => {
    find.mockResolvedValue({ docs: [{ ...docBase, area: null }] });
    const [item] = await listarConteudosCms();
    expect(item?.vertical).toBe("Transversal");
  });

  it('distingue rascunho comum de rascunho "em preparação"', async () => {
    find.mockResolvedValue({
      docs: [
        { ...docBase, id: 1, _status: "draft", anunciarEmPreparacao: false },
        { ...docBase, id: 2, _status: "draft", anunciarEmPreparacao: true },
      ],
    });
    const itens = await listarConteudosCms();
    expect(itens.map((i) => i.situacao)).toEqual(["rascunho", "em-preparacao"]);
  });
});

describe("obterConteudoCms", () => {
  it("devolve o corpo já em Markdown, pronto para o textarea", async () => {
    findByID.mockResolvedValue(docBase);
    const det = await obterConteudoCms("7");
    expect(det?.corpoMarkdown).toBe("Corpo.");
    expect(det?.assinatura).toBe("Curadoria NTC Gestão Pública");
  });

  it("devolve null quando o documento não existe", async () => {
    findByID.mockRejectedValue(new Error("Not Found"));
    expect(await obterConteudoCms("999")).toBeNull();
  });
});
