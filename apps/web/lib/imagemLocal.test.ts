import { describe, expect, it } from "vitest";

import { fundoResponsivo, imageSetLocal, imgResponsiva, srcSetLocal } from "./imagemLocal";
import { LARGURAS_OTIMIZADAS } from "./imagensOtimizadasLarguras";

const BASE = "/img/fotos/_optimized";

describe("srcSetLocal", () => {
  it("usa a largura real e o .1920 quando .1280 e .1920 são o mesmo arquivo", () => {
    expect(srcSetLocal(`${BASE}/expert-01.1920.webp`)).toBe(
      `${BASE}/expert-01.640.webp 640w, ${BASE}/expert-01.1920.webp 1024w`,
    );
  });

  it("inclui o .1280 quando ele é de fato menor que o .1920", () => {
    expect(srcSetLocal(`${BASE}/hero-contato-escritorio-institucional.1920.webp`)).toBe(
      [
        `${BASE}/hero-contato-escritorio-institucional.640.webp 640w`,
        `${BASE}/hero-contato-escritorio-institucional.1280.webp 1280w`,
        `${BASE}/hero-contato-escritorio-institucional.1920.webp 1376w`,
      ].join(", "),
    );
  });

  it("codifica espaços do nome, que separam candidatos no srcset", () => {
    expect(srcSetLocal(`${BASE}/autoridade-saude - cópia.1920.webp`)).toBe(
      `${BASE}/autoridade-saude%20-%20c%C3%B3pia.640.webp 640w, ${BASE}/autoridade-saude%20-%20c%C3%B3pia.1920.webp 1184w`,
    );
  });

  it("não mexe em URL do CMS, SVG, vazia ou foto fora da tabela", () => {
    expect(srcSetLocal("/_next/image?url=x&w=640&q=75")).toBeUndefined();
    expect(srcSetLocal("/logos/logo-light.svg")).toBeUndefined();
    expect(srcSetLocal("")).toBeUndefined();
    expect(srcSetLocal(`${BASE}/nao-existe.1920.webp`)).toBeUndefined();
  });
});

describe("imgResponsiva", () => {
  it("mantém o src original e acrescenta srcSet e sizes", () => {
    const src = `${BASE}/expert-02.1920.webp`;
    expect(imgResponsiva(src, "170px")).toEqual({ src, srcSet: srcSetLocal(src), sizes: "170px" });
  });

  it("devolve só o src quando não há variantes", () => {
    expect(imgResponsiva("https://exemplo.com/a.png", "100vw")).toEqual({ src: "https://exemplo.com/a.png" });
  });
});

describe("imageSetLocal", () => {
  it("grande: só a maior variante, avif antes de webp", () => {
    expect(imageSetLocal(`${BASE}/area-educacao.1920.webp`)).toBe(
      `image-set(url("${BASE}/area-educacao.1920.avif") type("image/avif"), url("${BASE}/area-educacao.1920.webp") type("image/webp"))`,
    );
  });

  it("pequena: .640 em 1x e a maior em 2x", () => {
    expect(imageSetLocal(`${BASE}/area-saude.1920.webp`, "pequena")).toBe(
      "image-set(" +
        [
          `url("${BASE}/area-saude.640.avif") type("image/avif") 1x`,
          `url("${BASE}/area-saude.1920.avif") type("image/avif") 2x`,
          `url("${BASE}/area-saude.640.webp") type("image/webp") 1x`,
          `url("${BASE}/area-saude.1920.webp") type("image/webp") 2x`,
        ].join(", ") +
        ")",
    );
  });

});

describe("fundoResponsivo", () => {
  it("mantém o url() de sempre e acrescenta --fundo-set", () => {
    const src = `${BASE}/area-educacao.1920.webp`;
    expect(fundoResponsivo(src)).toEqual({ backgroundImage: `url('${src}')`, "--fundo-set": imageSetLocal(src) });
  });

  it("miniatura vai direto para o .640.webp, sem image-set", () => {
    expect(fundoResponsivo(`${BASE}/area-saude.1920.webp`, "miniatura")).toEqual({
      backgroundImage: `url('${BASE}/area-saude.640.webp')`,
    });
    expect(fundoResponsivo("/_next/image?url=x&w=640&q=75", "miniatura")).toEqual({
      backgroundImage: "url('/_next/image?url=x&w=640&q=75')",
    });
  });

  it("URL do CMS fica só com o url()", () => {
    expect(fundoResponsivo("/_next/image?url=x&w=828&q=75")).toEqual({
      backgroundImage: "url('/_next/image?url=x&w=828&q=75')",
    });
  });
});

describe("tabela de larguras", () => {
  it("nenhuma variante é mais larga que o nome, e as larguras crescem", () => {
    for (const [nome, [w640, w1280, w1920]] of Object.entries(LARGURAS_OTIMIZADAS)) {
      expect(w640, nome).toBeLessThanOrEqual(640);
      expect(w1280, nome).toBeLessThanOrEqual(1280);
      expect(w1920, nome).toBeLessThanOrEqual(1920);
      expect(w640 <= w1280 && w1280 <= w1920, nome).toBe(true);
    }
  });
});
