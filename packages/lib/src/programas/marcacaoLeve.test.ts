import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { htmlInlineParaMarcacao, marcacaoParaHtml } from "./marcacaoLeve";

describe("marcacaoParaHtml", () => {
  it("itálico", () => {
    expect(marcacaoParaHtml("Leve o *EDUTEC* para a sua rede.")).toBe("Leve o <em>EDUTEC</em> para a sua rede.");
  });
  it("negrito", () => {
    expect(marcacaoParaHtml("**Lei 14.133/2021** em vigor")).toBe("<strong>Lei 14.133/2021</strong> em vigor");
  });
  it("escapa HTML e deixa asterisco sem par", () => {
    expect(marcacaoParaHtml("<script>alert(1)</script> & 5 * 3")).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt; &amp; 5 * 3",
    );
  });
});

describe("htmlInlineParaMarcacao", () => {
  it("em vira asterisco", () => {
    expect(htmlInlineParaMarcacao("Estrutura modular · <em>8 módulos</em>").texto).toBe(
      "Estrutura modular · *8 módulos*",
    );
  });
  it("tag desconhecida", () => {
    const r = htmlInlineParaMarcacao('ver <a href="/x">aqui</a>');
    expect(r.tagsDesconhecidas).toEqual(["a"]);
    expect(r.texto).toBe("ver aqui");
  });
  it("decodifica entidades", () => {
    expect(htmlInlineParaMarcacao("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39;").texto).toBe(`a & b <c> "d" 'e'`);
  });
});

function coletar(no: unknown, chave: string, saida: string[]): void {
  if (typeof no === "string") {
    if (chave.endsWith("Html")) saida.push(no);
  } else if (Array.isArray(no)) {
    no.forEach((x) => coletar(x, chave, saida));
  } else if (no && typeof no === "object") {
    for (const [k, v] of Object.entries(no)) coletar(v, k, saida);
  }
}

describe("ida e volta nos 15 programas", () => {
  it("campos *Html só com strong/em sobrevivem intactos", () => {
    const url = new URL("../../../../apps/cms/src/seed/assets/paginas-programas.json", import.meta.url);
    const json = JSON.parse(readFileSync(url, "utf8")) as { programas: unknown[] };
    const textos: string[] = [];
    coletar(json.programas, "", textos);
    expect(textos.length).toBeGreaterThan(15);
    let puladas = 0;
    for (const x of textos) {
      const r = htmlInlineParaMarcacao(x);
      if (r.tagsDesconhecidas.length > 0) {
        puladas += 1;
        continue;
      }
      expect(marcacaoParaHtml(r.texto)).toBe(x);
    }
    console.log(`ida e volta: ${textos.length} textos, ${puladas} com outras tags`);
  });
});
