# Motor A4/PDF de Propostas (Fase B2, fatia vertical) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar um PDF real (A4, com identidade visual do site) a partir de uma proposta já registrada no CRM (Fase B1), cobrindo capa + 3 seções essenciais (Identificação, Quadro Comercial, Condições Comerciais) — ponta a ponta, do clique em "Gerar PDF" até o arquivo salvo e vinculado à proposta.

**Architecture:** Uma função pura monta o HTML completo do documento (capa full-bleed + seções numeradas dinamicamente, CSS inline com os tokens do site) a partir dos dados já modelados na Fase B1. Uma rota de preview expõe esse HTML pra conferência visual humana. Um motor de PDF baseado em Playwright (já dependência do monorepo) recebe essa MESMA string HTML — sem ir por rede — e renderiza via Chromium headless (`page.pdf()`), usando `headerTemplate`/`footerTemplate` nativos do Playwright em vez das margin boxes CSS (`@page { @top-left }`) que a engine legada usava e que o Chromium nunca suportou. O PDF resultante é salvo na coleção `media` (já aceita `application/pdf`) e vinculado à proposta.

**Tech Stack:** Next.js 15 App Router (Route Handler), Payload CMS 3 Local API, Playwright (`playwright-core` + `@sparticuz/chromium` para compatibilidade com a function serverless da Vercel), Vitest.

**Spec:** Não há spec dedicada da Fase B2 ainda — este plano parte da spec da Fase B1 (`docs/superpowers/specs/2026-07-22-crm-fase-b1-propostas-design.md`, seção "Fora de escopo (Fase B1) → Fase B2") e da engenharia reversa da engine legada em `NTC_Comercial_Premium.html` (funções `gerarHtmlProposta`, `commonHeader`, `corpoComercial`, `corpoCondicoes`, `buildSecoes`, `commonCss`, linhas ~2646-3500), feita nesta sessão. Decisões confirmadas com o usuário: (1) paleta do documento usa os tokens do site (`packages/ui/src/tokens.ts`), não a paleta própria do legado; (2) o PDF gerado é salvo e vinculado à proposta, não só baixado sob demanda; (3) esta primeira fatia cobre capa + Identificação + Quadro Comercial + Condições Comerciais — as ~15 seções descritivas restantes (Apresentação, Metodologia, Diferenciais etc.) ficam para uma sessão seguinte, dependendo também da Biblioteca Comercial (Fase B2 seguinte) para ter conteúdo institucional de verdade.

## Global Constraints

- TypeScript strict, sem `any` (CLAUDE.md §4.4).
- Componentes/funções de domínio NTC em português; conceitos técnicos puros em inglês (CLAUDE.md §4.2).
- Imports absolutos via `@/...`; tipos do Payload vêm de `@ntc/types` (CLAUDE.md §4.3-4.4).
- Cores/fontes SEMPRE dos tokens (`packages/ui/src/tokens.ts`) — decisão confirmada nesta sessão para o documento de proposta (CLAUDE.md §3, §5.2).
- Nenhuma dependência nova sem sinalizar (CLAUDE.md §5.4) — este plano adiciona `playwright-core` e `@sparticuz/chromium` a `apps/cms/package.json`; ambas leves, sem browsers embutidos no pacote, padrão de mercado para PDF em serverless. Sinalizado ao usuário nesta sessão.
- Commits pequenos, em português, Conventional Commits (CLAUDE.md §7.2). Branch `feat/crm-fase-b2-motor-pdf`, sem push até ordem explícita (padrão do projeto).
- Alteração de schema (`Propostas.pdfGerado`) exige `pnpm payload:push:schema` MANUAL, com dev parado, diff antes, resposta N a qualquer prompt de DATA LOSS (CLAUDE.md §14) — quem roda é o usuário/PO, não o executor deste plano.
- Simplificação deliberada e documentada nesta sessão: o cabeçalho/rodapé do Playwright aparece em TODAS as páginas, incluindo a capa (a engine legada tentava evitar isso via CSS que o Chromium nunca respeitou de qualquer forma — não é uma regressão real). Separar a capa exigiria mesclar dois PDFs com uma lib adicional (`pdf-lib`) — fica para uma sessão futura se o resultado visual incomodar.

---

## Mapeamento de tipos do Payload usados neste plano

(Conferido em `packages/types/src/payload-types.ts` nesta sessão — evita nomes de campo inventados.)

- `Proposta`: `id`, `codigoBase`, `codigo`, `versao`, `cliente: number | ClienteCrm`, `programa?: number | Programa`, `tipo?: 'programa-completo'|'modulo-avulso'|'produto-evento-avulso'|'customizada'`, `modulos?: (number|Modulo)[]`, `eventos?: (number|Evento)[]`, `valorUnitario`, `qtdPagantes`, `cortesias`, `percDesconto`, `valorBruto`, `desconto`, `valorLiquido`, `modalidade`, `replay`, `condPagto`, `condEspecificas`, `elaborador?: number | User`, `dataCriacao`, `validade`.
- `ClienteCrm`: `orgao`, `sigla`, `municipio`, `uf`, `dirigente`, `cargoDirigente`.
- `Programa`: `sigla`, `nomeCompleto`, `cargaHorariaTotal`.
- `Modulo`: `numero: number`, `titulo: string`, `cargaHoraria?: string`.
- `Evento`: `nome: string`, `cargaHoraria: string`.
- `User`: `nome: string`.
- `Media` já aceita `application/pdf` em `upload.mimeTypes` (`apps/cms/src/collections/Media.ts:45`) — sem alteração necessária nessa coleção.

---

### Task 1: Dados do documento — busca e montagem

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/dados.ts`
- Test: `apps/cms/src/lib/documentoProposta/dados.test.ts`

**Interfaces:**
- Produces: `DadosDocumentoProposta` (interface completa abaixo) e `obterDadosDocumentoProposta(id: string): Promise<DadosDocumentoProposta | null>`, usados pelas Tasks 2 e 3.

- [ ] **Step 1: Escrever o teste (mockando `obterPayload`, mesmo padrão de `painelCrmEscrita.versao.test.ts`)**

```typescript
// apps/cms/src/lib/documentoProposta/dados.test.ts
import { describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const { obterDadosDocumentoProposta } = await import("./dados");

describe("obterDadosDocumentoProposta", () => {
  it("resolve cliente, programa, módulos e eventos populados", async () => {
    const propostaFalsa = {
      id: 42,
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      codigoBase: "NTC-PROP-2026-PROGE-SP-X",
      versao: 1,
      tipo: "programa-completo",
      status: "rascunho",
      modalidade: "Presencial",
      replay: null,
      condPagto: "À vista após NF · 15 dias",
      condEspecificas: null,
      dataCriacao: "2026-08-29T12:00:00.000Z",
      validade: "2026-09-28T12:00:00.000Z",
      elaborador: { id: 5, nome: "Ana Comercial" },
      cliente: {
        id: 3,
        orgao: "Secretaria de Educação de São Paulo",
        sigla: "SEDUC-SP",
        municipio: "São Paulo",
        uf: "SP",
        dirigente: "Fulano de Tal",
      },
      programa: { id: 7, sigla: "PROGE", nomeCompleto: "Programa de Gestão Estratégica" },
      modulos: [{ id: 1, numero: 1, titulo: "Gestão Democrática", cargaHoraria: "40h" }],
      eventos: [],
      valorUnitario: 100,
      qtdPagantes: 10,
      cortesias: 2,
      percDesconto: 10,
      valorBruto: 1000,
      desconto: 100,
      valorLiquido: 900,
    };
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue(propostaFalsa),
    });

    const dados = await obterDadosDocumentoProposta("42");

    expect(dados).not.toBeNull();
    expect(dados?.clienteOrgao).toBe("Secretaria de Educação de São Paulo");
    expect(dados?.programaNome).toBe("Programa de Gestão Estratégica");
    expect(dados?.tipoTexto).toBe("Trilha Completa de Programa Estratégico");
    expect(dados?.itens).toEqual([
      { rotulo: "M1 · Gestão Democrática", cargaHoraria: "40h", valorUnitario: 100 },
    ]);
    expect(dados?.elaboradorNome).toBe("Ana Comercial");
  });

  it("devolve null quando a proposta não existe", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockRejectedValue(new Error("not found")),
    });

    const dados = await obterDadosDocumentoProposta("999");

    expect(dados).toBeNull();
  });

  it("usa fallbacks quando cliente/programa/elaborador não estão populados", async () => {
    obterPayloadMock.mockResolvedValue({
      findByID: vi.fn().mockResolvedValue({
        id: 1,
        codigo: "NTC-PROP-2026-X-v01",
        codigoBase: "NTC-PROP-2026-X",
        versao: 1,
        tipo: "customizada",
        cliente: 3, // não populado (id cru)
        programa: null,
        modulos: [],
        eventos: [],
        elaborador: null,
      }),
    });

    const dados = await obterDadosDocumentoProposta("1");

    expect(dados?.clienteOrgao).toBe("—");
    expect(dados?.programaNome).toBe("Programa Estratégico NTC");
    expect(dados?.elaboradorNome).toBe("Comercial NTC");
    expect(dados?.tipoTexto).toBe("Solução Customizada · In Company");
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha (módulo `./dados` ainda não existe)**

Run: `pnpm --filter @ntc/cms vitest run src/lib/documentoProposta/dados.test.ts`
Expected: FAIL — `Cannot find module './dados'`

- [ ] **Step 3: Implementar `dados.ts`**

```typescript
// apps/cms/src/lib/documentoProposta/dados.ts
import "server-only";

import type { ClienteCrm, Evento, Modulo, Programa, Proposta, User } from "@ntc/types";

import { obterPayload } from "@/lib/payloadClient";

export interface ItemDocumento {
  rotulo: string;
  cargaHoraria: string;
  valorUnitario: number;
}

export interface DadosDocumentoProposta {
  id: string;
  codigo: string;
  codigoBase: string;
  versao: number;
  tipoTexto: string;
  modalidade: string;
  replay: string;
  condPagto: string;
  condEspecificas: string;
  dataCriacaoISO: string | null;
  validadeISO: string | null;
  elaboradorNome: string;
  clienteOrgao: string;
  clienteSigla: string;
  clienteUf: string;
  clienteMunicipio: string;
  clienteDirigente: string;
  programaNome: string;
  programaSigla: string;
  itens: ItemDocumento[];
  valorUnitario: number;
  qtdPagantes: number;
  cortesias: number;
  percDesconto: number;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
}

const TIPO_TEXTO: Record<string, string> = {
  "programa-completo": "Trilha Completa de Programa Estratégico",
  "modulo-avulso": "Módulo Avulso",
  "produto-evento-avulso": "Produto/Evento Avulso",
  customizada: "Solução Customizada · In Company",
};

function ehObjeto<T>(v: number | T | null | undefined): v is T {
  return typeof v === "object" && v !== null;
}

export async function obterDadosDocumentoProposta(
  id: string,
): Promise<DadosDocumentoProposta | null> {
  const payload = await obterPayload();
  let doc: Proposta;
  try {
    doc = await payload.findByID({ collection: "propostas", id, depth: 2 });
  } catch {
    return null;
  }

  const cliente = ehObjeto<ClienteCrm>(doc.cliente) ? doc.cliente : null;
  const programa = ehObjeto<Programa>(doc.programa) ? doc.programa : null;
  const elaborador = ehObjeto<User>(doc.elaborador) ? doc.elaborador : null;

  const modulos = (doc.modulos ?? []).filter((m): m is Modulo => ehObjeto<Modulo>(m));
  const eventos = (doc.eventos ?? []).filter((e): e is Evento => ehObjeto<Evento>(e));
  const valorUnitario = doc.valorUnitario ?? 0;

  const itens: ItemDocumento[] = [
    ...modulos.map((m) => ({
      rotulo: `M${m.numero} · ${m.titulo}`,
      cargaHoraria: m.cargaHoraria ?? "",
      valorUnitario,
    })),
    ...eventos.map((e) => ({
      rotulo: e.nome,
      cargaHoraria: e.cargaHoraria ?? "",
      valorUnitario,
    })),
  ];

  return {
    id: String(doc.id),
    codigo: doc.codigo,
    codigoBase: doc.codigoBase,
    versao: doc.versao ?? 1,
    tipoTexto: TIPO_TEXTO[doc.tipo ?? ""] ?? "Proposta Técnico-Comercial",
    modalidade: doc.modalidade ?? "A definir",
    replay: doc.replay ?? "90 dias",
    condPagto: doc.condPagto ?? "À vista após emissão da Nota Fiscal · 15 dias",
    condEspecificas: doc.condEspecificas ?? "",
    dataCriacaoISO: doc.dataCriacao ?? null,
    validadeISO: doc.validade ?? null,
    elaboradorNome: elaborador?.nome ?? "Comercial NTC",
    clienteOrgao: cliente?.orgao ?? "—",
    clienteSigla: cliente?.sigla ?? cliente?.orgao ?? "—",
    clienteUf: cliente?.uf ?? "",
    clienteMunicipio: cliente?.municipio ?? "—",
    clienteDirigente: cliente?.dirigente ?? "—",
    programaNome: programa?.nomeCompleto ?? "Programa Estratégico NTC",
    programaSigla: programa?.sigla ?? "",
    itens,
    valorUnitario,
    qtdPagantes: doc.qtdPagantes ?? 0,
    cortesias: doc.cortesias ?? 0,
    percDesconto: doc.percDesconto ?? 0,
    valorBruto: doc.valorBruto ?? 0,
    desconto: doc.desconto ?? 0,
    valorLiquido: doc.valorLiquido ?? 0,
  };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms vitest run src/lib/documentoProposta/dados.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/documentoProposta/dados.ts apps/cms/src/lib/documentoProposta/dados.test.ts
git commit -m "feat(crm): busca dados resolvidos da proposta para o documento PDF"
```

---

### Task 2: HTML do documento — capa + seções numeradas

**Files:**
- Create: `apps/cms/src/lib/documentoProposta/html.ts`
- Test: `apps/cms/src/lib/documentoProposta/html.test.ts`

**Interfaces:**
- Consumes: `DadosDocumentoProposta` (Task 1).
- Produces: `montarHtmlDocumentoProposta(dados: DadosDocumentoProposta): string` — usado pela Task 3 (rota de preview) e pela Task 4 (motor de PDF, direto em memória, sem HTTP).

- [ ] **Step 1: Escrever o teste**

```typescript
// apps/cms/src/lib/documentoProposta/html.test.ts
import { describe, expect, it } from "vitest";

import { montarHtmlDocumentoProposta } from "./html";
import type { DadosDocumentoProposta } from "./dados";

const DADOS_BASE: DadosDocumentoProposta = {
  id: "42",
  codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
  codigoBase: "NTC-PROP-2026-PROGE-SP-X",
  versao: 1,
  tipoTexto: "Trilha Completa de Programa Estratégico",
  modalidade: "Presencial",
  replay: "90 dias",
  condPagto: "À vista após NF · 15 dias",
  condEspecificas: "",
  dataCriacaoISO: "2026-08-29T12:00:00.000Z",
  validadeISO: "2026-09-28T12:00:00.000Z",
  elaboradorNome: "Ana Comercial",
  clienteOrgao: "Secretaria de Educação de São Paulo",
  clienteSigla: "SEDUC-SP",
  clienteUf: "SP",
  clienteMunicipio: "São Paulo",
  clienteDirigente: "Fulano de Tal",
  programaNome: "Programa de Gestão Estratégica",
  programaSigla: "PROGE",
  itens: [{ rotulo: "M1 · Gestão Democrática", cargaHoraria: "40h", valorUnitario: 100 }],
  valorUnitario: 100,
  qtdPagantes: 10,
  cortesias: 2,
  percDesconto: 10,
  valorBruto: 1000,
  desconto: 100,
  valorLiquido: 900,
};

describe("montarHtmlDocumentoProposta", () => {
  it("inclui a capa com código, cliente e tipo", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    expect(html).toContain("NTC-PROP-2026-PROGE-SP-X-v01");
    expect(html).toContain("Secretaria de Educação de São Paulo");
    expect(html).toContain("Trilha Completa de Programa Estratégico");
  });

  it("numera as 3 seções em sequência (1, 2, 3) sem pular números", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    const numeros = [...html.matchAll(/<span class="num">(\d+)<\/span>/g)].map((m) => m[1]);
    expect(numeros).toEqual(["1", "2", "3"]);
  });

  it("omite Condições Específicas quando vazia, mas mantém Forma de Pagamento", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    expect(html).not.toContain("Condições Específicas");
    expect(html).toContain("À vista após NF · 15 dias");
  });

  it("inclui Condições Específicas quando preenchida", () => {
    const html = montarHtmlDocumentoProposta({
      ...DADOS_BASE,
      condEspecificas: "Sujeito a aprovação orçamentária.",
    });
    expect(html).toContain("Condições Específicas");
    expect(html).toContain("Sujeito a aprovação orçamentária.");
  });

  it("escapa HTML nos campos de texto livre (evita injeção no PDF)", () => {
    const html = montarHtmlDocumentoProposta({
      ...DADOS_BASE,
      clienteOrgao: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("formata valores em BRL e datas em dd/mm/aaaa", () => {
    const html = montarHtmlDocumentoProposta(DADOS_BASE);
    // normaliza espaço não-quebrável (U+00A0) que o Intl.NumberFormat pt-BR
    // pode emitir entre "R$" e o valor, dependendo do ICU do runtime —
    // mesma defesa já usada em apps/cms/src/lib/cms/kpisComercial.test.ts.
    expect(html.replace(/\s/g, " ")).toContain("R$ 900");
    expect(html).toContain("29/08/2026");
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/cms vitest run src/lib/documentoProposta/html.test.ts`
Expected: FAIL — `Cannot find module './html'`

- [ ] **Step 3: Implementar `html.ts`**

```typescript
// apps/cms/src/lib/documentoProposta/html.ts
import "server-only";

import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import type { DadosDocumentoProposta } from "./dados";

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarDataDocumento(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

interface Secao {
  titulo: string;
  corpo: string;
}

/** Numera as seções em sequência, ignorando o array — nenhuma seção desta
 * fatia é condicionalmente omitida ainda (isso passa a valer quando as
 * seções descritivas, que podem vir vazias da Biblioteca Comercial, forem
 * adicionadas numa sessão futura). */
function montarSecoesNumeradas(secoes: Secao[]): string {
  return secoes
    .map(
      (s, i) =>
        `<section class="sec"><h2><span class="num">${i + 1}</span>${esc(s.titulo)}</h2>${s.corpo}</section>`,
    )
    .join("");
}

function secaoIdentificacao(d: DadosDocumentoProposta): Secao {
  return {
    titulo: "Dados de Identificação da Proposta",
    corpo: `
      <div class="grid2">
        <div class="box"><div class="label">Código</div><div class="value" style="font-size:11pt">${esc(d.codigo)}</div></div>
        <div class="box"><div class="label">Versão</div><div class="value">v${String(d.versao).padStart(2, "0")}</div></div>
        <div class="box"><div class="label">Cliente</div><div class="text">${esc(d.clienteOrgao)} (${esc(d.clienteSigla)})</div></div>
        <div class="box"><div class="label">Programa</div><div class="text">${esc(d.programaNome)}${d.programaSigla ? ` (${esc(d.programaSigla)})` : ""}</div></div>
        <div class="box"><div class="label">Emissão</div><div class="text">${formatarDataDocumento(d.dataCriacaoISO)}</div></div>
        <div class="box"><div class="label">Validade</div><div class="text">${formatarDataDocumento(d.validadeISO)}</div></div>
      </div>
    `,
  };
}

function secaoQuadroComercial(d: DadosDocumentoProposta): Secao {
  const acessos = d.qtdPagantes + d.cortesias;
  const linhasItens = d.itens.length
    ? d.itens
        .map(
          (i) =>
            `<tr><td>${esc(i.rotulo)}</td><td>${esc(i.cargaHoraria)}</td><td class="qc-right">${formatarMoedaBRL(i.valorUnitario)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" style="text-align:center;color:#6B6B6B;font-style:italic">Item único · ${formatarMoedaBRL(d.valorUnitario)}</td></tr>`;

  return {
    titulo: "Quadro Comercial",
    corpo: `
      <p>Apresentamos o quadro de investimento da presente proposta, fundamentado em quantitativo de <strong>${d.qtdPagantes} inscrição(ões) pagante(s)</strong> e <strong>${d.cortesias} cortesia(s) institucional(is)</strong>, totalizando <strong>${acessos} acessos</strong>.</p>
      <table class="qc"><thead><tr><th>Item</th><th>CH</th><th class="qc-right">Valor unitário</th></tr></thead><tbody>${linhasItens}</tbody></table>
      <table class="qc"><tbody>
        <tr><td>Valor bruto</td><td class="qc-right">${formatarMoedaBRL(d.valorBruto)}</td></tr>
        <tr><td>Desconto institucional (${d.percDesconto}%)</td><td class="qc-right">${formatarMoedaBRL(d.desconto)}</td></tr>
        <tr class="total"><td>VALOR LÍQUIDO DA PROPOSTA</td><td class="qc-right">${formatarMoedaBRL(d.valorLiquido)}</td></tr>
      </tbody></table>
    `,
  };
}

function secaoCondicoesComerciais(d: DadosDocumentoProposta): Secao {
  return {
    titulo: "Condições Comerciais",
    corpo: `
      <div class="grid2">
        <div class="box"><div class="label">Forma de Pagamento</div><div class="text">${esc(d.condPagto)}</div></div>
        <div class="box"><div class="label">Modalidade</div><div class="text">${esc(d.modalidade)}</div></div>
        <div class="box"><div class="label">Período de Replay</div><div class="text">${esc(d.replay)}</div></div>
        <div class="box"><div class="label">Validade da Proposta</div><div class="text">${formatarDataDocumento(d.validadeISO)}</div></div>
      </div>
      ${d.condEspecificas ? `<h3>Condições Específicas</h3><p>${esc(d.condEspecificas)}</p>` : ""}
    `,
  };
}

function montarCapa(d: DadosDocumentoProposta): string {
  return `<div class="cover">
    <div class="cover-top">
      <div class="brand">Instituto NTC do Brasil</div>
      <div class="selo">Proposta Técnico-Comercial</div>
      <div class="selo" style="margin-top:2pt">${esc(d.tipoTexto)}</div>
    </div>
    <div class="cover-mid">
      <div class="titulo">${esc(d.programaNome)}</div>
      <div class="linha-deco"></div>
      <div class="destinatario">Destinada a<strong>${esc(d.clienteOrgao)}</strong></div>
    </div>
    <div class="cover-bot">
      <div class="meta">
        <div><strong>Cliente</strong>${esc(d.clienteSigla)}</div>
        <div><strong>UF · Município</strong>${esc(d.clienteUf)} · ${esc(d.clienteMunicipio)}</div>
        <div><strong>Dirigente</strong>${esc(d.clienteDirigente)}</div>
        <div><strong>Modalidade</strong>${esc(d.modalidade)}</div>
        <div><strong>Emissão</strong>${formatarDataDocumento(d.dataCriacaoISO)}</div>
        <div><strong>Validade</strong>${formatarDataDocumento(d.validadeISO)}</div>
        <div><strong>Versão</strong>v${String(d.versao).padStart(2, "0")}</div>
        <div><strong>Elaborador</strong>${esc(d.elaboradorNome)}</div>
      </div>
      <div class="codigo">${esc(d.codigo)}</div>
    </div>
  </div>`;
}

function estilosDocumento(): string {
  // Tokens do site (packages/ui/src/tokens.ts) — decisão confirmada nesta
  // sessão: o documento usa a paleta oficial, não a paleta própria do
  // legado NTC_Comercial_Premium.html.
  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#fff}
    body{font-family:'Barlow',sans-serif;color:#2B2B2B;line-height:1.55;font-size:10.5pt}
    h1,h2,h3{font-family:'Cormorant Garamond',serif;color:#11365E;font-weight:600}
    h2{font-size:17pt;margin:14pt 0 7pt;padding-bottom:5pt;border-bottom:1px solid #B5995A;display:flex;align-items:center;gap:9pt}
    h2 .num{display:inline-flex;align-items:center;justify-content:center;width:26pt;height:26pt;background:#11365E;color:#B5995A;font-family:'Cormorant Garamond';font-size:13pt;border-radius:50%;flex-shrink:0}
    h3{font-size:12.5pt;color:#1E4E8C;margin:9pt 0 4pt}
    p{margin-bottom:6pt;text-align:justify}
    strong{color:#11365E;font-weight:600}

    .cover{width:210mm;min-height:297mm;padding:28mm 22mm 26mm;background:linear-gradient(135deg,#11365E 0%,#0B2545 100%);color:#F4EFE6;page-break-after:always;display:flex;flex-direction:column;justify-content:space-between}
    .cover .brand{font-family:'Cormorant Garamond';font-size:12.5pt;color:#B5995A;letter-spacing:3pt;text-transform:uppercase;font-weight:600}
    .cover .selo{font-size:8.5pt;letter-spacing:2.3pt;color:#D9D2C4;margin-top:5pt;text-transform:uppercase}
    .cover .titulo{font-family:'Cormorant Garamond';font-size:34pt;line-height:1.08;color:#F4EFE6;margin:10pt 0;font-weight:600}
    .cover .linha-deco{width:60mm;height:1.5pt;background:#B5995A;margin:8pt 0 14pt;opacity:.7}
    .cover .destinatario{font-family:'Cormorant Garamond';font-size:15pt;color:#F4EFE6;line-height:1.32}
    .cover .destinatario strong{color:#B5995A;display:block;font-size:18pt;margin-top:3pt}
    .cover .meta{display:grid;grid-template-columns:1fr 1fr;gap:7pt 14pt;font-size:9.5pt;color:#D9D2C4;margin-top:14pt}
    .cover .meta strong{color:#B5995A;display:block;text-transform:uppercase;font-size:7.5pt;letter-spacing:1.4pt}
    .cover .codigo{font-size:9.5pt;letter-spacing:1.8pt;color:#D9D2C4;margin-top:12pt;border-top:1pt solid rgba(181,153,90,.4);padding-top:10pt;text-transform:uppercase}

    .body-wrap{padding:0 18mm}
    .sec{margin-bottom:10pt;page-break-inside:avoid}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:9pt}
    .box{background:#F4EFE6;border:1pt solid #D9D2C4;border-radius:5pt;padding:9pt 12pt}
    .box .label{font-size:7.8pt;letter-spacing:1.4pt;text-transform:uppercase;color:#5A5A5A;font-weight:600}
    .box .value{font-family:'Cormorant Garamond';font-size:15pt;color:#11365E;font-weight:600;margin-top:2pt}
    .box .text{margin-top:3pt;font-size:9.8pt}

    table.qc{width:100%;border-collapse:collapse;font-size:9.8pt;margin:8pt 0}
    table.qc th{background:#11365E;color:#B5995A;padding:6.5pt 9pt;text-align:left;font-size:8.5pt;letter-spacing:1pt;text-transform:uppercase}
    table.qc td{padding:6.5pt 9pt;border-bottom:1pt solid #D9D2C4}
    table.qc tr:nth-child(even) td{background:#F4EFE6}
    table.qc .total td{background:#11365E;color:#F4EFE6;font-weight:600;font-size:11pt}
    table.qc .total td:last-child{color:#B5995A}
    .qc-right{text-align:right;font-variant-numeric:tabular-nums}
  </style>`;
}

export function montarHtmlDocumentoProposta(dados: DadosDocumentoProposta): string {
  const secoes = montarSecoesNumeradas([
    secaoIdentificacao(dados),
    secaoQuadroComercial(dados),
    secaoCondicoesComerciais(dados),
  ]);

  return `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>${esc(dados.codigo)} · Proposta Instituto NTC</title>
${estilosDocumento()}
</head>
<body>
${montarCapa(dados)}
<div class="body-wrap">${secoes}</div>
</body></html>`;
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms vitest run src/lib/documentoProposta/html.test.ts`
Expected: PASS (6 testes)

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/documentoProposta/html.ts apps/cms/src/lib/documentoProposta/html.test.ts
git commit -m "feat(crm): monta HTML do documento de proposta (capa + 3 seções)"
```

---

### Task 3: Rota de preview (Route Handler)

**Files:**
- Create: `apps/cms/src/app/(painel)/crm/propostas/[id]/documento/route.ts`

**Interfaces:**
- Consumes: `obterDadosDocumentoProposta` (Task 1), `montarHtmlDocumentoProposta` (Task 2), `obterUsuarioCms` (já existe em `@/lib/cms/autenticacao`, mesmo padrão usado em `acoesCrm.ts`).
- Produces: rota `GET /crm/propostas/[id]/documento` — usada por um humano pra conferir o documento no navegador antes/depois de gerar o PDF. A Task 4 NÃO usa esta rota (chama as funções direto, sem HTTP).

- [ ] **Step 1: Implementar a rota**

```typescript
// apps/cms/src/app/(painel)/crm/propostas/[id]/documento/route.ts
import { NextResponse } from "next/server";

import { obterUsuarioCms } from "@/lib/cms/autenticacao";
import { obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const usuario = await obterUsuarioCms();
  if (!usuario) {
    return NextResponse.json({ erro: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;
  const dados = await obterDadosDocumentoProposta(id);
  if (!dados) {
    return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
  }

  const html = montarHtmlDocumentoProposta(dados);
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
```

- [ ] **Step 2: Verificação manual (rota depende de sessão + Payload real — sem Vitest aqui)**

Com `pnpm dev:cms` rodando e logado no painel, abrir `http://localhost:3001/crm/propostas/<id-de-uma-proposta-existente>/documento` no navegador e conferir visualmente: capa full-bleed em Oxford/Dourado, 3 seções numeradas 1/2/3, valores em R$, datas em dd/mm/aaaa.

- [ ] **Step 3: Commit**

```bash
git add "apps/cms/src/app/(painel)/crm/propostas/[id]/documento/route.ts"
git commit -m "feat(crm): rota de preview HTML do documento de proposta"
```

---

### Task 4: Motor de PDF (Playwright + Chromium serverless)

**Files:**
- Modify: `apps/cms/package.json` (dependências)
- Create: `apps/cms/src/lib/pdf/gerarPdfDeHtml.ts`

**Interfaces:**
- Consumes: uma string HTML completa (de `montarHtmlDocumentoProposta`, Task 2) e um objeto de metadados para cabeçalho/rodapé.
- Produces: `gerarPdfDeHtml(html: string, meta: MetaCabecalhoPdf): Promise<Buffer>`, usado pela Task 5.

**Por que duas dependências novas (sinalizado ao usuário, CLAUDE.md §5.4):** `playwright` (raiz do monorepo) baixa um Chromium específico da plataforma local — funciona em dev, mas o binário não roda dentro de uma function serverless da Vercel (limite de tamanho/ambiente Linux minimalista). `@sparticuz/chromium` é um binário de Chromium compilado especificamente para AWS Lambda/Vercel (padrão de mercado pra PDF em serverless); `playwright-core` é o mesmo motor do Playwright sem baixar nenhum browser embutido — ele só sabe *controlar* um Chromium que você aponta via `executablePath`. Em dev local usamos o Chromium que o `playwright` da raiz já baixou (cache em `~/Library/Caches/ms-playwright`, confirmado presente nesta sessão); em produção usamos o do `@sparticuz/chromium`.

- [ ] **Step 1: Adicionar as dependências**

```bash
cd apps/cms
pnpm add playwright-core @sparticuz/chromium
```

- [ ] **Step 2: Implementar o motor de PDF**

```typescript
// apps/cms/src/lib/pdf/gerarPdfDeHtml.ts
import "server-only";

import type { Browser } from "playwright-core";

export interface MetaCabecalhoPdf {
  codigo: string;
  validadeFormatada: string;
  emitidaFormatada: string;
}

/** Detecta ambiente serverless (Vercel/AWS Lambda) vs. dev local. */
function ehServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function abrirBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");

  if (ehServerless()) {
    const chromiumServerless = (await import("@sparticuz/chromium")).default;
    return chromium.launch({
      args: chromiumServerless.args,
      executablePath: await chromiumServerless.executablePath(),
      headless: true,
    });
  }

  // Dev local: usa o Chromium que o `playwright` da raiz do monorepo já
  // baixou (mesmo binário usado pelos scripts de diagnóstico visual).
  const playwrightLocal = await import("playwright");
  return chromium.launch({
    executablePath: playwrightLocal.chromium.executablePath(),
    headless: true,
  });
}

function headerTemplate(meta: MetaCabecalhoPdf): string {
  return `<div style="width:100%;font-family:Barlow,sans-serif;font-size:8px;color:#5A5A5A;padding:0 18mm;display:flex;justify-content:space-between;">
    <span style="font-family:'Cormorant Garamond',serif;color:#B5995A;font-weight:600;letter-spacing:0.5px;">Instituto NTC do Brasil</span>
    <span>${meta.codigo}</span>
  </div>`;
}

function footerTemplate(meta: MetaCabecalhoPdf): string {
  return `<div style="width:100%;font-family:Barlow,sans-serif;font-size:8px;color:#5A5A5A;padding:0 18mm;display:flex;justify-content:space-between;">
    <span>Validade: ${meta.validadeFormatada} · Emitida: ${meta.emitidaFormatada}</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>`;
}

/**
 * Gera o PDF a partir de uma string HTML já completa (ver
 * montarHtmlDocumentoProposta). Cabeçalho/rodapé aparecem em TODAS as
 * páginas incluindo a capa — simplificação deliberada desta sessão (ver
 * Global Constraints do plano).
 */
export async function gerarPdfDeHtml(html: string, meta: MetaCabecalhoPdf): Promise<Buffer> {
  const browser = await abrirBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate(meta),
      footerTemplate: footerTemplate(meta),
      margin: { top: "22mm", bottom: "20mm", left: "0", right: "0" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 3: Verificação manual (browser real — sem Vitest aqui, mesma lógica da Task 3)**

Criar um script temporário `scripts/_probe-pdf-proposta.tmp.mjs` (fora do versionamento, mesmo padrão dos outros `_probe-*.tmp.mjs` já usados no projeto) que importa `gerarPdfDeHtml` com um HTML mínimo de teste e grava o resultado em `/tmp/teste-proposta.pdf`. Rodar com `node scripts/_probe-pdf-proposta.tmp.mjs`, abrir o PDF gerado e confirmar visualmente: tamanho A4, cabeçalho/rodapé presentes, texto legível. Apagar o script ao final (é descartável, como os demais `.tmp.mjs`).

- [ ] **Step 4: Commit**

```bash
git add apps/cms/package.json apps/cms/src/lib/pdf/gerarPdfDeHtml.ts pnpm-lock.yaml
git commit -m "feat(crm): motor de geração de PDF via Playwright (dev + serverless)"
```

---

### Task 5: Campo `pdfGerado`, escrita, Server Action e botão na UI

**Files:**
- Modify: `apps/cms/src/collections/Propostas.ts`
- Modify: `apps/cms/src/lib/cms/painelCrm.ts` (expõe `pdfGeradoUrl` em `PropostaDetalhe`)
- Modify: `apps/cms/src/lib/cms/painelCrmEscrita.ts` (nova função de escrita)
- Test: `apps/cms/src/lib/cms/painelCrmEscrita.pdf.test.ts`
- Modify: `apps/cms/src/app/(painel)/acoesCrm.ts` (nova Server Action)
- Modify: `apps/cms/src/app/(painel)/crm/DetalheProposta.tsx` (botão "Gerar PDF")
- Modify: `apps/cms/src/app/(painel)/crm/ShellCrm.tsx` (fiação do callback)

**Interfaces:**
- Consumes: `montarHtmlDocumentoProposta` + `obterDadosDocumentoProposta` (Tasks 1-2), `gerarPdfDeHtml` (Task 4).
- Produces: `gerarESalvarPdfProposta(id: string): Promise<ResultadoEscrita>` em `painelCrmEscrita.ts`; `gerarPdfPropostaCrm(id: string): Promise<ResultadoEscrita>` Server Action em `acoesCrm.ts`; prop `onGerarPdf: (id: string) => void` em `DetalheProposta`.

- [ ] **Step 1: Adicionar o campo `pdfGerado` à coleção `Propostas`**

Editar `apps/cms/src/collections/Propostas.ts` — adicionar ao array `fields`, após `substitui` (última entrada atual, linha 57):

```typescript
    { name: "substitui", type: "text", admin: { description: "Código da versão substituída." } },
    {
      name: "pdfGerado",
      type: "relationship",
      relationTo: "media",
      admin: { readOnly: true, description: "Gerado pelo botão 'Gerar PDF' na tela de detalhe." },
    },
```

⚠️ Isso muda o schema do banco. **Não roda `payload:push:schema` como parte deste plano** — sinalizar ao usuário no fim da sessão pra ele rodar manualmente (`pnpm payload:push:schema`, dev parado, `N` em qualquer prompt de DATA LOSS, conforme CLAUDE.md §14 e §19.5).

- [ ] **Step 2: Expor `pdfGeradoUrl` em `PropostaDetalhe`**

Editar `apps/cms/src/lib/cms/painelCrm.ts`:

Adicionar ao final da interface `PropostaDetalhe` (após `aprovadorId: string | null;`, linha 162):

```typescript
  pdfGeradoUrl: string | null;
```

E em `obterPropostaCrm` (função no arquivo, ~linha 466), adicionar ao objeto retornado, junto dos outros campos crus:

```typescript
    pdfGeradoUrl:
      doc.pdfGerado && typeof doc.pdfGerado === "object" && "url" in doc.pdfGerado
        ? ((doc.pdfGerado as { url?: string | null }).url ?? null)
        : null,
```

- [ ] **Step 3: Escrever o teste de `gerarESalvarPdfProposta` (mockando Payload, HTML e PDF — sem browser real)**

```typescript
// apps/cms/src/lib/cms/painelCrmEscrita.pdf.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const obterPayloadMock = vi.fn();
vi.mock("@/lib/payloadClient", () => ({ obterPayload: obterPayloadMock }));

const obterDadosDocumentoPropostaMock = vi.fn();
vi.mock("@/lib/documentoProposta/dados", () => ({
  obterDadosDocumentoProposta: obterDadosDocumentoPropostaMock,
}));

vi.mock("@/lib/documentoProposta/html", () => ({
  montarHtmlDocumentoProposta: vi.fn().mockReturnValue("<html></html>"),
}));

const gerarPdfDeHtmlMock = vi.fn();
vi.mock("@/lib/pdf/gerarPdfDeHtml", () => ({ gerarPdfDeHtml: gerarPdfDeHtmlMock }));

const { gerarESalvarPdfProposta } = await import("./painelCrmEscrita");

describe("gerarESalvarPdfProposta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("gera o PDF, salva em media e vincula à proposta", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      validadeISO: "2026-09-28T12:00:00.000Z",
      dataCriacaoISO: "2026-08-29T12:00:00.000Z",
    });
    gerarPdfDeHtmlMock.mockResolvedValue(Buffer.from("conteudo-pdf-fake"));

    const criarMedia = vi.fn().mockResolvedValue({ id: 77 });
    const update = vi.fn().mockResolvedValue({});
    obterPayloadMock.mockResolvedValue({ create: criarMedia, update });

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(true);
    expect(criarMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "media",
        file: expect.objectContaining({
          mimetype: "application/pdf",
          name: "NTC-PROP-2026-PROGE-SP-X-v01.pdf",
        }),
      }),
    );
    expect(update).toHaveBeenCalledWith({
      collection: "propostas",
      id: "42",
      data: { pdfGerado: 77 },
    });
  });

  it("devolve erro quando a proposta não existe", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue(null);

    const resultado = await gerarESalvarPdfProposta("999");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erro).toBe("Proposta não encontrada.");
    expect(gerarPdfDeHtmlMock).not.toHaveBeenCalled();
  });

  it("em falha na geração do PDF, devolve erro genérico em vez de propagar exceção", async () => {
    obterDadosDocumentoPropostaMock.mockResolvedValue({
      id: "42",
      codigo: "NTC-PROP-2026-PROGE-SP-X-v01",
      validadeISO: null,
      dataCriacaoISO: null,
    });
    gerarPdfDeHtmlMock.mockRejectedValue(new Error("chromium não abriu"));

    const resultado = await gerarESalvarPdfProposta("42");

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.erro).toBe("Não foi possível gerar o PDF. Tente novamente.");
  });
});
```

- [ ] **Step 4: Rodar o teste e confirmar que falha**

Run: `pnpm --filter @ntc/cms vitest run src/lib/cms/painelCrmEscrita.pdf.test.ts`
Expected: FAIL — `gerarESalvarPdfProposta` não exportada por `./painelCrmEscrita`

- [ ] **Step 5: Implementar `gerarESalvarPdfProposta` em `painelCrmEscrita.ts`**

Adicionar ao final do arquivo `apps/cms/src/lib/cms/painelCrmEscrita.ts` (mesmo padrão de `ResultadoEscrita` já usado nas demais funções de escrita do arquivo):

```typescript
import { obterDadosDocumentoProposta } from "@/lib/documentoProposta/dados";
import { montarHtmlDocumentoProposta } from "@/lib/documentoProposta/html";
import { gerarPdfDeHtml } from "@/lib/pdf/gerarPdfDeHtml";

function formatarDataCurta(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export async function gerarESalvarPdfProposta(id: string): Promise<ResultadoEscrita> {
  const dados = await obterDadosDocumentoProposta(id);
  if (!dados) return { ok: false, erro: "Proposta não encontrada." };

  try {
    const html = montarHtmlDocumentoProposta(dados);
    const pdf = await gerarPdfDeHtml(html, {
      codigo: dados.codigo,
      validadeFormatada: formatarDataCurta(dados.validadeISO),
      emitidaFormatada: formatarDataCurta(dados.dataCriacaoISO),
    });

    const payload = await obterPayload();
    const nomeArquivo = `${dados.codigo}.pdf`;
    const media = await payload.create({
      collection: "media",
      data: { alt: `Proposta ${dados.codigo}`, arquivoOriginal: true },
      file: { data: pdf, mimetype: "application/pdf", name: nomeArquivo, size: pdf.length },
    });
    await payload.update({ collection: "propostas", id, data: { pdfGerado: media.id } });

    return { ok: true };
  } catch {
    return { ok: false, erro: "Não foi possível gerar o PDF. Tente novamente." };
  }
}
```

(`obterPayload` já é importado no topo do arquivo pelas demais funções — conferir e reaproveitar o import existente, não duplicar.)

- [ ] **Step 6: Rodar o teste e confirmar que passa**

Run: `pnpm --filter @ntc/cms vitest run src/lib/cms/painelCrmEscrita.pdf.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 7: Server Action em `acoesCrm.ts`**

Adicionar em `apps/cms/src/app/(painel)/acoesCrm.ts`, junto das demais actions de proposta:

```typescript
import { gerarESalvarPdfProposta } from "@/lib/cms/painelCrmEscrita";
```

(adicionar ao import existente de `@/lib/cms/painelCrmEscrita`, não criar um novo bloco de import)

```typescript
export async function gerarPdfPropostaCrm(id: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const resultado = await gerarESalvarPdfProposta(id);
  if (resultado.ok) revalidatePath("/crm");
  return resultado;
}
```

- [ ] **Step 8: Botão "Gerar PDF" em `DetalheProposta.tsx`**

Editar `apps/cms/src/app/(painel)/crm/DetalheProposta.tsx`:

Adicionar à interface de props (após `onRegistrarEnvio`, linha 19):

```typescript
  onGerarPdf: (id: string) => void;
  gerandoPdf: boolean;
```

Adicionar ao destructuring da função (linha 30-36):

```typescript
  onGerarPdf,
  gerandoPdf,
```

No bloco `pcms-pagehead__acoes` (linhas 84-92), adicionar o botão antes de "Editar":

```tsx
          {p.pdfGeradoUrl && (
            <a href={p.pdfGeradoUrl} target="_blank" rel="noreferrer" className="pcms-btn pcms-btn--ghost">
              Baixar PDF
            </a>
          )}
          <button
            type="button"
            className="pcms-btn pcms-btn--ghost"
            disabled={gerandoPdf}
            onClick={() => onGerarPdf(p.id)}
          >
            {gerandoPdf ? "Gerando…" : "Gerar PDF"}
          </button>
```

- [ ] **Step 9: Fiar o callback em `ShellCrm.tsx`**

Editar `apps/cms/src/app/(painel)/crm/ShellCrm.tsx`:

Adicionar ao import de `acoesCrm` (junto de `novaVersaoPropostaCrm`, `registrarEnvioCrm`, linhas 30-31):

```typescript
  gerarPdfPropostaCrm,
```

Adicionar uma função no mesmo padrão de `novaVersao`/`registrarEnvio` (após `registrarEnvio`, linha 288):

```typescript
  function gerarPdf(id: string) {
    iniciarCarga(async () => {
      const r = await gerarPdfPropostaCrm(id);
      if (r.ok) {
        const det = await carregarPropostaCrm(id);
        if (det) setPropostaDet(det);
      } else {
        setErroAcao(r.erro ?? "Erro ao gerar PDF.");
      }
    });
  }
```

No JSX de `<DetalheProposta>` (linhas 361-367), adicionar as duas novas props:

```tsx
          <DetalheProposta
            proposta={propostaDet}
            onVoltar={fecharTudo}
            onEditar={() => setFormAberto({ entidade: "proposta", inicial: propostaDet })}
            onNovaVersao={novaVersao}
            onRegistrarEnvio={registrarEnvio}
            onGerarPdf={gerarPdf}
            gerandoPdf={carregando}
          />
```

- [ ] **Step 10: Rodar toda a suíte de testes do cms**

Run: `pnpm --filter @ntc/cms typecheck && pnpm --filter @ntc/cms vitest run`
Expected: typecheck sem erros; todos os testes (novos e existentes) passam.

- [ ] **Step 11: Commit**

```bash
git add apps/cms/src/collections/Propostas.ts apps/cms/src/lib/cms/painelCrm.ts \
  apps/cms/src/lib/cms/painelCrmEscrita.ts apps/cms/src/lib/cms/painelCrmEscrita.pdf.test.ts \
  "apps/cms/src/app/(painel)/acoesCrm.ts" "apps/cms/src/app/(painel)/crm/DetalheProposta.tsx" \
  "apps/cms/src/app/(painel)/crm/ShellCrm.tsx"
git commit -m "feat(crm): botão Gerar PDF na proposta, salva e vincula o documento"
```

---

## Checkpoint visual (CLAUDE.md §6, antes de declarar a sessão concluída)

1. `pnpm payload:push:schema` (usuário/PO roda manualmente, dev parado, diff antes, `N` em DATA LOSS) — cria a coluna `pdfGerado` em `propostas`.
2. `pnpm dev:cms`, logar no painel, abrir uma proposta existente (ou criar uma via wizard da Fase B1).
3. Clicar "Gerar PDF" — confirmar que o botão mostra "Gerando…", depois aparece "Baixar PDF".
4. Abrir o PDF baixado: conferir capa (Oxford/Dourado, full-bleed), as 3 seções numeradas, valores em R$, cabeçalho/rodapé em todas as páginas.
5. Reportar ao usuário: screenshot ou descrição do resultado, mais a simplificação conhecida (cabeçalho/rodapé também na capa).

## Self-Review

**Cobertura da spec (decisões confirmadas nesta sessão):**
- ✅ Paleta do site nos tokens — Task 2 (`estilosDocumento`) usa só valores de `packages/ui/src/tokens.ts`.
- ✅ Gerar e salvar (não só download) — Task 5 salva em `media` e vincula via `pdfGerado`.
- ✅ Fatia vertical (capa + Identificação + Quadro Comercial + Condições) — Task 2 cobre exatamente essas 3 seções + capa; as ~15 descritivas ficam fora, documentado no Goal e nas Global Constraints.
- ✅ Sem dependência nova "silenciosa" — `playwright-core`/`@sparticuz/chromium` sinalizadas explicitamente na Task 4 com justificativa.
- ✅ Cabeçalho/rodapé corrigido vs. o bug do legado (`@page {@top-left}` não suportado pelo Chromium) — Task 4 usa `headerTemplate`/`footerTemplate` nativos do Playwright.

**Placeholder scan:** nenhum "TBD"/"implementar depois" — os únicos pontos sem Vitest (Tasks 3 e 4, Steps de verificação manual) têm justificativa explícita (dependem de browser/sessão real) e passo concreto de verificação, seguindo o mesmo padrão que o projeto já usa pros scripts de diagnóstico visual (`scripts/diagnostico-mobile.mjs`) e pro checkpoint visual humano (CLAUDE.md §6).

**Consistência de tipos:** `DadosDocumentoProposta` (Task 1) é o único tipo consumido por `html.ts` (Task 2) e `painelCrmEscrita.ts` (Task 5) — mesma forma em todo o plano. `gerarPdfDeHtml(html, meta)` (Task 4) e sua chamada em `gerarESalvarPdfProposta` (Task 5) usam a mesma assinatura (`MetaCabecalhoPdf` com `codigo`/`validadeFormatada`/`emitidaFormatada`).
