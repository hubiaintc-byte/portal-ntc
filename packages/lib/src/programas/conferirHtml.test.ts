import { describe, expect, it } from "vitest";

import {
  compararPaginas,
  diffLinhas,
  extrairMain,
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
