/**
 * Parser de folder de evento do Instituto NTC (template "Nova Data").
 *
 * Recebe o texto por página extraído pelo unpdf e localiza as seções pelos
 * títulos em maiúsculas com letras espaçadas ("D A T A", "P R O G R A M A Ç Ã O
 * D E T A L H A D A"…), que são normalizados para chaves compactas ("DATA",
 * "PROGRAMACAODETALHADA"). Seção ausente ⇒ campo null/vazio — o import nunca
 * falha por seção faltante (spec 2026-07-09 §1/§6).
 */

export interface PalestranteFolder {
  nome: string;
  /** Linha(s) de titulação em caps, despaçadas (ex.: "DOUTORAEMCIENCIAS · UNICAMP"). */
  linhaTitulacao: string;
  minicurriculo: string;
}

export interface ItemProgramacaoFolder {
  horario: string;
  titulo: string;
  descricao: string | null;
  nomePalestrante: string | null;
}

export interface DiferencialFolder {
  titulo: string;
  descricao: string;
}

export interface SessaoConteudoFolder {
  titulo: string;
  itens: string[];
}

export interface DadosFolderEvento {
  nome: string | null;
  eyebrow: string | null;
  modalidade: "online" | "presencial" | "hibrido" | null;
  resumo: string | null;
  dataInicioISO: string | null;
  cargaHoraria: string | null;
  sobre: string[];
  publicoAlvo: string[];
  objetivo: string[];
  diferenciais: DiferencialFolder[];
  palestrantes: PalestranteFolder[];
  programacao: ItemProgramacaoFolder[];
  sessoesConteudo: SessaoConteudoFolder[];
  valor: string | null;
  replayDisponivel: boolean;
  prazoReplay: string | null;
  plataforma: string | null;
}

// ---- utilidades ----------------------------------------------------------

/** "C A R G A  H O R Á R I A" | "D AT A" → "CARGAHORARIA" | "DATA". */
export function chaveDeLinha(linha: string): string {
  return linha
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

/** true quando a linha não tem minúsculas (candidata a marcador de seção). */
export function ehLinhaMarcador(linha: string): boolean {
  const l = linha.trim();
  return l.length > 0 && !/[a-zà-öø-ÿ]/.test(l);
}

const MESES: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  marco: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

/** "15 de Junho de 2026" → "2026-06-15" (null se não reconhecer). */
export function dataPtParaISO(texto: string): string | null {
  const m = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .match(/(\d{1,2})\s*de\s*([a-z]+)\s*de\s*(\d{4})/);
  if (!m) return null;
  const [, dia, nomeMes, ano] = m;
  const mes = nomeMes !== undefined ? MESES[nomeMes] : undefined;
  if (!mes || dia === undefined || ano === undefined) return null;
  return `${ano}-${mes}-${dia.padStart(2, "0")}`;
}

/** Índice da página cujo topo (8 primeiras linhas) contém a chave, ou -1. */
export function encontrarPagina(paginas: string[], chave: string): number {
  return paginas.findIndex((pagina) =>
    pagina
      .split("\n")
      .slice(0, 8)
      .some((linha) => chaveDeLinha(linha).includes(chave)),
  );
}

/** Linhas úteis da página: aparadas, sem vazias e sem o rodapé institucional. */
function linhasDePagina(pagina: string): string[] {
  return pagina
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.includes("Inteligência institucional. Impacto real."));
}


/** Acesso seguro por índice (tsconfig noUncheckedIndexedAccess): fora do range ⇒ "". */
function em(arr: readonly string[], i: number): string {
  return arr[i] ?? "";
}

/**
 * Agrupa linhas em itens: item novo quando a linha começa com maiúscula;
 * linha iniciada em minúscula é continuação (quebra de linha do PDF).
 */
function agruparItens(linhas: string[]): string[] {
  const itens: string[] = [];
  for (const linha of linhas) {
    if (itens.length > 0 && /^[a-zà-öø-ÿ(—–-]/.test(linha)) {
      itens[itens.length - 1] += ` ${linha}`;
    } else {
      itens.push(linha);
    }
  }
  return itens;
}

/** Agrupa linhas em sentenças (quebra quando a linha termina em "."). */
function agruparSentencas(linhas: string[]): string[] {
  const sentencas: string[] = [];
  let atual = "";
  for (const linha of linhas) {
    atual = atual.length > 0 ? `${atual} ${linha}` : linha;
    if (/[.!?]$/.test(linha)) {
      sentencas.push(atual);
      atual = "";
    }
  }
  if (atual.length > 0) sentencas.push(atual);
  return sentencas;
}

/** Recola drop-cap do template: "E ste módulo…" → "Este módulo…". */
function recolarDropCap(texto: string): string {
  return texto.replace(/^([A-ZÀ-Ü])\s(?=[a-zà-öø-ÿ])/, "$1");
}

// ---- capa ----------------------------------------------------------------

function parsearCapa(pagina: string) {
  const linhas = linhasDePagina(pagina);
  const primeira = linhas[0] ?? "";

  const fonteModalidade = /h[ií]brid|on-?line|presencial/i.test(primeira) ? primeira : pagina;
  const modalidade: DadosFolderEvento["modalidade"] = /h[ií]brid/i.test(fonteModalidade)
    ? "hibrido"
    : /on-?line/i.test(fonteModalidade)
      ? "online"
      : /presencial/i.test(fonteModalidade)
        ? "presencial"
        : null;

  const idxData = linhas.findIndex((l) => chaveDeLinha(l) === "DATA");
  const nome =
    idxData > 1
      ? linhas
          .slice(1, idxData)
          .join(" ")
          .replace(/\s+/g, " ")
      : null;
  const dataInicioISO = idxData >= 0 ? dataPtParaISO(em(linhas, idxData + 1)) : null;

  const idxCarga = linhas.findIndex((l) => chaveDeLinha(l) === "CARGAHORARIA");
  const cargaHoraria = idxCarga >= 0 && em(linhas, idxCarga + 1).length > 0 ? em(linhas, idxCarga + 1) : null;

  // O unpdf mescla os marcadores do rodapé da capa numa linha só:
  // "…P A L E S T R A N T E S D O E V E N T OT R I L H A E D U T E C ·
  //  M Ó D U L O 0 1 · 2 0 2 6Fundamentos, repertórios…".
  let eyebrow: string | null = null;
  let resumo: string | null = null;
  const idxTrilha = linhas.findIndex((l) => chaveDeLinha(l).includes("TRILHA"));
  if (idxTrilha >= 0) {
    const linha = em(linhas, idxTrilha);
    const m = linha.match(/T\s?R\s?I\s?L\s?H\s?A[\sA-ZÀ-Ü0-9·]*?\d\s?\d\s?\d\s?\d/);
    if (m) {
      const segmentos = m[0].split("·").map((s) => s.replace(/\s/g, ""));
      eyebrow = segmentos
        .map((s) =>
          s
            .replace(/^TRILHA/, "TRILHA ")
            .replace(/^MÓDULO/, "MÓDULO ")
            .trim(),
        )
        .join(" · ");

      // O resumo é o texto colado após o ano + continuações até o ponto final.
      const resto = linha.slice((m.index ?? 0) + m[0].length).trim();
      if (resto.length > 0) {
        const continuacao: string[] = [resto];
        for (let i = idxTrilha + 1; i < linhas.length && !/[.!?]$/.test(continuacao.at(-1) ?? ""); i++) {
          const prox = em(linhas, i);
          if (ehLinhaMarcador(prox)) break;
          continuacao.push(prox);
        }
        resumo = continuacao.join(" ").replace(/\s+/g, " ");
      }
    }
  }

  return { modalidade, nome, dataInicioISO, cargaHoraria, eyebrow, resumo };
}

// ---- seções de texto -----------------------------------------------------

function parsearSobre(paginas: string[]): string[] {
  const idx = encontrarPagina(paginas, "SOBREESTEMODULO");
  if (idx < 0) return [];
  const linhas = linhasDePagina(em(paginas, idx));
  // O corpo começa na linha com drop-cap ("E ste módulo…"); antes vem o
  // subtítulo editorial da página.
  const inicio = linhas.findIndex((l) => /^[A-ZÀ-Ü]\s[a-zà-öø-ÿ]/.test(l));
  const corpo = linhas.slice(inicio >= 0 ? inicio : 2).filter((l) => !ehLinhaMarcador(l));
  return agruparSentencas(corpo).map(recolarDropCap);
}

const SUBTITULOS_TEMPLATE = /^(Por que este m[óo]dulo|Para quem [ée] este|existe$|m[óo]dulo$)/i;

function parsearObjetivoPublico(paginas: string[]): { objetivo: string[]; publicoAlvo: string[] } {
  const idx = encontrarPagina(paginas, "OBJETIVOPUBLICOFORMATO");
  if (idx < 0) return { objetivo: [], publicoAlvo: [] };
  const linhas = linhasDePagina(em(paginas, idx));

  function fatia(chaveInicio: string, chavesFim: string[]): string[] {
    const i = linhas.findIndex((l) => chaveDeLinha(l) === chaveInicio);
    if (i < 0) return [];
    let fim = linhas.length;
    for (let j = i + 1; j < linhas.length; j++) {
      const linhaJ = em(linhas, j);
      if (ehLinhaMarcador(linhaJ) && chavesFim.some((c) => chaveDeLinha(linhaJ).startsWith(c))) {
        fim = j;
        break;
      }
    }
    return linhas.slice(i + 1, fim).filter((l) => !ehLinhaMarcador(l));
  }

  const objetivo = agruparItens(fatia("OBJETIVO", ["PUBLICO", "FORMATO", "CERTIFICACAO"])).filter(
    (item) => !SUBTITULOS_TEMPLATE.test(item),
  );
  const publicoAlvo = agruparItens(fatia("PUBLICOALVO", ["FORMATO", "CERTIFICACAO"])).filter(
    (item) => !SUBTITULOS_TEMPLATE.test(item),
  );
  return { objetivo, publicoAlvo };
}

function parsearDiferenciais(paginas: string[]): DiferencialFolder[] {
  const idx = encontrarPagina(paginas, "DESTAQUESDIFERENCIAIS");
  if (idx < 0) return [];
  const linhas = linhasDePagina(em(paginas, idx));
  const inicio = linhas.findIndex((l) => /^Destaques formativos$/i.test(l));
  if (inicio < 0) return [];
  const corpo = linhas
    .slice(inicio + 1)
    .filter((l) => !ehLinhaMarcador(l) && !/^Diferenciais NTC$/i.test(l));
  return agruparSentencas(corpo).map((sentenca) => ({ titulo: "", descricao: sentenca }));
}

const SESSAO_RE = /^S\s?E\s?S\s?S\s?[ÃA]\s?O\s*·?\s*(?:\d\s?\d)?\s*(.*)$/;
// Nas linhas mescladas o título vem seguido de "com Fulano · NNhNN" (o unpdf
// às vezes quebra o kerning: "c om").
const CORTE_COM_RE = /\bc\s?om\s+[A-ZÀ-Ü][^·]*·\s*\d/;

function parsearSessoes(paginas: string[]): SessaoConteudoFolder[] {
  const sessoes: SessaoConteudoFolder[] = [];
  for (let p = 0; p < paginas.length; p++) {
    const topo = em(paginas, p).split("\n").slice(0, 4).join("");
    if (!chaveDeLinha(topo).includes("OQUEVOCEAPRENDERA")) {
      continue;
    }
    const linhas = linhasDePagina(em(paginas, p));
    let atual: SessaoConteudoFolder | null = null;
    let lendoTitulo = false;
    for (const linha of linhas) {
      const chave = chaveDeLinha(linha);
      const mSessao = /^S\s?E\s?S\s?S/.test(linha) ? linha.match(SESSAO_RE) : null;
      if (mSessao) {
        atual = { titulo: "", itens: [] };
        sessoes.push(atual);
        const resto = (mSessao[1] ?? "").trim();
        if (resto.length > 0) {
          // Marcador mesclado com título + "com Fulano · horário" na mesma linha.
          const corte = resto.search(CORTE_COM_RE);
          atual.titulo = (corte >= 0 ? resto.slice(0, corte) : resto).trim();
          lendoTitulo = false;
        } else {
          lendoTitulo = true;
        }
        continue;
      }
      if (!atual) continue;
      // Número da sessão em linha própria ("0 1") logo após o marcador.
      if (ehLinhaMarcador(linha) && /^\d{1,2}$/.test(chave)) continue;
      if (ehLinhaMarcador(linha)) continue;
      if (/^com\s/i.test(linha)) {
        lendoTitulo = false;
        continue;
      }
      const item = linha.match(/^(\d{2})\s+(.+)$/);
      if (item) {
        lendoTitulo = false;
        atual.itens.push((item[2] ?? "").trim());
        continue;
      }
      if (lendoTitulo) {
        atual.titulo = atual.titulo.length > 0 ? `${atual.titulo} ${linha}` : linha;
      } else if (atual.itens.length > 0 && /^[a-zà-öø-ÿ]/.test(linha)) {
        atual.itens[atual.itens.length - 1] += ` ${linha}`;
      }
    }
  }
  return sessoes.filter((s) => s.titulo.length > 0 || s.itens.length > 0);
}

// ---- programação e palestrantes ------------------------------------------

const HORARIO_RE = /^\d{2}h\d{2}\s*[–—-]\s*\d{2}h\d{2}$/;

function parsearProgramacao(paginas: string[]): ItemProgramacaoFolder[] {
  const idx = encontrarPagina(paginas, "PROGRAMACAODETALHADA");
  if (idx < 0) return [];
  const linhas = linhasDePagina(em(paginas, idx));
  const itens: ItemProgramacaoFolder[] = [];
  let atual: ItemProgramacaoFolder | null = null;
  let lendoTitulo = false;
  const descricao: string[] = [];

  function fecharItem() {
    if (atual) {
      atual.descricao = descricao.length > 0 ? descricao.join(" ").replace(/\s*·\s*/g, " · ") : null;
      itens.push(atual);
    }
    descricao.length = 0;
  }

  for (const linha of linhas) {
    if (HORARIO_RE.test(linha)) {
      fecharItem();
      atual = { horario: linha.replace(/\s+/g, " "), titulo: "", descricao: null, nomePalestrante: null };
      lendoTitulo = true;
      continue;
    }
    if (!atual || ehLinhaMarcador(linha)) continue;
    const com = linha.match(/^com\s+(.+)$/i);
    if (com) {
      lendoTitulo = false;
      atual.nomePalestrante = ((com[1] ?? "").split("·")[0] ?? "").trim();
      continue;
    }
    if (lendoTitulo) {
      atual.titulo = atual.titulo.length > 0 ? `${atual.titulo} ${linha}` : linha;
    } else if (linha !== "·") {
      descricao.push(linha);
    }
  }
  fecharItem();
  return itens.filter((i) => i.titulo.length > 0);
}

function parsearPalestrantes(paginas: string[]): PalestranteFolder[] {
  const idx = encontrarPagina(paginas, "CONHECANOSSOSPALESTRANTES");
  if (idx < 0) return [];
  const linhas = linhasDePagina(em(paginas, idx));

  // Pula o marcador do topo e o subtítulo editorial (linhas até o primeiro
  // candidato a nome: linha curta em caixa mista seguida de linha em caps).
  const palestrantes: PalestranteFolder[] = [];
  let atual: PalestranteFolder | null = null;
  let lendoTitulacao = false;

  function ehNome(i: number): boolean {
    const linha = em(linhas, i);
    const proxima = i + 1 < linhas.length ? em(linhas, i + 1) : "";
    return (
      linha.length > 0 &&
      !ehLinhaMarcador(linha) &&
      !/[.:!?]$/.test(linha) &&
      linha.split(/\s+/).length <= 6 &&
      /^[A-ZÀ-Ü]/.test(linha) &&
      proxima.length > 0 &&
      ehLinhaMarcador(proxima)
    );
  }

  for (let i = 0; i < linhas.length; i++) {
    const linha = em(linhas, i);
    if (ehNome(i)) {
      atual = { nome: linha, linhaTitulacao: "", minicurriculo: "" };
      palestrantes.push(atual);
      lendoTitulacao = true;
      continue;
    }
    if (!atual) continue;
    if (ehLinhaMarcador(linha)) {
      if (lendoTitulacao) {
        const segmento = linha
          .split("·")
          .map((s) => s.replace(/\s/g, ""))
          .join(" · ");
        atual.linhaTitulacao =
          atual.linhaTitulacao.length > 0 ? `${atual.linhaTitulacao} ${segmento}` : segmento;
      }
      continue;
    }
    lendoTitulacao = false;
    atual.minicurriculo = atual.minicurriculo.length > 0 ? `${atual.minicurriculo} ${linha}` : linha;
  }
  return palestrantes;
}

// ---- valor, replay, plataforma -------------------------------------------

function parsearValor(paginas: string[]): string | null {
  const idx = encontrarPagina(paginas, "INVESTIMENTO");
  if (idx < 0) return null;
  const linhas = linhasDePagina(em(paginas, idx));
  const i = linhas.findIndex((l) => chaveDeLinha(l).startsWith("INVESTIMENTOPORPARTICIPANTE"));
  for (let j = Math.max(i + 1, 0); j < linhas.length; j++) {
    const m = em(linhas, j).match(/^([\d.]+(?:,\d{2})?)/);
    if (m?.[1] !== undefined) return `R$ ${m[1]}`;
  }
  return null;
}

function parsearReplay(paginas: string[]): { replayDisponivel: boolean; prazoReplay: string | null } {
  for (const pagina of paginas) {
    const linhas = linhasDePagina(pagina);
    const i = linhas.findIndex((l) => chaveDeLinha(l) === "REPLAY");
    if (i < 0) continue;
    const trecho: string[] = [];
    for (let j = i + 1; j < linhas.length; j++) {
      const linha = linhas[j];
      if (linha === undefined || ehLinhaMarcador(linha)) break;
      trecho.push(linha);
    }
    if (trecho.length > 0) {
      return { replayDisponivel: true, prazoReplay: trecho.join(" ").replace(/\s+/g, " ") };
    }
  }
  return { replayDisponivel: false, prazoReplay: null };
}

function parsearPlataforma(paginas: string[]): string | null {
  return encontrarPagina(paginas, "PLATAFORMAEVENTONNTC") >= 0 ? "EventON NTC" : null;
}

// ---- entrada principal ----------------------------------------------------

export function parsearFolderEvento(paginas: string[]): DadosFolderEvento {
  const capa = paginas[0] !== undefined ? parsearCapa(paginas[0]) : null;
  const { objetivo, publicoAlvo } = parsearObjetivoPublico(paginas);
  const replay = parsearReplay(paginas);

  return {
    nome: capa?.nome ?? null,
    eyebrow: capa?.eyebrow ?? null,
    modalidade: capa?.modalidade ?? null,
    resumo: capa?.resumo ?? null,
    dataInicioISO: capa?.dataInicioISO ?? null,
    cargaHoraria: capa?.cargaHoraria ?? null,
    sobre: parsearSobre(paginas),
    publicoAlvo,
    objetivo,
    diferenciais: parsearDiferenciais(paginas),
    palestrantes: parsearPalestrantes(paginas),
    programacao: parsearProgramacao(paginas),
    sessoesConteudo: parsearSessoes(paginas),
    valor: parsearValor(paginas),
    replayDisponivel: replay.replayDisponivel,
    prazoReplay: replay.prazoReplay,
    plataforma: parsearPlataforma(paginas),
  };
}
