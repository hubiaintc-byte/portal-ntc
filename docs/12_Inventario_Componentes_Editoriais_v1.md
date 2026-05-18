# Inventário de Componentes Editoriais
## Portal Grupo NTC · Design System Soberana 2026 · v1

**Versão:** 1.0 · 15 de maio de 2026
**Companheiro de:** `10_DAB_Backend_Enxuto_GrupoNTC_v1.md` e `11_Schema_Payload_CMS_v1.md`
**Função:** fonte canônica de componentes React. Impede o agente de codificação de reinventar elementos visuais já desenhados nos protótipos HTML aprovados.

---

## Sumário

1. Princípios do Inventário
2. Tokens Soberana — referência rápida
3. Layout Primitives
4. Navegação
5. Hero family
6. Cards editoriais
7. Blocos editoriais
8. Listings e grids
9. Formulários
10. Utilitários tipográficos
11. Rodapé e elementos institucionais
12. Helpers e widgets sistêmicos
13. Mapa de protótipos → componentes
14. Política de criação de componentes novos

---

## 1. Princípios do Inventário

A regra mestra: **se está no protótipo aprovado, vira componente nomeado**. Se não está, **não é criado sem solicitação explícita**. Componentes existentes podem receber variantes (props) — não podem ser duplicados sob nome diferente.

Cada componente segue cinco requisitos não negociáveis:

**1.1. Interface TypeScript explícita** com props nomeadas, defaults documentados e `JSX.IntrinsicAttributes` apenas quando justificado.
**1.2. Server Component por padrão**, salvo necessidade de interatividade (formulários, menu mobile, filtros de agenda).
**1.3. Estilização via Tailwind + tokens Soberana**. Nenhuma cor literal hard-coded. Nenhuma fonte fora das duas escolhidas.
**1.4. Acessibilidade nativa** — landmarks, aria-labels, foco visível, contraste AA.
**1.5. Sem efeitos vibrantes** — sem gradients lúdicos, sem sombras pesadas, sem animações enérgicas. Toda transição é discreta (250–400 ms ease).

Diretório-alvo no monorepo: `packages/ui/src/components/`.

---

## 2. Tokens Soberana — referência rápida

```typescript
// packages/ui/src/tokens.ts
export const tokens = {
  cores: {
    oxford: '#11365E',          // dominante institucional 60
    oxfordEscuro: '#0B2545',
    oxfordClaro: '#1E4E8C',
    cardeal: '#8E2B27',         // acento Gestão Pública
    oliva: '#5C6B3B',           // acento Saúde
    dourado: '#B5995A',         // selo, eventON, refinamento
    pergaminho: '#F4EFE6',      // fundo editorial claro
    osso: '#FBF8F2',            // base de página
    grafite: '#2B2B2B',         // texto principal
    grafiteSuave: '#5A5A5A',    // texto secundário
    linhaSutil: '#D9D2C4',      // divisores
    vermelhoErro: '#9A1B1B',    // estados de erro em formulário
    verdeSucesso: '#3F6B3F',    // confirmação editorial
  },
  fontes: {
    titulo: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
    corpo: '"Barlow", system-ui, -apple-system, sans-serif',
  },
  escala: {
    h1: 'clamp(2.75rem, 5vw, 4.5rem)',
    h2: 'clamp(2rem, 3.5vw, 3rem)',
    h3: 'clamp(1.5rem, 2.5vw, 2rem)',
    h4: '1.25rem',
    corpo: '1.0625rem',
    pequeno: '0.875rem',
    eyebrow: '0.75rem',
  },
  espacamento: {
    secaoVertical: 'clamp(4rem, 8vw, 7rem)',
    blocoVertical: 'clamp(2rem, 4vw, 3.5rem)',
    container: 'min(92ch, 92vw)',
    margemEditorial: 'clamp(1.25rem, 4vw, 3rem)',
  },
  raios: {
    nenhum: '0',          // estrutural — nunca arredonda
    foto: '2px',          // imagens institucionais (sutil)
    selo: '999px',        // pílulas pequenas
  },
  transicoes: {
    discreta: '250ms ease-out',
    institucional: '400ms ease-out',
  },
}
```

**Regra absoluta:** estruturas (cards, blocos, containers) usam `border-radius: 0`. Apenas selos/pílulas em pílula. Imagens com raio 2px no máximo.

---

## 3. Layout Primitives

### 3.1. `<Container>`

Largura editorial padrão.

```typescript
interface ContainerProps {
  children: React.ReactNode
  variante?: 'editorial' | 'amplo' | 'texto'   // default: editorial
  className?: string
}
```

Origem: estrutura repetida em todos os protótipos.
Variantes: `editorial` (92ch), `amplo` (108ch), `texto` (62ch para leitura longa).
Dependências: tokens.

### 3.2. `<Secao>`

Bloco vertical da página com espaçamento canônico e variação cromática.

```typescript
interface SecaoProps {
  children: React.ReactNode
  fundo?: 'osso' | 'pergaminho' | 'oxford' | 'graficaOxford'
  vertical?: 'padrao' | 'amplo' | 'compacto'
  vert?: 'educacao' | 'gestao-publica' | 'saude' | null
  className?: string
  id?: string
}
```

Atributo `data-vert` aplicado ao DOM para que CSS leia o vertical e troque o acento — mesmo padrão da skill `ntc-palestrantes` e dos folders.

### 3.3. `<Grade>`

Grade responsiva tipada.

```typescript
interface GradeProps {
  children: React.ReactNode
  colunas?: 2 | 3 | 4
  gap?: 'pequeno' | 'medio' | 'amplo'
  className?: string
}
```

Origem: grade 4 colunas de palestrantes; grade 3 colunas de cards de programa; grade 2 colunas de destaques editoriais.

---

## 4. Navegação

### 4.1. `<NavegacaoSoberana>`

Header principal do portal. Client Component (gerencia scroll, menu mobile).

```typescript
interface NavegacaoSoberanaProps {
  rotas: ItemMenu[]
  ctaPrincipal?: { rotulo: string; href: string }
  logoVariante?: 'light' | 'dark'   // default: detecta no scroll
}

interface ItemMenu {
  rotulo: string
  href?: string
  filhos?: { rotulo: string; href: string; descricao?: string }[]
}
```

Origem: prototipo home (todas as versões R2.x).
Comportamento: solid Oxford no top; transparente quando hero é claro; megamenu editorial para Soluções Estratégicas e Programas; menu mobile drawer (slide-from-right).

### 4.2. `<Breadcrumbs>`

Caminho editorial obrigatório em páginas internas.

```typescript
interface BreadcrumbsProps {
  itens: { rotulo: string; href?: string }[]
}
```

Origem: protótipos de Programa e Evento.
Renderiza schema.org JSON-LD `BreadcrumbList` automaticamente.

### 4.3. `<MenuMobileDrawer>`

Drawer ativado pela `<NavegacaoSoberana>` em mobile. Mesmo conteúdo, navegação hierárquica colapsável.

---

## 5. Hero family

Cinco variantes canônicas. Não criar outras sem solicitação.

### 5.1. `<HeroInstitucional>` — Home, O Grupo, páginas raiz.

```typescript
interface HeroInstitucionalProps {
  eyebrow?: string
  titulo: string
  subtitulo?: string
  imagem: { src: string; alt: string }
  ctas?: { rotulo: string; href: string; variante: 'primario' | 'secundario' }[]
  altura?: 'completa' | 'editorial'    // default: editorial (75vh)
}
```

Origem: `02_Prototipo_Home_GrupoNTC_v2_5.html`, `08_Pagina_O_Grupo_NTC_v2.html`.

### 5.2. `<HeroArea>` — páginas NTC Educação / Gestão Pública / Saúde.

```typescript
interface HeroAreaProps {
  area: 'educacao' | 'gestao-publica' | 'saude'
  eyebrow?: string
  titulo: string
  subtitulo?: string
  imagem: { src: string; alt: string }
  corAcento: string
}
```

Comportamento: lockup vertical da área no topo; filete cromático no acento da área; tipografia ampla.

### 5.3. `<HeroPrograma>` — página de cada um dos 15 programas.

```typescript
interface HeroProgramaProps {
  sigla: string
  nomeCompleto: string
  eyebrow?: string
  imagem: { src: string; alt: string }
  area: 'educacao' | 'gestao-publica' | 'saude'
  cargaHorariaTotal: string
  modulosQuantidade?: number
  ctaPrincipal?: { rotulo: string; href: string }
}
```

Origem: padrão derivado dos folders Folder_EDUTEC_NTC_2026.html e PROSUS+.
Comportamento: sigla em Cormorant size 1 com letterspacing editorial; nome completo abaixo; lockup do programa à direita; faixa de metadados (carga horária · módulos · modalidade) abaixo da fold.

### 5.4. `<HeroEvento>` — página de cada evento.

```typescript
interface HeroEventoProps {
  nome: string
  eyebrow?: string
  imagem: { src: string; alt: string }
  dataInicio: Date | string
  dataFim?: Date | string
  modalidade: 'online' | 'presencial' | 'hibrido'
  local?: { cidade: string; estado: string; nomeLocal?: string }
  programa?: { sigla: string; href: string }
  area: 'educacao' | 'gestao-publica' | 'saude'
  ctaInscricao?: { rotulo: string; href: string; externo: boolean }
}
```

Origem: `03_Pagina_Evento_PROSUS_Brasilia_v2.html`, `04_Pagina_Evento_EDUTEC_M01_Online_v1.html`.

### 5.5. `<HeroConteudo>` — páginas de artigos/insights/publicações.

```typescript
interface HeroConteudoProps {
  categoria: string
  titulo: string
  lide: string
  imagem: { src: string; alt: string }
  autor?: { nome: string; titulacao: string }
  dataPublicacao: Date | string
  tempoLeitura?: string
}
```

---

## 6. Cards editoriais

Cards são a moeda visual repetida do portal. Cinco famílias.

### 6.1. `<CardPrograma>`

```typescript
interface CardProgramaProps {
  sigla: string
  nomeCompleto: string
  eyebrow?: string
  imagem: { src: string; alt: string }
  area: 'educacao' | 'gestao-publica' | 'saude'
  resumoVisaoGeral?: string
  href: string
  variante?: 'editorial' | 'compacto'   // default: editorial
}
```

Variante editorial: imagem topo, sigla em Cormorant, nome completo, resumo, link "Conhecer o programa →".
Variante compacto: sem imagem, sigla + nome + área-tag.

### 6.2. `<CardEvento>`

```typescript
interface CardEventoProps {
  nome: string
  eyebrow?: string
  imagem: { src: string; alt: string }
  dataInicio: Date | string
  modalidade: 'online' | 'presencial' | 'hibrido'
  local?: { cidade: string; estado: string }
  programa?: { sigla: string }
  area: 'educacao' | 'gestao-publica' | 'saude'
  inscricaoAberta: boolean
  href: string
}
```

Comportamento: tag de modalidade no canto superior; data destacada em Cormorant; CTA "Detalhes →" se inscrição fechada, "Inscrever-se →" se aberta.

### 6.3. `<CardEspecialista>`

Foto proporção 20:23 (regra da skill `ntc-palestrantes`).

```typescript
interface CardEspecialistaProps {
  nome: string
  titulacao: string
  instituicao: string
  cargoAtual?: string
  foto: { src: string; alt: string }
  href?: string
  variante?: 'regular' | 'expandido' | 'cerimonial'  // default: regular
}
```

Origem: `25_Pagina_Corpo_Docente_v2.html` + skill `ntc-palestrantes`.

### 6.4. `<CardConteudo>`

```typescript
interface CardConteudoProps {
  titulo: string
  lide: string
  categoria: string
  imagem: { src: string; alt: string }
  area?: 'educacao' | 'gestao-publica' | 'saude'
  dataPublicacao: Date | string
  tempoLeitura?: string
  href: string
}
```

### 6.5. `<CardCliente>`

```typescript
interface CardClienteProps {
  nome: string
  logo: { src: string; alt: string }
  esfera?: string
  estado?: string
  variante?: 'mosaico' | 'lista'   // default: mosaico
}
```

Origem: bloco de credibilidade do Portfolio_Institucional.

---

## 7. Blocos editoriais

Blocos são unidades composíveis dentro de páginas. Aceitam tema cromático via `vert`.

### 7.1. `<BlocoNumeros>`

```typescript
interface BlocoNumerosProps {
  titulo?: string
  numeros: { valor: string; rotulo: string }[]   // max 4
  fundo?: 'osso' | 'pergaminho' | 'oxford'
  vert?: 'educacao' | 'gestao-publica' | 'saude'
}
```

Origem: Home + páginas de área.
Tipografia: valor em Cormorant 4-5rem, rótulo em Barlow uppercase letterspacing.

### 7.2. `<BlocoCitacao>`

```typescript
interface BlocoCitacaoProps {
  citacao: string
  autoria: string
  cargo?: string
  variante?: 'discreta' | 'cerimonial'  // default: discreta
}
```

Origem: Portfolio_Institucional + páginas de programa.

### 7.3. `<BlocoTexto>`

```typescript
interface BlocoTextoProps {
  titulo?: string
  eyebrow?: string
  corpo: RichTextContent       // Lexical content
  largura?: 'editorial' | 'texto'
}
```

Wrapper canônico para qualquer Rich Text vindo do Payload. Renderiza Lexical com mapeamento controlado: H2/H3/H4 → Cormorant escala; P → Barlow corpo; A → link editorial; strong → semibold; em → italic.

### 7.4. `<BlocoCtaInstitucional>`

```typescript
interface BlocoCtaInstitucionalProps {
  titulo: string
  descricao?: string
  rotuloCta: string
  linkCta: string
  variante?: 'oxford' | 'cardeal' | 'oliva' | 'neutro'  // default: oxford
  imagem?: { src: string; alt: string }   // opcional, lateral
}
```

Origem: rodapé das páginas institucionais + portfolio.

### 7.5. `<BlocoImagemLegenda>`

```typescript
interface BlocoImagemLegendaProps {
  imagem: { src: string; alt: string }
  legenda?: string
  credito?: string
  proporcao?: '16:9' | '4:3' | '3:2' | '20:23'
  largura?: 'editorial' | 'amplo'
}
```

### 7.6. `<BlocoFaq>`

```typescript
interface BlocoFaqProps {
  titulo?: string
  itens: { pergunta: string; resposta: RichTextContent }[]
  variante?: 'acordeao' | 'expandido'   // default: acordeao
}
```

Renderiza schema.org `FAQPage` JSON-LD.

### 7.7. `<BlocoProgramacao>`

Específico para página de Evento — timeline editorial.

```typescript
interface BlocoProgramacaoProps {
  titulo?: string
  itens: {
    horario: string
    titulo: string
    descricao?: string
    palestrantes?: { nome: string; href?: string }[]
  }[]
}
```

---

## 8. Listings e grids

### 8.1. `<GradeProgramas>`

```typescript
interface GradeProgramasProps {
  programas: ProgramaItem[]
  agruparPorArea?: boolean    // default: true
  variante?: 'editorial' | 'compacto'
  filtroAtivo?: 'todos' | 'educacao' | 'gestao-publica' | 'saude'
}
```

### 8.2. `<GradeEventos>`

```typescript
interface GradeEventosProps {
  eventos: EventoItem[]
  agruparPorMes?: boolean    // default: true para agenda
  ordenacao?: 'cronologica' | 'destaque'
  vazio?: React.ReactNode    // estado vazio editorial
}
```

### 8.3. `<GradeEspecialistas>`

Grade 4 colunas conforme skill `ntc-palestrantes`. Aceita modos `regular`, `expandido`, `cerimonial`.

```typescript
interface GradeEspecialistasProps {
  especialistas: EspecialistaItem[]
  modo?: 'regular' | 'expandido' | 'cerimonial'
  vert?: 'educacao' | 'gestao-publica' | 'saude'
}
```

### 8.4. `<ListaModulos>`

Específico para página de Programa. Lista numerada de módulos com ementa.

```typescript
interface ListaModulosProps {
  modulos: {
    numero: number
    titulo: string
    ementa: RichTextContent
    cargaHoraria?: string
    eventosVinculados?: { nome: string; href: string }[]
  }[]
  variante?: 'completa' | 'sumario'
}
```

### 8.5. `<FiltrosAgenda>`

Client Component. Controla filtros de modalidade, área, programa, mês.

```typescript
interface FiltrosAgendaProps {
  programasDisponiveis: { sigla: string; nomeCompleto: string }[]
  estadoInicial?: Partial<FiltroEstado>
  onChange: (filtros: FiltroEstado) => void
}

interface FiltroEstado {
  modalidade: 'todos' | 'online' | 'presencial' | 'hibrido'
  area: 'todos' | 'educacao' | 'gestao-publica' | 'saude'
  programa?: string
  mes?: string  // 'YYYY-MM'
}
```

---

## 9. Formulários

### 9.1. `<FormularioSoberano>`

Container de formulário com layout editorial.

```typescript
interface FormularioSoberanoProps {
  titulo: string
  eyebrow?: string
  descricao?: string
  campos: React.ReactNode
  rodape?: React.ReactNode   // política LGPD, botão submit
  onSubmit: (data: FormData) => Promise<{ ok: boolean; message: string }>
  estadoSucesso?: React.ReactNode
}
```

### 9.2. Campos atômicos

```typescript
<CampoTexto label="Nome" name="nome" required />
<CampoEmail label="E-mail institucional" name="email" required />
<CampoTelefone label="Telefone" name="telefone" required />
<CampoSelect label="Esfera" name="esfera" opcoes={[...]} required />
<CampoTextarea label="Mensagem" name="mensagem" linhas={5} />
<CampoUpload label="Currículo (PDF)" name="curriculo" aceita="application/pdf" maxMb={10} />
<CampoCheckbox label="Li e concordo com a Política de Privacidade" name="consentimentoLgpd" linkPolitica="/politica-de-privacidade" required />
```

Todos compartilham:
- Label em Barlow uppercase, letterspacing 0.08em, size 0.75rem.
- Input com border-bottom apenas (não retangular completo), border-color `--linha-sutil`, focus border `--oxford`.
- Erro inline em `--vermelho-erro`, mostrado abaixo do campo.
- Helper text opcional acima do erro.

### 9.3. `<BotaoSoberano>` (usado em forms e em CTAs)

```typescript
interface BotaoSoberanoProps {
  variante: 'primario' | 'secundario' | 'fantasma' | 'editorial'
  tamanho?: 'medio' | 'amplo'
  href?: string         // se href, renderiza como <a>
  type?: 'button' | 'submit'
  disabled?: boolean
  carregando?: boolean
  externo?: boolean     // adiciona target="_blank" + indicador
  children: React.ReactNode
}
```

Variantes:
- `primario`: fundo Oxford, texto osso, sem borda.
- `secundario`: fundo transparente, borda Oxford 1.5px, texto Oxford.
- `fantasma`: somente texto Oxford com underline editorial no hover.
- `editorial`: Cormorant italic ampliado, link-like, para CTAs cerimoniais.

---

## 10. Utilitários tipográficos

### 10.1. `<Eyebrow>`

```typescript
interface EyebrowProps {
  children: React.ReactNode
  vert?: 'educacao' | 'gestao-publica' | 'saude'
  variante?: 'padrao' | 'dourado'
}
```

Barlow 0.75rem uppercase letterspacing 0.16em.

### 10.2. `<TituloSecao>`

```typescript
interface TituloSecaoProps {
  eyebrow?: string
  titulo: string
  subtitulo?: string
  alinhamento?: 'esquerda' | 'centro'
  vert?: 'educacao' | 'gestao-publica' | 'saude'
}
```

### 10.3. `<LinkEditorial>`

Link com underline editorial sutil + animação discreta no hover.

```typescript
interface LinkEditorialProps {
  href: string
  externo?: boolean
  variante?: 'padrao' | 'inverso'
  children: React.ReactNode
}
```

### 10.4. `<Selo>` (pílula)

```typescript
interface SeloProps {
  variante: 'dourado' | 'oxford' | 'neutro' | 'cardeal' | 'oliva'
  children: React.ReactNode
  tamanho?: 'pequeno' | 'medio'
}
```

Para tags de modalidade, status de inscrição, categorias.

---

## 11. Rodapé e elementos institucionais

### 11.1. `<RodapeSoberano>`

```typescript
interface RodapeSoberanoProps {
  // Carrega dados do Global Rodape via Payload
  dados: RodapeData
}
```

Estrutura: 4 colunas (Mapa do site · Soluções · Conteúdos · Contato) + linha cerimonial com assinatura institucional + barra com CNPJ, razão social, links legais.

### 11.2. `<AssinaturaInstitucional>`

Bloco cerimonial com lockup, slogan e CTA institucional.

### 11.3. `<BarraInstitucional>`

Barra estreita no topo do header com contatos rápidos institucionais (e-mail, telefone). Opcional — controlada pelo Rodape global.

---

## 12. Helpers e widgets sistêmicos

### 12.1. `<ImagemSoberana>`

Wrapper de `next/image` com defaults editoriais.

```typescript
interface ImagemSoberanaProps {
  src: string
  alt: string
  proporcao?: '16:9' | '4:3' | '3:2' | '20:23' | '1:1'
  prioridade?: boolean
  sizes?: string
  className?: string
}
```

### 12.2. `<MetadataSoberana>` (helper de SEO)

Função utilitária para gerar `metadata` do Next.js a partir do conteúdo Payload, com fallbacks editoriais e Open Graph.

```typescript
export function montaMetadataSoberana(input: {
  titulo: string
  descricao: string
  imagemOg?: string
  tipo?: 'website' | 'article' | 'event'
}): Metadata
```

### 12.3. `<BannerCookies>`

Banner LGPD com consentimento granular.

```typescript
interface BannerCookiesProps {
  politicaVersao: string
  categorias: ('essencial' | 'analytics' | 'marketing')[]
}
```

Persiste decisão em cookie `ntc_cookies_consent_v1` (não localStorage — cookie precisa estar disponível no SSR).

### 12.4. `<JsonLd>`

Helper para injetar schema.org JSON-LD em qualquer página.

```typescript
interface JsonLdProps {
  schema: object
}
```

### 12.5. `<Revelar>` (animação discreta de entrada)

Client Component. IntersectionObserver. Fade-in + slide-up sutil (8px). Duração 400ms.

```typescript
interface RevelarProps {
  children: React.ReactNode
  delay?: number
}
```

Use com parcimônia — apenas em blocos editoriais cerimoniais (heros, números de impacto, citações).

---

## 13. Mapa de protótipos → componentes

Tabela de origem para Claude Code consultar.

| Protótipo HTML | Página de destino | Componentes principais |
|---|---|---|
| `02_Prototipo_Home_GrupoNTC_v2_5.html` | `/` (Home) | `<HeroInstitucional>`, `<BlocoNumeros>`, `<GradeProgramas>`, `<GradeEventos>`, `<BlocoCtaInstitucional>`, `<RodapeSoberano>` |
| `08_Pagina_O_Grupo_NTC_v2.html` | `/o-grupo` | `<HeroInstitucional>`, `<BlocoTexto>`, `<BlocoCitacao>`, `<BlocoNumeros>`, `<GradeEspecialistas>`, `<BlocoCtaInstitucional>` |
| `03_Pagina_Evento_PROSUS_Brasilia_v2.html` | `/eventos/[slug]` (template) | `<HeroEvento>`, `<BlocoTexto>`, `<BlocoProgramacao>`, `<GradeEspecialistas>`, `<BlocoFaq>`, `<BotaoSoberano>` |
| `04_Pagina_Evento_EDUTEC_M01_Online_v1.html` | `/eventos/[slug]` (template) | mesmos do PROSUS, modalidade online |
| `09_Pagina_Agenda_v1.html` | `/agenda` | `<HeroArea>`-light, `<FiltrosAgenda>`, `<GradeEventos>` |
| `25_Pagina_Corpo_Docente_v2.html` | `/o-grupo/corpo-docente` | `<HeroInstitucional>`, `<GradeEspecialistas>` modo expandido |
| `Portfolio_Institucional_Grupo_NTC_2026_v8_7.html` | (governança) | Fonte de regras editoriais e padrões cromáticos |
| `GrupoNTC_Evolucao_Cromatica_Premium_2026.html` | (governança) | Sistema cromático canônico |

Templates a derivar das skills do plugin `ntc-grupo`:
- Página de Programa: derivada de `Folder_EDUTEC_NTC_2026.html` (consultar skill `ntc-grupo:ntc-folder-programa`).
- Página de Área: derivada do Portfolio_Institucional + páginas de programa.

---

## 14. Política de criação de componentes novos

**Quando criar componente novo.** Se o protótipo HTML apresentar elemento visual ainda não inventariado **E** ele aparecer em mais de uma página **E** for solicitado explicitamente pelo usuário ou identificado em sessão de revisão.

**Quando NÃO criar componente novo.** Para variações pontuais — usar prop `variante` no componente existente. Para conteúdo único de uma página — compor com blocos existentes. Para experimentar layout — não.

**Processo de aprovação.** Claude Code propõe o componente em comentário no PR (descrição, props, justificativa, protótipo de origem). Aguarda aprovação humana antes de codar. Após aprovado, atualizar este inventário (`12_Inventario_Componentes_Editoriais_v2.md`) na mesma PR.

**Antipadrões proibidos.**

- Card "moderno" com sombra elevada e hover transformação.
- Botões pill com gradient.
- Tipografia decorativa (script, slab heavy).
- Ícones genéricos lucide-react/heroicons sem curadoria.
- Animações enérgicas (bouncing, rotação contínua).
- Layouts em mosaico irregular sem grade base.
- Cards arredondados (`rounded-xl`, `rounded-2xl`).
- Cores fora dos tokens.

---

**Fim do documento.**
*Inventário de Componentes Editoriais · v1 · 15 de maio de 2026 · Instituto NTC do Brasil*
