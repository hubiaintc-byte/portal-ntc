import { describe, expect, it } from "vitest";

import { faltasParaPublicar, type ConteudoPrograma, type PaginaPrograma } from "@ntc/lib";

import paginas from "@/seed/assets/paginas-programas.json";
import { paginaParaCampos } from "@/lib/cms/importacaoProgramas/paginaParaCampos";
import { lexicalParaMarkdown } from "@/lib/markdownLexical";

import {
  errosDaPagina,
  paginaDoDocumento,
  paginaParaGravar,
  paginaParaPublicar,
  paginaVazia,
} from "./paginaProgramaCatalogo";

type CartaoInstantaneo = PaginaPrograma["cartao"] & { sigla: string };
const snapshot = paginas as unknown as { programas: ConteudoPrograma[]; cartoes: CartaoInstantaneo[] };

/** Group `pagina` como o Payload devolve (depth 0: media como id). */
const gravado = {
  identidadeVisual: "EDUTEC" as const,
  heroTitulo: "Programa *Edutec*",
  heroSubtitulo: "Sub",
  heroImagem: 7,
  heroImagemCaminho: "/img/fotos/hero.webp",
  barraDados: [{ id: "a", rotulo: "Carga", valor: "64h", valorSub: null }],
  visaoGeralTitulo: "Visão",
  problemaTitulo: "Problema",
  problemaDestaque: "**Destaque**",
  publicoChips: [{ id: "b", texto: "Professores" }],
  docentes: {
    titulo: "Docentes",
    intro: "Intro",
    coordenacaoMarcador: "Coord",
    especialistasMarcador: "Esp",
    contadores: [{ id: "c", num: "12", lbl: "especialistas" }],
    nota: "Nota",
    coordenacao: [
      { id: "d", tag: "Coordenação", imagem: 9, imagemCaminho: "/img/a.webp", imagemAlt: "Foto", eixoBadge: "Eixo 1", nome: "Ana", credencial: "Dra.", eixo: "Gestão", modulos: "M1" },
    ],
    especialistas: [
      { id: "e", imagem: null, imagemCaminho: "/img/b.webp", imagemAlt: "", eixoBadge: "", nome: "Beto", credencial: "Me.", modulos: "M2" },
    ],
  },
  modalidadesIntro: "Intro mod",
  modalidadesCards: [
    { id: "f", destaque: true, tag: "Tag", titulo: "Turma", descricao: "Desc", ctaRotulo: "Fale", ctaHref: "/contato" },
  ],
  modulosAbertosMicrocopy: "Micro",
  chamadaFinalTitulo: "Chamada *final*",
  chamadaFinalTexto: "Texto",
  resumoLateral: [{ id: "g", rotulo: "Formato", valor: "Online" }],
  entregas: [{ id: "h", texto: "Relatório" }],
  cartao: {
    nome: "EDUTEC",
    tagline: "Chamada",
    meta: "10 módulos",
    imagem: null,
    imagemCaminho: "/img/c.webp",
    ordem: 3,
    descricaoMenu: "Menu",
    descricaoMapa: "Mapa",
  },
};

describe("paginaDoDocumento / paginaParaGravar", () => {
  it("sem nada gravado, devolve a página vazia (identidade pela vertente)", () => {
    expect(paginaDoDocumento(undefined)).toEqual(paginaVazia());
    expect(paginaVazia().identidadeVisual).toBe("vertente");
  });

  it("ida e volta preserva o group, inclusive as imagens enviadas (ids), sem os ids das linhas", () => {
    const volta = paginaParaGravar(paginaDoDocumento(gravado));
    expect(volta).toEqual({
      ...gravado,
      barraDados: [{ rotulo: "Carga", valor: "64h", valorSub: null }],
      publicoChips: [{ texto: "Professores" }],
      docentes: {
        ...gravado.docentes,
        contadores: [{ num: "12", lbl: "especialistas" }],
        coordenacao: [
          { tag: "Coordenação", imagem: 9, imagemCaminho: "/img/a.webp", imagemAlt: "Foto", eixoBadge: "Eixo 1", nome: "Ana", credencial: "Dra.", eixo: "Gestão", modulos: "M1" },
        ],
        especialistas: [
          { imagem: null, imagemCaminho: "/img/b.webp", imagemAlt: null, eixoBadge: null, nome: "Beto", credencial: "Me.", modulos: "M2" },
        ],
      },
      modalidadesCards: [{ destaque: true, tag: "Tag", titulo: "Turma", descricao: "Desc", ctaRotulo: "Fale", ctaHref: "/contato" }],
      resumoLateral: [{ rotulo: "Formato", valor: "Online" }],
      entregas: [{ texto: "Relatório" }],
    });
  });

  it("apara, troca vazio por null, descarta linha toda em branco e converte a ordem", () => {
    const e = paginaVazia();
    e.heroTitulo = "  Título  ";
    e.publicoChips = [{ texto: " " }, { texto: " Gestores " }];
    e.barraDados = [{ rotulo: "", valor: "", valorSub: "" }];
    e.cartao.ordem = " 4 ";
    const g = paginaParaGravar(e);
    expect(g.heroTitulo).toBe("Título");
    expect(g.heroSubtitulo).toBeNull();
    expect(g.publicoChips).toEqual([{ texto: "Gestores" }]);
    expect(g.barraDados).toEqual([]);
    expect((g.cartao as { ordem: unknown }).ordem).toBe(4);
    expect(g.heroImagem).toBeNull();
  });
});

describe("errosDaPagina", () => {
  it("link de botão, caminho de imagem e ordem inválidos", () => {
    const e = paginaVazia();
    e.modalidadesCards = [
      { destaque: false, tag: "", titulo: "A", descricao: "", ctaRotulo: "", ctaHref: "javascript:alert(1)" },
    ];
    e.heroImagemCaminho = "img/sem-barra.webp";
    e.cartao.imagemCaminho = "//outro.site/x.webp";
    e.cartao.ordem = "1,5";
    expect(errosDaPagina(e)).toEqual([
      "Imagem do topo: o caminho deve começar com /",
      "Modalidade 1: o link do botão deve começar com /, #, http://, https:// ou mailto:",
      "Cartão: o caminho da imagem deve começar com /",
      "Cartão: a ordem deve ser um número inteiro",
    ]);
  });
  it("página vazia não tem erro", () => {
    expect(errosDaPagina(paginaVazia())).toEqual([]);
  });
});

describe("paginaParaPublicar", () => {
  it("imagem do topo vale por media ou por caminho", () => {
    const e = paginaDoDocumento(gravado);
    expect(paginaParaPublicar(e)).toEqual({
      heroTitulo: "Programa *Edutec*",
      heroSubtitulo: "Sub",
      temImagemTopo: true,
      cartaoNome: "EDUTEC",
      cartaoTagline: "Chamada",
      cartaoDescricaoMenu: "Menu",
      cartaoDescricaoMapa: "Mapa",
    });
    expect(paginaParaPublicar({ ...e, heroImagemId: "", heroImagemCaminho: "" }).temImagemTopo).toBe(false);
    expect(paginaParaPublicar({ ...e, heroImagemId: "", heroImagemCaminho: "/img/x.webp" }).temImagemTopo).toBe(true);
  });
});

describe("os 15 programas carregados passam no mínimo para publicar", () => {
  for (const p of snapshot.programas) {
    it(p.sigla, () => {
      const c = snapshot.cartoes.find((k) => k.sigla === p.sigla);
      if (!c) throw new Error(`sem cartão para ${p.sigla}`);
      const { campos } = paginaParaCampos(p, c);
      const g = campos.pagina;
      expect(
        faltasParaPublicar({
          sigla: campos.sigla,
          nomeCompleto: campos.nomeCompleto,
          areaId: campos.vertical,
          cargaHorariaTotal: campos.cargaHorariaTotal,
          visaoGeral: lexicalParaMarkdown(campos.visaoGeral),
          eixos: campos.eixos,
          diferenciais: campos.diferenciais,
          resultados: campos.resultados,
          numModulos: campos.modulos.length,
          pagina: {
            heroTitulo: g.heroTitulo,
            heroSubtitulo: g.heroSubtitulo,
            temImagemTopo: g.heroImagem !== "",
            cartaoNome: g.cartao.nome,
            cartaoTagline: g.cartao.tagline,
            cartaoDescricaoMenu: g.cartao.descricaoMenu,
            cartaoDescricaoMapa: g.cartao.descricaoMapa,
          },
        }),
      ).toEqual([]);
    });
  }
});
