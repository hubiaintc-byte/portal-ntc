/**
 * Diagnóstico de responsividade mobile do portal.
 *
 * Modos (flags combináveis):
 *   node scripts/diagnostico-mobile.mjs                 → relatório de overflow horizontal
 *   node scripts/diagnostico-mobile.mjs --estrito       → exit 1 se houver qualquer ofensor
 *   node scripts/diagnostico-mobile.mjs --animacoes     → valida fade-in ao rolar (nada invisível)
 *   node scripts/diagnostico-mobile.mjs --screenshots   → captura fullPage de cada rota
 *
 * Requer o site no ar (pnpm dev:web). BASE_URL sobrepõe http://localhost:3000.
 * Saída em /tmp/diagnostico-mobile/.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SAIDA = "/tmp/diagnostico-mobile";

const ROTAS = [
  "/",
  "/agenda",
  "/agenda/prosus-brasilia",
  "/agenda/edutec-m01-2026",
  "/capacitacao",
  "/conteudos",
  "/contato",
  "/lgpd",
  "/mapa-do-site",
  "/politica-de-cookies",
  "/politica-de-privacidade",
  "/termos-de-uso",
  "/o-grupo",
  "/o-grupo/corpo-docente",
  "/programas/edutec",
  "/programas/edutec/modulos/m01",
  "/solucoes",
  "/solucoes-estrategicas/educacao",
  "/solucoes-estrategicas/gestao-publica",
  "/solucoes-estrategicas/saude",
];

const VIEWPORTS = [
  { nome: "iphone-375", width: 375, height: 812 },
  { nome: "android-412", width: 412, height: 915 },
];

const flags = new Set(process.argv.slice(2));
mkdirSync(SAIDA, { recursive: true });

/**
 * Coleta elementos que vazam horizontalmente do viewport.
 * Ignora falsos positivos: subtree de position:fixed (drawer off-canvas
 * não gera scrollbar), filhos de containers com overflow-x próprio
 * (auto/scroll/hidden/clip — o container já contém o vazamento) e o
 * skip-link (escondido fora da tela de propósito). Deduplica cadeias
 * pai→filho reportando só o elemento mais alto de cada vazamento.
 */
async function coletarOfensores(page, larguraConfigurada) {
  return page.evaluate((vwConfig) => {
    // Compara contra a largura CONFIGURADA do device: com isMobile o
    // Chrome expande o layout viewport (innerWidth) para conter o
    // overflow, o que esconderia exatamente o que procuramos.
    const vw = vwConfig;
    const ofensores = [];
    const flagrados = new Set();

    const contextoSeguro = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.position === "fixed") return true;
        if (n !== el) {
          const ox = cs.overflowX;
          if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") return true;
        }
      }
      return false;
    };

    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right <= vw + 1 && rect.left >= -1) continue;
      if (el.classList.contains("skip-link")) continue;
      if (el.parentElement && flagrados.has(el.parentElement)) {
        flagrados.add(el); // propaga para netos sem reportar de novo
        continue;
      }
      if (contextoSeguro(el)) continue;
      flagrados.add(el);
      const classes = el.className && typeof el.className === "string"
        ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".")
        : "";
      ofensores.push({
        seletor: el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + classes,
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        largura: Math.round(rect.width),
      });
    }
    return {
      larguraDocumento: document.documentElement.scrollWidth,
      larguraViewport: vw,
      vazamentoReal: document.documentElement.scrollWidth > vwConfig,
      ofensores: ofensores.slice(0, 40),
    };
  }, larguraConfigurada);
}

/** Rola até o fim e verifica se algum .fade-in ficou invisível. */
async function validarAnimacoes(page) {
  const temGuarda = await page.evaluate(() =>
    document.documentElement.classList.contains("anim-scroll"),
  );
  // Rola em passos de meia tela até o fim, dando tempo ao IntersectionObserver.
  await page.evaluate(async () => {
    const passo = window.innerHeight / 2;
    const total = document.documentElement.scrollHeight;
    for (let y = 0; y <= total; y += passo) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await page.waitForTimeout(1000);
  const invisiveis = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".fade-in"))
      .filter((el) => {
        const visivelNoLayout = el.getClientRects().length > 0;
        return visivelNoLayout && !el.classList.contains("is-visible");
      })
      .map((el) => el.tagName.toLowerCase() + "." + String(el.className).trim().split(/\s+/).slice(0, 3).join(".")),
  );
  return { temGuarda, invisiveis };
}

const navegador = await chromium.launch();
let totalOfensores = 0;
let totalInvisiveis = 0;
const relatorio = [];

for (const vp of VIEWPORTS) {
  const contexto = await navegador.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  });
  const page = await contexto.newPage();

  for (const rota of ROTAS) {
    // "load" + pausa curta: networkidle é flaky no dev server (HMR/polling).
    // Compilação on-demand do dev server pode estourar o timeout — re-tenta
    // e, se ainda falhar, registra e segue para a próxima rota.
    let navegou = false;
    for (let tentativa = 1; tentativa <= 3 && !navegou; tentativa++) {
      try {
        await page.goto(BASE + rota, { waitUntil: "load", timeout: 45000 });
        navegou = true;
      } catch {
        if (tentativa === 3) {
          console.log(`! ${vp.nome} ${rota} — navegação falhou após 3 tentativas, pulando`);
        }
      }
    }
    if (!navegou) {
      relatorio.push({ viewport: vp.nome, rota, erro: "timeout de navegação" });
      continue;
    }
    await page.waitForTimeout(600);
    const linha = { viewport: vp.nome, rota };

    const overflow = await coletarOfensores(page, vp.width);
    linha.overflow = overflow;
    if (overflow.vazamentoReal || overflow.ofensores.length > 0) {
      totalOfensores += Math.max(overflow.ofensores.length, overflow.vazamentoReal ? 1 : 0);
      console.log(`\n✗ ${vp.nome} ${rota} — doc ${overflow.larguraDocumento}px, viewport ${vp.width}px${overflow.vazamentoReal ? " (vazamento real)" : ""}`);
      for (const o of overflow.ofensores) {
        console.log(`   ${o.seletor}  left:${o.left} right:${o.right} largura:${o.largura}`);
      }
    } else {
      console.log(`✓ ${vp.nome} ${rota}`);
    }

    if (flags.has("--animacoes")) {
      const anim = await validarAnimacoes(page);
      linha.animacoes = anim;
      if (anim.invisiveis.length > 0) {
        totalInvisiveis += anim.invisiveis.length;
        console.log(`   ✗ fade-in invisíveis após rolar: ${anim.invisiveis.join(", ")}`);
      }
    }

    if (flags.has("--screenshots")) {
      const nome = `${vp.nome}${rota.replaceAll("/", "_") || "_home"}.png`;
      await page.screenshot({ path: `${SAIDA}/${nome}`, fullPage: true });
    }

    relatorio.push(linha);
  }
  await contexto.close();
}

await navegador.close();
writeFileSync(`${SAIDA}/relatorio.json`, JSON.stringify(relatorio, null, 2));
console.log(`\nRelatório: ${SAIDA}/relatorio.json — ${totalOfensores} ofensor(es) de overflow, ${totalInvisiveis} fade-in invisível(is).`);

if (flags.has("--estrito") && (totalOfensores > 0 || totalInvisiveis > 0)) {
  process.exit(1);
}
