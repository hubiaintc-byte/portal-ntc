/**
 * Deriva todos os formatos de data exibidos numa página de evento online a
 * partir das datas ISO de início e fim (campos dataInicio/dataFim do CMS).
 * Não depende do locale do runtime — usa tabelas literais pt-BR (noUncheckedIndexedAccess seguro).
 *
 * Horários do evento (08h–18h) são fixos nesta v1 (não vêm do CMS).
 */

import { encerramentoInscricoesISO } from "@/lib/eventos/encerramentoInscricoes";

export interface DatasDerivadasEvento {
  metaValue: string; // "15 · Junho"
  metaSub: string; // "2026 · Segunda-feira"
  timelineDiaHtml: string; // "15 de <em>Junho</em> · Segunda-feira"
  sidebarValue: string; // "15 · Jun · 2026"
  dataEvento: string; // "15 de junho de 2026"
  deadlineISO: string; // "2026-06-15T08:00:00-03:00" (8h do 1º dia)
  countdownDateText: string; // "Até 15 de Junho de 2026, às 8h"
  icsStart: string; // "20260615T080000"
  icsEnd: string; // "20260615T180000"
  cardDia: string; // "15"        → card.diaDataBloco
  cardDiaFim?: string; // "16"     → card.diaFimDataBloco (só evento de mais de um dia)
  cardMesAno: string; // "Jun · 2026" → card.mesAnoDataBloco
}

const MESES_LONGOS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
] as const;
const MESES_CURTOS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;
// getUTCDay(): 0=domingo ... 6=sábado
const DIAS_SEMANA = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
] as const;

interface Dia {
  ymd: string;
  ano: string;
  dia2: string;
  diaNum: number;
  mesLongo: string;
  mesCurto: string;
  diaSemana: string;
  compactaIcs: string;
}

function lerDia(iso: string): Dia {
  // Extrai Y-M-D do ISO sem depender de fuso (pega os 10 primeiros chars).
  const ymd = iso.slice(0, 10);
  const [aStr, mStr, dStr] = ymd.split("-");
  const ano = aStr ?? "2026";
  const mesIdx = (Number(mStr ?? "1") - 1 + 12) % 12;
  const diaNum = Number(dStr ?? "1");
  const dia2 = String(diaNum).padStart(2, "0");
  // Dia da semana via Date UTC (meio-dia evita drift de fuso).
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  return {
    ymd,
    ano,
    dia2,
    diaNum,
    mesLongo: MESES_LONGOS[mesIdx] ?? "Junho",
    mesCurto: MESES_CURTOS[mesIdx] ?? "Jun",
    diaSemana: DIAS_SEMANA[dow] ?? "Segunda-feira",
    compactaIcs: `${ano}${mStr?.padStart(2, "0") ?? "06"}${dia2}`,
  };
}

/**
 * `fimIso` (campo dataFim do CMS) é opcional: ausente ou no mesmo dia que o
 * início → formatos de um dia. Inscrições fecham às 8h do PRIMEIRO dia
 * (deadlineISO/countdown) em qualquer caso.
 */
export function derivarDatasEvento(iso: string, fimIso?: string | null): DatasDerivadasEvento {
  const ini = lerDia(iso);
  const fim = fimIso ? lerDia(fimIso) : null;

  const base = {
    deadlineISO: encerramentoInscricoesISO(ini.ymd),
    countdownDateText: `Até ${ini.dia2} de ${ini.mesLongo} de ${ini.ano}, às 8h`,
    icsStart: `${ini.compactaIcs}T080000`,
    cardDia: ini.dia2,
  };

  if (!fim || fim.ymd <= ini.ymd) {
    return {
      ...base,
      metaValue: `${ini.dia2} · ${ini.mesLongo}`,
      metaSub: `${ini.ano} · ${ini.diaSemana}`,
      timelineDiaHtml: `${ini.dia2} de <em>${ini.mesLongo}</em> · ${ini.diaSemana}`,
      sidebarValue: `${ini.dia2} · ${ini.mesCurto} · ${ini.ano}`,
      dataEvento: `${ini.diaNum} de ${ini.mesLongo.toLowerCase()} de ${ini.ano}`,
      icsEnd: `${ini.compactaIcs}T180000`,
      cardMesAno: `${ini.mesCurto} · ${ini.ano}`,
    };
  }

  // Dois dias seguidos → "12 e 13"; mais que isso → "18 a 20".
  const diasCorridos =
    (Date.parse(`${fim.ymd}T12:00:00Z`) - Date.parse(`${ini.ymd}T12:00:00Z`)) / 86_400_000;
  const conector = diasCorridos === 1 ? "e" : "a";
  const semanas = `${ini.diaSemana} ${conector} ${fim.diaSemana}`;
  const mesmoMes = ini.ymd.slice(0, 7) === fim.ymd.slice(0, 7);
  const mesmoAno = ini.ano === fim.ano;

  return {
    ...base,
    metaValue: mesmoMes
      ? `${ini.dia2} ${conector} ${fim.dia2} · ${ini.mesLongo}`
      : `${ini.dia2} · ${ini.mesLongo} – ${fim.dia2} · ${fim.mesLongo}`,
    metaSub: `${mesmoAno ? ini.ano : `${ini.ano}–${fim.ano}`} · ${semanas}`,
    timelineDiaHtml: mesmoMes
      ? `${ini.dia2} ${conector} ${fim.dia2} de <em>${ini.mesLongo}</em> · ${semanas}`
      : `${ini.dia2} de <em>${ini.mesLongo}</em> a ${fim.dia2} de <em>${fim.mesLongo}</em> · ${semanas}`,
    sidebarValue: mesmoMes
      ? `${ini.dia2}–${fim.dia2} · ${ini.mesCurto} · ${ini.ano}`
      : mesmoAno
        ? `${ini.dia2} · ${ini.mesCurto} – ${fim.dia2} · ${fim.mesCurto} · ${fim.ano}`
        : `${ini.dia2} · ${ini.mesCurto} · ${ini.ano} – ${fim.dia2} · ${fim.mesCurto} · ${fim.ano}`,
    dataEvento: mesmoMes
      ? `${ini.diaNum} ${conector} ${fim.diaNum} de ${ini.mesLongo.toLowerCase()} de ${ini.ano}`
      : mesmoAno
        ? `${ini.diaNum} de ${ini.mesLongo.toLowerCase()} a ${fim.diaNum} de ${fim.mesLongo.toLowerCase()} de ${fim.ano}`
        : `${ini.diaNum} de ${ini.mesLongo.toLowerCase()} de ${ini.ano} a ${fim.diaNum} de ${fim.mesLongo.toLowerCase()} de ${fim.ano}`,
    icsEnd: `${fim.compactaIcs}T180000`,
    cardDiaFim: fim.dia2,
    cardMesAno: mesmoMes
      ? `${ini.mesCurto} · ${ini.ano}`
      : mesmoAno
        ? `${ini.mesCurto} – ${fim.mesCurto} · ${fim.ano}`
        : `${ini.mesCurto} ${ini.ano} – ${fim.mesCurto} ${fim.ano}`,
  };
}
