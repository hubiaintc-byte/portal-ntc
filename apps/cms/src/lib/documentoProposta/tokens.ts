/**
 * Tokens visuais do documento da proposta comercial.
 *
 * EXCECAO DELIBERADA AO §3 DO CLAUDE.md: a paleta abaixo (navy/gold/offwhite
 * do modelo) NAO e a paleta Soberana. O documento da proposta e contratual e
 * segue o modelo aprovado pelo PO (docs/prototipos/proposta-modelo-v1.html),
 * conforme o spec docs/superpowers/specs/2026-10-03-crm-sessao-2-documento-proposta-design.md §6.
 * A excecao fica confinada a este arquivo para ser auditavel: nenhum outro
 * lugar do codigo deve declarar estas cores. Fora do documento da proposta
 * (site e painel) a paleta Soberana segue valendo.
 */

export const PALETA_PROPOSTA: Readonly<Record<string, string>> = {
  navy: "#0E2A47",
  "navy-exec": "#1E4474",
  gold: "#B68B40",
  "gold-light": "#D6B070",
  offwhite: "#F5EDD8",
  "bg-suave": "#FBF9F2",
  ink: "#3A3A3A",
  "ink-mid": "#6B6B6B",
  acento: "#1E5B7B",
  "acento-claro": "#3B8AB0",
};

/** Bloco `:root` com as variaveis CSS da paleta. */
export function cssVariaveisProposta(): string {
  const linhas = Object.entries(PALETA_PROPOSTA).map(([k, v]) => `  --${k}: ${v};`);
  return `:root {\n${linhas.join("\n")}\n}`;
}

/**
 * Reset, tipografia e classes de layout transcritos do modelo. Sem @font-face
 * (FONTES_EMBUTIDAS_CSS e composto na montagem final), sem @page (a margem e
 * aplicada ao gerar o PDF) e sem margin boxes (o Chromium nao os implementa;
 * cabecalho e rodape vem do headerTemplate/footerTemplate do Playwright).
 */
export function cssBaseProposta(): string {
  return `
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff}
body{font-family:'Barlow',sans-serif;color:var(--ink);line-height:1.55;font-size:10.5pt}
h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;color:var(--navy);font-weight:600;letter-spacing:.2pt}
h2{font-size:17pt;margin:14pt 0 8pt;padding-bottom:6pt;border-bottom:1px solid var(--gold-light);display:flex;align-items:center;gap:9pt;page-break-after:avoid}
h2 .num{display:inline-flex;align-items:center;justify-content:center;width:26pt;height:26pt;background:var(--navy);color:var(--gold-light);font-family:'Cormorant Garamond',serif;font-size:13pt;border-radius:50%;flex-shrink:0;font-weight:600;line-height:1}
h3{font-size:12.5pt;color:var(--navy-exec);margin:9pt 0 4pt;page-break-after:avoid}
h4{font-size:10pt;color:var(--gold);margin:7pt 0 3pt;text-transform:uppercase;letter-spacing:.6pt;page-break-after:avoid}
p{margin-bottom:6pt;text-align:justify;orphans:3;widows:3;hyphens:auto}
ul,ol{margin-left:14pt;margin-bottom:6pt}
li{margin-bottom:2.5pt;text-align:justify}
strong{color:var(--navy);font-weight:600}

/* ===== CAPA ===== */
.cover{width:210mm;height:297mm;padding:22mm 22mm 24mm;background:linear-gradient(135deg,var(--navy) 0%,#08182B 100%);color:var(--offwhite);page-break-after:always;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-sizing:border-box}
.cover::before{content:"";position:absolute;top:-55mm;right:-55mm;width:170mm;height:170mm;border:1.5pt solid var(--gold);border-radius:50%;opacity:.14}
.cover::after{content:"";position:absolute;bottom:-38mm;left:-38mm;width:115mm;height:115mm;border:1.5pt solid var(--gold-light);border-radius:50%;opacity:.1}
.cover-top,.cover-mid,.cover-bot{position:relative;z-index:2}
.cover .logo-oficial svg{height:54pt;width:auto;display:block;margin-bottom:8pt}
.cover .selo{font-family:'Cormorant Garamond',serif;font-size:9pt;letter-spacing:2.5pt;color:#C9BC9A;margin-top:6pt;text-transform:uppercase;font-weight:500}
.cover .selo-tipo{font-family:'Cormorant Garamond',serif;font-size:10pt;letter-spacing:2.5pt;color:var(--gold-light);margin-top:3pt;text-transform:uppercase;font-weight:600}

/* SELO DO PROGRAMA (acento por programa) */
.selo-programa{display:inline-block;margin-top:14pt;padding:5pt 14pt;background:var(--acento);border:1pt solid var(--acento-claro);border-radius:99pt;color:var(--offwhite);font-family:'Barlow',sans-serif;font-size:7.5pt;letter-spacing:2pt;text-transform:uppercase;font-weight:600}
.tagline-programa{font-family:'Cormorant Garamond',serif;font-size:11.5pt;color:var(--gold-light);letter-spacing:2pt;margin-top:8pt;font-style:italic;text-transform:uppercase}

.cover .titulo{font-family:'Cormorant Garamond',serif;font-size:30pt;line-height:1.06;color:var(--offwhite);margin-bottom:8pt;font-weight:600}
.cover .subtitulo{font-family:'Cormorant Garamond',serif;font-size:15pt;color:var(--gold-light);line-height:1.22;margin-bottom:14pt;font-weight:500;font-style:italic}
.cover .linha-deco{width:60mm;height:1.5pt;background:var(--gold-light);margin:8pt 0 14pt;opacity:.7}
.cover .destinatario{font-family:'Cormorant Garamond',serif;font-size:13pt;color:var(--offwhite);line-height:1.32;font-weight:500}
.cover .destinatario strong{color:var(--gold-light);font-weight:600;display:block;font-size:15pt;margin-top:3pt}
.cover .meta{display:grid;grid-template-columns:1fr 1fr;gap:7pt 14pt;font-size:9.2pt;color:#C9BC9A;margin-top:14pt}
.cover .meta strong{color:var(--gold-light);font-weight:600;display:block;text-transform:uppercase;font-size:7.3pt;letter-spacing:1.4pt;margin-bottom:1pt}
.cover .codigo{font-family:'Barlow',sans-serif;font-size:9pt;letter-spacing:1.6pt;color:#C9BC9A;margin-top:12pt;border-top:1pt solid rgba(214,176,112,.4);padding-top:10pt;text-transform:uppercase;font-weight:500}

/* ===== RESUMO EXECUTIVO ===== */
.resumo-exec{padding:4pt 0 0;page-break-after:always}
.header-pag{display:flex;align-items:center;justify-content:space-between;border-bottom:2pt solid var(--gold-light);padding-bottom:10pt;margin-bottom:14pt}
.header-pag svg{height:36pt;width:auto}
.header-pag .programa-id{font-family:'Cormorant Garamond',serif;font-size:10pt;letter-spacing:2pt;color:var(--gold);text-transform:uppercase;text-align:right;font-weight:600}
.header-pag .programa-id .sigla{color:var(--acento);font-size:14pt;letter-spacing:3pt;display:block;margin-top:2pt}

.titulo-pagina{font-family:'Cormorant Garamond',serif;font-size:24pt;color:var(--navy);font-weight:600;line-height:1.05;margin-bottom:4pt}
.subtitulo-pagina{font-family:'Cormorant Garamond',serif;font-size:13pt;color:var(--gold);font-style:italic;margin-bottom:14pt}

.objeto-destacado{background:var(--bg-suave);border-left:4pt solid var(--gold);padding:13pt 16pt;margin:0 0 14pt;font-size:11pt;line-height:1.55;font-family:'Cormorant Garamond',serif;color:var(--navy);page-break-inside:avoid}
.objeto-destacado strong{color:var(--gold)}

/* Card de INVESTIMENTO LÍQUIDO em destaque FULL-WIDTH */
.card-investimento{background:linear-gradient(135deg,var(--navy) 0%,var(--navy-exec) 100%);color:var(--offwhite);border-radius:10pt;padding:18pt 22pt;margin-bottom:12pt;display:flex;justify-content:space-between;align-items:center;page-break-inside:avoid;position:relative;overflow:hidden;box-shadow:0 4pt 14pt rgba(14,42,71,.25)}
.card-investimento::before{content:"";position:absolute;top:-30mm;right:-30mm;width:80mm;height:80mm;border:1pt solid var(--gold);border-radius:50%;opacity:.18}
.card-investimento .label-inv{font-size:8.5pt;letter-spacing:2.4pt;text-transform:uppercase;color:var(--gold-light);font-weight:600;margin-bottom:6pt;position:relative;z-index:2}
.card-investimento .valor-inv{font-family:'Cormorant Garamond',serif;font-size:36pt;color:var(--offwhite);font-weight:600;line-height:1;position:relative;z-index:2}
.card-investimento .desc-inv{font-size:9pt;color:#C9BC9A;margin-top:6pt;line-height:1.4;max-width:90mm;position:relative;z-index:2}
.card-investimento .badge-desc{display:inline-block;background:var(--gold);color:var(--navy);padding:5pt 11pt;border-radius:99pt;font-family:'Barlow',sans-serif;font-size:9pt;font-weight:700;letter-spacing:1pt;text-transform:uppercase;position:relative;z-index:2}

/* Card de CONDIÇÃO INSTITUCIONAL NEGOCIADA */
.card-negociado{background:linear-gradient(135deg,var(--bg-suave) 0%,#F0E8D2 100%);border:1.5pt solid var(--gold);border-radius:8pt;padding:14pt 18pt;margin-bottom:14pt;page-break-inside:avoid;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12pt}
.card-negociado .titulo-neg{grid-column:1/-1;display:flex;align-items:center;gap:8pt;font-family:'Cormorant Garamond',serif;font-size:13pt;color:var(--navy);font-weight:600;padding-bottom:7pt;border-bottom:1pt dashed var(--gold)}
.card-negociado .titulo-neg::before{content:"★";color:var(--gold);font-size:14pt}
.card-negociado .item-neg .label-neg{font-size:7.4pt;letter-spacing:1.4pt;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:3pt}
.card-negociado .item-neg .valor-neg{font-family:'Cormorant Garamond',serif;font-size:14pt;color:var(--navy);font-weight:600;line-height:1.15}
.card-negociado .item-neg .desc-neg{font-size:8.4pt;color:var(--ink-mid);margin-top:2pt;line-height:1.35}

.cards-resumo{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8pt 10pt;margin-bottom:14pt}
.cards-resumo .card{background:var(--bg-suave);border:1pt solid #E2DCCC;border-radius:6pt;padding:10pt 13pt;page-break-inside:avoid}
.cards-resumo .card .label{font-size:7.5pt;letter-spacing:1.5pt;text-transform:uppercase;color:var(--gold);font-weight:600;line-height:1.2;margin-bottom:4pt}
.cards-resumo .card .value{font-family:'Cormorant Garamond',serif;font-size:15pt;color:var(--navy);font-weight:600;line-height:1.15}
.cards-resumo .card .value.menor{font-size:11pt;line-height:1.3}
.cards-resumo .card .desc{font-size:8.4pt;color:var(--ink-mid);margin-top:3pt;line-height:1.35}

/* ===== SEÇÕES ===== */
.body-wrap{padding:0}
.sec{page-break-inside:auto;margin-bottom:10pt}
.sec p,.sec ul,.sec ol,.sec .grid2,.sec .grid3,.sec table.qc,.sec .modulo-premium,.sec .docente-card,.sec .box,.sec .quote{page-break-inside:avoid}
.quote{background:var(--bg-suave);border-left:3pt solid var(--gold);padding:8pt 13pt;font-style:italic;color:var(--ink);margin:8pt 0;font-family:'Cormorant Garamond',serif;font-size:12pt;line-height:1.4}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:9pt}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8pt}
.box{background:var(--bg-suave);border:1pt solid #E2DCCC;border-radius:5pt;padding:9pt 12pt}
.box .label{font-size:7.8pt;letter-spacing:1.4pt;text-transform:uppercase;color:var(--ink-mid);font-weight:600;line-height:1.2}
.box .value{font-family:'Cormorant Garamond',serif;font-size:14pt;color:var(--navy);font-weight:600;margin-top:2pt;line-height:1.15}
.box .text{margin-top:3pt;font-size:9.8pt;line-height:1.4}

/* ===== MÓDULO PREMIUM ===== */
.modulo-premium{background:var(--bg-suave);border:1pt solid #E2DCCC;border-radius:8pt;padding:14pt 18pt 14pt 72pt;position:relative;margin-bottom:11pt;page-break-inside:avoid;border-top:3pt solid var(--acento)}
.modulo-premium .numero{position:absolute;left:14pt;top:14pt;width:42pt;height:42pt;background:linear-gradient(135deg,var(--navy) 0%,var(--acento) 100%);color:var(--gold-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:21pt;font-weight:600;line-height:1;box-shadow:0 2pt 6pt rgba(14,42,71,.18)}
.modulo-premium .titulo-mod{font-family:'Cormorant Garamond',serif;font-size:14pt;color:var(--navy);font-weight:600;line-height:1.18;margin-bottom:6pt}
.modulo-premium .badges{display:flex;flex-wrap:wrap;gap:5pt;margin-bottom:8pt}
.modulo-premium .badge{display:inline-block;padding:2pt 8pt;border-radius:99pt;font-size:7.5pt;letter-spacing:.8pt;text-transform:uppercase;font-weight:600;color:#fff;background:var(--navy-exec)}
.modulo-premium .badge.gold{background:var(--gold)}
.modulo-premium .badge.acento{background:var(--acento)}
.modulo-premium .badge.outline{background:transparent;color:var(--navy-exec);border:1pt solid var(--navy-exec)}
.modulo-premium .grid-mod{display:grid;grid-template-columns:1fr 1fr;gap:10pt;margin-top:8pt}
.modulo-premium .bloco-mod h5{font-family:'Barlow',sans-serif;font-size:8.2pt;letter-spacing:1.4pt;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:5pt}
.modulo-premium .bloco-mod ul{margin:0;padding-left:14pt}
.modulo-premium .bloco-mod li{font-size:9.2pt;line-height:1.45;color:var(--ink);margin-bottom:3pt;text-align:left}
.modulo-premium .docentes-line{font-size:9.2pt;color:var(--ink);line-height:1.5}
.modulo-premium .docentes-line .nome-doc{color:var(--navy);font-weight:600}
.modulo-premium .nota-anexo{margin-top:9pt;padding-top:7pt;border-top:1pt dashed var(--gold-light);font-size:8.5pt;color:var(--ink-mid);font-style:italic}
.modulo-premium .nota-anexo strong{color:var(--acento)}

/* ===== DOCENTES ===== */
.docente-card{background:var(--bg-suave);border:1pt solid #E2DCCC;border-radius:6pt;padding:11pt 14pt;margin-bottom:7pt;page-break-inside:avoid;border-left:3pt solid var(--acento)}
.docente-card .nome{font-family:'Cormorant Garamond',serif;font-size:13.5pt;color:var(--navy);font-weight:600;line-height:1.15;margin-bottom:2pt}
.docente-card .titulacao{font-size:8.5pt;letter-spacing:.6pt;color:var(--gold);font-weight:600;margin-bottom:4pt;text-transform:uppercase}
.docente-card .bio{font-size:9.4pt;line-height:1.48;color:var(--ink);text-align:justify}

/* ===== QUADRO COMERCIAL ===== */
table.qc{width:100%;border-collapse:collapse;font-size:9.8pt;margin:8pt 0}
table.qc thead{display:table-header-group}
table.qc tr{page-break-inside:avoid}
table.qc th{background:var(--navy);color:var(--gold-light);padding:6.5pt 9pt;text-align:left;font-size:8.5pt;letter-spacing:1pt;text-transform:uppercase;font-weight:600}
table.qc td{padding:6.5pt 9pt;border-bottom:1pt solid #E2DCCC}
table.qc tr:nth-child(even) td{background:var(--bg-suave)}
table.qc .total td{background:var(--navy);color:var(--offwhite);font-weight:600;font-size:11pt;padding:8pt 9pt}
table.qc .total td:last-child{color:var(--gold-light)}
.qc-right{text-align:right}

/* ===== CONTRACAPA ===== */
.contracapa{page:contracapa;width:210mm;height:297mm;background:linear-gradient(135deg,var(--navy) 0%,#08182B 100%);color:var(--offwhite);padding:26mm 22mm;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden;box-sizing:border-box;page-break-before:always}
.contracapa::before{content:"";position:absolute;top:-45mm;left:-45mm;width:140mm;height:140mm;border:1.5pt solid var(--gold);border-radius:50%;opacity:.13}
.contracapa::after{content:"";position:absolute;bottom:-50mm;right:-50mm;width:160mm;height:160mm;border:1.5pt solid var(--gold-light);border-radius:50%;opacity:.1}
.contracapa-top, .contracapa-mid, .contracapa-bot{position:relative;z-index:2}
.contracapa-top{text-align:center}
.contracapa-top .selo-cima{font-family:'Cormorant Garamond',serif;font-size:10pt;letter-spacing:3pt;color:var(--gold-light);text-transform:uppercase;margin-bottom:6pt}
.contracapa-mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.contracapa-mid .logo-grande{margin-bottom:20pt}
.contracapa-mid .logo-grande svg{height:96pt;width:auto;display:block}
.contracapa-mid .slogan{font-family:'Cormorant Garamond',serif;font-size:28pt;color:var(--offwhite);line-height:1.1;font-weight:600;margin-bottom:8pt;font-style:italic}
.contracapa-mid .submotto{font-family:'Cormorant Garamond',serif;font-size:13pt;color:var(--gold-light);font-style:italic;margin-bottom:14pt;max-width:140mm;line-height:1.4}
.contracapa-mid .linha-deco-c{width:70mm;height:1.5pt;background:var(--gold-light);opacity:.7;margin-bottom:16pt}
.contracapa-mid .qr-area{margin-top:8pt;display:flex;align-items:center;gap:14pt;justify-content:center}
.contracapa-mid .qr-placeholder{width:24mm;height:24mm;border:2pt solid var(--gold-light);border-radius:4pt;background:rgba(214,176,112,.08);display:flex;align-items:center;justify-content:center;font-family:'Barlow',sans-serif;font-size:7pt;color:var(--gold-light);letter-spacing:1.5pt;text-transform:uppercase;text-align:center;padding:3pt}
.contracapa-mid .qr-label{text-align:left;font-family:'Cormorant Garamond',serif;font-size:10.5pt;color:var(--gold-light);line-height:1.4;max-width:60mm}
.contracapa-mid .qr-label strong{color:var(--offwhite);font-size:11pt;display:block;margin-bottom:2pt}
.contracapa-bot{text-align:center}
.contracapa-bot .endereco{font-family:'Cormorant Garamond',serif;font-size:10.5pt;color:var(--gold-light);letter-spacing:1.2pt;text-transform:uppercase;margin-bottom:6pt;font-weight:600}
.contracapa-bot .dados-end{font-size:9pt;color:#C9BC9A;line-height:1.5;margin-bottom:12pt}
.contracapa-bot .contatos-titulo{font-family:'Cormorant Garamond',serif;font-size:10.5pt;color:var(--gold-light);letter-spacing:1.2pt;text-transform:uppercase;margin-bottom:6pt;font-weight:600}
.contracapa-bot .contatos{display:grid;grid-template-columns:1fr 1fr;gap:4pt 18pt;font-size:9pt;color:var(--offwhite);line-height:1.5;max-width:130mm;margin:0 auto}
.contracapa-bot .contatos strong{color:var(--gold-light);font-weight:600;display:inline-block;min-width:54pt}
.contracapa-bot .selo-final{font-family:'Cormorant Garamond',serif;font-size:8pt;letter-spacing:2pt;color:#8A7E5F;text-transform:uppercase;margin-top:14pt;border-top:1pt solid rgba(214,176,112,.3);padding-top:11pt}
`;
}
