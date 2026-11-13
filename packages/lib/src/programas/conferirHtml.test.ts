import { describe, expect, it } from "vitest";

import {
  aplicarIdentidadeCms,
  normalizarProgramaContato,
  compararPaginas,
  diffLinhas,
  extrairMain,
  extrairMegaProgramas,
  removerLinksModulosAbertos,
  soReordenacao,
  normalizarEspacos,
  prepararParaConferencia,
  removerSecaoModulosAbertos,
  removerSelos,
} from "./conferirHtml";

const PAGINA = (miolo: string) =>
  `<html><head><title>x</title></head><body><header>menu</header><main id="main">${miolo}</main><footer>rodapé</footer></body></html>`;

describe("extrairMain", () => {
  it("devolve só o conteúdo de <main>", () => {
    expect(extrairMain(PAGINA("<h1>Oi</h1>"))).toBe("<h1>Oi</h1>");
  });
  it("sem <main>, devolve a página inteira", () => {
    expect(extrairMain("<p>a</p>")).toBe("<p>a</p>");
  });
});

describe("removerSecaoModulosAbertos", () => {
  it("remove a seção inteira, inclusive com <article> aninhado", () => {
    const html =
      '<h2>antes</h2><article class="prog-section" id="modulos-abertos"><p>x</p><article><p>y</p></article><p>z</p></article><h2>depois</h2>';
    expect(removerSecaoModulosAbertos(html)).toBe("<h2>antes</h2><h2>depois</h2>");
  });
  it("sem a seção, não mexe", () => {
    expect(removerSecaoModulosAbertos("<p>a</p>")).toBe("<p>a</p>");
  });
  it("não confunde com links que apontam para #modulos-abertos", () => {
    const html = '<a href="#modulos-abertos">Ver</a>';
    expect(removerSecaoModulosAbertos(html)).toBe(html);
  });
});

describe("removerSelos", () => {
  it("tira o status do módulo e o flagAberto do cartão, e só eles", () => {
    const html =
      '<td><span class="m-status aberto">Inscrições abertas</span></td><div><span class="pc-flag">Módulos abertos</span><span class="pc-sigla">EDUTEC</span></div>';
    expect(removerSelos(html)).toBe('<td></td><div><span class="pc-sigla">EDUTEC</span></div>');
  });
});

describe("normalizarEspacos", () => {
  it("colapsa espaços e quebras, inclusive entre tags, e tira comentários", () => {
    expect(normalizarEspacos("<ul>\n  <li>a   b</li>\n  <!-- c -->\n</ul>")).toBe(
      "<ul><li>a b</li></ul>",
    );
  });
});

describe("diffLinhas", () => {
  it("marca o que só tem antes (-) e o que só tem depois (+)", () => {
    expect(diffLinhas(["a", "b", "c"], ["a", "x", "c"])).toEqual([
      { tipo: "-", texto: "b" },
      { tipo: "+", texto: "x" },
    ]);
  });
  it("iguais → vazio", () => {
    expect(diffLinhas(["a"], ["a"])).toEqual([]);
  });
});

describe("compararPaginas", () => {
  const corpo =
    '<h1>EDUTEC</h1><p>Texto.</p><table><tr><td class="m-title">M1</td><td>@STATUS@</td></tr></table>';
  const comStatus = (s: string) =>
    corpo.replace("@STATUS@", s ? `<span class="m-status">${s}</span>` : "");

  it("ignora o que fica fora do <main>, espaços e a seção/selos que mudam de propósito", () => {
    const antes = PAGINA(comStatus("") + '<article id="modulos-abertos"><p>antigo</p></article>');
    const depois = `<html><body><nav>outro menu</nav><main>\n  ${comStatus("Aberto")}\n  <article id="modulos-abertos"><p>novo</p></article>\n</main></body></html>`;
    expect(compararPaginas(antes, depois)).toEqual([]);
  });

  it("aponta o trecho que difere", () => {
    const antes = PAGINA("<h1>EDUTEC</h1><p>Texto antigo.</p>");
    const depois = PAGINA("<h1>EDUTEC</h1><p>Texto novo.</p>");
    expect(compararPaginas(antes, depois)).toEqual([
      { tipo: "-", texto: "Texto antigo." },
      { tipo: "+", texto: "Texto novo." },
    ]);
  });

  it("prepararParaConferencia é idempotente", () => {
    const uma = prepararParaConferencia(PAGINA(comStatus("Aberto")));
    expect(prepararParaConferencia(uma)).toBe(uma);
  });
});

describe("removerLinksModulosAbertos (R5/R6/R27: somem sem evento ativo)", () => {
  it("tira o item #modulos-abertos da navegação e os links que apontam para ele", () => {
    const html =
      '<a class="prog-nav-link" href="#visao">Visão</a><a class="prog-nav-link" href="#modulos-abertos">Módulos abertos</a><a class="btn" href="#modulos-abertos">Ver módulos abertos</a>';
    expect(removerLinksModulosAbertos(html)).toBe('<a class="prog-nav-link" href="#visao">Visão</a>');
  });
  it("tira o CTA .open-module-cta do detalhamento e só ele", () => {
    const html =
      '<p>x</p><a href="/contato?programa=edutec&amp;modulo=1" class="open-module-cta">Ver módulo aberto · próxima turma →</a><a href="/contato">Contato</a>';
    expect(removerLinksModulosAbertos(html)).toBe('<p>x</p><a href="/contato">Contato</a>');
  });
});

describe("extrairMegaProgramas", () => {
  it("devolve o bloco #mega-programas do cabeçalho, com aninhamento", () => {
    const html =
      '<header><div class="mega" id="mega-programas"><div class="container"><h4>NTC Educação · 9 programas</h4></div></div><div id="mega-solucoes">x</div></header>';
    expect(extrairMegaProgramas(html)).toBe(
      '<div class="mega" id="mega-programas"><div class="container"><h4>NTC Educação · 9 programas</h4></div></div>',
    );
  });
  it("sem o bloco → vazio", () => {
    expect(extrairMegaProgramas("<header></header>")).toBe("");
  });
});

describe("compararPaginas com o mega-menu", () => {
  const mega = (itens: string) =>
    `<header><div id="mega-programas"><ul>${itens}</ul></div></header>`;
  it("diferença no mega-menu de programas é apontada, mesmo fora do <main>", () => {
    const antes = `<html><body>${mega("<li>EDUTEC</li>")}<main><p>a</p></main></body></html>`;
    const depois = `<html><body>${mega("<li>PEAR</li>")}<main><p>a</p></main></body></html>`;
    expect(compararPaginas(antes, depois)).toEqual([
      { tipo: "-", texto: "EDUTEC" },
      { tipo: "+", texto: "PEAR" },
    ]);
  });
  it("links para #modulos-abertos e o CTA do módulo aberto não contam", () => {
    const antes = PAGINA('<p>a</p><a href="#modulos-abertos">Ver módulos abertos</a>');
    const depois = PAGINA("<p>a</p>");
    expect(compararPaginas(antes, depois)).toEqual([]);
  });
});

describe("soReordenacao (R19: mapa do site, Gestão Pública reordenada)", () => {
  it("mesmas linhas, outra ordem → só reordenação", () => {
    const diff = diffLinhas(["LIDERA", "AGIP", "SIGA"], ["AGIP", "LIDERA", "SIGA"]);
    expect(diff.length).toBeGreaterThan(0);
    expect(soReordenacao(diff)).toBe(true);
  });
  it("texto que muda não é reordenação", () => {
    expect(soReordenacao(diffLinhas(["a", "b"], ["b", "c"]))).toBe(false);
  });
  it("sem diferença → falso (nada a explicar)", () => {
    expect(soReordenacao([])).toBe(false);
  });
});

describe("aplicarIdentidadeCms", () => {
  const trocas = [
    { slugPagina: "proaps", slugCms: "proaps-plus", nomePagina: "Nome Antigo", nomeCms: "Nome Novo" },
    { slugPagina: "pear", slugCms: "pear", nomePagina: "Pear Antigo", nomeCms: "Pear Antigo" },
  ];

  it("troca endereço e nome, sem tocar em slug que só começa igual", () => {
    const html =
      '<a href="/programas/proaps">Nome Antigo</a><a href="/programas/proaps/modulos/x">' +
      '</a><a href="/programas/proaps#topo"></a><a href="/programas/proapsx"></a>';
    expect(aplicarIdentidadeCms(html, trocas)).toBe(
      '<a href="/programas/proaps-plus">Nome Novo</a><a href="/programas/proaps-plus/modulos/x">' +
        '</a><a href="/programas/proaps-plus#topo"></a><a href="/programas/proapsx"></a>',
    );
  });

  it("sem diferença de identidade → HTML intacto", () => {
    const html = '<a href="/programas/pear">Pear Antigo</a>';
    expect(aplicarIdentidadeCms(html, trocas)).toBe(html);
  });
});

describe("normalizarProgramaContato", () => {
  const trocas = [
    { slugPagina: "proaps", slugCms: "proaps-plus", nomePagina: "A", nomeCms: "B" },
  ];
  it("leva o endereço do CMS à forma antiga e deixa o resto", () => {
    const html =
      '<a href="/contato?programa=proaps-plus">x</a><a href="/contato?programa=proaps&modalidade=trilha">y</a>';
    expect(normalizarProgramaContato(html, trocas)).toBe(
      '<a href="/contato?programa=proaps">x</a><a href="/contato?programa=proaps&modalidade=trilha">y</a>',
    );
  });
});
