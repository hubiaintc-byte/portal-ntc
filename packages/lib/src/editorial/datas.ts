/**
 * Data legível de um campo `type: "date"` do Payload.
 *
 * O Payload guarda esses campos como datetime em UTC (meia-noite), então
 * `new Date(iso).toLocaleDateString("pt-BR")` mostra o dia anterior em
 * America/Sao_Paulo (UTC−3) — e, num Client Component, o servidor (UTC) e o
 * navegador (UTC−3) chegam a resultados diferentes, o que é erro de
 * hidratação. Recortar os 10 primeiros caracteres resolve os dois problemas
 * de uma vez: não há fuso nem Intl no caminho, o resultado é o mesmo em
 * qualquer máquina.
 *
 * Entrada não-ISO (ou vazia) volta como veio — quem chama decide o
 * placeholder.
 */
export function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}
