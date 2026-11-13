import { beforeEach, describe, expect, it, vi } from "vitest";

import { paginaVazia, type CamposPaginaPrograma, type Vertical } from "@ntc/lib";
import type { Evento, Modulo, Programa } from "@ntc/types/payload-types";

const find = vi.hoisted(() => vi.fn());
vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ find }) }));

import { FALLBACK_VERTICAIS } from "@/app/(vertical)/solucoes-estrategicas/[area]/conteudoFallback";

import {
  carregarListasProgramas,
  cartaoDoPrograma,
  menuDasListas,
  montarListas,
  obterMenuProgramas,
  programasComEventoAtivo,
  trocarContagem,
  trocarContagemExtenso,
  vertenteComProgramas,
} from "./listasProgramas";
import { compararPorCartao } from "./programas";

function campos(sigla: string, vertical: Vertical, ordem: number | null): CamposPaginaPrograma {
  const pagina = paginaVazia();
  return {
    sigla,
    slug: sigla.toLowerCase().replace(/\+$/, ""),
    nomeCompleto: `Programa ${sigla}`,
    vertical,
    cargaHorariaTotal: "",
    visaoGeral: null,
    problema: null,
    objetivo: null,
    publicoAlvo: null,
    eixos: [],
    resultados: [],
    diferenciais: [],
    faq: [],
    modulos: [],
    pagina: {
      ...pagina,
      cartao: {
        nome: `Nome ${sigla}`,
        tagline: `Chamada ${sigla}`,
        meta: "8 módulos · 64h",
        imagem: `/img/${sigla}.webp`,
        ordem,
        descricaoMenu: `Menu ${sigla}`,
        descricaoMapa: `Mapa ${sigla}`,
      },
    },
  };
}

const AGORA = new Date("2026-11-05T12:00:00-03:00");

describe("cartaoDoPrograma e ordem", () => {
  it("copia os campos do cartão, com slug e vertente", () => {
    expect(cartaoDoPrograma(campos("PROAPS+", "saude", 2), true)).toEqual({
      sigla: "PROAPS+",
      slug: "proaps",
      vertical: "saude",
      nome: "Nome PROAPS+",
      tagline: "Chamada PROAPS+",
      meta: "8 módulos · 64h",
      imagemSrc: "/img/PROAPS+.webp",
      flagAberto: true,
      descricaoMenu: "Menu PROAPS+",
      descricaoMapa: "Mapa PROAPS+",
    });
    expect(cartaoDoPrograma(campos("SIGA", "gestao-publica", 1)).flagAberto).toBe(false);
  });

  it("programa novo com cartao.ordem vazio vai para o fim da sua vertente", () => {
    const todos = [
      campos("NOVO", "educacao", null),
      campos("PEAR", "educacao", 2),
      campos("AGIP", "gestao-publica", 10),
      campos("EDUTEC", "educacao", 1),
    ].sort(compararPorCartao);
    const listas = montarListas(todos.map((c) => cartaoDoPrograma(c)));
    expect(listas.porVertical.educacao.map((c) => c.sigla)).toEqual(["EDUTEC", "PEAR", "NOVO"]);
    expect(listas.porVertical["gestao-publica"].map((c) => c.sigla)).toEqual(["AGIP"]);
    expect(listas.porVertical.saude).toEqual([]);
    expect(listas.total).toBe(4);
  });
});

describe("contagens", () => {
  it("por extenso no início do título: 3 → Três, 9 → Nove, 15 → Quinze", () => {
    expect(trocarContagemExtenso("Três programas estratégicos · <em>NTC Saúde</em>", 3)).toBe(
      "Três programas estratégicos · <em>NTC Saúde</em>",
    );
    expect(trocarContagemExtenso("Três programas estratégicos · <em>NTC Saúde</em>", 4)).toBe(
      "Quatro programas estratégicos · <em>NTC Saúde</em>",
    );
    expect(trocarContagemExtenso("Nove programas estratégicos · <em>NTC Educação</em>", 9)).toBe(
      "Nove programas estratégicos · <em>NTC Educação</em>",
    );
    expect(trocarContagemExtenso("Nove programas estratégicos", 15)).toBe(
      "Quinze programas estratégicos",
    );
  });

  it("em dígitos onde já era dígito", () => {
    expect(trocarContagem("Conhecer os 9 programas", 10)).toBe("Conhecer os 10 programas");
    expect(trocarContagem("Ver todos os 15 programas do Grupo NTC", 16)).toBe(
      "Ver todos os 16 programas do Grupo NTC",
    );
    expect(trocarContagem("9 frentes", 10)).toBe("9 frentes");
  });

  it("vertente com 10 programas: título, botão, metadado e CTA geral recalculados; prosa intacta", () => {
    const base = FALLBACK_VERTICAIS.educacao;
    const cartoes = Array.from({ length: 10 }, (_, i) =>
      cartaoDoPrograma(campos(`P${i}`, "educacao", i)),
    );
    const v = vertenteComProgramas(base, cartoes, 16);
    expect(v.programas.tituloHtml).toBe("Dez programas estratégicos · <em>NTC Educação</em>");
    expect(v.hero.ctas[0]?.rotulo).toBe("Conhecer os 10 programas");
    expect(v.metadados[0]?.value).toBe("10 programas");
    expect(v.metadados[1]?.value).toBe("9 frentes");
    expect(v.programas.ctaPrimario.rotulo).toBe("Ver todos os 16 programas do Grupo NTC");
    expect(v.hero.sub).toBe(base.hero.sub);
    expect(v.areas.tituloHtml).toBe(base.areas.tituloHtml);
    expect(v.programas.cards.map((c) => c.sigla)).toEqual(cartoes.map((c) => c.sigla));
    // O fallback original não é alterado.
    expect(base.programas.tituloHtml).toBe("Nove programas estratégicos · <em>NTC Educação</em>");
  });

  it("vertentes com a mesma contagem de hoje (9/3/3, total 15) não mudam nada", () => {
    const contagens = { educacao: 9, "gestao-publica": 3, saude: 3 } as const;
    for (const slug of ["educacao", "gestao-publica", "saude"] as const) {
      const base = FALLBACK_VERTICAIS[slug];
      const cartoes = Array.from({ length: contagens[slug] }, (_, i) =>
        cartaoDoPrograma(campos(`P${i}`, slug, i)),
      );
      const v = vertenteComProgramas(base, cartoes, 15);
      expect(v.programas.tituloHtml).toBe(base.programas.tituloHtml);
      expect(v.hero.ctas).toEqual(base.hero.ctas);
      expect(v.metadados).toEqual(base.metadados);
      expect(v.programas.ctaPrimario).toEqual(base.programas.ctaPrimario);
    }
  });
});

describe("programasComEventoAtivo", () => {
  const ev = (
    id: number,
    programa: number | null,
    dataInicio: string,
    dataFim: string | null = null,
  ) => ({
    id,
    programa,
    dataInicio,
    dataFim,
  });

  it("programa com evento de hoje em diante entra; evento passado não", () => {
    const ativos = programasComEventoAtivo(
      [
        ev(1, 10, "2026-11-20"),
        ev(2, 20, "2026-10-01", "2026-10-02"),
        ev(3, 30, "2026-11-01", "2026-11-05"),
      ],
      [],
      AGORA,
    );
    expect([...ativos].sort()).toEqual([10, 30]);
  });

  it("evento sem programa vale pelo vínculo do módulo", () => {
    const ativos = programasComEventoAtivo(
      [ev(7, null, "2026-12-01")],
      [{ programa: 40, eventos: [7] }],
      AGORA,
    );
    expect([...ativos]).toEqual([40]);
  });
});

describe("carregarListasProgramas", () => {
  beforeEach(() => {
    find.mockReset();
  });

  function programa(id: number, sigla: string, ordem: number | null, area: string): Programa {
    return {
      id,
      sigla,
      slug: sigla.toLowerCase(),
      nomeCompleto: sigla,
      area: { id: 1, sigla: area },
      visaoGeral: null,
      pagina: { cartao: { nome: `Nome ${sigla}`, ordem, descricaoMenu: `Menu ${sigla}` } },
      updatedAt: "",
      createdAt: "",
    } as unknown as Programa;
  }

  it("lê do CMS, marca aberto pelo evento ativo e consulta só eventos publicados", async () => {
    find.mockImplementation(async (args: { collection: string }) => {
      if (args.collection === "programas")
        return {
          docs: [
            programa(1, "PEAR", 2, "educacao"),
            programa(2, "EDUTEC", 1, "educacao"),
            programa(3, "NOVO", null, "saude"),
          ],
        };
      if (args.collection === "modulos")
        return {
          docs: [
            {
              id: 50,
              programa: 3,
              numero: 1,
              titulo: "M",
              ementa: null,
              eventosVinculados: [77],
            } as unknown as Modulo,
          ],
        };
      if (args.collection === "eventos")
        return {
          docs: [
            { id: 70, programa: 1, dataInicio: "2026-12-01T00:00:00.000Z", dataFim: null },
            { id: 77, programa: null, dataInicio: "2026-11-30T00:00:00.000Z", dataFim: null },
            { id: 71, programa: 2, dataInicio: "2026-01-01T00:00:00.000Z", dataFim: null },
          ] as unknown as Evento[],
        };
      return { docs: [] };
    });
    const l = await carregarListasProgramas(AGORA);
    expect(l.porVertical.educacao.map((c) => [c.sigla, c.flagAberto])).toEqual([
      ["EDUTEC", false],
      ["PEAR", true],
    ]);
    expect(l.porVertical.saude.map((c) => [c.sigla, c.flagAberto, c.descricaoMenu])).toEqual([
      ["NOVO", true, "Menu NOVO"],
    ]);
    const evs = find.mock.calls.map((c) => c[0]).find((a) => a.collection === "eventos");
    expect(evs.where.and).toContainEqual({ _status: { equals: "published" } });
    expect(evs.where.and[1].or).toEqual([{ programa: { in: [2, 1, 3] } }, { id: { in: [77] } }]);
    expect(evs.draft).toBeUndefined();
  });

  it("falha do banco → lança (ISR mantém a última versão boa; sem cartão estático)", async () => {
    find.mockRejectedValue(new Error("coluna inexistente"));
    await expect(carregarListasProgramas(AGORA)).rejects.toThrow("coluna inexistente");
  });

  it("CMS sem nenhum programa publicado → lança", async () => {
    find.mockResolvedValue({ docs: [] });
    await expect(carregarListasProgramas(AGORA)).rejects.toThrow(/Nenhum programa publicado/);
  });
});

describe("obterMenuProgramas (R26: o menu tolera falha)", () => {
  beforeEach(() => {
    find.mockReset();
  });

  it("falha do banco → menu vazio, total desconhecido, e loga [menuProgramas]", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    find.mockRejectedValue(new Error("coluna inexistente"));
    const m = await obterMenuProgramas();
    expect(m).toEqual({
      porVertical: { educacao: [], "gestao-publica": [], saude: [] },
      total: null,
    });
    expect(erro.mock.calls[0]?.[0]).toMatch(/\[menuProgramas\]/);
    erro.mockRestore();
  });

  it("nenhum programa publicado → menu vazio (não derruba a página)", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    find.mockResolvedValue({ docs: [] });
    const m = await obterMenuProgramas();
    expect(m.total).toBeNull();
    expect(m.porVertical.educacao).toEqual([]);
    erro.mockRestore();
  });

  it("com programas: total conhecido", () => {
    const l = montarListas([cartaoDoPrograma(campos("PEAR", "educacao", 1))]);
    expect(menuDasListas(l).total).toBe(1);
  });
});
