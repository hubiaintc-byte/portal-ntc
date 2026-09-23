/**
 * Ações da barra de formatação do editor de conteúdo (Markdown leve).
 *
 * A barra do painel é um `<textarea>`: toda formatação é cirurgia de string
 * sobre o texto e a seleção. A regra mora aqui, pura e testada, e o
 * componente React é só a fileira de botões — mesmo desenho das outras
 * regras editoriais deste pacote.
 *
 * As ações cobrem exatamente os sete elementos que `markdownParaLexical`
 * entende. Oferecer na barra algo que o conversor descarta faria o autor
 * formatar um texto que se perde ao salvar.
 */

/** Ação disparada por um botão da barra. */
export type AcaoMarkdown =
  | "negrito"
  | "italico"
  | "h2"
  | "h3"
  | "citacao"
  | "lista"
  | "numerada"
  | "link";

/** Texto do editor com a seleção corrente (índices como os do `<textarea>`). */
export interface SelecaoTexto {
  texto: string;
  inicio: number;
  fim: number;
}

/** Marcador inline de cada ênfase. */
const MARCADOR_INLINE: Record<"negrito" | "italico", string> = {
  negrito: "**",
  italico: "*",
};

/** Prefixo de cada ação de bloco. `numerada` é gerado por posição. */
const PREFIXO_BLOCO: Record<"h2" | "h3" | "citacao" | "lista", string> = {
  h2: "## ",
  h3: "### ",
  citacao: "> ",
  lista: "- ",
};

/**
 * Prefixo de bloco já presente na linha, se houver.
 *
 * Reconhece todos os prefixos — não só o da ação — para que trocar de bloco
 * substitua o marcador em vez de empilhar (`- ## Título`).
 */
function prefixoExistente(linha: string): string {
  const numerada = /^\d+\.\s/.exec(linha);
  if (numerada) return numerada[0];
  for (const p of ["### ", "## ", "> ", "- "]) {
    if (linha.startsWith(p)) return p;
  }
  return "";
}

function ehAcaoDeBloco(acao: AcaoMarkdown): acao is "h2" | "h3" | "citacao" | "lista" | "numerada" {
  return acao === "h2" || acao === "h3" || acao === "citacao" || acao === "lista" || acao === "numerada";
}

/**
 * Troca o trecho `[inicio, fim)` de `texto` por `novo`.
 *
 * Fica separado porque toda ação termina assim, e concatenar à mão em cada
 * ramo é onde um índice errado passa despercebido.
 */
function substituir(texto: string, inicio: number, fim: number, novo: string): string {
  return texto.slice(0, inicio) + novo + texto.slice(fim);
}

/**
 * Aplica uma ação inline (negrito/itálico) envolvendo ou desenvolvendo a
 * seleção.
 *
 * O caso que exige cuidado é o itálico ao lado de um negrito: em
 * `**Instituto**`, o caractere colado à seleção é `*`, mas faz parte do `**`.
 * Por isso o teste de "já está em itálico" também olha o caractere seguinte.
 */
function aplicarInline(entrada: SelecaoTexto, acao: "negrito" | "italico"): SelecaoTexto {
  const { texto, inicio, fim } = entrada;
  const marcador = MARCADOR_INLINE[acao];
  const tamanho = marcador.length;

  const antes = texto.slice(Math.max(0, inicio - tamanho), inicio);
  const depois = texto.slice(fim, fim + tamanho);
  const vizinhoDeNegrito =
    acao === "italico" && (texto.slice(Math.max(0, inicio - 2), inicio) === "**" || depois === "**");

  if (antes === marcador && depois === marcador && !vizinhoDeNegrito) {
    const semMarcadores =
      texto.slice(0, inicio - tamanho) + texto.slice(inicio, fim) + texto.slice(fim + tamanho);
    return { texto: semMarcadores, inicio: inicio - tamanho, fim: fim - tamanho };
  }

  const selecionado = texto.slice(inicio, fim);
  const envolvido = `${marcador}${selecionado}${marcador}`;
  return {
    texto: substituir(texto, inicio, fim, envolvido),
    inicio: inicio + tamanho,
    fim: inicio + tamanho + selecionado.length,
  };
}

/**
 * Aplica uma ação de bloco a todas as linhas que a seleção toca.
 *
 * Alterna: se todas as linhas não vazias já têm o prefixo da ação, remove;
 * caso contrário, troca o prefixo existente pelo novo. Linha em branco é
 * preservada — ela é o separador de parágrafo do Markdown leve.
 */
function aplicarBloco(
  entrada: SelecaoTexto,
  acao: "h2" | "h3" | "citacao" | "lista" | "numerada",
): SelecaoTexto {
  const { texto, inicio, fim } = entrada;
  const inicioLinha = texto.lastIndexOf("\n", inicio - 1) + 1;
  const quebraFinal = texto.indexOf("\n", fim);
  const fimLinha = quebraFinal === -1 ? texto.length : quebraFinal;

  const linhas = texto.slice(inicioLinha, fimLinha).split("\n");
  const comConteudo = linhas.filter((l) => l.trim().length > 0);

  const jaAplicado =
    comConteudo.length > 0 &&
    comConteudo.every((l) =>
      acao === "numerada" ? /^\d+\.\s/.test(l) : prefixoExistente(l) === PREFIXO_BLOCO[acao],
    );

  let ordem = 0;
  const novasLinhas = linhas.map((linha) => {
    if (linha.trim().length === 0) return linha;
    const corpo = linha.slice(prefixoExistente(linha).length);
    if (jaAplicado) return corpo;
    ordem += 1;
    return acao === "numerada" ? `${ordem}. ${corpo}` : `${PREFIXO_BLOCO[acao]}${corpo}`;
  });

  const bloco = novasLinhas.join("\n");
  return {
    texto: substituir(texto, inicioLinha, fimLinha, bloco),
    inicio: inicioLinha,
    fim: inicioLinha + bloco.length,
  };
}

/**
 * Insere o esqueleto de link com o cursor pronto para a URL.
 *
 * Não abre diálogo: o autor digita a URL no próprio textarea, logo depois do
 * `https://` já escrito. A seleção volta vazia, posicionada ali.
 */
function aplicarLink(entrada: SelecaoTexto): SelecaoTexto {
  const { texto, inicio, fim } = entrada;
  const selecionado = texto.slice(inicio, fim);
  const montado = `[${selecionado}](https://)`;
  const cursor = inicio + montado.length - 1;
  return { texto: substituir(texto, inicio, fim, montado), inicio: cursor, fim: cursor };
}

/**
 * Aplica uma ação da barra de formatação e devolve o texto resultante com a
 * seleção que o `<textarea>` deve restaurar.
 */
export function aplicarAcaoMarkdown(entrada: SelecaoTexto, acao: AcaoMarkdown): SelecaoTexto {
  if (acao === "link") return aplicarLink(entrada);
  if (ehAcaoDeBloco(acao)) return aplicarBloco(entrada, acao);
  return aplicarInline(entrada, acao);
}
