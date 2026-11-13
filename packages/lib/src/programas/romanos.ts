const ROMANOS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

export function inteiroParaRomano(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 20) {
    throw new RangeError(`Numeral romano só de 1 a 20 (recebido ${n}).`);
  }
  return ROMANOS[n - 1] as string;
}
