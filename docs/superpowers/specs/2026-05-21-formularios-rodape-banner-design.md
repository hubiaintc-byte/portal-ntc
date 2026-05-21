# Sprint F.4 — Formulários institucionais, Rodapé e Banner LGPD

**Data:** 2026-05-21
**Sprint:** F (Janela B — UI institucional + integrações)
**Origem:** doc 15 §F.4 (prompt original), doc 10 §7-8, doc 12 §9, §11, §12.3, CLAUDE.md §12.

## 1. Objetivo

Entregar a camada de captura de leads do portal institucional:

1. Família `<FormularioSoberano>` + 10 campos atômicos + `<BotaoSoberano>` em `packages/ui`.
2. 4 rotas POST sob `/api/forms/*` no `apps/web` com validação Zod, persistência no Payload, e-mail interno + confirmação ao usuário via Resend.
3. `<RodapeSoberano>` em `packages/ui` consumindo o Global `Rodape`.
4. `<BannerCookies>` (LGPD) persistido em cookie.
5. 8 templates React Email (4 confirmação + 4 notificação interna).

## 2. Restrições de governança

- **RD Station removido da v1** (CLAUDE.md §17.6). Sem `packages/lib/integracoes/rdstation.ts`. Lead persistido no Payload é a fonte única; CRM futuro é externo e consome `/api/leads` do Payload (memória `project_crm_externo`).
- **Sem novos componentes além do Inventário** (CLAUDE.md §5.1). Todos os componentes desta sessão constam em doc 12 §9, §11, §12.3.
- **2FA do admin é pendência da Janela C** (CLAUDE.md §17.8) — fora do escopo.
- **Stack aprovada apenas** (§5.4). Bibliotecas novas autorizadas nesta sessão: `zod`, `resend`, `react-email`, `@react-email/components`. Sem shadcn/MUI/Chakra.
- **Validação visual é humana** (memória `feedback_validacao_visual`). Não declaramos pronto sem você submeter os 4 forms e ver Lead no admin + e-mail na caixa.

## 3. Arquitetura de pacotes

```
packages/ui/src/components/
  forms/
    FormularioSoberano.tsx         'use client'  — orquestra estado, validação client, submit
    BotaoSoberano.tsx              server-safe   — variantes primario|secundario|fantasma|editorial
    contexto.tsx                   FormularioContext + provider
    tipos.ts                       CampoBaseProps, FormularioContextValue
    campos/
      primitives.tsx               Label, Erro, HelperText, Asterisco (server-safe)
      CampoTexto.tsx               'use client'
      CampoEmail.tsx               'use client'
      CampoTelefone.tsx            'use client'  — máscara BR (xx) xxxxx-xxxx
      CampoSelect.tsx              'use client'
      CampoSelectMulti.tsx         'use client'  — pílulas selecionadas, multi seleção
      CampoTextarea.tsx            'use client'
      CampoNumber.tsx              'use client'
      CampoUrl.tsx                 'use client'
      CampoUpload.tsx              'use client'  — File API, validação client de mime/tamanho
      CampoCheckbox.tsx            'use client'  — com prop linkPolitica → DialogoPolitica
  helpers/
    BannerCookies.tsx              'use client'  — sticky-bottom, persiste cookie
    DialogoPolitica.tsx            'use client'  — <dialog> nativo com fallback target=_blank
  layout/
    RodapeSoberano.tsx             server        — 4 colunas + linha cerimonial + barra legal
    (sub-componentes internos: AssinaturaInstitucional, BarraInstitucional não exportados)
```

```
packages/lib/src/
  integracoes/
    payloadClient.ts               obterPayload() cacheado com React cache()
    resend.ts                      cliente lazy + enviarEmail() + helpers semânticos
    destinatarios.ts               destinatarioInterno(tipo, assunto?) com fallback
  forms/
    schemas.ts                     schemaProposta, schemaContato, schemaNewsletter, schemaCandidatura
    politicaVersao.ts              POLITICA_VERSAO_ATUAL constant
    origemRequest.ts               extrairOrigem(request) — UTMs, referrer, IP, pagina
    hcaptcha.ts                    verificarHcaptcha(token) — stub flag-controlled
    rateLimit.ts                   checarRateLimit(ip, rota) — stub em memória, flag-controlled
    __tests__/
      schemas.test.ts
      origemRequest.test.ts
      destinatarios.test.ts
```

```
packages/types/src/
  rodape.ts                        type RodapeData derivado de payload-types Globals['rodape']
```

```
apps/web/
  app/
    api/forms/
      proposta/route.ts
      contato/route.ts
      newsletter/route.ts
      candidatura-especialista/route.ts
    design-system/
      forms/page.tsx               página interna para checkpoint humano dos 4 forms
    layout.tsx                     monta RodapeSoberano + BannerCookies (server)
  emails/
    componentes/
      Layout.tsx
      Header.tsx
      Footer.tsx
      Titulo.tsx
      Texto.tsx
      Eyebrow.tsx
      BotaoEditorial.tsx
    ConfirmacaoProposta.tsx
    ConfirmacaoContato.tsx
    BoasVindasNewsletter.tsx
    ConfirmacaoCandidatura.tsx
    NotificacaoInternaProposta.tsx
    NotificacaoInternaContato.tsx
    NotificacaoInternaNewsletter.tsx
    NotificacaoInternaCandidatura.tsx
  package.json                     + @ntc/cms workspace:* (devDep), zod, resend, react-email, @react-email/components
```

```
apps/cms/package.json              + exports: './payload.config', './shared/types'
```

### 3.1. Por que essa divisão

- `@ntc/ui/forms` é client-heavy mas isolado: o resto de `@ntc/ui` (blocos, listings, helpers) continua server-friendly e sem regressão.
- `@ntc/lib/forms` concentra lógica server-only pura (Zod, validação de origem, rate limit). Sem imports React.
- `apps/web/emails/` fica no app porque depende de assets em `apps/web/public/` (logos institucionais) — não compartilhado com `apps/cms`.
- `@ntc/cms` é importado por `apps/web` apenas server-side via `getPayload({ config })`. devDependency mantém o bundle do client limpo.

## 4. `<FormularioSoberano>` — contrato

```ts
interface FormularioSoberanoProps {
  endpoint: string;                              // ex.: '/api/forms/proposta'
  schema: z.ZodTypeAny;                          // schema Zod (importado de @ntc/lib/forms)
  titulo: string;
  eyebrow?: string;
  descricao?: string;
  politicaVersao: string;                        // injetado no payload de submit
  estadoSucesso: React.ReactNode;                // bloco editorial premium pós-submit
  textoBotao?: string;                           // default 'Enviar'
  contextoAdicional?: Record<string, unknown>;   // ex.: { programaId } injetado pela página
  children: React.ReactNode;                     // campos
}
```

### 4.1. Estado (FormularioContext)

```ts
interface FormularioContextValue {
  valores: Record<string, unknown>;
  erros: Record<string, string | undefined>;
  tocados: Record<string, boolean>;
  enviando: boolean;
  setCampo: (nome: string, valor: unknown) => void;
  marcarTocado: (nome: string) => void;
}
```

### 4.2. Fluxo de submit

```
onSubmit
  setEnviando(true)
  coleta valores → injeta { politicaVersao, ...contextoAdicional, origem: capturarOrigem() }
  schema.safeParse:
    se falhar → popula erros, scroll ao primeiro campo inválido
    se ok:
      monta body (JSON ou FormData se contém File)
      fetch(endpoint, { method: 'POST', body, headers: Accept: application/json })
      resposta 200 { ok:true, leadId, message }       → mostra estadoSucesso (desmonta o form)
      resposta 422 { ok:false, message, erros: {...}} → popula erros do servidor
      resposta 429                                    → mostra mensagem com retry-after
      outras 4xx/5xx                                  → mostra mensagem genérica de erro
  setEnviando(false)
```

### 4.3. Campos atômicos — estética compartilhada (doc 12 §9.2)

- Label em Barlow uppercase, letter-spacing 0.08em, size 0.75rem, cor Oxford.
- Input com `border-bottom` apenas, `border-color: var(--linha-sutil)`, `:focus` → border-color Oxford.
- Erro inline em `--vermelho-erro`, mostrado abaixo do campo, aparece apenas se `tocados[nome] && erros[nome]`.
- Helper text opcional acima do erro.
- Sem ícones decorativos (CLAUDE.md §3).

### 4.4. Comportamento de cada campo

| Campo | Características |
|---|---|
| `CampoTexto` | `type="text"`, validação client via Zod schema |
| `CampoEmail` | `type="email"`, autocomplete `email` |
| `CampoTelefone` | máscara BR `(xx) xxxxx-xxxx` aplicada onChange |
| `CampoSelect` | `<select>` nativo estilizado; aceita `opcoes: { label, value }[]` |
| `CampoSelectMulti` | UI custom de pílulas; valor é `string[]` |
| `CampoTextarea` | `rows` via prop `linhas` (default 5) |
| `CampoNumber` | `type="number"`, props `min`, `max` |
| `CampoUrl` | `type="url"` |
| `CampoUpload` | `<input type="file">`, validação client de mime e tamanho, props `aceita`, `maxMb` |
| `CampoCheckbox` | `<input type="checkbox">`, prop `linkPolitica` abre `<DialogoPolitica>` |

## 5. `<BotaoSoberano>` — contrato

Server-safe (sem hooks). Discriminator por presença de `href`:

```ts
type BotaoSoberanoProps =
  | {
      variante: 'primario' | 'secundario' | 'fantasma' | 'editorial';
      tamanho?: 'medio' | 'amplo';
      href: string;
      externo?: boolean;             // adiciona target="_blank" + rel + aria-label
      children: React.ReactNode;
      className?: string;
    }
  | {
      variante: 'primario' | 'secundario' | 'fantasma' | 'editorial';
      tamanho?: 'medio' | 'amplo';
      type?: 'button' | 'submit';
      disabled?: boolean;
      carregando?: boolean;          // mostra indicador editorial discreto
      onClick?: () => void;
      children: React.ReactNode;
      className?: string;
    };
```

Variantes (doc 12 §9.3):
- `primario`: fundo Oxford `#11365E`, texto Pergaminho, sem borda.
- `secundario`: fundo transparente, borda Oxford 1.5px, texto Oxford.
- `fantasma`: somente texto Oxford com underline editorial no hover.
- `editorial`: Cormorant Garamond italic ampliado, link-like, para CTAs cerimoniais.

`carregando={true}` desabilita o botão e troca o `children` por indicador editorial (3 pontos animados, não spinner).

## 6. Rotas `/api/forms/*` — pipeline

Cada rota POST segue o mesmo pipeline:

```
parseBody(req)                               // JSON | multipart/form-data
schema.safeParse(body)                       // Zod estrita
  → erro: 422 { ok:false, message, erros }
verificarHcaptcha(token)                     // no-op se HCAPTCHA_ENABLED=false
  → erro: 400
checarRateLimit(ip, rota)                    // no-op se RATELIMIT_ENABLED=false
  → erro: 429 + retry-after
extrairOrigem(req)                           // headers IP, referer, pagina, UTMs
[candidatura] uploadCurriculo()              // payload.create({collection:'media'}) prefix candidaturas/
payload.create({ collection:'leads', data }) // persiste antes do envio
waitUntil(
  enviarConfirmacaoUsuario(tipo, dados, lead) +
  enviarNotificacaoInterna(tipo, dados, lead, assunto?)
)                                            // não bloqueia resposta
200 { ok:true, leadId, message }
```

### 6.1. Matriz das 4 rotas

| Rota | tipo | Schema | Anexo | Destino interno | Template usuário |
|---|---|---|---|---|---|
| `POST /api/forms/proposta` | `proposta` | `schemaProposta` | não | `contato@` | `ConfirmacaoProposta` |
| `POST /api/forms/contato` | `contato` | `schemaContato` | não | `imprensa@` \| `parcerias@` \| `contato@` (por `assunto`) | `ConfirmacaoContato` |
| `POST /api/forms/newsletter` | `newsletter` | `schemaNewsletter` | não | `contato@` | `BoasVindasNewsletter` |
| `POST /api/forms/candidatura-especialista` | `candidatura` | `schemaCandidatura` | sim (PDF ≤10MB) | `corpo-docente@` | `ConfirmacaoCandidatura` |

### 6.2. Schemas Zod (resumo do contrato — DAB §7)

```ts
const consentimentoLgpd = z.object({
  aceito: z.literal(true),
  politicaVersao: z.string().min(1),
});

const origemFront = z.object({
  pagina: z.string(),
  referrer: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
});

export const schemaProposta = z.object({
  programaId: z.string().optional(),
  areaId: z.string().optional(),
  modalidade: z.enum(['in-company','turma-aberta','sob-medida','proposta-livre']),
  nome: z.string().min(2),
  email: z.string().email(),
  telefone: z.string().min(8),
  cargo: z.string().min(1),
  instituicao: z.string().min(1),
  esfera: z.enum(['municipal','estadual','federal','privada','terceiro-setor']),
  participantesEstimados: z.number().int().positive().optional(),
  mensagem: z.string().min(10),
  origem: origemFront,
  consentimentoLgpd,
});

// schemaContato:  assunto enum + mensagem + base de identidade
// schemaNewsletter: nome + email + areasInteresse: z.string().array().min(1) + base
// schemaCandidatura: titulacao + linhasAtuacao + apresentacao + linkLattes? + linkLinkedin? + base
```

### 6.3. Mapeamento Lead

```ts
{
  tipo: 'proposta' | 'contato' | 'newsletter' | 'candidatura',
  nome, email, telefone, cargo?, instituicao?, esfera?,
  detalhesProposta?: { programa, modalidade, participantesEstimados, mensagem },
  detalhesContato?: { assunto, mensagem },
  detalhesNewsletter?: { areasInteresse },
  detalhesCandidatura?: { titulacao, linhasAtuacao, apresentacao, linkLattes, linkLinkedin, curriculo },
  origem: { paginaSubmissao, referrer, utmSource, utmMedium, utmCampaign, utmTerm, utmContent },
  consentimentoLgpd: { aceito: true, timestamp: <now ISO>, politicaVersao, ipSubmissao },
  payloadBruto: <body inteiro>,
  status: 'novo',
}
```

### 6.4. Roteamento de destinatário interno

```ts
function destinatarioInterno(tipo, assunto?) {
  const fallback = process.env.RESEND_TO_FALLBACK ?? 'contato@institutontc.com.br';
  if (tipo === 'contato' && assunto === 'imprensa')   return process.env.RESEND_TO_IMPRENSA ?? fallback;
  if (tipo === 'contato' && assunto === 'parcerias')  return process.env.RESEND_TO_PARCERIAS ?? fallback;
  if (tipo === 'candidatura')                         return process.env.RESEND_TO_CORPO_DOCENTE ?? fallback;
  return process.env.RESEND_TO_CONTATO ?? fallback;
}
```

Em dev sem nenhuma env: todos caem em `contato@institutontc.com.br`.

## 7. `<RodapeSoberano>` — contrato

```ts
interface RodapeSoberanoProps {
  dados: RodapeData;       // derivado de payload-types Globals['rodape']
  className?: string;
}
```

Estrutura (doc 12 §11.1):

1. **Topo — 4 colunas:**
   - Coluna 1 (Mapa do site): links **hardcoded** baseados em doc 13 — Home, O Grupo NTC, Programas, Eventos, Especialistas, Conteúdos, Contato.
   - Coluna 2 (Soluções): NTC Educação, NTC Gestão Pública, NTC Saúde.
   - Coluna 3 (Conteúdos): Artigos, Pesquisas Aplicadas, Notas Técnicas (também hardcoded; rotas reais).
   - Coluna 4 (Contato): vinda de `dados` — emailInstitucional, telefone, whatsapp, redes sociais.
2. **Linha cerimonial:** `dados.assinaturaInstitucional` em Cormorant Garamond italic dourado `#B5995A`, centralizado.
3. **Barra final:** `© 2026 dados.razaoSocial · CNPJ dados.cnpj` + `dados.linksLegais` mapeados.

Sub-componentes internos (não exportados): `AssinaturaInstitucional`, `BarraInstitucional`. `BarraInstitucional` (doc 12 §11.3) — barra estreita do topo do header — não é criada nesta sessão (será sprint específico).

### 7.1. Acesso aos dados (server)

`apps/web/app/layout.tsx`:

```tsx
import { obterPayload } from '@ntc/lib/integracoes/payloadClient';

async function carregarRodape() {
  const payload = await obterPayload();
  return payload.findGlobal({ slug: 'rodape', depth: 1 });
}
```

`obterPayload` é cacheada via `cache()` da React → uma única instância por request.

## 8. `<BannerCookies>` — contrato

```ts
interface BannerCookiesProps {
  politicaVersao: string;
  categorias: ('essencial' | 'analytics' | 'marketing')[];
}
```

Comportamento:

1. Em mount lê cookie `ntc_cookies_consent_v1`.
2. Se cookie existe e `politicaVersao` armazenada corresponde → não renderiza nada.
3. Caso contrário renderiza faixa sticky-bottom.

Visual: faixa Pergaminho `#F4EFE6` com borda superior Oxford, alinhada à grid editorial.

- Categoria "essencial" sempre ativa, sem checkbox.
- Demais categorias começam **desmarcadas** (CLAUDE.md §12).
- Dois botões: "Aceitar essenciais" (só essencial) e "Aceitar selecionados" (essencial + escolhidas).
- ESC não fecha (LGPD exige escolha explícita). Sem backdrop.

Cookie escrito como `document.cookie`:

```
name:    ntc_cookies_consent_v1
value:   JSON.stringify({ versao, timestamp, categorias })
attrs:   path=/; max-age=31536000; SameSite=Lax
```

Em modo `production` + HTTPS adiciona `Secure`.

## 9. `<DialogoPolitica>` — contrato

Usado pelo `<CampoCheckbox>` ao clicar no link. `<dialog>` nativo (`showModal()`) com fallback graceful para `target="_blank"` quando JS desabilitado ou `dialog` indisponível.

Conteúdo: título + 2 parágrafos institucionais curtos + dois botões — "Ler política completa" (`<a target="_blank">`) e "Fechar".

A11y: foco preso (foco em "Fechar" ao abrir, ciclo via Tab), ESC fecha, clique no backdrop fecha.

Não carrega `/politica-de-privacidade` em iframe (UX ruim para conteúdo editorial longo).

## 10. Templates React Email

Primitivos compartilhados em `apps/web/emails/componentes/`:

- `Layout.tsx` — `<Html><Head><Body>` shell, importa fontes via CDN (Cormorant Garamond, Barlow).
- `Header.tsx` — lockup Grupo NTC (logo em `apps/web/public/static/`).
- `Footer.tsx` — assinatura institucional + links legais + endereço.
- `BotaoEditorial.tsx` — CTA com fundo Oxford.
- `Titulo.tsx`, `Texto.tsx`, `Eyebrow.tsx`.

8 templates: 4 confirmação ao usuário + 4 notificação interna.

Templates internos incluem:
- Listagem editorial dos campos enviados.
- Link direto ao Lead: `{PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/leads/{leadId}`.
- UTMs e origem.
- Versão da política aceita + timestamp + IP.

## 11. Variáveis de ambiente

`.env.example` ganha:

```
# Resend
RESEND_API_KEY=
RESEND_FROM=Grupo NTC <noreply@gruponctc.org.br>
RESEND_DRY_RUN=false                  # true = loga sem enviar
RESEND_TO_FALLBACK=contato@institutontc.com.br
RESEND_TO_CONTATO=
RESEND_TO_IMPRENSA=
RESEND_TO_PARCERIAS=
RESEND_TO_CORPO_DOCENTE=

# Segurança (stubs até janela própria)
HCAPTCHA_ENABLED=false
HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET=
RATELIMIT_ENABLED=false

# LGPD
POLITICA_VERSAO=2026-05-20
```

## 12. Error handling — matriz explícita

| Cenário | HTTP | Lead persistido? | E-mail enviado? |
|---|---|---|---|
| Zod inválido | 422 | não | não |
| hCaptcha falha (enabled) | 400 | não | não |
| Rate limit excedido | 429 | não | não |
| Upload PDF >10MB | 413 | não | não |
| Erro upload Supabase Storage | 500 | não | não |
| Erro persistência Payload | 500 | não | não |
| Erro Resend (interno) | **200** | **sim** | parcial, log |
| Erro Resend (usuário) | **200** | **sim** | parcial, log |
| Erro inesperado | 500 | depende | depende |

Regra DAB §9: persistência precede disparo de e-mail, disparo roda em `waitUntil` sem propagar exceção. Lead **nunca se perde** se e-mail falha.

## 13. Testes

Esta sessão não tem TDD formal. Cobertura mínima:

- **Vitest em `packages/lib/src/forms/__tests__/`:**
  - `schemas.test.ts` — parse válido + parse inválido por schema.
  - `origemRequest.test.ts` — `x-forwarded-for`, `referer`, UTMs do query string.
  - `destinatarios.test.ts` — matriz de roteamento `destinatarioInterno`.
- **Sem testes UI** dos campos — coberto pelo checkpoint humano.
- **Sem testes HTTP** das rotas — coberto pelo checkpoint humano via submits reais.

## 14. Checkpoint visual e protocolo de aceite

Validação humana (memória `feedback_validacao_visual`):

1. Rodar `pnpm typecheck && pnpm lint && pnpm build` no monorepo.
2. Subir `pnpm dev:web` + `pnpm dev:cms` em paralelo.
3. Reportar ao PO:
   - URL `http://localhost:3000/design-system/forms` com os 4 forms em sequência.
   - URL `http://localhost:3001/admin/collections/leads` para confirmar Lead criado.
   - Caixa onde os e-mails internos chegam (default `contato@institutontc.com.br`).
   - Quais env vars preencher (mínimo `RESEND_API_KEY` ou `RESEND_DRY_RUN=true`).
4. Aguardar OK humano antes de commitar.

Critérios de aceite (espelham o prompt original):

- Submit de cada um dos 4 formulários cria Lead no admin.
- E-mails de confirmação chegam à caixa do testador.
- E-mails internos chegam à caixa configurada.
- Banner LGPD aparece em primeira visita; não reaparece após aceite.

## 15. Fora do escopo desta sessão

Para evitar escopo inflado (CLAUDE.md §5.5 + brainstorming YAGNI):

- Rotas institucionais do portal (`/contato`, `/proposta`, etc) → Sprint F.5.
- Página `/politica-de-privacidade` real → usa placeholder de rota nesta sessão.
- Endpoint `/api/forms/exclusao-lgpd` (DAB §7 final) → fora do prompt.
- Sentry → pendência §17 do CLAUDE.md.
- hCaptcha real e rate limit real → flags off por padrão.
- Plausible / Vercel Analytics → sprint próprio.
- `<BarraInstitucional>` no topo do header (doc 12 §11.3) → sprint do header.

## 16. Commit final

```
feat(formularios): 4 formulários institucionais com LGPD, Rodapé e Banner LGPD
```

(O prompt original menciona "RD Station e Resend" no commit. Substituído por "Rodapé e Banner LGPD" para refletir a v1.1 de governança e o escopo real entregue.)
