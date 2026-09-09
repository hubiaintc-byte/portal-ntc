/**
 * Reprodução automatizada do bug do widget Turnstile (09/09/2026).
 *
 * O sintoma que este script captura: com o *implicit rendering* do Turnstile,
 * o api.js injeta o iframe no HTML do servidor e a hidratação do React remove
 * esse iframe — o Turnstile perde o widget e loga "Cannot find Widget". Sem
 * widget vivo não há token, e os handlers rejeitam o envio com 400.
 *
 * Não dá para afirmar sobre o TOKEN aqui: navegador automatizado é bot, e o
 * Turnstile corretamente exige desafio interativo. O que é determinístico, e
 * é o que se afirma: nenhum widget pode ser destruído depois de criado.
 *
 * Uso: pnpm dev:web noutro terminal, depois
 *   node scripts/verificar-turnstile.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGINAS = [
  { url: `${BASE}/contato`, rotulo: "/contato", widgetsEsperados: 4 },
  { url: `${BASE}/conteudos`, rotulo: "/conteudos", widgetsEsperados: 1 },
];

let falhou = false;
const navegador = await chromium.launch();

for (const { url, rotulo, widgetsEsperados } of PAGINAS) {
  const pagina = await navegador.newPage();
  const orfaos = [];
  const errosTurnstile = [];
  pagina.on("console", (m) => {
    const t = m.text().trim();
    if (/Cannot find Widget/i.test(t)) orfaos.push(t);
    // TurnstileError cobre erro de uso da API (ex.: ready() com async/defer),
    // que é justamente o que passou batido na primeira versão deste script.
    else if (m.type() === "error" && /Turnstile/i.test(t)) errosTurnstile.push(t);
  });
  pagina.on("pageerror", (e) => {
    if (/Turnstile/i.test(e.message)) errosTurnstile.push(e.message.trim());
  });

  await pagina.goto(url, { waitUntil: "domcontentloaded" });
  await pagina.waitForTimeout(8000);

  const dom = await pagina.evaluate(() => {
    const campos = [...document.querySelectorAll('[name="cf-turnstile-response"]')];
    return {
      containers: document.querySelectorAll("[data-turnstile]").length,
      implicitos: document.querySelectorAll(".cf-turnstile").length,
      scripts: [...document.querySelectorAll('script[src*="challenges.cloudflare.com"]')].map((s) => s.getAttribute("src")),
      widgetMontado: !!document.querySelector("[data-turnstile] > div"),
      campos: campos.length,
      camposSaoInput: campos.every((c) => c instanceof HTMLInputElement),
      duplicadosNoForm: [...document.querySelectorAll("form")].some(
        (f) => f.querySelectorAll('[name="cf-turnstile-response"]').length > 1,
      ),
    };
  });

  const problemas = [];
  if (orfaos.length > 0) problemas.push(`${orfaos.length} widget(s) destruído(s) após criados`);
  if (errosTurnstile.length > 0) problemas.push(`${errosTurnstile.length} erro(s) da API do Turnstile`);
  if (dom.implicitos > 0)
    problemas.push(`${dom.implicitos} container(es) com classe cf-turnstile (scan implícito briga com o React)`);
  if (dom.scripts.some((s) => !s?.includes("render=explicit")))
    problemas.push("api.js carregado sem render=explicit");
  if (dom.containers !== widgetsEsperados)
    problemas.push(`${dom.containers} container(es), esperado ${widgetsEsperados}`);
  if (dom.campos !== widgetsEsperados)
    problemas.push(`${dom.campos} campo(s) cf-turnstile-response, esperado ${widgetsEsperados}`);
  if (!dom.camposSaoInput) problemas.push("campo cf-turnstile-response não é <input>");
  if (!dom.widgetMontado) problemas.push("nenhum widget montado dentro do container (turnstile.render não rodou)");
  if (dom.duplicadosNoForm)
    problemas.push("form com 2 campos cf-turnstile-response (namedItem devolveria RadioNodeList)");

  if (problemas.length) {
    falhou = true;
    console.log(`FALHOU  ${rotulo}: ${problemas.join(" · ")}`);
    [...errosTurnstile, ...orfaos].slice(0, 3).forEach((o) => console.log(`         ${o}`));
  } else {
    console.log(`ok      ${rotulo}: ${dom.containers} widget(s) vivo(s), nenhum destruído`);
  }
  await pagina.close();
}

await navegador.close();
process.exit(falhou ? 1 : 0);
