import { describe, expect, it } from "vitest";

import type { DadosDocumentoProposta } from "../dados";
import { secoesComerciais } from "./comercial";

const BASE: DadosDocumentoProposta = {
  id: "1",
  codigo: "COD-v01",
  codigoBase: "COD",
  versao: 1,
  tipoTexto: "Módulo Avulso",
  subtitulo: "Combo de Três Módulos · SIG",
  modalidade: "Online ao vivo",
  replay: "120 dias",
  condPagto: "Em 30 dias após a NF",
  condEspecificas: "",
  dataCriacaoISO: "2026-05-14T12:00:00.000Z",
  validadeISO: "2026-06-13T12:00:00.000Z",
  elaboradorNome: "Ana",
  clienteOrgao: "Secretaria de Teste <X>",
  clienteSigla: "SET",
  clienteUf: "TO",
  clienteMunicipio: "Cidade",
  clienteDirigente: "Fulano",
  programaNome: "Programa de Teste",
  programaSigla: "PTE",
  itens: [],
  cargaHorariaTotalModulos: "24h · 3 módulos · 8h por módulo",
  conteudoHtml: {
    apresentacao: "", contexto: "", objetivos: "", publicoAlvo: "", metodologia: "", eventon: "",
    certificacaoReplay: "", cancelamento: "", protecaoConteudo: "", fundamentacaoLegal: "",
    proximosPassos: "", fechamento: "",
  },
  eixos: [], diferenciais: [], resultados: [], docentes: [],
  modulosDetalhados: [
    { codigo: "M01", titulo: "Alfa & Beta", cargaHoraria: "8h", ementaHtml: "" },
    { codigo: "M02", titulo: "Gama", cargaHoraria: "8h", ementaHtml: "" },
    { codigo: "M04", titulo: "Delta", cargaHoraria: "8h", ementaHtml: "" },
  ],
  secoesExtras: [],
  valorUnitario: 1470,
  qtdPagantes: 1800,
  cortesias: 180,
  percDesconto: 35.4,
  valorBruto: 2646000,
  desconto: 935874,
  valorLiquido: 1710126,
};

const SUJO = /undefined|NaN|Infinity|null/;
const todo = (d: DadosDocumentoProposta) =>
  secoesComerciais(d).map((s) => s.corpoHtml).join("\n");
// Intl separa "R$" do valor com NBSP; o teste compara com espaço comum.
const porChave = (d: DadosDocumentoProposta, k: string) =>
  (secoesComerciais(d).find((s) => s.chave === k)?.corpoHtml ?? "").replace(/\u00a0/g, " ");

describe("secoesComerciais", () => {
  it("devolve as três chaves e títulos exatos, nesta ordem", () => {
    expect(secoesComerciais(BASE).map((s) => [s.chave, s.titulo])).toEqual([
      ["objeto", "Objeto da Proposta"],
      ["quadro-comercial", "Quadro Comercial"],
      ["condicoes-comerciais", "Condições Comerciais"],
    ]);
  });

  it("divisão exata: tabela por módulo com códigos e subtotais", () => {
    const q = porChave(BASE, "quadro-comercial");
    for (const t of ["M01", "M02", "M04", "Alfa &amp; Beta", "600 + 60", "R$ 570.042,00"])
      expect(q).toContain(t);
    expect(q).toContain("(600 × 3 módulos)");
    expect(q).toContain("(60 × 3 módulos)");
  });

  it("divisão não exata: sem tabela por módulo, resumo completo", () => {
    const q = porChave({ ...BASE, qtdPagantes: 1000, valorLiquido: 950070 }, "quadro-comercial");
    expect(q).not.toContain("M01");
    expect(q).not.toContain("×");
    expect(q).toContain("Resumo Financeiro");
    expect(q).toContain("VALOR LÍQUIDO DA PROPOSTA");
    expect(q).toContain("R$ 950,07");
  });

  it("resumo traz tabela, desconto por inscrição, pagantes, cortesias, acessos, bruto, desconto e líquido", () => {
    const q = porChave(BASE, "quadro-comercial");
    for (const t of [
      "R$ 1.470,00", "R$ 950,07", "1.800", "180", "1.980",
      "R$ 2.646.000,00", "35,4%", "R$ 935.874,00", "R$ 1.710.126,00",
    ])
      expect(q).toContain(t);
  });

  it("moeda sempre com centavos", () => {
    const q = porChave(BASE, "quadro-comercial");
    expect(q).toContain("R$ 950,07");
    expect(q).not.toMatch(/R\$\s?950(?![,\d])/);
  });

  it("qtdPagantes 0 não produz NaN/Infinity", () => {
    const h = todo({ ...BASE, qtdPagantes: 0, cortesias: 0, valorLiquido: 0, valorBruto: 0, desconto: 0 });
    expect(h).not.toMatch(SUJO);
  });

  it("caso completo não vaza sujeira e escapa HTML", () => {
    const h = todo(BASE);
    expect(h).not.toMatch(SUJO);
    expect(h).toContain("Secretaria de Teste &lt;X&gt;");
    expect(h).not.toContain("<X>");
  });

  it("carga horária vazia vira travessão", () => {
    const q = porChave(
      { ...BASE, modulosDetalhados: BASE.modulosDetalhados.map((m) => ({ ...m, cargaHoraria: "" })) },
      "quadro-comercial",
    );
    expect(q).toContain("<td>—</td>");
  });

  it("objeto é gerado com os dados e sem dado ausente afirmado", () => {
    const o = porChave(BASE, "objeto");
    for (const t of [
      "3 módulos-evento do Programa Estratégico PTE",
      "Módulo 01 · Alfa &amp; Beta",
      "Módulo 04 · Delta",
      "24 horas formativas",
      "Online ao vivo",
      "1.800 inscrições pagantes",
      "180 cortesias institucionais",
    ])
      expect(o).toContain(t);
    const vazio = porChave(
      { ...BASE, modulosDetalhados: [], cargaHorariaTotalModulos: "", modalidade: "A definir", qtdPagantes: 0, cortesias: 0 },
      "objeto",
    );
    expect(vazio).not.toMatch(SUJO);
    expect(vazio).not.toContain("horas formativas");
    expect(vazio).not.toContain("A definir");
    expect(vazio).not.toContain("inscrições pagantes");
  });

  it("condições: caixas e cláusulas; específicas só quando preenchidas", () => {
    const c = porChave(BASE, "condicoes-comerciais");
    for (const t of ["Em 30 dias após a NF", "13/06/2026", "120 dias", "Cláusulas Comerciais Complementares"])
      expect(c).toContain(t);
    expect(c).not.toContain("<h3>Condições Específicas</h3>");
    const c2 = porChave({ ...BASE, condEspecificas: "Texto <b>x</b>" }, "condicoes-comerciais");
    expect(c2).toContain("<h3>Condições Específicas</h3>");
    expect(c2).toContain("Texto &lt;b&gt;x&lt;/b&gt;");
  });

  it("1 módulo: singular em todas as seções", () => {
    const d = {
      ...BASE,
      modulosDetalhados: [BASE.modulosDetalhados[0]!],
      qtdPagantes: 600,
      cortesias: 60,
      valorLiquido: 570042,
    };
    const h = todo(d).replace(/\u00a0/g, " ");
    expect(h).not.toMatch(/\b1 módulos\b/);
    expect(h).toContain("ao longo do 1 módulo contratado");
    expect(h).toContain("(600 × 1 módulo)");
    expect(h).toContain("1 módulo-evento do Programa");
  });

  it("objeto: módulo sem código legível zera a contagem (todo-ou-nada)", () => {
    // Regra única do documento (documentoProposta/modulos.ts): contar só os
    // legíveis mudaria a base da divisão do Quadro e produziria números que não
    // fecham. Sem contagem, a frase não afirma quantidade nenhuma.
    const d = {
      ...BASE,
      modulosDetalhados: [
        BASE.modulosDetalhados[0]!,
        { codigo: "", titulo: "Sem", cargaHoraria: null, ementaHtml: "" },
      ],
    };
    const o = porChave(d, "objeto");
    expect(o).toContain("<strong>módulos-evento do Programa Estratégico PTE</strong>");
    expect(o).not.toMatch(/\b\d+ módulos?-evento\b/);
    expect(o).not.toContain("Módulo 01");
    // E o Quadro Comercial continua sem tabela por módulo, como antes.
    expect(porChave(d, "quadro-comercial")).not.toContain("Pagantes + Cortesias");
  });

  it("objeto: sem módulo legível e com item contratado, NOMEIA o item", () => {
    // Proposta de produto/evento avulso: antes da fix wave o nome do evento não
    // aparecia em lugar nenhum do PDF (regressão em relação à Fase B2).
    const o = porChave(
      {
        ...BASE,
        modulosDetalhados: [],
        itens: [{ rotulo: "Seminário Nacional de Gestão", cargaHoraria: "4h", valorUnitario: 1470 }],
      },
      "objeto",
    );
    expect(o).toContain("Seminário Nacional de Gestão");
    expect(o).toContain("1 módulo-evento");
  });

  it("quadro: sem módulo legível e com item contratado, imprime a tabela de itens", () => {
    const q = porChave(
      {
        ...BASE,
        modulosDetalhados: [],
        itens: [
          { rotulo: "Seminário Nacional de Gestão", cargaHoraria: "4h", valorUnitario: 1470 },
          { rotulo: "Oficina de Indicadores", cargaHoraria: "", valorUnitario: 1470 },
        ],
      },
      "quadro-comercial",
    );
    expect(q).toContain("Seminário Nacional de Gestão");
    expect(q).toContain("Oficina de Indicadores");
    expect(q).toContain("<th>Item</th><th>CH</th>");
    // Sem quantitativo por item: distribuir pagantes por evento não foi modelado.
    expect(q).not.toContain("Pagantes + Cortesias");
    expect(q).not.toMatch(SUJO);
  });

  it("quadro: sem pagantes, omite tabela por módulo e as linhas de pagantes", () => {
    // Decisão da fix wave: o caso zero omite nos DOIS lados — o Resumo
    // Executivo já omitia os cards de pagantes e de valor por inscrição.
    const q = porChave({ ...BASE, qtdPagantes: 0, valorBruto: 0, desconto: 0, valorLiquido: 0 }, "quadro-comercial");
    expect(q).not.toContain("Pagantes + Cortesias");
    expect(q).not.toContain("Inscrições pagantes total");
    expect(q).not.toContain("Valor com desconto institucional por inscrição");
    expect(q).toContain("Apresentamos o quadro de investimento da presente proposta.");
    expect(q).toContain("Cortesias institucionais total");
    expect(q).not.toMatch(SUJO);
  });

  it("condições específicas: parágrafos por linha em branco", () => {
    const c = porChave({ ...BASE, condEspecificas: "Um\n\nDois\nainda dois" }, "condicoes-comerciais");
    expect(c).toContain("<p>Um</p>");
    expect(c).toContain("<p>Dois<br>ainda dois</p>");
  });

  it("nenhum literal do caso do modelo vaza", () => {
    expect(todo(BASE)).not.toMatch(/Palmas|SEMED|EDUTEC|1\.470 |180 dias|1,800/);
  });
});
