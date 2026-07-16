/** Regras de senha nova do Painel Admin (reset, convite e troca). */
export const SENHA_MINIMO = 12;

/** null = válida; senão, mensagem de erro em PT para exibir no formulário. */
export function validarNovaSenha(senha: string, confirmacao: string): string | null {
  if (senha.length < SENHA_MINIMO) {
    return `A senha precisa ter pelo menos ${SENHA_MINIMO} caracteres.`;
  }
  if (senha !== confirmacao) {
    return "As senhas não conferem.";
  }
  return null;
}
