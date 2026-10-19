import { describe, expect, it } from "vitest";
import {
  aplicarCardDe,
  cardDoEspecialista,
  ctaHrefPermitido,
  idEspecialistaDoCard,
  ListaDesatualizadaError,
  reordenarCards,
  sanitizarHtmlCard,
  TEXTOS_CARD_VAZIOS,
  type CardDesejado,
  type CardGlobal,
} from "./cardsCorpoDocente";

const cards = (): CardGlobal[] => [
  { id: "a", formato: "featured", especialista: 4, tag: "Autoridade", metaAtuacao: "Atuação", programasTexto: null },
  { id: "x", formato: "axis", especialista: null, tituloAxis: "Eixo" },
  { id: "b", formato: "expert", especialista: 12, programasStrong: "SIGA" },
  { id: "c", formato: "expert", especialista: { id: 7 } as never },
];

const desejo = (formato: "featured" | "expert", extra = {}): CardDesejado => ({
  formato,
  textos: { ...TEXTOS_CARD_VAZIOS, ...extra },
});

describe("cardDoEspecialista", () => {
  it("devolve vazio no lugar de null e null sem card", () => {
    const d = cardDoEspecialista(cards(), "4");
    expect(d?.formato).toBe("featured");
    expect(d?.textos.tag).toBe("Autoridade");
    expect(d?.textos.metaEixos).toBe("");
    expect(cardDoEspecialista(cards(), "99")).toBeNull();
  });
});

describe("idEspecialistaDoCard", () => {
  it("aceita número e objeto populado", () => {
    expect(idEspecialistaDoCard(cards()[0]!)).toBe("4");
    expect(idEspecialistaDoCard(cards()[3]!)).toBe("7");
    expect(idEspecialistaDoCard(cards()[1]!)).toBeNull();
  });
});

describe("aplicarCardDe", () => {
  it("acrescenta no fim quando não há card", () => {
    const r = aplicarCardDe(cards(), "9", desejo("expert", { tag: "T" }));
    expect(r).toHaveLength(5);
    expect(r[4]).toMatchObject({ formato: "expert", especialista: 9, tag: "T" });
  });

  it("troca na mesma posição preservando o id", () => {
    const r = aplicarCardDe(cards(), "12", desejo("featured", { metaAtuacao: "M" }));
    expect(r[2]).toMatchObject({ id: "b", formato: "featured", especialista: 12, metaAtuacao: "M" });
    expect(r).toHaveLength(4);
  });

  it("zera campos do outro formato e vira null no texto vazio", () => {
    const f = aplicarCardDe(cards(), "9", desejo("featured", { programasTexto: "p", metaAtuacao: "m" }))[4]!;
    expect(f.programasTexto).toBeNull();
    expect(f.programasStrong).toBeNull();
    expect(f.sufixoPrograma).toBeNull();
    expect(f.metaAtuacao).toBe("m");
    expect(f.metaEixos).toBeNull();
    const e = aplicarCardDe(cards(), "9", desejo("expert", { programasTexto: "p", metaAtuacao: "m" }))[4]!;
    expect(e.metaAtuacao).toBeNull();
    expect(e.metaEixos).toBeNull();
    expect(e.programasTexto).toBe("p");
    expect(e.tag).toBeNull();
  });

  it("remove o card com null e mantém a ordem", () => {
    const r = aplicarCardDe(cards(), "12", null);
    expect(r.map((c) => c.id)).toEqual(["a", "x", "c"]);
  });

  it("especialista sem card e desejo null devolve o array igual", () => {
    const base = cards().slice(0, 3);
    expect(aplicarCardDe(base, "99", null)).toEqual(base);
  });

  it("não toca nem move o axis", () => {
    const r = aplicarCardDe(cards(), "4", desejo("expert"));
    expect(r[1]).toEqual(cards()[1]);
  });

  it("grava especialista populado de volta como número", () => {
    const r = aplicarCardDe(cards(), "9", desejo("expert"));
    for (const c of r.filter((x) => x.formato !== "axis")) {
      expect(typeof c.especialista).toBe("number");
    }
    expect(r[3]?.especialista).toBe(7);
  });
});

describe("reordenarCards", () => {
  it("reordena pessoas e mantém axis nas posições absolutas", () => {
    const r = reordenarCards(cards(), ["12", "7", "4"]);
    expect(r.map((c) => c.id)).toEqual(["b", "x", "c", "a"]);
    expect(r[1]?.formato).toBe("axis");
    expect(r.filter((c) => c.formato !== "axis").every((c) => typeof c.especialista === "number")).toBe(true);
  });

  it("lança com id faltando, sobrando ou repetido", () => {
    expect(() => reordenarCards(cards(), ["12", "4"])).toThrow(ListaDesatualizadaError);
    expect(() => reordenarCards(cards(), ["12", "7", "4", "5"])).toThrow(ListaDesatualizadaError);
    expect(() => reordenarCards(cards(), ["12", "12", "4"])).toThrow(ListaDesatualizadaError);
  });
});

describe("sanitizarHtmlCard", () => {
  it("mantém só <strong> e </strong> literais", () => {
    expect(sanitizarHtmlCard("Atuação · <strong>STF</strong>")).toBe("Atuação · <strong>STF</strong>");
  });

  it("escapa qualquer outra marcação, atributos e aspas", () => {
    expect(sanitizarHtmlCard('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
    expect(sanitizarHtmlCard("<script>x</script>")).toBe("&lt;script&gt;x&lt;/script&gt;");
    expect(sanitizarHtmlCard('<strong onclick="x">a</strong>')).toBe(
      "&lt;strong onclick=&quot;x&quot;&gt;a</strong>",
    );
    expect(sanitizarHtmlCard("<STRONG>a</STRONG>")).toBe("&lt;STRONG&gt;a&lt;/STRONG&gt;");
    expect(sanitizarHtmlCard("d'Ávila")).toBe("d&#39;Ávila");
  });

  it("escapa & solto, sem dobrar entidade já gravada (o texto volta ao formulário e é salvo de novo)", () => {
    expect(sanitizarHtmlCard("Gestão & Saúde")).toBe("Gestão &amp; Saúde");
    expect(sanitizarHtmlCard("Gestão &amp; Saúde &middot; &#183;")).toBe("Gestão &amp; Saúde &middot; &#183;");
    expect(sanitizarHtmlCard(sanitizarHtmlCard("a & <b>"))).toBe(sanitizarHtmlCard("a & <b>"));
  });
});

describe("aplicarCardDe — HTML dos campos que o site injeta", () => {
  it("sanitiza metaAtuacao e metaEixos ao montar o card featured", () => {
    const r = aplicarCardDe([], "5", {
      formato: "featured",
      textos: { ...TEXTOS_CARD_VAZIOS, metaAtuacao: "<em>x</em> <strong>y</strong>", metaEixos: "<a href=j>z</a>" },
    });
    expect(r[0]!.metaAtuacao).toBe("&lt;em&gt;x&lt;/em&gt; <strong>y</strong>");
    expect(r[0]!.metaEixos).toBe("&lt;a href=j&gt;z&lt;/a&gt;");
  });
});

describe("ctaHrefPermitido", () => {
  it.each(["", "/programas/edutec", "#agenda", "https://ntc.org.br", "http://x.br", "mailto:a@b.br", " /x "])(
    "aceita %j",
    (href) => expect(ctaHrefPermitido(href)).toBe(true),
  );

  it.each(["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,x", "vbscript:x", "programas/edutec", "ftp://x"])(
    "recusa %j",
    (href) => expect(ctaHrefPermitido(href)).toBe(false),
  );
});
