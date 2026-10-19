import { afterEach, describe, expect, it } from "vitest";

import { bucketPrivadoConfigurado, nomeComSufixoAleatorio, protegerDocumentoComercial } from "./protegerDocumentoComercial";

const executar = (file: { name: string } | undefined, operation = "create") =>
  (protegerDocumentoComercial as unknown as (a: unknown) => void)({ req: { file }, operation });

describe("nomeComSufixoAleatorio", () => {
  it("acrescenta 8 hex antes da extensão", () => {
    expect(nomeComSufixoAleatorio("Contrato.pdf", "1a2b3c4d")).toBe("Contrato-1a2b3c4d.pdf");
    expect(nomeComSufixoAleatorio("Empenho-2026.final.pdf", "00ff00ff")).toBe("Empenho-2026.final-00ff00ff.pdf");
    expect(nomeComSufixoAleatorio("sem-extensao", "abcdef01")).toBe("sem-extensao-abcdef01");
  });

  it("não duplica o sufixo do PDF gerado da proposta", () => {
    expect(nomeComSufixoAleatorio("NTC-PROP-2026-X-v01-c1d53c64.pdf")).toBe("NTC-PROP-2026-X-v01-c1d53c64.pdf");
  });

  it("gera sufixos diferentes a cada chamada", () => {
    expect(nomeComSufixoAleatorio("a.pdf")).not.toBe(nomeComSufixoAleatorio("a.pdf"));
  });
});

describe("protegerDocumentoComercial", () => {
  const original = process.env.SUPABASE_BUCKET_PRIVADO;
  afterEach(() => {
    if (original === undefined) delete process.env.SUPABASE_BUCKET_PRIVADO;
    else process.env.SUPABASE_BUCKET_PRIVADO = original;
  });

  it("recusa o upload sem bucket privado configurado", () => {
    delete process.env.SUPABASE_BUCKET_PRIVADO;
    expect(bucketPrivadoConfigurado()).toBe(false);
    expect(() => executar({ name: "Contrato.pdf" })).toThrow(/SUPABASE_BUCKET_PRIVADO/);
  });

  it("com bucket privado, renomeia com sufixo", () => {
    process.env.SUPABASE_BUCKET_PRIVADO = "ntc-portal-documentos-comerciais";
    const file = { name: "Contrato.pdf" };
    executar(file);
    expect(file.name).toMatch(/^Contrato-[0-9a-f]{8}\.pdf$/);
  });

  it("não interfere sem arquivo (só metadados) nem fora de create/update", () => {
    delete process.env.SUPABASE_BUCKET_PRIVADO;
    expect(() => executar(undefined)).not.toThrow();
    expect(() => executar({ name: "x.pdf" }, "read")).not.toThrow();
  });
});
