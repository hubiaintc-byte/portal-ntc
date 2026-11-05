import { describe, expect, it } from "vitest";

import { camposParaPagina, paginaVazia } from "./paginaPrograma";
import type { CamposPaginaPrograma, ExtrasEventos } from "./tipos";

const lexical = (texto: string) => ({
  root: { type: "root", children: [{ type: "paragraph", children: [{ type: "text", text: texto, format: 0 }] }] },
});

function minimo(): CamposPaginaPrograma {
  return {
    sigla: "NOVO",
    slug: "novo",
    nomeCompleto: "Programa Novo",
    vertical: "saude",
    cargaHorariaTotal: "",
    visaoGeral: lexical("Visão."),
    problema: null,
    objetivo: null,
    publicoAlvo: null,
    eixos: [],
    resultados: [],
    diferenciais: [],
    faq: [],
    modulos: [{ numero: 1, titulo: "Único", descricao: lexical("Desc."), topicos: [], cargaHoraria: "" }],
    pagina: paginaVazia(),
  };
}

const semExtras = (): ExtrasEventos => ({ modulosAbertos: {}, status: new Map() });

describe("camposParaPagina — campos mínimos", () => {
  it("não lança e omite os blocos opcionais", () => {
    const p = camposParaPagina(minimo(), semExtras());
    expect(p.docentes.coordenacao).toEqual([]);
    expect(p.docentes.especialistas).toEqual([]);
    expect(p.objetivoGeral).toBeUndefined();
    expect(p.ctaFinal).toBeUndefined();
    expect(p.sidebar).toBeUndefined();
    expect(p.diferenciais).toBeUndefined();
    expect(p.modulos.itens).toEqual([{ numero: "I", titulo: "Único", descricao: "Desc." }]);
    expect(p.modalidades.corpoHtml).toBe("");
    expect(p.visaoGeral.corpoHtml).toBe('<p class="lede-block">Visão.</p>');
  });

  it("siglaCss pela vertente usa o programa-modelo", () => {
    const c = minimo();
    expect(camposParaPagina(c, semExtras()).siglaCss).toBe("PROSUS");
    expect(camposParaPagina({ ...c, vertical: "educacao" }, semExtras()).siglaCss).toBe("EDUTEC");
    expect(camposParaPagina({ ...c, vertical: "gestao-publica" }, semExtras()).siglaCss).toBe("AGIP");
    const proprio = { ...c, pagina: { ...c.pagina, identidadeVisual: "PEAR" } };
    expect(camposParaPagina(proprio, semExtras()).siglaCss).toBe("PEAR");
  });

  it("deriva estatísticas, títulos e status", () => {
    const c = minimo();
    c.cargaHorariaTotal = "16 horas";
    c.modulos = [
      { numero: 1, titulo: "A", descricao: lexical("a"), topicos: ["t"], cargaHoraria: "8h" },
      { numero: 2, titulo: "B", descricao: lexical("b"), topicos: [], cargaHoraria: "8h" },
    ];
    const status = new Map([[2, { rotulo: "Inscrições abertas", tipo: "aberto" as const }]]);
    const p = camposParaPagina(c, { modulosAbertos: {}, status });
    expect(p.hero.stats.map((s) => s.num)).toEqual(["2", "16h", "0"]);
    expect(p.modulos.tituloHtml).toBe("Estrutura modular · <em>2 módulos</em>");
    expect(p.modulos.intro).toBe(
      "O NOVO é composto por 2 módulos sequenciais de 8 horas cada, totalizando 16 horas de formação executiva. Pode ser contratado como trilha completa ou módulo a módulo.",
    );
    expect(p.modulos.itens[0]?.statusTipo).toBeUndefined();
    expect(p.modulos.itens[1]).toMatchObject({ numero: "II", statusRotulo: "Inscrições abertas", statusTipo: "aberto" });
    expect(p.detalhamento?.itens[0]?.ctaInscricao).toBeUndefined();
    expect(p.detalhamento?.itens[1]?.ctaInscricao).toBe(true);
  });

  it("escapa o texto do painel nos campos HTML", () => {
    const c = minimo();
    c.pagina.heroTitulo = "A <script> **b**";
    const p = camposParaPagina(c, semExtras());
    expect(p.hero.tituloHtml).toBe("A &lt;script&gt; <strong>b</strong>");
  });

  it("título dos eixos acompanha a quantidade", () => {
    const c = minimo();
    const eixo = { titulo: "E", descricao: "d" };
    c.eixos = [eixo, eixo, eixo];
    const p = camposParaPagina(c, semExtras());
    expect(p.eixos.tituloHtml).toBe("Três <em>eixos estruturantes</em>");
    expect(p.eixos.titulo).toBe("Três eixos estruturantes");
    c.eixos = [eixo];
    expect(camposParaPagina(c, semExtras()).eixos.tituloHtml).toBe("Um <em>eixo estruturante</em>");
  });

  it("cartão de modalidade: escapa o texto e troca link proibido por #", () => {
    const c = minimo();
    const cartao = { destaque: false, tag: "a<b>", titulo: "T", descricao: "D", ctaRotulo: "Ir", ctaHref: "javascript:alert(1)" };
    c.pagina.modalidadesCards = [cartao, { ...cartao, ctaHref: '/x" onmouseover="alert(1)' }];
    const html = camposParaPagina(c, semExtras()).modalidades.corpoHtml;
    expect(html).toContain('<span class="tag">a&lt;b&gt;</span>');
    expect(html).toContain('<a class="cta" href="#">Ir</a>');
    expect(html).toContain('href="/x&quot; onmouseover=&quot;alert(1)"');
    expect(html).not.toContain("<b>");
    expect(html).not.toContain("javascript:");
  });

  it("resultado: escapa o texto", () => {
    const c = minimo();
    c.resultados = ["<img src=x onerror=alert(1)>"];
    const html = camposParaPagina(c, semExtras()).resultados.corpoHtml;
    expect(html).toContain("<p>&lt;img src=x onerror=alert(1)&gt;</p>");
    expect(html).not.toContain("<img");
  });
});
