/**
 * Deriva todos os formatos de data exibidos numa página de evento online a
 * partir de uma data ISO (campo dataInicio do CMS). Não depende do locale do
 * runtime — usa tabelas literais pt-BR (noUncheckedIndexedAccess seguro).
 *
 * Horários do evento (08h–18h) são fixos nesta v1 (não vêm do CMS).
 */

export interface DatasDerivadasEvento {
  metaValue: string; // "15 · Junho"
  metaSub: string; // "2026 · Segunda-feira"
  timelineDiaHtml: string; // "15 de <em>Junho</em> · Segunda-feira"
  sidebarValue: string; // "15 · Jun · 2026"
  dataEvento: string; // "15 de junho de 2026"
  deadlineISO: string; // "2026-06-15T23:59:59-03:00"
  countdownDateText: string; // "Até 15 de Junho de 2026"
  icsStart: string; // "20260615T080000"
  icsEnd: string; // "20260615T180000"
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

export function derivarDatasEvento(iso: string): DatasDerivadasEvento {
  // Extrai Y-M-D do ISO sem depender de fuso (pega os 10 primeiros chars).
  const ymd = iso.slice(0, 10);
  const [aStr, mStr, dStr] = ymd.split("-");
  const ano = aStr ?? "2026";
  const mesIdx = (Number(mStr ?? "1") - 1 + 12) % 12;
  const diaNum = Number(dStr ?? "1");
  const dia2 = String(diaNum).padStart(2, "0");

  // Dia da semana via Date UTC (meio-dia evita drift de fuso).
  const dow = new Date(`${ymd}T12:00:00Z`).getUTCDay();
  const diaSemana = DIAS_SEMANA[dow] ?? "Segunda-feira";

  const mesLongo = MESES_LONGOS[mesIdx] ?? "Junho";
  const mesCurto = MESES_CURTOS[mesIdx] ?? "Jun";
  const mesMinusculo = mesLongo.toLowerCase();
  const compactaIcs = `${ano}${mStr?.padStart(2, "0") ?? "06"}${dia2}`;

  return {
    metaValue: `${dia2} · ${mesLongo}`,
    metaSub: `${ano} · ${diaSemana}`,
    timelineDiaHtml: `${dia2} de <em>${mesLongo}</em> · ${diaSemana}`,
    sidebarValue: `${dia2} · ${mesCurto} · ${ano}`,
    dataEvento: `${diaNum} de ${mesMinusculo} de ${ano}`,
    deadlineISO: `${ymd}T23:59:59-03:00`,
    countdownDateText: `Até ${dia2} de ${mesLongo} de ${ano}`,
    icsStart: `${compactaIcs}T080000`,
    icsEnd: `${compactaIcs}T180000`,
  };
}
