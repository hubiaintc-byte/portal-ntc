/**
 * Gera apps/web/lib/imagensOtimizadasLarguras.ts — a largura REAL de cada
 * variante de apps/web/public/img/fotos/_optimized/.
 *
 * Por que existe: as variantes se chamam .640/.1280/.1920, mas o pipeline
 * que as gerou (build_image_pipeline.py, fora do repo) nunca amplia a
 * imagem — e os originais têm no máximo 1024–1376 px. Então quase todo
 * `.1280` e `.1920` é o mesmo arquivo, na largura do original. O `srcset`
 * precisa da largura verdadeira (descritor `w`), não do nome.
 *
 * Uso (a partir da raiz do monorepo), depois de acrescentar/trocar fotos:
 *   node scripts/gerar-larguras-imagens.mjs
 * Usa o sharp já instalado em apps/cms (sem dependência nova).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sharp = createRequire(path.join(raiz, "apps/cms/package.json"))("sharp");
const dir = path.join(raiz, "apps/web/public/img/fotos/_optimized");
const destino = path.join(raiz, "apps/web/lib/imagensOtimizadasLarguras.ts");

const nomes = new Set();
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^(.+)\.(640|1280|1920)\.webp$/);
  if (m) nomes.add(m[1]);
}

const linhas = [];
for (const nome of [...nomes].sort()) {
  const larguras = [];
  for (const v of [640, 1280, 1920]) {
    for (const ext of ["webp", "avif"]) {
      const arq = path.join(dir, `${nome}.${v}.${ext}`);
      if (!fs.existsSync(arq)) throw new Error(`variante ausente: ${nome}.${v}.${ext}`);
    }
    const { width } = await sharp(path.join(dir, `${nome}.${v}.webp`)).metadata();
    const { width: wAvif } = await sharp(path.join(dir, `${nome}.${v}.avif`)).metadata();
    if (width !== wAvif) throw new Error(`webp e avif com larguras diferentes: ${nome}.${v} (${width} ≠ ${wAvif})`);
    larguras.push(width);
  }
  linhas.push(`  ${JSON.stringify(nome)}: [${larguras.join(", ")}],`);
}

fs.writeFileSync(
  destino,
  `// Gerado por scripts/gerar-larguras-imagens.mjs — não editar à mão.
// Largura real (px) das variantes .640, .1280 e .1920 de cada foto em
// apps/web/public/img/fotos/_optimized/ (webp e avif têm a mesma largura).

export const LARGURAS_OTIMIZADAS: Readonly<Record<string, readonly [number, number, number]>> = {
${linhas.join("\n")}
};
`,
);
console.log(`${nomes.size} fotos → ${path.relative(raiz, destino)}`);
