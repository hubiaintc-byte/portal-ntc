import { describe, expect, it } from "vitest";

import { numeroPorExtenso } from "./numeroPorExtenso";

describe("numeroPorExtenso", () => {
  it.each([
    [1, "Um"],
    [3, "Três"],
    [4, "Quatro"],
    [9, "Nove"],
    [15, "Quinze"],
    [20, "Vinte"],
    [21, "21"],
    [0, "0"],
  ])("%i → %s", (n, esperado) => expect(numeroPorExtenso(n)).toBe(esperado));
});
