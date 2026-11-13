/**
 * Nome acessível dos botões "Enviar imagem"/"Remover" de cada linha da
 * página do programa (CLAUDE.md §10): com várias linhas, "Enviar imagem"
 * sozinho não diz de quem é a imagem. O nome começa pelo texto visível do
 * botão (WCAG 2.5.3) e acrescenta a linha.
 */

/** "Coordenação Ana Lima"; sem nome, "Especialista, linha 3". */
export function identificacaoDaLinha(tipo: string, nome: string, indice: number): string {
  const n = nome.trim();
  return n !== "" ? `${tipo} ${n}` : `${tipo}, linha ${indice + 1}`;
}

export function nomeAcessivelAcao(textoVisivel: string, identificacao: string): string {
  return `${textoVisivel} — ${identificacao}`;
}
