import "server-only";

import { formatarMoedaBRL } from "@/lib/cms/kpisComercial";

import type { DadosDocumentoProposta } from "./dados";

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatarDataDocumento(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

interface Secao {
  titulo: string;
  corpo: string;
}

/** Numera as seções em sequência, ignorando o array — nenhuma seção desta
 * fatia é condicionalmente omitida ainda (isso passa a valer quando as
 * seções descritivas, que podem vir vazias da Biblioteca Comercial, forem
 * adicionadas numa sessão futura). */
function montarSecoesNumeradas(secoes: Secao[]): string {
  return secoes
    .map(
      (s, i) =>
        `<section class="sec"><h2><span class="num">${i + 1}</span>${esc(s.titulo)}</h2>${s.corpo}</section>`,
    )
    .join("");
}

function secaoIdentificacao(d: DadosDocumentoProposta): Secao {
  return {
    titulo: "Dados de Identificação da Proposta",
    corpo: `
      <div class="grid2">
        <div class="box"><div class="label">Código</div><div class="value" style="font-size:11pt">${esc(d.codigo)}</div></div>
        <div class="box"><div class="label">Versão</div><div class="value">v${String(d.versao).padStart(2, "0")}</div></div>
        <div class="box"><div class="label">Cliente</div><div class="text">${esc(d.clienteOrgao)} (${esc(d.clienteSigla)})</div></div>
        <div class="box"><div class="label">Programa</div><div class="text">${esc(d.programaNome)}${d.programaSigla ? ` (${esc(d.programaSigla)})` : ""}</div></div>
        <div class="box"><div class="label">Emissão</div><div class="text">${formatarDataDocumento(d.dataCriacaoISO)}</div></div>
        <div class="box"><div class="label">Validade</div><div class="text">${formatarDataDocumento(d.validadeISO)}</div></div>
      </div>
    `,
  };
}

function secaoQuadroComercial(d: DadosDocumentoProposta): Secao {
  const acessos = d.qtdPagantes + d.cortesias;
  const linhasItens = d.itens.length
    ? d.itens
        .map(
          (i) =>
            `<tr><td>${esc(i.rotulo)}</td><td>${esc(i.cargaHoraria)}</td><td class="qc-right">${formatarMoedaBRL(i.valorUnitario)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" style="text-align:center;color:#6B6B6B;font-style:italic">Item único · ${formatarMoedaBRL(d.valorUnitario)}</td></tr>`;

  return {
    titulo: "Quadro Comercial",
    corpo: `
      <p>Apresentamos o quadro de investimento da presente proposta, fundamentado em quantitativo de <strong>${d.qtdPagantes} inscrição(ões) pagante(s)</strong> e <strong>${d.cortesias} cortesia(s) institucional(is)</strong>, totalizando <strong>${acessos} acessos</strong>.</p>
      <table class="qc"><thead><tr><th>Item</th><th>CH</th><th class="qc-right">Valor unitário</th></tr></thead><tbody>${linhasItens}</tbody></table>
      <table class="qc"><tbody>
        <tr><td>Valor bruto</td><td class="qc-right">${formatarMoedaBRL(d.valorBruto)}</td></tr>
        <tr><td>Desconto institucional (${d.percDesconto}%)</td><td class="qc-right">${formatarMoedaBRL(d.desconto)}</td></tr>
        <tr class="total"><td>VALOR LÍQUIDO DA PROPOSTA</td><td class="qc-right">${formatarMoedaBRL(d.valorLiquido)}</td></tr>
      </tbody></table>
    `,
  };
}

function secaoCondicoesComerciais(d: DadosDocumentoProposta): Secao {
  return {
    titulo: "Condições Comerciais",
    corpo: `
      <div class="grid2">
        <div class="box"><div class="label">Forma de Pagamento</div><div class="text">${esc(d.condPagto)}</div></div>
        <div class="box"><div class="label">Modalidade</div><div class="text">${esc(d.modalidade)}</div></div>
        <div class="box"><div class="label">Período de Replay</div><div class="text">${esc(d.replay)}</div></div>
        <div class="box"><div class="label">Validade da Proposta</div><div class="text">${formatarDataDocumento(d.validadeISO)}</div></div>
      </div>
      ${d.condEspecificas ? `<h3>Condições Específicas</h3><p>${esc(d.condEspecificas)}</p>` : ""}
    `,
  };
}

function montarCapa(d: DadosDocumentoProposta): string {
  return `<div class="cover">
    <div class="cover-top">
      <div class="brand">Instituto NTC do Brasil</div>
      <div class="selo">Proposta Técnico-Comercial</div>
      <div class="selo" style="margin-top:2pt">${esc(d.tipoTexto)}</div>
    </div>
    <div class="cover-mid">
      <div class="titulo">${esc(d.programaNome)}</div>
      <div class="linha-deco"></div>
      <div class="destinatario">Destinada a<strong>${esc(d.clienteOrgao)}</strong></div>
    </div>
    <div class="cover-bot">
      <div class="meta">
        <div><strong>Cliente</strong>${esc(d.clienteSigla)}</div>
        <div><strong>UF · Município</strong>${esc(d.clienteUf)} · ${esc(d.clienteMunicipio)}</div>
        <div><strong>Dirigente</strong>${esc(d.clienteDirigente)}</div>
        <div><strong>Modalidade</strong>${esc(d.modalidade)}</div>
        <div><strong>Emissão</strong>${formatarDataDocumento(d.dataCriacaoISO)}</div>
        <div><strong>Validade</strong>${formatarDataDocumento(d.validadeISO)}</div>
        <div><strong>Versão</strong>v${String(d.versao).padStart(2, "0")}</div>
        <div><strong>Elaborador</strong>${esc(d.elaboradorNome)}</div>
      </div>
      <div class="codigo">${esc(d.codigo)}</div>
    </div>
  </div>`;
}

function estilosDocumento(): string {
  // Tokens do site (packages/ui/src/tokens.ts) — decisão confirmada nesta
  // sessão: o documento usa a paleta oficial, não a paleta própria do
  // legado NTC_Comercial_Premium.html.
  return `<style>
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#fff}
    body{font-family:'Barlow',sans-serif;color:#2B2B2B;line-height:1.55;font-size:10.5pt}
    h1,h2,h3{font-family:'Cormorant Garamond',serif;color:#11365E;font-weight:600}
    h2{font-size:17pt;margin:14pt 0 7pt;padding-bottom:5pt;border-bottom:1px solid #B5995A;display:flex;align-items:center;gap:9pt}
    h2 .num{display:inline-flex;align-items:center;justify-content:center;width:26pt;height:26pt;background:#11365E;color:#B5995A;font-family:'Cormorant Garamond';font-size:13pt;border-radius:50%;flex-shrink:0}
    h3{font-size:12.5pt;color:#1E4E8C;margin:9pt 0 4pt}
    p{margin-bottom:6pt;text-align:justify}
    strong{color:#11365E;font-weight:600}

    .cover{width:210mm;min-height:297mm;padding:28mm 22mm 26mm;background:linear-gradient(135deg,#11365E 0%,#0B2545 100%);color:#F4EFE6;page-break-after:always;display:flex;flex-direction:column;justify-content:space-between}
    .cover .brand{font-family:'Cormorant Garamond';font-size:12.5pt;color:#B5995A;letter-spacing:3pt;text-transform:uppercase;font-weight:600}
    .cover .selo{font-size:8.5pt;letter-spacing:2.3pt;color:#D9D2C4;margin-top:5pt;text-transform:uppercase}
    .cover .titulo{font-family:'Cormorant Garamond';font-size:34pt;line-height:1.08;color:#F4EFE6;margin:10pt 0;font-weight:600}
    .cover .linha-deco{width:60mm;height:1.5pt;background:#B5995A;margin:8pt 0 14pt;opacity:.7}
    .cover .destinatario{font-family:'Cormorant Garamond';font-size:15pt;color:#F4EFE6;line-height:1.32}
    .cover .destinatario strong{color:#B5995A;display:block;font-size:18pt;margin-top:3pt}
    .cover .meta{display:grid;grid-template-columns:1fr 1fr;gap:7pt 14pt;font-size:9.5pt;color:#D9D2C4;margin-top:14pt}
    .cover .meta strong{color:#B5995A;display:block;text-transform:uppercase;font-size:7.5pt;letter-spacing:1.4pt}
    .cover .codigo{font-size:9.5pt;letter-spacing:1.8pt;color:#D9D2C4;margin-top:12pt;border-top:1pt solid rgba(181,153,90,.4);padding-top:10pt;text-transform:uppercase}

    .body-wrap{padding:0 18mm}
    .sec{margin-bottom:10pt;page-break-inside:avoid}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:9pt}
    .box{background:#F4EFE6;border:1pt solid #D9D2C4;border-radius:5pt;padding:9pt 12pt}
    .box .label{font-size:7.8pt;letter-spacing:1.4pt;text-transform:uppercase;color:#5A5A5A;font-weight:600}
    .box .value{font-family:'Cormorant Garamond';font-size:15pt;color:#11365E;font-weight:600;margin-top:2pt}
    .box .text{margin-top:3pt;font-size:9.8pt}

    table.qc{width:100%;border-collapse:collapse;font-size:9.8pt;margin:8pt 0}
    table.qc th{background:#11365E;color:#B5995A;padding:6.5pt 9pt;text-align:left;font-size:8.5pt;letter-spacing:1pt;text-transform:uppercase}
    table.qc td{padding:6.5pt 9pt;border-bottom:1pt solid #D9D2C4}
    table.qc tr:nth-child(even) td{background:#F4EFE6}
    table.qc .total td{background:#11365E;color:#F4EFE6;font-weight:600;font-size:11pt}
    table.qc .total td:last-child{color:#B5995A}
    .qc-right{text-align:right;font-variant-numeric:tabular-nums}
  </style>`;
}

export function montarHtmlDocumentoProposta(dados: DadosDocumentoProposta): string {
  const secoes = montarSecoesNumeradas([
    secaoIdentificacao(dados),
    secaoQuadroComercial(dados),
    secaoCondicoesComerciais(dados),
  ]);

  return `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8">
<title>${esc(dados.codigo)} · Proposta Instituto NTC</title>
${estilosDocumento()}
</head>
<body>
${montarCapa(dados)}
<div class="body-wrap">${secoes}</div>
</body></html>`;
}
