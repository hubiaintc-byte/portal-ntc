# Conteúdos editoriais e contatos institucionais — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** dar ao Painel Admin uma tela para publicar notícias e artigos (com página de leitura no site) e tirar telefone, WhatsApp, e-mails e endereço de dentro do código, passando-os para Configurações.

**Architecture:** a coleção `conteudos` do Payload já existe e ganha campos, categorias novas e um editor de corpo em Markdown leve convertido para o Lexical que o Payload grava; o site passa a ler `/conteudos` do banco e ganha a rota `/conteudos/[categoria]/[slug]`. Os contatos vivem no global `rodape` (hoje modelado e não lido por ninguém) e são consumidos por um helper com fallback para os valores atuais, de modo que nenhuma página quebre se o banco falhar. Regras puras vão para `packages/lib` com testes; leitura fica em `painelCms.ts`, escrita em `painelCmsEscrita.ts`, e as Server Actions em `acoes.ts` — o padrão já estabelecido no painel.

**Tech Stack:** TypeScript strict, Next.js 15 App Router, React Server Components, Payload CMS 3.18 (adapter Postgres, Local API), Vitest. **Nenhuma dependência nova.**

**Spec:**
- `docs/superpowers/specs/2026-09-22-cms-conteudos-editoriais-design.md` (Tasks 1–10)
- `docs/superpowers/specs/2026-09-22-contatos-institucionais-design.md` (Tasks 11–14)

## Global Constraints

- **Sem dependência nova** (CLAUDE.md §5.4). Nada de biblioteca de Markdown, de editor ou de UI.
- **TypeScript strict, sem `any`, sem `unknown` quando há tipo conhecido** (§4.4). Props sempre como interface nomeada.
- **Nomes em português** para conceito editorial NTC; inglês só para conceito técnico puro (§4.2). Componentes em PascalCase, utilitários em kebab-case.
- **Identidade visual Soberana 2026** (§3): Oxford `#11365E`, Pergaminho `#F4EFE6`, Cormorant Garamond em títulos, Barlow em corpo; `border-radius: 0` em estruturas no **site** — o painel é exceção deliberada (cantos arredondados, v1.5). Ícones lineares peso 1.5, só funcionais.
- **Acessibilidade WCAG 2.1 AA** (§10): `<label>` associado a todo input, `<button>` para ação e `<a>` para navegação, foco visível, landmarks.
- **Não inventar texto institucional** (§5.3). Todo texto de conteúdo vem do CMS ou é copiado literalmente de `conteudoConteudos.ts`.
- **Commits em português**, Conventional Commits adaptado, sem emoji (§7.2). Terminar a mensagem com `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- **O dev server precisa estar PARADO antes de qualquer `pnpm build`** — `.next` é compartilhado e o build corrompe o dev em execução.
- **Nenhuma task roda `payload:push:schema`.** Ele é manual, do PO, e está na Task 15.
- Comandos: `pnpm --filter @ntc/lib test`, `pnpm --filter @ntc/cms test`, `pnpm lint`, `pnpm typecheck`.

---

### Task 1: Serializador de Lexical para HTML editorial

O `lexicalToHtml` que já existe (duas cópias: `apps/cms/src/lib/cms/lexical.ts` e `apps/web/lib/cms/lexical.ts`) achata o documento em HTML **inline**, juntando blocos com `<br>`. Serve para campos curtos de evento e não serve para o corpo de um artigo. Esta task cria a função de blocos, usada depois pela pré-visualização do painel (Task 7) e pela página de leitura (Task 10). As duas cópias antigas **não são tocadas**.

**Files:**
- Create: `packages/lib/src/editorial/lexical-html.ts`
- Test: `packages/lib/src/editorial/lexical-html.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `lexicalParaHtmlEditorial(doc: unknown): string`, exportada por `@ntc/lib`.

- [ ] **Step 1: Write the failing test**

Criar `packages/lib/src/editorial/lexical-html.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { lexicalParaHtmlEditorial } from "./lexical-html";

/** Monta um documento Lexical mínimo com os filhos dados. */
function doc(children: unknown[]): unknown {
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children } };
}

function texto(t: string, format = 0): unknown {
  return { type: "text", format, mode: "normal", style: "", text: t, version: 1, detail: 0 };
}

describe("lexicalParaHtmlEditorial", () => {
  it("devolve string vazia para documento ausente ou malformado", () => {
    expect(lexicalParaHtmlEditorial(null)).toBe("");
    expect(lexicalParaHtmlEditorial({})).toBe("");
    expect(lexicalParaHtmlEditorial({ root: {} })).toBe("");
  });

  it("serializa parágrafo em <p>", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto("Primeiro parágrafo.")] }]),
    );
    expect(html).toBe("<p>Primeiro parágrafo.</p>");
  });

  it("serializa headings h2 e h3 com a tag do nó", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        { type: "heading", tag: "h2", children: [texto("Seção")] },
        { type: "heading", tag: "h3", children: [texto("Subseção")] },
      ]),
    );
    expect(html).toBe("<h2>Seção</h2><h3>Subseção</h3>");
  });

  it("rebaixa heading de nível não suportado para h3", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "heading", tag: "h1", children: [texto("Título")] }]),
    );
    expect(html).toBe("<h3>Título</h3>");
  });

  it("serializa negrito e itálico pelo bitfield de format", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto("bold", 1), texto("it", 2)] }]),
    );
    expect(html).toBe("<p><strong>bold</strong><em>it</em></p>");
  });

  it("serializa lista com marcadores e lista ordenada", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "list",
          listType: "bullet",
          children: [
            { type: "listitem", children: [texto("um")] },
            { type: "listitem", children: [texto("dois")] },
          ],
        },
        {
          type: "list",
          listType: "number",
          children: [{ type: "listitem", children: [texto("passo")] }],
        },
      ]),
    );
    expect(html).toBe("<ul><li>um</li><li>dois</li></ul><ol><li>passo</li></ol>");
  });

  it("serializa citação em <blockquote>", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "quote", children: [texto("A citação.")] }]),
    );
    expect(html).toBe("<blockquote>A citação.</blockquote>");
  });

  it("serializa link com rel e target seguros", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              fields: { url: "https://institutontc.com.br", newTab: true },
              children: [texto("NTC")],
            },
          ],
        },
      ]),
    );
    expect(html).toBe(
      '<p><a href="https://institutontc.com.br" target="_blank" rel="noopener noreferrer">NTC</a></p>',
    );
  });

  it("descarta href que não seja http, https ou mailto", () => {
    const html = lexicalParaHtmlEditorial(
      doc([
        {
          type: "paragraph",
          children: [
            { type: "link", fields: { url: "javascript:alert(1)" }, children: [texto("clique")] },
          ],
        },
      ]),
    );
    expect(html).toBe("<p>clique</p>");
  });

  it("escapa HTML do texto para não permitir injeção", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto('<img src=x onerror="alert(1)"> & cia')] }]),
    );
    expect(html).toBe("<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; cia</p>");
  });

  it("ignora bloco vazio em vez de emitir tag vazia", () => {
    const html = lexicalParaHtmlEditorial(
      doc([{ type: "paragraph", children: [texto("")] }, { type: "paragraph", children: [texto("ok")] }]),
    );
    expect(html).toBe("<p>ok</p>");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/lib test lexical-html`
Expected: FAIL — `Failed to resolve import "./lexical-html"`.

- [ ] **Step 3: Write the implementation**

Criar `packages/lib/src/editorial/lexical-html.ts`:

```ts
/**
 * Lexical → HTML de blocos, para o corpo editorial de um conteúdo.
 *
 * Diferente de `lexicalToHtml` (apps/cms e apps/web), que achata tudo em
 * HTML inline separado por <br> e serve para campos curtos de evento e de
 * especialista: aqui a estrutura importa — h2/h3, parágrafos, listas,
 * citações e links.
 *
 * O resultado é injetado com dangerouslySetInnerHTML, então a sanitização
 * mora AQUI: todo texto é escapado e só passam hrefs http(s) e mailto.
 */

const TAGS_HEADING = new Set(["h2", "h3", "h4"]);

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Só http, https e mailto. Qualquer outro esquema devolve null. */
function hrefSeguro(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const limpo = url.trim();
  if (!/^(https?:\/\/|mailto:)/i.test(limpo)) return null;
  return escapar(limpo);
}

function aplicarFormato(texto: string, format: number): string {
  let html = texto;
  if (format & 2) html = `<em>${html}</em>`;
  if (format & 1) html = `<strong>${html}</strong>`;
  return html;
}

/** Serializa os filhos inline de um bloco (texto, link, quebra de linha). */
function inline(nodes: unknown[]): string {
  return nodes.map(serializarInline).join("");
}

function serializarInline(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;

  if (n.type === "linebreak") return "<br>";

  if (n.type === "text") {
    return aplicarFormato(escapar(String(n.text ?? "")), Number(n.format ?? 0));
  }

  if (n.type === "link") {
    const filhos = Array.isArray(n.children) ? inline(n.children) : "";
    const campos = (n.fields ?? {}) as { url?: unknown; newTab?: unknown };
    const href = hrefSeguro(campos.url);
    if (!href) return filhos;
    const alvo = campos.newTab ? ' target="_blank" rel="noopener noreferrer"' : ' rel="noopener"';
    return `<a href="${href}"${alvo}>${filhos}</a>`;
  }

  if (Array.isArray(n.children)) return inline(n.children);
  return "";
}

function serializarBloco(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  const filhos = Array.isArray(n.children) ? n.children : [];

  if (n.type === "list") {
    const tag = n.listType === "number" ? "ol" : "ul";
    const itens = filhos
      .map((item) => {
        const conteudo = inline(
          Array.isArray((item as Record<string, unknown>)?.children)
            ? ((item as Record<string, unknown>).children as unknown[])
            : [],
        );
        return conteudo.length > 0 ? `<li>${conteudo}</li>` : "";
      })
      .join("");
    return itens.length > 0 ? `<${tag}>${itens}</${tag}>` : "";
  }

  const conteudo = inline(filhos);
  if (conteudo.length === 0) return "";

  if (n.type === "heading") {
    const tag = typeof n.tag === "string" && TAGS_HEADING.has(n.tag) ? n.tag : "h3";
    return `<${tag}>${conteudo}</${tag}>`;
  }

  if (n.type === "quote") return `<blockquote>${conteudo}</blockquote>`;

  return `<p>${conteudo}</p>`;
}

export function lexicalParaHtmlEditorial(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!Array.isArray(root?.children)) return "";
  return root.children.map(serializarBloco).join("");
}
```

- [ ] **Step 4: Export from the package index**

Em `packages/lib/src/index.ts`, acrescentar ao final:

```ts
// Editorial — serialização do corpo de conteúdos.
export { lexicalParaHtmlEditorial } from "./editorial/lexical-html";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ntc/lib test lexical-html`
Expected: PASS, 11 testes.

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/editorial packages/lib/src/index.ts
git commit -m "feat(lib): serializa Lexical em HTML de blocos para o corpo editorial

O lexicalToHtml existente achata o documento em HTML inline e serve a
campos curtos de evento; o corpo de um artigo precisa de h2/h3, listas,
citação e link. Texto escapado e href restrito a http(s)/mailto na
própria função, porque o corpo é injetado com dangerouslySetInnerHTML.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Markdown leve ↔ Lexical

O editor do corpo é um `textarea` com Markdown leve. Esta task faz a conversão nos dois sentidos, para que abrir um conteúdo salvo devolva exatamente o que foi digitado.

**Files:**
- Create: `apps/cms/src/lib/markdownLexical.ts`
- Test: `apps/cms/src/lib/markdownLexical.test.ts`

**Interfaces:**
- Consumes: `DocumentoLexical` de `apps/cms/src/lib/lexicalBuilders.ts`.
- Produces: `markdownParaLexical(md: string): DocumentoLexical` e `lexicalParaMarkdown(doc: unknown): string`.

- [ ] **Step 1: Write the failing test**

Criar `apps/cms/src/lib/markdownLexical.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { lexicalParaMarkdown, markdownParaLexical } from "./markdownLexical";

/** Atalho: converte e volta, que é a garantia que o editor precisa. */
function idaEVolta(md: string): string {
  return lexicalParaMarkdown(markdownParaLexical(md));
}

describe("markdownParaLexical", () => {
  it("transforma linha simples em parágrafo", () => {
    const doc = markdownParaLexical("Um parágrafo.");
    const bloco = doc.root.children[0] as { type: string; children: { text: string }[] };
    expect(bloco.type).toBe("paragraph");
    expect(bloco.children[0].text).toBe("Um parágrafo.");
  });

  it("transforma ## e ### em heading h2 e h3", () => {
    const doc = markdownParaLexical("## Seção\n\n### Subseção");
    const blocos = doc.root.children as { type: string; tag: string }[];
    expect(blocos[0]).toMatchObject({ type: "heading", tag: "h2" });
    expect(blocos[1]).toMatchObject({ type: "heading", tag: "h3" });
  });

  it("marca negrito e itálico no bitfield de format", () => {
    const doc = markdownParaLexical("Isto é **forte** e *suave*.");
    const filhos = (doc.root.children[0] as { children: { text: string; format: number }[] })
      .children;
    expect(filhos).toEqual([
      expect.objectContaining({ text: "Isto é ", format: 0 }),
      expect.objectContaining({ text: "forte", format: 1 }),
      expect.objectContaining({ text: " e ", format: 0 }),
      expect.objectContaining({ text: "suave", format: 2 }),
      expect.objectContaining({ text: ".", format: 0 }),
    ]);
  });

  it("transforma [texto](url) em nó de link", () => {
    const doc = markdownParaLexical("Veja o [portal](https://institutontc.com.br) hoje.");
    const filhos = (doc.root.children[0] as { children: Record<string, unknown>[] }).children;
    expect(filhos[1]).toMatchObject({
      type: "link",
      fields: { url: "https://institutontc.com.br" },
    });
  });

  it("agrupa linhas '- ' numa lista e '1. ' numa lista ordenada", () => {
    const doc = markdownParaLexical("- um\n- dois\n\n1. passo\n2. outro");
    const blocos = doc.root.children as { type: string; listType: string; children: unknown[] }[];
    expect(blocos[0]).toMatchObject({ type: "list", listType: "bullet" });
    expect(blocos[0].children).toHaveLength(2);
    expect(blocos[1]).toMatchObject({ type: "list", listType: "number" });
  });

  it("transforma '> ' em citação", () => {
    const doc = markdownParaLexical("> Uma citação.");
    expect(doc.root.children[0]).toMatchObject({ type: "quote" });
  });

  it("documento vazio tem um parágrafo vazio, não children vazio", () => {
    const doc = markdownParaLexical("");
    expect(doc.root.children).toHaveLength(1);
  });
});

describe("ida e volta", () => {
  it.each([
    ["parágrafos", "Primeiro.\n\nSegundo."],
    ["headings", "## Seção\n\nTexto.\n\n### Sub"],
    ["negrito e itálico", "Isto é **forte** e *suave*."],
    ["link", "Veja o [portal](https://institutontc.com.br) hoje."],
    ["lista", "- um\n- dois"],
    ["lista ordenada", "1. um\n2. dois"],
    ["citação", "> Uma citação."],
    ["combinado", "## Seção\n\nTexto com **peso**.\n\n- item\n\n> nota"],
  ])("preserva %s", (_nome, md) => {
    expect(idaEVolta(md)).toBe(md);
  });

  it("trata sintaxe não suportada como texto literal, sem perder conteúdo", () => {
    const md = "Uma ~~tentativa~~ de riscado e `código`.";
    expect(idaEVolta(md)).toBe(md);
  });

  it("colapsa linhas em branco repetidas numa separação só", () => {
    expect(idaEVolta("Um.\n\n\n\nDois.")).toBe("Um.\n\nDois.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/cms test markdownLexical`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the implementation**

Criar `apps/cms/src/lib/markdownLexical.ts`:

```ts
import type { DocumentoLexical } from "./lexicalBuilders";

/**
 * Markdown leve ↔ Lexical, para o editor de corpo do Painel Admin.
 *
 * Sete elementos, nada além: ## e ### (heading), **negrito**, *itálico*,
 * [texto](url), > citação, "- " e "1. " (listas). Qualquer outra sintaxe
 * de Markdown é texto literal — não há fallback silencioso que perca o
 * que foi digitado.
 *
 * O formato gravado continua sendo o Lexical do Payload, então trocar
 * este editor por um WYSIWYG depois não exige converter conteúdo.
 */

const FORMATO_BOLD = 1;
const FORMATO_ITALIC = 2;

interface NoTexto {
  type: "text";
  format: number;
  mode: "normal";
  style: "";
  text: string;
  version: 1;
  detail: 0;
}

interface NoLink {
  type: "link";
  format: "";
  indent: 0;
  version: 1;
  direction: "ltr";
  fields: { url: string; newTab: boolean; linkType: "custom" };
  children: NoTexto[];
}

type NoInline = NoTexto | NoLink;

function noTexto(text: string, format = 0): NoTexto {
  return { type: "text", format, mode: "normal", style: "", text, version: 1, detail: 0 };
}

function bloco(type: string, children: unknown[], extra: Record<string, unknown> = {}) {
  return { type, format: "", indent: 0, version: 1, direction: "ltr", children, ...extra };
}

/* ---------- Markdown → Lexical ---------- */

/**
 * Quebra uma linha em nós inline. Um regex único varre link, negrito e
 * itálico na ordem em que aparecem; o que sobra entre eles é texto puro.
 */
function inlineParaNos(linha: string): NoInline[] {
  const nos: NoInline[] = [];
  const padrao = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;

  while ((m = padrao.exec(linha)) !== null) {
    if (m.index > ultimo) nos.push(noTexto(linha.slice(ultimo, m.index)));
    if (m[1] !== undefined) {
      nos.push({
        type: "link",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        fields: { url: m[2], newTab: false, linkType: "custom" },
        children: [noTexto(m[1])],
      });
    } else if (m[3] !== undefined) {
      nos.push(noTexto(m[3], FORMATO_BOLD));
    } else if (m[4] !== undefined) {
      nos.push(noTexto(m[4], FORMATO_ITALIC));
    }
    ultimo = m.index + m[0].length;
  }

  if (ultimo < linha.length) nos.push(noTexto(linha.slice(ultimo)));
  return nos.length > 0 ? nos : [noTexto("")];
}

function itemDeLista(linha: string): { tipo: "bullet" | "number"; texto: string } | null {
  if (linha.startsWith("- ")) return { tipo: "bullet", texto: linha.slice(2).trim() };
  const ordenada = /^(\d+)\.\s+(.*)$/.exec(linha);
  if (ordenada) return { tipo: "number", texto: ordenada[2].trim() };
  return null;
}

export function markdownParaLexical(md: string): DocumentoLexical {
  const linhas = md.replace(/\r\n/g, "\n").split("\n");
  const children: unknown[] = [];

  let itens: string[] = [];
  let tipoLista: "bullet" | "number" | null = null;

  function fecharLista() {
    if (itens.length > 0 && tipoLista) {
      children.push(
        bloco(
          "list",
          itens.map((t, i) => bloco("listitem", inlineParaNos(t), { value: i + 1 })),
          { listType: tipoLista, tag: tipoLista === "number" ? "ol" : "ul", start: 1 },
        ),
      );
    }
    itens = [];
    tipoLista = null;
  }

  for (const bruta of linhas) {
    const linha = bruta.trim();

    const item = itemDeLista(linha);
    if (item) {
      if (tipoLista && tipoLista !== item.tipo) fecharLista();
      tipoLista = item.tipo;
      itens.push(item.texto);
      continue;
    }
    fecharLista();

    if (linha.length === 0) continue;

    if (linha.startsWith("### ")) {
      children.push(bloco("heading", inlineParaNos(linha.slice(4).trim()), { tag: "h3" }));
    } else if (linha.startsWith("## ")) {
      children.push(bloco("heading", inlineParaNos(linha.slice(3).trim()), { tag: "h2" }));
    } else if (linha.startsWith("> ")) {
      children.push(bloco("quote", inlineParaNos(linha.slice(2).trim())));
    } else {
      children.push(bloco("paragraph", inlineParaNos(linha)));
    }
  }
  fecharLista();

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: children.length > 0 ? [...children] : [bloco("paragraph", [noTexto("")])],
    },
  };
}

/* ---------- Lexical → Markdown ---------- */

function inlineParaMarkdown(nodes: unknown[]): string {
  return nodes
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const n = node as Record<string, unknown>;

      if (n.type === "link") {
        const filhos = Array.isArray(n.children) ? inlineParaMarkdown(n.children) : "";
        const url = (n.fields as { url?: string } | undefined)?.url ?? "";
        return `[${filhos}](${url})`;
      }
      if (n.type === "text") {
        const texto = String(n.text ?? "");
        const format = Number(n.format ?? 0);
        if (format & FORMATO_BOLD) return `**${texto}**`;
        if (format & FORMATO_ITALIC) return `*${texto}*`;
        return texto;
      }
      if (Array.isArray(n.children)) return inlineParaMarkdown(n.children);
      return "";
    })
    .join("");
}

export function lexicalParaMarkdown(doc: unknown): string {
  if (!doc || typeof doc !== "object" || !("root" in doc)) return "";
  const root = (doc as { root?: { children?: unknown[] } }).root;
  if (!Array.isArray(root?.children)) return "";

  const blocos = root.children
    .map((node) => {
      if (!node || typeof node !== "object") return "";
      const n = node as Record<string, unknown>;
      const filhos = Array.isArray(n.children) ? n.children : [];

      if (n.type === "list") {
        const ordenada = n.listType === "number";
        return filhos
          .map((item, i) => {
            const conteudo = inlineParaMarkdown(
              Array.isArray((item as Record<string, unknown>)?.children)
                ? ((item as Record<string, unknown>).children as unknown[])
                : [],
            );
            return ordenada ? `${i + 1}. ${conteudo}` : `- ${conteudo}`;
          })
          .join("\n");
      }

      const conteudo = inlineParaMarkdown(filhos);
      if (conteudo.length === 0) return "";
      if (n.type === "heading") return n.tag === "h2" ? `## ${conteudo}` : `### ${conteudo}`;
      if (n.type === "quote") return `> ${conteudo}`;
      return conteudo;
    })
    .filter((b) => b.length > 0);

  return blocos.join("\n\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ntc/cms test markdownLexical`
Expected: PASS, 17 testes (7 de conversão + 10 de ida e volta).

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/markdownLexical.ts apps/cms/src/lib/markdownLexical.test.ts
git commit -m "feat(cms): converte Markdown leve para Lexical e de volta

Sete elementos suportados (## ###, negrito, italico, link, citacao e as
duas listas); qualquer outra sintaxe fica como texto literal. O formato
gravado segue sendo o Lexical do Payload.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Categorias, tempo de leitura e segmentos de URL

Regras puras que painel e site compartilham: a lista de categorias, o rótulo de cada uma, o segmento plural que vai na URL e o cálculo do tempo de leitura.

**Files:**
- Create: `packages/lib/src/editorial/categorias.ts`
- Create: `packages/lib/src/editorial/tempo-leitura.ts`
- Test: `packages/lib/src/editorial/categorias.test.ts`
- Test: `packages/lib/src/editorial/tempo-leitura.test.ts`
- Modify: `packages/lib/src/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces, exportados por `@ntc/lib`:
  - `CONTEUDO_CATEGORIA: readonly ConteudoCategoria[]` e `type ConteudoCategoria = "artigo" | "estudo" | "nota-tecnica" | "webinar" | "material" | "noticia"`
  - `rotuloCategoria(c: ConteudoCategoria): string`
  - `categoriaParaSegmento(c: ConteudoCategoria): string`
  - `segmentoParaCategoria(s: string): ConteudoCategoria | null`
  - `SEGMENTOS_CATEGORIA: readonly string[]`
  - `calcularTempoLeituraMin(texto: string): number`

- [ ] **Step 1: Write the failing tests**

Criar `packages/lib/src/editorial/categorias.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  CONTEUDO_CATEGORIA,
  SEGMENTOS_CATEGORIA,
  categoriaParaSegmento,
  rotuloCategoria,
  segmentoParaCategoria,
} from "./categorias";

describe("categorias de conteúdo", () => {
  it("tem as 5 do protótipo mais notícia", () => {
    expect(CONTEUDO_CATEGORIA).toEqual([
      "artigo",
      "estudo",
      "nota-tecnica",
      "webinar",
      "material",
      "noticia",
    ]);
  });

  it("dá rótulo legível a cada categoria", () => {
    expect(rotuloCategoria("nota-tecnica")).toBe("Nota técnica");
    expect(rotuloCategoria("material")).toBe("Material");
    expect(rotuloCategoria("noticia")).toBe("Notícia");
  });

  it("converte categoria em segmento plural de URL", () => {
    expect(categoriaParaSegmento("artigo")).toBe("artigos");
    expect(categoriaParaSegmento("nota-tecnica")).toBe("notas-tecnicas");
    expect(categoriaParaSegmento("material")).toBe("materiais");
    expect(categoriaParaSegmento("noticia")).toBe("noticias");
  });

  it("volta do segmento para a categoria", () => {
    for (const c of CONTEUDO_CATEGORIA) {
      expect(segmentoParaCategoria(categoriaParaSegmento(c))).toBe(c);
    }
  });

  it("devolve null para segmento desconhecido", () => {
    expect(segmentoParaCategoria("podcasts")).toBeNull();
    expect(segmentoParaCategoria("")).toBeNull();
  });

  it("expõe a lista de segmentos para o generateStaticParams", () => {
    expect(SEGMENTOS_CATEGORIA).toHaveLength(CONTEUDO_CATEGORIA.length);
    expect(SEGMENTOS_CATEGORIA).toContain("webinars");
  });
});
```

Criar `packages/lib/src/editorial/tempo-leitura.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { calcularTempoLeituraMin } from "./tempo-leitura";

describe("calcularTempoLeituraMin", () => {
  it("devolve 1 para texto curto — nunca zero", () => {
    expect(calcularTempoLeituraMin("Três palavras aqui.")).toBe(1);
    expect(calcularTempoLeituraMin("")).toBe(1);
  });

  it("conta ~200 palavras por minuto, arredondando para cima", () => {
    expect(calcularTempoLeituraMin("palavra ".repeat(200))).toBe(1);
    expect(calcularTempoLeituraMin("palavra ".repeat(201))).toBe(2);
    expect(calcularTempoLeituraMin("palavra ".repeat(1000))).toBe(5);
  });

  it("ignora espaços e quebras repetidas na contagem", () => {
    expect(calcularTempoLeituraMin("uma    duas\n\n\ntrês")).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ntc/lib test editorial`
Expected: FAIL — módulos não encontrados.

- [ ] **Step 3: Write the implementations**

Criar `packages/lib/src/editorial/categorias.ts`:

```ts
/**
 * Categorias editoriais do portal.
 *
 * A lista segue os 5 filtros do protótipo aprovado
 * (28_Pagina_Conteudos_v1.html) mais "notícia" — o que o site já mostra
 * como tipo editorial, não a lista do doc 11, modelada antes do protótipo.
 * O segmento plural é o que vai na URL: /conteudos/notas-tecnicas/<slug>.
 */

export const CONTEUDO_CATEGORIA = [
  "artigo",
  "estudo",
  "nota-tecnica",
  "webinar",
  "material",
  "noticia",
] as const;

export type ConteudoCategoria = (typeof CONTEUDO_CATEGORIA)[number];

const ROTULOS: Record<ConteudoCategoria, string> = {
  artigo: "Artigo",
  estudo: "Estudo",
  "nota-tecnica": "Nota técnica",
  webinar: "Webinar",
  material: "Material",
  noticia: "Notícia",
};

const SEGMENTOS: Record<ConteudoCategoria, string> = {
  artigo: "artigos",
  estudo: "estudos",
  "nota-tecnica": "notas-tecnicas",
  webinar: "webinars",
  material: "materiais",
  noticia: "noticias",
};

export function rotuloCategoria(categoria: ConteudoCategoria): string {
  return ROTULOS[categoria];
}

export function categoriaParaSegmento(categoria: ConteudoCategoria): string {
  return SEGMENTOS[categoria];
}

export const SEGMENTOS_CATEGORIA: readonly string[] = CONTEUDO_CATEGORIA.map(
  (c) => SEGMENTOS[c],
);

export function segmentoParaCategoria(segmento: string): ConteudoCategoria | null {
  const achado = CONTEUDO_CATEGORIA.find((c) => SEGMENTOS[c] === segmento);
  return achado ?? null;
}
```

Criar `packages/lib/src/editorial/tempo-leitura.ts`:

```ts
/** Palavras por minuto de leitura adulta em texto institucional. */
const PALAVRAS_POR_MINUTO = 200;

/**
 * Tempo de leitura em minutos inteiros, mínimo 1 — "0 min de leitura"
 * num artigo curto é pior do que arredondar para cima.
 */
export function calcularTempoLeituraMin(texto: string): number {
  const palavras = texto.trim().split(/\s+/).filter((p) => p.length > 0).length;
  if (palavras === 0) return 1;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}
```

- [ ] **Step 4: Export from the package index**

Em `packages/lib/src/index.ts`, junto do export da Task 1:

```ts
export {
  CONTEUDO_CATEGORIA,
  SEGMENTOS_CATEGORIA,
  categoriaParaSegmento,
  rotuloCategoria,
  segmentoParaCategoria,
  type ConteudoCategoria,
} from "./editorial/categorias";
export { calcularTempoLeituraMin } from "./editorial/tempo-leitura";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm --filter @ntc/lib test editorial`
Expected: PASS, 9 testes.

- [ ] **Step 6: Commit**

```bash
git add packages/lib/src/editorial packages/lib/src/index.ts
git commit -m "feat(lib): categorias editoriais, segmentos de URL e tempo de leitura

Categorias seguem os filtros do prototipo 28 mais noticia. O segmento
plural e a chave da rota /conteudos/[categoria]/[slug].

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Coleção `conteudos` — campos, categorias, editor e hooks

**Files:**
- Modify: `apps/cms/src/collections/Conteudos.ts`
- Modify: `apps/cms/src/shared/types.ts:36-43`
- Create: `apps/cms/src/hooks/tempoLeitura.ts`
- Test: `apps/cms/src/hooks/tempoLeitura.test.ts`
- Modify: `packages/types/src/payload-types.ts` (gerado, não editado à mão)

**Interfaces:**
- Consumes: `calcularTempoLeituraMin`, `CONTEUDO_CATEGORIA`, `rotuloCategoria`, `categoriaParaSegmento` de `@ntc/lib` (Task 3); `lexicalParaTexto` de `apps/cms/src/lib/cms/lexical.ts`.
- Produces: coleção com os campos `assinatura`, `destaque`, `anunciarEmPreparacao`, `tempoLeituraMin`, `linkExterno`; `imagemDestaque` opcional; hook `derivarTempoLeitura`.

- [ ] **Step 1: Write the failing test**

Criar `apps/cms/src/hooks/tempoLeitura.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { derivarTempoLeitura } from "./tempoLeitura";

function docComTexto(texto: string): unknown {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", text: texto, format: 0 }],
        },
      ],
    },
  };
}

describe("derivarTempoLeitura", () => {
  it("grava o tempo calculado a partir do corpo", async () => {
    const data = { corpo: docComTexto("palavra ".repeat(600)) };
    const saida = await derivarTempoLeitura({ data } as never);
    expect(saida.tempoLeituraMin).toBe(3);
  });

  it("devolve 1 quando o corpo está vazio", async () => {
    const saida = await derivarTempoLeitura({ data: { corpo: null } } as never);
    expect(saida.tempoLeituraMin).toBe(1);
  });

  it("não descarta os demais campos do data", async () => {
    const data = { titulo: "Um título", corpo: docComTexto("curto") };
    const saida = await derivarTempoLeitura({ data } as never);
    expect(saida.titulo).toBe("Um título");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/cms test tempoLeitura`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the hook**

Criar `apps/cms/src/hooks/tempoLeitura.ts`:

```ts
import type { CollectionBeforeChangeHook } from "payload";

import { calcularTempoLeituraMin } from "@ntc/lib";

import { lexicalParaTexto } from "../lib/cms/lexical";

/**
 * Deriva `tempoLeituraMin` do corpo a cada gravação. O campo é read-only
 * no painel: é informação calculada, não digitada.
 *
 * beforeChange de coleção no Payload 3.18 já recebe `data` mesclado com o
 * documento original, então update parcial não zera o corpo ausente.
 */
export const derivarTempoLeitura: CollectionBeforeChangeHook = async ({ data }) => {
  const texto = lexicalParaTexto(data?.corpo);
  return { ...data, tempoLeituraMin: calcularTempoLeituraMin(texto) };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ntc/cms test tempoLeitura`
Expected: PASS, 3 testes.

- [ ] **Step 5: Update the shared category list**

Em `apps/cms/src/shared/types.ts`, substituir o bloco `CONTEUDO_CATEGORIA` (linhas 36–43) por um reexport, para não haver duas listas divergentes:

```ts
// Categorias editoriais: fonte única em @ntc/lib (usada por painel e site).
export { CONTEUDO_CATEGORIA, type ConteudoCategoria } from "@ntc/lib";
```

- [ ] **Step 6: Update the collection**

Em `apps/cms/src/collections/Conteudos.ts`:

Imports novos no topo:

```ts
import { lexicalEditor, BlockquoteFeature } from "@payloadcms/richtext-lexical";

import { CONTEUDO_CATEGORIA, rotuloCategoria, categoriaParaSegmento } from "@ntc/lib";

import { lexicalRestrictiveFeatures } from "../shared/lexical-config";
import { derivarTempoLeitura } from "../hooks/tempoLeitura";
```

(remover o import antigo de `CONTEUDO_CATEGORIA` vindo de `../shared/types`).

Trocar o campo `categoria` para usar o rótulo legível:

```ts
{
  name: "categoria",
  type: "select",
  options: CONTEUDO_CATEGORIA.map((c) => ({ label: rotuloCategoria(c), value: c })),
  required: true,
  index: true,
},
```

Trocar `imagemDestaque` (deixa de ser obrigatória — notícia curta e rascunho em preparação não têm foto):

```ts
{ name: "imagemDestaque", type: "upload", relationTo: "media" },
```

Dar editor próprio ao `corpo` (o global `lexicalRestrictiveFeatures` não tem citação e vale para todas as coleções editoriais; só este campo muda):

```ts
{
  name: "corpo",
  type: "richText",
  required: true,
  editor: lexicalEditor({
    features: () => [...lexicalRestrictiveFeatures, BlockquoteFeature()],
  }),
},
```

Trocar a condição do `anexoDownload`:

```ts
{
  name: "anexoDownload",
  type: "upload",
  relationTo: "media",
  admin: {
    condition: (d) => d?.categoria === "material" || d?.categoria === "estudo",
  },
},
```

Acrescentar os campos novos, depois de `dataPublicacao`:

```ts
{
  name: "assinatura",
  type: "text",
  admin: {
    description:
      "Assinatura institucional (ex.: Curadoria NTC Saúde). Use quando o conteúdo não é assinado por um especialista do corpo docente.",
  },
},
{
  name: "destaque",
  type: "checkbox",
  defaultValue: false,
  admin: { description: "Aparece na seção Destaques de /conteudos (os 3 mais recentes)." },
},
{
  name: "anunciarEmPreparacao",
  type: "checkbox",
  defaultValue: false,
  admin: {
    description:
      'Enquanto rascunho, aparece no site como "Em preparação editorial", sem link. Ignorado depois de publicado.',
  },
},
{
  name: "tempoLeituraMin",
  type: "number",
  admin: { readOnly: true, description: "Calculado a partir do corpo." },
},
{
  name: "linkExterno",
  type: "text",
  admin: { description: "URL do webinar gravado ou do material hospedado fora (opcional)." },
  validate: (valor: unknown) => {
    if (valor === null || valor === undefined || valor === "") return true;
    if (typeof valor === "string" && /^https?:\/\//i.test(valor.trim())) return true;
    return "Informe uma URL começando com http:// ou https://.";
  },
},
```

Acrescentar os hooks da coleção (logo depois de `versions`):

```ts
hooks: {
  beforeChange: [derivarTempoLeitura],
  afterChange: [
    async ({ doc }) => {
      if (process.env.NODE_ENV !== "production") return doc;
      const frontUrl = process.env.PAYLOAD_PUBLIC_FRONT_URL;
      const secret = process.env.REVALIDATE_SECRET;
      if (!frontUrl || !secret) {
        console.warn("[Conteudos] PAYLOAD_PUBLIC_FRONT_URL ou REVALIDATE_SECRET ausentes.");
        return doc;
      }
      // O caminho da página de leitura depende da categoria, então este
      // hook monta o path em vez de usar revalidatePage(":slug").
      const paths = ["/conteudos"];
      if (typeof doc?.categoria === "string" && typeof doc?.slug === "string") {
        paths.push(`/conteudos/${categoriaParaSegmento(doc.categoria)}/${doc.slug}`);
      }
      await Promise.allSettled(
        paths.map(async (path) => {
          try {
            await fetch(`${frontUrl}/api/revalidate`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Revalidate-Secret": secret },
              body: JSON.stringify({ path }),
            });
          } catch (e) {
            console.error(`[Conteudos] Falha ao revalidar ${path}`, e);
          }
        }),
      );
      return doc;
    },
  ],
},
```

Ajustar `defaultColumns` para incluir a situação nova:

```ts
defaultColumns: ["titulo", "categoria", "area", "dataPublicacao", "destaque", "_status"],
```

- [ ] **Step 7: Regenerate Payload types**

Run: `pnpm --filter @ntc/cms payload:generate`
Expected: `packages/types/src/payload-types.ts` passa a trazer `assinatura`, `destaque`, `anunciarEmPreparacao`, `tempoLeituraMin`, `linkExterno` em `Conteudo`, com `imagemDestaque` opcional e a união de categorias com os 6 valores novos.

- [ ] **Step 8: Run checks**

Run: `pnpm --filter @ntc/cms test && pnpm typecheck`
Expected: PASS nos dois. Se o typecheck apontar usos do valor antigo `"material-download"` ou `"insight"`, corrigir para os valores novos — a coleção está vazia, não há dado a migrar.

- [ ] **Step 9: Commit**

```bash
git add apps/cms/src/collections/Conteudos.ts apps/cms/src/shared/types.ts \
  apps/cms/src/hooks/tempoLeitura.ts apps/cms/src/hooks/tempoLeitura.test.ts \
  packages/types/src/payload-types.ts
git commit -m "feat(cms): modela conteudos com assinatura, destaque e tempo de leitura

Categorias passam a ser as do prototipo 28 mais noticia, com a lista
unica em @ntc/lib. imagemDestaque deixa de ser obrigatoria (e por isso
muda o schema). O campo corpo ganha editor proprio com citacao, sem
alterar o lexical restritivo das demais colecoes.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Leitura de conteúdos para o painel

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCms.ts`
- Test: `apps/cms/src/lib/cms/painelCms.conteudos.test.ts`

**Interfaces:**
- Consumes: `lexicalParaMarkdown` (Task 2); `rotuloCategoria`, `type ConteudoCategoria` de `@ntc/lib` (Task 3); `obterPayload` de `@/lib/payloadClient`.
- Produces:

```ts
export type SituacaoConteudo = "publicado" | "rascunho" | "em-preparacao";

export interface ConteudoCmsResumo {
  id: string;
  titulo: string;
  categoria: ConteudoCategoria;
  categoriaRotulo: string;
  vertical: string;          // nome da área, ou "Transversal"
  dataISO: string | null;
  situacao: SituacaoConteudo;
  destaque: boolean;
}

export interface ConteudoCmsDetalhe extends ConteudoCmsResumo {
  slug: string;
  lide: string;
  corpoMarkdown: string;
  assinatura: string;
  autorIds: string[];
  areaId: string | null;
  imagemDestaqueUrl: string | null;
  imagemDestaqueId: string | null;
  anexoId: string | null;
  anexoNome: string | null;
  linkExterno: string;
  anunciarEmPreparacao: boolean;
  seoTitulo: string;
  seoDescricao: string;
}

export async function listarConteudosCms(): Promise<ConteudoCmsResumo[]>;
export async function obterConteudoCms(id: string): Promise<ConteudoCmsDetalhe | null>;
export async function listarAreasCms(): Promise<{ id: string; nome: string }[]>;
```

- [ ] **Step 1: Write the failing test**

Criar `apps/cms/src/lib/cms/painelCms.conteudos.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
const findByID = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ find, findByID }),
}));

import { listarConteudosCms, obterConteudoCms } from "./painelCms";

const docBase = {
  id: 7,
  titulo: "Cinco anos de Lei 14.133",
  slug: "cinco-anos-de-lei-14133",
  categoria: "estudo",
  area: { id: 2, nome: "NTC Gestão Pública" },
  lide: "Leitura técnica longa.",
  corpo: {
    root: {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", text: "Corpo.", format: 0 }] }],
    },
  },
  assinatura: "Curadoria NTC Gestão Pública",
  autor: [],
  dataPublicacao: "2026-09-20T00:00:00.000Z",
  destaque: true,
  anunciarEmPreparacao: false,
  _status: "published",
};

beforeEach(() => {
  find.mockReset();
  findByID.mockReset();
});

describe("listarConteudosCms", () => {
  it("mapeia categoria, vertical e situação publicada", async () => {
    find.mockResolvedValue({ docs: [docBase] });
    const [item] = await listarConteudosCms();
    expect(item).toMatchObject({
      id: "7",
      titulo: "Cinco anos de Lei 14.133",
      categoria: "estudo",
      categoriaRotulo: "Estudo",
      vertical: "NTC Gestão Pública",
      situacao: "publicado",
      destaque: true,
    });
  });

  it("chama o Payload com draft para enxergar rascunho", async () => {
    find.mockResolvedValue({ docs: [] });
    await listarConteudosCms();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "conteudos", draft: true, sort: "-dataPublicacao" }),
    );
  });

  it('chama de "Transversal" o conteúdo sem área', async () => {
    find.mockResolvedValue({ docs: [{ ...docBase, area: null }] });
    const [item] = await listarConteudosCms();
    expect(item.vertical).toBe("Transversal");
  });

  it('distingue rascunho comum de rascunho "em preparação"', async () => {
    find.mockResolvedValue({
      docs: [
        { ...docBase, id: 1, _status: "draft", anunciarEmPreparacao: false },
        { ...docBase, id: 2, _status: "draft", anunciarEmPreparacao: true },
      ],
    });
    const itens = await listarConteudosCms();
    expect(itens.map((i) => i.situacao)).toEqual(["rascunho", "em-preparacao"]);
  });
});

describe("obterConteudoCms", () => {
  it("devolve o corpo já em Markdown, pronto para o textarea", async () => {
    findByID.mockResolvedValue(docBase);
    const det = await obterConteudoCms("7");
    expect(det?.corpoMarkdown).toBe("Corpo.");
    expect(det?.assinatura).toBe("Curadoria NTC Gestão Pública");
  });

  it("devolve null quando o documento não existe", async () => {
    findByID.mockRejectedValue(new Error("Not Found"));
    expect(await obterConteudoCms("999")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/cms test painelCms.conteudos`
Expected: FAIL — `listarConteudosCms` não é exportado.

- [ ] **Step 3: Write the implementation**

Acrescentar ao final de `apps/cms/src/lib/cms/painelCms.ts` (seguindo o estilo de `listarEventosCms`: tipagem local do doc, sem `any`):

```ts
/* ---------------- Conteúdos editoriais ---------------- */

export type SituacaoConteudo = "publicado" | "rascunho" | "em-preparacao";

export interface ConteudoCmsResumo {
  id: string;
  titulo: string;
  categoria: ConteudoCategoria;
  categoriaRotulo: string;
  vertical: string;
  dataISO: string | null;
  situacao: SituacaoConteudo;
  destaque: boolean;
}

export interface ConteudoCmsDetalhe extends ConteudoCmsResumo {
  slug: string;
  lide: string;
  corpoMarkdown: string;
  assinatura: string;
  autorIds: string[];
  areaId: string | null;
  imagemDestaqueUrl: string | null;
  imagemDestaqueId: string | null;
  anexoId: string | null;
  anexoNome: string | null;
  linkExterno: string;
  anunciarEmPreparacao: boolean;
  seoTitulo: string;
  seoDescricao: string;
}

interface DocConteudo {
  id: string | number;
  titulo?: string;
  slug?: string;
  categoria?: string;
  area?: unknown;
  lide?: string;
  corpo?: unknown;
  assinatura?: string | null;
  autor?: unknown;
  dataPublicacao?: string | null;
  destaque?: boolean | null;
  anunciarEmPreparacao?: boolean | null;
  imagemDestaque?: unknown;
  anexoDownload?: unknown;
  linkExterno?: string | null;
  seoTitulo?: string | null;
  seoDescricao?: string | null;
  _status?: string;
}

function situacaoDoConteudo(doc: DocConteudo): SituacaoConteudo {
  if (doc._status === "published") return "publicado";
  return doc.anunciarEmPreparacao ? "em-preparacao" : "rascunho";
}

function verticalDoConteudo(area: unknown): string {
  if (area && typeof area === "object" && "nome" in area) {
    const nome = (area as { nome?: string }).nome;
    if (nome) return nome;
  }
  return "Transversal";
}

/** Relação que pode vir como id cru ou como objeto populado (depth: 1). */
function idDaRelacao(valor: unknown): string | null {
  if (typeof valor === "number" || typeof valor === "string") return String(valor);
  if (valor && typeof valor === "object" && "id" in valor) {
    return String((valor as { id: string | number }).id);
  }
  return null;
}

function resumoDeConteudo(doc: DocConteudo): ConteudoCmsResumo {
  const categoria = (doc.categoria ?? "artigo") as ConteudoCategoria;
  return {
    id: String(doc.id),
    titulo: doc.titulo ?? "(sem título)",
    categoria,
    categoriaRotulo: rotuloCategoria(categoria),
    vertical: verticalDoConteudo(doc.area),
    dataISO: doc.dataPublicacao ?? null,
    situacao: situacaoDoConteudo(doc),
    destaque: Boolean(doc.destaque),
  };
}

export async function listarConteudosCms(): Promise<ConteudoCmsResumo[]> {
  const payload = await obterPayload();
  const res = await payload.find({
    collection: "conteudos",
    depth: 1,
    limit: 200,
    draft: true,
    sort: "-dataPublicacao",
  });
  return res.docs.map((d) => resumoDeConteudo(d as unknown as DocConteudo));
}

export async function obterConteudoCms(id: string): Promise<ConteudoCmsDetalhe | null> {
  try {
    const payload = await obterPayload();
    const d = (await payload.findByID({
      collection: "conteudos",
      id,
      depth: 1,
      draft: true,
    })) as unknown as DocConteudo;

    const imagem = d.imagemDestaque;
    const anexo = d.anexoDownload;

    return {
      ...resumoDeConteudo(d),
      slug: d.slug ?? "",
      lide: d.lide ?? "",
      corpoMarkdown: lexicalParaMarkdown(d.corpo),
      assinatura: d.assinatura ?? "",
      autorIds: Array.isArray(d.autor)
        ? d.autor.map(idDaRelacao).filter((v): v is string => v !== null)
        : [],
      areaId: idDaRelacao(d.area),
      imagemDestaqueUrl:
        imagem && typeof imagem === "object" && "url" in imagem
          ? ((imagem as { url?: string }).url ?? null)
          : null,
      imagemDestaqueId: idDaRelacao(imagem),
      anexoId: idDaRelacao(anexo),
      anexoNome:
        anexo && typeof anexo === "object" && "filename" in anexo
          ? ((anexo as { filename?: string }).filename ?? null)
          : null,
      linkExterno: d.linkExterno ?? "",
      anunciarEmPreparacao: Boolean(d.anunciarEmPreparacao),
      seoTitulo: d.seoTitulo ?? "",
      seoDescricao: d.seoDescricao ?? "",
    };
  } catch (e) {
    console.error("[obterConteudoCms]", e);
    return null;
  }
}

/** Áreas para o select de vertical do formulário. */
export async function listarAreasCms(): Promise<{ id: string; nome: string }[]> {
  const payload = await obterPayload();
  const res = await payload.find({ collection: "areas", limit: 50, sort: "nome" });
  return res.docs.map((d) => {
    const doc = d as unknown as { id: string | number; nome?: string };
    return { id: String(doc.id), nome: doc.nome ?? "(sem nome)" };
  });
}
```

Acrescentar os imports no topo do arquivo:

```ts
import { rotuloCategoria, type ConteudoCategoria } from "@ntc/lib";

import { lexicalParaMarkdown } from "@/lib/markdownLexical";
```

Se os campos `seoTitulo`/`seoDescricao` tiverem outro nome em `apps/cms/src/shared/seoFields.ts`, usar o nome real — conferir o arquivo antes de escrever.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ntc/cms test painelCms.conteudos`
Expected: PASS, 6 testes.

- [ ] **Step 5: Commit**

```bash
git add apps/cms/src/lib/cms/painelCms.ts apps/cms/src/lib/cms/painelCms.conteudos.test.ts
git commit -m "feat(cms): leitura de conteudos para o painel

Resumo para a lista e detalhe com o corpo ja convertido para Markdown,
pronto para o textarea do editor. Rascunho com anunciarEmPreparacao vira
situacao propria na lista.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Escrita de conteúdos e Server Actions

**Files:**
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts`
- Modify: `apps/cms/src/app/(painel)/acoes.ts`
- Test: `apps/cms/src/lib/cms/painelCmsEscrita.conteudos.test.ts`

**Interfaces:**
- Consumes: `markdownParaLexical` (Task 2); `ResultadoEscrita` já existente em `painelCmsEscrita.ts`; `obterUsuarioCms` de `@/lib/cms/autenticacao`.
- Produces:

```ts
export interface CamposConteudo {
  titulo: string;
  slug: string;
  categoria: string;
  areaId: string;            // "" = sem área (Transversal)
  lide: string;
  corpoMarkdown: string;
  assinatura: string;
  autorIds: string[];
  dataPublicacao: string;    // ISO "YYYY-MM-DD"
  destaque: boolean;
  anunciarEmPreparacao: boolean;
  linkExterno: string;
  seoTitulo: string;
  seoDescricao: string;
}

export async function salvarConteudoCms(id: string | null, campos: CamposConteudo): Promise<ResultadoEscrita & { id?: string }>;
export async function publicarConteudoCms(id: string): Promise<ResultadoEscrita>;
export async function despublicarConteudoCms(id: string): Promise<ResultadoEscrita>;
export async function excluirConteudoCms(id: string): Promise<ResultadoEscrita>;
```

Server Actions em `acoes.ts`, todas com o gate de sessão: `listarConteudos`, `carregarConteudo`, `carregarAreas`, `salvarConteudo`, `publicarConteudo`, `despublicarConteudo`, `excluirConteudo`.

- [ ] **Step 1: Write the failing test**

Criar `apps/cms/src/lib/cms/painelCmsEscrita.conteudos.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
const update = vi.fn();
const deleteFn = vi.fn();

vi.mock("@/lib/payloadClient", () => ({
  obterPayload: async () => ({ create, update, delete: deleteFn }),
}));

import {
  despublicarConteudoCms,
  excluirConteudoCms,
  publicarConteudoCms,
  salvarConteudoCms,
  type CamposConteudo,
} from "./painelCmsEscrita";

const campos: CamposConteudo = {
  titulo: "Nota sobre a LGPD",
  slug: "nota-sobre-a-lgpd",
  categoria: "nota-tecnica",
  areaId: "2",
  lide: "O que muda na operação.",
  corpoMarkdown: "## Contexto\n\nTexto do corpo.",
  assinatura: "Direção Científica NTC",
  autorIds: [],
  dataPublicacao: "2026-09-22",
  destaque: false,
  anunciarEmPreparacao: false,
  linkExterno: "",
  seoTitulo: "",
  seoDescricao: "",
};

beforeEach(() => {
  create.mockReset();
  update.mockReset();
  deleteFn.mockReset();
});

describe("salvarConteudoCms", () => {
  it("cria como rascunho quando não há id, convertendo o corpo para Lexical", async () => {
    create.mockResolvedValue({ id: 12 });
    const r = await salvarConteudoCms(null, campos);
    expect(r).toEqual({ ok: true, id: "12" });

    const enviado = create.mock.calls[0][0];
    expect(enviado.collection).toBe("conteudos");
    expect(enviado.draft).toBe(true);
    expect(enviado.data.titulo).toBe("Nota sobre a LGPD");
    expect(enviado.data.corpo.root.children[0]).toMatchObject({ type: "heading", tag: "h2" });
  });

  it("atualiza preservando o estado de publicação quando há id", async () => {
    update.mockResolvedValue({ id: 12 });
    await salvarConteudoCms("12", campos);
    expect(update.mock.calls[0][0]).toMatchObject({ collection: "conteudos", id: "12", draft: true });
  });

  it("grava área nula quando areaId vem vazio", async () => {
    create.mockResolvedValue({ id: 13 });
    await salvarConteudoCms(null, { ...campos, areaId: "" });
    expect(create.mock.calls[0][0].data.area).toBeNull();
  });

  it("recusa título vazio sem tocar no banco", async () => {
    const r = await salvarConteudoCms(null, { ...campos, titulo: "   " });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/título/i);
    expect(create).not.toHaveBeenCalled();
  });

  it("recusa lide acima de 280 caracteres", async () => {
    const r = await salvarConteudoCms(null, { ...campos, lide: "x".repeat(281) });
    expect(r.ok).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("traduz erro de slug duplicado do Payload", async () => {
    create.mockRejectedValue(new Error("duplicate key value violates unique constraint"));
    const r = await salvarConteudoCms(null, campos);
    expect(r).toEqual({ ok: false, erro: "Já existe um conteúdo com este endereço (slug)." });
  });
});

describe("publicar, despublicar e excluir", () => {
  it("publicar exige corpo, lide e categoria — e manda _status published", async () => {
    update.mockResolvedValue({ id: 12 });
    const r = await publicarConteudoCms("12");
    expect(r.ok).toBe(true);
    expect(update.mock.calls[0][0].data).toEqual({ _status: "published" });
  });

  it("despublicar volta para draft", async () => {
    update.mockResolvedValue({ id: 12 });
    await despublicarConteudoCms("12");
    expect(update.mock.calls[0][0].data).toEqual({ _status: "draft" });
  });

  it("excluir chama delete na coleção certa", async () => {
    deleteFn.mockResolvedValue({});
    const r = await excluirConteudoCms("12");
    expect(r.ok).toBe(true);
    expect(deleteFn.mock.calls[0][0]).toMatchObject({ collection: "conteudos", id: "12" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/cms test painelCmsEscrita.conteudos`
Expected: FAIL — funções não exportadas.

- [ ] **Step 3: Write the implementation**

Acrescentar ao final de `apps/cms/src/lib/cms/painelCmsEscrita.ts`:

```ts
/* ---------------- Conteúdos editoriais ---------------- */

export interface CamposConteudo {
  titulo: string;
  slug: string;
  categoria: string;
  areaId: string;
  lide: string;
  corpoMarkdown: string;
  assinatura: string;
  autorIds: string[];
  dataPublicacao: string;
  destaque: boolean;
  anunciarEmPreparacao: boolean;
  linkExterno: string;
  seoTitulo: string;
  seoDescricao: string;
}

/** Erros do Postgres/Payload que têm tradução legível para o editor. */
function traduzirErroConteudo(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/duplicate key|unique constraint/i.test(msg)) {
    return "Já existe um conteúdo com este endereço (slug).";
  }
  return msg || "Erro ao salvar o conteúdo.";
}

function validarConteudo(campos: CamposConteudo): string | null {
  if (campos.titulo.trim().length === 0) return "Informe o título do conteúdo.";
  if (campos.lide.trim().length === 0) return "Informe a lide (resumo de abertura).";
  if (campos.lide.trim().length > 280) return "A lide deve ter no máximo 280 caracteres.";
  if (campos.categoria.trim().length === 0) return "Escolha a categoria.";
  return null;
}

export async function salvarConteudoCms(
  id: string | null,
  campos: CamposConteudo,
): Promise<ResultadoEscrita & { id?: string }> {
  const erro = validarConteudo(campos);
  if (erro) return { ok: false, erro };

  const data: Record<string, unknown> = {
    titulo: campos.titulo.trim(),
    categoria: campos.categoria,
    area: campos.areaId.trim().length > 0 ? Number(campos.areaId) : null,
    lide: campos.lide.trim(),
    corpo: markdownParaLexical(campos.corpoMarkdown),
    assinatura: ouNulo(campos.assinatura),
    autor: campos.autorIds.map((v) => Number(v)).filter((n) => !Number.isNaN(n)),
    dataPublicacao: campos.dataPublicacao,
    destaque: campos.destaque,
    anunciarEmPreparacao: campos.anunciarEmPreparacao,
    linkExterno: ouNulo(campos.linkExterno),
    seoTitulo: ouNulo(campos.seoTitulo),
    seoDescricao: ouNulo(campos.seoDescricao),
  };
  // Slug vazio deixa o hook autoSlug("titulo") gerar a partir do título.
  if (campos.slug.trim().length > 0) data.slug = campos.slug.trim();

  try {
    const payload = await obterPayload();
    if (id) {
      // draft: true preserva o estado de publicação — salvar não publica.
      await payload.update({ collection: "conteudos", id, data, draft: true, overrideAccess: true });
      return { ok: true, id };
    }
    const criado = await payload.create({
      collection: "conteudos",
      data,
      draft: true,
      overrideAccess: true,
    });
    return { ok: true, id: String((criado as { id: string | number }).id) };
  } catch (e) {
    return { ok: false, erro: traduzirErroConteudo(e) };
  }
}

export async function publicarConteudoCms(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "conteudos",
      id,
      data: { _status: "published" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: traduzirErroConteudo(e) };
  }
}

export async function despublicarConteudoCms(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "conteudos",
      id,
      data: { _status: "draft" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: traduzirErroConteudo(e) };
  }
}

export async function excluirConteudoCms(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.delete({ collection: "conteudos", id, overrideAccess: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: traduzirErroConteudo(e) };
  }
}
```

Import no topo do arquivo:

```ts
import { markdownParaLexical } from "@/lib/markdownLexical";
```

- [ ] **Step 4: Add the Server Actions**

Em `apps/cms/src/app/(painel)/acoes.ts`, acrescentar ao final (seguindo o padrão: gate de sessão antes de qualquer toque na Local API):

```ts
export async function listarConteudos(): Promise<ConteudoCmsResumo[]> {
  if (!(await obterUsuarioCms())) return [];
  return listarConteudosCms();
}

export async function carregarConteudo(id: string): Promise<ConteudoCmsDetalhe | null> {
  if (!(await obterUsuarioCms())) return null;
  return obterConteudoCms(id);
}

export async function carregarAreas(): Promise<{ id: string; nome: string }[]> {
  if (!(await obterUsuarioCms())) return [];
  return listarAreasCms();
}

export async function salvarConteudo(
  id: string | null,
  campos: CamposConteudo,
): Promise<ResultadoEscrita & { id?: string }> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await salvarConteudoCms(id, campos);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function publicarConteudo(id: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await publicarConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function despublicarConteudo(id: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await despublicarConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}

export async function excluirConteudo(id: string): Promise<ResultadoEscrita> {
  if (!(await obterUsuarioCms())) return RECUSADO;
  const r = await excluirConteudoCms(id);
  if (r.ok) revalidatePath("/");
  return r;
}
```

Acrescentar aos imports existentes de `@/lib/cms/painelCms` e `@/lib/cms/painelCmsEscrita` os nomes novos (`listarConteudosCms`, `obterConteudoCms`, `listarAreasCms`, `type ConteudoCmsResumo`, `type ConteudoCmsDetalhe`; `salvarConteudoCms`, `publicarConteudoCms`, `despublicarConteudoCms`, `excluirConteudoCms`, `type CamposConteudo`).

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm --filter @ntc/cms test painelCmsEscrita.conteudos && pnpm typecheck`
Expected: PASS, 9 testes; typecheck verde.

- [ ] **Step 6: Commit**

```bash
git add apps/cms/src/lib/cms/painelCmsEscrita.ts \
  apps/cms/src/lib/cms/painelCmsEscrita.conteudos.test.ts \
  "apps/cms/src/app/(painel)/acoes.ts"
git commit -m "feat(cms): escrita e Server Actions de conteudos

Salvar sempre grava rascunho (draft: true), publicar e despublicar mexem
so no _status. Slug duplicado vira mensagem legivel em vez do erro cru do
Postgres. Toda action valida a sessao antes de tocar a Local API.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Tela de lista, item de menu e contagem no Dashboard

**Files:**
- Create: `apps/cms/src/app/(painel)/TelaConteudos.tsx`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx`
- Modify: `apps/cms/src/app/(painel)/page.tsx`
- Modify: `apps/cms/src/app/(painel)/TelaDashboard.tsx`

**Interfaces:**
- Consumes: `ConteudoCmsResumo` (Task 5); actions `listarConteudos`, `carregarConteudo`, `carregarAreas` (Task 6).
- Produces: `TelaConteudos` com props `{ conteudos, onAbrir, onNovo }`; `TelaId` do shell ganha `"conteudos"`.

- [ ] **Step 1: Write the screen**

Criar `apps/cms/src/app/(painel)/TelaConteudos.tsx` (Client Component; espelha a anatomia de `TelaEventos.tsx` — `pcms-pagehead`, `pcms-toolbar`, `pcms-chip`, tabela):

```tsx
"use client";

import { useMemo, useState } from "react";

import { CONTEUDO_CATEGORIA, rotuloCategoria } from "@ntc/lib";

import type { ConteudoCmsResumo, SituacaoConteudo } from "@/lib/cms/painelCms";

const ROTULO_SITUACAO: Record<SituacaoConteudo, string> = {
  publicado: "Publicado",
  rascunho: "Rascunho",
  "em-preparacao": "Em preparação",
};

interface TelaConteudosProps {
  conteudos: ConteudoCmsResumo[];
  onAbrir: (id: string) => void;
  onNovo: () => void;
}

/** Lista de conteúdos editoriais — busca, filtros e acesso ao detalhe. */
export function TelaConteudos({ conteudos, onAbrir, onNovo }: TelaConteudosProps) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [situacao, setSituacao] = useState<string>("todas");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return conteudos.filter((c) => {
      if (categoria !== "todas" && c.categoria !== categoria) return false;
      if (situacao !== "todas" && c.situacao !== situacao) return false;
      if (termo.length > 0 && !c.titulo.toLowerCase().includes(termo)) return false;
      return true;
    });
  }, [conteudos, busca, categoria, situacao]);

  return (
    <>
      <div className="pcms-pagehead">
        <div>
          <p className="pcms-pagehead__eyebrow">Publicação editorial</p>
          <h1>Conteúdos</h1>
          <p>
            {conteudos.length === 0
              ? "Nenhum conteúdo cadastrado ainda."
              : `${conteudos.length} ${conteudos.length === 1 ? "conteúdo" : "conteúdos"} — rascunhos inclusos.`}
          </p>
        </div>
        <div className="pcms-pagehead__acoes">
          <button type="button" className="pcms-btn" onClick={onNovo}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Novo conteúdo
          </button>
        </div>
      </div>

      <div className="pcms-toolbar">
        <div className="pcms-field">
          <label htmlFor="ct-busca">Buscar por título</label>
          <input
            id="ct-busca"
            type="search"
            value={busca}
            placeholder="Título do conteúdo..."
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="pcms-field pcms-field--curto">
          <label htmlFor="ct-categoria">Categoria</label>
          <select
            id="ct-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todas">Todas</option>
            {CONTEUDO_CATEGORIA.map((c) => (
              <option key={c} value={c}>
                {rotuloCategoria(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="pcms-field pcms-field--curto">
          <label htmlFor="ct-situacao">Situação</label>
          <select id="ct-situacao" value={situacao} onChange={(e) => setSituacao(e.target.value)}>
            <option value="todas">Todas</option>
            <option value="publicado">Publicado</option>
            <option value="rascunho">Rascunho</option>
            <option value="em-preparacao">Em preparação</option>
          </select>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="pcms-vazio">Nenhum conteúdo encontrado com esses filtros.</p>
      ) : (
        <table className="pcms-tabela">
          <thead>
            <tr>
              <th scope="col">Título</th>
              <th scope="col">Categoria</th>
              <th scope="col">Vertical</th>
              <th scope="col">Data</th>
              <th scope="col">Situação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id}>
                <td>
                  <button type="button" className="pcms-link" onClick={() => onAbrir(c.id)}>
                    {c.titulo}
                  </button>
                  {c.destaque && <span className="pcms-selo">Destaque</span>}
                </td>
                <td>{c.categoriaRotulo}</td>
                <td>{c.vertical}</td>
                <td>{c.dataISO ? new Date(c.dataISO).toLocaleDateString("pt-BR") : "—"}</td>
                <td>
                  <span
                    className={
                      c.situacao === "publicado" ? "pcms-selo pcms-selo--ok" : "pcms-selo"
                    }
                  >
                    {ROTULO_SITUACAO[c.situacao]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
```

Conferir em `apps/cms/src/app/(painel)/painel.css` os nomes reais das classes de tabela, selo, link e vazio (`pcms-tabela`, `pcms-selo`, `pcms-link`, `pcms-vazio`) e usar as que existirem; `.pcms-field--curto` é conhecida por não ter CSS (dívida pré-existente, §19.3 item 12) — se continuar sem regra, usar só `pcms-field`.

- [ ] **Step 2: Wire it into the shell**

Em `apps/cms/src/app/(painel)/ShellCms.tsx`:

1. `type TelaId` ganha `"conteudos"`.
2. `Ico` ganha o ícone:

```tsx
conteudos: (
  <svg className="pcms-nav__ico" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <path d="M9 12h7M9 16h7" />
  </svg>
),
```

3. `NAV_PRINCIPAL` ganha o item entre Eventos e Home:

```tsx
{ id: "conteudos", rotulo: "Conteúdos", icone: Ico.conteudos },
```

4. `CRUMB` ganha `conteudos: "Editorial · Conteúdos"`.
5. Props novas na interface: `conteudos: ConteudoCmsResumo[]`.
6. Estado e carregamento do detalhe, no padrão de `abrirEvento`:

```tsx
const [conteudoDet, setConteudoDet] = useState<ConteudoCmsDetalhe | null>(null);
const [criandoConteudo, setCriandoConteudo] = useState(false);
const [areas, setAreas] = useState<{ id: string; nome: string }[]>([]);

function abrirConteudo(id: string) {
  iniciarCarga(async () => {
    const [det, listaAreas] = await Promise.all([carregarConteudo(id), carregarAreas()]);
    if (det) {
      setAreas(listaAreas);
      setConteudoDet(det);
      setCriandoConteudo(false);
    }
  });
}

function novoConteudo() {
  iniciarCarga(async () => {
    setAreas(await carregarAreas());
    setConteudoDet(null);
    setCriandoConteudo(true);
  });
}
```

7. `irPara` também limpa `setConteudoDet(null)` e `setCriandoConteudo(false)`.
8. `detalheAberto` passa a considerar o conteúdo: `const detalheAberto = eventoDet ?? palestranteDet ?? conteudoDet ?? (criandoConteudo ? true : null);` — ajustar para o tipo que o arquivo usa hoje, mantendo a semântica "há um detalhe aberto".
9. No corpo, antes do bloco de telas, renderizar `DetalheConteudo` quando `conteudoDet || criandoConteudo` (o componente chega na Task 8), e acrescentar ao bloco de telas:

```tsx
{tela === "conteudos" && (
  <TelaConteudos conteudos={conteudos} onAbrir={abrirConteudo} onNovo={novoConteudo} />
)}
```

- [ ] **Step 3: Feed the data from the page**

Em `apps/cms/src/app/(painel)/page.tsx`: acrescentar `listarConteudosCms` ao `Promise.all`, a variável `conteudos: ConteudoCmsResumo[] = []` e a prop `conteudos={conteudos}` no `<ShellCms>`.

- [ ] **Step 4: Add the dashboard count**

Em `apps/cms/src/app/(painel)/TelaDashboard.tsx`: aceitar `conteudos: ConteudoCmsResumo[]` nas props e acrescentar um card de contagem "Conteúdos publicados" — `conteudos.filter((c) => c.situacao === "publicado").length` — ao lado dos existentes, com a mesma marcação dos outros cards do arquivo. Passar a prop no `ShellCms`.

- [ ] **Step 5: Verify it renders**

Parar o dev server se estiver rodando; então:

Run: `pnpm lint && pnpm typecheck`
Expected: 0 erros.

Subir `pnpm dev:cms`, abrir `http://localhost:3001/`, clicar em **Conteúdos**: a tela abre com a lista vazia e o botão "Novo conteúdo" habilitado. O Dashboard mostra "Conteúdos publicados: 0".

- [ ] **Step 6: Commit**

```bash
git add "apps/cms/src/app/(painel)/TelaConteudos.tsx" "apps/cms/src/app/(painel)/ShellCms.tsx" \
  "apps/cms/src/app/(painel)/page.tsx" "apps/cms/src/app/(painel)/TelaDashboard.tsx"
git commit -m "feat(cms): tela de lista de conteudos no menu Editorial

Busca por titulo, filtros por categoria e situacao, e o primeiro botao
Novo habilitado fora do CRM. Dashboard passa a contar os publicados.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Detalhe do conteúdo — editor com pré-visualização

**Files:**
- Create: `apps/cms/src/app/(painel)/DetalheConteudo.tsx`
- Modify: `apps/cms/src/app/(painel)/painel.css`
- Modify: `apps/cms/src/app/(painel)/ShellCms.tsx` (renderizar o componente)

**Interfaces:**
- Consumes: `ConteudoCmsDetalhe` (Task 5); `CamposConteudo` e as actions `salvarConteudo`, `publicarConteudo`, `despublicarConteudo`, `excluirConteudo` (Task 6); `lexicalParaHtmlEditorial` e `markdownParaLexical` (Tasks 1 e 2); `SeletorPalestrantes` e `CampoUpload` já existentes; `AvisoForm` de `./crm/CamposCrm`.
- Produces: `DetalheConteudo` com props `{ conteudo, areas, palestrantes, onVoltar, onSalvou }`.

- [ ] **Step 1: Write the component**

Criar `apps/cms/src/app/(painel)/DetalheConteudo.tsx`. Pontos obrigatórios:

- `"use client"` e estado local com todos os campos de `CamposConteudo`, iniciados de `conteudo` (ou vazios quando `conteudo === null`, que é o caso "Novo conteúdo"; `dataPublicacao` nasce com a data de hoje em `YYYY-MM-DD`).
- **Pré-visualização ao vivo**, calculada com `useMemo` sobre o Markdown digitado — sem ida ao servidor:

```tsx
const previewHtml = useMemo(
  () => lexicalParaHtmlEditorial(markdownParaLexical(corpoMarkdown)),
  [corpoMarkdown],
);
```

e renderizada em `<div className="pcms-rich" dangerouslySetInnerHTML={{ __html: previewHtml }} />` (a sanitização mora em `lexicalParaHtmlEditorial`, Task 1).

- Linha de ajuda acima do textarea, com a sintaxe exata:

```tsx
<p className="pcms-editor__hint">
  Formatação: <code>## Subtítulo</code> · <code>### Subtítulo menor</code> ·{" "}
  <code>**negrito**</code> · <code>*itálico*</code> · <code>[texto](https://…)</code> ·{" "}
  <code>&gt; citação</code> · <code>- item</code> · <code>1. item</code>. Linha em branco
  separa parágrafos.
</p>
```

- Cabeçalho com título, selo de situação e os botões: **Salvar rascunho** (sempre), **Publicar** (quando não publicado), **Despublicar** (quando publicado), **Excluir** (com confirmação em dois cliques, no padrão da remoção de documento do CRM — primeiro clique troca o rótulo para "Confirmar exclusão", segundo executa; um botão "Cancelar" ao lado desfaz).
- Coluna lateral com: Categoria (`select` das 6), Vertical (`select` das áreas, com opção "Transversal" de valor `""`), Data de publicação (`input type="date"`), Autores (`SeletorPalestrantes`, reaproveitado), Assinatura (`input`), Imagem de destaque (`CampoUpload`), Anexo (`CampoUpload`, só quando categoria é `material` ou `estudo`), Link externo, `Destaque` (checkbox), `Anunciar como "em preparação"` (checkbox, só renderizado quando a situação não é `publicado`), Slug (`input`, com ajuda "deixe em branco para gerar a partir do título"), SEO título e SEO descrição.
- Todo input com `<label htmlFor>` associado (§10).
- Erros e sucesso em `<AvisoForm>`, como nas telas do CRM. Antes de chamar `publicarConteudo`, validar no cliente que título, lide, corpo e categoria estão preenchidos, e que há autor **ou** assinatura; se faltar, mostrar o aviso e não chamar a action.
- Salvar um conteúdo novo: `salvarConteudo(null, campos)` devolve `{ ok, id }`; guardar o `id` no estado para que o próximo salvar seja update, e chamar `onSalvou()` para o shell recarregar a lista.

- [ ] **Step 2: Add the two-column editor CSS**

Em `apps/cms/src/app/(painel)/painel.css`, acrescentar (idioma do painel: cantos arredondados são a exceção deliberada da v1.5; cores dos tokens já usados no arquivo):

```css
/* Editor de corpo com pré-visualização lado a lado (Conteúdos). */
.pcms-editor-duplo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}
.pcms-editor-duplo textarea {
  min-height: 28rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}
.pcms-editor-duplo__preview {
  min-height: 28rem;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  border: 1px solid var(--pcms-borda);
  border-radius: 8px;
  background: #fff;
}
@media (max-width: 900px) {
  .pcms-editor-duplo {
    grid-template-columns: 1fr;
  }
}
```

Conferir o nome real da variável de borda no arquivo (`--pcms-borda` ou equivalente) antes de escrever; usar a que existe.

- [ ] **Step 3: Render it from the shell**

Em `ShellCms.tsx`, no bloco de detalhes (antes de `palestranteDet`):

```tsx
{conteudoDet || criandoConteudo ? (
  <DetalheConteudo
    key={conteudoDet?.id ?? "novo"}
    conteudo={conteudoDet}
    areas={areas}
    palestrantes={palestrantes}
    onVoltar={() => {
      setConteudoDet(null);
      setCriandoConteudo(false);
    }}
    onSalvou={() => router.refresh()}
  />
) : ...}
```

Se o arquivo ainda não usa `useRouter`, importar de `next/navigation` e instanciar — é como a lista volta atualizada depois de salvar.

- [ ] **Step 4: Verify in the browser**

Parar o build/dev conflitante; subir `pnpm dev:cms`.

1. Conteúdos → **Novo conteúdo**: o formulário abre vazio, com a data de hoje.
2. Digitar no corpo `## Seção`, uma linha em branco, `Texto com **peso** e [link](https://institutontc.com.br).`, uma linha em branco e `- item`: a pré-visualização mostra título, parágrafo com negrito e link, e a lista.
3. Salvar rascunho: o aviso confirma; voltar à lista mostra o conteúdo como "Rascunho".
4. Reabrir: o textarea traz exatamente o Markdown digitado (ida e volta da Task 2 funcionando contra banco real).

- [ ] **Step 5: Run checks and commit**

Run: `pnpm lint && pnpm typecheck && pnpm --filter @ntc/cms test`
Expected: tudo verde.

```bash
git add "apps/cms/src/app/(painel)/DetalheConteudo.tsx" "apps/cms/src/app/(painel)/ShellCms.tsx" \
  "apps/cms/src/app/(painel)/painel.css"
git commit -m "feat(cms): editor de conteudo com Markdown leve e pre-visualizacao

Textarea a esquerda, HTML renderizado a direita pelo mesmo serializador
que o site usa. Publicar exige titulo, lide, corpo, categoria e autoria.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Seed dos 9 conteúdos em preparação

**Files:**
- Create: `apps/cms/src/seed/seedConteudosEmPreparacao.ts`
- Modify: `apps/cms/package.json` (script `conteudos:seed-em-preparacao`)

**Interfaces:**
- Consumes: `obterPayload`; a coleção da Task 4.
- Produces: script idempotente por `slug`.

- [ ] **Step 1: Write the seed**

Criar `apps/cms/src/seed/seedConteudosEmPreparacao.ts`. Os nove registros, com **título, lide e assinatura copiados literalmente** de `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts` (§5.3 — não reescrever o texto). Para os três que aparecem em Destaques, a lide é a descrição longa da seção `DESTAQUES`, não a curta do card.

```ts
import { obterPayload } from "../lib/payloadClient";

/**
 * Importa como RASCUNHO os 9 cards que hoje estão escritos no site
 * (conteudoConteudos.ts) como "Em preparação editorial". Eles viram lista
 * de trabalho no painel em vez de sumirem quando a biblioteca passar a ler
 * do CMS.
 *
 * Idempotente por slug: rodar de novo não duplica nem sobrescreve.
 * Uso: pnpm --filter @ntc/cms conteudos:seed-em-preparacao
 */

interface Semente {
  slug: string;
  titulo: string;
  categoria: string;
  /** Slug da área em `areas`; null = transversal. */
  areaSlug: string | null;
  lide: string;
  assinatura: string;
  destaque: boolean;
}

const SEMENTES: Semente[] = [
  {
    slug: "cinco-anos-de-lei-14133",
    titulo: "Cinco anos de Lei 14.133: o que mudou nas redes.",
    categoria: "estudo",
    areaSlug: "gestao-publica",
    lide:
      "Leitura técnica longa sobre a aplicação da nova Lei de Licitações no cotidiano dos órgãos públicos, com diagnóstico do que efetivamente se transformou na prática administrativa, dos riscos que persistem e das frentes em disputa interpretativa entre TCU, AGU e tribunais.",
    assinatura: "Curadoria NTC Gestão Pública",
    destaque: true,
  },
  {
    slug: "recomposicao-da-aprendizagem",
    titulo: "Recomposição da aprendizagem: o que os dados estão dizendo.",
    categoria: "artigo",
    areaSlug: "educacao",
    lide:
      "Artigo editorial sobre o estado atual da alfabetização na idade certa no Brasil pós-pandemia, com leitura crítica dos resultados das principais avaliações e proposições técnicas para gestores municipais e estaduais que estão organizando seus planos de recomposição.",
    assinatura: "Direção Científica NTC",
    destaque: true,
  },
  {
    slug: "previne-brasil-2026",
    titulo: "Previne Brasil 2026: financiamento da APS e o que muda.",
    categoria: "webinar",
    areaSlug: "saude",
    lide:
      "Webinar executivo sobre a arquitetura atual do financiamento da Atenção Primária à Saúde no Brasil, os efeitos das mudanças recentes do programa Previne Brasil sobre a operação das equipes de Saúde da Família e os caminhos de planejamento para a gestão municipal.",
    assinatura: "Equipe NTC Saúde",
    destaque: true,
  },
  {
    slug: "ia-generativa-no-setor-publico",
    titulo: "IA generativa no setor público: limites e oportunidades.",
    categoria: "nota-tecnica",
    areaSlug: null,
    lide:
      "Nota técnica sobre o estado atual da incorporação de inteligência artificial generativa pelos órgãos da administração pública brasileira, com leitura crítica de riscos.",
    assinatura: "Direção Científica NTC",
    destaque: false,
  },
  {
    slug: "educacao-integral-em-escala",
    titulo: "Educação integral em escala: leitura institucional da Lei 14.640/2023.",
    categoria: "estudo",
    areaSlug: "educacao",
    lide:
      "Estudo sobre a implementação da política de educação em tempo integral nas redes públicas brasileiras após a sanção da Lei 14.640/2023.",
    assinatura: "Equipe NTC Educação",
    destaque: false,
  },
  {
    slug: "direcao-estrategica-na-administracao-publica",
    titulo: "A direção estratégica na administração pública contemporânea.",
    categoria: "webinar",
    areaSlug: "gestao-publica",
    lide:
      "Webinar executivo sobre direção institucional, articulação federativa e leitura de cenário para dirigentes da administração pública brasileira.",
    assinatura: "Curadoria NTC Gestão Pública",
    destaque: false,
  },
  {
    slug: "direcao-institucional-em-saude-publica",
    titulo: "Direção institucional em saúde pública: o estado da arte.",
    categoria: "estudo",
    areaSlug: "saude",
    lide:
      "Estudo sobre o desenho da direção institucional do SUS no Brasil — competências, governança, articulação federativa e gargalos de capacidade técnica.",
    assinatura: "Curadoria NTC Saúde",
    destaque: false,
  },
  {
    slug: "governanca-de-dados-no-setor-publico",
    titulo: "Governança de dados no setor público: LGPD e a operação cotidiana.",
    categoria: "webinar",
    areaSlug: null,
    lide:
      "Webinar transversal sobre a aplicação da LGPD na rotina das três áreas — Educação, Gestão Pública e Saúde — com foco em dilemas concretos da operação.",
    assinatura: "Direção Científica NTC",
    destaque: false,
  },
  {
    slug: "primeira-infancia-e-educacao-infantil",
    titulo: "Primeira infância e educação infantil: kit de planejamento de rede.",
    categoria: "material",
    areaSlug: "educacao",
    lide:
      "Material didático para gestores municipais — fluxos, indicadores, modelos e referências para o planejamento da política de creches e pré-escolas.",
    assinatura: "Equipe NTC Educação",
    destaque: false,
  },
];

async function principal(): Promise<void> {
  const payload = await obterPayload();

  const areas = await payload.find({ collection: "areas", limit: 50 });
  const idPorSlug = new Map<string, number>();
  for (const a of areas.docs) {
    const doc = a as unknown as { id: number; slug?: string };
    if (doc.slug) idPorSlug.set(doc.slug, doc.id);
  }

  let criados = 0;
  let pulados = 0;

  for (const s of SEMENTES) {
    const existente = await payload.find({
      collection: "conteudos",
      where: { slug: { equals: s.slug } },
      limit: 1,
      draft: true,
    });
    if (existente.docs.length > 0) {
      pulados += 1;
      continue;
    }

    let area: number | null = null;
    if (s.areaSlug) {
      area = idPorSlug.get(s.areaSlug) ?? null;
      if (area === null) {
        console.warn(
          `[seed] área "${s.areaSlug}" não existe no banco — "${s.titulo}" fica como Transversal.`,
        );
      }
    }

    await payload.create({
      collection: "conteudos",
      draft: true,
      overrideAccess: true,
      data: {
        titulo: s.titulo,
        slug: s.slug,
        categoria: s.categoria,
        area,
        lide: s.lide,
        assinatura: s.assinatura,
        destaque: s.destaque,
        anunciarEmPreparacao: true,
        dataPublicacao: new Date().toISOString(),
        corpo: {
          root: {
            type: "root",
            format: "",
            indent: 0,
            version: 1,
            direction: "ltr",
            children: [
              {
                type: "paragraph",
                format: "",
                indent: 0,
                version: 1,
                direction: "ltr",
                children: [
                  {
                    type: "text",
                    format: 0,
                    mode: "normal",
                    style: "",
                    detail: 0,
                    version: 1,
                    text: "[conteúdo a ser redigido pela curadoria editorial]",
                  },
                ],
              },
            ],
          },
        },
      },
    });
    criados += 1;
  }

  console.log(`[seed] conteúdos em preparação: ${criados} criados, ${pulados} já existiam.`);
  process.exit(0);
}

void principal();
```

O `corpo` nasce com o marcador `[conteúdo a ser redigido pela curadoria editorial]` porque o campo é obrigatório e §5.3 proíbe inventar texto institucional.

- [ ] **Step 2: Add the script**

Em `apps/cms/package.json`, nos `scripts`, seguindo o formato dos seeds que já existem (conferir como `payload:seed` é declarado e usar o mesmo runner):

```json
"conteudos:seed-em-preparacao": "payload run src/seed/seedConteudosEmPreparacao.ts"
```

- [ ] **Step 3: Run it — twice**

Só depois do `payload:push:schema` da Task 16; se o schema ainda não foi aplicado, pular esta execução e deixar registrado na entrega.

Run: `pnpm --filter @ntc/cms conteudos:seed-em-preparacao`
Expected: `9 criados, 0 já existiam`.

Run de novo: `pnpm --filter @ntc/cms conteudos:seed-em-preparacao`
Expected: `0 criados, 9 já existiam` — a idempotência é o que esta segunda execução prova.

- [ ] **Step 4: Commit**

```bash
git add apps/cms/src/seed/seedConteudosEmPreparacao.ts apps/cms/package.json
git commit -m "feat(cms): importa os 9 cards em preparacao como rascunho

Titulo, lide e assinatura copiados de conteudoConteudos.ts. Idempotente
por slug; area resolvida por slug, com aviso quando nao existe.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Site — leitura do CMS e biblioteca de `/conteudos`

**Files:**
- Create: `apps/web/lib/conteudos.ts`
- Test: `apps/web/lib/conteudos.test.ts`
- Modify: `apps/web/app/(conteudos)/conteudos/page.tsx`
- Modify: `apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx`
- Modify: `apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts`

**Interfaces:**
- Consumes: `obterPayload` de `apps/web/lib/payloadClient.ts`; `categoriaParaSegmento`, `rotuloCategoria`, `lexicalParaHtmlEditorial` de `@ntc/lib`.
- Produces:

```ts
export interface ConteudoCard {
  id: string;
  titulo: string;
  lide: string;
  categoria: ConteudoCategoria;
  tipoLabel: string;
  vert: "edu" | "gov" | "sau" | "trans";
  verticalLabel: string;
  href: string | null;          // null = em preparação, sem link
  emPreparacao: boolean;
  dataLegivel: string;          // "Publicado · 22/09/2026" ou "Em preparação editorial"
  assinatura: string;
  imagemUrl: string | null;
  search: string;               // texto normalizado para a busca client-side
}

export interface ConteudoLeitura extends ConteudoCard {
  slug: string;
  corpoHtml: string;
  tempoLeituraMin: number;
  autores: { nome: string; titulacao: string; fotoUrl: string | null }[];
  anexoUrl: string | null;
  linkExterno: string | null;
  dataISO: string | null;
  seoTitulo: string;
  seoDescricao: string;
}

export async function listarConteudosPublicados(): Promise<ConteudoCard[]>;
export async function listarDestaques(): Promise<ConteudoCard[]>;
export async function carregarConteudo(segmento: string, slug: string): Promise<ConteudoLeitura | null>;
export async function listarRelacionados(doc: ConteudoLeitura): Promise<ConteudoCard[]>;
```

- [ ] **Step 1: Write the failing test**

Criar `apps/web/lib/conteudos.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();

vi.mock("./payloadClient", () => ({ obterPayload: async () => ({ find }) }));

import { carregarConteudo, listarConteudosPublicados, listarDestaques } from "./conteudos";

const publicado = {
  id: 1,
  titulo: "Cinco anos de Lei 14.133",
  slug: "cinco-anos-de-lei-14133",
  categoria: "estudo",
  area: { nome: "NTC Gestão Pública", slug: "gestao-publica" },
  lide: "Leitura técnica longa.",
  assinatura: "Curadoria NTC Gestão Pública",
  dataPublicacao: "2026-09-20T00:00:00.000Z",
  destaque: true,
  anunciarEmPreparacao: false,
  tempoLeituraMin: 7,
  autor: [],
  _status: "published",
};

const emPreparacao = {
  ...publicado,
  id: 2,
  titulo: "IA generativa no setor público",
  slug: "ia-generativa-no-setor-publico",
  categoria: "nota-tecnica",
  area: null,
  destaque: false,
  anunciarEmPreparacao: true,
  _status: "draft",
};

beforeEach(() => find.mockReset());

describe("listarConteudosPublicados", () => {
  it("dá href ao publicado e nenhum ao que está em preparação", async () => {
    find.mockResolvedValue({ docs: [publicado, emPreparacao] });
    const cards = await listarConteudosPublicados();
    expect(cards[0].href).toBe("/conteudos/estudos/cinco-anos-de-lei-14133");
    expect(cards[0].emPreparacao).toBe(false);
    expect(cards[1].href).toBeNull();
    expect(cards[1].emPreparacao).toBe(true);
  });

  it("mapeia a área para a sigla de vertical do protótipo", async () => {
    find.mockResolvedValue({ docs: [publicado, emPreparacao] });
    const cards = await listarConteudosPublicados();
    expect(cards[0].vert).toBe("gov");
    expect(cards[1].vert).toBe("trans");
    expect(cards[1].verticalLabel).toBe("Transversal");
  });

  it("descarta rascunho que não pede anúncio", async () => {
    find.mockResolvedValue({
      docs: [publicado, { ...emPreparacao, anunciarEmPreparacao: false }],
    });
    const cards = await listarConteudosPublicados();
    expect(cards).toHaveLength(1);
  });

  it("devolve lista vazia — e não lança — quando o banco falha", async () => {
    find.mockRejectedValue(new Error("connection refused"));
    await expect(listarConteudosPublicados()).resolves.toEqual([]);
  });
});

describe("listarDestaques", () => {
  it("devolve no máximo 3", async () => {
    find.mockResolvedValue({
      docs: [1, 2, 3, 4].map((n) => ({ ...publicado, id: n, slug: `slug-${n}` })),
    });
    expect(await listarDestaques()).toHaveLength(3);
  });
});

describe("carregarConteudo", () => {
  it("devolve null para segmento de categoria inexistente, sem ir ao banco", async () => {
    expect(await carregarConteudo("podcasts", "qualquer")).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  it("devolve null quando o documento está em rascunho", async () => {
    find.mockResolvedValue({ docs: [] });
    expect(await carregarConteudo("estudos", "cinco-anos-de-lei-14133")).toBeNull();
  });

  it("consulta filtrando por slug e categoria", async () => {
    find.mockResolvedValue({ docs: [{ ...publicado, corpo: { root: { children: [] } } }] });
    await carregarConteudo("estudos", "cinco-anos-de-lei-14133");
    const args = find.mock.calls[0][0];
    expect(args.where.slug.equals).toBe("cinco-anos-de-lei-14133");
    expect(args.where.categoria.equals).toBe("estudo");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/web test conteudos`
Expected: FAIL — módulo não encontrado. (Se o `apps/web` ainda não tiver script `test`, acrescentar `"test": "vitest run"` ao `package.json` dele, espelhando o do `apps/cms`, e a config mínima do Vitest que o cms usa.)

- [ ] **Step 3: Write the implementation**

Criar `apps/web/lib/conteudos.ts`, com `cache()` do React em cada função de leitura, `depth: 2` (para trazer área, imagem e autores), e **try/catch em toda leitura** devolvendo vazio/null. O mapa de vertical:

```ts
const VERT_POR_SLUG_AREA: Record<string, "edu" | "gov" | "sau"> = {
  educacao: "edu",
  "gestao-publica": "gov",
  saude: "sau",
};
```

Conferir em `apps/cms/src/collections/Areas.ts` e no banco os slugs reais das três áreas antes de fixar este mapa; se divergirem, usar os reais. Área ausente ou fora do mapa vira `trans` / "Transversal".

O campo `search` de cada card é o título mais a lide, normalizados (minúsculas e sem acento, `normalize("NFD").replace(/[̀-ͯ]/g, "")`) — é o que `BibliotecaConteudos` já usa para a busca.

`carregarConteudo` converte o segmento em categoria com `segmentoParaCategoria`; se der `null`, devolve `null` **sem consultar o banco**, e busca por `where: { slug: { equals }, categoria: { equals } }` com `draft: false`.

O `corpoHtml` sai de `lexicalParaHtmlEditorial(doc.corpo)`.

`listarDestaques` filtra `destaque: true` entre os publicados e corta em 3. `listarRelacionados(doc)` devolve os itens de `conteudosRelacionados` quando o editor escolheu algum; se o campo estiver vazio, os 3 publicados mais recentes da mesma área (excluindo o próprio); sem área, os 3 mais recentes de qualquer vertical.

- [ ] **Step 4: Feed the page from the CMS**

Em `apps/web/app/(conteudos)/conteudos/page.tsx`:
- `export const revalidate = 600;` (era 3600 — doc 13 fixa 600 para `/conteudos*`).
- Chamar `listarConteudosPublicados()` e `listarDestaques()` no Server Component e passar os cards por props para a seção de destaques e para `<BibliotecaConteudos>`.
- Remover os imports de `CARDS_BIBLIOTECA` e `DESTAQUES`.

Em `BibliotecaConteudos.tsx`: trocar a origem dos cards de `CARDS_BIBLIOTECA` para a prop `cards: ConteudoCard[]`. **Não mudar marcação nem classes** — a filtragem, o URL-sync, o contador e o estado vazio continuam exatamente como estão. Card com `href` vira `<a>`; card sem `href` mantém o selo "Em breve" como hoje. Acrescentar `{ value: "noticia", label: "Notícias" }` a `FILTROS_TIPO`, e alinhar os `value` dos filtros existentes com os valores de categoria (`estudo`, `artigo`, `nota-tecnica`, `webinar`, `material`).

Em `conteudoConteudos.ts`: remover `CARDS_BIBLIOTECA` e `DESTAQUES` (e os tipos que ficarem órfãos). **Manter** `BIBLIOTECA_HEAD`, `TABS_VERTICAL`, `FILTROS_TIPO`, `BIBLIOTECA_EMPTY`, `BIBLIOTECA_FOOTER`, `BIBLIOTECA_SEARCH_PLACEHOLDER`, `DESTAQUES_HEAD` e todo o resto da página.

- [ ] **Step 5: Run checks**

Run: `pnpm --filter @ntc/web test conteudos && pnpm lint && pnpm typecheck`
Expected: PASS, 9 testes; lint e typecheck verdes.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/conteudos.ts apps/web/lib/conteudos.test.ts \
  "apps/web/app/(conteudos)/conteudos/page.tsx" \
  "apps/web/app/(conteudos)/conteudos/BibliotecaConteudos.tsx" \
  "apps/web/app/(conteudos)/conteudos/conteudoConteudos.ts"
git commit -m "feat(web): biblioteca de conteudos alimentada pelo CMS

Os 9 cards estaticos saem do codigo; publicados ganham link e data real,
rascunho com anunciarEmPreparacao mantem o selo Em preparacao. Marcacao e
CSS dos cards intactos. ISR de /conteudos passa a 600s.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Site — página de leitura do conteúdo

**Files:**
- Create: `apps/web/app/(conteudos)/conteudos/[categoria]/[slug]/page.tsx`
- Modify: `apps/web/app/(conteudos)/conteudos-prototipo.css` (ou o CSS do route group, conferir o nome real)

**Interfaces:**
- Consumes: `carregarConteudo`, `listarConteudosPublicados`, `listarRelacionados` (Task 10); `rotuloCategoria`, `SEGMENTOS_CATEGORIA` de `@ntc/lib`.
- Produces: a rota pública; nada consome depois.

- [ ] **Step 1: Write the page**

Criar `apps/web/app/(conteudos)/conteudos/[categoria]/[slug]/page.tsx` — Server Component puro, sem `"use client"`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { carregarConteudo, listarConteudosPublicados, listarRelacionados } from "@/lib/conteudos";

export const revalidate = 600;
export const dynamicParams = true;

interface Params {
  params: Promise<{ categoria: string; slug: string }>;
}

/** Só os publicados entram na build; o resto chega por dynamicParams. */
export async function generateStaticParams() {
  const cards = await listarConteudosPublicados();
  return cards
    .filter((c) => c.href !== null)
    .map((c) => {
      const [, , categoria, slug] = c.href!.split("/");
      return { categoria, slug };
    });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria, slug } = await params;
  const doc = await carregarConteudo(categoria, slug);
  if (!doc) return { title: "Conteúdo não encontrado · Grupo NTC" };
  return {
    title: doc.seoTitulo || `${doc.titulo} · ${doc.tipoLabel} · Grupo NTC`,
    description: doc.seoDescricao || doc.lide,
    openGraph: {
      title: doc.titulo,
      description: doc.seoDescricao || doc.lide,
      type: "article",
      images: doc.imagemUrl ? [{ url: doc.imagemUrl }] : undefined,
    },
  };
}

export default async function ConteudoPage({ params }: Params) {
  const { categoria, slug } = await params;
  const doc = await carregarConteudo(categoria, slug);
  if (!doc) notFound();

  const relacionados = await listarRelacionados(doc);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: doc.titulo,
    description: doc.lide,
    datePublished: doc.dataISO ?? undefined,
    author:
      doc.autores.length > 0
        ? doc.autores.map((a) => ({ "@type": "Person", name: a.nome }))
        : [{ "@type": "Organization", name: doc.assinatura || "Instituto NTC do Brasil" }],
    publisher: { "@type": "Organization", name: "Instituto NTC do Brasil" },
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero editorial */}
      <section className="cont-artigo-hero">
        <div className="container">
          <nav className="cont-artigo-breadcrumb" aria-label="Você está em">
            <Link href="/">Grupo NTC</Link>
            <span aria-hidden="true">›</span>
            <Link href="/conteudos">Conteúdos</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{doc.tipoLabel}</span>
          </nav>
          <p className="cont-artigo-eyebrow">
            {doc.verticalLabel} · {doc.tipoLabel}
          </p>
          <h1 className="cont-artigo-titulo">{doc.titulo}</h1>
          <p className="cont-artigo-lide">{doc.lide}</p>
          <p className="cont-artigo-meta">
            <span>{doc.autores.length > 0 ? doc.autores.map((a) => a.nome).join(" · ") : doc.assinatura}</span>
            <span>{doc.dataLegivel}</span>
            <span>{doc.tempoLeituraMin} min de leitura</span>
          </p>
          {doc.imagemUrl && (
            <Image
              className="cont-artigo-capa"
              src={doc.imagemUrl}
              alt=""
              width={1200}
              height={675}
              sizes="(max-width: 900px) 100vw, 900px"
              priority
            />
          )}
        </div>
      </section>

      {/* 2. Corpo */}
      <article className="cont-artigo-corpo">
        <div
          className="cont-artigo-texto"
          dangerouslySetInnerHTML={{ __html: doc.corpoHtml }}
        />

        {/* 3. Anexo ou link externo */}
        {(doc.anexoUrl || doc.linkExterno) && (
          <p className="cont-artigo-acao">
            <a
              className="btn btn--gold"
              href={doc.anexoUrl ?? doc.linkExterno!}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doc.anexoUrl ? "Baixar material →" : "Assistir ao webinar →"}
            </a>
          </p>
        )}

        {/* 4. Assinatura */}
        <aside className="cont-artigo-assinatura">
          {doc.autores.length > 0 ? (
            <ul>
              {doc.autores.map((a) => (
                <li key={a.nome}>
                  {a.fotoUrl && (
                    <Image src={a.fotoUrl} alt="" width={96} height={110} sizes="96px" />
                  )}
                  <div>
                    <strong>{a.nome}</strong>
                    <span>{a.titulacao}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>{doc.assinatura}</p>
          )}
          <Link href="/o-grupo/corpo-docente">Conhecer o corpo docente →</Link>
        </aside>
      </article>

      {/* 5. Leia também */}
      {relacionados.length > 0 && (
        <section className="cont-artigo-relacionados">
          <div className="container">
            <h2>Leia também</h2>
            <ul>
              {relacionados.map((r) => (
                <li key={r.id}>
                  {r.href ? <Link href={r.href}>{r.titulo}</Link> : <span>{r.titulo}</span>}
                  <span>{r.tipoLabel} · {r.verticalLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
```

O CTA final de 3 pontes (item 6 da spec) reaproveita o bloco já existente em `/conteudos` — extrair o markup de `CTA_FINAL_HEAD`/`CTA_FINAL_PONTES` para um componente `CtaFinalConteudos.tsx` no mesmo diretório e usá-lo nas duas páginas, em vez de duplicar.

- [ ] **Step 2: Add the CSS**

No CSS do route group `(conteudos)`, acrescentar as classes `cont-artigo-*`, respeitando o sistema visual: coluna de leitura `max-width: 68ch` centralizada, Cormorant nos `h2`/`h3` do corpo, Barlow no texto, `border-radius: 0` nas estruturas (§3), cores dos tokens do próprio arquivo, e as regras de `.cont-artigo-texto blockquote`, `ul`, `ol`, `a`. Conferir os nomes de variáveis e o arquivo real do grupo antes de escrever (o grupo importa o CSS no seu `layout.tsx`, não no root — padrão de 10/07).

- [ ] **Step 3: Verify in the browser**

Subir `pnpm dev` (web + cms). Publicar um conteúdo pelo painel; abrir o card em `/conteudos` e seguir o link.

Conferir: hero com vertical, categoria, data e tempo de leitura; corpo com subtítulos, negrito, lista, citação e link funcionando; assinatura; "Leia também"; CTA final. Abrir um slug inexistente → 404. Abrir o slug de um rascunho → 404.

- [ ] **Step 4: Run the full build**

**Parar o dev server antes** (o `.next` é compartilhado e o build corrompe o dev em execução).

Run: `pnpm build`
Expected: verde no monorepo inteiro, com a rota nova listada como ISR.

- [ ] **Step 5: Commit**

```bash
git add "apps/web/app/(conteudos)/conteudos/[categoria]" \
  "apps/web/app/(conteudos)/conteudos/CtaFinalConteudos.tsx" \
  "apps/web/app/(conteudos)"
git commit -m "feat(web): pagina de leitura de conteudo em /conteudos/[categoria]/[slug]

Server Component puro, ISR 600s, so publicados. Hero editorial, corpo em
coluna de leitura, assinatura do autor ou institucional, relacionados e o
CTA final compartilhado com /conteudos. JSON-LD Article e OpenGraph.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Contatos — regras puras, campos novos no global e seed

**Files:**
- Create: `packages/lib/src/institucional/contatos.ts`
- Test: `packages/lib/src/institucional/contatos.test.ts`
- Modify: `packages/lib/src/index.ts`
- Modify: `apps/cms/src/globals/Rodape.ts`
- Create: `apps/cms/src/seed/seedContatos.ts`
- Modify: `apps/cms/package.json`

**Interfaces:**
- Consumes: nada.
- Produces, exportados por `@ntc/lib`: `telefoneParaHref(n: string): string`, `whatsappParaHref(n: string): string`, `VERTICAIS_CONTATO: readonly { valor: string; rotulo: string }[]`.

- [ ] **Step 1: Write the failing test**

Criar `packages/lib/src/institucional/contatos.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { telefoneParaHref, whatsappParaHref } from "./contatos";

describe("telefoneParaHref", () => {
  it("monta tel: com código do país a partir do número mascarado", () => {
    expect(telefoneParaHref("(63) 3212-1199")).toBe("tel:+556332121199");
  });

  it("aceita número sem máscara", () => {
    expect(telefoneParaHref("6332121199")).toBe("tel:+556332121199");
  });

  it("não duplica o 55 quando o número já vem com código do país", () => {
    expect(telefoneParaHref("+55 (63) 3212-1199")).toBe("tel:+556332121199");
  });

  it("devolve string vazia para entrada vazia ou sem dígitos", () => {
    expect(telefoneParaHref("")).toBe("");
    expect(telefoneParaHref("   ")).toBe("");
    expect(telefoneParaHref("ligue para nós")).toBe("");
  });
});

describe("whatsappParaHref", () => {
  it("monta o link do wa.me", () => {
    expect(whatsappParaHref("(63) 98444-4040")).toBe("https://wa.me/5563984444040");
  });

  it("não duplica o 55", () => {
    expect(whatsappParaHref("55 63 98444-4040")).toBe("https://wa.me/5563984444040");
  });

  it("devolve string vazia quando não há número", () => {
    expect(whatsappParaHref("")).toBe("");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/lib test institucional`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the implementation**

Criar `packages/lib/src/institucional/contatos.ts`:

```ts
/**
 * Telefone e WhatsApp são guardados como o editor digita — "(63) 3212-1199" —
 * e os links são derivados daqui. Um campo só por número: dois campos
 * (texto e link) divergem com o tempo.
 */

/** Só dígitos, com 55 na frente quando o número não trouxe código do país. */
function digitosComPais(numero: string): string {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.length === 0) return "";
  if (digitos.startsWith("55") && digitos.length >= 12) return digitos;
  return `55${digitos}`;
}

export function telefoneParaHref(numero: string): string {
  const d = digitosComPais(numero);
  return d.length > 0 ? `tel:+${d}` : "";
}

export function whatsappParaHref(numero: string): string {
  const d = digitosComPais(numero);
  return d.length > 0 ? `https://wa.me/${d}` : "";
}

/** As três coordenações que têm canal próprio na página de contato. */
export const VERTICAIS_CONTATO = [
  { valor: "educacao", rotulo: "NTC Educação" },
  { valor: "gestao-publica", rotulo: "NTC Gestão Pública" },
  { valor: "saude", rotulo: "NTC Saúde" },
] as const;
```

Exportar em `packages/lib/src/index.ts`:

```ts
export {
  telefoneParaHref,
  whatsappParaHref,
  VERTICAIS_CONTATO,
} from "./institucional/contatos";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ntc/lib test institucional`
Expected: PASS, 7 testes.

- [ ] **Step 5: Extend the global**

Em `apps/cms/src/globals/Rodape.ts`: trocar `label: "Rodapé Institucional"` por `label: "Contatos institucionais"` (o **slug `rodape` fica**, para não renomear tabela) e acrescentar os campos, depois de `emailDpo`:

```ts
{ name: "emailSuporte", type: "email" },
{ name: "emailEventos", type: "email" },
{
  name: "verticais",
  type: "array",
  label: "Coordenações por vertical",
  maxRows: 3,
  fields: [
    {
      name: "vertical",
      type: "select",
      required: true,
      options: VERTICAIS_CONTATO.map((v) => ({ label: v.rotulo, value: v.valor })),
    },
    { name: "email", type: "email", required: true },
    { name: "opcaoTelefone", type: "text", admin: { description: 'Ex.: "opção 1"' } },
  ],
},
```

com `import { VERTICAIS_CONTATO } from "@ntc/lib";` no topo.

- [ ] **Step 6: Write the seed**

Criar `apps/cms/src/seed/seedContatos.ts` — grava os valores que hoje estão no código, **idempotente: só escreve campo vazio**, para nunca sobrescrever o que o PO já tiver editado:

```ts
import { obterPayload } from "../lib/payloadClient";

/**
 * Preenche o global de contatos com os valores que hoje estão escritos no
 * site, para que ele nasça preenchido e o site não mude de aparência no dia
 * em que passar a ler do CMS.
 *
 * Idempotente: campo já preenchido não é tocado.
 * Uso: pnpm --filter @ntc/cms contatos:seed
 */

const PADRAO = {
  telefoneInstitucional: "(63) 3212-1199",
  whatsappInstitucional: "(63) 98444-4040",
  emailInstitucional: "contato@institutontc.com.br",
  emailImprensa: "imprensa@institutontc.com.br",
  emailDpo: "dpo@institutontc.com.br",
  emailSuporte: "suporte@institutontc.com.br",
  emailEventos: "eventosonline@institutontc.com.br",
  enderecoCompleto:
    "Instituto NTC do Brasil\nSCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001\nAsa Sul · CEP 70308-200 · Brasília – DF",
} as const;

const VERTICAIS_PADRAO = [
  { vertical: "educacao", email: "educacao@institutontc.com.br", opcaoTelefone: "opção 1" },
  {
    vertical: "gestao-publica",
    email: "gestaopublica@institutontc.com.br",
    opcaoTelefone: "opção 2",
  },
  { vertical: "saude", email: "saude@institutontc.com.br", opcaoTelefone: "opção 3" },
];

async function principal(): Promise<void> {
  const payload = await obterPayload();
  const atual = (await payload.findGlobal({ slug: "rodape" })) as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(PADRAO)) {
    const existente = atual?.[campo];
    if (existente === null || existente === undefined || existente === "") data[campo] = valor;
  }
  if (!Array.isArray(atual?.verticais) || atual.verticais.length === 0) {
    data.verticais = VERTICAIS_PADRAO;
  }

  if (Object.keys(data).length === 0) {
    console.log("[seed] contatos: nada a fazer, todos os campos já preenchidos.");
    process.exit(0);
  }

  await payload.updateGlobal({ slug: "rodape", data, overrideAccess: true });
  console.log(`[seed] contatos: ${Object.keys(data).length} campo(s) preenchido(s).`);
  process.exit(0);
}

void principal();
```

O e-mail de suporte fica **um só** (`suporte@institutontc.com.br`), resolvendo a divergência com `suporte@eventon.institutontc.com.br` que existe hoje entre `/contato` e os Termos. Confirmar o endereço correto com o PO no checkpoint.

Script em `apps/cms/package.json`: `"contatos:seed": "payload run src/seed/seedContatos.ts"`.

- [ ] **Step 7: Regenerate types and commit**

Run: `pnpm --filter @ntc/cms payload:generate && pnpm typecheck`
Expected: `Rodape` com os campos novos; typecheck verde.

```bash
git add packages/lib/src/institucional packages/lib/src/index.ts \
  apps/cms/src/globals/Rodape.ts apps/cms/src/seed/seedContatos.ts \
  apps/cms/package.json packages/types/src/payload-types.ts
git commit -m "feat(cms): modela contatos institucionais no global e semeia os valores atuais

Telefone e WhatsApp guardados como digitados; os links tel: e wa.me sao
derivados em @ntc/lib. Global ganha suporte, eventos e as tres
coordenacoes por vertical. Seed nao sobrescreve campo ja preenchido.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Site — leitura dos contatos com fallback

**Files:**
- Create: `apps/web/lib/contatos.ts`
- Test: `apps/web/lib/contatos.test.ts`

**Interfaces:**
- Consumes: `obterPayload`; `telefoneParaHref`, `whatsappParaHref` (Task 12).
- Produces:

```ts
export interface Contatos {
  telefone: string;
  telefoneHref: string;
  whatsapp: string;
  whatsappHref: string;
  emailInstitucional: string;
  emailImprensa: string;
  emailDpo: string;
  emailSuporte: string;
  emailEventos: string;
  emailParcerias: string;
  endereco: string;
  razaoSocial: string;
  cnpj: string;
  verticais: { vertical: string; email: string; opcaoTelefone: string }[];
}

export const CONTATOS_FALLBACK: Contatos;
export async function carregarContatos(): Promise<Contatos>;
```

- [ ] **Step 1: Write the failing test**

Criar `apps/web/lib/contatos.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const findGlobal = vi.fn();

vi.mock("./payloadClient", () => ({ obterPayload: async () => ({ findGlobal }) }));

import { CONTATOS_FALLBACK, carregarContatos } from "./contatos";

beforeEach(() => findGlobal.mockReset());

describe("carregarContatos", () => {
  it("devolve os valores do CMS com os hrefs derivados", async () => {
    findGlobal.mockResolvedValue({
      telefoneInstitucional: "(11) 4002-8922",
      whatsappInstitucional: "(11) 91234-5678",
      emailInstitucional: "novo@institutontc.com.br",
    });
    const c = await carregarContatos();
    expect(c.telefone).toBe("(11) 4002-8922");
    expect(c.telefoneHref).toBe("tel:+551140028922");
    expect(c.whatsappHref).toBe("https://wa.me/5511912345678");
    expect(c.emailInstitucional).toBe("novo@institutontc.com.br");
  });

  it("cai no fallback campo a campo quando o CMS vem parcial", async () => {
    findGlobal.mockResolvedValue({ telefoneInstitucional: "(11) 4002-8922" });
    const c = await carregarContatos();
    expect(c.telefone).toBe("(11) 4002-8922");
    expect(c.emailDpo).toBe(CONTATOS_FALLBACK.emailDpo);
    expect(c.endereco).toBe(CONTATOS_FALLBACK.endereco);
  });

  it("devolve o fallback inteiro — sem lançar — quando o banco falha", async () => {
    findGlobal.mockRejectedValue(new Error("connection refused"));
    await expect(carregarContatos()).resolves.toEqual(CONTATOS_FALLBACK);
  });

  it("devolve o fallback quando o global ainda não existe", async () => {
    findGlobal.mockResolvedValue(null);
    expect(await carregarContatos()).toEqual(CONTATOS_FALLBACK);
  });

  it("o fallback traz os valores que hoje estão no site", () => {
    expect(CONTATOS_FALLBACK.telefone).toBe("(63) 3212-1199");
    expect(CONTATOS_FALLBACK.whatsapp).toBe("(63) 98444-4040");
    expect(CONTATOS_FALLBACK.emailInstitucional).toBe("contato@institutontc.com.br");
    expect(CONTATOS_FALLBACK.verticais).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ntc/web test contatos`
Expected: FAIL — módulo não encontrado.

- [ ] **Step 3: Write the implementation**

Criar `apps/web/lib/contatos.ts` com `cache()` do React, o `CONTATOS_FALLBACK` com os valores literais de hoje (os mesmos do seed da Task 12), e a mescla campo a campo: valor do CMS quando é string não vazia, senão o do fallback. `carregarContatos` envolve a leitura em `try/catch` e **nunca lança** — a função é chamada pelo layout de todas as páginas.

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @ntc/web test contatos`
Expected: PASS, 5 testes.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/contatos.ts apps/web/lib/contatos.test.ts
git commit -m "feat(web): leitura de contatos institucionais com fallback

Mescla campo a campo com os valores de hoje e nunca lanca: o rodape esta
em todas as paginas e nao pode sumir se o banco cair.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Painel — seção Contatos em Configurações e revalidação de layout

**Files:**
- Modify: `apps/cms/src/app/(painel)/TelaConfiguracoes.tsx`
- Modify: `apps/cms/src/lib/cms/painelCmsEscrita.ts`
- Modify: `apps/cms/src/app/(painel)/acoes.ts`
- Modify: `apps/web/app/api/revalidate/route.ts`
- Test: `apps/cms/src/lib/cms/painelCmsEscrita.contatos.test.ts`
- Test: `apps/web/app/api/revalidate/route.test.ts`

**Interfaces:**
- Consumes: `ResultadoEscrita`; `obterUsuarioCms`; `VERTICAIS_CONTATO` (Task 12).
- Produces:

```ts
export interface CamposContatos {
  telefoneInstitucional: string;
  whatsappInstitucional: string;
  emailInstitucional: string;
  emailImprensa: string;
  emailParcerias: string;
  emailDpo: string;
  emailSuporte: string;
  emailEventos: string;
  enderecoCompleto: string;
  razaoSocial: string;
  cnpj: string;
  verticais: { vertical: string; email: string; opcaoTelefone: string }[];
}

export async function salvarContatosCms(campos: CamposContatos): Promise<ResultadoEscrita>;
```

Server Actions: `carregarContatosCms()` e `salvarContatos(campos)`.

- [ ] **Step 1: Write the failing tests**

Criar `apps/cms/src/lib/cms/painelCmsEscrita.contatos.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const updateGlobal = vi.fn();
const fetchMock = vi.fn();

vi.mock("@/lib/payloadClient", () => ({ obterPayload: async () => ({ updateGlobal }) }));
vi.stubGlobal("fetch", fetchMock);

import { salvarContatosCms, type CamposContatos } from "./painelCmsEscrita";

const campos: CamposContatos = {
  telefoneInstitucional: "(63) 3212-1199",
  whatsappInstitucional: "(63) 98444-4040",
  emailInstitucional: "contato@institutontc.com.br",
  emailImprensa: "imprensa@institutontc.com.br",
  emailParcerias: "",
  emailDpo: "dpo@institutontc.com.br",
  emailSuporte: "suporte@institutontc.com.br",
  emailEventos: "eventosonline@institutontc.com.br",
  enderecoCompleto: "SCS Quadra 9, Bloco C — Brasília/DF",
  razaoSocial: "Instituto NTC do Brasil",
  cnpj: "00.000.000/0001-00",
  verticais: [
    { vertical: "educacao", email: "educacao@institutontc.com.br", opcaoTelefone: "opção 1" },
  ],
};

beforeEach(() => {
  updateGlobal.mockReset();
  fetchMock.mockReset();
  fetchMock.mockResolvedValue({ ok: true });
});

describe("salvarContatosCms", () => {
  it("grava no global rodape", async () => {
    updateGlobal.mockResolvedValue({});
    const r = await salvarContatosCms(campos);
    expect(r.ok).toBe(true);
    expect(updateGlobal.mock.calls[0][0]).toMatchObject({ slug: "rodape" });
  });

  it("recusa e-mail com formato inválido sem tocar no banco", async () => {
    const r = await salvarContatosCms({ ...campos, emailDpo: "dpo(arroba)ntc" });
    expect(r.ok).toBe(false);
    expect(r.erro).toMatch(/e-mail/i);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("aceita e-mail opcional em branco", async () => {
    updateGlobal.mockResolvedValue({});
    const r = await salvarContatosCms({ ...campos, emailParcerias: "" });
    expect(r.ok).toBe(true);
  });

  it("recusa telefone sem DDD", async () => {
    const r = await salvarContatosCms({ ...campos, telefoneInstitucional: "32121199" });
    expect(r.ok).toBe(false);
    expect(updateGlobal).not.toHaveBeenCalled();
  });

  it("recusa endereço vazio", async () => {
    const r = await salvarContatosCms({ ...campos, enderecoCompleto: "  " });
    expect(r.ok).toBe(false);
  });

  it("salva mesmo quando a revalidação do site falha", async () => {
    updateGlobal.mockResolvedValue({});
    fetchMock.mockRejectedValue(new Error("front fora do ar"));
    const r = await salvarContatosCms(campos);
    expect(r.ok).toBe(true);
    expect(r.aviso).toMatch(/pode levar/i);
  });
});
```

Criar `apps/web/app/api/revalidate/route.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

import { POST } from "./route";

function requisicao(body: unknown, segredo = "segredo-de-teste"): Request {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Revalidate-Secret": segredo },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  revalidatePath.mockReset();
  process.env.REVALIDATE_SECRET = "segredo-de-teste";
});

describe("POST /api/revalidate", () => {
  it("revalida um caminho como antes", async () => {
    const res = await POST(requisicao({ path: "/conteudos" }));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/conteudos");
  });

  it('com escopo "layout" revalida o site inteiro', async () => {
    const res = await POST(requisicao({ path: "/", escopo: "layout" }));
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("recusa sem o segredo", async () => {
    const res = await POST(requisicao({ path: "/", escopo: "layout" }, "errado"));
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("recusa escopo desconhecido", async () => {
    const res = await POST(requisicao({ path: "/", escopo: "tudo" }));
    expect(res.status).toBe(400);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ntc/cms test painelCmsEscrita.contatos && pnpm --filter @ntc/web test revalidate`
Expected: FAIL nos dois.

- [ ] **Step 3: Extend the revalidate endpoint**

Em `apps/web/app/api/revalidate/route.ts`, depois da validação do `path`, ler `escopo` do body: ausente → comportamento atual (`revalidatePath(path)`); `"layout"` → `revalidatePath(path, "layout")`; qualquer outro valor → 400 com `{ revalidated: false, error: "Escopo inválido." }`.

- [ ] **Step 4: Write the write function**

Acrescentar `CamposContatos` e `salvarContatosCms` a `painelCmsEscrita.ts`. `ResultadoEscrita` ganha o campo opcional `aviso?: string` (usado quando a gravação deu certo mas a revalidação falhou). Validações: e-mails obrigatórios e opcionais com `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (opcional vazio passa); telefone e WhatsApp com ao menos 10 dígitos; endereço não vazio. Depois de `updateGlobal`, chamar `/api/revalidate` com `{ path: "/", escopo: "layout" }` dentro de `try/catch` — falha vira `aviso`, não erro.

- [ ] **Step 5: Add the Server Actions**

Em `acoes.ts`: `carregarContatosCms()` (gate de sessão, `findGlobal` do `rodape`, devolve `CamposContatos` com strings vazias no lugar de null) e `salvarContatos(campos)` (gate + `salvarContatosCms`).

- [ ] **Step 6: Add the section to the settings screen**

Em `TelaConfiguracoes.tsx`, entre "Minha conta" e a primeira seção demonstrativa, acrescentar a seção **Contatos institucionais** — **sem** o selo `pcms-selo--atencao` "Demonstrativo", porque é real. Carregar os valores com `useEffect` + `carregarContatosCms()`, guardar em estado, salvar com `useTransition` + `salvarContatos`, e mostrar erro, sucesso e o `aviso` no `<AvisoForm>`. Quatro blocos de campos, todos com `<label htmlFor>`: *Atendimento* (telefone, WhatsApp, e-mail institucional); *Canais específicos* (imprensa, DPO, parcerias, suporte, eventos); *Coordenações por vertical* (três linhas fixas de `VERTICAIS_CONTATO`, cada uma com e-mail e opção do telefone); *Endereço e identificação* (endereço em `textarea`, razão social, CNPJ). Abaixo do botão Salvar, a linha:

```tsx
<p className="pcms-editor__hint">
  Estes dados aparecem no rodapé de todas as páginas, na página de Contato, em O Grupo e
  nas páginas legais. A atualização no site pode levar alguns minutos.
</p>
```

- [ ] **Step 7: Run checks**

Run: `pnpm --filter @ntc/cms test && pnpm --filter @ntc/web test && pnpm lint && pnpm typecheck`
Expected: tudo verde.

- [ ] **Step 8: Commit**

```bash
git add "apps/cms/src/app/(painel)/TelaConfiguracoes.tsx" \
  apps/cms/src/lib/cms/painelCmsEscrita.ts \
  apps/cms/src/lib/cms/painelCmsEscrita.contatos.test.ts \
  "apps/cms/src/app/(painel)/acoes.ts" \
  apps/web/app/api/revalidate/route.ts apps/web/app/api/revalidate/route.test.ts
git commit -m "feat(cms): edicao de contatos institucionais em Configuracoes

Primeira secao real da tela alem de Minha conta. Salvar revalida o site
inteiro (escopo layout no endpoint de revalidacao), porque o rodape esta
em todas as paginas; falha de revalidacao vira aviso, nao erro.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Site — consumir os contatos em todas as páginas

**Files:**
- Modify: `apps/web/app/(home)/FooterHome.tsx`
- Modify: os 8 layouts de route group que renderizam `FooterHome`: `(home)`, `(institucional)`, `(o-grupo)`, `(programas)`, `(capacitacao)`, `(conteudos)`, `(solucoes)`, `(vertical)`
- Modify: `apps/web/app/(institucional)/contato/page.tsx` e `conteudoContato.ts`
- Modify: `apps/web/app/(o-grupo)/o-grupo/page.tsx` e `conteudoOGrupo.ts`
- Modify: `apps/web/app/(capacitacao)/agenda/page.tsx` e `conteudoAgenda.ts`
- Modify: `apps/web/app/(institucional)/{politica-de-privacidade,termos-de-uso,lgpd,politica-de-cookies,mapa-do-site}/page.tsx`
- Modify: `apps/web/app/(o-grupo)/o-grupo/corpo-docente/conteudoCorpoDocente.ts`, `apps/web/app/(solucoes)/solucoes/conteudoSolucoes.ts`

**Interfaces:**
- Consumes: `carregarContatos`, `Contatos` (Task 13).
- Produces: nada — é a ponta consumidora.

- [ ] **Step 1: Make the footer receive the contacts**

Em `FooterHome.tsx`: aceitar `interface FooterHomeProps { contatos: Contatos }` e trocar o bloco de endereço fixo por `contatos.endereco` (quebrando em `<br>` por linha), `contatos.telefone` e `contatos.emailInstitucional`. Segue Server Component, sem `"use client"`.

- [ ] **Step 2: Feed it from each layout**

Nos 8 layouts: tornar a função `async`, chamar `const contatos = await carregarContatos();` e passar `<FooterHome contatos={contatos} />`. Nada mais muda nos layouts.

- [ ] **Step 3: Contact page**

Em `conteudoContato.ts`, transformar as constantes que carregam contato em **funções que recebem `Contatos`**, mantendo o resto do arquivo como está:

- `CHANNELS` → `montarChannels(c: Contatos): ChannelCard[]`, com `valor` e `acaoHref` vindos de `c` (`c.emailInstitucional`/`mailto:`, `c.telefone`/`c.telefoneHref`, `c.whatsapp`/`c.whatsappHref`, `c.emailImprensa`, `c.emailSuporte`). Textos de `label` e `nota` ficam literais.
- `VERTICAIS` → `montarVerticais(c: Contatos): VerticalCard[]`, com `canaisHtml` montado de `c.verticais` (e-mail + `<br>` + telefone + " · " + opção). Se `c.verticais` não trouxer a vertical, cair no e-mail institucional.
- O endereço e os `mailto:` de DPO passam a sair de `c`.

Em `contato/page.tsx`: `const contatos = await carregarContatos();` e usar as funções.

- [ ] **Step 4: Other pages**

Mesmo padrão nas demais: a página carrega os contatos e passa para o que hoje é constante literal. Nas 5 páginas legais e no mapa do site, substituir cada `dpo@institutontc.com.br` literal (texto **e** `href` do `mailto:`) por `contatos.emailDpo`, e o `suporte@` dos Termos por `contatos.emailSuporte`; acrescentar `export const revalidate = 3600;` onde não existir.

**Não tocar** em `apps/web/app/(capacitacao)/agenda/[slug]/conteudoEventos.ts` — os 4 eventos estáticos ficam fora do escopo por decisão do PO.

- [ ] **Step 5: Verify nothing changed visually**

Subir `pnpm dev`. Com o global ainda vazio (ou já semeado pela Task 12), o site deve mostrar **exatamente** os mesmos números e e-mails de hoje — é o teste de que o fallback e o seed estão certos.

Conferir: rodapé em `/`, `/conteudos` e `/contato`; os 5 cards de canal de `/contato` (texto e destino do botão); os 3 blocos por vertical; `/o-grupo`; `/agenda`; e o `mailto:` do DPO em `/politica-de-privacidade`.

- [ ] **Step 6: Run the full build**

**Parar o dev antes.**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: tudo verde no monorepo.

- [ ] **Step 7: Commit**

```bash
git add apps/web
git commit -m "feat(web): site le telefone, WhatsApp, e-mails e endereco do CMS

Rodape (8 layouts), pagina de Contato, O Grupo, Agenda e as paginas
legais passam a ler do global de contatos, com o texto e o href saindo do
mesmo dado. Os 4 eventos estaticos da agenda ficam fora, por decisao do
PO: sao paginas fechadas portadas de PDF.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: Schema, seeds e checkpoint visual (manual, do PO)

Esta task **não é executada por agente**. É o roteiro que o PO segue. O agente só o entrega e, depois, registra o resultado no `CLAUDE.md`.

> **Ordem obrigatória: o push de schema vem ANTES de qualquer deploy.** Este roteiro pressupõe checkout de desenvolvimento, mas a regra vale igual em produção: **não faça deploy da branch antes do Step 3**. Entre o deploy e o push, o código novo lê colunas que o banco ainda não tem — a tela de Conteúdos do painel fica vazia (degradação prevista, `listarConteudosCms` captura a falha), `/conteudos` fica vazia no site, e o primeiro "Salvar" em Configurações → Contatos institucionais falha porque `rodape_verticais` não existe. Sequência correta: Step 1 → Step 3 → Step 4 → deploy → Step 5 (seeds) → Step 6.

**Files:**
- Modify: `CLAUDE.md` (histórico de revisões e §19), ao final

- [ ] **Step 1: Pre-flight**

Parar o dev server. Conferir:

```bash
git branch --show-current     # feat/cms-conteudos-editoriais
git worktree list             # nenhum worktree além do principal
```

Com dois estados de código sobre o mesmo banco de desenvolvimento, o push de um dropa as tabelas do outro (incidente de 07/09, CLAUDE.md v1.9).

- [ ] **Step 2: Check the global before the push**

```bash
psql "$DATABASE_URI" -c "select count(*) from rodape;"
```

Esperado: `0` ou uma linha com campos nulos. Se houver dado preenchido, avisar antes de seguir — o seed da Task 12 não sobrescreve, mas o diff precisa ser lido com atenção.

- [ ] **Step 3: Run the schema push**

```bash
pnpm --filter @ntc/cms payload:push:schema
```

**Esperado em `conteudos` (responder `Y`):**
- Colunas novas: `assinatura`, `destaque`, `anunciar_em_preparacao`, `tempo_leitura_min`, `link_externo` — e as equivalentes na tabela de versões `_conteudos_v`.
- `imagem_destaque_id`: `DROP NOT NULL`. (Tirar `required: true` **é** mudança de banco: o adapter drizzle emite `NOT NULL` para todo campo obrigatório — lição da Sessão 4 do CRM.)
- `enum_conteudos_categoria` recriado com `artigo/estudo/nota-tecnica/webinar/material/noticia`: `SET DATA TYPE text` → `DROP TYPE` → `CREATE TYPE` → `USING`. A tabela está vazia; se não estiver, rodar `UPDATE conteudos SET categoria = NULL;` antes.
- Índice novo em `conteudos.categoria`.

**Esperado em `rodape` (responder `Y`):**
- Colunas `email_suporte` e `email_eventos`.
- Tabela `rodape_verticais` e enum `enum_rodape_verticais_vertical`.

**Qualquer outro `DROP` é `N`** e volta para o agente.

Se o `apply()` do drizzle-kit falhar no meio (ele não é transacional e tem bugs de ordenação — v3.0), resolver a ordenação à mão no `psql` e rodar o push de novo.

- [ ] **Step 4: Regenerate types and confirm no drift**

```bash
pnpm --filter @ntc/cms payload:generate
git status                    # deve ficar limpo
```

- [ ] **Step 5: Run the seeds**

```bash
pnpm --filter @ntc/cms conteudos:seed-em-preparacao   # 9 criados
pnpm --filter @ntc/cms conteudos:seed-em-preparacao   # 0 criados, 9 já existiam
pnpm --filter @ntc/cms contatos:seed
```

- [ ] **Step 6: Visual checkpoint (CLAUDE.md §6)**

Com `pnpm dev` no ar, em 1440 e 375:

**Conteúdos**
1. Painel → Conteúdos: os 9 rascunhos aparecem como "Em preparação". Abrir um deles e conferir que o textarea do corpo traz o texto-guia que o seed gravou — é a prova de que `lexicalParaMarkdown` lê **pelo banco** o que `markdownParaLexical` escreveu, ida e volta que nenhum teste unitário cobre.
2. Novo conteúdo: título, lide, corpo com `##`, `**negrito**`, `[link](url)` e `- item`; a pré-visualização acompanha; salvar rascunho; reabrir e conferir que o textarea traz o mesmo Markdown.
3. Publicar: a situação muda; `/conteudos` mostra o card com data real e link.
4. Abrir a página de leitura: hero, corpo formatado, assinatura, "Leia também", CTA final.
5. Um rascunho com "Anunciar em preparação" **desmarcado** não aparece no site.
6. Despublicar: o card sai do site e a URL responde 404.
7. Comparar `/conteudos` com `28_Pagina_Conteudos_v1.html` — a biblioteca deve estar visualmente idêntica.

**Contatos**
8. Antes de editar: rodapé, `/contato`, `/o-grupo` e `/politica-de-privacidade` mostram os mesmos dados de hoje.
9. Configurações → Contatos institucionais: trocar o telefone e o e-mail institucional; salvar.
10. Conferir a mudança no rodapé, nos cards de `/contato` (**texto e destino do botão**), em `/o-grupo` e no `mailto:` do DPO das páginas legais.
11. Confirmar com o PO o e-mail de suporte correto (`suporte@` vs. `suporte@eventon.`), que hoje diverge entre `/contato` e os Termos.

Reportar ao PO toda divergência **antes** de declarar a sessão concluída.

- [ ] **Step 7: Record the outcome**

Atualizar o `CLAUDE.md`: entrada nova no histórico de revisões (versão, data, o que entrou, o que ficou pendente) e §19 — coleção `conteudos` em uso, tela nova no painel, rota nova no site, item 9 do backlog (criar do zero fora do CRM) parcialmente fechado, item 10 (Configurações só com "Minha conta" real) atualizado. Commit `docs:`.

---

## Notas de execução

- **Ordem.** Tasks 1–11 (conteúdos) e 12–15 (contatos) são independentes entre si depois da Task 3; a 16 é a última e depende de todas. Dentro de cada bloco a ordem importa.
- **O que nenhuma task faz:** rodar `payload:push:schema`, apagar dado, tocar nos 4 eventos estáticos da agenda, mudar `lexicalToHtml` ou `lexicalRestrictiveFeatures`, adicionar dependência.
- **Antes de qualquer `pnpm build`:** parar o dev server (o `.next` é compartilhado; o build corrompe o dev em execução e o sintoma é 500 com erro de manifest).
- **Conferir antes de escrever:** nomes de classe CSS do painel (`painel.css`) e do route group `(conteudos)`, nomes dos campos de SEO (`shared/seoFields.ts`) e os slugs reais das três áreas. O plano indica o nome esperado; o código é a fonte.
