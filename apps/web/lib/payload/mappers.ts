import type { Area, Cliente, Especialista, Evento, Media, Programa } from "@ntc/types";

import type {
  CardAreaProps,
  ClienteItem,
  EspecialistaItem,
  EventoItem,
  ProgramaItem,
} from "@ntc/ui";

/**
 * Mapeadores Payload → shape consumido pelos componentes do @ntc/ui.
 *
 * Resolvem três fricções recorrentes:
 * 1. Relationships podem vir como `number` (ID) ou como o objeto populado,
 *    a depender de `maxDepth` e `populate` da query.
 * 2. Campos opcionais do Payload são `string | null | undefined`; o front
 *    espera `string | undefined`.
 * 3. URL de imagem está em `Media.url`, mas o front usa `{ src, alt }`.
 *
 * Mantenha estes mapeadores como única borda CMS↔UI. Componentes do
 * @ntc/ui não devem importar tipos do Payload diretamente.
 */

function ehMedia(valor: number | Media | null | undefined): valor is Media {
  return typeof valor === "object" && valor !== null && "url" in valor;
}

export function urlMedia(valor: number | Media | null | undefined): string | undefined {
  if (!ehMedia(valor)) return undefined;
  return valor.url ?? undefined;
}

export function imagemRef(
  valor: number | Media | null | undefined,
  altFallback = "",
): { src: string; alt: string } | undefined {
  if (!ehMedia(valor)) return undefined;
  const src = valor.url;
  if (!src) return undefined;
  return { src, alt: valor.alt || altFallback };
}

function siglaArea(area: number | Area | null | undefined): "educacao" | "gestao-publica" | "saude" {
  if (typeof area === "object" && area !== null && "sigla" in area && area.sigla) {
    return area.sigla;
  }
  return "educacao";
}

export function mapearPrograma(p: Programa): ProgramaItem {
  return {
    sigla: p.sigla,
    nomeCompleto: p.nomeCompleto,
    area: siglaArea(p.area),
    resumoVisaoGeral: undefined,
    imagem: imagemRef(p.imagemCapa, p.nomeCompleto),
    href: `/programas/${p.slug}`,
    eyebrow: p.eyebrow ?? undefined,
  };
}

export function mapearEvento(e: Evento): EventoItem | null {
  const imagem = imagemRef(e.imagemCapa, e.nome);
  if (!imagem) return null;
  return {
    nome: e.nome,
    imagem,
    dataInicio: e.dataInicio,
    modalidade: e.modalidade,
    local: e.local
      ? {
          cidade: e.local.cidade ?? "",
          estado: e.local.estado ?? "",
        }
      : undefined,
    programa:
      typeof e.programa === "object" && e.programa !== null
        ? { sigla: e.programa.sigla }
        : undefined,
    area: siglaArea(e.area),
    inscricaoAberta: e.inscricaoAberta ?? false,
    href: `/eventos/${e.slug}`,
    eyebrow: e.eyebrow ?? undefined,
  };
}

export function mapearEspecialista(e: Especialista): EspecialistaItem | null {
  const foto = imagemRef(e.foto, e.nome);
  if (!foto) return null;
  return {
    nome: e.nome,
    titulacao: e.titulacao,
    instituicao: e.instituicao,
    cargoAtual: e.cargoAtual ?? undefined,
    foto,
    href: e.slug ? `/o-grupo/corpo-docente#${e.slug}` : undefined,
  };
}

export function mapearCliente(c: Cliente): ClienteItem | null {
  const logo = imagemRef(c.logo, c.nome);
  if (!logo) return null;
  return {
    id: String(c.id),
    nome: c.nome,
    logo,
    esfera: c.esfera ?? undefined,
    estado: c.estado ?? undefined,
  };
}

export function mapearAreaParaCard(a: Area, posicionamentoFlat?: string): CardAreaProps {
  return {
    area: a.sigla,
    nome: a.nome,
    eyebrow: a.eyebrow ?? undefined,
    posicionamento: posicionamentoFlat,
    imagem: imagemRef(a.imagemHero, a.nome),
    href: `/solucoes-estrategicas/${a.slug}`,
  };
}
