import { describe, expect, it } from "vitest";

import { estadoInicialRascunho, reduzirRascunho } from "./rascunhoSecao";

/**
 * A regra do rascunho de uma seção do conteúdo da proposta. O caso 1 é o
 * Critical do fix round 1: salvar revertia a tela para o texto de antes, e um
 * segundo salvar gravava esse texto velho por cima do bom.
 */

const V0 = "Texto do servidor.";
const V1 = "Texto reescrito pelo PO.";
const V2 = "Texto reescrito de novo.";

describe("reduzirRascunho — salvar não reverte", () => {
  it("depois de salvar, o valor é o salvo, e a prop velha chegando de novo NÃO reverte", () => {
    let e = estadoInicialRascunho(V0);
    e = reduzirRascunho(e, { tipo: "mudar", valor: V1 });
    expect(e.valor).toBe(V1);
    expect(e.sujo).toBe(true);

    e = reduzirRascunho(e, { tipo: "salvo", valor: V1 });
    expect(e.valor).toBe(V1);
    expect(e.sujo).toBe(false);

    // Re-renderização imediata: a prop continua V0 (salvar não recarrega o
    // detalhe). Antes do fix, era aqui que a tela voltava para V0.
    const depois = reduzirRascunho(e, { tipo: "prop", valorInicial: V0 });
    expect(depois).toBe(e);
    expect(depois.valor).toBe(V1);
  });

  it("salvar duas vezes seguidas nunca regrava o texto antigo", () => {
    let e = estadoInicialRascunho(V0);
    e = reduzirRascunho(e, { tipo: "mudar", valor: V1 });
    e = reduzirRascunho(e, { tipo: "salvo", valor: V1 });
    e = reduzirRascunho(e, { tipo: "prop", valorInicial: V0 }); // renderização
    e = reduzirRascunho(e, { tipo: "mudar", valor: V2 });
    expect(e.valor).toBe(V2);
    e = reduzirRascunho(e, { tipo: "salvo", valor: V2 });
    expect(e.valor).toBe(V2);
    expect(e.ultimoSalvo).toBe(V2);
  });
});

describe("reduzirRascunho — prop", () => {
  it("prop com conteúdo novo reseta valor, último salvo e sujo", () => {
    let e = estadoInicialRascunho(V0);
    e = reduzirRascunho(e, { tipo: "mudar", valor: V1 });
    const restaurado = "Texto padrão restaurado.";
    e = reduzirRascunho(e, { tipo: "prop", valorInicial: restaurado });
    expect(e.valor).toBe(restaurado);
    expect(e.ultimoSalvo).toBe(restaurado);
    expect(e.sujo).toBe(false);
  });

  it("prop com o MESMO conteúdo e identidade nova devolve o mesmo estado (não descarta rascunho)", () => {
    let e = estadoInicialRascunho([{ titulo: "Eixo 1", descricao: "Base." }]);
    e = reduzirRascunho(e, { tipo: "mudar", valor: [{ titulo: "Eixo 1 editado", descricao: "Base." }] });
    const igualEmConteudo = [{ titulo: "Eixo 1", descricao: "Base." }];
    const depois = reduzirRascunho(e, { tipo: "prop", valorInicial: igualEmConteudo });
    expect(depois).toBe(e);
    expect(depois.valor).toEqual([{ titulo: "Eixo 1 editado", descricao: "Base." }]);
    expect(depois.sujo).toBe(true);
  });
});

describe("reduzirRascunho — desfazer", () => {
  it("volta para o ÚLTIMO SALVO, não para a prop original", () => {
    let e = estadoInicialRascunho(V0);
    e = reduzirRascunho(e, { tipo: "mudar", valor: V1 });
    e = reduzirRascunho(e, { tipo: "salvo", valor: V1 });
    e = reduzirRascunho(e, { tipo: "mudar", valor: V2 });
    e = reduzirRascunho(e, { tipo: "desfazer" });
    expect(e.valor).toBe(V1);
    expect(e.sujo).toBe(false);
  });

  it("sem nenhum salvar, volta para o valor da prop", () => {
    let e = estadoInicialRascunho(V0);
    e = reduzirRascunho(e, { tipo: "mudar", valor: V1 });
    e = reduzirRascunho(e, { tipo: "desfazer" });
    expect(e.valor).toBe(V0);
    expect(e.sujo).toBe(false);
  });
});

describe("estadoInicialRascunho", () => {
  it("nasce limpo, com a prop como valor e como último salvo", () => {
    const e = estadoInicialRascunho(V0);
    expect(e).toEqual({ marcaProp: JSON.stringify(V0), valor: V0, ultimoSalvo: V0, sujo: false });
  });
});
