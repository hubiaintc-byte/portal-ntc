/**
 * Os dois montadores de /contato que fazem cirurgia de string de verdade:
 * `montarHq`, que quebra o endereço do CMS em `<strong>` + `<br>`, e
 * `canaisDaVertical` (exercitado por `montarVerticais`), que monta o canal
 * de cada coordenação e tem dois ramos que nenhuma página exercita hoje —
 * vertical ausente no CMS e vertical sem `opcaoTelefone`.
 *
 * Também guarda o escape: esses dois campos vão para
 * `dangerouslySetInnerHTML`, e `enderecoCompleto`/`telefoneInstitucional`/
 * `opcaoTelefone` são texto livre editável por `editor-institucional`.
 */

import { describe, expect, it } from "vitest";

import { CONTATOS_FALLBACK, type Contatos } from "@/lib/contatos";

import { montarHq, montarVerticais } from "./conteudoContato";

function contatos(patch: Partial<Contatos> = {}): Contatos {
  return { ...CONTATOS_FALLBACK, ...patch };
}

function canais(c: Contatos, vertical: string): string | undefined {
  return montarVerticais(c).find((v) => v.vertical === vertical)?.canaisHtml;
}

describe("montarHq", () => {
  it("quebra o endereço de 3 linhas em <strong> + <br>, com a linha de contato no fim", () => {
    const c = contatos({
      endereco: "Razão Social\nRua Um, 10\nBairro · CEP 00000-000 · Cidade – UF",
      telefone: "(11) 4002-8922",
      emailInstitucional: "oi@exemplo.org",
    });
    expect(montarHq(c).enderecoHtml).toBe(
      "<strong>Razão Social</strong><br>Rua Um, 10<br>Bairro · CEP 00000-000 · Cidade – UF" +
        "<br>(11) 4002-8922 · oi@exemplo.org",
    );
  });

  it("aceita endereço de uma linha só, sem <br> sobrando antes da linha de contato", () => {
    const c = contatos({ endereco: "Razão Social" });
    expect(montarHq(c).enderecoHtml).toBe(
      `<strong>Razão Social</strong><br>${CONTATOS_FALLBACK.telefone} · ${CONTATOS_FALLBACK.emailInstitucional}`,
    );
  });

  it("tolera CRLF: o \\r não sobrevive no fim de cada linha", () => {
    const c = contatos({ endereco: "Razão Social\r\nRua Um, 10" });
    expect(montarHq(c).enderecoHtml).toContain("<strong>Razão Social</strong><br>Rua Um, 10<br>");
    expect(montarHq(c).enderecoHtml).not.toContain("\r");
  });

  it("escapa o que veio do CMS, sem escapar a marcação que ele mesmo monta", () => {
    const c = contatos({ endereco: '<img src=x onerror="alert(1)">\nLinha & cia' });
    const html = montarHq(c).enderecoHtml;
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("Linha &amp; cia");
    expect(html.startsWith("<strong>")).toBe(true);
  });

  it("mantém os campos que não dependem de contato", () => {
    expect(montarHq(CONTATOS_FALLBACK).cidade).toBe("Brasília · DF");
  });
});

describe("canaisDaVertical (via montarVerticais)", () => {
  it("usa e-mail da vertical + telefone institucional + opção", () => {
    expect(canais(CONTATOS_FALLBACK, "educacao")).toBe(
      "educacao@institutontc.com.br<br>(63) 3212-1199 · opção 1",
    );
  });

  it("cai no e-mail institucional quando a vertical não vem do CMS", () => {
    const c = contatos({
      verticais: CONTATOS_FALLBACK.verticais.filter((v) => v.vertical !== "saude"),
    });
    expect(canais(c, "saude")).toBe(
      `${CONTATOS_FALLBACK.emailInstitucional}<br>${CONTATOS_FALLBACK.telefone}`,
    );
  });

  it("sem opção de telefone, não deixa o ' · ' órfão no fim da linha", () => {
    const c = contatos({
      verticais: CONTATOS_FALLBACK.verticais.map((v) =>
        v.vertical === "saude" ? { ...v, opcaoTelefone: "" } : v,
      ),
    });
    expect(canais(c, "saude")).toBe(`saude@institutontc.com.br<br>${CONTATOS_FALLBACK.telefone}`);
  });

  it("escapa e-mail, telefone e opção vindos do CMS", () => {
    const c = contatos({
      telefone: "<b>tel</b>",
      verticais: CONTATOS_FALLBACK.verticais.map((v) =>
        v.vertical === "educacao" ? { ...v, opcaoTelefone: 'opção "1" & 2' } : v,
      ),
    });
    expect(canais(c, "educacao")).toBe(
      "educacao@institutontc.com.br<br>&lt;b&gt;tel&lt;/b&gt; · opção &quot;1&quot; &amp; 2",
    );
  });

  it("devolve sempre as 3 verticais, na ordem canônica", () => {
    expect(montarVerticais(CONTATOS_FALLBACK).map((v) => v.vertical)).toEqual([
      "educacao",
      "gestao-publica",
      "saude",
    ]);
  });
});
