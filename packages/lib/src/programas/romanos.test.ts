import { describe, expect, it } from "vitest";
import { inteiroParaRomano } from "./romanos";

describe("inteiroParaRomano", () => {
  it("converte 1..20", () => {
    expect(inteiroParaRomano(4)).toBe("IV");
    expect(inteiroParaRomano(8)).toBe("VIII");
    expect(inteiroParaRomano(20)).toBe("XX");
  });
  it("lança fora do intervalo", () => {
    expect(() => inteiroParaRomano(0)).toThrow(RangeError);
    expect(() => inteiroParaRomano(21)).toThrow(RangeError);
  });
});
