// Sem dependências: é importado pelo middleware (runtime edge).

/**
 * Rotas da API nativa do Payload que o painel não usa e que abrem caminhos
 * paralelos de autenticação: toda a REST de `users` (login, reset-password e
 * refresh-token devolvem sessão sem passkey; forgot-password escapa do rate
 * limit de `/entrar/recuperar`) e o GraphQL. O resto da REST continua — os
 * arquivos de `documentos-comerciais` são servidos por ela, com auth.
 */
export function rotaDeApiBloqueada(pathname: string): boolean {
  return /^\/api\/(users(\/|$)|graphql(-playground)?(\/|$))/.test(pathname);
}
