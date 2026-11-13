/**
 * "Módulos abertos" da página do programa e selo "Inscrições abertas" dos
 * módulos, calculados a partir dos eventos ativos cadastrados no CMS.
 *
 * Formato dos textos montados (a conferir pelo PO no checkpoint):
 * - `eyebrow` do destaque: "Evento · <vertical>"; do mini: "Evento · <modalidade>".
 * - `binding`: "Módulo <romano> do programa" (ou "Evento avulso" sem módulo).
 * - `metas`: [data por extenso curta em negrito, modalidade].
 * - `metaHtml` do mini: "Módulo <romano> · <modalidade>" (ou só a modalidade).
 * Carga horária, nº de encontros e replay não existem no evento e não são inventados.
 */

import { escaparTexto } from "./marcacaoLeve";
import { ROTULO_VERTICAL } from "./molde";
import { inteiroParaRomano } from "./romanos";
import type { EventoFeature, EventoMini, ExtrasEventos, Vertical } from "./tipos";

export interface EventoDoPrograma {
  slug: string;
  titulo: string;
  /** `YYYY-MM-DD` (ou ISO com hora, lida no fuso de São Paulo). */
  dataInicio: string;
  dataFim: string | null;
  modalidade: string;
  capaUrl: string | null;
  moduloNumero: number | null;
}

const FUSO = "America/Sao_Paulo";
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MAX_MINI = 3;

const formatoDia = new Intl.DateTimeFormat("en-CA", { timeZone: FUSO, year: "numeric", month: "2-digit", day: "2-digit" });

/** `YYYY-MM-DD` do instante, no fuso de São Paulo. */
function diaDe(agora: Date): string {
  return formatoDia.format(agora);
}

function diaDaString(valor: string): string {
  return valor.length > 10 ? diaDe(new Date(valor)) : valor;
}

export function eventoAtivo(e: EventoDoPrograma, agora: Date): boolean {
  return diaDaString(e.dataFim ?? e.dataInicio) >= diaDe(agora);
}

function partes(dia: string): { ano: string; mes: number; dia: string } {
  const [ano = "", mes = "1", d = ""] = dia.split("-");
  return { ano, mes: Number(mes) - 1, dia: d };
}

function dataLabel(e: EventoDoPrograma): { dias: string; mesAno: string } {
  const ini = partes(diaDaString(e.dataInicio));
  const fim = e.dataFim ? partes(diaDaString(e.dataFim)) : ini;
  if (fim.ano === ini.ano && fim.mes === ini.mes && fim.dia === ini.dia) {
    return { dias: ini.dia, mesAno: `${MESES[ini.mes]} · ${ini.ano}` };
  }
  if (fim.ano === ini.ano && fim.mes === ini.mes) {
    return { dias: `${ini.dia}–${fim.dia}`, mesAno: `${MESES[ini.mes]} · ${ini.ano}` };
  }
  const mesAno =
    fim.ano === ini.ano
      ? `${MESES[ini.mes]} – ${MESES[fim.mes]} · ${ini.ano}`
      : `${MESES[ini.mes]} ${ini.ano} – ${MESES[fim.mes]} ${fim.ano}`;
  return { dias: `${ini.dia}–${fim.dia}`, mesAno };
}

export function montarExtrasEventos(
  eventos: EventoDoPrograma[],
  agora: Date,
  contexto: { vertical: Vertical; imagemVertente: string },
): ExtrasEventos {
  const ativos = eventos
    .filter((e) => eventoAtivo(e, agora))
    .sort(
      (a, b) =>
        diaDaString(a.dataInicio).localeCompare(diaDaString(b.dataInicio)) || a.slug.localeCompare(b.slug),
    );

  const status: ExtrasEventos["status"] = new Map();
  for (const e of ativos) {
    if (e.moduloNumero != null) status.set(e.moduloNumero, { rotulo: "Inscrições abertas", tipo: "aberto" });
  }

  if (ativos.length === 0) return { modulosAbertos: { feature: undefined, miniStack: [] }, status };

  const romano = (e: EventoDoPrograma) => (e.moduloNumero != null ? inteiroParaRomano(e.moduloNumero) : null);
  const imagem = (e: EventoDoPrograma) => e.capaUrl ?? contexto.imagemVertente;

  const [destaque, ...resto] = ativos;
  if (!destaque) return { modulosAbertos: { feature: undefined, miniStack: [] }, status };
  const rd = romano(destaque);
  const label = dataLabel(destaque);

  const feature: EventoFeature = {
    badge: "",
    bgImg: imagem(destaque),
    dataLabel: label,
    modalidade: destaque.modalidade,
    eyebrow: `Evento · ${ROTULO_VERTICAL[contexto.vertical]}`,
    titulo: destaque.titulo,
    binding: rd ? `Módulo ${escaparTexto(rd)} do programa` : "Evento avulso",
    metas: [`<strong>${escaparTexto(label.dias)}</strong> · ${escaparTexto(label.mesAno)}`, escaparTexto(destaque.modalidade)],
    ctaPrimario: "",
    ctaSecundario: "",
    ctaHref: `/agenda/${destaque.slug}`,
  };

  const miniStack: EventoMini[] = resto.slice(0, MAX_MINI).map((e) => {
    const r = romano(e);
    return {
      bgImg: imagem(e),
      dataLabel: dataLabel(e),
      eyebrow: `Evento · ${e.modalidade}`,
      titulo: e.titulo,
      metaHtml: r
        ? `Módulo <strong>${escaparTexto(r)}</strong> · ${escaparTexto(e.modalidade)}`
        : escaparTexto(e.modalidade),
      ctaRotulo: "",
      ctaHref: `/agenda/${e.slug}`,
    };
  });

  return { modulosAbertos: { feature, miniStack }, status };
}
