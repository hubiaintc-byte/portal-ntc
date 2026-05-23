# Página Contato — Design (porta do HTML)

**Data:** 2026-05-23
**Autor:** sessão Claude Code com supervisão humana
**Status:** spec aprovado em brainstorming, aguardando review humano antes do plano de implementação

---

## 1. Contexto

Porta literal de `12_Pagina_Contato_v1.html` (2.788 linhas) para a rota `/contato` no route group `(institucional)`. Segue a estratégia "porta do HTML" já consolidada no projeto (CSS literal extraído + `page.tsx` server + `conteudoContato.ts` local + Client Components mínimos para interatividade).

A página é um hub de atendimento institucional com **4 formulários sob um roteador de tabs** (atendimento geral, proposta institucional, inscrição de equipe/grupo, imprensa), 5 canais diretos com mapa da sede, 3 cards de coordenação por vertical (Educação, Gestão Pública, Saúde), barra de SLA, FAQ accordion de 8 itens, bloco LGPD e CTA final. É a maior porta de página única do projeto até hoje em termos de campos de formulário (~50 ao todo, contando os 4 forms).

O escopo desta sessão é a porta visual + interatividade client-side (tabs, validação, accordion, bloco condicional de inscrição em lote, autofill de evento via URL params, smooth scroll, fade-in). Backend de submit, captcha e analytics ficam fora — são marcados como TODO inline no código, com o stub do protótipo preservado (mensagem "Mensagem registrada · você receberá retorno em horário comercial").

## 2. Documentos de referência

- `12_Pagina_Contato_v1.html` — fonte canônica visual e funcional.
- `docs/13_Mapa_Pagina_a_Pagina_v1.md` — confirma rota dentro do route group.
- `docs/12_Inventario_Componentes_Editoriais_v1.md` — referência conceitual (esta porta usa classes literais do HTML, não componentes do inventário).
- `memory/project_porta_html.md` — estratégia "porta do HTML".
- `memory/feedback_porta_html_fidelidade.md` — fidelidade 100% obrigatória.
- `memory/feedback_cms_apenas_quando_pedido.md` — textos em arquivo local, não no CMS.
- `memory/feedback_validacao_visual.md` — checkpoint visual humano.
- `memory/feedback_css_url_absoluto.md` — `url('/img/...')` em vez de `url('./img/...')`.
- `apps/web/app/(institucional)/layout.tsx` — layout existente que esta página vai herdar (`HeaderHome` + `FooterHome`).
- `apps/web/app/(institucional)/lgpd/page.tsx`, `.../mapa-do-site/page.tsx` — irmãs portadas no mesmo route group; referência de tom para markup.

## 3. Arquitetura de arquivos

```
apps/web/app/
├── (institucional)/contato/
│   ├── page.tsx                       ← server component, JSX literal das seções
│   ├── conteudoContato.ts             ← textos, tipos, dados estáticos
│   ├── RoteadorFormularios.tsx        ← client: tabs + 4 forms + validação + bulk + autofill
│   ├── FaqAccordion.tsx               ← client: accordion de 8 itens
│   └── EfeitosContato.tsx             ← client: IntersectionObserver fade-in + smooth scroll (return null)
└── contato-prototipo.css              ← CSS literal dos blocos <style> do HTML (~940 linhas)
```

Importado pelo root `apps/web/app/layout.tsx` (uma linha de `import "./contato-prototipo.css"` ao lado das outras).

**Decisões fixadas:**

- Rota: `/contato`.
- Layout do route group `(institucional)` reaproveita `HeaderHome` + `FooterHome` existentes — nenhuma mudança no `layout.tsx` do group.
- `revalidate = 3600` no `page.tsx`.
- **Sem submit real**: o handler do form preserva o stub do protótipo (`status.textContent = "Mensagem registrada · você receberá retorno em horário comercial."`). Cada form fica com `// TODO: integrar endpoint <X> após backend de contato pronto`.
- **Sem analytics**: chamadas `track(...)` do protótipo viram comentários `// TODO: analytics quando dataLayer estiver configurado`.
- **Sem hCaptcha**: forms só validam client-side.
- **Iframe Google Maps** preservado literal (`loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`).
- **Hrefs internos do protótipo:**
  - `./30_Pagina_Privacidade_v1.html` → trocar por `/politica-de-privacidade` (rota já portada).
  - `./07_Pagina_Vertical_NTC_*_v1.html` (3 ocorrências) → manter literal + `// TODO: rota /educacao | /gestao-publica | /saude (vertical) ainda não criada`.
  - `./02_Prototipo_Home_GrupoNTC_v2_6.html#programas/#solucoes/#conteudos/#docentes/#eventon` → manter literais com TODO; mas como só aparecem em `HeaderHome`/`FooterHome` (compartilhados) ou em quicklinks de hero (que aqui não usam essas âncoras), nada a fazer no escopo desta página.
  - `./09_Pagina_Agenda_v2.html` → literal + `// TODO: rota /agenda ainda não criada`.
  - `./assets/modelo-inscricao-grupo-NTC.xlsx` → literal + `// TODO: hospedar XLSX em apps/web/public/assets/`. O arquivo XLSX não está no repo.
  - `mailto:`, `tel:`, `https://wa.me/...` → literais válidos.

## 4. Estrutura do `page.tsx` (server)

Renderiza, em ordem (espelho do `<main id="main">` do HTML, linhas 1252-2223):

1. **`<section class="hero-page">`** — breadcrumb, eyebrow, h1 com `<span class="accent">decide</span>`, lede, 5 `<a>` hero-quicklinks (`#tab-atendimento`, `#tab-proposta`, `#tab-equipe`, `#tab-imprensa`, `#canais-diretos`). JSX literal.
2. **`<section class="router">`** — header `router-head` + `<RoteadorFormularios mode="tabs">` (renderiza os 4 `<button class="router-tab">`).
3. **`<section class="forms-wrap">`** — `<RoteadorFormularios mode="panels">` (renderiza os 4 `.form-panel`). Os dois `mode` compartilham estado via Context interno do componente.

   > **Nota de implementação:** alternativamente o `<RoteadorFormularios>` pode renderizar as duas `<section>` consecutivas em um único Fragment, evitando o Context. **Decisão:** implementar como Fragment para simplicidade — uma única instância do client component encapsula tudo, e o `page.tsx` chama apenas `<RoteadorFormularios />` no lugar dos `<section class="router">` e `<section class="forms-wrap">` juntas. As classes ficam preservadas dentro do componente.

4. **`<section class="channels" id="canais-diretos">`** — header da seção, 5 `.channel-card` (e-mail, comercial featured, whatsapp featured, imprensa, suporte), `<aside class="hq-card">` com `<iframe>` Google Maps + botões. JSX literal.
5. **`<section class="section section--cream">`** — header + 3 `<article class="vert-card">` (Educação, Gestão Pública, Saúde). Cada card tem 2 `<a class="btn-vert">`, sendo o de "Solicitar proposta" com `data-vertical-preset="<vertical>"` e `href="#tab-proposta"`. JSX literal — o handler global de `data-vertical-preset` vive em `<RoteadorFormularios>`.
6. **`<section class="sla-bar">`** — header + 4 `.sla-cell` + linha de horários no rodapé. JSX literal com estilos inline do protótipo preservados (`style="..."`).
7. **`<section class="faq" id="faq">`** — header + `<FaqAccordion items={FAQS} />`.
8. **`<section class="lgpd" id="lgpd">`** — grid 2 colunas: texto institucional à esquerda, 4 `.lgpd-cell` à direita. JSX literal.
9. **`<section class="cta-final">`** — h2 com `<em>impacto institucional real</em>`, 3 botões. JSX literal.

Fora do `<main>` (auxiliares):

- `<EfeitosContato />` — client component sem render, montado uma vez no fim do `page.tsx` (após `</main>` virtual; tecnicamente fica dentro do Fragment de retorno do `page.tsx`, mas não emite DOM). Aplica IntersectionObserver para `.fade-in` e smooth scroll para `<a href^="#">:not([href^="#tab-"])`.

`HeaderHome` e `FooterHome` vêm do `(institucional)/layout.tsx` existente — nenhuma alteração.

## 5. Estrutura do `conteudoContato.ts`

Tipos e exports:

```ts
// Hero
export const HERO = {
  breadcrumbHomeLabel: "Grupo NTC",
  breadcrumbHomeHref: "/",
  breadcrumbCurrent: "Contato",
  eyebrow: "Canais institucionais · Atendimento dedicado",
  // H1 contém <span class="accent">decide</span>; armazenar como duas partes
  tituloAntes: "Fale com quem ",
  tituloAccent: "decide",
  tituloDepois: " os rumos da formação institucional.",
  lede: "Atendimento humano, institucional e direcionado à natureza da sua demanda. …",
  quicklinks: [
    { href: "#tab-atendimento", label: "Atendimento geral", cmsLink: "rota-atendimento-geral" },
    // … 5 itens
  ],
};

// Roteador — tabs
export type TabId = "atendimento" | "proposta" | "equipe" | "imprensa";
export interface TabConfig {
  id: TabId;
  numero: string;          // "01 · Geral"
  titulo: string;
  descricao: string;
  ctaFooter: string;       // "Falar com a NTC"
  cmsLink: string;
}
export const TABS: TabConfig[] = [ /* 4 itens */ ];

// Forms — uma config por tab. Mantém os mesmos data-cms-link e data-endpoint
// do protótipo (mesmo sem backend), preservados para a integração futura.
export interface FormConfig {
  tab: TabId;
  formId: string;          // "form-contato-atendimento"
  cmsLink: string;         // "submit-atendimento-geral"
  endpoint: string;        // "/api/contato/atendimento"
  aside: {
    eyebrow: string;
    titulo: string;
    descricaoHtml: string; // inclui <strong>; renderiza com dangerouslySetInnerHTML
    bullets: string[];     // bullets podem ter <strong>; dangerouslySetInnerHTML por item
    rodapeHtml: string;
  };
  // os fields ficam descritos como markup dentro do componente RoteadorFormularios
  // (são muito específicos por form para abstrair); aqui guardamos apenas o aside.
}
export const FORMS: FormConfig[] = [ /* 4 itens, sem fields — fields ficam no JSX */ ];

// Opções de selects (compartilhadas; mantidas literais do HTML)
export const OPTIONS_ASSUNTO_ATENDIMENTO: ReadonlyArray<{ value: string; label: string }> = [ /* 7 */ ];
export const OPTIONS_NATUREZA_JURIDICA = [ /* 10 */ ];
export const OPTIONS_VERTICAL_PROP = [ /* 6 */ ];
export const OPTIONS_PROGRAMA_PROP_GRUPOS = [
  { grupo: "NTC Educação", opcoes: [ /* 9 */ ] },
  { grupo: "NTC Gestão Pública", opcoes: [ /* 3 */ ] },
  { grupo: "NTC Saúde", opcoes: [ /* 3 */ ] },
  // + 1 opção solta "customizado"
];
export const OPTIONS_MODALIDADE = [ /* 8 */ ];
export const OPTIONS_PARTICIPANTES = [ /* 7 */ ];
export const OPTIONS_PRAZO = [ /* 7 */ ];
export const OPTIONS_ORCAMENTO = [ /* 7 */ ];
export const OPTIONS_INSCRITOS_EQUIPE = [ /* 9; valores 51-100/101-500/501-1000/acima-1000 são triggers do bloco bulk */ ];
export const OPTIONS_FATURAMENTO = [ /* 6 */ ];
export const OPTIONS_TIPO_IMPRENSA = [ /* 8 */ ];

// Canais diretos (seção 4)
export interface ChannelCard {
  data: string;            // data-channel
  destaque?: boolean;      // is-featured
  iconeChar: string;       // "@", "☎", "W", "¶", "⚙"
  label: string;
  valor: string;
  nota: string;
  acaoHref: string;
  acaoTexto: string;
  acaoCmsLink: string;
  acaoTarget?: "_blank";
  acaoCrimson?: boolean;
}
export const CHANNELS: ChannelCard[] = [ /* 5 itens */ ];
export const HQ = {
  cidade: "Brasília · DF",
  enderecoHtml: "<strong>Instituto NTC do Brasil</strong><br>…",
  mapaIframeSrc: "https://www.google.com/maps?q=…&output=embed",
  mapaIframeTitle: "Localização da sede do Instituto NTC do Brasil em Brasília — DF",
  mapsBotaoHref: "https://www.google.com/maps/search/?api=1&query=…",
};

// Verticais (seção 5)
export interface VerticalCard {
  vertical: "educacao" | "gestao-publica" | "saude";
  eyebrow: string;
  titulo: string;
  lede: string;
  programas: string;       // "EDUTEC · PEAR · PEI · …"
  canaisHtml: string;      // multilinha com <br>
  conhecerHref: string;    // TODO: rotas verticais não portadas
  conhecerCmsLink: string;
  propostaCmsLink: string;
}
export const VERTICAIS: VerticalCard[] = [ /* 3 itens */ ];

// SLAs (seção 6)
export interface SlaCell { numero: string; label: string; nota: string; }
export const SLAS: SlaCell[] = [ /* 4 itens */ ];
export const SLA_HORARIOS = {
  comercialHtml: "<strong …>Horário comercial:</strong> …",
  suporteHtml: "<strong …>Suporte EventOn:</strong> …",
};

// FAQ (seção 7)
export interface FaqItem { id: string; perguntaHtml: string; respostaHtml: string; abertaPorDefault?: boolean; }
export const FAQS: FaqItem[] = [ /* 8 itens; o primeiro com abertaPorDefault: true */ ];

// LGPD (seção 8)
export const LGPD = {
  eyebrow: "Tratamento de dados · LGPD",
  titulo: "Seus dados são tratados com a mesma seriedade do nosso compromisso institucional.",
  paragrafosHtml: [/* 2 parágrafos */],
  ctaPrivacidadeHref: "/politica-de-privacidade",
  cells: [
    { titulo: "Finalidade", textoHtml: "…" },
    { titulo: "Base legal", textoHtml: "…" },
    { titulo: "Retenção", textoHtml: "…" },
    { titulo: "Compartilhamento", textoHtml: "…" },
  ],
};

// CTA final (seção 9)
export const CTA_FINAL = {
  eyebrow: "Pronto para começar?",
  tituloHtml: "Vamos transformar a formação da sua instituição em <em>impacto institucional real</em>.",
  paragrafo: "…",
  acoes: [ /* 3 botões: gold proposta, ghost-light equipe, ghost-light mailto */ ],
};
```

**Por que o markup dos forms NÃO vive em `conteudoContato.ts`**: cada um dos 4 forms tem layout próprio (full-row em alguns fields, hint vs err-msg, file-field, form-bulk condicional, etc.). Abstrair em dados perde fidelidade e custa mais código que o JSX direto. Já as **opções de select** e os **textos do aside de cada form** ficam em `conteudoContato.ts` porque são repetitivos e textuais.

## 6. Client components

### `RoteadorFormularios.tsx`

Coração da página. Renderiza, em um único Fragment, a `<section class="router">` (com 4 tabs) e a `<section class="forms-wrap">` (com 4 painéis).

**Estado:**
```ts
const [tabAtiva, setTabAtiva] = useState<TabId>("atendimento");
const [bulkAtivo, setBulkAtivo] = useState(false);
const refForms = { atendimento: useRef<HTMLFormElement>(null), /* … */ };
const refSecaoForms = useRef<HTMLElement>(null); // para scroll target
const refEqEvento = useRef<HTMLInputElement>(null);
const refEqEventoUrl = useRef<HTMLInputElement>(null);
const refSelectInscritos = useRef<HTMLSelectElement>(null);
const refSelectVerticalProp = useRef<HTMLSelectElement>(null);
```

**Effects:**
1. Mount: ler `window.location.hash` e ativar tab + scroll para `#formularios` (offset header 88px), se hash for `#tab-*`. Ler `window.location.search` para `?evento=…&evento_url=…`, preencher `eq-evento` (combinando título + url) + hidden `eq-evento-url`, e aplicar `history.replaceState` para limpar querystring (preservar hash).
2. Mount: registrar `document.addEventListener('click', ...)` que intercepta qualquer `<a href^="#tab-">` da página inteira. Se match no map `{#tab-atendimento, #tab-proposta, #tab-equipe, #tab-imprensa}`: `e.preventDefault()`, `setTabAtiva()`, scroll, e — se o `<a>` tem `data-vertical-preset` e o destino é `#tab-proposta` — chama `prefillVertical()`.
3. Cleanup: remover listeners no unmount.

**Helpers internos:**
- `prefillVertical(verticalKey)`: setar `refSelectVerticalProp.current.value` se a key existe nas options; aplicar box-shadow dourada por 1.4s para feedback.
- `scrollToForms()`: `refSecaoForms.current.getBoundingClientRect().top + scrollY - 88 - 8`.

**Navegação por teclado nas tabs:**
- ArrowRight/ArrowDown → próxima tab; ArrowLeft/ArrowUp → anterior; Home → primeira; End → última; Enter/Space → ativar.
- Atributos `role="tab"`, `role="tablist"`, `aria-selected`, `aria-controls="panel-<id>"`, `tabIndex` correto (0 na ativa, -1 nas demais).
- Painéis: `role="tabpanel"`, `aria-labelledby="tab-<id>"`, `hidden` quando inativo.

**Validação por form** (porta literal do bloco 4 do `<script>`):
- regex email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- required: `String(value).trim().length > 0`.
- textarea com `minLength`: respeitar atributo.
- file: `files?.length > 0` quando required.
- Aplicar classe `has-error` no `.form-field` ou `.file-field` envoltório.
- No `onSubmit`: validar todos, validar checkbox `lgpd` (obrigatório), validar `lgpd_lote` se bulk ativo. Se algo errado: focar primeiro erro, mostrar `status` is-error. Se ok: preservar stub `"Mensagem registrada · você receberá retorno em horário comercial."`, mostrar `status` is-ok, `form.reset()`. Comentar `// TODO: integrar endpoint <data-endpoint> após backend de contato pronto`.

**Bloco condicional bulk (form Equipe)** (porta do bloco 4.1):
- `onChange` do `eq-inscritos`: se valor ∈ `Set(["51-100","101-500","501-1000","acima-1000"])` → `setBulkAtivo(true)`. Caso contrário → `setBulkAtivo(false)` + limpar `eq-planilha` (`fileInput.value=''`), reset `eq-lgpd-lote`, reset display name do arquivo.
- Quando bulk ativo: aplicar `required` no input file e no checkbox `lgpd_lote` (efeito: validação no submit considera obrigatório).
- Arquivo: aceitar `.xlsx`, `.xls`, `.csv` (máx 5MB). Em mudança: atualizar display name + tamanho formatado (`12 KB` ou `1.32 MB`). Em arquivo inválido (extensão/tamanho): aplicar `has-error`, limpar input, mostrar motivo no display.

**Autofill via URL params** (porta do bloco 8):
- Já descrito no Effect 1.
- Feedback visual: box-shadow dourada por 1.8s no `.form-field` envoltório.

**O que NÃO entra:**
- `track(...)` analytics — vira `// TODO: analytics quando dataLayer estiver configurado` em cada ponto.
- `fetch(data-endpoint)` real — `// TODO: integrar endpoint após backend de contato pronto`.
- hCaptcha.

### `FaqAccordion.tsx`

```ts
interface Props { items: FaqItem[]; }
export function FaqAccordion({ items }: Props) {
  const [aberto, setAberto] = useState<Set<string>>(
    new Set(items.filter(i => i.abertaPorDefault).map(i => i.id))
  );
  // …
}
```

- Renderiza `<div class="faq-list">` com N `<div class="faq-item">` (classe `is-open` quando id ∈ `aberto`).
- Botão `.faq-q` com `aria-expanded`, toggle do Set no `onClick`.
- `.faq-a` com `dangerouslySetInnerHTML` (a resposta pode conter `<strong>`, `<a>` etc).

### `EfeitosContato.tsx`

```ts
"use client";
import { useEffect } from "react";
export function EfeitosContato() {
  useEffect(() => {
    // IntersectionObserver para .fade-in
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(".fade-in").forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".fade-in").forEach(el => io.observe(el));

    // Smooth scroll para anchors :not([href^="#tab-"])
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]:not([href^="#tab-"])');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    return () => {
      io.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
```

## 7. CSS

CSS literal dos blocos `<style>` do HTML (linhas 140-1079, ~940 linhas), copiado sem adaptação. Tokens base (`--oxford`, `--cardeal`, `--oliva`, `--dourado`, etc.) vêm de `home-prototipo.css` — não duplicar; se o protótipo redeclarar os tokens dentro do próprio `<style>`, manter (são os mesmos valores; igual ao padrão das 4 institucionais já portadas).

**Gotcha:** após copiar, converter qualquer `url('./img/...')` para `url('/img/...')` (memory `feedback_css_url_absoluto.md`).

Classes principais incluídas (extraídas do `<style>`):

- **Estrutura/layout**: `.container`, `.section`, `.section--cream`, `.eyebrow`, `.eyebrow.gold`, `.eyebrow.lgpd-eyebrow`, `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--gold`, `.btn--ghost-light`, `.btn--participant`, `.btn--mini`, `.btn-arrow`, `.link-arrow`, `.link-arrow.light`, `.link-arrow.crimson`, `.fade-in`, `.is-visible`.
- **Header/drawer** (já cobertos por `HeaderHome` — CSS pode duplicar, sem problema): `.site-header`, `.nav-primary`, `.nav-item`, `.has-mega`, `.mega`, `.drawer-nav`, `.mobile-toggle`, `.mobile-backdrop`.
- **Hero**: `.hero-page`, `.hero-page-bg`, `.hero-page-content`, `.crumb`, `.hero-page h1`, `.hero-page-sub`, `.hero-quicklinks`, `.accent`.
- **Roteador**: `.router`, `.router-head`, `.router-tabs`, `.router-tab`, `.router-tab.is-active`, `.tab-num`, `.tab-foot`.
- **Forms**: `.forms-wrap`, `.form-panel`, `.form-panel.is-active`, `.form-shell`, `.form-aside`, `.aside-foot`, `.form-body`, `.form-grid`, `.form-field`, `.form-field.full`, `.form-field input`, `.form-field select`, `.form-field textarea`, `.form-field.has-error`, `.req`, `.hint`, `.err-msg`, `.form-consent`, `.form-actions`, `.form-status`, `.form-status.is-error`, `.form-status.is-ok`, `.form-bulk`, `.form-bulk.is-active`, `.form-bulk-head`, `.bulk-actions`, `.file-field`, `.file-input-wrap`, `.file-display`, `.file-name`, `.file-cta`, `.has-file`.
- **Canais**: `.channels`, `.channels-grid`, `.channels-list`, `.channel-card`, `.channel-card.is-featured`, `.channel-icon`, `.channel-body`, `.channel-action`, `.hq-card`, `.hq-head`, `.hq-pill`, `.hq-address`, `.hq-map`, `.hq-foot`.
- **Verticais**: `.verticals-grid`, `.vert-card`, `.vert-eyebrow`, `.vert-lede`, `.vert-info`, `.vert-cta`, `.btn-vert`.
- **SLA**: `.sla-bar`, `.sla-grid`, `.sla-cell`, `.sla-num`, `.sla-label`, `.sla-note`.
- **FAQ**: `.faq`, `.faq-list`, `.faq-item`, `.faq-item.is-open`, `.faq-q`, `.faq-a`.
- **LGPD**: `.lgpd`, `.lgpd-grid`, `.lgpd-cards`, `.lgpd-cell`.
- **CTA final**: `.cta-final`, `.cta-final-inner`, `.cta-final-actions`, `.eyebrow.light`.

## 8. Validação

Padrão consolidado (`memory/feedback_validacao_visual.md`):

1. `pnpm typecheck` no monorepo passa.
2. `pnpm lint` passa sem novos warnings.
3. `pnpm next dev --port 3000` levantado (NÃO `pnpm dev` — turbo não propaga logs dos sub-processos).
4. Página servida em `http://localhost:3000/contato` retorna 200.
5. **Validação visual feita pelo usuário** comparando lado a lado com `12_Pagina_Contato_v1.html` aberto no navegador. Nenhum screenshot automatizado.
6. Smoke functional checklist (validação humana):

   - **Tabs**: clicar nos 4 botões do roteador troca o form visível, com `aria-selected` correto e foco preservado. ArrowRight/ArrowLeft/Home/End navegam entre tabs.
   - **Deep-link tabs**: abrir `/contato#tab-proposta` carrega a página com a aba "Proposta" ativa e scroll posicionado na área de formulários.
   - **Vertical preset**: clicar "Solicitar proposta" no card NTC Educação leva para `#tab-proposta` e pré-seleciona "NTC Educação" no select `prop-vertical`, com flash dourado.
   - **Autofill evento**: abrir `/contato?evento=PROSUS%2B%20Bras%C3%ADlia&evento_url=https%3A%2F%2Fexemplo.com%2Fprosus#tab-equipe` preenche `eq-evento` com o título + URL combinados, popula o hidden `eq-evento-url`, e limpa a querystring (mantém o hash).
   - **Validação client-side**: submeter o form de Atendimento vazio mostra `has-error` em campos obrigatórios + mensagem de status em vermelho; corrigir e submeter mostra mensagem de sucesso e reseta o form.
   - **Email inválido**: digitar `foo@bar` em qualquer campo email e blur → `has-error`.
   - **LGPD obrigatório**: submeter form válido SEM marcar o checkbox LGPD → bloqueado, contorno vermelho no consent.
   - **Bloco bulk (Equipe)**: trocar `eq-inscritos` para "51 a 100" revela bloco de upload; voltar para "3 a 5" o esconde e limpa o estado. Upload de arquivo `.pdf` → rejeitado com mensagem. Upload de `.xlsx` válido → mostra nome + tamanho. Upload >5MB → rejeitado.
   - **FAQ accordion**: primeiro item começa aberto; clicar nos demais alterna; `aria-expanded` correto.
   - **Smooth scroll**: clicar em quicklink `Canais diretos` (`#canais-diretos`) faz scroll suave para a seção 4.
   - **Fade-in**: rolar a página → elementos com `.fade-in` ganham `.is-visible` ao entrar no viewport.
   - **Iframe Google Maps**: carrega no card de sede sem erros de console.
   - **Header/Footer**: idênticos às outras institucionais (LGPD, Política de Privacidade, etc.).

## 9. Riscos e mitigações

- **Risco**: `RoteadorFormularios` fica grande (provavelmente 600-900 linhas de TSX por causa dos 4 forms inline). **Mitigação**: organizar por seções comentadas (`/* ===== FORM A · ATENDIMENTO ===== */`). Não extrair sub-componentes por form — perde fidelidade e ganha pouca legibilidade. O protótipo trata todos os 4 forms com o mesmo handler genérico (`forms.forEach`), e a porta segue a mesma lógica.
- **Risco**: handler global de `data-vertical-preset` (`document.addEventListener('click', ...)`) pode conflitar se houver outro listener global registrado em uma sessão de navegação SPA (Next.js client-side routing). **Mitigação**: registrar o listener em `useEffect` com cleanup no unmount — Next desmonta o page ao navegar para outra rota.
- **Risco**: `dangerouslySetInnerHTML` em FAQ + asides + LGPD. Conteúdo é estático e local (sem input de usuário), então não há vetor XSS. **Mitigação**: documentar no comentário do `conteudoContato.ts` que esses campos devem manter-se estáticos.
- **Risco**: iframe Google Maps pode ser bloqueado por CSP futura. **Mitigação**: aceitar como está; o CSP é problema da Sprint G.
- **Risco**: link "Baixar modelo de planilha" aponta para `./assets/modelo-inscricao-grupo-NTC.xlsx` que não existe. **Mitigação**: manter href literal com TODO; o clique vai dar 404 até alguém hospedar o XLSX em `apps/web/public/assets/`.
- **Risco**: textos com `<strong>`/`<em>`/`<br>` dentro de strings exigem `dangerouslySetInnerHTML`. Sair sem render literal degrada a fidelidade. **Mitigação**: lista explícita de campos que usam: hero accent (via JSX `<span>`, não dangerouslySetInnerHTML), `aside.descricaoHtml`, `aside.bullets[]`, `aside.rodapeHtml`, `channel.notas` (não — são texto puro), `hq.enderecoHtml`, `vertical.canaisHtml`, `sla.horarios.*Html`, `faq.perguntaHtml` (não — pergunta é texto puro; deixar como string), `faq.respostaHtml`, `lgpd.paragrafosHtml[]`, `lgpd.cells[].textoHtml`, `cta.tituloHtml`. Revisar cada um durante a implementação.

## 10. Fora de escopo

- **Submit real dos forms** (`fetch` para `/api/contato/*`) — endpoints não existem; backend de contato fica para sessão futura com integração de e-mail (Resend) + persistência no Payload (coleção `Lead`).
- **hCaptcha** — `HCAPTCHA_SITE_KEY` e `HCAPTCHA_SECRET` precisam estar configurados; entra junto com o backend.
- **Analytics (`track()` / dataLayer)** — projeto ainda não tem GTM/dataLayer configurado.
- **Arquivo XLSX modelo** (`modelo-inscricao-grupo-NTC.xlsx`) — precisa ser produzido pela equipe e hospedado em `apps/web/public/assets/`.
- **Rotas das verticais** (`/educacao`, `/gestao-publica`, `/saude`) — não portadas ainda; hrefs ficam literais com TODO.
- **Rota `/agenda`** — idem.
- **Cookie consent** (`./assets/cookie_consent.js`) — já é tratado em outro lugar do app; não duplicar.
- **Tradução do mega menu/drawer mobile do header** — já vive em `HeaderHome` compartilhado.

## 11. Próximos passos após aprovação

1. Plano de implementação detalhado (skill `superpowers:writing-plans`).
2. Implementação em commits pequenos (CSS → conteúdo + página estática → `FaqAccordion` + `EfeitosContato` → `RoteadorFormularios` → validação).
3. Typecheck + lint + dev server.
4. Checkpoint visual humano.
5. Commit final + atualização de memória se surgirem aprendizados novos.
