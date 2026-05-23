# Página Contato Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portar literalmente o protótipo `12_Pagina_Contato_v1.html` (2.788 linhas) para a rota `/contato` no route group `(institucional)` do app Next.js, preservando 100% do visual, interatividade e textos.

**Architecture:** Estratégia "porta do HTML" consolidada no projeto: CSS literal extraído para `apps/web/app/contato-prototipo.css` (importado no root layout), `page.tsx` server component renderiza JSX literal das 9 seções do `<main>`, `conteudoContato.ts` armazena textos e dados estáticos (tipos + arrays), 3 client components cuidam da interatividade (`RoteadorFormularios` para tabs + 4 forms + bulk + autofill, `FaqAccordion`, `EfeitosContato` para fade-in + smooth scroll). Header/Footer vêm do `(institucional)/layout.tsx` existente (reusa `HeaderHome`/`FooterHome` do route group `(home)`). Submit real, hCaptcha e analytics ficam fora — stub do protótipo preservado com TODOs.

**Tech Stack:** Next.js 15 App Router, React Server Components + Client Components ("use client"), TypeScript strict, CSS literal sem Tailwind para classes do protótipo, pnpm/turbo monorepo.

---

## Arquivos a criar/modificar

**Criar:**
- `apps/web/app/contato-prototipo.css` — CSS literal (~940 linhas) do bloco `<style>` (HTML linhas 140-1079) com `url('./img/...')` → `url('/img/...')`.
- `apps/web/app/(institucional)/contato/page.tsx` — server component, `revalidate = 3600`, JSX literal das 9 seções do `<main>`.
- `apps/web/app/(institucional)/contato/conteudoContato.ts` — tipos + arrays/objetos estáticos (textos, opções de selects, FAQs, canais, verticais, SLAs, LGPD, CTA).
- `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx` — client component: tabs (4) + painéis (4) + validação + bloco bulk + autofill `?evento=`.
- `apps/web/app/(institucional)/contato/FaqAccordion.tsx` — client component: 8 itens com `aria-expanded`.
- `apps/web/app/(institucional)/contato/EfeitosContato.tsx` — client component sem render: IntersectionObserver `.fade-in` + smooth scroll `<a href^="#">:not([href^="#tab-"])`.

**Modificar:**
- `apps/web/app/layout.tsx` — adicionar `import "./contato-prototipo.css"` ao lado dos outros CSSs de protótipo.

**Não tocar (referência):**
- `apps/web/app/(institucional)/layout.tsx` — já reusa `HeaderHome`/`FooterHome`.
- `apps/web/app/(home)/HeaderHome.tsx`, `apps/web/app/(home)/FooterHome.tsx` — header/footer compartilhados.

---

## Task 1: Extrair CSS literal do protótipo para `contato-prototipo.css`

**Files:**
- Create: `apps/web/app/contato-prototipo.css`

- [ ] **Step 1: Extrair as linhas 141-1078 do HTML (conteúdo entre `<style>` e `</style>`)**

Comando:

```bash
sed -n '141,1078p' /Users/joao/Documents/portal-ntc/12_Pagina_Contato_v1.html > /Users/joao/Documents/portal-ntc/apps/web/app/contato-prototipo.css
```

Expected: arquivo de aproximadamente 938 linhas criado.

- [ ] **Step 2: Verificar tamanho do arquivo**

Comando:

```bash
wc -l /Users/joao/Documents/portal-ntc/apps/web/app/contato-prototipo.css
```

Expected: `938 /Users/joao/Documents/portal-ntc/apps/web/app/contato-prototipo.css` (ou número próximo).

- [ ] **Step 3: Converter `url('./img/...')` para `url('/img/...')`**

Usar `Edit` no arquivo `apps/web/app/contato-prototipo.css`. Há 1 ocorrência (linha equivalente à HTML 437):

old_string:
```
  background-image: url('./img/fotos/_optimized/hero-contato-escritorio-institucional.1920.webp');
```

new_string:
```
  background-image: url('/img/fotos/_optimized/hero-contato-escritorio-institucional.1920.webp');
```

- [ ] **Step 4: Verificar que não restam `url('./` no arquivo**

Comando:

```bash
grep -n "url('\./" /Users/joao/Documents/portal-ntc/apps/web/app/contato-prototipo.css
```

Expected: nenhuma saída (exit code 1).

- [ ] **Step 5: Verificar que a imagem do hero existe em `public/`**

Comando:

```bash
ls /Users/joao/Documents/portal-ntc/apps/web/public/img/fotos/_optimized/hero-contato-escritorio-institucional.1920.webp
```

Expected: arquivo listado (já existe no repo).

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/contato-prototipo.css
git commit -m "$(cat <<'EOF'
feat(contato): extrai CSS literal do protótipo 12 para contato-prototipo.css

Bloco <style> de 12_Pagina_Contato_v1.html (linhas 141-1078) copiado
sem adaptação, com url('./img/...') convertido para url('/img/...').

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Importar `contato-prototipo.css` no root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Adicionar o import abaixo do bloco de imports CSS existente**

Edit em `apps/web/app/layout.tsx`:

old_string:
```
// CSS das 5 páginas institucionais (/politica-de-privacidade,
// /termos-de-uso, /politica-de-cookies, /lgpd, /mapa-do-site).
// Portado literal de 30_Pagina_Privacidade_v1.html (linhas 51-345).
// Os 5 HTMLs institucionais compartilham o MESMO <style> — diff
// byte-a-byte confirmou. Tokens base e regras de header/footer/btn
// já vêm de home-prototipo.css.
import "./institucional-prototipo.css";
```

new_string:
```
// CSS das 5 páginas institucionais (/politica-de-privacidade,
// /termos-de-uso, /politica-de-cookies, /lgpd, /mapa-do-site).
// Portado literal de 30_Pagina_Privacidade_v1.html (linhas 51-345).
// Os 5 HTMLs institucionais compartilham o MESMO <style> — diff
// byte-a-byte confirmou. Tokens base e regras de header/footer/btn
// já vêm de home-prototipo.css.
import "./institucional-prototipo.css";
// CSS da página /contato (portada literal de 12_Pagina_Contato_v1.html,
// linhas 141-1078). Classes específicas: .hero-page, .router,
// .router-tab, .form-panel, .form-shell, .form-aside, .form-grid,
// .form-field, .form-bulk, .file-field, .channels, .channel-card,
// .hq-card, .vert-card, .sla-bar, .sla-cell, .faq, .faq-item,
// .lgpd, .lgpd-cell, .cta-final, .cta-final-inner. Tokens base e
// regras de header/footer/btn já vêm de home-prototipo.css.
import "./contato-prototipo.css";
```

- [ ] **Step 2: Rodar typecheck para confirmar que nada quebrou**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "$(cat <<'EOF'
feat(contato): importa contato-prototipo.css no root layout

Adiciona o CSS portado da página /contato à lista de stylesheets de
protótipos importados pelo root layout do app web.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Criar `conteudoContato.ts` — tipos e dados editoriais

**Files:**
- Create: `apps/web/app/(institucional)/contato/conteudoContato.ts`

- [ ] **Step 1: Criar o arquivo com todos os tipos e exports**

Conteúdo completo do arquivo (todas as strings copiadas literalmente do HTML — não rephrasing):

```ts
/**
 * Conteúdo editorial da página /contato.
 *
 * Porta literal de 12_Pagina_Contato_v1.html. Não rephrasing — qualquer
 * mudança de copy deve passar pela equipe editorial.
 *
 * Campos com sufixo "Html" contêm tags inline (<strong>, <em>, <br>, <a>)
 * e devem ser renderizados com dangerouslySetInnerHTML.
 */

/* ============================================================
 * HERO
 * ============================================================ */

export const HERO = {
  breadcrumbHomeLabel: "Grupo NTC",
  breadcrumbHomeHref: "/",
  breadcrumbCurrent: "Contato",
  eyebrow: "Canais institucionais · Atendimento dedicado",
  tituloAntes: "Fale com quem ",
  tituloAccent: "decide",
  tituloDepois: " os rumos da formação institucional.",
  lede:
    "Atendimento humano, institucional e direcionado à natureza da sua demanda. Escolha o canal mais adequado para proposta institucional, inscrição de equipes ou grupos institucionais, imprensa ou atendimento geral — nossa equipe retorna em horário comercial.",
  quicklinks: [
    { href: "#tab-atendimento", label: "Atendimento geral", cmsLink: "rota-atendimento-geral" },
    { href: "#tab-proposta", label: "Proposta institucional", cmsLink: "rota-proposta-institucional" },
    { href: "#tab-equipe", label: "Equipe ou grupo institucional", cmsLink: "rota-inscricao-equipe" },
    { href: "#tab-imprensa", label: "Imprensa", cmsLink: "rota-imprensa" },
    { href: "#canais-diretos", label: "Canais diretos", cmsLink: "rota-canais-diretos" },
  ] as const,
};

/* ============================================================
 * ROTEADOR — TABS
 * ============================================================ */

export type TabId = "atendimento" | "proposta" | "equipe" | "imprensa";

export interface TabConfig {
  id: TabId;
  numero: string;
  titulo: string;
  descricao: string;
  ctaFooter: string;
  cmsLink: string;
}

export const TABS: readonly TabConfig[] = [
  {
    id: "atendimento",
    numero: "01 · Geral",
    titulo: "Atendimento geral",
    descricao: "Dúvidas, sugestões, parcerias e articulação institucional.",
    ctaFooter: "Falar com a NTC",
    cmsLink: "rota-atendimento-geral",
  },
  {
    id: "proposta",
    numero: "02 · Proposta",
    titulo: "Contratar formação",
    descricao:
      "Programas in company, turmas fechadas e soluções sob medida para órgãos e instituições.",
    ctaFooter: "Solicitar proposta",
    cmsLink: "rota-proposta-institucional",
  },
  {
    id: "equipe",
    numero: "03 · Equipe ou grupo",
    titulo: "Inscrever equipe ou grupo institucional",
    descricao:
      "De 3 participantes a inscrições em lote acima de mil, com faturamento institucional.",
    ctaFooter: "Inscrição em grupo",
    cmsLink: "rota-inscricao-equipe",
  },
  {
    id: "imprensa",
    numero: "04 · Imprensa",
    titulo: "Imprensa e parcerias",
    descricao:
      "Jornalistas, assessorias e entidades parceiras com demandas editoriais e de pauta.",
    ctaFooter: "Falar com a AssCom",
    cmsLink: "rota-imprensa",
  },
] as const;

/* ============================================================
 * FORMS — ASIDES
 * O markup dos forms (fields) fica inline no RoteadorFormularios.tsx
 * porque cada um tem layout próprio. Aqui só os textos do aside.
 * ============================================================ */

export interface FormAsideConfig {
  tab: TabId;
  formId: string;
  cmsLink: string;
  endpoint: string;
  aside: {
    eyebrow: string;
    titulo: string;
    descricaoHtml: string;
    bulletsHtml: readonly string[];
    rodapeHtml: string;
  };
}

export const FORMS_ASIDES: readonly FormAsideConfig[] = [
  {
    tab: "atendimento",
    formId: "form-contato-atendimento",
    cmsLink: "submit-atendimento-geral",
    endpoint: "/api/contato/atendimento",
    aside: {
      eyebrow: "Canal · Atendimento geral",
      titulo: "Fale com a NTC",
      descricaoHtml:
        "Canal aberto para dúvidas, sugestões, parcerias e qualquer demanda que não se encaixe nos canais especializados.",
      bulletsHtml: [
        "Retorno em até <strong>1 dia útil</strong>",
        "Atendimento humano direcionado",
        "Encaminhamento interno conforme o tema",
        "Confidencialidade institucional",
      ],
      rodapeHtml: "Prefere e-mail? <strong>contato@institutontc.com.br</strong>",
    },
  },
  {
    tab: "proposta",
    formId: "form-contato-proposta",
    cmsLink: "submit-proposta-institucional",
    endpoint: "/api/contato/proposta",
    aside: {
      eyebrow: "Canal · Proposta institucional",
      titulo: "Contratar formação para a sua instituição",
      descricaoHtml:
        "Para órgãos públicos, redes de ensino, sistemas de saúde e organizações que buscam programas <strong>in company</strong>, turmas fechadas, soluções sob medida ou trilhas estruturadas.",
      bulletsHtml: [
        "Diagnóstico institucional inicial",
        "Proposta técnica e comercial em até 5 dias úteis",
        "Documentação para Lei 14.133, dispensa e convênios",
        "Coordenação científica dedicada por vertical",
        "Faturamento por empenho, NF, convênio ou pactuação",
      ],
      rodapeHtml: "Atendimento comercial · <strong>(63) 3212-1199</strong>",
    },
  },
  {
    tab: "equipe",
    formId: "form-contato-equipe",
    cmsLink: "submit-inscricao-equipe",
    endpoint: "/api/contato/equipe",
    aside: {
      eyebrow: "Canal · Equipe ou grupo institucional",
      titulo: "Inscrever equipe ou grupo institucional",
      descricaoHtml:
        "Atendimento único para inscrições coletivas — de equipes pequenas a partir de <strong>3 participantes</strong> até inscrições em lote acima de mil participantes, com faturamento institucional.",
      bulletsHtml: [
        "Condições especiais a partir de 3 inscrições",
        "Faturamento por empenho, NF, convênio ou centralizado",
        "Reserva de vagas garantida em até 48h",
        "Coordenação dedicada para cadastros e certificação",
        "Inscrição em lote por planilha (acima de 50 participantes)",
        "Material de divulgação interna sob demanda",
      ],
      // TODO: rota /agenda ainda não criada — manter href literal do protótipo
      rodapeHtml:
        "Inscrições individuais? Acesse a <strong><a href=\"./09_Pagina_Agenda_v2.html\" style=\"color: var(--dourado-soft);\">Agenda Geral NTC →</a></strong>",
    },
  },
  {
    tab: "imprensa",
    formId: "form-contato-imprensa",
    cmsLink: "submit-imprensa",
    endpoint: "/api/contato/imprensa",
    aside: {
      eyebrow: "Canal · Imprensa e relações institucionais",
      titulo: "Pautas, entrevistas e parcerias editoriais",
      descricaoHtml:
        "Canal dedicado a jornalistas, veículos, assessorias e entidades parceiras. Acesso a porta-vozes, especialistas das três verticais, dados consolidados e materiais editoriais.",
      bulletsHtml: [
        "Retorno em até <strong>4 horas úteis</strong>",
        "Coordenação científica e porta-vozes oficiais",
        "Releases, banco de imagens e logos",
        "Dados consolidados das três verticais",
        "Sala de imprensa por solicitação",
      ],
      rodapeHtml: "Apoio direto · <strong>imprensa@institutontc.com.br</strong>",
    },
  },
] as const;

/* ============================================================
 * SELECT OPTIONS
 * ============================================================ */

export interface SelectOption {
  value: string;
  label: string;
}

export const OPTIONS_ASSUNTO_ATENDIMENTO: readonly SelectOption[] = [
  { value: "duvida-geral", label: "Dúvida geral sobre o Grupo NTC" },
  { value: "parceria", label: "Proposta de parceria institucional" },
  { value: "sugestao", label: "Sugestão editorial ou de pauta" },
  { value: "articulacao", label: "Articulação com a coordenação" },
  { value: "participante", label: "Suporte a participante (acesso · certificado · replay)" },
  { value: "outros", label: "Outros" },
];

export const OPTIONS_NATUREZA_JURIDICA: readonly SelectOption[] = [
  { value: "municipal", label: "Poder público municipal" },
  { value: "estadual", label: "Poder público estadual" },
  { value: "federal", label: "Poder público federal" },
  { value: "judiciario", label: "Poder Judiciário" },
  { value: "legislativo", label: "Poder Legislativo / Tribunais de Contas" },
  { value: "autarquia", label: "Autarquia · Fundação · Empresa pública" },
  { value: "terceiro-setor", label: "Terceiro setor · OS · OSC" },
  { value: "privada", label: "Iniciativa privada" },
  { value: "outros", label: "Outros" },
];

export const OPTIONS_VERTICAL_PROP: readonly SelectOption[] = [
  { value: "educacao", label: "NTC Educação · 9 programas" },
  { value: "gestao-publica", label: "NTC Gestão Pública · 3 programas" },
  { value: "saude", label: "NTC Saúde · 3 programas" },
  { value: "multivertical", label: "Trilha multivertical · combinação" },
  { value: "indefinido", label: "Ainda em definição" },
];

export interface OptgroupConfig {
  grupo: string;
  opcoes: readonly SelectOption[];
}

export const OPTIONS_PROGRAMA_PROP: readonly OptgroupConfig[] = [
  {
    grupo: "NTC Educação",
    opcoes: [
      { value: "EDUTEC", label: "EDUTEC — Educação digital, inovação e tecnologias" },
      { value: "PEAR", label: "PEAR — Alfabetização e recomposição" },
      { value: "PEI", label: "PEI — Educação integral" },
      { value: "PROGE", label: "PROGE — Gestão escolar e coordenação pedagógica" },
      { value: "PROGIR", label: "PROGIR — Inclusão com resultado" },
      { value: "EGIDE", label: "EGIDE — IA, dados e governança digital" },
      { value: "VIVAESCOLA", label: "VIVAESCOLA — Convivência e proteção integral" },
      { value: "PINEI", label: "PINEI — Primeira infância" },
      { value: "FUTURA", label: "FUTURA — Ensino médio" },
    ],
  },
  {
    grupo: "NTC Gestão Pública",
    opcoes: [
      { value: "AGIP", label: "AGIP — Contratações públicas" },
      { value: "LIDERA", label: "LIDERA — Liderança e direção estratégica" },
      { value: "SIGA", label: "SIGA — Governança e administração" },
    ],
  },
  {
    grupo: "NTC Saúde",
    opcoes: [
      { value: "SIGS", label: "SIGS — Governança digital e IA do SUS" },
      { value: "PROAPS", label: "PROAPS+ — Atenção primária" },
      { value: "PROSUS", label: "PROSUS+ — Governança e financiamento do SUS" },
    ],
  },
];

export const OPTION_PROGRAMA_CUSTOMIZADO: SelectOption = {
  value: "customizado",
  label: "Solução totalmente customizada",
};

export const OPTIONS_MODALIDADE: readonly SelectOption[] = [
  { value: "incompany-presencial", label: "In company presencial" },
  { value: "incompany-online", label: "In company online" },
  { value: "incompany-hibrido", label: "In company híbrido" },
  { value: "turma-fechada", label: "Turma fechada" },
  { value: "sob-medida", label: "Solução sob medida" },
  { value: "trilha", label: "Trilha / jornada formativa" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_PARTICIPANTES: readonly SelectOption[] = [
  { value: "ate-25", label: "Até 25" },
  { value: "26-50", label: "26 a 50" },
  { value: "51-100", label: "51 a 100" },
  { value: "101-200", label: "101 a 200" },
  { value: "201-500", label: "201 a 500" },
  { value: "500+", label: "Acima de 500" },
];

export const OPTIONS_PRAZO: readonly SelectOption[] = [
  { value: "ate-30", label: "Até 30 dias" },
  { value: "2-3-meses", label: "2 a 3 meses" },
  { value: "4-6-meses", label: "4 a 6 meses" },
  { value: "semestre", label: "Próximo semestre" },
  { value: "ano", label: "Próximo ano fiscal" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_ORCAMENTO: readonly SelectOption[] = [
  { value: "ate-50k", label: "Até R$ 50 mil" },
  { value: "50-150k", label: "R$ 50 mil a R$ 150 mil" },
  { value: "150-500k", label: "R$ 150 mil a R$ 500 mil" },
  { value: "500k-1m", label: "R$ 500 mil a R$ 1 milhão" },
  { value: "1m+", label: "Acima de R$ 1 milhão" },
  { value: "depende", label: "Depende da proposta" },
];

export const OPTIONS_INSCRITOS_EQUIPE: readonly SelectOption[] = [
  { value: "3-5", label: "3 a 5 participantes" },
  { value: "6-10", label: "6 a 10 participantes" },
  { value: "11-20", label: "11 a 20 participantes" },
  { value: "21-50", label: "21 a 50 participantes" },
  { value: "51-100", label: "51 a 100 participantes" },
  { value: "101-500", label: "101 a 500 participantes" },
  { value: "501-1000", label: "501 a 1.000 participantes" },
  { value: "acima-1000", label: "Acima de 1.000 participantes" },
];

/** Valores de OPTIONS_INSCRITOS_EQUIPE que ativam o bloco de inscrição em lote. */
export const BULK_INSCRITOS_RANGES: ReadonlySet<string> = new Set([
  "51-100",
  "101-500",
  "501-1000",
  "acima-1000",
]);

export const OPTIONS_FATURAMENTO: readonly SelectOption[] = [
  { value: "empenho", label: "Empenho (órgão público)" },
  { value: "nf-centralizada", label: "Nota fiscal centralizada (instituição privada)" },
  { value: "boleto-institucional", label: "Boleto institucional" },
  { value: "pagamento-individual", label: "Pagamento individual com indicação coletiva" },
  { value: "indefinido", label: "Ainda em definição" },
];

export const OPTIONS_TIPO_IMPRENSA: readonly SelectOption[] = [
  { value: "entrevista", label: "Entrevista com porta-voz / coordenação" },
  { value: "especialista", label: "Indicação de especialista por área" },
  { value: "dados", label: "Dados consolidados / estatísticas" },
  { value: "release", label: "Solicitação de release / material editorial" },
  { value: "imagens", label: "Banco de imagens e logos" },
  { value: "parceria", label: "Parceria de mídia / cobertura conjunta" },
  { value: "outros", label: "Outros" },
];

/* ============================================================
 * CANAIS DIRETOS + SEDE
 * ============================================================ */

export interface ChannelCard {
  data: string;
  destaque: boolean;
  iconeChar: string;
  label: string;
  valor: string;
  nota: string;
  acaoHref: string;
  acaoTexto: string;
  acaoCmsLink: string;
  acaoTarget?: "_blank";
  acaoCrimson?: boolean;
}

export const CHANNELS: readonly ChannelCard[] = [
  {
    data: "email",
    destaque: false,
    iconeChar: "@",
    label: "E-mail institucional",
    valor: "contato@institutontc.com.br",
    nota: "Atendimento geral · resposta em até 1 dia útil",
    acaoHref: "mailto:contato@institutontc.com.br",
    acaoTexto: "Enviar",
    acaoCmsLink: "mailto-contato",
  },
  {
    data: "comercial",
    destaque: true,
    iconeChar: "☎",
    label: "Atendimento comercial",
    valor: "(63) 3212-1199",
    nota: "Propostas institucionais e contratação por órgão público",
    acaoHref: "tel:+556332121199",
    acaoTexto: "Ligar",
    acaoCmsLink: "tel-comercial",
  },
  {
    data: "whatsapp",
    destaque: true,
    iconeChar: "W",
    label: "WhatsApp comercial",
    valor: "(63) 98444-4040",
    nota: "Mensagens · seg–sex · 8h às 18h",
    acaoHref: "https://wa.me/5563984444040",
    acaoTexto: "Conversar",
    acaoCmsLink: "whatsapp-comercial",
    acaoTarget: "_blank",
  },
  {
    data: "imprensa",
    destaque: false,
    iconeChar: "¶",
    label: "Imprensa e AssCom",
    valor: "imprensa@institutontc.com.br",
    nota: "Pauta · entrevista · dados consolidados",
    acaoHref: "mailto:imprensa@institutontc.com.br",
    acaoTexto: "Falar com AssCom",
    acaoCmsLink: "mailto-imprensa",
    acaoCrimson: true,
  },
  {
    data: "suporte",
    destaque: false,
    iconeChar: "⚙",
    label: "Suporte EventOn (participante)",
    valor: "suporte@eventon.institutontc.com.br",
    nota: "Acesso · certificado · replay · materiais",
    acaoHref: "mailto:suporte@eventon.institutontc.com.br",
    acaoTexto: "Acionar suporte",
    acaoCmsLink: "mailto-suporte",
  },
];

export const HQ = {
  cidade: "Brasília · DF",
  enderecoHtml:
    "<strong>Instituto NTC do Brasil</strong><br>SCS Quadra 9, Bloco C — Ed. Parque Cidade Corporate, Sala 1001<br>Asa Sul · CEP 70308-200 · Brasília – DF<br>(63) 3212-1199 · contato@institutontc.com.br",
  mapaIframeSrc:
    "https://www.google.com/maps?q=Setor%20Comercial%20Sul%2C%20Quadra%209%2C%20Bloco%20C%2C%20Ed.%20Parque%20Cidade%20Corporate%2C%20Bras%C3%ADlia%20-%20DF&output=embed",
  mapaIframeTitle: "Localização da sede do Instituto NTC do Brasil em Brasília — DF",
  mapsBotaoHref:
    "https://www.google.com/maps/search/?api=1&query=SCS+Quadra+9+Bloco+C+Ed+Parque+Cidade+Corporate+Asa+Sul+Brasília",
};

/* ============================================================
 * VERTICAIS (seção 5)
 * ============================================================ */

export interface VerticalCard {
  vertical: "educacao" | "gestao-publica" | "saude";
  eyebrow: string;
  titulo: string;
  lede: string;
  programas: string;
  canaisHtml: string;
  /** TODO: rotas das verticais não portadas — manter href do protótipo */
  conhecerHref: string;
  conhecerCmsLink: string;
  propostaCmsLink: string;
}

export const VERTICAIS: readonly VerticalCard[] = [
  {
    vertical: "educacao",
    eyebrow: "NTC Educação",
    titulo: "Coordenação NTC Educação",
    lede:
      "Secretarias de Educação, redes municipais e estaduais, escolas e fundações — alfabetização, gestão escolar, educação digital, inclusão e ensino integral.",
    programas: "EDUTEC · PEAR · PEI · PROGE · PROGIR · EGIDE · VIVAESCOLA · PINEI · FUTURA",
    canaisHtml: "educacao@institutontc.com.br<br>(63) 3212-1199 · opção 1",
    // TODO: rota /educacao (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_Educacao_v1.html",
    conhecerCmsLink: "vertical-edu",
    propostaCmsLink: "proposta-edu",
  },
  {
    vertical: "gestao-publica",
    eyebrow: "NTC Gestão Pública",
    titulo: "Coordenação NTC Gestão Pública",
    lede:
      "Executivo, Judiciário, Legislativo, Tribunais de Contas e estatais — contratações públicas, governança, integridade e liderança institucional.",
    programas: "AGIP · LIDERA · SIGA",
    canaisHtml: "gestaopublica@institutontc.com.br<br>(63) 3212-1199 · opção 2",
    // TODO: rota /gestao-publica (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_GestaoPublica_v1.html",
    conhecerCmsLink: "vertical-gov",
    propostaCmsLink: "proposta-gov",
  },
  {
    vertical: "saude",
    eyebrow: "NTC Saúde",
    titulo: "Coordenação NTC Saúde",
    lede:
      "Secretarias de Saúde, hospitais públicos, redes do SUS e consórcios — atenção primária, governança digital, financiamento e gestão integrada.",
    programas: "SIGS · PROAPS+ · PROSUS+",
    canaisHtml: "saude@institutontc.com.br<br>(63) 3212-1199 · opção 3",
    // TODO: rota /saude (vertical) ainda não criada
    conhecerHref: "./07_Pagina_Vertical_NTC_Saude_v1.html",
    conhecerCmsLink: "vertical-sau",
    propostaCmsLink: "proposta-sau",
  },
];

/* ============================================================
 * SLA BAR (seção 6)
 * ============================================================ */

export interface SlaCell {
  numero: string;
  label: string;
  nota: string;
}

export const SLAS: readonly SlaCell[] = [
  {
    numero: "1 dia útil",
    label: "Atendimento geral",
    nota:
      "Resposta inicial em horário comercial para qualquer mensagem enviada pelos canais oficiais.",
  },
  {
    numero: "5 dias úteis",
    label: "Proposta institucional",
    nota: "Diagnóstico inicial e envio da proposta técnica e comercial estruturada.",
  },
  {
    numero: "48 horas",
    label: "Inscrição em grupo",
    nota: "Reserva de vagas, termo de contratação e orientação sobre faturamento.",
  },
  {
    numero: "4 horas úteis",
    label: "Imprensa",
    nota: "Retorno prioritário para deadlines editoriais, com indicação de porta-voz.",
  },
];

export const SLA_HORARIOS = {
  comercialHtml:
    "<strong style=\"color: var(--dourado-soft);\">Horário comercial:</strong> segunda a sexta · 8h às 18h (horário de Brasília)",
  suporteHtml:
    "<strong style=\"color: var(--dourado-soft);\">Suporte EventOn:</strong> seg–sex · 8h–20h · sáb 8h–13h (durante eventos ao vivo)",
};

/* ============================================================
 * FAQ (seção 7)
 * ============================================================ */

export interface FaqItem {
  id: string;
  pergunta: string;
  respostaHtml: string;
  abertaPorDefault?: boolean;
}

export const FAQS: readonly FaqItem[] = [
  {
    id: "faq-prazo-proposta",
    pergunta: "Qual é o prazo para receber uma proposta institucional?",
    respostaHtml:
      "Até <strong>5 dias úteis</strong> após o envio do formulário de proposta. Em demandas urgentes vinculadas a ciclo orçamentário ou agenda de governo, o prazo pode ser antecipado mediante contato comercial direto.",
    abertaPorDefault: true,
  },
  {
    id: "faq-lei-14133",
    pergunta:
      "O Grupo NTC atende contratação por dispensa, inexigibilidade ou Lei 14.133?",
    respostaHtml:
      "Sim. Emitimos a documentação necessária para contratações por <strong>Lei 14.133/2021</strong> (dispensa, inexigibilidade, pregão, credenciamento), adesão a atas de registro de preços, convênios e pactuação interfederativa no SUS. Atendemos os três Poderes, Tribunais de Contas, autarquias, estatais e fundações públicas.",
  },
  {
    id: "faq-equipes-pequenas",
    pergunta: "É possível inscrever equipes pequenas com condições especiais?",
    respostaHtml:
      "Sim. A partir de <strong>3 inscrições</strong>, sua instituição já acessa o canal de Inscrição em Grupo, com condição comercial diferenciada, faturamento institucional (empenho, NF ou boleto) e reserva de vagas garantida em até 48 horas.",
  },
  {
    id: "faq-formatos",
    pergunta: "Quais formatos de capacitação estão disponíveis?",
    respostaHtml:
      "Cinco formatos: <strong>in company</strong> (presencial, online ou híbrido), <strong>turma fechada</strong>, <strong>solução sob medida</strong>, <strong>trilhas e jornadas</strong> e <strong>contratação institucional integrada</strong> — combinação de múltiplas frentes para órgãos públicos.",
  },
  {
    id: "faq-certificado",
    pergunta: "O participante recebe certificado? Qual a validade?",
    respostaHtml:
      "Sim. Cada participante recebe certificado do Instituto NTC do Brasil com carga horária, código único e QR code de autenticação. Os certificados têm validade nacional e podem ser usados em progressão funcional, editais e RH institucional. Emissão em até 5 dias úteis após a conclusão.",
  },
  {
    id: "faq-replay",
    pergunta: "Como funciona o acesso ao replay e aos materiais de apoio?",
    respostaHtml:
      "Replay disponível na <strong>Área do Participante (EventOn)</strong> em até 48 horas após o evento. Acesso por 90 dias (ou prazo definido por evento) a replay, slides, ementa e bibliografia. Em contratações in company, os prazos são acordados em contrato.",
  },
  {
    id: "faq-reuniao",
    pergunta: "Posso solicitar uma reunião antes de enviar a proposta?",
    respostaHtml:
      "Sim. Podemos agendar reunião presencial na sede em Brasília, virtual ou na sede da sua instituição. Use o canal de <a href=\"#tab-proposta\">Proposta institucional</a> indicando \"Solicito reunião prévia\" no campo de contexto, ou acione diretamente o (63) 3212-1199.",
  },
  {
    id: "faq-dados",
    pergunta: "Como meus dados pessoais e institucionais são tratados?",
    respostaHtml:
      "O tratamento segue a Lei Geral de Proteção de Dados (LGPD · Lei 13.709/2018). Coletamos apenas o necessário para atender sua solicitação, sob base legal definida, e não compartilhamos com terceiros para fins comerciais. Para exercer seus direitos como titular, escreva ao nosso DPO em <strong>dpo@institutontc.com.br</strong>.",
  },
];

/* ============================================================
 * LGPD (seção 8)
 * ============================================================ */

export const LGPD = {
  eyebrow: "Tratamento de dados · LGPD",
  titulo:
    "Seus dados são tratados com a mesma seriedade do nosso compromisso institucional.",
  paragrafosHtml: [
    "O Instituto NTC do Brasil é controlador dos dados pessoais coletados nos formulários institucionais desta página. O tratamento segue a Lei Geral de Proteção de Dados (Lei 13.709/2018) e princípios de finalidade, adequação, necessidade, transparência, segurança e responsabilização.",
    "Para exercer seus direitos como titular (acesso, correção, anonimização, portabilidade, eliminação), acione nosso encarregado de proteção de dados pelo e-mail <strong style=\"color: var(--dourado-soft);\">dpo@institutontc.com.br</strong>.",
  ],
  ctaPrivacidadeHref: "/politica-de-privacidade",
  ctaPrivacidadeTexto: "Política de Privacidade completa",
  cells: [
    {
      titulo: "Finalidade",
      texto:
        "Atendimento da demanda institucional informada, elaboração de proposta comercial, processamento de inscrição ou resposta editorial.",
    },
    {
      titulo: "Base legal",
      texto:
        "Procedimentos preliminares ao contrato (art. 7º, V), legítimo interesse institucional (art. 7º, IX) ou consentimento expresso (art. 7º, I), conforme o canal.",
    },
    {
      titulo: "Retenção",
      texto:
        "Período proporcional ao ciclo de relacionamento institucional, com revisão periódica e descarte após o cumprimento da finalidade.",
    },
    {
      titulo: "Compartilhamento",
      texto:
        "Não há compartilhamento com terceiros para fins comerciais. Apenas com prestadores essenciais (e-mail, hospedagem) sob contrato de confidencialidade.",
    },
  ],
};

/* ============================================================
 * CTA FINAL (seção 9)
 * ============================================================ */

export interface CtaFinalAction {
  href: string;
  texto: string;
  variant: "gold" | "ghost-light";
  cmsLink: string;
  comArrow: boolean;
}

export const CTA_FINAL = {
  eyebrow: "Pronto para começar?",
  tituloHtml:
    "Vamos transformar a formação da sua instituição em <em>impacto institucional real</em>.",
  paragrafo:
    "Use o canal mais adequado à sua demanda — a equipe do Instituto NTC do Brasil retorna em horário comercial com a coordenação técnica e comercial dedicada à sua vertical.",
  acoes: [
    {
      href: "#tab-proposta",
      texto: "Solicitar proposta institucional",
      variant: "gold" as const,
      cmsLink: "cta-final-proposta",
      comArrow: true,
    },
    {
      href: "#tab-equipe",
      texto: "Inscrever minha equipe",
      variant: "ghost-light" as const,
      cmsLink: "cta-final-equipe",
      comArrow: false,
    },
    {
      href: "mailto:contato@institutontc.com.br",
      texto: "Escrever para contato@institutontc.com.br",
      variant: "ghost-light" as const,
      cmsLink: "cta-final-email",
      comArrow: false,
    },
  ] satisfies CtaFinalAction[],
};
```

- [ ] **Step 2: Rodar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/conteudoContato.ts
git commit -m "$(cat <<'EOF'
feat(contato): adiciona conteudoContato.ts com textos e dados editoriais

Tipos e arrays estáticos para hero, tabs, asides dos 4 forms, options
dos selects, canais diretos, sede, verticais, SLA, FAQ, LGPD e CTA
final. Textos copiados literalmente do protótipo (sem rephrasing).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Criar `EfeitosContato.tsx` (client, IntersectionObserver + smooth scroll)

**Files:**
- Create: `apps/web/app/(institucional)/contato/EfeitosContato.tsx`

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo:

```tsx
"use client";

import { useEffect } from "react";

/**
 * Efeitos visuais da página /contato (porta dos blocos 6 e 7 do
 * script de 12_Pagina_Contato_v1.html).
 *
 * - IntersectionObserver para revelar elementos com classe `.fade-in`
 *   ao entrar no viewport (threshold 0.08, margem inferior -8%).
 * - Smooth scroll para anchors `<a href^="#">` exceto `#tab-*` (esses
 *   são tratados pelo RoteadorFormularios). Subtrai 88px do header
 *   fixo.
 *
 * Sem render — apenas side effects. Montado uma vez no page.tsx.
 */
export function EfeitosContato() {
  useEffect(() => {
    // ─── IntersectionObserver para .fade-in ────────────────────
    let io: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
      );
      document.querySelectorAll<HTMLElement>(".fade-in").forEach((el) => {
        io?.observe(el);
      });
    } else {
      document
        .querySelectorAll<HTMLElement>(".fade-in")
        .forEach((el) => el.classList.add("is-visible"));
    }

    // ─── Smooth scroll para anchors :not([href^="#tab-"]) ───────
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>(
        'a[href^="#"]:not([href^="#tab-"])',
      );
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.length <= 1) return;
      const destino = document.querySelector(href);
      if (!destino) return;
      event.preventDefault();
      const top =
        destino.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    };
    document.addEventListener("click", onClick);

    return () => {
      io?.disconnect();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
```

- [ ] **Step 2: Rodar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/EfeitosContato.tsx
git commit -m "$(cat <<'EOF'
feat(contato): adiciona EfeitosContato com IntersectionObserver e smooth scroll

Client component sem render que monta IntersectionObserver para
revelar elementos .fade-in e handler global de smooth scroll para
anchors internos (exceto #tab-*, tratados pelo roteador).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Criar `FaqAccordion.tsx` (client, accordion)

**Files:**
- Create: `apps/web/app/(institucional)/contato/FaqAccordion.tsx`

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo:

```tsx
"use client";

import { useState } from "react";

import type { FaqItem } from "./conteudoContato";

interface FaqAccordionProps {
  items: readonly FaqItem[];
}

/**
 * Accordion da FAQ da página /contato (porta do bloco 5 do script
 * de 12_Pagina_Contato_v1.html).
 *
 * O primeiro item começa aberto (campo `abertaPorDefault`); toggle
 * via clique no botão `.faq-q`. Atualiza `aria-expanded` e a classe
 * `is-open` do `.faq-item`.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const [aberto, setAberto] = useState<ReadonlySet<string>>(
    () => new Set(items.filter((i) => i.abertaPorDefault).map((i) => i.id)),
  );

  const toggle = (id: string) => {
    setAberto((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  };

  return (
    <div className="faq-list">
      {items.map((item) => {
        const isOpen = aberto.has(item.id);
        return (
          <div
            key={item.id}
            className={`faq-item${isOpen ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              {item.pergunta}
            </button>
            <div
              className="faq-a"
              dangerouslySetInnerHTML={{ __html: item.respostaHtml }}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Rodar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/FaqAccordion.tsx
git commit -m "$(cat <<'EOF'
feat(contato): adiciona FaqAccordion com 8 itens controlados

Client component com state Set<string> de IDs abertos; primeiro item
abre por default. Pergunta como texto puro, resposta com
dangerouslySetInnerHTML para preservar <strong>/<a> do protótipo.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Criar `RoteadorFormularios.tsx` (client, tabs + 4 forms + bulk + autofill)

**Files:**
- Create: `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx`

Este é o componente maior do plano (~600-800 linhas). Vou dividir em 4 steps de criação: (a) estado + handlers + tabs render, (b) form Atendimento + helpers de validação, (c) form Proposta + form Equipe (com bloco bulk), (d) form Imprensa.

- [ ] **Step 1: Criar o arquivo com a estrutura base (estado, helpers de validação, handlers de tab, render das tabs)**

Conteúdo inicial:

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";

import {
  BULK_INSCRITOS_RANGES,
  FORMS_ASIDES,
  OPTION_PROGRAMA_CUSTOMIZADO,
  OPTIONS_ASSUNTO_ATENDIMENTO,
  OPTIONS_FATURAMENTO,
  OPTIONS_INSCRITOS_EQUIPE,
  OPTIONS_MODALIDADE,
  OPTIONS_NATUREZA_JURIDICA,
  OPTIONS_ORCAMENTO,
  OPTIONS_PARTICIPANTES,
  OPTIONS_PRAZO,
  OPTIONS_PROGRAMA_PROP,
  OPTIONS_TIPO_IMPRENSA,
  OPTIONS_VERTICAL_PROP,
  TABS,
  type FormAsideConfig,
  type TabId,
} from "./conteudoContato";

/* ============================================================
 * Constantes
 * ============================================================ */

const TAB_IDS: readonly TabId[] = ["atendimento", "proposta", "equipe", "imprensa"];
const TAB_HASH_MAP: Record<string, TabId> = {
  "#tab-atendimento": "atendimento",
  "#tab-proposta": "proposta",
  "#tab-equipe": "equipe",
  "#tab-imprensa": "imprensa",
};
const HEADER_OFFSET = 88;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCEPTED_BULK_EXT = ["xlsx", "xls", "csv"] as const;
const MAX_BULK_FILE_SIZE = 5 * 1024 * 1024;

const ASIDE_POR_TAB: Record<TabId, FormAsideConfig> = Object.fromEntries(
  FORMS_ASIDES.map((f) => [f.tab, f]),
) as Record<TabId, FormAsideConfig>;

/* ============================================================
 * Helpers de validação (compartilhados pelos 4 forms)
 * ============================================================ */

function setError(wrap: Element | null, hasError: boolean) {
  if (wrap) wrap.classList.toggle("has-error", hasError);
}

function validarCampo(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean {
  const wrap = input.closest(".form-field") ?? input.closest(".file-field");
  let ok = true;

  if (input instanceof HTMLInputElement && input.type === "file") {
    if (input.hasAttribute("required") && (!input.files || input.files.length === 0)) {
      ok = false;
    }
  } else {
    if (input.hasAttribute("required") && !String(input.value || "").trim()) {
      ok = false;
    }
    if (
      ok &&
      input instanceof HTMLInputElement &&
      input.type === "email" &&
      input.value &&
      !RE_EMAIL.test(input.value.trim())
    ) {
      ok = false;
    }
    if (ok && input instanceof HTMLTextAreaElement && input.hasAttribute("minlength")) {
      const min = Number(input.getAttribute("minlength")) || 0;
      if (String(input.value || "").trim().length < min) ok = false;
    }
  }

  setError(wrap, !ok);
  return ok;
}

type StatusKind = "idle" | "ok" | "error";
interface FormStatusState {
  kind: StatusKind;
  mensagem: string;
}
const STATUS_INICIAL: FormStatusState = { kind: "idle", mensagem: "" };

/* ============================================================
 * RoteadorFormularios — entrada do componente
 * ============================================================ */

export function RoteadorFormularios() {
  const [tabAtiva, setTabAtiva] = useState<TabId>("atendimento");
  const [bulkAtivo, setBulkAtivo] = useState(false);
  const [statusAtendimento, setStatusAtendimento] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusProposta, setStatusProposta] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusEquipe, setStatusEquipe] = useState<FormStatusState>(STATUS_INICIAL);
  const [statusImprensa, setStatusImprensa] = useState<FormStatusState>(STATUS_INICIAL);
  const [nomeArquivoBulk, setNomeArquivoBulk] = useState(
    "Selecionar arquivo .xlsx / .xls / .csv",
  );

  const refsTabs: Record<TabId, RefObject<HTMLButtonElement | null>> = {
    atendimento: useRef<HTMLButtonElement>(null),
    proposta: useRef<HTMLButtonElement>(null),
    equipe: useRef<HTMLButtonElement>(null),
    imprensa: useRef<HTMLButtonElement>(null),
  };
  const refSecaoForms = useRef<HTMLElement>(null);
  const refSelectVerticalProp = useRef<HTMLSelectElement>(null);
  const refSelectInscritosEq = useRef<HTMLSelectElement>(null);
  const refInputEvento = useRef<HTMLInputElement>(null);
  const refInputEventoUrl = useRef<HTMLInputElement>(null);
  const refInputPlanilha = useRef<HTMLInputElement>(null);
  const refConsentLote = useRef<HTMLInputElement>(null);

  const scrollToForms = useCallback(() => {
    const el = refSecaoForms.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const prefillVertical = useCallback((verticalKey: string) => {
    const select = refSelectVerticalProp.current;
    if (!select) return;
    const has = Array.from(select.options).some((o) => o.value === verticalKey);
    if (!has) return;
    select.value = verticalKey;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    const wrap = select.closest<HTMLElement>(".form-field");
    if (wrap) {
      wrap.style.transition = "box-shadow 320ms";
      wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
      setTimeout(() => {
        wrap.style.boxShadow = "";
      }, 1400);
    }
    // TODO: analytics quando dataLayer estiver configurado
  }, []);

  const ativarTab = useCallback(
    (id: TabId, options?: { scroll?: boolean; prefillVerticalKey?: string }) => {
      setTabAtiva(id);
      if (options?.scroll) {
        // setTimeout porque o painel só fica visível após o setState aplicar
        setTimeout(() => scrollToForms(), 0);
      }
      if (options?.prefillVerticalKey && id === "proposta") {
        setTimeout(() => prefillVertical(options.prefillVerticalKey!), 0);
      }
      // TODO: analytics quando dataLayer estiver configurado
    },
    [prefillVertical, scrollToForms],
  );

  /* ── Effect: hash inicial + querystring autofill (mount only) ── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hash inicial
    const hash = window.location.hash;
    if (hash && TAB_HASH_MAP[hash]) {
      ativarTab(TAB_HASH_MAP[hash], { scroll: true });
    }

    // Querystring autofill (?evento=…&evento_url=…)
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const evento = params.get("evento");
      const eventoUrl = params.get("evento_url");
      if (evento || eventoUrl) {
        if (refInputEvento.current && evento) {
          refInputEvento.current.value = eventoUrl ? `${evento} — ${eventoUrl}` : evento;
        }
        if (refInputEventoUrl.current && eventoUrl) {
          refInputEventoUrl.current.value = eventoUrl;
        }
        const wrap = refInputEvento.current?.closest<HTMLElement>(".form-field");
        if (wrap) {
          wrap.style.transition = "box-shadow 320ms";
          wrap.style.boxShadow = "0 0 0 3px rgba(184, 149, 46, 0.18)";
          setTimeout(() => {
            wrap.style.boxShadow = "";
          }, 1800);
        }
        // TODO: analytics quando dataLayer estiver configurado

        // Limpa querystring (preserva hash)
        if (window.history?.replaceState) {
          const clean = window.location.pathname + (window.location.hash || "");
          window.history.replaceState(null, "", clean);
        }
      }
    }
  }, [ativarTab]);

  /* ── Effect: handler global para <a href^="#tab-"> com vertical-preset ── */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#tab-"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !TAB_HASH_MAP[href]) return;
      event.preventDefault();
      const preset = anchor.getAttribute("data-vertical-preset") || undefined;
      ativarTab(TAB_HASH_MAP[href], { scroll: true, prefillVerticalKey: preset });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", href);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [ativarTab]);

  /* ── Handler de teclado nas tabs (setas, Home, End, Enter, Space) ── */
  const onKeyDownTab = (event: KeyboardEvent<HTMLButtonElement>, id: TabId) => {
    const idx = TAB_IDS.indexOf(id);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = TAB_IDS[(idx + 1) % TAB_IDS.length]!;
      refsTabs[next].current?.focus();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev = TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length]!;
      refsTabs[prev].current?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      refsTabs[TAB_IDS[0]!].current?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      refsTabs[TAB_IDS[TAB_IDS.length - 1]!].current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ativarTab(id);
    }
  };

  /* ── Bloco bulk: handler do select #eq-inscritos ── */
  const onChangeInscritosEq = (event: FormEvent<HTMLSelectElement>) => {
    const value = event.currentTarget.value;
    const ativo = BULK_INSCRITOS_RANGES.has(value);
    setBulkAtivo(ativo);
    if (!ativo) {
      if (refInputPlanilha.current) {
        refInputPlanilha.current.value = "";
        const fieldWrap = refInputPlanilha.current.closest<HTMLElement>(".file-field");
        if (fieldWrap) fieldWrap.classList.remove("has-error");
      }
      if (refConsentLote.current) refConsentLote.current.checked = false;
      setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
    }
    // TODO: analytics quando dataLayer estiver configurado
  };

  /* ── Bloco bulk: handler de change no input file ── */
  const onChangePlanilha = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const fieldWrap = input.closest<HTMLElement>(".file-field");
    const file = input.files?.[0];
    if (!file) {
      setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
      const wrap = document.getElementById("eq-planilha-wrap");
      if (wrap) wrap.classList.remove("has-file");
      return;
    }
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    let invalidReason = "";
    if (!ACCEPTED_BULK_EXT.includes(ext as (typeof ACCEPTED_BULK_EXT)[number])) {
      invalidReason = "Formato não suportado.";
    } else if (file.size > MAX_BULK_FILE_SIZE) {
      invalidReason = "Arquivo acima de 5 MB.";
    }
    const wrap = document.getElementById("eq-planilha-wrap");
    if (invalidReason) {
      setNomeArquivoBulk(`${invalidReason} Selecione outro arquivo.`);
      wrap?.classList.remove("has-file");
      if (fieldWrap) fieldWrap.classList.add("has-error");
      input.value = "";
      // TODO: analytics quando dataLayer estiver configurado
    } else {
      const kb = Math.round(file.size / 1024);
      const sizeStr = kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb} KB`;
      setNomeArquivoBulk(`${file.name} · ${sizeStr}`);
      wrap?.classList.add("has-file");
      if (fieldWrap) fieldWrap.classList.remove("has-error");
      // TODO: analytics quando dataLayer estiver configurado
    }
  };

  /* ── Handler genérico de submit (porta do bloco 4 do script) ── */
  const handleSubmit = useCallback(
    (
      kind: TabId,
      setStatus: (s: FormStatusState) => void,
      extra?: { exigirConsentLote?: boolean },
    ) =>
      (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        let allOk = true;
        form.querySelectorAll<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >("input, select, textarea").forEach((field) => {
          if (!validarCampo(field)) allOk = false;
        });

        const consent = form.querySelector<HTMLInputElement>('input[type="checkbox"][name="lgpd"]');
        if (consent) {
          const wrap = consent.closest<HTMLElement>(".form-consent");
          if (!consent.checked) {
            allOk = false;
            if (wrap) wrap.style.outline = "2px solid var(--cardeal)";
            // TODO: analytics quando dataLayer estiver configurado
          } else if (wrap) {
            wrap.style.outline = "";
          }
        }

        if (extra?.exigirConsentLote) {
          const consentLote = form.querySelector<HTMLInputElement>(
            'input[type="checkbox"][name="lgpd_lote"]',
          );
          if (consentLote) {
            const wrap = consentLote.closest<HTMLElement>(".form-consent");
            if (!consentLote.checked) {
              allOk = false;
              if (wrap) wrap.style.outline = "2px solid var(--cardeal)";
              // TODO: analytics quando dataLayer estiver configurado
            } else if (wrap) {
              wrap.style.outline = "";
            }
          }
        }

        if (!allOk) {
          setStatus({ kind: "error", mensagem: "Verifique os campos destacados." });
          // TODO: analytics quando dataLayer estiver configurado
          const firstErr = form.querySelector<HTMLElement>(".has-error");
          firstErr
            ?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
              "input, select, textarea",
            )
            ?.focus();
          return;
        }

        // TODO: integrar endpoint ${ASIDE_POR_TAB[kind].endpoint} após backend de contato pronto
        setStatus({
          kind: "ok",
          mensagem: "Mensagem registrada · você receberá retorno em horário comercial.",
        });
        // TODO: analytics quando dataLayer estiver configurado
        form.reset();
        if (kind === "equipe") {
          setBulkAtivo(false);
          setNomeArquivoBulk("Selecionar arquivo .xlsx / .xls / .csv");
        }
      },
    [],
  );

  /* ── Render ── */
  return (
    <>
      <section className="router" id="formularios" aria-label="Roteador de formulários institucionais">
        <div className="container">
          <div className="router-head fade-in">
            <h2>Escolha o canal mais adequado à sua demanda</h2>
            <span className="eyebrow gold" style={{ margin: 0 }}>
              Cada solicitação é direcionada à equipe responsável, com atendimento humano e
              retorno em horário comercial.
            </span>
          </div>

          <div className="router-tabs" role="tablist" aria-label="Tipos de demanda">
            {TABS.map((tab) => {
              const isActive = tabAtiva === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={refsTabs[tab.id]}
                  type="button"
                  className={`router-tab${isActive ? " is-active" : ""}`}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-controls={`panel-${tab.id}`}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  data-tab={tab.id}
                  data-cms-link={tab.cmsLink}
                  onClick={() => ativarTab(tab.id)}
                  onKeyDown={(e) => onKeyDownTab(e, tab.id)}
                >
                  <span className="tab-num">{tab.numero}</span>
                  <h3>{tab.titulo}</h3>
                  <p>{tab.descricao}</p>
                  <span className="tab-foot">{tab.ctaFooter}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="forms-wrap" aria-label="Formulários institucionais" ref={refSecaoForms}>
        <div className="container">
          {/* ===== PAINEL A · ATENDIMENTO GERAL ===== */}
          <PainelAtendimento
            tabAtiva={tabAtiva}
            status={statusAtendimento}
            onSubmit={handleSubmit("atendimento", setStatusAtendimento)}
          />

          {/* ===== PAINEL B · PROPOSTA INSTITUCIONAL ===== */}
          <PainelProposta
            tabAtiva={tabAtiva}
            status={statusProposta}
            refSelectVertical={refSelectVerticalProp}
            onSubmit={handleSubmit("proposta", setStatusProposta)}
          />

          {/* ===== PAINEL C · INSCRIÇÃO EM GRUPO ===== */}
          <PainelEquipe
            tabAtiva={tabAtiva}
            status={statusEquipe}
            bulkAtivo={bulkAtivo}
            nomeArquivoBulk={nomeArquivoBulk}
            refInputEvento={refInputEvento}
            refInputEventoUrl={refInputEventoUrl}
            refSelectInscritos={refSelectInscritosEq}
            refInputPlanilha={refInputPlanilha}
            refConsentLote={refConsentLote}
            onChangeInscritos={onChangeInscritosEq}
            onChangePlanilha={onChangePlanilha}
            onSubmit={handleSubmit("equipe", setStatusEquipe, { exigirConsentLote: bulkAtivo })}
          />

          {/* ===== PAINEL D · IMPRENSA ===== */}
          <PainelImprensa
            tabAtiva={tabAtiva}
            status={statusImprensa}
            onSubmit={handleSubmit("imprensa", setStatusImprensa)}
          />
        </div>
      </section>
    </>
  );
}
```

> **Observação:** este passo cria 4 referências a sub-componentes (`PainelAtendimento`, `PainelProposta`, `PainelEquipe`, `PainelImprensa`) que serão adicionados nos próximos steps DENTRO DO MESMO ARQUIVO. Não rodar typecheck ainda; o arquivo só compila após o Step 5.

- [ ] **Step 2: Adicionar `PainelAtendimento` ao final do arquivo `RoteadorFormularios.tsx`**

Append:

```tsx
/* ============================================================
 * Helpers de render de painel
 * ============================================================ */

interface PainelBaseProps {
  tabAtiva: TabId;
  status: FormStatusState;
}

function PanelShell({
  tab,
  ativa,
  children,
}: {
  tab: TabId;
  ativa: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`form-panel${ativa ? " is-active" : ""}`}
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      hidden={!ativa}
    >
      <div className="form-shell">{children}</div>
    </div>
  );
}

function FormStatus({ status, id }: { status: FormStatusState; id: string }) {
  const cls =
    status.kind === "ok"
      ? "form-status is-ok"
      : status.kind === "error"
        ? "form-status is-error"
        : "form-status";
  return (
    <span className={cls} id={id} aria-live="polite">
      {status.mensagem}
    </span>
  );
}

function AsideForm({ aside }: { aside: FormAsideConfig["aside"] }) {
  return (
    <aside className="form-aside">
      <p className="eyebrow">{aside.eyebrow}</p>
      <h3>{aside.titulo}</h3>
      <p dangerouslySetInnerHTML={{ __html: aside.descricaoHtml }} />
      <ul>
        {aside.bulletsHtml.map((b, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
        ))}
      </ul>
      <p className="aside-foot" dangerouslySetInnerHTML={{ __html: aside.rodapeHtml }} />
    </aside>
  );
}

/* ============================================================
 * PAINEL A · ATENDIMENTO GERAL
 * ============================================================ */

interface PainelAtendimentoProps extends PainelBaseProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelAtendimento({ tabAtiva, status, onSubmit }: PainelAtendimentoProps) {
  const cfg = ASIDE_POR_TAB.atendimento;
  return (
    <PanelShell tab="atendimento" ativa={tabAtiva === "atendimento"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-atendimento"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="atend-nome">
              Nome completo<span className="req">*</span>
            </label>
            <input type="text" id="atend-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome completo.</span>
          </div>

          <div className="form-field">
            <label htmlFor="atend-instituicao">Instituição / órgão</label>
            <input
              type="text"
              id="atend-instituicao"
              name="instituicao"
              autoComplete="organization"
            />
          </div>

          <div className="form-field">
            <label htmlFor="atend-email">
              E-mail<span className="req">*</span>
            </label>
            <input type="email" id="atend-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="atend-telefone">Telefone / WhatsApp</label>
            <input
              type="tel"
              id="atend-telefone"
              name="telefone"
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
          </div>

          <div className="form-field full">
            <label htmlFor="atend-assunto">
              Assunto<span className="req">*</span>
            </label>
            <select id="atend-assunto" name="assunto" required defaultValue="">
              <option value="">Selecione um assunto</option>
              {OPTIONS_ASSUNTO_ATENDIMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione um assunto.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="atend-mensagem">
              Mensagem<span className="req">*</span>
            </label>
            <textarea
              id="atend-mensagem"
              name="mensagem"
              required
              minLength={20}
              placeholder="Descreva sua demanda. Quanto mais contexto, mais preciso o retorno."
            />
            <span className="hint">Mínimo 20 caracteres.</span>
            <span className="err-msg">Descreva sua mensagem com pelo menos 20 caracteres.</span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="atend-lgpd" name="lgpd" required />
            <label htmlFor="atend-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para atendimento
              desta solicitação, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD (Lei 13.709/2018).
            </label>
          </div>

          <div className="form-actions full">
            <button type="submit" className="btn btn--primary" data-cms-link="enviar-atendimento">
              Enviar mensagem <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-atendimento" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}
```

- [ ] **Step 3: Adicionar `PainelProposta` ao final do arquivo**

Append:

```tsx
/* ============================================================
 * PAINEL B · PROPOSTA INSTITUCIONAL
 * ============================================================ */

interface PainelPropostaProps extends PainelBaseProps {
  refSelectVertical: RefObject<HTMLSelectElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelProposta({
  tabAtiva,
  status,
  refSelectVertical,
  onSubmit,
}: PainelPropostaProps) {
  const cfg = ASIDE_POR_TAB.proposta;
  return (
    <PanelShell tab="proposta" ativa={tabAtiva === "proposta"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-proposta"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="prop-nome">
              Nome do solicitante<span className="req">*</span>
            </label>
            <input type="text" id="prop-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-cargo">Cargo / função</label>
            <input
              type="text"
              id="prop-cargo"
              name="cargo"
              autoComplete="organization-title"
              placeholder="Ex.: Secretário, Diretor de RH, Coordenador"
            />
          </div>

          <div className="form-field">
            <label htmlFor="prop-instituicao">
              Instituição / órgão<span className="req">*</span>
            </label>
            <input
              type="text"
              id="prop-instituicao"
              name="instituicao"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe a instituição.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-natureza">
              Natureza jurídica<span className="req">*</span>
            </label>
            <select id="prop-natureza" name="natureza" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_NATUREZA_JURIDICA.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a natureza jurídica.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-email">
              E-mail institucional<span className="req">*</span>
            </label>
            <input type="email" id="prop-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-telefone">
              Telefone / WhatsApp<span className="req">*</span>
            </label>
            <input
              type="tel"
              id="prop-telefone"
              name="telefone"
              required
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
            <span className="err-msg">Informe um telefone para contato.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-vertical">
              Vertical de interesse<span className="req">*</span>
            </label>
            <select
              id="prop-vertical"
              name="vertical"
              required
              defaultValue=""
              ref={refSelectVertical}
            >
              <option value="">Selecione</option>
              {OPTIONS_VERTICAL_PROP.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a vertical.</span>
          </div>

          <div className="form-field">
            <label htmlFor="prop-programa">Programa de interesse</label>
            <select id="prop-programa" name="programa" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PROGRAMA_PROP.map((og) => (
                <optgroup key={og.grupo} label={og.grupo}>
                  {og.opcoes.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value={OPTION_PROGRAMA_CUSTOMIZADO.value}>
                {OPTION_PROGRAMA_CUSTOMIZADO.label}
              </option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-modalidade">Modalidade preferencial</label>
            <select id="prop-modalidade" name="modalidade" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_MODALIDADE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-participantes">Nº estimado de participantes</label>
            <select id="prop-participantes" name="participantes" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PARTICIPANTES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-prazo">Prazo previsto para execução</label>
            <select id="prop-prazo" name="prazo" defaultValue="">
              <option value="">Selecione (opcional)</option>
              {OPTIONS_PRAZO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="prop-orcamento">Faixa orçamentária estimada</label>
            <select id="prop-orcamento" name="orcamento" defaultValue="">
              <option value="">Selecione (opcional · confidencial)</option>
              {OPTIONS_ORCAMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field full">
            <label htmlFor="prop-contexto">
              Contexto e objetivos institucionais<span className="req">*</span>
            </label>
            <textarea
              id="prop-contexto"
              name="contexto"
              required
              minLength={40}
              placeholder="Cenário institucional, objetivos formativos, público-alvo e marcos temporais relevantes (planejamento, ciclo fiscal, agenda de governo)."
            />
            <span className="hint">
              Mínimo 40 caracteres · quanto mais contexto, mais precisa a proposta.
            </span>
            <span className="err-msg">
              Descreva o contexto institucional com pelo menos 40 caracteres.
            </span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="prop-lgpd" name="lgpd" required />
            <label htmlFor="prop-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para elaboração
              da proposta solicitada, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD (Lei 13.709/2018).
            </label>
          </div>

          <div className="form-actions full">
            <button type="submit" className="btn btn--gold" data-cms-link="enviar-proposta">
              Enviar solicitação de proposta <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-proposta" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}
```

- [ ] **Step 4: Adicionar `PainelEquipe` ao final do arquivo (inclui bloco bulk)**

Append:

```tsx
/* ============================================================
 * PAINEL C · INSCRIÇÃO EM GRUPO
 * ============================================================ */

interface PainelEquipeProps extends PainelBaseProps {
  bulkAtivo: boolean;
  nomeArquivoBulk: string;
  refInputEvento: RefObject<HTMLInputElement | null>;
  refInputEventoUrl: RefObject<HTMLInputElement | null>;
  refSelectInscritos: RefObject<HTMLSelectElement | null>;
  refInputPlanilha: RefObject<HTMLInputElement | null>;
  refConsentLote: RefObject<HTMLInputElement | null>;
  onChangeInscritos: (event: FormEvent<HTMLSelectElement>) => void;
  onChangePlanilha: (event: FormEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelEquipe({
  tabAtiva,
  status,
  bulkAtivo,
  nomeArquivoBulk,
  refInputEvento,
  refInputEventoUrl,
  refSelectInscritos,
  refInputPlanilha,
  refConsentLote,
  onChangeInscritos,
  onChangePlanilha,
  onSubmit,
}: PainelEquipeProps) {
  const cfg = ASIDE_POR_TAB.equipe;
  return (
    <PanelShell tab="equipe" ativa={tabAtiva === "equipe"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-equipe"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="eq-nome">
              Nome do solicitante<span className="req">*</span>
            </label>
            <input type="text" id="eq-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-cargo">Cargo / função</label>
            <input
              type="text"
              id="eq-cargo"
              name="cargo"
              autoComplete="organization-title"
            />
          </div>

          <div className="form-field">
            <label htmlFor="eq-instituicao">
              Instituição / órgão<span className="req">*</span>
            </label>
            <input
              type="text"
              id="eq-instituicao"
              name="instituicao"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe a instituição.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-cnpj">CNPJ (faturamento)</label>
            <input type="text" id="eq-cnpj" name="cnpj" placeholder="00.000.000/0000-00" />
            <span className="hint">Opcional · solicitado posteriormente para emissão de NF.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-email">
              E-mail institucional<span className="req">*</span>
            </label>
            <input type="email" id="eq-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-telefone">
              Telefone / WhatsApp<span className="req">*</span>
            </label>
            <input
              type="tel"
              id="eq-telefone"
              name="telefone"
              required
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
            <span className="err-msg">Informe um telefone.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="eq-evento">
              Evento de interesse<span className="req">*</span>
            </label>
            <input
              type="text"
              id="eq-evento"
              name="evento"
              required
              placeholder="Título, sigla do programa, data ou link da Agenda."
              ref={refInputEvento}
            />
            <span className="hint">Aceita título, sigla do programa, data ou link.</span>
            <span className="err-msg">Informe o evento de interesse.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-inscritos">
              Nº de inscritos previstos<span className="req">*</span>
            </label>
            <select
              id="eq-inscritos"
              name="inscritos"
              required
              defaultValue=""
              ref={refSelectInscritos}
              onChange={onChangeInscritos}
            >
              <option value="">Selecione</option>
              {OPTIONS_INSCRITOS_EQUIPE.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="hint">
              Acima de 50 participantes habilita upload de planilha de inscritos.
            </span>
            <span className="err-msg">Selecione a quantidade prevista.</span>
          </div>

          <div className="form-field">
            <label htmlFor="eq-faturamento">
              Forma de faturamento prevista<span className="req">*</span>
            </label>
            <select id="eq-faturamento" name="faturamento" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_FATURAMENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione a forma de faturamento.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="eq-observacoes">Observações</label>
            <textarea
              id="eq-observacoes"
              name="observacoes"
              placeholder="Necessidades específicas: nominata, datas de empenho, requisitos de empenhamento, vagas reservadas, condições especiais."
            />
          </div>

          {/* Hidden field para preservar o link do evento de origem */}
          <input type="hidden" id="eq-evento-url" name="evento_url" defaultValue="" ref={refInputEventoUrl} />

          {/* Bloco condicional bulk */}
          <div
            className={`form-bulk${bulkAtivo ? " is-active" : ""}`}
            id="eq-bulk"
            aria-hidden={!bulkAtivo}
          >
            <div className="form-bulk-head">
              <p className="eyebrow gold">Inscrição em lote · grandes grupos</p>
              <h4>Envio de planilha de participantes</h4>
              <p>
                Para grupos acima de 50 participantes, recomendamos o envio de uma planilha com
                os dados dos inscritos. Baixe nosso modelo institucional, preencha e faça upload
                abaixo — a transmissão é criptografada (HTTPS/TLS).
              </p>
              <div className="bulk-actions">
                {/* TODO: hospedar XLSX em apps/web/public/assets/ */}
                <a
                  className="btn btn--secondary btn--mini"
                  href="./assets/modelo-inscricao-grupo-NTC.xlsx"
                  data-cms-link="modelo-planilha-grupo"
                  download
                >
                  Baixar modelo de planilha (XLSX) <span className="btn-arrow">↓</span>
                </a>
                <span className="meta">Modelo oficial · campos pré-definidos</span>
              </div>
            </div>

            <div className="file-field">
              <label htmlFor="eq-planilha">
                Upload da planilha de inscritos<span className="req">*</span>
              </label>
              <div className="file-input-wrap" id="eq-planilha-wrap">
                <input
                  type="file"
                  id="eq-planilha"
                  name="planilha"
                  accept=".xlsx,.xls,.csv"
                  aria-describedby="eq-planilha-hint"
                  ref={refInputPlanilha}
                  onChange={onChangePlanilha}
                  required={bulkAtivo}
                />
                <div className="file-display">
                  <span className="file-name">{nomeArquivoBulk}</span>
                  <span className="file-cta">Escolher arquivo</span>
                </div>
              </div>
              <span className="hint" id="eq-planilha-hint">
                Formatos: XLSX, XLS, CSV · tamanho máximo 5 MB · transmissão criptografada.
              </span>
              <span className="err-msg">
                Anexe a planilha de inscritos (XLSX, XLS ou CSV · até 5 MB).
              </span>
            </div>

            <div className="form-consent full">
              <input
                type="checkbox"
                id="eq-lgpd-lote"
                name="lgpd_lote"
                ref={refConsentLote}
                required={bulkAtivo}
              />
              <label htmlFor="eq-lgpd-lote">
                Declaro estar autorizado(a) a compartilhar os dados pessoais dos participantes
                listados na planilha, na qualidade de representante legítimo(a) da instituição
                demandante, e ciente de que o Instituto NTC do Brasil tratará esses dados{" "}
                <strong>exclusivamente para processamento da inscrição em lote</strong>, nos
                termos da LGPD (Lei 13.709/2018) e da nossa{" "}
                <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                  Política de Privacidade
                </a>
                .
              </label>
            </div>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="eq-lgpd" name="lgpd" required />
            <label htmlFor="eq-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para
              processamento da inscrição, proposta e faturamento, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD.
            </label>
          </div>

          <div className="form-actions full">
            <button type="submit" className="btn btn--primary" data-cms-link="enviar-equipe">
              Solicitar inscrição da equipe <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-equipe" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}
```

- [ ] **Step 5: Adicionar `PainelImprensa` ao final do arquivo**

Append:

```tsx
/* ============================================================
 * PAINEL D · IMPRENSA
 * ============================================================ */

interface PainelImprensaProps extends PainelBaseProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function PainelImprensa({ tabAtiva, status, onSubmit }: PainelImprensaProps) {
  const cfg = ASIDE_POR_TAB.imprensa;
  return (
    <PanelShell tab="imprensa" ativa={tabAtiva === "imprensa"}>
      <AsideForm aside={cfg.aside} />
      <div className="form-body">
        <form
          className="form-grid"
          action="javascript:void(0);"
          method="post"
          data-form-id={cfg.formId}
          data-cms-link={cfg.cmsLink}
          data-endpoint={cfg.endpoint}
          noValidate
          aria-describedby="status-imprensa"
          onSubmit={onSubmit}
        >
          <div className="form-field">
            <label htmlFor="imp-nome">
              Nome do(a) jornalista<span className="req">*</span>
            </label>
            <input type="text" id="imp-nome" name="nome" required autoComplete="name" />
            <span className="err-msg">Informe seu nome.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-veiculo">
              Veículo / assessoria<span className="req">*</span>
            </label>
            <input
              type="text"
              id="imp-veiculo"
              name="veiculo"
              required
              autoComplete="organization"
            />
            <span className="err-msg">Informe o veículo ou assessoria.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-email">
              E-mail profissional<span className="req">*</span>
            </label>
            <input type="email" id="imp-email" name="email" required autoComplete="email" />
            <span className="err-msg">Informe um e-mail válido.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-telefone">Telefone / WhatsApp</label>
            <input
              type="tel"
              id="imp-telefone"
              name="telefone"
              autoComplete="tel"
              placeholder="(__) _____-____"
            />
          </div>

          <div className="form-field">
            <label htmlFor="imp-tipo">
              Tipo de demanda<span className="req">*</span>
            </label>
            <select id="imp-tipo" name="tipo" required defaultValue="">
              <option value="">Selecione</option>
              {OPTIONS_TIPO_IMPRENSA.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <span className="err-msg">Selecione o tipo de demanda.</span>
          </div>

          <div className="form-field">
            <label htmlFor="imp-deadline">Prazo de fechamento (deadline)</label>
            <input
              type="text"
              id="imp-deadline"
              name="deadline"
              placeholder="Ex.: 15/05 às 18h"
            />
            <span className="hint">Informe data e horário se houver fechamento próximo.</span>
          </div>

          <div className="form-field full">
            <label htmlFor="imp-pauta">
              Pauta / contexto editorial<span className="req">*</span>
            </label>
            <textarea
              id="imp-pauta"
              name="pauta"
              required
              minLength={30}
              placeholder="Pauta, ângulo editorial, veículo de publicação e público-alvo."
            />
            <span className="hint">Mínimo 30 caracteres.</span>
            <span className="err-msg">Descreva a pauta com pelo menos 30 caracteres.</span>
          </div>

          <div className="form-consent full">
            <input type="checkbox" id="imp-lgpd" name="lgpd" required />
            <label htmlFor="imp-lgpd">
              Autorizo o tratamento dos meus dados pelo Instituto NTC do Brasil para atendimento
              desta demanda editorial, nos termos da nossa{" "}
              <a href="/politica-de-privacidade" data-cms-link="legal-privacidade">
                Política de Privacidade
              </a>{" "}
              e da LGPD.
            </label>
          </div>

          <div className="form-actions full">
            <button type="submit" className="btn btn--primary" data-cms-link="enviar-imprensa">
              Enviar pauta <span className="btn-arrow">→</span>
            </button>
            <FormStatus status={status} id="status-imprensa" />
          </div>
        </form>
      </div>
    </PanelShell>
  );
}
```

- [ ] **Step 6: Limpar imports não usados — remover `useMemo` se não foi usado**

Após adicionar todos os painéis, abrir `apps/web/app/(institucional)/contato/RoteadorFormularios.tsx` e remover `useMemo` da linha de import (não é mais necessário). Imports finais:

```tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
```

Edit no arquivo:

old_string:
```
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
```

new_string:
```
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
```

- [ ] **Step 7: Rodar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 8: Rodar lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint
```

Expected: sem novos warnings ou errors.

- [ ] **Step 9: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/RoteadorFormularios.tsx
git commit -m "$(cat <<'EOF'
feat(contato): adiciona RoteadorFormularios com 4 painéis + bulk + autofill

Client component que coordena tabs (com navegação por teclado),
4 forms (Atendimento, Proposta, Equipe, Imprensa), validação
client-side (required, email, minlength, file), bloco condicional
de inscrição em lote (>50 participantes), autofill via ?evento=
querystring, e handler global para anchors #tab-* com
data-vertical-preset. Submit preserva stub do protótipo (sem
backend ainda).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Criar `page.tsx` (server component) com as 9 seções

**Files:**
- Create: `apps/web/app/(institucional)/contato/page.tsx`

- [ ] **Step 1: Criar o arquivo**

Conteúdo completo:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

import {
  CHANNELS,
  CTA_FINAL,
  FAQS,
  HERO,
  HQ,
  LGPD,
  SLA_HORARIOS,
  SLAS,
  VERTICAIS,
} from "./conteudoContato";
import { EfeitosContato } from "./EfeitosContato";
import { FaqAccordion } from "./FaqAccordion";
import { RoteadorFormularios } from "./RoteadorFormularios";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contato — Canais institucionais · Grupo NTC",
  description:
    "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa. Atendimento humano, com retorno em horário comercial.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.grupontc.com.br/contato",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Grupo NTC",
    title: "Contato — Canais institucionais · Grupo NTC",
    description:
      "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa.",
    url: "https://www.grupontc.com.br/contato",
    images: [
      {
        url: "https://www.grupontc.com.br/img/og/og-institucional.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contato — Canais institucionais · Grupo NTC",
    description:
      "Canais institucionais do Grupo NTC: atendimento geral, proposta institucional, inscrição de equipes e imprensa.",
  },
};

export default function ContatoPage() {
  return (
    <>
      <main id="main">
        {/* ============================================================
            1) HERO INSTITUCIONAL · SLIM
            ============================================================ */}
        <section className="hero-page" aria-label="Cabeçalho institucional · Contato">
          <div className="hero-page-bg" aria-hidden="true"></div>
          <div className="container hero-page-content fade-in">
            <nav className="crumb" aria-label="Você está em">
              <Link href={HERO.breadcrumbHomeHref}>{HERO.breadcrumbHomeLabel}</Link>
              <span className="sep" aria-hidden="true"></span>
              <span className="current">{HERO.breadcrumbCurrent}</span>
            </nav>
            <p className="eyebrow gold" style={{ marginTop: "var(--space-3)" }}>
              {HERO.eyebrow}
            </p>
            <h1>
              {HERO.tituloAntes}
              <span className="accent">{HERO.tituloAccent}</span>
              {HERO.tituloDepois}
            </h1>
            <p className="hero-page-sub">{HERO.lede}</p>
            <div className="hero-quicklinks">
              {HERO.quicklinks.map((q) => (
                <a key={q.href} href={q.href} data-cms-link={q.cmsLink}>
                  {q.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            2 + 3) ROTEADOR DE FORMULÁRIOS · TABS + 4 PAINÉIS
            ============================================================ */}
        <RoteadorFormularios />

        {/* ============================================================
            4) CANAIS DIRETOS + SEDE + MAPA
            ============================================================ */}
        <section
          className="channels"
          id="canais-diretos"
          aria-label="Canais diretos e sede institucional"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">Canais diretos</p>
              <h2>Prefere falar diretamente? Use os canais oficiais.</h2>
              <p className="section-intro">
                Atendimento humano, com encaminhamento direto à área responsável. Operado pela
                coordenação do Instituto NTC do Brasil em horário comercial.
              </p>
            </div>

            <div className="channels-grid">
              <div className="channels-list">
                {CHANNELS.map((c) => (
                  <div
                    key={c.data}
                    className={`channel-card${c.destaque ? " is-featured" : ""}`}
                    data-channel={c.data}
                  >
                    <div className="channel-icon" aria-hidden="true">
                      {c.iconeChar}
                    </div>
                    <div className="channel-body">
                      <p className="label">{c.label}</p>
                      <p className="value">{c.valor}</p>
                      <p className="note">{c.nota}</p>
                    </div>
                    <div className="channel-action">
                      <a
                        className={`link-arrow${c.acaoCrimson ? " crimson" : ""}`}
                        href={c.acaoHref}
                        data-cms-link={c.acaoCmsLink}
                        {...(c.acaoTarget
                          ? { target: c.acaoTarget, rel: "noopener noreferrer" }
                          : {})}
                      >
                        {c.acaoTexto}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hq-card fade-in">
                <div className="hq-head">
                  <h3>Sede institucional</h3>
                  <span className="hq-pill">{HQ.cidade}</span>
                </div>
                <p className="hq-address" dangerouslySetInnerHTML={{ __html: HQ.enderecoHtml }} />
                <div
                  className="hq-map"
                  aria-label="Mapa da sede do Instituto NTC do Brasil em Brasília — DF"
                >
                  <iframe
                    src={HQ.mapaIframeSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={HQ.mapaIframeTitle}
                  />
                </div>
                <div className="hq-foot">
                  <a
                    className="btn btn--secondary btn--mini"
                    href={HQ.mapsBotaoHref}
                    data-cms-link="maps-sede"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir no Google Maps <span className="btn-arrow">→</span>
                  </a>
                  <a className="link-arrow" href="#tab-proposta" data-cms-link="agendar-visita">
                    Solicitar reunião institucional
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            5) ATENDIMENTO POR VERTICAL
            ============================================================ */}
        <section
          className="section section--cream"
          aria-label="Atendimento dedicado por vertical do Grupo NTC"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">Atendimento por vertical</p>
              <h2>Coordenação dedicada · Educação, Gestão Pública e Saúde.</h2>
              <p className="section-intro">
                Cada vertical do Grupo NTC tem uma coordenação técnica e comercial dedicada, com
                pessoas que conhecem profundamente o setor — redes públicas de ensino,
                Administração Pública e o SUS. Escolha o canal que faz sentido à sua demanda.
              </p>
            </div>

            <div className="verticals-grid">
              {VERTICAIS.map((v) => (
                <article key={v.vertical} className="vert-card fade-in" data-vertical={v.vertical}>
                  <span className="vert-eyebrow">{v.eyebrow}</span>
                  <h3>{v.titulo}</h3>
                  <p className="vert-lede">{v.lede}</p>
                  <div className="vert-info">
                    <div>
                      <b>Programas</b>
                      {` ${v.programas}`}
                    </div>
                    <div>
                      <b>Canais</b>{" "}
                      <span dangerouslySetInnerHTML={{ __html: v.canaisHtml }} />
                    </div>
                  </div>
                  <div className="vert-cta">
                    <a
                      className="btn-vert"
                      href={v.conhecerHref}
                      data-cms-link={v.conhecerCmsLink}
                    >
                      Conhecer a vertical
                    </a>
                    <a
                      className="btn-vert"
                      href="#tab-proposta"
                      data-cms-link={v.propostaCmsLink}
                      data-vertical-preset={v.vertical}
                    >
                      Solicitar proposta
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            6) PRAZOS DE RETORNO (SLA BAR)
            ============================================================ */}
        <section className="sla-bar" aria-label="Prazos de retorno por canal de atendimento">
          <div className="container">
            <div
              className="section-head fade-in"
              style={{ marginBottom: "var(--space-4)", color: "var(--pergaminho)" }}
            >
              <p className="eyebrow" style={{ color: "var(--dourado-soft)" }}>
                Prazos de retorno
              </p>
              <h2
                style={{
                  color: "var(--pergaminho)",
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                }}
              >
                Quanto tempo você pode esperar por uma resposta.
              </h2>
            </div>
            <div className="sla-grid fade-in">
              {SLAS.map((sla) => (
                <div key={sla.label} className="sla-cell">
                  <div className="sla-num">{sla.numero}</div>
                  <div className="sla-label">{sla.label}</div>
                  <p className="sla-note">{sla.nota}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid rgba(244, 241, 232, 0.18)",
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                fontFamily: "var(--font-cond)",
                fontSize: "12.5px",
                letterSpacing: "1.6px",
                textTransform: "uppercase",
                color: "var(--pergaminho-80)",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: SLA_HORARIOS.comercialHtml }} />
              <span dangerouslySetInnerHTML={{ __html: SLA_HORARIOS.suporteHtml }} />
            </div>
          </div>
        </section>

        {/* ============================================================
            7) FAQ
            ============================================================ */}
        <section
          className="faq"
          id="faq"
          aria-label="Perguntas frequentes sobre contato e atendimento"
        >
          <div className="container">
            <div className="section-head fade-in">
              <p className="eyebrow gold">FAQ · Contato e atendimento</p>
              <h2>Perguntas frequentes sobre relacionamento institucional.</h2>
              <p className="section-intro">
                Reunimos as 8 dúvidas mais recorrentes sobre proposta institucional, inscrição em
                grupo, faturamento por órgão público, certificação e prazos de retorno. Se a sua
                não está aqui, use o canal de Atendimento Geral.
              </p>
            </div>

            <FaqAccordion items={FAQS} />
          </div>
        </section>

        {/* ============================================================
            8) LGPD INSTITUCIONAL
            ============================================================ */}
        <section className="lgpd" id="lgpd" aria-label="Tratamento de dados e LGPD">
          <div className="container">
            <div className="lgpd-grid fade-in">
              <div>
                <p className="eyebrow lgpd-eyebrow">{LGPD.eyebrow}</p>
                <h2>{LGPD.titulo}</h2>
                {LGPD.paragrafosHtml.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
                <p style={{ marginTop: "var(--space-3)" }}>
                  <Link
                    className="link-arrow light"
                    href={LGPD.ctaPrivacidadeHref}
                    data-cms-link="legal-privacidade"
                  >
                    {LGPD.ctaPrivacidadeTexto}
                  </Link>
                </p>
              </div>
              <div className="lgpd-cards">
                {LGPD.cells.map((cell) => (
                  <div key={cell.titulo} className="lgpd-cell">
                    <b>{cell.titulo}</b>
                    <span>{cell.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            9) CTA INSTITUCIONAL FINAL
            ============================================================ */}
        <section className="cta-final" aria-label="Chamada institucional de encerramento">
          <div className="container">
            <div className="cta-final-inner fade-in">
              <div>
                <p className="eyebrow light" style={{ color: "var(--dourado-soft)" }}>
                  {CTA_FINAL.eyebrow}
                </p>
                <h2 dangerouslySetInnerHTML={{ __html: CTA_FINAL.tituloHtml }} />
                <p>{CTA_FINAL.paragrafo}</p>
              </div>
              <div className="cta-final-actions">
                {CTA_FINAL.acoes.map((acao) => (
                  <a
                    key={acao.cmsLink}
                    className={`btn btn--${acao.variant}`}
                    href={acao.href}
                    data-cms-link={acao.cmsLink}
                  >
                    {acao.texto}
                    {acao.comArrow && <span className="btn-arrow"> →</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <EfeitosContato />
    </>
  );
}
```

- [ ] **Step 2: Rodar typecheck**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm typecheck
```

Expected: sem erros novos.

- [ ] **Step 3: Rodar lint**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm lint
```

Expected: sem novos warnings ou errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/\(institucional\)/contato/page.tsx
git commit -m "$(cat <<'EOF'
feat(contato): adiciona page.tsx server com 9 seções do protótipo

Server component da rota /contato com revalidate=3600 e metadata SEO
completa. Renderiza hero, RoteadorFormularios (tabs+forms), canais
diretos com mapa, atendimento por vertical, SLA bar, FAQ accordion,
LGPD e CTA final. Header/Footer vêm do layout (institucional) já
existente. EfeitosContato montado após </main> para fade-in e smooth
scroll.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Validar build de produção

**Files:**
- Modify: nenhum

- [ ] **Step 1: Rodar build de produção do app web**

```bash
cd /Users/joao/Documents/portal-ntc && pnpm next build --no-lint
```

> Usar `--no-lint` para acelerar; o lint já foi rodado na Task 7. O comando deve ser executado dentro de `apps/web` se necessário; alternativamente `pnpm -F @ntc/web build`.

Expected: build conclui sem erros. A rota `/contato` aparece na lista de rotas geradas como `ISR` (revalidate 3600) ou `Static`.

- [ ] **Step 2: Se o build falhar, diagnosticar e corrigir antes de prosseguir**

Erros típicos:
- `'X' is declared but never used` (noUnusedLocals) → remover import/variável.
- `Object is possibly undefined` (noUncheckedIndexedAccess) → adicionar `?? ""` ou `!` se for refs já garantidas.
- `Property 'X' does not exist on type 'Y'` → checar correspondência de nomes entre `conteudoContato.ts` e os componentes.

Após correções, refazer Step 1 até build limpo.

---

## Task 9: Validação visual via dev server (checkpoint humano)

**Files:**
- Modify: nenhum

- [ ] **Step 1: Subir o dev server na porta 3000**

```bash
cd /Users/joao/Documents/portal-ntc/apps/web && pnpm next dev --port 3000
```

> NÃO usar `pnpm dev` (turbo não propaga logs dos sub-processos — memory `feedback_db_push_paralelo.md`).

Rodar em background para liberar o terminal.

- [ ] **Step 2: Confirmar que a rota responde com 200**

```bash
curl -I http://localhost:3000/contato
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 3: Pedir validação visual humana**

Abrir lado a lado:
- Aba 1: `file:///Users/joao/Documents/portal-ntc/12_Pagina_Contato_v1.html` (protótipo de referência).
- Aba 2: `http://localhost:3000/contato` (Next renderizado).

Pedir ao usuário para comparar e validar:

1. **Hero**: breadcrumb, eyebrow dourada, h1 com "decide" em cor de acento, lede, 5 quicklinks. Background image visível.
2. **Tabs**: 4 botões com numeração "01 · Geral" etc., aba "Atendimento geral" ativa por default.
3. **Deep-link**: navegar para `/contato#tab-proposta` carrega com a aba Proposta ativa + scroll para a seção de forms.
4. **Form Atendimento**: 6 campos, layout em grid 2 colunas (1 col mobile), erros em vermelho se submeter vazio.
5. **Form Proposta**: 13 campos visíveis ao clicar a aba; select de programas com optgroups.
6. **Vertical preset**: clicar "Solicitar proposta" no card NTC Educação leva pra aba Proposta E pré-seleciona "NTC Educação" no select com flash dourado.
7. **Form Equipe**: trocar `Nº de inscritos previstos` para "51 a 100" revela bloco de upload de planilha; voltar para "3 a 5" esconde.
8. **Bulk file**: upload de PDF rejeitado com mensagem; XLSX válido mostra nome + tamanho.
9. **Form Imprensa**: 7 campos visíveis ao clicar a aba.
10. **Autofill evento**: abrir `/contato?evento=PROSUS%2B%20Bras%C3%ADlia&evento_url=https%3A%2F%2Fexemplo.com#tab-equipe` preenche `Evento de interesse` e limpa a querystring (hash preservado).
11. **Canais diretos**: 5 cards, cards "comercial" e "whatsapp" com classe `is-featured`. Iframe Google Maps carrega.
12. **Verticais**: 3 cards lado a lado em desktop.
13. **SLA bar**: fundo Oxford, 4 cells dourados, linha de horários no rodapé.
14. **FAQ**: primeiro item aberto por default; clicar nos demais alterna.
15. **LGPD**: grid 2 colunas, texto + 4 cells. Link para `/politica-de-privacidade` funciona.
16. **CTA final**: 3 botões; "Solicitar proposta institucional" leva pra aba Proposta com scroll.
17. **Smooth scroll**: clicar quicklink "Canais diretos" no hero faz scroll suave.
18. **Fade-in**: rolar a página, elementos `.fade-in` revelam ao entrar no viewport.
19. **Header e Footer**: idênticos às outras páginas institucionais (LGPD, Política de Privacidade).
20. **Responsivo**: testar em mobile (devtools 375px). Forms empilham, tabs ficam scrollables, canais empilham.

- [ ] **Step 4: Após aprovação humana, parar o dev server**

Encerrar o processo background do dev server.

- [ ] **Step 5: Atualizar memória se algum aprendizado surgir**

Se algo não-óbvio apareceu (gotcha novo, padrão emergente), criar/atualizar memória correspondente em `/Users/joao/.claude/projects/-Users-joao-Documents-portal-ntc/memory/` e indexar em `MEMORY.md`.

- [ ] **Step 6: (Opcional) Commit final consolidador**

Se houver pequenos ajustes pós-validação visual:

```bash
git add <arquivos-ajustados>
git commit -m "$(cat <<'EOF'
fix(contato): ajustes pós-checkpoint visual

<descrição dos ajustes>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review (executada antes de entregar)

**1. Spec coverage:**
- Hero (seção 1) → Task 7 Step 1.
- Tabs (seção 2) + Forms (seção 3) → Task 6 inteira.
- Canais + Sede + Mapa (seção 4) → Task 7 Step 1.
- Verticais (seção 5) → Task 7 Step 1.
- SLA bar (seção 6) → Task 7 Step 1.
- FAQ (seção 7) → Task 5 + Task 7 Step 1.
- LGPD (seção 8) → Task 7 Step 1.
- CTA final (seção 9) → Task 7 Step 1.
- CSS literal extraído → Task 1.
- Import no root layout → Task 2.
- `conteudoContato.ts` → Task 3.
- IntersectionObserver + smooth scroll → Task 4.
- Validação client-side + bulk + autofill → Task 6.
- Checkpoint visual → Task 9.
- Sem submit real, sem analytics, sem hCaptcha → preservado como TODO inline.

**2. Placeholder scan:** Nenhum "TODO", "TBD", "implement later" não-justificado. Os TODOs inline marcam decisões deliberadas (rota não criada, backend não pronto) e estão documentados na spec.

**3. Type consistency:**
- `TabId` definido em `conteudoContato.ts` (Task 3), consumido em `RoteadorFormularios.tsx` (Task 6) e `page.tsx` (Task 7).
- `FaqItem` definido em `conteudoContato.ts` (Task 3), consumido em `FaqAccordion.tsx` (Task 5) e `page.tsx`.
- `FormAsideConfig`, `ChannelCard`, `VerticalCard`, `SlaCell`, `CtaFinalAction`, `SelectOption`, `OptgroupConfig` — todos definidos em Task 3 e referenciados nas Tasks 6/7.
- `FormStatusState`, `StatusKind` — internos a `RoteadorFormularios.tsx` (Task 6).
- `BULK_INSCRITOS_RANGES` exportado em Task 3, importado em Task 6.
- Refs com tipos `RefObject<HTMLElement | null>` consistentes entre o owner (`RoteadorFormularios`) e os sub-componentes (`PainelEquipe`, `PainelProposta`).

Tudo coerente.
