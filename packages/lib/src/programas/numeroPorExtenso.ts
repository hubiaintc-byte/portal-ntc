const EXTENSO = [
  "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez",
  "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove", "Vinte",
];

/** Cardinal masculino por extenso, com inicial maiúscula, de 1 a 20; fora disso, os algarismos. */
export function numeroPorExtenso(n: number): string {
  return Number.isInteger(n) && n >= 1 && n <= 20 ? (EXTENSO[n - 1] as string) : String(n);
}
