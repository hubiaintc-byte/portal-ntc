import { describe, expect, test } from "vitest";
import { formatarReais, hojeEmSaoPaulo, mesDe, paraCentavos } from "./dinheiro";

describe("dinheiro", () => {
  test("paraCentavos lê reais brasileiros", () => {
    expect(paraCentavos("1.234,56")).toBe(123456);
    expect(paraCentavos("1234,5")).toBe(123450);
    expect(paraCentavos("1234")).toBe(123400);
    expect(paraCentavos("R$ 10")).toBe(1000);
    expect(paraCentavos("abc")).toBeNull();
    expect(paraCentavos("1,2,3")).toBeNull();
  });
  test("paraCentavos recusa vazio, milhar malformado e mais de 2 casas", () => {
    expect(paraCentavos("")).toBeNull();
    expect(paraCentavos("12.34")).toBeNull();
    expect(paraCentavos("1,234")).toBeNull();
    expect(paraCentavos("-5")).toBeNull();
  });
  test("formatarReais", () => {
    expect(formatarReais(123456)).toBe("R$ 1.234,56");
    expect(formatarReais(0)).toBe("R$ 0,00");
    expect(formatarReais(5)).toBe("R$ 0,05");
    expect(formatarReais(-100000)).toBe("-R$ 1.000,00");
  });
  test("hoje é o dia de Brasília às 22h", () =>
    expect(hojeEmSaoPaulo(new Date("2026-07-16T01:00:00Z"))).toBe("2026-07-15"));
  test("mesDe", () => expect(mesDe("2026-07-15")).toBe("2026-07"));
});
