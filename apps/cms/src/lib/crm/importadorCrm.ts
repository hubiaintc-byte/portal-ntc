/**
 * Importador do JSON do CRM legado (NTC_Comercial_Premium) — módulo PURO.
 *
 * Só monta o `PlanoImportacao` a partir do export legado + do estado atual do
 * banco (via `ExistentesNoBanco`, montado pelo executor `src/seed/importarCrm.ts`
 * com Local API). Não importa `payload` nem `server-only`: é testável sem banco.
 *
 * Regras (spec 2026-07-15, task 13):
 * 1. Idempotente por chaves naturais — cliente por slugDeRotulo(orgao)+uf;
 *    contato por clienteLegadoId+slugDeRotulo(nome); oportunidade por codigo.
 * 2. Catálogo nunca cria programa; módulo casado por (programaId, numero) só
 *    gera atualização comercial se o grupo estiver vazio; produto casa evento
 *    por nome normalizado, sem correspondente ⇒ aviso (não cria evento).
 * 3. Selects convertidos com slugDeRotulo e validados contra as listas de
 *    @ntc/lib; fora da lista ⇒ null + aviso.
 * 4. responsavel resolve por e-mail do usuário legado; sem match ⇒ null + aviso
 *    (uma vez por e-mail).
 * 5. Oportunidades: refs não resolvidas em `cliente` pulam o registro; nas
 *    demais, omitem a ref (com aviso).
 */
import {
  AREAS_CRM,
  ESFERAS_CRM,
  ORIGENS_CRM,
  slugDeRotulo,
  STATUS_CLIENTE_CRM,
  STATUS_OPORTUNIDADE,
  TIPOS_INSTITUICAO,
  UFS,
} from "@ntc/lib";

export interface ExportCrmLegado {
  versao?: string;
  tabelas?: Record<string, RegistroLegado[]>;
}

export type RegistroLegado = Record<string, unknown> & { id: string };

export interface ExistentesNoBanco {
  /** sigla minúscula → payload id */
  programasPorSigla: Map<string, string>;
  /** `${programaId}#${numero}` → { id, comercialVazio } */
  modulosPorChave: Map<string, { id: string; comercialVazio: boolean }>;
  /** slugDeRotulo(nome) → payload id */
  eventosPorNome: Map<string, string>;
  /** `${slugDeRotulo(orgao)}#${uf}` → payload id */
  clientesPorChave: Map<string, string>;
  /** `${clientePayloadId}#${slugDeRotulo(nome)}` */
  contatosPorChave: Set<string>;
  oportunidadesPorCodigo: Set<string>;
  /** e-mail minúsculo → payload id */
  usuariosPorEmail: Map<string, string>;
}

/** Referência de cliente ainda não resolvida a um id do banco (criado nesta mesma rodada). */
export interface MarcadorClienteLegado {
  clienteLegadoId: string;
}

export interface DadosClienteCrm {
  orgao: string;
  sigla: string | null;
  uf: string | null;
  esfera: string | null;
  area: string | null;
  tipo: string | null;
  status: string | null;
  origem: string | null;
  potencial: number | null;
  responsavel: string | null;
  cnpj: string | null;
  dirigente: string | null;
  cargoDirigente: string | null;
  email: string | null;
  proximaAcao: string | null;
}

export interface DadosContatoCrm {
  nome: string;
  cliente: string | MarcadorClienteLegado;
  cargo: string | null;
  setor: string | null;
  email: string | null;
  whatsapp: string | null;
  principal: boolean;
  decisor: boolean;
}

export interface DadosOportunidade {
  codigo: string;
  cliente: string | MarcadorClienteLegado;
  programa: string | null;
  modulos: string[];
  eventos: string[];
  uf: string | null;
  origem: string | null;
  quantidade: number | null;
  modalidade: string | null;
  valor: number | null;
  probabilidade: number | null;
  status: string | null;
  dataAbertura: string | null;
  dataPrevFechamento: string | null;
  proximaAcao: string | null;
  followup: string | null;
  responsavel: string | null;
  observacoes: string | null;
}

export interface ComercialModulo {
  tituloComercial: string | null;
  valor: number | null;
  replay: string | null;
  certificacao: string | null;
}

export interface ComercialEvento {
  codigo: string | null;
  valor: number | null;
}

export interface PlanoImportacao {
  criarClientes: { chave: string; idLegado: string; data: DadosClienteCrm }[];
  criarContatos: { idLegado: string; clienteLegadoId: string; data: DadosContatoCrm }[];
  criarOportunidades: { idLegado: string; clienteLegadoId: string; data: DadosOportunidade }[];
  atualizarModulos: { id: string; comercial: ComercialModulo }[];
  atualizarEventos: { id: string; comercial: ComercialEvento }[];
  avisos: string[];
  resumo: {
    clientes: number;
    contatos: number;
    oportunidades: number;
    modulos: number;
    eventos: number;
    ignorados: number;
  };
}

// ---- Helpers de leitura de campo legado (registro é Record<string, unknown>) ----

function texto(registro: RegistroLegado, campo: string): string | null {
  const valor = registro[campo];
  if (typeof valor !== "string") return null;
  const aparado = valor.trim();
  return aparado.length > 0 ? aparado : null;
}

function numero(registro: RegistroLegado, campo: string): number | null {
  const valor = registro[campo];
  if (typeof valor === "number" && Number.isFinite(valor)) return valor;
  return null;
}

function booleano(registro: RegistroLegado, campo: string): boolean {
  return registro[campo] === true;
}

function lista(registro: RegistroLegado, campo: string): string[] {
  const valor = registro[campo];
  if (!Array.isArray(valor)) return [];
  return valor.filter((v): v is string => typeof v === "string");
}

/**
 * Converte um rótulo legado para o value do select (via slugDeRotulo) e valida
 * contra a lista controlada. Fora da lista (ou ausente) ⇒ null + aviso.
 */
function slugValidado(
  valorLegado: string | null,
  opcoesValidas: { value: string }[],
  avisos: string[],
  contexto: string,
): string | null {
  if (!valorLegado) return null;
  const slug = slugDeRotulo(valorLegado);
  const valido = opcoesValidas.some((opcao) => opcao.value === slug);
  if (!valido) {
    avisos.push(`${contexto}: valor "${valorLegado}" não corresponde a nenhuma opção válida — gravado como null.`);
    return null;
  }
  return slug;
}

/** UF é lista de siglas puras (não passa por slugDeRotulo). */
function ufValidada(valorLegado: string | null, avisos: string[], contexto: string): string | null {
  if (!valorLegado) return null;
  const uf = valorLegado.trim().toUpperCase();
  if (!UFS.includes(uf)) {
    avisos.push(`${contexto}: UF "${valorLegado}" não corresponde a nenhuma UF válida — gravada como null.`);
    return null;
  }
  return uf;
}

export function planejarImportacao(
  dados: ExportCrmLegado,
  existentes: ExistentesNoBanco,
): PlanoImportacao {
  const avisos: string[] = [];
  const tabelas = dados.tabelas ?? {};
  const clientesLegados = tabelas.clientes ?? [];
  const contatosLegados = tabelas.contatos ?? [];
  const programasLegados = tabelas.programas ?? [];
  const modulosLegados = tabelas.modulos ?? [];
  const produtosLegados = tabelas.produtos ?? [];
  const oportunidadesLegadas = tabelas.oportunidades ?? [];
  const usuariosLegados = tabelas.usuarios ?? [];

  // ---- Mapas de catálogo legado (id legado → registro), para resolver refs ----
  const programaLegadoPorId = new Map(programasLegados.map((p) => [p.id, p]));
  const produtoLegadoPorId = new Map(produtosLegados.map((p) => [p.id, p]));
  const usuarioLegadoPorId = new Map(usuariosLegados.map((u) => [u.id, u]));

  const avisosResponsavelEmitidos = new Set<string>();

  /** Resolve `responsavel` (id legado de usuário) → id Payload, via e-mail. Regra 4. */
  function resolverResponsavel(idLegado: string | null, contexto: string): string | null {
    if (!idLegado) return null;
    const usuarioLegado = usuarioLegadoPorId.get(idLegado);
    const email = usuarioLegado ? texto(usuarioLegado, "email") : null;
    if (!email) return null;
    const idPayload = existentes.usuariosPorEmail.get(email.toLowerCase());
    if (idPayload) return idPayload;
    const chaveAviso = `${contexto}:${email.toLowerCase()}`;
    if (!avisosResponsavelEmitidos.has(chaveAviso)) {
      avisosResponsavelEmitidos.add(chaveAviso);
      avisos.push(`${contexto}: responsável com e-mail "${email}" não encontrado entre os usuários do Payload — gravado como null.`);
    }
    return null;
  }

  /** Resolve `programaId` legado → id Payload por sigla (regra 2, nunca cria). */
  function resolverPrograma(idLegado: string | null, contexto: string): string | null {
    if (!idLegado) return null;
    const programaLegado = programaLegadoPorId.get(idLegado);
    const sigla = programaLegado ? texto(programaLegado, "sigla") : null;
    if (!sigla) return null;
    const idPayload = existentes.programasPorSigla.get(sigla.toLowerCase());
    if (!idPayload) {
      avisos.push(`${contexto}: programa de sigla "${sigla}" não encontrado no catálogo — ref omitida.`);
      return null;
    }
    return idPayload;
  }

  /** Resolve módulos legados (por número dentro do programa casado) → ids Payload (regra 2). */
  function resolverModulos(idsLegados: string[], programaPayloadId: string | null, contexto: string): string[] {
    const resolvidos: string[] = [];
    for (const idLegado of idsLegados) {
      const moduloLegado = modulosLegados.find((m) => m.id === idLegado);
      const numeroModulo = moduloLegado ? numero(moduloLegado, "numero") : null;
      if (!programaPayloadId || numeroModulo === null) {
        avisos.push(`${contexto}: módulo legado "${idLegado}" não pôde ser resolvido (programa ou número ausente) — ref omitida.`);
        continue;
      }
      const casado = existentes.modulosPorChave.get(`${programaPayloadId}#${numeroModulo}`);
      if (!casado) {
        avisos.push(`${contexto}: módulo legado "${idLegado}" (número ${numeroModulo}) sem correspondente no catálogo — ref omitida.`);
        continue;
      }
      resolvidos.push(casado.id);
    }
    return resolvidos;
  }

  /** Resolve produtos legados → eventos Payload por nome normalizado (regra 2, nunca cria evento). */
  function resolverEventos(idsLegados: string[], contexto: string): string[] {
    const resolvidos: string[] = [];
    for (const idLegado of idsLegados) {
      const produtoLegado = produtoLegadoPorId.get(idLegado);
      const nome = produtoLegado ? texto(produtoLegado, "nome") : null;
      if (!nome) {
        avisos.push(`${contexto}: produto legado "${idLegado}" sem nome — ref omitida.`);
        continue;
      }
      const idPayload = existentes.eventosPorNome.get(slugDeRotulo(nome));
      if (!idPayload) {
        avisos.push(`${contexto}: produto "${nome}" sem evento correspondente no catálogo — ref omitida (evento não é criado automaticamente).`);
        continue;
      }
      resolvidos.push(idPayload);
    }
    return resolvidos;
  }

  // =====================================================================
  // 1) Clientes
  // =====================================================================
  const criarClientes: PlanoImportacao["criarClientes"] = [];
  /** id legado do cliente → chave natural (para casar contatos/oportunidades mesmo quando o cliente é novo nesta rodada). */
  const chavePorClienteLegadoId = new Map<string, string>();
  /** id legado do cliente → id Payload, quando o cliente já existe no banco. */
  const idPayloadPorClienteLegadoId = new Map<string, string>();

  for (const registro of clientesLegados) {
    const orgao = texto(registro, "orgao");
    if (!orgao) {
      avisos.push(`Cliente legado "${registro.id}" sem "orgao" — ignorado.`);
      continue;
    }
    const uf = ufValidada(texto(registro, "uf"), avisos, `Cliente "${orgao}"`);
    const chave = `${slugDeRotulo(orgao)}#${uf ?? ""}`;
    chavePorClienteLegadoId.set(registro.id, chave);

    const idExistente = existentes.clientesPorChave.get(chave);
    if (idExistente) {
      idPayloadPorClienteLegadoId.set(registro.id, idExistente);
      continue; // Regra 1: idempotente — já existe, não cria de novo.
    }

    const contexto = `Cliente "${orgao}"`;
    const data: DadosClienteCrm = {
      orgao,
      sigla: texto(registro, "sigla"),
      uf,
      esfera: slugValidado(texto(registro, "esfera"), ESFERAS_CRM, avisos, contexto),
      area: slugValidado(texto(registro, "area"), AREAS_CRM, avisos, contexto),
      tipo: slugValidado(texto(registro, "tipo"), TIPOS_INSTITUICAO, avisos, contexto),
      status: slugValidado(texto(registro, "status"), STATUS_CLIENTE_CRM, avisos, contexto),
      origem: slugValidado(texto(registro, "origem"), ORIGENS_CRM, avisos, contexto),
      potencial: numero(registro, "potencial"),
      responsavel: resolverResponsavel(texto(registro, "responsavel"), contexto),
      cnpj: texto(registro, "cnpj"),
      dirigente: texto(registro, "dirigente"),
      cargoDirigente: texto(registro, "cargo"),
      email: texto(registro, "email"),
      proximaAcao: texto(registro, "proxima_acao"),
    };
    criarClientes.push({ chave, idLegado: registro.id, data });
  }

  /** Resolve a ref `cliente` de um contato/oportunidade: id do banco se existente, marcador se criado nesta rodada. */
  function resolverRefCliente(clienteLegadoId: string | null): string | MarcadorClienteLegado | null {
    if (!clienteLegadoId) return null;
    const idExistente = idPayloadPorClienteLegadoId.get(clienteLegadoId);
    if (idExistente) return idExistente;
    const chave = chavePorClienteLegadoId.get(clienteLegadoId);
    if (!chave) return null; // cliente legado inexistente no export
    const foiCriadoNestaRodada = criarClientes.some((c) => c.idLegado === clienteLegadoId);
    return foiCriadoNestaRodada ? { clienteLegadoId } : null;
  }

  // =====================================================================
  // 2) Contatos
  // =====================================================================
  const criarContatos: PlanoImportacao["criarContatos"] = [];
  for (const registro of contatosLegados) {
    const nome = texto(registro, "nome");
    const clienteLegadoId = texto(registro, "cliente");
    if (!nome || !clienteLegadoId) {
      avisos.push(`Contato legado "${registro.id}" sem nome ou cliente — ignorado.`);
      continue;
    }
    const refCliente = resolverRefCliente(clienteLegadoId);
    if (!refCliente) {
      avisos.push(`Contato "${nome}": cliente legado "${clienteLegadoId}" não resolvido — contato ignorado.`);
      continue;
    }

    if (typeof refCliente === "string") {
      const chaveContato = `${refCliente}#${slugDeRotulo(nome)}`;
      if (existentes.contatosPorChave.has(chaveContato)) continue; // Regra 1: idempotente.
    }

    const data: DadosContatoCrm = {
      nome,
      cliente: refCliente,
      cargo: texto(registro, "cargo"),
      setor: texto(registro, "setor"),
      email: texto(registro, "email"),
      whatsapp: texto(registro, "whatsapp"),
      principal: booleano(registro, "principal"),
      decisor: booleano(registro, "decisor"),
    };
    criarContatos.push({ idLegado: registro.id, clienteLegadoId, data });
  }

  // =====================================================================
  // 3) Oportunidades
  // =====================================================================
  const criarOportunidades: PlanoImportacao["criarOportunidades"] = [];
  for (const registro of oportunidadesLegadas) {
    const codigo = texto(registro, "codigo");
    const clienteLegadoId = texto(registro, "cliente");
    if (!codigo || !clienteLegadoId) {
      avisos.push(`Oportunidade legada "${registro.id}" sem código ou cliente — ignorada.`);
      continue;
    }
    if (existentes.oportunidadesPorCodigo.has(codigo)) continue; // Regra 1: idempotente.

    const refCliente = resolverRefCliente(clienteLegadoId);
    if (!refCliente) {
      // Regra 5: ref não resolvida em `cliente` ⇒ pula a oportunidade com aviso.
      avisos.push(`Oportunidade "${codigo}": cliente legado "${clienteLegadoId}" não resolvido — oportunidade ignorada.`);
      continue;
    }

    const contexto = `Oportunidade "${codigo}"`;
    const programaLegadoId = texto(registro, "programa");
    const programaPayloadId = resolverPrograma(programaLegadoId, contexto);

    const data: DadosOportunidade = {
      codigo,
      cliente: refCliente,
      programa: programaPayloadId,
      modulos: resolverModulos(lista(registro, "modulos"), programaPayloadId, contexto),
      eventos: resolverEventos(lista(registro, "produtos"), contexto),
      uf: ufValidada(texto(registro, "uf"), avisos, contexto),
      origem: slugValidado(texto(registro, "origem"), ORIGENS_CRM, avisos, contexto),
      quantidade: numero(registro, "qtd"),
      modalidade: texto(registro, "modalidade"),
      valor: numero(registro, "valor"),
      probabilidade: numero(registro, "prob"),
      status: slugValidado(texto(registro, "status"), STATUS_OPORTUNIDADE, avisos, contexto),
      dataAbertura: texto(registro, "data_abertura"),
      dataPrevFechamento: texto(registro, "data_prev_fech"),
      proximaAcao: texto(registro, "proxima_acao"),
      followup: texto(registro, "followup"),
      responsavel: resolverResponsavel(texto(registro, "responsavel"), contexto),
      observacoes: texto(registro, "observacoes"),
    };
    criarOportunidades.push({ idLegado: registro.id, clienteLegadoId, data });
  }

  // =====================================================================
  // 4) Módulos — atualização comercial (regra 2: só se o grupo estiver vazio)
  // =====================================================================
  const atualizarModulos: PlanoImportacao["atualizarModulos"] = [];
  for (const registro of modulosLegados) {
    const programaLegadoId = texto(registro, "programa");
    const programaPayloadId = programaLegadoId ? resolverPrograma(programaLegadoId, `Módulo legado "${registro.id}"`) : null;
    const numeroModulo = numero(registro, "numero");
    if (!programaPayloadId || numeroModulo === null) continue;

    const casado = existentes.modulosPorChave.get(`${programaPayloadId}#${numeroModulo}`);
    if (!casado) {
      avisos.push(`Módulo legado "${registro.id}" (programa/número ${numeroModulo}) sem correspondente no catálogo — criação de módulo é manual (ementa obrigatória).`);
      continue;
    }
    if (!casado.comercialVazio) continue; // já tem dados comerciais — não sobrescreve.

    atualizarModulos.push({
      id: casado.id,
      comercial: {
        tituloComercial: texto(registro, "titulo_comercial"),
        valor: numero(registro, "valor"),
        replay: texto(registro, "replay"),
        certificacao: texto(registro, "certificacao"),
      },
    });
  }

  // =====================================================================
  // 5) Produtos → Eventos — atualização comercial (regra 2, sempre atualiza)
  // =====================================================================
  const atualizarEventos: PlanoImportacao["atualizarEventos"] = [];
  for (const registro of produtosLegados) {
    const nome = texto(registro, "nome");
    if (!nome) continue;
    const idPayload = existentes.eventosPorNome.get(slugDeRotulo(nome));
    if (!idPayload) {
      avisos.push(`Produto "${nome}" sem evento correspondente no catálogo — evento não é criado automaticamente (campos editoriais obrigatórios).`);
      continue;
    }
    atualizarEventos.push({
      id: idPayload,
      comercial: {
        codigo: texto(registro, "codigo"),
        valor: numero(registro, "valor"),
      },
    });
  }

  // "ignorados" conta registros de entrada (clientes/contatos/oportunidades)
  // que não geraram ação de criação — já existiam no banco (idempotência,
  // regra 1) ou tiveram refs não resolvidas / dados incompletos (regra 5),
  // casos que já emitiram aviso acima.
  const totalEntrada = clientesLegados.length + contatosLegados.length + oportunidadesLegadas.length;
  const totalCriado = criarClientes.length + criarContatos.length + criarOportunidades.length;
  const ignorados = Math.max(0, totalEntrada - totalCriado - idPayloadPorClienteLegadoId.size);

  return {
    criarClientes,
    criarContatos,
    criarOportunidades,
    atualizarModulos,
    atualizarEventos,
    avisos,
    resumo: {
      clientes: criarClientes.length,
      contatos: criarContatos.length,
      oportunidades: criarOportunidades.length,
      modulos: atualizarModulos.length,
      eventos: atualizarEventos.length,
      ignorados,
    },
  };
}
