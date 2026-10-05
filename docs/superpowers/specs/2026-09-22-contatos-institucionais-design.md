# Contatos institucionais editáveis no painel — design

**Data:** 22 de setembro de 2026
**Estado:** aprovado com o PO em 17 e 22/09/2026 (brainstorming)
**Branch de implementação:** `feat/cms-conteudos-editoriais` (mesma da spec irmã)
**Spec irmã:** `2026-09-22-cms-conteudos-editoriais-design.md` — **um único** `payload:push:schema` para as duas.

## 1. Problema

Telefone, WhatsApp, e-mails e endereço do Instituto estão **escritos no código**, repetidos em nove arquivos do site. Trocar o número de atendimento hoje é uma tarefa de desenvolvedor, com risco de deixar uma ocorrência para trás — e já há divergência real: o e-mail de suporte aparece como `suporte@eventon.institutontc.com.br` no card do EventOn e como `suporte@institutontc.com.br` nos Termos de Uso.

O global `rodape` já modela quase todos esses campos (doc 11 §14) e **nenhuma página do site o lê**.

### Inventário do que está fixo

| Dado | Valor atual | Onde aparece |
|---|---|---|
| Telefone | (63) 3212-1199 | `FooterHome` (todas as páginas), `/contato` (com "opção 1/2/3" por vertical), `/o-grupo`, `/politica-de-privacidade` |
| WhatsApp | (63) 98444-4040 | `/contato` (botão `wa.me`), `/agenda` |
| E-mail geral | contato@ | `FooterHome`, `/contato`, `/agenda`, `/o-grupo`, `/termos-de-uso` |
| E-mail imprensa | imprensa@ | `/contato` |
| E-mail DPO | dpo@ | `/politica-de-privacidade`, `/termos-de-uso`, `/lgpd`, `/politica-de-cookies`, `/mapa-do-site`, `/o-grupo/corpo-docente`, `/solucoes`, `/contato` |
| E-mail suporte | suporte@eventon… / suporte@… | `/contato`, `/termos-de-uso` |
| E-mail eventos | eventosonline@ | texto de cancelamento dos 4 eventos estáticos |
| E-mails por vertical | educacao@ · gestaopublica@ · saude@ | `/contato` (um bloco por vertical) |
| Endereço | SCS Q9, Bloco C… Brasília–DF | `FooterHome`, `/contato`, `/o-grupo` |

O site não tem redes sociais hoje — o rodapé não traz ícones —, então `redesSociais` fica fora.

## 2. Escopo

**Entra:** seção "Contatos institucionais" em Configurações; o site lendo todos os pontos da tabela acima do CMS.

**Não entra, por decisão do PO:** os **4 eventos estáticos** de `/agenda/[slug]`, que mantêm `eventosonline@` e o WhatsApp no parágrafo de cancelamento — são páginas fechadas, portadas de PDF, e eventos novos vêm da coleção `eventos` com texto próprio (§5.6). Também fora: redes sociais, links legais e `assinaturaInstitucional` (ninguém pediu para editá-los).

## 3. Decisões tomadas

| Decisão | Escolha | Por quê |
|---|---|---|
| Onde guardar | O global `rodape` que já existe, com rótulo trocado para "Contatos institucionais" | Um global novo exigiria mover campos entre tabelas (schema, risco de perder o que estiver preenchido) e duplicaria endereço e e-mails. |
| Formato do telefone | Um campo só, como digitado; `tel:`/`wa.me` derivados | Dois campos divergem com o tempo. |
| Alcance | Tudo do inventário, menos os 4 eventos estáticos | Cobre o site vivo sem tocar em página fechada. |
| Revalidação | `revalidatePath("/", "layout")` | O rodapé está em todas as páginas; revalidar caminho a caminho seria pior. |
| `emailParcerias` | Editável, sem consumidor no site | Já está modelado; deixar de fora criaria um campo órfão no schema. |

## 4. Modelo de dados

Global `rodape` (slug mantido; `label` passa de "Rodapé Institucional" para **"Contatos institucionais"**).

**Já existem e passam a ser usados:** `enderecoCompleto`, `telefoneInstitucional`, `whatsappInstitucional`, `emailInstitucional`, `emailImprensa`, `emailParcerias`, `emailDpo`, `cnpj`, `razaoSocial`.

**Campos novos:**

| Campo | Tipo | Nota |
|---|---|---|
| `emailSuporte` | `email` | Unifica as duas grafias divergentes de hoje. |
| `emailEventos` | `email` | `eventosonline@`. |
| `verticais` | `array` (3 linhas) | `vertical` (select: `educacao`/`gestao-publica`/`saude`), `email`, `opcaoTelefone` (texto curto: "opção 1"). |

**Derivação (função pura em `packages/lib`, testada):** `telefoneParaHref("(63) 3212-1199") → "tel:+556332121199"` e `whatsappParaHref("(63) 98444-4040") → "https://wa.me/5563984444040"` — tira tudo que não é dígito e prefixa `55` quando o número não vem com código de país.

**Seed** `pnpm --filter @ntc/cms contatos:seed`: grava os valores que hoje estão no código, para o global nascer preenchido e o site não mudar de aparência no dia em que passar a ler do CMS. Idempotente — só escreve campo vazio. **Antes de rodar o push, conferir por `psql` se `rodape` já tem linha preenchida** (deve estar vazio, mas não se supõe).

## 5. Painel Admin

`TelaConfiguracoes` ganha a seção **Contatos institucionais**, logo abaixo de "Minha conta" e acima das seções demonstrativas — **sem** o selo "Demonstrativo", porque é real. Um formulário, em blocos:

- **Atendimento:** telefone, WhatsApp, e-mail institucional.
- **Canais específicos:** imprensa, DPO, parcerias, suporte, eventos. `emailParcerias` já existe no global e fica editável, mas **nenhuma página do site o exibe hoje** — é o único campo do formulário sem consumidor; entra por já estar modelado, não por demanda.
- **Coordenações por vertical:** três linhas fixas (Educação, Gestão Pública, Saúde) com e-mail e opção do telefone.
- **Endereço e identificação:** endereço completo, razão social, CNPJ.

Validação antes de salvar: e-mail com formato válido, telefone com DDD, endereço não vazio. Campo inválido é apontado no próprio campo, sem perder o que já foi digitado. Abaixo do botão, uma linha discreta diz onde aquilo aparece ("rodapé de todas as páginas, página de Contato, O Grupo, páginas legais").

Server Action `salvarContatos` em `acoes.ts`, escrita em `painelCmsEscrita.ts` (`updateGlobal`, já usado pela curadoria da Home). Perfil: `editorInstitucional`.

## 6. Site

### 6.1. Leitura

`apps/web/lib/contatos.ts` com `carregarContatos()`: `cache()` do React, Local API, e **fallback para os valores de hoje** (constante `CONTATOS_FALLBACK` no próprio arquivo) se a leitura falhar ou vier vazia, campo a campo. Nunca lança — nenhuma página pode perder o rodapé por causa disso.

### 6.2. Quem passa a ler

- **`FooterHome`** (telefone, e-mail, endereço) — importado pelos **8** layouts de route group (`(home)`, `(institucional)`, `(o-grupo)`, `(programas)`, `(capacitacao)`, `(conteudos)`, `(solucoes)`, `(vertical)`), então é o site inteiro. Continua Server Component; recebe os contatos por props do layout, que passa a ser `async`.
- **`/contato`** — os cards de canal (e-mail, telefone, WhatsApp, imprensa, suporte) e os três blocos por vertical, com o **texto e o `href` vindos do mesmo dado**.
- **`/o-grupo`** — a linha de endereço com telefone e e-mail.
- **`/agenda`** — WhatsApp e e-mail comercial.
- **`/politica-de-privacidade`, `/termos-de-uso`, `/lgpd`, `/politica-de-cookies`, `/mapa-do-site`, `/o-grupo/corpo-docente`, `/solucoes`** — e-mail do DPO e de suporte.

As páginas legais são estáticas hoje e ganham `revalidate = 3600`, como as demais.

### 6.3. Revalidação

Salvar contatos chama `/api/revalidate` (mesmo segredo compartilhado) com um modo novo `escopo: "layout"`, que executa `revalidatePath("/", "layout")`. Sem o campo, o endpoint continua se comportando como hoje.

## 7. Schema

Colunas novas numa tabela existente (`rodape`): `email_suporte`, `email_eventos`, mais a tabela do array `rodape_verticais` e o enum `enum_rodape_verticais_vertical`. **Sem `DROP`, sem enum recriado.** Entra no mesmo push da spec irmã; qualquer `DROP` no diff é `N` e volta para o agente.

## 8. Erros

- Salvar devolve `{ ok, erro }` no `AvisoForm`.
- Falha de revalidação **não** desfaz o salvamento: loga e avisa na tela que o site pode levar até uma hora para refletir.
- `carregarContatos()` nunca lança: banco fora do ar → fallback com os valores de hoje, com log.

## 9. Testes

- Derivação de `tel:` e `wa.me` (com e sem máscara, com e sem código de país).
- Validação dos campos do formulário.
- `carregarContatos()`: fallback quando a leitura falha; mescla parcial quando só alguns campos estão preenchidos.
- `salvarContatos` com o Payload mockado, incluindo o gate de perfil.
- Seed idempotente.
- `/api/revalidate` com `escopo: "layout"`, inclusive rejeitando sem o segredo.

## 10. Entrega

Commits separados dos da spec irmã, na mesma branch. Um `payload:push:schema` para as duas.

**Checkpoint visual (§6), com o dev no ar:** editar telefone e e-mail em Configurações, salvar, e conferir a mudança no rodapé, em `/contato` (texto **e** link do botão), em `/o-grupo` e nas páginas legais — em 1440 e 375.
