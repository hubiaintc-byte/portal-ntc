import { afterAll, describe, expect, it } from "vitest";

import { obterConteudoCms } from "./painelCms";
import {
  despublicarConteudoCms,
  excluirConteudoCms,
  publicarConteudoCms,
  salvarConteudoCms,
  type CamposConteudo,
} from "./painelCmsEscrita";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Ciclo completo de uma notícia: escrever → salvar → ler de volta → publicar →
 * ver no site → despublicar → apagar.
 *
 * Exercita as funções de verdade contra o banco de verdade e confere o site
 * por HTTP entre os passos. É a única verificação que cobre a ida e volta
 * Markdown → Lexical → banco → Markdown: todo teste unitário do plano para na
 * fronteira do Payload, e é exatamente aí que os hooks do campo `richText`
 * poderiam remodelar o que `markdownParaLexical` escreveu.
 *
 * Exige `pnpm dev` no ar e o schema já pushado.
 *
 * **Por que as asserções olham o link do card, não o slug solto:** em modo
 * de desenvolvimento o Next embute no HTML o payload RSC de depuração, que
 * carrega o resultado CRU de `payload.find()` — os 200 docs, antes do
 * `.filter(elegivel)`. O slug de um rascunho aparece ali sem que card algum
 * seja renderizado. Verificado em build de produção (`next build` + `start`):
 * zero ocorrências. O link `/conteudos/<segmento>/<slug>` só é montado em
 * `paraCard`, então ele sim distingue renderizado de não renderizado.
 */

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

/** Marca o registro como descartável, caso o teste morra antes da limpeza. */
const SUFIXO = `teste-integracao-${Date.now()}`;
const TITULO = `Instituto NTC conclui ciclo de validação (${SUFIXO})`;

/**
 * Corpo que exercita os sete elementos do Markdown leve, mais os dois casos
 * que custaram rodada de correção no plano: lista ordenada que não começa em 1
 * e texto com caracteres que precisam ser escapados no HTML.
 */
const CORPO = [
  "## Contexto da validação",
  "",
  // Parágrafo numa linha só, de propósito: o Markdown leve junta linhas
  // consecutivas num parágrafo (spec §5, "linha em branco separa parágrafos"),
  // então uma quebra solta aqui seria normalizada e a ida e volta não seria
  // byte a byte. A normalização em si está coberta em markdownLexical.test.ts.
  "O Instituto conduziu um ciclo de **verificação técnica** com etapas de *revisão independente*, descritas em [nota pública](https://institutontc.com.br).",
  "",
  "> A validação não substitui a auditoria externa.",
  "",
  "### Etapas cumpridas",
  "",
  "- Levantamento documental",
  "- Conferência de indicadores",
  "",
  "3. Terceira etapa",
  "4. Quarta etapa",
  "",
  "Comparadores como <, > e & aparecem no texto, e aspas \"assim\".",
].join("\n");

function camposDaNoticia(): CamposConteudo {
  return {
    titulo: TITULO,
    slug: SUFIXO,
    categoria: "noticia",
    areaId: "",
    lide: "Ciclo de verificação técnica concluído, com etapas de revisão independente.",
    corpoMarkdown: CORPO,
    assinatura: "Curadoria NTC",
    autorIds: [],
    dataPublicacao: new Date().toISOString().slice(0, 10),
    destaque: false,
    anunciarEmPreparacao: false,
    linkExterno: "",
    seoTitulo: "Ciclo de validação concluído",
    seoDescricao: "Nota sobre o ciclo de verificação técnica do Instituto NTC.",
  };
}

async function baixar(caminho: string): Promise<{ status: number; html: string }> {
  const r = await fetch(`${SITE}${caminho}`, { cache: "no-store" });
  return { status: r.status, html: await r.text() };
}

/** Preenchido pelo primeiro teste e usado pelos seguintes. */
let idCriado = "";

afterAll(async () => {
  // Rede de segurança: se um passo falhar no meio, o registro não fica no banco.
  if (idCriado.length === 0) return;
  const payload = await obterPayload();
  await payload
    .delete({ collection: "conteudos", id: idCriado })
    .catch(() => undefined);
});

describe("ciclo de publicação de uma notícia", () => {
  it("1. o site responde — pré-condição do teste", async () => {
    const { status } = await baixar("/conteudos");
    expect(status).toBe(200);
  });

  it("2. salva a notícia como rascunho", async () => {
    const r = await salvarConteudoCms(null, camposDaNoticia());
    expect(r.ok).toBe(true);
    expect(r.id).toBeTruthy();
    idCriado = r.id ?? "";
  });

  it("3. relê do banco o mesmo Markdown que foi escrito", async () => {
    const doc = await obterConteudoCms(idCriado);
    expect(doc).not.toBeNull();
    expect(doc?.situacao).toBe("rascunho");
    // A prova do ciclo: o que volta do banco é byte a byte o que foi digitado.
    expect(doc?.corpoMarkdown).toBe(CORPO);
    expect(doc?.titulo).toBe(TITULO);
    expect(doc?.seoTitulo).toBe("Ciclo de validação concluído");
  });

  it("4. deriva o tempo de leitura sozinho, sem o formulário mandar", async () => {
    const payload = await obterPayload();
    const doc = await payload.findByID({ collection: "conteudos", id: idCriado, draft: true });
    expect(typeof doc.tempoLeituraMin).toBe("number");
    expect(doc.tempoLeituraMin).toBeGreaterThan(0);
  });

  it("5. rascunho não aparece no site nem tem página", async () => {
    const lista = await baixar("/conteudos");
    expect(lista.html).not.toContain(`/conteudos/noticias/${SUFIXO}`);

    const leitura = await baixar(`/conteudos/noticias/${SUFIXO}`);
    expect(leitura.status).toBe(404);
  });

  it("6. publica", async () => {
    const r = await publicarConteudoCms(idCriado);
    expect(r.ok).toBe(true);

    const doc = await obterConteudoCms(idCriado);
    expect(doc?.situacao).toBe("publicado");
  });

  it("7. publicada, aparece na biblioteca com link", async () => {
    const { html } = await baixar("/conteudos");
    expect(html).toContain(TITULO);
    expect(html).toContain(`/conteudos/noticias/${SUFIXO}`);
  });

  it("8. a página de leitura renderiza o corpo formatado", async () => {
    const { status, html } = await baixar(`/conteudos/noticias/${SUFIXO}`);
    expect(status).toBe(200);

    expect(html).toContain("<h2>Contexto da validação</h2>");
    expect(html).toContain("<h3>Etapas cumpridas</h3>");
    expect(html).toContain("<strong>verificação técnica</strong>");
    expect(html).toContain("<em>revisão independente</em>");
    expect(html).toContain('href="https://institutontc.com.br"');
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<li>Levantamento documental</li>");
    // A lista ordenada preserva o número de partida (correção da Task 2).
    expect(html).toContain('<ol start="3">');
    // E o texto do autor é escapado, não interpretado como marcação.
    expect(html).toContain("&lt;");
    expect(html).not.toContain("<script>alert");
  });

  it("9. despublicar tira do ar e a URL volta a 404", async () => {
    const r = await despublicarConteudoCms(idCriado);
    expect(r.ok).toBe(true);

    const leitura = await baixar(`/conteudos/noticias/${SUFIXO}`);
    expect(leitura.status).toBe(404);

    const lista = await baixar("/conteudos");
    expect(lista.html).not.toContain(`/conteudos/noticias/${SUFIXO}`);
  });

  it("10. apaga e o registro some", async () => {
    const r = await excluirConteudoCms(idCriado);
    expect(r.ok).toBe(true);

    const doc = await obterConteudoCms(idCriado);
    expect(doc).toBeNull();
    idCriado = "";
  });
});
