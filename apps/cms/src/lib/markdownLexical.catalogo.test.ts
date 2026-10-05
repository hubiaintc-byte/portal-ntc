import { describe, expect, it } from "vitest";

import { mapearPrograma } from "@/lib/cms/importacaoProgramas/mapear";
import type { ProgramaInstantaneo } from "@/lib/cms/importacaoProgramas/tipos";
import instantaneo from "@/seed/assets/programas.json";

import { idaEVoltaPreserva, markdownParaLexical } from "./markdownLexical";

function paragrafo(...filhos: unknown[]) {
  return { root: { type: "root", children: [{ type: "paragraph", children: filhos }] } };
}

describe("idaEVoltaPreserva", () => {
  it("texto com negrito e itálico separados sobrevive", () => {
    expect(idaEVoltaPreserva(markdownParaLexical("Um **forte** e *suave*.\n\n- item\n- outro"))).toBe(true);
  });
  it("negrito+itálico no mesmo trecho é perda (o Markdown leve só guarda o negrito)", () => {
    expect(idaEVoltaPreserva(paragrafo({ type: "text", text: "ambos", format: 3 }))).toBe(false);
  });
  it("sublinhado é ignorado na comparação — não é formato que o painel edita", () => {
    expect(idaEVoltaPreserva(paragrafo({ type: "text", text: "sub", format: 8 }))).toBe(true);
  });
  it("documento vazio ou nulo preserva", () => {
    expect(idaEVoltaPreserva(null)).toBe(true);
  });
});

describe("conteúdo real dos 15 programas (instantâneo de 30/09)", () => {
  const programas = (instantaneo as { programas: ProgramaInstantaneo[] }).programas;
  const perdas: string[] = [];
  const verificados: unknown[] = [];
  for (const p of programas) {
    const { campos, modulos } = mapearPrograma(p);
    const textos = { visaoGeral: campos.visaoGeral, problema: campos.problema, objetivo: campos.objetivo, publicoAlvo: campos.publicoAlvo };
    for (const [chave, doc] of Object.entries(textos)) {
      if (doc) verificados.push(doc);
      if (doc && !idaEVoltaPreserva(doc)) perdas.push(`${p.sigla}.${chave}`);
    }
    for (const m of modulos) verificados.push(m.ementa);
    for (const m of modulos) if (!idaEVoltaPreserva(m.ementa)) perdas.push(`${p.sigla}.M${m.numero}.ementa`);
  }

  it("controle positivo: cobre os 15 programas e há texto em negrito entre os documentos verificados", () => {
    expect(programas).toHaveLength(15);
    expect(/"format":\s*1\b/.test(JSON.stringify(verificados))).toBe(true);
  });

  it("enumera os campos com perda no round-trip (decide se o aviso da tela aparece na prática)", () => {
    // Se este snapshot mudar, a lista de campos com perda mudou: revisar o aviso por campo da tela.
    expect(perdas).toMatchSnapshot();
  });
});
