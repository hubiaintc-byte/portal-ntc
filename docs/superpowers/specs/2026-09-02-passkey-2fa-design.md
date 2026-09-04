# Passkey como 2º Fator (WebAuthn) — Design

**Data:** 02/09/2026
**Status:** aprovado para implementação
**Substitui:** o plano de 2FA via TOTP mencionado em CLAUDE.md §17.8 (Janela C, Sessão C1 do roadmap `docs/16`) — TOTP nunca foi implementado; este design toma o lugar dele.

## Contexto

O Painel Admin (`apps/cms`) autentica via Payload CMS 3 (`Users` collection, `auth: true`) com e-mail + senha + JWT de 14 dias. DAB §10.1 exige 2FA obrigatório no admin; hoje a defesa interina é só senha forte + expiração de JWT, sem segundo fator (CLAUDE.md §17.8). Nunca houve implementação de TOTP no repo (sem plugin Payload 3 maduro conhecido em 19/05/2026).

Passkeys (WebAuthn) resolvem o mesmo requisito de forma mais forte que TOTP — resistente a phishing, sem segredo compartilhado — e funcionam com qualquer autenticador de plataforma (Touch ID, Windows Hello, biometria de celular) ou chave física, via API padrão do navegador.

## Objetivo e escopo

Adicionar passkey como **segundo fator opcional** no login do Painel Admin, para todos os usuários da coleção `Users` (não só o super-admin). Escopo desta fase:

1. Login: senha continua sendo o primeiro fator, como hoje. Usuários **sem** passkey cadastrado seguem exatamente o fluxo atual (sem mudança perceptível). Usuários **com** passkey cadastrado precisam confirmar com ele depois da senha, antes da sessão abrir.
2. Cadastro (enrollment): usuário autenticado cadastra um ou mais passkeys em Configurações → Minha conta.
3. Remoção pelo próprio usuário (Configurações → Minha conta) e **pelo super-admin, para qualquer usuário** (tela Usuários) — cobre o caso de dispositivo perdido sem precisar de script manual.

### Fora de escopo (YAGNI nesta fase)

- Passwordless completo (login só com passkey, sem senha) — decisão explícita: senha continua sendo o primeiro fator.
- Códigos de recuperação tipo backup-codes do TOTP — a remoção pelo super-admin cobre o caso de dispositivo perdido.
- Rate limiting dedicado no `/entrar` — já é pendência separada (CLAUDE.md §19.3 item 3, `checarRateLimit` ainda stub).
- Tornar o 2º fator obrigatório — fica opcional/gradual; forçar cadastro fica para uma decisão futura do PO.

## Arquitetura

### Componentes novos

| Componente | Caminho | Responsabilidade |
|---|---|---|
| Coleção `passkeys` | `apps/cms/src/collections/Passkeys.ts` | Armazena as credenciais WebAuthn por usuário |
| Wrapper WebAuthn | `apps/cms/src/lib/passkeys/webauthn.ts` | Fina camada sobre `@simplewebauthn/server`: gera/verifica opções de registro e autenticação |
| Tokens efêmeros | `apps/cms/src/lib/passkeys/tokenPendente.ts` | Dois usos: (1) token de ponte cifrado (JWE) senha → passkey → sessão real, no login; (2) token de desafio assinado (JWS) que amarra um `challenge` de cadastro à sessão que o emitiu |
| Server Actions de auth | `apps/cms/src/app/(painel)/acoesAuth.ts` | `entrarComSenha`, `verificarAutenticacaoPasskey`, `obterOpcoesCadastroPasskey`, `verificarCadastroPasskey`, `removerPasskeyProprio`, `removerPasskeyAdmin` |
| UI — login | `/entrar` (componente existente) | Passo extra condicional: "Confirme com passkey" |
| UI — autogestão | Configurações → Minha conta | Seção "Passkeys": listar, cadastrar, remover os próprios |
| UI — admin | Tela Usuários (`TelaUsuarios.tsx`) | Seção expansível por usuário: listar e remover passkeys de qualquer usuário |

### Modelo de dados — coleção `passkeys`

Segue o padrão de nomenclatura do projeto (CLAUDE.md §4.2): conceitos técnicos do WebAuthn ficam em inglês (nomes que a própria lib usa), o resto em português.

```
usuario       relationship → users, required
apelido       text, required          — "MacBook do Jotta"
credentialId  text, required, unique  — base64url
publicKey     text, required          — chave pública COSE, base64
counter       number, required, default 0 — contador anti-clonagem
transports    array<text>, optional   — ex.: ["internal", "hybrid"]
ultimoUsoEm   date, optional
```

(`id`, `createdAt`, `updatedAt` automáticos do Payload.)

**Acesso declarativo** (`access`): `read`/`delete` → dono do registro OU super-admin; `create`/`update` → `() => false` publicamente — só as Server Actions escrevem, via Local API (mesmo padrão já usado em `painelCrmEscrita.ts`, sem admin UI nativa do Payload pra essa coleção). A autorização real das ações sensíveis (login, remoção admin) é verificada dentro da própria Server Action, no mesmo padrão de `obterUsuarioCms()` já usado em `acoesCrm.ts` — a `access` da coleção é defesa em profundidade, não a única barreira.

### Fluxo de login (2º fator)

Problema a resolver: Payload valida senha e abre sessão no mesmo passo (`payload.login()`). Para inserir o passkey no meio sem guardar estado novo no banco, usa-se um **token efêmero de ponte** (~5 min) que viaja pelo client entre os passos.

**Cuidado de segurança que mudou o design em relação à primeira versão desta spec:** um JWT comum (JWS, só assinado) tem o payload em base64url — qualquer um com o token consegue *ler* as claims, a assinatura só impede *alterar*. Se o token de ponte carregasse o token de sessão real do Payload como claim assinada (não criptografada), o próprio navegador conseguiria decodificar e extrair a sessão real antes de completar o passkey — o 2º fator viraria decorativo. Por isso o token de ponte usa **JWE (criptografado)**, não JWS: `jose`'s `EncryptJWT`/`jwtDecrypt` (A256GCM), com a chave simétrica derivada de `PAYLOAD_SECRET` via HKDF (`jose`'s `hkdf()`, com um `info` fixo tipo `"passkey-token-ponte"` pra não colidir com nenhum outro uso do mesmo segredo). Só quem tem `PAYLOAD_SECRET` consegue decifrar — o client recebe um blob opaco. `jose` já está presente na árvore de dependências como transitiva do próprio `payload`; declarar explicitamente em `apps/cms/package.json` para não depender de hoisting (mesmo cuidado do achado corrigido na revisão final da Fase B2 com `playwright-core`).

1. `entrarComSenha(email, senha)` chama `payload.login()` — valida a senha, mas **não** seta o cookie `payload-token` ainda.
2. Sem passkey cadastrado para esse usuário → segue o fluxo atual: cookie setado na hora, login completo.
3. Com passkey cadastrado → a própria `entrarComSenha` já gera as opções de autenticação via `generateAuthenticationOptions` (`allowCredentials` = credenciais do usuário) e devolve tudo num só retorno: `{ precisaPasskey: true, tokenPendente, opcoesAutenticacao }`. O token de sessão que `payload.login()` retornou e o `challenge` gerado ficam **dentro** do token de ponte cifrado (JWE, claims `{ userId, sessaoReal, challenge, exp: +5min, propósito: "2fa-pendente" }`). O client não consegue ler `sessaoReal` nem `challenge` (está cifrado, não só assinado) — só recebe `opcoesAutenticacao` (que já inclui o `challenge` em claro, como o WebAuthn exige) e o blob opaco do token de ponte. Um único round-trip ao servidor resolve a senha inteira; não há uma ação separada só para buscar opções.
4. Client mostra "Confirme com passkey"; ao usuário confirmar, chama `navigator.credentials.get(opcoesAutenticacao)` (Touch ID/passkey do SO) — puramente client-side, sem nova ida ao servidor.
5. Client envia a resposta assinada + o token de ponte pra `verificarAutenticacaoPasskey`.
6. Servidor decifra o token de ponte, confirma que o `challenge` da resposta bate com o `challenge` guardado nas claims, e verifica a assinatura via `verifyAuthenticationResponse` contra a `publicKey`/`counter` salvos; se o `counter` recebido não for estritamente maior que o salvo, rejeita (sinal de clonagem/replay) e loga.
7. Sucesso → servidor extrai `sessaoReal` de dentro do token de ponte já decifrado e seta o cookie `payload-token` com ele — sessão idêntica à que o Payload teria criado normalmente. Atualiza `counter` e `ultimoUsoEm` na credencial.

### Fluxo de cadastro (enrollment)

Usuário já autenticado (sessão normal). Mesmo cuidado do fluxo de login vale aqui, numa versão mais leve: o servidor não pode confiar num `challenge` que o próprio client devolve — precisa verificar que foi ele mesmo quem emitiu, recentemente, pra essa sessão. Diferente do token de ponte do login, aqui não há nada confidencial pra esconder (não existe sessão embutida) — basta um token **assinado** (JWS, sem precisar de criptografia), reaproveitando o mesmo módulo `tokenPendente.ts` com uma variante mais simples.

1. Configurações → Minha conta → "Adicionar passkey" → `obterOpcoesCadastroPasskey()` gera as opções via `generateRegistrationOptions` (`excludeCredentials` = credenciais já cadastradas desse usuário, evita duplicar o mesmo dispositivo) e devolve `{ opcoesRegistro, tokenDesafio }` — `tokenDesafio` é um JWS curto (~5 min) com `{ challenge, userId, exp }`.
2. `navigator.credentials.create(opcoesRegistro)` no navegador.
3. `verificarCadastroPasskey(resposta, tokenDesafio, apelido)` — servidor verifica a assinatura do `tokenDesafio` (íntegro, não expirado, `userId` bate com a sessão atual), extrai o `challenge` de dentro dele (não do que o client mandaria separado) e chama `verifyRegistrationResponse` com esse valor. Sucesso → salva o registro em `passkeys` vinculado ao usuário da sessão atual.
4. UI lista os passkeys cadastrados (apelido, criado em, último uso) com botão remover por item, chamando `removerPasskeyProprio(id)`.

### Remoção pelo admin

Na tela Usuários (já super-admin-only, mesmo padrão de `removerUsuarioCms`): cada linha ganha uma seção expansível listando os passkeys daquele usuário, com botão "Remover" chamando `removerPasskeyAdmin(passkeyId)` — verifica que quem chama é super-admin (mesma checagem já usada nas outras ações dessa tela) antes de deletar.

## Tratamento de erros e casos de borda

- **Navegador sem suporte a WebAuthn** — detectar via `browserSupportsWebAuthn()` do `@simplewebauthn/browser`; esconder a opção de cadastro e mostrar aviso.
- **Token de ponte expirado** (>5 min) — usuário reinicia o login do zero (mensagem clara, não um erro genérico).
- **Contador retrocedendo** — rejeita a autenticação e loga (`console.error`, mesmo padrão de `gerarESalvarPdfProposta` já usado no projeto) — indício de clonagem de credencial.
- **Dispositivo perdido, sem outro passkey cadastrado** — **correção pós-revisão final:** ao contrário do que esta linha dizia originalmente, uma vez que o usuário tem QUALQUER passkey cadastrado, `entrar()` sempre exige o 2º fator (decisão de design confirmada na sessão de brainstorming, implementada corretamente na Task 5) — perder o único dispositivo bloqueia o login por senha também. A recuperação depende de outro super-admin remover o passkey órfão pela tela Usuários; **se houver um único super-admin no sistema, não há recuperação in-app** — regra operacional: cadastrar pelo menos 2 passkeys (ex.: notebook + celular) antes de depender desta feature, ou garantir uma segunda conta super-admin.
- **Usuário remove o próprio último passkey** — permitido; volta a logar só com senha (consistente com "opcional").

## Configuração

Nenhuma env var nova. RP ID e origin do WebAuthn (precisam bater exatamente com o domínio) derivam de `PAYLOAD_PUBLIC_SERVER_URL`, que já existe.

## Dependências novas (precisam aprovação §5.4 — já concedida nesta sessão)

- `@simplewebauthn/server` — cerimônias de registro/autenticação no servidor.
- `@simplewebauthn/browser` — wrapper de `navigator.credentials` no client.
- `jose` — já presente transitivamente (via `payload`); declarar explicitamente em `apps/cms/package.json` pinado na versão já resolvida, para não depender de hoisting (mesmo cuidado do achado corrigido na revisão final da Fase B2 com `playwright-core`).

## Testes

- Unit (Vitest, padrão já usado no projeto): `lib/passkeys/webauthn.ts` e `tokenPendente.ts` com mocks do `@simplewebauthn/server`; Server Actions com mock de `obterPayload` (mesmo padrão hoisted de `painelCrmEscrita.versao.test.ts`).
- Cobertura explícita dos casos de erro: token de ponte expirado/adulterado/malformado, contador retrocedendo, usuário sem passkey (fluxo inalterado), remoção própria vs. remoção por admin (checagem de permissão).
- Cerimônia real de WebAuthn (Touch ID de verdade) não é automatizável — fica pro checkpoint manual do usuário testando no próprio Mac, conforme CLAUDE.md §6.

## Riscos aceitos

- Sem "códigos de recuperação" — mitigado pela remoção via super-admin.
- 2º fator opcional nesta fase — não fecha sozinho o requisito "2FA obrigatório" do DAB §10.1; enforço obrigatório fica para decisão futura do PO, depois que a adoção estiver validada.
- Sem um segundo super-admin (ou pelo menos 2 passkeys cadastrados na única conta), o único super-admin pode ficar sem recuperação in-app caso perca todos os dispositivos com passkey — ver a correção acima em "Tratamento de erros e casos de borda".
