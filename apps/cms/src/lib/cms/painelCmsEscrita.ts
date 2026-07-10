import "server-only";

import { casarOuCriarPalestrantes } from "@/lib/importacaoPdf/casarOuCriarPalestrantes";
import { textoParaLexical } from "@/lib/lexicalBuilders";
import { extrairTextoPdf } from "@/lib/importacaoPdf/extrairTextoPdf";
import { montarCamposEvento } from "@/lib/importacaoPdf/montarCamposEvento";
import { parsearFolderEvento } from "@/lib/importacaoPdf/parsearFolderEvento";
import { obterPayload } from "@/lib/payloadClient";

/**
 * Escrita de eventos para o Painel Admin — via Local API do
 * Payload (mesmo motor do admin). Edita campos de texto e faz upload de capa
 * e folder PDF, que passam pela coleção Media (variantes Sharp + Supabase
 * Storage + registro), preservando o serviço de upload existente.
 *
 * server-only: nunca vaza ao browser. Escopo restrito: nome/data/resumo +
 * imagemCapa/folderPdf. Não toca schema, não apaga nada.
 */

export interface ResultadoEscrita {
  ok: boolean;
  erro?: string;
}

export interface CamposEventoCompletos {
  nome: string;
  dataInicio: string;
  dataFim: string;
  resumo: string;
  modalidade: string;
  cargaHoraria: string;
  valor: string;
  linkInscricaoExterna: string;
  localNome: string;
  localEndereco: string;
  localCidade: string;
  localEstado: string;
  replayDisponivel: boolean;
  prazoReplay: string;
  /** Textos planos do editor: linhas viram parágrafos, "- " vira lista. */
  publicoAlvoTexto: string;
  objetivosTexto: string;
  conteudoProgramaticoTexto: string;
  programacaoDetalhada: { horario: string; titulo: string; descricao: string }[];
  diferenciais: { titulo: string; descricao: string }[];
  faq: { pergunta: string; respostaTexto: string }[];
}

/** "" ⇒ null (limpa o campo no Payload em vez de gravar string vazia). */
function ouNulo(valor: string): string | null {
  const v = valor.trim();
  return v.length > 0 ? v : null;
}

/**
 * Valida as linhas repetíveis antes do update: linha totalmente vazia é
 * descartada, mas linha parcialmente preenchida sem os campos mínimos vira
 * erro — filtrar em silêncio apagava conteúdo digitado sem aviso.
 */
function validarLinhas(campos: CamposEventoCompletos): string | null {
  const progIncompleta = campos.programacaoDetalhada.findIndex(
    (p) =>
      [p.horario, p.titulo, p.descricao].some((v) => v.trim().length > 0) &&
      (p.horario.trim().length === 0 || p.titulo.trim().length === 0),
  );
  if (progIncompleta >= 0) {
    return `Programação detalhada: a sessão ${progIncompleta + 1} precisa de horário e título — complete ou remova a linha.`;
  }
  const faqIncompleta = campos.faq.findIndex(
    (f) => f.respostaTexto.trim().length > 0 && f.pergunta.trim().length === 0,
  );
  if (faqIncompleta >= 0) {
    return `Perguntas frequentes: a linha ${faqIncompleta + 1} tem resposta sem pergunta — complete ou remova a linha.`;
  }
  return null;
}

export async function salvarCamposEvento(
  id: string,
  campos: CamposEventoCompletos,
): Promise<ResultadoEscrita> {
  try {
    const erroLinhas = validarLinhas(campos);
    if (erroLinhas) return { ok: false, erro: erroLinhas };

    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: {
        nome: campos.nome,
        // Campo required no schema: import sem data parseada chega como "" e a
        // chave é omitida (string vazia estoura no timestamptz do Postgres);
        // o rascunho segue sem data até o editor preencher.
        ...(campos.dataInicio.trim().length > 0 ? { dataInicio: campos.dataInicio } : {}),
        dataFim: ouNulo(campos.dataFim),
        resumo: campos.resumo,
        // Também required: "" (placeholder "— selecionar —") não sobrescreve.
        ...(campos.modalidade ? { modalidade: campos.modalidade } : {}),
        cargaHoraria: campos.cargaHoraria,
        valor: ouNulo(campos.valor),
        linkInscricaoExterna: ouNulo(campos.linkInscricaoExterna),
        local: {
          nomeLocal: ouNulo(campos.localNome),
          endereco: ouNulo(campos.localEndereco),
          cidade: ouNulo(campos.localCidade),
          estado: ouNulo(campos.localEstado),
        },
        replayDisponivel: campos.replayDisponivel,
        prazoReplay: ouNulo(campos.prazoReplay),
        publicoAlvo: textoParaLexical(campos.publicoAlvoTexto),
        objetivos: textoParaLexical(campos.objetivosTexto),
        conteudoProgramatico: textoParaLexical(campos.conteudoProgramaticoTexto),
        programacaoDetalhada: campos.programacaoDetalhada
          .filter((p) => p.horario.trim().length > 0 && p.titulo.trim().length > 0)
          .map((p) => ({ horario: p.horario, titulo: p.titulo, descricao: ouNulo(p.descricao) })),
        diferenciais: campos.diferenciais
          .filter((d) => d.titulo.trim().length > 0 || d.descricao.trim().length > 0)
          .map((d) => ({ titulo: ouNulo(d.titulo), descricao: ouNulo(d.descricao) })),
        faq: campos.faq
          .filter((f) => f.pergunta.trim().length > 0)
          .map((f) => ({ pergunta: f.pergunta, resposta: textoParaLexical(f.respostaTexto) })),
      },
      // draft: true mantém o documento no mesmo estado de publicação (rascunho
      // continua rascunho); não força publish.
      draft: true,
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao salvar." };
  }
}

/**
 * Publica o evento: promove o rascunho atual a publicado (_status: published,
 * sem draft:true). Faz a versão editada/com capa nova ir ao ar no site.
 */
export async function publicarEvento(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: { _status: "published" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao publicar." };
  }
}

/**
 * Vincula a lista de palestrantes (ids de especialistas) ao evento. Substitui
 * a lista atual do campo `palestrantes`. draft:true mantém o estado de
 * publicação (não força publish).
 */
export async function vincularPalestrantesEvento(
  id: string,
  idsEspecialistas: string[],
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    // O campo `palestrantes` é relação por id numérico; converte os ids string.
    const ids = idsEspecialistas.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
    await payload.update({
      collection: "eventos",
      id,
      data: { palestrantes: ids },
      draft: true,
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao vincular palestrantes." };
  }
}

/**
 * Define os eventos em destaque na Home (Global home → eventosAgendaDestaque).
 * Recebe ids string; converte para number (relação por id).
 */
export async function salvarEventosHome(idsEventos: string[]): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    const ids = idsEventos.map((s) => Number(s)).filter((n) => !Number.isNaN(n));
    await payload.updateGlobal({
      slug: "home",
      data: { eventosAgendaDestaque: ids },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao salvar eventos da Home." };
  }
}

/** Despublica o evento (volta a rascunho): some do site público. */
export async function despublicarEvento(id: string): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    await payload.update({
      collection: "eventos",
      id,
      data: { _status: "draft" },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao despublicar." };
  }
}

/**
 * Define se um especialista fica oculto do site público (campo
 * `ocultarDoSite`). Oculto → não aparece no Corpo Docente nem como palestrante
 * de eventos. Usado para tirar do ar quem ainda está com foto genérica, sem
 * precisar deletar o cadastro.
 *
 * O site lê o REGISTRO PUBLICADO do especialista (find/findGlobal sem
 * draft:true). A coleção tem drafts habilitados, então gravar com draft:true
 * deixaria o flag só na versão de rascunho — e o site nunca o veria. Por isso
 * grava no registro principal SEM draft:true, mas reenviando o `_status`
 * atual para NÃO publicar sem querer um especialista que está em rascunho.
 */
export async function definirOcultarPalestrante(
  id: string,
  oculto: boolean,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();
    // Lê o estado de publicação atual para preservá-lo na escrita.
    const atual = (await payload.findByID({
      collection: "especialistas",
      id,
      draft: true,
      overrideAccess: true,
    })) as { _status?: "draft" | "published" | null };
    const status = atual._status === "published" ? "published" : "draft";

    await payload.update({
      collection: "especialistas",
      id,
      data: { ocultarDoSite: oculto, _status: status },
      overrideAccess: true,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao atualizar visibilidade." };
  }
}

/**
 * Recebe um File do client (via FormData), cria um registro Media pela Local
 * API (gera variantes + sobe ao Supabase Storage) e aponta o campo do evento
 * (`imagemCapa` ou `folderPdf`) para a nova Media.
 *
 * O site lê o REGISTRO PUBLICADO do evento (overrideEventoOnline na main),
 * então gravar com draft:true deixaria a mídia presa no rascunho e o botão
 * "Baixar folder" nunca mudaria. Grava sem draft:true reenviando o `_status`
 * atual — mesma regra de definirOcultarPalestrante. Atenção: num evento
 * publicado com edições de texto pendentes no rascunho, elas vão ao ar junto.
 */
export async function enviarMidiaEvento(
  id: string,
  campo: "imagemCapa" | "folderPdf",
  arquivo: File,
): Promise<ResultadoEscrita> {
  try {
    const payload = await obterPayload();

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const media = await payload.create({
      collection: "media",
      data: {
        alt: arquivo.name,
      },
      file: {
        data: buffer,
        name: arquivo.name,
        mimetype: arquivo.type,
        size: arquivo.size,
      },
      overrideAccess: true,
    });

    // Preserva o estado de publicação atual (não publica evento em rascunho).
    const atual = (await payload.findByID({
      collection: "eventos",
      id,
      draft: true,
      overrideAccess: true,
    })) as { _status?: "draft" | "published" | null };
    const status = atual._status === "published" ? "published" : "draft";

    await payload.update({
      collection: "eventos",
      id,
      data: { [campo]: media.id, _status: status },
      overrideAccess: true,
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro no upload." };
  }
}

export interface RelatorioImportacao {
  /** Rótulos dos campos preenchidos a partir do PDF. */
  preenchidos: string[];
  /** Rótulos dos campos que ficaram vazios para preenchimento manual. */
  vazios: string[];
  palestrantesVinculados: string[];
  /** Especialistas criados agora (ocultos do site até revisão). */
  palestrantesCriados: string[];
  avisos: string[];
}

export interface ResultadoImportacao extends ResultadoEscrita {
  /** Id do rascunho de evento criado, para abrir no detalhe. */
  eventoId?: string;
  /** Nome do rascunho (extraído do PDF ou derivado do arquivo). */
  nome?: string;
  relatorio?: RelatorioImportacao;
}

/** Tira ".pdf", troca separadores por espaço e capitaliza para um título legível. */
function nomeProvisorioDePdf(nomeArquivo: string): string {
  const base = nomeArquivo
    .replace(/\.pdf$/i, "")
    .replace(/[_·]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return base.length > 0 ? base : "Evento importado (rascunho)";
}

/**
 * Cria um Evento EM RASCUNHO a partir do folder PDF: sobe o PDF para a Media e
 * grava um evento `draft` com `folderPdf` vinculado e um nome provisório vindo
 * do arquivo. Os demais campos (modalidade, datas, programação, palestrantes)
 * ficam para a etapa de "porta do PDF" + revisão humana no detalhe.
 *
 * `versions.drafts: true` em Eventos faz o Payload relaxar os campos required
 * quando `draft: true` — então o rascunho é criado sem capa/área/etc. `slug` é
 * gerado pelo hook `autoSlug("nome")` da coleção.
 */
export async function criarEventoDePdf(arquivo: File): Promise<ResultadoImportacao> {
  try {
    const payload = await obterPayload();

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const media = await payload.create({
      collection: "media",
      data: { alt: arquivo.name },
      file: {
        data: buffer,
        name: arquivo.name,
        mimetype: arquivo.type,
        size: arquivo.size,
      },
      overrideAccess: true,
    });

    // Extração + parse do template. Qualquer falha aqui NÃO bloqueia a
    // importação: cai no rascunho vazio de antes, com aviso no relatório.
    const relatorio: RelatorioImportacao = {
      preenchidos: [],
      vazios: [],
      palestrantesVinculados: [],
      palestrantesCriados: [],
      avisos: [],
    };
    let camposDoPdf: Record<string, unknown> = {};
    let nome = nomeProvisorioDePdf(arquivo.name);
    try {
      const paginas = await extrairTextoPdf(new Uint8Array(buffer));
      if (paginas.join("").trim().length === 0) {
        relatorio.avisos.push(
          "O PDF não tem camada de texto (provável digitalização) — preencha os campos manualmente.",
        );
      } else {
        const dados = parsearFolderEvento(paginas);
        const montagem = montarCamposEvento(dados);
        camposDoPdf = montagem.data;
        relatorio.preenchidos = montagem.preenchidos;
        relatorio.vazios = montagem.vazios;
        if (dados.nome) nome = dados.nome;

        // Adapta a Local API à superfície mínima tipada (interface mockável).
        const palestrantes = await casarOuCriarPalestrantes(
          {
            async find(args) {
              // pagination:false ⇒ todos os docs (o teto fixo criava
              // duplicatas silenciosas ao passar de N especialistas); select
              // busca só o nome — o casamento não precisa do doc inteiro.
              const r = await payload.find({
                collection: "especialistas",
                limit: args.limit,
                pagination: false,
                depth: 0,
                select: { nome: true },
                overrideAccess: true,
              });
              // Com select, o tipo projetado do Payload não estreita nome —
              // narrowing explícito em vez de cast.
              return {
                docs: r.docs.map((d) => ({
                  id: d.id,
                  nome: typeof d.nome === "string" ? d.nome : "",
                })),
              };
            },
            async create(args) {
              // O objeto vem completo do casarOuCriarPalestrantes (campos
              // obrigatórios da coleção); o cast pontual evita replicar o
              // tipo gerado do Payload na interface mockável. draft:true é
              // obrigatório: sem ele a foto required derruba toda criação.
              const r = await payload.create({
                collection: "especialistas",
                data: args.data as unknown as Parameters<typeof payload.create>[0]["data"],
                draft: args.draft,
                overrideAccess: true,
              });
              return { id: r.id };
            },
          },
          dados.palestrantes,
        );
        relatorio.palestrantesVinculados = palestrantes.vinculados;
        relatorio.palestrantesCriados = palestrantes.criados;
        if (palestrantes.pendentes.length > 0) {
          relatorio.avisos.push(
            `Não foi possível cadastrar: ${palestrantes.pendentes.join(", ")}. Vincule manualmente.`,
          );
        }
        if (palestrantes.ids.length > 0) camposDoPdf.palestrantes = palestrantes.ids;
      }
    } catch (e) {
      relatorio.avisos.push(
        `A leitura automática do PDF falhou (${e instanceof Error ? e.message : "erro desconhecido"}) — o rascunho foi criado vazio.`,
      );
      camposDoPdf = {};
    }

    const evento = await payload.create({
      collection: "eventos",
      data: {
        ...camposDoPdf,
        nome,
        folderPdf: media.id,
        _status: "draft",
      },
      draft: true,
      overrideAccess: true,
    });

    return { ok: true, eventoId: String(evento.id), nome, relatorio };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Erro ao importar o PDF." };
  }
}
